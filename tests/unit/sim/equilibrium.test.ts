import { describe, expect, it } from 'vitest';
import { requiredGoldGrowthPerStage } from '../../../src/sim/equilibrium';

describe('requiredGoldGrowthPerStage', () => {
  it('matches the documented value for the current curve (≈ 1.41)', () => {
    const value = requiredGoldGrowthPerStage({
      hpGrowthPerStage: 1.15,
      costGrowth: 1.07,
      milestoneInterval: 25,
      milestoneMultiplier: 2,
    });

    expect(value).toBeCloseTo(1.15 ** (Math.log(1.07) / (Math.log(2) / 25)), 10);
    expect(value).toBeCloseTo(1.406, 3);
  });

  it('requires less gold growth when milestones are stronger', () => {
    const base = { hpGrowthPerStage: 1.15, costGrowth: 1.07, milestoneInterval: 25 };

    expect(requiredGoldGrowthPerStage({ ...base, milestoneMultiplier: 4 })).toBeLessThan(
      requiredGoldGrowthPerStage({ ...base, milestoneMultiplier: 2 })
    );
  });

  it('needs no growth at all when HP does not grow', () => {
    expect(
      requiredGoldGrowthPerStage({
        hpGrowthPerStage: 1,
        costGrowth: 1.07,
        milestoneInterval: 25,
        milestoneMultiplier: 2,
      })
    ).toBe(1);
  });

  it('rejects milestones that add no damage', () => {
    expect(() =>
      requiredGoldGrowthPerStage({
        hpGrowthPerStage: 1.15,
        costGrowth: 1.07,
        milestoneInterval: 25,
        milestoneMultiplier: 1,
      })
    ).toThrow(RangeError);
  });
});
