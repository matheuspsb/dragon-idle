import { describe, expect, it, vi } from 'vitest';
import { createObjectPool } from '../../../src/systems/objectPool';

interface Item {
  id: number;
  dirty: boolean;
}

function counterFactory() {
  let next = 0;
  return vi.fn((): Item => ({ id: next++, dirty: false }));
}

describe('object pool', () => {
  it('creates a new object when none is free', () => {
    const create = counterFactory();
    const pool = createObjectPool(create);

    const a = pool.acquire();
    const b = pool.acquire();

    expect(a).not.toBe(b);
    expect(create).toHaveBeenCalledTimes(2);
    expect(pool.inUse).toBe(2);
  });

  it('reuses released objects instead of creating new ones', () => {
    const create = counterFactory();
    const pool = createObjectPool(create);

    const first = pool.acquire();
    pool.release(first);
    const again = pool.acquire();

    expect(again).toBe(first);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('resets an object when it goes back to the pool', () => {
    const pool = createObjectPool(counterFactory(), {
      reset: (item) => {
        item.dirty = false;
      },
    });

    const item = pool.acquire();
    item.dirty = true;
    pool.release(item);

    expect(item.dirty).toBe(false);
  });

  it('can preallocate objects up front', () => {
    const create = counterFactory();
    const pool = createObjectPool(create, { prealloc: 5 });

    expect(create).toHaveBeenCalledTimes(5);
    expect(pool.available).toBe(5);

    pool.acquire();
    expect(create).toHaveBeenCalledTimes(5);
    expect(pool.available).toBe(4);
  });

  it('rejects releasing the same object twice', () => {
    const pool = createObjectPool(counterFactory());
    const item = pool.acquire();
    pool.release(item);

    expect(() => pool.release(item)).toThrow(Error);
    expect(pool.available).toBe(1);
  });

  it('rejects releasing an object it did not hand out', () => {
    const pool = createObjectPool(counterFactory());

    expect(() => pool.release({ id: 99, dirty: false })).toThrow(Error);
  });

  it.each([-1, 1.5, NaN])('rejects an invalid prealloc of %s', (prealloc) => {
    expect(() => createObjectPool(counterFactory(), { prealloc })).toThrow(RangeError);
  });
});
