/**
 * Shared engine-test fixtures.
 *
 * The engine tests act as the host: they must build branded model values and a
 * `SessionSeed` without reaching into the Shell (AD-1 forbids an engine file,
 * tests included, from importing `react`/`expo*`/`services/**`). The brand
 * factories in `engine/models/ids` and `seedFromParts` make every value here
 * cast-free.
 */

import {
  contentVersion,
  epochMs,
  huntId,
  seedValuesFromParts,
  unit,
  type GeoPoint,
  type SeedParts,
  type SessionSeed,
} from '@/engine/models';
import { seedFromParts } from '@/engine/RandomEngine';

export const CHARTED_COORDS: GeoPoint = {
  lat: 51.5074,
  lon: -0.1278,
  accuracyM: 12,
};

export function partsFixture(overrides: Partial<SeedParts> = {}): SeedParts {
  return {
    huntId: huntId('the-watcher'),
    coords: CHARTED_COORDS,
    startedAtMs: epochMs(1_700_000_000_000),
    environment: 'outdoor_woodland',
    sky: 'clear',
    temperatureBand: 'cold',
    fingerprint: {
      emfMicro: 0.4,
      lightLux: 3,
      motionQuiet: unit(0.9),
      noiseFloorDb: -42,
    },
    contentVersion: contentVersion('2026.10.05.1'),
    ...overrides,
  };
}

export function sessionSeedFixture(
  overrides: Partial<SeedParts> = {},
): SessionSeed {
  const parts = partsFixture(overrides);
  return {
    seed: seedFromParts(seedValuesFromParts(parts)),
    parts,
    conditionsSummary: {
      anomalyOfTheDay: false,
      skyReadout: 'clear',
      hourBand: 'night',
      placeReadout: parts.coords === null ? 'Uncharted' : 'Charted',
      notice: null,
    },
  };
}
