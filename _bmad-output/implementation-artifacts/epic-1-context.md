# Epic 1 Context: Nothing here is proof

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

The user can install NightTrace, understand its frame on four onboarding screens, acknowledge the entertainment notice, and find that notice again any time from Profile. Every screen they will ever reach already speaks the product's visual language, and the build itself refuses to ship a sentence that asserts anything about the real world.

This epic is first and deliberately standalone: the claims lint and the acknowledgement gate must exist before any later epic authors its first string, or five epics ship copy no gate has ever checked. It also lands the design system — tokens, type ramp, spacing, motion, radius, the no-shadow rule, and the core components — so later epics compose rather than improvise.

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

**Onboarding and consent.** Exactly four screens — nothing here is proof; the case is local; the user chooses their night; permissions are asked only when needed. Progress shows position (four hairlines), never a percentage or fraction, and the flow requests no permission and triggers no sensor. The entertainment notice is non-skippable on first launch and must be acknowledged, the acknowledgement being a device-local setting rather than a domain row. The notice stays permanently reachable from Profile, travels with any data export, and carries the ratified safety content (photosensitivity from the glitch channel, sudden audio, that the app is designed to startle) — which lives in the About notice, not the onboarding path.

**No real-world assertion, enforced at build.** No sentence in the app, its metadata, screenshots, or share output may assert anything about the real world. A build-failing lint rejects the banned-term classes — detection/proof, confirmation/verification, authenticity, science, thermal/radiation, accuracy, algorithm/AI, factual "haunted", metres as contact distance, and the `%` character anywhere — across a declared, enumerated string-surface set (never a glob of the binary) at minimum the UI string tables, iOS `Info.plist` purpose strings, Android manifest permission strings, store title and description, screenshot captions, and the About notice; the set's contents are themselves asserted by a test. App name `NightTrace`, subtitle `Paranormal field journal`, category Entertainment, rating 12+/Teen derived from stated questionnaire inputs, approved market terms a closed named list. The entertainment line is one exported constant, exactly `An investigation experience. Not a measurement.`, with the wrong variant `Nothing here is a measurement.` asserted absent; no statistic, social proof, award, or user count appears in marketing copy. The lint cannot see images, mechanics, or juxtapositions; those blind spots are release-review items with a zero-leak target, not automated checks.

**Accessibility and permissions.** Screen readers must fully navigate the Case Report and Field Journal, and hidden internal scalars are never announced. Dynamic Type to 200% (intensity rail and tool row capped at 140%), body clamping and scrolling at the largest sizes. Reduce Motion replaces transitions with cross-fades and disables the glitch channel. No target below 44pt; contrast is a floor on the token set; no information is conveyed by colour alone; portrait-locked except Camera and Sky. The app is playable with zero permissions granted, requested just in time with an in-the-moment reason.

**Offline and store.** No backend, account, sign-in, server, or network call of any kind; the app installs and runs in airplane mode from a clean install. Store floors: build against the iOS 26 SDK, Android compile/target SDK 36.

## Technical Decisions

**Scaffold.** Story 1.1 is a from-scratch scaffold — no starter template. Stack: `expo@57.0.26` (SDK 57; SDK 58 is beta and not adopted), React Native 0.86.3, React 19.2.3, Node ≥ 22.13, `expo-router` 57.0.24 with typed routes under `src/app`.

**Functional core / imperative shell.** `src/engine/**` is a pure TypeScript function at the bottom of a four-layer import table (Core / Input adaptation / Content / Shell) whose arrows point only downward. It may import only `engine/**` and dependency-free TS — no React, React Native, Expo, or Zustand, and no wall clock, `Math.random()`, or I/O of any kind. Enforced by ESLint `no-restricted-imports` and `no-restricted-globals`. SQL string literals may exist only under `src/db/repositories/**`; routes own no SQL and no engine calls. Model conventions: branded id types, `readonly` fields, discriminated unions tagged `kind` with exhaustive `switch` and `default: never`, absence as `null`, never `undefined`, no `any` and no `as` outside mappers and validator output. `IdFactory` is the sole id producer; `Result<T, E>` and `invariant()` are the error shapes.

