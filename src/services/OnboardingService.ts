/**
 * `OnboardingService` — the one module that touches the onboarding settings.
 *
 * AD-12: routes own no data access. The four onboarding screens and the
 * first-launch gate compose components and call this service; only this file
 * reads or writes `noticeAcknowledged` / `onboardingStep` through Story 1.1's
 * typed `db/kv.ts` wrapper.
 *
 * The `Kv` is injected (defaulting to the module `kv`), which is the seam that
 * makes the story's I/O matrix testable without the native `expo-sqlite`
 * backend: a test binds a `createKv(fakeStorage())` and drives the same code.
 *
 * **The step is the number of screens completed, not the screen on screen.**
 * `0` is a clean install; after acknowledging screen 1 it is `1`, and the screen
 * to present is `step + 1` — so a mid-onboarding relaunch with `onboardingStep`
 * 2 resumes at screen 3 (`night`), not screen 1. `ONBOARDING_COMPLETE_STEP` (4)
 * means all four are done and the app is reachable.
 *
 * Nothing here requests a permission or reads a sensor, and nothing throws
 * across the boundary: a failed settings write is logged field-free (the closed
 * `kv.write_failed` code, no fields). An unwritable acknowledgement still
 * advances — the notice must not trap the user on screen 1 — while `complete()`
 * returns whether the write landed, so screen 4 can stay put and leave the
 * action as the retry rather than looping the user through a re-read of step 3.
 */

import { ONBOARDING_SCREEN_KEYS } from '@/data/strings';
import { kv as defaultKv, type Kv } from '@/db/kv';
import { Logger } from '@/services/Logger';

/**
 * The four onboarding screens, in the order the path presents them.
 *
 * Derived from the copy table's own `ONBOARDING_SCREEN_KEYS` rather than
 * re-listed here: the string table is the one place the path order is authored,
 * so the service cannot drift out of it (Story 1.6 review).
 */
export const ONBOARDING_ORDER = ONBOARDING_SCREEN_KEYS;

export type OnboardingScreen = (typeof ONBOARDING_ORDER)[number];

/** Where the gate sends the user: an onboarding screen, or the app (Home). */
export type OnboardingDestination = OnboardingScreen | 'home';

/** How many screens the path has. The completion marker is one past the last. */
export const ONBOARDING_SCREEN_COUNT = ONBOARDING_ORDER.length;

/** The persisted `onboardingStep` value that means "all four are done". */
export const ONBOARDING_COMPLETE_STEP = ONBOARDING_SCREEN_COUNT;

/** The onboarding settings, as the gate reads them. */
export type OnboardingState = {
  /** The device-local acknowledgement of the non-skippable notice. */
  readonly acknowledged: boolean;
  /** Screens completed, `0..ONBOARDING_COMPLETE_STEP`. */
  readonly step: number;
};

export interface OnboardingService {
  /** Read the acknowledgement and the persisted step. Never throws. */
  readOnboardingState(): Promise<OnboardingState>;
  /** Persist the device-local acknowledgement. Never throws. */
  acknowledgeNotice(): Promise<void>;
  /** Persist the position, clamped and never moved backwards. Never throws. */
  setStep(step: number): Promise<void>;
  /**
   * Record completion (step = `ONBOARDING_COMPLETE_STEP`). Never throws; the
   * resolved boolean reports whether the write landed, so the caller can stay on
   * the last screen and retry rather than advancing into a re-read of step 3.
   */
  complete(): Promise<boolean>;
}

/**
 * A stored step narrowed to an integer in `0..ONBOARDING_COMPLETE_STEP`. `kv`
 * already resolves a missing or wrongly-typed value to `null`; this also floors
 * a stored out-of-range number, so a hand-edited or downgraded value cannot
 * index past the path.
 */
function clampStep(value: number | null): number {
  if (value === null || !Number.isFinite(value)) {
    return 0;
  }
  return Math.min(Math.max(Math.trunc(value), 0), ONBOARDING_COMPLETE_STEP);
}

/**
 * The one pure mapping the gate and the suite share: state → the screen to
 * present (or `home` once acknowledged-and-complete). No storage, so it is
 * directly assertable.
 */
export function nextOnboardingDestination(
  state: OnboardingState,
): OnboardingDestination {
  if (!state.acknowledged) {
    return 'notice';
  }
  if (state.step >= ONBOARDING_COMPLETE_STEP) {
    return 'home';
  }
  // An acknowledged user never returns to the non-skippable notice — even a
  // half-written acknowledgement (`noticeAcknowledged` true, `onboardingStep` 0)
  // resumes on the screen after it, rather than looping back to screen 1.
  return ONBOARDING_ORDER[Math.max(1, state.step)] ?? 'home';
}

export function createOnboardingService(kv: Kv = defaultKv): OnboardingService {
  return {
    async readOnboardingState(): Promise<OnboardingState> {
      const acknowledged = (await kv.get('noticeAcknowledged')) ?? false;
      const step = clampStep(await kv.get('onboardingStep'));
      return { acknowledged, step };
    },

    async acknowledgeNotice(): Promise<void> {
      const result = await kv.set('noticeAcknowledged', true);
      if (!result.ok) {
        // Field-free: a write failure is not evidence and carries no value.
        Logger.warn('kv.write_failed');
      }
    },

    async setStep(step: number): Promise<void> {
      // Monotonic: re-reaching an earlier screen (a back-navigation race, a
      // resumed relaunch) must not rewind a later position, so keep the greater
      // of the stored and the requested step.
      const requested = clampStep(step);
      const current = clampStep(await kv.get('onboardingStep'));
      const result = await kv.set('onboardingStep', Math.max(current, requested));
      if (!result.ok) {
        Logger.warn('kv.write_failed');
      }
    },

    async complete(): Promise<boolean> {
      const result = await kv.set('onboardingStep', ONBOARDING_COMPLETE_STEP);
      if (!result.ok) {
        Logger.warn('kv.write_failed');
        return false;
      }
      return true;
    },
  };
}

/** The application's onboarding service, bound to the real settings wrapper. */
export const onboardingService: OnboardingService = createOnboardingService();
