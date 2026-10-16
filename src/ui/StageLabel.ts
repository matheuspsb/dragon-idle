import type Phaser from 'phaser';
import type { Stage } from '../core/entities/Stage';
import { textStyles } from './tokens';

export class StageLabel {
  private readonly text: Phaser.GameObjects.Text;
  private shownStage = -1;
  private shownIndex = -1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.text = scene.add.text(x, y, '', textStyles.hud).setOrigin(0.5);
  }

  render(stage: Stage): void {
    if (stage.stageNumber === this.shownStage && stage.currentEnemyIndex === this.shownIndex) {
      return;
    }
    this.shownStage = stage.stageNumber;
    this.shownIndex = stage.currentEnemyIndex;
    const position = `${stage.currentEnemyIndex + 1}/${stage.enemies.length}`;
    this.text.setText(`Estágio ${stage.stageNumber} · inimigo ${position}`);
  }
}
