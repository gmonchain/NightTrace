// Fixture: `performance.now()` under the pure core. Must be rejected by AD-1's
// `no-restricted-globals`; elapsed time is SessionMs supplied by the host.
export function elapsed(): number {
  return performance.now();
}
