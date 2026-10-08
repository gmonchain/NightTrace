---
title: 'Story 1.5 — The build refuses to ship a sentence that asserts anything about the real world'
type: 'feature'
created: '2026-10-08'
status: 'done'
baseline_revision: '0cddded6dc3944c4bd4d6956433b7752d232d9f1'
route: 'full'
route_source: 'auto'
review: 'thorough'
review_source: 'auto'
lenses_ran: ['blind-hunter', 'edge-case-hunter', 'verification-gap', 'intent-alignment']
review_loop_iteration: 0
followup_review_recommended: true
context: []
warnings: ['oversized', 'multiple-goals']
deferred: []
---

<intent-contract>

## Intent

**Problem:** Nothing yet stops a shipped sentence from claiming the app detects, proves, or measures anything. Story 1.6 (onboarding), 1.7 (About notice) and every later epic author strings, and Story 1.1 deliberately shipped no claims gate — so without this story five epics of copy ship unchecked, and retrofitting the gate means auditing every string already written.

**Approach:** Commit a build-failing claims lint that parses the strings of a **declared, enumerated surface set** (never a glob of the binary), plus the small content primitives the set needs to be real: the single entertainment-line constant, the UI string-table location, the About notice table, the store listing/rating source, and the iOS/Android native purpose strings declared in `app.config.ts`. Wire the lint into `npm run verify`'s CI pipeline and record the five AD-16 blind spots as explicit release-review items this lint does not automate.

## Boundaries & Constraints

**Always:** The surface set is an **enumerated list** in `scripts/claims/config.json`; each entry names a shipped surface by path, and a test asserts the set covers the required minimum (UI string tables, iOS `Info.plist` purpose strings incl. `NSMotionUsageDescription`/`NSMicrophoneUsageDescription`, Android manifest permission strings, store description + title, screenshot captions, About notice) and that every string table on disk appears in it. The entertainment line is one exported constant whose value is exactly `An investigation experience. Not a measurement.`, imported wherever it is needed and never retyped. Banned terms come from the ratified closed list in addendum §B.2; approved market terms from §B.3. Banned-term matching is **whole-word/phrase and case-insensitive**, minus an enumerated `allowedPhrases` list holding only the safe forms the rulings table ratifies while still containing a banned token (`Nothing here is proof.`, addendum §B.4 row 27). A violation fails with exit 1 and prints the **term, the file and the line**. The `%` character is banned in every shipped string, checked over the declared set plus a shipped-source scope so "any shipped string anywhere, including accessibility labels" is covered. The five AD-16 blind spots and NFR-20's store-metadata review (guidelines 2.3.1/2.3.7) are recorded in `docs/review-items.md` as owned release items.

**Never:** No glob of the app binary as the coverage mechanism — coverage is the enumerated set, and the coverage itself is asserted. No `%` anywhere in a shipped string. No statistic, social proof, award or count of users in marketing copy; no fake telemetry or progress-scanning language. Do not author the `%` into any string to satisfy a test. Do not modify `DESIGN.md`, `eslint.config.js`, `tokens.ts`'s values, or any Story 1.1–1.4 artifact. Do not build onboarding (1.6), the Profile/About route or export inclusion (1.7), or the tab shell (1.8) — only the notice/notice-constant content they will render. Do not claim this story automates the blind-spot review.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| CLEAN_TREE | `npm run claims:check` over the committed surfaces | exit 0, no output beyond a summary | No error expected |
| BANNED_TERM | a shipped surface gains a banned term | exit 1, prints term + file + 1-based line | Non-zero exit is the failure signal |
| BANNED_CHAR | a shipped string gains a `%` | exit 1, prints the char + file + line | Non-zero exit |
| ALLOWED_FORM | a surface carries a ratified safe form (`Nothing here is proof.`) | exit 0 | No error expected |
| WRONG_VARIANT | the text `Nothing here is measurement.`-style wrong variant appears | a test asserts its exact absence | Test fails |
| SURFACE_ADDED | a new string table appears on disk | coverage test fails until the table is added to the set | Test fails |
| CONFIG_UNREADABLE | `scripts/claims/config.json` is missing or malformed | exit 2 with a diagnostic naming the config | Non-zero exit; never silently pass |

