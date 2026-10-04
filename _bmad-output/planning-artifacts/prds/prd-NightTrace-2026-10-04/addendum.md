---
title: NightTrace — PRD Addendum
status: draft
created: 2026-10-04
updated: 2026-10-04
---

# NightTrace — PRD Addendum

Material that belongs downstream of the PRD, or that earned a place in the project but not in the PRD itself. Nothing here is normative for the product; it is the *how*, the *why-not*, and the depth that would have buried the PRD's main narrative.

Read the PRD first. Where this addendum names an FR, that FR is authoritative and this document is explanatory.

This addendum names the two source design documents the way the PRD's §10 names them: **`01`** is the product and game design document, and **`02`** is the implementation contract. Where a passage says "the source brief," it means the owner's original master prompt, which was the input to the brainstorm rather than one of its outputs.

---

## A. Rejected Alternatives and Ratified Overrides

The design brainstorm silently overrode roughly fourteen explicit demands from the owner's source brief. The brainstorm's own decision log recorded none of them: it contained six decisions and **zero** override entries. The owner ratified the full set in session on 2026-10-04. This table is the audit trail.

### A.1 Ratified overrides

| # | Owner's brief said | Owner ratified | Reason it was changed |
|---|---|---|---|
| 1 | Numeric readouts everywhere, including `Strongest anomaly 91%` and `ACTIVITY 93%` | **Banned on every surface; counts and qualitative bands only** | Twice decided. Originally ratified as "kept on the report, banned on tools"; **reversed on 2026-10-04** — the report's percentage was removed too. See §B.6 for the argument, which is worth reading before re-proposing this. |
| 2 | XP and investigator level (§20) | **Investigator Clearance** | An XP bar is the tell that you are inside a mobile game. Clearance is diegetic and advances on what the user did, not on time played. |
| 3 | Per-hunt event probabilities (§2) | **One engine, one hazard model** | Learnable per-hunt tables destroy uncertainty. Hunts differ by archetype, toolset, channel, phase timing, and distribution shape — never by probability constants. |
| 4 | Rarity table 55/25/12/6/2% (§2) | **Gated thresholds, not drawn** | A per-event lottery reads as arbitrary or broken. Rarity is earned by reaching thresholds. Legendary uses a separate flag at ~0.5% base. |
| 5 | 2-minute casual session (§3) | **Field Note, ~3 minutes** | Compressing an investigation into two minutes is how a product becomes a fake radar. A Field Note is its own mode with its own framing, not a truncated case. |
| 6 | `NW · 182m` distance (§14) | **8-wind bearing + range band** | Metres to a contact is the single most testable claim in the product: a user can pace the room and see the app is wrong. |
| 7 | 23 named tools (§2) | **7 surfaces, 5 verbs** | Consolidation. The tools map to Sweep / Ask / Listen / Frame / Log. |
| 8 | Equipment tab (§23) | **Cut; four tabs only** | Tools live inside a hunt. A tool browsed outside a hunt is an object, not an instrument. |
| 9 | Equipment skins, radar styles, radar themes as progression/premium (§20, §31) | **Cut** | Cosmetics on a tool nobody looks at outside a session. Case-file themes replace them. |
| 10 | "Advanced journal" as a premium tier (§31) | **Never monetized** | Contradicted by design law 8. The Case Report, Share Card, Field Journal, archive, and evidence export are never sold at any tier. |
| 11 | `expo-av` "if needed" (§6) | **`expo-audio`** | Not a design choice — a technical correction. `expo-av` was removed from Expo Go, is unpatched, and its SDK docs route 404. |
| 12 | Night-vision, scan lines, noise, chromatic aberration as default camera overlays (§13) | **Glitch channel only** | Reserved for `Intense`/`Ritual` and the Shadow Person hunt. Default camera is restrained so the view stays readable. |
| 13 | `Paranormal Pro` weekly/monthly/annual (§31) | **Deferred entirely; MVP free** | Owner instruction, 2026-10-04: "free for now." Supersedes both the brief and the brainstorm's Field Pass model. |
| 14 | Phase order — Ghost in Phase 2, report/journal in Phase 3 (§35) | **Report-first** | The Case Report is the hero screen and the growth engine. The Case Report and Share Card are built before any tool exists. |

### A.2 Data-model renames

The owner's brief §29 proposed `Creature`, `Hunt`, `HuntSession`, `InvestigationEvent`, `SensorSnapshot`, `UserProgress`, `CaseReport`, `Badge`. The implementation contract renamed several to keep content and user data strictly separate: `CreatureDefinition`, `HuntDefinition`, `Session`, `BadgeDefinition`/`BadgeAward`. This matters because content must be rebuildable from bundled JSON without ever cascading into user data. The same separation is what §C.12's foreign-key rule enforces at the schema level, and it is why `Creature` and `Hunt` — the content-side names — do not appear in the user tables listed at §E.1.

### A.3 Rejected alternatives recorded during design

