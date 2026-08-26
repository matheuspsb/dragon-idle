import { describe, expect, it } from 'vitest';
import { CRIT_CHANCE, SUPER_CRIT_CHANCE } from '../../data/critConfig';
import { rollHitOutcome } from './critRoll';

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
