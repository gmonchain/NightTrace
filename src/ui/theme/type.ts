/**
 * The one place design units become React Native units.
 *
 * `src/ui/theme/tokens.ts` preserves the design source's own spellings:
 * `typography.*.letterSpacing` is in `em` as a plain number (`label` is `0.14`)
 * and `typography.*.lineHeight` is a **unitless ratio** (`display` is `1.02`),
 * present only on the steps the design source sets it on. React Native wants
 * absolute points for both, so this module multiplies each by the step's own
 * `fontSize`:
 *
 *   lineHeight   = fontSize × ratio
 *   letterSpacing = em × fontSize
 *
 * Every component that renders type goes through `textStyle`, so the conversion
 * happens exactly once rather than once per component — six chances to get the
 * ratio wrong become one.
 *
 * The module is dependency-free apart from `./tokens`; it imports no
 * `react-native` (the return type is derived from the tokens themselves), so it
 * can be asserted directly in a plain test.
 */

import { typography } from './tokens';

/** Any step of the `typography` ramp — the union of its nine entries. */
export type TypographyStep = (typeof typography)[keyof typeof typography];

/**
 * The shape `textStyle` accepts: the three keys every ramp step carries, plus
 * the two the design source sets only sometimes. Typing it structurally (rather
 * than as the exact ramp union) lets a step carrying **neither** `lineHeight`
 * nor `letterSpacing` be exercised directly — no ramp step currently carries
 * neither, so the both-absent branch would otherwise be untestable. Every real
 * `typography` step is assignable to it.
 */
export type TypographyStepInput = {
  readonly fontFamily: TypographyStep['fontFamily'];
  readonly fontSize: number;
  readonly fontWeight: TypographyStep['fontWeight'];
  readonly lineHeight?: number;
  readonly letterSpacing?: number;
};

/**
 * A React Native text style. Structurally assignable to `TextStyle`, but derived
 * from the ramp so `fontWeight` keeps its literal-union type (React Native's own
 * `fontWeight` admits only the numeric weights 100–900, not a widened `number`).
 */
export type TextStyleResult = {
  readonly fontFamily: TypographyStep['fontFamily'];
  readonly fontSize: number;
  readonly fontWeight: TypographyStep['fontWeight'];
  readonly lineHeight?: number;
  readonly letterSpacing?: number;
};

/**
 * Convert a `typography` step into a React Native text style.
 *
 * A step whose `lineHeight`/`letterSpacing` is absent — or present but not a
 * number, which a spread can deliver — leaves that key absent (not
 * present-but-undefined), so the `exactOptionalPropertyTypes` contract holds and
 * RN falls back to its own defaults.
 */
export function textStyle(step: TypographyStepInput): TextStyleResult {
  const { fontFamily, fontSize, fontWeight } = step;
  // Presence is "is a number", not "is a key": a spread can carry the key with
  // an `undefined` value, which `in` would accept and then multiply into `NaN`.
  const lineHeight =
    typeof step.lineHeight === 'number' ? step.fontSize * step.lineHeight : null;
  const letterSpacing =
    typeof step.letterSpacing === 'number'
      ? step.fontSize * step.letterSpacing
      : null;
  return {
    fontFamily,
    fontSize,
    fontWeight,
    ...(lineHeight === null ? {} : { lineHeight }),
    ...(letterSpacing === null ? {} : { letterSpacing }),
  };
}
