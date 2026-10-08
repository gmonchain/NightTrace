import { ONBOARDING_COPY } from '@/data/strings';
import {
  onboardingService,
  type OnboardingService,
} from '@/services/OnboardingService';

import { OnboardingAction } from './OnboardingAction';
import { OnboardingFrame } from './OnboardingFrame';

/**
 * Onboarding screen 2 — the case is local.
 *
 * Records that a case is generated on-device from where the user is and what
 * the hour makes of it, and that nothing leaves the phone. Its `Continue`
 * action persists position 2 through the service before advancing.
 */

export type LocalScreenProps = {
  /** Advance to screen 3 (the route owns the navigation). */
  readonly onAdvance: () => void;
  /** Injected for tests; defaults to the module service. */
  readonly service?: OnboardingService;
};

export function LocalScreen({
  onAdvance,
  service = onboardingService,
}: LocalScreenProps): React.JSX.Element {
  const copy = ONBOARDING_COPY.local;

  const advance = async (): Promise<void> => {
    await service.setStep(2);
    onAdvance();
  };

  return (
    <OnboardingFrame
      step={2}
      kicker={copy.kicker}
      headline={copy.headline}
      body={copy.body}
    >
      <OnboardingAction
        label={copy.actionLabel}
        onPress={() => {
          void advance();
        }}
      />
    </OnboardingFrame>
  );
}
