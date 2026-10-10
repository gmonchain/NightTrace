import {
  eventDefinitionId,
  eventTableId,
  sessionMs,
  type EventDefinition,
  type EventDefinitionId,
  type EventTable,
  type SessionPhase,
} from '@/engine/models';
import { createScheduler, type SchedulerConfig, type SchedulerState } from '@/engine/EventScheduler';
import { DEFAULT_DIRECTIVE } from '@/engine/directives/SessionDirective';
import { createRandomEngine, seedFromParts } from '@/engine/RandomEngine';
import type { RandomEngine } from '@/engine/RandomEngine';
import { ENGINE_MIN_GAP_MS } from '@/engine/rules/silence';

/**
 * The event scheduler: phase-keyed weighted selection with an authored silence
 * (emptyWeight), memoryless gaps, engine-held cooldowns and a silence-category
 * extension (AD-5, FR-2). The `emptyWeight` row of the matrix is proved here at
 * the scheduler level; the *shipped* set is swept in `src/data/__tests__`.
 */

function definition(
  id: string,
  overrides: Partial<EventDefinition> = {},
): EventDefinition {
  return {
    id: eventDefinitionId(id),
    category: 'ambient',
    weight: 1,
    cooldownMs: 0,
    oncePerSession: false,
    extendsSilenceMs: null,
    ...overrides,
  };
}

function table(
  phase: SessionPhase,
  entries: EventTable['entries'],
  overrides: Partial<EventTable> = {},
): EventTable {
  return {
    id: eventTableId(`table_${phase.toLowerCase()}`),
    phase,
    entries,
    emptyWeight: 1,
    silenceFloorMs: 6_000,
    intervalMeanMs: 40_000,
    ...overrides,
  };
}

function config(
  tables: readonly EventTable[],
  definitions: readonly EventDefinition[],
): SchedulerConfig {
  const byPhase = new Map(tables.map((entry) => [entry.phase, entry]));
  const byId = new Map(definitions.map((entry) => [entry.id, entry]));
  return {
    tableForPhase: (phase) => {
      const found = byPhase.get(phase);
      if (found === undefined) {
        throw new Error(`test content has no table for ${phase}`);
      }
      return found;
    },
    definitionFor: (id: EventDefinitionId) => byId.get(id) ?? null,
  };
}

/** Run `steps` due steps, each advancing to the scheduler's next due moment. */
function drain(
  scheduler: ReturnType<typeof createScheduler>,
  rng: RandomEngine,
  state0: SchedulerState,
  phase: SessionPhase,
  steps: number,
) {
  let state = state0;
  const emitted: { definitionId: EventDefinitionId; atMs: number }[] = [];
  for (let i = 0; i < steps; i += 1) {
    const due = state.nextEmissionAtMs;
    const step = scheduler.step(
      state,
      { elapsedMs: due, phase, directive: DEFAULT_DIRECTIVE },
      rng,
    );
    state = step.state;
    for (const emission of step.emissions) {
      if (emission.kind === 'event') {
        emitted.push({ definitionId: emission.definitionId, atMs: emission.atMs });
      }
    }
  }
  return { state, emitted };
}

