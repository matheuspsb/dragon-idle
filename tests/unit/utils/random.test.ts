import { describe, expect, it } from 'vitest';
import { createSeededRng } from '../../../src/utils/random';

function take(rng: () => number, count: number): number[] {
  return Array.from({ length: count }, () => rng());
}

describe('createSeededRng', () => {
  it('produces the same sequence for the same seed', () => {
    expect(take(createSeededRng(42), 20)).toEqual(take(createSeededRng(42), 20));
  });

  it('produces different sequences for different seeds', () => {
    expect(take(createSeededRng(1), 20)).not.toEqual(take(createSeededRng(2), 20));
  });

  it('keeps each generator independent', () => {
    const a = createSeededRng(7);
    const b = createSeededRng(7);
    a();
    a();
    expect(b()).toBe(take(createSeededRng(7), 1)[0]);
  });

  it('always returns values in [0, 1)', () => {
    const values = take(createSeededRng(123), 10_000);
    expect(values.every((v) => v >= 0 && v < 1)).toBe(true);
  });

  it('spreads values across the whole range', () => {
    const values = take(createSeededRng(99), 10_000);
    const buckets = [0, 0, 0, 0];
    for (const v of values) buckets[Math.floor(v * 4)] += 1;
    for (const count of buckets) expect(count).toBeGreaterThan(2_000);
  });

  it.each([1.5, NaN, Infinity])('rejects a non-integer seed %s', (seed) => {
    expect(() => createSeededRng(seed)).toThrow(RangeError);
  });
});
