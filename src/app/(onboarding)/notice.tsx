import { useRouter } from 'expo-router';

import { NoticeScreen } from '@/features/onboarding/NoticeScreen';

/**
 * Screen 1 of the onboarding path — the non-skippable entertainment notice.
 *
 * The route carries no data access and no engine call (AD-12); it composes the
 * feature screen and hands it a navigation callback. `replace` (not `push`)
 * keeps the acknowledged notice off the back stack.
 */
export default function NoticeRoute() {
  const router = useRouter();
  return (
    <NoticeScreen
      onAdvance={() => {
        router.replace('/local');
      }}
    />
  );
}
