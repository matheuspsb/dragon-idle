import { describe, expect, it } from 'vitest';
import { getCurrentEnemy } from '../../src/core/entities/Stage';
import { getClickDamage, getKnightDamage } from '../../src/core/systems/levelDamage';
import {
  advanceGameSession,
  clickGameSession,
  buyUpgrade,
  challengeBossInSession,
  createGameSession,
  quoteUpgrade,
} from '../../src/core/systems/gameSession';
import { SUPER_CRIT_MULTIPLIER } from '../../src/config/critConfig';
import { LOGIC_STEP_SECONDS, MAX_LOGIC_STEPS_PER_FRAME } from '../../src/config/loopConfig';
import { BOSS_TIME_LIMIT_SECONDS } from '../../src/config/stageConfig';
import { resolveAutoHit } from '../../src/core/systems/combatSystem';
import { createSeededRng } from '../../src/utils/random';
import { Decimal } from '../../src/utils/Decimal';
import { addGold } from '../../src/core/state/WalletState';

const rngNormal = () => 0.999999;
const rngSuperCrit = () => 0;

function currentEnemy(session: ReturnType<typeof createGameSession>) {
  return getCurrentEnemy(session.combat.stage);
}

describe('game session', () => {
  it('starts at stage 1 with a full-health enemy, no gold and the starting knights', () => {
    const session = createGameSession({ rng: rngNormal });

    expect(session.combat.stage.stageNumber).toBe(1);
    expect(currentEnemy(session).hp.eq(currentEnemy(session).maxHp)).toBe(true);
    expect(session.wallet.gold.toNumber()).toBe(0);
    expect(session.knights.knights.length).toBeGreaterThan(0);
  });

  it('lets knights attack as time passes', () => {
    const session = createGameSession({ rng: rngNormal });
    const enemy = currentEnemy(session);
    const knightDamage = getKnightDamage(session.knights.knights[0]);

    advanceGameSession(session, 1.5);

    expect(enemy.hp.eq(enemy.maxHp.sub(knightDamage))).toBe(true);
  });

  it('gives the same result regardless of how time is split into frames', () => {
    const oneFrame = createGameSession({ rng: rngNormal });
    const manyFrames = createGameSession({ rng: rngNormal });

    advanceGameSession(oneFrame, 5.5);
    for (let i = 0; i < 330; i++) advanceGameSession(manyFrames, 1 / 60);

    expect(currentEnemy(manyFrames).hp.eq(currentEnemy(oneFrame).hp)).toBe(true);
    expect(manyFrames.wallet.gold.eq(oneFrame.wallet.gold)).toBe(true);
  });

  it('collects gold and moves to the next enemy on a kill', () => {
    const session = createGameSession({ rng: rngNormal });
    const first = currentEnemy(session);
    const secondsToKill = first.maxHp.div(getKnightDamage(session.knights.knights[0])).toNumber();

    let elapsed = 0;
    while (elapsed < secondsToKill + 0.5) {
      advanceGameSession(session, 0.25);
      elapsed += 0.25;
    }

    expect(session.combat.stage.currentEnemyIndex).toBe(1);
    expect(session.wallet.gold.eq(first.goldReward)).toBe(true);
  });

  it.each([NaN, -1, Infinity])('ignores an invalid frame delta of %s', (delta) => {
    const session = createGameSession({ rng: rngNormal });
    const enemy = currentEnemy(session);

    expect(advanceGameSession(session, delta)).toBe(0);
    expect(enemy.hp.eq(enemy.maxHp)).toBe(true);
  });

  it('caps logic steps per frame and sets the rest aside as offline time', () => {
    const session = createGameSession({ rng: rngNormal });
    const capSeconds = MAX_LOGIC_STEPS_PER_FRAME * LOGIC_STEP_SECONDS;

    const steps = advanceGameSession(session, capSeconds + 3600);

    expect(steps).toBe(MAX_LOGIC_STEPS_PER_FRAME);
    expect(session.ticker.pendingOfflineSeconds).toBeCloseTo(3600, 6);
  });
});