Each of these was considered and deliberately not chosen. Recording them prevents a future contributor from "fixing" a decision that was already made.

- **Scripted per-hunt event lists** — rejected. Kills uncertainty and makes adding a creature an engineering task.
- **Base64 media blobs in SQLite** — rejected. Media lives on disk; the database stores paths.
- **`seedrandom` / `pure-rand`** — rejected. The PRNG is ~40 lines with zero dependencies, which keeps the engine's determinism auditable.
- **AsyncStorage / MMKV / WatermelonDB** — rejected in favour of `expo-sqlite` with typed repositories.
- **Skia `makeImageSnapshot`; server-rendered PNG** — rejected for the Share Card. The card must render perceptually identically, offline, with no server in the path.
- **WebSocket / local-network Director Mode** — deferred with a source seam only.
- **Real weather API** — rejected permanently. It would be a network call, and the app makes none. A local barometer proxy substitutes where the hardware provides one.
- **HealthKit / heart-rate integration** — deferred. `[NON-GOAL for MVP]`
- **Real star catalogue** — rejected permanently. It is a falsifiable claim.
- **Thermal-camera styling** — rejected permanently. Phones have no thermal sensor; the brief forbids implying one.
- **"Unknown Creature Hunt" as an MVP menu item** — rejected. It becomes a Case Report outcome, `UNIDENTIFIED SIGNATURE`, because a menu entry named "Unknown" tells the user the answer before they start.

---

## B. The Claims Boundary — Full Detail

This is the product's most consequential constraint and the one most likely to be violated by accident, so it is documented here at length.

### B.1 The governing rule

> **No sentence in NightTrace may assert anything about the real world.**

This applies to the app UI, App Store metadata, screenshots, share output, onboarding, notifications, and support copy.

### B.2 Banned terms, enforced as a build-failing lint

`detect` · `prove` · `proof` · `confirm` · `verify` · `authentic` · `real ghost` · `scientific` · `science` · `thermal` · `radiation` · `Geiger` (as a unit) · `accuracy` · `algorithm` · `AI` · `%` (anywhere — no carve-out on any surface) · `metres`/`meters` (distance to contact) · `haunted` (as a statement of fact) · `evidence of the paranormal`

### B.3 Approved market terms and store framing

`paranormal` · `ghost hunt` · `cryptid` · `investigator` · `field journal` · `EMF` · `EVP` · `spooky` · `adventure` · `night`

**Store framing:** app name **NightTrace**; subtitle **Paranormal field journal**; category Entertainment; rating 12+/Teen.

### B.4 The forty-row risky→safe rulings table

Reproduced from the source design doc. This is the authoritative reference for writer's-room questions. The rows keep their source numbering, which the PRD and §B.6 cite by number, so a row is never renumbered here even when the ruling changes.

