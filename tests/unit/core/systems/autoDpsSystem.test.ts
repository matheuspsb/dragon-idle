import { describe, expect, it } from 'vitest';
import { createKnight } from '../../../../src/core/entities/Knight';
import { createCombatState } from '../../../../src/core/systems/combatSystem';
import { getCurrentEnemy } from '../../../../src/core/entities/Stage';
import { tickAutoDps } from '../../../../src/core/systems/autoDpsSystem';

describe('tickAutoDps', () => {
  it('produces no events when deltaSeconds is below the attack interval', () => {
    const knightsState = { knights: [createKnight({ damagePerHit: 1, attackIntervalSeconds: 1 })] };
    const combatState = createCombatState(1);

    const events = tickAutoDps(knightsState, combatState, 0.5);

    expect(events).toHaveLength(0);
    expect(knightsState.knights[0].timeSinceLastAttack).toBeCloseTo(0.5);
  });

  it('produces exactly one event when deltaSeconds equals the attack interval', () => {
    const knightsState = { knights: [createKnight({ damagePerHit: 1, attackIntervalSeconds: 1 })] };
    const combatState = createCombatState(1);

    const events = tickAutoDps(knightsState, combatState, 1);

    expect(events).toHaveLength(1);
    expect(knightsState.knights[0].timeSinceLastAttack).toBeCloseTo(0);
  });

  it('produces multiple catch-up events for a large deltaSeconds', () => {
    const knightsState = { knights: [createKnight({ damagePerHit: 1, attackIntervalSeconds: 1 })] };
    const combatState = createCombatState(1);

    const events = tickAutoDps(knightsState, combatState, 3.5);

    expect(events).toHaveLength(3);
    expect(knightsState.knights[0].timeSinceLastAttack).toBeCloseTo(0.5);
  });

  it('accumulates the timer across separate calls', () => {
    const knightsState = { knights: [createKnight({ damagePerHit: 1, attackIntervalSeconds: 1 })] };
    const combatState = createCombatState(1);

    const firstTick = tickAutoDps(knightsState, combatState, 0.6);
    const secondTick = tickAutoDps(knightsState, combatState, 0.6);

    expect(firstTick).toHaveLength(0);
    expect(secondTick).toHaveLength(1);
    expect(knightsState.knights[0].timeSinceLastAttack).toBeCloseTo(0.2);
  });

  it('ticks each knight independently', () => {
    const knightsState = {
      knights: [
        createKnight({ damagePerHit: 1, attackIntervalSeconds: 1 }),
        createKnight({ damagePerHit: 1, attackIntervalSeconds: 2 }),
      ],
    };
    const combatState = createCombatState(1);

    const events = tickAutoDps(knightsState, combatState, 4);

    // knight 1: 4 attacks (every 1s), knight 2: 2 attacks (every 2s)
    expect(events).toHaveLength(6);
  });

  it('reflects kills and stage clears produced mid-catch-up, in order', () => {
    const knightsState = {
      knights: [createKnight({ damagePerHit: 1e6, attackIntervalSeconds: 1 })],
    };
    const combatState = createCombatState(1);
    const firstEnemy = getCurrentEnemy(combatState.stage);

    // Each hit is far stronger than any early monster, so every attack kills one.
    const events = tickAutoDps(knightsState, combatState, 3);

    expect(events).toHaveLength(3);
    expect(events.every((event) => event.enemyDefeated)).toBe(true);
    expect(events[0].goldEarned.toString()).toBe(firstEnemy.goldReward.toString());
    expect(combatState.stage.currentEnemyIndex).toBe(3);
  });
});
