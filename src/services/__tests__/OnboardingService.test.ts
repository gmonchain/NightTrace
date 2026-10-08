import { createKv, type KvStorage } from '@/db/kv';
import { Logger, type LogRecord } from '@/services/Logger';
import {
  createOnboardingService,
  nextOnboardingDestination,
  ONBOARDING_COMPLETE_STEP,
  ONBOARDING_ORDER,
} from '@/services/OnboardingService';

/**
 * Story 1.6 — the onboarding service, over an injected `Kv`.
 *
 * The service is the only module that touches the onboarding settings (AD-12),
 * and the injected `Kv` is the seam that lets these run without the native
 * `expo-sqlite` backend. The suite covers the state half of the story's I/O
 * matrix — FIRST_LAUNCH, ACKNOWLEDGE, RESUME, COMPLETE and GATE — plus the
 * field-free log a failed acknowledgement write leaves behind.
 */

function fakeStorage(
  seed: Readonly<Record<string, string>> = {},
): { readonly storage: KvStorage; readonly data: Map<string, string> } {
  const data = new Map<string, string>(Object.entries(seed));
  const storage: KvStorage = {
    getItem: (key) => Promise.resolve(data.get(key) ?? null),
    setItem: (key, value) => {
      data.set(key, value);
      return Promise.resolve();
    },
    removeItem: (key) => {
      data.delete(key);
      return Promise.resolve();
    },
  };
  return { storage, data };
}

/** A storage whose writes fail — the "write failure still advances" row. */
const failingWrites: KvStorage = {
  getItem: () => Promise.resolve(null),
  setItem: () => Promise.reject(new Error('disk full')),
  removeItem: () => Promise.resolve(),
};

describe('OnboardingService', () => {
  const records: LogRecord[] = [];

  beforeEach(() => {
    records.length = 0;
    Logger.__setSink((record) => records.push(record));
  });

  afterEach(() => {
    Logger.__setSink(null);
  });

  it('FIRST_LAUNCH: a clean install reads step 0 and is not acknowledged', async () => {
    const service = createOnboardingService(createKv(fakeStorage().storage));
    const state = await service.readOnboardingState();
    expect(state).toEqual({ acknowledged: false, step: 0 });
    expect(nextOnboardingDestination(state)).toBe('notice');
  });

  it('ACKNOWLEDGE: persists noticeAcknowledged and moves the path to screen 2', async () => {
    const { storage, data } = fakeStorage();
    const service = createOnboardingService(createKv(storage));

    await service.acknowledgeNotice();
    await service.setStep(1);

    expect(data.get('noticeAcknowledged')).toBe('true');
    expect(data.get('onboardingStep')).toBe('1');
    // The acknowledgement is a device-local setting, not a domain row.
    const state = await service.readOnboardingState();
    expect(state).toEqual({ acknowledged: true, step: 1 });
    // `step` is screens completed, so 1 completed resumes at screen 2 (local).
    expect(nextOnboardingDestination(state)).toBe('local');
  });

  it('ACKNOWLEDGE: a failed write resolves and logs a field-free line', async () => {
    const service = createOnboardingService(createKv(failingWrites));
    // No throw across the boundary — the caller still advances.
    await expect(service.acknowledgeNotice()).resolves.toBeUndefined();
    await expect(service.setStep(1)).resolves.toBeUndefined();

    expect(records.length).toBeGreaterThan(0);
    for (const record of records) {
      expect(record.code).toBe('kv.write_failed');
      // Field-free: a write failure carries no value.
      expect(record.fields).toEqual({});
    }
  });

  it('RESUME: onboardingStep 2 resumes at screen 3 (night), not screen 1', async () => {
    const { storage } = fakeStorage({
      noticeAcknowledged: 'true',
      onboardingStep: '2',
    });
    const service = createOnboardingService(createKv(storage));
    const state = await service.readOnboardingState();
    expect(state).toEqual({ acknowledged: true, step: 2 });
    expect(nextOnboardingDestination(state)).toBe('night');
    expect(nextOnboardingDestination(state)).not.toBe('notice');
  });

  it('COMPLETE: the last screen records completion and the app becomes reachable', async () => {
    const { storage, data } = fakeStorage({ noticeAcknowledged: 'true', onboardingStep: '3' });
    const service = createOnboardingService(createKv(storage));

    await service.complete();

    expect(data.get('onboardingStep')).toBe(String(ONBOARDING_COMPLETE_STEP));
    const state = await service.readOnboardingState();
    expect(nextOnboardingDestination(state)).toBe('home');
  });

  it('GATE: an acknowledged, complete install goes to the app, not onboarding', async () => {
    const { storage } = fakeStorage({
      noticeAcknowledged: 'true',
      onboardingStep: String(ONBOARDING_COMPLETE_STEP),
    });
    const service = createOnboardingService(createKv(storage));
    expect(nextOnboardingDestination(await service.readOnboardingState())).toBe(
      'home',
    );
  });

  it('clamps a stored step into the valid range', async () => {
    const high = createOnboardingService(
      createKv(fakeStorage({ noticeAcknowledged: 'true', onboardingStep: '99' }).storage),
    );
    expect((await high.readOnboardingState()).step).toBe(ONBOARDING_COMPLETE_STEP);

    const low = createOnboardingService(
      createKv(fakeStorage({ noticeAcknowledged: 'true', onboardingStep: '-3' }).storage),
    );
    expect((await low.readOnboardingState()).step).toBe(0);

    // A wrongly-typed value resolves to null at the kv boundary → step 0.
    const wrongType = createOnboardingService(
      createKv(fakeStorage({ noticeAcknowledged: 'true', onboardingStep: '"x"' }).storage),
    );
    expect((await wrongType.readOnboardingState()).step).toBe(0);
  });

  it('writes a clamped step rather than an out-of-range value', async () => {
    const { storage, data } = fakeStorage();
    const service = createOnboardingService(createKv(storage));
    await service.setStep(42);
    expect(data.get('onboardingStep')).toBe(String(ONBOARDING_COMPLETE_STEP));
  });

  it('exposes the four screens in path order', () => {
    expect(ONBOARDING_ORDER).toEqual([
      'notice',
      'local',
      'night',
      'permissions',
    ]);
  });
});
