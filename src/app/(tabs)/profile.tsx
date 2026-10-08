import { useRouter } from 'expo-router';

import { ProfileScreen } from '@/features/profile/ProfileScreen';

/**
 * The Profile destination (Story 1.7).
 *
 * This route lives at `/profile` inside the `(tabs)` group. Story 1.8 declares
 * the four-tab shell that will hold it — this story adds the screen and this
 * single route, and adds no tab layout, because the shell is 1.8's.
 *
 * It owns no data access and no engine call (AD-12): it composes the feature
 * screen and hands it the one navigation callback that opens the notice.
 *
 * The callback uses `navigate` rather than `push`: a double tap before the sheet
 * presents resolves to the same `/about` route, so it cannot stack two About
 * sheets (which would leave the first close returning to the other sheet).
 */
export default function ProfileRoute() {
  const router = useRouter();
  return (
    <ProfileScreen
      onOpenAbout={() => {
        router.navigate('/about');
      }}
    />
  );
}
