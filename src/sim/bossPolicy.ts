import type { Decimal } from '../utils/Decimal';

// A sensible player only retries the boss once their expected damage over the
// time limit can cover its HP; otherwise they keep farming for upgrades.
export function shouldChallengeBoss(
  expectedDps: Decimal,
  bossHp: Decimal,
  timeLimitSeconds: number
): boolean {
  return expectedDps.gt(0) && expectedDps.mul(timeLimitSeconds).gte(bossHp);
}
