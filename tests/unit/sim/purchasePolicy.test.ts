import { describe, expect, it } from 'vitest';
import { Decimal } from '../../../src/utils/Decimal';
import type { Upgradable } from '../../../src/core/entities/Upgradable';
import { chooseBestUpgrade } from '../../../src/sim/purchasePolicy';

function upgradable(baseCost: number, level = 1): Upgradable {
  return { level, baseCost, costGrowth: 1.07 };
}

describe('chooseBestUpgrade', () => {
  it('picks the candidate with the most DPS gained per gold', () => {
    const cheapWeak = { target: upgradable(10), dpsGain: new Decimal(1) };
    const priceyStrong = { target: upgradable(100), dpsGain: new Decimal(20) };

    expect(chooseBestUpgrade([cheapWeak, priceyStrong])).toBe(priceyStrong);
  });

  it('accounts for the current level when pricing', () => {
    const highLevel = { target: upgradable(10, 50), dpsGain: new Decimal(5) };
    const lowLevel = { target: upgradable(10, 1), dpsGain: new Decimal(1) };

    expect(chooseBestUpgrade([highLevel, lowLevel])).toBe(lowLevel);
  });

  it('ignores candidates that add no DPS', () => {
    const useless = { target: upgradable(1), dpsGain: new Decimal(0) };
    const useful = { target: upgradable(1000), dpsGain: new Decimal(1) };

    expect(chooseBestUpgrade([useless, useful])).toBe(useful);
  });

  it('returns undefined when nothing is worth buying', () => {
    expect(chooseBestUpgrade([])).toBeUndefined();
    expect(chooseBestUpgrade([{ target: upgradable(1), dpsGain: new Decimal(0) }])).toBeUndefined();
  });
});
