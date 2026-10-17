import { expect, test, type Page } from '@playwright/test';
import { DEV_HOOK_KEY, type DevHook, type SessionSnapshot } from '../../src/debug/devHook';
import { layout } from '../../src/ui/tokens';

async function snapshot(page: Page): Promise<SessionSnapshot> {
  return page.evaluate(
    (key) => (window as unknown as Record<string, DevHook>)[key].snapshot(),
    DEV_HOOK_KEY
  );
}

test('knights damage the current enemy as time passes', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction((key) => key in window, DEV_HOOK_KEY);

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

async function clickCanvas(page: Page, x: number, y: number): Promise<void> {
  for (let i = 0; i < CLICKS; i++) await page.locator('canvas').click({ position: { x, y } });
}

test('clicking the enemy damages it right away', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction((key) => key in window, DEV_HOOK_KEY);
  const before = await snapshot(page);

  await clickCanvas(page, layout.enemy.x, layout.enemy.y);

  const after = await snapshot(page);
  expect(before.enemyHp - after.enemyHp).toBeGreaterThanOrEqual(CLICKS);
});

test('clicking outside the enemy does not damage it', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction((key) => key in window, DEV_HOOK_KEY);
  const before = await snapshot(page);

  await clickCanvas(page, 20, 20);

  const after = await snapshot(page);
  expect(before.enemyHp - after.enemyHp).toBeLessThanOrEqual(1);
});
