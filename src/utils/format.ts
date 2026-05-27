import { Decimal } from './Decimal';
import type { DecimalSource } from './Decimal';

const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No'];

export function formatNumber(value: DecimalSource): string {
  const decimal = new Decimal(value);

  if (decimal.lt(0)) return `-${formatNumber(decimal.neg())}`;
  if (decimal.lt(1000)) return decimal.toFixed(0);

  // Use suffixes up to 1e33
  if (decimal.lt('1e' + (SUFFIXES.length * 3))) {
    const exp = Math.floor(decimal.log10().toNumber() / 3);
    const suffix = SUFFIXES[exp];
    const mantissa = decimal.div(new Decimal(10).pow(exp * 3));
    return `${mantissa.toFixed(2)}${suffix}`;
  }

  // Scientific notation for truly huge numbers
  return decimal.toExponential(2);
}
