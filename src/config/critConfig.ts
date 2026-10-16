export type HitOutcome = 'normal' | 'crit' | 'superCrit';

// Placeholder balance values — retune in Fase 4, not final. Ver docs/decisions/0004.
export const CRIT_CHANCE = 0.12;
export const SUPER_CRIT_CHANCE = 0.01;
export const CRIT_MULTIPLIER = 2.5;
export const SUPER_CRIT_MULTIPLIER = 10;

export const HIT_MULTIPLIERS: Record<HitOutcome, number> = {
  normal: 1,
  crit: CRIT_MULTIPLIER,
  superCrit: SUPER_CRIT_MULTIPLIER,
};
