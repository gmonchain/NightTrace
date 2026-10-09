import {
  serializeSeedParts,
  seedValuesFromParts,
  type SeedParts,
} from '@/engine/models';
import { seedFromParts } from '@/engine/RandomEngine';

import { partsFixture } from './fixtures';

/**
 * SEED_STABLE, at the parts layer: the canonical value list and the serialized
 * form must not depend on the order a caller inserted an object's keys.
 */
describe('seed parts', () => {
  it('seedValuesFromParts is order-independent', () => {
    const ordered = partsFixture();
    // The same values, every key (including nested ones) written in the
    // opposite order: identity is by name, not by insertion order.
    const reordered: SeedParts = {
      fingerprint: {
        noiseFloorDb: -42,
        motionQuiet: partsFixture().fingerprint.motionQuiet,
        lightLux: 3,
        emfMicro: 0.4,
      },
      contentVersion: ordered.contentVersion,
      temperatureBand: ordered.temperatureBand,
      sky: ordered.sky,
      environment: ordered.environment,
      startedAtMs: ordered.startedAtMs,
      coords: {
        accuracyM: ordered.coords?.accuracyM ?? 0,
        lon: ordered.coords?.lon ?? 0,
        lat: ordered.coords?.lat ?? 0,
      },
      huntId: ordered.huntId,
    };
    expect(seedValuesFromParts(reordered)).toEqual(
      seedValuesFromParts(ordered),
    );
    expect(seedFromParts(seedValuesFromParts(reordered))).toBe(
      seedFromParts(seedValuesFromParts(ordered)),
    );
  });

  it('SEED_STABLE: serializeSeedParts is identical under key reordering', () => {
    const ordered = partsFixture();
    const reordered: SeedParts = {
      contentVersion: ordered.contentVersion,
      fingerprint: ordered.fingerprint,
      temperatureBand: ordered.temperatureBand,
      sky: ordered.sky,
      environment: ordered.environment,
      startedAtMs: ordered.startedAtMs,
      coords: ordered.coords,
      huntId: ordered.huntId,
    };
    expect(serializeSeedParts(reordered)).toBe(serializeSeedParts(ordered));
  });

  it('spells an absent place with the null sentinel, not an omission', () => {
    const uncharted = partsFixture({ coords: null });
    expect(seedValuesFromParts(uncharted)).toContain('null');
    // A charted and an uncharted night hash differently.
    expect(seedFromParts(seedValuesFromParts(uncharted))).not.toBe(
      seedFromParts(seedValuesFromParts(partsFixture())),
    );
  });

  it('serializes a named-field form that round-trips to the same parts', () => {
    const parts = partsFixture();
    expect(JSON.parse(serializeSeedParts(parts))).toEqual(parts);
  });
});
