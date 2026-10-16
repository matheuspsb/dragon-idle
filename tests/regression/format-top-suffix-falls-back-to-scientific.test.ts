/**
 * @regression-protected
 * NUNCA remover, enfraquecer ou pular este teste.
 * Bug: no último sufixo a mantissa estourava e 9.999999999e32 saía "1000.00No"
 * em vez de cair na notação científica. Também protege o caso que o commit
 * f6df789 tratou: o índice do sufixo nunca pode passar do fim da lista.
 */
import { describe, expect, it } from 'vitest';
import { Decimal } from '../../src/utils/Decimal';
import { formatNumber } from '../../src/utils/format';

describe('formatNumber at the top of the suffix range', () => {
  it('shows a value that rounds up to 1e33 the same way as 1e33', () => {
    expect(formatNumber(new Decimal('9.999999999e32'))).toBe(formatNumber(new Decimal('1e33')));
  });

  it.each([
    ['9.9999e99', '1e100'],
    ['9.9999e999', '1e1000'],
  ])('carries scientific-notation rounding into the exponent (%s → %s)', (value, expected) => {
    expect(formatNumber(new Decimal(value))).toBe(expected);
  });

  it('still uses the last suffix when the mantissa fits', () => {
    expect(formatNumber(new Decimal('9.99994e32'))).toBe('999.99No');
  });

  it.each(['9.999999999e32', '1e33', '1e34'])('%s never shows an undefined suffix', (value) => {
    expect(formatNumber(new Decimal(value))).not.toMatch(/undefined/);
  });
});
