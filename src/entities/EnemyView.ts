import type Phaser from 'phaser';
import type { Decimal } from '../utils/Decimal';
import { getHpRatio, type Enemy } from '../core/entities/Enemy';
import { formatNumber } from '../utils/format';
import { addEnemyPlaceholder, applyEnemyPlaceholder } from '../ui/placeholders';
import { colors, placeholders, spacing, textStyles, toColorNumber } from '../ui/tokens';

export class EnemyView {
  private readonly body: Phaser.GameObjects.Rectangle;
  private readonly hpBarFill: Phaser.GameObjects.Rectangle;
  private readonly hpText: Phaser.GameObjects.Text;
  private readonly hitZone: Phaser.GameObjects.Zone;
  private shownEnemy?: Enemy;
  private shownHp?: Decimal;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.body = addEnemyPlaceholder(scene, x, y, 'monster');
    // Fixed boss-sized target: a rectangle's hit area doesn't follow setSize when
    // the enemy switches between monster and boss.
    this.hitZone = scene.add
      .zone(x, y, placeholders.boss.width, placeholders.boss.height)
      .setInteractive({ useHandCursor: true });

    const { width, height } = placeholders.hpBar;
    const barY = y + placeholders.boss.height / 2 + spacing.hpBarOffset;
    scene.add.rectangle(x, barY, width, height, toColorNumber(colors.hpBarTrack));
    this.hpBarFill = scene.add
      .rectangle(x - width / 2, barY, width, height, toColorNumber(colors.hpBarFill))
      .setOrigin(0, 0.5);
    this.hpText = scene.add
      .text(x, barY + height + spacing.hpBarOffset / 2, '', textStyles.hpText)
      .setOrigin(0.5, 0);
  }

  onClick(handler: () => void): void {
    this.hitZone.on('pointerdown', handler);
  }

  render(enemy: Enemy): void {
    if (enemy !== this.shownEnemy) {
      applyEnemyPlaceholder(this.body, enemy.kind);
      this.shownEnemy = enemy;
      this.shownHp = undefined;
    }

    // Decimal values are immutable and replaced on every hit, so a reference
    // check is enough to know whether anything changed since the last frame.
    if (enemy.hp === this.shownHp) return;
    this.shownHp = enemy.hp;
    this.hpBarFill.scaleX = getHpRatio(enemy);
    this.hpText.setText(`${formatNumber(enemy.hp)} / ${formatNumber(enemy.maxHp)}`);
  }
}
