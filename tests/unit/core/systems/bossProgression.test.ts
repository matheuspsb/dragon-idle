import { describe, expect, it } from 'vitest';
import { getCurrentEnemy } from '../../../../src/core/entities/Stage';
import type { CombatState } from '../../../../src/core/state/CombatState';
import { createCombatState, resolveAutoHit } from '../../../../src/core/systems/combatSystem';
import { challengeBoss, tickBossTimer } from '../../../../src/core/systems/bossSystem';
import { BOSS_TIME_LIMIT_SECONDS, MONSTERS_PER_STAGE } from '../../../../src/config/stageConfig';

function killCurrent(state: CombatState) {
  return resolveAutoHit(state, getCurrentEnemy(state.stage).hp);
}

function reachBoss(state: CombatState): void {
  for (let i = 0; i < MONSTERS_PER_STAGE; i++) killCurrent(state);
}

function failBoss(state: CombatState): void {
  reachBoss(state);
  tickBossTimer(state, BOSS_TIME_LIMIT_SECONDS);
}

describe('boss progression', () => {
  it('starts progressing with no boss timer running', () => {
    const state = createCombatState(1);

    expect(state.mode).toBe('progressing');
    expect(state.bossTimeLeftSeconds).toBeNull();
  });

  it('starts the boss timer when the boss shows up', () => {
    const state = createCombatState(1);

    reachBoss(state);

    expect(getCurrentEnemy(state.stage).kind).toBe('boss');
    expect(state.bossTimeLeftSeconds).toBe(BOSS_TIME_LIMIT_SECONDS);
  });

  it('only counts time down while fighting the boss', () => {
    const state = createCombatState(1);
    tickBossTimer(state, 10);
    expect(state.bossTimeLeftSeconds).toBeNull();

    reachBoss(state);
    tickBossTimer(state, 10);

    expect(state.bossTimeLeftSeconds).toBeCloseTo(BOSS_TIME_LIMIT_SECONDS - 10);
  });

  it('advances to the next stage when the boss dies in time', () => {
    const state = createCombatState(1);
    reachBoss(state);
    tickBossTimer(state, BOSS_TIME_LIMIT_SECONDS - 1);

    const event = killCurrent(state);

    expect(event.stageCleared).toBe(true);
    expect(state.stage.stageNumber).toBe(2);
    expect(state.mode).toBe('progressing');
    expect(state.bossTimeLeftSeconds).toBeNull();
  });

  it('fails the boss exactly when the time runs out, not before', () => {
    const state = createCombatState(1);
    reachBoss(state);

    expect(tickBossTimer(state, BOSS_TIME_LIMIT_SECONDS - 0.001)).toBe(false);
    expect(tickBossTimer(state, 0.001)).toBe(true);
  });

  it('switches to farming the same stage when the boss is failed', () => {
    const state = createCombatState(1);

    failBoss(state);

    expect(state.mode).toBe('farming');
    expect(state.bossTimeLeftSeconds).toBeNull();
    expect(state.stage.stageNumber).toBe(1);
    expect(getCurrentEnemy(state.stage).kind).toBe('monster');
  });

  it('keeps farming monsters for gold without ever reaching the boss', () => {
    const state = createCombatState(1);
    failBoss(state);

    for (let i = 0; i < MONSTERS_PER_STAGE * 4; i++) {
      const event = killCurrent(state);
      expect(event.goldEarned.gt(0)).toBe(true);
      expect(getCurrentEnemy(state.stage).kind).toBe('monster');
    }
    expect(state.stage.stageNumber).toBe(1);
    expect(state.bossTimeLeftSeconds).toBeNull();
  });

  it('challenging from farming brings back a full-health boss and a fresh timer', () => {
    const state = createCombatState(1);
    reachBoss(state);
    const boss = getCurrentEnemy(state.stage);
    resolveAutoHit(state, boss.maxHp.div(2));
    tickBossTimer(state, BOSS_TIME_LIMIT_SECONDS);

    expect(challengeBoss(state)).toBe(true);

    const challenged = getCurrentEnemy(state.stage);
    expect(challenged.kind).toBe('boss');
    expect(challenged.hp.eq(challenged.maxHp)).toBe(true);
    expect(state.mode).toBe('progressing');
    expect(state.bossTimeLeftSeconds).toBe(BOSS_TIME_LIMIT_SECONDS);
  });

  it('ignores a challenge when not farming', () => {
    const state = createCombatState(1);

    expect(challengeBoss(state)).toBe(false);
    expect(state.stage.currentEnemyIndex).toBe(0);
    expect(state.bossTimeLeftSeconds).toBeNull();
  });

  it.each([NaN, -1, Infinity])('ignores an invalid timer delta of %s', (delta) => {
    const state = createCombatState(1);
    reachBoss(state);

    expect(tickBossTimer(state, delta)).toBe(false);
    expect(state.bossTimeLeftSeconds).toBe(BOSS_TIME_LIMIT_SECONDS);
  });
});

describe('boss timer with fixed logic steps', () => {
  it('fails on the step that reaches the limit, despite float accumulation', () => {
    const state = createCombatState(1);
    reachBoss(state);
    const step = 0.05;
    const steps = Math.round(BOSS_TIME_LIMIT_SECONDS / step);

    for (let i = 1; i < steps; i++) expect(tickBossTimer(state, step)).toBe(false);
    expect(tickBossTimer(state, step)).toBe(true);
  });
});
