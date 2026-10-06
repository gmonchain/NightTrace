import { invariant, err, ok, type Result } from '@/util/result';

/**
 * The `src/util/result.ts` contract: a recoverable path returns `Result`, and
 * `invariant()` is the programmer-error channel only.
 */
describe('Result', () => {
  it('carries a value on the ok arm and discriminates on `ok`', () => {
    const result: Result<number, string> = ok(7);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(7);
    }
  });

  it('carries a typed error on the err arm without throwing', () => {
    const result: Result<number, string> = err('expected bad state');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('expected bad state');
    }
  });

  it('does not throw when a service returns an expected failure', () => {
    const call = (): Result<number, string> => err('not found');
    expect(() => call()).not.toThrow();
    expect(call().ok).toBe(false);
  });

  it('falls through exhaustively on both variants', () => {
    const describeResult = (result: Result<number, string>): string => {
      switch (result.ok) {
        case true:
          return `value:${result.value}`;
        case false:
          return `error:${result.error}`;
      }
    };
    expect(describeResult(ok(1))).toBe('value:1');
    expect(describeResult(err('x'))).toBe('error:x');
  });
});

describe('invariant', () => {
  it('throws when the condition is false — the intended outcome', () => {
    expect(() => invariant(false, 'must hold')).toThrow(
      'Invariant violation: must hold',
    );
  });

  it('narrows the type and stays silent when the condition is true', () => {
    const maybe: string | null = 'present';
    expect(() => invariant(maybe !== null, 'must be present')).not.toThrow();
    invariant(maybe !== null, 'must be present');
    expect(maybe.length).toBe(7);
  });
});
