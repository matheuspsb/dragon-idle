import { Decimal } from '../../utils/Decimal';
import type { DecimalSource } from '../../utils/Decimal';

export type EnemyKind = 'monster' | 'boss';

export interface Enemy {
  readonly kind: EnemyKind;
  readonly maxHp: Decimal;
  hp: Decimal;
  readonly goldReward: Decimal;
}

export interface CreateEnemyOptions {
  kind: EnemyKind;
  hp: DecimalSource;
  goldReward: DecimalSource;
}

export function createEnemy(options: CreateEnemyOptions): Enemy {
  const hp = new Decimal(options.hp);
  return { kind: options.kind, maxHp: hp, hp, goldReward: new Decimal(options.goldReward) };
}

export function isEnemyDefeated(enemy: Enemy): boolean {
  return enemy.hp.lte(0);
}
