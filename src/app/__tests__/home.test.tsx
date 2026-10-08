import {
  fireEvent,
  renderRouter,
  screen,
  waitFor,
} from 'expo-router/testing-library';

import { PROFILE_COPY } from '@/data/strings';
import { onboardingService } from '@/services/OnboardingService';

/**
 * Story 1.7 — reachability: the placeholder home's one link makes Profile
 * reachable (and, from Profile, the About notice).
 *
 * The gate (Story 1.6) renders the placeholder home once the notice is
 * acknowledged and onboarding is complete, and Story 1.7 adds the single
 * `Profile` link that gets the user off the placeholder. Story 1.8 replaces both
 * the placeholder and this link.
 *
 * This lives in its own file because `renderRouter` mounts `src/app` with a
 * module-global router store that is not reset between renders within one file:
 * a press-navigation test that runs after another press-navigation test can have
 * its effects swallowed by the first test's still-settling `act` scope. One
 * press-navigation test per file keeps each assertion on a fresh store.
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

describe('the placeholder home reaches Profile', () => {
  it('links the acknowledged home to the Profile destination', async () => {
    service.readOnboardingState.mockResolvedValue({
      acknowledged: true,
      step: 4,
    });

    const router = renderRouter('./src/app', { initialUrl: '/' });
    await router;
    await waitFor(() =>
      expect(service.readOnboardingState).toHaveBeenCalled(),
    );
    await waitFor(() => expect(screen.getByText('NightTrace')).toBeTruthy());

    fireEvent.press(screen.getByLabelText(PROFILE_COPY.homeLinkLabel));

    await waitFor(() => expect(router.getPathname()).toBe('/profile'));
    // The Profile destination renders once reached — the About row is real.
    expect(screen.getByText(PROFILE_COPY.aboutRowLabel)).toBeTruthy();
  });
});
