import { Decimal } from '../../utils/Decimal';
import { createEnemy, type Enemy, type EnemyKind } from '../entities/Enemy';
import type { Stage } from '../entities/Stage';
import {
  BOSS_HP_MULTIPLIER,
  FIRST_MONSTER_HP,
  GOLD_GROWTH_PER_STAGE,
  GOLD_PER_HP,
  HP_GROWTH_PER_STAGE,
  LAST_MONSTER_HP,
  MONSTERS_PER_STAGE,
} from '../../config/stageConfig';

// Same exponential idea as the upgrade costs (ver docs/game-math.md): each
// monster in a zone is a fixed factor tougher than the previous one.
const MONSTER_HP_RAMP = (LAST_MONSTER_HP / FIRST_MONSTER_HP) ** (1 / (MONSTERS_PER_STAGE - 1));

function enemyOf(kind: EnemyKind, hp: Decimal, goldPerHp: Decimal): Enemy {
  return createEnemy({ kind, hp, goldReward: hp.mul(goldPerHp) });
}

export function createStage(stageNumber: number): Stage {
  const firstHp = new Decimal(FIRST_MONSTER_HP).mul(
    new Decimal(HP_GROWTH_PER_STAGE).pow(stageNumber - 1)
  );

  // Gold per HP drifts by GOLD_GROWTH / HP_GROWTH each zone, so total gold
  // grows by GOLD_GROWTH_PER_STAGE while staying proportional to HP in the zone.
  const goldPerHp = new Decimal(GOLD_PER_HP).mul(
    new Decimal(GOLD_GROWTH_PER_STAGE / HP_GROWTH_PER_STAGE).pow(stageNumber - 1)
  );

  const enemies: Enemy[] = [];
  for (let i = 0; i < MONSTERS_PER_STAGE; i++) {
    enemies.push(enemyOf('monster', firstHp.mul(MONSTER_HP_RAMP ** i), goldPerHp));
  }
  const lastMonsterHp = enemies[MONSTERS_PER_STAGE - 1].maxHp;
  enemies.push(enemyOf('boss', lastMonsterHp.mul(BOSS_HP_MULTIPLIER), goldPerHp));

  return { stageNumber, enemies, currentEnemyIndex: 0 };
}
