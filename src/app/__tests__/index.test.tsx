import {
  fireEvent,
  renderRouter,
  screen,
  testRouter,
  waitFor,
} from 'expo-router/testing-library';

import { ONBOARDING_COPY } from '@/data/strings';
import { onboardingService } from '@/services/OnboardingService';

import { onboardingHref } from '../index';

/**
 * Story 1.6 — the first-launch gate's route decision, exercised end to end.
 *
 * The gate's `onboardingHref` mapping is otherwise module-private and the route
 * decision never runs under a render, so a transposed href ships green. Here
 * `renderRouter` mounts the real `src/app` tree and asserts the pathname the
 * gate lands on for each onboarding state; the service is mocked so a test can
 * drive every state without the native settings backend.
 *
 * `@testing-library/react-native` v14's `render` is async, so the render's
 * promise is awaited before its effects settle and `screen` carries the queries;
 * `getPathname` rides on the promise expo-router returns.
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

/** Mount the gate at `/` and wait for its async read to settle. */
async function renderGate(state: {
  readonly acknowledged: boolean;
  readonly step: number;
}): Promise<{ readonly getPathname: () => string }> {
  service.readOnboardingState.mockResolvedValue(state);
  const router = renderRouter('./src/app', { initialUrl: '/' });
  // The render promise resolves once the initial tree and its effects flush;
  // `getPathname` stays on the promise expo-router returned.
  await router;
  await waitFor(() => expect(service.readOnboardingState).toHaveBeenCalled());
  return { getPathname: () => router.getPathname() };
}

describe('the first-launch gate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    service.acknowledgeNotice.mockResolvedValue(undefined);
    service.setStep.mockResolvedValue(undefined);
    service.complete.mockResolvedValue(true);
  });

  afterEach(() => {
    jest.useRealTimers();
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

  it('renders the home placeholder once acknowledged and complete', async () => {
    const { getPathname } = await renderGate({ acknowledged: true, step: 4 });

    await waitFor(() => expect(screen.getByText('NightTrace')).toBeTruthy());
    expect(getPathname()).toBe('/');
    // It rendered the placeholder rather than redirecting back into onboarding.
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
