import { assertNever } from '@/engine/models';
import {
  DIRECTIVE_MAX_PER_SESSION,
  DIRECTIVE_MIN_SPACING_MS,
} from '@/engine/directives/DirectiveScheduler';
import { createRandomEngine, seedFromParts } from '@/engine/RandomEngine';
import { replayOptions, replaySession, replaySessionSeed } from '@/engine/replay';
import { ENGINE_MIN_EVENT_COOLDOWN_MS } from '@/engine/rules/cooldown';
import { gapFrom } from '@/engine/rules/silence';

import { CONTENT, DIRECTIVES, EVENT_DEFINITIONS, EVENT_TABLES } from '@/data/content';

/**
 * The content-validation gate for the shipped event tables (AD-5, FR-2).
 *
 * It proves the *shipped* content, not a fixture:
 *  - EMPTY_WEIGHT: every table's `emptyWeight` is strictly positive, so silence
 *    is always a valid draw (AD-5);
 *  - the §C.6 seeded sweep over 500 twenty-minute sessions, asserting the three
 *    required bands;
 *  - MEMORYLESS: the hazard does not increase with time since the last emission;
 *  - DIRECTIVE_CAP: at most six directives per session, at least three minutes apart.
 *
 * The sweep is deterministic — the same 500 seeds are replayed every run — so
 * the band assertions are stable, not flaky.
 */

const TWENTY_MINUTES_MS = 1_200_000;
const SWEEP_SEEDS = 500;
const CONTENT_VERSION = '2026.10.05.1';
const HUNT_ID = 'the-watcher';

function percentile(sorted: readonly number[], p: number): number {
  if (sorted.length === 0) {
    return 0;
  }
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.round((p / 100) * (sorted.length - 1))),
  );
  return sorted[index] ?? 0;
}

const ascending = (values: readonly number[]): number[] =>
  [...values].sort((a, b) => a - b);

type SweepMetrics = {
  readonly intervals: readonly number[];
  readonly longestSilences: readonly number[];
  readonly overFiveMinutes: number;
  readonly eventCounts: readonly number[];
  readonly directiveCounts: readonly number[];
  readonly directiveGaps: readonly number[];
};

function sweep(): SweepMetrics {
  const options = replayOptions(TWENTY_MINUTES_MS);
  const intervals: number[] = [];
  const longestSilences: number[] = [];
  const eventCounts: number[] = [];
  const directiveCounts: number[] = [];
  const directiveGaps: number[] = [];
  let overFiveMinutes = 0;

  for (let index = 0; index < SWEEP_SEEDS; index += 1) {
    const session = replaySessionSeed({
      seed: `sweep-seed-${index}`,
      huntId: HUNT_ID,
      contentVersion: CONTENT_VERSION,
    });
    const emissions = replaySession(session, CONTENT, options);

    const events: number[] = [];
    const directives: number[] = [];
    for (const emission of emissions) {
      switch (emission.kind) {
        case 'event':
          events.push(emission.atMs);
          break;
        case 'directive':
          directives.push(emission.atMs);
          break;
        case 'phase':
        case 'notice':
          // The ladder and the lifecycle notices are not signals; only `event`
          // and `directive` are measured here.
          break;
        default:
          // A new emission variant must be decided here, never silently dropped.
          assertNever(emission);
      }
    }

    eventCounts.push(events.length);
    directiveCounts.push(directives.length);
    for (let i = 1; i < directives.length; i += 1) {
      directiveGaps.push((directives[i] ?? 0) - (directives[i - 1] ?? 0));
    }

    // A "silence" is any stretch with no event: before the first, between two,
    // and after the last.
    const silences: number[] = [];
    if (events.length > 0) {
      silences.push(events[0] ?? 0);
      for (let i = 1; i < events.length; i += 1) {
        const gap = (events[i] ?? 0) - (events[i - 1] ?? 0);
        silences.push(gap);
        intervals.push(gap);
      }
      silences.push(TWENTY_MINUTES_MS - (events[events.length - 1] ?? 0));
    } else {
      silences.push(TWENTY_MINUTES_MS);
    }
    const longest = Math.max(...silences);
    longestSilences.push(longest);
    if (longest > 300_000) {
      overFiveMinutes += 1;
    }
  }

  return {
    intervals,
    longestSilences,
    overFiveMinutes,
    eventCounts,
    directiveCounts,
    directiveGaps,
  };
}

/** Replayed once — 500 sessions — and shared by the band assertions below. */
const METRICS = sweep();

describe('EMPTY_WEIGHT: silence is authored in every shipped table', () => {
  it('every event table carries an emptyWeight strictly greater than zero', () => {
    const offending = EVENT_TABLES.filter((table) => !(table.emptyWeight > 0)).map(
      (table) => table.id,
    );
    expect(offending).toEqual([]);
  });

  it('every table carries a positive interval mean and a floor (AD-5)', () => {
    for (const table of EVENT_TABLES) {
      expect(table.intervalMeanMs).toBeGreaterThan(0);
      expect(table.silenceFloorMs).toBeGreaterThanOrEqual(0);
    }
  });

  it('every table entry resolves to a shipped definition', () => {
    const ids = new Set(EVENT_DEFINITIONS.map((definition) => definition.id));
    for (const table of EVENT_TABLES) {
      for (const entry of table.entries) {
        expect(ids.has(entry.definitionId)).toBe(true);
      }
    }
  });

  it('covers the closed five phases exactly once', () => {
    const phases = EVENT_TABLES.map((table) => table.phase).sort();
    expect(phases).toEqual(
      ['ACTIVITY', 'ENCOUNTER_WINDOW', 'QUIET', 'RESOLUTION', 'SIGNALS'].sort(),
    );
  });
});

