/**
 * The entertainment line — one exact string, one exported constant.
 *
 * ARCHITECTURE-SPINE.md AD-16 and the epic's "two build-failing design rules"
 * make this the single spelling the product shares. It appears in three places
 * by design — the first store-listing sentence, a non-skippable onboarding
 * screen (Story 1.6), and a permanent About notice reachable from Profile
 * (Story 1.7) — and any data export carries it too (FR-27).
 *
 * It is never retyped as a literal. The corpus also contains an earlier wrong
 * variant — `Nothing here is a measurement.` — and `claims.test.ts` asserts its
 * exact absence from every shipped surface.
 */
export const ENTERTAINMENT_LINE = 'An investigation experience. Not a measurement.';
