/**
 * `Clock` is the only wall-clock reader in `src/`, and `SessionClock` is the
 * only producer of `SessionMs` inside a live session (AD-1, AD-11; the
 * Consistency Conventions' Dates & time row).
 *
 * The engine is forbidden a wall clock, so this module is where `Date` lives:
 * `Clock` reads it and hands out `EpochMs`, and `SessionClock` turns epoch
 * deltas into **monotonic** `SessionMs` that stay flat while paused — the shape
 * AD-29's backgrounding hard-stop needs. Implementing that behaviour is the
 * host's; producing the value is this module's.
 */

import {
  epochMs,
  sessionMs,
  type EpochMs,
  type SessionMs,
} from '@/engine/models';

/** The wall clock. `dayKey` is the local `YYYY-MM-DD` key with the 04:00 cutoff. */
export interface Clock {
  nowEpochMs(): EpochMs;
  nowIso(): string;
  dayKey(): string;
}

/** The 04:00 local rollover: a hunt that starts at 23:20 and ends at 01:10 is one night. */
const DAY_KEY_ROLLOVER_MS = 4 * 3_600_000;

function dayKeyOf(epochMilliseconds: number): string {
  const shifted = new Date(epochMilliseconds - DAY_KEY_ROLLOVER_MS);
  const year = shifted.getFullYear();
  const month = String(shifted.getMonth() + 1).padStart(2, '0');
  const day = String(shifted.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** The application's wall clock. Every other module reads time through it. */
export const clock: Clock = {
  nowEpochMs(): EpochMs {
    return epochMs(Date.now());
  },
  nowIso(): string {
    return new Date().toISOString();
  },
  dayKey(): string {
    return dayKeyOf(Date.now());
  },
};

/**
 * A live session's clock. `advance` converts a fresh epoch reading into elapsed
 * `SessionMs`; the elapsed value never decreases, stays flat while paused, and
 * continues from the pause point on resume (the paused interval is never
 * counted).
 */
export interface SessionClock {
  elapsedMs(): SessionMs;
  advance(nowEpochMs: EpochMs): SessionMs;
  pause(): void;
  resume(): void;
}

export function createSessionClock(startEpochMs: EpochMs): SessionClock {
  let elapsed = 0;
  let anchor = startEpochMs;
  let paused = false;
  // Set on resume so the first advance after it re-bases the anchor without
  // counting the interval spent paused.
  let rebaseOnAdvance = false;

  const current = (): SessionMs => sessionMs(elapsed);

  return {
    elapsedMs: current,

    advance(nowEpochMs: EpochMs): SessionMs {
      if (paused) {
        return current();
      }
      if (rebaseOnAdvance) {
        anchor = nowEpochMs;
        rebaseOnAdvance = false;
        return current();
      }
      const delta = nowEpochMs - anchor;
      if (delta > 0) {
        elapsed += delta;
        anchor = nowEpochMs;
      }
      return current();
    },

    pause(): void {
      paused = true;
    },

    resume(): void {
      if (paused) {
        paused = false;
        rebaseOnAdvance = true;
      }
    },
  };
}
