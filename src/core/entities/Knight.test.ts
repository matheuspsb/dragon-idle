import { describe, expect, it } from 'vitest';
import { KNIGHT_BASE_COST, UPGRADE_COST_GROWTH } from '../../data/upgradeConfig';
import { createKnight, getKnightDamage } from './Knight';

describe('createKnight', () => {
  it('deals damagePerHit at level 1', () => {
    const knight = createKnight({ damagePerHit: 5, attackIntervalSeconds: 1 });
    expect(knight.level).toBe(1);
    expect(getKnightDamage(knight).toNumber()).toBe(5);
  });

  it('stores attackIntervalSeconds as given', () => {
    const knight = createKnight({ damagePerHit: 5, attackIntervalSeconds: 2.5 });
    expect(knight.attackIntervalSeconds).toBe(2.5);
  });

  it('starts with no accumulated attack time', () => {
    const knight = createKnight({ damagePerHit: 5, attackIntervalSeconds: 1 });
    expect(knight.timeSinceLastAttack).toBe(0);
  });

  it('defaults to the shared knight cost curve', () => {
    const knight = createKnight({ damagePerHit: 5, attackIntervalSeconds: 1 });
    expect(knight.baseCost).toBe(KNIGHT_BASE_COST);
    expect(knight.costGrowth).toBe(UPGRADE_COST_GROWTH);
  });
});

describe('getKnightDamage', () => {
  it('scales with level', () => {
    const knight = createKnight({ damagePerHit: 5, attackIntervalSeconds: 1 });
    knight.level = 3;
    expect(getKnightDamage(knight).toNumber()).toBe(15);
  });
});