describe('EventScheduler', () => {
  it('initial draws a first gap for the initial phase', () => {
    const cfg = config([table('QUIET', [])], []);
    const scheduler = createScheduler(cfg);
    const state = scheduler.initial(createRandomEngine(seedFromParts(['s'])), 'QUIET');
    expect(state.nextEmissionAtMs).toBeGreaterThanOrEqual(6_000);
    expect(state.emissionCount).toBe(0);
    expect(state.lastEventAtMs).toBeNull();
  });

  it('returns silence before the next emission is due', () => {
    const cfg = config([table('QUIET', [])], []);
    const scheduler = createScheduler(cfg);
    const rng = createRandomEngine(seedFromParts(['s']));
    const state = scheduler.initial(rng, 'QUIET');
    const step = scheduler.step(
      state,
      { elapsedMs: sessionMs(0), phase: 'QUIET', directive: DEFAULT_DIRECTIVE },
      rng,
    );
    expect(step.emissions).toEqual([]);
    // Nothing is due, so the state object is returned untouched.
    expect(step.state).toBe(state);
  });

  it('SILENCE_DRAW: an empty table emits nothing and draws the next gap', () => {
    const cfg = config([table('QUIET', [], { emptyWeight: 1 })], []);
    const scheduler = createScheduler(cfg);
    const rng = createRandomEngine(seedFromParts(['silence']));
    const state = scheduler.initial(rng, 'QUIET');
    const step = scheduler.step(
      state,
      {
        elapsedMs: state.nextEmissionAtMs,
        phase: 'QUIET',
        directive: DEFAULT_DIRECTIVE,
      },
      rng,
    );
    expect(step.emissions).toEqual([]);
    expect(step.state.nextEmissionAtMs).toBeGreaterThan(state.nextEmissionAtMs);
    expect(step.state.emissionCount).toBe(0);
  });

  it('EMPTY_WEIGHT: silence and an event are both reachable draws', () => {
    const cfg = config(
      [table('QUIET', [{ definitionId: eventDefinitionId('hush'), weight: 1 }])],
      [definition('hush')],
    );
    const scheduler = createScheduler(cfg);
    const rng = createRandomEngine(seedFromParts(['both']));
    const { emitted } = drain(
      scheduler,
      rng,
      scheduler.initial(rng, 'QUIET'),
      'QUIET',
      60,
    );
    expect(emitted.length).toBeGreaterThan(0);
    expect(emitted.length).toBeLessThan(60);
  });

  it('EXTENDS_SILENCE: a silence-category winner extends the floor, not emits', () => {
    const cfg = config(
      [
        table('QUIET', [
          { definitionId: eventDefinitionId('deep_quiet'), weight: 1 },
        ], { emptyWeight: 0 }),
      ],
      [definition('deep_quiet', { category: 'silence', extendsSilenceMs: 300_000 })],
    );
    const scheduler = createScheduler(cfg);
    const rng = createRandomEngine(seedFromParts(['extend']));
    const state = scheduler.initial(rng, 'QUIET');
    const step = scheduler.step(
      state,
      {
        elapsedMs: state.nextEmissionAtMs,
        phase: 'QUIET',
        directive: DEFAULT_DIRECTIVE,
      },
      rng,
    );
    expect(step.emissions).toEqual([]);
    // The next gap includes the 300 s extension.
    const gap = step.state.nextEmissionAtMs - state.nextEmissionAtMs;
    expect(gap).toBeGreaterThanOrEqual(300_000);
    expect(step.state.lastEventAtMs).toBeNull();
    expect(step.state.emissionCount).toBe(0);
  });

  it('selects the table for the tick phase', () => {
    const seen: SessionPhase[] = [];
    const cfg: SchedulerConfig = {
      tableForPhase: (phase) => {
        seen.push(phase);
        return table(phase, []);
      },
      definitionFor: () => null,
    };
    const scheduler = createScheduler(cfg);
    const rng = createRandomEngine(seedFromParts(['phase']));
    const state = scheduler.initial(rng, 'ACTIVITY');
    scheduler.step(
      state,
      {
        elapsedMs: state.nextEmissionAtMs,
        phase: 'ENCOUNTER_WINDOW',
        directive: DEFAULT_DIRECTIVE,
      },
      rng,
    );
    expect(seen).toContain('ACTIVITY');
    expect(seen).toContain('ENCOUNTER_WINDOW');
  });

  it('COOLDOWN: a definition is not selected again until its cooldown elapses', () => {
    const howl = definition('howl', { cooldownMs: 480_000 });
    const cfg = config(
      [table('QUIET', [{ definitionId: howl.id, weight: 1 }])],
      [howl],
    );
    const scheduler = createScheduler(cfg);
    const rng = createRandomEngine(seedFromParts(['cooldown']));
    const { emitted } = drain(
      scheduler,
      rng,
      scheduler.initial(rng, 'QUIET'),
      'QUIET',
      80,
    );
    expect(emitted.length).toBeGreaterThan(0);
    for (let i = 1; i < emitted.length; i += 1) {
      expect((emitted[i]?.atMs ?? 0) - (emitted[i - 1]?.atMs ?? 0)).toBeGreaterThanOrEqual(
        480_000,
      );
    }
  });

  it('ONCE_PER_SESSION: an already-fired definition is never selected twice', () => {
    const once = definition('close_pass', { oncePerSession: true });
    const cfg = config(
      [table('QUIET', [{ definitionId: once.id, weight: 1 }])],
      [once],
    );
    const scheduler = createScheduler(cfg);
    const rng = createRandomEngine(seedFromParts(['once']));
    const { emitted } = drain(
      scheduler,
      rng,
      scheduler.initial(rng, 'QUIET'),
      'QUIET',
      80,
    );
    expect(emitted).toHaveLength(1);
  });

  it('honours the active directive ban list', () => {
    const banned = definition('wind_shift');
    const cfg = config(
      [table('QUIET', [{ definitionId: banned.id, weight: 1 }], { emptyWeight: 0.0001 })],
      [banned],
    );
    const scheduler = createScheduler(cfg);
    const rng = createRandomEngine(seedFromParts(['banned']));
    let state = scheduler.initial(rng, 'QUIET');
    let sawEvent = false;
    for (let i = 0; i < 30; i += 1) {
      const step = scheduler.step(
        state,
        {
          elapsedMs: state.nextEmissionAtMs,
          phase: 'QUIET',
          directive: { ...DEFAULT_DIRECTIVE, bannedEvents: [banned.id] },
        },
        rng,
      );
      state = step.state;
      if (step.emissions.length > 0) {
        sawEvent = true;
      }
    }
    expect(sawEvent).toBe(false);
  });

  it('is deterministic for the same seed and inputs', () => {
    const hush = definition('hush');
    const cfg = config(
      [table('QUIET', [{ definitionId: hush.id, weight: 1 }])],
      [hush],
    );
    const run = () => {
      const scheduler = createScheduler(cfg);
      const rng = createRandomEngine(seedFromParts(['determinism']));
      return drain(scheduler, rng, scheduler.initial(rng, 'QUIET'), 'QUIET', 50)
        .emitted;
    };
    expect(run()).toEqual(run());
  });

  it('clamps a drawn gap to the engine floor on the scheduler path (FR-2)', () => {
    // A table authored below the engine floor: the drawn gaps are ~0 ms, so the
    // engine's content-independent floor is the only thing keeping two emissions
    // apart. If the clamp is dropped from the scheduler, this fails.
    const a = definition('a');
    const b = definition('b');
    const cfg = config(
      [
        table(
          'QUIET',
          [
            { definitionId: a.id, weight: 1 },
            { definitionId: b.id, weight: 1 },
          ],
          { emptyWeight: 0.1, silenceFloorMs: 0, intervalMeanMs: 1 },
        ),
      ],
      [a, b],
    );
    const scheduler = createScheduler(cfg);
    const rng = createRandomEngine(seedFromParts(['floor']));
    const { emitted } = drain(
      scheduler,
      rng,
      scheduler.initial(rng, 'QUIET'),
      'QUIET',
      60,
    );
    expect(emitted.length).toBeGreaterThan(1);
    for (let i = 1; i < emitted.length; i += 1) {
      expect(
        (emitted[i]?.atMs ?? 0) - (emitted[i - 1]?.atMs ?? 0),
      ).toBeGreaterThanOrEqual(ENGINE_MIN_GAP_MS);
    }
  });
});
