---
title: 'Story 1.7 — The notice stays reachable and travels with the user''s data'
type: 'feature'
created: '2026-10-08'
status: 'done'
baseline_revision: '8ebaa88eefbdbec49a1a8f1ccf9c4b481a06c39b'
route: 'full'
route_source: 'auto'
review: 'thorough'
review_source: 'auto'
lenses_ran: ['blind-hunter', 'edge-case-hunter', 'verification-gap', 'intent-alignment']
review_loop_iteration: 0
followup_review_recommended: true
context: []
warnings: ['oversized']
deferred: []
---

<intent-contract>

## Intent

**Problem:** Story 1.5 authored the About notice content and declared it in the lint surface; Story 1.6 made it the frame a first-time user acknowledges. But the notice is not reachable anywhere in the app, so a user who catches the frame once can never re-read it, and nothing records that Epic 6's export must carry it. FR-32's third disclaimer layer does not exist yet.

**Approach:** Land the About notice as a real destination — a Profile row opening the notice surface, rendered in full from the Story 1.5 table (sections, sensor inventory, safety content, the imported entertainment line) — and record the Epic 6 export obligation as a named artifact. A minimal Profile screen stands in for the tab Story 1.8 owns; the app body gains the one link that makes Profile reachable, which 1.8 replaces.

## Boundaries & Constraints

**Always:** The notice renders in full from `ABOUT_NOTICE` — every section, the sensor inventory, the safety content — and the entertainment line is the imported `ENTERTAINMENT_LINE`, never retyped. The safety content is legible through the type ramp (never below the mono floor), never truncated and never reworded. The path to About is a **normal Profile destination** — a row a user can find, not a hidden or developer gesture. The new UI copy lives in the declared string-table surface so Story 1.5's claims lint covers it, and the coverage test must see every new table. The About path requests **no permission** and reads **no sensor**, and that absence is gated (the Story 1.6 lint scope is extended to it). The Epic 6 export obligation is recorded as a named artifact the Epic 6 story can find.

**Never:** No re-authoring of the notice content — 1.5's table is the source of truth; do not retype or reword it. No second copy of the entertainment line. No permission prompt or sensor read anywhere on the Profile→About path. Do not build the four-tab shell or its layout (Story 1.8) — this story adds the Profile *screen* the shell will hold, and a temporary app-body link 1.8 removes. No data export implementation (Epic 6) — only the recorded obligation. Do not change Story 1.1–1.6 behaviour beyond extending the onboarding lint scope to the new paths.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| OPEN_ABOUT | a user on Profile tapping the About row | the notice surface presents with every section and the safety content | No error expected |
| CLOSE_ABOUT | the notice's close action | the surface dismisses and Profile is intact | No error expected |
| FULL_NOTICE | the rendered notice | all six sections in order, the sensor inventory, the entertainment line, the safety paragraph | No error expected |
| ZERO_PERMISSION | zero permissions granted | the whole path renders; no permission prompt is triggered | No error expected |
| SAFETY_LEGIBLE | the safety paragraph | rendered at or above the mono floor, not truncated, not reworded | Test asserts |
| EXPORT_OBLIGATION | the repository | a named artifact records that any data export must carry the entertainment notice | Test asserts it exists and names the line |

</intent-contract>

## Code Map

Epic context: `_bmad-output/implementation-artifacts/epic-1-context.md` (valid). Continuity from `spec-1-5-claims-lint.md` (the About-notice table, the claims surface set) and `spec-1-6-onboarding-frame.md` (the frame/action patterns, the onboarding lint scope, the route test harness). Sources: `EXPERIENCE.md` lines 42, 76 (Profile owns the entertainment notice; About & entertainment is a sheet); `DESIGN.md` (Components: Rule, Sheet; the four tabs; the safety-notice rule); `ARCHITECTURE-SPINE.md` AD-12 (routes own no data access), AD-28 (a11y), the Structural Seed (`app/(modals)/` about; `app/(tabs)/` four tabs).

