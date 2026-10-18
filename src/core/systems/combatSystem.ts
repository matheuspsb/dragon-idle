import type { Rng } from '../../utils/random';
import { Decimal } from '../../utils/Decimal';
import type { DecimalSource } from '../../utils/Decimal';
import { getCurrentEnemy } from '../entities/Stage';
import type { Enemy, EnemyKind } from '../entities/Enemy';
import { applyDamage, applyFlatDamage, type DamageResult } from './damage';
import { createStage } from './stageGenerator';
import type { CombatState } from '../state/CombatState';
import type { CritChances } from '../../config/critConfig';
import { BOSS_TIME_LIMIT_SECONDS } from '../../config/stageConfig';

export function createCombatState(startingStageNumber = 1): CombatState {
  return {
    stage: createStage(startingStageNumber),
    mode: 'progressing',
    bossTimeLeftSeconds: null,
  };
}

export interface CombatEvent extends DamageResult {
  enemyKind: EnemyKind;
  goldEarned: Decimal;
  stageCleared: boolean;
  newStageNumber?: number;
}

function finalizeHit(state: CombatState, enemy: Enemy, damageResult: DamageResult): CombatEvent {
  const event: CombatEvent = {
    ...damageResult,
    enemyKind: enemy.kind,
    goldEarned: new Decimal(0),
    stageCleared: false,
  };

  if (!damageResult.enemyDefeated) return event;

  event.goldEarned = enemy.goldReward;

  if (enemy.kind === 'boss') {
    event.stageCleared = true;
    event.newStageNumber = state.stage.stageNumber + 1;
    state.stage = createStage(event.newStageNumber);
    state.mode = 'progressing';
    state.bossTimeLeftSeconds = null;
    return event;
  }

  const nextIndex = state.stage.currentEnemyIndex + 1;
  const nextIsBoss = state.stage.enemies[nextIndex]?.kind === 'boss';
  if (nextIsBoss && state.mode === 'farming') {
    state.stage = createStage(state.stage.stageNumber);
  } else {
    state.stage.currentEnemyIndex = nextIndex;
    if (nextIsBoss) state.bossTimeLeftSeconds = BOSS_TIME_LIMIT_SECONDS;
  }

  return event;
}

export function resolveHit(
  state: CombatState,
  baseDamage: DecimalSource,
  rng: Rng,
  critChances: CritChances
): CombatEvent {
  const enemy = getCurrentEnemy(state.stage);
  const damageResult = applyDamage(enemy, baseDamage, rng, critChances);
  return finalizeHit(state, enemy, damageResult);
}

export function resolveAutoHit(state: CombatState, baseDamage: DecimalSource): CombatEvent {
  const enemy = getCurrentEnemy(state.stage);
  const damageResult = applyFlatDamage(enemy, baseDamage);
  return finalizeHit(state, enemy, damageResult);
}
