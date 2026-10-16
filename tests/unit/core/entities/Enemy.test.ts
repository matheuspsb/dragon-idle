import { describe, expect, it } from 'vitest';
import { createEnemy, isEnemyDefeated } from '../../../../src/core/entities/Enemy';

describe('Enemy', () => {
  it('starts at full hp equal to maxHp', () => {
    const enemy = createEnemy({ kind: 'monster', hp: 50, goldReward: 1 });
    expect(enemy.hp.toString()).toBe(enemy.maxHp.toString());
  });

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
