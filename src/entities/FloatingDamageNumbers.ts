import Phaser from 'phaser';
import type { Decimal } from '../utils/Decimal';
import type { HitOutcome } from '../config/critConfig';
import { formatNumber } from '../utils/format';
import { createObjectPool, type ObjectPool } from '../systems/objectPool';
import { damageTextStyles, motion } from '../ui/tokens';

const PREALLOCATED_TEXTS = 12;

export class FloatingDamageNumbers {
  private readonly pool: ObjectPool<Phaser.GameObjects.Text>;

  constructor(private readonly scene: Phaser.Scene) {
    this.pool = createObjectPool(
      () => scene.add.text(0, 0, '', damageTextStyles.normal).setOrigin(0.5).setVisible(false),
      { prealloc: PREALLOCATED_TEXTS, reset: (text) => text.setVisible(false) }
    );
  }

  show(x: number, y: number, damage: Decimal, outcome: HitOutcome): void {
    const text = this.pool.acquire();
    const startX = x + Phaser.Math.Between(-motion.damageJitterX, motion.damageJitterX);

    text
      .setStyle(damageTextStyles[outcome])
      .setText(formatNumber(damage))
      .setPosition(startX, y)
      .setAlpha(1)
      .setDepth(1)
      .setVisible(true);

    this.scene.tweens.add({
      targets: text,
      y: y - motion.damageFloatDistance,
      alpha: 0,
      duration: motion.damageFloatDurationMs,
      ease: 'Cubic.easeOut',
      onComplete: () => this.pool.release(text),
    });
  }
}