</intent-contract>

## Code Map

Epic context: `_bmad-output/implementation-artifacts/epic-1-context.md` (valid, newer than every planning artifact). Continuity from the previous `done` story: `spec-1-4-interaction-components.md` (the token-reading component patterns, the `scripts/*.mjs` + npm-script + CI-step gate shape, the `docs/review-items.md` convention). Binding sources: addendum §B.2 (banned list), §B.3 (approved market terms + store framing), §B.4 (40-row rulings), §B.5 (three-layer disclaimer + About-notice structure); arch-spine AD-16, AD-30, NFR-18; epics Story 1.5 ACs.

- `src/data/strings/entertainment.ts` -- CREATE. `export const ENTERTAINMENT_LINE = 'An investigation experience. Not a measurement.'` -- the one exported constant; the store listing, About notice, (later) onboarding and share footer import it, and a test asserts the exact value.
- `src/data/strings/aboutNotice.ts` -- CREATE. The About-notice string table (addendum §B.5 structure: WHAT THIS IS / WHAT IT DOES / SENSORS USED / WHAT WE NEVER DO / a note on what this is not / SAFETY), importing `ENTERTAINMENT_LINE`. The §B.5 "A NOTE ON SCIENCE" section is authored to *disclaim* without shipping the banned token `science` (§B.2 bans it flatly). This is the surface Story 1.7 renders from Profile and exports.
- `src/data/strings/index.ts` -- CREATE. Barrel for the string-table location; the location `src/data/strings/**` is the declared "UI string tables" surface.
- `assets/store/listing.json` -- CREATE. `title` `NightTrace`, `subtitle` `Paranormal field journal`, `description` whose **first sentence is the entertainment line**, `category` `Entertainment`, `ratingInputs` (the recorded questionnaire answers), `rating` (derived from them), and `screenshots[].caption`. The store description/title and the screenshot captions are surfaces (AD-16).
- `app.config.ts` -- MODIFY. Add `ios.infoPlist.NSMotionUsageDescription` + `NSMicrophoneUsageDescription` and `android.permissions` (the two manifest permission strings matching those capabilities) -- the named highest-risk purpose strings; declaring a permission is not requesting it, so zero-permission playability is untouched.
- `scripts/claims/config.json` -- CREATE. `{ bannedTerms, allowedPhrases, bannedCharacters, approvedMarketTerms, surfaces, shippedCharacterScope }` -- the declared set + the closed lists; **not itself a shipped surface** (it contains the banned terms).
- `scripts/claims-lint.mjs` -- CREATE. Reads the config, extracts string literals from each surface (skipping comments; `Literal` and template-literal halves, mirroring the AD-17 selector shape), matches whole-word banned terms minus `allowedPhrases` and the `%` character, and exits 1 printing term/file/line. `--config <path>` for tests. Exit 2 on an unreadable config.
- `src/config/__tests__/claims.test.ts` -- CREATE. The coverage assertion (required minimum + every on-disk string table is in the set), the constant's exact value, the wrong-variant absence, a CLI rejection run naming file+line, the `allowedPhrases` pass, the `%` ban, the approved-market-terms list, and the store/app-config name, subtitle, category and derived rating.
- `package.json` -- MODIFY. Add `"claims:check": "node scripts/claims-lint.mjs"`.
- `.github/workflows/ci.yml` -- MODIFY. Add the claims step and move the gate out of the "later stories" comment; AD-30 makes this file the only place a gate is declared blocking.
- `README.md` -- MODIFY. Document the claims gate under Gates.
- `docs/review-items.md` -- MODIFY. Append the five AD-16 blind spots (images, mechanics, juxtaposition, visual hierarchy, the sum of individually-safe sentences) and NFR-20's store-metadata review as owned release items.

## Tasks & Acceptance

