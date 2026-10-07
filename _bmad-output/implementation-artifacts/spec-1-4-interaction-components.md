---
title: 'Story 1.4 — The interaction components gate gestures and never indicate a quantity'
type: 'feature'
created: '2026-10-07'
status: 'done'
baseline_revision: '55d64621462f1956600a5ebebaee57c9a09980d3'
route: 'full'
route_source: 'auto'
review: ''
review_source: ''
lenses_ran: []
review_loop_iteration: 0
followup_review_recommended: false
context: []
warnings: ['oversized', 'multiple-goals']
deferred: []
---

<intent-contract>

## Intent

**Problem:** Story 1.2 shipped the tokens and Story 1.3 the document primitives, but nothing yet *gates a gesture or holds a surface* — and every remaining Epic 1 screen needs exactly that. Onboarding (1.6), Profile and the About notice (1.7) and the four-tab shell (1.8), and every later Session and Report surface, need the two deliberate holds (`HOLD TO ENTER THE FIELD`, `SEAL & FILE`), the sheet they rise on, the tab bar that is the product's whole information architecture, the breathing field surface, the global grain, and the capture card that logs evidence without ever pretending to measure it. Built late, each surface invents its own hold and its own progress affordance — and the one rule this story exists to protect is that **the fill is the only progress indicator in the product, and it indicates a gesture, never a quantity**.

**Approach:** Build the six interaction components as pure, token-reading React Native primitives under `src/ui/components/`, extend the existing barrel, and prove each acceptance criterion with `@testing-library/react-native` renders under jest-expo. Every hold is driven from `components['hold-button'].fillDurations`, every animation from `animations.*` with the Reduce Motion branch the design requires, and every surface still renders through `src/ui/theme/type.ts` for type. The grain is the one component the platform cannot draw from the design's own description, and its treatment is decided in Design Notes.

## Boundaries & Constraints

