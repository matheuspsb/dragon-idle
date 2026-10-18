/**
 * @regression-protected
 * NUNCA remover, enfraquecer ou pular este teste.
 * Bug: dano negativo curava o inimigo (HP 10 → 15) e dano NaN deixava o HP como
 * NaN, o que contava como derrota e entregava ouro sem dano real.
 */
import { describe, expect, it } from 'vitest';
import { STARTING_CRIT_CHANCES } from '../../src/config/critConfig';
import { createEnemy } from '../../src/core/entities/Enemy';
import { applyDamage, applyFlatDamage } from '../../src/core/systems/damage';
import { createCombatState, resolveAutoHit } from '../../src/core/systems/combatSystem';

const rngNormal = () => 0.999999;
const INVALID_DAMAGE = [-5, NaN, Infinity, -Infinity];

describe('damage rejects invalid amounts', () => {
  it.each(INVALID_DAMAGE)('applyFlatDamage(%s) throws and leaves hp untouched', (damage) => {
    const enemy = createEnemy({ kind: 'monster', hp: 10, goldReward: 1 });

    expect(() => applyFlatDamage(enemy, damage)).toThrow(RangeError);
    expect(enemy.hp.toNumber()).toBe(10);
  });

  it.each(INVALID_DAMAGE)('applyDamage(%s) throws and leaves hp untouched', (damage) => {
    const enemy = createEnemy({ kind: 'monster', hp: 10, goldReward: 1 });

    expect(() => applyDamage(enemy, damage, rngNormal, STARTING_CRIT_CHANCES)).toThrow(RangeError);
    expect(enemy.hp.toNumber()).toBe(10);
  });

  it('an invalid hit never defeats an enemy or pays gold', () => {
    const state = createCombatState(1);

    expect(() => resolveAutoHit(state, NaN)).toThrow(RangeError);
    expect(state.stage.currentEnemyIndex).toBe(0);
  });

  it('zero damage is valid and changes nothing', () => {
    const enemy = createEnemy({ kind: 'monster', hp: 10, goldReward: 1 });
    const result = applyFlatDamage(enemy, 0);

    expect(result.enemyDefeated).toBe(false);
    expect(enemy.hp.toNumber()).toBe(10);
  });
});
