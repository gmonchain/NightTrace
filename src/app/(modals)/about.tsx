import { useRouter } from 'expo-router';

import { NoticeSurface } from '@/features/about/NoticeSurface';
import { Sheet } from '@/ui/components';

/**
 * The About notice route (Story 1.7) — `/about`.
 *
 * It presents `NoticeSurface` rising on the design's `Sheet` primitive (the
 * sheet the design source puts About & entertainment in), and no more: the
 * route owns the navigation, so its close action returns to Profile. It carries
 * no data access and no engine call (AD-12), requests no permission and reads no
 * sensor.
 *
 * `router.back()` returns to whatever presented the sheet — Profile, in the
 * normal path — rather than pushing a new Profile, so the destination is not
 * duplicated on the stack. A cold deep-link to `/about` has no history to pop, so
 * the close action replaces itself with `/profile` instead, keeping the promise
 * that closing lands on Profile.
 */
export default function AboutRoute() {
  const router = useRouter();
  return (
    <Sheet>
      <NoticeSurface
        onClose={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/profile');
          }
        }}
      />
    </Sheet>
  );
}
