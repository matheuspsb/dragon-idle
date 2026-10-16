import type { DecimalSource } from '../../utils/Decimal';

export interface Upgradable {
  level: number;
  readonly baseCost: DecimalSource;
  readonly costGrowth: number;
}
