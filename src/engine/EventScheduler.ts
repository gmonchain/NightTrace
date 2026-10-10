/**
 * The event scheduler — weighted selection with an authored silence (AD-5),
 * phase-keyed tables, engine-held cooldowns and a memoryless gap (FR-2).
 *
 * One `step` decides at most one thing. A checkpoint is *due* when
 * `elapsedMs >= nextEmissionAtMs`; until then the answer is silence and nothing
 * is drawn. When due, the scheduler:
 *
 *   1. takes the active phase's table,
 *   2. filters its entries by the active directive's bans and by the engine's
 *      cooldown / once-per-session rules,
 *   3. draws a weighted winner over the survivors **plus `emptyWeight`** — so
 *      silence is always an available outcome (AD-5),
 *   4. if *nothing* wins, draws the next gap and emits nothing,
 *   5. if a `silence`-category definition wins, it *extends the floor* instead
 *      of emitting (AD-5), and
 *   6. if a real definition wins, emits an `event` emission and records its
 *      cooldown.
 *
 * Randomness comes only from the passed `rng` (the engine forks `rng.events`
 * once and passes it), so a `TickResult`'s snapshot is the stream that drove
 * emissions. Nothing here reads a clock or a global random source (AD-1).
 */

import type { Emission, EventDefinition, EventDefinitionId, EventTable, SessionDirective, SessionMs, SessionPhase } from './models';
import { sessionMs, unit } from './models';
import type { RandomEngine } from './RandomEngine';
import { DEFAULT_DIRECTIVE } from './directives/SessionDirective';
import type { CooldownLedger } from './rules/cooldown';
import { advanceCooldowns, emptyLedger, isSuppressed, recordEmission } from './rules/cooldown';
import { clampToEngineFloor, nextGapMs } from './rules/silence';

/** The engine-held scheduler state. Plain, serializable, deep-equal-stable. */
export interface SchedulerState {
  /** The next moment an emission may be considered. */
  readonly nextEmissionAtMs: SessionMs;
  readonly ledger: CooldownLedger;
  /** The last real event's time, or `null` if none has fired. */
  readonly lastEventAtMs: SessionMs | null;
  readonly emissionCount: number;
}

export interface SchedulerConfig {
  /** The table in force for a phase. Content supplies the table; the key is the phase. */
  readonly tableForPhase: (phase: SessionPhase) => EventTable;
  /** The definition for an id, or `null` when the id is unknown to content. */
  readonly definitionFor: (id: EventDefinitionId) => EventDefinition | null;
}

export interface SchedulerInput {
  readonly elapsedMs: SessionMs;
  readonly phase: SessionPhase;
  /** The constraints currently in force — the directive scheduler's active directive. */
  readonly directive: SessionDirective;
}

export interface SchedulerStep {
  readonly state: SchedulerState;
  readonly emissions: readonly Emission[];
}

export interface EventScheduler {
  /** The starting state: the first gap drawn, nothing cooling down. */
  initial(rng: RandomEngine, initialPhase?: SessionPhase): SchedulerState;
  /** A pure step: returns new state and any emission, mutating nothing. */
  step(state: SchedulerState, input: SchedulerInput, rng: RandomEngine): SchedulerStep;
}

/** The internal strength of a moment. Never rendered as a number (AD-15). */
function drawStrength(rng: RandomEngine): ReturnType<typeof unit> {
  return unit(0.3 + rng.next() * 0.6);
}

export function createScheduler(config: SchedulerConfig): EventScheduler {
  /** Draw the next gap (a duration) from a table, honouring the directive and the engine floor. */
  function drawGap(
    rng: RandomEngine,
    table: EventTable,
    directive: SessionDirective,
    extraFloorMs = 0,
  ): number {
    const gap = nextGapMs(
      rng,
      table.silenceFloorMs + Math.max(0, extraFloorMs),
      table.intervalMeanMs,
      directive.silenceScale,
    );
    return clampToEngineFloor(gap);
  }

  return {
    initial(rng: RandomEngine, initialPhase: SessionPhase = 'QUIET'): SchedulerState {
      const table = config.tableForPhase(initialPhase);
      return {
        nextEmissionAtMs: sessionMs(drawGap(rng, table, DEFAULT_DIRECTIVE)),
        ledger: emptyLedger(),
        lastEventAtMs: null,
        emissionCount: 0,
      };
    },

    step(
      state: SchedulerState,
      input: SchedulerInput,
      rng: RandomEngine,
    ): SchedulerStep {
      if (input.elapsedMs < state.nextEmissionAtMs) {
        return { state, emissions: [] };
      }

      const table = config.tableForPhase(input.phase);
      const { directive } = input;
      const ledger = advanceCooldowns(state.ledger, input.elapsedMs);

      const eligible = table.entries.filter((entry) => {
        if (directive.bannedEvents.includes(entry.definitionId)) {
          return false;
        }
        const definition = config.definitionFor(entry.definitionId);
        if (definition === null) {
          return false;
        }
        return !isSuppressed(ledger, definition, input.elapsedMs);
      });

      // The authored *nothing* is always an entry, so silence is always a draw.
      const winner = rng.weighted<EventDefinitionId | null>([
        ...eligible.map((entry) => ({
          value: entry.definitionId,
          weight: entry.weight,
        })),
        { value: null, weight: table.emptyWeight },
      ]);

      if (winner === null) {
        return {
          state: {
            ...state,
            nextEmissionAtMs: sessionMs(
              input.elapsedMs + drawGap(rng, table, directive),
            ),
            ledger,
          },
          emissions: [],
        };
      }

      const definition = config.definitionFor(winner);
      if (definition === null) {
        // Content named an unknown id; treat it as silence rather than lying.
        return {
          state: {
            ...state,
            nextEmissionAtMs: sessionMs(
              input.elapsedMs + drawGap(rng, table, directive),
            ),
            ledger,
          },
          emissions: [],
        };
      }

      const nextLedger = recordEmission(ledger, definition, input.elapsedMs);

      if (definition.category === 'silence') {
        const extended = drawGap(
          rng,
          table,
          directive,
          definition.extendsSilenceMs ?? 0,
        );
        return {
          state: {
            ...state,
            nextEmissionAtMs: sessionMs(input.elapsedMs + extended),
            ledger: nextLedger,
          },
          emissions: [],
        };
      }

      const emission: Emission = {
        kind: 'event',
        definitionId: definition.id,
        category: definition.category,
        atMs: input.elapsedMs,
        strength: drawStrength(rng),
      };
      return {
        state: {
          nextEmissionAtMs: sessionMs(
            input.elapsedMs + drawGap(rng, table, directive),
          ),
          ledger: nextLedger,
          lastEventAtMs: input.elapsedMs,
          emissionCount: state.emissionCount + 1,
        },
        emissions: [emission],
      };
    },
  };
}
