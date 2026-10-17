import type { Page } from '@playwright/test';
import { DEV_HOOK_KEY, type DevHook, type SessionSnapshot } from '../../../src/debug/devHook';

export async function openGame(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForFunction((key) => key in window, DEV_HOOK_KEY);
}

export function snapshot(page: Page): Promise<SessionSnapshot> {
  return page.evaluate(
    (key) => (window as unknown as Record<string, DevHook>)[key].snapshot(),
    DEV_HOOK_KEY
  );
}

export function grantGold(page: Page, amount: number): Promise<void> {
  return page.evaluate(
    ([key, value]) => (window as unknown as Record<string, DevHook>)[key].grantGold(value),
    [DEV_HOOK_KEY, amount] as const
  );
}

export async function clickCanvas(page: Page, at: { x: number; y: number }): Promise<void> {
  await page.locator('canvas').click({ position: at });
}

export function skipTime(page: Page, seconds: number): Promise<void> {
  return page.evaluate(
    ([key, value]) => (window as unknown as Record<string, DevHook>)[key].skipTime(value),
    [DEV_HOOK_KEY, seconds] as const
  );
}
