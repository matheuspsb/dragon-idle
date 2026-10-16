/**
 * @regression-protected
 * NUNCA remover, enfraquecer ou pular este teste.
 * Bug: createKnight aceitava attackIntervalSeconds ≤ 0 (ou não finito); no
 * primeiro tick, o loop de ataques nunca terminava e o jogo travava.
 */
import { describe, expect, it } from 'vitest';
import { createKnight } from '../../src/core/entities/Knight';

describe('createKnight requires a positive, finite attack interval', () => {
  it.each([0, -1, NaN, Infinity])('rejects attackIntervalSeconds = %s', (interval) => {
    expect(() => createKnight({ damagePerHit: 1, attackIntervalSeconds: interval })).toThrow(
      RangeError
    );
  });

  it('accepts a positive interval', () => {
    expect(() => createKnight({ damagePerHit: 1, attackIntervalSeconds: 0.25 })).not.toThrow();
  });
});
