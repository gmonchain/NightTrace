/**
 * `SeedService` composes a session's seed **once**, purely.
 *
 * `composeSeed(input)` is a one-shot, deterministic composition: it builds
 * `SeedParts` from the input, delegates the hash to `seedFromParts`, and
 * returns both the parts **verbatim** and the conditions board they describe.
 * A second call with the same input yields an identical `Seed`; nothing here
 * reads a clock, a sensor or a global random source. Persisting the parts onto
 * the session row is Story 2.5's write — 2.1 guarantees the composition is pure
 * and the parts serialize stably.
 */

import { PLACE_READOUTS, SKY_READOUTS } from '@/data/strings';
import { seedFromParts } from '@/engine/RandomEngine';
import {
  seedValuesFromParts,
  type ConditionsSummary,
  type ContentVersion,
  type Environment,
  type EpochMs,
  type GeoPoint,
  type HourBand,
  type HuntId,
  type SeedParts,
  type SensorFingerprint,
  type SessionSeed,
  type SkyCondition,
  type TemperatureBand,
} from '@/engine/models';

export interface SeedInput {
  readonly huntId: HuntId;
  /** `null` when the location is unavailable: the hunt runs uncharted. */
  readonly coords: GeoPoint | null;
  readonly startedAtMs: EpochMs;
  /** The one-shot quantized sample taken at the moment of entry. */
  readonly fingerprint: SensorFingerprint;
  readonly environment: Environment;
  readonly sky: SkyCondition;
  readonly temperatureBand: TemperatureBand;
  readonly contentVersion: ContentVersion;
}

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;

/**
 * The night band from the start timestamp's hour-of-day.
 *
 * Local time needs a timezone, which only `Clock` may read, so 2.1 derives the
 * band from the epoch hour directly; the Brief refines it with the user's own
 * local hour in Story 2.6. The bands are total — the product runs at night, and
 * the remaining daytime hours fall to the last band.
 */
function hourBandOf(startedAtMs: EpochMs): HourBand {
  const hour = Math.floor((((startedAtMs % DAY_MS) + DAY_MS) % DAY_MS) / HOUR_MS);
  if (hour >= 18 && hour < 22) {
    return 'dusk';
  }
  if (hour >= 22 || hour < 1) {
    return 'night';
  }
  if (hour >= 1 && hour < 5) {
    return 'deep_night';
  }
  return 'predawn';
}

/**
 * The conditions board, derived purely from the parts. The Daily Anomaly is a
 * content concern (2.9) and the diegetic notice is the ContentRegistry's, so
 * both are inert here — `false` and `null` are claims, not omissions.
 */
function summarizeConditions(parts: SeedParts): ConditionsSummary {
  return {
    anomalyOfTheDay: false,
    skyReadout: SKY_READOUTS[parts.sky],
    hourBand: hourBandOf(parts.startedAtMs),
    placeReadout:
      parts.coords === null
        ? PLACE_READOUTS.uncharted
        : PLACE_READOUTS.charted,
    notice: null,
  };
}

export function composeSeed(input: SeedInput): SessionSeed {
  const parts: SeedParts = {
    huntId: input.huntId,
    coords: input.coords,
    startedAtMs: input.startedAtMs,
    environment: input.environment,
    sky: input.sky,
    temperatureBand: input.temperatureBand,
    fingerprint: input.fingerprint,
    contentVersion: input.contentVersion,
  };

  return {
    seed: seedFromParts(seedValuesFromParts(parts)),
    parts,
    conditionsSummary: summarizeConditions(parts),
  };
}
