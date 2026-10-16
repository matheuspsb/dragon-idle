import { Decimal } from '../../utils/Decimal';
import { addGold, type WalletState } from '../state/WalletState';
import type { CombatEvent } from './combatSystem';

export function collectGold(wallet: WalletState, events: CombatEvent[]): Decimal {
  const collected = events.reduce((sum, event) => sum.add(event.goldEarned), new Decimal(0));
  addGold(wallet, collected);
  return collected;
}
