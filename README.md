# NightTrace

Paranormal field journal. An investigation experience — not a measurement.

This repository is a from-scratch Expo project. There is **no starter template**:
`ARCHITECTURE-SPINE.md` specifies none, and every non-application file here was
authored deliberately (see `_bmad-output/planning-artifacts/architecture/`).

## Requirements

- **Node ≥ 22.13** (pinned in `package.json` `engines`).
- **Xcode 26.4+** for iOS (the App Store requires an iOS 26 SDK build), with a
  physical device or simulator.
- **Android Studio / Android SDK** with **compile & target SDK 36**, for a
  physical device or emulator.
- A physical is what the acceptance criteria check; the app also runs in a
  simulator/emulator.

## Bootstrap

```sh
git clone <repo-url> nighttrace
cd nighttrace
npm ci
```

`ios/` and `android/` are **not** committed. They are generated from
`app.config.ts` by Continuous Native Generation (CNG) and are gitignored:

```sh
npx expo prebuild          # or: npm run prebuild
```

Then run on a device. A development build is required — **Expo Go is not a
delivery target**, because the app's permission strings and manifest options are
config-plugin values baked into the binary:

```sh
npx expo run:ios --device
npx expo run:android --device
```

## Build profiles

`APP_VARIANT` selects the profile; the profiles differ **only** in bundle/package
id suffix and display name — there is no environment with different runtime
behaviour, because the app has no backend and makes no network call.

| `APP_VARIANT` | Display name         | Bundle / package id       |
| ------------- | -------------------- | ------------------------- |
| `dev` (default) | NightTrace Dev     | `com.nighttrace.app.dev`  |
| `preview`     | NightTrace Preview   | `com.nighttrace.app.preview` |
| `production`  | NightTrace           | `com.nighttrace.app`      |

```sh
APP_VARIANT=preview npx expo prebuild --clean
```

## Verifying

```sh
npm run verify     # typecheck + lint + test + claims — the same entrypoint CI runs
npm run bundle     # expo export --platform ios — proves the route tree bundles
```

Individually:

```sh
npm run typecheck  # tsc --noEmit; strict + noUncheckedIndexedAccess + exactOptionalPropertyTypes + noImplicitOverride
npm run lint       # ESLint boundary rules (AD-1 four-layer table, AD-12 SQL & route containment, AD-17 raw values, AD-30 console)
npm test           # both Vitest projects: `engine` on the node environment, `ui` on vitest-expo
npm run claims:check  # the claims lint (AD-16) over the declared string-surface set
npm run bundle     # iOS export; fails on a route under src/app/** that cannot resolve
```

`bundle` is not redundant with `test`: expo-router scans `src/app/**` with
`require.context`, so a file under that tree importing a module which does not
exist fails the export while every unit test stays green. Nothing may sit under
`src/app/**` except real routes — boundary fixtures live under
`src/engine/__boundary_fixtures__/` or are linted through `lintText` against a
synthetic `src/app/**` filename.

## Where things live

| Path | What it is |
| --- | --- |
| `app.config.ts` | the only source of native config truth; CNG generates from it |
| `src/app/` | Expo Router routes — the IA, as typed routes (Story 1.8 declares the four tabs) |
| `src/engine/` | the **pure** functional core — no React, no Expo, no clock, no RNG (AD-1) |
| `src/db/` | SQLite client, mappers, repositories, and the typed `kv.ts` settings wrapper |
| `src/db/repositories/` | the only place SQL string literals may exist (AD-12) |
| `src/services/` | orchestration; `Logger.ts` is the only module that logs, `IdFactory.ts` the only id producer |
| `src/util/result.ts` | `Result<T, E>` for recoverable paths; `invariant()` for programmer error |
| `fastlane/` | signing and store submission, at the repo root — never inside the generated native projects |

## Signing and stores

Builds run locally; fastlane owns signing and store submission for both
platforms (AD-23). EAS is not in the path. No certificate, provisioning profile,
keystore or fastlane credential is committed — supply identity through the
environment (see `fastlane/Appfile`). Release is manual and reversible; version
and build-number stamping is fastlane's (AD-30).

The iOS scheme and the default app identifier are **derived from `APP_VARIANT`**
through the same three-profile table `app.config.ts` uses (`fastlane/Variant.rb`),
so a display-name change cannot leave the lane targeting a nonexistent scheme,
and an unset variant cannot sign a dev binary under the production identity. The
`sign` and `submit` lanes therefore **fail loudly when `APP_VARIANT` is unset**:

```sh
APP_VARIANT=production bundle exec fastlane ios sign
APP_VARIANT=production bundle exec fastlane android submit   # builds, then uploads
```

The Android `submit` lane composes `sign` (which runs `gradle`) before
`upload_to_play_store`, because the Play upload reads the AAB path that only a
`gradle` action in the same run populates.

