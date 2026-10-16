import { describe, expect, it } from 'vitest';
import { CLICK_BASE_COST, CLICK_BASE_DAMAGE } from '../../../../src/config/upgradeConfig';
import { createClickState } from '../../../../src/core/state/ClickState';
import { getClickDamage } from '../../../../src/core/systems/levelDamage';

describe('ClickState', () => {
  it('starts at level 1 dealing the base click damage', () => {
    const click = createClickState();
    expect(click.level).toBe(1);
    expect(click.baseCost).toBe(CLICK_BASE_COST);
    expect(getClickDamage(click).toNumber()).toBe(CLICK_BASE_DAMAGE);
  });

  it('scales click damage with level', () => {
    const click = createClickState();
    click.level = 4;
    expect(getClickDamage(click).toNumber()).toBe(CLICK_BASE_DAMAGE * 4);
  });
});
