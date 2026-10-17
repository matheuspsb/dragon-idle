import { getCurrentEnemy } from '../core/entities/Stage';
import type { GameSession } from '../core/systems/gameSession';
import { addGold } from '../core/state/WalletState';

export interface SessionSnapshot {
  stage: number;
  enemyIndex: number;
  enemyHp: number;
  enemyMaxHp: number;
  gold: number;
  clickLevel: number;
  knightLevels: number[];
}

export interface DevHook {
  snapshot(): SessionSnapshot;
  grantGold(amount: number): void;
}

export const DEV_HOOK_KEY = '__DRAGON_IDLE__';

// Window into the running session so e2e tests (and the developer) can read
// game state and grant gold without farming. Only installed in dev builds.
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
        clickLevel: session.click.level,
        knightLevels: session.knights.knights.map((knight) => knight.level),
      };
    },
    grantGold(amount) {
      addGold(session.wallet, amount);
    },
  };
  Object.assign(window, { [DEV_HOOK_KEY]: hook });
}