**Execution:**
- [x] `src/data/strings/entertainment.ts` + `aboutNotice.ts` + `index.ts` -- the single constant and the notice table -- the lint needs a real string surface, and the constant is the one string the whole product shares.
- [x] `assets/store/listing.json` -- the store surface: title, subtitle, entertainment-line-first description, screenshots, category, questionnaire inputs and derived rating -- the metadata surface NFR-18/NFR-20 name.
- [x] `app.config.ts` -- the two iOS purpose strings and the Android permission strings -- the highest-risk shipped strings, declared where the binary reads them.
- [x] `scripts/claims/config.json` -- the enumerated surface set + the §B.2/§B.3 closed lists + `allowedPhrases` -- coverage is a declared list, not a glob.
- [x] `scripts/claims-lint.mjs` -- the checker over the set, printing term/file/line -- the build-failing gate itself.
- [x] `src/config/__tests__/claims.test.ts` -- cover every I/O matrix row and the system-level ACs -- an unasserted gate is a gate that can be deleted with the suite green.
- [x] `package.json`, `.github/workflows/ci.yml`, `README.md` -- wire `npm run claims:check` into the pipeline and document it -- AD-30: a gate is not CI-blocking until the pipeline runs it.
- [x] `docs/review-items.md` -- the five blind spots + the store-review item -- SM-8's second count is a human release act this lint cannot perform.

**Acceptance Criteria:**
- Given a committed banned-term list covering detection/proof, confirmation/verification, authenticity, scientific, thermal/radiation, accuracy, and algorithm/AI language plus a factual `haunted`, when any banned term appears in a declared surface, then the build fails naming the term, the file and the line.
- Given the declared surface set, when it is inspected, then it is an enumerated list (not a glob of the app binary) containing at least the UI string tables, the iOS `NSMotionUsageDescription`/`NSMicrophoneUsageDescription` purpose strings, the Android manifest permission strings, the store description and title, the screenshot captions and the About notice, and the set's contents are asserted by a test so a new string table cannot be added without appearing in it.
- Given any shipped string anywhere, when it contains `%`, then the build fails; and the rendering primitives remain structurally incapable of producing a `%` (Stories 1.3–1.4), so this is a second line of defence.
- Given the entertainment line is needed, then it is read from a single exported constant valued exactly `An investigation experience. Not a measurement.`; the wrong variant `Nothing here is a measurement.` appears nowhere and a test asserts its absence; and the line is never retyped as a literal.
- Given the approved market-terms list (paranormal, ghost hunt, cryptid, investigator, field journal, EMF, EVP, spooky, adventure, night), when a marketing string is written, then no statistic, social proof, award or user count appears, and no fake telemetry or progress-scanning language appears anywhere.
- Given `app.config.ts` and the store metadata, then the name is `NightTrace`, the subtitle is `Paranormal field journal`, the category is `Entertainment`, and the rating `12+/Teen` is derived from the recorded questionnaire inputs rather than asserted.
- Given the five AD-16 blind spots, when the story is complete, then they are recorded as explicit release-review items in `docs/review-items.md`, and this story does not claim to have automated them.
- Given `npm run verify` and `npm run bundle`, then typecheck, lint, both Jest projects and the claims check pass, and the iOS bundle exports.

## Implementation Notes

## Spec Change Log

## Review Triage Log

### 2026-10-08 — Review pass 1