**Build, config, logging.** Native projects are CNG-generated from `app.config.ts` and gitignored — `app.config.ts` is the only source of native config truth. Builds run locally; fastlane owns signing and store submission and sits at the repo root, never inside generated `ios/` or `android/`; no signing material is committed. `expo-dev-client` with dev/preview/production profiles is mandatory; Expo Go is not a delivery target and EAS is not in the path. Settings live in `expo-sqlite/kv-store` behind a typed `db/kv.ts` wrapper — there is no settings table. `src/services/Logger.ts` is the only module that logs, and its logs never contain evidence content, coordinates, or free text.

**CI as the enforcement locus.** One committed CI configuration is the only place gates are declared blocking; it runs both Jest projects, the ESLint boundary rules, the token-sync test, the claims lint, the content-validation and alias tests, migration idempotency, and the golden-seed replay. TypeScript enables `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride` — all CI-blocking. Two Jest projects: `engine` on the node preset (possible only because the engine is pure) and `ui` on jest-expo with testing-library.

**Design tokens have two sources.** `DESIGN.md`'s YAML frontmatter is the design source; `src/ui/theme/tokens.ts` is the code source; a CI test asserts they agree on every token name and value, asserts the set is complete, and asserts there is no light theme. Components never hard-code a raw hex, px dimension, or literal duration outside `src/ui/theme/**`. The route tree is the IA: exactly four tabs, the tab bar hidden entirely during Brief and Session, tools pushing above a session full-screen one at a time, the Case Report a destination rather than a modal.

## UX & Interaction Patterns

**Design system.** Fourteen colour tokens; `safelight` is reserved without exception for recorded moments and never decorative or brand. Typography splits two ways: serif (Newsreader, never above weight 500) for what a person would write, mono (never below the 9.5px floor) for what the machine records. A small radius scale (2px default; no control is a capsule) and named spacing/motion tokens. **There are no shadows** — depth is a tone step plus a `rule` hairline, with the camera vignette the one lens-artefact exception; the page is ruled, not boxed. The rate ceiling is a product rule: nothing moves faster than the 5s field breath except a haptic, with the 2s signature-tile pulse the single deliberate exception.

**Core components.** `Rule`/`rule-soft` hairlines; `Seal` (ink-stamped ring, only `UNEXPLAINED` coloured); `StatCell` (counts and elapsed time only); `SignatureStrip` (unidentified slot a slowly pulsing `?`, never accelerated); `LedgerRow`; `Chip` (state marker, never a coloured fill or icon); `HoldButton` (its fill is the only progress indicator and indicates a gesture, never a quantity); `Sheet`; `TabBar` with exactly one badge product-wide; `FieldView`; `GrainOverlay` (fixed opacity, never animates); `EvidenceCard`/capture card. No primitive anywhere accepts or renders a percentage, axis, degree, unit, distance, bearing in degrees, or raw signal strength — adding one requires deleting a test, not adding a prop.

**Voice and tone.** Every visible string never asserts, never winks, never explains the mechanic, hedges as craft, runs nine words maximum on a line, and narrates silence rather than leaving it empty. "Ghost" appears only as a Hunt name. Unencountered phenomena are absent, not locked: no locked rows, silhouettes, padlocks, unlock copy, progress ladders, or tier badges anywhere; empty states carry exactly one action; loading uses skeleton rows, never a spinner.

## Cross-Story Dependencies

- Story 1.1 is the scaffold every other story depends on; its ESLint/tsconfig/Jest/kv/`Result`/`Logger`/`IdFactory` foundations are inherited, not reintroduced.
- Stories 1.3 and 1.4 (components) build on Story 1.2's tokens and its token-sync test.
- Story 1.5's claims lint is CI-blocking from 1.1 onward; Stories 1.6 and 1.7 author strings that must satisfy it, and Story 1.7's About notice is itself a member of the linted surface set.
- Story 1.8 declares the full screen tree and presentation rules as placeholders later epics fill in; it does not build the screens.
- Epic 1 stands alone, but later epics inherit its gates; Epic 6's export story carries a named obligation from Story 1.7 to include the entertainment notice in exported data.
