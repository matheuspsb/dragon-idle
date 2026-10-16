import { Decimal } from './Decimal';
import type { DecimalSource } from './Decimal';

const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No'];

export function formatNumber(value: DecimalSource): string {
  const decimal = new Decimal(value);

  if (decimal.lt(0)) return `-${formatNumber(decimal.neg())}`;
  if (decimal.lt(999.5)) return decimal.toFixed(0);

  const maxExp = SUFFIXES.length - 1;

  if (decimal.lt('1e' + (maxExp + 1) * 3)) {
    let exp = Math.max(1, Math.floor(decimal.log10().toNumber() / 3));
    let mantissa = decimal.div(new Decimal(10).pow(exp * 3));

    if (mantissa.gte(999.995)) {
      exp += 1;
      mantissa = decimal.div(new Decimal(10).pow(exp * 3));
    }

    if (exp <= maxExp) {
      return `${mantissa.toFixed(2)}${SUFFIXES[exp]}`;
    }
  }

  // Scientific notation for truly huge numbers
  return toScientific(decimal);
}

function toScientific(decimal: Decimal): string {
  // break_eternity's toExponential doesn't carry the rounding into the exponent
  // (9.999999999e32 → "10e32"), so round up to the next power of ten ourselves.
  const exponent = decimal.log10().floor();
  const mantissa = decimal.div(new Decimal(10).pow(exponent));
  const rounded = mantissa.gte(9.995) ? new Decimal(10).pow(exponent.add(1)) : decimal;
  return rounded.toExponential(2);
}