- verdicts: 50 findings — high 0, medium 18, low 30, false 2, maybe-false 0
- lenses: blind-hunter (25), edge-case-hunter (11), verification-gap (2 gaps + 5 other), intent-alignment (7 descriptive). All four ran; none died.
- findings:
  - `[medium]` `[patch]` (blind-hunter) Banned-term matching is bare-stem whole-word, so `detects`/`detected`/`detection`/`proves`/`confirms`/`verification`/`scientifically` pass. Verified by reading `termPattern`. Fixed by adding the 23 inflected forms FR-33's classes name as explicit `bannedTerms` (whole-word matching kept); a suite case asserts them.
  - `[medium]` `[patch]` (blind-hunter) JSX text children are never extracted, so a `%` or term authored as JSX text ships green. Verified by the edge-case lens (`<Text>Strength 87%</Text>` → "0 strings checked", exit 0). Fixed by extracting `ts.isJsxText`; a `.tsx` probe asserts it.
  - `[low]` `[patch]` (blind-hunter) `approvedMarketTerms` is validated but never consumed and the statistic/social-proof/telemetry rule lived only in a Jest assertion. Fixed: `bannedPatterns` in the config, matched by the lint over the surfaces; `approvedMarketTerms` documented as a writer's reference.
  - `[low]` `[reject]` (blind-hunter) `surfaces[].kind` is dead at runtime. Verified, but the kind is the coverage test's key and names the surface in the config; no caller diverges. Cosmetic.
  - `[low]` `[patch]` (blind-hunter) No `store-subtitle` surface entry despite the subtitle being shipped marketing copy. Fixed by adding the entry and kind.
  - `[medium]` `[patch]` (blind-hunter; edge-case `CLEAN` claim; intent-alignment) The coverage assertion enumerates only `src/data/strings`. Verified. Fixed by enumerating the declared copy roots and adding a kind→carrier assertion.
  - `[false]` `[reject]` (blind-hunter; edge-case) Terms are matched only over the declared set. Refutation: AD-16 makes the declared, enumerated set *the* coverage — "a surface not on the set is not covered" — and widening the term scope to all `src/**` would false-positive on `HoldButton.tsx:84`'s innocent UI verb `'Press and hold to confirm'` (Story 1.4, untouchable here). Only the README's "any shipped string anywhere" overclaimed; narrowed in P11.
  - `[low]` `[patch]` (blind-hunter; edge-case; intent-alignment) The README/spec claim "any shipped string anywhere" while the `%` scope excludes `src/ui/theme/**` (the Seal's filter-region `%`). Verified. Fixed by narrowing the wording and recording the exclusion as `docs/review-items.md` RE-3.
  - `[medium]` `[patch]` (blind-hunter; edge-case) `dedupeViolations`' key omits the file, so the same token+line in two files collapses to one report. Verified at `claims-lint.mjs:308`. Fixed by including the file in the key.
  - `[medium]` `[patch]` (blind-hunter; edge-case) An empty `bannedCharacters` entry hangs the lint (`indexOf('')` never advances), and an emptied `surfaces`/`bannedTerms` reports clean with zero coverage. Verified. Fixed by rejecting empty arrays/entries/non-single-char characters through the exit-2 path; eight suite cases added.
  - `[low]` `[reject]` (blind-hunter; verification-gap) Nothing asserts the CI step exists. Consistent with Story 1.4's `grain:check` step, and `npm test` runs the real gate via `CLEAN_TREE`; not worth a workflow-parsing test.
  - `[low]` `[patch]` (blind-hunter; edge-case; intent-alignment) `npm run verify` omits the claims gate though the story's AC names it. Verified. Fixed by adding `claims:check` to `verify`.
  - `[low]` `[reject]` (blind-hunter) `allowedPhrases` is global, not surface-scoped. Verify: the one entry is a sentence, and its only effect is to permit `Nothing here is proof.` wherever it appears; a per-surface scope is a policy the rulings table does not state. Documented; the entry's `ruling` is asserted.
  - `[low]` `[patch]` (blind-hunter) A fabricated allowlist citation passes (`ruling` need only contain `B.4`). Fixed by asserting the ruling names a real §B.4 row.
  - `[low]` `[reject]` (blind-hunter) The config carries no per-term citation. The `$comment` names §B.2; per-term citations are traceability nicety, not a defect.
  - `[low]` `[reject]` (blind-hunter) The banned list omits `measure`/`measurement`/units beyond `metres`/`meters`. Refutation: the AC's list is §B.2's closed set; `measure`/`measurement` cannot be banned because the entertainment line *is* `…Not a measurement.` and the About notice disclaims with `measure`; non-`%` measurement claims are AD-15's structural domain (Stories 1.3–1.4), not this lint.
  - `[low]` `[patch]` (blind-hunter) The Jest marketing scan used patterns the lint did not, so copy surfaced as an opaque Jest failure. Fixed: the patterns moved into the config and the test reads them.
  - `[medium]` `[patch]` (blind-hunter; edge-case) The notice lists Camera and Location but the binary declares only Motion/Microphone (and iOS would abort on camera/location use). Verified. Fixed by adding `NSCameraUsageDescription`/`NSLocationWhenInUseUsageDescription` and the Android CAMERA/LOCATION permissions, and binding the notice's rows to the declared purpose strings in a suite case.
  - `[low]` `[patch]` (blind-hunter) §B.5's SENSORS USED section is absent from the notice table. Fixed by adding the section (derived from the sensor rows) and an assertion.
  - `[low]` `[patch]` (blind-hunter) The entertainment line is stored on the notice but placed in no section. Fixed by placing the imported constant in `WHAT THIS IS`.
  - `[low]` `[reject]` (blind-hunter) JSON property names count as strings. Harmless — property keys are never shipped copy, and no key contains a banned token.
  - `[low]` `[reject]` (blind-hunter) The clean-path summary prints unique paths, not declared surfaces. Cosmetic reporting; no named harm.
  - `[low]` `[reject]` (blind-hunter) A missing `shippedCharacterScope` entry exits 2 and `src/features/.gitkeep` becomes a build dependency. The strict exit-2 is the deliberate "never a silent pass" direction and is documented in the lint's header; the `.gitkeep` matches the repo's existing `src/db/repositories/.gitkeep` convention.
  - `[low]` `[reject]` (blind-hunter) Ledger state (`sprint-status` vs spec status) and RE-1 bundling five blind spots. A transient artifact state the finalize step reconciles; the five blind spots are recorded as one owned item with five named bullets, and each is explicit.
  - `[medium]` `[patch]` (edge-case; blind-hunter) Dedupe drops cross-file violations — same root as the dedupe row above; fixed with it.
  - `[medium]` `[patch]` (edge-case) An emptied config reports clean with zero coverage / an empty banned character hangs — same root as the config-validation row above; fixed with it.
  - `[low]` `[reject]` (edge-case) A broken symlink or unreadable directory in the scope exits 1 with a stack trace. A dev-only state reachable only by adding a broken symlink; the fix adds a guard for state not demonstrated in the tree.
  - `[medium]` `[patch]` (edge-case) JSX text child copy invisible — same root as the JSX row above; fixed with it.
  - `[false]` `[reject]` (edge-case) A banned term outside the declared surface paths passes. Same refutation as the declared-set row above: AD-16 makes the set the coverage.
  - `[medium]` `[patch]` (edge-case) Inflected forms pass — same root as the inflection row above; fixed with it.
  - `[medium]` `[patch]` (edge-case) The notice's sensor list exceeds the native declarations — same root as the sensor-binding row above; fixed with it.
  - `[low]` `[patch]` (edge-case) The `%` scope vs "anywhere" claim — same root as the README-narrowing row above; fixed with it.
  - `[low]` `[reject]` (edge-case; verification-gap) The entertainment line is retyped in `assets/store/listing.json`. Refutation: the store listing is a *data* surface that cannot import a constant, and AD-16's "never a retyped literal" governs code; a suite case pins the description's first sentence to `ENTERTAINMENT_LINE` exactly.
  - `[medium]` `[patch]` (edge-case) Coverage enumerates one directory — same root as the coverage row above; fixed with it.
  - `[low]` `[patch]` (edge-case; intent-alignment) `verify` omits `claims:check` — same root as the verify row above; fixed with it.
  - `[medium]` `[patch]` (verification-gap, pre-verified) The term boundary (declared set only) is unverified and overclaimed. Filed disposition `patch`; the code is AD-16-correct (same refutation as the false row above), so the fix is the wording narrowing, applied in P11, plus the coverage/kind assertions.
  - `[medium]` `[patch]` (verification-gap, pre-verified) The extractor boundary for `.tsx`/JSX text is unpinned. Filed disposition `patch`; fixed by extracting JSX text and adding the `.tsx` probe.
  - `[low]` `[reject]` (verification-gap) `HoldButton.tsx:84` ships `'Press and hold to confirm'` with no lint hit. The word is an innocent UI verb, not a real-world claim, and is outside the declared set by design — in scope it would be a false positive.
  - `[low]` `[defer]` (verification-gap) fastlane runs `deliver(skip_metadata: true, skip_screenshots: true)`, so nothing forces the submitted listing to match `assets/store/listing.json`. Pre-existing fastlane configuration, not caused by this change; the store-submission review is recorded as RE-2.
  - `[low]` `[reject]` (verification-gap) The entertainment-line retype — same refutation as the edge-case row above.
  - `[low]` `[reject]` (verification-gap) The CI step is unasserted — same as the CI row above; consistent with the repo's existing gate-step convention.
  - `[low]` `[patch]` (verification-gap) `approvedMarketTerms` never read — same root as the approved-terms row above; fixed with it.
  - `[low]` `[reject]` (intent-alignment, descriptive) The intent names three stories and this run resolves one (1.5); 1.6/1.7 remain `backlog`. Intended: one story per run; the intent's remaining work is not omitted, it is next.
  - `[low]` `[reject]` (intent-alignment, descriptive) The About notice is authored in 1.5 while the epic assigns its content to 1.7. The spec's Design Notes license it; 1.5 must own the surface for its own AC's set to be real, and 1.7 renders it.
  - `[medium]` `[patch]` (intent-alignment, descriptive) No assertion ties a `kind` to its carrier file. Fixed by the kind→carrier assertion added with the coverage broadening.
  - `[medium]` `[patch]` (intent-alignment, descriptive) The `%` ban's "anywhere" is implemented as roots-minus-exclusion. Fixed by narrowing the claim and recording the exclusion (RE-3) — same root as the `%`-scope row above.
  - `[low]` `[reject]` (intent-alignment, descriptive) The native change is at the declaration surface while zero-permission playability is a runtime expectation. The runtime behaviour is Stories 1.6 (onboarding) and Epic 4 (tools); this story declares the strings the binary reads.
  - `[low]` `[patch]` (intent-alignment, descriptive) The gate is placed in CI only, not `verify`. Fixed by adding `claims:check` to `verify`.
  - `[low]` `[reject]` (intent-alignment, descriptive) The store rating is a stored literal with the derivation in the test. The rating is store metadata that must be submitted as a string, and the suite re-derives it from the recorded inputs and asserts equality, which is the AC's "derived, not asserted".

**Routing.** No `intent_gap` (the captured intent settles every reading: the ACs name the behaviours, and the fixes are localized to the lint/config/tests, not to the frozen intent). No `bad_spec`: every survivor's smallest fix is a direct correction that adds no public surface and guards no state not demonstrated — the declared-set scoping, the AD-17-shaped extractor and the whole-word matcher were spec-directed but the spec's *shape* survives; the amendments are data/test/doc corrections, not re-derivations. Twenty-eight entries triaged `patch` (16 `medium`, 12 `low`), 21 `reject`, 1 `defer`. All patches applied and re-verified on the settled tree.

## Design Notes

**Why an allowlist, and why it is not a loophole.** The banned list (addendum §B.2) and the *ratified safe forms* (addendum §B.4) contradict each other on their face: §B.2 bans `proof`, while §B.4 row 27 ratifies `Nothing here is proof.` as the approved Camera-tool copy, and the epic's own frame is "nothing here is proof". A flat substring ban would therefore reject copy the requirements themselves require, which is how a gate gets switched off. So matching is whole-word and subtracts an enumerated `allowedPhrases` list — and every entry in that list cites the rulings row that ratified it. The list holds the ratified forms that still contain a banned token; `Unconfirmed`/`Unsigned`/`No match on file` need no entry because whole-word matching already leaves them alone. The same reasoning re-authors §B.5's "A NOTE ON SCIENCE" heading: §B.2 bans `science` flatly, so the notice disclaims without shipping the token.

**The set is the coverage.** AD-16 requires the check to run over a declared list rather than a glob, and makes *the coverage itself* the thing asserted. So the coverage test both (a) asserts the required minimum kinds are present and (b) enumerates the string tables that actually exist and fails if any is absent from the set — which is what makes "a new string table cannot be added without appearing in the set" true rather than aspirational.

## Verification

**Commands:**
- `npm run claims:check` -- expected: exit 0 over the committed surfaces
- `npm test` -- expected: both Jest projects green, including the new claims suite
- `npm run typecheck` -- expected: exit 0 under the four strictness flags
- `npm run lint` -- expected: exit 0
- `npm run bundle` -- expected: `expo export --platform ios` exits 0
- Probe: add a banned term to a copy of a surface via `--config` -- expected: exit 1 with the term, the file and the line
- Probe: add a `%` to a shipped string, run the check -- expected: exit 1 naming the character and location

**Manual checks (if no CLI):**
- `docs/review-items.md` names the five AD-16 blind spots and the NFR-20 store-metadata review, each with an owner status, and states the lint does not automate them.
- No shipped string contains `%`; the entertainment line is imported, never retyped; the wrong variant is absent.

## Auto Run Result

Story 1.5 ships the claims boundary: an enumerated string-surface set plus the small content primitives that make the set real, a build-failing lint over that set, and a test suite that asserts the set's coverage so the gate cannot be quietly narrowed. One review pass; 28 findings patched in place, no loopback.

**Files changed**
- `src/data/strings/{entertainment,aboutNotice,index}.ts` (new) — the one exported `ENTERTAINMENT_LINE` constant (`An investigation experience. Not a measurement.`), the About notice table (WHAT THIS IS / WHAT IT DOES / SENSORS USED / WHAT WE NEVER DO / A NOTE ON WHAT THIS IS NOT / SAFETY, with the entertainment line placed in `WHAT THIS IS` and the sensor inventory each marked `Only while in use.`), and the barrel for the `src/data/strings/**` UI-string-table surface. The §B.5 heading "A NOTE ON SCIENCE" is re-authored as "A NOTE ON WHAT THIS IS NOT" because §B.2 bans the token `science` flatly; `WHAT IT DOES` carries the §B.4 row-27 safe form `Nothing here is proof.`, which the lint's `allowedPhrases` carves out.
- `assets/store/listing.json` (new) — `NightTrace` / `Paranormal field journal` / `Entertainment`, a description whose first sentence is the entertainment line, `ratingInputs` (the recorded questionnaire answers) with the `12+/Teen` rating derived from them, and five screenshot captions.
- `app.config.ts` (modified) — `ios.infoPlist` purpose strings `NSMotionUsageDescription`/`NSMicrophoneUsageDescription`/`NSCameraUsageDescription`/`NSLocationWhenInUseUsageDescription` and `android.permissions` `RECORD_AUDIO`/`ACTIVITY_RECOGNITION`/`CAMERA`/`ACCESS_FINE_LOCATION`, so the declared native surfaces cover the notice's sensor inventory. The highest-risk shipped strings, named by AD-16. Declared, not requested.
- `scripts/claims/config.json` (new) — `{ bannedTerms, allowedPhrases, bannedCharacters, bannedPatterns, approvedMarketTerms, surfaces, shippedCharacterScope }`: the §B.2 closed list (minus `%`, which is `bannedCharacters`) plus the inflected forms FR-33's classes name, the §B.4-ratified `allowedPhrases` with its citation, the §B.3 approved terms (a writer's reference), the `bannedPatterns` for statistics/social proof/awards and fake telemetry, the nine-entry enumerated surface set, and the shipped-source scope for the `%` ban. Not itself a surface.
- `scripts/claims-lint.mjs` (new) — reads the config, extracts string literals (`StringLiteral` + template halves + `JSXText` children, comments skipped) with the TypeScript parser, matches whole-word/case-insensitive banned terms minus `allowedPhrases`, the `bannedPatterns`, and the banned characters, and exits 1 printing the term, the file and the 1-based line; exit 2 on an unreadable, malformed, emptied (zero-coverage) config or a declared surface not on disk. `--config <path>` for tests.
- `src/config/__tests__/claims.test.ts` (new) — 44 cases: the constant's exact value, its single-literal-sited-in-shipped-source property, the wrong variant's absence, the surface set's coverage (required minimum kinds + every file under the declared copy roots + no globs), a kind→carrier assertion, the closed lists, the notice's placement/sensor-binding cases, the JSX-text boundary, the config-validation exit-2s, the CLI's I/O-matrix rows, and the store/app-config facts with the rating re-derived from the inputs.
- `src/features/.gitkeep` (new) — makes the declared `src/features` scope root exist (matching `src/db/repositories/.gitkeep`).
- `package.json`, `.github/workflows/ci.yml`, `README.md`, `docs/review-items.md` — the `claims:check` script (now inside `verify`), the CI step (the gate leaves the "later stories" comment), the Gates documentation with the narrowed coverage claim, and the five AD-16 blind spots + NFR-20 store review + the `%`-scope exclusion as owned release items.

