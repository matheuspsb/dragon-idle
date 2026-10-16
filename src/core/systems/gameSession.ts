import { createCombatState } from './combatSystem';
import { tickAutoDps } from './autoDpsSystem';
import { collectGold } from './goldSystem';
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
  readonly step: (stepSeconds: number) => void;
}

export function createGameSession(): GameSession {
  const combat = createCombatState(1);
  const knights = createKnightsState();
  const wallet = createWalletState();

  // Built once so advancing a frame doesn't allocate a new callback.
  const step = (stepSeconds: number): void => {
    collectGold(wallet, tickAutoDps(knights, combat, stepSeconds));
  };

  return {
    combat,
    knights,
    click: createClickState(),
    wallet,
    ticker: createFixedStepTicker(LOGIC_STEP_SECONDS, MAX_LOGIC_STEPS_PER_FRAME),
    step,
  };
}

export function advanceGameSession(session: GameSession, deltaSeconds: number): number {
  return advanceTicker(session.ticker, deltaSeconds, session.step);
}
