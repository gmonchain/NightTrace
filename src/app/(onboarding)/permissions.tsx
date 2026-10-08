import { useRouter } from 'expo-router';

import { PermissionsScreen } from '@/features/onboarding/PermissionsScreen';

/**
 * Screen 4 of the onboarding path — permissions are asked only when needed.
 * `Enter NightTrace` completes onboarding and lands on Home (index), which the
 * gate then renders.
 */
export default function PermissionsRoute() {
  const router = useRouter();
  return (
    <PermissionsScreen
      onAdvance={() => {
        router.replace('/');
      }}
    />
  );
}
