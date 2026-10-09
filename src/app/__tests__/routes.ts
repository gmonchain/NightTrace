import type { MockContextConfig } from 'vitest-expo/router';

import ModalsLayout from '../(modals)/_layout';
import About from '../(modals)/about';
import OnboardingLayout from '../(onboarding)/_layout';
import Local from '../(onboarding)/local';
import Night from '../(onboarding)/night';
import Notice from '../(onboarding)/notice';
import Permissions from '../(onboarding)/permissions';
import TabsLayout from '../(tabs)/_layout';
import Home from '../(tabs)/home';
import Investigate from '../(tabs)/investigate';
import Journal from '../(tabs)/journal';
import Profile from '../(tabs)/profile';
import RootLayout from '../_layout';
import HuntBrief from '../hunt/[huntId]/brief';
import SessionLayout from '../session/_layout';
import SessionShell from '../session/index';
import Index from '../index';

/**
 * The real `src/app` route tree, mounted as an in-memory context for
 * `renderRouter`.
 *
 * `renderRouter('./src/app')` is *not* equivalent under Vitest. The string path
 * goes through expo-router's `require-context-ponyfill`, which loads every file
 * under `src/app` with Node's `require` — outside Vite's module graph. Two
 * copies of each module then exist: the screen renders Vite's copy, while
 * `vi.mock(...)` replaces the Node copy's *or* the module a `require` returns is
 * the real one. Either way a mocked service is never the instance the screen
 * imports, so a `readOnboardingState` stub reads back uncalled — the same
 * "two module graphs" hazard `vitest-native` warns about. It also makes every
 * `waitFor` poll in real time (~15s per render) because the Node-loaded tree
 * never settles under the fake timers `renderRouter` installs.
 *
 * Passing the components as an in-memory `MemoryContext` keeps the whole tree in
 * Vite's graph: `vi.mock` intercepts, and the render settles in milliseconds.
 * Keys are extension-free route names relative to `src/app` (route groups keep
 * their parentheses); adding a route to this map is what lets a test navigate
 * to it. Every route a suite reaches, plus the layouts it renders through, must
 * be listed — an unmapped route resolves to a not-found screen.
 */
export const appRoutes: MockContextConfig = {
  _layout: RootLayout,
  index: Index,
  '(modals)/_layout': ModalsLayout,
  '(modals)/about': About,
  '(onboarding)/_layout': OnboardingLayout,
  '(onboarding)/local': Local,
  '(onboarding)/night': Night,
  '(onboarding)/notice': Notice,
  '(onboarding)/permissions': Permissions,
  '(tabs)/_layout': TabsLayout,
  '(tabs)/home': Home,
  '(tabs)/investigate': Investigate,
  '(tabs)/journal': Journal,
  '(tabs)/profile': Profile,
  'hunt/[huntId]/brief': HuntBrief,
  'session/_layout': SessionLayout,
  'session/index': SessionShell,
};
