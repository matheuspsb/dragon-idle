/**
 * @regression-protected
 * NUNCA remover, enfraquecer ou pular este teste.
 * Bug: trySpend aceitava valor negativo (ou NaN) e, em vez de gastar, aumentava
 * o ouro ou o deixava como NaN; addGold aceitava valor negativo e tirava ouro.
 */
import { describe, expect, it } from 'vitest';
import { addGold, createWalletState, trySpend } from '../../src/core/state/WalletState';

describe('wallet rejects invalid amounts', () => {
  it.each([-5, NaN])('trySpend(%s) is refused and leaves gold untouched', (amount) => {
    const wallet = createWalletState(10);

    expect(trySpend(wallet, amount)).toBe(false);
    expect(wallet.gold.toNumber()).toBe(10);
  });

  it.each([-5, NaN])('addGold(%s) throws and leaves gold untouched', (amount) => {
    const wallet = createWalletState(10);

    expect(() => addGold(wallet, amount)).toThrow(RangeError);
    expect(wallet.gold.toNumber()).toBe(10);
  });
});
