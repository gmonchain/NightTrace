/**
 * The engine's only output (AD-2): a fold returns `Emission[]` and mutates
 * nothing.
 *
 * Story 2.1 defines the `notice` variant — the lifecycle speech the pure
 * `(seed, tick input) → Emission[]` fold emits at the start and the end of a
 * session. Story 2.2 adds `event` (a scheduled emission) and `directive` (an
 * editorial verb with no object); 2.3 adds `phase`, Epic 3 adds `evidence`, and
 * the rest follow. Because every variant is tagged `kind` and every consumer
 * switches exhaustively with `default: assertNever`, each addition is a compile
 * error until it is handled — which is what keeps a growing engine honest.
 */

import type { EventCategory } from './event';
import type { DirectiveId, EventDefinitionId, SessionMs, Unit } from './ids';

/** The lifecycle notice codes this story can emit. The union grows per story. */
export type EngineNotice = 'session_started' | 'session_ended';

/** The `notice` variant — the lifecycle speech 2.1 defines. */
export interface NoticeEmission {
  readonly kind: 'notice';
  readonly notice: EngineNotice;
}

/**
 * The `event` variant — a scheduled emission (Story 2.2). It carries the
 * definition id, its category, when it fired and an internal strength. Notices
 * follow immediately: the label, body, audio and haptic cues arrive with their
 * stories (2.3+ for tension/phase, Epic 3 for evidence); 2.2 emits the
 * scheduler's own vocabulary.
 */
export interface EventEmission {
  readonly kind: 'event';
  readonly definitionId: EventDefinitionId;
  readonly category: EventCategory;
  readonly atMs: SessionMs;
  /** The internal strength of the moment. Never rendered as a number (AD-15). */
  readonly strength: Unit;
}

/**
 * The `directive` variant — an editorial verb with no object (Story 2.2,
 * AD-6). The text names no phenomenon, outcome, direction or thermal concept;
 * the scheduler never emits one that names an event.
 */
export interface DirectiveEmission {
  readonly kind: 'directive';
  readonly directiveId: DirectiveId;
  readonly text: string;
  readonly atMs: SessionMs;
}

/** The complete output union. Grows one variant per story. */
export type Emission = NoticeEmission | EventEmission | DirectiveEmission;

/**
 * The exhaustiveness gate. A consumer's `switch` ends `default:
 * assertNever(value)`, so an unhandled variant is a compile error at every
 * consumer rather than a value silently dropped on the floor. It is generic —
 * useful for any closed union, not only `Emission`.
 */
export function assertNever(value: never): never {
  throw new Error(`Unhandled variant: ${JSON.stringify(value)}`);
}
