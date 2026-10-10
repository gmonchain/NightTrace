/**
 * The run-length-encoded tick digest (AD-3, the engine contract `02` §I.6).
 *
 * A completed session is reconstructible from `seed + hunt_id + content_version
 * + tick_digest[]`. The digest is the per-tick record of *what the session did*
 * — here, the phase each tick ran in, plus the terminal `ENDED` marker — stored
 * **run-length-encoded**, never one entry per tick: a 20-minute session at 1 Hz
 * is 1 200 ticks but only a handful of phase runs, because the phase only
 * changes on a transition.
 *
 * This module is the *codec* only. It is pure, serializable and deterministic —
 * no clock, no randomness, no I/O (AD-1). The storage of the blob is Story 2.5's
 * `session_ticks` write; keeping the codec pure lets the golden replay and the
 * digest test exercise the shape without a database.
 *
 * The header carries a magic (`NTRL`), a version and the two counts a decoder
 * needs before it reads a segment: how many segments there are and how many ticks
 * they cover. `decode(encode(x))` round-trips, so a replayed session's digest can
 * be reconstructed from the seed and compared against the recorded one.
 */

import {
  SESSION_PHASE_VOCABULARY,
  type SessionPhaseVocabulary,
} from './phase';

/**
 * One tick's recorded outcome: the phase the tick ran in, or the terminal
 * `ENDED` marker. A digest value is a member of the closed phase vocabulary, so
 * a decoder can prove it (there is no free-form tag).
 */
export type TickDigest = SessionPhaseVocabulary;

/** A run of identical outcomes: a value and how many consecutive ticks carried it. */
export interface DigestSegment {
  readonly value: TickDigest;
  readonly count: number;
}

/** The one magic a digest blob opens with — a decoder rejects anything else. */
export const DIGEST_MAGIC = 'NTRL';

/** The blob format version. A format change bumps this, never rewrites a blob. */
export const DIGEST_VERSION = 1;

/**
 * The largest tick count a digest may cover. A session is at most a few hours
 * long, so this ceiling sits far above any real session while bounding the work
 * a malformed blob could ask `decodeDigest` to do — the parser is an untrusted
 * boundary, and an unbounded `count` would be a denial of service.
 */
export const DIGEST_MAX_TICKS = 24 * 60 * 60;

/** The header a decoder reads before the segments. */
export interface DigestBlobHeader {
  readonly magic: string;
  readonly version: number;
  /** The number of run-length segments that follow. */
  readonly segmentCount: number;
  /** The total number of ticks the segments cover. */
  readonly totalTicks: number;
}

/** A serialized digest: the header plus its run-length segments. */
export interface DigestBlob {
  readonly header: DigestBlobHeader;
  readonly segments: readonly DigestSegment[];
}

/** Whether a value is one of the closed phase-vocabulary members. */
function isTickDigest(value: unknown): value is TickDigest {
  return (
    typeof value === 'string' &&
    SESSION_PHASE_VOCABULARY.some((member) => member === value)
  );
}

/**
 * Encode a tick sequence into run-length segments. Consecutive equal values
 * collapse into one segment, so a run of `n` identical ticks is one entry, never
 * `n`. The order is preserved and the encoding is deterministic.
 */
export function encodeDigest(
  ticks: readonly TickDigest[],
): readonly DigestSegment[] {
  const segments: DigestSegment[] = [];
  for (const value of ticks) {
    const last = segments[segments.length - 1];
    if (last !== undefined && last.value === value) {
      segments[segments.length - 1] = { value, count: last.count + 1 };
    } else {
      segments.push({ value, count: 1 });
    }
  }
  return segments;
}

/**
 * Append one tick to a running RLE — the fold the engine uses per tick, so a
 * session never materializes one segment per tick. Returns a new array; the
 * input is never mutated.
 */
export function appendDigest(
  segments: readonly DigestSegment[],
  value: TickDigest,
): readonly DigestSegment[] {
  const last = segments[segments.length - 1];
  if (last !== undefined && last.value === value) {
    return [...segments.slice(0, -1), { value, count: last.count + 1 }];
  }
  return [...segments, { value, count: 1 }];
}

