import type { Stage } from '../entities/Stage';

// progressing: monsters lead to a timed boss. farming: the boss was failed, so
// monsters keep coming for gold until the player challenges the boss again.
export type CombatMode = 'progressing' | 'farming';

export interface CombatState {
  stage: Stage;
  mode: CombatMode;
  bossTimeLeftSeconds: number | null;
}
