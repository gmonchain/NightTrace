# Currency / Evidence Review — Architecture Spine, NightTrace

- **Target:** `ARCHITECTURE-SPINE.md` (created 2026-10-05)
- **Reviewer lens:** currency and evidence — every claim *asserted* rather than *verified*, plus anything that could be out of date.
- **Method:** live sources only (docs.expo.dev, developer.android.com, developer.apple.com, Google Fonts / npm registry, the react-native-view-shot README, Metro/Expo source). Stack **version numbers** were already verified on 2026-10-05 and are treated as settled — they are not re-checked here.
- **Reviewed:** 2026-10-05.

## Verdict

The spine is unusually well-sourced for a draft, and most behaviour claims check out against the current docs. **Two claims are wrong or misapplied and should be fixed** (the G2 Sub-CA store requirement, and the "Expo Router requires kebab-case" rule). Several more are correct but stated as flat fact with no source and one embedded caveat omitted. No claim is dangerous. The fonts and PRNG are real and appropriate.

## Verdict table

| # | Claim (spine) | Verdict |
|---|---|---|
| F1 | "Apple requires a **G2 Sub-CA** intermediate for new certificates" (AD-23) | **WRONG — misapplied** |
| F2 | "`kebab-case.tsx` for a route file (Expo Router requirement)" | **FALSE as stated** |
| F3 | "`expo-camera` requires a dev build for real testing" (AD-23) | **Reason false; conclusion survives** |
| F4 | "Android 12+ caps sensor delivery at 200Hz" (AD-13) | **CONFIRMED, but missing the escape hatch** |
| F5 | "`react-native-view-shot captureRef` … not bit-reproducible" | **CONFIRMED (source exists)** |
| F6 | "only one camera preview may exist at a time" | **CONFIRMED** |
| F7 | "`expo-sqlite` WAL recommended" | **CONFIRMED** |
| F8 | PRNG: "our own xmur3 → sfc32 implementation" | **CONFIRMED — real, correct** |
| F9 | Font: `Newsreader` named as the serif | **CONFIRMED — real, OFL-1.1, in Expo** |
| F10 | Store floors: iOS 26 SDK since 2026-04-28; Play target API 36 | **CONFIRMED** |
| F11 | "App Store 1.1.6 — 'for entertainment purposes' won't overcome this guideline" (AD-16 Note) | **CONFIRMED verbatim** |
| F12 | `expo-audio useAudioStream` PCM; `expo-file-system` File/Directory/Paths; `expo-media-library Asset.create`; `expo-sqlite/kv-store` | **CONFIRMED** |

## Findings — wrong, risky, or misapplied

### F1 — WRONG: the G2 Sub-CA requirement does not apply to App Store submission

**Spine, AD-23:** "Store requirements tracked with this rule: Apple requires an **iOS 26 SDK build since 2026-04-28** and a **G2 Sub-CA** intermediate for new certificates."

The iOS-26-SDK half is correct. The **G2 Sub-CA** half is a misapplication. Apple's notice — "Upcoming expiration of Developer ID Certification Authority (Sub-CA)" (developer.apple.com/news, dated 2026-10-01) — is scoped entirely to **Developer ID certificates**, which sign **Mac apps distributed outside the Mac App Store** and `.pkg` installers. Both quoted paragraphs name only Developer ID, Mac apps, and `.pkg` notarization; neither mentions iOS or App Store Connect.

- Affected authority: *Developer ID Certification Authority (Sub-CA)*, expires 2027-02-01; replacement from *Developer ID Certification Authority (G2)*, valid to 2031.
- The CA that signs **Apple Distribution** certificates (the ones an iOS App Store submission uses) is the **Apple Worldwide Developer Relations** CA via the WWDR intermediate (the post-2021-01-28 intermediate, valid to 2030-02-20) — a different chain entirely.

**Correction:** For an iOS + Android app submitting to the App Store, G2 Sub-CA is irrelevant. Either drop the sentence, or restate it as a Mac-distribution note if a macOS build is ever added. The correct iOS distribution chain is the WWDR intermediate. Fix in AD-23 before it is copied into a build checklist and sends someone hunting a certificate they do not need.

- https://developer.apple.com/news/ (Developer ID Sub-CA expiration, 2026-10-01)
- https://developer.apple.com/help/account/certificates/certificates-overview/

### F2 — FALSE as stated: Expo Router does not require kebab-case

**Spine, Consistency Conventions:** "`kebab-case.tsx` for a route file (Expo Router requirement)."

No such requirement exists. Expo Router's notation docs describe route derivation from filenames (static names, `[param]`, `(group)`, `index`, `_layout`, `+`-prefixed specials) and never mandate letter case. Their own examples use **camelCase** parameters (`[userName].tsx`, `[productId].tsx`). Kebab-case is a perfectly good house convention — but it is *the project's* convention, not a framework constraint, and the parenthetical asserts a platform rule that a builder will treat as unbreakable.

