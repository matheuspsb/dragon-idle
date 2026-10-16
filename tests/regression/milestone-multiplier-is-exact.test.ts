/**
 * @regression-protected
 * NUNCA remover, enfraquecer ou pular este teste.
 * Bug: o multiplicador de milestone usava Decimal.pow, que passa por logaritmos
 * e devolvia 2^3 = 7.999999999999999 em vez de 8, gerando dano fracionado.
 */
import { describe, expect, it } from 'vitest';
import { MILESTONE_INTERVAL, MILESTONE_MULTIPLIER } from '../../src/data/upgradeConfig';
import { levelDamage, milestoneMultiplier } from '../../src/core/systems/levelDamage';

describe('milestone multiplier is exact', () => {
  it.each([1, 2, 3, 4, 10])('after %i milestones it is an exact integer power', (milestones) => {
    const level = MILESTONE_INTERVAL * milestones;

    expect(milestoneMultiplier(level).toNumber()).toBe(MILESTONE_MULTIPLIER ** milestones);
  });

  it('keeps level damage an exact integer across milestones', () => {
    const level = MILESTONE_INTERVAL * 3;

    expect(levelDamage(1, level).toNumber()).toBe(level * MILESTONE_MULTIPLIER ** 3);
  });
});
