import { epochMs } from '@/engine/models';
import { clock, createSessionClock } from '@/services/Clock';

/**
 * CLOCK_MONOTONIC: `services/Clock` is the only wall-clock reader and
 * `SessionClock` the only producer of `SessionMs`. Elapsed time never
 * decreases, stays flat while paused, and continues from the pause point on
 * resume.
 */
describe('Clock', () => {
  it('reads a finite epoch, an ISO string and a YYYY-MM-DD day key', () => {
    const now = clock.nowEpochMs();
    expect(Number.isFinite(now)).toBe(true);
    expect(Number.isNaN(Date.parse(clock.nowIso()))).toBe(false);
    expect(clock.dayKey()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('SessionClock', () => {
  it('CLOCK_MONOTONIC: elapsed never decreases, and a backwards read is ignored', () => {
    const session = createSessionClock(epochMs(1000));
    expect(session.elapsedMs()).toBe(0);
    expect(session.advance(epochMs(1500))).toBe(500);
    expect(session.advance(epochMs(2000))).toBe(1000);
    // A non-monotonic host reading must not rewind elapsed time.
    expect(session.advance(epochMs(1800))).toBe(1000);
  });

  it('CLOCK_MONOTONIC: stays flat while paused and continues on resume', () => {
    const session = createSessionClock(epochMs(1000));
    expect(session.advance(epochMs(2000))).toBe(1000);

    session.pause();
    // Time passes on the wall clock, but a paused session does not advance.
    expect(session.advance(epochMs(9000))).toBe(1000);

    session.resume();
    // The first advance after resume re-bases the anchor: the paused gap is not
    // counted.
    expect(session.advance(epochMs(9500))).toBe(1000);
    // ... and elapsed time continues normally from there.
    expect(session.advance(epochMs(10000))).toBe(1500);
  });

  it('CLOCK_MONOTONIC: an idle pause/resume does not count the gap', () => {
    const session = createSessionClock(epochMs(0));
    expect(session.advance(epochMs(100))).toBe(100);
    session.pause();
    session.resume();
    expect(session.advance(epochMs(100_000))).toBe(100);
  });

  it('a resume without a pause is a no-op', () => {
    const session = createSessionClock(epochMs(0));
    expect(session.advance(epochMs(100))).toBe(100);
    session.resume();
    expect(session.advance(epochMs(200))).toBe(200);
  });
});

describe('Clock.dayKey', () => {
  it('keeps a night together across midnight, and rolls at 04:00 local', () => {
    vi.useFakeTimers();
    try {
      // 23:20 local — the evening it began.
      vi.setSystemTime(new Date(2026, 0, 1, 23, 20));
      expect(clock.dayKey()).toBe('2026-01-01');

      // 01:10 the next calendar day still belongs to the same night.
      vi.setSystemTime(new Date(2026, 0, 2, 1, 10));
      expect(clock.dayKey()).toBe('2026-01-01');

      // Past 04:00 local it rolls into the next night.
      vi.setSystemTime(new Date(2026, 0, 2, 5, 0));
      expect(clock.dayKey()).toBe('2026-01-02');
    } finally {
      vi.useRealTimers();
    }
  });
});
