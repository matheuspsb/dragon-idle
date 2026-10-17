import type Phaser from 'phaser';
import { getCurrentEnemy } from '../core/entities/Stage';
import type { CombatMode, CombatState } from '../core/state/CombatState';
import { textStyles } from './tokens';

export class StageLabel {
  private readonly text: Phaser.GameObjects.Text;
  private shownStage = -1;
  private shownIndex = -1;
  private shownMode?: CombatMode;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.text = scene.add.text(x, y, '', textStyles.hud).setOrigin(0.5);
  }

  render(combat: CombatState): void {
    const { stage, mode } = combat;
    if (
      stage.stageNumber === this.shownStage &&
      stage.currentEnemyIndex === this.shownIndex &&
      mode === this.shownMode
    ) {
      return;
    }
    this.shownStage = stage.stageNumber;
    this.shownIndex = stage.currentEnemyIndex;
    this.shownMode = mode;
    this.text.setText(labelFor(combat));
  }
}

function labelFor(combat: CombatState): string {
  const { stage } = combat;
  if (combat.mode === 'farming') return `Estágio ${stage.stageNumber} · farmando`;
  if (getCurrentEnemy(stage).kind === 'boss') return `Estágio ${stage.stageNumber} · BOSS`;
  const monsters = stage.enemies.length - 1;
  return `Estágio ${stage.stageNumber} · monstro ${stage.currentEnemyIndex + 1}/${monsters}`;
}