| # | ✗ Risky (original) | Why dangerous | ✓ Ruling |
|---|---|---|---|
| 1 | `Scientifically detects ghosts` | Falsifiable + science claim | `A paranormal investigation experience` |
| 2 | `Proves paranormal activity` | Literal falsifiable claim | `Builds a case file about your night` |
| 3 | `Detects spirits with certainty` | Claims detection + certainty | `Records signals you can't explain` |
| 4 | `Real monster detection` | Falsifiable + capability | `Cryptid exploration, outdoors` |
| 5 | `Ghost detector` / `Paranormal detector` | Category taint + capability | `Paranormal field journal` |
| 6 | `EMF detector` / `Real EMF scanning` | Half-truth inviting the killing test | `EMF tool` + `Readings are inferred.` |
| 7 | `Thermal imaging` / `Heat signature detection` | Phones have no thermal sensor | **Delete entirely.** Never reference heat. |
| 8 | `Radiation detection` / Geiger `mSv` | No radiation sensor | `The phone becomes a pulse that quickens.` |
| 9 | `Activity level: 93%` / `Strength 82%` | Percentage = measurement claim | `Activity: HIGH` · `COMPELLING` · `SUGGESTIVE` |
| 10 | `NW · 182m` | Most testable claim in the product | `NE · NEAR` (8-wind + band) |
| 11 | `Signal strength 87%` | Same as #9 | Signal bars, unlabelled and unnumbered |
| 12 | `Confirmed` / `Verified` / `Authenticated` | Certainty language | `Unconfirmed` · `Unsigned` · `No match on file` |
| 13 | `Possible match: BIGFOOT` | Names a real cryptid as a conclusion | `Possible match —` or `Signature: PARTIAL` |
| 14 | `Tonight, your area is active` | Claim about the user's neighbourhood | `Your last case was two nights ago.` |
| 15 | `No one in your area has seen it` | Claims knowledge of others; untrue, creepy | `No case file matches this signature.` |
| 16 | `Entity detected nearby` | Detection + presence | `A reading you can't source` |
| 17 | `A ghost is in this room` | Most falsifiable sentence possible | `The record is unclear here.` |
| 18 | `Real EVP capture` | Pseudoscience as capability | `EVP recorder` + `Audio you marked yourself.` |
| 19 | `Spirit box communicates with the dead` | Claim + offensive | `Voice tool` + `Bands are theatre. Nothing here is received.` |
| 20 | `Scientific spirit box` | Oxymoronic + science claim | — (never used) |
| 21 | `Our algorithm analyses real paranormal signals` | Claims signal + analysis | `Cases are generated locally and procedurally.` |
| 22 | `AI-powered detection` | Implies capability; no AI exists | `Deterministic, offline, procedural` |
| 23 | `100% accurate` / `99% of users` / any statistic | Unverifiable, legally exposed | **Never use statistics in marketing.** |
| 24 | `Warning: this app is not a toy` | Winks and claims simultaneously | **Delete.** Stated once, plainly, never again. |
| 25 | `Do not use if you have a heart condition` | Rejection risk, ethically poor | Calm safety line inside About |
| 26 | `Detects: ghosts, demons, spirits, poltergeists` | Keyword stuffing + claims | Approved keyword set (§B.3) |
| 27 | `Uses your camera to see entities` | Suggests camera reveals something real | `Camera tool` + `Nothing here is proof.` |
| 28 | `Your phone can sense what you can't` | Hardware capability claim | `Your device's readings are used as material for a case.` |
| 29 | `Share your real ghost encounters` | Makes the *user* the false claimant | `Share your case file.` |
| 30 | `Find out if your house is haunted` | Direct service claim | `Investigate your own place, on the record.` |
| 31 | `Real paranormal evidence` (share branding) | Turns user output into a claim | `An investigation experience. Not a measurement.` |
| 32 | `Scanning for entities...` fake telemetry | Suggests a sensor process that is not happening | **Deleted.** No fake progress or scan loops anywhere. |
| 33 | `GPS-verified hotspot` | Claims verified geography | `Seed: place · time · conditions` |
| 34 | `Weather-linked events` (real API) | Network call + data claim | Local barometer proxy; else the line is absent |
| 35 | `Join thousands of investigators` | Unverifiable social proof; no server | **Delete.** No social proof of any kind. |
| 36 | `Best ghost app 2026` (self-awarded) | Misleading metadata | **Delete.** |
| 37 | App name `Ghost Detector Pro` | Name-level claim | **NightTrace** / **Paranormal field journal** |
| 38 | `Detect` as a verb in the UI | Violates design law 2 | `Investigate` · `Record` |
| 39 | `Record and prove your encounters` | The word "prove" | `Record and keep your cases` |
| 40 | `Sensor data confirms` | Confirmation language | `The record shows…` |

### B.5 Three-layer disclaimer

1. **Store listing**, sentence two, within the first three lines.
2. **Onboarding screen one**, non-skippable, requiring `I understand`.
3. **Permanent About notice**, reachable from Profile and exported with user data.

The About notice contains: WHAT THIS IS / WHAT IT DOES / SENSORS USED (each marked "Only while in use.") / WHAT WE NEVER DO (`No account. No sign-in.` `No network connection.` `No audio or photos leave this device.` `No advertising.` `No analytics sent anywhere.`) / A NOTE ON SCIENCE / SAFETY.

### B.6 The ruling this PRD was expected to override — and does not

Row 9 of the table above bans `Activity level: 93%`. The product's first design pass kept a percentage on the Case Report — the term the PRD has since retired as **Anomaly Index** — on the reasoning that a case-file index is not a sensor reading, and the owner initially ratified that. **On 2026-10-04 the owner reversed it, and the product now complies with the rulings table completely — no exception to the no-verifiable-numbers law survives on any surface.** The reversal is recorded in the PRD at §4.6 and §8 OQ-1 (closed).

The reason this section still exists, in a document that otherwise records only live decisions: the "case-file index, not a measurement" argument is *plausible*, and someone downstream will rediscover it. It fails on a distinction that is easy to miss. A bare count (`EVIDENCE 05`) has no denominator and can be checked by the user sitting in the app; a percentage has one, and the denominator is what converts a fact about the session into a claim about the world. Relabelling cannot fix that, because the problem is the number's form rather than its caption. It also fails structurally: the Share Card is composed from the Case Report, so the number was never contained to the one screen carrying the disclaimer apparatus. It rode out to the most-distributed surface in the product, which arrives with no framing at all.

**If you are downstream and find yourself re-proposing the percentage, read §8 OQ-1 before you do.** The strength the Case Report was reaching for is delivered by the counts, the `LOW`/`MODERATE`/`HIGH` band, the `COMPELLING`/`SUGGESTIVE`/`AMBIGUOUS` evidence grades, and the stamped status word.

---

## C. The Engine — Implementation Contract

The PRD states what the engine must do (FR-1 … FR-5). This section records how.

### C.1 Module layout

