import { describe, expect, it } from 'vitest';
import { STARTING_CRIT_CHANCES } from '../../../../src/config/critConfig';
import { CLICK_BASE_DAMAGE } from '../../../../src/config/upgradeConfig';
import { createClickState } from '../../../../src/core/state/ClickState';
import { getClickDamage } from '../../../../src/core/systems/levelDamage';

describe('ClickState', () => {
  it('starts at level 1 dealing the base click damage', () => {
    const click = createClickState();
    expect(click.level).toBe(1);
    expect(getClickDamage(click).toNumber()).toBe(CLICK_BASE_DAMAGE);
  });

  it('starts without any crit chance (crits come from an upgrade)', () => {
    expect(createClickState().critChances).toEqual(STARTING_CRIT_CHANCES);
    expect(STARTING_CRIT_CHANCES).toEqual({ crit: 0, superCrit: 0 });
  });

  it('scales click damage with level', () => {
    const click = createClickState();
    click.level = 4;
    expect(getClickDamage(click).toNumber()).toBe(CLICK_BASE_DAMAGE * 4);
  });
});
