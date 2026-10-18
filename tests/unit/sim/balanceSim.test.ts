import { describe, expect, it } from 'vitest';
import { runBalanceSim, type BalanceSimConfig } from '../../../src/sim/balanceSim';
import { BOSS_TIME_LIMIT_SECONDS } from '../../../src/config/stageConfig';

const TEN_MINUTES: BalanceSimConfig = {
  durationSeconds: 600,
  stepSeconds: 0.1,
  clicksPerSecond: 5,
  seed: 1,
};

// The idle start is slow (one starting knight, no clicks), so idle checks that
// need real progress run for an hour instead of ten minutes.
const IDLE_ONE_HOUR: BalanceSimConfig = {
  ...TEN_MINUTES,
  durationSeconds: 3600,
  clicksPerSecond: 0,
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
    const idle = runBalanceSim(IDLE_ONE_HOUR);

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

describe('runBalanceSim with boss fights', () => {
  it('counts boss failures and still progresses by farming and retrying', () => {
    // The first boss is lost and only beaten after farming for upgrades.
    const idle = runBalanceSim(IDLE_ONE_HOUR);

    expect(idle.bossFailures).toBeGreaterThan(0);
    expect(idle.finalStage).toBeGreaterThan(1);
  });
});

describe('runBalanceSim first boss failure', () => {
  it('records when the first boss was lost', () => {
    const idle = runBalanceSim({ ...TEN_MINUTES, clicksPerSecond: 0 });

    expect(idle.firstBossFailureAtSeconds).not.toBeNull();
    expect(idle.firstBossFailureAtSeconds!).toBeGreaterThan(0);
    expect(idle.firstBossFailureAtSeconds!).toBeLessThanOrEqual(TEN_MINUTES.durationSeconds);
  });

  it('is null when no boss was ever lost', () => {
    const active = runBalanceSim({ ...TEN_MINUTES, durationSeconds: 60 });

    expect(active.bossFailures).toBe(0);
    expect(active.firstBossFailureAtSeconds).toBeNull();
  });
});

describe('runBalanceSim boss kill times', () => {
  it('records how long each won boss fight took, within the time limit', () => {
    const active = runBalanceSim(TEN_MINUTES);

    expect(active.bossKills.length).toBe(active.finalStage - 1);
    active.bossKills.forEach((kill, i) => {
      expect(kill.stage).toBe(i + 1);
      expect(kill.seconds).toBeGreaterThan(0);
      expect(kill.seconds).toBeLessThanOrEqual(BOSS_TIME_LIMIT_SECONDS);
    });
  });
});
