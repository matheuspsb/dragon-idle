import { describe, expect, it } from 'vitest';
import { createWalletState } from '../../../../src/core/state/WalletState';
import type { Upgradable } from '../../../../src/core/entities/Upgradable';
import { bulkCost, nextCost } from '../../../../src/core/systems/upgradeCost';
import {
  buyLevels,
  buyMaxLevels,
  buyWithMode,
  quotePurchase,
} from '../../../../src/core/systems/upgradeSystem';

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

describe('quotePurchase', () => {
  it('x1 quotes the next level and is affordable at exactly its cost', () => {
    const target = makeUpgradable(3);
    const cost = nextCost(10, 1.07, 3);

    expect(quotePurchase(target, 'x1', cost)).toEqual({ count: 1, cost, affordable: true });
    expect(quotePurchase(target, 'x1', cost.sub(0.01)).affordable).toBe(false);
  });

  it('x10 quotes ten levels at the bulk cost', () => {
    const target = makeUpgradable(3);
    const cost = bulkCost(10, 1.07, 3, 10);

    const quote = quotePurchase(target, 'x10', cost.sub(0.01));

    expect(quote.count).toBe(10);
    expect(quote.cost.eq(cost)).toBe(true);
    expect(quote.affordable).toBe(false);
  });

  it('max quotes as many levels as the gold pays for', () => {
    const target = makeUpgradable(1);
    const gold = bulkCost(10, 1.07, 1, 7).add(0.5);

    const quote = quotePurchase(target, 'max', gold);

    expect(quote.count).toBe(7);
    expect(quote.cost.eq(bulkCost(10, 1.07, 1, 7))).toBe(true);
    expect(quote.affordable).toBe(true);
  });

  it('max falls back to the next level, unaffordable, when gold is short', () => {
    const target = makeUpgradable(1);

    const quote = quotePurchase(target, 'max', 1);

    expect(quote.count).toBe(1);
    expect(quote.cost.eq(nextCost(10, 1.07, 1))).toBe(true);
    expect(quote.affordable).toBe(false);
  });

  it.each([NaN, -5, Infinity])('treats invalid gold (%s) as unable to pay', (gold) => {
    const target = makeUpgradable(1);

    expect(quotePurchase(target, 'x1', gold).affordable).toBe(false);
    expect(quotePurchase(target, 'max', gold)).toMatchObject({ count: 1, affordable: false });
  });
});

describe('buyWithMode', () => {
  it('buys exactly what the quote promised', () => {
    const target = makeUpgradable(1);
    const wallet = createWalletState(bulkCost(10, 1.07, 1, 7).add(0.5));
    const quote = quotePurchase(target, 'max', wallet.gold);

    const result = buyWithMode(wallet, target, 'max');

    expect(result.levelsBought).toBe(quote.count);
    expect(result.goldSpent.eq(quote.cost)).toBe(true);
    expect(target.level).toBe(8);
  });

  it('buys nothing in max mode when not even one level is affordable', () => {
    const target = makeUpgradable(1);
    const wallet = createWalletState(1);

    expect(buyWithMode(wallet, target, 'max').levelsBought).toBe(0);
    expect(wallet.gold.toNumber()).toBe(1);
  });
});
