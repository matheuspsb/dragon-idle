import { getCurrentEnemy } from '../core/entities/Stage';
import { advanceGameSession, type GameSession } from '../core/systems/gameSession';
import type { EnemyKind } from '../core/entities/Enemy';
import type { CombatMode } from '../core/state/CombatState';
import { addGold } from '../core/state/WalletState';

export interface SessionSnapshot {
  stage: number;
  enemyIndex: number;
  enemyKind: EnemyKind;
  mode: CombatMode;
  bossTimeLeftSeconds: number | null;
  enemyHp: number;
  enemyMaxHp: number;
  gold: number;
  clickLevel: number;
  knightLevels: number[];
}

export interface DevHook {
  snapshot(): SessionSnapshot;
  grantGold(amount: number): void;
  skipTime(seconds: number): void;
}

export const DEV_HOOK_KEY = '__DRAGON_IDLE__';

// Window into the running session so e2e tests (and the developer) can read
// game state, grant gold and skip time without waiting. Only installed in dev builds.
export function installDevHook(session: GameSession): void {
  if (!import.meta.env.DEV) return;

  const hook: DevHook = {
    snapshot() {
      const enemy = getCurrentEnemy(session.combat.stage);
      return {
        stage: session.combat.stage.stageNumber,
        enemyIndex: session.combat.stage.currentEnemyIndex,
        enemyKind: enemy.kind,
        mode: session.combat.mode,
        bossTimeLeftSeconds: session.combat.bossTimeLeftSeconds,
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
    skipTime(seconds) {
      // 1 s frames keep each advance under the per-frame step cap.
      for (let elapsed = 0; elapsed < seconds; elapsed++) advanceGameSession(session, 1);
    },
  };
  Object.assign(window, { [DEV_HOOK_KEY]: hook });
}
