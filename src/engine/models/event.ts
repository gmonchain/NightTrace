/**
 * The event model — the content the scheduler reads (the engine contract `02`
 * §H.7, AD-5).
 *
 * This is the **scheduler-relevant subset** of §H.7's `EventDefinition` and
 * `EventTable`: the fields the Story 2.2 scheduler consults. The digest
 * requirements, tension bands, evidence specs, audio and haptic cues arrive
 * with the stories that consume them (2.3+ for tension/phase fields, Epic 3 for
 * evidence), so nothing here is pre-added.
 *
 * The one field that is a rule rather than a preference is `EventTable.emptyWeight`:
 * it is strictly greater than zero in every shipped table (AD-5), so a checkpoint
 * can always resolve to *nothing*. Silence is authored, tunable and testable —
 * never the absence of a decision.
 */

import type { EventDefinitionId, EventTableId } from './ids';
import type { SessionPhase } from './phase';

/**
 * What an event *is*, at the level the scheduler and the presenter care about.
 * `silence` is a real category: a `silence` event does not emit — it extends the
 * floor (AD-5, the engine contract §I.3).
 */
export type EventCategory =
  | 'ambient'
  | 'signal'
  | 'bait'
  | 'escalation'
  | 'retreat'
  | 'false_positive'
  | 'ritual'
  | 'silence';

/** The closed category set, as a value — what a validation test closes over. */
export const EVENT_CATEGORIES: readonly EventCategory[] = [
  'ambient',
  'signal',
  'bait',
  'escalation',
  'retreat',
  'false_positive',
  'ritual',
  'silence',
];

/**
 * One authored event, reduced to what the scheduler needs. Every field is
 * `readonly` (AD-14). `cooldownMs` and `oncePerSession` are supplied by content,
 * but the *rule* that enforces them lives in the engine (FR-2) — a content
 * change alone can never make the firing pattern learnable.
 */
export interface EventDefinition {
  readonly id: EventDefinitionId;
  readonly category: EventCategory;
  /** The relative selection weight when this definition is a table entry. */
  readonly weight: number;
  /** Engine-enforced minimum gap before this definition may fire again. */
  readonly cooldownMs: number;
  /** When true, the definition fires at most once in a whole session. */
  readonly oncePerSession: boolean;
  /**
   * A `silence`-category definition's floor extension. Non-null means "this
   * event *is* silence" — it widens the next gap instead of emitting (AD-5).
   */
  readonly extendsSilenceMs: number | null;
}

/** A table entry: a definition id and its selection weight (the engine contract §H.7). */
export interface WeightedEvent {
  readonly definitionId: EventDefinitionId;
  readonly weight: number;
}

/**
 * A phase-keyed weighted table (the engine contract §H.7, AD-5).
 *
 * `emptyWeight` is the weight of *nothing happening* and is always strictly
 * greater than zero in shipped content. `silenceFloorMs` is the hard floor of a
 * drawn gap and `intervalMeanMs` is the mean of its exponential tail — the
 * memoryless shape the silence rule draws (Story 2.2's §C.6 pacing targets).
 */
export interface EventTable {
  readonly id: EventTableId;
  readonly phase: SessionPhase;
  readonly entries: readonly WeightedEvent[];
  /** The weight of *nothing happening* — always strictly greater than zero. */
  readonly emptyWeight: number;
  /** The minimum gap between emissions, before the directive's scale. */
  readonly silenceFloorMs: number;
  /** The mean of the exponential tail of the gap — memoryless (FR-2). */
  readonly intervalMeanMs: number;
}

/** A type guard over the closed category set — the way a JSON boundary proves one. */
export function isEventCategory(value: string): value is EventCategory {
  return EVENT_CATEGORIES.some((category) => category === value);
}
