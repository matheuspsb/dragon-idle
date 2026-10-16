import Phaser from 'phaser';
import { Decimal } from '../utils/Decimal';
import { formatNumber } from '../utils/format';
import { colors, spacing, textStyles } from '../ui/tokens';
import { addBossPlaceholder, addGoldPlaceholder, addKnightPlaceholder } from '../ui/placeholders';

// Demo values to exercise break_eternity across many magnitudes
const DEMO_VALUES = [
  { label: 'Boss HP', value: new Decimal('1.5e6'), color: colors.boss },
  { label: 'Damage', value: new Decimal('3.72e15'), color: colors.damageNormal },
  { label: 'Gold', value: new Decimal('9.99e33'), color: colors.gold },
  { label: 'Prestige', value: new Decimal('1e100'), color: colors.prestige },
  { label: 'Infinity', value: new Decimal('1e1000'), color: colors.infinity },
];

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    const { width } = this.scale;
    const cx = width / 2;

    this.add.text(cx, 40, 'Dragon Idle', textStyles.title).setOrigin(0.5);

    this.add
      .text(cx, 80, 'break_eternity demo', textStyles.subtitle)
      .setOrigin(0.5)
      .setResolution(2);

    addBossPlaceholder(this, cx, 160);

    addKnightPlaceholder(this, cx - spacing.knightGap, 280);
    addKnightPlaceholder(this, cx, 280);
    addKnightPlaceholder(this, cx + spacing.knightGap, 280);

    addGoldPlaceholder(this, cx + 200, 160);

    DEMO_VALUES.forEach(({ label, value, color }, i) => {
      const y = 370 + i * spacing.tableRowHeight;
      this.add.text(cx - 160, y, label, textStyles.label);
      this.add
        .text(cx + 160, y, formatNumber(value), { ...textStyles.value, color })
        .setOrigin(1, 0);
    });
  }
}
