// Fixture (a): a framework import under the pure core. Must be rejected by
// AD-1's `no-restricted-imports`. Linted directly by the boundary test; the
// `lint` script excludes this directory.
import { View } from 'react-native';

export function render() {
  return View;
}
