/**
 * Seeded pseudo-random number generator for reproducible game runs
 * Uses mulberry32 algorithm - fast and good distribution
 */

export interface RandomGenerator {
  next: () => number;        // Returns 0-1
  nextInt: (min: number, max: number) => number;  // Returns integer in range [min, max]
  nextFloat: (min: number, max: number) => number; // Returns float in range [min, max]
  getSeed: () => number;
}

/**
 * Create a seeded random number generator
 */
export function createRandom(seed: number): RandomGenerator {
  let state = seed;

  // mulberry32 algorithm
  const next = (): number => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const nextInt = (min: number, max: number): number => {
    return Math.floor(next() * (max - min + 1)) + min;
  };

  const nextFloat = (min: number, max: number): number => {
    return next() * (max - min) + min;
  };

  const getSeed = (): number => seed;

  return { next, nextInt, nextFloat, getSeed };
}

/**
 * Generate a random seed based on current time
 */
export function generateSeed(): number {
  return Date.now() ^ (Math.random() * 0x100000000);
}
