/**
 * The dependency-free PRNG: `xmur3` (a string → 32-bit hash) and `sfc32` (the
 * generator) — AD-4 and the engine contract `02` §G.1: "our own RandomEngine
 * (pure TS: xmur3 hash → sfc32 PRNG)". No third-party dependency, no global
 * state, no `Math.random`.
 *
 * Both are pure 32-bit-integer algorithms, so the same input yields the same
 * output on every platform and in every run — the property the golden-vector
 * test pins.
 */

/** The four 32-bit words `sfc32` carries between draws. Serializable, so a replay can restore it. */
export type PrngState = readonly [number, number, number, number];

export interface Prng {
  /** A draw in `[0, 1)`. */
  next(): number;
  /** The current 4-word state, for a snapshot. */
  state(): PrngState;
  /** Restore a previously snapshotted state — the replay seam. */
  restore(state: PrngState): void;
}

/**
 * `xmur3` — the string hash. It returns a generator that yields successive
 * 32-bit values; calling it four times produces the four words `sfc32` needs.
 */
export function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i += 1) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function nextHashWord(): number {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

/** `sfc32` — a small, fast 32-bit generator seeded from four words. */
export function sfc32(a: number, b: number, c: number, d: number): Prng {
  let s0 = a | 0;
  let s1 = b | 0;
  let s2 = c | 0;
  let s3 = d | 0;

  return {
    next(): number {
      const t = (((s0 + s1) | 0) + s3) | 0;
      s3 = (s3 + 1) | 0;
      s0 = s1 ^ (s1 >>> 9);
      s1 = (s2 + (s2 << 3)) | 0;
      s2 = (s2 << 21) | (s2 >>> 11);
      s2 = (s2 + t) | 0;
      return (t >>> 0) / 4294967296;
    },
    state(): PrngState {
      return [s0, s1, s2, s3];
    },
    restore(state: PrngState): void {
      [s0, s1, s2, s3] = state;
    },
  };
}

/** The four `sfc32` seed words the string `xmur3(str)` yields. */
export function seedWordsFromString(str: string): PrngState {
  const hash = xmur3(str);
  return [hash(), hash(), hash(), hash()];
}
