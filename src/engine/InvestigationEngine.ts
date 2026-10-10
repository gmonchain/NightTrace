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
 * supplies `SessionMs`, `TickIndex` and the active `SessionPhase` on every
 * `TickInput`.
 *
 * Story 2.1 landed the shape and the determinism guarantees; Story 2.2 makes the
 * engine *emit*. `tick` now runs the directive scheduler (`rng.session`) and the
 * event scheduler (`rng.events`) and returns their `event` / `directive`
 * emissions alongside the lifecycle `notice`s. The content the schedulers read
 * (definitions, tables, directives) arrives as a `deps` argument, because the
 * engine may not import `src/data/**` (AD-1). `TickResult.rng` is now the
 * `rng.events` snapshot — the stream that actually drives emissions — so a replay
 * comparison detects a divergence in the draw sequence, not merely in generator
 * identity.
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
  TickIndex,
} from './models';
import { sessionMs } from './models';

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
  /** The active phase the host supplied; `null` before the first tick. */
  readonly phase: SessionPhase | null;
  /** The engine-held cooldown / anti-repeat state (FR-2). */
  readonly scheduler: SchedulerState;
  /** The engine-held directive cadence state (AD-6). */
  readonly directive: DirectiveState;
}

/**
 * Everything one tick receives. The host supplies time **and the active phase**;
 * the engine reads no clock and computes no transition (Story 2.3 owns that).
 */
export interface TickInput {
  readonly tickIndex: TickIndex;
  readonly elapsedMs: SessionMs;
  readonly phase: SessionPhase;
}

export interface TickResult {
  /** The post-tick state — a new object, never the input state mutated. */
  readonly state: SimulationState;
  readonly emissions: readonly Emission[];
  /** The post-tick `rng.events` snapshot — the stream that drove emissions. */
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

      const directiveStep = directiveScheduler.step(
        directiveState,
        { elapsedMs: input.elapsedMs },
        sessionRng,
      );
      directiveState = directiveStep.state;

      const schedulerStep = scheduler.step(
        schedulerState,
        {
          elapsedMs: input.elapsedMs,
          phase: input.phase,
          directive: directiveState.active,
        },
        eventRng,
      );
      schedulerState = schedulerStep.state;

      state = {
        ...state,
        status: 'running',
        tickIndex: input.tickIndex,
        elapsedMs: input.elapsedMs,
        phase: input.phase,
        scheduler: schedulerState,
        directive: directiveState,
      };

      const emissions: Emission[] = [
        ...(first ? [notice('session_started')] : []),
        ...directiveStep.emissions,
        ...schedulerStep.emissions,
      ];

      return { state, emissions, rng: eventRng.snapshot() };
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
        rng: eventRng.snapshot(),
      };
    },
  };
}
