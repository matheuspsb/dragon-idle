export interface EquilibriumInputs {
  hpGrowthPerStage: number;
  costGrowth: number;
  milestoneInterval: number;
  milestoneMultiplier: number;
}

// Gold growth per stage needed to keep pace with enemy HP, ignoring the linear
// part of damage (ver docs/game-math.md, "Condição de equilíbrio").
export function requiredGoldGrowthPerStage(inputs: EquilibriumInputs): number {
  const { hpGrowthPerStage, costGrowth, milestoneInterval, milestoneMultiplier } = inputs;
  const damageGrowthPerLevel = Math.log(milestoneMultiplier) / milestoneInterval;
  if (!(damageGrowthPerLevel > 0)) {
    throw new RangeError('Milestones must add damage for the equilibrium to exist');
  }
  return hpGrowthPerStage ** (Math.log(costGrowth) / damageGrowthPerLevel);
}
