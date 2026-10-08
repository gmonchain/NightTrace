import { useRouter } from 'expo-router';

import { NightScreen } from '@/features/onboarding/NightScreen';

/** Screen 3 of the onboarding path — the user chooses their night. */
export default function NightRoute() {
  const router = useRouter();
  return (
    <NightScreen
      onAdvance={() => {
        router.replace('/permissions');
      }}
    />
  );
}
