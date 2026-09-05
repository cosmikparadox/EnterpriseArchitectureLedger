// Deterministic PRNG so the estate and every Monte Carlo run are reproducible.
// xoshiro128** with a splitmix32 seeder. Not cryptographic; it does not need
// to be. Spec section 2 requires a fixed seed.

export interface Rng {
  next(): number // uniform in [0, 1)
}

function splitmix32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x9e3779b9) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 16), 0x21f0aaad)
    t = Math.imul(t ^ (t >>> 15), 0x735a2d97)
    return (t ^ (t >>> 15)) >>> 0
  }
}

export function makeRng(seed: number): Rng {
  const sm = splitmix32(seed)
  let s0 = sm(), s1 = sm(), s2 = sm(), s3 = sm()
  const rotl = (x: number, k: number) => ((x << k) | (x >>> (32 - k))) >>> 0
  return {
    next(): number {
      const result = (Math.imul(rotl(Math.imul(s1, 5) >>> 0, 7), 9) >>> 0) >>> 0
      const t = (s1 << 9) >>> 0
      s2 = (s2 ^ s0) >>> 0
      s3 = (s3 ^ s1) >>> 0
      s1 = (s1 ^ s2) >>> 0
      s0 = (s0 ^ s3) >>> 0
      s2 = (s2 ^ t) >>> 0
      s3 = rotl(s3, 11)
      return result / 4294967296
    },
  }
}

/** Uniform draw inside a band, rounded to `dp` decimal places. */
export function band(rng: Rng, lo: number, hi: number, dp = 3): number {
  const v = lo + (hi - lo) * rng.next()
  const m = 10 ** dp
  return Math.round(v * m) / m
}

/** Standard normal, Box-Muller. */
export function normal(rng: Rng): number {
  let u = 0
  while (u === 0) u = rng.next()
  const v = rng.next()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}
