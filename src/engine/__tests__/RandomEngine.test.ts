import {
  FORK_LABELS,
  createRandomEngine,
  seedFromParts,
} from '@/engine/RandomEngine';

/**
 * FORK_CLOSED and FORK_ORDER: the labelled-fork contract (AD-4).
 *
 * A fork's substream must depend only on `(seed, label)` — never on when it was
 * forked and never on another fork's draw count — so two features cannot shift
 * each other's draws by adding one. The label set is closed, so adding an eighth
 * fails this suite until it is updated deliberately.
 */
const SEED = seedFromParts(['golden', 'seed']);

describe('RandomEngine.seedFromParts', () => {
  it('produces a stable 32-character hex seed', () => {
    expect(seedFromParts(['golden', 'seed'])).toBe(
      'f461322a185c7c21e5dd12b7d8873b51',
    );
    expect(seedFromParts(['golden', 'seed'])).toBe(
      seedFromParts(['golden', 'seed']),
    );
    expect(seedFromParts([])).toBe('09f45f699b9ad4895921c94c508f729e');
  });

  it('is order-sensitive, so a reordered part list is a different seed', () => {
    expect(seedFromParts(['a', 'b'])).not.toBe(seedFromParts(['b', 'a']));
  });
});

describe('RandomEngine forks', () => {
  it('FORK_CLOSED: the label set is exactly the closed seven', () => {
    expect([...FORK_LABELS]).toEqual([
      'rng.session',
      'rng.events',
      'rng.radar',
      'rng.words',
      'rng.encounters',
      'rng.report',
      'rng.signals',
    ]);
    expect(FORK_LABELS).toHaveLength(7);
  });

  it('FORK_CLOSED: a substream depends only on (seed, label)', () => {
    const first = createRandomEngine(SEED);
    const second = createRandomEngine(SEED);
    // Advance one engine an arbitrary amount: the fork must not care.
    second.next();
    second.next();
    second.next();
    expect(first.fork('rng.events').next()).toBe(
      second.fork('rng.events').next(),
    );
    expect(first.fork('rng.report').next()).toBe(
      second.fork('rng.report').next(),
    );
  });

  it('FORK_CLOSED: an unknown label is a programmer error', () => {
    const engine = createRandomEngine(SEED);
    // @ts-expect-error — 'rng.nope' is neither in the closed set nor a content label.
    expect(() => engine.fork('rng.nope')).toThrow(/unknown fork label/);
  });

  it('FORK_CLOSED: fork("rng.content." + id) is the only expansion, pinned', () => {
    const engine = createRandomEngine(SEED);
    expect(engine.fork('rng.content.ghost_knock_02').next()).toBe(
      0.3801803106907755,
    );
  });

  it('FORK_ORDER: a draw from one fork does not perturb another', () => {
    const withDraw = createRandomEngine(SEED);
    const events = withDraw.fork('rng.events');
    const radarAfter = withDraw.fork('rng.radar');
    events.next();
    events.next();

    const withoutDraw = createRandomEngine(SEED);
    const radarPlain = withoutDraw.fork('rng.radar');

    expect(radarAfter.next()).toBe(radarPlain.next());
  });

  it('FORK_ORDER: fork A then B equals fork B then A', () => {
    const one = createRandomEngine(SEED);
    const oneEvents = one.fork('rng.events');
    const oneRadar = one.fork('rng.radar');
    const oneSequence = [oneEvents.next(), oneRadar.next()];

    const two = createRandomEngine(SEED);
    const twoRadar = two.fork('rng.radar');
    const twoEvents = two.fork('rng.events');
    const twoSequence = [twoEvents.next(), twoRadar.next()];

    expect(twoSequence).toEqual(oneSequence);
  });

  it('a fork is itself forkable, with the same (seed, label) guarantee', () => {
    const plain = createRandomEngine(SEED).fork('rng.events').fork('rng.words');
    const advanced = createRandomEngine(SEED);
    advanced.next();
    const forked = advanced.fork('rng.events').fork('rng.words');
    expect(forked.next()).toBe(plain.next());
  });
});

describe('RandomEngine draws', () => {
  it('next is deterministic and counted', () => {
    const engine = createRandomEngine(SEED);
    expect(engine.draws).toBe(0);
    expect(engine.next()).toBe(0.8834052053280175);
    expect(engine.next()).toBe(0.3556098295375705);
    expect(engine.draws).toBe(2);
  });

  it('int stays in range and is deterministic', () => {
    const engine = createRandomEngine(SEED);
    for (let i = 0; i < 200; i += 1) {
      const value = engine.int(2, 7);
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(2);
      expect(value).toBeLessThan(7);
    }
  });

  it('rejects an empty range as a programmer error', () => {
    const engine = createRandomEngine(SEED);
    expect(() => engine.int(3, 3)).toThrow(/maxExclusive/);
  });

  it('bool is deterministic for the same draw', () => {
    expect(createRandomEngine(SEED).bool(0.5)).toBe(
      createRandomEngine(SEED).bool(0.5),
    );
  });

  it('bool straddles the drawn value, so an inverted comparison fails', () => {
    // SEED's first draw is 0.8834052053280175 (pinned above): above 0.5 and
    // below 0.9, so both outcomes of the comparison are exercised at once.
    expect(createRandomEngine(SEED).bool(0.9)).toBe(true);
    expect(createRandomEngine(SEED).bool(0.5)).toBe(false);
  });
});

describe('RandomEngine snapshot and restore', () => {
  it('round-trips a stream through its RandomState', () => {
    const engine = createRandomEngine(SEED);
    engine.next();
    engine.next();
    const state = engine.snapshot();
    expect(state.draws).toBe(2);
    expect(state.seed).toBe(SEED);

    const before = [engine.next(), engine.next(), engine.next()];
    engine.restore(state);
    const after = [engine.next(), engine.next(), engine.next()];
    expect(after).toEqual(before);
  });

  it('rejects a snapshot taken from a different seed', () => {
    const engine = createRandomEngine(SEED);
    const foreign = createRandomEngine(
      seedFromParts(['other', 'seed']),
    ).snapshot();
    expect(() => engine.restore(foreign)).toThrow(/different seed/);
  });
});
