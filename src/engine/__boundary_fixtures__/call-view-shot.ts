// Fixture (e): share-card rasterisation under the pure core. Must be rejected
// by AD-1's `no-restricted-imports`; capture belongs to ShareCardService.
import ViewShot from 'react-native-view-shot';

export function capture(ref: React.RefObject<unknown>) {
  return ViewShot.captureRef(ref as never);
}
