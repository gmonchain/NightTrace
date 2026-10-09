import { renderRouter, screen, waitFor } from 'expo-router/testing-library';

/**
 * Story 1.8 — TAB_BAR_ABSENT: no tab bar renders on a Hunt or Session route.
 *
 * Hunt and Session are siblings of `(tabs)`, not children, so the tab bar is
 * structurally absent there — this proves it against the real route tree.
 */

describe('the tab bar is absent outside the tabs', () => {
  afterEach(() => {
    // `renderRouter` turns on fake timers; restore them afterwards.
    jest.useRealTimers();
  });

  it('renders no tab bar on the Hunt Brief', async () => {
    const router = renderRouter('./src/app', { initialUrl: '/hunt/abc/brief' });
    await router;
    await waitFor(() =>
      expect(router.getPathname()).toBe('/hunt/abc/brief'),
    );
    expect(screen.getByText('HUNT BRIEF')).toBeTruthy();
    expect(screen.queryAllByRole('tab')).toHaveLength(0);
  });

  it('renders no tab bar on the Session', async () => {
    const router = renderRouter('./src/app', { initialUrl: '/session' });
    await router;
    await waitFor(() => expect(router.getPathname()).toBe('/session'));
    expect(screen.getByText('SESSION SHELL')).toBeTruthy();
    expect(screen.queryAllByRole('tab')).toHaveLength(0);
  });
});
