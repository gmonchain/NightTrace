---
title: 'Story 1.8 — The four-tab shell exists and holds exactly four tabs'
type: 'feature'
created: '2026-10-09'
status: 'done'
baseline_revision: '5beb68466ebdcf3aea3c283c16d48d1e1e06e326'
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

**Problem:** The app has no shell. `/` renders Story 1.7's placeholder home and the `(tabs)` group holds one Profile screen with no tab bar, so the four-tab IA of AD-29 — HOME · INVESTIGATE · FIELD JOURNAL · PROFILE — does not exist, and none of the rest of the screen tree is declared. Every later epic draws surfaces against an IA that has to exist first.

**Approach:** Land the four-tab shell — a `(tabs)` layout rendering the design's `TabBar` over exactly four tab routes — and *declare* the rest of the IA as placeholder routes with their presentation rules, the five navigation invariants, and the anti-pattern checklist. This story builds the shell and the declarations, not the screens.

## Boundaries & Constraints

**Always:** Exactly four tabs, asserted by a test as exactly HOME · INVESTIGATE · FIELD JOURNAL · PROFILE; no Equipment tab, no Settings tab. The shell renders the existing `TabBar` primitive and reads its labels from its `TAB_IDS` — the labels are never re-authored. Onboarding (4 screens), the four tabs, the Hunt pair (`HUNT BRIEF`, `SESSION SHELL`), the seven tool routes, the Case trio (`CASE REPORT`, `SHARE CARD`, `EVIDENCE DETAIL`), the fourteen sheets and `FIELD NOTE` all exist as declared routes. Hunt and Session live **outside** `(tabs)` so the tab bar is absent there; the Case Report is a destination (a pushed screen), not a modal; tools push above the session, one full-screen surface at a time. The five navigation invariants are recorded as testable statements, and the anti-pattern exclusions as a review checklist (a document), never a lint. The app stays offline end to end: no network call of any kind.

**Never:** No screen beyond the shell is built — every other route is a placeholder with no behaviour. No fifth tab; no Equipment or Settings tab. Do not re-implement or re-word `TabBar`, and do not author new shipped copy (placeholder routes render route names, not product copy). Do not add a network dependency or any egress. Do not change Story 1.1–1.7 behaviour beyond the gate's home branch and adding the `(tabs)` shell.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| TAB_LIST | the shell mounted | exactly four tabs, labelled HOME · INVESTIGATE · FIELD JOURNAL · PROFILE, in order | Test asserts |
| TAB_SELECT | a tap on a non-active tab | that tab's route becomes active; re-tapping the active tab is a no-op | No error expected |
| TREE_DECLARED | the declared route tree | a placeholder route exists for every named surface | Test asserts each path exists |
| TAB_BAR_ABSENT | navigation to a Hunt or Session route | no tab bar is rendered there | Test asserts |
| NO_NETWORK | the `src/**` source tree | no fetch / XHR / WebSocket / axios / network call exists | Test asserts |
| HOME_REDIRECT | an acknowledged, complete install at `/` | redirected to the HOME tab | No error expected |

</intent-contract>

## Code Map

Epic context: `_bmad-output/implementation-artifacts/epic-1-context.md` (valid). Continuity from `spec-1-7-about-notice.md` (the Profile screen, the `(tabs)` group, the route-test harness) and `spec-1-6-onboarding-frame.md` (the gate at `/`, the four onboarding routes). Sources: `EXPERIENCE.md:33-100` (the four tabs, the screen tree, the presentation table, the five invariants) and `EXPERIENCE.md:414-420` (the anti-patterns); `DESIGN.md` (TabBar); `ARCHITECTURE-SPINE.md` AD-29 and the Structural Seed (`:321-361`), AD-12, AD-21.

