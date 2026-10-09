import { renderRouter, screen, waitFor } from 'expo-router/testing-library';

import { TAB_ROUTE_NAMES, TAB_ROUTES } from '@/features/shell/navigation';
import { TAB_IDS } from '@/ui/components/TabBar';

/**
 * Story 1.8 — TAB_LIST: the shell holds exactly four tabs.
 *
 * The declaration half asserts the list directly from the primitive's `TAB_IDS`;
 * the rendered half mounts the real `src/app` tree at `/home` and asserts the
 * `TabBar` shows exactly the four tabs, in order, with no Equipment and no
 * Settings tab.
 */

describe('the four-tab shell', () => {
  afterEach(() => {
    // `renderRouter` turns on fake timers; restore them afterwards (the
    // `index.test.tsx` convention).
    jest.useRealTimers();
  });

  it('renders exactly HOME · INVESTIGATE · FIELD JOURNAL · PROFILE, in order', async () => {
    const router = renderRouter('./src/app', { initialUrl: '/home' });
    await router;
    await waitFor(() => expect(router.getPathname()).toBe('/home'));

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(4);
    expect(tabs.map((tab) => tab.props.accessibilityLabel)).toEqual([
      'HOME',
      'INVESTIGATE',
      'FIELD JOURNAL',
      'PROFILE',
    ]);

    // No Equipment tab and no Settings tab.
    expect(screen.queryByLabelText('EQUIPMENT')).toBeNull();
    expect(screen.queryByLabelText('SETTINGS')).toBeNull();
  });

  it('maps the four tabs to the four route names the shell renders', () => {
    expect(TAB_IDS).toEqual([
      'HOME',
      'INVESTIGATE',
      'FIELD JOURNAL',
      'PROFILE',
    ]);
    expect(TAB_ROUTE_NAMES).toEqual([
      'home',
      'investigate',
      'journal',
      'profile',
    ]);
    expect(TAB_ROUTES['FIELD JOURNAL']).toBe('journal');
  });
});
