import { Stack } from 'expo-router';

/**
 * The Session stack (Story 1.8).
 *
 * The Session shell is immersive and the tab bar is absent (this group is a
 * sibling of `(tabs)`); the seven tools live **inside** this stack, so opening
 * one pushes it *above* the live session — one full-screen surface at a time —
 * and popping it returns to the session. No header: the session draws its own
 * chrome.
 */
export default function SessionLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
