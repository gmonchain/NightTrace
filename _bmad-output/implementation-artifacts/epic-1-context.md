# Epic 1 Context: Nothing here is proof

<!-- Generated from planning artifacts. Regenerate with compile-epic-context if planning docs change. -->

## Goal

This epic lays the foundation every later epic composes on: a from-scratch scaffold that builds to real devices with its enforcement guardrails already wired, the full design system (colour, type, spacing, motion, radius, the no-shadow rule, and the core components), and the two gates that must exist *before anyone authors a shipped string* — the build-failing claims lint (no shipped sentence may assert anything about the real world) and the entertainment-notice acknowledgement. Retrofitting either after several epics of copy exist would mean auditing every string already written. It also lands four onboarding screens, the About notice with its safety content, and the four-tab shell, so later epics inherit the product's visual and structural language rather than improvising it.

## Stories

- Story 1.1: The app installs and runs on a real device, with the guardrails already wired
- Story 1.2: The design tokens exist and a test proves they match the design document
- Story 1.3: The document components render the product's typographic language
- Story 1.4: The interaction components gate gestures and never indicate a quantity
- Story 1.5: The build refuses to ship a sentence that asserts anything about the real world
- Story 1.6: A first-time user learns the frame before their first Session
- Story 1.7: The notice stays reachable and travels with the user's data
- Story 1.8: The four-tab shell exists and holds exactly four tabs

## Requirements & Constraints

- **First-run frame.** Four onboarding screens teach the app's frame (nothing here is proof; the case is local; the user chooses their night; permissions are asked only when needed). The entertainment notice is non-skippable on first launch and must be acknowledged before the app is usable; it stays permanently reachable from Profile and must be included in any data export. The safety content for a horror-adjacent app — photosensitivity from the glitch channel's effects, sudden audio, and that the app is designed to startle — lives in the About notice, not the onboarding path.
- **No real-world assertion.** No shipped sentence — in the app, its metadata, its screenshots, or its share output — may assert anything about the real world. A build-failing lint rejects proof/detection, confirmation/verification, authenticity, scientific, thermal/radiation, accuracy, and algorithm/AI language, and bans the `%` character in any shipped string. It must run over a **declared, enumerated string-surface set** (UI string tables; iOS `Info.plist` purpose strings, especially motion and microphone; Android manifest permission strings; store description and title; screenshot captions; the About notice) — not a glob of the app binary — and the set's coverage is itself asserted by a test.
- **Market and store facts.** Approved vocabulary is limited to: paranormal, ghost hunt, cryptid, investigator, field journal, EMF, EVP, spooky, adventure, night. Name is NightTrace; subtitle "Paranormal field journal"; category Entertainment; rating 12+/Teen derived from recorded questionnaire inputs, not asserted. No statistic, social proof, award, or user count appears in marketing copy; no fake telemetry or progress-scanning language anywhere. Store floors are pinned in config: iOS built against the iOS 26 SDK, Android compile/target SDK 36.
- **Enforcement is CI's job.** One committed pipeline is the sole place these gates are declared blocking: both Jest projects, the ESLint boundary rules, the token-sync test, the claims lint, the content-validation/alias tests, migration idempotency, and the golden-seed replay. TypeScript runs `strict` plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, and `noImplicitOverride`. The CI provider itself is deferred.
- **Lint blind spots.** The lint parses strings only — it cannot see images, mechanics, juxtaposition, visual hierarchy, or the sum of individually-safe sentences. Those five are named manual release-review items; a passing build is evidence about strings and nothing else.
- **Zero-permission playability.** Every screen in this epic must render with no permissions granted, and nothing is requested before it is needed.
- **Two build-failing design rules.** The entertainment line is one exact string — `An investigation experience. Not a measurement.` — held as a single exported constant and never retyped (the wrong variant `Nothing here is a measurement.` must never ship). No `%` appears anywhere in the rendered product, including accessibility labels and any debug string that ships.

## Technical Decisions

