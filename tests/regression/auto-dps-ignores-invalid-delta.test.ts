/**
 * @regression-protected
 * NUNCA remover, enfraquecer ou pular este teste.
 * Bug: tickAutoDps somava qualquer delta ao timer do cavaleiro. Delta NaN deixava
 * o timer NaN e o cavaleiro nunca mais atacava; delta negativo criava uma
 * "dívida" de tempo que apagava ataques futuros; delta infinito travava o jogo
 * num loop infinito.
 */
import { describe, expect, it } from 'vitest';
import { createKnight } from '../../src/core/entities/Knight';
import { createCombatState } from '../../src/core/systems/combatSystem';
import { tickAutoDps } from '../../src/core/systems/autoDpsSystem';

function setup() {
  const knightsState = { knights: [createKnight({ damagePerHit: 1, attackIntervalSeconds: 1 })] };
  return { knightsState, combatState: createCombatState(1) };
}

describe('tickAutoDps ignores invalid deltas', () => {
  it.each([NaN, -10, Infinity, -Infinity])(
    'a delta of %s produces no attack and does not affect later ticks',
    (delta) => {
      const { knightsState, combatState } = setup();
      tickAutoDps(knightsState, combatState, 0.5);

      expect(tickAutoDps(knightsState, combatState, delta)).toHaveLength(0);
      expect(knightsState.knights[0].timeSinceLastAttack).toBeCloseTo(0.5);
      expect(tickAutoDps(knightsState, combatState, 5)).toHaveLength(5);
    }
  );
});