**Always:** every colour, dimension, radius and duration comes from `src/ui/theme/tokens.ts` (AD-17's raw-value lint governs every non-test file under `src/ui/**`); type goes through `textStyle` from `src/ui/theme/type.ts`. The hold's fill duration is read from `components['hold-button'].fillDurations` (`enterMs` 800, `sealMs` 600); the hold label swaps to `Crossing over…` at half the `enter` duration; the breathing ring period is `animations.ntBreathe.durationMs`; the sheet's entrance is `ntUp` over a scrim that fades on `ntFade`; the grain's opacity is `components.grain.opacity`. Every component is a function of its props with no store and no fetching, and every animation obeys NFR-11's Reduce Motion branch. Types are explicit (`readonly` props, `null` not `undefined`, no `any`, no `as` outside mappers/validators); closed variant sets are discriminated unions with an exhaustive `switch` and `default: never`. Meaning reaches assistive technology as words, and purely decorative layers (the grain, the field rings) are hidden from it.

**Never:** No progress indicator other than the hold fill — no percentage, no fraction, no "3 of 7", no determinate bar, no countdown, no timer. No component accepts or renders a percentage, an axis, a degree, a unit-bearing number, a distance, a bearing in degrees, or a raw signal strength through any prop. No drop shadow, glow, coloured shadow, blur behind a sheet, or backdrop-dim as a depth cue (depth is one tone step plus a `rule` hairline; the camera vignette is the one lens artefact and is out of scope here). No capsule control and no fully-rounded document surface. No second badge type on the tab bar: the product has exactly one badge, and adding another must fail this story's test. No animation faster than the 5 s field breath except `ntPulse`. No light theme. Do not modify `DESIGN.md`, `tokens.ts`'s values, `token-sync.test.ts`, or `eslint.config.js`. Do not rebuild Story 1.3's six components, and do not build the screens that compose these (onboarding, Profile, the route tree) — those are Stories 1.6–1.8.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HOLD_COMPLETE | press held for the full `enterMs` | the `safelight` fill reaches the end and the completion callback fires once | No error expected |
| HOLD_EARLY_RELEASE | released before `enterMs` | the fill resets, no completion fires, the cancel callback fires once with the soft-warning reason | Clean cancel; caller's state intact |
| HOLD_SEAL | the 600 ms `SEAL & FILE` variant | the fill runs over `sealMs`; no label swap (that is the Brief hold only) | No error expected |
| HOLD_LABEL_SWAP | press held past half of `enterMs` | the label reads `Crossing over…`; before that it reads the button's own label | No error expected |
| SHEET_ENTER | sheet presented | `ledger` surface, `sheet` radius on its top corners, `rule-strong` grabber, entering on `ntUp` over a scrim that fades on `ntFade` | No error expected |
| TAB_SELECTED | one of the four tabs active | active label `bone` with a `bone` underline; the other three `ash`; a `night` surface with a top hairline | An unknown tab id is a compile error (closed union) |
| TAB_BADGE | a case is unsealed | exactly one `safelight` dot, on Field Journal; no other badge exists | Hidden when the prop is false |
| FIELD_REDUCED_MOTION | Reduce Motion on | the rings sit static (`animation: none`) and no loop runs | No error expected |
| GRAIN_STATIC | rendered at any time | full-screen, `pointer-events: none`, above content, at `components.grain.opacity`, never animating | No error expected |
| CAPTURE_AUTODISMISS | the card is left alone for its window | it dismisses itself and reports the item as **unreviewed** rather than discarding it | No error expected |
| CAPTURE_ACTIONS | `Keep` / `Mark as explained` pressed | exactly one callback fires with the chosen action, and the card dismisses | No error expected |

</intent-contract>

## Code Map

Read `_bmad-output/planning-artifacts/ux-designs/ux-NightTrace-2026-10-04/DESIGN.md` — `## Components` (the `Hold button`, `Sheet`, `Tab bar`, `Field view`, `Grain overlay`, `Evidence card` entries), `## Motion` (the durations, the named animations, the rate ceiling, and the Reduce Motion rule), `## Elevation & Depth` (there are no shadows), `## Shapes` — and the `components:` block in its YAML frontmatter. `EXPERIENCE.md` line 160 defines the evidence card vs the capture card. `ARCHITECTURE-SPINE.md` AD-14, AD-17, AD-28 and the four-layer table (`src/ui/**` is **Shell**) are binding. Story 1.3 built the sibling primitives and the patterns this story must follow: read `src/ui/components/index.ts`, `src/ui/components/a11y.ts`, `src/ui/components/Seal.tsx` (a token-driven SVG component with a platform-limited primitive, per-instance ids and an exported seam) and `src/ui/components/__tests__/tree.ts` (the host-tree helpers the suites use).

- `src/ui/theme/tokens.ts` -- READ-ONLY reference. `components['hold-button']` (`height` 50, `border` `{colors.bone}`, `radius`, `fill` `{colors.safelight}`, `label`, `fillDurations` `{enterMs: 800, sealMs: 600}`); `components.sheet` (`surface`, `radius` `{rounded.sheet}`, `grabber`); `components['tab-bar']` (`surface`, `active`, `idle`, `badge`); `components['evidence-card']` (`surface`, `border`, `radius`); `components.grain.opacity` (0.55); `animations.ntBreathe`/`ntPulse`/`ntUp`/`ntFade`; `colors`, `rounded`, `spacing`, `typography`. `components.*` carries its references as the design source's own spelling (`'{colors.bone}'`) for the sync test; read the concrete family.
- `src/ui/components/index.ts` -- MODIFY. Extend the existing barrel: export the six new components and their public prop/union types, exactly as the six already-exported ones are exported, and update the barrel's docstring to cover both stories. Export nothing that is not built.
- `src/ui/components/HoldButton.tsx` -- CREATE. The product's only progress affordance. `height` from `components['hold-button'].height`, `bone` border at `rounded.DEFAULT`, label in `label` uppercase tracked. On press a `safelight` fill advances along it over `holdMs`, which is read from `components['hold-button'].fillDurations` for a closed `HoldVariant` union (`'enter'` 800 ms / `'seal'` 600 ms) — never a literal, never a prop. The label swaps to `Crossing over…` at **half** the enter duration and only for the enter variant. Releasing early resets the fill and reports a cancel with the soft-warning reason; reaching the end fires completion once. Haptics are out of scope (no haptics dependency is installed) and nothing here may be the sole signal for anything — the fill and the label carry the same information.
- `src/ui/components/Sheet.tsx` -- CREATE. `components.sheet.surface` at `components.sheet.radius` on the top corners only, a `components.sheet.grabber` grabber bar, entering on `animations.ntUp` over a scrim that fades on `animations.ntFade`. Takes children. Depth is the tone step plus the grabber hairline — **no blur behind the sheet and no shadow**. "Sheets never stack two deep" is a navigation rule for the screens that present them, not a state this primitive can hold; state that in the docstring rather than inventing a guard.
- `src/ui/components/TabBar.tsx` -- CREATE. The four-tab IA as a closed union (`HOME`, `INVESTIGATE`, `FIELD JOURNAL`, `PROFILE`), rendered on `components['tab-bar'].surface` with a top hairline; the active label in `components['tab-bar'].active` with a `bone` underline, the others in `components['tab-bar'].idle`. **Exactly one badge type exists in the product** — a `components['tab-bar'].badge` dot on Field Journal when a case is unsealed — so the component takes a boolean (or an equivalent single-badge prop), not a badge map; a second badge kind must be a deliberate change to this story's own test. Labels are uppercased by the component.
- `src/ui/components/FieldView.tsx` -- CREATE. Concentric rings breathing once per `animations.ntBreathe.durationMs` around a centre dot, with a state word in `typography.label` at `0.42em` tracking beneath (goes through `textStyle`, so the tracking is absolute points). Under Reduce Motion the animation is `none` and the rings sit static. The rings and dot are decorative and hidden from assistive technology; the state word is the announced content.
- `src/ui/components/GrainOverlay.tsx` -- CREATE. The one global texture. Full-screen, composited at `components.grain.opacity`, `pointerEvents="none"`, above all content, **never animating**, and hidden from assistive technology. Its tile is the story's one platform decision — see Design Notes.
- `src/ui/components/EvidenceCard.tsx` -- CREATE. `components['evidence-card'].surface` on its `border` at its `radius`; anatomy is a type label, a three-row meta block (`Certainty` · `Channel` · `Possible match`) and two buttons, `Keep` and `Mark as explained`. It is the in-session **capture card** instance too: it is never full-screen, it slides up from the bottom of the current tool over it (entering on `ntUp`), and a progress hairline along its top edge auto-dismisses it after its window — and **letting it auto-dismiss reports the item as unreviewed rather than discarding it**. Certainty is a band word (`AMBIGUOUS` · `SUGGESTIVE` · `COMPELLING`), never a number; the three meta rows take words only. `Keep`/`Mark as explained` each fire exactly one callback and dismiss.
- `assets/grain.png` + `scripts/generate-grain.mjs` -- CREATE. The committed 180×180 greyscale-with-alpha fractal-noise tile and the deterministic authoring script that regenerates it byte-for-byte. See Design Notes for why the tile is pre-rendered.
- `src/ui/components/__tests__/*.test.tsx` -- CREATE. One suite per component plus the extensions below; reuse `tree.ts`.
- `package.json` -- MODIFY only if the grain tile needs an asset-resolution entry for Metro; do not add a dependency without the spec saying so.

## Tasks & Acceptance

**Execution:**
- [ ] `src/ui/theme/` -- no change. `textStyle` already converts the `em` tracking `FieldView` needs; do not add a second unit conversion.
- [ ] `src/ui/components/HoldButton.tsx` -- the two-variant hold with a token-duration fill, the half-way label swap, and a clean early-release cancel -- the product's only progress indicator, and it must indicate a gesture, not a quantity.
- [ ] `src/ui/components/Sheet.tsx` -- the ledger surface with top-corner radius, grabber and `ntUp`/`ntFade` entrance, with no blur and no shadow -- every sheet in the product rises on this.
- [ ] `src/ui/components/TabBar.tsx` -- the closed four-tab bar with exactly one badge type -- the product's whole IA.
- [ ] `src/ui/components/FieldView.tsx` -- the breathing ring field with a static Reduce Motion branch and the state word at `0.42em` -- the session's resting surface.
- [ ] `src/ui/components/GrainOverlay.tsx` -- the full-screen, non-animating, non-interactive grain at the token opacity -- the only global texture in the product, and it must never be raised.
- [ ] `src/ui/components/EvidenceCard.tsx` -- the evidence card and its capture-card instance, with the three-row word-only meta block, the two actions and the auto-dismiss that reports unreviewed -- the card that logs evidence without measuring it.
- [ ] `assets/grain.png` + `scripts/generate-grain.mjs` -- the committed tile and the deterministic script that produces it -- the platform cannot draw the design's `feTurbulence` natively.
- [ ] `src/ui/components/index.ts` -- extend the barrel and its docstring -- one import surface for both stories.
- [ ] `src/ui/components/__tests__/` -- one suite per new component covering its matrix rows and acceptance criteria, asserting against token values rather than literals, and covering each Reduce Motion branch -- the ACs are behavioural, so they are proved by rendering.
- [ ] `src/ui/components/__tests__/no-measurement.test.tsx` -- extend the existing structural case to the six new components through their public props, in the same shape Story 1.3 established -- the "no measurement" law is epic-wide.
- [ ] `src/ui/components/__tests__/a11y.test.tsx` -- extend with the new components' words, and assert that the decorative layers (the grain, the field rings) are hidden from assistive technology -- the a11y contract is epic-wide.
- [ ] `src/ui/components/__tests__/tab-badge.test.tsx` -- assert one badge type exists and that no second kind can be added without changing this test -- epics.md makes the single badge a testable product rule.

**Acceptance Criteria:**
- Given the `HoldButton`, when held for the full duration, then a `safelight` fill advances along it over the duration `components['hold-button'].fillDurations` names for that variant; the label swaps to `Crossing over…` at half the enter duration; releasing early cancels cleanly with the soft-warning reason and leaves the caller's state intact.
- Given the `HoldButton`, when inspected, then its fill is the only progress indicator it renders — no percentage, no fraction, no "3 of 7", no countdown — and no prop can make it render one.
- Given the `Sheet`, when presented, then it draws `components.sheet.surface` with the `sheet` radius on its top corners and a `grabber` bar, entering on `ntUp` over a scrim that fades on `ntFade`, and it renders no shadow, glow or blur.
- Given the `TabBar`, when rendered, then it shows the four tabs on the token surface with a top hairline, the active label in `active` with a `bone` underline and the others in `idle`, and exactly one badge type exists — a `badge` dot on Field Journal when the prop says a case is unsealed.
- Given the `FieldView`, when rendered, then concentric rings breathe once per `animations.ntBreathe.durationMs` around a centre dot with the state word in `label` at `0.42em` tracking beneath, and under Reduce Motion the animation is `none` and the rings sit static.
- Given the `GrainOverlay`, when rendered, then it is full-screen above all content, non-interactive, fixed at `components.grain.opacity`, never animating, and hidden from assistive technology.
- Given the `EvidenceCard`, when presented, then it draws the evidence-card surface on its border at its radius, shows a type label and a three-row word-only meta block (`Certainty` · `Channel` · `Possible match`), and offers `Keep` and `Mark as explained`, each firing exactly one callback.
- Given the capture card is left alone until its progress hairline completes, then it dismisses itself and records the item as **unreviewed** rather than discarding it.
- Given any component in this story, then no prop or rendered output carries a percentage, an axis, a degree, a unit-bearing number, a distance, a bearing in degrees or a raw signal strength, and no style contains a shadow, glow, blur or backdrop-dim.
- Given `npm run verify` and `npm run bundle`, then typecheck, lint and both Jest projects pass and the iOS bundle exports; `react-native-svg` remains reachable only from the seal's own import until a route composes a surface (1.6/1.8), so its presence in the shipped bundle is still not this story's criterion.

## Implementation Notes

## Spec Change Log

## Review Triage Log

## Design Notes

**The grain's tile is pre-rendered, and the reason is the same one Story 1.3 recorded.** `DESIGN.md` describes the grain as a `feTurbulence` fractal-noise tile (180×180, `baseFrequency .85`, two octaves). `react-native-svg@15.15.4` implements `FeColorMatrix` and `FeComposite` but **returns `null`** for `FeTurbulence`, so a filter-declared grain would render nothing at all on device — and unlike the Seal, which still has its ring, the grain has no other visible part. A pre-rendered tile is the native equivalent the design's effect needs: byte-identical on every render (so "it never animates" is structural rather than a promise), tintable, and composited at the token opacity. `scripts/generate-grain.mjs` reproduces the design's parameters — the same two-octave fractal noise at the same scale — deterministically from a seeded PRNG, and the committed PNG is the output; the script is the record of where the texture came from, and regenerating it must produce the same bytes.

**The hold is the story's load-bearing rule, and it is enforced by the type.** The fill duration is chosen from a closed variant union and read from `components['hold-button'].fillDurations`; there is no duration prop and no progress prop, so "the fill indicates a gesture, never a quantity" is a property of the component's surface rather than a convention. The same shape Story 1.3 used for `StatCell` — a value prop that cannot carry a measurement — applies here to progress.

**Reduce Motion is a branch, not a footnote.** `ntBreathe` and `ntPulse` are the two loops this story renders, and NFR-11 requires both to stop under Reduce Motion. The branch belongs inside each component (so no caller can forget it) and each suite asserts it directly, because a missing branch is otherwise invisible — the animation simply runs for the users who asked it not to.

## Verification

**Commands:**
- `npm run typecheck` -- expected: exit 0 under the four strictness flags; the `no-measurement` and closed-union guards are compile errors if an escape is added
- `npm run lint` -- expected: exit 0 on the real tree; no AD-17 raw-value error in any non-test file under `src/ui/components/`
- `npm test` -- expected: both projects green, including the new suites and the extended no-measurement and a11y cases
- `npm run bundle` -- expected: `expo export --platform ios` exits 0 with the grain asset resolvable by Metro
- Regenerate the tile (`node scripts/generate-grain.mjs`) and diff it against the committed `assets/grain.png` -- expected: byte-identical, so the texture is reproducible and not a hand-drawn binary
- Probe the AD-17 rule over one new component file with a raw `'#0B140E'` injected, then remove it -- expected: rejected naming AD-17

**Manual checks (if no CLI):**
- Every component's props and rendered output carry no percentage, axis, degree, unit, distance, bearing or raw signal strength through any prop; no style contains a shadow, glow, blur or backdrop-dim.
- The grain is the only global texture, sits above all content, never animates, and is never interactive.
- Each component's meaning is available to assistive technology as a word, and the purely decorative layers are hidden from it.

### 2026-10-07 — Review pass 1

- verdicts: 43 findings — high 0, medium 18, low 25, false 0, maybe-false 0
- lenses: blind-hunter (18 findings), edge-case-hunter (12), verification-gap (5 gap findings + 3 other findings), intent-alignment (0 findings; 5 descriptive divergences). All four ran; none died.
- findings:
  - `[medium]` `[patch]` `Sheet`'s Reduce-Motion doc claims a scrim cross-fade while the branch snaps both values and the suite asserts no timing runs — three-way disagreement between doc, code and test. Fixed by choosing the snap, saying so in the docstring, and asserting what the branch renders.
  - `[medium]` `[patch]` `EvidenceCard`'s settled state is never reset, so a reused instance can never resolve the next item and later items are silently lost. Fixed by remounting an inner item on an identity key; a reused-instance case added. Same claim as the edge-case row below.
  - `[low]` `[patch]` A suite title says "four outcomes" while the union has three. Fixed.
  - `[medium]` `[patch]` `HoldButton` cannot be completed by assistive-technology activation and carries no hint. Fixed with an activation path that completes the hold plus an `accessibilityHint`.
  - `[low]` `[reject]` `HoldButton` has no `disabled` state — that is the Brief's requirement (FR-9, Story 2.6), not this story's criterion; adding the prop here would guess at a later story's shape. Rejected as `low`.
  - `[low]` `[patch]` The hold's swap/completion is visual-only and the announced label is deliberately pinned to the original. Fixed by reflecting the hold's state in an `accessibilityValue`; a live-region announcement was rejected because NFR-10 restricts those to evidence capture and phase change.
  - `[low]` `[patch]` The barrel is imported by nothing, so its twelve hand-written exports can drift unnoticed. Fixed with a barrel suite asserting the export set.
  - `[low]` `[patch]` `EvidenceOutcome` is exported as a type but its runtime set and the dismiss window are not. Fixed by exporting both from the barrel.
  - `[low]` `[patch]` The grain's reproducibility is documented but not gated, and CI runs only `verify` and `bundle`. Fixed with a `grain:check` script wired into CI.
  - `[low]` `[reject]` `zlib` output is not guaranteed byte-identical across Node versions. The tile is committed and the new `grain:check` gate catches drift; pinning the compressor across Node lines is not worth the surface. Rejected as `low`.
  - `[low]` `[reject]` The grain's design parameters (180, .85, 2 octaves) live in the script and in `DESIGN.md` prose, outside the frontmatter the sync test reads — making the script parse the design source would be a second parser for one texture. Rejected as `low`.
  - `[low]` `[reject]` Other new numbers (scrim opacity, breath amplitude, ring insets) have no token — none exists in the design source and adding one edits a read-only document; the dismiss window, which the design *does* name, is now asserted. Rejected as `low`.
  - `[medium]` `[patch]` `Sheet` never hides the screen behind it from assistive technology. Fixed with `accessibilityViewIsModal` and a case.
  - `[medium]` `[patch]` Neither `Sheet` nor `TabBar` respects the bottom safe-area inset. Fixed via the installed safe-area context, with a zero fallback so suites without a provider stay green.
  - `[low]` `[patch]` `FieldView` converts the `em` tracking twice, so the two will drift if `textStyle` changes. Fixed by deriving the offset from the one conversion.
  - `[low]` `[patch]` The `FieldView` suite re-spells the component's geometry constants. Fixed by exporting them and importing them in the suite.
  - `[low]` `[patch]` Assertions that cannot fail (`spacing['6'] > 0`, `hidden.length >= 2`) and test scaffolding copy-pasted across four suites. Fixed: exact assertions and the shared helpers moved into `tree.ts`.
  - `[medium]` `[patch]` `HoldButton` sets state and fires callbacks after unmount mid-hold. Fixed with effect cleanup clearing the swap timer and stopping the fill.
  - `[medium]` `[patch]` A rejected `isReduceMotionEnabled()` leaves `Sheet` permanently invisible with no error. Fixed with a `.catch` seeding the resting state.
  - `[medium]` `[patch]` The same rejection leaves the capture card invisible for its whole window. Fixed with the same `.catch`.
  - `[medium]` `[patch]` `EvidenceCard`'s entrance and hairline keep running after resolve or unmount. Fixed by retaining and stopping both handles.
  - `[medium]` `[patch]` `Sheet`'s entrance animations run on after unmount. Fixed by retaining and stopping the handles.
  - `[medium]` `[patch]` `HoldButton` captures its callbacks at press-in, so a parent re-render mid-hold fires a stale closure and misattributes the outcome. Fixed with refs.
  - `[low]` `[patch]` `TabBar` fires `onSelect` for the already-active tab. Fixed and covered.
  - `[medium]` `[patch]` A reused `EvidenceCard` never resolves — same claim as the blind-hunter row above; fixed with the identity-key remount.
  - `[medium]` `[patch]` `EvidenceCard`'s free-text `typeLabel`/`channel`/`possibleMatch` props could carry a measurement uncaught. They were already rendered by the structural scan; the suite's boundary statement now names them, matching Story 1.3's treatment. Same claim class as the verification row below.
  - `[low]` `[patch]` `GrainOverlay`'s "above all content" is delegated to the composer by the docstring while `absoluteFill` only fills the parent. Fixed by binding the tile to the overlay's own bounds and documenting the delegation.
  - `[low]` `[patch]` The claim that every animation comes from `animations.*` is falsified by the hairline's local six-second window — the window is the design's own figure, not an animation token. The docstring now says which is which.
  - `[low]` `[patch]` The dismissal is a timer started before the hairline, so the hairline is read as the trigger. Fixed by pairing each timing with its animation and asserting the window's length.
  - `[medium]` `[patch]` `Sheet`'s Reduce-Motion branch sets two values no test observes — removing either ships an invisible sheet or an undimmed one green. Fixed by asserting the rendered resting values.
  - `[medium]` `[patch]` The capture card's "visible at rest" is unverified in the Reduce Motion branch. Fixed by asserting its opacity during the window.
  - `[medium]` `[patch]` The capture window and its two timings are compared only against themselves, so they can swap or shrink tenfold. Fixed by pairing configs with their animations and asserting the design's six seconds.
  - `[medium]` `[patch]` `GrainOverlay`'s full-screen contract is asserted on the wrapper, never on the tile. Fixed by asserting the tile's geometry.
  - `[medium]` `[patch]` `FieldView`'s breath — which ring breathes, and by how much — is unobserved. Fixed by asserting only the outer ring carries the animated values and pinning the amplitude.
  - `[low]` `[patch]` `Sheet`'s docstring, code and test disagree on the scrim cross-fade — same finding as the blind-hunter row above; resolved with it.
  - `[low]` `[patch]` `HoldButton` renders its label verbatim while the design says "uppercase tracked" and the sibling `TabBar` uppercases. Fixed and pinned.
  - `[low]` `[patch]` An `EvidenceCard` suite title says "four outcomes" — same finding as the blind-hunter row above; fixed with it.
  - `[low]` `[patch]` A `Sheet` suite assertion checks a token rather than the rendered panel — same finding as the blind-hunter scaffolding row above; fixed with it.
  - `[low]` `[reject]` (intent-alignment, descriptive) The intent names three stories and this diff implements one — intended: one story per run; this run resolved Story 1.4, the last of the three. No work.
  - `[low]` `[reject]` (intent-alignment, descriptive) The intent's expectation lives at the composed-screen interaction surface while the diff lives at the isolated primitive. The composed surfaces are Stories 1.6–1.8 by the Code Map; the two halves that *are* this story's — "logs rather than discards" and "above all content" — are callbacks and a documented delegation, exactly as the spec requires. No work.
  - `[low]` `[reject]` (intent-alignment, descriptive) "Above all content" is the composer's job and the test asserts the primitive's part — recorded as delegation in the docstring; no further work.
  - `[low]` `[reject]` (intent-alignment, descriptive) The a11y contract is asserted at the prop surface rather than against a platform screen reader — the only surface available without a device. No work.
  - `[low]` `[reject]` (intent-alignment, descriptive) The holds are verified by animation config rather than device timing — the gesture's own timing is a device surface; the durations, the swap point and the cancel path are all pinned. No work.

## Auto Run Result

Story 1.4 ships the six interaction primitives — `HoldButton`, `Sheet`, `TabBar`, `FieldView`, `GrainOverlay`, `EvidenceCard` — as token-reading React Native components under `src/ui/components/`, extends Story 1.3's barrel, and adds the one asset the platform cannot draw: the pre-rendered grain tile with the deterministic script that regenerates it byte-for-byte. One review pass, no loopback.

**Files changed**
- `src/ui/components/{HoldButton,Sheet,TabBar,FieldView,GrainOverlay,EvidenceCard}.tsx` (new) — the six primitives. `HoldButton`'s fill duration comes from a closed variant union read against `components['hold-button'].fillDurations`; `Sheet` enters on `ntUp` over an `ntFade` scrim with no blur or shadow; `TabBar` carries the closed four-tab IA and exactly one badge type; `FieldView` breathes only its outer ring on `ntBreathe`; `GrainOverlay` is fixed at `components.grain.opacity`, non-interactive and never animating; `EvidenceCard` shows a word-only meta block and auto-dismisses to `unreviewed`.
- `src/ui/components/index.ts` — the barrel extended to twelve components, their union/prop types, and the evidence outcome set and dismiss window.
- `src/ui/components/__tests__/` (new suites) — one per component plus `tab-badge`, with the token-duration, Reduce Motion, unmount/cleanup, reduced-motion-value and breathing-amplitude cases; `tree.ts` now hosts the shared reduce-motion and timing spies.
- `src/ui/components/__tests__/{a11y,no-measurement}.test.tsx` — extended to the new components and the decorative layers.
- `assets/grain.png` + `scripts/generate-grain.mjs` + `scripts/check-grain.mjs` (new) — the committed 180×180 tile, its deterministic generator, and the byte-compare gate.
- `package.json` — the `grain:check` script.
- `.github/workflows/ci.yml` — runs `grain:check`, so the committed tile cannot drift from its generator.

**Review findings breakdown.** 43 findings (0 high, 18 medium, 25 low) → 32 patch entries applied, 6 rejected (one as a later story's requirement, two as out-of-scope tokenisation, one as `zlib` determinism, and the intent-alignment rows as descriptive). The patches closed real defects the first cut shipped: an invisible `Sheet` and an invisible capture card when the reduce-motion read rejects; a reused `EvidenceCard` that could never resolve again; entrance animations running after unmount; a stale-closure hold outcome; a `HoldButton` that assistive technology could never complete; a `TabBar` that fired on re-selection; and six verification gaps where the assertion could not fail (the resting branch's values, the tile's geometry, which ring breathes, which animation got which duration, and the six-second window).

**Follow-up review recommendation:** `false` — first pass, no `high` entry patched, and the patched `medium`s are all closed by assertions that now fail on regression rather than by unverified reasoning. The one deliberate non-cross-fade choice (the sheet's scrim snaps under Reduce Motion) is documented in the component, the rejection reason is recorded above, and a cross-fade cannot be driven to completion in these suites.

**Verification performed** (after the patches, on the settled tree): `npm run typecheck` exit 0; `npm run lint` exit 0; `npm test` — 25 suites, 359 tests green across both projects; `npm run grain:check` — the committed tile is byte-identical to a fresh generation; `npm run bundle` — `expo export --platform ios` exit 0 with the grain asset resolvable by Metro; the AD-17 raw-value probe over a new component file rejected naming AD-17.

**Residual risks.** The grain is a pre-rendered tile rather than a native `feTurbulence`, because `react-native-svg` returns `null` for that primitive — the texture is therefore the script's fractal noise rather than the platform's, and the script is the record. Nothing under `src/app/**` composes these primitives yet, so their real-surface behaviour (a hold performed on a device, a sheet over a live session, the tab bar under the home indicator) is verified only by renders and prop assertions; Stories 1.6–1.8 own those surfaces. `HoldButton` has no disabled state — that belongs to the Brief (Story 2.6). Free-text props (`EvidenceCard`'s `typeLabel`/`channel`/`possibleMatch`, `LedgerRow`'s glyph/type/time) can carry authored copy that no type can constrain; the structural scan covers the rendered direction.
