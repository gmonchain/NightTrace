/**
 * The pure investigation engine — the functional core (AD-1, AD-2).
 *
 * `createInvestigationEngine(session, deps)` derives its own `RandomEngine` from
 * `session.seed` (**never injected**), so two replays cannot diverge because a
 * host handed them different generators, and forks the two labelled substreams
 * the schedulers use — `rng.events` for the event scheduler and `rng.session`
 * for the directive scheduler — **once, at construction**. `tick(input)` is a
 * fold over immutable state: it returns a **new** `SimulationState`, never
 * mutating the one it was given, and never reads a wall clock — the host
 * supplies `SessionMs`, `TickIndex` and the tick's drivers.
 *
 * Story 2.1 landed the shape and the determinism guarantees; Story 2.2 made the
 * engine *emit*; Story 2.3 gives the session a **shape**. `tick` now computes the
 * **hidden tension** (`rules/tension.ts`) and, from it, the **phase ladder**
 * (`rules/phases.ts`) — the host no longer supplies the phase. A phase change
 * emits the `phase` variant carrying the user-visible state word, and every tick
 * appends its outcome to the run-length-encoded digest (`models/digest.ts`).
 * `TickInput` carries the two tension drivers the host owns (`movement` and
 * `sensorAnomaly`), both `unit(0)` until the sensor hub of Story 2.4 and the user
 * actions of Epic 4. The content the schedulers read (definitions, tables,
 * directives) still arrives as a `deps` argument, because the engine may not
 * import `src/data/**` (AD-1).
 */

import { invariant } from '@/util/result';

import {
  DIRECTIVE_MAX_PER_SESSION,
  DIRECTIVE_MIN_SPACING_MS,
  createDirectiveScheduler,
} from './directives/DirectiveScheduler';
import type {
  DirectiveScheduler,
  DirectiveState,
} from './directives/DirectiveScheduler';
import { DEFAULT_DIRECTIVE } from './directives/SessionDirective';
import { createScheduler } from './EventScheduler';
import type { EventScheduler, SchedulerState } from './EventScheduler';
import { createRandomEngine } from './RandomEngine';
import type { RandomState } from './RandomEngine';
import type {
  DigestSegment,
  Emission,
  EngineContent,
  EngineNotice,
  EventDefinition,
  EventDefinitionId,
  EventTable,
  HuntId,
  Seed,
  SessionMs,
  SessionPhase,
  SessionSeed,
  SessionStateWord,
  TickDigest,
  TickIndex,
  Unit,
} from './models';
import { SESSION_TERMINAL_PHASE, appendDigest, sessionMs, stateWordFor } from './models';
import { advancePhase } from './rules/phases';
import { updateTension } from './rules/tension';

/** Why a session ended. `finish` records one of these; the seal rules arrive in 2.5. */
export type SessionEndReason =
  | 'user_finished'
  | 'user_left_field'
  | 'time_cap_reached'
  | 'battery_guard'
  | 'app_killed'
  | 'storage_guard';

export type SimulationStatus = 'ready' | 'running' | 'ended';

/**
 * The content the schedulers read. Delivered as a dependency rather than
 * imported, because the engine may not import `src/data/**` (AD-1); `content.ts`
 * in the Content layer builds exactly this bundle from the bundled JSON. The
 * shape itself lives in `engine/models/content.ts` so content can name it too.
 */
export type { EngineContent };

/** Everything the engine needs besides the session seed. Grows additively. */
export interface EngineDeps {
  readonly content: EngineContent;
}

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
  /** The engine's own phase; `null` before the first tick. Story 2.3 computes it. */
  readonly phase: SessionPhase | null;
  /** The user-visible word for `phase`; `null` before the first tick (AD-25). */
  readonly stateWord: SessionStateWord | null;
  /** The hidden `0..100` tension (AD-26) — never emitted, never rendered. */
  readonly tension: number;
  /**
   * The run-length-encoded tick digest so far — the replay key's record of each
   * tick's phase, never one entry per tick (AD-3, §I.6).
   */
  readonly digest: readonly DigestSegment[];
  /** The engine-held cooldown / anti-repeat state (FR-2). */
  readonly scheduler: SchedulerState;
  /** The engine-held directive cadence state (AD-6). */
  readonly directive: DirectiveState;
}

/**
 * Everything one tick receives. The host supplies time and the two tension
 * drivers — **not the phase**: the engine computes its own ladder (Story 2.3).
 * `movement` and `sensorAnomaly` are `unit(0)` until the sensor hub (2.4) and
 * the user actions (Epic 4) supply them.
 */
export interface TickInput {
  readonly tickIndex: TickIndex;
  readonly elapsedMs: SessionMs;
  /** `0..1` movement from the sensor hub; `unit(0)` until Story 2.4. */
  readonly movement: Unit;
  /** `0..1` sensor anomaly; `unit(0)` until Story 2.4. */
  readonly sensorAnomaly: Unit;
}

export interface TickResult {
  /** The post-tick state — a new object, never the input state mutated. */
  readonly state: SimulationState;
  readonly emissions: readonly Emission[];
  /** The post-tick `rng.events` snapshot — the stream that drove emissions. */
  readonly rng: RandomState;
  /** This tick's digest value: the phase it ran in, or the terminal `ENDED`. */
  readonly digest: TickDigest;
}

