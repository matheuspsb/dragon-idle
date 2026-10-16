import type Phaser from 'phaser';
import type { EnemyKind } from '../core/entities/Enemy';
import { placeholders, toColorNumber } from './tokens';

export function addEnemyPlaceholder(
  scene: Phaser.Scene,
  x: number,
  y: number,
  kind: EnemyKind
): Phaser.GameObjects.Rectangle {
  const rect = scene.add.rectangle(x, y, 1, 1);
  applyEnemyPlaceholder(rect, kind);
  return rect;
}

export function applyEnemyPlaceholder(rect: Phaser.GameObjects.Rectangle, kind: EnemyKind): void {
  const { width, height, color } = placeholders[kind];
  rect.setSize(width, height).setDisplaySize(width, height).setFillStyle(toColorNumber(color));
}

export function addKnightPlaceholder(
  scene: Phaser.Scene,
  x: number,
  y: number
): Phaser.GameObjects.Rectangle {
  const { width, height, color } = placeholders.knight;
  return scene.add.rectangle(x, y, width, height, toColorNumber(color));
}

export function addGoldPlaceholder(
  scene: Phaser.Scene,
  x: number,
  y: number
): Phaser.GameObjects.Arc {
  const { radius, color } = placeholders.gold;
  return scene.add.circle(x, y, radius, toColorNumber(color));
}
