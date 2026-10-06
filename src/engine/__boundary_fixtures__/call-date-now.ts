// Fixture: the wall clock (`Date.now`) under the pure core. Must be rejected by
// AD-1's `no-restricted-globals`; the host supplies SessionMs and TickIndex.
export function stamp(): number {
  return Date.now();
}
