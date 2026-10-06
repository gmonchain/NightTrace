// Fixture (c): a haptics module under the pure core. Must be rejected by AD-1's
// `no-restricted-imports`; haptics belong to the shell/presenter.
import * as Haptics from 'expo-haptics';

export function buzz(): Promise<void> {
  return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}
