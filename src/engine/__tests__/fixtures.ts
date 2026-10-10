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
  SESSION_PHASES,
  contentVersion,
  directiveId,
  epochMs,
  eventDefinitionId,
  eventTableId,
  huntId,
  seedValuesFromParts,
  unit,
  type EngineContent,
  type EventDefinition,
  type EventTable,
  type GeoPoint,
  type SeedParts,
  type SessionDirective,
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

/**
 * A minimal `EngineContent` bundle for the engine tests.
 *
 * The engine may import no `src/data/**` (AD-1), so the engine suites carry
 * their own tiny content. Every phase has a table (the scheduler looks one up
 * by the tick's phase); a single authored event exists per table; and the
 * `silenceFloorMs` is deliberately large (20 s) so a short replay (ticks at
 * 0/5/11 s) draws *no* event and the lifecycle-only assertions stay stable.
 * This is a fixture, not shipped content — the §C.6 pacing bands are measured
 * against `src/data/**` in the content-side sweep.
 */
export function engineContentFixture(): EngineContent {
  const definition = (id: string, oncePerSession: boolean): EventDefinition => ({
    id: eventDefinitionId(id),
    category: 'ambient',
    weight: 1,
    cooldownMs: 0,
    oncePerSession,
    extendsSilenceMs: null,
  });

  const definitions: readonly EventDefinition[] = [
    definition('ambient_hush', false),
    definition('far_echo', true),
  ];

  const tables: readonly EventTable[] = SESSION_PHASES.map((phase) => ({
    id: eventTableId(`table_${phase.toLowerCase()}`),
    phase,
    entries: [
      { definitionId: eventDefinitionId('ambient_hush'), weight: 1 },
      { definitionId: eventDefinitionId('far_echo'), weight: 0.5 },
    ],
    // Silence is always a valid draw, even in the fixture (AD-5).
    emptyWeight: 0.5,
    silenceFloorMs: 20_000,
    intervalMeanMs: 30_000,
  }));

  const directives: readonly SessionDirective[] = [
    {
      id: directiveId('hold_still'),
      text: 'Hold still.',
      guaranteedEncounters: [],
      bannedEvents: [],
      silenceScale: 1,
      tensionCeiling: 100,
      minimumDurationMs: null,
      allowEarlyEncounter: false,
      flavourNote: null,
    },
  ];

  return { definitions, tables, directives };
}
