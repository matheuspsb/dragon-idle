import { Decimal } from '../../utils/Decimal';
import type { DecimalSource } from '../../utils/Decimal';
import type { CombatEvent } from '../systems/combatSystem';

export interface WalletState {
  gold: Decimal;
}

export function createWalletState(startingGold: DecimalSource = 0): WalletState {
  return { gold: new Decimal(startingGold) };
}

export function addGold(wallet: WalletState, amount: DecimalSource): void {
  wallet.gold = wallet.gold.add(amount);
}

export function collectGold(wallet: WalletState, events: CombatEvent[]): Decimal {
  const collected = events.reduce((sum, event) => sum.add(event.goldEarned), new Decimal(0));
  addGold(wallet, collected);
  return collected;
}

export function trySpend(wallet: WalletState, amount: DecimalSource): boolean {
  if (wallet.gold.lt(amount)) return false;
  wallet.gold = wallet.gold.sub(amount);
  return true;
}
