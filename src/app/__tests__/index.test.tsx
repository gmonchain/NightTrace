import {
  fireEvent,
  renderRouter,
  screen,
  testRouter,
  waitFor,
} from 'vitest-expo/router';

import { ONBOARDING_COPY } from '@/data/strings';
import { onboardingService } from '@/services/OnboardingService';

import { onboardingHref } from '../index';
import { appRoutes } from './routes';

/**
 * Story 1.6 — the first-launch gate's route decision, exercised end to end.
 *
 * The gate's `onboardingHref` mapping is otherwise module-private and the route
 * decision never runs under a render, so a transposed href ships green. Here
 * `renderRouter` mounts the real `src/app` tree (the `appRoutes` context) and
 * asserts the pathname the gate lands on for each onboarding state; the service
 * is mocked so a test can drive every state without the native settings backend.
 *
 * `@testing-library/react-native` v14's `render` is async, so the render's
 * promise is awaited before its effects settle and `screen` carries the queries;
 * `getPathname` rides on the promise `renderRouter` returns.
 */

vi.mock('@/services/OnboardingService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/OnboardingService')>()),
  onboardingService: {
    readOnboardingState: vi.fn(),
    acknowledgeNotice: vi.fn(),
    setStep: vi.fn(),
    complete: vi.fn(),
  },
}));

const service = vi.mocked(onboardingService);

/** Mount the gate at `/` and wait for its async read to settle. */
async function renderGate(state: {
  readonly acknowledged: boolean;
  readonly step: number;
}): Promise<{ readonly getPathname: () => string }> {
  service.readOnboardingState.mockResolvedValue(state);
  const router = await renderRouter(appRoutes, { initialUrl: '/' });
  // The render promise resolves once the initial tree and its effects flush;
  // `getPathname` stays on the promise expo-router returned.
  await waitFor(() => expect(service.readOnboardingState).toHaveBeenCalled());
  return { getPathname: () => router.getPathname() };
}

describe('the first-launch gate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    service.acknowledgeNotice.mockResolvedValue(undefined);
    service.setStep.mockResolvedValue(undefined);
    service.complete.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('maps each onboarding destination to its own href', () => {
    // A transposed arm (`local` → '/night') fails here rather than shipping.
    expect(onboardingHref('notice')).toBe('/notice');
    expect(onboardingHref('local')).toBe('/local');
    expect(onboardingHref('night')).toBe('/night');
    expect(onboardingHref('permissions')).toBe('/permissions');
  });

  it('sends a clean install to the notice', async () => {
    const { getPathname } = await renderGate({ acknowledged: false, step: 0 });

    await waitFor(() => expect(getPathname()).toBe('/notice'));
    expect(screen.getByText(ONBOARDING_COPY.notice.headline)).toBeTruthy();
  });

  it.each([
    [1, '/local'],
    [2, '/night'],
    [3, '/permissions'],
  ])(
    'resumes an acknowledged user at step %i on %s',
    async (step, href) => {
      const { getPathname } = await renderGate({ acknowledged: true, step });

      await waitFor(() => expect(getPathname()).toBe(href));
    },
  );

  it('redirects a complete install to the HOME tab', async () => {
    const { getPathname } = await renderGate({ acknowledged: true, step: 4 });

    // Story 1.8: the gate's `home` branch redirects to the four-tab shell's
    // HOME tab (`/` is the gate's own path, so HOME lives at `/home`).
    await waitFor(() => expect(getPathname()).toBe('/home'));
    // It went into the shell rather than back into onboarding.
    expect(screen.queryByText(ONBOARDING_COPY.notice.headline)).toBeNull();
  });

  it('leaves the acknowledged notice unreachable by going back', async () => {
    const { getPathname } = await renderGate({ acknowledged: false, step: 0 });
    await waitFor(() => expect(getPathname()).toBe('/notice'));

    fireEvent.press(screen.getByLabelText(ONBOARDING_COPY.notice.actionLabel));
    await waitFor(() => expect(getPathname()).toBe('/local'));

    // The notice was replaced, not pushed, and the layout disables its gesture:
    // there is no history left to return to screen 1.
    expect(testRouter.canGoBack()).toBe(false);
  });
});
