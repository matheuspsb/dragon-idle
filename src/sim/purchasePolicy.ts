import type { Decimal } from '../utils/Decimal';
import type { Upgradable } from '../core/entities/Upgradable';
import { nextCost } from '../core/systems/upgradeCost';

export interface UpgradeCandidate {
  target: Upgradable;
  dpsGain: Decimal;
}

// Greedy policy: the next level that adds the most DPS per gold spent.
export function chooseBestUpgrade<T extends UpgradeCandidate>(candidates: T[]): T | undefined {
  let best: T | undefined;
  let bestScore: Decimal | undefined;

  for (const candidate of candidates) {
    if (!candidate.dpsGain.gt(0)) continue;
    const { baseCost, costGrowth, level } = candidate.target;
    const score = candidate.dpsGain.div(nextCost(baseCost, costGrowth, level));
    if (!bestScore || score.gt(bestScore)) {
      best = candidate;
      bestScore = score;
    }
  }

  return best;
}
