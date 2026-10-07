/**
 * The document primitives (Story 1.3).
 *
 * Six token-reading components that render the product's typographic language
 * for every document surface Epics 3 and 6 own — the Case Report, the evidence
 * ledger, the Journal — and the onboarding, Profile and shell surfaces Epic 1
 * still owes. Later stories *compose* these rather than improvise their own
 * hairline, seal or slot.
 *
 * Each renders from its own props and the tokens — no store, no fetching, no
 * clock — with two narrow exceptions, both documented on the component itself:
 * `Seal` derives its per-instance SVG ids with `useId`, and `SignatureStrip`'s
 * `?` tile mounts an `Animated.loop` composed from `animations.ntPulse` (skipped
 * under Reduce Motion). Each reads its colours, dimensions, radii and durations
 * from `src/ui/theme/tokens.ts` and nothing else, and each exposes its meaning
 * to assistive technology as a word (AD-28).
 *
 * The barrel exports the six components and their public prop/union types —
 * nothing else. A later surface imports the union type it needs from here; the
 * label arrays live beside their components for the suites that iterate them.
 */

export { Rule, type RuleProps, type RuleVariant } from './Rule';
export { Chip, type ChipLabel, type ChipProps } from './Chip';
export { StatCell, type StatCellLabel, type StatCellProps } from './StatCell';
export {
  SignatureStrip,
  type SignatureSlotKind,
  type SignatureStripProps,
} from './SignatureStrip';
export {
  LedgerRow,
  type LedgerRowProps,
  type LedgerVerdict,
} from './LedgerRow';
export { Seal, type SealProps, type SealStatus } from './Seal';
