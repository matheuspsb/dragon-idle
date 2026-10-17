import Phaser from 'phaser';
import { getCurrentEnemy } from '../core/entities/Stage';
import {
  advanceGameSession,
  clickGameSession,
  createGameSession,
  type GameSession,
} from '../core/systems/gameSession';
import { EnemyView } from '../entities/EnemyView';
import { FloatingDamageNumbers } from '../entities/FloatingDamageNumbers';
import { KnightsView } from '../entities/KnightsView';
import { GoldCounter } from '../ui/GoldCounter';
import { StageLabel } from '../ui/StageLabel';
import { layout } from '../ui/tokens';
import { installDevHook } from '../debug/devHook';

export class GameScene extends Phaser.Scene {
  private session!: GameSession;
  private stageLabel!: StageLabel;
  private enemyView!: EnemyView;
  private knightsView!: KnightsView;
  private goldCounter!: GoldCounter;
  private damageNumbers!: FloatingDamageNumbers;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.session = createGameSession({ rng: Math.random });
    this.stageLabel = new StageLabel(this, layout.stageLabel.x, layout.stageLabel.y);
    this.enemyView = new EnemyView(this, layout.enemy.x, layout.enemy.y);
    this.knightsView = new KnightsView(this, layout.knights.x, layout.knights.y);
    this.goldCounter = new GoldCounter(this, layout.gold.x, layout.gold.y);
    this.damageNumbers = new FloatingDamageNumbers(this);
    this.enemyView.onClick(() => this.handleEnemyClick());
    installDevHook(this.session);
    this.renderSession();
  }

  update(_time: number, deltaMs: number): void {
    advanceGameSession(this.session, deltaMs / 1000);
    this.renderSession();
  }

  private handleEnemyClick(): void {
    const event = clickGameSession(this.session);
    this.damageNumbers.show(layout.enemy.x, layout.enemy.y, event.damageDealt, event.outcome);
    this.renderSession();
  }

  private renderSession(): void {
    const { combat, knights, wallet } = this.session;
    this.stageLabel.render(combat.stage);
    this.enemyView.render(getCurrentEnemy(combat.stage));
    this.knightsView.render(knights.knights);
    this.goldCounter.render(wallet.gold);
  }
}
