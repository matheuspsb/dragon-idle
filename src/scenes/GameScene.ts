import Phaser from 'phaser';
import { Decimal } from '../utils/Decimal';
import { formatNumber } from '../utils/format';

// Demo values to exercise break_eternity across many magnitudes
const DEMO_VALUES = [
  { label: 'Boss HP', value: new Decimal('1.5e6'), color: '#cc2222' },
  { label: 'Damage', value: new Decimal('3.72e15'), color: '#ffffff' },
  { label: 'Gold', value: new Decimal('9.99e33'), color: '#ffcc00' },
  { label: 'Prestige', value: new Decimal('1e100'), color: '#aaaaff' },
  { label: 'Infinity', value: new Decimal('1e1000'), color: '#ff88ff' },
];

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    const { width } = this.scale;
    const cx = width / 2;

    this.add
      .text(cx, 40, 'Dragon Idle', { fontSize: '36px', color: '#ffffff', fontStyle: 'bold' })
      .setOrigin(0.5);

    this.add
      .text(cx, 80, 'break_eternity demo', { fontSize: '16px', color: '#888888' })
      .setOrigin(0.5);

    // Boss placeholder (vermelho)
    this.add.rectangle(cx, 160, 200, 80, 0xcc2222);

    // Cavaleiro placeholder (azul)
    this.add.rectangle(cx - 120, 280, 40, 60, 0x2255cc);
    this.add.rectangle(cx, 280, 40, 60, 0x2255cc);
    this.add.rectangle(cx + 120, 280, 40, 60, 0x2255cc);

    // Ouro placeholder (círculo amarelo)
    this.add.circle(cx + 200, 160, 20, 0xffcc00);

    // Tabela de números
    DEMO_VALUES.forEach(({ label, value, color }, i) => {
      const y = 370 + i * 36;
      this.add.text(cx - 160, y, label, { fontSize: '18px', color: '#aaaaaa' });
      this.add.text(cx + 160, y, formatNumber(value), { fontSize: '18px', color }).setOrigin(
        1,
        0
      );
    });
  }
}
