/**
 * The tension rule — the hidden scalar that drives pacing (AD-26, FR-4, FR-35).
 *
 * Tension is a `0..100` value that rises with elapsed time, movement, sensor
 * anomalies and emissions, and falls when those drivers stop. It is **asymmetric
 * — it rises fast and falls slowly** — which is the hysteresis that keeps a
 * session from flickering between calm and dread on a single quiet tick.
 *
 * It is **hidden**: it is never carried by an emission, never rendered and never
 * announced (AD-26, NFR-12). What it *does* is gate the phase ladder
 * (`rules/phases.ts`) and influence — never guarantee — the Encounter chance
 * ({@link encounterChance}). This module is pure: no clock, no randomness, no
 * I/O; the host supplies the drivers as `Unit`s (movement and sensor anomaly are
 * `unit(0)` until the sensor hub of Story 2.4 and the user actions of Epic 4).
 */

import type { SessionMs, SessionPhase, Unit } from '../models';
import { unit } from '../models';

/** The ceiling of the hidden scalar. It is a `0..100` value, clipped at both ends. */
export const TENSION_MAX = 100;

/** The per-second rise elapsed time contributes on its own. */
const PASSIVE_RISE_PER_SEC = 0.4;
/** The per-second rise a fully-moving user contributes. */
const MOVEMENT_RISE_PER_SEC = 9;
/** The per-second rise a full sensor anomaly contributes. */
const ANOMALY_RISE_PER_SEC = 6;
/** The one-off lift an emission gives — the moment of a signal. */
const EMISSION_RISE = 12;
/** The per-second fall when nothing is driving. Slower than any rise: hysteresis. */
const FALL_PER_SEC = 0.6;

/** The drivers a tick hands the tension rule. */
export interface TensionInputs {
  /** Time since the previous tick — the medium every rise and fall travels through. */
  readonly elapsedDeltaMs: SessionMs;
  /** `0..1` from the sensor hub; `unit(0)` until Story 2.4. */
  readonly movement: Unit;
  /** `0..1` sensor anomaly; `unit(0)` until Story 2.4. */
  readonly sensorAnomaly: Unit;
  /** Whether an `event` emission fired this tick — the emission driver. */
  readonly emitted: boolean;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function clampTension(value: number): number {
  return Math.min(TENSION_MAX, Math.max(0, value));
}

/**
 * Advance the hidden tension by one tick.
 *
 * When a driver is active (movement, a sensor anomaly, or an emission) tension
 * rises at the summed rate; when nothing drives it, it falls at
 * {@link FALL_PER_SEC}. Every rate is per-second and scaled by the elapsed delta,
 * so tension rises with elapsed time and with movement/anomaly/emissions, and
 * falls when they stop. The result is always clamped to `0..100`.
 */
export function updateTension(prev: number, inputs: TensionInputs): number {
  const dt = Math.max(0, inputs.elapsedDeltaMs) / 1000;
  const movement = clamp01(inputs.movement);
  const anomaly = clamp01(inputs.sensorAnomaly);
  const driving = movement > 0 || anomaly > 0 || inputs.emitted;

  const rise =
    (PASSIVE_RISE_PER_SEC +
      MOVEMENT_RISE_PER_SEC * movement +
      ANOMALY_RISE_PER_SEC * anomaly) *
      dt +
    (inputs.emitted ? EMISSION_RISE : 0);
  const fall = driving ? 0 : FALL_PER_SEC * dt;

  return clampTension(prev + rise - fall);
}

/**
 * The base Encounter chance a phase contributes at zero tension. `QUIET` permits
 * none at all; `ENCOUNTER_WINDOW` is the phase built to offer one.
 */
const PHASE_ENCOUNTER_BASE: Readonly<Record<SessionPhase, number>> = {
  QUIET: 0,
  SIGNALS: 0.05,
  ACTIVITY: 0.2,
  ENCOUNTER_WINDOW: 0.4,
  RESOLUTION: 0.1,
};

/**
 * The ceiling any Encounter chance approaches. It is **strictly below 1**: even
 * at maximum tension an Encounter is never guaranteed (AD-26). Tension
 * *influences* the chance — it never guarantees the Encounter.
 */
export const ENCOUNTER_CHANCE_CEILING = 0.85;

/**
 * The derived Encounter probability for a phase at a tension, as a `Unit`.
 *
 * It is monotone non-decreasing in tension and bounded strictly below 1: at zero
 * tension it is the phase's own base, at maximum tension it approaches
 * {@link ENCOUNTER_CHANCE_CEILING}. It is a **pure function** — it resolves no
 * encounter and is not consumed by the tick loop this story (Epic 5 owns
 * encounters); it exists so the "influences but never guarantees" promise is a
 * testable property of the engine, not a comment.
 */
export function encounterChance(phase: SessionPhase, tension: number): Unit {
  const t = clamp01(tension / TENSION_MAX);
  const base = PHASE_ENCOUNTER_BASE[phase];
  return unit(base + (ENCOUNTER_CHANCE_CEILING - base) * t);
}
