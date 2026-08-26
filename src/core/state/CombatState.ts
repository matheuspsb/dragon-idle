import type { Stage } from '../entities/Stage';
import { createStage } from '../systems/stageGenerator';

export interface CombatState {
  stage: Stage;
}

export function createCombatState(startingStageNumber = 1): CombatState {
  return { stage: createStage(startingStageNumber) };
}
