// Fixture: a sensor/permission module imported by a Profile feature file. Story
// 1.7 promises the Profile→About path requests no permission and reads no
// sensor, so this import must be rejected by the About/Profile
// `no-restricted-imports` block. Linted directly by the boundary test; the
// `lint` script's glob and the claims scope walk both exclude
// `__boundary_fixtures__`.
import * as Sensors from 'expo-sensors';

export function watch(): void {
  void Sensors.Accelerometer.addListener(() => {});
}
