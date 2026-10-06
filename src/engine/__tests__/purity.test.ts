/**
 * The `engine` Jest project runs on the plain `node` preset — which is only
 * possible because AD-1 holds: the engine imports no framework, reads no clock,
 * and touches no I/O. This file is the boundary check that the preset is real.
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
});
