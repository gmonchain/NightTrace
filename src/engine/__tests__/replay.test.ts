import {
  createInvestigationEngine,
  type TickInput,
  type TickResult,
} from '@/engine/InvestigationEngine';
import { huntId, sessionMs, tickIndex } from '@/engine/models';

import { sessionSeedFixture } from './fixtures';

/**
 * REPLAY_IDENTICAL: the same seed and the same `TickInput[]`, played twice,
 * produce identical `TickResult[]` — state, emissions and the `rng` snapshot.
 *
 * This is the audit property AD-3 names; it has no UI and no displayed promise.
 */
const TICK_0: TickInput = { tickIndex: tickIndex(0), elapsedMs: sessionMs(0) };
const TICK_1: TickInput = { tickIndex: tickIndex(1), elapsedMs: sessionMs(5_000) };
const TICK_2: TickInput = { tickIndex: tickIndex(2), elapsedMs: sessionMs(11_000) };
const TICKS: readonly TickInput[] = [TICK_0, TICK_1, TICK_2];

function play(): readonly TickResult[] {
  const engine = createInvestigationEngine(sessionSeedFixture());
  const results = TICKS.map((tick) => engine.tick(tick));
  return [...results, engine.finish('user_finished')];
}

describe('replay', () => {
  it('REPLAY_IDENTICAL: the same seed and tick inputs yield identical results', () => {
    expect(play()).toEqual(play());
  });

  it('emits session_started once, on the very first tick', () => {
    const engine = createInvestigationEngine(sessionSeedFixture());
    const first = engine.tick(TICK_0);
    const second = engine.tick(TICK_1);
    expect(first.emissions).toEqual([
      { kind: 'notice', notice: 'session_started' },
    ]);
    expect(second.emissions).toEqual([]);
  });

  it('finish emits session_ended and records the reason', () => {
    const engine = createInvestigationEngine(sessionSeedFixture());
    engine.tick(TICK_0);
    const ended = engine.finish('user_left_field');
    expect(ended.emissions).toEqual([
      { kind: 'notice', notice: 'session_ended' },
    ]);
    expect(ended.state.status).toBe('ended');
    expect(ended.state.endReason).toBe('user_left_field');
  });

  it('returns a new state and never mutates the one it was given', () => {
    const engine = createInvestigationEngine(sessionSeedFixture());
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
    const engine = createInvestigationEngine(sessionSeedFixture());
    engine.finish('user_finished');
    expect(() => engine.tick(TICK_0)).toThrow(/already ended/);
  });

  it('finishing twice is a programmer error', () => {
    const engine = createInvestigationEngine(sessionSeedFixture());
    engine.finish('user_finished');
    expect(() => engine.finish('user_left_field')).toThrow(/already ended/);
  });

  it('ties its generator and state to the session seed', () => {
    const session = sessionSeedFixture();
    const result = createInvestigationEngine(session).tick(TICK_0);
    expect(result.rng.seed).toBe(session.seed);
    expect(result.state.seed).toBe(session.seed);
    expect(result.state.huntId).toBe(session.parts.huntId);
  });

  it('a different seed produces a different generator identity', () => {
    const first = createInvestigationEngine(sessionSeedFixture());
    const second = createInvestigationEngine(
      sessionSeedFixture({ huntId: huntId('a-different-hunt') }),
    );
    expect(second.tick(TICK_0).rng.seed).not.toBe(first.tick(TICK_0).rng.seed);
  });
});
