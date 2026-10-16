import { expect, test } from '@playwright/test';

test('the game boots into a canvas without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('/');

  const canvas = page.locator('canvas');
  await expect(canvas).toHaveCount(1);
  await expect(canvas).toHaveAttribute('width', '800');
  await expect(canvas).toHaveAttribute('height', '600');
  expect(errors).toEqual([]);
});
