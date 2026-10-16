import { Decimal } from '../../utils/Decimal';
import type { Upgradable } from '../entities/Upgradable';
import { trySpend, type WalletState } from '../state/WalletState';
import { bulkCost, maxAffordable } from './upgradeCost';

export interface PurchaseResult {
  levelsBought: number;
  goldSpent: Decimal;
}

export function buyLevels(wallet: WalletState, target: Upgradable, count: number): PurchaseResult {
  const price = bulkCost(target.baseCost, target.costGrowth, target.level, count);
  if (count <= 0 || !trySpend(wallet, price)) {
    return { levelsBought: 0, goldSpent: new Decimal(0) };
  }
  target.level += count;
  return { levelsBought: count, goldSpent: price };
}

export function buyMaxLevels(wallet: WalletState, target: Upgradable): PurchaseResult {
  const count = maxAffordable(target.baseCost, target.costGrowth, target.level, wallet.gold);
  return buyLevels(wallet, target, count);
}
