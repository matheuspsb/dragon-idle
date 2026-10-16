import { Decimal } from '../../utils/Decimal';
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
