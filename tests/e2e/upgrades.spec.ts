import { expect, test } from '@playwright/test';
import { clickCanvas, grantGold, openGame, snapshot } from './support/devHook';
import {
  clickUpgradeRow as clickRow,
  knightUpgradeRow as knightRow,
  maxModeButton,
} from './support/ui';

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
