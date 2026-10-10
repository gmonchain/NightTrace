/**
 * The phase ladder — the transition machine the engine computes itself
 * (AD-25, FR-35, the engine contract `02` §C.8).
 *
 * The ladder is **closed at five** — `QUIET` → `SIGNALS` → `ACTIVITY` →
 * `ENCOUNTER_WINDOW` → `RESOLUTION` — and advances **one step at a time**: each
 * phase has at most one outgoing gate, so a tick can never skip a phase or move
 * backwards. The terminal `ENDED` marker is **not a phase** (it lives in the
 * digest and on the session's `status`), so it has no entry here.
 *
 * A gate is satisfied by **elapsed time and tension together** (T-1.1). The time
 * floor is what stops the ladder racing ahead of the ritual (`QUIET` has real
 * weight); the tension floor is what makes the later phases *earned* — a session
 * whose tension never rises never reaches the window it opens. Transitions are a
 * **table**, never an `if`-chain, so adding a sixth phase would be a deliberate
 * table edit rather than a branch nobody finds.
 *
 * Pure: no clock, no randomness, no I/O. The host supplies `SessionMs`; the
 * engine supplies the tension it computed.
 */

import { SESSION_PHASES, sessionMs, type SessionPhase, type SessionMs } from '../models';

/**
 * The ordered ladder, in force order. It is the closed five, and it is what a
 * consumer iterates to prove the advance order.
 */
export const PHASE_LADDER: readonly SessionPhase[] = SESSION_PHASES;

/** One legal step of the ladder: `from` gives way to `to` once the gates are met. */
export interface PhaseGate {
  readonly from: SessionPhase;
  readonly to: SessionPhase;
  /** The minimum elapsed session time before this step may happen. */
  readonly minElapsedMs: SessionMs;
  /** The minimum tension before this step may happen (`0..100`). */
  readonly minTension: number;
}

/**
 * The transition table. The times mirror the pacing the §C.6 sweep is tuned to
 * (`QUIET` opens the field, `SIGNALS` carries the middle, the window opens late,
 * `RESOLUTION` closes). The tension floor on the window step is the one place
 * tension genuinely gates: only a session that has built pressure reaches it.
 */
export const PHASE_GATES: readonly PhaseGate[] = [
  {
    from: 'QUIET',
    to: 'SIGNALS',
    minElapsedMs: sessionMs(180_000),
    minTension: 0,
  },
  {
    from: 'SIGNALS',
    to: 'ACTIVITY',
    minElapsedMs: sessionMs(480_000),
    minTension: 0,
  },
  {
    from: 'ACTIVITY',
    to: 'ENCOUNTER_WINDOW',
    minElapsedMs: sessionMs(840_000),
    minTension: 5,
  },
  {
    from: 'ENCOUNTER_WINDOW',
    to: 'RESOLUTION',
    minElapsedMs: sessionMs(1_020_000),
    minTension: 0,
  },
];

/** The gait a phase step is judged against. */
export interface PhaseInput {
  /** The elapsed session time at this tick. */
  readonly elapsedMs: number;
  /** The tension the engine computed — the gate tension, never rendered. */
  readonly tension: number;
}

/** The gate a phase may step through, or `null` when it is terminal (`RESOLUTION`). */
export function gateFor(phase: SessionPhase): PhaseGate | null {
  return PHASE_GATES.find((gate) => gate.from === phase) ?? null;
}

/**
 * The phase after `phase` once this tick is done.
 *
 * A tick advances **at most one step**: when a phase's gate is met the next
 * phase is returned, otherwise `phase` itself. `RESOLUTION` has no gate and is
 * returned unchanged — the ladder never runs past its last phase, and `ENDED` is
 * reached only through `finish`, never through a gate.
 */
export function advancePhase(phase: SessionPhase, input: PhaseInput): SessionPhase {
  const gate = gateFor(phase);
  if (gate === null) {
    return phase;
  }
  const timeMet = input.elapsedMs >= gate.minElapsedMs;
  const tensionMet = input.tension >= gate.minTension;
  return timeMet && tensionMet ? gate.to : phase;
}

/** The index of a phase in the ladder — the position the digest order relies on. */
export function phaseRank(phase: SessionPhase): number {
  return PHASE_LADDER.findIndex((entry) => entry === phase);
}
