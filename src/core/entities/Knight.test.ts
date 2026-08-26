import { describe, expect, it } from 'vitest';
import { Decimal } from '../../utils/Decimal';
import { createKnight } from './Knight';

describe('createKnight', () => {
  it('converts damagePerHit to a Decimal', () => {
    const knight = createKnight({ damagePerHit: 5, attackIntervalSeconds: 1 });
    expect(knight.damagePerHit.toString()).toBe(new Decimal(5).toString());
  });

  it('stores attackIntervalSeconds as given', () => {
    const knight = createKnight({ damagePerHit: 5, attackIntervalSeconds: 2.5 });
    expect(knight.attackIntervalSeconds).toBe(2.5);
  });

  it('starts with no accumulated attack time', () => {
    const knight = createKnight({ damagePerHit: 5, attackIntervalSeconds: 1 });
    expect(knight.timeSinceLastAttack).toBe(0);
  });
});
