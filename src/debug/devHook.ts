import { getCurrentEnemy } from '../core/entities/Stage';
import type { GameSession } from '../core/systems/gameSession';

export interface SessionSnapshot {
  stage: number;
  enemyIndex: number;
  enemyHp: number;
  enemyMaxHp: number;
  gold: number;
}

export interface DevHook {
  snapshot(): SessionSnapshot;
}

export const DEV_HOOK_KEY = '__DRAGON_IDLE__';

// Read-only window into the running session so e2e tests can assert on game
// state instead of canvas pixels. Only installed in dev builds.
export function installDevHook(session: GameSession): void {
  if (!import.meta.env.DEV) return;

  const hook: DevHook = {
    snapshot() {
      const enemy = getCurrentEnemy(session.combat.stage);
      return {
        stage: session.combat.stage.stageNumber,
        enemyIndex: session.combat.stage.currentEnemyIndex,
        enemyHp: enemy.hp.toNumber(),
        enemyMaxHp: enemy.maxHp.toNumber(),
        gold: session.wallet.gold.toNumber(),
      };
    },
  };
  Object.assign(window, { [DEV_HOOK_KEY]: hook });
}
