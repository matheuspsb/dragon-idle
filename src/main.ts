import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';
import { colors } from './ui/tokens';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: colors.background,
  scene: [GameScene],
};

new Phaser.Game(config);
