import type { CombatState } from '../state/CombatState';
import { createStage } from './stageGenerator';
import { BOSS_TIME_LIMIT_SECONDS } from '../../config/stageConfig';

// Summing many fixed steps leaves float dust (30 − 600 × 0.05 ≈ 1e-13), which
// would otherwise let the boss survive one extra tick.
const TIME_EPSILON_SECONDS = 1e-9;

// Counts the boss timer down. Returns true when the boss was just failed: the
// stage restarts with fresh monsters and full-health boss, in farming mode.
export function tickBossTimer(state: CombatState, deltaSeconds: number): boolean {
  if (!Number.isFinite(deltaSeconds) || deltaSeconds < 0) return false;
  if (state.bossTimeLeftSeconds === null) return false;

  state.bossTimeLeftSeconds -= deltaSeconds;
  if (state.bossTimeLeftSeconds > TIME_EPSILON_SECONDS) return false;

  state.stage = createStage(state.stage.stageNumber);
  state.mode = 'farming';
  state.bossTimeLeftSeconds = null;
  return true;
}

export function challengeBoss(state: CombatState): boolean {
  if (state.mode !== 'farming') return false;

  const stage = createStage(state.stage.stageNumber);
  stage.currentEnemyIndex = stage.enemies.length - 1;
  state.stage = stage;
  state.mode = 'progressing';
  state.bossTimeLeftSeconds = BOSS_TIME_LIMIT_SECONDS;
  return true;
}
