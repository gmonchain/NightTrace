/**
 * The seeded random engine and its labelled forks (AD-4).
 *
 * Randomness is drawn **only** through `fork(label)` over the closed
 * seven-label set, or through `fork('rng.content.' + definitionId)` for
 * content-driven behaviour. A fork's substream is derived from
 * `seedFromParts([seed, label])` — not from a parent generator's current
 * position — so it depends only on `(seed, label)`: draw order cannot couple
 * two features, and a label, once a content version has shipped, can never be
 * renamed, because it is part of the replay key (AD-3).
 *
 * The engine is deliberately stateful internally so it is fast; `snapshot()` and
 * `restore()` make it replayable. `next`/`int`/`bool` are the 2.1 draw surface;
 * `pick`/`weighted`/`exponent` are the distribution helpers Story 2.2 added with
 * their first consumer (the scheduler). `gaussian` remains deferred to its own
 * first consumer. All of these draw from the *same* labelled stream — a helper
 * adds no fork label (AD-4).
 */

import { invariant } from '@/util/result';

import type { Seed } from './models';
import { seedId } from './models';
import { sfc32, seedWordsFromString, type Prng, type PrngState } from './prng';

/**
 * The closed seven-label set — the purposes for v1. A new purpose takes a new
 * label from this set, never a draw from an existing one; adding an eighth is a
 * deliberate change that fails the closed-set test.
 */
export const FORK_LABELS = [
  'rng.session',
  'rng.events',
  'rng.radar',
  'rng.words',
  'rng.encounters',
  'rng.report',
  'rng.signals',
] as const;

export type ForkLabel = (typeof FORK_LABELS)[number];

/**
 * The one expansion that needs no engine edit: one substream per content
 * definition, never a shared stream.
 */
export type ContentForkLabel = `rng.content.${string}`;

export type AnyForkLabel = ForkLabel | ContentForkLabel;

/** A serializable snapshot of a stream: its identity, its draw count and its four words. */
export interface RandomState {
  readonly seed: Seed;
  readonly draws: number;
  readonly s: PrngState;
}

/** One weighted choice: a value and the weight that makes it more or less likely. */
export interface Weighted<T> {
  readonly value: T;
  readonly weight: number;
}

export interface RandomEngine {
  readonly seed: Seed;
  /** The number of draws taken — a replay assertion. */
  readonly draws: number;
  /** A draw in `[0, 1)`. */
  next(): number;
  /** An integer in `[minInclusive, maxExclusive)`. */
  int(minInclusive: number, maxExclusive: number): number;
  /** `true` with probability `probability`. */
  bool(probability: number): boolean;
  /** A uniform pick from a non-empty list. */
  pick<T>(items: readonly T[]): T;
  /** A weighted pick. Weights must sum to something positive; zero weights never win. */
  weighted<T>(entries: readonly Weighted<T>[]): T;
  /**
   * An exponential draw with the given mean — a hard floor of zero and a long
   * tail, **memoryless**. The shape the silence gap uses: surviving a long quiet
   * stretch never makes the next moment more likely (FR-2).
   */
  exponent(meanMs: number): number;
  /** A deterministic substream that depends only on `(seed, label)`. */
  fork(label: AnyForkLabel): RandomEngine;
  snapshot(): RandomState;
  restore(state: RandomState): void;
}

const CONTENT_FORK_PREFIX = 'rng.content.';

function isKnownForkLabel(label: string): boolean {
  for (const known of FORK_LABELS) {
    if (known === label) {
      return true;
    }
  }
  return false;
}

function assertForkLabel(label: string): void {
  invariant(
    isKnownForkLabel(label) || label.startsWith(CONTENT_FORK_PREFIX),
    `RandomEngine.fork: unknown fork label "${label}"`,
  );
}

/**
 * Hash a canonical part list into a 32-character hex `Seed`. The brand comes
 * from `ids.seedId`, so the brand assertion stays in one module (AD-14); the
 * part list is joined with a NUL separator, and every value is produced by a
 * typed field or a closed enum, so the join is injective over real inputs.
 */
export function seedFromParts(parts: readonly (string | number)[]): Seed {
  const joined = parts.map((part) => String(part)).join('\u0000');
  const words = seedWordsFromString(joined);
  const hex = words
    .map((word) => word.toString(16).padStart(8, '0'))
    .join('');
  return seedId(hex);
}

export function createRandomEngine(seed: Seed): RandomEngine {
  const prng: Prng = sfc32(...seedWordsFromString(seed));
  let draws = 0;

  function next(): number {
    draws += 1;
    return prng.next();
  }

  return {
    get seed(): Seed {
      return seed;
    },
    get draws(): number {
      return draws;
    },
    next,
    int(minInclusive: number, maxExclusive: number): number {
      invariant(
        maxExclusive > minInclusive,
        'RandomEngine.int: maxExclusive must exceed minInclusive',
      );
      return minInclusive + Math.floor(next() * (maxExclusive - minInclusive));
    },
    bool(probability: number): boolean {
      return next() < probability;
    },
    pick<T>(items: readonly T[]): T {
      invariant(
        items.length > 0,
        'RandomEngine.pick: cannot pick from an empty list',
      );
      const index = Math.floor(next() * items.length);
      // `next()` is in `[0, 1)`, so `index` is in `[0, length)` for any positive
      // length; the clamp only guards a floating-point edge at the top.
      const item = items[Math.min(index, items.length - 1)];
      invariant(item !== undefined, 'RandomEngine.pick: index out of range');
      return item;
    },
    weighted<T>(entries: readonly Weighted<T>[]): T {
      invariant(
        entries.length > 0,
        'RandomEngine.weighted: cannot pick from an empty list',
      );
      const total = entries.reduce(
        (sum, entry) => sum + Math.max(0, entry.weight),
        0,
      );
      invariant(
        total > 0,
        'RandomEngine.weighted: the weights must sum to a positive value',
      );
      let target = next() * total;
      let last: T | undefined;
      for (const entry of entries) {
        const weight = Math.max(0, entry.weight);
        last = entry.value;
        target -= weight;
        if (target < 0) {
          return entry.value;
        }
      }
      // Floating-point drift can leave `target` at exactly zero after the final
      // entry; the last weighted entry is the correct, deterministic home for it.
      invariant(last !== undefined, 'RandomEngine.weighted: no entry selected');
      return last;
    },
    exponent(meanMs: number): number {
      invariant(
        meanMs > 0,
        'RandomEngine.exponent: the mean must be positive',
      );
      // Inverse transform of the exponential distribution. `next()` is in
      // `[0, 1)`, so `1 - next()` is in `(0, 1]` and its logarithm is finite.
      return -meanMs * Math.log(1 - next());
    },
    fork(label: AnyForkLabel): RandomEngine {
      assertForkLabel(label);
      return createRandomEngine(seedFromParts([seed, label]));
    },
    snapshot(): RandomState {
      return { seed, draws, s: prng.state() };
    },
    restore(state: RandomState): void {
      invariant(
        state.seed === seed,
        'RandomEngine.restore: the snapshot belongs to a different seed',
      );
      draws = state.draws;
      prng.restore(state.s);
    },
  };
}