- `src/app/(tabs)/_layout.tsx` -- CREATE. The shell: `Tabs` from `expo-router` with a `tabBar` render prop returning the design's `TabBar`; four `Tabs.Screen` (home, investigate, journal, profile), `headerShown: false`.
- `src/app/(tabs)/home.tsx`, `investigate.tsx`, `journal.tsx` -- CREATE. The three missing tab placeholders (`profile.tsx` exists, unchanged).
- `src/app/index.tsx` -- MODIFY. The gate's `home` branch becomes `<Redirect href="/home" />`; the placeholder home and its temporary Profile link go.
- `src/features/shell/RoutePlaceholder.tsx` -- CREATE. One shared placeholder surface rendering the route's declared name (no product copy).
- `src/features/shell/navigation.ts` -- CREATE. The declaration: `TAB_ROUTES` (TabId → route), `ROUTE_TREE` (each surface: name, path, presentation), `TAB_LABELS` read from `TabBar`'s `TAB_IDS`, and `NAVIGATION_INVARIANTS` (the five, as statements).
- `src/app/hunt/[huntId]/brief.tsx`, `src/app/session/_layout.tsx` + `src/app/session/index.tsx`, `src/app/session/tools/{emf,radar,voice,evp,camera,tracker,sky}.tsx`, `src/app/case/[caseId]/{index,share}.tsx`, `src/app/case/[caseId]/evidence/[evidenceId].tsx`, `src/app/field-note/index.tsx` -- CREATE. Placeholder routes on `RoutePlaceholder`; the layouts encode tab-bar-absent / push-above-session / destination-not-modal.
- `src/app/(modals)/` -- CREATE 13 sheet placeholders (`intensity`, `low-power`, `permissions`, `triage`, `confirm`, `leave-the-field`, `low-battery`, `directive`, `anomaly`, `field-note-editor`, `clearance`, `delete-my-data`, `discard-case`); `about` exists.
- `docs/anti-patterns.md` -- CREATE. The exclusions recorded as a review checklist, explicitly not a lint.
- Tests: `src/app/__tests__/shell*.test.tsx`, `src/features/shell/__tests__/*`, plus a no-network source scan.

## Tasks & Acceptance

**Execution:**
- [x] `src/features/shell/navigation.ts` -- declare `TAB_ROUTES`, `ROUTE_TREE`, `TAB_LABELS`, `NAVIGATION_INVARIANTS` -- the one source the shell and tests read.
- [x] `src/features/shell/RoutePlaceholder.tsx` -- the shared placeholder surface -- keeps every declared route a three-line file.
- [x] `src/app/(tabs)/_layout.tsx` + `home.tsx`/`investigate.tsx`/`journal.tsx` -- the shell over the four tab routes -- the AC's four-tab list.
- [x] `src/app/index.tsx` -- the gate redirects a complete install to `/home` -- replaces 1.7's placeholder.
- [x] the Hunt/Session/tool/Case/field-note placeholder routes -- the declared tree -- every named surface must exist.
- [x] the 13 `(modals)` sheet placeholders -- the fourteen sheets -- the sheet group's declared set.
- [x] `docs/anti-patterns.md` -- the review checklist -- recorded, not linted.
- [x] the test suites -- one case per matrix row -- the ACs are proved, not asserted.

**Acceptance Criteria:**
- Given the route tree, when the tab routes are listed, then a test asserts the list is exactly HOME · INVESTIGATE · FIELD JOURNAL · PROFILE, with no Equipment and no Settings tab.
- Given the screen tree, when it is declared, then a placeholder route exists for onboarding (4), the four tabs, the Hunt pair, the seven tools, the Case trio, the fourteen sheets and FIELD NOTE, and each carries its presentation rule.
- Given the presentation rules, when encoded, then Hunt and Session render without the tab bar, the Case Report is a destination (not a modal), and tools push above the session one surface at a time.
- Given the five navigation invariants, when recorded, then each is a testable statement a later epic can assert.
- Given the app, when the shell is complete, then no network call of any kind exists in the codebase and it runs in airplane mode.
- Given `npm run verify` and `npm run bundle`, then typecheck, lint, both Jest projects, the claims lint and the iOS export all pass.