/** Expand run-length segments back into the flat tick sequence they encode. */
export function decodeDigest(
  segments: readonly DigestSegment[],
): readonly TickDigest[] {
  const ticks: TickDigest[] = [];
  for (const segment of segments) {
    for (let i = 0; i < segment.count; i += 1) {
      ticks.push(segment.value);
    }
  }
  return ticks;
}

/** The total ticks a segment list covers. */
export function digestTickCount(
  segments: readonly DigestSegment[],
): number {
  let total = 0;
  for (const segment of segments) {
    total += segment.count;
  }
  return total;
}

/** Build the serializable blob (header + segments) from a tick sequence. */
export function digestBlob(ticks: readonly TickDigest[]): DigestBlob {
  const segments = encodeDigest(ticks);
  return {
    header: {
      magic: DIGEST_MAGIC,
      version: DIGEST_VERSION,
      segmentCount: segments.length,
      totalTicks: ticks.length,
    },
    segments,
  };
}

/** Wrap an existing RLE segment list in a header. */
export function digestBlobFromSegments(
  segments: readonly DigestSegment[],
): DigestBlob {
  return {
    header: {
      magic: DIGEST_MAGIC,
      version: DIGEST_VERSION,
      segmentCount: segments.length,
      totalTicks: digestTickCount(segments),
    },
    segments,
  };
}

/** The canonical serialization of a digest blob. Deterministic, key-order stable. */
export function serializeDigest(blob: DigestBlob): string {
  return JSON.stringify({
    header: {
      magic: blob.header.magic,
      version: blob.header.version,
      segmentCount: blob.header.segmentCount,
      totalTicks: blob.header.totalTicks,
    },
    segments: blob.segments.map((segment) => ({
      value: segment.value,
      count: segment.count,
    })),
  });
}

/** A plain-object narrow — the untrusted boundary a parsed blob crosses. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Validate a value as a `DigestBlob`. Returns `null` for anything that is not
 * one — a magic or version mismatch, a bad segment, a count that disagrees with
 * the header. No cast: every field is proved before it is read.
 */
export function digestBlobFrom(value: unknown): DigestBlob | null {
  if (!isRecord(value)) {
    return null;
  }
  const header = value.header;
  const rawSegments = value.segments;
  if (!isRecord(header) || !Array.isArray(rawSegments)) {
    return null;
  }
  if (header.magic !== DIGEST_MAGIC || header.version !== DIGEST_VERSION) {
    return null;
  }
  const segmentCount = header.segmentCount;
  const totalTicks = header.totalTicks;
  if (
    typeof segmentCount !== 'number' ||
    typeof totalTicks !== 'number' ||
    !Number.isInteger(segmentCount) ||
    segmentCount < 0 ||
    !Number.isInteger(totalTicks) ||
    totalTicks < 0 ||
    totalTicks > DIGEST_MAX_TICKS
  ) {
    return null;
  }
  const segments: DigestSegment[] = [];
  for (const raw of rawSegments) {
    if (!isRecord(raw)) {
      return null;
    }
    const { value: segmentValue, count } = raw;
    if (
      !isTickDigest(segmentValue) ||
      typeof count !== 'number' ||
      !Number.isInteger(count) ||
      count < 1
    ) {
      return null;
    }
    // A digest is run-length-encoded: two adjacent equal values cannot occur in a
    // normalized blob, and accepting them is how "one entry per tick" would
    // smuggle back in through the untrusted parse boundary.
    const previous = segments[segments.length - 1];
    if (previous !== undefined && previous.value === segmentValue) {
      return null;
    }
    segments.push({ value: segmentValue, count });
  }
  if (segments.length !== segmentCount) {
    return null;
  }
  if (digestTickCount(segments) !== totalTicks) {
    return null;
  }
  return { header: { magic: DIGEST_MAGIC, version: DIGEST_VERSION, segmentCount, totalTicks }, segments };
}

/** Parse a serialized digest back to a blob, or `null` when it is malformed. */
export function parseDigest(text: string): DigestBlob | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  return digestBlobFrom(parsed);
}
