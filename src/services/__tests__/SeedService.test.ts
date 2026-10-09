import { CONTENT_VERSION } from '@/data/ContentVersion';
import {
  contentVersion,
  epochMs,
  huntId,
  seedValuesFromParts,
  unit,
  type HourBand,
  type SeedParts,
  type SkyCondition,
  type SkyReadout,
} from '@/engine/models';
import { seedFromParts } from '@/engine/RandomEngine';
import { composeSeed, type SeedInput } from '@/services/SeedService';

/**
 * SEED_COMPOSE, SEED_UNCHARTED, SEED_STABLE and CONTENT_VERSION: the seed is
 * composed once, purely, from canonical parts; the same input yields the same
 * seed; an absent place is spelled `null`; and the content version is part of
 * the replay key.
 */
function seedInput(overrides: Partial<SeedInput> = {}): SeedInput {
  return {
    huntId: huntId('the-watcher'),
    coords: { lat: 51.5074, lon: -0.1278, accuracyM: 12 },
    startedAtMs: epochMs(1_700_000_000_000),
    fingerprint: {
      emfMicro: 0.4,
      lightLux: 3,
      motionQuiet: unit(0.9),
      noiseFloorDb: -42,
    },
    environment: 'outdoor_woodland',
    sky: 'clear',
    temperatureBand: 'cold',
    contentVersion: CONTENT_VERSION,
    ...overrides,
  };
}

describe('SeedService.composeSeed', () => {
  it('SEED_COMPOSE: the seed is seedFromParts of the canonical parts', () => {
    const result = composeSeed(seedInput());
    expect(result.seed).toBe(seedFromParts(seedValuesFromParts(result.parts)));
  });

  it('SEED_COMPOSE: parts echo every input field verbatim, including contentVersion', () => {
    const input = seedInput();
    const { parts } = composeSeed(input);
    expect(parts.huntId).toBe(input.huntId);
    expect(parts.coords).toEqual(input.coords);
    expect(parts.startedAtMs).toBe(input.startedAtMs);
    expect(parts.environment).toBe(input.environment);
    expect(parts.sky).toBe(input.sky);
    expect(parts.temperatureBand).toBe(input.temperatureBand);
    expect(parts.fingerprint).toEqual(input.fingerprint);
    expect(parts.contentVersion).toBe(input.contentVersion);
    expect(parts.contentVersion).toBe(CONTENT_VERSION);
  });

  it('SEED_STABLE: the same input twice yields an identical seed and parts', () => {
    const first = composeSeed(seedInput());
    const second = composeSeed(seedInput());
    expect(second.seed).toBe(first.seed);
    expect(second.parts).toEqual(first.parts);
  });

  it('SEED_STABLE: object keys inserted in a different order change nothing', () => {
    // The same values, every key — including nested ones — written in the
    // opposite order.
    const reordered: SeedInput = {
      contentVersion: CONTENT_VERSION,
      temperatureBand: 'cold',
      sky: 'clear',
      environment: 'outdoor_woodland',
      fingerprint: {
        noiseFloorDb: -42,
        motionQuiet: unit(0.9),
        lightLux: 3,
        emfMicro: 0.4,
      },
      startedAtMs: epochMs(1_700_000_000_000),
      coords: { accuracyM: 12, lon: -0.1278, lat: 51.5074 },
      huntId: huntId('the-watcher'),
    };
    const ordered: SeedParts = composeSeed(seedInput()).parts;
    const shuffled: SeedParts = composeSeed(reordered).parts;
    expect(composeSeed(reordered).seed).toBe(composeSeed(seedInput()).seed);
    // The parts values are equal regardless of the order they were written in.
    expect(shuffled).toEqual(ordered);
  });

  it('SEED_UNCHARTED: coords null is carried verbatim and the seed still composes', () => {
    const charted = composeSeed(seedInput());
    const uncharted = composeSeed(seedInput({ coords: null }));
    expect(uncharted.parts.coords).toBeNull();
    // Composed from time + fingerprint alone, not from a place component.
    expect(uncharted.seed).toBe(
      seedFromParts(seedValuesFromParts(uncharted.parts)),
    );
    // A place-less night hashes differently from a charted one.
    expect(uncharted.seed).not.toBe(charted.seed);
    // ... and the session is marked place-less on the conditions board.
    expect(uncharted.conditionsSummary.placeReadout).toBe('Uncharted');
  });

  it('CONTENT_VERSION: two inputs differing only in contentVersion have different seeds', () => {
    const older = composeSeed(
      seedInput({ contentVersion: contentVersion('2026.10.05.1') }),
    );
    const newer = composeSeed(
      seedInput({ contentVersion: contentVersion('2026.10.06.1') }),
    );
    expect(newer.seed).not.toBe(older.seed);
  });

  it('delegates the hash but never reads a clock or a global random source', () => {
    // Purity is provable: the same input composes the same seed with no
    // injected time or entropy.
    expect(composeSeed(seedInput()).seed).toBe(composeSeed(seedInput()).seed);
  });
});

describe('SeedService conditions board', () => {
  it('maps every sky condition to its readout word', () => {
    const cases: ReadonlyArray<readonly [SkyCondition, SkyReadout]> = [
      ['clear', 'clear'],
      ['overcast', 'overcast'],
      ['precipitation', 'rain'],
      ['storm', 'storm'],
      ['fog', 'fog'],
      ['unknown', 'unreadable'],
    ];
    for (const [sky, readout] of cases) {
      expect(composeSeed(seedInput({ sky })).conditionsSummary.skyReadout).toBe(
        readout,
      );
    }
  });

  it('derives the hour band across every boundary', () => {
    const cases: ReadonlyArray<readonly [number, HourBand]> = [
      [18, 'dusk'],
      [21, 'dusk'],
      [22, 'night'],
      [0, 'night'],
      [1, 'deep_night'],
      [4, 'deep_night'],
      [5, 'predawn'],
      [12, 'predawn'],
    ];
    for (const [hour, band] of cases) {
      const startedAtMs = epochMs(Date.UTC(2026, 0, 1, hour, 0, 0));
      expect(
        composeSeed(seedInput({ startedAtMs })).conditionsSummary.hourBand,
      ).toBe(band);
    }
  });

  it('records a charted place and leaves the anomaly and notice inert', () => {
    const board = composeSeed(seedInput()).conditionsSummary;
    expect(board.placeReadout).toBe('Charted');
    expect(board.anomalyOfTheDay).toBe(false);
    expect(board.notice).toBeNull();
  });
});
