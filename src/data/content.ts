/**
 * The content registry (the Content layer's edge to the engine).
 *
 * It loads the bundled JSON — a `resolveJsonModule` import, so a typo in a
 * table fails the build — and narrows it into the engine's models, branding
 * every id at this boundary (AD-14: an `as` amount is admissible here, and only
 * here, but we prefer the model's own guards). The Content layer may import
 * `engine/models` and **nothing else** from the engine (AD-1), so this file
 * reads `EngineContent` and the model shapes from one place.
 *
 * Story 2.2's content is **engine-level**: FR-8 (a Hunt binding a Phenomenon to
 * tools, environment and pacing) is Epic 5, and `tableForPhase` is the seam a
 * later `HuntDefinition` binds to. Nothing here is hunt-bound.
 */

import {
  directiveId,
  encounterDefinitionId,
  eventDefinitionId,
  eventTableId,
  isEventCategory,
  isSessionPhase,
  sessionMs,
  type EngineContent,
  type EventDefinition,
  type EventTable,
  type GuaranteedEncounterReason,
  type SessionDirective,
  type SessionPhase,
} from '@/engine/models';
import { invariant } from '@/util/result';

import directivesJson from './directives/pool.json';
import definitionsJson from './events/definitions.json';
import tablesJson from './events/tables.json';

/** A raw definition object as it appears in `events/definitions.json`. */
type RawDefinition = (typeof definitionsJson)[number];
/** A raw table object as it appears in `events/tables.json`. */
type RawTable = (typeof tablesJson)[number];
/** A raw guaranteed-encounter window as it appears in `directives/pool.json`. */
interface RawGuaranteedEncounter {
  readonly encounterId: string;
  readonly earliestMs: number;
  readonly latestMs: number;
  readonly reason: GuaranteedEncounterReason;
}

/**
 * A raw directive object as it appears in `directives/pool.json`. The shape is
 * declared explicitly rather than inferred from the JSON literal: every shipped
 * `guaranteedEncounters` is empty, so inference collapses the array element to
 * `never` and the named fields below stop type-checking. Declaring the raw shape
 * keeps this a *typed* loader — the JSON is checked against it at the boundary.
 */
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

function toDefinition(raw: RawDefinition): EventDefinition {
  invariant(
    isEventCategory(raw.category),
    `content: unknown event category "${raw.category}" on definition "${raw.id}"`,
  );
  return {
    id: eventDefinitionId(raw.id),
    category: raw.category,
    weight: raw.weight,
    cooldownMs: raw.cooldownMs,
    oncePerSession: raw.oncePerSession,
    extendsSilenceMs: raw.extendsSilenceMs,
  };
}

function toTable(raw: RawTable): EventTable {
  invariant(
    isSessionPhase(raw.phase),
    `content: unknown phase "${raw.phase}" on table "${raw.id}"`,
  );
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
}

function toDirective(raw: RawDirective): SessionDirective {
  return {
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
  };
}

/** Every authored event definition. */
export const EVENT_DEFINITIONS: readonly EventDefinition[] =
  definitionsJson.map(toDefinition);

/** Every authored phase-keyed event table. */
export const EVENT_TABLES: readonly EventTable[] = tablesJson.map(toTable);

/** The authored directive pool — object-less verbs, drawn by the scheduler. */
export const DIRECTIVES: readonly SessionDirective[] = directivesJson.map(toDirective);

/** The bundle `createInvestigationEngine` takes as `deps.content`. */
export const CONTENT: EngineContent = {
  definitions: EVENT_DEFINITIONS,
  tables: EVENT_TABLES,
  directives: DIRECTIVES,
};

/** The one table in force for a phase. Throws when content has not authored one. */
export function tableForPhase(phase: SessionPhase): EventTable {
  const table = EVENT_TABLES.find((entry) => entry.phase === phase);
  invariant(
    table !== undefined,
    `tableForPhase: content has no event table for phase ${phase}`,
  );
  return table;
}

/** The definition for an id, or `null` when content does not name it. */
export function definitionFor(
  id: EventDefinition['id'],
): EventDefinition | null {
  return EVENT_DEFINITIONS.find((entry) => entry.id === id) ?? null;
}