```
engine/          pure TS. May not import react, react-native, expo*, zustand.
                 No Date.now(), no Math.random(), no I/O. Enforced by ESLint
                 no-restricted-imports, not by discipline.
  InvestigationEngine.ts   tick orchestration
  EventScheduler.ts        weighting, cooldowns, silence floors, session budget
  TensionEngine.ts         tension 0..100 + phase transitions
  RadarSimulator.ts        target birth / velocity / uncertainty / death
  EmfPipeline.ts           EMA -> baseline -> delta -> anomaly score -> bucket
  RandomEngine.ts          seeded PRNG + fork(label)
  archetypes/              Observer, Stalker, Mimic, Ambusher + registry.ts
  directives/              SessionDirective
  sources/                 EventSource, LocalScriptSource, AutoDirectorSource,
                           RemoteDirectorSource.stub
  rules/                   silence, cooldown, gates, evidence
sensors/         the only importer of expo-sensors / expo-location / mic capture
audio/           AudioBus, AmbienceBed, StingPlayer, WordBankPlayer,
                 VocalizationPlayer, cues
haptics/         HapticDirector, patterns
data/            schemas, ContentRegistry, ContentVersion, and the content
                 directories: creatures, archetypes, hunts, events, encounters,
                 badges, wordbanks
db/              client, migrations, mappers, repositories, kv
services/        SessionService, EvidenceService, CaseReportService,
                 ShareCardService, ProgressionService, SeedService,
                 PermissionService, AnalyticsService, Clock, IdFactory, Logger
store/           zustand: sessionStore, sensorStore, settingsStore, uiStore
```

### C.2 Boundary rules

- The engine returns **emissions** and nothing else. It never calls a haptics service, an audio service, or a store.
- Exactly one presenter maps emissions to haptics, audio, store, and UI. Every tool converges on that single node, which is what makes the tools parallelizable.
- `sensors/` is the only module that touches sensor APIs. `app/` routes contain no engine calls and no SQL.
- `db/repositories/*` is the only place SQL string literals exist. Explicit column lists; no `SELECT *`.
- The engine imports the archetype **registry**, never an individual archetype file.

### C.3 Seed composition

```
SeedParts = {
  huntId, coords (nullable), startedAtMs,
  environment, sky, temperatureBand,
  fingerprint: SensorFingerprint,   // one-shot, quantized at threshold crossing
  contentVersion
}

SensorFingerprint = { emfMicro: -3..3, lightLux | null,
                      motionQuiet: Unit, noiseFloorDb | null }

seedFromParts(parts) -> xmur3 hash -> sfc32 PRNG
```

`SeedParts` is persisted verbatim on the session row and is never recomputed. It is the replay key.

**Substreams** via `fork(label)`, so draws are order-independent:

| Fork | Governs |
|---|---|
| `rng.session` | temperament, legendary flag, archetype tie-break |
| `rng.events` | silence draws, family choice, definition choice, directives |
| `rng.radar` | target birth, velocity, uncertainty, death |
| `rng.words` | word-bank selection only |
| `rng.encounters` | selection and ambiguity tags |
| `rng.report` | status tie-breaks, seeded note choice, seal variant |
| `rng.signals` | transmissions |

**Determinism:** the whole simulation is reconstructible from `seed + hunt_id + content_version + tick_digest[]`. `UserAction` carries its own `atMs` so the engine can quantize it to a tick. The sensor digest is bucketed so devices with different noise floors agree.

**Deliberately not deterministic:** a `ContentVersion` bump invalidates replay parity across a content drop. This is the only such break, and it is intentional.

### C.4 Simulation cost and test matrix

A 30-minute session simulates in under 40 ms — it is a pure function over a seed, with no I/O and no React in the path, so the cost is arithmetic rather than rendering. CI runs 4 archetypes × 4 intensities × 3 durations × 500 seeds = 24,000 sessions. The matrix exists to make the §C.6 tuning targets statistical rather than anecdotal: 500 seeds per archetype is the point below which the p50/p90 interval measurements stop being stable enough to ship a pacing change against.

### C.5 Golden-seed replay tests

`engine/__tests__/golden/*.spec.ts` assert `{seed, huntId, scriptedActions[]}` → expected emission digest. Any change to the firing timing of an existing seed fails the build unless the golden file is consciously regenerated in the same pull request. This is what makes "the engine is honest about determinism" enforceable rather than aspirational.

### C.6 Tuning targets

Measured over 500 seeded 20-minute `Present` sessions per archetype.

