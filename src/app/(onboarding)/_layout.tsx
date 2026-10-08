import { Stack } from 'expo-router';

/**
 * The onboarding route group (Story 1.6) — four screens, one path.
 *
 * No header anywhere (the frame carries its own content), and **screen 1
 * (`notice`) disables the back gesture**: the entertainment notice is
 * non-skippable, cannot be dismissed unacknowledged, and there is no back
 * affordance to leave it. The group is otherwise a plain stack; each route is a
 * thin wrapper that hands the frame a navigation callback.
 */
export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* The one screen where a back gesture would skip the acknowledgement. */}
      <Stack.Screen name="notice" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
