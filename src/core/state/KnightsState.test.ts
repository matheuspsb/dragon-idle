import { describe, expect, it } from 'vitest';
import { STARTING_KNIGHTS } from '../../data/knightConfig';
import { getKnightDamage } from '../entities/Knight';
import { createKnightsState } from './KnightsState';

describe('createKnightsState', () => {
  it('seeds one knight per entry in STARTING_KNIGHTS', () => {
    const state = createKnightsState();
    expect(state.knights).toHaveLength(STARTING_KNIGHTS.length);
  });

  it('matches the configured damage and attack interval', () => {
    const state = createKnightsState();
    const [knight] = state.knights;
    const [config] = STARTING_KNIGHTS;
    expect(getKnightDamage(knight).toString()).toBe(String(config.damagePerHit));
    expect(knight.attackIntervalSeconds).toBe(config.attackIntervalSeconds);
  });
});
