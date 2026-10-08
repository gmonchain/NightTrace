import { Stack } from 'expo-router';

/**
 * The modal route group (Story 1.7).
 *
 * Story 1.7 presents the About notice as the design's **sheet**, per
 * `EXPERIENCE.md` (About & entertainment is a sheet, not a full-screen push).
 * This group is where that sheet lives; the group itself declares no header, and
 * its screens are presented as transparent modals so the Profile screen the user
 * came from stays behind the sheet's scrim — the sheet's own `ntUp`/`ntFade`
 * entrance is the animation, so the native transition is disabled (`animation:
 * 'none'`) rather than playing a second, conflicting one.
 *
 * The group holds one route today (`about`); the arch spine's Structural Seed
 * gives this group the product's sheets (intensity, low power, permissions,
 * triage, confirm, leave the field, clearance, delete my data, discard case), and
 * later stories add them here.
 */
export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'transparentModal',
        animation: 'none',
      }}
    />
  );
}
