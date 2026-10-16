import type Phaser from 'phaser';
import type { Decimal } from '../utils/Decimal';
import { formatNumber } from '../utils/format';
import { addGoldPlaceholder } from './placeholders';
import { placeholders, spacing, textStyles } from './tokens';

export class GoldCounter {
  private readonly text: Phaser.GameObjects.Text;
  private shownGold?: Decimal;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    addGoldPlaceholder(scene, x, y);
    this.text = scene.add
      .text(x + placeholders.gold.radius + spacing.goldIconGap, y, '', textStyles.gold)
      .setOrigin(0, 0.5);
  }

  render(gold: Decimal): void {
    if (gold === this.shownGold) return;
    this.shownGold = gold;
    this.text.setText(formatNumber(gold));
  }
}
