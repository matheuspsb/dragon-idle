import type Phaser from 'phaser';
import type { Knight } from '../core/entities/Knight';
import { addKnightPlaceholder } from '../ui/placeholders';
import { spacing } from '../ui/tokens';

export class KnightsView {
  private readonly sprites: Phaser.GameObjects.Rectangle[] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly centerX: number,
    private readonly y: number
  ) {}

  render(knights: readonly Knight[]): void {
    if (knights.length === this.sprites.length) return;

    for (const sprite of this.sprites) sprite.destroy();
    this.sprites.length = 0;

    const firstX = this.centerX - ((knights.length - 1) * spacing.knightGap) / 2;
    knights.forEach((_, i) => {
      this.sprites.push(addKnightPlaceholder(this.scene, firstX + i * spacing.knightGap, this.y));
    });
  }
}
