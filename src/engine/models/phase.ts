/**
 * The closed session-phase vocabulary (AD-25) — Story 2.2's share of it.
 *
 * The engine's phase ladder is **closed at five** — `QUIET` → `SIGNALS` →
 * `ACTIVITY` → `ENCOUNTER_WINDOW` → `RESOLUTION` — followed by a terminal
 * `ENDED` marker that is **not** a phase and is not counted in the run-length
 * replay digest (AD-3). The user-visible four-word ladder (`QUIET` →
 * `LISTENING` → `ACTIVE` → `CONTACT`) is a separate vocabulary and belongs to
 * Story 2.3.
 *
 * Story 2.2 defines the *vocabulary* only. The transition machine, the tension
 * gates that decide when a phase gives way to the next, and the user-visible
 * ladder are all Story 2.3 — so the phase is an **input** here (`TickInput.phase`),
 * supplied by the host, and the scheduler keys its event table off it. Nothing
 * defined in this file is discarded when 2.3 computes the phase for real; it is
 * the vocabulary 2.3 fills.
 */

/** The five phases, in fixed order. A tick always carries one of these. */
export type SessionPhase =
  | 'QUIET'
  | 'SIGNALS'
  | 'ACTIVITY'
  | 'ENCOUNTER_WINDOW'
  | 'RESOLUTION';

/** The ordered five, as a value — the closed set every consumer iterates. */
export const SESSION_PHASES: readonly SessionPhase[] = [
  'QUIET',
  'SIGNALS',
  'ACTIVITY',
  'ENCOUNTER_WINDOW',
  'RESOLUTION',
];

/**
 * The terminal marker. It is deliberately **not** a member of `SessionPhase`:
 * a session that has ended is no longer in a phase, and the RLE digest (2.3)
 * must not count it. Keeping it a distinct type is what stops `phase === 'ENDED'`
 * from type-checking somewhere a real phase is required.
 */
export type SessionTerminalPhase = 'ENDED';

/** The one terminal marker value, spelled once. */
export const SESSION_TERMINAL_PHASE: SessionTerminalPhase = 'ENDED';

/**
 * Every value the phase vocabulary names — the five phases plus the terminal
 * marker, in order. The set a validation test closes over.
 */
export const SESSION_PHASE_VOCABULARY: readonly (
  | SessionPhase
  | SessionTerminalPhase
)[] = [...SESSION_PHASES, SESSION_TERMINAL_PHASE];

/** Any value the phase vocabulary names. */
export type SessionPhaseVocabulary =
  | SessionPhase
  | SessionTerminalPhase;

/** A type guard over the closed five — the way a JSON boundary proves a phase. */
export function isSessionPhase(value: string): value is SessionPhase {
  return (SESSION_PHASES as readonly string[]).includes(value);
}
