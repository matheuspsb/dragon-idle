import { expect, test } from '@playwright/test';
import { buttonSizes, layout, spacing } from '../../src/ui/tokens';
import { clickCanvas, grantGold, openGame, snapshot } from './support/devHook';

const panel = layout.upgradePanel;
const clickRow = { x: panel.x, y: panel.y + spacing.upgradeRowGap };
const knightRow = { x: panel.x, y: panel.y + 2 * spacing.upgradeRowGap };
const maxModeButton = { x: panel.x + buttonSizes.mode.width + spacing.modeButtonGap, y: panel.y };

test.beforeEach(async ({ page }) => {
  await openGame(page);
});

test('an upgrade cannot be bought without gold', async ({ page }) => {
  await clickCanvas(page, clickRow);

  expect((await snapshot(page)).clickLevel).toBe(1);
});

test('buying the click upgrade raises its level and spends gold', async ({ page }) => {
  await grantGold(page, 1000);

  await clickCanvas(page, clickRow);

  const after = await snapshot(page);
  expect(after.clickLevel).toBe(2);
  expect(after.gold).toBeLessThan(1000);
});

test('max mode buys as many knight levels as the gold allows', async ({ page }) => {
  await grantGold(page, 1000);

  await clickCanvas(page, maxModeButton);
  await clickCanvas(page, knightRow);

  const after = await snapshot(page);
  expect(after.knightLevels[0]).toBeGreaterThan(20);
  expect(after.gold).toBeLessThan(100);
});
