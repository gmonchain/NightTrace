import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { ENTERTAINMENT_LINE, ONBOARDING_COPY } from '@/data/strings';
import { createKv, type KvStorage } from '@/db/kv';
import { Logger, type LogRecord } from '@/services/Logger';
import {
  createOnboardingService,
  ONBOARDING_COMPLETE_STEP,
} from '@/services/OnboardingService';
import { colors } from '@/ui/theme/tokens';
import {
  find,
  flatten,
  mergedStyle,
  type HostElement,
} from '@/ui/components/__tests__/tree';

import { LocalScreen } from '../LocalScreen';
import { NightScreen } from '../NightScreen';
import { NoticeScreen } from '../NoticeScreen';
import { PermissionsScreen } from '../PermissionsScreen';

/**
 * Story 1.6 — the four screen bodies rendered.
 *
 * These are the behavioural half of the I/O matrix: acknowledging screen 1
 * persists the setting and advances (and still advances on a failed write), the
 * last screen records completion, and screen 1 exposes exactly one control so
 * there is no back affordance to skip the notice.
 */

function fakeStorage(): {
  readonly storage: KvStorage;
  readonly data: Map<string, string>;
} {
  const data = new Map<string, string>();
  return {
    data,
    storage: {
      getItem: (key) => Promise.resolve(data.get(key) ?? null),
      setItem: (key, value) => {
        data.set(key, value);
        return Promise.resolve();
      },
      removeItem: (key) => {
        data.delete(key);
        return Promise.resolve();
      },
    },
  };
}

function buttons(root: HostElement | null): readonly HostElement[] {
  return flatten(root).filter(
    (element) => element.props.accessibilityRole === 'button',
  );
}

/** The four hairline nodes inside the frame's position indicator. */
function hairlines(root: HostElement | null): readonly HostElement[] {
  const row = find(
    root,
    (element) => element.props.testID === 'onboarding-progress',
  );
  if (row === undefined) {
    throw new Error('no progress row');
  }
  return row.children.filter(
    (child): child is HostElement => typeof child !== 'string',
  );
}

/** The index of the single brighter hairline — the screen's own position. */
function brightHairlineIndex(root: HostElement | null): number {
  const lines = hairlines(root);
  const bright = lines.filter(
    (line) => mergedStyle(line).backgroundColor === colors.rule,
  );
  expect(bright).toHaveLength(1);
  return lines.indexOf(bright[0] as HostElement);
}

