import type { Enemy } from './Enemy';

export interface Stage {
  readonly stageNumber: number;
  readonly enemies: Enemy[];
  currentEnemyIndex: number;
}

export function getCurrentEnemy(stage: Stage): Enemy {
  return stage.enemies[stage.currentEnemyIndex];
}
