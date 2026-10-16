import type { Rng } from '../../utils/random';
import { CRIT_CHANCE, SUPER_CRIT_CHANCE, type HitOutcome } from '../../config/critConfig';

export function rollHitOutcome(rng: Rng): HitOutcome {
  const roll = rng();
  if (roll < SUPER_CRIT_CHANCE) return 'superCrit';
  if (roll < SUPER_CRIT_CHANCE + CRIT_CHANCE) return 'crit';
  return 'normal';
}
