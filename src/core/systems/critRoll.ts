import type { Rng } from '../../utils/random';
import {
  CRIT_MULTIPLIER,
  SUPER_CRIT_MULTIPLIER,
  type CritChances,
  type HitOutcome,
} from '../../config/critConfig';

export function rollHitOutcome(rng: Rng, chances: CritChances): HitOutcome {
  const roll = rng();
  if (roll < chances.superCrit) return 'superCrit';
  if (roll < chances.superCrit + chances.crit) return 'crit';
  return 'normal';
}

// Average damage multiplier of a click over many rolls (ver docs/game-math.md).
export function expectedHitMultiplier(chances: CritChances): number {
  return 1 + chances.crit * (CRIT_MULTIPLIER - 1) + chances.superCrit * (SUPER_CRIT_MULTIPLIER - 1);
}
