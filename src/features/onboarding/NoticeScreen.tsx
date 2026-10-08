import { ONBOARDING_COPY } from '@/data/strings';
import {
  onboardingService,
  type OnboardingService,
} from '@/services/OnboardingService';

import { OnboardingAction } from './OnboardingAction';
import { OnboardingFrame } from './OnboardingFrame';

/**
 * Onboarding screen 1 — the non-skippable entertainment notice.
 *
 * It is the only screen with no back affordance or gesture (the route disables
 * it), and the app is not reachable until its `I understand` action has
 * persisted the acknowledgement through the service. The write goes through the
 * service — never `db/kv.ts` directly (AD-12) — and a failed write still
 * advances: the service logs it field-free and resolves, and the path moves on
 * rather than trapping the user behind an unwritable setting.
 *
 * The copy carries `ENTERTAINMENT_LINE` (imported) and the frame's four
 * hairlines show position 1 of 4. The safety content is not here.
 */

export type NoticeScreenProps = {
  /** Advance to screen 2 (the route owns the navigation). */
  readonly onAdvance: () => void;
  /** Injected for tests; defaults to the module service. */
  readonly service?: OnboardingService;
};

export function NoticeScreen({
  onAdvance,
  service = onboardingService,
}: NoticeScreenProps): React.JSX.Element {
  const copy = ONBOARDING_COPY.notice;

  const acknowledge = async (): Promise<void> => {
    // Persist the device-local acknowledgement, then record that screen 1 is
    // complete. Both are swallowed failures; the advance happens either way.
    await service.acknowledgeNotice();
    await service.setStep(1);
    onAdvance();
  };

  return (
    <OnboardingFrame
      step={1}
      kicker={copy.kicker}
      headline={copy.headline}
      body={copy.body}
    >
      <OnboardingAction
        label={copy.actionLabel}
        onPress={() => {
          void acknowledge();
        }}
      />
    </OnboardingFrame>
  );
}