**Correction:** Change "(Expo Router requirement)" to "(house convention)". If mixed casing is genuinely undesirable, that belongs in a lint rule, not a false claim of platform enforcement.

- https://docs.expo.dev/router/basics/notation/

### F3 — Reason false, conclusion survives: expo-camera *is* in Expo Go

**Spine, AD-23:** "Expo Go is not a delivery target: `expo-camera` requires a dev build for real testing, so `expo-dev-client` … is mandatory."

`expo-camera` is **Included in Expo Go**, and `CameraView` (preview, torch, `takePictureAsync`, permission hooks) works there. A dev build is required only for **config-plugin options** that must be baked into the binary: custom `cameraPermission` / `microphonePermission` strings, `recordAudioAndroid`, and `barcodeScannerEnabled`.

NightTrace still needs a dev build — and for a *better* reason than the one stated: AD-16 requires the iOS `Info.plist` purpose strings (called "highest-risk") and the Android manifest strings, and those are config-plugin values that cannot be set at runtime. So the mandate is right; the stated cause is not.

**Correction:** Replace the reason with "expo-camera's permission strings and manifest options are config-plugin values that require a rebuilt binary" — that is both true and consistent with AD-16.

- https://docs.expo.dev/versions/latest/sdk/camera/

### F4 — CONFIRMED but incomplete: the 200 Hz sensor cap has a named escape hatch

**Spine, AD-13:** "Android 12+ caps sensor delivery at 200 Hz" (also stated in the memlog).

Confirmed: Android 12 (API 31)+ limits `registerListener()` to **200 Hz** for the accelerometer, gyroscope, and geomagnetic sensors, and `SensorDirectChannel` to `RATE_NORMAL` (~50 Hz) — stated as "true for all overloaded variants", so `SENSOR_DELAY_FASTEST` cannot exceed it. The spine's *design* consequence (a quantized digest at tick rate is plenty) is unaffected.

What the spine omits: the cap is conditionally liftable. Declaring `android.permission.HIGH_SAMPLING_RATE_SENSORS` raises the limit, and **expo-sensors' own docs say exactly this** — add `HIGH_SAMPLING_RATE_SENSORS` to `android.permissions` (or the manifest) to go above 200 Hz. Two further caveats the spine never reaches: without the permission a >200 Hz request raises `SecurityException`, and if the user disables microphone access the sensors are **always** rate-limited regardless of the permission.

This is low-risk for a design that deliberately doesn't need raw rate — but the fact as written reads as a physical ceiling when it is a default a permission can change. Worth one clause so no future tool author "discovers" the cap as a bug.

- https://developer.android.com/develop/sensors-and-location/sensors/sensors_overview
- https://docs.expo.dev/versions/latest/sdk/sensors/

## Findings — confirmed (with the source that was missing)

### F5 — view-shot: the non-determinism claim is real and documented
The spine's "rasterises a native view tree and is not bit-reproducible" is not just unsourced — the library states it: **"Snapshots are not guaranteed to be pixel perfect. It also depends on the platform."** `captureRef` is the documented low-level imperative API resolving to an image URI; "rasterize" is the library's own word for the `ViewShot` children. The PRD (§4.7, A-9) already turns this into the correct requirement — *perceptual*, not byte, identity. CONFIRMED; consider citing the README sentence directly in the spine. https://github.com/gre/react-native-view-shot

### F6 — one camera preview at a time
Verbatim from the expo-camera docs: **"Only one Camera preview can be active at any given time."** The same section adds the multi-screen guidance the spine's diagram implies — unmount `Camera` components when a screen is unfocused. CONFIRMED.

### F7 — WAL
expo-sqlite docs tip: "Enable WAL journal mode when you create a new database to improve performance in general." CONFIRMED. (Note: `withExclusiveTransactionAsync`, which AD-11/AD-9 rely on, is not supported on **web** — irrelevant to a native-only app, but the doc says so.)

### F8 — the PRNG: real, correct, and appropriately sized
`xmur3 → sfc32` is a genuine, standard construction from bryc's JS PRNG reference — the canonical page literally says *"Output four 32-bit hashes to provide the seed for sfc32."* sfc32 has a 128-bit (4×32-bit word) state plus a counter and is described as the best-tested JS PRNG of its class (passes PractRand, and reportedly Crush/BigCrush). Four sequential `xmur3` calls over the seed string supply exactly the four words it wants; this is the *recommended* way to seed it rather than using sfc32's own messy built-in seeding ("can reduce the effective number of input states dramatically").

