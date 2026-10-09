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
 * the distribution helpers (`pick`/`weighted`/`gaussian`/`exponent`) arrive with
 * Story 2.2, their first consumer.
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
