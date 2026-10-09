import { fireEvent, renderRouter, screen, waitFor } from 'vitest-expo/router';

import { appRoutes } from './routes';

/**
 * Story 1.8 — TAB_SELECT: tapping a non-active tab activates its route; a
 * re-tap of the active tab is a no-op.
 *
 * This lives in its own file because the harness's module-global router store
 * is not reset between renders within a file: one press-navigation test per file
 * (the `index.test.tsx` convention).
 */

describe('selecting a tab', () => {
  afterEach(() => {
    // `renderRouter` turns on fake timers; restore them afterwards.
    vi.useRealTimers();
  });

  it('moves to the tapped tab and ignores a re-tap of the active tab', async () => {
    const router = await renderRouter(appRoutes, { initialUrl: '/home' });
    await waitFor(() => expect(router.getPathname()).toBe('/home'));

    fireEvent.press(screen.getByLabelText('INVESTIGATE'));
    await waitFor(() => expect(router.getPathname()).toBe('/investigate'));

    // The bar's selection follows the route — the shell's `activeTab` wiring is
    // otherwise unobserved. A shell that always passed `activeTab="HOME"` would
    // highlight the wrong tab with every other test still green.
    expect(
      screen.getByLabelText('INVESTIGATE').props.accessibilityState,
    ).toEqual({ selected: true });
    expect(screen.getByLabelText('HOME').props.accessibilityState).toEqual({
      selected: false,
    });

    // Re-tapping the active tab is a no-op: the bar reports a *change*.
    fireEvent.press(screen.getByLabelText('INVESTIGATE'));
    await waitFor(() => expect(router.getPathname()).toBe('/investigate'));
  });
});
