import { Decimal } from '../../utils/Decimal';
import type { Upgradable } from '../entities/Upgradable';
import {
  CLICK_BASE_COST,
  CLICK_BASE_DAMAGE,
  UPGRADE_COST_GROWTH,
} from '../../config/upgradeConfig';

export interface ClickState extends Upgradable {
  readonly baseDamage: Decimal;
}

export function createClickState(): ClickState {
  return {
    level: 1,
    baseDamage: new Decimal(CLICK_BASE_DAMAGE),
    baseCost: CLICK_BASE_COST,
    costGrowth: UPGRADE_COST_GROWTH,
  };
}
