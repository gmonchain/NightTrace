import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  nextOnboardingDestination,
  onboardingService,
  type OnboardingDestination,
  type OnboardingScreen,
} from '@/services/OnboardingService';

/**
 * The first-launch gate (Story 1.6).
 *
 * On launch it reads the onboarding settings **through the service** (a route
 * owns no data access — AD-12) and sends the user either into the onboarding
 * screen they should see or, once the notice is acknowledged and all four
 * screens are complete, into the app. A clean install lands on screen 1; a
 * mid-onboarding relaunch resumes where the user left; an acknowledged, complete
 * install never sees onboarding again.
 *
 * The placeholder below is the app body Story 1.8 replaces with the four-tab
 * shell. No permission is requested and no sensor is read on any path through
 * here.
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
    // Placeholder home; Story 1.8 replaces this with the four-tab shell.
    return (
      <View style={styles.container}>
        <Text style={styles.title}>NightTrace</Text>
      </View>
    );
  }

  return <Redirect href={onboardingHref(destination)} />;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
  },
});
