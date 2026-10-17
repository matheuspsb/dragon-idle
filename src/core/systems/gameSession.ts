import type { Rng } from '../../utils/random';
import { createCombatState, resolveHit, type CombatEvent } from './combatSystem';
import { tickAutoDps } from './autoDpsSystem';
import { collectGold } from './goldSystem';
import { challengeBoss, tickBossTimer } from './bossSystem';
import { getClickDamage } from './levelDamage';
import {
  buyWithMode,
  quotePurchase,
  type PurchaseMode,
  type PurchaseQuote,
  type PurchaseResult,
} from './upgradeSystem';
import type { Knight } from '../entities/Knight';
import type { CombatState } from '../state/CombatState';
import { createKnightsState, type KnightsState } from '../state/KnightsState';
import { createClickState, type ClickState } from '../state/ClickState';
import { createWalletState, type WalletState } from '../state/WalletState';
import {
  advanceTicker,
  createFixedStepTicker,
  type FixedStepTicker,
} from '../../systems/fixedStepTicker';
import { LOGIC_STEP_SECONDS, MAX_LOGIC_STEPS_PER_FRAME } from '../../config/loopConfig';

export interface GameSession {
  readonly combat: CombatState;
  readonly knights: KnightsState;
  readonly click: ClickState;
  readonly wallet: WalletState;
  readonly ticker: FixedStepTicker;
  readonly rng: Rng;
  readonly step: (stepSeconds: number) => void;
}

export interface GameSessionOptions {
  rng: Rng;
}

export function createGameSession(options: GameSessionOptions): GameSession {
  const combat = createCombatState(1);
  const knights = createKnightsState();
  const wallet = createWalletState();

  // Built once so advancing a frame doesn't allocate a new callback.
  const step = (stepSeconds: number): void => {
    collectGold(wallet, tickAutoDps(knights, combat, stepSeconds));
    tickBossTimer(combat, stepSeconds);
  };

  return {
    combat,
    knights,
    click: createClickState(),
    wallet,
    ticker: createFixedStepTicker(LOGIC_STEP_SECONDS, MAX_LOGIC_STEPS_PER_FRAME),
    rng: options.rng,
    step,
  };
}

export function advanceGameSession(session: GameSession, deltaSeconds: number): number {
  return advanceTicker(session.ticker, deltaSeconds, session.step);
}

export function clickGameSession(session: GameSession): CombatEvent {
  const event = resolveHit(session.combat, getClickDamage(session.click), session.rng);
  collectGold(session.wallet, [event]);
  return event;
}

export type UpgradeTarget = { kind: 'click' } | { kind: 'knight'; index: number };

export function resolveUpgradable(
  session: GameSession,
  target: UpgradeTarget
): ClickState | Knight {
  if (target.kind === 'click') return session.click;
  const knight = session.knights.knights[target.index];
  if (!Number.isInteger(target.index) || !knight) {
    throw new RangeError(`Unknown knight index: ${target.index}`);
  }
  return knight;
}

export function quoteUpgrade(
  session: GameSession,
  target: UpgradeTarget,
  mode: PurchaseMode
): PurchaseQuote {
  return quotePurchase(resolveUpgradable(session, target), mode, session.wallet.gold);
}

export function buyUpgrade(
  session: GameSession,
  target: UpgradeTarget,
  mode: PurchaseMode
): PurchaseResult {
  return buyWithMode(session.wallet, resolveUpgradable(session, target), mode);
}

export function challengeBossInSession(session: GameSession): boolean {
  return challengeBoss(session.combat);
}
