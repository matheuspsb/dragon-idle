import { Decimal } from '../../utils/Decimal';
import type { DecimalSource } from '../../utils/Decimal';
import type { Knight } from '../entities/Knight';
import type { ClickState } from '../state/ClickState';
import { MILESTONE_INTERVAL, MILESTONE_MULTIPLIER } from '../../config/upgradeConfig';

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

export function getKnightDamage(knight: Knight): Decimal {
  return levelDamage(knight.baseDamage, knight.level);
}

export function getClickDamage(click: ClickState): Decimal {
  return levelDamage(click.baseDamage, click.level);
}