## Verification status

`npm run verify` is green (249 tests across 18 suites, 2 projects) and
`npm run bundle` exits 0. On a machine with no physical device attached, the
device-install acceptance criterion is substituted as follows (see the story's
Implementation Notes): `npx expo export --platform ios` bundles, `npx expo
prebuild --platform android --no-install` generates `android/` with
`compileSdkVersion=36`/`targetSdkVersion=36`, and `npx expo config --type public
--json` resolves all four `APP_VARIANT` values. A successful simulator launch is
stronger than a bundle export but is still not a physical device; native
signing-identity setup is fastlane's and is not reachable from this repository's
config.

## Gates

`.github/workflows/ci.yml` runs `npm run verify`, and that entrypoint is where
the gates run: the token-sync test (AD-17) is a `ui`-project Vitest suite, so
`npm test` runs it; the AD-17 raw-value lint is defined in `eslint.config.js`
and run by `npm run lint`; and Story 1.5's claims lint
(`npm run claims:check`, AD-16 / NFR-18) is the last link of the `verify` chain.
Two further gates are appended to `ci.yml` as their own steps by the stories that
built them — Story 1.4's grain-reproducibility check (`npm run grain:check`) and
Story 2.2's golden-seed replay (`npm run golden:seed`, AD-3) — and the claims
lint runs there once more, over the committed tree. Gates belonging to later
stories — content validation and aliases (AD-9, AD-18) and migration idempotency
(AD-22) — are appended the same way.

**The claims lint (AD-16 / NFR-18).** No shipped sentence may assert anything
about the real world. `npm run claims:check` reads the declared, enumerated
string-surface set in `scripts/claims/config.json` — the UI string tables, the
iOS `Info.plist` purpose strings, the Android manifest permission strings, the
store title, subtitle and description, the screenshot captions and the About
notice — and fails with exit 1 printing the token, the file and the line when a
banned term from addendum §B.2, a banned statistic/social-proof/fake-telemetry
pattern, or the `%` character appears. **Coverage is the declared set, not the
app binary (AD-16): a string on a file that is not a declared surface is not
covered.** The `%` ban additionally covers the enumerated
`shippedCharacterScope`; that scope deliberately excludes `src/ui/theme/**`,
whose only `%` is the Seal's SVG filter-region value (recorded as a
release-review item in `docs/review-items.md`). Matching is whole-word/phrase and
case-insensitive, minus the enumerated `allowedPhrases` list of §B.4-ratified
safe forms (row 27's `Nothing here is proof.` is the only one). The entertainment
line is one exported constant (`src/data/strings/entertainment.ts`) that every
surface imports. `src/config/__tests__/claims.test.ts` asserts the set's
coverage, so a new string table cannot be added without appearing in the set;
`approvedMarketTerms` is the §B.3 vocabulary marketing may use — a writer's
reference, not a blocklist.

**What the claims lint cannot see.** It parses strings and nothing else: images,
mechanics, juxtaposition, visual hierarchy, and the sum of individually-safe
sentences are structurally out of its reach. Those five AD-16 blind spots, and
NFR-20's store-metadata review against App Store guidelines 2.3.1/2.3.7, are
release-review items in `docs/review-items.md` — a passing build is evidence
about strings and nothing else.

**The AD-17 raw-value lint.** A component reads tokens from
`src/ui/theme/tokens.ts` and never hard-codes a raw value. The rule fires on a
raw hex colour (6- or 8-digit; the 3-digit `#rgb` form is excluded because
`DESIGN.md` never writes one and it collides with case references), a raw `px`/`pt`
dimension, and a literal millisecond duration — *including* a value embedded in a
compound string (`'1px solid #0B140E'`, `'8px 12px'`, `'translateY(8px)'`). A hex
counts when it stands at the start of a literal or after a value delimiter (`=`,
`:`, `,`, `(`, `[`, `{`, `;`); a hex preceded only by an ordinary word and a space
is left alone, so a hex-only compound with no `px`/`pt` beside it (`'0 0 0 #0B140E'`)
is not caught — the compound forms above are caught by their dimension. A
second-form second duration (`'5s'` at the start of a literal) is rejected, but a
**space-preceded** second (`'animation: 5s'`, `'breathe 5s'`) is deliberately
clean, because it is lexically indistinguishable from a decade (`'the 1950s'`).
The rule rides in the shared Shell block, so it reaches `src/services/**`
(including `src/services/Logger.ts`), `src/features/**`, `src/store/**` and
`src/ui/**` — and exempts `__tests__` files under those four directories plus the
token module `src/ui/theme/tokens.ts`.

Two release items a lint cannot check — the colour-alone rule (AD-28/UX-DR25) and
the two open questions on the 9.5px floor and the `safelight` hue — are recorded
in `docs/review-items.md`, which a release reader should work through.
