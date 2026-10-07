/**
 * The design-system components (Stories 1.3 and 1.4).
 *
 * **Story 1.3 — the six document primitives.** `Rule`, `Chip`, `StatCell`,
 * `SignatureStrip`, `LedgerRow` and `Seal` render the product's typographic
 * language for every document surface Epics 3 and 6 own — the Case Report, the
 * evidence ledger, the Journal — and the onboarding, Profile and shell surfaces
 * Epic 1 still owes.
 *
 * **Story 1.4 — the six interaction components.** `HoldButton`, `Sheet`,
 * `TabBar`, `FieldView`, `GrainOverlay` and `EvidenceCard` gate a gesture or
 * hold a surface: the two deliberate holds, the sheet every sheet rises on, the
 * four-tab IA, the session's breathing field, the one global texture, and the
 * card that logs evidence without measuring it. The rule this story protects is
 * that **the fill is the only progress indicator in the product, and it
 * indicates a gesture, never a quantity**.
 *
 * Each renders from its own props and the tokens — no store, no fetching, no
 * clock — with three narrow exceptions, all documented on the component itself:
 * `Seal` derives its per-instance SVG ids with `useId`; `SignatureStrip`'s `?`
 * tile mounts an `Animated.loop` composed from `animations.ntPulse`; and
 * `FieldView`'s rings mount an `Animated.loop` composed from
 * `animations.ntBreathe`. Both loops are skipped under Reduce Motion — as are
 * the `Sheet` and capture-card entrance transitions. Each reads its colours,
 * dimensions, radii and durations from `src/ui/theme/tokens.ts` and nothing
 * else, and each exposes its meaning to assistive technology as a word (AD-28).
 *
 * The barrel exports the twelve components, their public prop/union types, and
 * the two runtime constants a consumer needs to enumerate an outcome rather than
 * merely name one (`EVIDENCE_OUTCOMES`, `EVIDENCE_AUTO_DISMISS_MS`) — nothing
 * else. A later surface imports the union type it needs from here; the label
 * arrays live beside their components for the suites that iterate them.
 */

// Story 1.3 — document primitives.
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

// Story 1.4 — interaction components.
export {
  HoldButton,
  type HoldButtonProps,
  type HoldCancelReason,
  type HoldVariant,
} from './HoldButton';
export { Sheet, type SheetProps } from './Sheet';
export { TabBar, type TabBarProps, type TabId } from './TabBar';
export { FieldView, type FieldState, type FieldViewProps } from './FieldView';
export { GrainOverlay, type GrainOverlayProps } from './GrainOverlay';
export {
  EVIDENCE_AUTO_DISMISS_MS,
  EVIDENCE_OUTCOMES,
  EvidenceCard,
  type EvidenceCardProps,
  type EvidenceCertainty,
  type EvidenceOutcome,
} from './EvidenceCard';