## Implementation Notes

Implemented on the `full` route. Shell, declaration, placeholders, docs and tests land together; verification green on the settled tree.

**Deviation — the Permissions sheet file is `permissions-sheet.tsx`, not `permissions.tsx`.** Story 1.6's onboarding screen 4 already owns `/permissions`; a plain `(modals)/permissions.tsx` makes expo-router resolve `/permissions` to the sheet, shadowing onboarding (proved with a temporary probe). The sheet's declared **name stays `PERMISSIONS`** and the fourteen-sheet set is unchanged — only the file/route is disambiguated (`/permissions-sheet`). Every other sheet keeps the spec's name.

**Deviation — `jest.config.js` gets `testTimeout: 60000` on the `ui` project.** The new route suites render the whole `src/app` tree through `renderRouter`; the first render in a worker can exceed Jest's 5s default under parallel load. A genuine hang still fails, later.

**Removed as dead once the gate redirected:** `PROFILE_COPY.homeLinkLabel`, the placeholder home in `src/app/index.tsx`, and `src/app/__tests__/home.test.tsx` (it tested that placeholder).

**Decisions.** `navigation.ts` carries the whole tree as data (537 lines) so the shell and the suites read one declaration; `RoutePlaceholder` reads a route's declared name from it, so a placeholder authors no product copy. `Tabs` (expo-router's bundled bottom-tabs) takes the design's `TabBar` as its `tabBar` render prop; Hunt/Session are siblings of `(tabs)`, so the tab bar is structurally absent there. The route-collision risk was proven empirically against the real tree, not assumed.

## Spec Change Log

## Review Triage Log

### 2026-10-09 — Review pass 1

