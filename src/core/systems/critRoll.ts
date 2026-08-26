import { CRIT_CHANCE, SUPER_CRIT_CHANCE, type HitOutcome } from '../../data/critConfig';

export function rollHitOutcome(rng: () => number = Math.random): HitOutcome {
  const roll = rng();
  if (roll < SUPER_CRIT_CHANCE) return 'superCrit';
  if (roll < SUPER_CRIT_CHANCE + CRIT_CHANCE) return 'crit';
  return 'normal';
}
