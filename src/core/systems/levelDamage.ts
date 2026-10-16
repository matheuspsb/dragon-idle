import { Decimal } from '../../utils/Decimal';
import type { DecimalSource } from '../../utils/Decimal';
import { MILESTONE_INTERVAL, MILESTONE_MULTIPLIER } from '../../data/upgradeConfig';

export function milestoneMultiplier(level: number): Decimal {
  const milestones = Math.floor(level / MILESTONE_INTERVAL);
  const exact = MILESTONE_MULTIPLIER ** milestones;
  return Number.isFinite(exact)
    ? new Decimal(exact)
    : new Decimal(MILESTONE_MULTIPLIER).pow(milestones);
}

export function levelDamage(baseDamage: DecimalSource, level: number): Decimal {
  return new Decimal(baseDamage).mul(level).mul(milestoneMultiplier(level));
}