describe('clicking in a game session', () => {
  it('damages the current enemy by the click damage on a normal roll', () => {
    const session = createGameSession({ rng: rngNormal });
    const enemy = currentEnemy(session);

    const event = clickGameSession(session);

    expect(event.outcome).toBe('normal');
    expect(event.damageDealt.eq(getClickDamage(session.click))).toBe(true);
    expect(enemy.hp.eq(enemy.maxHp.sub(getClickDamage(session.click)))).toBe(true);
  });

  it('never crits by default, even on the luckiest roll', () => {
    const session = createGameSession({ rng: rngSuperCrit });

    expect(clickGameSession(session).outcome).toBe('normal');
  });

  it('applies crits from the injected rng once the click has crit chance', () => {
    const session = createGameSession({ rng: rngSuperCrit });
    session.click.critChances = { crit: 0.12, superCrit: 0.01 };

    const event = clickGameSession(session);

    expect(event.outcome).toBe('superCrit');
    expect(event.damageDealt.eq(getClickDamage(session.click).mul(SUPER_CRIT_MULTIPLIER))).toBe(
      true
    );
  });

  it('collects the gold when a click defeats the enemy', () => {
    const session = createGameSession({ rng: rngNormal });
    const first = currentEnemy(session);
    first.hp = getClickDamage(session.click);

    const event = clickGameSession(session);

    expect(event.enemyDefeated).toBe(true);
    expect(session.wallet.gold.eq(first.goldReward)).toBe(true);
    expect(session.combat.stage.currentEnemyIndex).toBe(1);
  });

  it('is reproducible with a seeded rng', () => {
    const outcomes = (seed: number) => {
      const session = createGameSession({ rng: createSeededRng(seed) });
      session.click.critChances = { crit: 0.12, superCrit: 0.01 };
      return Array.from({ length: 50 }, () => clickGameSession(session).outcome);
    };

    expect(outcomes(7)).toEqual(outcomes(7));
  });
});

describe('buying upgrades in a game session', () => {
  it('raises the click level, charges gold and increases click damage', () => {
    const session = createGameSession({ rng: rngNormal });
    addGold(session.wallet, 1000);
    const damageBefore = getClickDamage(session.click);
    const quote = quoteUpgrade(session, { kind: 'click' }, 'x1');

    const result = buyUpgrade(session, { kind: 'click' }, 'x1');

    expect(result.levelsBought).toBe(1);
    expect(session.wallet.gold.eq(new Decimal(1000).sub(quote.cost))).toBe(true);
    expect(getClickDamage(session.click).gt(damageBefore)).toBe(true);
  });

  it('raises a knight level and its damage', () => {
    const session = createGameSession({ rng: rngNormal });
    addGold(session.wallet, 1000);
    const knight = session.knights.knights[0];
    const damageBefore = getKnightDamage(knight);

    buyUpgrade(session, { kind: 'knight', index: 0 }, 'x10');

    expect(knight.level).toBe(11);
    expect(getKnightDamage(knight).gt(damageBefore)).toBe(true);
  });

  it('buys nothing without enough gold', () => {
    const session = createGameSession({ rng: rngNormal });

    expect(buyUpgrade(session, { kind: 'click' }, 'max').levelsBought).toBe(0);
    expect(session.click.level).toBe(1);
  });

  it.each([-1, 1, 0.5])('rejects an unknown knight index %s', (index) => {
    const session = createGameSession({ rng: rngNormal });

    expect(() => buyUpgrade(session, { kind: 'knight', index }, 'x1')).toThrow(RangeError);
  });
});

describe('boss fights in a game session', () => {
  // Advance in 1 s frames: a single huge frame would hit the per-frame step cap.
  function playFor(session: ReturnType<typeof createGameSession>, seconds: number): void {
    for (let elapsed = 0; elapsed < seconds; elapsed++) advanceGameSession(session, 1);
  }

  function reachBoss(session: ReturnType<typeof createGameSession>): void {
    while (currentEnemy(session).kind !== 'boss') {
      resolveAutoHit(session.combat, currentEnemy(session).hp);
    }
  }

  it('fails the boss when the starting knight cannot kill it in time, then farms', () => {
    const session = createGameSession({ rng: rngNormal });
    reachBoss(session);

    playFor(session, BOSS_TIME_LIMIT_SECONDS + 1);

    expect(session.combat.mode).toBe('farming');
    expect(currentEnemy(session).kind).toBe('monster');
  });

  it('lets the player challenge the boss again after failing', () => {
    const session = createGameSession({ rng: rngNormal });
    reachBoss(session);
    playFor(session, BOSS_TIME_LIMIT_SECONDS + 1);

    expect(challengeBossInSession(session)).toBe(true);
    expect(currentEnemy(session).kind).toBe('boss');
    expect(session.combat.bossTimeLeftSeconds).toBe(BOSS_TIME_LIMIT_SECONDS);
  });

  it('counts the boss timer down with game time', () => {
    const session = createGameSession({ rng: rngNormal });
    reachBoss(session);

    playFor(session, 10);

    expect(session.combat.bossTimeLeftSeconds).toBeCloseTo(BOSS_TIME_LIMIT_SECONDS - 10, 6);
  });
});
