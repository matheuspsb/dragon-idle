import { describe, expect, it } from 'vitest';
import { getCurrentEnemy } from '../../src/core/entities/Stage';
import { getKnightDamage } from '../../src/core/systems/levelDamage';
import { advanceGameSession, createGameSession } from '../../src/core/systems/gameSession';
import { LOGIC_STEP_SECONDS, MAX_LOGIC_STEPS_PER_FRAME } from '../../src/config/loopConfig';

function currentEnemy(session: ReturnType<typeof createGameSession>) {
  return getCurrentEnemy(session.combat.stage);
}

describe('game session', () => {
  it('starts at stage 1 with a full-health enemy, no gold and the starting knights', () => {
    const session = createGameSession();

    expect(session.combat.stage.stageNumber).toBe(1);
    expect(currentEnemy(session).hp.eq(currentEnemy(session).maxHp)).toBe(true);
    expect(session.wallet.gold.toNumber()).toBe(0);
    expect(session.knights.knights.length).toBeGreaterThan(0);
  });

  it('lets knights attack as time passes', () => {
    const session = createGameSession();
    const enemy = currentEnemy(session);
    const knightDamage = getKnightDamage(session.knights.knights[0]);

    advanceGameSession(session, 1.5);

    expect(enemy.hp.eq(enemy.maxHp.sub(knightDamage))).toBe(true);
  });

  it('gives the same result regardless of how time is split into frames', () => {
    const oneFrame = createGameSession();
    const manyFrames = createGameSession();

    advanceGameSession(oneFrame, 5.5);
    for (let i = 0; i < 330; i++) advanceGameSession(manyFrames, 1 / 60);

    expect(currentEnemy(manyFrames).hp.eq(currentEnemy(oneFrame).hp)).toBe(true);
    expect(manyFrames.wallet.gold.eq(oneFrame.wallet.gold)).toBe(true);
  });

  it('collects gold and moves to the next enemy on a kill', () => {
    const session = createGameSession();
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
    const session = createGameSession();
    const enemy = currentEnemy(session);

    expect(advanceGameSession(session, delta)).toBe(0);
    expect(enemy.hp.eq(enemy.maxHp)).toBe(true);
  });

  it('caps logic steps per frame and sets the rest aside as offline time', () => {
    const session = createGameSession();
    const capSeconds = MAX_LOGIC_STEPS_PER_FRAME * LOGIC_STEP_SECONDS;

    const steps = advanceGameSession(session, capSeconds + 3600);

    expect(steps).toBe(MAX_LOGIC_STEPS_PER_FRAME);
    expect(session.ticker.pendingOfflineSeconds).toBeCloseTo(3600, 6);
  });
});