describe('the four onboarding screens', () => {
  it('renders each screen in order with its own headline and action', async () => {
    const service = createOnboardingService(createKv(fakeStorage().storage));

    const notice = await render(
      <NoticeScreen service={service} onAdvance={() => {}} />,
    );
    expect(notice.getByText(ONBOARDING_COPY.notice.headline)).toBeTruthy();
    expect(notice.getByText(ONBOARDING_COPY.notice.actionLabel)).toBeTruthy();

    const local = await render(
      <LocalScreen service={service} onAdvance={() => {}} />,
    );
    expect(local.getByText(ONBOARDING_COPY.local.headline)).toBeTruthy();

    const night = await render(
      <NightScreen service={service} onAdvance={() => {}} />,
    );
    expect(night.getByText(ONBOARDING_COPY.night.headline)).toBeTruthy();

    const permissions = await render(
      <PermissionsScreen service={service} onAdvance={() => {}} />,
    );
    expect(
      permissions.getByText(ONBOARDING_COPY.permissions.headline),
    ).toBeTruthy();
    expect(
      permissions.getByText(ONBOARDING_COPY.permissions.actionLabel),
    ).toBeTruthy();
  });

  it('ACKNOWLEDGE: screen 1 persists the acknowledgement and advances', async () => {
    const { storage, data } = fakeStorage();
    const service = createOnboardingService(createKv(storage));
    const onAdvance = jest.fn();

    const { getByLabelText } = await render(
      <NoticeScreen service={service} onAdvance={onAdvance} />,
    );

    await fireEvent.press(getByLabelText(ONBOARDING_COPY.notice.actionLabel));

    await waitFor(() => expect(onAdvance).toHaveBeenCalledTimes(1));
    expect(data.get('noticeAcknowledged')).toBe('true');
    expect(data.get('onboardingStep')).toBe('1');
  });

  it('ACKNOWLEDGE: a failed settings write still advances, and logs field-free', async () => {
    const records: LogRecord[] = [];
    Logger.__setSink((record) => records.push(record));
    const failing: KvStorage = {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.reject(new Error('disk full')),
      removeItem: () => Promise.resolve(),
    };
    const service = createOnboardingService(createKv(failing));
    const onAdvance = jest.fn();

    const { getByLabelText } = await render(
      <NoticeScreen service={service} onAdvance={onAdvance} />,
    );
    await fireEvent.press(getByLabelText(ONBOARDING_COPY.notice.actionLabel));

    try {
      await waitFor(() => expect(onAdvance).toHaveBeenCalledTimes(1));
      expect(records.some((record) => record.code === 'kv.write_failed')).toBe(
        true,
      );
      for (const record of records) {
        expect(record.fields).toEqual({});
      }
    } finally {
      Logger.__setSink(null);
    }
  });

  it('PERSIST: screen 2 records position 2 and marks the second hairline', async () => {
    const { storage, data } = fakeStorage();
    const service = createOnboardingService(createKv(storage));
    const onAdvance = jest.fn();

    const { getByLabelText, toJSON } = await render(
      <LocalScreen service={service} onAdvance={onAdvance} />,
    );
    await fireEvent.press(getByLabelText(ONBOARDING_COPY.local.actionLabel));

    await waitFor(() => expect(onAdvance).toHaveBeenCalledTimes(1));
    // The screen persists its *own* position — changing `setStep(2)` to any
    // other value (or `step` to another step) fails here.
    expect(data.get('onboardingStep')).toBe('2');
    expect(brightHairlineIndex(toJSON())).toBe(1);
  });

  it('PERSIST: screen 3 records position 3 and marks the third hairline', async () => {
    const { storage, data } = fakeStorage();
    const service = createOnboardingService(createKv(storage));
    const onAdvance = jest.fn();

    const { getByLabelText, toJSON } = await render(
      <NightScreen service={service} onAdvance={onAdvance} />,
    );
    await fireEvent.press(getByLabelText(ONBOARDING_COPY.night.actionLabel));

    await waitFor(() => expect(onAdvance).toHaveBeenCalledTimes(1));
    expect(data.get('onboardingStep')).toBe('3');
    expect(brightHairlineIndex(toJSON())).toBe(2);
  });

  it('COMPLETE: screen 4 records completion and makes the app reachable', async () => {
    const { storage, data } = fakeStorage();
    const service = createOnboardingService(createKv(storage));
    const onAdvance = jest.fn();

    const { getByLabelText } = await render(
      <PermissionsScreen service={service} onAdvance={onAdvance} />,
    );
    await fireEvent.press(
      getByLabelText(ONBOARDING_COPY.permissions.actionLabel),
    );

    await waitFor(() => expect(onAdvance).toHaveBeenCalledTimes(1));
    expect(data.get('onboardingStep')).toBe(String(ONBOARDING_COMPLETE_STEP));
  });

  it('COMPLETE: a failed completion write stays on screen 4 without advancing', async () => {
    const failing: KvStorage = {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.reject(new Error('disk full')),
      removeItem: () => Promise.resolve(),
    };
    const service = createOnboardingService(createKv(failing));
    const onAdvance = jest.fn();
    Logger.__setSink(() => {});

    try {
      const { getByLabelText } = await render(
        <PermissionsScreen service={service} onAdvance={onAdvance} />,
      );
      // Settle the failed write inside `act` so the assertion is a real guard on
      // "advance only on success" rather than a race. The action stays pressable
      // as the retry.
      await act(async () => {
        fireEvent.press(
          getByLabelText(ONBOARDING_COPY.permissions.actionLabel),
        );
      });
      expect(onAdvance).not.toHaveBeenCalled();
    } finally {
      Logger.__setSink(null);
    }
  });

  it('NO_SKIP: screen 1 exposes exactly one control and no back affordance', async () => {
    const service = createOnboardingService(createKv(fakeStorage().storage));
    const { toJSON, queryByText } = await render(
      <NoticeScreen service={service} onAdvance={() => {}} />,
    );

    const controls = buttons(toJSON());
    expect(controls).toHaveLength(1);
    expect(controls[0]?.props.accessibilityLabel).toBe(
      ONBOARDING_COPY.notice.actionLabel,
    );

    // No element offers a back/close route off the notice.
    for (const element of flatten(toJSON())) {
      const label = element.props.accessibilityLabel;
      if (typeof label === 'string') {
        expect(label).not.toMatch(/back|close|cancel|skip/i);
      }
    }
    expect(queryByText(/back|skip/i)).toBeNull();
  });

  it('NO_PERMISSION: the notice body carries the entertainment line, not safety copy', async () => {
    const service = createOnboardingService(createKv(fakeStorage().storage));
    const { getByText, queryByText } = await render(
      <NoticeScreen service={service} onAdvance={() => {}} />,
    );
    // Screen 1 carries the shared entertainment line (imported, never retyped)...
    expect(getByText(ENTERTAINMENT_LINE)).toBeTruthy();
    // ...and none of the safety content (which lives in the About notice).
    expect(queryByText(/startle|photosensitiv|suddenly/i)).toBeNull();
  });
});
