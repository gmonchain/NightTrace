import {
  fireEvent,
  renderRouter,
  screen,
  waitFor,
} from 'expo-router/testing-library';

import { ABOUT_NOTICE, ABOUT_NOTICE_COPY, PROFILE_COPY } from '@/data/strings';
import { onboardingService } from '@/services/OnboardingService';
import {
  find,
  flatten,
  mergedStyle,
  setReduceMotion,
  spyOnTiming,
  textContent,
  type HostElement,
} from '@/ui/components/__tests__/tree';
import { colors } from '@/ui/theme/tokens';

/**
 * Story 1.7 — the Profile→About path, exercised over the real route tree.
 *
 * `renderRouter` mounts `src/app`, so these are the route-level matrix rows:
 * OPEN_ABOUT walks Profile → the About sheet, and CLOSE_ABOUT walks back to
 * Profile; a second case asserts the notice is presented *inside the `Sheet`
 * surface* (its panel, scrim and grabber), since dropping the wrapper would
 * otherwise ship green. (The cold-deep-link close arm lives in
 * `aboutDeepLink.test.tsx`, kept separate because the harness's module-global
 * router store is not reset between renders within one file, so a file holds at
 * most one *press-navigation* test.)
 *
 * `Animated.timing` is spied out so the `Sheet`'s entrance never advances a
 * frame under the test renderer (the Story 1.4 `Sheet` suite's convention), and
 * Reduce Motion keeps the panel presented at rest.
 */

jest.mock('@/services/OnboardingService', () => {
  const actual = jest.requireActual('@/services/OnboardingService');
  return {
    ...actual,
    onboardingService: {
      readOnboardingState: jest.fn(),
      acknowledgeNotice: jest.fn(),
      setStep: jest.fn(),
      complete: jest.fn(),
    },
  };
});

const service = jest.mocked(onboardingService);

const SAFETY_PARAGRAPH =
  ABOUT_NOTICE.sections.find((section) => section.heading === 'SAFETY')
    ?.paragraphs.join(' ') ?? '';

/**
 * The `Sheet` surface's own pieces, read straight off the host tree: the panel
 * (`ledger` surface), the scrim (`night-deep` dim) and the grabber
 * (`rule-strong`). These are the marks that prove the notice is presented *on
 * the design's sheet* rather than in a bare view — dropping the `<Sheet>` wrapper
 * would leave the notice rendering, so the presentation is asserted here.
 */
function sheetPanel(root: HostElement | null): HostElement | undefined {
  return find(
    root,
    (element) => mergedStyle(element).backgroundColor === colors.ledger,
  );
}

function sheetScrim(root: HostElement | null): HostElement | undefined {
  return find(
    root,
    (element) => mergedStyle(element).backgroundColor === colors['night-deep'],
  );
}

function sheetGrabber(root: HostElement | null): HostElement | undefined {
  return find(
    root,
    (element) =>
      mergedStyle(element).backgroundColor === colors['rule-strong'],
  );
}

describe('the Profile-to-About path over the real route tree', () => {
  let timing: ReturnType<typeof spyOnTiming>;
  let restoreReduceMotion: () => void;

  beforeEach(() => {
    jest.clearAllMocks();
    timing = spyOnTiming();
    // Reduce Motion keeps the `Sheet` presented at rest instead of scheduling an
    // entrance, so the sheet's own effect does not interleave with the router's.
    restoreReduceMotion = setReduceMotion(true);
    service.readOnboardingState.mockResolvedValue({
      acknowledged: true,
      step: 4,
    });
  });

  afterEach(() => {
    timing.timing.mockRestore();
    restoreReduceMotion();
    // `renderRouter` turns on fake timers; restore them so the next test's
    // render and effects settle on real timers (the `index.test.tsx` convention).
    jest.useRealTimers();
  });

  it('presents the notice inside the Sheet surface (panel, scrim and grabber)', async () => {
    // A non-pressing render, kept ahead of the one press-navigation test in this
    // file: the harness's module-global router store is not reset between
    // renders, so a second *press-navigation* render would have its effects
    // swallowed (the `index.test.tsx` convention).
    const router = renderRouter('./src/app', { initialUrl: '/about' });
    await router;
    await waitFor(() =>
      expect(screen.getByText(ABOUT_NOTICE.title)).toBeTruthy(),
    );

    const root = screen.toJSON();
    const panel = sheetPanel(root);
    expect(panel).toBeDefined();
    if (panel === undefined) {
      throw new Error('no sheet panel');
    }

    // The notice's own title is rendered inside the Sheet's panel surface...
    const title = find(
      root,
      (element) =>
        element.type === 'Text' && textContent(element) === ABOUT_NOTICE.title,
    );
    expect(title).toBeDefined();
    expect(flatten(panel)).toContain(title);
    // ...over the scrim, with the grabber bar the Sheet draws.
    expect(sheetScrim(root)).toBeDefined();
    expect(sheetGrabber(root)).toBeDefined();
  });

  it('OPEN_ABOUT then CLOSE_ABOUT: the notice opens from Profile and closes back to it', async () => {
    const router = renderRouter('./src/app', { initialUrl: '/profile' });
    await router;

    await waitFor(() =>
      expect(screen.getByText(PROFILE_COPY.aboutRowLabel)).toBeTruthy(),
    );
    expect(router.getPathname()).toBe('/profile');

    fireEvent.press(screen.getByLabelText(PROFILE_COPY.aboutRowLabel));

    await waitFor(() => expect(router.getPathname()).toBe('/about'));
    // The full notice presents: its title and the safety content are rendered.
    expect(screen.getByText(ABOUT_NOTICE.title)).toBeTruthy();
    expect(screen.getByText(SAFETY_PARAGRAPH)).toBeTruthy();

    fireEvent.press(screen.getByLabelText(ABOUT_NOTICE_COPY.closeLabel));

    await waitFor(() => expect(router.getPathname()).toBe('/profile'));
  });
});
