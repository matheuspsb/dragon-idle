import { buttonSizes, layout, spacing } from '../../../src/ui/tokens';

const panel = layout.upgradePanel;

export const clickUpgradeRow = { x: panel.x, y: panel.y + spacing.upgradeRowGap };
export const knightUpgradeRow = { x: panel.x, y: panel.y + 2 * spacing.upgradeRowGap };
export const maxModeButton = {
  x: panel.x + buttonSizes.mode.width + spacing.modeButtonGap,
  y: panel.y,
};
