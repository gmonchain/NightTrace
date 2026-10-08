import { ONBOARDING_COPY } from '@/data/strings';
import {
  onboardingService,
  type OnboardingService,
} from '@/services/OnboardingService';

import { OnboardingAction } from './OnboardingAction';
import { OnboardingFrame } from './OnboardingFrame';

/**
 * Onboarding screen 3 — the user chooses their night.
 *
 * It teaches the epic's frame sentence and **nothing more**: there is no
 * intensity selector and no haptics or reduce-motion toggle here. FR-9/FR-10
 * place the intensity choice in the Brief, and Story 2.7 owns its lock and
 * promise; building that control on this screen would pre-empt a later story and
 * invent a settings surface the app has not defined (Story 1.6, Design Notes).
 *
 * Its `Continue` action persists position 3 through the service before
 * advancing.
 */

export type NightScreenProps = {
  /** Advance to screen 4 (the route owns the navigation). */
  readonly onAdvance: () => void;
  /** Injected for tests; defaults to the module service. */
  readonly service?: OnboardingService;
};

export function NightScreen({
  onAdvance,
  service = onboardingService,
}: NightScreenProps): React.JSX.Element {
  const copy = ONBOARDING_COPY.night;

  const advance = async (): Promise<void> => {
    await service.setStep(3);
    onAdvance();
  };

  return (
    <OnboardingFrame
      step={3}
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
