import { describe, expect, it } from 'vitest';
import { Decimal } from '../../../src/utils/Decimal';
import { shouldChallengeBoss } from '../../../src/sim/bossPolicy';

describe('shouldChallengeBoss', () => {
  it('challenges when expected damage over the time limit covers the boss HP', () => {
    expect(shouldChallengeBoss(new Decimal(10), new Decimal(300), 30)).toBe(true);
  });

  it('keeps farming when it would run out of time', () => {
    expect(shouldChallengeBoss(new Decimal(9.9), new Decimal(300), 30)).toBe(false);
  });

  it('never challenges with no damage', () => {
    expect(shouldChallengeBoss(new Decimal(0), new Decimal(1), 30)).toBe(false);
  });
});
