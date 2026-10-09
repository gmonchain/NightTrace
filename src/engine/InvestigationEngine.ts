/**
 * The pure investigation engine — the functional core (AD-1, AD-2).
 *
 * `createInvestigationEngine(session)` derives its own `RandomEngine` from
 * `session.seed` (**never injected**), so two replays cannot diverge because a
 * host handed them different generators. `tick(input)` is a fold over immutable
 * state: it returns a **new** `SimulationState`, never mutating the one it was
 * given, and never reads a wall clock — the host supplies `SessionMs` and
 * `TickIndex` on every `TickInput`.
 *
 * Story 2.1 lands the shape and the determinism guarantees and nothing else.
 * `tick` emits `notice: 'session_started'` on the first tick; `finish(reason)`
 * emits `notice: 'session_ended'`. `TickInput` grows additively (`digest` in
 * 2.4, `userActions` in Epic 4) — its fields are not pre-added here.
 */

import { invariant } from '@/util/result';

import { createRandomEngine } from './RandomEngine';
import type { RandomState } from './RandomEngine';
import type {
  Emission,
  EngineNotice,
  HuntId,
  Seed,
  SessionMs,
  SessionSeed,
  TickIndex,
} from './models';

/** Why a session ended. `finish` records one of these; the seal rules arrive in 2.5. */
export type SessionEndReason =
  | 'user_finished'
  | 'user_left_field'
  | 'time_cap_reached'
  | 'battery_guard'
  | 'app_killed'
  | 'storage_guard';

export type SimulationStatus = 'ready' | 'running' | 'ended';

/** The immutable simulation state a tick returns. Every field is `readonly`. */
export interface SimulationState {
  readonly seed: Seed;
  readonly huntId: HuntId;
  readonly status: SimulationStatus;
  /** The host's tick index; `null` before the first tick. */
  readonly tickIndex: TickIndex | null;
  /** The host's elapsed session time; `null` before the first tick. */
  readonly elapsedMs: SessionMs | null;
  readonly endReason: SessionEndReason | null;
}

/** Everything one tick receives. The host supplies time; the engine reads no clock. */
export interface TickInput {
  readonly tickIndex: TickIndex;
  readonly elapsedMs: SessionMs;
}

export interface TickResult {
  /** The post-tick state — a new object, never the input state mutated. */
  readonly state: SimulationState;
  readonly emissions: readonly Emission[];
  /** The post-tick `rng` snapshot, so a replay can be compared tick by tick. */
  readonly rng: RandomState;
}

export interface InvestigationEngine {
  state(): Readonly<SimulationState>;
  tick(input: TickInput): TickResult;
  finish(reason: SessionEndReason): TickResult;
}

function notice(notice: EngineNotice): Emission {
  return { kind: 'notice', notice };
}

export function createInvestigationEngine(
  session: SessionSeed,
): InvestigationEngine {
  const rng = createRandomEngine(session.seed);

  let state: SimulationState = {
    seed: session.seed,
    huntId: session.parts.huntId,
    status: 'ready',
    tickIndex: null,
    elapsedMs: null,
    endReason: null,
  };

  return {
    state(): Readonly<SimulationState> {
      return state;
    },

    tick(input: TickInput): TickResult {
      invariant(
        state.status !== 'ended',
        'InvestigationEngine.tick: the session has already ended',
      );
      const first = state.status === 'ready';
      state = {
        ...state,
        status: 'running',
        tickIndex: input.tickIndex,
        elapsedMs: input.elapsedMs,
      };
      return {
        state,
        emissions: first ? [notice('session_started')] : [],
        rng: rng.snapshot(),
      };
    },

    finish(reason: SessionEndReason): TickResult {
      invariant(
        state.status !== 'ended',
        'InvestigationEngine.finish: the session has already ended',
      );
      state = {
        ...state,
        status: 'ended',
        endReason: reason,
      };
      return {
        state,
        emissions: [notice('session_ended')],
        rng: rng.snapshot(),
      };
    },
  };
}
