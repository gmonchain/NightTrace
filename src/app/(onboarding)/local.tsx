import { useRouter } from 'expo-router';

import { LocalScreen } from '@/features/onboarding/LocalScreen';

/** Screen 2 of the onboarding path — the case is local. */
export default function LocalRoute() {
  const router = useRouter();
  return (
    <LocalScreen
      onAdvance={() => {
        router.replace('/night');
      }}
    />
  );
}
