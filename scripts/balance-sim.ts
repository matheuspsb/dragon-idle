import { parseArgs } from 'node:util';
import { runBalanceSim, type BalanceSimResult } from '../src/sim/balanceSim';
import { requiredGoldGrowthPerStage } from '../src/sim/equilibrium';
import { GOLD_GROWTH_PER_STAGE, HP_GROWTH_PER_STAGE } from '../src/config/stageConfig';
import {
  MILESTONE_INTERVAL,
  MILESTONE_MULTIPLIER,
  UPGRADE_COST_GROWTH,
} from '../src/config/upgradeConfig';

const MILESTONE_STAGES = [5, 10, 20, 30, 40, 50, 75, 100, 150, 200, 300, 500, 1000];

const { values } = parseArgs({
  options: {
    hours: { type: 'string', default: '4' },
    cps: { type: 'string', default: '0,2,5' },
    seed: { type: 'string', default: '1' },
    step: { type: 'string', default: '0.1' },
  },
});

const hours = Number(values.hours);
const profiles = values.cps.split(',').map(Number);
const seed = Number(values.seed);
const stepSeconds = Number(values.step);

function formatDuration(totalSeconds: number): string {
  const s = Math.round(totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function stageRows(result: BalanceSimResult, durationSeconds: number) {
  const reachedAt = (stage: number) => result.stageTimeline[stage - 1]?.reachedAtSeconds;
  return MILESTONE_STAGES.filter((stage) => stage <= result.finalStage).map((stage) => {
    const start = reachedAt(stage)!;
    const end = reachedAt(stage + 1);
    return {
      estágio: stage,
      'alcançado em': formatDuration(start),
      'tempo no estágio':
        end === undefined
          ? `${formatDuration(durationSeconds - start)}+`
          : `${(end - start).toFixed(1)} s`,
    };
  });
}

const required = requiredGoldGrowthPerStage({
  hpGrowthPerStage: HP_GROWTH_PER_STAGE,
  costGrowth: UPGRADE_COST_GROWTH,
  milestoneInterval: MILESTONE_INTERVAL,
  milestoneMultiplier: MILESTONE_MULTIPLIER,
});

console.log(`\nBalance-sim — ${hours} h simuladas, passo ${stepSeconds} s, seed ${seed}`);
console.log(
  `Equilíbrio: o ouro precisaria crescer ×${required.toFixed(3)} por estágio; hoje cresce ×${GOLD_GROWTH_PER_STAGE}.`
);

for (const clicksPerSecond of profiles) {
  const durationSeconds = hours * 3600;
  const started = performance.now();
  const result = runBalanceSim({ durationSeconds, stepSeconds, clicksPerSecond, seed });
  const elapsed = ((performance.now() - started) / 1000).toFixed(1);

  const label = clicksPerSecond === 0 ? 'idle (sem clique)' : `${clicksPerSecond} cliques/s`;
  console.log(`\n== Perfil ${label} — simulado em ${elapsed} s`);
  console.table(stageRows(result, durationSeconds));
  console.log(
    `Estágio final: ${result.finalStage} | clique nv ${result.clickLevel} | cavaleiros nv ${result.knightLevels.join(', ')} | bosses perdidos: ${result.bossFailures} | 1ª derrota de boss: ${result.firstBossFailureAtSeconds === null ? '—' : formatDuration(result.firstBossFailureAtSeconds)}`
  );
}
