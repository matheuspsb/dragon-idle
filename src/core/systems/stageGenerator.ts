import { Decimal } from '../../utils/Decimal';
import { createEnemy, type Enemy } from '../entities/Enemy';
import type { Stage } from '../entities/Stage';
import {
  MONSTERS_PER_STAGE,
  BASE_MONSTER_HP,
  HP_GROWTH_PER_STAGE,
  BOSS_HP_MULTIPLIER,
  BASE_GOLD_REWARD,
  GOLD_GROWTH_PER_STAGE,
} from '../../config/stageConfig';

export function createStage(stageNumber: number): Stage {
  const monsterHp = new Decimal(BASE_MONSTER_HP).mul(
    new Decimal(HP_GROWTH_PER_STAGE).pow(stageNumber - 1)
  );
  const goldReward = new Decimal(BASE_GOLD_REWARD).mul(
    new Decimal(GOLD_GROWTH_PER_STAGE).pow(stageNumber - 1)
  );

  const enemies: Enemy[] = [];
  for (let i = 0; i < MONSTERS_PER_STAGE; i++) {
    enemies.push(createEnemy({ kind: 'monster', hp: monsterHp, goldReward }));
  }
  enemies.push(
    createEnemy({
      kind: 'boss',
      hp: monsterHp.mul(BOSS_HP_MULTIPLIER),
      goldReward: goldReward.mul(BOSS_HP_MULTIPLIER),
    })
  );

  return { stageNumber, enemies, currentEnemyIndex: 0 };
}
