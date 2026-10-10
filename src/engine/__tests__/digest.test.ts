import {
  DIGEST_MAGIC,
  DIGEST_VERSION,
  appendDigest,
  decodeDigest,
  digestBlob,
  digestBlobFromSegments,
  digestTickCount,
  encodeDigest,
  parseDigest,
  serializeDigest,
  sessionMs,
  tickIndex,
  unit,
  type DigestSegment,
  type TickDigest,
} from '@/engine/models';
import { createInvestigationEngine } from '@/engine/InvestigationEngine';

import { engineContentFixture, sessionSeedFixture } from './fixtures';

/**
 * DIGEST_RLE and DIGEST_RECONSTRUCT (AD-3, the engine contract §I.6).
 *
 * The tick digest is stored run-length-encoded — never one row per tick — and
 * the same seed, content and tick inputs reproduce it exactly, so a recorded
 * session is reconstructible from `seed + hunt + content version + digest`.
 */

/** A full session folded through the engine, as the digest values it produced. */
function foldSession(): readonly TickDigest[] {
  const engine = createInvestigationEngine(sessionSeedFixture(), {
    content: engineContentFixture(),
  });
  const values: TickDigest[] = [];
  for (let index = 0; index <= 1_200; index += 1) {
    const result = engine.tick({
      tickIndex: tickIndex(index),
      elapsedMs: sessionMs(index * 1_000),
      movement: unit(0),
      sensorAnomaly: unit(0),
    });
    values.push(result.digest);
  }
  values.push(engine.finish('user_finished').digest);
  return values;
}

describe('DIGEST_RLE: the digest is run-length-encoded', () => {
  it('encodes an empty run as no segments', () => {
    expect(encodeDigest([])).toEqual([]);
  });

  it('collapses a run of identical ticks into one segment', () => {
    expect(encodeDigest(['QUIET', 'QUIET', 'QUIET'])).toEqual([
      { value: 'QUIET', count: 3 },
    ]);
  });

  it('splits only on a change, never one entry per tick', () => {
    const ticks: readonly TickDigest[] = [
      'QUIET', 'QUIET', 'QUIET',
      'SIGNALS', 'SIGNALS',
      'ACTIVITY',
      'ENDED',
    ];
    const segments = encodeDigest(ticks);
    expect(segments).toEqual([
      { value: 'QUIET', count: 3 },
      { value: 'SIGNALS', count: 2 },
      { value: 'ACTIVITY', count: 1 },
      { value: 'ENDED', count: 1 },
    ]);
    // Seven ticks, four segments — the shape the AC requires.
    expect(segments.length).toBeLessThan(ticks.length);
  });

  it('round-trips: decode(encode(x)) === x', () => {
    const ticks: readonly TickDigest[] = [
      'QUIET', 'SIGNALS', 'SIGNALS', 'ACTIVITY', 'ACTIVITY', 'ACTIVITY',
      'ENCOUNTER_WINDOW', 'RESOLUTION', 'ENDED',
    ];
    expect(decodeDigest(encodeDigest(ticks))).toEqual(ticks);
  });

  it('appendDigest folds one tick at a time to the same result as encodeDigest', () => {
    const ticks: readonly TickDigest[] = ['QUIET', 'QUIET', 'SIGNALS', 'SIGNALS', 'ENDED'];
    let running: readonly DigestSegment[] = [];
    for (const tick of ticks) {
      running = appendDigest(running, tick);
    }
    expect(running).toEqual(encodeDigest(ticks));
    expect(digestTickCount(running)).toBe(ticks.length);
  });

  it('never mutates the segments it is given', () => {
    const before: readonly DigestSegment[] = [{ value: 'QUIET', count: 1 }];
    const after = appendDigest(before, 'QUIET');
    expect(before).toEqual([{ value: 'QUIET', count: 1 }]);
    expect(after).toEqual([{ value: 'QUIET', count: 2 }]);
  });

  it('carries a header of magic, segment count and total ticks', () => {
    const blob = digestBlob(['QUIET', 'QUIET', 'SIGNALS']);
    expect(blob.header).toEqual({
      magic: DIGEST_MAGIC,
      version: DIGEST_VERSION,
      segmentCount: 2,
      totalTicks: 3,
    });
    expect(DIGEST_MAGIC).toBe('NTRL');
  });

  it('serializes and parses back to the identical blob', () => {
    const blob = digestBlob(['QUIET', 'SIGNALS', 'SIGNALS', 'ENDED']);
    const text = serializeDigest(blob);
    expect(parseDigest(text)).toEqual(blob);
  });

  it('rejects a malformed blob rather than trusting it', () => {
    const good = digestBlob(['QUIET', 'ENDED']);
    const tamperedVersion = { ...good, header: { ...good.header, version: 99 } };
    expect(digestBlobFromSegments(good.segments)).toEqual(good);
    expect(parseDigest(JSON.stringify(tamperedVersion))).toBeNull();
    expect(parseDigest('not json')).toBeNull();
    expect(parseDigest('42')).toBeNull();
    expect(parseDigest('{"header":{},"segments":[]}')).toBeNull();
    // A count that disagrees with the header is rejected.
    expect(
      parseDigest(
        JSON.stringify({ ...good, header: { ...good.header, totalTicks: 99 } }),
      ),
    ).toBeNull();
  });
});

describe('DIGEST_RECONSTRUCT: seed + content + tick inputs reproduce the digest', () => {
  it('produces an identical digest on a re-run', () => {
    const first = foldSession();
    const second = foldSession();
    expect(serializeDigest(digestBlob(first))).toBe(serializeDigest(digestBlob(second)));
  });

  it('is genuinely run-length-encoded over a whole session', () => {
    const ticks = foldSession();
    const segments = encodeDigest(ticks);
    expect(ticks.length).toBeGreaterThan(1_000);
    // A 1 200-tick session is a handful of phase runs, never 1 200 entries.
    expect(segments.length).toBeLessThan(20);
    expect(decodeDigest(segments)).toEqual(ticks);
  });

  it('ends with the terminal ENDED marker, which is not a phase', () => {
    const ticks = foldSession();
    expect(ticks[ticks.length - 1]).toBe('ENDED');
  });
});
