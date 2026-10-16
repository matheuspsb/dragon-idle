import { Decimal } from '../../utils/Decimal';
import type { DecimalSource } from '../../utils/Decimal';

// Formulas from Kongregate's "The Math of Idle Games, Part I" (b = base cost,
// r = growth rate, k = current level, n = levels to buy, c = currency).

// b × r^k
export function nextCost(baseCost: DecimalSource, costGrowth: number, level: number): Decimal {
  return new Decimal(baseCost).mul(new Decimal(costGrowth).pow(level));
}

// Geometric series: b × r^k × (r^n − 1) / (r − 1)
export function bulkCost(
  baseCost: DecimalSource,
  costGrowth: number,
  level: number,
  count: number
): Decimal {
  if (count <= 0) return new Decimal(0);
  if (costGrowth === 1) return new Decimal(baseCost).mul(count);

  const rate = new Decimal(costGrowth);
  return nextCost(baseCost, costGrowth, level).mul(rate.pow(count).sub(1)).div(rate.sub(1));
}

// floor(log_r(c × (r − 1) / (b × r^k) + 1))
export function maxAffordable(
  baseCost: DecimalSource,
  costGrowth: number,
  level: number,
  currency: DecimalSource
): number {
  const budget = new Decimal(currency);
  if (budget.lte(0)) return 0;

  let count: number;
  if (costGrowth === 1) {
    count = budget.div(baseCost).floor().toNumber();
  } else {
    count = budget
      .mul(costGrowth - 1)
      .div(nextCost(baseCost, costGrowth, level))
      .add(1)
      .log(costGrowth)
      .floor()
      .toNumber();
  }

  // The closed form goes through floating-point logs, so it can land one off
  // right at the boundary; settle against the exact bulk cost.
  count = Math.max(0, count);
  while (count > 0 && bulkCost(baseCost, costGrowth, level, count).gt(budget)) count -= 1;
  while (bulkCost(baseCost, costGrowth, level, count + 1).lte(budget)) count += 1;
  return count;
}
