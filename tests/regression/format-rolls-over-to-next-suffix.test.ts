/**
 * @regression-protected
 * NUNCA remover, enfraquecer ou pular este teste.
 * Bug: valores logo abaixo de uma potência de 1000 arredondavam a mantissa para
 * 1000 sem trocar de sufixo (ex: 999999.6 virava "1000.00K"; 999.6 virava "1000").
 */
import { describe, expect, it } from 'vitest';
import { Decimal } from '../../src/utils/Decimal';
import { formatNumber } from '../../src/utils/format';

describe('formatNumber rolls over to the next suffix', () => {
  it.each([
    ['999.6', '1.00K'],
    ['999999.6', '1.00M'],
    ['999995', '1.00M'],
    ['999994', '999.99K'],
    ['999999999.7', '1.00B'],
  ])('%s is shown as %s', (value, expected) => {
    expect(formatNumber(new Decimal(value))).toBe(expected);
  });

  it('keeps values that round to at most 999 as plain integers', () => {
    expect(formatNumber(999.4)).toBe('999');
  });
});