- verdicts: 35 findings — high 0, medium 13, low 21, false 1, maybe-false 0
- lenses: blind-hunter (19), edge-case-hunter (5), verification-gap (2 + 2 other), intent-alignment (7, descriptive). All four ran; none died.
- findings:
  - `[medium]` `[patch]` (blind-hunter; edge-case; verification-gap) `jest.config.js` set `testTimeout` inside the `ui` project entry, where Jest 29 silently drops it (`testTimeout` is a *global* option) — so the ceiling the change relies on was not in force and the new route suites stayed liable to the 5s default under load (verification-gap ran a 6.5s probe: failed at 5000ms). Fixed: hoisted `testTimeout: 60000` to the config root.
  - `[medium]` `[patch]` (blind-hunter; edge-case; verification-gap; intent-alignment) The shell's four `Tabs.Screen` names were hardcoded and untied to the declaration, so they could drift; `tabForRoute` fell back silently to HOME; and nothing asserted the active-tab binding (mutating `activeTab="HOME"` shipped green; verification-gap proved it by mutation). Fixed: the `Tabs.Screen` list is derived from `TAB_ROUTE_NAMES`, and `shellSelect.test.tsx` asserts INV/HOME `accessibilityState`.
  - `[medium]` `[patch]` (blind-hunter; edge-case; intent-alignment) The no-network scan matched a short fixed list (fetch/XHR/WebSocket/axios/sendBeacon/EventSource/node http) while claiming "no network call of any kind". Fixed: added patterns for HTTP client libraries (ky/got/undici/node-fetch/superagent/netinfo) and node `net`/`tls`/`dgram`/`http2`.
  - `[medium]` `[patch]` (blind-hunter) The five invariants were asserted by brittle substrings (`'report'` etc.). Fixed: `navigation.test.ts` pins the exact id→statement map.
  - `[medium]` `[patch]` (edge-case) Same root as the timeout row — reported as the verification claim that `--selectProjects ui` fails at 5s. Fixed with it.
  - `[low]` `[patch]` (edge-case; verification-gap) Three files still cited the deleted `src/app/__tests__/home.test.tsx` as the origin of the one-press-test-per-file convention (`about.test.tsx` ×2, `aboutDeepLink.test.tsx`, `shellSelect.test.tsx`). Fixed: retargeted to `index.test.tsx`.
  - `[low]` `[patch]` (blind-hunter) `NON_PLACEHOLDER_IDS` was duplicated verbatim in three suites. Fixed: exported `REAL_SCREEN_IDS` from `navigation.ts`; the three suites import it.
  - `[low]` `[patch]` (blind-hunter) `ROUTE_TREE` re-authored the four tab labels (`name: 'HOME'` …), a second copy of the `TAB_IDS` vocabulary. Fixed: tab entries are derived from `TAB_IDS`/`TAB_ROUTES` (`TAB_ENTRIES`).
  - `[low]` `[patch]` (blind-hunter) `TabBarVisibility`'s three states were tested as `not 'visible'`, conflating `hidden`/`absent`. Fixed: per-group exact assertions.
  - `[low]` `[patch]` (blind-hunter) `routeEntry`'s "throw is unreachable" was unenforced. Fixed: a compile-time `Assert<RouteKey extends DeclaredRouteKey>` guard fails `tsc` on a missing key.
  - `[false]` `[reject]` (blind-hunter) "Story 1.7's Profile→About reachability is now untested." Refutation: `about.test.tsx` still drives Profile→About OPEN/CLOSE over the real route tree (`initialUrl: '/profile'`); only the removed *placeholder-home link* test was deleted, and that link no longer exists.
  - `[low]` `[reject]` (blind-hunter) "Spec Change Log is empty." The Change Log is for `bad_spec` loopbacks; run deviations belong in Implementation Notes, where they are recorded. Fix would edit the spec.
  - `[low]` `[reject]` (blind-hunter) Code Map says `permissions` while the file is `permissions-sheet`. Fix would edit the spec; the deviation is documented in the file header and Implementation Notes.
  - `[low]` `[reject]` (blind-hunter) "AC #2 misstates `about` as a placeholder." The intent-contract is frozen; the fourteen sheets exist (13 placeholders + the existing About), and the tests correctly exclude About from placeholders.
  - `[low]` `[reject]` (blind-hunter) "Airplane-mode is only checked statically." A clean-install/airplane-mode run is a device matter outside this story; the automatable part (no network API in shipped source) is the scan.
  - `[low]` `[reject]` (blind-hunter) `TREE_DECLARED` asserts `file` existence, not that `path` resolves. `path` has no consumer; expo-router resolution cannot be asserted without a navigation, and the companion "no undeclared route file" case covers drift.
  - `[low]` `[reject]` (blind-hunter) The anti-patterns checklist cannot record a clean pass. Cosmetic — a review records defects; an unticked list is the expected clean state.
  - `[low]` `[reject]` (blind-hunter) `docs/anti-patterns.md` paraphrases the design source while saying "do not re-author it". Wording only; the recorded items are the source's own exclusions.
  - `[low]` `[reject]` (blind-hunter) No verification evidence in the spec's Verification section. Recorded in Auto Run Result; the section lists commands by design.
  - `[low]` `[reject]` (blind-hunter) `warnings: ['oversized']` unaddressed. A routine warning (spec-1.7 carried it); the Implementation Notes name the 537-line declaration as the cause.
  - `[low]` `[reject]` (verification-gap, observation) `ROUTE_TREE[].path` is the one declared field no test cross-checks. Same as the `file`/`path` row above — `path` has no consumer.
  - `[low]` `[reject]` (intent-alignment, descriptive) Presentation rules are recorded as inert data; the structural encodings pre-date the story. The declaration reading is licensed by the intent ("declares the routes and their presentation rules; it does not build the screens").
  - `[low]` `[reject]` (intent-alignment, descriptive) The swipe-back→`Leave the field` rule is not represented. Its guarantee is recorded as invariant #2 ("no path ends a session without offering SEAL & FILE") and the `leave-the-field` sheet is declared; the gesture itself is a screen behaviour the intent excludes.
  - `[low]` `[reject]` (intent-alignment, descriptive) The five invariants are prose, not executable predicates. The AC asks they be "recorded as testable conditions" — id+statement does that, now pinned by exact text.
  - `[low]` `[reject]` (intent-alignment, descriptive) `standalone`/`immersive`/tab-placeholders collapse to labels rather than distinct navigators. The declaration reading; Field Note is a root-stack mode with an `absent` bar.
  - `[low]` `[reject]` (intent-alignment, descriptive) The anti-pattern artifact over-includes items beyond the verbatim list. The extras are the design source's own related exclusions, recorded in the same checklist.
