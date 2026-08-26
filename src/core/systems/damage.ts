import { Decimal } from '../../utils/Decimal';
import type { DecimalSource } from '../../utils/Decimal';
import { isEnemyDefeated, type Enemy } from '../entities/Enemy';
import { rollHitOutcome } from './critRoll';
import { HIT_MULTIPLIERS, type HitOutcome } from '../../data/critConfig';

export interface DamageResult {
  outcome: HitOutcome;
  damageDealt: Decimal;
  enemyDefeated: boolean;
  overkill: Decimal;
}

export function applyDamage(
  enemy: Enemy,
  baseDamage: DecimalSource,
  rng: () => number = Math.random
): DamageResult {
  const outcome = rollHitOutcome(rng);
  const damageDealt = new Decimal(baseDamage).mul(HIT_MULTIPLIERS[outcome]);
  const hpBefore = enemy.hp;

  enemy.hp = hpBefore.sub(damageDealt).clampMin(0);

  const enemyDefeated = isEnemyDefeated(enemy);
  const overkill = enemyDefeated ? Decimal.max(0, damageDealt.sub(hpBefore)) : new Decimal(0);

  return { outcome, damageDealt, enemyDefeated, overkill };
}
