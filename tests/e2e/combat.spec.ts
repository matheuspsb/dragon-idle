import { expect, test, type Page } from '@playwright/test';
import { layout } from '../../src/ui/tokens';
import { clickCanvas, grantGold, openGame, snapshot } from './support/devHook';
import { clickUpgradeRow, maxModeButton } from './support/ui';

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

// Knights also deal 1 damage per second, so the click tests use several clicks
// and only assert in the direction knights can't fake.
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
  // Make a click lethal (≈24 damage vs 20 HP) so a stray hit can't hide among
  // the knight's 1-damage hits; then allow only what the knight does meanwhile.
  await grantGold(page, 300);
  await clickCanvas(page, maxModeButton);
  await clickCanvas(page, clickUpgradeRow);
  const before = await snapshot(page);
  const startedAt = Date.now();

  await clickRepeatedly(page, { x: 20, y: 20 });

  const after = await snapshot(page);
  const knightHits = Math.floor((Date.now() - startedAt) / 1000) + 1;
  expect(after.enemyIndex).toBe(before.enemyIndex);
  expect(before.enemyHp - after.enemyHp).toBeLessThanOrEqual(knightHits);
});