- **Routing.** No `intent_gap` and no `bad_spec`: every survivor's smallest fix is localized (a config hoist, derived route names, a test assertion, added patterns) and adds no new screen. Nine `patch` groups cover 18 findings (13 `medium`, 5 `low`) — several groups fold in the same root cause from more than one lens; 16 `low` `reject` and 1 `false`, none `defer`. All patches applied and re-verified on the settled tree (`npm run verify` 43 suites / 601 tests, claims clean; `npm run bundle` exit 0).

## Design Notes

**HOME is `/home`, not `/`.** `/` is Story 1.6's first-launch gate; the gate owns the root path, so the HOME tab lives at `/home` and the gate's `home` branch redirects to it. Expo Router forbids two routes resolving to `/`, and moving the gate into the root layout would break the rule that the root layout always renders its navigator.

**The tab bar is a `Tabs` render prop, not a hand-rolled bar.** `expo-router`'s `Tabs` (its bundled bottom-tabs) provides the four tab routes and real navigation; passing the design's `TabBar` as `tabBar` keeps the shell's look while the router owns the state. Hunt and Session are siblings of `(tabs)`, so the tab bar is structurally absent there — "hidden during Brief and Session" needs no per-screen conditional.

## Verification

**Commands:**
- `npm run verify` -- expected: typecheck, lint, both Jest projects and `claims:check` exit 0
- `npm run bundle` -- expected: `expo export --platform ios` exits 0 with the new routes resolving
- Probe: add a fifth entry to `TAB_IDS`/`TAB_ROUTES` -- expected: the tab-list test, the `RouteKey` exhaustiveness guard, and the route-tree test all fail

**Manual checks (if no CLI):**
- The shell shows exactly four tabs; a Hunt or Session route shows no tab bar.
- `docs/anti-patterns.md` carries the full exclusion list and states it is not a lint.

## Auto Run Result

Story 1.8 lands the four-tab shell and declares the whole IA. The `(tabs)` group renders the design's `TabBar` over exactly four tab routes (`HOME · INVESTIGATE · FIELD JOURNAL · PROFILE`, derived from `TabBar`'s own `TAB_IDS`); every other surface in the `EXPERIENCE.md` screen tree — the Hunt pair, the seven tools, the Case trio, `FIELD NOTE` and the fourteen sheets — exists as a declared placeholder route carrying its presentation rule, and the five navigation invariants plus the anti-pattern checklist are recorded. No screen beyond the shell is built. The gate's `home` branch now redirects to the HOME tab at `/home` (`/` is the gate's own path).

