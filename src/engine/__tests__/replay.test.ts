import {
  createInvestigationEngine,
  type TickInput,
  type TickResult,
} from '@/engine/InvestigationEngine';
import { huntId, sessionMs, tickIndex } from '@/engine/models';
import { seedFromParts } from '@/engine/RandomEngine';

import { sessionSeedFixture, engineContentFixture } from './fixtures';

/**
 * REPLAY_IDENTICAL: the same seed and the same `TickInput[]`, played twice,
 * produce identical `TickResult[]` — state, emissions and the `rng` snapshot.
 *
 * This is the audit property AD-3 names; it has no UI and no displayed promise.
 * Story 2.2's engine now draws from `rng.events` on every tick, so the snapshot
 * compared here is the stream that drove the (still event-free, in this short
 * fixture) emissions.
 */
const TICK_0: TickInput = {
  tickIndex: tickIndex(0),
  elapsedMs: sessionMs(0),
  phase: 'QUIET',
};
const TICK_1: TickInput = {
  tickIndex: tickIndex(1),
  elapsedMs: sessionMs(5_000),
  phase: 'QUIET',
};
const TICK_2: TickInput = {
  tickIndex: tickIndex(2),
  elapsedMs: sessionMs(11_000),
  phase: 'QUIET',
};
const TICKS: readonly TickInput[] = [TICK_0, TICK_1, TICK_2];

function createEngine() {
  return createInvestigationEngine(sessionSeedFixture(), {
    content: engineContentFixture(),
  });
}

function play(): readonly TickResult[] {
  const engine = createEngine();
  const results = TICKS.map((tick) => engine.tick(tick));
  return [...results, engine.finish('user_finished')];
}

describe('replay', () => {
  it('REPLAY_IDENTICAL: the same seed and tick inputs yield identical results', () => {
    expect(play()).toEqual(play());
  });

  it('emits session_started once, on the very first tick', () => {
    const engine = createEngine();
    const first = engine.tick(TICK_0);
    const second = engine.tick(TICK_1);
    expect(first.emissions).toEqual([
      { kind: 'notice', notice: 'session_started' },
    ]);
    expect(second.emissions).toEqual([]);
  });

  it('finish emits session_ended and records the reason', () => {
    const engine = createEngine();
    engine.tick(TICK_0);
    const ended = engine.finish('user_left_field');
    expect(ended.emissions).toEqual([
      { kind: 'notice', notice: 'session_ended' },
    ]);
    expect(ended.state.status).toBe('ended');
    expect(ended.state.endReason).toBe('user_left_field');
  });

  it('returns a new state and never mutates the one it was given', () => {
    const engine = createEngine();
    const before = engine.state();
    const after = engine.tick(TICK_0);
    expect(after.state).not.toBe(before);
    expect(engine.state()).toBe(after.state);
    // The pre-tick state object is untouched.
    expect(before.status).toBe('ready');
    expect(before.tickIndex).toBeNull();
    expect(before.elapsedMs).toBeNull();
    expect(after.state.status).toBe('running');
    expect(after.state.tickIndex).toBe(TICK_0.tickIndex);
    expect(after.state.elapsedMs).toBe(TICK_0.elapsedMs);
  });

  it('ticking after finish is a programmer error', () => {
    const engine = createEngine();
    engine.finish('user_finished');
    expect(() => engine.tick(TICK_0)).toThrow(/already ended/);
  });

  it('finishing twice is a programmer error', () => {
    const engine = createEngine();
    engine.finish('user_finished');
    expect(() => engine.finish('user_left_field')).toThrow(/already ended/);
  });

  it('ties its state to the session seed and its rng stream to that seed', () => {
    const session = sessionSeedFixture();
    const result = createInvestigationEngine(session, {
      content: engineContentFixture(),
    }).tick(TICK_0);
    // The engine state carries the session seed and hunt verbatim.
    expect(result.state.seed).toBe(session.seed);
    expect(result.state.huntId).toBe(session.parts.huntId);
    // Story 2.2: `TickResult.rng` is the `rng.events` stream's snapshot, so its
    // identity is the *derived* fork seed — deterministic in the session seed.
    expect(result.rng.seed).toBe(seedFromParts([session.seed, 'rng.events']));
  });

  it('a different seed produces a different generator identity', () => {
    const first = createEngine();
    const second = createInvestigationEngine(
      sessionSeedFixture({ huntId: huntId('a-different-hunt') }),
      { content: engineContentFixture() },
    );
    expect(second.tick(TICK_0).rng.seed).not.toBe(first.tick(TICK_0).rng.seed);
  });

  it('validates the content it is given (a phase with no table is a programmer error)', () => {
    expect(() =>
      createInvestigationEngine(sessionSeedFixture(), {
        content: { definitions: [], tables: [], directives: [] },
      }),
    ).toThrow(/no event table/);
  });

  it('rejects a tick after the content names no table for the tick phase', () => {
    // A content bundle that has QUIET but not SIGNALS constructs, then throws on
    // the first SIGNALS tick — the dependency is checked, not assumed.
    const content = engineContentFixture();
    const quietOnly = {
      ...content,
      tables: content.tables.filter((table) => table.phase === 'QUIET'),
    };
    const engine = createInvestigationEngine(sessionSeedFixture(), {
      content: quietOnly,
    });
    engine.tick(TICK_0);
    // The tick must be past `nextEmissionAtMs` for the scheduler to look the
    // table up, so step well past the fixture's 20 s floor.
    expect(() =>
      engine.tick({ tickIndex: tickIndex(3), elapsedMs: sessionMs(600_000), phase: 'SIGNALS' }),
    ).toThrow(/no event table/);
  });
});
