import { directiveId, sessionMs, type SessionDirective } from '@/engine/models';
import {
  DIRECTIVE_MAX_PER_SESSION,
  DIRECTIVE_MIN_SPACING_MS,
  createDirectiveScheduler,
} from '@/engine/directives/DirectiveScheduler';
import { DEFAULT_DIRECTIVE } from '@/engine/directives/SessionDirective';
import { createRandomEngine, seedFromParts } from '@/engine/RandomEngine';

/**
 * The directive scheduler: ≤ 6 per session, ≥ 3 minutes apart, scheduled (never
 * on demand), and always a verb with no object (AD-6). The directives constrain
 * the event space — they never name an event — so the cadence is the engine's
 * rule and the pool is authored content (the object-less grep is in
 * `src/data/__tests__/directives.test.ts`).
 */
function directive(id: string, text: string): SessionDirective {
  return {
    id: directiveId(id),
    text,
    guaranteedEncounters: [],
    bannedEvents: [],
    silenceScale: 1,
    tensionCeiling: 100,
    minimumDurationMs: null,
    allowEarlyEncounter: false,
    flavourNote: null,
  };
}

const POOL: readonly SessionDirective[] = [
  directive('hold_still', 'Hold still.'),
  directive('stay_quiet', 'Stay quiet.'),
  directive('keep_watching', 'Keep watching.'),
  directive('wait', 'Wait.'),
  directive('move_on', 'Move on.'),
  directive('go_slowly', 'Go slowly.'),
  directive('take_your_time', 'Take your time.'),
  directive('let_this_run', 'Let this run.'),
];

function scheduler() {
  return createDirectiveScheduler({
    pool: POOL,
    maxPerSession: DIRECTIVE_MAX_PER_SESSION,
    minSpacingMs: DIRECTIVE_MIN_SPACING_MS,
  });
}

describe('DirectiveScheduler', () => {
  it('initial schedules the first directive at least one spacing out', () => {
    const s = scheduler();
    const rng = createRandomEngine(seedFromParts(['directive']));
    const state = s.initial(rng, DEFAULT_DIRECTIVE, sessionMs(0));
    expect(state.nextDirectiveAtMs).toBeGreaterThanOrEqual(
      DIRECTIVE_MIN_SPACING_MS,
    );
    expect(state.fired).toBe(0);
    expect(state.active).toBe(DEFAULT_DIRECTIVE);
  });

  it('never fires before the scheduled moment', () => {
    const s = scheduler();
    const rng = createRandomEngine(seedFromParts(['directive']));
    const state = s.initial(rng, DEFAULT_DIRECTIVE, sessionMs(0));
    const step = s.step(state, { elapsedMs: sessionMs(0) }, rng);
    expect(step.emissions).toEqual([]);
    expect(step.state).toBe(state);
  });

  it('emits a directive with its authored text', () => {
    const s = scheduler();
    const rng = createRandomEngine(seedFromParts(['directive']));
    const state = s.initial(rng, DEFAULT_DIRECTIVE, sessionMs(0));
    const step = s.step(state, { elapsedMs: state.nextDirectiveAtMs }, rng);
    expect(step.emissions).toHaveLength(1);
    const emission = step.emissions[0];
    expect(emission?.kind).toBe('directive');
    if (emission?.kind === 'directive') {
      const author = POOL.find((entry) => entry.id === emission.directiveId);
      expect(author?.text).toBe(emission.text);
    }
  });

  it('DIRECTIVE_CAP: at most six fire, each at least three minutes apart', () => {
    const s = scheduler();
    const rng = createRandomEngine(seedFromParts(['directive', 'cap']));
    let state = s.initial(rng, DEFAULT_DIRECTIVE, sessionMs(0));
    const fired: { id: string; atMs: number }[] = [];
    // A full hour, sampled well past the cadence.
    for (
      let elapsed = 0;
      elapsed <= 3_600_000;
      elapsed += DIRECTIVE_MIN_SPACING_MS / 4
    ) {
      const step = s.step(state, { elapsedMs: sessionMs(elapsed) }, rng);
      state = step.state;
      for (const emission of step.emissions) {
        if (emission.kind === 'directive') {
          fired.push({ id: emission.directiveId, atMs: emission.atMs });
        }
      }
    }
    expect(fired).toHaveLength(DIRECTIVE_MAX_PER_SESSION);
    for (let i = 1; i < fired.length; i += 1) {
      expect((fired[i]?.atMs ?? 0) - (fired[i - 1]?.atMs ?? 0)).toBeGreaterThanOrEqual(
        DIRECTIVE_MIN_SPACING_MS,
      );
    }
  });

  it('never repeats the immediately-preceding directive back to back', () => {
    const s = scheduler();
    const rng = createRandomEngine(seedFromParts(['directive', 'repeat']));
    let state = s.initial(rng, DEFAULT_DIRECTIVE, sessionMs(0));
    const ids: string[] = [];
    for (let i = 0; i < 40; i += 1) {
      const step = s.step(state, { elapsedMs: state.nextDirectiveAtMs }, rng);
      state = step.state;
      for (const emission of step.emissions) {
        if (emission.kind === 'directive') {
          ids.push(emission.directiveId);
        }
      }
    }
    for (let i = 1; i < ids.length; i += 1) {
      expect(ids[i]).not.toBe(ids[i - 1]);
    }
    // The active directive follows the last fired one.
    expect(ids.at(-1)).toBe(state.active.id);
  });

  it('is deterministic for the same seed', () => {
    const run = () => {
      const s = scheduler();
      const rng = createRandomEngine(seedFromParts(['directive', 'det']));
      let state = s.initial(rng, DEFAULT_DIRECTIVE, sessionMs(0));
      const at: number[] = [];
      for (let i = 0; i < 20; i += 1) {
        const step = s.step(state, { elapsedMs: state.nextDirectiveAtMs }, rng);
        state = step.state;
        at.push(state.nextDirectiveAtMs);
      }
      return at;
    };
    expect(run()).toEqual(run());
  });

  it('rejects an empty pool as a programmer error', () => {
    const s = createDirectiveScheduler({
      pool: [],
      maxPerSession: DIRECTIVE_MAX_PER_SESSION,
      minSpacingMs: DIRECTIVE_MIN_SPACING_MS,
    });
    const rng = createRandomEngine(seedFromParts(['directive', 'empty']));
    const state = s.initial(rng, DEFAULT_DIRECTIVE, sessionMs(0));
    expect(() => s.step(state, { elapsedMs: state.nextDirectiveAtMs }, rng)).toThrow(
      /pool is empty/,
    );
  });
});