**Deliberate design decisions.** The `%` character check runs over the declared set plus `shippedCharacterScope`, which enumerates the source roots that author copy and excludes `src/ui/theme/**` — a style-value module whose one `%` is the Seal's SVG filter-region extent (`'-10%'`, `'120%'`), pinned as "the only `%`-bearing surface" by Story 1.4's `no-measurement` suite and barred from change by this story's constraints; that exclusion is recorded as release item RE-3. Terms match whole-word, which is what leaves `Unconfirmed`/`Unsigned`/`No match on file` clean without an entry. Banned terms are matched only over the declared set (AD-16's rule: a surface not on the set is not covered) — widening them to all of `src/**` would false-positive on `HoldButton.tsx`'s innocent UI verb `'Press and hold to confirm'`; a bare-digit statistic rule would false-positive on AD-15's permitted counts and elapsed time, so that rule is scoped to the store surfaces.

**Review findings breakdown.** 50 findings (0 high, 18 medium, 30 low, 2 false) into 28 `patch` entries, 21 `reject`, 1 `defer`. No `intent_gap` and no `bad_spec`. The patches closed real holes the first cut shipped: inflected banned forms (`detects`, `detection`, `scientifically`) passed; JSX text copy was invisible to the extractor; a violation was dropped by the dedupe key; an emptied config reported clean with zero coverage and an empty banned character could hang CI; `npm run verify` did not run the claims gate; the notice's sensor inventory exceeded the declared native strings; and the statistic/telemetry prohibitions lived only in a test. Rejections are recorded in the `## Review Triage Log` (the largest: the declared-set term scope, which AD-16 makes the coverage) and the one defer is the pre-existing fastlane `skip_metadata` gap, carried as RE-2.

