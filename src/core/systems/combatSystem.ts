import { Decimal } from '../../utils/Decimal';
import type { DecimalSource } from '../../utils/Decimal';
import { getCurrentEnemy } from '../entities/Stage';
import type { EnemyKind } from '../entities/Enemy';
import { applyDamage, type DamageResult } from './damage';
import { createStage } from './stageGenerator';
import type { CombatState } from '../state/CombatState';

export interface CombatEvent extends DamageResult {
  enemyKind: EnemyKind;
  goldEarned: Decimal;
  stageCleared: boolean;
  newStageNumber?: number;
}

export function resolveHit(
  state: CombatState,
  baseDamage: DecimalSource,
  rng: () => number = Math.random
): CombatEvent {
  const enemy = getCurrentEnemy(state.stage);
  const damageResult = applyDamage(enemy, baseDamage, rng);

  const event: CombatEvent = {
    ...damageResult,
    enemyKind: enemy.kind,
    goldEarned: new Decimal(0),
    stageCleared: false,
  };

  if (!damageResult.enemyDefeated) return event;

  event.goldEarned = enemy.goldReward;

  const isLastEnemy = state.stage.currentEnemyIndex === state.stage.enemies.length - 1;
  if (isLastEnemy) {
    event.stageCleared = true;
    event.newStageNumber = state.stage.stageNumber + 1;
    state.stage = createStage(event.newStageNumber);
  } else {
    state.stage.currentEnemyIndex += 1;
  }

  return event;
}
