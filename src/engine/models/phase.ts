/**
 * The closed session-phase vocabulary and the separate user-visible ladder
 * (AD-25).
 *
 * The engine's phase ladder is **closed at five** — `QUIET` → `SIGNALS` →
 * `ACTIVITY` → `ENCOUNTER_WINDOW` → `RESOLUTION` — followed by a terminal
 * `ENDED` marker that is **not** a phase and is not counted in the run-length
 * replay digest (AD-3). The user-visible state is a **separate four-word ladder**
 * (`QUIET` → `LISTENING` → `ACTIVE` → `CONTACT`), rendered as a hairline; the
 * user is never told what either means (AD-25, AD-27).
 *
 * Story 2.2 defined the five-phase vocabulary and the terminal marker; 2.3 adds
 * the four-word ladder, `stateWordFor` — the one explicit mapping between the two
 * — and hands the transition machine to `rules/phases.ts`. The two ladders are
 * **distinct types**: `SessionStateWord` and `SessionPhase` are never assignable
 * to each other, so a build that conflates them is a compile error rather than a
 * corrupt replay digest (the phase count is baked into the RLE codec).
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
  return SESSION_PHASES.some((phase) => phase === value);
}

/**
 * The user-visible state ladder — **four words**, distinct from the five-phase
 * engine ladder (AD-25, addendum §C.8). It is the *only* vocabulary a rendered
 * surface may show; the two ladders are never conflated in code or copy.
 */
export type SessionStateWord = 'QUIET' | 'LISTENING' | 'ACTIVE' | 'CONTACT';

/** The ordered four, as a value — the closed set the presenter iterates. */
export const SESSION_STATE_WORDS: readonly SessionStateWord[] = [
  'QUIET',
  'LISTENING',
  'ACTIVE',
  'CONTACT',
];

/**
 * The one explicit mapping from the engine's five phases to the user's four
 * words. The ladders do not map one-to-one — `ENCOUNTER_WINDOW` and
 * `RESOLUTION` both read as `CONTACT`, because the hairline advances on phase
 * completion while the word tracks what the user should *believe* is happening
 * (addendum §C.8). This is the only place the two are allowed to touch.
 */
const STATE_WORD_BY_PHASE: Readonly<Record<SessionPhase, SessionStateWord>> = {
  QUIET: 'QUIET',
  SIGNALS: 'LISTENING',
  ACTIVITY: 'ACTIVE',
  ENCOUNTER_WINDOW: 'CONTACT',
  RESOLUTION: 'CONTACT',
};

/** The user-visible word for an engine phase. Every phase maps to exactly one. */
export function stateWordFor(phase: SessionPhase): SessionStateWord {
  return STATE_WORD_BY_PHASE[phase];
}

/** A type guard over the closed four — the way a JSON boundary proves a word. */
export function isSessionStateWord(value: string): value is SessionStateWord {
  return SESSION_STATE_WORDS.some((word) => word === value);
}
