/**
 * The engine's only output (AD-2): a fold returns `Emission[]` and mutates
 * nothing.
 *
 * Story 2.1 defines exactly one variant, `notice` — the lifecycle speech the
 * pure `(seed, tick input) → Emission[]` fold emits at the start and the end of
 * a session. Story 2.2 adds `event`, 2.3 adds `phase`, Epic 3 adds `evidence`,
 * and the rest follow. Because every variant is tagged `kind` and every
 * consumer switches exhaustively with `default: assertNever`, each addition is
 * a compile error until it is handled — which is what keeps a growing engine
 * honest.
 */

/** The lifecycle notice codes this story can emit. The union grows per story. */
export type EngineNotice = 'session_started' | 'session_ended';

/** The `notice` variant — the one variant 2.1 defines. */
export interface NoticeEmission {
  readonly kind: 'notice';
  readonly notice: EngineNotice;
}

/** The complete output union. One variant in 2.1; every later story adds one. */
export type Emission = NoticeEmission;

/**
 * The exhaustiveness gate. A consumer's `switch` ends `default:
 * assertNever(value)`, so an unhandled variant is a compile error at every
 * consumer rather than a value silently dropped on the floor. It is generic —
 * useful for any closed union, not only `Emission`.
 */
export function assertNever(value: never): never {
  throw new Error(`Unhandled variant: ${JSON.stringify(value)}`);
}
