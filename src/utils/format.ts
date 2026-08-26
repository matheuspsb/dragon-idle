import { Decimal } from './Decimal';
import type { DecimalSource } from './Decimal';

const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No'];

export function formatNumber(value: DecimalSource): string {
  const decimal = new Decimal(value);

  if (decimal.lt(0)) return `-${formatNumber(decimal.neg())}`;
  if (decimal.lt(1000)) return decimal.toFixed(0);

  const maxExp = SUFFIXES.length - 1;

  if (decimal.lt('1e' + (maxExp + 1) * 3)) {
    let exp = Math.floor(decimal.log10().toNumber() / 3);
    let mantissa = decimal.div(new Decimal(10).pow(exp * 3));

    if (mantissa.gte(999.995) && exp < maxExp) {
      exp += 1;
      mantissa = decimal.div(new Decimal(10).pow(exp * 3));
    }

    if (exp <= maxExp) {
      return `${mantissa.toFixed(2)}${SUFFIXES[exp]}`;
    }
  }

  // Scientific notation for truly huge numbers
  return decimal.toExponential(2);
}
