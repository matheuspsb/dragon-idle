export interface ObjectPool<T> {
  acquire(): T;
  release(item: T): void;
  readonly available: number;
  readonly inUse: number;
}

export interface ObjectPoolOptions<T> {
  reset?: (item: T) => void;
  prealloc?: number;
}

export function createObjectPool<T>(
  create: () => T,
  options: ObjectPoolOptions<T> = {}
): ObjectPool<T> {
  const { reset, prealloc = 0 } = options;
  if (!Number.isInteger(prealloc) || prealloc < 0) {
    throw new RangeError(`Invalid prealloc: ${prealloc}`);
  }

  const free: T[] = [];
  const handedOut = new Set<T>();
  for (let i = 0; i < prealloc; i++) free.push(create());

  return {
    acquire() {
      const item = free.pop() ?? create();
      handedOut.add(item);
      return item;
    },
    release(item) {
      // A double release would let two users share one object (e.g. two damage
      // numbers animating the same text), so fail loudly instead.
      if (!handedOut.delete(item)) throw new Error('Released an object the pool does not own');
      reset?.(item);
      free.push(item);
    },
    get available() {
      return free.length;
    },
    get inUse() {
      return handedOut.size;
    },
  };
}
