import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PROFILE_COPY } from '@/data/strings';
import {
  nextOnboardingDestination,
  onboardingService,
  type OnboardingDestination,
  type OnboardingScreen,
} from '@/services/OnboardingService';
import {
  colors,
  components,
  rounded,
  spacing,
  typography,
} from '@/ui/theme/tokens';
import { textStyle } from '@/ui/theme/type';

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

/** The link label's type style, through the one em→point conversion. */
const linkLabelStyle = textStyle(typography.label);

export default function Index(): React.JSX.Element | null {
  const router = useRouter();
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
    // Placeholder home; Story 1.8 replaces this with the four-tab shell. Until
    // then, the one link below is what makes the Profile destination (and, from
    // it, the About notice) reachable (Story 1.7).
    return (
      <View style={styles.container}>
        <Text style={styles.title}>NightTrace</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={PROFILE_COPY.homeLinkLabel}
          onPress={() => {
            router.push('/profile');
          }}
          style={styles.link}
        >
          <Text style={[linkLabelStyle, styles.linkLabel]}>
            {PROFILE_COPY.homeLinkLabel}
          </Text>
        </Pressable>
      </View>
    );
  }

  return <Redirect href={onboardingHref(destination)} />;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    gap: spacing['5'],
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
  },
  link: {
    borderColor: colors['rule-strong'],
    borderRadius: rounded.DEFAULT,
    borderWidth: components.rule.height,
    paddingHorizontal: spacing['6'],
    paddingVertical: spacing['4'],
  },
  linkLabel: {
    color: colors.bone,
  },
});
