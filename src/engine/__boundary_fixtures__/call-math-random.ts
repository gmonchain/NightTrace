// Fixture (b): a global random source under the pure core. Must be rejected by
// AD-1's `no-restricted-syntax`; randomness is RandomEngine.fork(label).
export function draw(): number {
  return Math.random();
}
