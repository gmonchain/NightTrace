/**
 * The seed models (AD-3, the engine contract `02` §H.2).
 *
 * `SeedParts` is every ingredient that makes tonight's seed unrepeatable. It is
 * composed **once**, is serialized **verbatim** and is **never recomputed**,
 * because the seed is the replay key: recomputing it from a fresh sensor sample
 * would produce a different seed, since the fingerprint is a live reading.
 * `contentVersion` is one of the parts deliberately — a content bump is the one
 * event that breaks replay parity (AD-3), and putting the version into the hash
 * makes that break structural rather than a promise.
 */

import type {
  ContentVersion,
  EpochMs,
  HuntId,
  Seed,
  Unit,
} from './ids';

export interface GeoPoint {
  readonly lat: number;
  readonly lon: number;
  readonly accuracyM: number;
}

/** What the user declared in the brief. Never inferred, always explicit. */
export type Environment =
  | 'indoor_home'
  | 'indoor_derelict'
  | 'outdoor_urban'
  | 'outdoor_woodland'
  | 'outdoor_water'
  | 'vehicle'
  | 'transit';

export type SkyCondition =
  | 'clear'
  | 'overcast'
  | 'precipitation'
  | 'storm'
  | 'fog'
  | 'unknown';

/**
 * Weather is a user-confirmed proxy, not a fetched reading: there is no network
 * and therefore no weather API, so the sky and the temperature band are what
 * the user reports in the brief.
 */
export type TemperatureBand =
  | 'freezing'
  | 'cold'
  | 'mild'
  | 'warm'
  | 'hot'
  | 'unknown';

/** The one-shot, deliberately coarse sensor sample that salts the seed. */
export interface SensorFingerprint {
  /** `-3..3`, the quantized magnetometer magnitude residual. */
  readonly emfMicro: number;
  /** `null` when the channel is absent (the ambient-light sensor is Android-only). */
  readonly lightLux: number | null;
  /** `1.0` is perfectly still at start. */
  readonly motionQuiet: Unit;
  readonly noiseFloorDb: number | null;
}

/**
 * Every ingredient that makes tonight's seed unrepeatable. Persisted verbatim
 * on the session row and never recomputed (AD-3).
 */
export interface SeedParts {
  readonly huntId: HuntId;
  /** `null` means uncharted: the location channel was denied or absent. */
  readonly coords: GeoPoint | null;
  readonly startedAtMs: EpochMs;
  readonly environment: Environment;
  readonly sky: SkyCondition;
  readonly temperatureBand: TemperatureBand;
  /** Quantized at session start, one-shot. */
  readonly fingerprint: SensorFingerprint;
  /** Part of the hash, so a content drop deliberately changes the replay key. */
  readonly contentVersion: ContentVersion;
}

/** The sky, as the report shows it — words, never a measurement. */
export type SkyReadout =
  | 'clear'
  | 'overcast'
  | 'rain'
  | 'storm'
  | 'fog'
  | 'unreadable';

export type HourBand = 'dusk' | 'night' | 'deep_night' | 'predawn';

/**
 * The conditions board the user sees on the brief screen and again on the
 * report. Persisted verbatim so a replayed session reconstructs the same board.
 */
export interface ConditionsSummary {
  readonly anomalyOfTheDay: boolean;
  readonly skyReadout: SkyReadout;
  readonly hourBand: HourBand;
  /** e.g. a coarse place label; `'Uncharted'` when `coords` is `null`. */
  readonly placeReadout: string;
  /** A diegetic one-liner set by the content layer; `null` until then. */
  readonly notice: string | null;
}

/**
 * The composed seed: the hash, the parts it was composed from, and the board
 * they describe. `composeSeed` builds this once; nothing recomputes it.
 */
export interface SessionSeed {
  readonly seed: Seed;
  readonly parts: SeedParts;
  readonly conditionsSummary: ConditionsSummary;
}

/** The sentinel a missing (`null`) part contributes to the hash. */
const NULL_PART = 'null';

/**
 * The canonical value list a `SeedParts` hashes to. Reading each field by name
 * is what makes the list key-order-independent: two parts objects built with
 * their keys inserted in a different order produce the identical list.
 *
 * `null` sub-values collapse to a single sentinel, so `coords: null` is one
 * unambiguous contributor rather than an omission.
 */
export function seedValuesFromParts(
  parts: SeedParts,
): readonly (string | number)[] {
  const { coords, fingerprint } = parts;
  return [
    parts.huntId,
    coords === null ? NULL_PART : coords.lat,
    coords === null ? NULL_PART : coords.lon,
    coords === null ? NULL_PART : coords.accuracyM,
    parts.startedAtMs,
    parts.environment,
    parts.sky,
    parts.temperatureBand,
    fingerprint.emfMicro,
    fingerprint.lightLux === null ? NULL_PART : fingerprint.lightLux,
    fingerprint.motionQuiet,
    fingerprint.noiseFloorDb === null ? NULL_PART : fingerprint.noiseFloorDb,
    parts.contentVersion,
  ];
}

/**
 * Serialize the parts in a named-field, key-order-stable form: a `JSON.parse`
 * of the result yields the same `SeedParts` values, so this is the verbatim
 * persistence form the session row carries (AD-3), not just the hash preimage.
 * The fields are written in a fixed literal order, so a parts object rebuilt
 * with its keys inserted in a different order serializes identically.
 *
 * `seedValuesFromParts` is the separate positional list the hash consumes; the
 * two stay independent so neither can drift into being the other by accident.
 */
export function serializeSeedParts(parts: SeedParts): string {
  const { coords, fingerprint } = parts;
  return JSON.stringify({
    huntId: parts.huntId,
    coords:
      coords === null
        ? null
        : { lat: coords.lat, lon: coords.lon, accuracyM: coords.accuracyM },
    startedAtMs: parts.startedAtMs,
    environment: parts.environment,
    sky: parts.sky,
    temperatureBand: parts.temperatureBand,
    fingerprint: {
      emfMicro: fingerprint.emfMicro,
      lightLux: fingerprint.lightLux,
      motionQuiet: fingerprint.motionQuiet,
      noiseFloorDb: fingerprint.noiseFloorDb,
    },
    contentVersion: parts.contentVersion,
  });
}
