import { describe, expect, it } from 'vitest';
import {
  CRIT_MULTIPLIER,
  HIT_MULTIPLIERS,
  STARTING_CRIT_CHANCES,
  SUPER_CRIT_MULTIPLIER,
  type CritChances,
} from '../../../../src/config/critConfig';
import { createSeededRng } from '../../../../src/utils/random';
import { expectedHitMultiplier, rollHitOutcome } from '../../../../src/core/systems/critRoll';

const UPGRADED: CritChances = { crit: 0.12, superCrit: 0.01 };

describe('rollHitOutcome', () => {
  it('never crits with the starting chances, even on the luckiest roll', () => {
    expect(rollHitOutcome(() => 0, STARTING_CRIT_CHANCES)).toBe('normal');
  });

  it('returns superCrit at the bottom of the range', () => {
    expect(rollHitOutcome(() => 0, UPGRADED)).toBe('superCrit');
  });

  it('returns crit exactly at the superCrit/crit boundary (upper-exclusive)', () => {
    expect(rollHitOutcome(() => UPGRADED.superCrit, UPGRADED)).toBe('crit');
  });

  it('returns crit just below the crit/normal boundary', () => {
    const roll = UPGRADED.superCrit + UPGRADED.crit - Number.EPSILON;
    expect(rollHitOutcome(() => roll, UPGRADED)).toBe('crit');
  });

  it('returns normal exactly at the crit/normal boundary (upper-exclusive)', () => {
    expect(rollHitOutcome(() => UPGRADED.superCrit + UPGRADED.crit, UPGRADED)).toBe('normal');
  });

  it('returns normal at the top of the range', () => {
    expect(rollHitOutcome(() => 0.999999, UPGRADED)).toBe('normal');
  });
});

describe('expectedHitMultiplier', () => {
  it('is exactly 1 with the starting chances', () => {
    expect(expectedHitMultiplier(STARTING_CRIT_CHANCES)).toBe(1);
  });

  it('weights each outcome multiplier by its chance', () => {
    const expected =
      1 + UPGRADED.crit * (CRIT_MULTIPLIER - 1) + UPGRADED.superCrit * (SUPER_CRIT_MULTIPLIER - 1);

    expect(expectedHitMultiplier(UPGRADED)).toBeCloseTo(expected, 12);
  });

  it('matches the long-run average of many seeded rolls', () => {
    const rng = createSeededRng(2024);
    let total = 0;
    const rolls = 200_000;
    for (let i = 0; i < rolls; i++) total += HIT_MULTIPLIERS[rollHitOutcome(rng, UPGRADED)];

    expect(total / rolls).toBeCloseTo(expectedHitMultiplier(UPGRADED), 1);
  });
});
