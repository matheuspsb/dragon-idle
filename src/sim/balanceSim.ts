import { Decimal } from '../utils/Decimal';
import { createSeededRng } from '../utils/random';
import { createClickState, type ClickState } from '../core/state/ClickState';
import { createKnightsState, type KnightsState } from '../core/state/KnightsState';
import { createWalletState, type WalletState } from '../core/state/WalletState';
import { createCombatState, resolveHit, type CombatEvent } from '../core/systems/combatSystem';
import { tickAutoDps } from '../core/systems/autoDpsSystem';
import { collectGold } from '../core/systems/goldSystem';
import { buyLevels } from '../core/systems/upgradeSystem';
import { expectedHitMultiplier } from '../core/systems/critRoll';
import { getClickDamage, levelDamage } from '../core/systems/levelDamage';
import { chooseBestUpgrade, type UpgradeCandidate } from './purchasePolicy';

export interface BalanceSimConfig {
  durationSeconds: number;
  stepSeconds: number;
  clicksPerSecond: number;
  seed: number;
}

export interface StageTimelineEntry {
  stage: number;
  reachedAtSeconds: number;
}

export interface BalanceSimResult {
  stageTimeline: StageTimelineEntry[];
  finalStage: number;
  clickLevel: number;
  knightLevels: number[];
  goldEarned: Decimal;
  goldSpent: Decimal;
}

function validate(config: BalanceSimConfig): void {
  const { durationSeconds, stepSeconds, clicksPerSecond } = config;
  if (!Number.isFinite(durationSeconds) || durationSeconds < 0) {
    throw new RangeError(`Invalid duration: ${durationSeconds}`);
  }
  if (!Number.isFinite(stepSeconds) || stepSeconds <= 0) {
    throw new RangeError(`Invalid step: ${stepSeconds}`);
  }
  if (!Number.isFinite(clicksPerSecond) || clicksPerSecond < 0) {
    throw new RangeError(`Invalid clicks per second: ${clicksPerSecond}`);
  }
}

function nextLevelGain(baseDamage: Decimal, level: number): Decimal {
  return levelDamage(baseDamage, level + 1).sub(levelDamage(baseDamage, level));
}

function upgradeCandidates(
  click: ClickState,
  knightsState: KnightsState,
  clicksPerSecond: number
): UpgradeCandidate[] {
  const clickDps = clicksPerSecond * expectedHitMultiplier();
  return [
    { target: click, dpsGain: nextLevelGain(click.baseDamage, click.level).mul(clickDps) },
    ...knightsState.knights.map((knight) => ({
      target: knight,
      dpsGain: nextLevelGain(knight.baseDamage, knight.level).div(knight.attackIntervalSeconds),
    })),
  ];
}

function buyGreedily(
  wallet: WalletState,
  click: ClickState,
  knightsState: KnightsState,
  clicksPerSecond: number
): Decimal {
  let spent = new Decimal(0);
  for (;;) {
    const best = chooseBestUpgrade(upgradeCandidates(click, knightsState, clicksPerSecond));
    if (!best) return spent;
    const purchase = buyLevels(wallet, best.target, 1);
    if (purchase.levelsBought === 0) return spent;
    spent = spent.add(purchase.goldSpent);
  }
}

// Plays the real core rules with a scripted player: clicks at a fixed rate,
// lets knights attack, and greedily buys the upgrade with the best DPS per gold.
export function runBalanceSim(config: BalanceSimConfig): BalanceSimResult {
  validate(config);
  const { durationSeconds, stepSeconds, clicksPerSecond, seed } = config;

  const rng = createSeededRng(seed);
  const combat = createCombatState(1);
  const knightsState = createKnightsState();
  const click = createClickState();
  const wallet = createWalletState();

  const stageTimeline: StageTimelineEntry[] = [{ stage: 1, reachedAtSeconds: 0 }];
  let goldEarned = new Decimal(0);
  let goldSpent = new Decimal(0);
  let clickBudget = 0;

  const steps = Math.round(durationSeconds / stepSeconds);
  for (let i = 1; i <= steps; i++) {
    const events: CombatEvent[] = [];

    clickBudget += clicksPerSecond * stepSeconds;
    while (clickBudget >= 1) {
      clickBudget -= 1;
      events.push(resolveHit(combat, getClickDamage(click), rng));
    }
    events.push(...tickAutoDps(knightsState, combat, stepSeconds));

    goldEarned = goldEarned.add(collectGold(wallet, events));
    goldSpent = goldSpent.add(buyGreedily(wallet, click, knightsState, clicksPerSecond));

    const now = i * stepSeconds;
    while (stageTimeline[stageTimeline.length - 1].stage < combat.stage.stageNumber) {
      stageTimeline.push({
        stage: stageTimeline[stageTimeline.length - 1].stage + 1,
        reachedAtSeconds: now,
      });
    }
  }

  return {
    stageTimeline,
    finalStage: combat.stage.stageNumber,
    clickLevel: click.level,
    knightLevels: knightsState.knights.map((knight) => knight.level),
    goldEarned,
    goldSpent,
  };
}
