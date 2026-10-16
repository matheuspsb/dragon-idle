import { describe, expect, it } from 'vitest';
import { toColorNumber } from '../../../src/ui/tokens';

describe('toColorNumber', () => {
  it('converts a #rrggbb token into the number Phaser shapes expect', () => {
    expect(toColorNumber('#cc2222')).toBe(0xcc2222);
    expect(toColorNumber('#FFCC00')).toBe(0xffcc00);
  });

  it.each(['cc2222', '#fff', '#gggggg', ''])('rejects a malformed color %j', (hex) => {
    expect(() => toColorNumber(hex)).toThrow(RangeError);
  });
});
