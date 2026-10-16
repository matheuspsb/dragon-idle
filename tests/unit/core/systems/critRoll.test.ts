import { describe, expect, it } from 'vitest';
import {
  CRIT_CHANCE,
  CRIT_MULTIPLIER,
  HIT_MULTIPLIERS,
  SUPER_CRIT_CHANCE,
  SUPER_CRIT_MULTIPLIER,
} from '../../../../src/config/critConfig';
import { createSeededRng } from '../../../../src/utils/random';
import { expectedHitMultiplier, rollHitOutcome } from '../../../../src/core/systems/critRoll';

describe('rollHitOutcome', () => {
  it('returns superCrit at the bottom of the range', () => {
    expect(rollHitOutcome(() => 0)).toBe('superCrit');
  });

  it('returns crit exactly at the superCrit/crit boundary (upper-exclusive)', () => {
    expect(rollHitOutcome(() => SUPER_CRIT_CHANCE)).toBe('crit');
  });

  it('returns crit just below the crit/normal boundary', () => {
    expect(rollHitOutcome(() => SUPER_CRIT_CHANCE + CRIT_CHANCE - Number.EPSILON)).toBe('crit');
  });

  it('returns normal exactly at the crit/normal boundary (upper-exclusive)', () => {
    expect(rollHitOutcome(() => SUPER_CRIT_CHANCE + CRIT_CHANCE)).toBe('normal');
  });

  it('returns normal at the top of the range', () => {
    expect(rollHitOutcome(() => 0.999999)).toBe('normal');
  });
});

describe('expectedHitMultiplier', () => {
  it('weights each outcome multiplier by its chance', () => {
    const expected =
      1 + CRIT_CHANCE * (CRIT_MULTIPLIER - 1) + SUPER_CRIT_CHANCE * (SUPER_CRIT_MULTIPLIER - 1);

    expect(expectedHitMultiplier()).toBeCloseTo(expected, 12);
  });

  it('matches the long-run average of many seeded rolls', () => {
    const rng = createSeededRng(2024);
    let total = 0;
    const rolls = 200_000;
    for (let i = 0; i < rolls; i++) total += HIT_MULTIPLIERS[rollHitOutcome(rng)];

    expect(total / rolls).toBeCloseTo(expectedHitMultiplier(), 1);
  });
});
