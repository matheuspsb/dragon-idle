import { describe, expect, it } from 'vitest';
import { STARTING_CRIT_CHANCES } from '../../../../src/config/critConfig';
import { createCombatState } from '../../../../src/core/systems/combatSystem';
import { getCurrentEnemy } from '../../../../src/core/entities/Stage';
import { resolveAutoHit, resolveHit } from '../../../../src/core/systems/combatSystem';

const rngNormal = () => 0.5;

describe('resolveHit', () => {
  it('does not advance or clear the stage on a non-lethal hit', () => {
    const state = createCombatState(1);
    const event = resolveHit(state, 1, rngNormal, STARTING_CRIT_CHANCES);

    expect(event.enemyDefeated).toBe(false);
    expect(event.stageCleared).toBe(false);
    expect(state.stage.currentEnemyIndex).toBe(0);
    expect(event.goldEarned.toString()).toBe('0');
  });

  it('advances to the next enemy when a non-boss enemy is defeated', () => {
    const state = createCombatState(1);
    const currentEnemy = getCurrentEnemy(state.stage);
    const event = resolveHit(state, currentEnemy.hp, rngNormal, STARTING_CRIT_CHANCES);

    expect(event.enemyDefeated).toBe(true);
    expect(event.enemyKind).toBe('monster');
    expect(event.stageCleared).toBe(false);
    expect(state.stage.currentEnemyIndex).toBe(1);
    expect(event.goldEarned.toString()).toBe(currentEnemy.goldReward.toString());
  });

  it('clears the stage and generates a new one when the boss is defeated', () => {
    const state = createCombatState(1);
    state.stage.currentEnemyIndex = state.stage.enemies.length - 1;
    const boss = getCurrentEnemy(state.stage);
    const previousStageNumber = state.stage.stageNumber;
    const previousStage = state.stage;

    const event = resolveHit(state, boss.hp, rngNormal, STARTING_CRIT_CHANCES);

    expect(event.enemyDefeated).toBe(true);
    expect(event.enemyKind).toBe('boss');
    expect(event.stageCleared).toBe(true);
    expect(event.newStageNumber).toBe(previousStageNumber + 1);
    expect(state.stage).not.toBe(previousStage);
    expect(state.stage.stageNumber).toBe(previousStageNumber + 1);
    expect(state.stage.currentEnemyIndex).toBe(0);
  });
});

describe('resolveAutoHit', () => {
  it('does not advance or clear the stage on a non-lethal hit', () => {
    const state = createCombatState(1);
    const event = resolveAutoHit(state, 1);

    expect(event.enemyDefeated).toBe(false);
    expect(event.stageCleared).toBe(false);
    expect(state.stage.currentEnemyIndex).toBe(0);
    expect(event.goldEarned.toString()).toBe('0');
  });

  it('advances to the next enemy when a non-boss enemy is defeated', () => {
    const state = createCombatState(1);
    const currentEnemy = getCurrentEnemy(state.stage);
    const event = resolveAutoHit(state, currentEnemy.hp);

    expect(event.enemyDefeated).toBe(true);
    expect(event.enemyKind).toBe('monster');
    expect(event.stageCleared).toBe(false);
    expect(state.stage.currentEnemyIndex).toBe(1);
    expect(event.goldEarned.toString()).toBe(currentEnemy.goldReward.toString());
  });

  it('clears the stage and generates a new one when the boss is defeated', () => {
    const state = createCombatState(1);
    state.stage.currentEnemyIndex = state.stage.enemies.length - 1;
    const boss = getCurrentEnemy(state.stage);
    const previousStageNumber = state.stage.stageNumber;
    const previousStage = state.stage;

    const event = resolveAutoHit(state, boss.hp);

    expect(event.enemyDefeated).toBe(true);
    expect(event.enemyKind).toBe('boss');
    expect(event.stageCleared).toBe(true);
    expect(event.newStageNumber).toBe(previousStageNumber + 1);
    expect(state.stage).not.toBe(previousStage);
    expect(state.stage.stageNumber).toBe(previousStageNumber + 1);
    expect(state.stage.currentEnemyIndex).toBe(0);
  });

  it('never rolls a crit, regardless of damage dealt', () => {
    const state = createCombatState(1);
    for (const damage of [1, 5, 50, 500]) {
      const event = resolveAutoHit(state, damage);
      expect(event.outcome).toBe('normal');
    }
  });
});
