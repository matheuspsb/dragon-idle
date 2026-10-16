/**
 * @regression-protected
 * NUNCA remover, enfraquecer ou pular este teste.
 * Bug: buyLevels aceitava quantidade fracionária ou NaN, cobrando um preço
 * "parcial" e deixando o nível como 3.5 (ou NaN).
 */
import { describe, expect, it } from 'vitest';
import { createWalletState } from '../../src/core/state/WalletState';
import type { Upgradable } from '../../src/core/entities/Upgradable';
import { buyLevels } from '../../src/core/systems/upgradeSystem';

describe('buyLevels requires a whole count', () => {
  it.each([2.5, 0.5, NaN, Infinity])('buyLevels(%s) buys nothing', (count) => {
    const target: Upgradable = { level: 1, baseCost: 10, costGrowth: 1.07 };
    const wallet = createWalletState(1_000_000);

    const result = buyLevels(wallet, target, count);

    expect(result.levelsBought).toBe(0);
    expect(result.goldSpent.toNumber()).toBe(0);
    expect(target.level).toBe(1);
    expect(wallet.gold.toNumber()).toBe(1_000_000);
  });
});
