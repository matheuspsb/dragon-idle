export type Rng = () => number;

// Mulberry32: tiny, fast, good enough statistically for gameplay rolls, and
// fully reproducible from a 32-bit seed (balance-sim, bug repros).
export function createSeededRng(seed: number): Rng {
  if (!Number.isInteger(seed)) throw new RangeError(`Seed must be an integer: ${seed}`);

  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
