import { createKnight, type Knight } from '../entities/Knight';
import { STARTING_KNIGHTS } from '../../data/knightConfig';

export interface KnightsState {
  knights: Knight[];
}

export function createKnightsState(): KnightsState {
  return { knights: STARTING_KNIGHTS.map(createKnight) };
}
