import { describe, expect, it } from 'vitest';
import { createKnight } from '../../../../src/core/entities/Knight';
import { getKnightDamage } from '../../../../src/core/systems/levelDamage';

describe('createKnight', () => {
  it('deals damagePerHit at level 1', () => {
    const knight = createKnight({ damagePerHit: 5, attackIntervalSeconds: 1 });
    expect(knight.level).toBe(1);
    expect(getKnightDamage(knight).toNumber()).toBe(5);
  });
});

describe('getKnightDamage', () => {
  it('scales with level', () => {
    const knight = createKnight({ damagePerHit: 5, attackIntervalSeconds: 1 });
    knight.level = 3;
    expect(getKnightDamage(knight).toNumber()).toBe(15);
  });
});
