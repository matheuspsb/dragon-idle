import type Phaser from 'phaser';
import { buttonSizes, colors, textStyles, toColorNumber } from './tokens';

export class Button {
  private readonly background: Phaser.GameObjects.Rectangle;
  private readonly text: Phaser.GameObjects.Text;
  private shownLabel = '';
  private enabled = true;
  private selected = false;
  private hovered = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    size: { width: number; height: number },
    onPress: () => void
  ) {
    this.background = scene.add
      .rectangle(x, y, size.width, size.height, toColorNumber(colors.buttonFill))
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        if (this.enabled) onPress();
      })
      .on('pointerover', () => this.setHovered(true))
      .on('pointerout', () => this.setHovered(false));
    this.text = scene.add.text(x, y, '', textStyles.button).setOrigin(0.5);
  }

  setLabel(label: string): void {
    if (label === this.shownLabel) return;
    this.shownLabel = label;
    this.text.setText(label);
  }

  setEnabled(enabled: boolean): void {
    if (enabled === this.enabled) return;
    this.enabled = enabled;
    this.text.setStyle(enabled ? textStyles.button : textStyles.buttonDisabled);
    this.applyFill();
  }

  setSelected(selected: boolean): void {
    if (selected === this.selected) return;
    this.selected = selected;
    if (selected) {
      this.background.setStrokeStyle(
        buttonSizes.selectedBorder,
        toColorNumber(colors.buttonBorderSelected)
      );
    } else {
      this.background.setStrokeStyle();
    }
  }

  private setHovered(hovered: boolean): void {
    this.hovered = hovered;
    this.applyFill();
  }

  private applyFill(): void {
    const fill = !this.enabled
      ? colors.buttonFillDisabled
      : this.hovered
        ? colors.buttonFillHover
        : colors.buttonFill;
    this.background.setFillStyle(toColorNumber(fill));
  }
}
