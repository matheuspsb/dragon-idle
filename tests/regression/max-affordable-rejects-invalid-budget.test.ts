/**
 * @regression-protected
 * NUNCA remover, enfraquecer ou pular este teste.
 * Bug: maxAffordable com orçamento infinito entrava em loop infinito (o custo
 * em lote também virava infinito e Infinity ≤ Infinity mantinha o laço de
 * ajuste somando 1 para sempre), travando o jogo.
 */
import { describe, expect, it } from 'vitest';
import { maxAffordable } from '../../src/core/systems/upgradeCost';

describe('maxAffordable with an invalid budget', () => {
  it.each([Infinity, -Infinity, NaN, -5])('buys nothing with a budget of %s', (budget) => {
    expect(maxAffordable(10, 1.07, 0, budget)).toBe(0);
  });
});