**Follow-up review recommendation:** `true` — a first pass that patched 16 `medium` entries, so the patched `medium` count is ≥ 2. The specific unverified risk: the two behavioural widenings cannot be proved against the tree (no shipped string yet contains an inflected banned form or a JSX-text percentage), so they are asserted only through synthetic fixtures; a later story authoring such copy is the real test.

**Verification performed** (on the settled tree): `npm run typecheck` exit 0; `npm run lint` exit 0; `npm test` — 26 suites, 403 tests green across both Jest projects; `npm run verify` (now typecheck + lint + test + `claims:check`) exit 0; `npm run claims:check` exit 0 (`clean — 5 surfaces, 25 files, 521 strings checked`); `npm run bundle` — `expo export --platform ios` exit 0; `APP_VARIANT=production npx expo config --type introspect` resolves all four purpose strings and four permissions; the banned-term probe exits 1 naming term + file + line, the `%` probe exits 1 naming the character + location, the JSX-text probe exits 1, the ratified-safe-form probe exits 0, and a missing/malformed/emptied config exits 2.

**Residual risks.** Term matching is whole-word over a config list, so a novel inflection not yet listed (`detections` is, `counterproof` is not) passes — the list is data and widening it is a config change. The `%` scope is an enumerated root list, so a new top-level `src/` directory that authors copy must be added to `shippedCharacterScope` (the coverage test pins the current roots but cannot see a directory that does not yet exist; the omission is recorded as RE-3). Banned terms are checked only over the declared set; component-authored copy (an accessibility label, an empty-state action) is out of scope by AD-16's own rule and would false-positive on innocent UI verbs. The lint parses strings only; the five AD-16 blind spots and the NFR-20 store review are human release items in `docs/review-items.md`, and this story does not automate them.
