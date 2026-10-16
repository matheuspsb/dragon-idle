import { describe, expect, it } from 'vitest';
import { createWalletState } from '../../../../src/core/state/WalletState';
import type { Upgradable } from '../../../../src/core/entities/Upgradable';
import { bulkCost, nextCost } from '../../../../src/core/systems/upgradeCost';
import { buyLevels, buyMaxLevels } from '../../../../src/core/systems/upgradeSystem';

function makeUpgradable(level = 1): Upgradable {
  return { level, baseCost: 10, costGrowth: 1.07 };
}

describe('buyLevels', () => {
  it('raises the level and charges the bulk cost', () => {
    const target = makeUpgradable(1);
    const price = bulkCost(10, 1.07, 1, 3);
    const wallet = createWalletState(price.add(1));

    const result = buyLevels(wallet, target, 3);

    expect(result.levelsBought).toBe(3);
    expect(result.goldSpent.eq(price)).toBe(true);
    expect(target.level).toBe(4);
    expect(wallet.gold.toNumber()).toBeCloseTo(1, 8);
  });

  it('buys nothing (all-or-nothing) when the full count is unaffordable', () => {
    const target = makeUpgradable(1);
    const wallet = createWalletState(nextCost(10, 1.07, 1));

    const result = buyLevels(wallet, target, 2);

    expect(result.levelsBought).toBe(0);
    expect(target.level).toBe(1);
    expect(wallet.gold.eq(nextCost(10, 1.07, 1))).toBe(true);
  });
});

describe('buyMaxLevels', () => {
  it('buys as many levels as the wallet allows', () => {
    const target = makeUpgradable(1);
    const wallet = createWalletState(bulkCost(10, 1.07, 1, 7).add(0.5));

    const result = buyMaxLevels(wallet, target);

    expect(result.levelsBought).toBe(7);
    expect(target.level).toBe(8);
    expect(wallet.gold.lt(nextCost(10, 1.07, 8))).toBe(true);
  });

  it('is a no-op with an empty wallet', () => {
    const target = makeUpgradable(1);
    const result = buyMaxLevels(createWalletState(), target);
    expect(result.levelsBought).toBe(0);
    expect(target.level).toBe(1);
  });
});