export interface InvestigationEngine {
  state(): Readonly<SimulationState>;
  tick(input: TickInput): TickResult;
  finish(reason: SessionEndReason): TickResult;
}

function notice(notice: EngineNotice): Emission {
  return { kind: 'notice', notice };
}

/** Index the content the schedulers consult, once, at construction. */
function index(content: EngineContent): {
  readonly definitions: ReadonlyMap<EventDefinitionId, EventDefinition>;
  readonly tables: ReadonlyMap<SessionPhase, EventTable>;
} {
  const definitions = new Map<EventDefinitionId, EventDefinition>();
  for (const definition of content.definitions) {
    definitions.set(definition.id, definition);
  }
  const tables = new Map<SessionPhase, EventTable>();
  for (const table of content.tables) {
    tables.set(table.phase, table);
  }
  return { definitions, tables };
}

export function createInvestigationEngine(
  session: SessionSeed,
  deps: EngineDeps,
): InvestigationEngine {
  const rng = createRandomEngine(session.seed);
  const eventRng = rng.fork('rng.events');
  const sessionRng = rng.fork('rng.session');

  const { definitions, tables } = index(deps.content);

  const scheduler: EventScheduler = createScheduler({
    tableForPhase: (phase: SessionPhase): EventTable => {
      const table = tables.get(phase);
      invariant(
        table !== undefined,
        `InvestigationEngine: no event table for phase ${phase}`,
      );
      return table;
    },
    definitionFor: (id: EventDefinitionId): EventDefinition | null =>
      definitions.get(id) ?? null,
  });

  const directiveScheduler: DirectiveScheduler = createDirectiveScheduler({
    pool: deps.content.directives,
    maxPerSession: DIRECTIVE_MAX_PER_SESSION,
    minSpacingMs: DIRECTIVE_MIN_SPACING_MS,
  });

  let schedulerState = scheduler.initial(eventRng, 'QUIET');
  let directiveState = directiveScheduler.initial(
    sessionRng,
    DEFAULT_DIRECTIVE,
    sessionMs(0),
  );

  let state: SimulationState = {
    seed: session.seed,
    huntId: session.parts.huntId,
    status: 'ready',
    tickIndex: null,
    elapsedMs: null,
    endReason: null,
    phase: null,
    stateWord: null,
    tension: 0,
    digest: [],
    scheduler: schedulerState,
    directive: directiveState,
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
      const elapsedDeltaMs = sessionMs(
        state.elapsedMs === null ? 0 : input.elapsedMs - state.elapsedMs,
      );

      // 1. Advance the ladder from the tension computed last tick. Tension leads
      //    the phase by one tick because this tick's emission — a tension driver
      //    — is only known once the scheduler has run.
      const previousPhase = state.phase ?? 'QUIET';
      const phase = advancePhase(previousPhase, {
        elapsedMs: input.elapsedMs,
        tension: state.tension,
      });
      const stateWord = stateWordFor(phase);
      const phaseChanged = state.phase !== phase;

      // 2. The directive cadence (which may narrow the event space this tick).
      const directiveStep = directiveScheduler.step(
        directiveState,
        { elapsedMs: input.elapsedMs },
        sessionRng,
      );
      directiveState = directiveStep.state;

      // 3. The event scheduler, keyed off the phase now in force.
      const schedulerStep = scheduler.step(
        schedulerState,
        {
          elapsedMs: input.elapsedMs,
          phase,
          directive: directiveState.active,
        },
        eventRng,
      );
      schedulerState = schedulerStep.state;

      // 4. Tension: elapsed, movement, sensor anomaly and this tick's emission.
      const emitted = schedulerStep.emissions.some(
        (emission) => emission.kind === 'event',
      );
      const tension = updateTension(state.tension, {
        elapsedDeltaMs,
        movement: input.movement,
        sensorAnomaly: input.sensorAnomaly,
        emitted,
      });

      // 5. Record this tick's outcome in the RLE digest — never one entry per tick.
      const digest = appendDigest(state.digest, phase);

      const phaseEmission: Emission | null = phaseChanged
        ? { kind: 'phase', phase, stateWord, atMs: input.elapsedMs }
        : null;

      state = {
        ...state,
        status: 'running',
        tickIndex: input.tickIndex,
        elapsedMs: input.elapsedMs,
        phase,
        stateWord,
        tension,
        digest,
        scheduler: schedulerState,
        directive: directiveState,
      };

      const emissions: Emission[] = [
        ...(first ? [notice('session_started')] : []),
        ...(phaseEmission === null ? [] : [phaseEmission]),
        ...directiveStep.emissions,
        ...schedulerStep.emissions,
      ];

      return { state, emissions, rng: eventRng.snapshot(), digest: phase };
    },

    finish(reason: SessionEndReason): TickResult {
      invariant(
        state.status !== 'ended',
        'InvestigationEngine.finish: the session has already ended',
      );
      // `ENDED` is the terminal marker, not a phase: it is recorded in the digest
      // and on `status`, never as a `SessionPhase`.
      state = {
        ...state,
        status: 'ended',
        endReason: reason,
        digest: appendDigest(state.digest, SESSION_TERMINAL_PHASE),
      };
      return {
        state,
        emissions: [notice('session_ended')],
        rng: eventRng.snapshot(),
        digest: SESSION_TERMINAL_PHASE,
      };
    },
  };
}
