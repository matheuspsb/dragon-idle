import { describe, expect, it } from 'vitest';
import { MONSTERS_PER_STAGE } from '../../../../src/config/stageConfig';
import { createStage } from '../../../../src/core/systems/stageGenerator';

describe('createStage', () => {
  it('creates MONSTERS_PER_STAGE monsters plus one boss', () => {
    const stage = createStage(1);
    expect(stage.enemies).toHaveLength(MONSTERS_PER_STAGE + 1);
  });

  it('orders monsters first and the boss last', () => {
    const stage = createStage(1);
    const boss = stage.enemies[stage.enemies.length - 1];
    const monsters = stage.enemies.slice(0, -1);
    expect(boss.kind).toBe('boss');
    expect(monsters.every((enemy) => enemy.kind === 'monster')).toBe(true);
  });

  it('gives the boss more hp than a regular monster in the same stage', () => {
    const stage = createStage(1);
    const boss = stage.enemies[stage.enemies.length - 1];
    const monster = stage.enemies[0];
    expect(boss.hp.gt(monster.hp)).toBe(true);
  });

  it('scales monster hp up on later stages', () => {
    const stage1 = createStage(1);
    const stage2 = createStage(2);
    expect(stage2.enemies[0].hp.gt(stage1.enemies[0].hp)).toBe(true);
  });
});
