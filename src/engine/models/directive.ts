/**
 * The `SessionDirective` model (the engine contract `02` §H.3, AD-6).
 *
 * A directive is *editorial authority* over the simulation: the seam that lets
 * a future tutorial, a daily anomaly, or a Director Mode session influence
 * pacing **without the engine knowing who asked**. It **narrows what can
 * happen** — a silence scale, a banned list — and **never specifies what
 * does**: a directive that named an event would turn the engine into a puppet
 * (AD-6).
 *
 * It surfaces to the user as a **verb with no object**: `text` is an
 * object-less imperative that names no phenomenon, no outcome, no direction and
 * no thermal concept. The directive-pool content test greps for exactly that.
 *
 * The *shape* lives here (in `engine/models`) rather than beside
 * `DEFAULT_DIRECTIVE` because the Content layer may import `engine/models` and
 * **nothing else** from the engine (AD-1's `ENGINE_MODELS_ONLY`), and the
 * authored directive pool is content. The directives module re-exports this
 * type, so engine-internal consumers read it from either place.
 */

import type {
  DirectiveId,
  EncounterDefinitionId,
  EventDefinitionId,
  SessionMs,
} from './ids';

/** Why a guaranteed encounter is owed (the engine contract §H.3). */
export type GuaranteedEncounterReason =
  | 'first_run'
  | 'daily_anomaly'
  | 'scripted_intro'
  | 'director';

/**
 * A guaranteed-encounter window. The engine chooses the *moment*; the directive
 * only promises the *arc* (AD-6). No MVP session exercises this yet — the
 * First-Run Directive is Story 5.1 — but the shape is declared so the pool can
 * carry it without an engine edit.
 */
export interface GuaranteedEncounter {
  readonly encounterId: EncounterDefinitionId;
  readonly earliestMs: SessionMs;
  readonly latestMs: SessionMs;
  readonly reason: GuaranteedEncounterReason;
}

/**
 * A directive: the constraints the scheduler honours this session, plus the
 * verb it shows the user. Every field is `readonly` (AD-14).
 */
export interface SessionDirective {
  readonly id: DirectiveId;
  /**
   * The verb the presenter renders — an object-less imperative naming no
   * phenomenon, outcome, direction or thermal concept (AD-6).
   */
  readonly text: string;
  readonly guaranteedEncounters: readonly GuaranteedEncounter[];
  /** Event definitions the scheduler must not select while this is active. */
  readonly bannedEvents: readonly EventDefinitionId[];
  /** Multiplies the silence floor. >1 == quieter; never reaches zero. */
  readonly silenceScale: number;
  /** The tension ceiling this directive imposes (0..100). Story 2.3 reads it. */
  readonly tensionCeiling: number;
  /** "Hold the quiet until at least N" — null means no minimum. */
  readonly minimumDurationMs: SessionMs | null;
  readonly allowEarlyEncounter: boolean;
  /** A conditions line with no mechanics leaked; null means none. */
  readonly flavourNote: string | null;
}
