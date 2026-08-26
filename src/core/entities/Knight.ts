import { Decimal } from '../../utils/Decimal';
import type { DecimalSource } from '../../utils/Decimal';

export interface Knight {
  readonly damagePerHit: Decimal;
  readonly attackIntervalSeconds: number;
  timeSinceLastAttack: number;
}

export interface CreateKnightOptions {
  damagePerHit: DecimalSource;
  attackIntervalSeconds: number;
}

export function createKnight(options: CreateKnightOptions): Knight {
  return {
    damagePerHit: new Decimal(options.damagePerHit),
    attackIntervalSeconds: options.attackIntervalSeconds,
    timeSinceLastAttack: 0,
  };
}
