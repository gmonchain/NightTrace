/**
 * The directive scheduler — the ≤6 / ≥3-minutes-apart cadence (AD-6).
 *
 * Directives surface to the user as **verbs with no object**, drawn from an
 * authored pool, and are always **scheduled, never on demand**: there is no
 * "give me another" control, and the engine never lets a directive *name* an
 * event — it only carries the constraints the event scheduler honours
 * (`silenceScale`, `bannedEvents`). The pool is content; the cadence is the
 * engine's rule.
 *
 * Draws come from `rng.session` (the labelled substream for session-level
 * choices), so the directive cadence is independent of the event stream's draw
 * order (AD-4).
 */

import { invariant } from '@/util/result';

import type { RandomEngine } from '../RandomEngine';
import type { Emission, SessionDirective, SessionMs } from '../models';
import { sessionMs } from '../models';

/** At most six directives fire in a session (AD-6). */
export const DIRECTIVE_MAX_PER_SESSION = 6;
/** Directives are spaced by at least three minutes (AD-6). */
export const DIRECTIVE_MIN_SPACING_MS = 180_000;

/** The engine-held directive cadence state. */
export interface DirectiveState {
  /** When the next directive is due. Set forward by a whole spacing on each fire. */
  readonly nextDirectiveAtMs: SessionMs;
  /** How many have fired this session. */
  readonly fired: number;
  /** The constraints currently in force (starts as the neutral directive). */
  readonly active: SessionDirective;
}

export interface DirectiveSchedulerConfig {
  readonly pool: readonly SessionDirective[];
  readonly maxPerSession: number;
  readonly minSpacingMs: number;
}

export interface DirectiveStepInput {
  readonly elapsedMs: SessionMs;
}

export interface DirectiveStep {
  readonly state: DirectiveState;
  readonly emissions: readonly Emission[];
}

export interface DirectiveScheduler {
  /** The state a session starts in: the neutral directive, the first beat scheduled. */
  initial(
    rng: RandomEngine,
    base: SessionDirective,
    atMs: SessionMs,
  ): DirectiveState;
  step(
    state: DirectiveState,
    input: DirectiveStepInput,
    rng: RandomEngine,
  ): DirectiveStep;
}

/**
 * Build a directive scheduler over an authored pool.
 *
 * `initial` schedules the first directive at least one spacing out, plus a drawn
 * jitter, so two sessions do not lead with the same beat. `step` fires at most
 * one directive per call, and only when one is due and the cap is not reached.
 * The immediately-preceding directive is excluded from the draw so a session
 * never repeats itself back to back.
 */
export function createDirectiveScheduler(
  config: DirectiveSchedulerConfig,
): DirectiveScheduler {
  return {
    initial(
      rng: RandomEngine,
      base: SessionDirective,
      atMs: SessionMs,
    ): DirectiveState {
      const offset =
        config.minSpacingMs + rng.int(0, Math.max(1, config.minSpacingMs));
      return {
        nextDirectiveAtMs: sessionMs(atMs + offset),
        fired: 0,
        active: base,
      };
    },

    step(
      state: DirectiveState,
      input: DirectiveStepInput,
      rng: RandomEngine,
    ): DirectiveStep {
      if (
        state.fired >= config.maxPerSession ||
        input.elapsedMs < state.nextDirectiveAtMs
      ) {
        return { state, emissions: [] };
      }
      const candidates =
        config.pool.length > 1
          ? config.pool.filter((entry) => entry.id !== state.active.id)
          : config.pool;
      invariant(
        candidates.length > 0,
        'DirectiveScheduler: the directive pool is empty',
      );
      const chosen = rng.pick(candidates);
      const emission: Emission = {
        kind: 'directive',
        directiveId: chosen.id,
        text: chosen.text,
        atMs: input.elapsedMs,
      };
      return {
        state: {
          nextDirectiveAtMs: sessionMs(input.elapsedMs + config.minSpacingMs),
          fired: state.fired + 1,
          active: chosen,
        },
        emissions: [emission],
      };
    },
  };
}