| Parameter | Target | Interpretation |
|---|---|---|
| Emissions per session | p50 7–11 | <5 reads broken, >14 reads toy |
| Inter-emission interval p50/p90 | ≥ 3.0 (target 4.2) | Below 3.0 the engine is predictable |
| Longest silence | p50 200–260 s | <150 s and silence is not a feature |
| Sessions with a >5 min silence | 22–35% | <15% and the fantasy never lands |
| Zero emissions at 10 min | 12–20% | <8% and it never feels quiet |
| Encounter rate, non-first-run | 42–58% | >70% routine, <30% broken |
| Encounter rate, first run | 100% | Guaranteed by the First-Run Directive |
| Legendary | 0.4–0.6% | Gated by flag, not drawn from a table |
| `QUIET` phase | p50 90–180 s | <60 s and the ritual has no weight |
| Reaching `ENCOUNTER_WINDOW` | 55–70% | >80% and the window is expected |
| Windows closing empty | 25–40% | <20% and there is no mystery |

**Anti-metric:** if the inter-emission p50/p90 ratio drops below 3.0, the engine has become predictable and a pacing change must ship. Target is 4.2.

### C.7 Cooldowns and anti-repeat

- A howl gets an 8-minute cooldown — one asset used sparingly.
- Voice `ASK` locks for 12 seconds while cooling.
- `distortion_bloom` fires at most 4× per session; the glitch colour channel at most 4×.
- The Ambusher stall holds the proximity ladder at `WARM` for up to 4 minutes and displays `SIGNAL AGE · stale` — a designed dead end.

### C.8 The five phases

Five phases run in fixed order, with `ENDED` as the terminal state that hands off to the report:

`QUIET` (floor 45 s, median ~150 s) → `SIGNALS` (~25% of session time) → `ACTIVITY` → `ENCOUNTER_WINDOW` (60–180 s) → `RESOLUTION` → `ENDED` → report.

The phase count is structural rather than cosmetic: it is baked into the run-length-encoded replay digest (§C.3), so a build that adopts the implementation contract's six phases cannot replay a session recorded against this five — the defect surfaces weeks later as corrupt replays. See the PRD's §10, row 4.

**User-visible state words are a separate, shorter ladder:** `QUIET` → `LISTENING` → `ACTIVE` → `CONTACT`, four words rendered as a five-segment hairline. The four words do not map one-to-one onto the five phases — the hairline advances on phase completion while the word tracks what the user should believe is happening — and the user is never told what either means.

### C.9 Emissions union

`emf_spike`, `radar_ping`, `audio_whisper`, `footstep`, `vocalization`, `movement`, `camera_glitch`, `shadow_event`, `entity_encounter`, `ufo_signal`, `nothing`.

### C.10 EmfPipeline stages

raw → EMA smoothing → rolling local baseline → delta → normalized anomaly score → bucket. Raw magnetic magnitude is never interpreted as paranormal activity, and the score never reaches the UI as a number.

### C.11 Radar target rules

Targets have a birth, a velocity, an uncertainty, and a death. `uncertainty` only ever grows; `coneWidthDeg` narrows only through direct observation and never collapses to a lock-on. `dissolve` is the only removal. Maximum four concurrent targets in twenty minutes.

### C.12 Hard engine invariants

- `EventTable.emptyWeight` is always greater than zero.
- A `SessionDirective` may constrain the space of events; it may never name an event.
- Archetypes emit `ArchetypeEffect` values and never touch state.
- FKs point only within the user family. `evidence.creature_id` and `sessions.hunt_id` are validated text ids in the repository layer, precisely so that a content rebuild cannot cascade-delete user evidence.

---

## D. Sensors, Permissions, and Degradation

### D.1 Channels

`magnetometer` (EMF, µT), `accelerometer`, `gyroscope`, `deviceMotion`, `light` (Android only), `location` (`watchPositionAsync`; iOS reduced-accuracy is first-class), `audioLevel`, `cameraState`.

### D.2 Rate ladder

`SensorRate = off | eco | ambient | focus` → 2 / 6 / 15 Hz. `SensorMode = suspended | preview | session | session_low_power`. Mode is driven by screen focus and blur, plus the low-power toggle. Leaving the foreground forces `suspended`: all channels off, camera `active={false}`.

### D.3 Performance approach

- No React re-render per sample. Fixed-size `Float32Array` ring buffers per axis; 60 fps visuals read a Reanimated `SharedValue` written on the UI thread.
- Duty-cycling is the battery strategy, not a per-sensor optimization.
- Dim mode via `setBrightnessAsync(0.15)`, restored on exit.
- Keep-awake is scoped to the session screen and skipped in low-power mode.

### D.4 Fallback table — "reduce, never block"

All fallbacks preserve the same digest contract, so the engine is unaware anything changed.

| Missing | Fallback |
|---|---|
| Magnetometer | residual mode from accelerometer micro-motion + clock + generation |
| Accelerometer / gyro / motion | location speed, then a zero-value "still" profile; presence timers lengthen |
| Ambient light | clock hour + the environment the user declared |
| Location denied or reduced | uncharted hunt: bearing only, no place seed, seed = time + fingerprint |
| Microphone denied | Spirit Box and EVP enter archive mode: elapsed-time gates only, and no wording implying anything answered |
| `AudioStream` unsupported | recorder metering at 500 ms, wider VAD threshold, one-tick delay |
| Camera denied | dark-room renderer |

