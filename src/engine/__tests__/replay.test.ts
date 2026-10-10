import {
  createInvestigationEngine,
  type TickInput,
  type TickResult,
} from '@/engine/InvestigationEngine';
import { huntId, sessionMs, tickIndex, unit } from '@/engine/models';
import { seedFromParts } from '@/engine/RandomEngine';

import { sessionSeedFixture, engineContentFixture } from './fixtures';

/**
 * REPLAY_IDENTICAL: the same seed and the same `TickInput[]`, played twice,
 * produce identical `TickResult[]` — state, emissions, the `rng` snapshot and
 * the tick digest.
 *
 * This is the audit property AD-3 names; it has no UI and no displayed promise.
 * Story 2.2's engine draws from `rng.events` on every tick; Story 2.3 now also
 * computes its own phase ladder and appends a digest value per tick, both folded
 * into the compared surface.
 */
function tickInput(tickIndexValue: number, elapsedMs: number): TickInput {
  return {
    tickIndex: tickIndex(tickIndexValue),
    elapsedMs: sessionMs(elapsedMs),
    movement: unit(0),
    sensorAnomaly: unit(0),
  };
}
const TICK_0: TickInput = tickInput(0, 0);
const TICK_1: TickInput = tickInput(1, 5_000);
const TICK_2: TickInput = tickInput(2, 11_000);
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

  it('emits session_started once, then the opening phase, on the very first tick', () => {
    const engine = createEngine();
    const first = engine.tick(TICK_0);
    const second = engine.tick(TICK_1);
    expect(first.emissions).toEqual([
      { kind: 'notice', notice: 'session_started' },
      { kind: 'phase', phase: 'QUIET', stateWord: 'QUIET', atMs: 0 },
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
    // Story 2.3: the engine computed its own phase, the user word and the digest.
    expect(after.state.phase).toBe('QUIET');
    expect(after.state.stateWord).toBe('QUIET');
    expect(after.state.tension).toBe(0);
    expect(after.state.digest).toEqual([{ value: 'QUIET', count: 1 }]);
    expect(after.digest).toBe('QUIET');
  });

  it('advances its own ladder and records each tick in the RLE digest', () => {
    const engine = createEngine();
    engine.tick(TICK_0);
    // Cross the QUIET floor (the engine's own gate is 180 s).
    const later = engine.tick(tickInput(1, 200_000));
    expect(later.state.phase).toBe('SIGNALS');
    expect(later.state.stateWord).toBe('LISTENING');
    expect(later.emissions).toContainEqual({
      kind: 'phase',
      phase: 'SIGNALS',
      stateWord: 'LISTENING',
      atMs: 200_000,
    });
    // Two runs of one tick each; the digest is never one entry per tick.
    expect(later.state.digest).toEqual([
      { value: 'QUIET', count: 1 },
      { value: 'SIGNALS', count: 1 },
    ]);
    // Tension is the hidden scalar, kept in its band (never rendered).
    expect(later.state.tension).toBeGreaterThanOrEqual(0);
    expect(later.state.tension).toBeLessThanOrEqual(100);
  });

  it('finish records the terminal ENDED marker in the digest, not as a phase', () => {
    const engine = createEngine();
    engine.tick(TICK_0);
    const ended = engine.finish('user_finished');
    expect(ended.digest).toBe('ENDED');
    expect(ended.state.digest.at(-1)).toEqual({ value: 'ENDED', count: 1 });
    // `ENDED` never leaks into the phase field.
    expect(ended.state.phase).toBe('QUIET');
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

  it('rejects a tick after the content names no table for the phase the ladder reaches', () => {
    // A content bundle that has QUIET but not SIGNALS constructs, then throws on
    // the first tick whose *own* ladder has advanced to SIGNALS — the dependency
    // is checked, not assumed. The engine computes the phase now, so the tick is
    // simply pushed past the QUIET gate (180 s).
    const content = engineContentFixture();
    const quietOnly = {
      ...content,
      tables: content.tables.filter((table) => table.phase === 'QUIET'),
    };
    const engine = createInvestigationEngine(sessionSeedFixture(), {
      content: quietOnly,
    });
    engine.tick(TICK_0);
    // The tick must also be past `nextEmissionAtMs` for the scheduler to look the
    // table up, so step well past the fixture's 20 s floor and the 180 s gate.
    expect(() => engine.tick(tickInput(3, 600_000))).toThrow(/no event table/);
  });

  it('TENSION: the tick wiring lifts tension from the host drivers', () => {
    // A host that reports movement must end a run hotter than one that reports
    // none — otherwise the wiring (elapsedDeltaMs / movement / sensorAnomaly /
    // emitted) is inert and every fold shipping `unit(0)` would look correct.
    const driveTo = (movement: number): number => {
      const engine = createEngine();
      let tension = engine.tick(tickInput(0, 0)).state.tension;
      for (let i = 1; i <= 30; i += 1) {
        tension = engine.tick({
          tickIndex: tickIndex(i),
          elapsedMs: sessionMs(i * 1_000),
          movement: unit(movement),
          sensorAnomaly: unit(0),
        }).state.tension;
      }
      return tension;
    };
    expect(driveTo(1)).toBeGreaterThan(driveTo(0));
  });
});
