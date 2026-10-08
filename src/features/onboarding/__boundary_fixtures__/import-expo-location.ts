// Fixture: a sensor/permission module imported by an onboarding screen. Story
// 1.6 promises the whole path requests no permission and reads no sensor, so
// this import must be rejected by the onboarding `no-restricted-imports` block.
// Linted directly by the boundary test; the `lint` script's glob and the claims
// scope walk both exclude `__boundary_fixtures__`.
import * as Location from 'expo-location';

export function ask(): void {
  void Location.requestForegroundPermissionsAsync();
}