Seed sizing is fine: the engine's seed parts (`seed + hunt_id + content_version + fork label`) are ample entropy for a 128-bit state, and hashing the label to a fork is exactly xmur3's stated purpose. Two honest caveats to record, neither a defect: (a) bryc calls xmur3 "not tested thoroughly" — acceptable for a simulation PRNG where adversarial predictability is irrelevant, and stronger than the alternatives the spine rejected; (b) the closed 7-label fork set is a *contract* — the same string must always produce the same stream, so labels must never be renamed after a content version ships, or replay parity breaks. That second point is an AD-3/AD-4 interaction the spine does not state. https://github.com/bryc/code/blob/master/jshash/PRNGs.md

### F9 — Newsreader is a real, available, correctly-licensed font
`Newsreader` is genuine: designed by **Production Type**, released under the **SIL Open Font License v1.1**, shipped as a **variable font** (with static builds available), covering the Google Fonts **Latin Plus** set (English, Western European, Vietnamese, 130+ languages). It is directly usable in Expo: **`@expo-google-fonts/newsreader`** exists on npm (v0.4.1, published 2025-09-09, licence "MIT AND OFL-1.1"), bundling 14 styles — weights 200–800 plus italics — so `npx expo install @expo-google-fonts/newsreader expo-font` is the whole integration. Licence and availability present no obstacle to shipping or redistribution.

On the "subset Latin-1" strategy in the Stack row: legitimate, and worth one note — subsetting a variable font drops axes you remove, and since the product is English-only (Deferred: Localisation), a Latin-1 subset is a sensible size trade with no i18n cost today. The mono family being deferred is fine; the spine is explicit that only the serif/mono *split* is binding. No correction needed.

- https://github.com/productiontype/Newsreader
- https://registry.npmjs.org/@expo-google-fonts/newsreader

### F10 / F11 — store floors and the guidelines note
- Apple: "Starting April 28, 2026, iOS and iPadOS apps must be built with the iOS 26 & iPadOS 26 SDK or later" — matches AD-23's date. CONFIRMED.
- Google Play: new apps and updates must target **API 36** from **2026-08-31** (with an extension path to 2026-11-01). As of today (2026-10-05) this is **in effect**, so the stack's compile/target 36 pin is not merely prudent — it is required. CONFIRMED.
- AD-16's note quotes guideline 1.1.6 exactly: *"Stating that the app is 'for entertainment purposes' won't overcome this guideline."* 2.3.1(a) prohibits misleading marketing / promoting services the app does not offer; 2.3.7 prohibits metadata that would "make unverifiable product claims." The spine's reading — the disclaimer is not the defense, the design is — is accurate. CONFIRMED.

### F12 — API surface spot-checks (all confirmed against SDK 57 docs)
- `expo-audio` exports **`useAudioStream`** ("a native audio stream for real-time PCM microphone capture"), alongside `useAudioRecorder`, `useAudioPlayer`, `useAudioSampleListener`.
- `expo-file-system` v57: `import { File, Directory, Paths } from 'expo-file-system'` is the current class API; legacy function calls now throw at runtime. `Paths.document` exists and is the correct "safe from deletion" location the Media convention assumes.
- `expo-media-library`: **`Asset.create(filePath, album?)`** is the current save API; `createAssetAsync` / `saveToLibraryAsync` are deprecated and throw.
- `expo-sqlite/kv-store` exists as a drop-in AsyncStorage replacement — the Config convention ("no settings table") is buildable as written.
- `expo-sensors` documents the 200 Hz Android-12+ limit in the same terms as the spine.

One micro-note on AD-23's `metro.config.js` comment (".db asset ext preserved for the bundled catalogue seed"): `@expo/metro-config` **already appends `'db'`** to Metro's default `assetExts` for expo-sqlite, and Expo's documented path for a bundled DB is `SQLiteProvider` with `assetSource`. Preserving it in an explicit metro config is harmless, but the spine implies it must be added manually when Expo does it by default.

## Out-of-date watch list (nothing broken today)

- **Developer ID Sub-CA** stops working **2027-02-01** (Mac distribution only). If a macOS build is ever added, this becomes live — and the G2 correction above becomes the right note.
- **WWDR intermediate** expires **2030-02-20**; iOS distribution certificates are renewed annually regardless.
- **iOS 27 SDK** build requirement begins **April 2027** (announced 2026-09-09) — beyond this release's horizon.
- **Play target API 36 extension window** closes **2026-11-01**; only relevant if a later target is needed.
- **SDK 58** is beta-only at authoring; the spine correctly says do not adopt. Re-check when it goes stable.

## Bottom line

Fix **two** things before this spine binds downstream work: the **G2 Sub-CA** requirement (wrong platform — it is a Mac Developer ID concern, not an App Store one) and the **"Expo Router requires kebab-case"** parenthetical (no such requirement). Correct the **expo-camera dev-build reason** to the config-plugin/Info.plist truth so it stays consistent with AD-16, and add one clause to AD-13 acknowledging the `HIGH_SAMPLING_RATE_SENSORS` escape hatch. Everything else asserted in the spine — the PRNG construction, the font, the API surfaces, the store floors, the guideline reading — is real, current, and correctly stated.