describe('CONTENT_INTEGRITY: the shipped content is internally consistent', () => {
  it('gives every event definition a unique id', () => {
    const ids = EVENT_DEFINITIONS.map((definition) => definition.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('resolves every directive ban id to a shipped definition', () => {
    const ids = new Set(EVENT_DEFINITIONS.map((definition) => definition.id));
    for (const directive of DIRECTIVES) {
      for (const banned of directive.bannedEvents) {
        expect(ids.has(banned)).toBe(true);
      }
    }
  });

  it('ties a silence-category definition to an extension, and nothing else to one', () => {
    for (const definition of EVENT_DEFINITIONS) {
      if (definition.category === 'silence') {
        expect(definition.extendsSilenceMs).toBeGreaterThan(0);
      } else {
        expect(definition.extendsSilenceMs).toBeNull();
      }
    }
  });
});

describe('§C.6: the pacing bands hold over 500 seeded twenty-minute sessions', () => {
  const intervalSorted = ascending(METRICS.intervals);
  const longestSorted = ascending(METRICS.longestSilences);
  const intervalP50 = percentile(intervalSorted, 50);
  const intervalP90 = percentile(intervalSorted, 90);
  const longestP50 = percentile(longestSorted, 50);
  const overFiveFraction = METRICS.overFiveMinutes / SWEEP_SEEDS;

  it('a session emits more than nothing', () => {
    expect(percentile(ascending(METRICS.eventCounts), 50)).toBeGreaterThan(0);
    expect(METRICS.intervals.length).toBeGreaterThan(SWEEP_SEEDS);
  });

  it('SWEEP_INTERVALS: the interval p90/p50 ratio holds at ≥ 3.0', () => {
    expect(intervalP50).toBeGreaterThan(0);
    expect(intervalP90 / intervalP50).toBeGreaterThanOrEqual(3.0);
  });

  it('SWEEP_INTERVALS: the longest silence lands in the 200–260 s band at the median', () => {
    expect(longestP50).toBeGreaterThanOrEqual(200_000);
    expect(longestP50).toBeLessThanOrEqual(260_000);
  });

  it('SWEEP_INTERVALS: a >5 min silence occurs in 22–35% of sessions', () => {
    expect(overFiveFraction).toBeGreaterThanOrEqual(0.22);
    expect(overFiveFraction).toBeLessThanOrEqual(0.35);
  });
});

describe('MEMORYLESS: the shipped floor and mean give a flat hazard', () => {
  // Read the QUIET table from the shipped content rather than copying its
  // numbers, so retuning `tables.json` cannot leave this test measuring a shape
  // the content no longer ships.
  const quiet = EVENT_TABLES.find((table) => table.phase === 'QUIET');
  if (quiet === undefined) {
    throw new Error('MEMORYLESS: the shipped content has no QUIET table');
  }
  const FLOOR = quiet.silenceFloorMs;
  const MEAN = quiet.intervalMeanMs;
  const SAMPLES = 40_000;
  const DELTA = 5_000;

  const gaps: number[] = [];
  {
    const rng = createRandomEngine(seedFromParts(['sweep', 'memoryless']));
    for (let i = 0; i < SAMPLES; i += 1) {
      gaps.push(gapFrom(FLOOR, 1, rng.exponent(MEAN)));
    }
  }

  function hazard(t: number): number {
    let survivors = 0;
    let ended = 0;
    for (const gap of gaps) {
      if (gap > t) {
        survivors += 1;
        if (gap <= t + DELTA) {
          ended += 1;
        }
      }
    }
    return survivors === 0 ? 0 : ended / survivors;
  }

  it('the hazard does not increase with time since the last emission', () => {
    const thresholds = [FLOOR, FLOOR + 30_000, FLOOR + 90_000, FLOOR + 240_000];
    const hazards = thresholds.map(hazard);
    const expected = 1 - Math.exp(-DELTA / MEAN);
    for (const value of hazards) {
      expect(value).toBeGreaterThan(expected * 0.7);
      expect(value).toBeLessThan(expected * 1.3);
    }
    for (let i = 1; i < hazards.length; i += 1) {
      expect(hazards[i] ?? 0).toBeLessThanOrEqual((hazards[i - 1] ?? 0) + 0.02);
    }
  });
});

describe('DIRECTIVE_CAP: directives are capped and spaced', () => {
  it('at most six directives fire per session', () => {
    expect(DIRECTIVE_MAX_PER_SESSION).toBeLessThanOrEqual(6);
    expect(Math.max(...METRICS.directiveCounts)).toBeLessThanOrEqual(
      DIRECTIVE_MAX_PER_SESSION,
    );
  });

  it('every pair of directives is at least three minutes apart', () => {
    expect(METRICS.directiveGaps.length).toBeGreaterThan(0);
    expect(Math.min(...METRICS.directiveGaps)).toBeGreaterThanOrEqual(
      DIRECTIVE_MIN_SPACING_MS,
    );
  });

  it('the directive pool and the engine cooldown floor are non-trivial', () => {
    expect(DIRECTIVES.length).toBeGreaterThan(1);
    expect(ENGINE_MIN_EVENT_COOLDOWN_MS).toBeGreaterThan(0);
  });
});
