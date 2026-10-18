import { describe, expect, it } from 'vitest';
import { Decimal } from '../../../../src/utils/Decimal';
import {
  CRIT_MULTIPLIER,
  SUPER_CRIT_MULTIPLIER,
  type CritChances,
} from '../../../../src/config/critConfig';
import { createEnemy } from '../../../../src/core/entities/Enemy';
import { applyDamage, applyFlatDamage } from '../../../../src/core/systems/damage';

const rngNormal = () => 0.999999;
const UPGRADED: CritChances = { crit: 0.12, superCrit: 0.01 };
const rngCrit = () => UPGRADED.superCrit;
const rngSuperCrit = () => 0;

describe('applyDamage', () => {
  it('reduces hp by exactly baseDamage on a normal hit', () => {
    const enemy = createEnemy({ kind: 'monster', hp: 100, goldReward: 1 });
    applyDamage(enemy, 10, rngNormal, UPGRADED);
    expect(enemy.hp.toString()).toBe(new Decimal(90).toString());
  });

  it('reduces hp by baseDamage * CRIT_MULTIPLIER on a crit', () => {
    const enemy = createEnemy({ kind: 'monster', hp: 100, goldReward: 1 });
    const result = applyDamage(enemy, 10, rngCrit, UPGRADED);
    expect(result.damageDealt.toString()).toBe(new Decimal(10 * CRIT_MULTIPLIER).toString());
  });

  it('reduces hp by baseDamage * SUPER_CRIT_MULTIPLIER on a super crit', () => {
    const enemy = createEnemy({ kind: 'monster', hp: 1000, goldReward: 1 });
    const result = applyDamage(enemy, 10, rngSuperCrit, UPGRADED);
    expect(result.damageDealt.toString()).toBe(new Decimal(10 * SUPER_CRIT_MULTIPLIER).toString());
  });

  it('defeats the enemy with 0 overkill when damage exactly matches remaining hp', () => {
    const enemy = createEnemy({ kind: 'monster', hp: 10, goldReward: 1 });
    const result = applyDamage(enemy, 10, rngNormal, UPGRADED);
    expect(result.enemyDefeated).toBe(true);
    expect(enemy.hp.toString()).toBe(new Decimal(0).toString());
    expect(result.overkill.toString()).toBe(new Decimal(0).toString());
  });

  it('defeats the enemy, clamps hp to 0, and reports overkill when damage exceeds remaining hp', () => {
    const enemy = createEnemy({ kind: 'monster', hp: 10, goldReward: 1 });
    const result = applyDamage(enemy, 15, rngNormal, UPGRADED);
    expect(result.enemyDefeated).toBe(true);
    expect(enemy.hp.toString()).toBe(new Decimal(0).toString());
    expect(result.overkill.toString()).toBe(new Decimal(5).toString());
  });

  it('does not defeat the enemy when damage is less than remaining hp', () => {
    const enemy = createEnemy({ kind: 'monster', hp: 10, goldReward: 1 });
    const result = applyDamage(enemy, 5, rngNormal, UPGRADED);
    expect(result.enemyDefeated).toBe(false);
    expect(enemy.hp.toString()).toBe(new Decimal(5).toString());
  });
});

describe('applyFlatDamage', () => {
  it('reduces hp by exactly baseDamage with no multiplier', () => {
    const enemy = createEnemy({ kind: 'monster', hp: 100, goldReward: 1 });
    const result = applyFlatDamage(enemy, 10);
    expect(enemy.hp.toString()).toBe(new Decimal(90).toString());
    expect(result.damageDealt.toString()).toBe(new Decimal(10).toString());
  });

  it('always resolves as a normal outcome', () => {
    const enemy = createEnemy({ kind: 'monster', hp: 100, goldReward: 1 });
    const result = applyFlatDamage(enemy, 10);
    expect(result.outcome).toBe('normal');
  });

  it('defeats the enemy with 0 overkill when damage exactly matches remaining hp', () => {
    const enemy = createEnemy({ kind: 'monster', hp: 10, goldReward: 1 });
    const result = applyFlatDamage(enemy, 10);
    expect(result.enemyDefeated).toBe(true);
    expect(enemy.hp.toString()).toBe(new Decimal(0).toString());
    expect(result.overkill.toString()).toBe(new Decimal(0).toString());
  });

  it('defeats the enemy, clamps hp to 0, and reports overkill when damage exceeds remaining hp', () => {
    const enemy = createEnemy({ kind: 'monster', hp: 10, goldReward: 1 });
    const result = applyFlatDamage(enemy, 15);
    expect(result.enemyDefeated).toBe(true);
    expect(enemy.hp.toString()).toBe(new Decimal(0).toString());
    expect(result.overkill.toString()).toBe(new Decimal(5).toString());
  });

  it('does not defeat the enemy when damage is less than remaining hp', () => {
    const enemy = createEnemy({ kind: 'monster', hp: 10, goldReward: 1 });
    const result = applyFlatDamage(enemy, 5);
    expect(result.enemyDefeated).toBe(false);
    expect(enemy.hp.toString()).toBe(new Decimal(5).toString());
  });
});
