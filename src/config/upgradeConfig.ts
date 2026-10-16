// Placeholder balance values — retune with the balance-sim / Fase 4, not final.
// Cost model: cost_next = baseCost × costGrowth^level (Kongregate "Math of Idle Games").
// Ver docs/decisions/0005.
export const UPGRADE_COST_GROWTH = 1.07;
export const KNIGHT_BASE_COST = 10;
export const CLICK_BASE_COST = 5;
export const CLICK_BASE_DAMAGE = 1;

// Every MILESTONE_INTERVAL levels, damage is multiplied by MILESTONE_MULTIPLIER.
// Linear damage alone can never keep up with exponential cost; milestones bend it.
// Ver docs/decisions/0011.
export const MILESTONE_INTERVAL = 25;
export const MILESTONE_MULTIPLIER = 4;
