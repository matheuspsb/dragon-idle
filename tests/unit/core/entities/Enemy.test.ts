import { describe, expect, it } from 'vitest';
import { Decimal, type DecimalSource } from '../../../../src/utils/Decimal';
import { createEnemy, getHpRatio, isEnemyDefeated } from '../../../../src/core/entities/Enemy';

describe('Enemy', () => {
  it('is not defeated above 0 hp', () => {
    const enemy = createEnemy({ kind: 'monster', hp: 50, goldReward: 1 });
    expect(isEnemyDefeated(enemy)).toBe(false);
  });

  it('is defeated at exactly 0 hp', () => {
    const enemy = createEnemy({ kind: 'monster', hp: 0, goldReward: 1 });
    expect(isEnemyDefeated(enemy)).toBe(true);
  });

  it('is defeated below 0 hp', () => {
    const enemy = createEnemy({ kind: 'monster', hp: -5, goldReward: 1 });
    expect(isEnemyDefeated(enemy)).toBe(true);
  });
});

describe('getHpRatio', () => {
  function enemyAt(hp: DecimalSource, maxHp: DecimalSource) {
    const enemy = createEnemy({ kind: 'monster', hp: maxHp, goldReward: 1 });
    enemy.hp = new Decimal(hp);
    return enemy;
  }

  it('is 1 at full health and 0 when defeated', () => {
    expect(getHpRatio(enemyAt(50, 50))).toBe(1);
    expect(getHpRatio(enemyAt(0, 50))).toBe(0);
  });

  it('is the fraction of health left', () => {
    expect(getHpRatio(enemyAt(15, 60))).toBeCloseTo(0.25);
  });

  it('works with values far beyond float range', () => {
    expect(getHpRatio(enemyAt('1e500', '4e500'))).toBeCloseTo(0.25);
  });

  it('is 0 for an enemy with no max health instead of NaN', () => {
    expect(getHpRatio(enemyAt(0, 0))).toBe(0);
  });
});
