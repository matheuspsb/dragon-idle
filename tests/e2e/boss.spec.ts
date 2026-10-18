import { expect, test, type Page } from '@playwright/test';
import { BOSS_TIME_LIMIT_SECONDS, MONSTERS_PER_STAGE } from '../../src/config/stageConfig';
import { layout } from '../../src/ui/tokens';
import { clickCanvas, grantGold, openGame, skipTime, snapshot } from './support/devHook';
import { clickUpgradeRow, maxModeButton } from './support/ui';

// Enough click damage (~112, past the level-25 milestone) to one-shot each
// monster (60 HP) but not the boss (480 HP).
async function reachBoss(page: Page): Promise<void> {
  await grantGold(page, 400);
  await clickCanvas(page, maxModeButton);
  await clickCanvas(page, clickUpgradeRow);
  for (let i = 0; i < MONSTERS_PER_STAGE; i++) await clickCanvas(page, layout.enemy);
}

test.beforeEach(async ({ page }) => {
  await openGame(page);
});

test('reaching the boss starts its timer', async ({ page }) => {
  await reachBoss(page);

  const state = await snapshot(page);
  expect(state.enemyKind).toBe('boss');
  expect(state.bossTimeLeftSeconds).toBeGreaterThan(BOSS_TIME_LIMIT_SECONDS - 5);
});

test('running out of time switches to farming, and the button brings the boss back', async ({
  page,
}) => {
  await reachBoss(page);

  await skipTime(page, BOSS_TIME_LIMIT_SECONDS + 1);
  const farming = await snapshot(page);
  expect(farming).toMatchObject({ mode: 'farming', enemyKind: 'monster', stage: 1 });

  await clickCanvas(page, layout.challengeButton);
  const challenged = await snapshot(page);
  expect(challenged).toMatchObject({ mode: 'progressing', enemyKind: 'boss' });
  expect(challenged.bossTimeLeftSeconds).toBeGreaterThan(BOSS_TIME_LIMIT_SECONDS - 1);
});

test('the challenge button does nothing while not farming', async ({ page }) => {
  await clickCanvas(page, layout.challengeButton);

  expect(await snapshot(page)).toMatchObject({ mode: 'progressing', enemyKind: 'monster' });
});
