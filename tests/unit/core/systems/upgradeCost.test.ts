import { describe, expect, it } from 'vitest';
import { Decimal } from '../../../../src/utils/Decimal';
import { bulkCost, maxAffordable, nextCost } from '../../../../src/core/systems/upgradeCost';

describe('nextCost', () => {
  it('equals the base cost at level 0', () => {
    expect(nextCost(10, 1.07, 0).toNumber()).toBe(10);
  });

  it('grows exponentially as base × rate^level', () => {
    // AdVenture Capitalist lemonade stand: base 4, rate 1.07, 10 owned → ~7.87
    expect(nextCost(4, 1.07, 10).toNumber()).toBeCloseTo(7.87, 2);
  });
});

describe('bulkCost', () => {
  it('matches the sum of individual next costs', () => {
    const expected = [0, 1, 2, 3, 4].reduce(
      (sum, i) => sum + nextCost(10, 1.07, 5 + i).toNumber(),
      0
    );
    expect(bulkCost(10, 1.07, 5, 5).toNumber()).toBeCloseTo(expected, 8);
  });

  it('is zero when buying nothing', () => {
    expect(bulkCost(10, 1.07, 3, 0).toNumber()).toBe(0);
  });

  it('degrades to base × count when there is no growth', () => {
    expect(bulkCost(10, 1, 7, 4).toNumber()).toBe(40);
  });
});

describe('maxAffordable', () => {
  it('returns 0 when the next level is too expensive', () => {
    expect(maxAffordable(10, 1.07, 0, 9.99)).toBe(0);
  });

  it('returns the largest count whose bulk cost fits the budget', () => {
    const gold = new Decimal(500);
    const count = maxAffordable(10, 1.07, 3, gold);
    expect(bulkCost(10, 1.07, 3, count).lte(gold)).toBe(true);
    expect(bulkCost(10, 1.07, 3, count + 1).gt(gold)).toBe(true);
  });

  it('includes a level whose cost exactly equals the budget', () => {
    // Exact-boundary budgets are where floating-point log rounding goes off by one.
    for (let n = 1; n <= 60; n++) {
      const exact = bulkCost(10, 1.07, 2, n);
      expect(maxAffordable(10, 1.07, 2, exact)).toBe(n);
    }
  });

  it('handles a growth rate of 1 without dividing by zero', () => {
    expect(maxAffordable(10, 1, 0, 95)).toBe(9);
  });

  it('works with budgets far beyond float range', () => {
    const count = maxAffordable(10, 1.07, 0, new Decimal('1e500'));
    expect(count).toBeGreaterThan(10_000);
    expect(bulkCost(10, 1.07, 0, count).lte('1e500')).toBe(true);
    expect(bulkCost(10, 1.07, 0, count + 1).gt('1e500')).toBe(true);
  });
});
