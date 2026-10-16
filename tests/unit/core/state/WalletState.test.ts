import { describe, expect, it } from 'vitest';
import { Decimal } from '../../../../src/utils/Decimal';
import { addGold, createWalletState, trySpend } from '../../../../src/core/state/WalletState';
import { collectGold } from '../../../../src/core/systems/goldSystem';
import type { CombatEvent } from '../../../../src/core/systems/combatSystem';

function eventWithGold(gold: number): CombatEvent {
  return {
    outcome: 'normal',
    damageDealt: new Decimal(1),
    enemyDefeated: gold > 0,
    overkill: new Decimal(0),
    enemyKind: 'monster',
    goldEarned: new Decimal(gold),
    stageCleared: false,
  };
}

describe('WalletState', () => {
  it('starts with zero gold by default', () => {
    expect(createWalletState().gold.toNumber()).toBe(0);
  });

  it('adds gold', () => {
    const wallet = createWalletState(3);
    addGold(wallet, 4);
    expect(wallet.gold.toNumber()).toBe(7);
  });

  it('collects the gold from every combat event', () => {
    const wallet = createWalletState();
    const collected = collectGold(wallet, [eventWithGold(0), eventWithGold(2), eventWithGold(5)]);
    expect(collected.toNumber()).toBe(7);
    expect(wallet.gold.toNumber()).toBe(7);
  });

  it('spends when affordable, including the exact amount', () => {
    const wallet = createWalletState(10);
    expect(trySpend(wallet, 10)).toBe(true);
    expect(wallet.gold.toNumber()).toBe(0);
  });

  it('refuses to spend more than it has and leaves gold untouched', () => {
    const wallet = createWalletState(10);
    expect(trySpend(wallet, 10.01)).toBe(false);
    expect(wallet.gold.toNumber()).toBe(10);
  });
});
