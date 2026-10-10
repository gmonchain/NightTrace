import { SESSION_PHASES, sessionMs, unit } from '@/engine/models';
import {
  ENCOUNTER_CHANCE_CEILING,
  TENSION_MAX,
  encounterChance,
  updateTension,
  type TensionInputs,
} from '@/engine/rules/tension';

/**
 * TENSION_RISE_FALL and ENCOUNTER_CHANCE (AD-26, FR-4).
 *
 * Tension is the hidden scalar that paces the session. It rises on its four
 * drivers — elapsed time, movement, sensor anomalies and emissions — falls when
 * they stop, and rises faster than it falls. Its derived Encounter chance is
 * bounded strictly below 1 and monotone in tension: it *influences* an Encounter,
 * it never guarantees one.
 */

function inputs(overrides: Partial<TensionInputs> = {}): TensionInputs {
  return {
    elapsedDeltaMs: sessionMs(1_000),
    movement: unit(0),
    sensorAnomaly: unit(0),
    emitted: false,
    ...overrides,
  };
}

describe('TENSION_RISE_FALL: the hidden scalar rises and falls on its drivers', () => {
  it('rises on movement', () => {
    expect(updateTension(0, inputs({ movement: unit(1) }))).toBeGreaterThan(0);
  });

  it('rises on a sensor anomaly', () => {
    expect(updateTension(0, inputs({ sensorAnomaly: unit(1) }))).toBeGreaterThan(0);
  });

  it('rises on an emission', () => {
    const quiet = updateTension(0, inputs({ emitted: false }));
    const emitted = updateTension(0, inputs({ emitted: true }));
    expect(emitted).toBeGreaterThan(quiet);
  });

  it('rises with elapsed time — a longer delta lifts it further', () => {
    const short = updateTension(0, inputs({ elapsedDeltaMs: sessionMs(1_000), movement: unit(1) }));
    const long = updateTension(0, inputs({ elapsedDeltaMs: sessionMs(2_000), movement: unit(1) }));
    expect(long).toBeGreaterThan(short);
  });

  it('falls when the drivers stop', () => {
    expect(updateTension(50, inputs({ elapsedDeltaMs: sessionMs(10_000) }))).toBeLessThan(50);
  });

  it('rises faster than it falls (asymmetric / hysteresis)', () => {
    const risePerSec =
      updateTension(0, inputs({ elapsedDeltaMs: sessionMs(1_000), movement: unit(1) })) - 0;
    const fallPerSec =
      50 - updateTension(50, inputs({ elapsedDeltaMs: sessionMs(1_000) }));
    expect(risePerSec).toBeGreaterThan(fallPerSec);
    expect(fallPerSec).toBeGreaterThan(0);
  });

  it('stays in 0..100, clamped at both ends', () => {
    expect(updateTension(TENSION_MAX, inputs({ movement: unit(1) }))).toBe(TENSION_MAX);
    expect(updateTension(99, inputs({ elapsedDeltaMs: sessionMs(60_000), movement: unit(1) }))).toBe(
      TENSION_MAX,
    );
    expect(updateTension(0, inputs({ elapsedDeltaMs: sessionMs(60_000) }))).toBe(0);
    // A negative delta can never move it.
    expect(updateTension(50, inputs({ elapsedDeltaMs: sessionMs(-1_000), movement: unit(1) }))).toBeGreaterThanOrEqual(0);
  });

  it('never leaves its band across a long mixed run', () => {
    let tension = 0;
    for (let i = 0; i < 2_000; i += 1) {
      tension = updateTension(tension, {
        elapsedDeltaMs: sessionMs(1_000),
        movement: unit(i % 3 === 0 ? 1 : 0),
        sensorAnomaly: unit(i % 5 === 0 ? 0.7 : 0),
        emitted: i % 11 === 0,
      });
      expect(tension).toBeGreaterThanOrEqual(0);
      expect(tension).toBeLessThanOrEqual(TENSION_MAX);
    }
  });
});

describe('ENCOUNTER_CHANCE: tension influences but never guarantees an Encounter', () => {
  it('is strictly below 1 at maximum tension, for every phase', () => {
    for (const phase of SESSION_PHASES) {
      const chance = encounterChance(phase, TENSION_MAX);
      expect(chance).toBeLessThan(1);
      expect(chance).toBeLessThanOrEqual(ENCOUNTER_CHANCE_CEILING);
      expect(chance).toBeGreaterThanOrEqual(0);
    }
  });

  it('is bounded strictly below 1 even past the maximum tension', () => {
    for (const phase of SESSION_PHASES) {
      expect(encounterChance(phase, TENSION_MAX * 10)).toBeLessThan(1);
    }
  });

  it('is monotone non-decreasing in tension', () => {
    for (const phase of SESSION_PHASES) {
      let previous = -1;
      for (let tension = 0; tension <= TENSION_MAX; tension += 5) {
        const chance = encounterChance(phase, tension);
        expect(chance).toBeGreaterThanOrEqual(previous);
        previous = chance;
      }
    }
  });

  it('offers no Encounter in the opening quiet at zero tension', () => {
    expect(encounterChance('QUIET', 0)).toBe(0);
  });
});