**Files changed**
- `src/app/(tabs)/_layout.tsx` (new) — the shell: expo-router `Tabs` with the design `TabBar` as its `tabBar` render prop; the four `Tabs.Screen` are derived from `TAB_ROUTE_NAMES`.
- `src/app/(tabs)/home.tsx`, `investigate.tsx`, `journal.tsx` (new) — the three missing tab placeholders (`profile.tsx` untouched).
- `src/app/index.tsx` (modified) — the gate redirects a complete install to `/home`; the placeholder home and its temporary Profile link are gone.
- `src/features/shell/navigation.ts` (new) — the declaration: `TAB_ROUTES`, `TAB_ENTRIES` (derived), `ROUTE_TREE`, `TAB_LABELS`, `REAL_SCREEN_IDS`, `NAVIGATION_INVARIANTS`, and a compile-time `RouteKey` exhaustiveness guard.
- `src/features/shell/RoutePlaceholder.tsx` (new) — the one shared placeholder surface; every declared route is a thin wrapper on it.
- `src/app/hunt/[huntId]/brief.tsx`, `src/app/session/_layout.tsx` + `session/index.tsx`, `src/app/session/tools/{camera,emf,evp,radar,sky,tracker,voice}.tsx`, `src/app/case/[caseId]/{index,share}.tsx` + `case/[caseId]/evidence/[evidenceId].tsx`, `src/app/field-note/index.tsx` (new) — the declared Hunt/tool/Case/standalone placeholders.
- `src/app/(modals)/{intensity,low-power,permissions-sheet,triage,confirm,leave-the-field,low-battery,directive,anomaly,field-note-editor,clearance,delete-my-data,discard-case}.tsx` (new) — the 13 new sheet placeholders (with the existing `about`, the fourteen sheets). `permissions-sheet` is named apart from Story 1.6's onboarding `/permissions` (see Implementation Notes).
- `docs/anti-patterns.md` (new) — the exclusion list as a review checklist, explicitly not a lint.
- `jest.config.js` (modified) — `testTimeout: 60000` at the config root (patched from the project entry, which Jest drops).
- `src/data/strings/profile.ts` (modified) — dead `homeLinkLabel` removed.
- `src/app/__tests__/index.test.tsx` (modified) + `src/app/__tests__/home.test.tsx` (deleted) — the gate's case now asserts the redirect to `/home`; the placeholder-home test is removed with the placeholder.
- Tests (new): `src/app/__tests__/{shell,shellSelect,shellTabBar}.test.tsx` and `src/features/shell/__tests__/{navigation,routeTree,RoutePlaceholder,no-network}.*`.
- `_bmad-output/implementation-artifacts/spec-1-8-four-tab-shell.md` (new) — this spec.

**Review findings breakdown.** 35 findings (0 high, 13 medium, 21 low, 1 false) across four lenses into 9 `patch` groups covering 18 findings (4 medium groups: the dropped `testTimeout`; the untied/untested shell tab binding; the narrow no-network scan; the brittle invariant assertions), 16 `low` reject, 1 `false` reject, none `defer`. The load-bearing patch: `testTimeout` was set where Jest ignores it — so the ceiling the change documented as fixing route-suite flakiness did not exist (verification-gap ran a 6.5s probe and watched it fail at 5000ms). Also fixed: the shell's route list was a second source of truth for the tab names (now derived) and its active-tab binding was unobserved (a wrong `activeTab` shipped green); the invariant statements were asserted by substring; and three suites cited a deleted test file.

**Follow-up review recommendation:** `true` — a first pass that patched two or more `medium` entries. The specific unverified risk: the `Tabs.Screen` list is now produced by `.map` over `TAB_ROUTE_NAMES` rather than written literally, and whether expo-router registers mapped `Tabs.Screen` children identically is verified only by the rendered shell suites and the iOS export — not on a device.

**Verification performed** (on the settled, patched tree): `npm run typecheck` exit 0; `npm run lint` exit 0; `npm test` — 43 suites, 601 tests green across both Jest projects; `npm run claims:check` exit 0 (`clean — 7 surfaces, 77 files, 1028 strings checked`); `npm run bundle` — `expo export --platform ios` exit 0 with the new routes resolving.

**Residual risks.** The tab bar is the design's `TabBar` inside expo-router's bundled bottom-tabs; on-device presentation (bar height, the safe-area inset, the mapped-screen registration) is verified by renders and the export, not a device. The placeholder tree is declared, not built — Epic 2+ replaces each placeholder. `permissions-sheet`/`/permissions-sheet` is a naming workaround for Story 1.6's `/permissions`; a later story that owns the sheets may want to revisit the collision.