Denial UI offers "continue without" and a link to system settings. There is never a nag loop.

### D.5 Permission model

Just-in-time only. `SensorChannel.ensurePermission()` is called by the tool that needs it, never at launch. `probe()` is a cheap hardware check that never prompts. Availability reports one of: `ready`, `permission_not_requested`, `permission_denied{canAskAgain}`, `unavailable_hardware`, `unsupported_platform`, `error{message}`.

iOS needs `NSMotionUsageDescription` via the `motionPermission` config plugin. Android's camera permission is added automatically.

---

## E. Data and Persistence

### E.1 Database

One file, `nighttrace.db`. `journal_mode=WAL`, `foreign_keys=ON`, `synchronous=NORMAL`, `busy_timeout=5000`.

**User tables:** `sessions`, `session_ticks`, `evidence`, `encounters`, `investigation_events`, `case_reports`, `discoveries`, `badge_awards`, `user_progress`, `media`, `analytics_events`.

**Catalogue tables:** `creatures`, `hunts`, `event_definitions`, `encounter_definitions`, `behaviour_archetypes`, `badges`.

Catalogue is rebuilt from bundled JSON whenever the stored content version differs from the current one: delete, batch insert, one exclusive transaction.

### E.2 The persistence rule

> If it can be recomputed from `(seed + content version + tick log)`, it must not be persisted.
> If the user would be angry to lose it, it must be in SQLite before the screen closes.

This single rule resolves most storage questions. Evidence is committed **when found**, not at session end.

### E.3 Write policy — checkpoints, not streams

On session start, insert a session row with `status='active'`, `seed`, `content_version`, `hunt_id`, `started_at`, `conditions_snapshot`. Every **60 seconds**, and on backgrounding, an exclusive transaction updates elapsed time, appends a run-length-encoded tick digest, and inserts uncommitted evidence. On finish, one transaction finalises reports, discoveries, badges, and progress.

### E.4 Media

Media is never stored as a BLOB. Files live on disk under the case directory; the row stores `relative_path`, `mime`, `bytes`, `duration_ms`, `checksum`. Paths are always relative, so an app update cannot break them.

### E.5 Retention

`analytics_events` is ring-buffered to the most recent 2,000 rows. Tick digests are pruned for exported reports older than 180 days; an un-exported Case keeps its digest forever, because a Case the user still holds is one they might replay, and 20 KB across a few hundred Cases stays under 5 MB.

### E.6 Never stored

Live sensor values, tension, radar targets, the current event, raw 100 Hz arrays, radar frames. Settings live in `expo-sqlite/kv-store`, not in a table. This list is the other half of §E.2's rule: everything named here is recomputable from `(seed + content version + tick log)`, and everything recomputable is deliberately kept out of the database.

### E.7 Migration discipline

Never edit a shipped migration. Every migration runs in a transaction. Additive-only for a shipped schema version; a destructive change requires a backup and a restore path. `migrate()` is idempotent, asserted by test.

### E.8 Storage budget

| Quantity | Budget | Note |
|---|---|---|
| Database | < 40 MB | holds for years at expected use |
| 100 Cases | ≈ 12 MB database + ~300 MB media | media dominates the total; the database is the smaller half |
| RLE tick digest | ~8–22 KB per 14,400-tick session at 6 Hz | ≈300–900 segments |
| Indexes | 21 user + 8 catalogue | |

The media share is what makes §E.4's rule matter: media lives on disk, so the database stays small enough to back up and migrate cheaply even as Case count grows.

---

## F. Analytics

Local-only, on-device, PII-free. No network egress. `installRef` is a random, resettable UUID. No coordinates, no free text, no media, no identifier surviving an uninstall. Exportable and erasable by the user.

### F.1 The six core events

The PRD's MVP scope. These are the brief's original set.

`hunt_started` · `hunt_completed` · `evidence_found` · `encounter_triggered` · `report_shared` · `paywall_viewed`

`paywall_viewed` is retained in the schema but cannot fire while MVP ships free. See §8 OQ-3, which also covers whether the purchase seams stay in the schema at all.

### F.2 The extended set available at no extra cost

The implementation contract defines twenty event names with typed properties, and the design doc defines 56. Notable typed properties:

- `hunt_started{huntId, intensity, lowPower, charted}`
- `hunt_completed{huntId, durationMs, endReason, encounterCount, evidenceCount}`
- `evidence_found{kind, channel, strength, withMedia}`
- `encounter_triggered{creatureId, delivery, tensionBand}`
- `report_shared{caseId, variant, outcome}`

### F.3 Privacy guarantees

`analytics_events.session_id` is deliberately **not** a foreign key, so analytics outlive case deletion. Props are typed generically so a missing field is a compile error. A development assertion fails on prop strings over 24 characters, on space-and-capital event names, or on a coordinate-shaped string.

### F.4 Funnel metrics — an open gap

