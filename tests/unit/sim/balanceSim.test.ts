import { describe, expect, it } from 'vitest';
import { runBalanceSim, type BalanceSimConfig } from '../../../src/sim/balanceSim';

const TEN_MINUTES: BalanceSimConfig = {
  durationSeconds: 600,
  stepSeconds: 0.1,
  clicksPerSecond: 5,
  seed: 1,
};

describe('runBalanceSim', () => {
  it('is deterministic for the same config and seed', () => {
    const a = runBalanceSim(TEN_MINUTES);
    const b = runBalanceSim(TEN_MINUTES);

    expect(b.stageTimeline).toEqual(a.stageTimeline);
    expect(b.clickLevel).toBe(a.clickLevel);
    expect(b.knightLevels).toEqual(a.knightLevels);
    expect(b.goldEarned.eq(a.goldEarned)).toBe(true);
  });

  it('records each stage once, in order, starting at stage 1 at time 0', () => {
    const { stageTimeline, finalStage } = runBalanceSim(TEN_MINUTES);

    expect(stageTimeline[0]).toEqual({ stage: 1, reachedAtSeconds: 0 });
    stageTimeline.forEach((entry, i) => {
      expect(entry.stage).toBe(i + 1);
      if (i > 0)
        expect(entry.reachedAtSeconds).toBeGreaterThanOrEqual(
          stageTimeline[i - 1].reachedAtSeconds
        );
    });
    expect(stageTimeline[stageTimeline.length - 1].stage).toBe(finalStage);
  });

  it('progresses and buys upgrades with the gold it earns', () => {
    const result = runBalanceSim(TEN_MINUTES);

    expect(result.finalStage).toBeGreaterThan(1);
    expect(result.knightLevels[0] + result.clickLevel).toBeGreaterThan(2);
    expect(result.goldSpent.lte(result.goldEarned)).toBe(true);
  });

  it('never upgrades the click when the player does not click', () => {
    const idle = runBalanceSim({ ...TEN_MINUTES, clicksPerSecond: 0 });

    expect(idle.clickLevel).toBe(1);
    expect(idle.knightLevels[0]).toBeGreaterThan(1);
  });

  it('progresses at least as far when the player also clicks', () => {
    const idle = runBalanceSim({ ...TEN_MINUTES, clicksPerSecond: 0 });
    const active = runBalanceSim(TEN_MINUTES);

    expect(active.finalStage).toBeGreaterThanOrEqual(idle.finalStage);
  });

  it.each<[string, Partial<BalanceSimConfig>]>([
    ['negative duration', { durationSeconds: -1 }],
    ['NaN duration', { durationSeconds: NaN }],
    ['zero step', { stepSeconds: 0 }],
    ['negative clicks per second', { clicksPerSecond: -1 }],
    ['infinite clicks per second', { clicksPerSecond: Infinity }],
  ])('rejects an invalid config (%s)', (_, override) => {
    expect(() => runBalanceSim({ ...TEN_MINUTES, ...override })).toThrow(RangeError);
  });
});