- `src/app/(tabs)/profile.tsx` -- CREATE. The Profile destination the shell will hold: the screen title and an `About & entertainment` ledger-style row that opens the notice. No stat row (it needs case data, a later epic).
- `src/app/(modals)/about.tsx` (+ `(modals)/_layout.tsx`) -- CREATE. The notice surface, presented as the design's sheet and rising on the `Sheet` primitive; a close action returns to Profile.
- `src/features/about/NoticeSurface.tsx` -- CREATE. Renders `ABOUT_NOTICE` (sections, sensor rows, the imported line) through `Rule` and `textStyle`.
- `src/features/profile/ProfileScreen.tsx` -- CREATE. The Profile body with the About row.
- `src/data/strings/profile.ts` -- CREATE. The Profile/About UI copy (screen title, the About row label, the close label) — a new string table that must be declared.
- `src/data/strings/index.ts` -- MODIFY. Export the Profile/About copy.
- `scripts/claims/config.json` -- MODIFY. Declare the new string table in the surface set — Story 1.5's coverage test fails until it is.
- `eslint.config.js` -- MODIFY. Extend the 1.6 zero-permission/zero-sensor import ban to the About and Profile paths, with a `__boundary_fixtures__` case.
- `src/app/index.tsx` -- MODIFY. The placeholder home gains the one link that makes Profile reachable (Story 1.8 replaces the placeholder and the link).
- `docs/epic-6-export-obligation.md` -- CREATE. The named obligation: any data export must include the entertainment notice, per FR-27.
- `src/features/about/__tests__/`, `src/features/profile/__tests__/`, `src/app/__tests__/` -- CREATE/EXTEND. The matrix rows, the notice's completeness, the safety legibility, the export obligation.

## Tasks & Acceptance

**Execution:**
- [x] `src/data/strings/profile.ts` + `index.ts` -- the Profile/About copy -- a new table so the lint covers it.
- [x] `scripts/claims/config.json` -- declare the new table -- the coverage assertion is the point of Story 1.5.
- [x] `src/features/about/NoticeSurface.tsx` -- render the notice in full from `ABOUT_NOTICE`, safety included -- the content is 1.5's, this only renders it.
- [x] `src/features/profile/ProfileScreen.tsx` + `src/app/(tabs)/profile.tsx` -- the Profile destination and its About row -- the path must be a normal destination.
- [x] `src/app/(modals)/about.tsx` + `_layout.tsx` -- the notice surface rising on `Sheet` -- the design's sheet.
- [x] `src/app/index.tsx` -- the temporary Profile link on the placeholder home -- reachability now, replaced by 1.8.
- [x] `eslint.config.js` + the boundary test -- extend the zero-permission ban -- the AC's claim must be a gate.
- [x] `docs/epic-6-export-obligation.md` -- the named obligation -- FR-27 must be findable by the Epic 6 story.
- [x] the test suites -- one case per matrix row -- the ACs are behavioural and must be proved by rendering.

**Acceptance Criteria:**
- Given a user on Profile, when they open About, then the full entertainment notice is rendered, including the safety content, and the path to it is a normal Profile destination rather than a buried or developer gesture.
- Given the notice is reachable from Profile, when a data export is later produced by Epic 6, then a named artifact records that the notice must be included in the exported file (FR-27), so the Epic 6 export story has the obligation.
- Given the About notice content, when it is rendered, then it comes from the Story 1.5 table (which is in the declared lint surface set), the entertainment line is the exported constant and not a literal, and the safety paragraph is neither truncated nor reworded.
- Given the app with zero permissions granted, when the user reaches About, then every screen on the path renders fully and no permission prompt is triggered, and that absence is enforced rather than asserted.
- Given `npm run verify` and `npm run bundle`, then typecheck, lint, both Jest projects, the claims lint and the iOS export all pass.

## Implementation Notes

## Spec Change Log

## Review Triage Log

### 2026-10-08 — Review pass 1

