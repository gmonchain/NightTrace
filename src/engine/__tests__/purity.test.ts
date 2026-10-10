import { createInvestigationEngine } from '@/engine/InvestigationEngine';
import { sessionMs, tickIndex, unit } from '@/engine/models';
import { createRandomEngine, seedFromParts } from '@/engine/RandomEngine';

import { sessionSeedFixture, engineContentFixture } from './fixtures';

/**
 * The `engine` Vitest project runs on the plain `node` environment — which is
 * only possible because AD-1 holds: the engine imports no framework, reads no
 * clock, and touches no I/O. This file is the boundary check that the preset is
 * real, and that the new pure core runs inside it.
 */
describe('engine project runtime', () => {
  it('runs in Node, with no React Native runtime present', () => {
    expect(typeof process.versions.node).toBe('string');
    expect(typeof globalThis.window).toBe('undefined');
  });

  it('executes a pure function deterministically, with no clock or rng', () => {
    const step = (state: number, input: number): number => state + input;
    const first = step(step(0, 1), 2);
    const second = step(step(0, 1), 2);
    expect(first).toBe(3);
    expect(first).toBe(second);
  });

  it('runs the seeded core with no framework and no wall clock', () => {
    const rng = createRandomEngine(seedFromParts(['pure']));
    const draw = rng.next();
    expect(draw).toBeGreaterThanOrEqual(0);
    expect(draw).toBeLessThan(1);

    const engine = createInvestigationEngine(sessionSeedFixture(), {
      content: engineContentFixture(),
    });
    const first = engine.tick({
      tickIndex: tickIndex(0),
      elapsedMs: sessionMs(0),
      movement: unit(0),
      sensorAnomaly: unit(0),
    });
    expect(first.state.status).toBe('running');
    // The lifecycle notice and the engine's opening phase.
    expect(first.emissions).toHaveLength(2);
  });
});