- From-scratch scaffold (no starter template) on Expo SDK 57 (`expo@57.0.26`), React Native 0.86.3, React 19.2.3, Node ≥ 22.13. Story 1.1 is the scaffold.
- Functional core / imperative shell: a four-layer import table (Core / Input adaptation / Content / Shell) enforced by ESLint, arrows only downward, `src/engine/**` at the bottom importing only pure TS. Lint also bans wall-clock/global-random calls inside the engine, confines SQL string literals to the repository layer, and bans `console.*` outside the logger.
- Model conventions: branded ids (never a bare `string`), every field `readonly`, variant sets as discriminated unions tagged `kind` with exhaustive `switch` and `default: never`, absence spelled `null` never `undefined`, and no `any`/`as` outside mappers and validator output.
- Shared primitives landed now and imported by every later epic: `Result<T, E>` plus `invariant()`; a single logger whose logs never carry evidence, coordinates, or free text; and a single id factory producing opaque strings branded at compile time.
- Settings live in `expo-sqlite/kv-store` behind a typed `db/kv.ts` wrapper — there is no settings table. The notice acknowledgement is a device-local setting here, not a domain row.
- Native projects are CNG-generated from `app.config.ts` and gitignored (config is the only native-config source of truth); builds run locally; fastlane owns signing and submission for both platforms and sits at the repo root, never inside generated `ios/`/`android/`; `expo-dev-client` dev/preview/production profiles are mandatory; EAS is not in the path and Expo Go is not a delivery target; signing material never enters the repo.
- Theme tokens have two sources kept in sync by a CI test: the design document's frontmatter (design source) and `src/ui/theme/tokens.ts` (code source). The test asserts every token name and value agree, the set is complete, and there is no light theme. Components read tokens; raw values are lint-failed.
- Testing is two Jest projects — engine (node preset, possible only because of engine purity) and ui (jest-expo with testing-library) — plus the CI tests above.
- No backend, no account, and no network call of any kind: the app installs and runs end-to-end in airplane mode from a clean install.

## UX & Interaction Patterns

- Typed design tokens: a 14-colour dark-only palette; a type ramp with a serif for anything a person writes and a mono for anything the machine records (no third family, no serif weight above 500, no mono below the agreed floor); a named spacing scale; motion durations with a rate ceiling (nothing moves faster than the 5s field breath except a haptic and one deliberate 2s pulse); a radius scale with no capsules; and the no-shadow rule — depth is one tone step plus a hairline, with the camera vignette the only exception. `safelight` is reserved strictly for recorded moments.
- Core components: `Rule`; the ink-stamped `Seal`; `StatCell` (four-up on report/journal, three-up on the share card, absent on Profile, never a percentage or unit); `SignatureStrip` (slot count read from the case; fixed 8 in the archive); `LedgerRow`; `Chip`; `HoldButton`; `Sheet`; `TabBar` (exactly one badge exists in the product: a dot on the journal when a case is unsealed); `FieldView`; `GrainOverlay` (a fixed token, never raised); and the `EvidenceCard`/capture card. No primitive renders a percentage, axis, degree, unit, distance, or raw signal strength.
- Holds, not taps, gate anything initiating or irreversible (`HOLD TO ENTER THE FIELD` ~800 ms; `SEAL & FILE` ~600 ms); a safelight fill is the only progress indicator and indicates a gesture, never a quantity.
- Copy reads as a field log by a careful, detached observer: never assert, never wink, never explain the mechanic, hedge as craft, nine words maximum per line, silence narrated rather than blank, and "ghost" only ever as a hunt name.
- IA is exactly four tabs — HOME · INVESTIGATE · FIELD JOURNAL · PROFILE — with no Equipment tab (tools live in a live session) and no Settings tab (settings live in Profile); a test asserts the list. Tabs are persistent but hidden entirely during Brief and Session; the Case Report is a destination, not a modal; sheets never stack two deep except Triage over a session.
- Navigation invariants (each a bug if violated): a live session is never more than one gesture from its tools; no path ends a session without offering `SEAL & FILE`; the report is always reachable from the journal and at session end; no dead ends — every empty state carries exactly one action; intensity is locked during a case.
- Onboarding is exactly four screens with four hairlines as the position indicator (never a percentage or fraction), requests no permission, and resumes where it left off if backgrounded.
- Never produce: Halloween styling, cartoon ghosts, cobwebs, dripping fonts, neon/cyberpunk glow, dense sci-fi HUDs, fake EMF dials with LED readouts, pulsing radar sweeps, skeuomorphic paper, wax seals, trophy walls, progress bars, streak counters, leaderboards, or any comparison between users.

## Cross-Story Dependencies

- Story 1.1 is the base for all others: it provides the type/lint/test/CI/native-config guardrails, the `db/kv.ts` settings wrapper, and the shared primitives every later epic imports.
- The design system builds in order — 1.2 (tokens) → 1.3 (document components) → 1.4 (interaction components) — and Stories 1.6 and 1.8 render against those tokens and components.
- Story 1.5 (claims lint) needs 1.1's CI/lint infrastructure and 1.7's About notice declared in its enumerated string-surface set. Story 1.6 stores the acknowledgement through 1.1's `db/kv.ts`; Story 1.7 renders 1.6's notice content and adds it to 1.5's lint set.
- Cross-epic: the claims lint (1.5) and the token-sync test (1.2) must exist before Epic 2 authors its first string or draws a surface. Story 1.7 records a named obligation on Epic 6 that any data export must include the entertainment notice. The claims lint governs every shipped string in all later epics.
