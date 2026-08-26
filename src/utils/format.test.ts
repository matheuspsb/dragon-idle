import { describe, expect, it } from 'vitest';
import { Decimal } from './Decimal';
import { formatNumber } from './format';

describe('formatNumber', () => {
  it('renders plain integers under 1000 with no suffix', () => {
    expect(formatNumber(999)).toBe('999');
    expect(formatNumber(0)).toBe('0');
  });

  it('renders normal suffix formatting', () => {
    expect(formatNumber(1500)).toBe('1.50K');
    expect(formatNumber(new Decimal('3.72e15'))).toBe('3.72Qa');
  });

  it('rolls over to the next suffix instead of overflowing the mantissa', () => {
    expect(formatNumber(new Decimal(999999.6))).toBe('1.00M');
  });

  it('delegates negative values to the positive formatter', () => {
    expect(formatNumber(-1500)).toBe('-1.50K');
  });

  it('falls back to scientific notation beyond 1e33', () => {
    expect(formatNumber(new Decimal('1e100'))).toBe('1e100');
    expect(formatNumber(new Decimal('1e1000'))).toBe('1e1000');
  });

  it('does not produce an undefined suffix at the top of the suffix range', () => {
    expect(formatNumber(new Decimal('9.999999999e32'))).not.toMatch(/undefined/);
  });
});
