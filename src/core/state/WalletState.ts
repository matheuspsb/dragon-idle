import { Decimal } from '../../utils/Decimal';
import type { DecimalSource } from '../../utils/Decimal';
import type { CombatEvent } from '../systems/combatSystem';

export interface WalletState {
  gold: Decimal;
}

export function createWalletState(startingGold: DecimalSource = 0): WalletState {
  return { gold: new Decimal(startingGold) };
}

function isValidAmount(amount: Decimal): boolean {
  // break_eternity's comparisons treat NaN as passing (NaN.gte(0) === true).
  return amount.isFinite() && amount.gte(0);
}

export function addGold(wallet: WalletState, amount: DecimalSource): void {
  const value = new Decimal(amount);
  if (!isValidAmount(value)) throw new RangeError(`Invalid gold amount: ${value.toString()}`);
  wallet.gold = wallet.gold.add(value);
}

export function collectGold(wallet: WalletState, events: CombatEvent[]): Decimal {
  const collected = events.reduce((sum, event) => sum.add(event.goldEarned), new Decimal(0));
  addGold(wallet, collected);
  return collected;
}

export function trySpend(wallet: WalletState, amount: DecimalSource): boolean {
  const value = new Decimal(amount);
  if (!isValidAmount(value) || wallet.gold.lt(value)) return false;
  wallet.gold = wallet.gold.sub(value);
  return true;
}
