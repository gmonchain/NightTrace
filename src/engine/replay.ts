/**
 * The pure replay driver — the seam the golden-seed gate and the §C.6 sweep
 * both fold the engine through.
 *
 * AD-3 makes replay an **audit property with no user-facing feature**: a session
 * is reconstructible from `seed + hunt + content version + a tick log`. Story
 * 2.3 owns the real phase transition machine; until then the host supplies a
 * time-based phase schedule, and this module is the one place that folds a
 * `SessionSeed` and an `EngineContent` bundle through the engine on a schedule.
 *
 * It is pure — no clock, no I/O, no framework (AD-1) — so the CI gate
 * (`scripts/golden-seed.mjs`) and the engine test project run the identical
 * fold. Nothing here interprets an emission; it only returns them.
 */

import type {
  Emission,
  EngineContent,
  SessionPhase,
  SessionSeed,
  SeedParts,
} from './models';
import {
  contentVersion,
  epochMs,
  huntId,
  seedId,
  sessionMs,
  tickIndex,
  unit,
} from './models';
import { createInvestigationEngine } from './InvestigationEngine';

/** One span of the host's phase schedule: the phase in force until `untilMs`. */
export interface PhaseSpan {
  readonly phase: SessionPhase;
  readonly untilMs: number;
}

/** A host schedule: how long a session runs, how often it ticks, its phases. */
export interface ReplaySchedule {
  readonly tickMs: number;
  readonly durationMs: number;
  /** Contiguous spans covering `[0, durationMs]`; the last spans to the end. */
  readonly spans: readonly PhaseSpan[];
}

/** The fraction of a session each phase occupies, in order (Story 2.2's stub). */
const PHASE_FRACTIONS: readonly (readonly [SessionPhase, number])[] = [
  ['QUIET', 0.15],
  ['SIGNALS', 0.4],
  ['ACTIVITY', 0.7],
  ['ENCOUNTER_WINDOW', 0.85],
  ['RESOLUTION', 1.0],
];

/**
 * The time-based phase schedule Story 2.2's sweep and gate drive. Story 2.3
 * replaces this with the real transition machine; the schedule is a *host*
 * input to the engine, never a transition the engine computes itself.
 */
export function defaultPhaseSchedule(durationMs: number): ReplaySchedule {
  return {
    tickMs: 1_000,
    durationMs,
    spans: PHASE_FRACTIONS.map(([phase, fraction]) => ({
      phase,
      untilMs: Math.round(fraction * durationMs),
    })),
  };
}

/** The identity a replay pins: the seed, the hunt and the content version. */
export interface ReplayIdentity {
  readonly seed: string;
  readonly huntId: string;
  readonly contentVersion: string;
}

/**
 * Build the `SessionSeed` a replay pins. Only `seed` and `parts.huntId` reach
 * the engine, but the parts are filled whole so the seed is a genuine
 * `SessionSeed` and the conditions board round-trips.
 */
export function replaySessionSeed(identity: ReplayIdentity): SessionSeed {
  const parts: SeedParts = {
    huntId: huntId(identity.huntId),
    coords: null,
    startedAtMs: epochMs(0),
    environment: 'outdoor_woodland',
    sky: 'clear',
    temperatureBand: 'cold',
    fingerprint: {
      emfMicro: 0,
      lightLux: null,
      motionQuiet: unit(1),
      noiseFloorDb: null,
    },
    contentVersion: contentVersion(identity.contentVersion),
  };
  return {
    seed: seedId(identity.seed),
    parts,
    conditionsSummary: {
      anomalyOfTheDay: false,
      skyReadout: 'clear',
      hourBand: 'night',
      placeReadout: 'Uncharted',
      notice: null,
    },
  };
}

/** The phase in force at `elapsedMs`, per a schedule. The last span closes. */
export function phaseAt(schedule: ReplaySchedule, elapsedMs: number): SessionPhase {
  for (const span of schedule.spans) {
    if (elapsedMs < span.untilMs) {
      return span.phase;
    }
  }
  const last = schedule.spans[schedule.spans.length - 1];
  if (last === undefined) {
    throw new Error('phaseAt: the schedule has no spans');
  }
  return last.phase;
}

/**
 * Fold a session through the engine on a schedule and return every emission, in
 * order. The fold is deterministic in `(session.seed, content, schedule)`.
 */
export function replaySession(
  session: SessionSeed,
  content: EngineContent,
  schedule: ReplaySchedule,
): readonly Emission[] {
  const engine = createInvestigationEngine(session, { content });
  const emissions: Emission[] = [];
  let tick = 0;
  for (let elapsed = 0; elapsed <= schedule.durationMs; elapsed += schedule.tickMs) {
    const result = engine.tick({
      tickIndex: tickIndex(tick),
      elapsedMs: sessionMs(elapsed),
      phase: phaseAt(schedule, elapsed),
    });
    emissions.push(...result.emissions);
    tick += 1;
  }
  return emissions;
}
