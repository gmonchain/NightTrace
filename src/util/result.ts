/**
 * The error shape every service boundary in NightTrace uses.
 *
 * AD-14 / Consistency Conventions: a recoverable path returns `Result<T, E>`;
 * `invariant()` is for programmer error. No service throws across its boundary
 * for an expected condition.
 *
 * `Result` is a discriminated union on `ok`, so a consumer's `switch` is
 * exhaustive and a `default: never` arm makes an unhandled variant a compile
 * error.
 */

export type Ok<T> = {
  readonly ok: true;
  readonly value: T;
};

export type Err<E> = {
  readonly ok: false;
  readonly error: E;
};

export type Result<T, E> = Ok<T> | Err<E>;

/** Construct the success arm. */
export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

/** Construct the failure arm. No throw: this is the recoverable path. */
export function err<E>(error: E): Err<E> {
  return { ok: false, error };
}

/**
 * Assert a condition that must hold for the program to be correct.
 *
 * This is the programmer-error channel, not a service boundary. Every call
 * site is a statement that the surrounding state is already known-good;
 * reaching one is a defect, so the throw is the intended outcome.
 */
export function invariant(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) {
    throw new Error(`Invariant violation: ${message}`);
  }
}
