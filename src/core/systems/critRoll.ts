import type { Rng } from '../../utils/random';
import {
  CRIT_CHANCE,
  CRIT_MULTIPLIER,
  SUPER_CRIT_CHANCE,
  SUPER_CRIT_MULTIPLIER,
  type HitOutcome,
} from '../../config/critConfig';

export function rollHitOutcome(rng: Rng): HitOutcome {
  const roll = rng();
  if (roll < SUPER_CRIT_CHANCE) return 'superCrit';
  if (roll < SUPER_CRIT_CHANCE + CRIT_CHANCE) return 'crit';
  return 'normal';
}

// Average damage multiplier of a click over many rolls (ver docs/game-math.md).
export function expectedHitMultiplier(): number {
  return 1 + CRIT_CHANCE * (CRIT_MULTIPLIER - 1) + SUPER_CRIT_CHANCE * (SUPER_CRIT_MULTIPLIER - 1);
}
