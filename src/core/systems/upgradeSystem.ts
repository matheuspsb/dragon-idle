import { Decimal } from '../../utils/Decimal';
import type { DecimalSource } from '../../utils/Decimal';
import type { Upgradable } from '../entities/Upgradable';
import { trySpend, type WalletState } from '../state/WalletState';
import { bulkCost, maxAffordable } from './upgradeCost';

export interface PurchaseResult {
  levelsBought: number;
  goldSpent: Decimal;
}

export function buyLevels(wallet: WalletState, target: Upgradable, count: number): PurchaseResult {
  const nothingBought = { levelsBought: 0, goldSpent: new Decimal(0) };
  if (!Number.isInteger(count) || count <= 0) return nothingBought;

  const price = bulkCost(target.baseCost, target.costGrowth, target.level, count);
  if (!trySpend(wallet, price)) return nothingBought;
  target.level += count;
  return { levelsBought: count, goldSpent: price };
}

export function buyMaxLevels(wallet: WalletState, target: Upgradable): PurchaseResult {
  const count = maxAffordable(target.baseCost, target.costGrowth, target.level, wallet.gold);
  return buyLevels(wallet, target, count);
}

export type PurchaseMode = 'x1' | 'x10' | 'max';

export interface PurchaseQuote {
  count: number;
  cost: Decimal;
  affordable: boolean;
}

const FIXED_COUNTS: Record<Exclude<PurchaseMode, 'max'>, number> = { x1: 1, x10: 10 };

export function quotePurchase(
  target: Upgradable,
  mode: PurchaseMode,
  gold: DecimalSource
): PurchaseQuote {
  const budget = new Decimal(gold);
  // break_eternity's comparisons treat NaN as passing, so validate first.
  const usableBudget = budget.isFinite() && budget.gte(0) ? budget : new Decimal(0);
  const { baseCost, costGrowth, level } = target;

  const maxCount = mode === 'max' ? maxAffordable(baseCost, costGrowth, level, usableBudget) : 0;
  const count = mode === 'max' ? Math.max(1, maxCount) : FIXED_COUNTS[mode];
  const cost = bulkCost(baseCost, costGrowth, level, count);

  return { count, cost, affordable: usableBudget.gte(cost) };
}

export function buyWithMode(
  wallet: WalletState,
  target: Upgradable,
  mode: PurchaseMode
): PurchaseResult {
  const quote = quotePurchase(target, mode, wallet.gold);
  if (!quote.affordable) return { levelsBought: 0, goldSpent: new Decimal(0) };
  return buyLevels(wallet, target, quote.count);
}
