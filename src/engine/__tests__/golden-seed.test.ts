import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  assertNever,
  directiveId,
  encounterDefinitionId,
  eventDefinitionId,
  eventTableId,
  isEventCategory,
  isSessionPhase,
  sessionMs,
  type EngineContent,
  type EventDefinition,
  type GuaranteedEncounterReason,
  type SessionDirective,
} from '@/engine/models';
import { defaultPhaseSchedule, replaySession, replaySessionSeed } from '@/engine/replay';

import fixture from './golden/fixture.json';

/**
 * GOLDEN_SEED: the committed fixture (seed + hunt + content version + expected
 * emission sequence) replays identically against the *shipped* content.
 *
 * The engine may import no `src/data/**` (AD-1), so this test reads the shipped
 * content JSON through Node's `fs` — not an import — and narrows it into the
 * engine models here, at the boundary. A change to a shipped table weight or gap
 * therefore diverges the replay and fails this test; `@/engine/__tests__`'s
 * sibling gate, `npm run golden:seed`, checks the same fixture through Vite.
 */

interface RawDefinition {
  readonly id: string;
  readonly category: string;
  readonly weight: number;
  readonly cooldownMs: number;
  readonly oncePerSession: boolean;
  readonly extendsSilenceMs: number | null;
}

interface RawEntry {
  readonly definitionId: string;
  readonly weight: number;
}

interface RawTable {
  readonly id: string;
  readonly phase: string;
  readonly entries: readonly RawEntry[];
  readonly emptyWeight: number;
  readonly silenceFloorMs: number;
  readonly intervalMeanMs: number;
}

interface RawGuaranteedEncounter {
  readonly encounterId: string;
  readonly earliestMs: number;
  readonly latestMs: number;
  readonly reason: GuaranteedEncounterReason;
}

interface RawDirective {
  readonly id: string;
  readonly text: string;
  readonly guaranteedEncounters: readonly RawGuaranteedEncounter[];
  readonly bannedEvents: readonly string[];
  readonly silenceScale: number;
  readonly tensionCeiling: number;
  readonly minimumDurationMs: number | null;
  readonly allowEarlyEncounter: boolean;
  readonly flavourNote: string | null;
}

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.resolve(HERE, '..', '..', 'data');

/** Parse one shipped JSON file. `JSON.parse` is the untrusted boundary. */
function readShipped<T>(relative: string): T {
  return JSON.parse(readFileSync(path.join(DATA, relative), 'utf8')) as T;
}

function loadShippedContent(): EngineContent {
  const definitions: readonly EventDefinition[] = readShipped<RawDefinition[]>(
    'events/definitions.json',
  ).map((raw) => {
    if (!isEventCategory(raw.category)) {
      throw new Error(`golden: unknown category "${raw.category}"`);
    }
    return {
      id: eventDefinitionId(raw.id),
      category: raw.category,
      weight: raw.weight,
      cooldownMs: raw.cooldownMs,
      oncePerSession: raw.oncePerSession,
      extendsSilenceMs: raw.extendsSilenceMs,
    };
  });

  const tables = readShipped<RawTable[]>('events/tables.json').map((raw) => {
    if (!isSessionPhase(raw.phase)) {
      throw new Error(`golden: unknown phase "${raw.phase}"`);
    }
    return {
      id: eventTableId(raw.id),
      phase: raw.phase,
      entries: raw.entries.map((entry) => ({
        definitionId: eventDefinitionId(entry.definitionId),
        weight: entry.weight,
      })),
      emptyWeight: raw.emptyWeight,
      silenceFloorMs: raw.silenceFloorMs,
      intervalMeanMs: raw.intervalMeanMs,
    };
  });

  const directives: readonly SessionDirective[] = readShipped<RawDirective[]>(
    'directives/pool.json',
  ).map((raw) => ({
    id: directiveId(raw.id),
    text: raw.text,
    guaranteedEncounters: raw.guaranteedEncounters.map((encounter) => ({
      encounterId: encounterDefinitionId(encounter.encounterId),
      earliestMs: sessionMs(encounter.earliestMs),
      latestMs: sessionMs(encounter.latestMs),
      reason: encounter.reason,
    })),
    bannedEvents: raw.bannedEvents.map(eventDefinitionId),
    silenceScale: raw.silenceScale,
    tensionCeiling: raw.tensionCeiling,
    minimumDurationMs:
      raw.minimumDurationMs === null ? null : sessionMs(raw.minimumDurationMs),
    allowEarlyEncounter: raw.allowEarlyEncounter,
    flavourNote: raw.flavourNote,
  }));

  return { definitions, tables, directives };
}

/**
 * A stable, explicit serialization of one emission — the replay comparison key.
 * It names every field, so a new field on the event emission is a compile error
 * here until it is reviewed, exactly as a consumer's `default: never` arm would
 * be.
 */
function serialize(emission: ReturnType<typeof replaySession>[number]): unknown {
  switch (emission.kind) {
    case 'notice':
      return { kind: 'notice', notice: emission.notice };
    case 'event':
      return {
        kind: 'event',
        definitionId: emission.definitionId,
        category: emission.category,
        atMs: emission.atMs,
        strength: emission.strength,
      };
    case 'directive':
      return {
        kind: 'directive',
        directiveId: emission.directiveId,
        text: emission.text,
        atMs: emission.atMs,
      };
    default:
      return assertNever(emission);
  }
}

describe('GOLDEN_SEED: the committed fixture replays identically', () => {
  it('replays the shipped content to the committed emission sequence', () => {
    const session = replaySessionSeed({
      seed: fixture.seed,
      huntId: fixture.huntId,
      contentVersion: fixture.contentVersion,
    });
    const schedule = defaultPhaseSchedule(fixture.durationMs);
    const actual = replaySession(session, loadShippedContent(), schedule).map(
      serialize,
    );
    expect(actual).toEqual(fixture.expected);
  });

  it('pins the schedule the fixture was recorded on', () => {
    const schedule = defaultPhaseSchedule(fixture.durationMs);
    expect(schedule.tickMs).toBe(fixture.tickMs);
    expect(schedule.durationMs).toBe(fixture.durationMs);
  });

  it('begins with the lifecycle notice and has a non-trivial sequence', () => {
    expect(fixture.expected[0]).toEqual({
      kind: 'notice',
      notice: 'session_started',
    });
    expect(fixture.expected.length).toBeGreaterThan(5);
  });
});
