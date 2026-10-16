import type Phaser from 'phaser';
import { placeholders, toColorNumber } from './tokens';

export function addBossPlaceholder(
  scene: Phaser.Scene,
  x: number,
  y: number
): Phaser.GameObjects.Rectangle {
  const { width, height, color } = placeholders.boss;
  return scene.add.rectangle(x, y, width, height, toColorNumber(color));
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