The source contract states no funnel targets, so the metric set is new: SM-1 through SM-8 in the PRD were authored here. SM-1's *target* is the exception — the share rate of ≥ 25% is adopted from the source design doc, not invented. SM-1 is the number the product must be able to measure and explain.

---

## G. Platform, Tooling, and Delivery

### G.1 Stack

Expo SDK **57.0.0** (`expo@57.0.23`), React Native **0.86**, React **19.2.3**, Node **22.13+**. iOS **16.4+**, Xcode 26.4+, Android 7+ (compile/target SDK 36). New Architecture mandatory — Legacy was dropped in SDK 55 and `newArchEnabled` is no longer read from `app.json`.

`expo-router`, `expo-camera`, `expo-audio`, `expo-sqlite`, `expo-file-system`, `expo-sharing`, `expo-keep-awake`, `expo-media-library`, `expo-brightness`, `react-native-view-shot`, Reanimated 4.3–4.5, worklets 0.8–0.10, gesture-handler 2.31–2.32.

`tsconfig` strict, plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`.

### G.2 Deliberate API corrections

| Deprecated / dead | Use instead |
|---|---|
| `expo-av` | `expo-audio` (playback, recording, PCM) |
| `removeSubscription` | `subscription.remove()` |
| Old `expo-file-system` free functions | `expo-file-system/legacy` |
| Old `expo-media-library` free functions | `Asset.create(fileUri, album)` |
| Sync `activateKeepAwake` | the async form |

Mic level comes from `useAudioStream()` PCM with the engine's own RMS and VAD. Recorder metering at ~500 ms is kept only as a fallback.

### G.3 Dev builds

Expo Go is **not** the delivery target: SDK 57's Expo Go is not on the App Store, and `expo-camera` needs a dev build for real testing. Expo-managed workflow with CNG and `expo-dev-client`.

### G.4 Testing

Two Jest projects. `engine` (node preset) covers `src/engine/**` and pure services, and is only possible because the engine imports nothing from React Native or Expo. `ui` (jest-expo + testing-library) covers components. Plus golden-seed replay, migration idempotency, and zod content validation as CI tests.

### G.5 Build order — Report first

`Engine → Report → Journal`. The Case Report and Share Card are built in the phase *before* any tool exists. This is what makes the growth flywheel load-bearing rather than aspirational, and it is why the phase graph has no dependency from the Case Report back onto the tools.

### G.6 Delivery reality

The source contract's 30-day plan is one senior engineer, full time, with four buffer days inside the thirty. Its own stated position: **day 30 is the end of the MVP-complete sprint, not the ship date.** The remaining scope — Camera, Tracker, the three non-ghost creature drops, and the paywall — runs a further 10–15 days, putting shippable v1 at roughly day 40–45.

`[ASSUMPTION]` Free-at-launch removes the paywall from that critical path, which should pull the date earlier; the PRD does not restate a date, because the schedule is an implementation artifact. The PRD fixes only the *contents* of v1 (its §6.1), not when they land — the estimate above is the source contract's, and it is the one to plan against until an implementation plan replaces it.

**Slip triage** is defined in the source contract with three named scenarios and pre-agreed cut lists, so a slip becomes a decision rather than a negotiation. The **never-cut list**, in priority order: (1) report and share card; (2) the four-tab structure; (3) the seeded engine and RLE replay; (4) the qualitative readout law; (5) commit-on-find; (6) just-in-time permissions; (7) the free first hunt reaching a real encounter.

`[NOTE FOR PM]` Item 4 on the never-cut list — the qualitative readout law — needs no carve-out. The one exception ever proposed, a percentage on the Case Report, was reversed on 2026-10-04, so the law now holds on every surface including the Case Report. The two documents no longer conflict: the PRD removed the number rather than rewrite the law around it. See §B.6 and §A.1 row 1.

### G.7 Release readiness

Signed builds for both stores; `assets/store/*`; a full string table; entertainment framing in the description; the disclaimer reachable from first launch and from Profile. A grep test rejects the banned phrases. The app must install and run offline from a clean install in airplane mode.

No coordinates appear on any report. Location is reduced to a coarse bucket plus human labels, e.g. "the north side of the house". Only two free-text columns exist in the entire schema.

---

## H. Accessibility

- **Screen readers:** the Case Report and Field Journal are navigable with VoiceOver and TalkBack. Live regions are used only for evidence capture and phase change. **Hidden scalars are never announced** — tension, attunement, rarity, and seed never reach assistive technology.
- **Dynamic Type:** supported to 200%, with the intensity rail and tool row capped at 140%.
- **Reduce Motion:** cross-fades replace transitions, the sweep becomes static, glitch is disabled and re-routed to audio, and radar dots animate statically at 0.5 Hz.
- **Contrast:** `ink` ≈15:1, `inkDim` ≈7:1, `inkFaint` ≈3.2:1, `trace` ≈11:1, `amber` ≈8:1.
- **Orientation:** portrait-locked except the Camera and Sky tools.
- **iPad:** not a target for MVP.

---

## I. Tone, Voice, and Aesthetic Direction

The PRD constrains behaviour; this section constrains how the app sounds and looks, because tone is where a product like this fails quietly.

### I.1 Voice rules

- **Never assert. Never wink. Never explain the mechanic.** Hedge is craft: `Possible`, `unconfirmed`, `unsigned`, `no match on file`, `the record is unclear`.
- **Maximum nine words on any in-session line.**
- The word "ghost" appears **only in the Hunt name**. Inside a session the vocabulary is `signal`, `contact`, `movement`, `the record`.
- The engine's contract, in one sentence: *decide how long to say nothing, and then make the first thing said feel inevitable and unprovable.*
- Silence is narrated, not empty. The app must never tell the user what they are about to find.
- Absence gets a line, not an apology: *"Nothing was recorded tonight. That is a result."* The nothing-case Share Card field note is *"Some nights are for listening."*

### I.2 Visual direction

Dark, mysterious, cinematic, premium, slightly tactical. The source brief's palette: near-black background, desaturated green, pale cyan, warning amber, muted red for danger. Colour is used sparingly so the camera view stays readable.

Explicit anti-references: cheesy Halloween styling, cartoon ghosts, neon overload, overly complicated sci-fi HUDs, tiny unreadable technical labels.

### I.3 The lavender icon concept

`ChatGPT Image Oct 4, 2026, 11_12_53 AM-2.png` (project root) — a rounded-square icon with a soft lavender-to-violet gradient over blurred blob forms on a light ground — was reviewed during discovery. **The owner classified it as exploratory/reference only, not binding.** It is recorded here rather than in the PRD so it is not mistaken for an approved direction. Noted for whoever picks up visual identity: a light lavender palette sits in tension with the night-horror framing used throughout the design documents, and the reconciliation (or rejection) is an open decision for `bmad-ux`.

### I.4 Sound and haptics

Twelve sound categories: ambient hum, static, radio noise, distant footsteps, breathing, wind, knocks, vocalization, UI chirps, radar pulse, EMF warning, encounter sting. Silence is used intentionally; there is no constant horror music.

Haptics escalate with proximity: light for a weak signal, escalating pulses as it closes, a distinctive pattern for a rare event, a strong short impact for an encounter. Continuous vibration is forbidden — it burns battery, it reads as a malfunction rather than a signal, and it hands the user a tell that a sensor is running.

**Haptics are a no-op, not an error, where the OS suppresses them.** iOS silences the Taptic Engine while the camera is active, during dictation, in Low Power Mode, and whenever the user has disabled haptics, so every haptic call must be safe to drop silently. Nothing may depend on a haptic having fired.

### I.5 Share Card rules

78% width, 9:16 default with a 4:5 feed variant. Hard rules: no watermark, no QR code, no URL, no "made with" line, no app-store badge. The footer is always the entertainment line. The stat row is counts and a band, inheriting the Case Report's — no percentage, per §8 OQ-1. Re-rendering the same content at the same device pixel ratio produces a perceptually identical image; byte identity is not achievable through a native view capture and is not required (PRD §9 A-9).

---

## J. Glossary Extensions

Terms used in this addendum and in downstream implementation work that are not in the PRD's Glossary.

- **Emission** — a single unit of engine output on a tick. The only interface between simulation and presentation.
- **Tick** — one engine step, driven by a sensor digest at 6 Hz.
- **Tick digest** — the run-length-encoded record of a session's ticks, used for replay and crash recovery.
- **ContentVersion** — a `YYYY.MM.DD.N` string. A bump invalidates replay parity and triggers a catalogue rebuild.
- **Content drop** — shipping a new Phenomenon, which by design requires no engine change.
- **ArchetypeEffect** — a value an archetype emits. Archetypes never touch state directly.
- **SessionDirective** — a constraint on the space of possible events. It may never name an event.
- **First-Run Directive** — the single bounded departure from engine honesty, guaranteeing one Encounter to a user with zero sealed cases.
- **Attunement** — the hidden scalar, `clamp01`, that rises on movement, tool use, and questions asked. It gates the `QUIET`→`SIGNALS` and `SIGNALS`→`ACTIVITY` transitions, so an engaged user reaches `ACTIVITY` faster and a passive one does not. Never shown to the user.
- **Tension** — the hidden `0..100` scalar the `TensionEngine` maintains, driving phase transitions and rarity eligibility. Never shown to the user.
- **Rarity band** — the gated ceiling on how rare an event may be, climbed by phase × tension × budget-consumed rather than drawn from a table. Legendary is a per-Session flag at ~0.5% base, not a draw. See §A.1 row 4.
- **Slice of the design laws** — the eleven non-negotiable laws in `brainstorm-intent.md`. Law 1, on verifiable numbers, stands in full on every surface: the Case Report exception once considered was reversed on 2026-10-04. See §B.6.
