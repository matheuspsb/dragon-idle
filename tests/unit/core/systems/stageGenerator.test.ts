import { describe, expect, it } from 'vitest';
import {
  BOSS_GOLD_MULTIPLIER,
  BOSS_HP_MULTIPLIER,
  FIRST_MONSTER_HP,
  GOLD_GROWTH_PER_STAGE,
  GOLD_PER_HP,
  HP_GROWTH_PER_STAGE,
  LAST_MONSTER_HP,
  MONSTERS_PER_STAGE,
} from '../../../../src/config/stageConfig';
import { createStage } from '../../../../src/core/systems/stageGenerator';

const hpOf = (stageNumber: number) => createStage(stageNumber).enemies.map((e) => e.hp.toNumber());

describe('createStage', () => {
  it('creates MONSTERS_PER_STAGE monsters followed by one boss', () => {
    const stage = createStage(1);

    expect(stage.enemies).toHaveLength(MONSTERS_PER_STAGE + 1);
    expect(stage.enemies.slice(0, -1).every((enemy) => enemy.kind === 'monster')).toBe(true);
    expect(stage.enemies[stage.enemies.length - 1].kind).toBe('boss');
  });

  it("matches the designer's spec for zone 1: 9 monsters from 10 to 100 HP, then a 1k boss", () => {
    const hp = hpOf(1);

    expect(MONSTERS_PER_STAGE).toBe(9);
    expect(hp[0]).toBeCloseTo(10, 6);
    expect(hp[8]).toBeCloseTo(100, 6);
    expect(hp[9]).toBeCloseTo(1000, 6);
  });

  it('ramps monster HP geometrically from the first to the last monster of the zone', () => {
    const hp = hpOf(1);
    const ratio = (LAST_MONSTER_HP / FIRST_MONSTER_HP) ** (1 / (MONSTERS_PER_STAGE - 1));

    for (let i = 1; i < MONSTERS_PER_STAGE; i++) {
      expect(hp[i] / hp[i - 1]).toBeCloseTo(ratio, 9);
    }
  });

  it('makes the boss BOSS_HP_MULTIPLIER times the last monster', () => {
    const hp = hpOf(1);

    expect(hp[MONSTERS_PER_STAGE] / hp[MONSTERS_PER_STAGE - 1]).toBeCloseTo(BOSS_HP_MULTIPLIER, 9);
  });

  it('scales every enemy by HP_GROWTH_PER_STAGE for each later zone', () => {
    const zone1 = hpOf(1);
    const zone4 = hpOf(4);

    zone4.forEach((hp, i) => expect(hp / zone1[i]).toBeCloseTo(HP_GROWTH_PER_STAGE ** 3, 9));
  });

  it('pays gold proportional to each monster HP within zone 1', () => {
    for (const enemy of createStage(1).enemies.slice(0, MONSTERS_PER_STAGE)) {
      expect(enemy.goldReward.toNumber()).toBeCloseTo(enemy.hp.toNumber() * GOLD_PER_HP, 6);
    }
  });

  it('keeps monster gold proportional to HP inside any zone', () => {
    const [first, ...rest] = createStage(7).enemies.slice(0, MONSTERS_PER_STAGE);
    const goldPerHp = first.goldReward.div(first.hp).toNumber();

    for (const enemy of rest) {
      expect(enemy.goldReward.div(enemy.hp).toNumber()).toBeCloseTo(goldPerHp, 9);
    }
  });

  it('pays the boss BOSS_GOLD_MULTIPLIER times the gold of the last monster, apart from its HP', () => {
    for (const stageNumber of [1, 9]) {
      const enemies = createStage(stageNumber).enemies;
      const lastMonster = enemies[MONSTERS_PER_STAGE - 1];
      const boss = enemies[MONSTERS_PER_STAGE];

      expect(boss.goldReward.div(lastMonster.goldReward).toNumber()).toBeCloseTo(
        BOSS_GOLD_MULTIPLIER,
        9
      );
    }
  });

  it('grows gold by GOLD_GROWTH_PER_STAGE per zone, independently of HP growth', () => {
    const zone1 = createStage(1).enemies;
    const zone4 = createStage(4).enemies;

    zone4.forEach((enemy, i) =>
      expect(enemy.goldReward.div(zone1[i].goldReward).toNumber()).toBeCloseTo(
        GOLD_GROWTH_PER_STAGE ** 3,
        9
      )
    );
  });

  it('starts at the first enemy', () => {
    expect(createStage(3).currentEnemyIndex).toBe(0);
  });

  it('keeps working far beyond float range', () => {
    const boss = createStage(10_000).enemies[MONSTERS_PER_STAGE];

    expect(boss.hp.isFinite()).toBe(true);
    expect(boss.hp.gt('1e300')).toBe(true);
  });
});
