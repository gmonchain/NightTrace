import { createRandomEngine, seedFromParts } from '@/engine/RandomEngine';
import {
  ENGINE_MIN_GAP_MS,
  clampToEngineFloor,
  gapFrom,
  nextGapMs,
  scaledFloorMs,
} from '@/engine/rules/silence';

/**
 * The silence rule — the memoryless gap draw (FR-2, AD-5).
 *
 * The gap is `floor * silenceScale + Exp(mean)`. The exponential tail is what
 * makes the draw memoryless: conditional on surviving to any elapsed time past
 * the floor, the chance the gap ends in the next window is the same as it was at
 * the floor. That is the whole anti-metric — if the residual wait shortened with
 * time, the app would be learnable.
 */
describe('silence rule shape', () => {
  it('scaledFloorMs multiplies the floor by the directive scale', () => {
    expect(scaledFloorMs(10_000, 1)).toBe(10_000);
    expect(scaledFloorMs(10_000, 1.15)).toBeCloseTo(11_500, 6);
    // A zero or negative scale can never shrink the floor below zero.
    expect(scaledFloorMs(10_000, 0)).toBe(0);
    expect(scaledFloorMs(10_000, -1)).toBe(0);
  });

  it('gapFrom is the scaled floor plus a non-negative exponential draw', () => {
    expect(gapFrom(5_000, 1, 12_000)).toBe(17_000);
    expect(gapFrom(5_000, 1.2, 0)).toBe(6_000);
    // A negative exponential value is clamped to zero — never a negative gap.
    expect(gapFrom(5_000, 1, -3_000)).toBe(5_000);
  });

  it('nextGapMs draws the exponential tail from the passed rng', () => {
    const a = createRandomEngine(seedFromParts(['gap', 'a']));
    const b = createRandomEngine(seedFromParts(['gap', 'a']));
    const c = createRandomEngine(seedFromParts(['gap', 'b']));
    expect(nextGapMs(a, 4_000, 60_000, 1)).toBe(
      nextGapMs(b, 4_000, 60_000, 1),
    );
    expect(nextGapMs(a, 4_000, 60_000, 1)).not.toBe(
      nextGapMs(c, 4_000, 60_000, 1),
    );
  });

  it('applies the content-independent engine floor to every drawn gap', () => {
    expect(clampToEngineFloor(0)).toBe(ENGINE_MIN_GAP_MS);
    expect(clampToEngineFloor(ENGINE_MIN_GAP_MS - 1)).toBe(ENGINE_MIN_GAP_MS);
    expect(clampToEngineFloor(ENGINE_MIN_GAP_MS + 5_000)).toBe(
      ENGINE_MIN_GAP_MS + 5_000,
    );
  });
});

describe('MEMORYLESS: a long quiet stretch never raises the hazard', () => {
  const FLOOR = 5_000;
  const MEAN = 60_000;
  const SAMPLES = 40_000;
  /** The hazard window — the chance the gap ends in the next five seconds. */
  const DELTA = 5_000;

  const gaps: number[] = [];
  {
    const rng = createRandomEngine(seedFromParts(['memoryless', 'sweep']));
    for (let i = 0; i < SAMPLES; i += 1) {
      gaps.push(FLOOR + rng.exponent(MEAN));
    }
  }

  /** The empirical hazard at elapsed `t`: `P(t < G <= t + DELTA | G > t)`. */
  function hazard(t: number): number {
    let survivors = 0;
    let ended = 0;
    for (const gap of gaps) {
      if (gap > t) {
        survivors += 1;
        if (gap <= t + DELTA) {
          ended += 1;
        }
      }
    }
    return survivors === 0 ? 0 : ended / survivors;
  }

  it('the hazard is flat as elapsed time since the last emission grows', () => {
    // Thresholds past the floor, out to many multiples of the mean.
    const thresholds = [FLOOR, FLOOR + 20_000, FLOOR + 60_000, FLOOR + 180_000, FLOOR + 300_000];
    const hazards = thresholds.map(hazard);
    const expected = 1 - Math.exp(-DELTA / MEAN); // ≈ 0.08 — the memoryless rate

    for (const h of hazards) {
      expect(h).toBeGreaterThan(expected * 0.7);
      expect(h).toBeLessThan(expected * 1.3);
    }
    // No monotone rise: the last hazard is no larger than the first.
    const first = hazards[0] ?? 0;
    const last = hazards[hazards.length - 1] ?? 0;
    expect(last).toBeLessThanOrEqual(first + 0.02);
    // And each successive hazard does not increase beyond noise.
    for (let i = 1; i < hazards.length; i += 1) {
      expect(hazards[i] ?? 0).toBeLessThanOrEqual((hazards[i - 1] ?? 0) + 0.02);
    }
  });

  it('the exponential draw averages to its mean', () => {
    const rng = createRandomEngine(seedFromParts(['memoryless', 'mean']));
    let sum = 0;
    for (let i = 0; i < SAMPLES; i += 1) {
      sum += rng.exponent(MEAN);
    }
    const average = sum / SAMPLES;
    expect(average).toBeGreaterThan(MEAN * 0.95);
    expect(average).toBeLessThan(MEAN * 1.05);
  });

  it('rejects a non-positive mean as a programmer error', () => {
    const rng = createRandomEngine(seedFromParts(['memoryless', 'guard']));
    expect(() => rng.exponent(0)).toThrow(/mean must be positive/);
  });
});
