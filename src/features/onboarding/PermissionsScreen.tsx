import { ONBOARDING_COPY } from '@/data/strings';
import {
  onboardingService,
  type OnboardingService,
} from '@/services/OnboardingService';

import { OnboardingAction } from './OnboardingAction';
import { OnboardingFrame } from './OnboardingFrame';

/**
 * Onboarding screen 4 — permissions are asked only when needed.
 *
 * It records the permission philosophy and requests **nothing**: no permission
 * prompt, no sensor read. Its `Enter NightTrace` action records completion
 * (`complete()`, step 4) through the service, after which the gate renders the
 * app rather than onboarding. Only a successful write advances: on a failed
 * write the screen stays put with the action as the retry, rather than looping
 * the user through a gate that re-reads step 3 with the app unreachable.
 */

export type PermissionsScreenProps = {
  /** Make the app reachable (the route owns the navigation). */
  readonly onAdvance: () => void;
  /** Injected for tests; defaults to the module service. */
  readonly service?: OnboardingService;
};

export function PermissionsScreen({
  onAdvance,
  service = onboardingService,
}: PermissionsScreenProps): React.JSX.Element {
  const copy = ONBOARDING_COPY.permissions;

  const finish = async (): Promise<void> => {
    // The action remains pressable as the retry: advancing on a failed write
    // would make the gate re-read step 3 and trap the user on screen 4.
    const recorded = await service.complete();
    if (recorded) {
      onAdvance();
    }
  };

  return (
    <OnboardingFrame
      step={4}
      kicker={copy.kicker}
      headline={copy.headline}
      body={copy.body}
    >
      <OnboardingAction
        label={copy.actionLabel}
        onPress={() => {
          void finish();
        }}
      />
    </OnboardingFrame>
  );
}
