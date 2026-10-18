export type HitOutcome = 'normal' | 'crit' | 'superCrit';

export interface CritChances {
  readonly crit: number;
  readonly superCrit: number;
}

// Crits are not part of the base game: they only come from an upgrade, which
// raises the click's chances. Multipliers stay ready for that. Ver docs/decisions/0018.
export const STARTING_CRIT_CHANCES: CritChances = { crit: 0, superCrit: 0 };
export const CRIT_MULTIPLIER = 2.5;
export const SUPER_CRIT_MULTIPLIER = 10;

export const HIT_MULTIPLIERS: Record<HitOutcome, number> = {
  normal: 1,
  crit: CRIT_MULTIPLIER,
  superCrit: SUPER_CRIT_MULTIPLIER,
};
