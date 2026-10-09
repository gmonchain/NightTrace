import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

import {
  nextOnboardingDestination,
  onboardingService,
  type OnboardingDestination,
  type OnboardingScreen,
} from '@/services/OnboardingService';

/**
 * The first-launch gate (Story 1.6; Story 1.8 lands its `home` branch).
 *
 * On launch it reads the onboarding settings **through the service** (a route
 * owns no data access — AD-12) and sends the user either into the onboarding
 * screen they should see or, once the notice is acknowledged and all four
 * screens are complete, into the app. A clean install lands on screen 1; a
 * mid-onboarding relaunch resumes where the user left; an acknowledged, complete
 * install never sees onboarding again — it is redirected to the HOME tab.
 *
 * **The gate owns `/`, so the HOME tab lives at `/home`** (Story 1.8's design
 * note): two routes may not resolve to `/`, and the root layout must always
 * render its navigator. The `home` branch therefore redirects to the four-tab
 * shell's HOME tab exactly as the other branches redirect into onboarding.
 *
 * It still authors no shipped copy: it renders nothing itself — every branch is
 * a `Redirect`. No permission is requested and no sensor is read on any path
 * through here.
 */

/** The literal route for each onboarding screen — a closed union of hrefs. */
export type OnboardingHref = '/notice' | '/local' | '/night' | '/permissions';

/**
 * The destination → href mapping, exported so a test can assert every arm
 * (a transposed href would otherwise ship green — Story 1.6 review).
 */
export function onboardingHref(screen: OnboardingScreen): OnboardingHref {
  switch (screen) {
    case 'notice':
      return '/notice';
    case 'local':
      return '/local';
    case 'night':
      return '/night';
    case 'permissions':
      return '/permissions';
    default: {
      const exhaustive: never = screen;
      return exhaustive;
    }
  }
}

export default function Index(): React.JSX.Element | null {
  const [destination, setDestination] = useState<OnboardingDestination | null>(
    null,
  );

  useEffect(() => {
    let active = true;
    // The service never throws, so the `.then` is the only arm needed; the
    // guard drops a late resolve after unmount.
    void onboardingService.readOnboardingState().then((state) => {
      if (active) {
        setDestination(nextOnboardingDestination(state));
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // The state read is asynchronous; render nothing for the one frame it takes.
  if (destination === null) {
    return null;
  }

  if (destination === 'home') {
    // The four-tab shell's HOME tab (Story 1.8). `/` is the gate's, so HOME is
    // `/home`.
    return <Redirect href="/home" />;
  }

  return <Redirect href={onboardingHref(destination)} />;
}
