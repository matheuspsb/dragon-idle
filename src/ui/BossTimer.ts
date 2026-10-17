import type Phaser from 'phaser';
import { BOSS_TIME_LIMIT_SECONDS } from '../config/stageConfig';
import { colors, placeholders, spacing, textStyles, toColorNumber } from './tokens';

export class BossTimer {
  private readonly track: Phaser.GameObjects.Rectangle;
  private readonly fill: Phaser.GameObjects.Rectangle;
  private readonly text: Phaser.GameObjects.Text;
  private shownTenths: number | null = -1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const { width, height } = placeholders.bossTimerBar;
    this.text = scene.add.text(x, y, '', textStyles.bossTimer).setOrigin(0.5);
    const barY = y + spacing.hpBarOffset;
    this.track = scene.add.rectangle(x, barY, width, height, toColorNumber(colors.hpBarTrack));
    this.fill = scene.add
      .rectangle(x - width / 2, barY, width, height, toColorNumber(colors.bossTimerFill))
      .setOrigin(0, 0.5);
  }

  render(timeLeftSeconds: number | null): void {
    // The timer changes every logic step; only redraw when the shown tenth does.
    const tenths = timeLeftSeconds === null ? null : Math.max(0, Math.ceil(timeLeftSeconds * 10));
    if (tenths === this.shownTenths) return;
    this.shownTenths = tenths;

    const visible = tenths !== null;
    this.text.setVisible(visible);
    this.track.setVisible(visible);
    this.fill.setVisible(visible);
    if (tenths === null) return;

    this.text.setText(`Boss: ${(tenths / 10).toFixed(1)} s`);
    this.fill.scaleX = Math.min(1, tenths / 10 / BOSS_TIME_LIMIT_SECONDS);
  }
}
