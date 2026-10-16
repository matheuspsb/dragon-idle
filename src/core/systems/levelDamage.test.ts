import { describe, expect, it } from 'vitest';
import { MILESTONE_INTERVAL, MILESTONE_MULTIPLIER } from '../../data/upgradeConfig';
import { levelDamage, milestoneMultiplier } from './levelDamage';

describe('milestoneMultiplier', () => {
  it('is 1 below the first milestone', () => {
    expect(milestoneMultiplier(MILESTONE_INTERVAL - 1).toNumber()).toBe(1);
  });

  it('applies once per completed milestone', () => {
    expect(milestoneMultiplier(MILESTONE_INTERVAL).toNumber()).toBe(MILESTONE_MULTIPLIER);
    expect(milestoneMultiplier(MILESTONE_INTERVAL * 3).toNumber()).toBe(MILESTONE_MULTIPLIER ** 3);
  });
});

describe('levelDamage', () => {
  it('is zero at level 0', () => {
    expect(levelDamage(5, 0).toNumber()).toBe(0);
  });

  it('scales linearly with level between milestones', () => {
    expect(levelDamage(5, 1).toNumber()).toBe(5);
    expect(levelDamage(5, 10).toNumber()).toBe(50);
  });

  it('multiplies in the milestone bonus', () => {
    expect(levelDamage(5, MILESTONE_INTERVAL).toNumber()).toBe(
      5 * MILESTONE_INTERVAL * MILESTONE_MULTIPLIER
    );
  });
});
