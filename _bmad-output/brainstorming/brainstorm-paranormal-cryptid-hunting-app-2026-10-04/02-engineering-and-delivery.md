# NightTrace — 02: Engineering & Delivery

> Companion to `01-*.md` (product/GDD pack). This document is the **implementation contract**: architecture, models, schema, backlog, and a 30-day execution schedule.
> It is written against **Expo SDK 57** (verified live, see §G.0), and it *makes decisions* rather than listing options.

## Assumptions (stated once, referenced throughout)

1. **One senior RN/Expo engineer, full-time, 30 calendar days**, targeting iOS + Android from a single codebase.
2. **Expo-managed workflow with Continuous Native Generation (CNG)** + `expo-dev-client` **development builds** (Expo Go is *not* the delivery target: SDK 57's Expo Go is not on the App Store yet, `expo-camera` needs a dev build for real testing, and the New Architecture is mandatory from SDK 55 onward).
3. **Zero custom Kotlin/Swift for MVP.** Expo Modules cover every MVP need (see §G.1, "Native modules" decision). Native code is only justified later for high-rate sampling or on-device audio feature extraction — and even then only if measured.
4. **No backend, no network calls, no cloud AI, no generative AI.** All content ships in the binary as JSON + assets; all logic is local and deterministic.
5. Art direction, screen-by-screen UI copy, full asset manifest, monetization and store-claim review live in `01-*`. This document only builds the seams they need.

---

## G. Technical architecture

### G.0 Verified toolchain baseline (checked against live Expo docs, not memory)

These are the only version/API claims in this document. Anything not in this table is either pure TypeScript we author ourselves, or explicitly flagged as "verify at install".

| Item | Verified fact | Source |
|---|---|---|
| Expo SDK | **57.0.0** is current stable; `expo@57.0.23` is the newest patch line. SDK 58 exists in the docs version selector (pre-release). New SDKs ship ~3×/year. | Expo SDK reference, SDK 57 changelog |
| React Native / React | SDK 57 → **RN 0.86**, **React 19.2.3**, React Native Web 0.21, min **Node 22.13.x** | SDK reference version table |
| OS floors | SDK 57 → **iOS 16.4+**, **Xcode 26.4+**, Android 7+ (`compileSdk`/`targetSdk` 36) | SDK reference version table |
| Architecture | **Legacy Architecture support was dropped in SDK 55**; `newArchEnabled` is gone from app.json. Everything runs on the New Architecture. | SDK 55 changelog |
| Package versioning | From SDK 55, **every Expo SDK package shares the SDK major** (e.g. `expo-camera@~57.0.x`). Pin via `npx expo install`. | SDK 55 changelog |
| Navigation | **Expo Router** is the documented recommendation for Expo projects; `expo-router` is currently `57.0.18` (SDK-aligned versioning). | Expo docs "Navigation in Expo…", npm `expo-router` |
| Project layout | The SDK 55+ default template puts app code in **`/src/app`** and uses the **Native Tabs** API. | SDK 55 changelog |
| `expo-sensors` | Current. Exposes `Accelerometer`, `Barometer`, `DeviceMotion`, `Gyroscope`, `LightSensor` (Android), `Magnetometer` + `MagnetometerUncalibrated`, `Pedometer`. `Magnetometer` gives calibrated `{x,y,z}` **in µT** plus `setUpdateInterval`, `isAvailableAsync`, `getPermissionsAsync`/`requestPermissionsAsync`, and `addListener` returning a subscription with `.remove()`. iOS motion needs `NSMotionUsageDescription` (config plugin `motionPermission`). Android 12+ caps sensor delivery at 200 Hz unless `HIGH_SAMPLING_RATE_SENSORS` is added. **`removeSubscription` is deprecated → always use `subscription.remove()`.** | `docs.expo.dev/…/sdk/sensors` |
| `expo-camera` | Current (`~57.0.6`). Modern API is **`<CameraView />`** + **`useCameraPermissions()`**; torch is the `enableTorch` prop; `takePictureAsync({ pictureRef: true })` returns a native `PictureRef`; `recordAsync`/`stopRecording` for video. **Only one camera preview may be active — unmount when the screen blurs.** `CAMERA` permission is added automatically on Android. | `docs.expo.dev/…/sdk/camera` |
| `expo-location` | Current. Foreground permission + `watchPositionAsync`. iOS now reports **accuracy authorization** (full vs reduced) in the permission response — the app must handle reduced accuracy as a first-class state. | SDK 55 changelog |
| `expo-haptics` | Current. `impactAsync(style)`, `notificationAsync(type)`, `selectionAsync()`, and on Android prefer **`performAndroidHapticsAsync(AndroidHaptics.*)`** over the `Vibrator`-based calls. iOS Taptic Engine is a **no-op when the camera is active, during dictation, in Low Power Mode, or if the user disabled haptics**. | `docs.expo.dev/…/sdk/haptics` |
| `expo-av` | **Dead.** "`expo-av` was removed from Expo Go because it has been replaced by `expo-video` and `expo-audio`. Additionally, `expo-av` is no longer receiving patches." The `/sdk/av` doc page 404s. **Do not add it.** | SDK 55 changelog / 404 on `/sdk/av` |
| `expo-audio` | Current (`~57.0.5`). `useAudioPlayer` / `createAudioPlayer`, `useAudioRecorder(RecordingPresets.*)` + `AudioModule.requestRecordingPermissionsAsync()`, `setAudioModeAsync({ playsInSilentMode, allowsRecording, interruptionMode })`, `preload()`, and — new and important for us — **`useAudioStream()`** giving real-time **PCM buffers** (`onBuffer`) for mic-level/RMS work. | `docs.expo.dev/…/sdk/audio` |
| `expo-sqlite` | Current. Async API: `openDatabaseAsync`, `execAsync`, `runAsync`, `getFirstAsync`, `getAllAsync`, `getEachAsync`, `withTransactionAsync` / `withExclusiveTransactionAsync`, prepared statements, `SQLiteProvider` + `useSQLiteContext`, `PRAGMA user_version` migration pattern, **tagged-template `db.sql`** (auto-parameterised, SDK 55+), an on-device **SQLite Inspector** devtools plugin, and **`expo-sqlite/kv-store`** as a drop-in AsyncStorage replacement *with synchronous getters*. WAL is recommended at creation. | `docs.expo.dev/…/sdk/sqlite` |
| `expo-file-system` | Current, **rewritten API**: `File`, `Directory`, `Paths` classes (`Paths.document`, `Paths.cache`), synchronous `file.write/textSync`, `file.bytes()`, streams, `File.downloadFileAsync`. **All the old free functions (`readAsStringAsync`, `documentDirectory`, …) are deprecated and throw at runtime** — legacy code must import from `expo-file-system/legacy`. | `docs.expo.dev/…/sdk/filesystem` |
| `expo-sharing` | Current (`~57.0.22`). `Sharing.shareAsync(localFileUri, { mimeType, UTI, dialogTitle, anchor })` + `isAvailableAsync()`. Also now has an experimental *incoming* share extension (not needed for MVP). | `docs.expo.dev/…/sdk/sharing` |
| `expo-keep-awake` | Current. `useKeepAwake(tag?)` hook, `activateKeepAwakeAsync`, `deactivateKeepAwake`, `isAvailableAsync`. `activateKeepAwake` (sync) is **deprecated**. | `docs.expo.dev/…/sdk/keep-awake` |
| `expo-media-library` | Current, **new object-oriented API** (`Asset`, `Album`, `Query`, `usePermissions`). The old functions (`saveToLibraryAsync`, `createAssetAsync`, …) are **deprecated and throw at runtime** — save via `await Asset.create(fileUri, album)`. | `docs.expo.dev/…/sdk/media-library` |
| `expo-brightness` | Current (`57.0.1`) — used for the dimmed low-power mode. | npm `expo-brightness`, Expo docs |
| Share-card rasterisation | `react-native-view-shot@5.1.0` is documented on Expo's own site (`/sdk/captureRef/`) with `captureRef()`; install with `npx expo install react-native-view-shot`. | `docs.expo.dev/…/sdk/captureRef` |
| Animation stack | SDK 57 bundles **react-native-reanimated 4.3–4.5**, **react-native-worklets 0.8–0.10**, **react-native-gesture-handler 2.31–2.32**. | SDK 57 changelog |

**Explicitly flagged as "verify exact version at install"**: `zustand`, `zod`, `@shopify/flash-list`, `jest-expo`, `@testing-library/react-native`. Their APIs are stable and widely used, but I am not asserting a number here.

### G.1 Package decisions (chosen, with the alternative rejected)

| Concern | **Decision** | Rejected alternative & why |
|---|---|---|
| Navigation | **Expo Router (`~57.x`, file-based, typed routes, `src/app`)** | *React Navigation 7 standalone*: it is what Router wraps, so you'd re-implement linking, typed routes, modal/sheet conventions and Native Tabs yourself. Router also gives us deep links for free, which is the future **Director Mode** transport seam and the share-card landing path. |
| Global state | **Zustand** (`sessionStore`, `sensorStore`, `settingsStore`, `uiStore`) | *Redux Toolkit*: boilerplate per tick and a heavier dev loop for a single-player local sim. *Jotai/Context*: no transactional multi-slice updates; we need "commit a case atomically across 3 slices". Zustand gives selector-level subscriptions so a 15 Hz sensor tick doesn't re-render the tree. |
| Persistence | **SQLite (`expo-sqlite`) as the only source of truth** + **`expo-sqlite/kv-store`** for tiny scalar prefs | *AsyncStorage*: redundant dependency, no queries, no migrations. *MMKV*: another native module for no gain. *WatermelonDB/Drizzle*: Drizzle is a fine later option (expo-sqlite supports it), but raw SQL + a repository layer is fewer moving parts for ~16 tables and keeps migrations explicit. |
| Audio | **`expo-audio` for everything** (playback, recording, PCM stream) | *`expo-av`*: removed from Expo Go and unpatched (§G.0). |
| Mic level / "did you speak?" | **`useAudioStream()` PCM → our own RMS + voice-activity estimator** | *`RecordingOptions.isMeteringEnabled` + `useAudioRecorderState().metering`*: simpler, but it is a polling API at ~500 ms, which is far too coarse for "the room answered you" timing. Keep metering as the fallback if `AudioStream` is unavailable on a device. |
| Files | **`expo-file-system` new `File`/`Directory`/`Paths` API**; media on disk, paths in SQLite | *base64 blobs in SQLite*: bloats the DB, kills WAL performance, and complicates export. |
| Share card | **`react-native-view-shot.captureRef()` on a themed React view, then `Sharing.shareAsync` + optional `Asset.create` (media library)** | *Skia `makeImageSnapshot`*: heavier dep for a card we can compose in plain views. *Server-rendered PNG*: violates offline-first. |
| Animation | **Reanimated 4 + Worklets + Gesture Handler** (already bundled by SDK 57) | *Animated (RN core)*: fine for fades, but the radar sweep and EMF trace need UI-thread frames while the JS thread is doing engine ticks. |
| Long lists (journal/evidence) | **`@shopify/flash-list`** (verify version at install); `FlatList` is acceptable for MVP if FlashList fights the dev build | — |
| Seeded randomness | **Our own `RandomEngine` (pure TS: xmur3 hash → sfc32 PRNG)** | *`seedrandom`/`pure-rand` npm*: a 40-line dependency-free module is easier to make replay-exact and to unit-test against a golden vector list. |
| Content validation | **Zod schemas for `src/data/**/*.json`**, validated once at boot in dev (and in CI as a test) | *Hand-written type guards*: more code, worse error messages, and content packs are exactly where typos hide. |
| Testing | **Two Jest projects**: (a) `node` preset for `src/engine/**` and `src/services/**` pure logic; (b) `jest-expo` + `@testing-library/react-native` for components | *Single jest-expo project*: engine tests would pay RN's transform cost for no benefit. The two-project setup is only possible because we enforce that `engine/` imports nothing from RN/Expo. |
| Native modules (Kotlin/Swift) | **Zero in MVP.** | Rationale: (i) our readouts are deliberately **qualitative**, so 5–15 Hz sampling is sufficient — the 200 Hz Android cap is irrelevant; (ii) `expo-sensors` already delivers what we need, and we *quantize* anyway; (iii) every native module costs an iOS/Android review cycle and breaks the CNG upgrade path. Revisit only if telemetry shows the EMF feel is wrong (see backlog ticket `T-0.9`, an optional high-rate spike). |

### G.2 Folder structure (improved from the brief's `src/` tree)

The brief's tree mixed concerns (`features/emf` next to `engine/`, `audio/` at top level with no owner). The rules that make this codebase survive 30 creatures instead of 4:

- **`engine/` is pure TypeScript.** It may not import `react`, `react-native`, `expo*`, or `zustand`. Enforced by ESLint `no-restricted-imports`, not by discipline. This is what makes the sim testable in a `node` Jest project and makes replay-based tests possible.
- **`sensors/` is the only place that touches `expo-sensors` / `expo-location` / `expo-audio` capture.** Everything else talks to `SensorHub`.
- **`app/` contains routes only** — no engine calls, no SQL. A screen composes `features/*` components and calls a `services/*` method.
- **`data/` is content, not code.** Adding Mothman = 1 JSON + assets + a registry entry + a content-version bump. No engine diff.
- **`db/repositories/*` is the only place with SQL strings**, and it returns domain models from `engine/models`.

```text
nighttrace/
├── app.config.ts                  # plugins: expo-camera, expo-audio, expo-sensors(motionPermission), expo-location, expo-build-properties
├── eas.json                       # dev / preview / production profiles
├── metro.config.js                # .db asset ext preserved for bundled catalogue seed
├── tsconfig.json                  # strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes, noImplicitOverride
├── eslint.config.js               # boundary rules: engine purity, sensor isolation, no-SQL-outside-db
├── jest.config.js                 # projects: "engine" (node) + "ui" (jest-expo)
├── assets/
│   ├── audio/{ambience,stings,wordbank,vocals,ui}/
│   ├── sprites/{ghost,bigfoot,shadow,ufo}/          # transparent PNG/WebP sequences
│   ├── images/{overlays,share-card,onboarding,textures}/
│   ├── fonts/
│   └── db/catalogue-seed.db                          # optional pre-baked content DB (see §I.4)
└── src/
    ├── app/                                          # Expo Router: routes only
    │   ├── _layout.tsx                               # GestureHandlerRootView → SQLiteProvider(onInit=migrate) → Theme → SessionHost
    │   ├── +not-found.tsx
    │   ├── (onboarding)/index.tsx · disclaimer.tsx · calibrate.tsx
    │   ├── (tabs)/
    │   │   ├── _layout.tsx                           # NativeTabs: Home · Investigate · Field Journal · Profile
    │   │   ├── index.tsx                             # Home (featured hunt, anomaly of the day, continue case)
    │   │   ├── investigate.tsx                       # hunt picker (locked/unlocked, conditions tonight)
    │   │   ├── journal.tsx
    │   │   └── profile.tsx
    │   ├── hunt/[huntId]/
    │   │   ├── _layout.tsx                           # Stack, gestureEnabled: true — swiping back = leaving the field
    │   │   ├── brief.tsx                             # ritual gear-up: calibrate, name the case, set intention
    │   │   └── session.tsx                           # the field shell (status rail + tool carousel + tick host)
    │   ├── tool/                                     # full-screen tool surfaces (pushed above session)
    │   │   ├── emf.tsx · radar.tsx · spirit-box.tsx · evp.tsx
    │   │   ├── camera.tsx · tracker.tsx · sky.tsx
    │   ├── case/[caseId]/
    │   │   ├── report.tsx                            # HERO SCREEN — built first (see §M Phase 1)
    │   │   ├── share.tsx                             # share card composition + share sheet
    │   │   └── evidence/[evidenceId].tsx             # single souvenir, with triage verdict
    │   └── (modals)/intensity.tsx · low-power.tsx · permissions.tsx · about-entertainment.tsx
    ├── engine/                                       # PURE TS. no react / react-native / expo / zustand
    │   ├── InvestigationEngine.ts                    # the tick orchestrator (pure)
    │   ├── EventScheduler.ts                         # weighting, cooldowns, silence floors, session budget
    │   ├── TensionEngine.ts                          # tension 0..100 + phase transitions
    │   ├── RadarSimulator.ts                         # targets with birth/velocity/uncertainty/death
    │   ├── EmfPipeline.ts                            # EMA → baseline → delta → anomaly score
    │   ├── RandomEngine.ts                           # seeded PRNG + fork()
    │   ├── archetypes/{Observer,Stalker,Mimic,Ambusher}.ts
    │   ├── archetypes/registry.ts
    │   ├── directives/SessionDirective.ts            # e.g. guaranteedEncounterOnFirstRun
    │   ├── sources/{EventSource,LocalScriptSource,AutoDirectorSource,RemoteDirectorSource.stub}.ts
    │   ├── rules/{silence.ts,cooldown.ts,gates.ts,evidence.ts}
    │   ├── models/                                   # §H lives here (one file per aggregate)
    │   └── __tests__/                                # golden-seed replay tests
    ├── sensors/                                      # ONLY importer of expo-sensors / expo-location / mic
    │   ├── SensorHub.ts · useSensor.ts · dutyCycle.ts · quantize.ts · permissions.ts
    │   └── channels/{magnetometer,accelerometer,gyroscope,deviceMotion,light,location,audioLevel,cameraState}.ts
    ├── audio/{AudioBus.ts,AmbienceBed.ts,StingPlayer.ts,WordBankPlayer.ts,VocalizationPlayer.ts,cues.ts}
    ├── haptics/{HapticDirector.ts,patterns.ts}
    ├── data/                                         # content as data (zod-validated)
    │   ├── schemas.ts · ContentRegistry.ts · ContentVersion.ts
    │   ├── creatures/{ghost,bigfoot,shadow-person,alien}.json
    │   ├── archetypes/{observer,stalker,mimic,ambusher}.json
    │   ├── hunts/{ghost,bigfoot,shadow-person,alien}.json
    │   ├── events/{ghost,bigfoot,shadow-person,alien,shared}.json
    │   ├── encounters/{...}.json
    │   ├── badges/{...}.json
    │   └── wordbanks/{ambiguous,ghost,ufo}.json
    ├── db/
    │   ├── client.ts                                 # openDatabase + PRAGMAs (WAL, foreign_keys)
    │   ├── migrations/{index.ts,001_init.ts,002_....ts}
    │   ├── mappers/*.ts                              # row ⇄ model (snake_case ⇄ camelCase, enum guards)
    │   ├── repositories/{Session,Evidence,Encounter,Case,Progression,Journal,Media,Catalogue,Analytics}Repository.ts
    │   └── kv.ts                                     # typed wrapper over expo-sqlite/kv-store
    ├── services/                                     # orchestration across engine ⇄ db ⇄ sensors ⇄ presentation
    │   ├── SessionService.ts · EvidenceService.ts · CaseReportService.ts · ShareCardService.ts
    │   ├── ProgressionService.ts · SeedService.ts · PermissionService.ts · AnalyticsService.ts
    │   └── Clock.ts · IdFactory.ts · Logger.ts
    ├── store/                                        # zustand
    │   └── sessionStore.ts · sensorStore.ts · settingsStore.ts · uiStore.ts · selectors.ts
    ├── features/                                     # smart components, one folder per feature surface
    │   ├── session/ · radar/ · emf/ · spirit-box/ · evp/ · camera/ · tracker/ · sky/
    │   └── report/ · journal/ · home/ · onboarding/ · profile/
    ├── ui/                                           # design system primitives (no business logic)
    │   ├── theme/{colors,spacing,typography,motion,index}.ts
    │   ├── primitives/{Text,Panel,Button,Pressable,Sparkline,ConfidenceCone,SignalBars,StatRow,EmptyState}.tsx
    │   └── overlays/{ScanLines,NoiseField,Vignette,ChromaticEdge,GlitchFrame,TorchBeam}.tsx
    └── util/{time.ts,math.ts,invariant.ts,result.ts,format.ts}
```

### G.3 State architecture — exactly what lives where

Five stores of state, and one rule that decides the home for anything new:

> **The rule:** *if it can be recomputed from (seed + content version + tick log), it must not be persisted. If the user would be angry to lose it, it must be in SQLite before the screen closes.*

| Layer | Holds | Never holds | Lifetime | Example |
|---|---|---|---|---|
| **SQLite (`nighttrace.db`)** — source of truth | `sessions`, `session_ticks`, `evidence`, `encounters`, `investigation_events`, `case_reports`, `discoveries`, `badge_awards`, `user_progress`, `media`, `analytics_events`, and the seeded **catalogue** (`creatures`, `hunts`, `event_definitions`, `encounter_definitions`, `behaviour_archetypes`, `badges`) | live sensor values, tension, radar targets, current event | forever (until user deletes) | `CaseReport`, `UserProgress`, evidence rows |
| **Zustand `sessionStore`** | derived live sim: `phase`, `tension`, `radarTargets[]`, `activeEventId`, `coolingDown[]`, `evidenceDraft[]`, `elapsedMs`, `emissionQueue` | anything a second device/user must see; nothing that can't be replayed | one hunt session | tension 61, three ghost targets, "asked a question" flag |
| **Zustand `sensorStore`** | latest quantized `SensorSnapshot` + `SensorAvailability` per channel + `mode` (`session`/`low_power`/`preview`/`suspended`) | raw 100 Hz sample arrays (ring buffers live in the channel objects, not the store) | app run | `emf: 0.32`, `magnetometer: ready`, `mic: permission_denied` |
| **Zustand `settingsStore`** (hydrated from & written through to `kv-store`) | intensity, low-power/dim mode, haptics on/off, ambience on/off, units, reduce-motion, denied-permission acknowledgements | — | forever | `lowPower: true` |
| **Zustand `uiStore`** | `openTool`, `sheetRoute`, transient toasts, onboarding step | domain data | app run | `openTool: 'camera'` |
| **Component state** | text input, animation progress, list scroll | anything shared | component | case-name field |

**Write policy (the important part).** A session is *checkpointed*, not streamed:

- On `startSession` → insert one `sessions` row (`status='active'`, `seed`, `content_version`, `hunt_id`, `started_at`, `conditions_snapshot`).
- Every **60 s** and on every `AppState` change to `background`/`inactive`: one `withExclusiveTransactionAsync` that (a) updates `sessions.elapsed_ms`, (b) appends the run-length-encoded tick digest to `session_ticks`, (c) inserts any *not-yet-committed* evidence. Evidence is committed **when it is found**, not at the end — a phone dying mid-hunt must not lose the souvenir.
- On finish → transaction: `case_reports` insert, `evidence`/`encounters` finalise, `discoveries` upsert, `badge_awards` upsert, `user_progress` update, `sessions.status='completed'`.
- **Replay:** because the engine is pure and seeded, a completed session is fully reconstructible from `seed + hunt_id + content_version + tick_digest[]`. That property is why `session_ticks` exists: it turns bug reports into fixtures, gives us a "replay your case" view for free, and *is* the data format a future Director Mode needs to inject into a friend's next session.

### G.4 SQLite architecture

- **One database file**: `nighttrace.db` in the default database directory. Opened once in `src/db/client.ts` and provided app-wide via `SQLiteProvider` with `onInit={migrate}`; components read it with `useSQLiteContext()`.
- **PRAGMAs at open**: `journal_mode = WAL`, `foreign_keys = ON`, `synchronous = NORMAL`, `busy_timeout = 5000`. WAL is recommended by Expo for new databases and matters because session checkpoints write while read screens are open.
- **Migrations**: an ordered array of `{ version, up(db) }` in `src/db/migrations/index.ts`, driven by `PRAGMA user_version` (the documented Expo pattern). Rules: (1) never edit a shipped migration; (2) every migration runs inside a transaction; (3) additive-only for a shipped schema version — destructive changes require `SQLite.backupDatabaseAsync()` first and a shipping a `.bak` restore path; (4) `migrate()` is idempotent and safe to call twice (asserted by a test).
- **Two table families, two lifecycles.**
  - *Catalogue tables* (content) are **rebuilt from bundled JSON** whenever `kv.content_version !== ContentVersion.CURRENT`: `DELETE` + batch `INSERT` inside one exclusive transaction, then cache-bust. This is how a Mothman content drop ships as an app update without a data migration. `src/data/**/*.json` is zod-validated at boot in dev and in a CI test, so malformed content fails the build, not the user.
  - *User tables* are never touched by a content rebuild. Foreign keys point **only within the user family** — except `evidence.creature_id` / `sessions.hunt_id`, which are `TEXT` ids validated against the catalogue in code (a content rebuild must never cascade-delete a user's evidence). This is a deliberate FK-asymmetry: **integrity between content and user data is enforced in the repository layer, not by SQLite.**
- **Repository layer**: `src/db/repositories/*` are the only files containing SQL string literals. They return `engine/models` types via `src/db/mappers/*`. Rules: explicit column lists (no `SELECT *`), prepared statements for hot paths (evidence insert, tick append), `getEachAsync` for the journal timeline (incremental, no 10 000-row array), always bind parameters (`db.sql` tagged templates or `?`/`$name`).
- **Media**: photos/audio live on disk under `Paths.document/cases/<caseRef>/`, never in BLOBs. `media` rows store `relative_path`, `mime`, `bytes`, `duration_ms`, `checksum`. Deletion of a case deletes the directory after the DB transaction commits (orphan files are swept once per launch).
- **Settings**: `expo-sqlite/kv-store`, not a settings table — it is already SQLite-backed, has a sync API for boot-time reads, and needs no migration. Typed wrapper in `src/db/kv.ts` (`getSetting<K extends keyof SettingsMap>`), so a typo is a compile error.
- **Dev tools**: expo-sqlite's built-in **Inspector** (`Shift+M` in the Expo CLI → "Open expo-sqlite") is the debugging story for the whole data layer; no custom DB browser.
- **Retention**: `analytics_events` and `session_ticks` are ring-buffered (keep last 2 000 analytics rows; tick digests compressed RLE, pruned for sessions older than 180 days after their report is exported).

### G.5 Sensor abstraction layer

One interface for every input. The UI never sees `expo-sensors`; the engine never sees a sensor at all — it sees a `SensorDigest` that the hub computes at the engine's tick rate.

```ts
// src/sensors/types.ts
import type { Clock } from '../services/Clock';

export type SensorId =
  | 'magnetometer'
  | 'accelerometer'
  | 'gyroscope'
  | 'deviceMotion'
  | 'light'
  | 'location'
  | 'audioLevel'
  | 'cameraState';

export type SensorAvailability =
  | { readonly kind: 'ready' }
  | { readonly kind: 'permission_not_requested' }
  | { readonly kind: 'permission_denied'; readonly canAskAgain: boolean }
  | { readonly kind: 'unavailable_hardware' }
  | { readonly kind: 'unsupported_platform' }
  | { readonly kind: 'error'; readonly message: string };

/** Duty-cycle ladder. One rate name per situation; the hub maps it to a Hz + a native interval. */
export type SensorRate = 'off' | 'eco' | 'ambient' | 'focus';
export const RATE_HZ: Readonly<Record<Exclude<SensorRate, 'off'>, number>> = {
  eco: 2,
  ambient: 6,
  focus: 15,
};

export type SensorMode = 'suspended' | 'preview' | 'session' | 'session_low_power';

export interface SensorSample<T> {
  readonly value: T;
  readonly atMs: number;
  readonly rate: SensorRate;
}

export type Unsubscribe = () => void;

export interface SensorChannel<T> {
  readonly id: SensorId;
  availability(): SensorAvailability;
  /** Cheap hardware probe (e.g. `Magnetometer.isAvailableAsync()`); never prompts. */
  probe(): Promise<boolean>;
  /** Just-in-time permission. Called by the tool that needs it, never at launch. */
  ensurePermission(): Promise<SensorAvailability>;
  setRate(rate: SensorRate): void;
  read(): SensorSample<T> | null;
  subscribe(listener: (sample: SensorSample<T>) => void): Unsubscribe;
  dispose(): void;
}

export interface SensorHub {
  channel<T>(id: SensorId): SensorChannel<T> | null;      // null when the channel isn't registered
  require<T>(id: SensorId): SensorChannel<T>;             // throws — use only where absence is a bug
  setMode(mode: SensorMode): void;                        // called from screen focus/blur + low-power toggle
  /** Fires at TICK_HZ only — this is the ONLY stream the store and UI consume. */
  subscribeSnapshot(listener: (snapshot: SensorSnapshot) => void): Unsubscribe;
  snapshot(): SensorSnapshot;
  /** Quantized, engine-facing summary. Deterministic given the same samples. */
  digest(): SensorDigest;
}

export const SENSOR_TICK_HZ = 6 as const; // UI/engine tick; sensors may sample faster internally
```

**Mechanics that matter:**

- **Ring buffer, not `setState`.** Channels push samples into a fixed-size ring buffer (`Float32Array` per axis). Nothing in React re-renders per sample. Visuals that need 60 fps (radar sweep, torch beam, EMF trace tail) read a Reanimated `SharedValue` written from the sample callback on the UI thread.
- **Ticking.** A single `SessionHost` mounts one interval at `SENSOR_TICK_HZ`. Each tick: `hub.digest()` → `engine.tick(...)` → emissions → stores. Sensors can therefore run at 2 Hz in eco mode with the exact same game feel, which *is* the battery strategy.
- **Focus/blur.** `session.tsx` uses `useFocusEffect` to `hub.setMode('session')` and the cleanup to `hub.setMode('suspend' | 'preview')`. `AppState !== 'active'` forces `suspended` (all channels `off`, camera `active={false}`). Because Expo's own docs warn that only one camera preview may exist, `tool/camera.tsx` is a pushed route and the preview unmounts on pop.
- **Keep-awake.** `useKeepAwake('session')` is mounted by `session.tsx` only. `expo-keep-awake`'s sync `activateKeepAwake` is deprecated — use the hook or `activateKeepAwakeAsync`. In `session_low_power` the hook is skipped entirely.
- **Dim mode.** `expo-brightness.setBrightnessAsync(0.15)` while a session is in low-power mode, restored from the captured original value on exit.

**Graceful fallbacks (one row per channel; all "reduce, never block"):**

| Channel | Missing / denied | Fallback behaviour (deterministic, still qualitative) | User-facing copy |
|---|---|---|---|
| `magnetometer` | no hardware (probe false) | EMF tool switches to **"residual mode"**: anomaly score derived from accelerometer micro-motion + clock + RNG stream, same cadence and same engine contract | "No magnetic sensor here — readings are inferred." |
| `magnetometer` | permission denied | On iOS motion permission gates `DeviceMotion`; magnetometer itself needs none — if the platform still refuses, same as above | "Motion access is off. You can keep going." |
| `accelerometer` / `gyroscope` / `deviceMotion` | no hardware / denied | Motion signals fall back to `location` speed when available, then to a 0-value "still" profile. Radar presence timers lengthen so silence still reads as intentional | "Movement detection is limited on this device." |
| `light` | Android-only sensor missing | Ambient darkness inferred from clock hour + user-declared environment in the brief | — |
| `location` | denied or reduced accuracy | Hunt runs **"uncharted"**: no place seed, no distance readouts; tracker shows *bearing only* from magnetometer-free fallback = relative dead-reckoning from step motion; seed = `time + sensor fingerprint` | "Going uncharted. Distances are hidden." |
| `audioLevel` | mic denied | Spirit Box/EVP run **"archive mode"**: word-bank playback is triggered by elapsed-time gates only; *no* "it answered you" coupling | "Microphone is off — the box still scans." |
| `audioLevel` | `AudioStream` unsupported | Fall back to recorder `metering` at 500 ms; VAD threshold widened, responses delayed by one tick | — |
| `cameraState` | denied / no camera | Camera tool becomes a **dark-room renderer**: pre-rendered overlay + sprite layer over a black field, with the same encounter timing | "No camera access — rewinding to the dark-room view." |

Every fallback is a *content-equivalent* path: the engine's contract (`SensorDigest`) is unchanged, so no hunt can become unshippable because a phone lacks a sensor. Denial UI is a real screen (`(modals)/permissions.tsx`) that explains, offers "continue without", and deep-links to Settings via `Linking.openSettings()` — never a nag loop.

### G.6 Service interfaces (TypeScript signatures)

These are the seams. `engine/*` is pure (no I/O, no `Date.now`, no `Math.random`); `services/*` owns I/O, time, and persistence.

```ts
// ---------- engine/models/random.ts ----------
export type Seed = string & { readonly __brand: 'Seed' };
export interface RandomState { readonly seed: Seed; readonly draws: number; readonly s: readonly number[] }

export interface RandomEngine {
  readonly seed: Seed;
  readonly draws: number;                       // consumed draw counter → replay assertions
  next(): number;                               // [0, 1)
  int(minInclusive: number, maxExclusive: number): number;
  bool(probability: number): boolean;
  pick<T>(items: readonly T[]): T;
  weighted<T>(entries: readonly Weighted<T>[]): T;
  gaussian(mean: number, sd: number): number;
  exponent(mean: number): number;               // for silence gaps — a hard floor *and* a long tail
  fork(label: string): RandomEngine;            // deterministic substream, order-independent
  snapshot(): RandomState;
  restore(state: RandomState): void;
}
export declare function createRandomEngine(seed: Seed): RandomEngine;
export declare function seedFromParts(parts: readonly (string | number)[]): Seed;

// ---------- engine/sources/EventSource.ts ----------  (the Director Mode seam)
export interface EventIntent {
  readonly kind: 'event' | 'encounter' | 'radar_command' | 'audio_cue';
  readonly definitionId: string;
  readonly issuedAtTick: number;
  readonly strength: number;                    // 0..1
  readonly sourceId: string;
}

/** Any producer of intents: the local scheduler, a scripted tutorial, or a remote Director. */
export interface EventSource {
  readonly id: string;
  readonly authority: 'advisory' | 'authoritative';
  /** Pure: given the context, return intents. Must not perform I/O. */
  poll(ctx: Readonly<SimulationContext>): readonly EventIntent[];
  /** Async intents (network) are drained by the host into the *next* tick, never mid-tick. */
  drain(): readonly EventIntent[];
}
export declare const NoopEventSource: EventSource;
export declare function createAutoDirectorSource(): EventSource;      // MVP: internal pacing hints only
// createRemoteDirectorSource() is intentionally NOT implemented in MVP.

// ---------- engine/InvestigationEngine.ts ----------
export interface TickInput {
  readonly tickIndex: number;
  readonly elapsedMs: number;
  readonly digest: SensorDigest;
  readonly userActions: readonly UserAction[];
  readonly sourceIntents: readonly EventIntent[];
}

export type EngineEmission =
  | { readonly kind: 'event'; readonly event: InvestigationEvent }
  | { readonly kind: 'evidence'; readonly intent: EvidenceIntent }
  | { readonly kind: 'encounter'; readonly encounter: ResolvedEncounter }
  | { readonly kind: 'phase'; readonly phase: SessionPhase }
  | { readonly kind: 'radar'; readonly command: RadarCommand }
  | { readonly kind: 'audio'; readonly cue: AudioCueId }
  | { readonly kind: 'haptic'; readonly pattern: HapticPatternId }
  | { readonly kind: 'notice'; readonly notice: EngineNotice };        // e.g. "quiet stretch", power warnings

export interface TickResult {
  readonly state: SimulationState;              // immutable next state
  readonly emissions: readonly EngineEmission[];
  readonly rng: RandomState;
}

export interface InvestigationEngine {
  readonly sessionId: SessionId;
  state(): Readonly<SimulationState>;
  tick(input: TickInput): TickResult;
  /** User-initiated: "ask it something", "log a spot", "sweep". May return null (nothing yet). */
  request(kind: InvestigationRequestKind): readonly EngineEmission[];
  finish(reason: SessionEndReason): TickResult;
}

export interface EngineDeps {
  readonly rng: RandomEngine;
  readonly content: ContentRegistry;
  readonly archetype: ArchetypeRuntime;         // resolved from content, never hardcoded
  readonly directive: SessionDirective;         // e.g. guaranteedEncounterOnFirstRun
  readonly clocklessNowMs: number;              // engine never reads a clock; host feeds time
}
export declare function createInvestigationEngine(session: SessionSeed, deps: EngineDeps): InvestigationEngine;

// ---------- engine archetypes ----------
export interface ArchetypeRuntime {
  readonly id: ArchetypeId;
  readonly definition: ArchetypeDefinition;
  onTick(ctx: Readonly<SimulationContext>, rng: RandomEngine): readonly ArchetypeEffect[];
  reactTo(ctx: Readonly<SimulationContext>, userAction: UserAction, rng: RandomEngine): readonly ArchetypeEffect[];
  selectEvent(ctx: Readonly<SimulationContext>, rng: RandomEngine): EventDefinitionId | null;
  selectEncounter(ctx: Readonly<SimulationContext>, rng: RandomEngine): EncounterDefinitionId | null;
  evaluateFail(ctx: Readonly<SimulationContext>): FailStateId | null;
}

// ---------- services ----------
export interface SessionService {
  start(huntId: HuntId, prefs: SessionPrefs): Promise<SessionHandle>;
  resume(sessionId: SessionId): Promise<SessionHandle>;
  checkpoint(handle: SessionHandle): Promise<void>;      // 60 s cadence + on background
  finish(handle: SessionHandle, reason: SessionEndReason): Promise<CaseId>;
  abandon(sessionId: SessionId): Promise<void>;
  activeSession(): Promise<SessionHandle | null>;
}
export interface SessionHandle {
  readonly sessionId: SessionId;
  readonly seed: Seed;
  readonly engine: InvestigationEngine;
  readonly recorder: SessionRecorder;                    // tick digest writer
}
export interface SessionRecorder {
  append(tick: TickDigest): void;
  flush(db: SQLiteDatabase): Promise<void>;
}

export interface EvidenceService {
  /** Commit-on-find. Returns the persisted row so the UI can show it immediately. */
  capture(intent: EvidenceIntent, media?: MediaDraft): Promise<Evidence>;
  attachMedia(evidenceId: EvidenceId, draft: MediaDraft): Promise<MediaAsset>;
  triage(evidenceId: EvidenceId, verdict: TriageVerdict): Promise<Evidence>;
  listForSession(sessionId: SessionId): Promise<readonly Evidence[]>;
}

export interface CaseReportService {
  build(sessionId: SessionId, rng: RandomEngine): Promise<CaseReport>;
  save(report: CaseReport): Promise<CaseId>;
  get(caseId: CaseId): Promise<CaseReport | null>;
  listRecent(limit: number): Promise<readonly CaseSummary[]>;
}

export interface ShareCardService {
  /** Renders the themed card to a PNG in cache, then exposes it for share/save. */
  render(caseId: CaseId, variant: ShareCardVariant): Promise<ShareArtifact>;
  share(artifact: ShareArtifact, anchor?: Rect): Promise<ShareOutcome>;
  saveToPhotos(artifact: ShareArtifact): Promise<SaveOutcome>;
}
export interface ShareArtifact { readonly fileUri: string; readonly width: number; readonly height: number }

export interface ProgressionService {
  progress(): Promise<UserProgress>;
  apply(report: CaseReport): Promise<ProgressionDelta>;   // returns what changed → drives the reveal animation
  unlockedHunts(progress: UserProgress): Promise<readonly HuntId[]>;
  directiveFor(huntId: HuntId, progress: UserProgress): SessionDirective;
}

export interface SeedService {
  /** place + hour + weather-proxy + sensor fingerprint + daily anomaly → one unrepeatable Seed */
  forSession(input: SeedInput): Promise<Seed>;
  dailyAnomaly(dayKey: string): Promise<DailyAnomaly>;
}
export interface SeedInput {
  readonly huntId: HuntId;
  readonly coords: { readonly lat: number; readonly lon: number } | null;  // null when uncharted
  readonly startedAtMs: number;
  readonly fingerprint: SensorDigest;
  readonly environment: Environment;
}

export interface PermissionService {
  status(id: SensorId): SensorAvailability;
  request(id: SensorId): Promise<SensorAvailability>;      // JIT only, never at launch
  openSettings(): Promise<void>;
}

export interface AnalyticsService {
  track<E extends AnalyticsEventName>(name: E, props: AnalyticsProps[E]): void;   // offline, local-only
  flush(): Promise<void>;                                                         // writes batched rows
}

export interface ContentRegistry {
  readonly version: ContentVersion;
  creature(id: CreatureId): CreatureDefinition;
  hunt(id: HuntId): HuntDefinition;
  archetype(id: ArchetypeId): ArchetypeDefinition;
  event(id: EventDefinitionId): EventDefinition;
  encounter(id: EncounterDefinitionId): EncounterDefinition;
  tables(creature: CreatureDefinition): readonly EventTableId[];
  allCreatures(): readonly CreatureDefinition[];
}

export interface Clock {
  nowMs(): number;
  nowIso(): string;
  dayKey(): string;                                         // local YYYY-MM-DD, the daily-anomaly key
}

export interface AudioService {
  attachBus(): AudioBus;
  bed(kind: AmbienceBedId): void;                           // { silence } is a first-class bed
  sting(cue: AudioCueId, gain: number): void;
  speakWord(bankId: WordBankId, bank: number): Promise<void>;
  setMaster(gain: number): void;
  suspend(): void;                                          // called on blur / low-power
}

export interface HapticsService {
  play(pattern: HapticPatternId): Promise<void>;            // no-ops (never throws) if unavailable
  setEnabled(enabled: boolean): void;
  /** Called by the presenter because iOS silences haptics while the camera is active. */
  setCameraActive(active: boolean): void;
}
```

**Separation guarantee.** `InvestigationEngine` returns *emissions*; it never calls `HapticsService`, `AudioService`, or a store. A single presenter (`src/features/session/useSessionPresenter.ts`) maps emissions → haptics/audio/store/UI. That is what "simulation separated from presentation" means in practise, and it is what lets the same engine drive a future replay viewer or Director Mode panel.

---

## H. TypeScript models

> §G.6 lists the **seams** — the signatures the services expose. §H lists the **shapes** those signatures mention. Where a type appears in both, §H is canonical and §G.6 keeps its preview line so a reader of the architecture section is never forced to jump. `engine/models/` is one file per aggregate, re-exported from `src/engine/models/index.ts`.

### H.0 Conventions, applied without exception

```ts
// src/engine/models/brand.ts
declare const brand: unique symbol;
export type Brand<T, B extends string> = T & { readonly [brand]: B };
```

**Rule 1 — every id is branded; no id is ever a bare `string`.** `EvidenceId`, `SessionId`, `CreatureId` and `HuntId` are all `string` at runtime and all mutually unassignable at compile time. This is the single highest-leverage line of TypeScript in the project: the bug class it kills is *"a hunt id passed where a creature id was expected"*, which is exactly the bug a content-driven system produces at scale and which unit tests catch last.

**Rule 2 — every field is `readonly`.** The engine returns a new `SimulationState` per tick (§G.6). If mutation is possible anywhere, one presenter will eventually reach into state and "fix" a value, and replay stops being exact — which breaks the property in §G.3 that turns bug reports into fixtures.

**Rule 3 — every variant set is a discriminated union tagged `kind`, and no two variants share a name.** `kind` is a literal, written first, and never a field that also carries domain meaning. Report tables, `db/mappers/*`, and the `useSessionPresenter` emission switch are all exhaustive `switch` statements whose `default` branch returns `never`. That is the only mechanism that keeps a three-engine codebase honest across 30 creatures: adding an emission becomes a **compile error** at every consumer until it is handled.

**Rule 4 — absence is spelled `null`, never `undefined`; `?` is reserved for conditionally-built literals.** Under `exactOptionalPropertyTypes`, `{ x?: string }` does *not* accept `{ x: undefined }`, which is the correct strictness but a footgun when building an object from possibly-undefined inputs. So: domain fields that can be absent are `readonly x: X | null` (explicit, survives JSON, survives a SQLite row, and reads as a deliberate fact — which is what "absence is meaningful" means at the type level); optional `?` appears only on object shapes we assemble with conditional spreads, and those are always written `?: X | undefined`. A `null` in a `CaseReport` is therefore a **claim** ("no corroborating evidence was logged"), not an omission.

**Rule 5 — no `any`, no `unknown` outside parser boundaries, no `as` casts outside `db/mappers/*` and Zod output.** `unknown` is admissible only as the input of a validator or a JSON parse; it must be narrowed before it reaches a model. `as` is admissible only in mappers, where a row's shape is guaranteed by the table DDL in §I.

### H.1 Ids, brands and primitive aliases

```ts
// src/engine/models/ids.ts
import type { Brand } from './brand';

export type SessionId = Brand<string, 'SessionId'>;
export type CaseId = Brand<string, 'CaseId'>;
export type EvidenceId = Brand<string, 'EvidenceId'>;
export type EncounterId = Brand<string, 'EncounterId'>;
export type MediaId = Brand<string, 'MediaId'>;
export type JournalEntryId = Brand<string, 'JournalEntryId'>;
export type CreatureId = Brand<string, 'CreatureId'>;
export type HuntId = Brand<string, 'HuntId'>;
export type ArchetypeId = Brand<string, 'ArchetypeId'>;
export type EventDefinitionId = Brand<string, 'EventDefinitionId'>;
export type EncounterDefinitionId = Brand<string, 'EncounterDefinitionId'>;
export type EventTableId = Brand<string, 'EventTableId'>;
export type BadgeId = Brand<string, 'BadgeId'>;
export type WordBankId = Brand<string, 'WordBankId'>;
export type AudioCueId = Brand<string, 'AudioCueId'>;
export type HapticPatternId = Brand<string, 'HapticPatternId'>;
export type AmbienceBedId = Brand<string, 'AmbienceBedId'>;
export type FailStateId = Brand<string, 'FailStateId'>;
export type AnalyticsEventId = Brand<string, 'AnalyticsEventId'>;
export type Seed = Brand<string, 'Seed'>;
export type ContentVersion = Brand<string, 'ContentVersion'>;   // 'YYYY.MM.DD.N'

/** Milliseconds since the session start, never a wall clock. */
export type SessionMs = Brand<number, 'SessionMs'>;
/** The engine's own monotonic tick counter. */
export type TickIndex = Brand<number, 'TickIndex'>;
/** Epoch milliseconds — only ever produced by `services/Clock`, never by the engine. */
export type EpochMs = Brand<number, 'EpochMs'>;
/** Normalized 0..1. Used for strengths, confidences, gains. */
export type Unit = Brand<number, 'Unit'>;

export const unit = (n: number): Unit => Math.min(1, Math.max(0, n)) as Unit;
```

**Why brand the numbers too.** `SessionMs`, `TickIndex` and `EpochMs` are all `number` and all appear in the same `TickInput`. Without brands, `elapsedMs: EpochMs` compiles, and a wrong time base silently corrupts pacing for exactly one code path — the kind of bug that only shows up in a 40-minute session at 23:40. `Unit` is branded so `unit(x)` is the *only* way to produce one, which means "we clamp every strength" is provable by grep.

### H.2 Seed and session start

```ts
// src/engine/models/seed.ts
import type { ContentVersion, EpochMs, HuntId, Seed, SessionId, Unit } from './ids';

export interface GeoPoint { readonly lat: number; readonly lon: number; readonly accuracyM: number }

/** What the user declared in the brief. Never inferred, always explicit. */
export type Environment =
  | 'indoor_home'
  | 'indoor_derelict'
  | 'outdoor_urban'
  | 'outdoor_woodland'
  | 'outdoor_water'
  | 'vehicle'
  | 'transit';

export type SkyCondition = 'clear' | 'overcast' | 'precipitation' | 'storm' | 'fog' | 'unknown';

/**
 * Every ingredient that makes tonight's seed unrepeatable.
 * Weather is a *proxy* (sky condition + temperature band the user confirms in the brief)
 * because there is no network and therefore no weather API (Hard constraint 13).
 */
export interface SeedParts {
  readonly huntId: HuntId;
  readonly coords: GeoPoint | null;          // null == uncharted (@see §G.5 location fallback)
  readonly startedAtMs: EpochMs;
  readonly environment: Environment;
  readonly sky: SkyCondition;
  readonly temperatureBand: 'freezing' | 'cold' | 'mild' | 'warm' | 'hot' | 'unknown';
  readonly fingerprint: SensorFingerprint;    // quantized at session start, one-shot
  readonly contentVersion: ContentVersion;    // a content drop must invalidate replay parity
}

/** The one-shot, coarse sensor sample that salts the seed. Deliberately low-resolution. */
export interface SensorFingerprint {
  readonly emfMicro: number;          // -3..3, quantized magnetometer magnitude residual
  readonly lightLux: number | null;   // null when the channel is absent (Android-only sensor)
  readonly motionQuiet: Unit;         // 1.0 == perfectly still at start
  readonly noiseFloorDb: number | null;
}

export interface SessionSeed {
  readonly seed: Seed;
  readonly sessionId: SessionId;
  readonly parts: SeedParts;
  /** Persisted verbatim so a replayed session reconstructs the same conditions board. */
  readonly conditionsSummary: ConditionsSummary;
}

/** The board the user sees on the brief screen and again on the report. No numbers, ever. */
export interface ConditionsSummary {
  readonly anomalyOfTheDay: true | false;
  readonly skyReadout: 'clear' | 'overcast' | 'rain' | 'storm' | 'fog' | 'unreadable';
  readonly hourBand: 'dusk' | 'night' | 'deep_night' | 'predawn';
  readonly placeReadout: string;      // e.g. "Woodland edge, low ambient light"
  readonly notice: string | null;     // diegetic one-liner set by the ContentRegistry
}
```

**Why `SeedParts` is persisted on the session row and not recomputed.** The seed *is* the product's moat (§H, design law 6) and the replay key from §G.3. Recomputing it from a fresh sensor sample would produce a different seed, because the fingerprint is a live reading. The session row therefore stores the parts; `SeedService.forSession` writes the fingerprint exactly once, at the moment the user crosses the threshold in `brief.tsx`.

**Why weather is user-confirmed rather than fetched.** Hard constraint 13 forbids network calls. A future real-weather ingest is a *content* concern (it selects an event table), not a seed concern, so keeping the proxy in `SeedParts` means the seed contract never changes when weather arrives.

### H.3 Session, tick, and the session directive

```ts
// src/engine/models/session.ts
import type {
  CaseId, ContentVersion, EncounterId, EpochMs, EvidenceId, HuntId, Seed, SessionId,
} from './ids';
import type { ConditionsSummary, SessionSeed } from './seed';

export type SessionStatus = 'briefing' | 'active' | 'paused' | 'completed' | 'abandoned' | 'aborted_low_storage';

export type SessionPhase =
  | 'threshold'      // 0–60 s: calibration, intentional silence, no events permitted
  | 'establishing'   // first impressions: one weak signal is *likely*, never guaranteed
  | 'investigating'  // the body of the session
  | 'escalating'     // the entity has taken an interest (only reachable if tension passes its gate)
  | 'closing'        // the last 10%: events taper; one last chance
  | 'debris';        // the settling tail after the session is over; report is being assembled

export type SessionEndReason =
  | 'user_finished'
  | 'user_left_field'      // gesture-back out of hunt/[huntId]/session.tsx
  | 'time_cap_reached'
  | 'battery_guard'        // low-power floor hit; session is valid, not failed
  | 'app_killed'           // recovered on next launch from the checkpoint
  | 'storage_guard';

export interface Session {
  readonly id: SessionId;
  readonly huntId: HuntId;
  readonly caseId: CaseId | null;          // set on finish
  readonly seed: Seed;
  readonly contentVersion: ContentVersion;
  readonly status: SessionStatus;
  readonly phase: SessionPhase;
  readonly startedAtMs: EpochMs;
  readonly endedAtMs: EpochMs | null;
  readonly elapsedMs: number;
  readonly tickCount: number;
  readonly conditions: ConditionsSummary;
  readonly endReason: SessionEndReason | null;
  /** What the user named it. A named case is a possession; an unnamed one is a loss. */
  readonly caseName: string | null;
  readonly intention: Intention | null;
}

export type Intention = 'contact' | 'observe' | 'document' | 'debunk' | 'accompany';

export interface SessionPrefs {
  readonly intensity: IntensityLevel;
  readonly lowPower: boolean;
  readonly caseName: string | null;
  readonly intention: Intention | null;
  readonly environment: Environment;
  readonly sky: SkyCondition;
  readonly soundOn: boolean;
}
```

```ts
// src/engine/models/tick.ts
import type { EpochMs, SessionMs, TickIndex } from './ids';

/** Everything a rule may consult. Frozen by convention; the engine never mutates it. */
export interface SimulationContext {
  readonly sessionId: SessionId;
  readonly tickIndex: TickIndex;
  readonly elapsedMs: SessionMs;
  readonly phase: SessionPhase;
  readonly tension: number;                    // 0..100
  readonly digest: SensorDigest;
  readonly carriedEvidence: readonly EvidenceKindTag[];
  readonly activeEncounter: ActiveEncounter | null;
  readonly lastEventAtMs: SessionMs | null;
  readonly lastEncounterAtMs: SessionMs | null;
  readonly recentEvents: readonly EventOccurrence[];
  readonly coolingDown: readonly CooldownState[];
  readonly userActionsThisTick: readonly UserAction[];
  readonly conditions: Readonly<ConditionsSummary>;
}

/** A single logged user act. The engine's ONLY input from the UI. */
export type UserAction =
  | { readonly kind: 'sweep'; readonly aimDeg: number; readonly atMs: SessionMs }
  | { readonly kind: 'ask_question'; readonly wordCount: number; readonly atMs: SessionMs }
  | { readonly kind: 'log_spot'; readonly aimDeg: number; readonly atMs: SessionMs }
  | { readonly kind: 'switch_tool'; readonly tool: ToolId; readonly atMs: SessionMs }
  | { readonly kind: 'deploy_torch'; readonly on: boolean; readonly atMs: SessionMs }
  | { readonly kind: 'take_photo'; readonly atMs: SessionMs }
  | { readonly kind: 'start_recording'; readonly atMs: SessionMs }
  | { readonly kind: 'stop_recording'; readonly durationMs: number; readonly atMs: SessionMs }
  | { readonly kind: 'move_to'; readonly aimDeg: number; readonly atMs: SessionMs }
  | { readonly kind: 'calibrate'; readonly atMs: SessionMs }
  | { readonly kind: 'pause' }
  | { readonly kind: 'resume' };

export type InvestigationRequestKind =
  | 'ask_question'
  | 'sweep'
  | 'log_spot'
  | 'request_hint'
  | 'force_settle';

export type ToolId = 'emf' | 'radar' | 'spirit_box' | 'evp' | 'camera' | 'tracker' | 'sky' | 'torch';

/** One emission, compressed to what a replay actually needs. */
export interface EventOccurrence {
  readonly definitionId: EventDefinitionId;
  readonly atMs: SessionMs;
  readonly strength: number;              // 0..1 — internal only, never rendered as a number
  readonly channel: SensoryChannel;
}

export interface CooldownState {
  readonly rule: string;                  // 'silence' | 'event:<id>' | 'encounter' | 'sting'
  readonly untilMs: SessionMs;
  readonly floorMs: SessionMs;            // the enforced minimum gap
}
```

**Why `UserAction` is a closed union with an `atMs` on every variant.** The engine has no clock (§G.6, `EngineDeps.clocklessNowMs`). If actions arrived without timestamps, the host would have to translate them into ticks, and two different devices with different tick jitter would produce different sessions from the same seed — killing replay parity. Carrying `atMs` means the engine can *quantize* an action into the tick it belongs to deterministically.

**Why `ToolId` has eight members but the tab bar has four.** Tools are hunt-scoped (Hard constraint 9), so `ToolId` is the union of every tool any hunt may mount, not a navigation surface. `torch` is a tool, not a tab, and `tracker` is the compass/proximity merge decided in the `.memlog` ("merge compass and proximity into one Tracker").

```ts
// src/engine/directives/SessionDirective.ts
import type { Unit } from '../models/ids';
import type { CreatureId, EncounterDefinitionId, EventDefinitionId, HuntId, SessionMs } from '../models/ids';

/**
 * A directive is *editorial authority* over the simulation — the seam that lets a
 * tutorial, a daily anomaly, or a future Director Mode influence pacing without
 * the engine knowing who asked.
 */
export interface SessionDirective {
  readonly id: string;
  /** Guaranteed-encounter windows. Used exactly once, by the free first hunt. */
  readonly guaranteedEncounters: readonly GuaranteedEncounter[];
  /** Event definitions the scheduler must not select this session. */
  readonly bannedEvents: readonly EventDefinitionId[];
  /** Multiplies the silence floor. >1 == quieter, <1 == denser. Never reaches 0. */
  readonly silenceScale: number;
  readonly tensionCeiling: number;                 // 0..100
  readonly minimumDurationMs: SessionMs | null;     // "hold the quiet until at least N"
  readonly allowEarlyEncounter: boolean;
  readonly flavourNote: string | null;              // shown as a conditions line, no mechanics leaked
}

export interface GuaranteedEncounter {
  readonly encounterId: EncounterDefinitionId;
  readonly earliestMs: SessionMs;
  readonly latestMs: SessionMs;
  /** 'first_run' is the only consumer in MVP: hunt one reaches a real encounter (law 8). */
  readonly reason: 'first_run' | 'daily_anomaly' | 'scripted_intro' | 'director';
}

export declare const DefaultDirective: SessionDirective;
export declare function tutorialDirective(huntId: HuntId): SessionDirective;
export declare function dailyAnomalyDirective(creature: CreatureId): SessionDirective;
```

**Decision — the directive cannot name an event, only constrain the space.** A directive that says "fire `ghost_knock_02` at 4:12" makes the engine a puppet and turns the tutorial into a cutscene. A directive that says "an encounter is owed between 6 and 11 minutes, choose it yourself, at your own pace" keeps the engine in charge of *the moment* while the editor keeps charge of *the arc*. That is the same boundary that makes Director Mode safe later: a friend can promise a scare, but cannot script it.

**Rejected alternative: a scripted event list per hunt.** It is simpler to author and impossible to make feel unplanned — the second playthrough is identical, which is the primary anti-metric. A directive's constraints are cheap to author (four numbers) and produce a different session every time.

### H.4 Sensor snapshot and digest

```ts
// src/engine/models/sensors.ts
import type { SessionMs, Unit } from './ids';
import type { SensorAvailability, SensorId, SensorMode, SensorRate } from '../../sensors/types';

/** Raw-ish quantized values. Written from a sample callback, never from React state. */
export interface SensorSnapshot {
  readonly atMs: SessionMs;
  readonly mode: SensorMode;
  readonly rate: SensorRate;
  readonly emfMicroTesla: number | null;
  readonly emfDeltaMicroTesla: number | null;
  readonly accelMagG: number | null;
  readonly gyroMagRads: number | null;
  readonly motionStillness: Unit;                  // 1 == still
  readonly lightLux: number | null;
  readonly headingDeg: number | null;
  readonly location: LocationReading | null;
  readonly audioRmsDb: number | null;
  readonly voiceActivity: Unit;
  readonly torchOn: boolean | null;                // cameraState channel
}

export interface LocationReading {
  readonly lat: number;
  readonly lon: number;
  readonly accuracyM: number;
  readonly speedMps: number | null;
  readonly bearingDeg: number | null;
  readonly reducedAccuracy: boolean;               // iOS "approximate" authorization
}

/**
 * The engine's ONLY view of the world. Derived from the snapshot by `hub.digest()`,
 * quantized so that two devices with different noise floors agree on the *buckets*.
 */
export interface SensorDigest {
  readonly atMs: SessionMs;
  readonly magnetic: MagnitudeBucket;              // 'floor' | 'low' | 'mid' | 'high' | 'unknown'
  readonly magneticDelta: 'none' | 'settling' | 'twitch' | 'swing' | 'surge' | 'unknown';
  readonly motion: 'still' | 'micro' | 'moving' | 'agitated' | 'unknown';
  readonly heading: Direction8 | 'unknown';
  readonly darkness: 'lit' | 'dim' | 'dark' | 'void' | 'unknown';
  readonly proximityToLastSpotM: number | null;    // null == uncharted
  readonly sound: 'silence' | 'room' | 'voice' | 'loud' | 'unknown';
  readonly torch: 'on' | 'off' | 'unknown';
  readonly coverage: readonly SensorId[];          // which channels actually contributed
  /** Every field above that is 'unknown' is in here, so rules can degrade by name. */
  readonly degraded: readonly SensorId[];
}

export type MagnitudeBucket = 'floor' | 'low' | 'mid' | 'high' | 'unknown';
export type Direction8 = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

export interface SensorAvailabilityReport {
  readonly at: SessionMs;
  readonly byId: Readonly<Record<SensorId, SensorAvailability>>;
  /** The mode the hub actually achieved, which may be lower than the mode requested. */
  readonly effectiveMode: SensorMode;
}
```

**Why the digest's fields are buckets and not numbers.** Three reasons, in priority order. (1) *Anti-falsification*: a rule cannot accidentally leak a number into UI copy if no number exists downstream of the hub. (2) *Determinism across devices*: two phones in the same place disagree on `emfMicroTesla` by 30%, so a bucket based on the device's own baseline makes the same seed produce the same session shape on both. (3) *Fallback equivalence* (§G.5): the accelerometer fallback produces `magnetic: 'low'` rather than nothing, so no rule needs a special case for "sensor missing".

**Decision — `degraded` is a list, not a boolean.** Every rule that wants to soften its behaviour when a channel is missing asks `ctx.digest.degraded.includes('magnetometer')`, which means degraded-mode behaviour is auditable from one place rather than scattered through `if (snapshot.emfMicroTesla === null)` checks. `coverage` is its complement and exists for the report, which names which faculties were available.

### H.5 Evidence

```ts
// src/engine/models/evidence.ts
import type {
  CaseId, CreatureId, EncounterId, EvidenceId, MediaId, SessionId, SessionMs, Unit,
} from './ids';

export type EvidenceChannel = 'emf' | 'audio' | 'visual' | 'thermal' | 'motion' | 'log';
export type EvidenceKind =
  | 'emf_swing'
  | 'voice_capture'
  | 'word_bank_hit'
  | 'photo_anomaly'
  | 'shadow_pass'
  | 'footprint'
  | 'tree_knock'
  | 'sky_light'
  | 'user_note'
  | 'user_audio';

export type EvidenceStrength = 'faint' | 'present' | 'strong' | 'unqualified';
export type TriageVerdict = 'unexplained' | 'inconclusive' | 'explained';

/** Produced by the engine; consumed by EvidenceService.capture. Never persisted as-is. */
export interface EvidenceIntent {
  readonly kind: EvidenceKind;
  readonly channel: EvidenceChannel;
  readonly atMs: SessionMs;
  readonly strength: EvidenceStrength;
  readonly confidence: Unit;                  // internal only
  readonly creatureId: CreatureId;
  readonly encounterId: EncounterId | null;
  readonly signatureSlot: SignatureSlot | null;
  readonly caption: string;                    // authored line, chosen by content, not generated
  readonly mediaRequest: MediaRequest | null;
}

export type SignatureSlot =
  | 'trace' | 'voice' | 'form' | 'habit' | 'place' | 'refusal';

export type MediaRequest =
  | { readonly kind: 'photo' }
  | { readonly kind: 'audio'; readonly durationMs: number }
  | { readonly kind: 'none' };

export interface Evidence {
  readonly id: EvidenceId;
  readonly sessionId: SessionId;
  readonly caseId: CaseId | null;              // set when the case is sealed
  readonly creatureId: CreatureId;
  readonly encounterId: EncounterId | null;
  readonly kind: EvidenceKind;
  readonly channel: EvidenceChannel;
  readonly strength: EvidenceStrength;
  readonly signatureSlot: SignatureSlot | null;
  readonly atMs: SessionMs;
  readonly caption: string;
  /** The user's own line, if they wrote one. This is what makes the report *theirs*. */
  readonly userNote: string | null;
  readonly verdict: TriageVerdict | null;      // null == not yet triaged
  readonly triagedAtMs: SessionMs | null;
  readonly media: readonly MediaAsset[];
  /**
   * True for evidence the Trickster plants. Sealed at triage time; the report renders
   * it exactly like any other item until the user's own triage flips it.
   */
  readonly contested: boolean;
}

export interface MediaAsset {
  readonly id: MediaId;
  readonly evidenceId: EvidenceId;
  readonly kind: 'photo' | 'audio' | 'share_card';
  readonly relativePath: string;               // Paths.document/cases/<caseRef>/...
  readonly mime: string;
  readonly bytes: number;
  readonly durationMs: number | null;
  readonly width: number | null;
  readonly height: number | null;
  readonly checksum: string;                   // sha256 of the file at write time
  readonly createdAtMs: number;
}

/** Everything the UI hands back when the user attaches something. */
export interface MediaDraft {
  readonly kind: 'photo' | 'audio';
  readonly sourceUri: string;                  // file:// from CameraView / recorder
  readonly durationMs?: number | undefined;
  readonly width?: number | undefined;
  readonly height?: number | undefined;
}
```

**Decision — `strength` and `verdict` are different axes, and the report shows only the second.** `strength` is the engine's internal reading of how loud a moment was; `verdict` is the user's judgment, entered at end-of-session triage. A `strong` piece of evidence the user marks `explained` is *correct behaviour*, not a conflict — it is the deduction mini-layer from the `.memlog` insight working. If the UI ever showed `strength` as a label, it would be a verifiable claim ("this was strong"), so it never crosses the presenter boundary.

**Decision — `contested` is a stored boolean, not a kind.** Trickster false evidence must be indistinguishable from real evidence *while it is being collected*, including in the journal, the evidence reel, and the share card. Storing it as a separate `EvidenceKind` would leak the truth through a kind-switch in some UI, somewhere, eventually. A boolean that only `CaseReportService` reads at seal time leaks nothing.

**Rejected alternative: no user notes.** They cost a text field and they are the highest-value field in the table. The `.memlog` job is *"hand me a story to tell my friends tomorrow"* — the report must contain sentences the user wrote, or it is a printout, not a possession.

### H.6 Encounter

```ts
// src/engine/models/encounter.ts
import type {
  CreatureId, EncounterDefinitionId, EncounterId, EvidenceStrength, SessionId, SessionMs, Unit,
} from './ids';

export type EncounterDelivery =
  | 'peripheral_visual'
  | 'haptic_only'
  | 'audio_only'
  | 'screen_glitch'
  | 'environmental'
  | 'absence';                 // the designed non-encounter: a moment that *should* have happened

export type EncounterOutcome = 'witnessed' | 'partially_witnessed' | 'missed' | 'declined' | 'absent';

export interface ActiveEncounter {
  readonly encounterId: EncounterId;
  readonly definitionId: EncounterDefinitionId;
  readonly creatureId: CreatureId;
  readonly startedAtMs: SessionMs;
  readonly expiresAtMs: SessionMs;
  readonly delivery: EncounterDelivery;
  /** How many ticks remain before the window closes. Drives the peripheral fade. */
  readonly windowTicks: number;
  readonly witnessed: boolean;
}

/** What the engine emits; EvidenceService/CaseReportService persist the resolved form. */
export interface ResolvedEncounter {
  readonly id: EncounterId;
  readonly definitionId: EncounterDefinitionId;
  readonly creatureId: CreatureId;
  readonly sessionId: SessionId;
  readonly atMs: SessionMs;
  readonly delivery: EncounterDelivery;
  readonly outcome: EncounterOutcome;
  readonly proximity: 'distant' | 'near' | 'adjacent' | 'unknown';
  readonly evidenceOffered: readonly EvidenceStrength[];
  /** Which fail state fired, if the encounter resolved badly. */
  readonly failState: FailStateId | null;
  readonly caption: string;
  readonly aftermathNote: string | null;
}

export interface Encounter {
  readonly id: EncounterId;
  readonly sessionId: SessionId;
  readonly definitionId: EncounterDefinitionId;
  readonly creatureId: CreatureId;
  readonly atMs: SessionMs;
  readonly delivery: EncounterDelivery;
  readonly outcome: EncounterOutcome;
  readonly proximity: ResolvedEncounter['proximity'];
  readonly failState: FailStateId | null;
  readonly caption: string;
}
```

**Decision — `EncounterDelivery.absence` is a first-class value.** Design law 5 ("absence is meaningful") is not a policy the report writer remembers; it is a union variant. A session can record *"encounter window opened, nothing arrived"* as a deliberate outcome, which the report renders as the strongest kind of evidence there is: nothing happened when everything said it should. Without this variant, absence would be indistinguishable from "the engine never rolled an encounter", and the report would have no way to say the difference.

**Why `proximity` is four buckets and never metres.** The tracker's entire fiction is that distance is unknowable. `adjacent` is a feeling; `3.2 m` is a claim that a skeptic can ask you to reproduce.

### H.7 Content definitions — the data the engine reads

```ts
// src/engine/models/content.ts
import type {
  ArchetypeId, AudioCueId, BadgeId, ContentVersion, CreatureId, EncounterDefinitionId,
  EventDefinitionId, EventTableId, FailStateId, HapticPatternId, HuntId, Unit, WordBankId,
} from './ids';
import type { EncounterDelivery } from './encounter';
import type { Environment, SkyCondition } from './seed';
import type { EvidenceKind, SignatureSlot } from './evidence';
import type { ToolId } from './tick';

export type SensoryChannel = 'visual' | 'audio' | 'haptic' | 'glitch' | 'environmental';
export type PacingProfile = 'slow_burn' | 'steady' | 'escalating' | 'bursty';
export type CreatureVerb = 'observe_back' | 'close_in' | 'echo_you' | 'glance_and_gone';

export interface CreatureDefinition {
  readonly id: CreatureId;
  readonly displayName: string;                 // "The Watcher in the Hall"
  readonly shortName: string;                   // "Shadow Person"
  readonly archetype: ArchetypeId;
  readonly verb: CreatureVerb;
  readonly sensoryChannel: SensoryChannel;
  readonly environmentAffinity: readonly Environment[];
  readonly skyAffinity: readonly SkyCondition[];
  readonly signature: CreatureSignature;
  readonly failState: FailStateId;
  readonly dialogueKey: string;                 // i18n key root; creature names are localized
  readonly artRef: string;
  readonly audioRefs: readonly string[];
  /** Content-only fields — the engine never reads these two; the store/report do. */
  readonly paywallTier: 'free' | 'premium' | 'expedition';
  readonly releaseNote: string;
}

/** The five things that, together, identify a creature in the report. */
export interface CreatureSignature {
  readonly required: readonly SignatureSlot[];   // must all appear to seal 'unexplained'
  readonly supporting: readonly SignatureSlot[];
  readonly contradicting: readonly SignatureSlot[]; // e.g. Trickster's planted evidence
}

export interface HuntDefinition {
  readonly id: HuntId;
  readonly creatureId: CreatureId;
  readonly title: string;
  readonly subtitle: string;
  readonly environment: Environment;
  readonly tools: readonly ToolId[];            // hard constraint 9: tools live inside hunts
  readonly pacing: PacingProfile;
  readonly sessionLengthBand: { readonly minMs: number; readonly maxMs: number };
  readonly eventTables: readonly EventTableId[];
  readonly objectives: readonly Objective[];
  readonly completion: CompletionCondition;
  readonly failMode: FailStateId;
  readonly gate: HuntGate;
  readonly briefLines: readonly string[];
  readonly debriefPrompts: readonly string[];
}

export interface Objective {
  readonly id: string;
  readonly label: string;                        // "Log three kinds of trace"
  readonly kind: 'collect_evidence_types' | 'hold_still' | 'sweep_count' | 'ask_questions' | 'reach_place';
  readonly target: number;                       // internal; never rendered as "2/3"
  readonly optional: boolean;
}

export type CompletionCondition =
  | { readonly kind: 'time_cap'; readonly minMs: number; readonly maxMs: number }
  | { readonly kind: 'evidence_quota'; readonly required: number }
  | { readonly kind: 'signal_lock' }
  | { readonly kind: 'it_noticed_you' }
  | { readonly kind: 'extraction' };

export type HuntGate =
  | { readonly kind: 'open' }
  | { readonly kind: 'clearance'; readonly minimum: ClearanceLevel }
  | { readonly kind: 'cases_completed'; readonly count: number }
  | { readonly kind: 'paid'; readonly productId: string };
```

```ts
// src/engine/models/archetype.ts
import type { ArchetypeId, EventDefinitionId, EncounterDefinitionId, FailStateId, Unit } from './ids';

export interface ArchetypeDefinition {
  readonly id: ArchetypeId;
  readonly displayName: string;
  readonly verb: CreatureVerb;
  /** How the archetype converts the digest into pressure. All weights, no logic. */
  readonly weights: ArchetypeWeights;
  readonly stages: readonly ArchetypeStage[];
  readonly failState: FailStateId;
  readonly failStateLabel: string;               // diegetic: "It noticed you."
  readonly eventTables: readonly EventTableId[];
  /** Content-authored, so a new creature with the Observer archetype is a JSON drop. */
  readonly parameters: Readonly<Record<string, number | string | boolean>>;
}

export interface ArchetypeWeights {
  readonly magnetic: number;     // how much an EMF swing feeds it
  readonly motion: number;
  readonly sound: number;
  readonly light: number;
  readonly torch: number;        // Ambusher punishes a lit torch; Observer is drawn to it
  readonly stillness: number;    // Stalker advances when you stop moving
  readonly proximity: number;
}

export interface ArchetypeStage {
  readonly id: string;                       // 'dormant' | 'aware' | 'curious' | 'committed' | 'spent'
  readonly tensionFloor: Unit;               // stage is reachable at/above this tension
  readonly tensionCeiling: Unit;
  readonly attackDelayMs: { readonly min: number; readonly max: number };
  readonly silenceFloorScale: number;
  readonly encounterChance: Unit;            // per-minute, not per-tick
}

/** Every effect an archetype can ask for. The engine applies them; the archetype only asks. */
export type ArchetypeEffect =
  | { readonly kind: 'tension'; readonly delta: number; readonly reason: string }
  | { readonly kind: 'silence_floor'; readonly ms: number }
  | { readonly kind: 'radar_target'; readonly command: RadarCommand }
  | { readonly kind: 'advance_stage'; readonly stageId: string }
  | { readonly kind: 'queue_encounter'; readonly definitionId: EncounterDefinitionId; readonly withinMs: number }
  | { readonly kind: 'plant_evidence'; readonly kindOf: string }
  | { readonly kind: 'fail'; readonly failState: FailStateId; readonly note: string }
  | { readonly kind: 'flavour'; readonly note: string };
```

**Decision — archetypes emit `ArchetypeEffect` values; they never touch state.** This is the difference between four archetypes and four forked engines. The Observer cannot "set tension to 70"; it can ask for `+6 tension`. If two archetypes could write state directly, their order in the tick would change the outcome and replay parity would depend on a loop order — a class of bug that is invisible until someone files a replay diff.

**Decision — every archetype ships `parameters` as content, and every stage boundary is a weight.** Switching Shadow Person from Observer to Stalker in a future content drop becomes a JSON edit; the four MVP archetypes are four JSON files plus four ~120-line TS files whose only job is to read those weights. The engine imports `archetypes/registry.ts`, never `archetypes/Observer.ts`.

```ts
// src/engine/models/event.ts
import type {
  AmbienceBedId, AudioCueId, EncounterDefinitionId, EventDefinitionId, EventTableId,
  EvidenceKind, HapticPatternId, Unit,
} from './ids';
import type { SensoryChannel } from './content';
import type { RadarCommand } from './radar';
import type { SignatureSlot } from './evidence';
import type { SessionPhase } from './session';
import type { ToolId } from './tick';

export type EventCategory =
  | 'ambient' | 'signal' | 'bait' | 'escalation' | 'retreat' | 'false_positive' | 'ritual' | 'silence';

export interface EventDefinition {
  readonly id: EventDefinitionId;
  readonly category: EventCategory;
  readonly sensoryChannel: SensoryChannel;
  readonly label: string;                        // journal line, authored
  readonly body: string;
  readonly weight: number;                       // relative selection weight
  readonly cooldownMs: number;
  readonly minTension: Unit;
  readonly maxTension: Unit;
  readonly phaseAllow: readonly SessionPhase[];
  readonly requiresDigest: readonly DigestRequirement[];
  readonly forbidsDigest: readonly DigestRequirement[];
  readonly requiresTools: readonly ToolId[];
  readonly effects: readonly EventEffect[];
  readonly evidence: EventEvidenceSpec | null;
  readonly audioCue: AudioCueId | null;
  readonly haptic: HapticPatternId | null;
  readonly oncePerSession: boolean;
  readonly oncePerCase: boolean;
  /** A 'silence' event is real content: it *extends* the floor rather than firing. */
  readonly extendsSilenceMs: number | null;
}

export type DigestRequirement =
  | 'magnetic_high' | 'magnetic_swing' | 'motion_still' | 'motion_agitated'
  | 'darkness_void' | 'sound_silence' | 'sound_voice' | 'torch_on' | 'torch_off'
  | 'degraded_magnetometer' | 'proximity_near' | 'proximity_far';

export type EventEffect =
  | { readonly kind: 'tension'; readonly delta: number }
  | { readonly kind: 'radar'; readonly command: RadarCommand }
  | { readonly kind: 'audio'; readonly cue: AudioCueId; readonly gain: number }
  | { readonly kind: 'haptic'; readonly pattern: HapticPatternId }
  | { readonly kind: 'glitch'; readonly intensity: Unit; readonly ms: number }
  | { readonly kind: 'ambience_shift'; readonly bed: AmbienceBedId; readonly ms: number }
  | { readonly kind: 'schedule_encounter'; readonly definitionId: EncounterDefinitionId; readonly withinMs: number }
  | { readonly kind: 'notice'; readonly text: string };

export interface EventEvidenceSpec {
  readonly kind: EvidenceKind;
  readonly strength: 'faint' | 'present' | 'strong';
  readonly confidence: Unit;
  readonly signatureSlot: SignatureSlot | null;
  readonly captionKey: string;
  readonly mediaRequest: 'photo' | 'audio' | 'none';
}

export interface EventTable {
  readonly id: EventTableId;
  readonly phase: SessionPhase;
  readonly tensionBand: readonly [Unit, Unit];
  readonly entries: readonly WeightedEvent[];
  readonly emptyWeight: number;                  // the weight of *nothing happening* — always > 0
}

export interface WeightedEvent { readonly definitionId: EventDefinitionId; readonly weight: number }
```

**Why `EventTable.emptyWeight` exists and must be greater than zero.** An event table that can only select events is a metronome with extra steps. Making "nothing" an explicitly-weighted entry means silence is a *content decision with an authored weight*, tunable per phase and per content drop, and testable — the golden-seed tests assert that for seed K, table T produced silence three times in a row. That is how design law 5 is enforced mechanically instead of by hope.

```ts
// src/engine/models/encounterDefinition.ts
import type {
  AudioCueId, CreatureId, EncounterDefinitionId, FailStateId, HapticPatternId, Unit,
} from './ids';
import type { EncounterDelivery, EncounterOutcome } from './encounter';
import type { DigestRequirement, EventEvidenceSpec } from './event';
import type { SignatureSlot } from './evidence';
import type { ToolId } from './tick';

export interface EncounterDefinition {
  readonly id: EncounterDefinitionId;
  readonly creatureId: CreatureId;
  readonly title: string;
  readonly deliveryCandidates: readonly EncounterDelivery[];   // one is chosen by digest + rng
  readonly minTension: Unit;
  readonly windowMs: number;                     // how long the user has to witness it
  readonly requiresDigest: readonly DigestRequirement[];
  readonly requiresTools: readonly ToolId[];
  readonly minEvidenceCarried: number;           // it shows itself only to someone who has been working
  readonly gradeOnOutcome: Readonly<Record<EncounterOutcome, EncounterGrade>>;
  readonly audioCue: AudioCueId;
  readonly haptic: HapticPatternId;
  readonly spiritPrompt: string | null;          // Mimic: what it says back to you
  readonly failState: FailStateId | null;
  readonly aftermathNote: string;
}

export interface EncounterGrade {
  readonly captions: readonly string[];
  readonly evidence: readonly EventEvidenceSpec[];
  readonly tensionDelta: number;
  readonly signatureSlots: readonly SignatureSlot[];
}
```

**Decision — `deliveryCandidates` is a list of ways the same encounter can land, resolved at runtime from the digest.** The Observer's encounter delivered as `haptic_only` in a dark room with no camera, and as `peripheral_visual` with the camera up, must be the *same authored encounter* — one row, two feelings. Authoring one encounter per delivery would multiply the content by five and produce the "40 shallow reskins" failure the `.memlog` explicitly rejects.

```ts
// src/engine/models/badge.ts
import type { BadgeId, CreatureId, Unit } from './ids';

export interface BadgeDefinition {
  readonly id: BadgeId;
  readonly name: string;
  readonly description: string;
  readonly hidden: boolean;                      // hidden badges are the misattributed-achievement surface
  readonly criteria: BadgeCriteria;
  readonly artRef: string;
}

/** Declarative, evaluated by ProgressionService after a case seals. No callbacks, no code in content. */
export type BadgeCriteria =
  | { readonly kind: 'cases_sealed'; readonly count: number }
  | { readonly kind: 'creature_signature_complete'; readonly creatureId: CreatureId }
  | { readonly kind: 'triaged_all'; readonly minCases: number }
  | { readonly kind: 'no_encounter_cases'; readonly count: number }
  | { readonly kind: 'evidence_channel_spread'; readonly channels: number }
  | { readonly kind: 'explained_contested'; readonly count: number }
  | { readonly kind: 'share_cards'; readonly count: number };
```

**Why `explained_contested` is a badge.** Crediting the user for *disproving* their own evidence is the strongest possible signal that the app is not lying to them, and it is the cheapest insurance against the skeptic's test. A badge is the least expensive way to make that behaviour feel like an achievement rather than a penalty.

```ts
// src/engine/models/radar.ts
import type { Unit } from './ids';

/**
 * The radar never holds a position. It holds a *belief*: a bearing cone, a fuzzy radius,
 * and a life expectancy. Every target is born, drifts, blurs and dies (see §G.1 rejection
 * of "forever-random radar dots").
 */
export interface RadarTarget {
  readonly id: string;
  readonly bornAtMs: number;
  readonly bearingDeg: number;                   // centre of the cone
  readonly coneWidthDeg: number;                 // 90 at birth, narrowing as it firms up
  readonly radiusUnit: Unit;                     // 0 == against the glass, 1 == horizon
  readonly radialJitter: Unit;                   // how much it breathes between ticks
  readonly velocityDegPerS: number;
  readonly velocityRadiusPerS: number;
  readonly uncertainty: Unit;                    // grows while the target is unobserved
  readonly expiresAtMs: number | null;
  readonly provenance: 'ambient' | 'event' | 'encounter' | 'trickster';
  readonly kind: 'contact' | 'echo' | 'drift';
  /** Set once the target is explained away so the UI can fade rather than pop it. */
  readonly dissolving: boolean;
}

export type RadarCommand =
  | { readonly kind: 'spawn'; readonly target: RadarTarget }
  | { readonly kind: 'steer'; readonly targetId: string; readonly bearingDeg: number; readonly radiusUnit: Unit }
  | { readonly kind: 'blur'; readonly targetId: string; readonly coneWidthDeg: number }
  | { readonly kind: 'dissolve'; readonly targetId: string; readonly reason: 'expired' | 'explained' | 'retreat' };

/** One tick of the sweep, for the UI thread only. Never persisted. */
export interface RadarFrame {
  readonly atMs: number;
  readonly sweepDeg: number;
  readonly targets: readonly RadarTarget[];
}
```

**Decision — `uncertainty` only ever grows, and `coneWidthDeg` only ever narrows with observation.** The temptation is to let the radar "lock on". A lock-on is a promise, and a promise is falsifiable the moment the user walks the last ten metres and finds a fence. Instead the cone firms up without the target ever becoming a definite thing, and `dissolving` handles the ending: contact never resolves into a location, it resolves into an *explanation* or an *expiry*.

### H.8 Emissions — the complete output union of the engine

```ts
// src/engine/models/emissions.ts
import type {
  AudioCueId, EvidenceId, HapticPatternId, SessionMs, TickIndex, Unit,
} from './ids';
import type { EncounterDelivery, ResolvedEncounter } from './encounter';
import type { EventDefinition, EventDefinitionId } from './event';
import type { EvidenceIntent } from './evidence';
import type { RadarCommand } from './radar';
import type { SessionPhase, SessionEndReason } from './session';

export interface InvestigationEvent {
  readonly definitionId: EventDefinitionId;
  readonly atMs: SessionMs;
  readonly tickIndex: TickIndex;
  readonly category: EventDefinition['category'];
  readonly label: string;
  readonly body: string;
  readonly strength: Unit;
  readonly sourceId: string;
}

export interface EngineNotice {
  readonly kind: 'quiet_stretch' | 'power_warning' | 'storage_warning' | 'degraded_sensor' | 'pacing_hint' | 'ritual_prompt';
  readonly text: string;
  readonly atMs: SessionMs;
  readonly severity: 'info' | 'attention';
}

export type EngineEmission =
  | { readonly kind: 'event'; readonly event: InvestigationEvent }
  | { readonly kind: 'evidence'; readonly intent: EvidenceIntent }
  | { readonly kind: 'encounter_begun'; readonly encounter: ActiveEncounter }
  | { readonly kind: 'encounter_resolved'; readonly encounter: ResolvedEncounter; readonly offeredEvidenceIds: readonly EvidenceId[] }
  | { readonly kind: 'phase'; readonly phase: SessionPhase; readonly previous: SessionPhase }
  | { readonly kind: 'tension'; readonly value: number; readonly band: 'calm' | 'attention' | 'dread' | 'threshold' }
  | { readonly kind: 'radar'; readonly command: RadarCommand }
  | { readonly kind: 'audio'; readonly cue: AudioCueId; readonly gain: number }
  | { readonly kind: 'haptic'; readonly pattern: HapticPatternId }
  | { readonly kind: 'glitch'; readonly intensity: Unit; readonly ms: number }
  | { readonly kind: 'notice'; readonly notice: EngineNotice }
  | { readonly kind: 'ended'; readonly reason: SessionEndReason; readonly finalTension: number };

/** Exhaustiveness gate — every consumer's switch must end here. */
export function assertNever(value: never): never {
  throw new Error(`Unhandled emission: ${JSON.stringify(value)}`);
}
```

**Decision — `tension` is emitted as a band plus a raw value, and only the band is allowed out of the presenter.** The tension system needs a scalar internally (the archetype stages are tension bands; the ambience crossfade is a curve). The UI needs four names. Emitting both in one emission means the presenter has exactly one place to be disciplined, rather than an implicit convention that "we don't read `.value`" — which is a convention that breaks the first time someone wants a debug overlay.

**Decision — `encounter_begun` and `encounter_resolved` are separate emissions, not one with a status field.** A nice "encounter" object that mutates its own `outcome` would require the store to diff it, and the UI's peripheral fade animation needs a stable identity from the start. Two emissions, both keyed to the same `EncounterId`, means the animation can begin on the first and resolve on the second without a state machine in the component.

### H.9 Case report — the hero screen's data

```ts
// src/engine/models/caseReport.ts
import type {
  CaseId, CreatureId, ContentVersion, EncounterId, EpochMs, EvidenceId, HuntId, SessionId, SessionMs, Seed, Unit,
} from './ids';
import type { ConditionsSummary } from './seed';
import type { Evidence, TriageVerdict } from './evidence';
import type { Encounter } from './encounter';
import type { SessionEndReason } from './session';

export type CaseStatus = 'unexplained' | 'inconclusive' | 'explained';

export interface CaseReport {
  readonly caseId: CaseId;
  readonly caseName: string;
  readonly sessionId: SessionId;
  readonly huntId: HuntId;
  readonly creatureId: CreatureId;
  readonly seed: Seed;
  readonly contentVersion: ContentVersion;
  readonly openedAtMs: EpochMs;
  readonly sealedAtMs: EpochMs;
  readonly durationMs: SessionMs;
  readonly endReason: SessionEndReason;
  readonly status: CaseStatus;
  readonly statusRationale: string;             // one authored sentence, never a formula readout
  readonly headline: string;                    // "Nine minutes of nothing, then a knock."
  readonly conditions: ConditionsSummary;
  readonly narrative: readonly CaseNarrativeBeat[];
  readonly evidence: readonly Evidence[];
  readonly encounters: readonly Encounter[];
  readonly signature: SignatureProgress;
  readonly triage: TriageSummary;
  readonly sectors: readonly SectorRecord[];
  readonly objectives: readonly ObjectiveResult[];
  readonly userAccount: string | null;          // the debrief prompt answer — the user's own words
  readonly badgesAwarded: readonly BadgeId[];
  readonly clearanceAfter: ClearanceLevel;
  readonly shareCardVariant: ShareCardVariant;
  /** Gallery assets rendered at seal time so the report never re-renders a chart live. */
  readonly graphs: readonly CaseGraph[];
}

export type CaseNarrativeBeat =
  | { readonly kind: 'conditions'; readonly text: string }
  | { readonly kind: 'silence'; readonly text: string; readonly fromMs: SessionMs; readonly toMs: SessionMs }
  | { readonly kind: 'event'; readonly text: string; readonly atMs: SessionMs }
  | { readonly kind: 'evidence'; readonly text: string; readonly evidenceId: EvidenceId }
  | { readonly kind: 'encounter'; readonly text: string; readonly encounterId: EncounterId }
  | { readonly kind: 'absence'; readonly text: string; readonly reason: string }
  | { readonly kind: 'turn'; readonly text: string }             // "You stopped answering it."
  | { readonly kind: 'close'; readonly text: string };

export interface SignatureProgress {
  readonly required: readonly SignatureSlotState[];
  readonly supportingMet: number;
  readonly contradictingFound: number;
  /** Rendered as a stamp, not a percentage. The stamp is the deliverable. */
  readonly stamp: 'unsigned' | 'provisional' | 'confirmed' | 'disputed';
}

export interface SignatureSlotState {
  readonly slot: SignatureSlot;
  readonly state: 'unfound' | 'contested' | 'found';
  readonly evidenceIds: readonly EvidenceId[];
}

export interface TriageSummary {
  readonly total: number;
  readonly unexplained: number;
  readonly inconclusive: number;
  readonly explained: number;
  readonly notesWritten: number;
}

export interface SectorRecord {
  readonly id: string;
  readonly label: string;                        // "North side of the house"
  readonly visited: boolean;
  readonly dwellMs: number;
  readonly evidenceIds: readonly EvidenceId[];
  readonly encounterIds: readonly EncounterId[];
}

export interface ObjectiveResult {
  readonly id: string;
  readonly label: string;
  readonly met: boolean;
  readonly optional: boolean;
}

/** A pre-rendered gallery item. `data` is a normalized series with NO axis labels. */
export interface CaseGraph {
  readonly id: string;
  readonly kind: 'trace' | 'timeline' | 'sweep' | 'waveform';
  readonly caption: string;
  readonly series: readonly number[];            // 0..1 normalized; rendered as texture, not readout
  readonly marks: readonly GraphMark[];
}

export interface GraphMark {
  readonly atFraction: Unit;                     // 0..1 along the series
  readonly label: string;                        // "something moved"
  readonly kind: 'event' | 'evidence' | 'encounter' | 'absence';
}

export interface CaseSummary {
  readonly caseId: CaseId;
  readonly caseName: string;
  readonly creatureId: CreatureId;
  readonly sealedAtMs: EpochMs;
  readonly durationMs: SessionMs;
  readonly status: CaseStatus;
  readonly headline: string;
  readonly evidenceCount: number;
  readonly thumbUri: string | null;
}

export type ShareCardVariant =
  | 'case_file'          // the manila-folder stamp card — the default
  | 'evidence_reel'      // 3 evidence stills + captions
  | 'conditions_slip'    // "tonight, in your area" — for a no-encounter night
  | 'signature_sheet';   // the completed creature signature, the rarest share
```

**Decision — `CaseReport.status` is derived once, at seal, and stored; the report screen never recomputes it.** If triage edits re-derived the status live, a user could watch the verdict improve by re-triaging, which turns a ritual into a slider and makes the status feel purchased. Sealing is a ceremony (`.memlog`: "a stamped, ceremonially final report"), so the status is frozen at the stamp and the only way to change it is to run another case.

**Decision — `CaseGraph.series` carries normalized floats and no ticks.** The report needs a visual trace — an EMF ribbon, a timeline — because a page of text does not feel like a case file. But a graph with axis labels is a verifiable number. So the series is a *texture*: rendered with the confidence-cone primitive, annotated only with `marks` whose labels are authored phrases. `GraphMark` is the only place a user could attempt to read a value, and it carries a word, not a figure.

**Rejected alternative: store only the evidence and render the report from live data.** That makes the report a view over the session log, which means every future change to the engine or the content silently rewrites past reports. A report is a document; documents are immutable; therefore the report is materialized at seal and stored whole. It also makes the share card a pure function of one row, with no joins, which matters on a cold launch from a share link.

### H.10 Progression and Investigator Clearance

```ts
// src/engine/models/progression.ts
import type { BadgeId, CaseId, CreatureId, EpochMs, EvidenceId } from './ids';

export type ClearanceLevel = 'visitor' | 'field_notes' | 'accredited' | 'senior' | 'archivist' | 'unknown_sightings';

export interface UserProgress {
  readonly clearance: ClearanceLevel;
  readonly casesSealed: number;
  readonly evidenceLogged: number;
  readonly encountersWitnessed: number;
  readonly unexplainedCount: number;
  readonly explainedCount: number;
  readonly contestedExplained: number;
  readonly noEncounterCases: number;
  readonly sharedCards: number;
  readonly distinctChannels: number;
  readonly firstCaseAtMs: EpochMs | null;
  readonly lastCaseAtMs: EpochMs | null;
  readonly nightsActive: number;
  readonly streakNights: number;
  readonly creatureSignatures: readonly CreatureSignatureRecord[];
  readonly unlockedHunts: readonly HuntId[];
  readonly badges: readonly BadgeAward[];
}

export interface CreatureSignatureRecord {
  readonly creatureId: CreatureId;
  readonly slots: Readonly<Record<SignatureSlot, number>>;   // counts only; no percentages rendered
  readonly sealed: boolean;
  readonly firstSeenAtMs: EpochMs | null;
}

export interface BadgeAward {
  readonly badgeId: BadgeId;
  readonly awardedAtMs: EpochMs;
  readonly caseId: CaseId | null;
  readonly evidenceId: EvidenceId | null;
}

export interface ProgressionDelta {
  readonly before: ClearanceLevel;
  readonly after: ClearanceLevel;
  readonly changed: boolean;
  readonly reason: string | null;
  readonly newBadges: readonly BadgeAward[];
  readonly newUnlocks: readonly HuntId[];
  readonly newSignatureSlots: readonly { readonly creatureId: CreatureId; readonly slot: SignatureSlot }[];
}
```

**Decision — progress is *counted in the open and ranked in the dark*.** The counters above exist to drive badges and the report's stamp, and they are never shown as totals. The user sees a clearance *name*, a night-streak flame, and a wall of stamps. `clearance` is computed by a single pure function from the counters, so the ladder is deterministic and testable, but the mapping from counters to level is deliberately not shown — because the moment "6 cases → Accredited" is visible, the game becomes a grind against a progress bar, and grinding is the opposite of investigating.

**Rejected alternative: XP with visible thresholds.** The brief suggested "XP / simple progression"; the `.memlog` decision was explicit — *"swap XP for a diegetic INVESTIGATOR CLEARANCE level"*. XP is a number, and design law 4 forbids numbers a user can verify. Clearance is a rank; ranks are social, not arithmetic.

**The ladder, decided (six rungs, no more).** `visitor` → `field_notes` → `accredited` → `senior` → `archivist` → `unknown_sightings`. Six because the free tier must reach `field_notes` inside two nights (so the second case feels like a promotion, which is exactly where the paywall sits per law 8), and `unknown_sightings` must be reachable-but-rare so the top of the ladder is a story rather than a milestone.

### H.11 Journal

```ts
// src/engine/models/journal.ts
import type { CaseId, CreatureId, EvidenceId, JournalEntryId, SessionId, SessionMs } from './ids';

export type JournalEntryKind =
  | 'case_sealed'
  | 'evidence_logged'
  | 'encounter'
  | 'night_note'          // the user's debrief answer
  | 'clearance_change'
  | 'badge'
  | 'unlock'
  | 'daily_anomaly'
  | 'first_of_kind';

export interface JournalEntry {
  readonly id: JournalEntryId;
  readonly kind: JournalEntryKind;
  readonly atMs: EpochMs;
  readonly title: string;
  readonly body: string;
  readonly sessionId: SessionId | null;
  readonly caseId: CaseId | null;
  readonly evidenceId: EvidenceId | null;
  readonly creatureId: CreatureId | null;
  readonly thumbUri: string | null;
  /** The user can strike a line from their own journal. The row stays for the report; it hides from the timeline. */
  readonly hidden: boolean;
  readonly pinned: boolean;
}

/** Journal grouping key — "nights", not days, because a session at 01:40 belongs to last night. */
export interface JournalNight {
  readonly dayKey: string;                        // the 04:00-cutoff key from Clock.dayKey()
  readonly entries: readonly JournalEntry[];
  readonly caseIds: readonly CaseId[];
}
```

**Decision — `hidden`, not `delete`.** The journal is the app's own artifact, and a user deleting a bad night would leave a case report with dangling references and make `ProgressionService` counters disagree with the timeline. Hiding makes the timeline the user's to edit while the record stays whole — and the report was already sealed, so nothing downstream changes.

**Decision — the journal groups by "night" with a 04:00 cutoff.** `Clock.dayKey()` deliberately rolls over at 04:00 local, so a hunt that starts at 23:20 and ends at 01:10 is one night, not two entries split across days. The daily anomaly and the streak use the same key, so "tonight" means the same instant everywhere in the app.

### H.12 Settings, KV, and analytics payloads

```ts
// src/engine/models/settings.ts
export type IntensityLevel = 'gentle' | 'standard' | 'intense';

export interface SettingsMap {
  readonly intensity: IntensityLevel;
  readonly lowPower: boolean;
  readonly hapticsEnabled: boolean;
  readonly ambienceEnabled: boolean;
  readonly voicePromptsEnabled: boolean;
  readonly reduceMotion: boolean;
  readonly units: 'metric' | 'imperial';
  readonly disclaimerAcceptedAtMs: number | null;
  readonly disclaimerVersion: string | null;
  readonly onboardingStep: number;
  readonly acknowledgedDenials: readonly string[];
  readonly contentVersionSeen: string | null;
  readonly lastDailyAnomalyKey: string | null;
  readonly activeSessionId: string | null;
  readonly schemaNotice: string | null;
}

/** Only these keys are legal in kv-store; a typo is a compile error (§G.4). */
export type SettingKey = keyof SettingsMap;
```

```ts
// src/engine/models/analytics.ts
import type { AnalyticsEventId, CaseId, CreatureId, EvidenceKind, HuntId, SessionMs } from './ids';
import type { SessionEndReason } from './session';
import type { TriageVerdict } from './evidence';

export type AnalyticsEventName =
  | 'app_opened'
  | 'onboarding_step'
  | 'permission_shown'
  | 'permission_outcome'
  | 'hunt_started'
  | 'hunt_completed'
  | 'hunt_abandoned'
  | 'evidence_found'
  | 'encounter_triggered'
  | 'encounter_missed'
  | 'triage_verdict'
  | 'report_viewed'
  | 'report_shared'
  | 'share_card_saved'
  | 'paywall_viewed'
  | 'purchase_completed'
  | 'journal_opened'
  | 'daily_anomaly_opened'
  | 'sensor_degraded'
  | 'low_power_toggled';

/** Local-only records (§G.3). No PII, no coordinates, no free text — enforced by these types. */
export interface AnalyticsProps {
  readonly app_opened: { readonly coldStart: boolean; readonly contentVersion: string };
  readonly onboarding_step: { readonly step: number; readonly name: string };
  readonly permission_shown: { readonly sensorId: SensorId; readonly context: string };
  readonly permission_outcome: { readonly sensorId: SensorId; readonly granted: boolean; readonly canAskAgain: boolean };
  readonly hunt_started: { readonly huntId: HuntId; readonly intensity: IntensityLevel; readonly lowPower: boolean; readonly charted: boolean };
  readonly hunt_completed: { readonly huntId: HuntId; readonly durationMs: SessionMs; readonly endReason: SessionEndReason; readonly encounterCount: number; readonly evidenceCount: number };
  readonly hunt_abandoned: { readonly huntId: HuntId; readonly atMs: SessionMs; readonly phase: string };
  readonly evidence_found: { readonly kind: EvidenceKind; readonly channel: string; readonly strength: string; readonly withMedia: boolean };
  readonly encounter_triggered: { readonly creatureId: CreatureId; readonly delivery: string; readonly tensionBand: string };
  readonly encounter_missed: { readonly creatureId: CreatureId; readonly delivery: string };
  readonly triage_verdict: { readonly verdict: TriageVerdict; readonly kind: EvidenceKind };
  readonly report_viewed: { readonly caseId: CaseId; readonly dwellMs: number; readonly scrolledToEnd: boolean };
  readonly report_shared: { readonly caseId: CaseId; readonly variant: ShareCardVariant; readonly outcome: string };
  readonly share_card_saved: { readonly caseId: CaseId; readonly allowed: boolean };
  readonly paywall_viewed: { readonly placement: string; readonly caseCount: number };
  readonly purchase_completed: { readonly productId: string; readonly kind: 'consumable' | 'non_consumable' | 'subscription' };
  readonly journal_opened: { readonly entryCount: number; readonly filter: string };
  readonly daily_anomaly_opened: { readonly dayKey: string; readonly creatureId: CreatureId | null };
  readonly sensor_degraded: { readonly sensorId: SensorId; readonly reason: string };
  readonly low_power_toggled: { readonly enabled: boolean; readonly batteryPercent: number | null };
}

export interface AnalyticsEvent<E extends AnalyticsEventName = AnalyticsEventName> {
  readonly id: AnalyticsEventId;
  readonly name: E;
  readonly props: AnalyticsProps[E];
  readonly atMs: EpochMs;
  readonly sessionId: SessionId | null;
}
```

**Decision — `AnalyticsProps` is a mapped interface whose keys are exactly the event names, and `track()` is generic over it.** `track('hunt_completed', { huntId })` fails to compile because the props type demands the other three fields. This is how "analytics that never contain PII" becomes a type-level guarantee rather than a code-review habit: there is no field named `lat`, and no event that takes a free-text string.

### H.13 Model-layer testing contract

Three rules that make §H more than decoration:

1. **Every model file has a `parse`-adjacent test in the `node` Jest project (§G.1) that round-trips a fixture through `JSON.parse(JSON.stringify(x))` and asserts deep equality.** This catches `undefined` sneak-ins, `Date` objects that were supposed to be `EpochMs`, and readonly violations introduced by a mapper.
2. **Every union has one test asserting exhaustiveness** — a function `(x: Union) => never` switch with `assertNever`, iterating a fixture array that includes one of each variant. Adding a variant without a fixture fails the test; omitting a case fails compilation.
3. **Zod schemas in `src/data/schemas.ts` are derived from these types with `satisfies`**, so `z.infer<typeof HuntDefinitionSchema>` must be assignable to `HuntDefinition` and vice versa. A content JSON that drifts from the model fails at boot in dev and in CI — not on a user's phone at 11 pm in a car park.
---

## I. Database schema

> One file, `nighttrace.db`, opened in `src/db/client.ts` with the PRAGMAs from §G.4. Everything below lives in `src/db/migrations/001_init.ts`. The two-family split is not a convention here — it is the reason a Mothman content drop can ship as a plain app update without a data migration.

### I.1 The two families, and the FK asymmetry rule

**Catalogue tables** (`catalogue_*` prefix by convention, content only) are **dropped and rebuilt from bundled JSON** whenever `kv.contentVersionSeen !== ContentVersion.CURRENT`. Rebuild is: one `withExclusiveTransactionAsync` containing `DELETE FROM` each catalogue table then batch `INSERT`. Nothing a user did is in them, so a rebuild is always safe.

**User tables** are never touched by a content rebuild, never dropped by one, and **never carry a SQLite foreign key into a catalogue table.** `sessions.hunt_id`, `evidence.creature_id`, `encounters.definition_id` and friends are plain `TEXT` columns validated against the in-memory `ContentRegistry` in the repository layer.

| Relationship | Enforced by | Why |
|---|---|---|
| user → user (`evidence.session_id` → `sessions.id`) | **SQLite FK, `ON DELETE CASCADE`** | Both sides are user data; a violated link is always a bug, and cascading is what "delete a case" means. |
| user → content (`evidence.creature_id`) | **Repository validation, no FK** | If SQLite owned this FK, a content rebuild's `DELETE FROM creatures` would cascade into the user's evidence. That is a catastrophic, silent, unrecoverable data loss triggered by an app update. |
| content → content (`hunts.creature_id` → `creatures.id`) | **SQLite FK, `ON DELETE CASCADE`** | Both sides are rebuilt together in one transaction, so the FK is a cheap consistency check on our own JSON. |
| content → user | **Does not exist, by design.** | No catalogue table may reference a user row. A content rebuild cannot know what a user did, so it has no business pointing at it. |

**This is the FK-asymmetry rule from §G.4, stated once as a law:** *foreign keys run downwards inside the user family and inside the content family, and never between them.* The cost is that `Repository` code must validate ids, which is a `ContentRegistry.hunt(id)` call that throws a typed error — 12 lines of code in `repositories/*`. The benefit is that the content pipeline cannot destroy user data, which is a property that survives every future content author we have not met yet.

### I.2 Shared conventions

```sql
-- every table
id            TEXT    PRIMARY KEY NOT NULL        -- brand()'d nanoid, generated by services/IdFactory
created_at_ms INTEGER NOT NULL                    -- EpochMs
updated_at_ms INTEGER NOT NULL

-- every timestamp is INTEGER epoch-milliseconds. Never TEXT dates, never REAL julian days.
-- every enum is TEXT with a CHECK constraint. Never INTEGER codes — a readable DB is worth more
-- than four bytes in a file that will be under 40 MB for years, and the expo-sqlite Inspector
-- shows the value rather than a number you must look up in a mapper.
-- every boolean is INTEGER NOT NULL CHECK (x IN (0,1)) DEFAULT 0
-- every optional column is NULL-able; there are no DEFAULT '' sentinels, because '' is a claim.
```

**Decision — `TEXT` enums with `CHECK`, rejected alternative integer codes.** The alternative is faster and smaller and makes every debugging session a lookup. The Inspector (§G.4) is the entire dev-tooling story for this database, so a row must be readable by a human who has not opened the codebase. The `CHECK` constraints also mean a mapper bug that writes `'UNEXPLAINED'` fails loudly at write time rather than silently rendering an empty stamp.

**Decision — no `created_at`/`updated_at` triggers.** They are written by repositories. Triggers are invisible state mutation, they cannot be tested in the `node` Jest project, and `updated_at_ms` on an append-only evidence row is a lie anyway.

### I.3 Catalogue tables (rebuilt from JSON)

```sql
-- 001_init.ts — CATALOGUE ------------------------------------------------------

CREATE TABLE IF NOT EXISTS catalogue_meta (
  key            TEXT PRIMARY KEY NOT NULL,
  value          TEXT NOT NULL
);
-- singleton row: key='content_version' -> ContentVersion.CURRENT.

CREATE TABLE IF NOT EXISTS creatures (
  id                 TEXT PRIMARY KEY NOT NULL,
  display_name       TEXT NOT NULL,
  short_name         TEXT NOT NULL,
  archetype_id       TEXT NOT NULL,
  verb               TEXT NOT NULL CHECK (verb IN ('observe_back','close_in','echo_you','glance_and_gone')),
  sensory_channel    TEXT NOT NULL CHECK (sensory_channel IN ('visual','audio','haptic','glitch','environmental')),
  fail_state_id      TEXT NOT NULL,
  signature_json     TEXT NOT NULL,          -- CreatureSignature, validated by zod before insert
  environment_json   TEXT NOT NULL,          -- readonly Environment[]
  sky_json           TEXT NOT NULL,
  art_ref            TEXT NOT NULL,
  paywall_tier       TEXT NOT NULL CHECK (paywall_tier IN ('free','premium','expedition')),
  dialogue_key       TEXT NOT NULL,
  release_note       TEXT NOT NULL,
  sort_order         INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_creatures_archetype ON creatures(archetype_id);
CREATE INDEX IF NOT EXISTS idx_creatures_tier      ON creatures(paywall_tier);

CREATE TABLE IF NOT EXISTS behaviour_archetypes (
  id                 TEXT PRIMARY KEY NOT NULL,
  display_name       TEXT NOT NULL,
  verb               TEXT NOT NULL,
  fail_state_id      TEXT NOT NULL,
  fail_state_label   TEXT NOT NULL,
  weights_json       TEXT NOT NULL,          -- ArchetypeWeights
  stages_json        TEXT NOT NULL,          -- readonly ArchetypeStage[]
  parameters_json    TEXT NOT NULL,          -- the whole reason a new creature is a content drop
  event_tables_json  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS hunts (
  id                 TEXT PRIMARY KEY NOT NULL,
  creature_id        TEXT NOT NULL REFERENCES creatures(id) ON DELETE CASCADE,
  title              TEXT NOT NULL,
  subtitle           TEXT NOT NULL,
  environment        TEXT NOT NULL CHECK (environment IN
                       ('indoor_home','indoor_derelict','outdoor_urban','outdoor_woodland',
                        'outdoor_water','vehicle','transit')),
  pacing             TEXT NOT NULL CHECK (pacing IN ('slow_burn','steady','escalating','bursty')),
  min_ms             INTEGER NOT NULL,
  max_ms             INTEGER NOT NULL,
  tools_json         TEXT NOT NULL,          -- readonly ToolId[]
  objectives_json    TEXT NOT NULL,          -- readonly Objective[]
  completion_json    TEXT NOT NULL,          -- CompletionCondition
  gate_json          TEXT NOT NULL,          -- HuntGate
  fail_mode_id       TEXT NOT NULL,
  brief_lines_json   TEXT NOT NULL,
  debrief_json       TEXT NOT NULL,
  sort_order         INTEGER NOT NULL DEFAULT 0,
  CHECK (min_ms < max_ms)
);
CREATE INDEX IF NOT EXISTS idx_hunts_creature ON hunts(creature_id);

CREATE TABLE IF NOT EXISTS hunt_event_tables (
  hunt_id            TEXT NOT NULL REFERENCES hunts(id) ON DELETE CASCADE,
  table_id           TEXT NOT NULL,
  PRIMARY KEY (hunt_id, table_id)
);
-- the junction that makes hunts combinatorial: hunts x event tables, both content.

CREATE TABLE IF NOT EXISTS event_tables (
  id                 TEXT PRIMARY KEY NOT NULL,
  phase              TEXT NOT NULL CHECK (phase IN
                       ('threshold','establishing','investigating','escalating','closing','debris')),
  tension_min        REAL NOT NULL CHECK (tension_min >= 0 AND tension_min <= 1),
  tension_max        REAL NOT NULL CHECK (tension_max >= 0 AND tension_max <= 1),
  empty_weight       REAL NOT NULL CHECK (empty_weight > 0),   -- design law 5 as a constraint
  entries_json       TEXT NOT NULL,                            -- readonly WeightedEvent[]
  CHECK (tension_min <= tension_max)
);
CREATE INDEX IF NOT EXISTS idx_event_tables_phase ON event_tables(phase);

CREATE TABLE IF NOT EXISTS event_definitions (
  id                 TEXT PRIMARY KEY NOT NULL,
  category           TEXT NOT NULL CHECK (category IN
                       ('ambient','signal','bait','escalation','retreat','false_positive','ritual','silence')),
  sensory_channel    TEXT NOT NULL,
  label              TEXT NOT NULL,
  body               TEXT NOT NULL,
  weight             REAL NOT NULL CHECK (weight > 0),
  cooldown_ms        INTEGER NOT NULL CHECK (cooldown_ms >= 0),
  min_tension        REAL NOT NULL,
  max_tension        REAL NOT NULL,
  phase_allow_json   TEXT NOT NULL,
  requires_json      TEXT NOT NULL,
  forbids_json       TEXT NOT NULL,
  requires_tools_json TEXT NOT NULL,
  effects_json       TEXT NOT NULL,
  evidence_json      TEXT,                   -- NULL == this event never leaves evidence
  audio_cue          TEXT,
  haptic             TEXT,
  once_per_session   INTEGER NOT NULL DEFAULT 0 CHECK (once_per_session IN (0,1)),
  once_per_case      INTEGER NOT NULL DEFAULT 0 CHECK (once_per_case IN (0,1)),
  extends_silence_ms INTEGER                     -- non-NULL == this event IS silence
);
CREATE INDEX IF NOT EXISTS idx_events_category ON event_definitions(category);

CREATE TABLE IF NOT EXISTS encounter_definitions (
  id                 TEXT PRIMARY KEY NOT NULL,
  creature_id        TEXT NOT NULL REFERENCES creatures(id) ON DELETE CASCADE,
  title              TEXT NOT NULL,
  deliveries_json    TEXT NOT NULL,
  min_tension        REAL NOT NULL,
  window_ms          INTEGER NOT NULL CHECK (window_ms > 0),
  requires_json      TEXT NOT NULL,
  requires_tools_json TEXT NOT NULL,
  min_evidence       INTEGER NOT NULL DEFAULT 0,
  grade_json         TEXT NOT NULL,
  audio_cue          TEXT NOT NULL,
  haptic             TEXT NOT NULL,
  spirit_prompt      TEXT,
  fail_state_id      TEXT,
  aftermath_note     TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_encdefs_creature ON encounter_definitions(creature_id);

CREATE TABLE IF NOT EXISTS badges (
  id                 TEXT PRIMARY KEY NOT NULL,
  name               TEXT NOT NULL,
  description        TEXT NOT NULL,
  hidden             INTEGER NOT NULL DEFAULT 0 CHECK (hidden IN (0,1)),
  criteria_json      TEXT NOT NULL,
  art_ref            TEXT NOT NULL,
  sort_order         INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS wordbanks (
  id                 TEXT PRIMARY KEY NOT NULL,
  locale             TEXT NOT NULL DEFAULT 'en',
  ambiguous_json     TEXT NOT NULL,          -- the words that fit every creature
  specific_json      TEXT NOT NULL           -- per-creature lines, keyed by creature id
);

CREATE TABLE IF NOT EXISTS audio_cues (
  id                 TEXT PRIMARY KEY NOT NULL,
  file_ref           TEXT NOT NULL,          -- resolved to a bundled asset at boot
  kind               TEXT NOT NULL CHECK (kind IN ('ambience','sting','vocal','ui')),
  duration_ms        INTEGER,
  gain_default       REAL NOT NULL DEFAULT 1.0
);
```

**Decision — JSON columns inside catalogue tables rather than fully normalized child tables.** `ArchetypeStage[]`, `Objective[]`, and `ArchetypeWeights` are read **whole, always, once, at boot** into the `ContentRegistry`. Normalizing them would buy queries we never run and cost 9 extra tables and ~20 extra mapper functions. `signature_json`, `weights_json` and `entries_json` all share one property that justifies this: they are **content, validated by Zod before insert**, so the DB never holds a shape the schema does not describe. The split is principled — anything the repositories *filter or join on* is a column; anything only ever read as a unit is JSON.

**Decision — `event_definitions.extends_silence_ms` rather than a `'silence'` row that means "do nothing".** A silence row that fires nothing is indistinguishable from a scheduler bug in the logs. Making it a definition whose effect is to *extend the floor* means silence is counted, cooldown-tracked, and visible in the replay digest — so a 12-minute quiet stretch is auditable as three deliberate silences, not as an absence of decisions.

### I.4 Bundled seed DB, and why it is optional

`assets/db/catalogue-seed.db` is a pre-built catalogue database, shipped as an asset and registered in `metro.config.js` so Metro copies the `.db` extension through. On first launch, if it exists, `migrate()` copies it to the database directory with `File.copy` before running migrations — turning a first-boot content insert of ~200 rows into a file copy.

**Decision — bundle it, but treat it as a cache, never as truth.** The JSON in `src/data/**` remains the source of truth and Zod validation runs in CI, not on device. The seed DB is regenerated by a repo script (`scripts/build-catalogue-db.ts`) that runs the same generator the JSON path would. If the file is missing, corrupted, or version-stale, boot falls back to the JSON path with no user-visible difference beyond ~400 ms. Consequence: the seed DB is never *required*, so a mistake in it cannot brick an install — the failure mode of the optimistic path is a slow first boot, which is an acceptable trade for the fast one.

### I.5 User tables

```sql
-- 001_init.ts — USER -----------------------------------------------------------

CREATE TABLE IF NOT EXISTS sessions (
  id                    TEXT PRIMARY KEY NOT NULL,
  hunt_id               TEXT NOT NULL,                 -- content id, validated in code (§I.1)
  case_id               TEXT REFERENCES case_reports(id) ON DELETE SET NULL,
  seed                  TEXT NOT NULL,
  content_version       TEXT NOT NULL,
  status                TEXT NOT NULL CHECK (status IN
                          ('briefing','active','paused','completed','abandoned','aborted_low_storage')),
  phase                 TEXT NOT NULL CHECK (phase IN
                          ('threshold','establishing','investigating','escalating','closing','debris')),
  case_name             TEXT,
  intention             TEXT CHECK (intention IN ('contact','observe','document','debunk','accompany')),
  seed_parts_json       TEXT NOT NULL,                 -- SeedParts, verbatim (§H.2)
  conditions_json       TEXT NOT NULL,                 -- ConditionsSummary for the report
  directive_id          TEXT NOT NULL,
  intensity             TEXT NOT NULL CHECK (intensity IN ('gentle','standard','intense')),
  low_power             INTEGER NOT NULL DEFAULT 0 CHECK (low_power IN (0,1)),
  charted               INTEGER NOT NULL DEFAULT 0 CHECK (charted IN (0,1)),
  coverage_json         TEXT NOT NULL,                 -- SensorId[] that actually contributed
  degraded_json         TEXT NOT NULL,                 -- SensorId[]
  started_at_ms         INTEGER NOT NULL,
  ended_at_ms           INTEGER,
  elapsed_ms            INTEGER NOT NULL DEFAULT 0,
  tick_count            INTEGER NOT NULL DEFAULT 0,
  end_reason            TEXT CHECK (end_reason IN
                          ('user_finished','user_left_field','time_cap_reached','battery_guard',
                           'app_killed','storage_guard')),
  created_at_ms         INTEGER NOT NULL,
  updated_at_ms         INTEGER NOT NULL,
  CHECK (ended_at_ms IS NULL OR ended_at_ms >= started_at_ms)
);
CREATE INDEX IF NOT EXISTS idx_sessions_status      ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_started     ON sessions(started_at_ms DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_hunt        ON sessions(hunt_id);
-- At most one live session, enforced by the database rather than by the store.
CREATE UNIQUE INDEX IF NOT EXISTS uq_sessions_live
  ON sessions(status) WHERE status IN ('briefing','active','paused');
```

**Why the partial unique index on `status`.** `SessionService.activeSession()` must be a lookup, not a scan, and the single most damaging state the app can reach is two "active" sessions after a crash-and-relaunch. A partial unique index makes that state **unrepresentable in SQLite**, so recovery code cannot create it by forgetting an invariant. This is the one place where a schema constraint is worth more than repository discipline.

```sql
CREATE TABLE IF NOT EXISTS session_ticks (
  session_id         TEXT PRIMARY KEY NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  segment_count      INTEGER NOT NULL DEFAULT 0,
  -- RLE tick digest (§I.6). One row per session, one blob, not one row per tick.
  digest_blob        BLOB NOT NULL,
  first_tick_ms      INTEGER NOT NULL,
  last_tick_ms       INTEGER NOT NULL,
  checksum           TEXT NOT NULL,          -- sha256 of the decoded digest; replay parity guard
  updated_at_ms      INTEGER NOT NULL
);
```

```sql
CREATE TABLE IF NOT EXISTS evidence (
  id                 TEXT PRIMARY KEY NOT NULL,
  session_id         TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  case_id            TEXT REFERENCES case_reports(id) ON DELETE SET NULL,
  creature_id        TEXT NOT NULL,          -- content id, no FK (§I.1)
  encounter_id       TEXT,                   -- user id, FK below where useful
  kind               TEXT NOT NULL CHECK (kind IN
                       ('emf_swing','voice_capture','word_bank_hit','photo_anomaly','shadow_pass',
                        'footprint','tree_knock','sky_light','user_note','user_audio')),
  channel            TEXT NOT NULL CHECK (channel IN
                       ('emf','audio','visual','thermal','motion','log')),
  strength           TEXT NOT NULL CHECK (strength IN ('faint','present','strong','unqualified')),
  signature_slot     TEXT CHECK (signature_slot IN
                       ('trace','voice','form','habit','place','refusal')),
  at_ms              INTEGER NOT NULL,
  caption            TEXT NOT NULL,
  user_note          TEXT,
  verdict            TEXT CHECK (verdict IN ('unexplained','inconclusive','explained')),
  triaged_at_ms      INTEGER,
  contested          INTEGER NOT NULL DEFAULT 0 CHECK (contested IN (0,1)),
  created_at_ms      INTEGER NOT NULL,
  updated_at_ms      INTEGER NOT NULL,
  -- a verdict and its timestamp are set together or not at all
  CHECK ((verdict IS NULL) = (triaged_at_ms IS NULL))
);
CREATE INDEX IF NOT EXISTS idx_evidence_session  ON evidence(session_id, at_ms);
CREATE INDEX IF NOT EXISTS idx_evidence_case     ON evidence(case_id);
CREATE INDEX IF NOT EXISTS idx_evidence_kind     ON evidence(kind);
CREATE INDEX IF NOT EXISTS idx_evidence_untriaged ON evidence(session_id) WHERE verdict IS NULL;
```

**Decision — the `CHECK ((verdict IS NULL) = (triaged_at_ms IS NULL))` pair constraint.** Untriaged evidence is a *state*, not a null field, and the report's triage summary is computed by counting non-null verdicts. Without this constraint, a partially-applied triage write leaves a row that is neither triaged nor untriaged, and the summary's numbers stop adding up to the total. The constraint makes that impossible; the cost is that `EvidenceService.triage` must write both columns in one statement, which it already does.

```sql
CREATE TABLE IF NOT EXISTS encounters (
  id                 TEXT PRIMARY KEY NOT NULL,
  session_id         TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  case_id            TEXT REFERENCES case_reports(id) ON DELETE SET NULL,
  definition_id      TEXT NOT NULL,          -- content
  creature_id        TEXT NOT NULL,          -- content
  at_ms              INTEGER NOT NULL,
  delivery           TEXT NOT NULL CHECK (delivery IN
                       ('peripheral_visual','haptic_only','audio_only','screen_glitch',
                        'environmental','absence')),
  outcome            TEXT NOT NULL CHECK (outcome IN
                       ('witnessed','partially_witnessed','missed','declined','absent')),
  proximity          TEXT NOT NULL CHECK (proximity IN ('distant','near','adjacent','unknown')),
  fail_state_id      TEXT,
  caption            TEXT NOT NULL,
  aftermath_note     TEXT,
  offered_json       TEXT NOT NULL DEFAULT '[]',   -- EvidenceStrength[] the encounter put on the table
  was_guaranteed     INTEGER NOT NULL DEFAULT 0 CHECK (was_guaranteed IN (0,1)),
  directive_reason   TEXT,                   -- 'first_run' | 'daily_anomaly' | 'scripted_intro' | 'director'
  created_at_ms      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_encounters_session ON encounters(session_id, at_ms);
CREATE INDEX IF NOT EXISTS idx_encounters_case    ON encounters(case_id);
CREATE INDEX IF NOT EXISTS idx_encounters_creature ON encounters(creature_id);

CREATE TABLE IF NOT EXISTS investigation_events (
  id                 TEXT PRIMARY KEY NOT NULL,
  session_id         TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  definition_id      TEXT NOT NULL,          -- content
  category           TEXT NOT NULL,
  at_ms              INTEGER NOT NULL,
  tick_index         INTEGER NOT NULL,
  strength           REAL NOT NULL CHECK (strength >= 0 AND strength <= 1),
  source_id          TEXT NOT NULL,          -- which EventSource produced it
  label              TEXT NOT NULL,
  created_at_ms      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_inevents_session ON investigation_events(session_id, at_ms);
-- only interesting events are stored: category 'ambient' and 'silence' are kept out (see I.7)
```

**Decision — `investigation_events` stores the notable events only, while `session_ticks` stores every tick.** Two stores, two purposes: the tick digest is for replay (complete, compressed, opaque), the event table is for the journal and the report (sparse, readable, joinable). Writing every ambient event as a row would put thousands of rows per session in the database for no reader — the report never renders ambient events individually, it renders their *aggregate* as the silence beats.

```sql
CREATE TABLE IF NOT EXISTS case_reports (
  id                 TEXT PRIMARY KEY NOT NULL,
  session_id         TEXT NOT NULL UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
  hunt_id            TEXT NOT NULL,
  creature_id        TEXT NOT NULL,
  seed               TEXT NOT NULL,
  content_version    TEXT NOT NULL,
  case_name          TEXT NOT NULL,
  status             TEXT NOT NULL CHECK (status IN ('unexplained','inconclusive','explained')),
  status_rationale   TEXT NOT NULL,
  headline           TEXT NOT NULL,
  narrative_json     TEXT NOT NULL,          -- readonly CaseNarrativeBeat[]
  signature_json     TEXT NOT NULL,          -- SignatureProgress
  triage_json        TEXT NOT NULL,          -- TriageSummary
  sectors_json       TEXT NOT NULL,
  objectives_json    TEXT NOT NULL,
  graphs_json        TEXT NOT NULL,
  conditions_json    TEXT NOT NULL,
  user_account       TEXT,
  encounter_count    INTEGER NOT NULL DEFAULT 0,
  evidence_count     INTEGER NOT NULL DEFAULT 0,
  duration_ms        INTEGER NOT NULL,
  end_reason         TEXT NOT NULL,
  clearance_after    TEXT NOT NULL,
  share_variant      TEXT NOT NULL CHECK (share_variant IN
                       ('case_file','evidence_reel','conditions_slip','signature_sheet')),
  opened_at_ms       INTEGER NOT NULL,
  sealed_at_ms       INTEGER NOT NULL,
  exported_at_ms     INTEGER,
  created_at_ms      INTEGER NOT NULL,
  updated_at_ms      INTEGER NOT NULL,
  CHECK (sealed_at_ms >= opened_at_ms)
);
CREATE INDEX IF NOT EXISTS idx_reports_sealed   ON case_reports(sealed_at_ms DESC);
CREATE INDEX IF NOT EXISTS idx_reports_creature ON case_reports(creature_id);
-- A case is sealed exactly once: UNIQUE on session_id is the "one report per night" invariant.
```

**Decision — the report is stored as a materialized document with JSON sections, not derived at read time.** This is the same call as §H.9, restated at the schema level: the columns that get *queried* (`sealed_at_ms`, `status`, `creature_id`, `share_variant`) are real columns with indexes; the sections that are only ever *rendered whole* (`narrative_json`, `graphs_json`, `sectors_json`) are JSON. A report is a document with a few searchable facts on its cover, which is exactly what a case file is. Consequence: the report screen is a **single indexed row read with zero joins**, which is what makes the share-deep-link cold launch instant.

```sql
CREATE TABLE IF NOT EXISTS media (
  id                 TEXT PRIMARY KEY NOT NULL,
  evidence_id        TEXT REFERENCES evidence(id) ON DELETE CASCADE,
  case_id            TEXT REFERENCES case_reports(id) ON DELETE CASCADE,
  kind               TEXT NOT NULL CHECK (kind IN ('photo','audio','share_card')),
  relative_path      TEXT NOT NULL,          -- relative to Paths.document; NEVER an absolute path
  mime               TEXT NOT NULL,
  bytes              INTEGER NOT NULL CHECK (bytes >= 0),
  duration_ms        INTEGER,
  width              INTEGER,
  height             INTEGER,
  checksum           TEXT NOT NULL,
  orphan_checked_at_ms INTEGER,
  created_at_ms      INTEGER NOT NULL,
  -- a media row belongs to exactly one owner
  CHECK ((evidence_id IS NULL) <> (case_id IS NULL))
);
CREATE INDEX IF NOT EXISTS idx_media_evidence ON media(evidence_id);
CREATE INDEX IF NOT EXISTS idx_media_case     ON media(case_id);
CREATE INDEX IF NOT EXISTS idx_media_orphans  ON media(orphan_checked_at_ms);
```

**Why `relative_path` and never an absolute path.** iOS changes the app container path on every app update. A stored absolute path is a broken image after the next TestFlight build, and the failure surfaces months later as "my old cases have no photos". Every media read resolves `Paths.document + relative_path` at use time.

**Why the `CHECK ((evidence_id IS NULL) <> (case_id IS NULL))`.** XOR, not OR: a share card belongs to a case and no evidence, a photo belongs to an evidence item and (via it) a case. Allowing both would let a row be owned twice and be deleted once.

```sql
CREATE TABLE IF NOT EXISTS discoveries (
  id                 TEXT PRIMARY KEY NOT NULL,
  kind               TEXT NOT NULL CHECK (kind IN ('creature','signature_slot','event','sector','anomaly')),
  ref_id             TEXT NOT NULL,          -- content id or a generated sector id
  creature_id        TEXT,
  first_seen_at_ms   INTEGER NOT NULL,
  first_case_id      TEXT REFERENCES case_reports(id) ON DELETE SET NULL,
  count              INTEGER NOT NULL DEFAULT 1 CHECK (count > 0),
  UNIQUE (kind, ref_id)
);
CREATE INDEX IF NOT EXISTS idx_discoveries_creature ON discoveries(creature_id);

CREATE TABLE IF NOT EXISTS badge_awards (
  id                 TEXT PRIMARY KEY NOT NULL,
  badge_id           TEXT NOT NULL,          -- content id
  case_id            TEXT REFERENCES case_reports(id) ON DELETE SET NULL,
  evidence_id        TEXT REFERENCES evidence(id) ON DELETE SET NULL,
  awarded_at_ms      INTEGER NOT NULL,
  seen               INTEGER NOT NULL DEFAULT 0 CHECK (seen IN (0,1)),
  UNIQUE (badge_id)
);
-- UNIQUE(badge_id): a badge is awarded once, ever. The reveal animation is driven by `seen`.

CREATE TABLE IF NOT EXISTS user_progress (
  id                 TEXT PRIMARY KEY NOT NULL DEFAULT 'self',
  clearance          TEXT NOT NULL CHECK (clearance IN
                       ('visitor','field_notes','accredited','senior','archivist','unknown_sightings')),
  cases_sealed       INTEGER NOT NULL DEFAULT 0 CHECK (cases_sealed >= 0),
  evidence_logged    INTEGER NOT NULL DEFAULT 0 CHECK (evidence_logged >= 0),
  encounters_witnessed INTEGER NOT NULL DEFAULT 0 CHECK (encounters_witnessed >= 0),
  unexplained_count  INTEGER NOT NULL DEFAULT 0 CHECK (unexplained_count >= 0),
  explained_count    INTEGER NOT NULL DEFAULT 0 CHECK (explained_count >= 0),
  contested_explained INTEGER NOT NULL DEFAULT 0 CHECK (contested_explained >= 0),
  no_encounter_cases INTEGER NOT NULL DEFAULT 0 CHECK (no_encounter_cases >= 0),
  shared_cards       INTEGER NOT NULL DEFAULT 0 CHECK (shared_cards >= 0),
  distinct_channels  INTEGER NOT NULL DEFAULT 0 CHECK (distinct_channels >= 0),
  nights_active      INTEGER NOT NULL DEFAULT 0 CHECK (nights_active >= 0),
  streak_nights      INTEGER NOT NULL DEFAULT 0 CHECK (streak_nights >= 0),
  last_night_key     TEXT,
  first_case_at_ms   INTEGER,
  last_case_at_ms    INTEGER,
  created_at_ms      INTEGER NOT NULL,
  updated_at_ms      INTEGER NOT NULL,
  CHECK (id = 'self')
);
-- single-row table. CHECK (id='self') makes a second progress row impossible.
```

**Why a single-row `user_progress` table and not a `kv` key.** It is multi-column, it participates in the same transaction as the report insert (§G.3's finish path), and `CHECK (id = 'self')` makes the singleton structural. `kv-store` is for scalars that are read at boot; this is a domain aggregate that is written in a transaction.

```sql
CREATE TABLE IF NOT EXISTS journal_entries (
  id                 TEXT PRIMARY KEY NOT NULL,
  kind               TEXT NOT NULL CHECK (kind IN
                       ('case_sealed','evidence_logged','encounter','night_note','clearance_change',
                        'badge','unlock','daily_anomaly','first_of_kind')),
  at_ms              INTEGER NOT NULL,
  night_key          TEXT NOT NULL,          -- Clock.dayKey() with the 04:00 cutoff (§H.11)
  title              TEXT NOT NULL,
  body               TEXT NOT NULL,
  session_id         TEXT REFERENCES sessions(id) ON DELETE SET NULL,
  case_id            TEXT REFERENCES case_reports(id) ON DELETE SET NULL,
  evidence_id        TEXT REFERENCES evidence(id) ON DELETE SET NULL,
  creature_id        TEXT,
  thumb_uri          TEXT,
  hidden             INTEGER NOT NULL DEFAULT 0 CHECK (hidden IN (0,1)),
  pinned             INTEGER NOT NULL DEFAULT 0 CHECK (pinned IN (0,1)),
  created_at_ms      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_journal_night  ON journal_entries(night_key DESC, at_ms DESC);
CREATE INDEX IF NOT EXISTS idx_journal_case   ON journal_entries(case_id);
CREATE INDEX IF NOT EXISTS idx_journal_visible ON journal_entries(at_ms DESC) WHERE hidden = 0;
```

```sql
CREATE TABLE IF NOT EXISTS analytics_events (
  id                 TEXT PRIMARY KEY NOT NULL,
  seq                INTEGER NOT NULL,       -- monotonic; the ring-buffer prune key
  name               TEXT NOT NULL CHECK (name IN
                       ('app_opened','onboarding_step','permission_shown','permission_outcome',
                        'hunt_started','hunt_completed','hunt_abandoned','evidence_found',
                        'encounter_triggered','encounter_missed','triage_verdict','report_viewed',
                        'report_shared','share_card_saved','paywall_viewed','purchase_completed',
                        'journal_opened','daily_anomaly_opened','sensor_degraded','low_power_toggled')),
  props_json         TEXT NOT NULL,
  session_id         TEXT,                   -- deliberately NOT an FK: analytics must outlive deletes
  at_ms              INTEGER NOT NULL,
  flushed            INTEGER NOT NULL DEFAULT 0 CHECK (flushed IN (0,1))
);
CREATE INDEX IF NOT EXISTS idx_analytics_seq ON analytics_events(seq DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_name ON analytics_events(name, at_ms DESC);

CREATE TABLE IF NOT EXISTS daily_anomalies (
  day_key            TEXT PRIMARY KEY NOT NULL,   -- 'YYYY-MM-DD' local, 04:00 cutoff
  creature_id        TEXT,                        -- content id, may be NULL on a quiet day
  headline           TEXT NOT NULL,
  body               TEXT NOT NULL,
  directive_json     TEXT NOT NULL,               -- SessionDirective applied to tonight's hunts
  seed_salt          TEXT NOT NULL,
  viewed             INTEGER NOT NULL DEFAULT 0 CHECK (viewed IN (0,1)),
  created_at_ms      INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS purchased_products (
  product_id         TEXT PRIMARY KEY NOT NULL,
  kind               TEXT NOT NULL CHECK (kind IN ('non_consumable','subscription')),
  purchased_at_ms    INTEGER NOT NULL,
  expires_at_ms      INTEGER,
  revoked_at_ms      INTEGER,
  raw_receipt_hint   TEXT                        -- opaque store id only; no receipt body, no PII
);
-- The entitlement *cache*. The store is the source of truth; this table exists so an offline
-- launch can render the right gate without a network call (Hard constraint 13).
```

**Decision — `purchased_products` is a local cache of entitlements, never the authority.** With no backend (constraint 13), the purchase state must survive an offline launch, so the row is written on purchase and on each restore. It stores only the product id and a timestamp hint — never a receipt body, never an account identifier. Rationale: a local table that *could* be forged is a much smaller problem than an app that cannot open the paid content on a plane, and the store's own receipt validation on the next online launch is the real check. The `revoked_at_ms` column exists so a refund processed by the store can land on the next launch without deleting history.

### I.6 RLE tick-digest storage format

`session_ticks.digest_blob` is the replay key from §G.3 and the input to the golden-seed tests. Format, decided once:

```
HEADER (16 bytes, little-endian)
  magic        4 bytes  "NTRL"
  version      1 byte   =1
  tickHz       1 byte   =6 (SENSOR_TICK_HZ)
  reserved     2 bytes  0
  segmentCount 4 bytes  uint32
  totalTicks   4 bytes  uint32

SEGMENT (repeated, 24 bytes each, fixed width — see below)
  startTick    4 bytes  uint32   first tick of the run
  runLength    2 bytes  uint16   ticks in this run (1..65535)
  phase        1 byte   enum index into SESSION_PHASE_ORDER
  tensionBand  1 byte   quantized tension, 0..250 -> tension*2.5
  rngDraws     4 bytes  uint32   rng.draws at the START of the run  <-- replay parity check
  flags        4 bytes  bitfield: bit0 evidence, bit1 encounter, bit2 event,
                        bit3 user_action, bit4 degraded_sensors_changed,
                        bit5 torch_on, bit6 pause_boundary, bit7 source_intent
  digestHash   4 bytes  uint32   FNV-1a of the quantized SensorDigest for this run
  eventSalt    4 bytes  uint32   accumulated hash of event ids fired in this run
```

**Why fixed-width segments and not a compact variable encoding.** The whole point of this blob is that a bug report can be turned into a fixture, which means a human or a tool must be able to decode it without a schema and without the encoder. 24 bytes per *run*, not per tick, means a 40-minute session at 6 Hz — 14 400 ticks — compresses to roughly 300–900 segments (≈ 8–22 KB) because the four quantized fields only change on a state transition. `rngDraws` per segment is the parity check that matters: a replay that consumes a different number of RNG draws from the same seed is *provably* divergent, and the check is one integer comparison.

**Decision — the digest is hashed, not stored, per segment.** Storing the full quantized digest per segment would roughly triple the blob for data the engine can recompute from the seed. Since the entire premise of §G.3 is that a seeded engine is deterministic, the digest is derivable and only needs a cheap fingerprint to *verify* derivability. `digestHash` is that fingerprint; a mismatch on replay is a loud, specific failure ("segment 42 diverged at tick 3 180") rather than a silent drift.

**Write path:** `SessionRecorder.append(tick)` folds into the current segment if `phase`, `tensionBand` and flags are unchanged and `runLength < 65535`; otherwise it closes the segment and opens a new one. `flush(db)` encodes the header + segments and `INSERT OR REPLACE`s the single row. Because it is one row, a checkpoint is one write — which is what keeps the 60-second checkpoint in §G.3 off the WAL's hot path.

### I.7 What is deliberately NOT stored, and why

| Not stored | Kept instead | Reason |
|---|---|---|
| Raw 100 Hz sensor samples | the RLE digest's `digestHash` per run | Samples are regenerable from the seed and the digest; storing them turns a 20 KB row into a 40 MB row for zero replay value. |
| Every ambient/silence event as a row | aggregate counts in `sessions.tick_count` and the digest flags | The report renders silences as *duration beats*, never as individual entries. |
| Live tension, radar targets, active event | `sessionStore` (§G.3) | Recomputable from (seed + content version + tick log) — the state rule from §G.3, applied. |
| Settings | `kv-store` | Already SQLite, no migration, sync getters for boot (§G.4). |
| Any coordinate on a report | `seed_parts_json` coarse bucket, `sectors_json` labels | A case file that names a precise location is a privacy problem and a stalker's tool. The report says "the north side of the house", never a lat/lon. |
| Free-text user notes outside `evidence.user_note` / `case_reports.user_account` | those two columns | Two known places for user prose means "what could leak in an export" is a two-item answer. |

### I.8 Indexes, budget and pruning

- **Index budget.** 21 user-side indexes + 8 catalogue indexes. Every index above is justified by an actual query in `repositories/*`: the journal timeline (`idx_journal_visible`), the report list (`idx_reports_sealed`), untriaged evidence at seal time (`idx_evidence_untriaged`), analytics prune (`idx_analytics_seq`). There are no speculative indexes — each one costs write time on the 60-second checkpoint path.
- **Analytics retention.** `AnalyticsService.flush()` deletes `WHERE seq < (SELECT MAX(seq) - 2000)`. The ring is 2 000 rows per §G.4; at realistic volume that is roughly a year of local history, which is enough to answer "has this been broken for a while" and small enough that analytics can never be the biggest table.
- **Tick-digest pruning.** On launch, after the orphan-file sweep, delete `session_ticks` rows for sessions whose report `exported_at_ms IS NOT NULL` and `sealed_at_ms < now - 180 days`. Un-exported cases keep their digest forever — a case the user still has is a case they might replay, and 20 KB × a few hundred cases is under 5 MB.
- **Size expectations.** 100 cases with ~12 evidence items and 6 media files each ≈ 12 MB database + 300 MB media (dominant, and user-visible). Photos are written at a capped long edge (decided in `01-*`'s asset spec) because media, not SQLite, is the storage risk on a 64 GB phone.

### I.9 Migration list

Migrations are the ordered array in `src/db/migrations/index.ts`, applied by `PRAGMA user_version`, each in a transaction (§G.4). The shipped list, decided up front so that no later ticket invents a migration number:

| Version | Name | Contents |
|---|---|---|
| `001_init` | Initial schema | Everything in §I.3 and §I.5. Catalogue + user tables in one migration because MVP ships them together. |
| `002_content_rebuild_journal` | Content rebuild bookkeeping | `catalogue_meta` rows for `last_rebuild_at_ms` and `rebuild_count`; the diagnostic that tells support whether a user's missing creature is a content bug. |
| `003_session_events_index` | Composite event index | `idx_inevents_session_category` for the report's per-category event aggregation, added when the report was profiled. |
| `004_media_orphan_sweep` | Orphan bookkeeping | `media.orphan_checked_at_ms` + `idx_media_orphans`, moved out of `001` once the sweep shipped. |
| `005_evidence_fts` | Journal search | An FTS5 virtual table over `evidence.user_note` and `case_reports.user_account` + sync triggers. |
| `006_purchases` | Entitlement cache | `purchased_products` and `$` columns when the paywall ships (post-MVP). |
| `007_daily_shared_seed` | Shared-seed nights | `daily_anomalies.seed_salt` and a `shared_seed_key` column — the seam for the global shared-seed night. |

**Decision — ship the whole MVP schema in `001_init`, and add `003`+ only for things this document does not yet specify.** A migration is a permanent liability; `001` being large is cheap because nothing has shipped against it. Once `001` ships, rule (3) from §G.4 applies: additive only, and any destructive change requires a `backupDatabaseAsync()` and a `.bak` restore path. The date at which `001` freezes is the first TestFlight build day in §Q, which is the real reason §Q front-loads the data layer.

### I.10 Relationship summary

```text
CATALOGUE (rebuilt together; FKs inside only)
  creatures ──1:N── hunts ──N:M── event_tables
      │                │
      │                └── event_definitions (referenced by entries_json, validated in code)
      ├──1:N── encounter_definitions
      └──1:1/N── behaviour_archetypes (by archetype_id, validated in code)
  badges · wordbanks · audio_cues · catalogue_meta   (standalone)

USER (never touched by a rebuild; FKs inside only)
  sessions ──1:1── session_ticks           (CASCADE)
      │
      ├──1:N── evidence ──1:N── media ──┐  (evidence CASCADE, media by evidence_id)
      ├──1:N── encounters               │  (CASCADE)
      ├──1:N── investigation_events     │  (CASCADE)
      └──1:1── case_reports ────────────┘  (case_id, SET NULL on report delete)
                   │
                   ├──1:N── discoveries    (SET NULL)
                   ├──1:N── badge_awards   (SET NULL)
                   └──1:N── journal_entries(SET NULL)
  user_progress (singleton) · daily_anomalies · purchased_products · analytics_events

CROSS-FAMILY (no FK — validated in repositories against ContentRegistry)
  sessions.hunt_id · evidence.creature_id · encounters.definition_id/creature_id
  investigation_events.definition_id · case_reports.hunt_id/creature_id
  journal_entries.creature_id · daily_anomalies.creature_id · badge_awards.badge_id
```

Read it as: **a cascade can never cross the dotted line.** Deleting a creature from a content rebuild touches the bottom-left block only; deleting a case touches only the user block. Everything that crosses is a `TEXT` id with a code-level check, which is the FK-asymmetry rule of §I.1 drawn once.
---

## M. Implementation backlog

> Tickets are ordered for execution, not for tidiness. The ordering obeys the design law **Engine → Report → Journal** (Hard constraint 3): the report and share card are built in Phase 2, *before* any tool exists in Phase 4. A tool that cannot feed a working report has nothing to feed. Every ticket is small enough to land in half a day or less, and each has a single owner (the one engineer) and a verifiable finish line.
>
> **ID scheme.** `T-<phase>.<n>`. Phases 0–4 map 1:1 onto the §Q weeks; Phases 5–6 are the creature and ship passes. A ticket never depends on a ticket with a higher phase number.

### Phase 0 — Foundation (T-0.x)

**T-0.1 — Scaffold the project and lock the toolchain**
- **Goal.** A running dev build with the exact package set from §G.1, in a repo that can be built by CI and by `expo-dev-client` on both platforms.
- **Files.** `package.json`, `app.config.ts`, `eas.json`, `metro.config.js`, `tsconfig.json`, `babel.config.js`, `.gitignore`.
- **Depends on.** —
- **Done when.** `npx expo install --check` reports no version drift; `tsconfig` has `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`; `npx expo run:ios` and `run:android` both launch a blank `src/app/index.tsx`; `metro.config.js` registers `.db` in `assetExts` (§I.4); `npm ls expo-av` is empty.

**T-0.2 — Design tokens and theme provider**
- **Goal.** One source of colour, spacing, type scale and motion curves, with a dark-only palette that reads at 3 a.m. without wrecking night vision.
- **Files.** `src/ui/theme/{colors,spacing,typography,motion,index}.ts`, `src/app/_layout.tsx` (theme slot).
- **Depends on.** T-0.1.
- **Done when.** No hex literal exists outside `theme/colors.ts` (asserted by an ESLint rule); spacing is a named scale (`xs|sm|md|lg|xl`) with no raw pixel gaps in components; the motion tokens expose the three durations the report and tools will share.

**T-0.3 — UI primitives**
- **Goal.** The eight primitives every screen composes from, so no screen hand-rolls a card.
- **Files.** `src/ui/primitives/{Text,Panel,Button,Pressable,StatRow,EmptyState,ConfidenceCone,SignalBars}.tsx`, `src/ui/overlays/{ScanLines,NoiseField,Vignette}.tsx`.
- **Depends on.** T-0.2.
- **Done when.** Each primitive has a `jest-expo` render test and a props interface with no `any`; `ConfidenceCone` renders a cone from `{bearingDeg, coneWidthDeg}` with no numeric text; `EmptyState` exists because "absence is meaningful" applies to every list in the app; all primitives accept a `testID`.

**T-0.4 — Navigation shell: four tabs and the onboarding stack**
- **Goal.** Lock the information architecture: **Home · Investigate · Field Journal · Profile**, plus onboarding, plus the hunt/case stacks from §G.2. No Equipment tab exists (law 9).
- **Files.** `src/app/_layout.tsx`, `src/app/(tabs)/_layout.tsx` + the four tab routes as stubs, `src/app/(onboarding)/*`, `src/app/hunt/[huntId]/{_layout,brief,session}.tsx` stubs, `src/app/case/[caseId]/*` stubs, `src/app/(modals)/*`.
- **Depends on.** T-0.1.
- **Done when.** Tab typing via Expo Router typed routes compiles; a test asserts the tab route list is exactly `['index','investigate','journal','profile']`; `hunt/[huntId]/_layout.tsx` sets `gestureEnabled: true` with an intercept that fires the "leaving the field" confirm; every stub route renders its name.

**T-0.5 — SQLite client, PRAGMAs and provider**
- **Goal.** One database handle, opened once, with the WAL configuration from §G.4.
- **Files.** `src/db/client.ts`, `src/app/_layout.tsx` (`SQLiteProvider onInit`), `src/db/kv.ts`.
- **Depends on.** T-0.1.
- **Done when.** `PRAGMA journal_mode` returns `wal`, `foreign_keys` returns `1`, `busy_timeout` returns `5000`; opening the DB twice returns the same handle; the expo-sqlite Inspector shows the database in the dev client.

**T-0.6 — Migration runner and `001_init`**
- **Goal.** The complete schema from §I.3 and §I.5, applied by `PRAGMA user_version`.
- **Files.** `src/db/migrations/{index.ts,001_init.ts}`, `src/db/__tests__/migrations.test.ts`.
- **Depends on.** T-0.5.
- **Done when.** A test proves `migrate()` is idempotent (run twice, assert no throw and no schema diff); a test asserts the set of table names matches a golden list from §I; every `CHECK` constraint in §I is present; `user_version` ends at `1`.

**T-0.7 — Mappers and the repository skeleton**
- **Goal.** The row ⇄ model boundary from §G.4, with the first two repositories implemented as the pattern the rest copy.
- **Files.** `src/db/mappers/{common,session,evidence}.ts`, `src/db/repositories/{SessionRepository,EvidenceRepository}.ts`, `src/db/errors.ts`.
- **Depends on.** T-0.6.
- **Done when.** Every repository method takes and returns `engine/models` types and contains the only SQL literals in the file; explicit column lists (no `SELECT *`) asserted by a test that greps the repository sources; a typed `ContentRefError` is thrown for an unknown content id (§I.1); a mapper round-trip test covers every enum in §H with a value.

**T-0.8 — Content schemas, registry and versioning**
- **Goal.** Content as validated data, with the rebuild trigger from §G.4 and the type-parity contract from §H.13.
- **Files.** `src/data/schemas.ts`, `src/data/ContentRegistry.ts`, `src/data/ContentVersion.ts`, `src/data/creatures/*.json` (one placeholder), `scripts/validate-content.ts`.
- **Depends on.** T-0.6.
- **Done when.** `z.infer<typeof HuntDefinitionSchema>` is bidirectionally assignable to `HuntDefinition` in a type test; a deliberate typo in a fixture JSON fails `npm run validate:content`; `ContentRegistry.hunt(id)` throws a typed error for an unknown id; `ContentVersion.CURRENT` is read from one place.

**T-0.9 — SensorHub, channels and duty-cycle ladder**
- **Goal.** The §G.5 abstraction: one interface for every input, ring buffers instead of state, `SensorDigest` at 6 Hz, and the full fallback table.
- **Files.** `src/sensors/{SensorHub.ts,useSensor.ts,dutyCycle.ts,quantize.ts,permissions.ts,types.ts}`, `src/sensors/channels/*.ts`, `src/store/sensorStore.ts`.
- **Depends on.** T-0.3, T-0.5.
- **Done when.** `hub.digest()` returns the §H.4 shape with `degraded` correctly populated when a channel is disabled in a test; no channel calls `setState` per sample (asserted by a render-count test); `hub.setMode('suspended')` stops every listener (asserted by a spy); every fallback row in §G.5 has a test; `subscription.remove()` is used everywhere and no `removeSubscription` appears in the codebase.

**T-0.10 — Seeded random engine with golden vectors**
- **Goal.** `RandomEngine` per §G.6 — pure, order-independent `fork()`, replay-exact.
- **Files.** `src/engine/RandomEngine.ts`, `src/engine/models/random.ts`, `src/engine/__tests__/random.golden.test.ts`.
- **Depends on.** T-0.1.
- **Done when.** The same seed produces byte-identical draw sequences across 100 000 draws, asserted against a committed golden vector file; `fork('a')` before or after `fork('b')` yields identical substreams (order independence); `exponent(mean)` produces a hard floor and a long tail, asserted by a distribution test with a bound, not a snapshot.

### Phase 1 — Investigation Engine (T-1.x)

**T-1.1 — Tension engine and phase machine**
- **Goal.** Tension 0–100 with hysteresis, the six session phases, and legal transitions.
- **Files.** `src/engine/TensionEngine.ts`, `src/engine/rules/gates.ts`, `src/engine/models/tick.ts` (context).
- **Depends on.** T-0.10.
- **Done when.** Phase transitions are a table, not `if`s; a test asserts no transition can skip `threshold → investigating` before 60 s; tension decay is asymmetric (rises fast, falls slow) and asserted; `threshold` phase can never emit an event.

**T-1.2 — Event scheduler, event tables and silence floors**
- **Goal.** Weighted selection against the §H.7 `EventTable`, with `emptyWeight > 0` enforced and a silence floor between signals.
- **Files.** `src/engine/EventScheduler.ts`, `src/engine/rules/{silence,cooldown}.ts`.
- **Depends on.** T-1.1, T-0.8.
- **Done when.** A golden-seed test asserts a specific seed produces three consecutive silence outcomes in the `establishing` phase; no two events fire closer than the phase's silence floor across a 10 000-tick simulated session; a `once_per_session` event never fires twice (asserted across 50 seeds); the `silence`-category event extends the floor rather than firing (§I.3).

**T-1.3 — Radar simulator with target lifecycles**
- **Goal.** Every target born with bearing, radius, uncertainty and death — no forever-random dots.
- **Files.** `src/engine/RadarSimulator.ts`, `src/engine/models/radar.ts`.
- **Depends on.** T-0.10.
- **Done when.** Every spawned target has a non-null `expiresAtMs`; a test asserts a target's cone narrows monotonically while observed and its uncertainty only ever grows; `dissolve` is the only removal path (asserted by an API test: no `targets.pop()`); a 20-minute simulated session never exceeds 4 concurrent targets.

**T-1.4 — EMF pipeline (EMA → baseline → delta → score → bucket)**
- **Goal.** Turn noisy samples into the four buckets of §H.4, with the accelerometer-based residual fallback.
- **Files.** `src/engine/EmfPipeline.ts`, `src/sensors/quantize.ts` (shared bucket boundaries).
- **Depends on.** T-0.9.
- **Done when.** The same raw sample series produces the same bucket on two runs; the residual path produces the same bucket *distribution* as the magnetic path over a fixed fixture (asserted with a tolerance, so the fallback feels equivalent); no bucket is ever exposed as a number.

**T-1.5 — Archetype runtime, registry and the four archetypes**
- **Goal.** Observer, Stalker, Mimic, Ambusher as `ArchetypeRuntime` implementations driven entirely by their JSON `parameters`. The engine imports the registry, never a creature (law 7).
- **Files.** `src/engine/archetypes/{Observer,Stalker,Mimic,Ambusher}.ts`, `src/engine/archetypes/registry.ts`, `src/data/archetypes/*.json`.
- **Depends on.** T-1.1, T-0.8.
- **Done when.** A grep test asserts no file under `src/engine/` mentions `'ghost'`, `'bigfoot'`, `'shadow'` or `'alien'`; changing a number in `observer.json` changes the simulated session shape (asserted by a golden-seed diff); each archetype's `evaluateFail` returns its own distinct fail state; every archetype emits only `ArchetypeEffect` values (no direct state writes, asserted by the interface).

**T-1.6 — Session directives and the first-run guarantee**
- **Goal.** `SessionDirective` as the only editorial authority; the free first hunt guarantees one encounter inside a window (law 8).
- **Files.** `src/engine/directives/SessionDirective.ts`, `src/engine/directives/tutorial.ts`.
- **Depends on.** T-1.5.
- **Done when.** A 200-seed sweep asserts `tutorialDirective` produces exactly one encounter and that it lands inside `[earliestMs, latestMs]` every time; `DefaultDirective` produces at least one no-encounter case in the same sweep (absence is reachable); a directive cannot name an event, only constrain (§H.3).

**T-1.7 — `InvestigationEngine` tick loop and the emission union**
- **Goal.** The pure orchestrator: `tick`, `request`, `finish`, returning the full §H.8 union.
- **Files.** `src/engine/InvestigationEngine.ts`, `src/engine/models/emissions.ts`.
- **Depends on.** T-1.2, T-1.3, T-1.4, T-1.5, T-1.6.
- **Done when.** The engine imports nothing from `react`, `react-native`, `expo*` or `zustand` (ESLint boundary, per §G.2); `tick` is pure — calling it twice with the same input returns deep-equal results; `assertNever` is reachable from every consumer's switch; a `request('ask_question')` may return an empty array and that is a tested success case.

**T-1.8 — `SessionService`, recorder and the RLE tick digest**
- **Goal.** Persistence orchestration: start, 60-second checkpoint, background checkpoint, finish, resume-after-kill.
- **Files.** `src/services/{SessionService,SeedService,IdFactory,Clock,Logger}.ts`, `src/engine/SessionRecorder.ts`, `src/db/repositories/SessionRepository.ts`.
- **Depends on.** T-1.7, T-0.6, T-0.7.
- **Done when.** A simulated 40-minute session writes ≤ 1 200 digest segments (§I.6) and a `checksum`; a test decodes the blob and asserts header magic, segment count and total ticks; killing the app mid-session and relaunching offers resume with the correct `elapsed_ms`; `finish()` writes report + evidence + progress in **one** exclusive transaction (asserted by rolling back an injected failure).

**T-1.9 — EventSource seam and the auto-director**
- **Goal.** The Director Mode boundary exists and is exercised, even though the remote implementation does not ship (Hard constraint 13, but the seam is cheap now and expensive later).
- **Files.** `src/engine/sources/{EventSource,LocalScriptSource,AutoDirectorSource,RemoteDirectorSource.stub}.ts`.
- **Depends on.** T-1.7.
- **Done when.** `AutoDirectorSource` emits only advisory pacing hints and a test asserts it can never force an event; async intents are drained into the *next* tick (asserted by a two-tick test where an intent delivered mid-tick does not affect the current tick); `RemoteDirectorSource.stub` throws `NotImplementedError` rather than being absent.

### Phase 2 — Case Report and Share Card, the hero (T-2.x)

> This phase lands **before any tool exists**. The report is the growth engine (law 3), so it is built against engine fixtures. A fixture session becomes a real session with no changes to Phase 2 code, which is the test that the tool/report boundary is right.

**T-2.1 — `EvidenceService` with commit-on-find**
- **Goal.** Evidence is persisted the moment it is found, never at the end of a session (§G.3).
- **Files.** `src/services/EvidenceService.ts`, `src/db/repositories/EvidenceRepository.ts`, `src/db/mappers/evidence.ts`.
- **Depends on.** T-1.8.
- **Done when.** `capture(intent)` returns a persisted `Evidence` with an id in the same call; a test kills the process between `capture` and finish and asserts the row survives; `attachMedia` writes the file *before* the row and is idempotent for the same draft; media paths are relative (§I.5).

**T-2.2 — Encounter resolution and persistence**
- **Goal.** The `encounter_begun` / `encounter_resolved` pair becomes two durable rows with an outcome.
- **Files.** `src/db/repositories/EncounterRepository.ts`, `src/services/EncounterService.ts`.
- **Depends on.** T-2.1.
- **Done when.** An encounter with `outcome: 'missed'` persists and is reported as a first-class result (law 5); `delivery: 'absence'` round-trips through the DB and the report renders it distinctly; `was_guaranteed` and `directive_reason` are written for the tutorial encounter so the report can say so diegetically.

**T-2.3 — `CaseReportService.build` and status derivation**
- **Goal.** Materialize the §H.9 document at seal time, including the Unexplained / Inconclusive / Explained verdict.
- **Files.** `src/services/CaseReportService.ts`, `src/engine/rules/report.ts`.
- **Depends on.** T-2.2, T-1.8.
- **Done when.** Status derivation is one pure function with a table of inputs → status, unit-tested over every branch; a signature with all `required` slots found maps to `unexplained`; a `contested` item the user marked `explained` lowers the verdict (tested); the report row is written once and a second `build` for the same session is rejected by the `UNIQUE(session_id)` constraint; no report field is a bare number a user could read as a measurement.

**T-2.4 — Report screen: shell, header and the stamp**
- **Goal.** The hero screen's frame: case name, conditions board, duration, and the sealed stamp.
- **Files.** `src/app/case/[caseId]/report.tsx`, `src/features/report/{ReportHeader,ConditionsBoard,StatusStamp}.tsx`.
- **Depends on.** T-2.3, T-0.3.
- **Done when.** The screen renders from a seeded fixture case with zero session state; the stamp animates in once (`seen` flag pattern from §I.5) and never re-animates; the conditions board shows no numeric value; opening a case with ≥ 200 evidence rows still renders the header before any list work (asserted by a timing test).

**T-2.5 — Report: the narrative timeline**
- **Goal.** The beats from §H.9 rendered as a case narrative, with silence displayed as duration.
- **Files.** `src/features/report/{NarrativeTimeline,SilenceBeat,EventBeat}.tsx`.
- **Depends on.** T-2.4.
- **Done when.** A `silence` beat with a 9-minute span renders as a single legible block, not 54 empty rows; the `absence` beat renders and is visually distinguished from ordinary silence; the timeline is virtualized and scrolls at 60 fps on a mid-range Android with 400 beats (measured, not eyeballed).

**T-2.6 — Report: evidence gallery and the triage ritual**
- **Goal.** The end-of-session triage (`.memlog`: "the user rates each evidence item") plus the evidence reel.
- **Files.** `src/features/report/{EvidenceGallery,EvidenceCard,TriageSheet}.tsx`, `src/services/CaseTriageService.ts`.
- **Depends on.** T-2.5.
- **Done when.** Triage writes the paired `verdict`/`triaged_at_ms` columns in one statement (§I.5); the user's note is saved per item and appears verbatim in the report; a `contested` item is rendered identically to a real one *until* triage resolves it (asserted by a snapshot test on both states); the triage summary counts always sum to the total (asserted).

**T-2.7 — Report: signature sheet and graphs**
- **Goal.** The signature stamp (§H.9) and the normalized, label-free graphs.
- **Files.** `src/features/report/{SignatureSheet,CaseGraph}.tsx`, `src/ui/primitives/Sparkline.tsx`.
- **Depends on.** T-2.6.
- **Done when.** `CaseGraph` renders `series` as texture with `marks` as the only text; a graph with an empty series renders a flat line and the caption "no trace recorded" rather than a blank box; a signature sheet with three of four required slots shows `provisional`, never a fraction.

**T-2.8 — `ShareCardService` and card composition**
- **Goal.** A native, watermark-free card, rasterised from a themed React view (law 10).
- **Files.** `src/services/ShareCardService.ts`, `src/features/report/{ShareCard,ShareCardPreview}.tsx`, `src/app/case/[caseId]/share.tsx`.
- **Depends on.** T-2.7.
- **Done when.** `captureRef()` produces a PNG at a fixed reference resolution regardless of device; the card contains no watermark, no app-store badge, and no number; rendering the same case twice produces byte-identical output (checksum test) so a re-share is not visibly different; the card renders correctly in both a screenshot-shaped and a story-shaped aspect (two variants, both tested).

**T-2.9 — Share, save, and the cold-launch case route**
- **Goal.** `Sharing.shareAsync` + optional `Asset.create` to the media library, and a deep link that opens a shared case.
- **Files.** `src/app/case/[caseId]/share.tsx`, `src/services/ShareCardService.ts` (`share`/`saveToPhotos`), `src/app/case/[caseId]/report.tsx`.
- **Depends on.** T-2.8.
- **Done when.** `isAvailableAsync()` is checked before presenting; sharing a card with the media-library permission denied still shares (save is best-effort, share is not); `Sharing.shareAsync` receives the correct `UTI`/`mimeType` and an `anchor` from the pressed button; the case route opens from a URL with the database cold and no network.

### Phase 3 — Journal, Progression and the entry surfaces (T-3.x)

**T-3.1 — Journal repository and night grouping**
- **Goal.** The journal timeline built from `getEachAsync` (incremental, no 10 000-row array) with the 04:00 night key.
- **Files.** `src/db/repositories/JournalRepository.ts`, `src/services/JournalService.ts`, `src/services/Clock.ts`.
- **Depends on.** T-2.3.
- **Done when.** A hunt spanning 23:20 → 01:10 produces one night group; the timeline streams page-by-page (asserted by a test that fails if `getAllAsync` is used); hiding an entry removes it from the timeline but the row remains for the report.

**T-3.2 — Field Journal screen**
- **Goal.** The second tab: nights, entries, filters, and the entry detail.
- **Files.** `src/app/(tabs)/journal.tsx`, `src/features/journal/{NightGroup,JournalEntryRow,JournalFilters}.tsx`.
- **Depends on.** T-3.1.
- **Done when.** The list uses FlashList or a FlatList with the documented props, and a 500-entry fixture scrolls without a dropped frame on Android; the empty state explains what the journal is, because a new user's journal is empty and that must feel like a beginning, not a bug; every entry type in §H.11 has a rendered row.

**T-3.3 — `ProgressionService` and the clearance ladder**
- **Goal.** The six-rung Investigator Clearance, deterministic from counters, with no visible thresholds (§H.10).
- **Files.** `src/services/ProgressionService.ts`, `src/db/repositories/ProgressionRepository.ts`, `src/data/clearance.ts`.
- **Depends on.** T-2.3.
- **Done when.** The ladder is one pure function, unit-tested for every rung boundary; `apply(report)` returns a `ProgressionDelta` that drives the reveal; no screen renders a raw counter (asserted by a grep test for the counter field names in `features/`).

**T-3.4 — Badges, awards and the reveal**
- **Goal.** Declarative badge criteria evaluated at seal, awarded once, revealed when seen.
- **Files.** `src/services/BadgeService.ts`, `src/features/journal/{BadgeWall,BadgeReveal}.tsx`, `src/data/badges/*.json`.
- **Depends on.** T-3.3.
- **Done when.** `UNIQUE(badge_id)` prevents a re-award and the test asserts the criteria engine is idempotent; hidden badges are absent from the wall until earned; `explained_contested` awards correctly (§H.7) — disproving your own evidence must feel like an achievement.

**T-3.5 — Home tab**
- **Goal.** The front door: continue case, featured hunt, today's anomaly, and the night's conditions.
- **Files.** `src/app/(tabs)/index.tsx`, `src/features/home/{ContinueCaseCard,FeaturedHuntCard,DailyAnomalyCard,NightConditions}.tsx`.
- **Depends on.** T-3.3, T-3.6.
- **Done when.** A first launch with no cases shows the onboarding entry and not an empty continue card; a mid-session launch shows "continue" and it resumes the paused session; the anomaly card changes when the day changes (tested by injecting two day keys).

**T-3.6 — Daily anomaly and the shared day clock**
- **Goal.** One rotating "tonight, in your area" briefing, generated locally per day key, plus its directive.
- **Files.** `src/services/DailyAnomalyService.ts`, `src/db/repositories/DailyAnomalyRepository.ts`, `src/data/anomalyText.json`.
- **Depends on.** T-1.6.
- **Done when.** The same `dayKey` produces the same anomaly on two devices with the same content version (so a shared-seed night is possible later without a server); a day with no anomaly is a valid, authored state; the anomaly's directive is applied to tonight's sessions and is visible only diegetically.

**T-3.7 — Investigate tab, brief ritual, and hunt gates**
- **Goal.** The hunt picker with conditions, the locked/unlocked states, and the `brief.tsx` gear-up ritual (name the case, set intention, calibrate).
- **Files.** `src/app/(tabs)/investigate.tsx`, `src/app/hunt/[huntId]/brief.tsx`, `src/features/home/{HuntCard,LockedHuntCard}.tsx`.
- **Depends on.** T-3.5.
- **Done when.** A `HuntGate` of kind `clearance` or `cases_completed` hides rather than teases (no false urgency); a `paid` gate renders a single quiet line, not a modal, at this stage; the brief writes `case_name` and `intention` to the session row before the session starts, so an abandoned session is still named.

### Phase 4 — Tools, built to feed the report (T-4.x)

> Every tool in this phase is accepted only if it produces `EvidenceIntent`s that reach an already-working report. This is the report-first build order paying off.

**T-4.1 — Session shell and the presenter**
- **Goal.** The field shell: status rail, tool carousel, tick host, and the single emission→side-effect mapper (§G.6 separation guarantee).
- **Files.** `src/app/hunt/[huntId]/session.tsx`, `src/features/session/{StatusRail,ToolCarousel,useSessionPresenter.ts}`, `src/store/sessionStore.ts`, `src/audio/AudioBus.ts`, `src/haptics/HapticDirector.ts`.
- **Depends on.** T-2.9, T-1.8.
- **Done when.** `useSessionPresenter` is the only file that maps an `EngineEmission` to audio/haptic/store/UI, asserted by a grep test for `EngineEmission` outside it; `useFocusEffect` sets the sensor mode on focus and suspends on blur; `AppState !== 'active'` suspends everything; the engine is never imported by a component.

**T-4.2 — EMF tool**
- **Goal.** The first tool: a trace with a tail, a qualitative band readout, and the residual fallback.
- **Files.** `src/app/tool/emf.tsx`, `src/features/emf/*`, `src/ui/primitives/{SignalBars,Sparkline}.tsx`.
- **Depends on.** T-4.1, T-1.4.
- **Done when.** The ribbon is written from a Reanimated `SharedValue` and the JS thread does zero per-sample work (profiled); the readout is one of four words and never a value; a `sweep` gesture emits exactly one `UserAction` per gesture, not one per frame; with the magnetometer absent the tool shows the residual-mode caption from §G.5.

**T-4.3 — Radar tool**
- **Goal.** The confidence cone with fuzzy edges (`.memlog`: "borrow Pokemon GO's nearby-tracking").
- **Files.** `src/app/tool/radar.tsx`, `src/features/radar/*`.
- **Depends on.** T-4.1, T-1.3.
- **Done when.** Every target renders as a cone whose width is `coneWidthDeg`; a target dissolving fades and never pops; a `log_spot` action emits the corresponding `UserAction`; an empty radar renders the "quiet" state rather than an empty circle.

**T-4.4 — Spirit Box**
- **Goal.** The asking ritual: the user asks a question, the box scans, a word may or may not come back minutes later.
- **Files.** `src/app/tool/spirit-box.tsx`, `src/audio/WordBankPlayer.ts`, `src/data/wordbanks/*.json`.
- **Depends on.** T-4.1, T-0.9.
- **Done when.** Word playback is triggered by elapsed-time gates with **no** "did you speak" coupling when the mic is denied (the §G.5 archive-mode fallback); a word bank is never rendered as a transcript; `speakWord` resolves with the audio finished so the evidence caption can be committed after it, not before; the same seed replays the same words in the same order.

**T-4.5 — Voice tool (EVP + mic level)**
- **Goal.** The shared audio-input bus (`.memlog`: "build one audio-input bus and three outputs") — recording, PCM RMS, and voice activity.
- **Files.** `src/app/tool/evp.tsx`, `src/sensors/channels/audioLevel.ts`, `src/audio/VocalizationPlayer.ts`, `src/services/AudioCaptureService.ts`.
- **Depends on.** T-4.4.
- **Done when.** `useAudioStream()` provides PCM and the RMS/VAD estimator runs on it; if `AudioStream` is unavailable the recorder `metering` fallback at 500 ms is used and the response is delayed exactly one tick (§G.5); a recorded clip is saved to disk and referenced relatively (§I.5); mic permission is requested only when this tool first opens.

**T-4.6 — Camera tool, torch beam and the dark-room fallback**
- **Goal.** The camera as a sweeping beam that can surface a sighting, plus a photographic evidence path — and a full fallback when there is no camera.
- **Files.** `src/app/tool/camera.tsx`, `src/features/camera/*`, `src/ui/overlays/{TorchBeam,GlitchFrame,ChromaticEdge}.tsx`.
- **Depends on.** T-4.5.
- **Done when.** The preview unmounts on blur (Expo's one-preview rule); `recordAsync`/`stopRecording` are lifecycle-safe and a test asserts no recording survives a blur; `useCameraPermissions()` drives the JIT prompt and the fallback renderer is content-equivalent (same encounter timing); the torch is `enableTorch`, `takePictureAsync({ pictureRef: true })` is used, and `HapticsService.setCameraActive` is called on mount/unmount because iOS silences haptics while the camera is active (§G.0).

### Phase 5 — Creatures (T-5.x)

**T-5.1 — Bigfoot: tracker tool and outdoor hunt**
- **Goal.** Compass/proximity merged into one Tracker (`.memlog`) plus the Bigfoot hunt definition, footprints and GPS movement.
- **Files.** `src/app/tool/tracker.tsx`, `src/features/tracker/*`, `src/data/{creatures,hunts,events,encounters}/bigfoot.json`, `src/sensors/channels/location.ts`.
- **Depends on.** T-4.6, T-1.5.
- **Done when.** The tracker shows bearing and proximity qualifiers and never a distance in metres; the **uncharted** path (location denied) runs the whole hunt and produces a valid report (§G.5); footprints are evidence with a `trace` signature slot; a dead-reckoning fallback exists and is tested with location stubbed out.

**T-5.2 — Shadow Person: Observer hunt, peripheral renderer and haptic-led fear**
- **Goal.** The Observer archetype's verb — *you must avoid being noticed* — as a hunt where the phone is quiet and the room is not.
- **Files.** `src/data/{creatures,hunts,events,encounters}/shadow-person.json`, `src/features/session/PeripheralRenderer.tsx`, `src/haptics/patterns.ts`.
- **Depends on.** T-5.1.
- **Done when.** The encounter is peripheral by construction (never a full-screen pop-up) and a test asserts no encounter effect can occupy the frame centre; the fail state is *it noticed you* and it is reachable and readable; the shadow-pass evidence uses the `form` slot.

**T-5.3 — Alien/UFO: sky scanner and the Migrator-style track**
- **Goal.** The sky tool and the vehicle/outdoor sky hunt — a light that moves and is gone.
- **Files.** `src/app/tool/sky.tsx`, `src/features/sky/*`, `src/data/{creatures,hunts,events,encounters}/alien.json`.
- **Depends on.** T-5.2.
- **Done when.** The scanner uses heading + the radar vocabulary and never asserts an altitude; the `glance_and_gone` verb is delivered by the Ambusher stage weights; a sighting missed entirely still yields a valid `missed` encounter and a conditions-slip share card.

**T-5.4 — Mimic inversion and the four-archetype regression**
- **Goal.** The Mimic's core inversion (the Spirit Box asks *you* first) plus a full pass proving no archetype privileges any creature.
- **Files.** `src/features/spirit-box/QuestionInversion.tsx`, `src/data/events/{ghost,shared}.json`, `src/engine/__tests__/archetype.parity.test.ts`.
- **Depends on.** T-5.3.
- **Done when.** The inversion works with the mic denied (it asks, and the answer arrives on a timer, not on VAD); a parity test runs all four creatures through all four archetypes and asserts the engine's behaviour is a function of the archetype, not the creature; the ghost hunt (the free one) reaches a real encounter in the first run for 100 % of seeds (§H.3).

### Phase 6 — Monetization, analytics and ship (T-6.x)

**T-6.1 — Analytics service and the local ring**
- **Goal.** The §H.12 events, offline, local, typed, with the 2 000-row ring.
- **Files.** `src/services/AnalyticsService.ts`, `src/db/repositories/AnalyticsRepository.ts`.
- **Depends on.** T-4.1.
- **Done when.** `track` is a no-op-scheduled batcher, never a write on the hot path; the ring prune runs on launch; a test iterates every `AnalyticsEventName` and asserts its props type has no coordinate or free-text field; the payload contains no PII by construction, not by review.

**T-6.2 — Paywall, purchase and the gate**
- **Goal.** The paywall **after the second case** (law 8), with the entitlement cache from §I.5.
- **Files.** `src/app/(modals)/paywall.tsx`, `src/services/PurchaseService.ts`, `src/data/products.ts`, `src/db/repositories/PurchaseRepository.ts`.
- **Depends on.** T-6.1, T-3.7.
- **Done when.** A fresh install cannot reach a purchase screen before finishing case two (asserted by an integration test over the progression fixture); premium content is gated by `HuntGate`, never by difficulty or scarcity theatre; a restore works offline from the cache and reconciles on the next online launch; the free first hunt is fully intact and never interrupted.

**T-6.3 — Performance, battery and accessibility pass**
- **Goal.** Prove the anti-metrics: cold start, sustained battery, frame budget, and a screen reader that can read a case file.
- **Files.** `src/engine/EmfPipeline.ts`, `src/sensors/dutyCycle.ts`, list components, `src/ui/*`.
- **Depends on.** T-5.4.
- **Done when.** A 40-minute session in `session_low_power` costs under a stated battery budget on a mid-range Android (measured, and the number goes in `01-*`, not the UI); cold start to an interactive Home under 2 s; the report and journal are navigable with VoiceOver and TalkBack; `prefers-reduced-motion` disables every non-essential animation.

**T-6.4 — Release hardening, store claims and the EAS build**
- **Goal.** Signed builds on both stores with the claim review from the master brief §32 applied to every string.
- **Files.** `app.config.ts`, `eas.json`, `assets/store/*`, the full string table.
- **Depends on.** T-6.3.
- **Done when.** A grep test rejects every banned phrase ("detects", "proves", "scientifically", "real monster detection") from user-facing strings; the disclaimer is reachable from the first launch and from Profile; both stores have a build with the entertainment framing in the description; the app installs and runs with airplane mode on from a clean install.

### M.1 Dependency spine, if the plan is read as a graph

```text
T-0.1 ─┬─ T-0.2 ─ T-0.3 ──────────────┐
       ├─ T-0.4 ──────────────────────┤
       ├─ T-0.5 ─ T-0.6 ─ T-0.7 ──────┤
       ├─ T-0.8 ──────────────────────┤
       └─ T-0.10 ─ T-1.1 ─ T-1.2 ─┐   │
T-0.9 ─────────────────────┬─ T-1.4 │   │
                           └─ T-1.3─┴── T-1.5 ─ T-1.6 ─ T-1.7 ─ T-1.8 ─┬─ T-2.1 ─ T-2.2 ─ T-2.3 ─┬─ T-2.4 … T-2.9
                                                                        └─ T-1.9                    │
                                                                                    T-3.1 ─ T-3.2 ──┤
                                                                                    T-3.3 ─ T-3.4 ──┤
                                                                        T-3.6 ─ T-3.5 ─ T-3.7 ──────┤
                                                                                                    └─ T-4.1 ─ T-4.2 … T-4.6 ─ T-5.1 … T-5.4 ─ T-6.1 … T-6.4
```

Two properties are visible in the spine and are the reason the schedule in §Q holds: **Phase 2 has no dependency on Phase 4 at all** (the report is provably tool-independent), and **every tool converges on the single node `T-4.1`** (the presenter), which means tool work parallelizes trivially if a second engineer ever appears.
---

## Q. 30-day implementation plan

> One senior engineer, full-time, 30 calendar days, with **4 buffer days already spent inside the 30** (days 7, 14, 21, 28 are scheduled catch-up, not slack-to-be-rediscovered). The plan assumes the ticket estimates in §M and the fact that a solo engineer loses roughly 15 % of a day to builds, simulators and store tooling. Every week ends on a **demo-able milestone** — something that can be shown to another human, on a real device, in under five minutes. A milestone that cannot be demoed is not a milestone.

### Q.0 The rules that make this plan survive contact

1. **The demo at the end of each week is a real session on a real phone, not a test suite.** If the week's milestone needs a fixture to demo, the previous week is incomplete.
2. **A week that ships nothing demo-able is stopped, not extended.** The correct response to overrun is to cut the week's last ticket (§Q.7), not to steal from the next week — because the next week's first ticket is always on the critical path.
3. **Report before tools is not renegotiable.** If Phase 2 is late, tools slip. Phase 2 never slips to make tools fit. The design law is the scheduling policy.
4. **No ticket spans a day boundary unseen.** Any ticket estimated at more than one day is split before it starts, per §M's granularity.
5. **The engine is frozen after day 12.** After the report exists, engine changes are limited to bug fixes and numbers in content JSON — because the ticket order proves nothing later needs a new emission shape. A late engine change is a schedule event, and it is treated as one.

### Q.1 Week 1 — Foundation and a walking skeleton (days 1–7)

| Day | Tickets | Deliverable |
|---|---|---|
| 1 | T-0.1, T-0.2 | Dev build on both platforms, design tokens in place |
| 2 | T-0.3, T-0.4 | Primitives + four tabs navigating; **the four-tab law is now structural** |
| 3 | T-0.5, T-0.6 | SQLite open with WAL; `001_init` applies and is idempotent |
| 4 | T-0.7 | Session + Evidence repositories returning domain models |
| 5 | T-0.8 | Content registry, Zod validation, versioning, `npm run validate:content` |
| 6 | T-0.9 | SensorHub with the duty-cycle ladder and all seven fallback rows |
| 7 | **Buffer** | Finish T-0.9; T-0.10 if it lands early |

**Week 1 demo.** Install on a phone, walk through the four tabs, toggle low-power, open the SQLite Inspector and see the empty user tables. The proof is that the skeleton is *real*: a database that has been migrated and a sensor hub that respects focus/blur.

**Week 1 note on capacity.** Seven tickets in seven days is tight because T-0.9 is the second-largest ticket in the project (eight channels, a ring buffer, a quantizer and seven fallbacks). If day 5 arrives with T-0.8 unfinished, T-0.9 starts anyway — it is the critical path, and T-0.8's remaining work can absorb into day 7.

### Q.2 Week 2 — Engine and the report, the make-or-break week (days 8–14)

| Day | Tickets | Deliverable |
|---|---|---|
| 8 | T-0.10, T-1.1 | Golden-vector PRNG; tension + phases with legal transitions |
| 9 | T-1.2 | Event scheduler with silence floors and `emptyWeight` proven reachable |
| 10 | T-1.3, T-1.4 | Radar target lifecycles; EMF buckets + residual fallback |
| 11 | T-1.5 | Four archetypes driven by JSON parameters; no creature name in `engine/` |
| 12 | T-1.6, T-1.7 | Directives + tutorial guarantee; the full `tick` returning the emission union |
| 13 | T-1.8 | `SessionService`, RLE digest, one-transaction finish, resume-after-kill |
| 14 | **Buffer** | T-1.9 (cheap, and it protects the Director seam), then T-2.1 if it lands early |

**Week 2 demo.** Run a **headless simulated session** from a fixed seed in the terminal (`node` Jest project, §G.1), and print the emission stream. This is a demo *only* because the next week turns it into pixels; the honest week-2 demo needs week 3. So the week-2 milestone is stated precisely: *a seeded 20-minute session that runs deterministically, produces at least one encounter and at least one deliberate silence, and can be replayed byte-for-byte from its RLE digest*. That is demonstrable in a shell, and it is the hardest correctness claim in the product.

**This is the week the plan is won or lost.** T-1.7 and T-1.8 are the two tickets with the most hidden coupling (emissions ↔ recorder ↔ transactions). If day 13 ends without T-1.8, the correct response per rule 2 is to cut T-1.9 entirely — the `RemoteDirectorSource.stub` is a one-line file and can land in week 4 as a half-day.

### Q.3 Week 3 — The hero screen and the growth loop (days 15–21)

| Day | Tickets | Deliverable |
|---|---|---|
| 15 | T-1.9, T-2.1, T-2.2 | EventSource seam; commit-on-find evidence; encounter persistence |
| 16 | T-2.3 | `CaseReportService.build` with status derivation and the sealed row |
| 17 | T-2.4, T-2.5 | Report shell + stamp; narrative timeline with silence beats |
| 18 | T-2.6 | Evidence gallery + the triage ritual + user notes |
| 19 | T-2.7 | Signature sheet + label-free graphs |
| 20 | T-2.8, T-2.9 | Share card raster + share/save + deep-link cold launch |
| 21 | **Buffer** | Polish T-2.9 (`anchor`, UTI, missing-media handling) and start T-3.1 |

**Week 3 demo — the money demo.** Generate a fixture session, watch the engine run in-app, seal it, triage the evidence, write a note, then produce a share card and send it to someone in the room. This is the entire product thesis in five minutes, and it happens on **day 20 with no tool built yet.** If this demo is not convincing, no amount of tool work will fix it, and the schedule has bought that knowledge with 20 days rather than 30.

**Cut rule for this week.** If T-2.8/T-2.9 are at risk, cut the `evidence_reel` and `conditions_slip` share variants and ship only `case_file` (§H.9). One beautiful variant satisfies law 10; three mediocre ones do not.

### Q.4 Week 4 — Journal, progression, and the entry surfaces (days 22–28)

| Day | Tickets | Deliverable |
|---|---|---|
| 22 | T-3.1, T-3.2 | Journal timeline, night grouping, streaming read, Field Journal screen |
| 23 | T-3.3, T-3.4 | Clearance ladder + badges with the reveal |
| 24 | T-3.6, T-3.5 | Daily anomaly + Home tab |
| 25 | T-3.7 | Investigate tab, gates, the brief ritual |
| 26 | T-4.1 | **Session shell + presenter** — the tool↔report boundary proven with one trivial tool |
| 27 | T-4.2, T-4.3 | EMF tool and radar tool, both producing real evidence into a real report |
| 28 | **Buffer** | Finish T-4.3; T-4.4 if it lands early |

**Week 4 demo.** A complete loop on a real phone: Home → Investigate → brief ritual → session with EMF and radar → find an item → seal → report → triage → share. **The flywheel is now closed**, and it is closed before the cameras and the microphones exist.

**Why day 26 is the pivotal day.** T-4.1 is where a beautiful report meets its first real feed. If the presenter boundary is wrong, it is discovered here with six days left rather than on day 29. The test is stated in §M: `useSessionPresenter` is the only file that maps an `EngineEmission`, and that is asserted by a grep test.

### Q.5 Days 29–30 — Tools, polish, and a shippable build

| Day | Tickets | Deliverable |
|---|---|---|
| 29 | T-4.4, T-4.5 | Spirit Box (with archive mode) and the Voice tool on the shared audio bus |
| 30 | T-6.1, T-6.4 (partial) | Analytics ring + release hardening + a signed EAS preview build |

**Day 30 demo.** A TestFlight/Internal-Testing build installed on a phone that is not connected to the laptop, with airplane mode on, running a session end to end.

**What day 30 is *not*.** It is not the ship date. It is the end of the **MVP-complete** sprint: the four-tab loop, a real report, a share card, two tools, and a signed build. The remaining MVP scope (camera, tracker, the three non-ghost creature drops, and the paywall) runs in the following 10–15 days against the same plan, which is why §Q.7 lists the cuts explicitly and why the schedule below pushes them out rather than compressing them.

### Q.6 The 30 days at a glance

```text
DAY  1–2  ── Foundation: build, tokens, primitives, four tabs          ┐
DAY  3–5  ── Data layer + content registry                             │  W1
DAY  6–7  ── SensorHub, fallbacks, buffer                              ┘  demo: 4 tabs on device
DAY  8–11 ── PRNG, tension, scheduler, radar, EMF, archetypes          ┐
DAY 12–14 ── Engine tick loop, SessionService, RLE digest, directives  ┘  W2  demo: seeded replay
DAY 15–16 ── Evidence/encounter persistence, CaseReportService         ┐
DAY 17–19 ── Report screen, timeline, triage, signature, graphs        │  W3
DAY 20–21 ── Share card, share/save, deep link                         ┘  demo: seal + share a case
DAY 22–25 ── Journal, progression, badges, anomaly, Home, Investigate  ┐  W4
DAY 26–28 ── Session shell + presenter, EMF + radar tools              ┘  demo: full loop on device
DAY 29–30 ── Spirit Box, Voice tool, analytics, release hardening          demo: signed offline build
```

### Q.7 What gets cut, in order, the moment the schedule slips

The cut list is ordered by **damage per day saved**, and it is decided *now*, in daylight, so that a tired engineer on day 23 is not choosing. Nothing below violates a hard constraint; every item is scope, not law.

| # | Cut | Saves | Why this is first | What the user still gets |
|---|---|---|---|---|
| 1 | `evidence_reel` + `conditions_slip` share variants (T-2.8) | 1 d | Three card variants is a v1.1 feature; the card is the loop, the variants are the polish | One excellent `case_file` card |
| 2 | Hidden badges set (T-3.4) | 0.5 d | Visibility rule only; the criteria engine is unchanged | Full badge wall, visible badges only |
| 3 | Sky tool quality-of-implementation (T-5.3) | 1.5 d | The Alien hunt ships later anyway; the tool is not needed for the closed loop | Three tools at ship, fourth in the first update |
| 4 | `RemoteDirectorSource.stub` and T-1.9's async drain | 0.5 d | Pure seam work with no user-visible effect today | The emissions contract is unchanged, so the seam can be added later without an engine change |
| 5 | Journal FTS search (migration `005`) | 1 d | A 100-entry journal does not need search | Filters by kind and creature still work |
| 6 | Camera tool, dark-room renderer as the only visual path (T-4.6) | 1.5 d | The fallback from §G.5 *is* a complete, authored experience | Same encounter timing, same evidence, a different screen |
| 7 | Tracker's dead-reckoning fallback (T-5.1) | 0.5 d | Uncharted hunts still run; only the no-GPS-no-magnetometer combination loses a nicety | The uncharted path shows bearing only |
| 8 | Analytics beyond the six events named in the brief (T-6.1) | 0.5 d | `hunt_started`, `hunt_completed`, `evidence_found`, `encounter_triggered`, `report_shared`, `paywall_viewed` are the ones that answer questions | Six events instead of twenty |

**What never gets cut, even at day 30 with three days of work left.** In priority order: (1) the report and the share card; (2) the four-tab structure; (3) the seeded engine and the RLE replay; (4) the qualitative readout law (no numbers); (5) commit-on-find so a dying phone does not lose a souvenir; (6) just-in-time permissions; (7) the free first hunt reaching a real encounter. Cutting any of these does not produce a smaller product — it produces a **different, worse product**, and the schedule that needs them cut is a schedule for a product nobody asked for.

### Q.8 Slip triage: three scenarios, decided in advance

- **Scenario A — the engine runs two days late (end of week 2).** Response: apply cuts 3, 4, and 7 immediately (2.5 days recovered), keep week 3 intact. The report is never delayed. Consequence: three creature hunts at ship instead of four, which the paywall is already structured to absorb (`paywallTier: 'premium'`), so the Alien hunt becomes the first post-launch content drop — a drop that costs zero engine work, which is precisely what the archetype parameterization was for.
- **Scenario B — the report takes two days longer than planned (mid week 3).** Response: apply cuts 1, 2, and 5 (2.5 days recovered), and reduce week 4 to T-3.1, T-3.3, T-3.5, T-3.7 — journalless-but-working. The journal is the third engine (Engine → Report → **Journal**) so it is the correct thing to shrink, and it is also the only one of the three whose *absence* a user will not detect in the first two sessions.
- **Scenario C — a platform surprise (a native API behaves differently than §G.0 documents, e.g. `Magnetometer` unavailable on a test device, or `captureRef` output scaling).** Response: the §G.5 fallback table already covers the sensor case, so the fix is a content-equivalent path, not a rewrite — that is what the table is for. For a rasterisation problem, apply cut 1 and, if needed, ship the card as a **composed PNG from static assets + text** rather than a live view capture; the card still ships, it merely loses per-case graphs.

### Q.9 The post-day-30 30–45 window, so the plan does not end at a cliff

The MVP-complete sprint ends on day 30; the **shippable v1** lands around day 40–45 on the same ticket list, without new design work:

- **Days 31–34.** T-4.4, T-4.5, T-4.6 — the remaining tools, in that order, because each one feeds the report and each one exercises one more `EvidenceChannel`.
- **Days 35–39.** T-5.1 through T-5.4 — Bigfoot, Shadow Person, Alien, and the Mimic inversion. Content-only, verified by the `archetype.parity` test from T-5.4: the engine must behave identically for the same archetype regardless of creature.
- **Days 40–45.** T-6.2 through T-6.4 — paywall after case two, performance and battery measurement, accessibility, store claims and the EAS production build.

**The one number that decides whether v1 ships on day 45 or day 60.** Not the ticket count — the **share rate**: the fraction of sealed cases that produce a shared card. If week 3's demo does not make a stranger want to send the card, the schedule is not the problem, and no amount of tool work will fix a report that is not worth sharing. That is why the hero screen is built on day 20 and the tools on day 26, and it is the whole reason the design law and the delivery plan are the same document.
