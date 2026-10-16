import { describe, expect, it } from 'vitest';
import {
  advanceTicker,
  createFixedStepTicker,
  takePendingOfflineSeconds,
} from '../../../src/systems/fixedStepTicker';

function countSteps(ticker: ReturnType<typeof createFixedStepTicker>, deltas: number[]): number {
  let steps = 0;
  for (const delta of deltas) steps += advanceTicker(ticker, delta, () => {});
  return steps;
}

describe('fixed-step ticker', () => {
  it('runs no step while less than one step of time has passed', () => {
    const ticker = createFixedStepTicker(0.1, 10);

    expect(advanceTicker(ticker, 0.05, () => {})).toBe(0);
    expect(ticker.accumulatorSeconds).toBeCloseTo(0.05);
  });

  it('runs whole steps and carries the remainder', () => {
    const ticker = createFixedStepTicker(0.02, 10);

    expect(advanceTicker(ticker, 0.05, () => {})).toBe(2);
    expect(ticker.accumulatorSeconds).toBeCloseTo(0.01);
  });

  it('always passes the fixed step length to the callback', () => {
    const ticker = createFixedStepTicker(0.25, 10);
    const received: number[] = [];

    advanceTicker(ticker, 0.8, (stepSeconds) => received.push(stepSeconds));

    expect(received).toEqual([0.25, 0.25, 0.25]);
  });

  it('accumulates time across calls', () => {
    const ticker = createFixedStepTicker(0.02, 10);

    expect(countSteps(ticker, [0.01, 0.01, 0.01])).toBe(1);
  });

  it('is independent of the frame rate', () => {
    const at60fps = Array.from({ length: 60 }, () => 1 / 60);
    const at144fps = Array.from({ length: 144 }, () => 1 / 144);

    expect(countSteps(createFixedStepTicker(0.05, 100), at60fps)).toBe(20);
    expect(countSteps(createFixedStepTicker(0.05, 100), at144fps)).toBe(20);
    expect(countSteps(createFixedStepTicker(0.05, 100), [1])).toBe(20);
  });

  it.each([60, 144])('does not drift over an hour at %i fps', (fps) => {
    const ticker = createFixedStepTicker(0.05, 100);
    const frames = Array.from({ length: 3600 * fps }, () => 1 / fps);

    expect(countSteps(ticker, frames)).toBe(72_000);
  });

  it('caps steps per call and sets the excess aside as offline time', () => {
    const ticker = createFixedStepTicker(0.1, 5);

    expect(advanceTicker(ticker, 2.05, () => {})).toBe(5);
    expect(ticker.pendingOfflineSeconds).toBeCloseTo(1.5);
    expect(ticker.accumulatorSeconds).toBeCloseTo(0.05);
  });

  it('hands the pending offline time over once', () => {
    const ticker = createFixedStepTicker(1, 1);
    advanceTicker(ticker, 3600, () => {});

    expect(takePendingOfflineSeconds(ticker)).toBeCloseTo(3599);
    expect(takePendingOfflineSeconds(ticker)).toBe(0);
  });

  it.each([-1, NaN, Infinity, -Infinity])('ignores an invalid delta of %s', (delta) => {
    const ticker = createFixedStepTicker(0.1, 10);
    advanceTicker(ticker, 0.05, () => {});

    expect(advanceTicker(ticker, delta, () => {})).toBe(0);
    expect(ticker.accumulatorSeconds).toBeCloseTo(0.05);
    expect(ticker.pendingOfflineSeconds).toBe(0);
  });

  it.each([
    [0, 10],
    [-0.1, 10],
    [NaN, 10],
    [Infinity, 10],
    [0.1, 0],
    [0.1, 2.5],
  ])('rejects an invalid config (step %s, max steps %s)', (stepSeconds, maxSteps) => {
    expect(() => createFixedStepTicker(stepSeconds, maxSteps)).toThrow(RangeError);
  });
});
