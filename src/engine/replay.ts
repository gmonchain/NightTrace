/**
 * The pure replay driver — the seam the golden-seed gate and the §C.6 sweep
 * both fold the engine through.
 *
 * AD-3 makes replay an **audit property with no user-facing feature**: a session
 * is reconstructible from `seed + hunt + content version + a tick log`. Story 2.2
 * drove the replay on a host-supplied phase schedule; Story 2.3 deletes that
 * schedule — the engine **owns its own ladder** now (`rules/phases.ts`), so this
 * module only folds a `SessionSeed` and an `EngineContent` bundle through the
 * engine and returns the emissions the ladder produced.
 *
 * It is pure — no clock, no I/O, no framework (AD-1) — so the CI gate
 * (`scripts/golden-seed.mjs`) and the engine test project run the identical fold.
 * Nothing here interprets an emission; it only returns them.
 */

import type {
  Emission,
  EngineContent,
  SeedParts,
  SessionSeed,
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

/** The tick rate a replay is recorded and folded at (the engine contract §I.6). */
export const DEFAULT_REPLAY_TICK_MS = 1_000;

/** How a replay runs: for how long, and at what tick rate. */
export interface ReplayOptions {
  readonly durationMs: number;
  readonly tickMs: number;
}

/** The default replay window for a given duration. */
export function replayOptions(
  durationMs: number,
  tickMs: number = DEFAULT_REPLAY_TICK_MS,
): ReplayOptions {
  return { durationMs, tickMs };
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

/**
 * Fold a session through the engine and return every emission, in order.
 *
 * The engine computes its own phase ladder — the host supplies only time and the
 * two tension drivers, both `unit(0)` here (the sensor hub is Story 2.4). The
 * fold is deterministic in `(session.seed, content, options)`.
 */
export function replaySession(
  session: SessionSeed,
  content: EngineContent,
  options: ReplayOptions,
): readonly Emission[] {
  const engine = createInvestigationEngine(session, { content });
  const emissions: Emission[] = [];
  let tick = 0;
  for (
    let elapsed = 0;
    elapsed <= options.durationMs;
    elapsed += options.tickMs
  ) {
    const result = engine.tick({
      tickIndex: tickIndex(tick),
      elapsedMs: sessionMs(elapsed),
      movement: unit(0),
      sensorAnomaly: unit(0),
    });
    emissions.push(...result.emissions);
    tick += 1;
  }
  return emissions;
}
