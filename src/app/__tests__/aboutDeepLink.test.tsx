import {
  fireEvent,
  renderRouter,
  screen,
  waitFor,
} from 'vitest-expo/router';

import { ABOUT_NOTICE, ABOUT_NOTICE_COPY } from '@/data/strings';
import { setReduceMotion, spyOnTiming } from '@/ui/components/__tests__/tree';

import { appRoutes } from './routes';

/**
 * Story 1.7 — the About route's cold-deep-link close arm (CLOSE_ABOUT).
 *
 * The Profile-first case in `about.test.tsx` always enters with history to pop,
 * so its close action takes the `router.canGoBack()` arm and the
 * `router.replace('/profile')` fallback for a history-less entry is never
 * executed — deleting that fallback would ship green. A deep link straight to
 * `/about` has no history, so this case drives exactly that arm: closing a
 * deep-linked About must still land on Profile.
 *
 * It lives in its own file because the harness's module-global router store is
 * not reset between renders within a file: a *press-navigation* test after
 * another sees its effects swallowed (the `index.test.tsx` convention — one
 * press-navigation test per file). `Animated.timing` is spied out so the
 * `Sheet`'s entrance never advances under the test renderer, and Reduce Motion
 * keeps the panel presented at rest.
 */

describe('a cold deep-link to About', () => {
  let timing: ReturnType<typeof spyOnTiming>;
  let restoreReduceMotion: () => void;

  beforeEach(() => {
    timing = spyOnTiming();
    restoreReduceMotion = setReduceMotion(true);
  });

  afterEach(() => {
    timing.timing.mockRestore();
    restoreReduceMotion();
    // `renderRouter` turns on fake timers; restore them afterwards (the
    // `index.test.tsx` convention).
    vi.useRealTimers();
  });

  it('closes to Profile even with no history to pop', async () => {
    const router = await renderRouter(appRoutes, { initialUrl: '/about' });

    // The notice presents from the deep link.
    await waitFor(() =>
      expect(screen.getByText(ABOUT_NOTICE.title)).toBeTruthy(),
    );

    fireEvent.press(screen.getByLabelText(ABOUT_NOTICE_COPY.closeLabel));

    await waitFor(() => expect(router.getPathname()).toBe('/profile'));
  });
});
