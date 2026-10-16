import { Decimal } from '../../utils/Decimal';
import type { DecimalSource } from '../../utils/Decimal';
import type { Upgradable } from './Upgradable';
import { KNIGHT_BASE_COST, UPGRADE_COST_GROWTH } from '../../config/upgradeConfig';

export interface Knight extends Upgradable {
  readonly baseDamage: Decimal;
  readonly attackIntervalSeconds: number;
  timeSinceLastAttack: number;
}

export interface CreateKnightOptions {
  damagePerHit: DecimalSource;
  attackIntervalSeconds: number;
  baseCost?: DecimalSource;
  costGrowth?: number;
}

export function createKnight(options: CreateKnightOptions): Knight {
  return {
    level: 1,
    baseDamage: new Decimal(options.damagePerHit),
    baseCost: options.baseCost ?? KNIGHT_BASE_COST,
    costGrowth: options.costGrowth ?? UPGRADE_COST_GROWTH,
    attackIntervalSeconds: options.attackIntervalSeconds,
    timeSinceLastAttack: 0,
  };
}
