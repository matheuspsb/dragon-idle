import { expect, test, type Page } from '@playwright/test';
import { layout } from '../../src/ui/tokens';
import { clickCanvas, openGame, snapshot } from './support/devHook';

test.beforeEach(async ({ page }) => {
  await openGame(page);
});

test('knights damage the current enemy as time passes', async ({ page }) => {
  const start = await snapshot(page);
  expect(start).toMatchObject({ stage: 1, enemyIndex: 0, gold: 0 });
  expect(start.enemyHp).toBe(start.enemyMaxHp);

  await expect
    .poll(async () => (await snapshot(page)).enemyHp, { timeout: 5_000 })
    .toBeLessThan(start.enemyMaxHp);
});

// Knights also deal 1 damage per second, so the click tests use several quick
// clicks: at most one knight hit can land in that short window.
const CLICKS = 5;

async function clickRepeatedly(page: Page, at: { x: number; y: number }): Promise<void> {
  for (let i = 0; i < CLICKS; i++) await clickCanvas(page, at);
}

test('clicking the enemy damages it right away', async ({ page }) => {
  const before = await snapshot(page);

  await clickRepeatedly(page, layout.enemy);

  const after = await snapshot(page);
  expect(before.enemyHp - after.enemyHp).toBeGreaterThanOrEqual(CLICKS);
});

test('clicking outside the enemy does not damage it', async ({ page }) => {
  const before = await snapshot(page);

  await clickRepeatedly(page, { x: 20, y: 20 });

  const after = await snapshot(page);
  expect(before.enemyHp - after.enemyHp).toBeLessThanOrEqual(1);
});
