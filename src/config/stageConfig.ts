// Placeholder curve — real balance is Fase 4's job. Ver docs/decisions/0017.
// A zone is MONSTERS_PER_STAGE monsters whose HP ramps geometrically from
// FIRST_MONSTER_HP to LAST_MONSTER_HP, then a boss of BOSS_HP_MULTIPLIER × the
// last monster. Every later zone multiplies all of it by HP_GROWTH_PER_STAGE.
// Gold is proportional to HP inside a zone, but grows GOLD_GROWTH_PER_STAGE per
// zone: keeping it below HP growth is what builds the wall between zones.
export const MONSTERS_PER_STAGE = 9;
export const FIRST_MONSTER_HP = 10;
export const LAST_MONSTER_HP = 100;
export const BOSS_HP_MULTIPLIER = 10;
export const HP_GROWTH_PER_STAGE = 1.2;
export const GOLD_PER_HP = 0.2;
export const GOLD_GROWTH_PER_STAGE = 1.15;
export const BOSS_TIME_LIMIT_SECONDS = 30;