- verdicts: 40 findings — high 2, medium 8, low 27, false 3, maybe-false 0
- lenses: blind-hunter (27), edge-case-hunter (3), verification-gap (3 gap + 1 other), intent-alignment (6 descriptive). All four ran; none died.
- findings:
  - `[high]` `[patch]` (blind-hunter; edge-case) `NoticeSurface` has no scroll container, so the six sections, the sensor inventory and the Close action overflow off-screen on a short device or at large type — the safety content unreadable and Close a dead end. Verified: `Sheet` has no `ScrollView` and the surface adds none. Fixed with a `ScrollView` (Close kept outside it and always reachable) plus the safe-area inset; tests assert both.
  - `[low]` `[patch]` (blind-hunter; intent-alignment) The `SENSORS USED` section's derived paragraph is not rendered as such (the rows are), so the spec's "renders in full" and the artifact's "byte for byte" overstate. Refutation of content loss: the paragraph is *derived* from the rows, so rendering the rows conveys the same. Fixed by correcting the wording in the artifact and the Design Notes.
  - `[low]` `[patch]` (blind-hunter) `isSensorSection()` identifies the section by substring-matching the sensor note, which is brittle. Fixed by exporting the section heading as a constant and matching on it structurally (no content re-authored).
  - `[medium]` `[patch]` (blind-hunter; verification-gap) The About route's cold-deep-link close arm is never executed (`canGoBack()` is always true in the only test), so deleting the fallback ships green. Verified by mutation. Fixed with a route case mounting `initialUrl: '/about'`.
  - `[low]` `[patch]` (blind-hunter) The section-order assertion would pass on a missing heading (`indexOf` → -1). Fixed by asserting every position is ≥ 0.
  - `[false]` `[reject]` (blind-hunter) SAFETY_LEGIBLE asserts against `typography.micro.fontSize` rather than "the design's floor". Refutation: `micro` *is* the 9.5px mono floor, and the token-sync test keeps it equal to the design source.
  - `[medium]` `[patch]` (blind-hunter; edge-case) Neither new screen handles the safe area, so the Profile title renders under the notch. Verified. Fixed by reading `SafeAreaInsetsContext` with a zero fallback (the 1.6 convention).
  - `[medium]` `[patch]` (blind-hunter; verification-gap; intent-alignment) The lint scope is declared over all of `(modals)` and `(tabs)` — which will hold the permissions sheet and the sensor-using tabs — and does not reach `src/app/index.tsx`, the screen a user taps to start toward About. Verified: a sensor import at `index.tsx` is unreported. Fixed by narrowing the route scope to the three files on the path and adding an `index.tsx` boundary case.
  - `[low]` `[reject]` (blind-hunter) `src/app/index.tsx` was modified despite the `Never` clause. The Approach in the same contract licenses the link ("the app body gains the one link"), which the AC requires; the `Never` sentence is imprecise and the intent-contract is frozen.
  - `[low]` `[reject]` (blind-hunter) The claims config key `ui.profile-copy` does not name every string in the table. A key name; the surface path is what the coverage test asserts.
  - `[low]` `[reject]` (blind-hunter) The placeholder home's `NightTrace` wordmark is a bare literal. It is the app name (Story 1.1's placeholder), not authored copy; 1.8 replaces the screen.
  - `[low]` `[patch]` (blind-hunter; verification-gap) `index.tsx` mixes raw values (`gap: 16`) and hand-rolls the label style instead of `textStyle`. Fixed: `textStyle(typography.label)` and a spacing token (the pre-existing title's `fontSize: 24` left untouched).
  - `[low]` `[patch]` (blind-hunter) The export-obligation artifact retypes the headings and inventory, a second copy that can drift. Fixed: it references `ABOUT_NOTICE` and keeps only the entertainment line (which its test asserts).
  - `[low]` `[reject]` (blind-hunter) The artifact's §B.5/Epic-6 citations are unlinked. The Epic 6 story slug is a real `sprint-status.yaml` key; a cross-link adds no guarantee.
  - `[low]` `[reject]` (blind-hunter) FR-27's deletion half is not recorded. The AC and the story are about the export obligation; deletion is Epic 6's own story.
  - `[low]` `[reject]` (blind-hunter) The artifact has no owner/date/close trigger. It carries a status and the owning story key; AD-30's named-owner release process is a separate item.
  - `[low]` `[patch]` (blind-hunter) The artifact claims the render is the table "byte for byte". Same root as the render-wording row above; fixed with it.
  - `[low]` `[patch]` (blind-hunter) The boundary test covers two route files and one banned module. Fixed with the narrowed scope's `index.tsx` case; the module set is witnessed by the committed fixtures.
  - `[low]` `[reject]` (blind-hunter) The route block hand-rolls `no-restricted-imports` while the feature block uses `importBan`. Merging two pattern groups needs the hand-rolled shape; both halves are asserted.
  - `[low]` `[reject]` (blind-hunter) The feature files' other selectors being "untouched" is unasserted. Those files carried no `no-restricted-imports` before, so nothing is replaced; the route half — where a replacement *does* happen — is asserted.
  - `[low]` `[reject]` (blind-hunter) No layout/registration step is recorded. expo-router routes a new group automatically and regenerates typed routes; the bundle and typecheck prove resolution.
  - `[low]` `[patch]` (blind-hunter) The spec's file inventory omits three files. Reconciled in the Auto Run Result at finalize.
  - `[low]` `[patch]` (blind-hunter) Frontmatter/empty sections left the review record incomplete. Reconciled at finalize (lenses, tasks, logs, Auto Run Result).
  - `[low]` `[reject]` (blind-hunter) Verification is iOS-only with no Android/web note. The repo's gate is iOS-only by convention (Stories 1.1–1.6).
  - `[low]` `[reject]` (blind-hunter) Duplicated test scaffolding and weak assertions. The mock duplication is forced by the harness's module-global router store (documented in each file).
  - `[low]` `[reject]` (blind-hunter) The temporary 1.8 link has no machine-checkable marker. Story 1.8 replaces the placeholder wholesale; a marker registry is not a thing this repo has.
  - `[false]` `[reject]` (blind-hunter) No test asserts the new table is in the claims surface set. Refutation: Story 1.5's coverage test enumerates every file under `src/data/strings/**` and fails when one is undeclared — verified by the spec's probe.
  - `[high]` `[patch]` (edge-case) The notice content overflows the panel. Same root as the scroll row above; fixed with it.
  - `[medium]` `[patch]` (edge-case) No safe-area inset on Profile. Same root as the safe-area row above; fixed with it.
  - `[low]` `[patch]` (edge-case) A double tap on the About row stacks two sheets. Fixed by `router.navigate`.
  - `[medium]` `[patch]` (verification-gap, pre-verified) The About route's no-history close arm is never executed. Filed disposition `patch`; fixed with the deep-link case — same root as the deep-link row above.
  - `[medium]` `[patch]` (verification-gap, pre-verified) The zero-permission gate does not reach `src/app/index.tsx`. Fixed with the narrowed scope — same root as the lint-scope row above.
  - `[medium]` `[patch]` (verification-gap, pre-verified) The About route's composition onto `Sheet` is unasserted. Verified by mutation. Fixed with a host-tree assertion that the notice sits inside the sheet panel.
  - `[low]` `[patch]` (verification-gap) `index.tsx` hand-rolls the label style. Same root as the raw-value row above; fixed with it.
  - `[low]` `[reject]` (intent-alignment, descriptive) The intent's readings. The diff implements the per-story reading (R2/R4); one story per run is intended.
  - `[low]` `[reject]` (intent-alignment, descriptive) Surface mismatch (a markdown doc for the export, a static lint for the runtime promise). The export is Epic 6's by the AC; the lint is the repo's established way to gate an absence.
  - `[medium]` `[patch]` (intent-alignment, descriptive) The zero-permission scope overshoots the Profile→About path. Same root as the lint-scope row above; fixed with it.
  - `[low]` `[patch]` (intent-alignment, descriptive) Render fidelity vs. the artifact's "byte for byte". Fixed with the wording row above.
  - `[low]` `[reject]` (intent-alignment, descriptive) The tests assert the layer the change touched. Rendering-tests-against-the-table is the point: the table is the source of truth and a reworded render fails.
  - `[low]` `[patch]` (intent-alignment, descriptive) The tracker still read `backlog`. Reconciled at finalize.

**Routing.** No `intent_gap` and no `bad_spec`: every survivor's smallest fix is a localized correction (a scroll container, a scope narrowing, an inset, a test case) that adds no public surface. Ten `patch`-route groups cover 20 rows (2 `high`, 8 `medium`, 10 `low`), 20 `reject`, none `defer`. All patches applied and re-verified on the settled tree.

## Design Notes

**The notice content is not this story's to author.** Story 1.5's `ABOUT_NOTICE` table is the source of truth and Story 1.6 already placed the entertainment line in it; this story renders it and nothing else. The one content risk — "never reworded" — is therefore a rendering property: the suite asserts the rendered text equals the table's.

**A minimal Profile, not a tab.** Story 1.8 builds the four-tab shell and the real Profile; this story needs a Profile *destination* only so the About path is a real one. It therefore adds the screen (no stat row — that needs case data) plus one temporary link on the placeholder home, and 1.8 replaces the placeholder and the link.

**About rises on the design's sheet.** `DESIGN.md` and `EXPERIENCE.md` put About & entertainment in the sheet list, so the notice presents as a sheet rather than a full-screen push — the `Sheet` primitive, not a bespoke panel.

## Verification

**Commands:**
- `npm run verify` -- expected: typecheck, lint, both Jest projects and `claims:check` all exit 0
- `npm run bundle` -- expected: `expo export --platform ios` exits 0 with the new routes resolving
- `npm run claims:check` -- expected: exit 0 with the new string table declared
- Probe: remove the new table from the claims config -- expected: the coverage test fails

**Manual checks (if no CLI):**
- The About row is reachable from Profile by a normal tap; the notice shows every section including safety; no permission dialog can appear.
- `docs/epic-6-export-obligation.md` names the entertainment line and FR-27.

## Auto Run Result

Story 1.7 lands the third disclaimer layer: the About notice is a real destination — a Profile row opening a sheet that renders the Story 1.5 table in full, safety content and all — and the Epic 6 export obligation is recorded as a named artifact. This is the last of the three stories in the intent (`epic 1 - 5,6,7`). One review pass; 2 `high` findings patched in place, no loopback.

**Files changed**
- `src/app/(tabs)/profile.tsx` (new) — the `/profile` destination (no tab layout; Story 1.8's shell holds it).
- `src/app/(modals)/about.tsx` + `_layout.tsx` (new) — `/about`, the notice rising on the `Sheet` primitive in a transparent-modal group; close returns to Profile, with a `replace('/profile')` fallback for a cold deep link.
- `src/features/about/NoticeSurface.tsx` (new) — renders `ABOUT_NOTICE` (every section in order, the sensor inventory as rows, the imported entertainment line, the safety paragraph) through `Rule`, `textStyle` and a `ScrollView` with the top safe-area inset; Close sits outside the scroll so it is always reachable.
- `src/features/profile/ProfileScreen.tsx` (new) — the Profile body with the `About & entertainment` row, safe-area handled.
- `src/data/strings/profile.ts` (new) + `src/data/strings/index.ts` (modified) — the Profile/About UI copy in the declared surface; `src/data/strings/aboutNotice.ts` (modified) exports the sensor-section heading so the surface identifies it structurally.
- `scripts/claims/config.json` (modified) — the new table declared (`ui.profile-copy`).
- `eslint.config.js` (modified) — the zero-permission/zero-sensor import ban extended to the three files on the path (`(modals)/about.tsx`, `(tabs)/profile.tsx`, `index.tsx`) and the About/Profile feature files, with AD-12 patterns retained.
- `src/app/index.tsx` (modified) — the placeholder home's one Profile link (1.8 replaces it), styled through `textStyle`.
- `docs/epic-6-export-obligation.md` (new) — the named FR-27 obligation, referencing `ABOUT_NOTICE` rather than retyping it.
- Tests (new/modified): `src/features/about/__tests__/{NoticeSurface,exportObligation}.test.*`, `src/features/profile/__tests__/ProfileScreen.test.tsx`, `src/app/__tests__/{about,aboutDeepLink,home}.test.tsx`, the two boundary fixtures and `src/__tests__/boundary.test.ts`.

**Review findings breakdown.** 40 findings (2 high, 8 medium, 27 low, 3 false) into 20 `patch` rows (10 groups), 20 `reject`, none `defer`. The load-bearing patch: the notice had **no scroll container**, so a six-section notice could push the safety content and the Close action off-screen — the one surface the story says must never be truncated — and two route behaviours (the `Sheet` presentation and the cold-deep-link close) shipped green under mutation. Also fixed: the lint scope was declared over every modal and tab (blocking later work) while missing `index.tsx` entirely; neither new screen handled the safe area; and the export artifact retyped notice content. Rejections are recorded in the `## Review Triage Log`.

**Follow-up review recommendation:** `true` — a first pass that patched a `high` entry, which is the workflow's trigger. The specific unverified risk: the `ScrollView` fix is verified by structure (a scroll container exists, the Close action is outside it), not by measuring a real device — whether the panel's content-sized height inside the `Sheet` clips on the smallest supported device is a device-only question.

**Verification performed** (on the settled tree): `npm run typecheck` exit 0; `npm run lint` exit 0; `npm test` — 37 suites, 479 tests green across both Jest projects; `npm run claims:check` exit 0 (`clean — 7 surfaces, 44 files, 722 strings checked`); `npm run bundle` — `expo export --platform ios` exit 0 with the new routes resolving; the spec's probe (removing `ui.profile-copy` from the claims config) fails the coverage test, and restoring it returns to clean.

**Residual risks.** The About sheet's real-device presentation (a transparent modal over Profile, a content-sized panel, the safe-area inset under a notch) is verified by renders and the export, not by a device. `router.navigate` guards a double tap on the About row but the underlying stack behaviour is the platform's. The placeholder home and its Profile link are temporary — Story 1.8 replaces them, and it will also add the `(tabs)`/`(modals)` layouts whose absence this story leaves. Epic 6 must read `docs/epic-6-export-obligation.md` and carry the notice in the export; nothing in this story implements it.
