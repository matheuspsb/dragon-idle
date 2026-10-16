import { getKnightDamage } from './levelDamage';
import type { KnightsState } from '../state/KnightsState';
import type { CombatState } from '../state/CombatState';
import { resolveAutoHit, type CombatEvent } from './combatSystem';

export function tickAutoDps(
  knightsState: KnightsState,
  combatState: CombatState,
  deltaSeconds: number
): CombatEvent[] {
  const events: CombatEvent[] = [];
  if (!Number.isFinite(deltaSeconds) || deltaSeconds < 0) return events;

  for (const knight of knightsState.knights) {
    knight.timeSinceLastAttack += deltaSeconds;
    while (knight.timeSinceLastAttack >= knight.attackIntervalSeconds) {
      knight.timeSinceLastAttack -= knight.attackIntervalSeconds;
      events.push(resolveAutoHit(combatState, getKnightDamage(knight)));
    }
  }

  return events;
}
