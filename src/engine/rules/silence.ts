/**
 * The silence rule — the **memoryless** gap draw (FR-2, AD-5).
 *
 * The gap between emissions is drawn **once per gap**, not per tick, as
 * `floorMs * silenceScale` **plus an exponential draw**. Drawing a gap rather
 * than testing a per-tick probability is what makes the shape explicit and
 * testable as an interval distribution, and it makes the pacing independent of
 * the tick rate: a faster tick does not make events more likely.
 *
 * The exponential draw is **memoryless**: the hazard rate is constant, so a long
 * quiet stretch never raises the chance of the next emission. That is the whole
 * anti-metric Story 2.2 must prove — if a survivor's residual wait shortened
 * with time, the app would be learnable.
 *
 * The two `Rng`-free helpers (`scaledFloorMs`, `gapFrom`) carry the shape
 * without a draw, so a test can assert the memoryless property over a fixed
 * exponential value rather than only statistically.
 */

import type { RandomEngine } from '../RandomEngine';

/**
 * The engine's **content-independent** minimum gap. Even if content sets a zero
 * floor and a zero-cooldown table, no two emissions can land closer than this —
 * which is what keeps "a content change alone cannot make the pattern learnable"
 * true (FR-2).
 */
export const ENGINE_MIN_GAP_MS = 2_000;

/** The directive-scaled floor: `floorMs * silenceScale`, never negative. */
export function scaledFloorMs(floorMs: number, silenceScale: number): number {
  return Math.max(0, floorMs) * Math.max(0, silenceScale);
}

/**
 * The gap a floor, a scale and an already-drawn exponential value produce. This
 * is `nextGapMs` minus the draw, so the shape is assertable without an `Rng`.
 */
export function gapFrom(
  floorMs: number,
  silenceScale: number,
  exponentialDrawMs: number,
): number {
  return scaledFloorMs(floorMs, silenceScale) + Math.max(0, exponentialDrawMs);
}

/**
 * Draw the next gap: the directive-scaled floor plus a memoryless exponential
 * tail. The only randomness is the exponential draw (from `rng.events`), so
 * nothing about the elapsed time since the last emission can raise the hazard.
 */
export function nextGapMs(
  rng: RandomEngine,
  floorMs: number,
  meanMs: number,
  silenceScale: number,
): number {
  return gapFrom(floorMs, silenceScale, rng.exponent(meanMs));
}

/** Apply the engine's content-independent minimum gap to a drawn gap. */
export function clampToEngineFloor(gapMs: number): number {
  return Math.max(ENGINE_MIN_GAP_MS, gapMs);
}
