import { sfc32, seedWordsFromString, xmur3 } from '@/engine/prng';

/**
 * PRNG_VECTOR: the fixed-seed golden sequence.
 *
 * A dependency-free `xmur3 → sfc32` is only replay-exact if it is pinned against
 * a committed vector list — the numbers below are this implementation's output
 * and are asserted unchanged, on any platform and any run. Both algorithms are
 * pure 32-bit integer arithmetic, so the sequence is platform-independent.
 */
describe('prng', () => {
  it('xmur3 hashes a string to a stable 32-bit word sequence', () => {
    const hash = xmur3('nighttrace');
    expect([hash(), hash(), hash(), hash(), hash(), hash()]).toEqual([
      2999169524, 2789406042, 20402110, 3803801837, 731718697, 2643882182,
    ]);
  });

  it('is a pure hash: two generators over the same string agree', () => {
    const first = xmur3('nighttrace');
    const second = xmur3('nighttrace');
    expect([first(), first(), first()]).toEqual([second(), second(), second()]);
  });

  it('sfc32 produces the committed golden draw sequence', () => {
    const generator = sfc32(1, 2, 3, 4);
    expect([
      generator.next(),
      generator.next(),
      generator.next(),
      generator.next(),
      generator.next(),
      generator.next(),
    ]).toEqual([
      1.6298145055770874e-9,
      7.916241884231567e-9,
      0.01318361610174179,
      0.043977586552500725,
      0.7988984857220203,
      0.0929916170425713,
    ]);
  });

  it('every draw is in [0, 1)', () => {
    const generator = sfc32(...seedWordsFromString('nighttrace'));
    for (let i = 0; i < 1000; i += 1) {
      const value = generator.next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('seedWordsFromString is exactly the four xmur3 words for the string', () => {
    const hash = xmur3('nighttrace');
    expect(seedWordsFromString('nighttrace')).toEqual([
      hash(),
      hash(),
      hash(),
      hash(),
    ]);
  });

  it('serializes and restores its 4-word state exactly', () => {
    const generator = sfc32(...seedWordsFromString('nighttrace'));
    generator.next();
    generator.next();
    const state = generator.state();
    expect(state).toHaveLength(4);
    const before = [generator.next(), generator.next()];
    generator.restore(state);
    const after = [generator.next(), generator.next()];
    expect(after).toEqual(before);
  });
});
