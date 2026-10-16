import { expect, test, type Page } from '@playwright/test';
import { DEV_HOOK_KEY, type DevHook, type SessionSnapshot } from '../../src/debug/devHook';

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
