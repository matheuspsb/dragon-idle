import { Decimal } from './Decimal';
import type { DecimalSource } from './Decimal';

const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No'];

export function formatNumber(value: DecimalSource): string {
  const d = new Decimal(value);

  if (d.lt(0)) return `-${formatNumber(d.neg())}`;
  if (d.lt(1000)) return d.toFixed(0);

  // Use suffixes up to 1e33
  if (d.lt('1e' + (SUFFIXES.length * 3))) {
    const exp = Math.floor(d.log10().toNumber() / 3);
    const suffix = SUFFIXES[exp];
    const mantissa = d.div(new Decimal(10).pow(exp * 3));
    return `${mantissa.toFixed(2)}${suffix}`;
  }

  // Scientific notation for truly huge numbers
  return d.toExponential(2);
}
