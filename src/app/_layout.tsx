import { Stack } from 'expo-router';

/**
 * The only route file Story 1.1 writes. `expo-router` needs a root layout and
 * an index route for the app to launch.
 *
 * Story 1.8 declares the real four-tab tree; this is deliberately not it.
 */
export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
