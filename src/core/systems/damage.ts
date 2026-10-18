import type { Rng } from '../../utils/random';
import { Decimal } from '../../utils/Decimal';
import type { DecimalSource } from '../../utils/Decimal';
import { isEnemyDefeated, type Enemy } from '../entities/Enemy';
import { rollHitOutcome } from './critRoll';
import { HIT_MULTIPLIERS, type CritChances, type HitOutcome } from '../../config/critConfig';

export interface DamageResult {
  outcome: HitOutcome;
  damageDealt: Decimal;
  enemyDefeated: boolean;
  overkill: Decimal;
}

function buildDamageResult(enemy: Enemy, outcome: HitOutcome, damageDealt: Decimal): DamageResult {
  const hpBefore = enemy.hp;

  enemy.hp = hpBefore.sub(damageDealt).clampMin(0);

  const enemyDefeated = isEnemyDefeated(enemy);
  const overkill = enemyDefeated ? Decimal.max(0, damageDealt.sub(hpBefore)) : new Decimal(0);

  return { outcome, damageDealt, enemyDefeated, overkill };
}

function toValidDamage(baseDamage: DecimalSource): Decimal {
  const damage = new Decimal(baseDamage);

  if (!damage.isFinite() || damage.lt(0)) {
    throw new RangeError(`Invalid damage: ${damage.toString()}`);
  }
  return damage;
}

export function applyDamage(
  enemy: Enemy,
  baseDamage: DecimalSource,
  rng: Rng,
  critChances: CritChances
): DamageResult {
  const damage = toValidDamage(baseDamage);
  const outcome = rollHitOutcome(rng, critChances);
  return buildDamageResult(enemy, outcome, damage.mul(HIT_MULTIPLIERS[outcome]));
}

export function applyFlatDamage(enemy: Enemy, baseDamage: DecimalSource): DamageResult {
  return buildDamageResult(enemy, 'normal', toValidDamage(baseDamage));
}
