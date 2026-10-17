/**
 * @regression-protected
 * NUNCA remover, enfraquecer ou pular este teste.
 * Bug: o custo em lote de 1 nível (soma geométrica r^k × (r − 1)/(r − 1))
 * diferia de nextCost por erro de ponto flutuante, então o preço cobrado
 * podia ficar acima do preço exibido e recusar uma compra com ouro exato.
 */
import { describe, expect, it } from 'vitest';
import { bulkCost, nextCost } from '../../src/core/systems/upgradeCost';
import { createWalletState } from '../../src/core/state/WalletState';
import { buyLevels } from '../../src/core/systems/upgradeSystem';

describe('bulk cost of a single level', () => {
  it('is exactly the next-level cost at every level', () => {
    for (let level = 0; level <= 300; level++) {
      expect(bulkCost(10, 1.07, level, 1).eq(nextCost(10, 1.07, level))).toBe(true);
    }
  });

  it('lets a player with exactly the shown cost buy the level', () => {
    for (let level = 0; level <= 300; level++) {
      const target = { level, baseCost: 10, costGrowth: 1.07 };
      const wallet = createWalletState(nextCost(10, 1.07, level));

      expect(buyLevels(wallet, target, 1).levelsBought).toBe(1);
    }
  });
});
