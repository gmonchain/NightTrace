---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-NightTrace-2026-10-04/prd.md
  - _bmad-output/planning-artifacts/prds/prd-NightTrace-2026-10-04/addendum.md
  - _bmad-output/specs/spec-NightTrace/proposed-prd-patches.md
  - _bmad-output/planning-artifacts/architecture/architecture-NightTrace-2026-10-05/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/ux-designs/ux-NightTrace-2026-10-04/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-NightTrace-2026-10-04/EXPERIENCE.md
  - _bmad-output/specs/spec-NightTrace/SPEC.md
  - _bmad-output/specs/spec-NightTrace/capability-map.md
  - _bmad-output/specs/spec-NightTrace/evidence-model.md
  - _bmad-output/specs/spec-NightTrace/content-plan.md
---

# NightTrace - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for NightTrace, decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories.

**A note on governing forms.** Three PRD patches in `proposed-prd-patches.md` are unapplied to `prd.md` but are the governing form per owner ratification on 2026-10-06. This breakdown builds to the patched form:

1. **Shadow Person is haptic- and glitch-led; the camera is a hazard, not the instrument** (FR-6 reads "camera- and glitch-led" in the unpatched text; FR-8 and `01` §J.3 both say otherwise). Building FR-6 literally makes the hunt's documented play style its losing play style.
2. **No compass heading on Camera, no azimuth/altitude on Sky** (AD-15 bans degrees; AD-20 already ratified the reticle-and-meter form).
3. **The rendered verb set is the seven** — `SWEEP`, `ORIENT`, `ASK`, `RECORD`, `FRAME`, `FOLLOW`, `ALIGN`. The conceptual five-verb grouping is not the rendered set.

**A note on deleted scope.** The engineering contract's backlog (`02` §M) contains `T-6.2 — Paywall, purchase and the gate`, `HuntGate`, `LockedHuntCard` and a `paywall_viewed` event. AD-21 and SPEC §Constraints delete these outright: **no purchase seam, no tier column, no gate, no purchase event.** None is carried into this breakdown.

---

## Requirements Inventory

### Functional Requirements

FR-1: The system can generate a complete Session from a Seed composed of the Hunt, location if available, start time, environmental conditions, and a one-shot device sensor fingerprint, such that the same Seed reproduces the same Session exactly. The Seed is composed and persisted verbatim before the Session begins and is never recomputed. Given the Seed, Hunt, content version, and recorded tick digest, the simulation replays to an identical emission sequence. Replay is an audit property with no user-facing feature. A Session recorded without location still generates from time and fingerprint and is marked as having no place component. The engine reads no wall clock of its own.

FR-2: The engine can schedule emissions such that the timing of any emission is not learnable from the user's prior Sessions. Silence is always a valid draw — `emptyWeight` is strictly greater than zero in every event table. Across a seeded sweep of twenty-minute Sessions, the median-to-90th-percentile inter-emission interval ratio holds at ≥ 3.0. Rapid, repetitive, and impossible sequences are suppressed by cooldown and anti-repeat rules held in the engine, not in content. A directive may constrain the space of what can happen but never names a specific event. Directives surface as verbs with no object, no more than six per session, spaced at least three minutes apart. The longest silence falls in the 200–260 s band at the median, and at least one silence exceeding five minutes occurs in 22–35% of sessions. **The interval draw is memoryless — a long quiet stretch never raises the chance of an event.**

FR-3: While the user has zero sealed Cases, the system can guarantee their first Session reaches a real Encounter. The emission budget is forced to at least one, at least five minutes of silence elapse before the first emission, and the first Evidence emission is guaranteed capture-eligible. The directive does not apply once the user has sealed one or more Cases, is invisible to the user, and produces no copy, indicator, or detectable behaviour.

FR-4: The system can maintain an internal tension value that rises and falls with elapsed time, user movement, sensor anomalies, and emissions, and drives pacing, audio, haptics, and Encounter probability. The value is never displayed, announced, or exposed to assistive technology. Tension influences Encounter probability but never guarantees an Encounter.

FR-5: The system can use the magnetometer, accelerometer, gyroscope, motion, ambient light, location, microphone level, and camera state as generation material, and degrades gracefully when any is denied or absent, without blocking the Session. Every sensor channel reports exactly one of: ready, permission not yet requested, permission denied (with whether it can be asked again), hardware unavailable, unsupported platform, or error. Denial of any single sensor never prevents a Session starting or completing and never produces a nag loop. Magnetometer absent → EMF reports an inferred state from motion and clock. Location denied → the Hunt proceeds uncharted, Tracker shows bearing only, Seed omits the place component. Microphone denied → EVP is removed from the carousel entirely and Voice enters archive mode; the app makes no claim that anything answered. Sensor sampling stops when the Session screen loses focus or the app leaves the foreground.

FR-6: The system can run four Archetype behaviours — Observer, Stalker, Mimic, Ambusher — each with a distinct verb, pacing, sensory channel, and failure state. Observer is slow and tightening, **haptic- and glitch-led** (patched), and fails as `NOTICED`; the user's job is to avoid being seen. Stalker closes on the user under its own power, haptic-led, and fails as `CORNERED`. Mimic is audio-in and entity-out, failing as `MISDIRECTED`; the user's job is to ask it something. Ambusher is fast and glance-and-gone, visual-led, and fails as `GONE`. No file under the engine directory contains a Phenomenon name; the engine references archetypes only, through a registry. Reassigning a Phenomenon to a different Archetype requires content changes only.

FR-7: The system can add a new Phenomenon to the shipped app with no engine change. Adding one requires only content definitions, assets, a registry entry, and a content version increment. Content definitions are validated at build and at launch, so malformed content fails the build rather than reaching a user. A content version increment is the only event that invalidates Session replay parity, and it does so knowingly.

FR-8: Each Hunt can bind a Phenomenon to an environment, a tool set, a pacing profile, objectives, a completion condition, and a length band. Ghost: indoor, slow and responsive, audio-led, 10–30 min, tools Voice/EMF/EVP/Camera, five objectives, seals on user action with automatic close at thirty minutes and a sixty-second minimum. Bigfoot: outdoor, fast and sudden, visual-led, 15–40 min, tools Tracker/Camera/Radar. Shadow Person: indoor, slow and tightening, **haptic and glitch-led**, 8–20 min, tools Camera/Radar/EMF. Alien: outdoor under open sky, closing and escalating, visual and haptic-led, 12–30 min, tools Sky/Camera/Radar. Every Hunt's objectives are earnable without reaching an Encounter. These bindings are load-bearing product decisions, not tuning.

FR-9: The user can calibrate the device, name the place, set an intention, choose an intensity, and enter a Session through a deliberate hold gesture. The Brief requires calibration, a place name, and an intention before the Session can start; the intention is `Ask`, `Watch` (default), or `Wait` and biases likelihood only. Entering requires a sustained hold of roughly 800 ms with a fill hairline and a label that changes partway; early release cancels with a soft warning and leaves the Brief intact. The Brief offers duration selection of 10/20/30/45 minutes or open-ended, defaulting to the Hunt's length band. It captures the one-shot sensor fingerprint and reports the calibration outcome as quiet or noisy baseline, neither being a judgment. If calibration is interrupted or no magnetometer is present, the Brief completes on an inferred baseline and says so. The Brief can be abandoned any time before the hold with no Session row created. A hold interrupted by backgrounding aborts silently and resets. During a Session there is exactly one way out — `Leave the Field`, requiring a hold — and leaving seals the Case like any other ending.

FR-10: The user can choose one of four intensity levels before a Session and cannot change it once the Case has begun. Levels are `Ambient`, `Present` (default), `Intense`, and `Ritual`. The selection screen states plainly that higher intensity means more signals and never a guaranteed Encounter, and that intensity is fixed during a case. Once a Case is live the control is locked and explains why. Glitch-channel visuals are enabled only at `Intense` and `Ritual`. `Ambient` forbids Encounters outright so the level's own promise is literally true. Intensity scales exactly four coefficients — emission rate, encounter budget (0/1/2/2), content ceiling, sting gain — and never scales the silence floor below its mandated minimum.

FR-11: The user can sweep a space for a magnetic field reading and log a spot. The surface offers `SWEEP` (arms for ten seconds) and `LOG THIS SPOT`. Visible states are `STILL`, `DRIFT`, `STIR`, `INTERFERENCE`, `INFERRED`. The field renders as an arc whose width varies across four levels with a rolling-window trace. There is no y-axis, no unit, and no numeric readout anywhere on the surface. The surface must not display raw magnetic strength as a paranormal reading.

FR-12: The user can sweep for targets, observe a bearing and a range band, and log a bearing. Targets are procedurally generated with a birth, a velocity, an uncertainty, and a death; they may appear briefly, drift, fade, approach, or dissolve. Targets are never randomly placed and never lock on. Bearing is one of eight compass points plus a range band; distance is never shown in metres or any other unit. A target's displayed uncertainty only ever widens, or is narrowed by direct observation; cone width never collapses to a lock. No more than four concurrent targets exist in a twenty-minute session.

FR-13: The user can hold to ask a question and, very rarely, have the surface show a single word fragment. The surface offers `ASK` as a sustained hold and `LOG THIS`. Output is a sweeping band line, a flattening ribbon, a mandatory silence of roughly 300 ms, then at most one word, which fades in, holds about 2.4 seconds, and fades out. At most one line is produced per ask. **No wording anywhere on the surface or in its copy states or implies that anything was received, transmitted, heard, or contacted.** The surface carries the permanent disclaimer `Bands are theatre. Nothing here is received.` Non-response is the majority case; a response may be delayed up to ninety seconds and **may arrive on a different tool than the one that asked**. Words are drawn from authored banks; no text is generated at runtime. With the microphone denied, the surface enters archive mode and shows no response wording that implies anything answered.

FR-14: The user can record audio during a Session, mark moments, and keep or discard segments as Evidence. The surface offers `RECORD`/`STOP` and `MARK`, over rolling thirty-second segments. Marked moments appear in a marker lane and can be played from the marker, kept as Evidence, or deleted. The surface never asserts that recorded audio is paranormal and the app never claims an audio event was scientifically meaningful.

FR-15: The user can frame the environment, catch an Encounter on camera, and capture a frame as Evidence. The default overlay is deliberately restrained: rule-of-thirds grid, corner brackets, a mono time strip, an unlabeled three-bar meter, a torch toggle, and a vignette. **No compass heading and no numbered or lettered axis** (patched). Night-vision styling, scan lines, heavy noise, and chromatic aberration are not defaults and appear only through the glitch channel at `Intense` and `Ritual`. Capture triggers a brief, subdued flash and produces no shutter sound. Encounter frames are short sprite sequences at low opacity, never centered and never in focus, appearing caught rather than presented. Only one camera preview may exist at a time; it unmounts when the screen loses focus. With the camera denied, the surface falls back to a dark-room renderer preserving Encounter timing and Evidence output. Pinch-to-zoom is intentionally not implemented.

FR-16: The user can walk a hunt toward a bearing and log trail marks. The surface shows a compass, a bearing chevron, a five-step proximity ladder (`COLD`, `WARM`, `CLOSE`, `NEAR`, `HERE`), a dead-reckoned trail path, and a signal-age indicator. Logging a trail mark requires the ladder to have reached `CLOSE`. No numeric distance, speed, or coordinate is ever displayed. The surface carries a reachable disclosure stating that proximity is inferred from the user's own movement rather than measured against anything, available from the surface itself and not buried in settings.

FR-17: The user can scan the sky, pan, and capture an object. The surface shows a generated starfield, **a reticle**, an eight-segment alignment meter, and an alignment tolerance (patched; azimuth/altitude removed). It is permanently labeled as generated. A scan arms for a bounded period; capture requires alignment within tolerance for a sustained moment. The starfield is procedurally generated and never presented as a real star catalogue. **The generated label travels with the capture** — a Sky capture committed as Evidence carries the marking into every surface it later appears on, and the marking is composed into the stored pixels at capture. The Sky surface produces no Evidence kind asserting an object was tracked or resolved.

FR-18: The user can capture Evidence during a Session, and the system commits each item at the moment of capture rather than at session end. Evidence carries a kind, a certainty band of `AMBIGUOUS`/`SUGGESTIVE`/`COMPELLING`, a channel, the tool that produced it, the phase it occurred in, and its source. Each kind maps to exactly one evidence glyph, and the glyph set is closed against the kind list by a content-validation test. A capture made with nothing active still commits as a `null_reading` with the copy *"You marked a spot with no reading. That is also a record."* and counts toward negative space rather than being discarded. Two captures within 1.5 seconds coalesce into one item with a `×2` marker. Evidence is written to durable storage at the moment of capture. No certainty band is ever expressed as a number or percentage. The kind list is the closed ten-kind vocabulary in `evidence-model.md`, with per-Hunt aliases resolving onto it.

FR-19: The system can accumulate a Session's Evidence into a Signature and present it as a strip of slots against the user's Signature Archive. The strip renders 7–9 slots **read from the case, never from a constant**, and resolves to `PARTIAL MATCH · UNIDENTIFIED` or `NO MATCH ON FILE`. A Signature is never presented as a positive identification of a real creature. The Archive is a four-by-two grid where a filled slot means a matched signature, a marked slot means seen-but-unidentified, and an empty slot means never seen. An unidentified slot renders as a `?` tile that pulses slowly at roughly 0.5 Hz whenever the Archive is on screen. The `?` tile is never labeled, captioned, or the target of a callout or coach mark. **No surface states or implies that a full match is reachable, that one exists, or what any slot's completion would identify** — no progress readout, no stated unlock requirement, no completion count, no per-Phenomenon checklist.

FR-20: The user can review each Evidence item after a Session and mark it explained or unexplained, and can record a reason for an explained item. Triage verdicts are `UNEXPLAINED`, `INCONCLUSIVE`, `EXPLAINED`, and `UNREVIEWED`. An explained item carries a reason from the closed set: a vehicle, a building, the user's own movement, equipment, or other. **A reason phrase is recorded as what the user decided, not as what the app determined, and renders in the ledger as the user's verdict rather than as a finding.** The triage ritual is presented as a deliberate review, not a dismissible dialog. **The asymmetry is structural:** marking items explained raises the explained ratio and moves a Case toward `EXPLAINED`; marking items unexplained does not move it toward `UNEXPLAINED`, which additionally requires an Encounter. The interface does not explain this asymmetry and no copy states that a combination of verdicts unlocks a status. Triage verdicts never move the Signature strip. Skipped items stay `UNREVIEWED` and weigh toward `INCONCLUSIVE`.

FR-21: The system can derive the Case's status from the evidence, the triage verdicts, and whether an Encounter occurred. Status is `UNEXPLAINED`, `INCONCLUSIVE`, or `EXPLAINED`. Convergence is the fraction of Signature slots filled; an explained ratio is the fraction of triaged Evidence marked `EXPLAINED`. `UNEXPLAINED` requires all three of convergence ≥ 0.60, at least one Encounter, and an explained ratio < 0.34. `EXPLAINED` requires an explained ratio ≥ 0.60. Any other combination resolves to `INCONCLUSIVE`. A case with no Encounter can never resolve to `UNEXPLAINED`, however strong its convergence. A case that captured nothing at all still produces a complete report with a valid status. The status function is pure and derives the slot count from the case.

FR-22: The user can view a complete Case Report at the end of every Session that produced a Case, and can seal and file it. The report contains, in order: a masthead carrying the case reference and date; a status seal showing the status word, the case name, and hunt metadata; a stat row; a signature strip; a narrative account of three to six declarative lines; a souvenir reel of captured media; an evidence ledger listing each item with type, time, and triage verdict; a negative-space block; an investigator note field; and a conditions footer carrying the Seed reference, the entertainment line, and the content version. The stat row shows duration, evidence count, encounter count, and source count, plus an activity band of `LOW`/`MODERATE`/`HIGH`, and **shows no percentage and no unit-bearing number of any kind**. The narrative account is written from an authored template bank; no text is generated at runtime. The investigator note is an open field with the prompt *"What did you notice?"* and the placeholder *"The tools miss things. You don't."* Filing requires a sustained hold of roughly 600 ms; a filed case shows a sealed chip and a revision stamp if later edited. A Session with zero Evidence and zero Encounters still renders a complete report.

FR-23: A sealed Case Report can never be altered in a way that misrepresents what happened. Sealing is an explicit user action and is irreversible without producing a visible revision stamp. The conditions footer always carries the entertainment line *"An investigation experience. Not a measurement."* Report values are persisted at seal and never recomputed.

FR-24: The user can generate and share a single image card from a sealed Case Report. The card carries the case reference, an artifact block, the status word with its stamp ring, a three-cell stat row, a short seeded field note, and a footer. The artifact block shows the case's strongest artifact — a word, a captured frame, or a trace — or, when there is none, a negative-space treatment stating that nothing was recorded. The field note defaults to one of four seeded options and the user may replace it with up to sixty characters of their own text; the card is not regenerated around the edit beyond re-rendering the note. The card supports a default portrait ratio and a feed ratio. `Save to Photos` is available only when the media-library permission has been granted; if not granted the control is **absent**, not present-and-failing, and the user is not prompted from the card. Re-rendering the same card with the same content at the same device pixel ratio produces a visually identical image (perceptual identity, not byte identity). **Hard exclusions:** no watermark, no URL, no QR code, no app-store badge, and no attribution text. The footer always carries the entertainment line. The card can be shared through the system share sheet, saved to photos, or canceled without loss.

FR-25: The user can browse their Cases, Phenomena, Evidence, and Field Notes, organized by night. The Journal is segmented into Overview, Phenomena, Evidence, and Cases. Entries group by night using a boundary at 04:00, so a session running past midnight belongs to the evening it began. The Phenomena section shows discovered entries, entries seen but unidentified, and per-Phenomenon encounter and evidence counts. **It shows no locked entries, no silhouettes, and no stated unlock requirements** — an unencountered Phenomenon is simply absent. An unsealed case is signaled with a dot on the Journal tab. The Journal presents the user's own historical counts and never a number the user could verify against the world. Deleting a Case unlinks its Evidence rather than deleting it, and the Evidence keeps rendering with a `NO CASE` chip.

FR-26: The Journal can never be made public or social. No feed, friends list, public profile, or comparison surface exists anywhere in the app. Sharing is one-directional and always leaves the app as an image. Journal content is stored on the device only and is never transmitted.

FR-27: The user can export their Journal data and delete it entirely. Export produces a user-readable file including the entertainment notice. Deletion removes Journal content from the device. Because the app has no backend and no account, deletion is necessarily local and cannot reach data the user has already shared; the deletion screen must say so rather than implying otherwise.

FR-28: The user's Clearance can advance through named ranks based on sealed Cases, documented Phenomena, and matched Signatures. Ranks are `FIELD ASSISTANT`, `FIELD ASSISTANT II`, `CASE OFFICER`, `SENIOR CASE OFFICER`, and `ARCHIVIST`. Advancement depends on those three inputs only and never on elapsed time or on the number of events that fired. Clearance gates only cosmetic case-file themes and journal art, and never a tool, an Evidence kind, a Hunt, or an intensity level. No XP value is displayed anywhere in the app. Progression inputs are computed before the seal transaction opens and never written afterwards.

FR-29: The system can display streaks and award case stamps, and never penalizes a missed night. A streak is displayed but never enforced: missing a night has no penalty, no loss, and no notification. Badges appear as case stamps within the Journal, never as a trophy wall or a separate reward screen.

FR-30: The user can start a Hunt, resume an interrupted Session, and see the night's Anomaly from Home. Home presents the user's Investigator Clearance, a featured Hunt, the other Hunts, a resume affordance when a Session was interrupted, recent Evidence, and the daily Anomaly. Home presents no tool grid and no equipment navigation. The Anomaly line is a single line of atmospheric text drawn from an authored, seeded set. The Anomaly line and all Home copy satisfy FR-33. **The Anomaly is not shareable in v1.** Foregrounding an `active` Session never replays the digest and never continues the simulation — it seals from the last checkpoint on the user's confirmation.

FR-31: The user can run a short standing observation that produces a Journal entry but not a Case. A Field Note is presented as its own mode with its own framing copy, not as a Hunt with a shorter timer. It runs for roughly three minutes and closes on its own. It writes a short Journal entry containing its time, its place band, and one line of observed material, and produces **no** Case Report and no Case reference. If the user moves the device substantially or picks it up mid-note, the note ends early and records itself as short rather than discarding what it captured. No Encounter, no Case, and no Clearance advancement can result from a Field Note alone.

FR-32: A first-time user can learn the app's frame and acknowledge it before their first Session. Onboarding is four screens: that nothing here is proof, that the case is local, that the user chooses their night, and that permissions are asked only when needed. The entertainment notice is non-skippable on first launch and must be acknowledged. The notice remains permanently reachable from Profile, is included in any data export, and contains the ratified safety line for a horror-adjacent app — a calm statement covering photosensitivity (the glitch channel's visual effects), sudden audio, and the fact that the app is designed to startle. The safety content appears in the About notice, not on the onboarding path.

FR-33: No sentence anywhere in the app, its metadata, its screenshots, or its share output may assert anything about the real world. The build fails if any banned term appears in shipped strings: detection and proof language, confirmation and verification language, authenticity claims, scientific and science claims, thermal and radiation language, accuracy claims, algorithm and AI claims, `%` anywhere in any shipped string, metres as a distance to a contact, and haunted as a statement of fact. **The banned-term check runs against a declared, enumerated string-surface set, not a glob of the app binary** — at minimum the UI string tables, the iOS `Info.plist` purpose strings (`NSMotionUsageDescription` and `NSMicrophoneUsageDescription` in particular), the Android manifest permission strings, the store description and title, screenshot captions, and the About notice. Approved market terms are limited to: paranormal, ghost hunt, cryptid, investigator, field journal, EMF, EVP, spooky, adventure, night. App name is **NightTrace**; subtitle is **Paranormal field journal**. Category is Entertainment; rating 12+/Teen, derived from stated questionnaire inputs rather than asserted. No statistic, social proof, award, or count of users ever appears in marketing copy. No fake telemetry or progress-scanning language appears anywhere. The app requests no permission before it is needed, and each request explains why in the moment.

FR-34: The system can plant false Evidence during a Session and let the user disprove it at Triage. Some Evidence is marked internally as contested and presents identically to ordinary Evidence until the user triages it. At Triage a contested item can be resolved as explained, and doing so is recorded and reflected in the explained ratio that drives status derivation. A contested item's plant is driven by the Session's seeded forks, so it is reproducible in replay and absent from a sweep in which it was not drawn. A contested item never resolves to `UNEXPLAINED` on its own and never fabricates an Encounter. Nothing in the interface tells the user an item is contested before they triage it, and nothing congratulates them afterwards.

FR-35: The system can distinguish, name, and report the different ways a Session can legitimately produce nothing. Four no-event outcomes exist and are named in the record: `QUIET_NIGHT` (the session held silence throughout), `WINDOW_CLOSED_EMPTY` (the encounter window opened and produced nothing), `FALSE_POSITIVE` (a signal was logged and triage resolved it as ordinary), and `NOT_FRAMED` (an encounter occurred but the user was not looking at the right tool). Each carries its own authored rail copy and its own treatment in the Case Report; they are not collapsed into one generic state. **`FALSE_POSITIVE` and `NOT_FRAMED` are attributed to the user's own action; `QUIET_NIGHT` and `WINDOW_CLOSED_EMPTY` are attributed to the night**, and the distinction survives into the copy. The Journal can show a user how many of each they have recorded.

FR-36: The Case Report can state what was *not* recorded, using the absence rule. The report carries two to four lines drawn from a negative-space bank describing what the session did not capture. **Absence is meaningful only where a measurement was possible** — a tool never opened, a permission denied, or a sensor absent generates no line. The block is omitted entirely when no line qualifies, rather than filled with placeholder text. Lines are drawn from the seeded report fork, so a case's negative space is stable across re-renders.

FR-37: The Shadow Person Hunt runs noticing in reverse: activity endangers the user rather than the Phenomenon. A `noticing` accumulator rises against the user and reaches `NOTICED` at 1.0, ending the Session early with its own stamp. It accrues from torch on, camera live, and movement, at rates held in content. Standing still is safe. Every emission reads as a response to the user rather than as ambient activity. The accumulated tension curve inverts relative to the other three Hunts. **The app never tells the user any of this** — no tutorial, hint, tooltip, or line of copy connects stillness to safety; the mechanic is learned from consequence, and the report stamp is the entire teaching mechanism. Evidence collected before a `NOTICED` ending is preserved in full and the Case still produces a complete report.

FR-38: The Bigfoot Hunt's Encounter can only be rendered if the Camera surface is live at the moment of resolution. The Ambusher archetype's Encounter is suppressed — not replaced, not downgraded — when the Camera is not the active tool surface at resolution time. The other three Hunts can be experienced without the camera; this one cannot. The Session records the missed window rather than hiding it, so a Case sealed after a suppressed Encounter can still report that the window opened.

FR-39: The Mimic archetype answers in words; the Alien Phenomenon never does. No Alien Hunt emission contains a word, a phrase, or any found text — Alien transmissions render as a pulse glyph row, not as speech. Words appear in content only under the Mimic archetype, which is the only archetype whose mechanic is language. The rule is enforced as a content-validation test over the Hunt's emission bank, so a future content drop cannot break it silently. Specifically, the `transmission` alias must never resolve to `word_bank_hit` — it maps to `sky_light`.

### NonFunctional Requirements

NFR-1: **Render performance.** A sensor-derived visual never causes a React re-render per sample. Sensor rates reach Reanimated `SharedValue`s and the digest; no per-sample value is written into React state.

NFR-2: **Startup and list performance.** Cold start to an interactive Home completes under two seconds. Long lists are virtualized and scroll at 60 fps on a mid-range Android with a 500-entry fixture and a 400-beat report timeline.

NFR-3: **Battery — duty-cycled sampling.** Sensors are duty-cycled by ladder rather than run continuously. The Session offers a low-power path that keeps the loop intact, targeting the OQ-2 budget. Low power drops to the lowest rung and disables ambience and the glitch channel.

NFR-4: **Battery — critical-battery escape.** At critically low battery the app offers to seal the Case immediately from the live Session, producing a complete report from the checkpoint. The offer is the user's to accept; the Case is never sealed automatically.

NFR-5: **Durability — commit on capture.** Evidence is written to durable storage at the moment of capture, so a crash or force-quit mid-session loses nothing already logged. A Session is checkpointed every 60 seconds and on every backgrounding. An interrupted session is recoverable from the `sessions` row and its RLE tick digest; that recovery is the crash-recovery story — no third-party crash reporter, no upload, no identifier.

NFR-6: **Determinism.** A completed session is reconstructible from `seed + hunt_id + content_version + tick_digest[]`. `SeedParts` is persisted verbatim and never recomputed. The digest is stored run-length-encoded. Replay is an audit property, never a user-facing promise. A `ContentVersion` bump is the only event that breaks replay parity, and fork labels are never renamed once a content version ships.

NFR-7: **Engine purity.** `src/engine/**` imports only `src/engine/**` and dependency-free TS. It may not import `react`, `react-native`, `expo*`, or `zustand`; may not call `Date.now()`, `Math.random()`, or `performance.now()`; and performs no filesystem, network, database, audio, or haptics access. Enforced by ESLint `no-restricted-imports` and `no-restricted-globals`.

NFR-8: **No network, ever.** No backend, no account, no sign-in, no server, no network call of any kind, no generative AI and no cloud AI anywhere in the product at any version. The app installs and runs with airplane mode on from a clean install.

NFR-9: **Privacy.** Analytics are on-device only with no network egress and no third-party SDK: no coordinates, no free text, no media. `installRef` is a random resettable UUID. `analytics_events.session_id` is deliberately not a foreign key, so analytics outlive case deletion. No coordinates appear on any Case Report — location is a coarse bucket plus a human label. Exactly two free-text columns exist in the entire schema. Logs never contain evidence content, coordinates, or free text. Media lives on disk under `Paths.document/cases/<caseRef>/` with relative paths, never as a BLOB.

NFR-10: **Accessibility — screen reader.** The Case Report and Field Journal are fully navigable with VoiceOver and TalkBack. Live regions announce evidence capture and phase change only. Hidden internal values are never announced.

NFR-11: **Accessibility — Dynamic Type, motion, contrast, targets, orientation.** Dynamic Type is supported to 200%, with the intensity rail and the tool row capped at 140%; at the largest sizes the body clamps and scrolls and primary buttons never leave the screen. Reduce Motion replaces transitions with cross-fades, makes the sweep static, animates radar dots statically at 0.5 Hz, and disables the glitch channel and re-routes it to audio. Contrast is a floor on the token set, not a per-screen choice. No interactive target is below 44pt. Orientation is portrait-locked except the Camera and Sky surfaces. No information is conveyed by colour alone.

NFR-12: **Hidden scalars stay hidden.** Tension, Attunement, rarity, and Seed are never displayed, announced, or exposed to assistive technology.

NFR-13: **Navigability.** Every tool surface is reachable within one gesture from the live Session, and no tool presents a dead end — every empty state carries exactly one action.

NFR-14: **Content integrity.** Content definitions are zod-validated at build and at boot, so malformed content fails the build rather than reaching a user. A content-validation test asserts every per-Hunt evidence alias resolves onto the closed ten-kind vocabulary, that no hunt introduces an eleventh kind, that each kind maps to exactly one glyph, and that the `transmission`→`word_bank_hit` mapping never occurs.

NFR-15: **Storage integrity.** A shipped migration is immutable; every migration runs inside a transaction; the schema is additive-only for a shipped version; `migrate()` is idempotent, asserted by test.

NFR-16: **Build and release chain.** Native projects are CNG-generated from `app.config.ts` and gitignored; `app.config.ts` is the only source of native config truth. Builds run locally (`expo prebuild` → Xcode archive / `./gradlew bundleRelease`) and fastlane owns signing and store submission for both platforms. EAS is not in the path and Expo Go is not a delivery target; `expo-dev-client` with dev/preview/production profiles is mandatory. `fastlane/` sits at the repo root, never inside the generated `ios/` or `android/`. Signing material never enters the repository. Release is manual and reversible.

NFR-17: **CI quality gates.** A CI pipeline is the enforcement locus for: both Jest projects, the ESLint boundary rules, the token-sync test, the content-validation and alias tests, migration idempotency, and the golden-seed replay. TypeScript runs `strict` plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, and `noImplicitOverride`. All are CI-blocking.

NFR-18: **Claims lint.** The build fails if any banned term appears in the declared, enumerated string-surface set. The entertainment line is a single exported constant, never a retyped literal, appearing in three places by design plus any data export.

NFR-19: **Zero-permission playability.** The app is playable end to end with zero permissions granted. Permissions are requested just in time by the tool that needs them, never at launch; each request explains why in the moment; a permanent denial swaps `Allow` for `Open Settings` and is never re-offered in the same session.

NFR-20: **Store compliance floor.** Apple requires an iOS 26 SDK build; Google Play requires target API 36. The store-submission review checks metadata and screenshots against App Store guidelines 2.3.1/2.3.7, not only against the banned-term list.

### Additional Requirements

Extracted from `ARCHITECTURE-SPINE.md`. These are technical requirements that shape epic and story sequencing.

- **No starter template.** The architecture specifies no starter/greenfield template. The project is scaffolded from scratch on Expo SDK 57 (`expo@57.0.26`), React Native 0.86.3, React 19.2.3, Node ≥ 22.13. **Epic 1 Story 1 is the scaffold.**
- **Design paradigm.** Functional core / imperative shell. `src/engine/**` is a pure TypeScript function of `(seed, tick input) → Emission[]`; everything else is the shell.
- **Dependency direction is a rule, not a convention.** The four-layer import table (Core / Input adaptation / Content / Shell) is enforced by ESLint. Arrows point only downward; `engine/` sits at the bottom.
- **AD-1 … AD-30 are binding invariants.** Each story inherits the ADs its capability maps to; the Capability → Architecture Map is the routing table.
- **The presenter bottleneck (AD-2).** Exactly one node — `useSessionPresenter` — maps emissions to haptics, audio, store writes, evidence commits, and UI. A capture is committed by the presenter and nothing else. Any code outside the presenter that reads an `Emission` is a defect.
- **Randomness from labelled substreams only (AD-4).** `RandomEngine.fork(label)` over the closed seven-label set for v1: `rng.session`, `rng.events`, `rng.radar`, `rng.words`, `rng.encounters`, `rng.report`, `rng.signals`. Content-driven behaviour draws from `fork('rng.content.' + definitionId)`. The PRNG is our own xmur3 → sfc32 implementation, no dependency.
- **Two table families with opposite lifecycles (AD-9).** Catalogue tables are rebuilt from bundled JSON (delete, batch insert, one exclusive transaction). User tables are never touched by a rebuild. Foreign keys point only within the user family; `evidence.creature_id` and `sessions.hunt_id` are `TEXT` ids validated in the repository layer, never by a SQLite FK.
- **The persistence rule (AD-10).** If a value can be recomputed from `(seed + content version + tick log)`, it must not be persisted. If the user would be angry to lose it, it must be in SQLite before the screen closes. **The one precedence:** from the moment a Case is sealed, the values constituting its report are persisted and never recomputed.
- **Session checkpointing (AD-11).** One `sessions` row on start; one exclusive transaction every 60 seconds and on every backgrounding updating elapsed time, appending the RLE tick digest, and inserting not-yet-committed evidence. `services/Clock` is the single producer of `SessionMs` inside a live session.
- **SQL in exactly one layer (AD-12).** `src/db/repositories/*` is the only place SQL string literals exist. Explicit column lists, no `SELECT *`. Repositories return `engine/models` types via `src/db/mappers/*`. Routes contain no SQL and no engine calls.
- **Model conventions (AD-14).** Branded ids; every field `readonly`; every variant set a discriminated union tagged `kind` with exhaustive `switch` and `default: never`; absence spelled `null`, never `undefined`; no `any`, no `as` outside mappers and validator output.
- **Theme tokens have two sources (AD-17).** `DESIGN.md`'s YAML frontmatter is the design source; `src/ui/theme/tokens.ts` is the code source; a CI test asserts they agree on every token name and value, and asserts there is no light theme.
- **The Case is its own entity (AD-24).** `cases` is its own user table with at most one frozen Case Report. `sessions.status` ∈ `{active, sealed, discarded}`. `active → discarded` when a Session ends under sixty seconds: no report, no Case, evidence stays unlinked (`NO CASE`). The seal transaction is the sole writer of the Case, the Case Report, `discoveries`, `badge_awards`, and `user_progress`. Deleting a Case never deletes its Evidence.
- **Three closed taxonomies (AD-25).** Phase ladder closed at five (`QUIET` → `SIGNALS` → `ACTIVITY` → `ENCOUNTER_WINDOW` → `RESOLUTION`) plus a terminal `ENDED` marker that is not a phase; the user-visible state is a separate four-word ladder (`QUIET` → `LISTENING` → `ACTIVE` → `CONTACT`). Four named no-event outcomes; six failure states (`NOTICED`, `CORNERED`, `GONE`, `MISDIRECTED`, `INTERFERENCE`, `NOT_ALIGNED`), all first-class terminal evidence rather than aborted sessions.
- **Backgrounding is a hard stop (AD-29).** All channels off, camera inactive, engine paused, elapsed time frozen. Two-second re-calibration grace period on foreground with no events. An encounter that would fire while backgrounded is suppressed entirely and does not count against the session's encounter allowance.
- **The route tree is the IA (AD-29).** Exactly four tabs. Tab bar hidden entirely during Brief and Session. Tools push above the session, full-screen, one at a time. The Case Report is a destination, not a modal. Sheets never stack two deep except Triage over a Session.
- **Report-first build order.** Override 14 ratified: the Case Report and Share Card are built before any tool exists. The growth loop is tools generate → report packages → share recruits → new investigators generate more.
- **Media rule.** Files on disk under `Paths.document/cases/<caseRef>/`; rows store `relative_path`, `mime`, `bytes`, `duration_ms`, `checksum`. Never a BLOB. Paths are always relative. **A marking that must travel with a capture — the Sky `GENERATED` label — is composed into the stored pixels at capture**, not overlaid at display time.
- **Config.** Settings live in `expo-sqlite/kv-store` behind the typed `db/kv.ts` wrapper. No settings table.
- **Error shape.** `Result<T, E>` from `util/result.ts` for recoverable paths; `invariant()` for programmer error. No throwing across a service boundary for an expected condition.
- **Testing.** Two Jest projects: `engine` (node preset — possible only because of AD-1) and `ui` (jest-expo + testing-library), plus golden-seed replay, migration idempotency, and zod content validation as CI tests.
- **Content authoring is on the critical path with three dated gates.** Four hunt definitions by day 11 (or the archetype runtime cannot pass its own done-when), report copy by day 16 (or the report service has nothing to render), and event-table weights which are tuning requiring simulation cycles. ~200 authored strings, 12 JSON files with ~100 event-table rows, 48 recorded word fragments, the Anomaly set, and 97 audio files.
- **Deferred, not buildable in v1.** The CI provider and rollout path; tuning values and the test matrix; the sampling ladder's exact rungs; the tool row's large-type form factor; the mono face; the safelight hue; Director Mode and the global shared-seed night; localisation; clearance-gated cosmetic themes; Share Card variants, journal full-text search, hidden badges, iPad, biometrics.
- **The `signatureSlots` content field is adopted.** `HuntDefinition` gains `signatureSlots: readonly SignatureSlot[]`, content-validated for a length of 7–9 with every entry drawn from the closed six (`trace · voice · form · habit · place · refusal`).
- **Two schema flags for a story to resolve.** `thermal` is a member of the channel union no evidence kind can reach (recommendation: delete it in the same migration that would otherwise add nothing); and `cold_spot` is dropped as an evidence alias but may still fire as an ambience beat on the haptic channel.

### UX Design Requirements

Extracted from `DESIGN.md` and `EXPERIENCE.md`. Each is specific enough to generate a story with testable acceptance criteria.

**Design system**

UX-DR1: Implement the full colour token set from `DESIGN.md` YAML frontmatter as typed tokens — `night`, `night-deep`, `ledger`, `plate`, `rule`, `rule-soft`, `rule-strong`, `bone`, `prose`, `ash`, `dim`, `safelight`, `safelight-soft`, `olive` — with dark-only as the sole theme. `safelight` is reserved without exception for recorded moments and is never decorative, atmospheric, or brand.

UX-DR2: Implement the typography ramp as typed tokens — `display` (46px Newsreader 300), `title` (30px), `heading` (22px), `account` (18px), `prose-small` (15px), `label` (12px IBM Plex Mono, 0.14em), `meta` (10.5px, 0.16em), `micro` (9.5px, 0.18em), `stamp` (26px mono 600). Serif is anything a person would write; mono is anything the machine records. Never a third family, never above weight 500 in Newsreader, never mono below the agreed floor.

UX-DR3: Implement the spacing scale `1`(4) · `2`(6) · `3`(8) · `4`(12) · `5`(16) · `6`(22) · `7`(28) · `8`(40) · `9`(56) as named tokens, with no raw pixel gaps in components. Vertical rhythm between major blocks is a hairline plus a gap; horizontal rhythm inside a row is tight.

UX-DR4: Implement the motion token set — `quick` 120ms, `base` 180ms, `enter` 240ms, `screen` 380ms, `seal` 900ms — plus the named animations `ntBreathe` (5s), `ntDot` (3s), `ntPulse` (2s), `ntUp` (240ms), `ntFade` (240ms). **The rate ceiling is a product rule:** nothing moves faster than the 5s field breath except a haptic; `ntPulse` at 2s is the single deliberate exception.

UX-DR5: Implement the radius scale — `DEFAULT` 2px on buttons, chips, cards and most surfaces; `sm` 3px; `md` 4px; `sheet` 14px on top corners only; `full` reserved for the genuinely circular. Nothing in a document surface is fully rounded; no control is a capsule.

UX-DR6: **There are no shadows.** Depth is expressed exactly two ways: one tone step (`ledger` above `night`, `plate` above `ledger`) plus a `rule` hairline. No drop shadows, no glows, no coloured shadows, no blur behind sheets, no backdrop-dim as a depth cue. The camera vignette is the one permitted exception and is a lens artefact, not elevation.

**Design system components**

UX-DR7: `Rule` — a 1px `colors.rule` hairline, the primary structural device, with a `rule-soft` variant for container edges that should barely register. The page is ruled, not boxed.

UX-DR8: `Seal` — a ring in `colors.bone` passed through the `ntInk` turbulence-and-displacement filter, rotated `-4deg`, carrying the ring text `NIGHTTRACE · FIELD` and the status word in `typography.stamp`. Only `UNEXPLAINED` takes a colour (`safelight-soft`); `INCONCLUSIVE` and `EXPLAINED` both read in `bone` and the status word is the only difference between them — `EXPLAINED` earns no celebratory styling. Never appears clean-edged, never animates except as part of the 600ms seal hold.

UX-DR9: `StatCell` — four-up on the Case Report and Journal Overview (`CASES` · `HOURS` · `EVIDENCE` · `ENCOUNTERS`), three-up on the Share Card, and **no stat row at all on Profile** (whose identity block shows two values only: `CASES SEALED` · `PHENOMENA DOCUMENTED`). Label in `meta`/`ash` above, value in `label`/`bone` below. Values are counts of things that happened or elapsed time — no percentage, no unit, no exception.

UX-DR10: `SignatureStrip` and its `SignatureSlot` cell — bordered 30px cells, unlit as `rule` on nothing, lit carrying vertical marks in `safelight-soft` with an `olive` border. Renders **7–9 slots on the report** (read from the case, never a constant) and a fixed 8 in the Journal archive. An unidentified slot renders a `?` pulsing on a 2s / 0.5 Hz cycle. The pulse rate is a product decision and must not be accelerated or "smoothed." The strip should read like a partial fingerprint match.

UX-DR11: `LedgerRow` — glyph, type label, time, and a verdict chip, separated by `rule` and never by a card. An `Explained` row may carry a struck-through glyph. A row whose case was deleted carries a `NO CASE` chip rather than disappearing.

UX-DR12: `EvidenceCard` and its one in-session instance, the **capture card** — `ledger` on `rule` at `rounded.DEFAULT`. The capture card is never full-screen; it slides up from the bottom of the current tool and sits over it. Anatomy: a type label, a three-row meta block (`Certainty` · `Channel` · `Possible match`), and two buttons — `Keep` and `Mark as explained`. A progress hairline along the top edge auto-dismisses after six seconds, and **ignoring the card still logs the item as unreviewed**.

UX-DR13: `Chip` — `rule-strong` border, `rounded.DEFAULT`, label in `meta`. The system's state marker: `READY`, `INFERRED`, `UNCHARTED`, `INTERFERENCE`, `REVISED`. A chip carrying a live payload takes an `olive` border rather than the default. Never a coloured fill, never an icon.

UX-DR14: `HoldButton` — 50px, `bone` border at `rounded.DEFAULT`, label in `label` uppercase tracked. On press a `safelight` fill advances along it: 800 ms for `HOLD TO ENTER THE FIELD`, 600 ms for `SEAL & FILE`. The label swaps to `Crossing over…` at the 400 ms mark on the Brief hold. **The fill is the only progress indicator in the product and it indicates a gesture, never a quantity.** Early release cancels cleanly with a soft warning and leaves the Brief intact.

UX-DR15: `Sheet` — `ledger`, `sheet` radius on top corners, grabber bar in `rule-strong`, entering on `ntUp` over a scrim that fades on `ntFade`. Sheets never stack two deep, except Triage over a session.

UX-DR16: `TabBar` — four tabs on `night` with a top hairline. Active label in `bone` with a `bone` underline; inactive in `ash`. **Exactly one badge exists in the product:** a single `safelight` dot on Field Journal when a case is unsealed.

UX-DR17: `FieldView` — the session's default surface: concentric rings breathing on `ntBreathe` (5s) around a centre dot, with a state word in `label` at 0.42em tracking beneath. Under Reduce Motion the animation is `none` and the rings sit static.

UX-DR18: `GrainOverlay` — a full-screen `feTurbulence` fractal-noise tile (180×180, `baseFrequency .85`, two octaves), tinted to a warm grey, composited at `opacity .55` with `pointer-events: none`, above all content. **It is a token, not a decoration** — raising it is a defect. It never animates. It is the only global texture in the product.

**Information architecture and navigation**

UX-DR19: Implement the four-tab IA — `HOME` · `INVESTIGATE` · `FIELD JOURNAL` · `PROFILE` — and only four. No Equipment tab (tools live inside a live Session) and no Settings tab (settings live inside Profile). A test asserts the tab route list is exactly the four.

UX-DR20: Implement the full screen tree — onboarding (4 screens), the four tabs, the Hunt pair (`HUNT BRIEF` with tab bar hidden, `SESSION SHELL` immersive), seven tools pushed above the session, the Case trio (`CASE REPORT`, `SHARE CARD`, `EVIDENCE DETAIL`), the fourteen sheets, and `FIELD NOTE` as a standalone mode.

UX-DR21: Implement the presentation rules — tabs persistent but hidden entirely during Brief and Session; Hunt pushed with the tab bar hidden and swipe-back raising the **Leave the field** sheet rather than silently discarding; tools pushing **above** the session with exactly one full-screen surface at a time and the camera preview unmounting on pop; the Case Report as a **destination, not a modal**; sheets never stacked two deep except Triage over a session.

UX-DR22: Implement the five navigation invariants, each a bug if violated: (1) a live session is never more than one gesture from its tools; (2) no path ends a session without offering `SEAL & FILE`; (3) the report is always reachable from the Journal and at the end of a session; (4) no dead ends — every empty state carries exactly one action; (5) intensity is locked during a case.

**Voice, tone and copy**

UX-DR23: Implement the voice rules for every visible string: never assert (`The record shows movement.` not `Something is moving.`); never wink (no humour, asides, exclamation marks, emoji); never explain the mechanic; hedge as craft (`possible`, `unconfirmed`, `unsigned`, `no match on file`); nine words maximum on any single line; silence is narrated, not empty; the word "ghost" appears only as a Hunt name, and inside a record the vocabulary is `signal`, `contact`, `movement`, `the record`.

UX-DR24: Enforce the banned-term list and the approved-term list across all shipped strings, and enforce the **one exact string** — `An investigation experience. Not a measurement.` — as a lint-checked constant. The corpus contains an earlier wrong variant (`Nothing here is a measurement.`) which must never ship.

UX-DR25: Enforce the rule that **no information is conveyed by colour alone** — every status is a word, and colour reinforces it. This is a review item because the token-sync test cannot check it.

**Tool surfaces**

UX-DR26: `EMF` (`SWEEP`) — a rolling trace with no axis over a `ROOM` baseline, a three-state chip (`STILL`/`DRIFT`/`STIR`), and a radial dial of concentric arcs that is never a needle. `LOG THIS SPOT` on `STILL` produces a dry log. No magnetometer → the trace runs on motion and clock at identical cadence with a permanent `INFERRED` chip. Shaking the device dims the trace to `HOLD STEADY`.

UX-DR27: `Radar` (`SWEEP` / `ORIENT`) — a rose with hairline rings and eight compass letters, no distance numbers. **Contacts are confidence cones whose angular width is their uncertainty** — never dots, never locks. Contact count is a word: `CLEAR` / `ONE` / `SEVERAL`. Tap a cone for its detail strip; hold the rose for `LOG BEARING`. No heading sensor → north-free rose, `RELATIVE` chip, bearings become `LEFT`/`AHEAD`/`RIGHT`. **Zero contacts for a whole session is a designed outcome** — the rose still animates, the chip still reads `CLEAR`, and the report records `No bearing ever resolved.`

UX-DR28: `Voice` (`ASK` / `LOG THIS`) — a hold-to-talk button with a live input ring. On release the surface acknowledges the user's own act and nothing else — a bare input-level collapse. It must not stamp `SENT` or any word implying a message left the device. Then **the app says nothing for at least twelve seconds**; a response may arrive up to ninety seconds later **and may arrive on a different tool than the one that asked**. Non-response is the majority case and is designed as the normal state. Microphone denied → archive mode, the button becomes `SCAN`, `ARCHIVE` chip, no coupling between speaking and answering. The permanent disclaimer line reads `Bands are theatre. Nothing here is received.`

UX-DR29: `EVP` (`RECORD` / `MARK`) — a mirrored waveform with a marker lane beneath. `MARK` drops a pin with an inline label; a system-injected possible-anomaly pin renders unlabeled and undescribed and, if kept, reads `EVP · UNMARKED SEGMENT` — attribution to the user, never to the app. **Microphone denied → the tool is not offered in the carousel at all**, and the Brief reads `EVP · unavailable`. An interruption finalises the file and drops a `SESSION PAUSED` marker so the gap is explained.

UX-DR30: `Camera` (`FRAME`) — a restrained overlay of rule-of-thirds grid, corner brackets, a mono time strip, and an unlabeled three-bar meter. No night-vision green, scan lines, or heavy noise by default; those arrive only through **the glitch channel**, enabled only at the two highest intensities and disabled entirely under Reduce Motion (routed to audio). `CAPTURE` fires a subdued flash and no shutter sound. **Pinch-to-zoom is deliberately not implemented.** Camera denied → a dark-room renderer with the same timing, the same encounter, and the same evidence output.

UX-DR31: `Tracker` (`FOLLOW`) — a compass rose, a bearing chevron, and a five-step proximity ladder with band words (`COLD`/`WARM`/`CLOSE`/`NEAR`/`HERE`). **The surface itself must carry the disclosure that proximity is inferred from the user's own movement, not measured** — long-pressing the ladder is its natural home, and it must not be buried in settings. Location denied → uncharted mode: no path, `UNCHARTED` chip, all distances hidden.

UX-DR32: `Sky` (`ALIGN`) — a procedurally generated star field permanently labelled `GENERATED`, a reticle, an eight-segment alignment meter, and `ALIGN DEVICE`. Alignment fills as the device approaches and **decays at half rate when panning away**, so the user feels the search. On lock, the signal holds briefly then may drift or die. **The `GENERATED` label travels with any capture into every surface it later appears on** — the ledger, the souvenir reel, the report, the Share Card.

**Evidence, encounters and triage**

UX-DR33: Evidence card certainty is always a band — `AMBIGUOUS` · `SUGGESTIVE` · `COMPELLING` — never a number. The **dry log** commits an honest empty record reading `NOTHING LOGGED` with the line `You marked a spot with no reading. That is also a record.` and counts toward the report's negative space.

UX-DR34: Encounters are **never a full-screen pop-up**. An encounter arrives through a sensory channel — a sprite in the Camera, a sting plus found text, a haptic pattern, or a single brief glitch frame (once per session, never twice). Afterwards a short aftermath line sits alone on **the rail**, the session's single-line narration strip, which carries one sentence at a time and nothing else. **The artifact rule:** every encounter produces at least one artifact, and a captured frame must read as a glimpse, not footage — low opacity, off-centre, never in focus, never a legible subject.

UX-DR35: Triage — one evidence item per card, a progress hairline whose segment count is derived from the case's actual evidence array, and three full-width verdicts (`Unexplained` · `Inconclusive` · `Explained`). Choosing `Explained` opens the reason picker (`A car` · `The building` · `My own movement` · `Equipment` · `Something else`). **A reason is rendered as the user's verdict, never as a finding.** **Triage progress is a position, never a fraction** — it never renders `3 of 7`. The Triage sheet's own header may re-render its strip live; the report's strip never moves.

UX-DR36: The Case Report is a **document, not a dashboard** — one column, generous margins, everything sharing one rhythm, in the order masthead → status seal → stat row → signature strip → narrative account → souvenir reel → evidence ledger → `NOT RECORDED` panel → investigator note → conditions footer. Everything is scrollable, and **long-pressing any block offers `Share this block`** — the only screen in the product where this is true on every element. **Under sixty seconds → no report at all**, and the case is discarded with a one-line notice.

UX-DR37: `ShareCard` composer — a variant selector (`Story 9:16` / `Feed 4:5`) cross-fading the card on switch; composition of case reference, artifact block, status word with its seal, three-cell stat row, field note, and footer with the exact entertainment line. **The field note is drawn from authored options or written by the user — the app never generates it.** Tapping it opens four seeded choices plus `Write your own`, capped at sixty characters. **Hard exclusions, no exceptions:** no watermark, no URL, no QR code, no app-store badge, no "made with" line, no attribution of any kind.

**State patterns**

UX-DR38: Absence patterns — unencountered phenomena are **absent, not locked**: no locked rows, greyed-out entries, silhouettes, keyholes, padlocks, "unlock" copy, stated requirements, progress ladders, or tier badges anywhere in the product. Empty states carry exactly one action, per the five-row table (Home, Journal Overview/Phenomena/Evidence/Cases). **Absence in the report is scoped** — the `NOT RECORDED` panel lists only what was meaningful to have caught, and when no line qualifies the panel is not rendered at all.

UX-DR39: Implement the four named no-event outcomes as distinct report treatments with their own rail lines, never collapsed into one generic state, with the night-attributed / user-attributed distinction surviving into the copy.

UX-DR40: Implement the six failure-state stamps with their in-session behaviour and their report lines, per the table. Each is first-class terminal evidence that still produces a complete report. **`MISDIRECTED` has no in-session tell, and that is the design** — the user discovers it only in the report, and no warning may be added.

UX-DR41: Implement the nothing-case — zero evidence, zero encounters. The report renders **in full, not as an empty state**: `INCONCLUSIVE`, an empty signature strip, a prominent `NOT RECORDED` panel, and the line above the stat row reading `Nothing was recorded tonight. That is a result.` **It must be one of the best-looking screens in the app.** The nothing-case Share Card renders the empty frame with `Nothing recorded` centred and the note `Some nights are for listening.`

UX-DR42: Implement the three deliberate triage asymmetries and build in no mechanism that "fixes" them — the status asymmetry; contested evidence being invisible until triaged with no congratulation afterwards; and skipped items staying `Unreviewed` and weighing toward `INCONCLUSIVE`.

UX-DR43: Journal behaviour — deleting a case does not erase its evidence, which unlinks and keeps rendering with a `NO CASE` chip. The `?` signature tile is never labelled, captioned, pointed at, or the target of a coach mark; tapping it may open one line reading `A signature you have recorded but not identified. It will match, or it will not.` **Loading uses skeleton rows, never a spinner.**

UX-DR44: Permission-denied modes — every denial produces a working, first-class alternative, never a broken screen, per the four-row table (microphone, camera, location, magnetometer). **A microphone-only hunt is a fully supported, first-class configuration.**

UX-DR45: Intensity locked — opening the sheet mid-session renders every row locked and replaces the footer line with `Changing this mid-investigation would mean steering what you find. A case is only worth something if you didn't.` The friction is deliberate.

**Interaction primitives**

UX-DR46: Implement the two semantic holds (`HOLD TO ENTER THE FIELD` 800ms, `SEAL & FILE` 600ms) and extend hold-gating to the two ways out of a live session (`Seal the case now` / `Leave without a report`) and the low-battery offer. **Ending early is deliberate, not a back gesture.** A haptic is never the only signal for anything.

UX-DR47: **Backgrounding is a hard stop** — on background, all channels off, camera inactive, engine paused, elapsed time frozen. On foreground, a two-second re-calibration grace period with no events. An incoming call is treated as backgrounded. An encounter that fires while backgrounded is suppressed entirely and does not count against the encounter allowance.

UX-DR48: **Silence is a first-class interaction.** After a Voice question the app says nothing for at least twelve seconds — no loading indicator, no "listening…" spinner, no countdown. **No pull-to-refresh anywhere.**

UX-DR49: Haptics escalate with proximity — light for a weak signal, escalating pulses as it closes, a distinctive pattern for a rare event, a strong short impact for an encounter. **Continuous vibration is forbidden.** Every haptic must be safe to drop, because iOS silently suppresses them while the camera is active, during dictation, in Low Power Mode, and when the user has disabled them.

UX-DR50: Sound has twelve categories and silence is used intentionally. There is no constant horror music, and **the world gets duller and quieter before an encounter, not louder.** `silence` is one of the six ambience beds and is the Shadow Person hunt's default bed — an empty slot there is a broken hunt.

UX-DR51: Directives are **scheduled, never on demand** — at most six per session, spaced at least three minutes apart. A surface may show the last directive and let the user re-read it, but there is **no "give me another" control**. A directive is an imperative naming no phenomenon, no outcome, and no direction.

**Accessibility floor**

UX-DR52: Screen reader — the Case Report and Field Journal fully navigable with VoiceOver and TalkBack; live regions announce evidence capture and phase change only; hidden values are never announced.

UX-DR53: Dynamic Type to 200% with the intensity rail and the tool row capped at 140%. At the largest sizes the body clamps and scrolls and primary buttons never leave the screen. **The tool row's form factor past the cap is unresolved (OQ-15) and is a problem to solve, not to cap away** — a two-row labelled grid is the direction worth validating, and the reference prototype does not implement it.

UX-DR54: Reduce Motion → cross-fades replace transitions, sweeping animations become static, glitch is disabled and re-routed to audio, and animated dots move statically.

UX-DR55: Orientation portrait-locked except Camera and Sky. No interactive target below 44pt. `ash` is the floor for anything a user must read and its inherited 5.6:1 claim must be measured rather than assumed. `dim` is for non-actionable captions only. **The entertainment line is a safety notice, not decoration** — legible at the smallest supported configuration, never truncated, never reworded.

UX-DR56: Implement the four key flows as end-to-end acceptance scenarios: the terminated-early report (Priya/Shadow Person), the thin night that still produces a document (Tomás/Ghost), the interrupted Field Note (Ade), and the nothing-case.

UX-DR57: Implement the anti-pattern exclusions — no cheesy Halloween styling, cartoon ghosts, cobwebs, dripping fonts, neon overload, cyberpunk glow, dense sci-fi HUDs, wireframe globes, tiny unreadable labels, fake EMF dials with red LED readouts, pulsing radar sweeps, skeuomorphic paper with torn edges or coffee stains, wax seals, trophy walls, progress bars toward anything, streak counters, leaderboards, or any comparison between users.

UX-DR58: Implement the two build-failing design rules — the entertainment line is exact and lint-checked, and **no percentage sign may appear anywhere in the rendered product**, including accessibility labels and any debug string that ships. Where the system needs to show progress it shows position: four hairlines in onboarding, five phase segments in a session, and in triage a segment per evidence item.

### FR Coverage Map

FR-1: Epic 2 — A session you cannot predict: seeded, replayable Session generation
FR-2: Epic 2 — Emission scheduling that cannot be learned from prior Sessions
FR-3: Epic 5 — The guaranteed first Encounter for a user with zero sealed Cases
FR-4: Epic 2 — Internal tension that drives pacing and is never displayed
FR-5: Epic 2 — Sensor channels as generation material, with graceful degradation
FR-6: Epic 5 — The four Archetype behaviours
FR-7: Epic 5 — A new Phenomenon ships with no engine change
FR-8: Epic 5 — Hunt definitions bind a Phenomenon to environment, tools, pacing, objectives
FR-9: Epic 2 — The Brief: calibrate, name the place, set intention, hold to enter
FR-10: Epic 2 — Intensity chosen before a Session and locked once it begins
FR-11: Epic 4 — EMF: sweep for a field reading, log a spot
FR-12: Epic 4 — Radar: sweep for targets, observe bearing and range band
FR-13: Epic 4 — Voice: hold to ask, rarely receive a word fragment
FR-14: Epic 4 — EVP: record, mark moments, keep or discard segments
FR-15: Epic 4 — Camera: frame the environment, catch an Encounter, capture a frame
FR-16: Epic 4 — Tracker: walk a bearing, log trail marks
FR-17: Epic 4 — Sky: scan, pan, capture an object
FR-18: Epic 3 — Evidence committed at the moment of capture
FR-19: Epic 3 — Signature accumulated and shown against the Signature Archive
FR-20: Epic 3 — Triage: mark each item explained or unexplained
FR-21: Epic 3 — Case status derived from evidence, verdicts and Encounter
FR-22: Epic 3 — The complete Case Report, sealed and filed
FR-23: Epic 3 — A sealed Case Report can never misrepresent what happened
FR-24: Epic 3 — The Share Card
FR-25: Epic 6 — The Field Journal, organized by night
FR-26: Epic 6 — The Journal can never be made public or social
FR-27: Epic 6 — Export the Journal, delete it entirely
FR-28: Epic 6 — Clearance ranks
FR-29: Epic 6 — Streaks and case stamps without penalty
FR-30: Epic 2 — Home: start a Hunt, resume an interrupted Session, read the night's Anomaly
FR-31: Epic 2 — The Field Note: a standing observation that produces no Case
FR-32: Epic 1 — Onboarding and the entertainment notice
FR-33: Epic 1 — No sentence asserts anything about the real world; the build enforces it
FR-34: Epic 3 — Contested Evidence planted during a Session, disproved at Triage
FR-35: Epic 3 — The four named no-event outcomes
FR-36: Epic 3 — Negative space: the report states what was not recorded
FR-37: Epic 5 — Shadow Person runs noticing in reverse
FR-38: Epic 5 — The Bigfoot Encounter requires the Camera surface live
FR-39: Epic 5 — The Mimic answers in words; the Alien never does

## Epic List

### Epic 1: Nothing here is proof
The user can install NightTrace, understand its frame on four onboarding screens, acknowledge the
entertainment notice, and find that notice again any time from Profile. Every screen they will ever
reach already speaks the product's visual language, and the build itself refuses to ship a sentence
that asserts anything about the real world.

**Why this is first and standalone.** FR-33 is a build-failing lint over a declared string-surface
set, and FR-32 is the acknowledgement gate. Both must exist before Epic 2 authors its first string —
otherwise five epics ship copy that no gate has ever checked, and retrofitting the lint means auditing
every string already written. This epic also lands the design system (tokens, type ramp, spacing,
motion, radius, the no-shadow rule, the ten core components) so that later epics compose rather than
improvise.

**Delivers:** the scaffold, the design system, the claims lint + token-sync test + CI gates,
onboarding, the About notice and its safety content, and the four-tab shell.

**FRs covered:** FR-32, FR-33

### Epic 2: Enter the field
The user can pick a Hunt, complete the Brief — calibrate the device, name the place, set an
intention, choose an intensity — and hold to enter the field. A Session then runs: a deterministic,
seeded simulation that schedules emissions nobody can learn from, reads the device's sensors as
generation material, and degrades gracefully when a sensor is denied or absent. The user can leave
deliberately, and if the app was interrupted they can resume or find the case it sealed. They can
also run a three-minute Field Note that produces a Journal entry and no Case.

**Delivers:** the engine core (seed, PRNG forks, tick loop, tension, archetype runtime, directive
scheduler), the sensor layer with its six-channel status model, the Brief, intensity, the immersive
Session shell, Home, and Field Note mode.

**FRs covered:** FR-1, FR-2, FR-4, FR-5, FR-9, FR-10, FR-30, FR-31

### Epic 3: The case the night wrote
The user can capture Evidence during a Session, have it committed at the moment of capture, and
afterwards triage every item themselves — marking it explained or unexplained and recording a reason
when it was explained. The session accumulates into a Signature stripped against the user's
Signature Archive. The Case resolves to a status derived from the user's own verdicts and whether an
Encounter occurred, and produces a complete Case Report: masthead, status seal, stat row, signature
strip, narrative account, souvenir reel, evidence ledger, negative-space panel, investigator note,
conditions footer. The user seals and files it with a sustained hold, and can render a Share Card
from it.

**Why this comes before the tools.** Override 14 ratified report-first: the growth loop is tools
generate → report packages → share recruits. The report is the product's reason to exist and it is
almost entirely copy, so building it early is what makes week 3's demo possible and what forces the
evidence model to be right before seven tools depend on it. A Session with zero Evidence and zero
Encounters still renders a complete report — the nothing-case is a first-class outcome, and it is
built here.

**FRs covered:** FR-18, FR-19, FR-20, FR-21, FR-22, FR-23, FR-24, FR-34, FR-35, FR-36

### Epic 4: Seven instruments, none of which lie
The user can reach all seven tool surfaces from a live Session in one gesture and use each one:
`SWEEP` the space for a field reading, `ORIENT` to a bearing and range band, `ASK` a question and
almost never receive a word, `RECORD` audio and mark moments, `FRAME` the environment and catch an
Encounter on camera, `FOLLOW` a trail, `ALIGN` to the sky. Every surface shows bands, words and
geometry — never a number, a unit, an axis or a degree. Every empty state carries exactly one action,
and every permission denial produces a working first-class alternative rather than a broken screen.

**FRs covered:** FR-11, FR-12, FR-13, FR-14, FR-15, FR-16, FR-17

### Epic 5: Four phenomena, deep
The user can play four Hunts that are genuinely different: a Ghost that is slow, responsive and
audio-led; a Bigfoot that is fast, sudden and visual-led, and whose Encounter can only be rendered
with the Camera live; a Shadow Person that runs noticing in reverse — torch on, camera up and moving
in the dark *raise* the danger, and stillness is the only safe stance, taught only by consequence; and
an Alien that never says a word. Adding a fifth Phenomenon is a content drop, not an engine change.

**Note on file overlap with Epic 2.** Both epics touch `src/engine/**` and `src/data/**`. Epic 2
builds the archetype runtime and one Hunt end to end so the loop is provably real; this epic
completes the remaining three archetypes, the remaining three Hunts, and the content that makes them
distinct. That is a deliberate boundary rather than churn — Epic 2's stories are structural and
Epic 5's are content and per-archetype behaviour.

**FRs covered:** FR-3, FR-6, FR-7, FR-8, FR-37, FR-38, FR-39

### Epic 6: A journal that is yours alone
The user can browse their Cases, Phenomena, Evidence and Field Notes grouped by night, at a 04:00
boundary. They can export their data and delete it entirely, and the deletion screen tells them
plainly what deletion cannot reach. Their Clearance advances through named ranks on sealed Cases,
documented Phenomena and matched Signatures — never on elapsed time, never on events that fired —
and gates only cosmetic case-file themes. Streaks display and never penalize. Nothing in the Journal
is public, social, or comparable to anyone else's.

**FRs covered:** FR-25, FR-26, FR-27, FR-28, FR-29

**Dependency shape.** Epic 1 stands alone. Epic 2 stands alone — a full Session runs with no tools,
no report and no journal. Epic 3 needs Epic 2's session and evidence model. Epic 4 needs Epic 2's
session shell. Epic 5 needs Epic 2's archetype runtime and Epic 3's outcome reporting. Epic 6 needs
Epic 3's sealed Cases, because a Journal with nothing to browse is not a deliverable.

## Epic 1: Nothing here is proof

The user can install NightTrace, understand its frame on four onboarding screens, acknowledge the
entertainment notice, and find that notice again any time from Profile. Every screen they will ever
reach already speaks the product's visual language, and the build itself refuses to ship a sentence
that asserts anything about the real world.

**FRs covered:** FR-32, FR-33
**UX-DRs covered:** UX-DR1–UX-DR25, UX-DR38, UX-DR52–UX-DR58
**Governing invariants:** AD-14, AD-16, AD-17, AD-23, AD-30

---

### Story 1.1: The app installs and runs on a real device, with the guardrails already wired

As a **developer on this project**,
I want a greenfield Expo project that builds to a real device with its type, lint, test and native-config
guardrails already in place,
So that every story after this one inherits enforcement instead of accumulating debt that has to be
retrofitted across five finished epics.

**Acceptance Criteria:**

**Given** a clean checkout with no `node_modules` and no generated native project
**When** the developer runs the documented bootstrap
**Then** dependencies install and the app launches on a physical iOS device and a physical Android device
**And** `node_modules` contains no starter-template residue — this is a from-scratch scaffold, because
`ARCHITECTURE-SPINE.md` specifies no starter template

**Given** the project is bootstrapped
**When** `npx expo prebuild` is run
**Then** `ios/` and `android/` are generated from `app.config.ts` and are gitignored
**And** `app.config.ts` is the only source of native configuration truth — no native config value is
edited by hand in a generated project

**Given** TypeScript is configured
**When** `tsc --noEmit` runs
**Then** `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` and `noImplicitOverride`
are all enabled
**And** the config is committed and CI-blocking, not a local preference

**Given** ESLint is configured
**When** the boundary rules are inspected
**Then** `no-restricted-imports` enforces the four-layer import table from `ARCHITECTURE-SPINE.md`,
with arrows pointing only downward and `src/engine/**` at the bottom
**And** `no-restricted-globals` bans `Date.now()`, `Math.random()` and `performance.now()` inside
`src/engine/**`, per AD-1
**And** an import of `react`, `react-native`, `expo*` or `zustand` from anywhere under `src/engine/**`
fails lint with a message naming AD-1

**Given** Jest is configured
**When** `npm test` runs
**Then** two projects execute: `engine` on the node preset, and `ui` on jest-expo with testing-library
**And** the `engine` project's node preset works — which is only possible because AD-1 holds, so this
test configuration is itself a boundary check

**Given** `expo-dev-client` is installed
**When** build profiles are inspected
**Then** dev, preview and production profiles exist
**And** Expo Go is not a delivery target and EAS is not in the release path, per AD-23

**Given** the app needs to remember small state before any database table exists
**When** settings storage is set up
**Then** it uses `expo-sqlite/kv-store` behind a typed `db/kv.ts` wrapper
**And** this is the same wrapper the full schema later uses — settings never migrate to a table,
because there is no settings table by design
**And** the wrapper is available from this story onward so no later story has to introduce a second
settings mechanism

**Given** a haptic call, an audio play, a SQLite write and a `ViewShot.capture` call are each attempted
inside `src/engine/**` in a scratch branch
**When** lint runs
**Then** every one of them fails

### Story 1.2: The design tokens exist and a test proves they match the design document

As a **designer and developer working against one contract**,
I want the colour, type, spacing, motion and radius tokens to exist in code and to be provably
identical to `DESIGN.md`'s YAML frontmatter,
So that the design document cannot drift from the shipped app and neither side can quietly become
the wrong one.

**Acceptance Criteria:**

**Given** `DESIGN.md`'s YAML frontmatter
**When** `src/ui/theme/tokens.ts` is generated or written
**Then** all fourteen colour tokens exist as typed values: `night`, `night-deep`, `ledger`, `plate`,
`rule`, `rule-soft`, `rule-strong`, `bone`, `prose`, `ash`, `dim`, `safelight`, `safelight-soft`, `olive`
**And** they match the frontmatter's values exactly

**Given** the typography ramp
**When** tokens are inspected
**Then** `display` (46px Newsreader 300), `title` (30), `heading` (22), `account` (18),
`prose-small` (15), `label` (12 IBM Plex Mono 0.14em), `meta` (10.5, 0.16em), `micro` (9.5, 0.18em)
and `stamp` (26 mono 600) all exist with their letter-spacing and weight
**And** Newsreader ships at no weight above 500

**Given** the spacing scale
**When** tokens are inspected
**Then** `1`(4) `2`(6) `3`(8) `4`(12) `5`(16) `6`(22) `7`(28) `8`(40) `9`(56) exist as named tokens

**Given** the motion tokens
**When** tokens are inspected
**Then** `quick` 120ms, `base` 180ms, `enter` 240ms, `screen` 380ms, `seal` 900ms exist
**And** the named animations `ntBreathe` (5s), `ntDot` (3s), `ntPulse` (2s), `ntUp` (240ms),
`ntFade` (240ms) are exported

**Given** the radius scale
**When** tokens are inspected
**Then** `DEFAULT` 2px, `sm` 3px, `md` 4px, `sheet` 14px (top corners only), `full` exist
**And** a lint or review rule states that no control is a capsule and nothing in a document surface
is fully rounded

**Given** the token-sync test exists
**When** a developer changes any token value in `DESIGN.md` without changing `tokens.ts` (or the reverse)
**Then** CI fails, naming the token, the design value and the code value, per AD-17
**And** the test asserts there is no light theme — the app is dark-only

**Given** the shadow rule
**When** any UI code is reviewed
**Then** depth is expressed only as a tone step (`ledger` over `night`, `plate` over `ledger`) plus a
`rule` hairline
**And** no drop shadow, glow, coloured shadow, sheet blur or backdrop-dim exists anywhere
**And** the camera vignette is the single documented exception and is treated as a lens artefact

**Given** the `ash` token
**When** accessibility is verified
**Then** its contrast ratio against its actual background is **measured** and recorded, not inherited
from an assumed 5.6:1
**And** `ash` is documented as the floor for anything a user must read, with `dim` permitted only for
non-actionable captions

### Story 1.3: The document components render the product's typographic language

As a **user reading a case file**,
I want the ruled, unboxed surfaces and the ink-stamped seal,
So that the app reads as a field document rather than a dashboard.

**Acceptance Criteria:**

**Given** the `Rule` component
**When** rendered
**Then** it draws a 1px `colors.rule` hairline as the primary structural device
**And** a `rule-soft` variant exists for container edges that should barely register
**And** the page is ruled, not boxed — no component in this story draws a full card border

**Given** the `Seal` component
**When** rendered with each of the three statuses
**Then** it draws a `colors.bone` ring passed through the `ntInk` turbulence-and-displacement filter,
rotated `-4deg`, carrying `NIGHTTRACE · FIELD` on the ring and the status word in `typography.stamp`
**And** only `UNEXPLAINED` takes a colour (`safelight-soft`)
**And** `INCONCLUSIVE` and `EXPLAINED` both read in `bone`, differing only in the status word —
`EXPLAINED` earns no celebratory styling
**And** the ring never renders clean-edged, and never animates except as part of a 600 ms seal hold

**Given** the `StatCell` component
**When** rendered four-up on the Case Report or Journal Overview
**Then** it shows `CASES` · `HOURS` · `EVIDENCE` · `ENCOUNTERS` with the label in `meta`/`ash` above
and the value in `label`/`bone` below
**And** rendered three-up on the Share Card it shows three cells
**And** on Profile it is not rendered at all — Profile's identity block shows only two values,
`CASES SEALED` and `PHENOMENA DOCUMENTED`
**And** no value it can render is a percentage, a unit-bearing number, or a fraction

**Given** the `SignatureStrip` component
**When** rendered on a Case Report
**Then** it renders between 7 and 9 slots **read from the case it was given, never from a constant**
**And** rendered in the Journal archive it renders a fixed 8
**And** an unlit slot is `rule` on nothing; a lit slot carries vertical marks in `safelight-soft`
with an `olive` border
**And** an unidentified slot renders a `?` pulsing at 0.5 Hz on a 2 s cycle
**And** the pulse rate is not accelerated, smoothed or made configurable — it is a product decision

**Given** the `LedgerRow` component
**When** rendered
**Then** it shows glyph, type label, time and a verdict chip separated by `rule`, never by a card
**And** an `Explained` row may carry a struck-through glyph
**And** a row whose case was deleted carries a `NO CASE` chip rather than disappearing

**Given** the `Chip` component
**When** rendered
**Then** it draws a `rule-strong` border at `rounded.DEFAULT` with its label in `meta`
**And** it can carry `READY`, `INFERRED`, `UNCHARTED`, `INTERFERENCE` or `REVISED`
**And** a chip carrying a live payload takes an `olive` border instead
**And** no chip is ever a coloured fill, and no chip carries an icon

### Story 1.4: The interaction components gate gestures and never indicate a quantity

As a **user entering and sealing a session**,
I want the holds, sheets, tabs, field view and grain to behave exactly as the design describes,
So that the two deliberate gestures in the product are unmistakable and nothing in the interface
pretends to measure anything.

**Acceptance Criteria:**

**Given** the `HoldButton` component
**When** rendered at 50px with a `bone` border at `rounded.DEFAULT` and its label in `label` uppercase tracked
**Then** pressing advances a `safelight` fill along it — 800 ms for `HOLD TO ENTER THE FIELD`,
600 ms for `SEAL & FILE`
**And** the label swaps to `Crossing over…` at the 400 ms mark on the Brief hold
**And** releasing early cancels cleanly with a soft warning and leaves the Brief intact
**And** the fill is the only progress indicator anywhere in the product, and it indicates a gesture,
never a quantity

**Given** the `Sheet` component
**When** presented
**Then** it draws `ledger` with the `sheet` radius on its top corners and a `rule-strong` grabber bar
**And** it enters on `ntUp` over a scrim that fades on `ntFade`
**And** sheets never stack two deep, with Triage over a live session as the single documented exception

**Given** the `TabBar` component
**When** rendered
**Then** it shows four tabs on `night` with a top hairline, the active label in `bone` with a `bone`
underline and inactive labels in `ash`
**And** exactly one badge exists in the entire product: a single `safelight` dot on Field Journal
when a case is unsealed
**And** adding a second badge type requires changing this story's own test

**Given** the `FieldView` component
**When** rendered
**Then** concentric rings breathe on `ntBreathe` (5 s) around a centre dot, with a state word in
`label` at 0.42em tracking beneath
**And** under Reduce Motion the animation is `none` and the rings sit static

**Given** the `GrainOverlay` component
**When** rendered
**Then** it draws a full-screen `feTurbulence` fractal-noise tile (180×180, `baseFrequency .85`,
two octaves) tinted to a warm grey, composited at `opacity .55` with `pointer-events: none`, above
all content
**And** it never animates
**And** a test or review rule asserts opacity is `.55` — raising it is a defect, not a preference
**And** it is the only global texture in the product

**Given** the `EvidenceCard` component and its in-session instance, the capture card
**When** the capture card is presented
**Then** it is `ledger` on `rule` at `rounded.DEFAULT`, slides up from the bottom of the current tool
and sits over it — it is never full-screen
**And** its anatomy is a type label, a three-row meta block (`Certainty` · `Channel` · `Possible match`),
and two buttons, `Keep` and `Mark as explained`
**And** a progress hairline along its top edge auto-dismisses it after six seconds
**And** letting it auto-dismiss logs the item as **unreviewed** rather than discarding it

**Given** any component in this epic
**When** its props and rendered output are inspected
**Then** no primitive accepts or renders a percentage, an axis, a degree, a unit, a distance, a
bearing in degrees, or a raw signal-strength value
**And** this absence is structural — adding such a primitive requires deleting a test, not adding a prop

### Story 1.5: The build refuses to ship a sentence that asserts anything about the real world

As a **product owner accountable for what this app claims**,
I want a build-failing check over every string the app can ship,
So that no release can quietly reintroduce proof language, a percentage, or an unsupported claim.

**Acceptance Criteria:**

**Given** a committed list of banned terms covering detection and proof language, confirmation and
verification language, authenticity claims, scientific and science claims, thermal and radiation
language, accuracy claims, algorithm and AI claims, and a factual use of "haunted"
**When** any banned term appears in the declared string-surface set
**Then** the build fails and names the term, the file and the line

**Given** the declared string-surface set
**When** it is inspected
**Then** it is an **enumerated list, not a glob of the app binary**
**And** at minimum it contains: the UI string tables, the iOS `Info.plist` purpose strings (including
`NSMotionUsageDescription` and `NSMicrophoneUsageDescription`), the Android manifest permission
strings, the store description and title, the screenshot captions, and the About notice
**And** the set's contents are themselves asserted by a test, so a new string table cannot be added
without appearing in the set

**Given** any shipped string anywhere, including accessibility labels and any debug string that ships
**When** it contains a `%` character
**Then** the build fails
**And** no rendering primitive is capable of producing a `%`, so this is a second line of defence
rather than the only one

**Given** the entertainment line
**When** it is needed in the About notice, the Case Report conditions footer, or the Share Card footer
**Then** it is read from a single exported constant whose value is exactly
`An investigation experience. Not a measurement.`
**And** the corpus's earlier wrong variant `Nothing here is a measurement.` appears nowhere and a test
asserts its absence
**And** the line is never retyped as a literal

**Given** the approved market-terms list — paranormal, ghost hunt, cryptid, investigator, field
journal, EMF, EVP, spooky, adventure, night
**When** a marketing string is written
**Then** no statistic, social proof, award or count of users appears in it
**And** no fake telemetry or progress-scanning language appears anywhere

**Given** the app name and subtitle
**When** `app.config.ts` and the store metadata are inspected
**Then** the name is `NightTrace` and the subtitle is `Paranormal field journal`
**And** the category is Entertainment and the rating is 12+/Teen, derived from the stated questionnaire
inputs rather than asserted

**Given** the banned-term lint is not able to see a sentence that misdescribes what the app did —
the third prohibition class in `capability-map.md`
**When** this story is considered complete
**Then** the five AD-16 blind spots are recorded as explicit review items in the repo, with the
sentence-level check discharging them on every release per SM-8
**And** this story does not claim to have automated that check

### Story 1.6: A first-time user learns the frame before their first Session

As a **first-time user**,
I want four screens that tell me what this is and what it is not, and a notice I have to acknowledge,
So that I know what I am holding before it asks anything of me.

**Acceptance Criteria:**

**Given** a first launch on a clean install
**When** onboarding presents
**Then** it is exactly four screens, in this order: that nothing here is proof, that the case is
local, that the user chooses their night, and that permissions are asked only when needed
**And** the path proceeds through four hairlines as its position indicator — never a percentage,
never a fraction, never "2 of 4"
**And** onboarding requests no permission and triggers no sensor

**Given** the entertainment notice on first launch
**When** it presents
**Then** it is **non-skippable** and must be acknowledged before the app is usable
**And** acknowledging it is recorded in the typed `db/kv.ts` settings wrapper introduced in Story 1.1,
so it is not shown again as a gate
**And** the acknowledgement is a device-local setting rather than a row in a domain table

**Given** the safety content — photosensitivity relating to the glitch channel's visual effects,
sudden audio, and the fact that the app is designed to startle
**When** its placement is inspected
**Then** it lives in the **About notice**, not on the onboarding path
**And** it is legible at the smallest supported configuration, never truncated, never reworded
**And** it is treated as a safety notice rather than decoration

**Given** the onboarding copy
**When** it is written
**Then** it obeys the voice rules: never asserts, never winks, never explains the mechanic, hedges as
craft, nine words maximum on any single line
**And** `ghost` appears only as a Hunt name

**Given** a user who backgrounds the app mid-onboarding
**When** they return
**Then** onboarding resumes at the screen they left rather than restarting

### Story 1.7: The notice stays reachable and travels with the user's data

As a **user who wants to re-read what this app claims**,
I want the About notice reachable from Profile at any time and included in any export,
So that the frame is not something I had to catch once and remember.

**Acceptance Criteria:**

**Given** a user on Profile
**When** they open About
**Then** the full entertainment notice is rendered, including the safety content from Story 1.6
**And** the path to it is a normal Profile destination, not buried behind a developer gesture

**Given** the entertainment notice is reachable from Profile
**When** a data export is later produced by Epic 6
**Then** the notice is included in the exported file, per FR-27
**And** this requirement is recorded here so the Epic 6 export story has a named obligation

**Given** the About notice content
**When** it is committed
**Then** it is part of the declared lint string-surface set from Story 1.5 and is checked like any
other string
**And** the entertainment line inside it is the exported constant, not a literal

**Given** the app is released with zero permissions granted
**When** the user reaches About
**Then** every screen on the path renders fully and no permission prompt is triggered

### Story 1.8: The four-tab shell exists and holds exactly four tabs

As a **user**, I want a stable four-tab structure I can learn once,
So that every destination in the app has a predictable home and the tools' later arrival does not
reshape the app around them.

**Acceptance Criteria:**

**Given** the route tree
**When** the tab routes are listed
**Then** a test asserts the list is exactly `HOME` · `INVESTIGATE` · `FIELD JOURNAL` · `PROFILE`
**And** there is no Equipment tab — tools live inside a live Session
**And** there is no Settings tab — settings live inside Profile

**Given** the route tree is the information architecture per AD-29
**When** the remaining screen tree is declared
**Then** placeholders exist for: onboarding (4 screens), the four tabs, the Hunt pair
(`HUNT BRIEF` with tab bar hidden, `SESSION SHELL` immersive), seven tool routes pushed above the
session, the Case trio (`CASE REPORT`, `SHARE CARD`, `EVIDENCE DETAIL`), the fourteen sheets, and
`FIELD NOTE` as a standalone mode
**And** this story declares the routes and their presentation rules; it does not build the screens

**Given** the presentation rules
**When** they are encoded
**Then** the tab bar is persistent but hidden entirely during Brief and Session
**And** Hunt pushes with the tab bar hidden, and swipe-back raises the **Leave the field** sheet
rather than silently discarding
**And** tools push **above** the session with exactly one full-screen surface at a time
**And** the Case Report is a destination, not a modal

**Given** the five navigation invariants
**When** they are recorded as testable conditions
**Then** they are: a live session is never more than one gesture from its tools; no path ends a
session without offering `SEAL & FILE`; the report is always reachable from the Journal and at the
end of a session; no dead ends — every empty state carries exactly one action; intensity is locked
during a case
**And** each is written so a later epic's test can assert it directly

**Given** the anti-pattern exclusions
**When** any epic adds a screen
**Then** no cheesy Halloween styling, cartoon ghosts, cobwebs, dripping fonts, neon overload,
cyberpunk glow, dense sci-fi HUDs, wireframe globes, fake EMF dials with red LED readouts, pulsing
radar sweeps, skeuomorphic paper with torn edges or coffee stains, wax seals, trophy walls, progress
bars toward anything, streak counters, leaderboards, or comparison between users may appear
**And** this list is recorded as a review checklist rather than a lint

**Given** the app has no backend, no account and no sign-in per AD-21
**When** the shell is complete
**Then** the app installs and runs end to end in airplane mode from a clean install
**And** no network call of any kind exists in the codebase

---

**Epic 1 complete:** 8 stories. FR-32 and FR-33 covered. UX-DR1–UX-DR25, UX-DR38 and
UX-DR52–UX-DR58 covered. The four-tab IA, the design system, the claims lint, the token-sync test
and the CI gates are all in place before any later epic authors a string or draws a surface.

---

## Epic 2: Enter the field

The user can pick a Hunt, complete the Brief — calibrate the device, name the place, set an
intention, choose an intensity — and hold to enter the field. A Session then runs: a deterministic,
seeded simulation that schedules emissions nobody can learn from, reads the device's sensors as
generation material, and degrades gracefully when a sensor is denied or absent. The user can leave
deliberately, and if the app was interrupted they can resume or find the case it sealed. They can
also run a three-minute Field Note that produces a Journal entry and no Case.

**FRs covered:** FR-1, FR-2, FR-4, FR-5, FR-9, FR-10, FR-30, FR-31
**UX-DRs covered:** UX-DR26–UX-DR32 (the surfaces' degradation modes), UX-DR44–UX-DR51, UX-DR56
**Governing invariants:** AD-1, AD-2, AD-3, AD-4, AD-5, AD-6, AD-10, AD-11, AD-13, AD-14, AD-19,
AD-24, AD-25, AD-26, AD-28, AD-29

---

### Story 2.1: The same seed always produces the same session

As a **developer and as the product owner who has to stand behind a case file**,
I want a Session to be fully determined by a seed that is composed and stored verbatim before it begins,
So that any case can be reconstructed exactly, and so that no later feature can quietly introduce
non-determinism that makes replay a lie.

**Acceptance Criteria:**

**Given** a user is about to begin a Session
**When** the Seed is composed
**Then** `SeedParts` contains the Hunt, the location if one is available, the start time, the
environmental conditions, and a one-shot device sensor fingerprint
**And** it is **persisted verbatim before the Session begins** and is **never recomputed**

**Given** a Session recorded without location
**When** the Seed is composed
**Then** it is generated from time and fingerprint alone, and the Session is marked as having no
place component
**And** the Session still starts and completes normally

**Given** the `RandomEngine`
**When** its API is inspected
**Then** randomness is drawn only from labelled substreams via `fork(label)` over the closed
seven-label set: `rng.session`, `rng.events`, `rng.radar`, `rng.words`, `rng.encounters`,
`rng.report`, `rng.signals`
**And** content-driven behaviour draws from `fork('rng.content.' + definitionId)`
**And** the label set is closed — adding an eighth label is a deliberate change with its own test update

**Given** the PRNG implementation
**When** dependencies are inspected
**Then** it is our own xmur3 → sfc32 implementation with no third-party dependency
**And** a test asserts the same input produces the same output across runs and across platforms

**Given** `src/engine/**`
**When** it is inspected or linted
**Then** it is a pure TypeScript function of `(seed, tick input) → Emission[]`
**And** it does not import `react`, `react-native`, `expo*` or `zustand`
**And** it does not call `Date.now()`, `Math.random()` or `performance.now()`
**And** it performs no filesystem, network, database, audio or haptics access

**Given** a live Session
**When** clock reading is inspected
**Then** `services/Clock` is the single producer of `SessionMs` inside a live session
**And** the engine receives elapsed time as an input and reads no wall clock of its own

**Given** a Session is recorded with its Seed, Hunt, content version and recorded tick digest
**When** the simulation is replayed
**Then** it produces an identical emission sequence
**And** replay is an audit property with no user-facing feature, no UI and no promise displayed anywhere

**Given** a `ContentVersion` bump
**When** replay parity is considered
**Then** a content version increment is the only event that invalidates replay parity, and it does so
knowingly
**And** fork labels are never renamed once a content version ships

### Story 2.2: Emissions can be replayed but cannot be learned

As a **user on a second or tenth night**,
I want the app to be genuinely unpredictable from my side of the glass,
So that the night feels like a place rather than a machine I have started to read.

**Acceptance Criteria:**

**Given** any event table in the shipped content
**When** its weights are inspected
**Then** `emptyWeight` is strictly greater than zero in every one of them
**And** silence is always a valid draw — a test asserts this across every table

**Given** a seeded sweep of twenty-minute Sessions
**When** the inter-emission intervals are measured
**Then** the median-to-90th-percentile interval ratio holds at **≥ 3.0**

**Given** the interval draw
**When** its implementation is inspected
**Then** it is **memoryless** — a long quiet stretch never raises the chance of an event
**And** a test asserts that the hazard rate does not increase with time since the last emission

**Given** cooldown and anti-repeat behaviour
**When** rapid, repetitive or impossible sequences would occur
**Then** they are suppressed by rules held **in the engine, not in content**
**And** a content change alone cannot cause an unlearnable pattern to become learnable

**Given** the directive scheduler
**When** a directive is emitted
**Then** it is a verb with no object and never names a specific event
**And** at most six directives fire per session, spaced at least three minutes apart
**And** a directive names no phenomenon, no outcome and no direction

**Given** the silence distribution
**When** it is measured over the seeded sweep
**Then** the longest silence falls in the 200–260 s band at the median
**And** at least one silence exceeding five minutes occurs in 22–35% of sessions

**Given** a directive pool is authored
**When** the content-validation test runs
**Then** it greps the pool for creature nouns, evidence nouns and banned thermal ideas
**And** a directive that names a target, a direction or a thermal concept fails the test

**Given** the golden-seed replay test
**When** CI runs
**Then** a committed fixture of seed + hunt + content version + expected emission sequence replays
identically
**And** the test is CI-blocking

### Story 2.3: The session advances through a phase ladder while a hidden tension value drives pacing

As a **user inside a session**,
I want the night to have a shape I can feel without being shown a number,
So that time passing means something without the app ever measuring anything at me.

**Acceptance Criteria:**

**Given** the phase ladder
**When** it is defined
**Then** it is closed at five phases: `QUIET` → `SIGNALS` → `ACTIVITY` → `ENCOUNTER_WINDOW` → `RESOLUTION`
**And** a terminal `ENDED` marker exists which is **not** a phase
**And** the user-visible state is a **separate four-word ladder**: `QUIET` → `LISTENING` → `ACTIVE` → `CONTACT`
**And** the two ladders are not conflated anywhere in code or copy

**Given** the tension value
**When** it is computed
**Then** it rises and falls with elapsed time, user movement, sensor anomalies and emissions
**And** it drives pacing, audio, haptics and Encounter probability
**And** it **influences** Encounter probability but never guarantees an Encounter

**Given** the tension value exists
**When** any surface, screen reader, accessibility label or debug output is inspected
**Then** the value is **never displayed, announced or exposed to assistive technology**
**And** the same holds for Attunement, rarity and Seed, per AD-26
**And** a test asserts these values are not present in any rendered tree

**Given** the tick loop
**When** each tick is processed
**Then** the tick digest is stored **run-length-encoded** rather than one row per tick
**And** the digest plus the Seed is sufficient to reconstruct the session

**Given** the engine's models
**When** they are inspected
**Then** ids are branded; every field is `readonly`; every variant set is a discriminated union
tagged `kind` with an exhaustive `switch` and `default: never`; absence is spelled `null`, never
`undefined`; and there is no `any` and no `as` outside mappers and validator output

**Given** an engine test runs
**When** it constructs a variant set
**Then** the `default: never` branch makes an unhandled kind a compile error rather than a runtime surprise

### Story 2.4: Every sensor channel reports its own state and none of them can block a session

As a **user who has denied a permission or owns a phone without a magnetometer**,
I want the app to keep working and tell me plainly what it is doing instead,
So that a missing sensor changes the app's honesty rather than its usability.

**Acceptance Criteria:**

**Given** the sensor layer at `src/sensors/**`
**When** imports are inspected
**Then** it is the **only** importer of `expo-sensors`, `expo-location` and microphone capture
**And** no other directory imports them

**Given** the magnetometer, accelerometer, gyroscope, motion, ambient light, location, microphone
level and camera state
**When** each channel's status is read
**Then** it reports exactly one of: **ready**, **permission not yet requested**, **permission
denied (with whether it can be asked again)**, **hardware unavailable**, **unsupported platform**,
or **error**
**And** the six-state model is a discriminated union with exhaustive handling

**Given** any single sensor is denied
**When** the user starts a Session
**Then** the Session starts and completes normally
**And** the denial never produces a nag loop, a repeated prompt, or a blocking screen

**Given** the magnetometer is absent
**When** the EMF surface runs
**Then** it reports an inferred state from motion and clock
**And** the trace runs at identical cadence as the real one

**Given** location is denied
**When** the Session runs
**Then** the Hunt proceeds **uncharted**
**And** the Tracker shows bearing only
**And** the Seed omits the place component

**Given** the microphone is denied
**When** the tool carousel is built
**Then** EVP is **removed from the carousel entirely**
**And** Voice enters archive mode
**And** the app makes no claim that anything answered

**Given** sensor sampling is running
**When** the Session screen loses focus or the app leaves the foreground
**Then** sampling stops
**And** on background: all channels off, camera inactive, engine paused, elapsed time frozen
**And** on foreground: a two-second re-calibration grace period during which no events fire
**And** an incoming call is treated as backgrounded

**Given** an encounter would fire while backgrounded
**When** the app returns
**Then** it is **suppressed entirely** and does not count against the session's encounter allowance

**Given** the app is launched with zero permissions granted
**When** the user plays end to end
**Then** the app is fully playable
**And** permissions are requested just in time by the tool that needs them, never at launch
**And** each request explains why in the moment
**And** a permanent denial swaps `Allow` for `Open Settings` and is never re-offered in the same session

**Given** battery is a constraint
**When** sensor sampling is implemented
**Then** sensors are duty-cycled by ladder rather than run continuously
**And** the Session offers a low-power path that keeps the loop intact
**And** low power drops to the lowest rung and disables ambience and the glitch channel

**Given** battery reaches a critical level
**When** the condition is detected
**Then** the app **offers** to seal the Case immediately from the live Session, producing a complete
report from the checkpoint
**And** the offer is the user's to accept — the Case is **never** sealed automatically

### Story 2.5: The database persists what matters and can recompute what does not

As a **user whose phone might die mid-investigation**,
I want nothing I logged to be lost and nothing computable to be cached into wrongness,
So that an interrupted night still produces the case it earned.

**Acceptance Criteria:**

**Given** the two table families
**When** the schema is inspected
**Then** **catalogue tables** are rebuilt from bundled JSON by delete, batch insert, in one exclusive
transaction
**And** **user tables** are never touched by a rebuild
**And** foreign keys point **only within the user family**; `evidence.creature_id` and
`sessions.hunt_id` are `TEXT` ids validated in the repository layer, never by a SQLite FK

**Given** the persistence rule
**When** any value is considered for storage
**Then** if it can be recomputed from `(seed + content version + tick log)` it **must not** be persisted
**And** if the user would be angry to lose it, it must be in SQLite **before the screen closes**
**And** the single precedence is respected: from the moment a Case is sealed, the values constituting
its report are persisted and **never recomputed**

**Given** a Session begins
**When** persistence occurs
**Then** exactly one `sessions` row is created on start
**And** one exclusive transaction runs every **60 seconds** and on **every backgrounding**, updating
elapsed time, appending the RLE tick digest, and inserting not-yet-committed evidence

**Given** `sessions.status`
**When** its values are inspected
**Then** it is one of `{active, sealed, discarded}`
**And** a Session ending under sixty seconds transitions `active → discarded`: no report, no Case,
evidence stays unlinked and renders with a `NO CASE` chip

**Given** `cases` is its own entity
**When** the schema is inspected
**Then** `cases` is its own user table with **at most one frozen Case Report**
**And** deleting a Case never deletes its Evidence
**And** the `cases` and Case Report tables are **not created by this story** — they are created by
the story that first writes them, per the "tables only when needed" rule

**Given** this story's schema scope
**When** the tables it creates are enumerated
**Then** it creates only what a running Session needs: the `sessions` row and its tick digest, the
`evidence` table that the 60-second checkpoint inserts into, and the catalogue tables rebuilt from
bundled JSON
**And** it does **not** create `cases`, the Case Report table, `discoveries`, `badge_awards` or
`user_progress` — those arrive with the stories that write them
**And** the `sessions.status` enum, however, is defined here since it is the sessions table's own column

**Given** SQL exists
**When** the codebase is searched for SQL string literals
**Then** they exist **only** in `src/db/repositories/*`
**And** column lists are explicit and there is no `SELECT *`
**And** repositories return `engine/models` types via `src/db/mappers/*`
**And** routes contain no SQL and no engine calls

**Given** a migration
**When** it is inspected
**Then** a shipped migration is immutable; every migration runs inside a transaction; the schema is
additive-only for a shipped version
**And** `migrate()` is idempotent, asserted by a CI-blocking test

**Given** an interrupted Session
**When** the user returns to the app
**Then** it is recoverable from the `sessions` row and its RLE tick digest
**And** that recovery is the crash-recovery story — no third-party crash reporter, no upload, no identifier

**Given** settings need to persist
**When** their storage is inspected
**Then** they live in `expo-sqlite/kv-store` behind the typed `db/kv.ts` wrapper
**And** there is no settings table

**Given** a recoverable failure occurs in a service
**When** error handling is inspected
**Then** `Result<T, E>` from `util/result.ts` is used for recoverable paths and `invariant()` for
programmer error
**And** no service boundary throws for an expected condition

**Given** the schema is inspected for privacy
**When** columns are audited
**Then** there are exactly two free-text columns in the entire schema
**And** no coordinates appear on any Case Report — location is a coarse bucket plus a human label
**And** logs never contain evidence content, coordinates or free text

**Given** media is stored
**When** a capture is persisted
**Then** the file is written to disk under `Paths.document/cases/<caseRef>/` and the row stores
`relative_path`, `mime`, `bytes`, `duration_ms`, `checksum`
**And** media is **never** a BLOB and paths are **always** relative

### Story 2.6: The Brief prepares the user and the place before anything begins

As a **user about to investigate**,
I want to calibrate, name the place and set an intention deliberately,
So that entering the field is a decision I made rather than a button I pressed.

**Acceptance Criteria:**

**Given** the Brief screen
**When** the user arrives
**Then** it offers calibration, a place name, an intention, a duration and an intensity
**And** calibration, place name and intention are **required** before the Session can start
**And** the Brief reports the calibration outcome as a **quiet or noisy baseline**, presented as
neither being a judgment

**Given** calibration completes with a magnetometer present
**When** the outcome is shown
**Then** it is a word, not a reading
**And** no numeric or unit-bearing baseline value is displayed anywhere

**Given** calibration is interrupted, or no magnetometer is present
**When** the Brief continues
**Then** it completes on an **inferred** baseline and **says so**
**And** the Session proceeds normally

**Given** the intention selection
**When** the user chooses
**Then** the options are `Ask`, `Watch` (the default) and `Wait`
**And** the intention **biases likelihood only** — it never guarantees an outcome
**And** the copy never states or implies that an intention makes something happen

**Given** duration selection
**When** the user chooses
**Then** the options are 10, 20, 30 or 45 minutes, or open-ended
**And** it **defaults to the Hunt's length band**

**Given** the place name field
**When** the user types
**Then** it is one of the schema's two free-text columns and is stored as the user wrote it
**And** it never becomes a coordinate

**Given** the enter gesture
**When** the user presses and holds
**Then** a **sustained hold of roughly 800 ms** is required, with a fill hairline and a label that
changes partway (`Crossing over…` at the 400 ms mark)
**And** early release cancels with a soft warning and **leaves the Brief intact**, preserving everything
the user entered

**Given** the Brief can be abandoned
**When** the user leaves before the hold completes
**Then** **no Session row is created**
**And** the one-shot sensor fingerprint is captured only on a successful entry

**Given** a hold is interrupted by backgrounding
**When** the app returns
**Then** the hold aborts **silently** and resets
**And** the Brief is still intact

**Given** a Session is running
**When** the user wants to leave
**Then** there is **exactly one way out** — `Leave the Field`, requiring a hold
**And** leaving seals the Case like any other ending
**And** no back gesture, swipe or system affordance ends a session silently

### Story 2.7: Intensity is chosen once and then locked, and its promise is literally true

As a **user choosing how much to invite**,
I want to set intensity before a case and be unable to change it afterwards,
So that the night I get is the night I asked for and not one I steered.

**Acceptance Criteria:**

**Given** the intensity selection before a Session
**When** the options are shown
**Then** they are `Ambient`, `Present` (the default), `Intense` and `Ritual`
**And** the screen states plainly that higher intensity means **more signals and never a guaranteed
Encounter**, and that intensity is **fixed during a case**

**Given** `Ambient` is selected
**When** the Session runs
**Then** Encounters are **forbidden outright**, so the level's own promise is literally true
**And** a test asserts no Encounter can resolve at `Ambient`

**Given** `Intense` or `Ritual` is selected
**When** the Session renders
**Then** glitch-channel visuals are enabled
**And** at `Ambient` and `Present` they are absent

**Given** intensity scaling
**When** its implementation is inspected
**Then** it scales **exactly four coefficients** — emission rate, encounter budget (0/1/2/2),
content ceiling and sting gain
**And** it **never** scales the silence floor below its mandated minimum
**And** the encounter budget values are exactly 0, 1, 2, 2 for the four levels in that order

**Given** a Case is live
**When** the user opens the intensity sheet mid-session
**Then** every row renders locked
**And** the sheet explains why
**And** the footer line reads `Changing this mid-investigation would mean steering what you find.
A case is only worth something if you didn't.`

**Given** the app is under Reduce Motion
**When** intensity is `Intense` or `Ritual`
**Then** the glitch channel is disabled and **re-routed to audio** rather than merely hidden

**Given** intensity is locked mid-case
**When** the navigation invariants are tested
**Then** "intensity is locked during a case" is asserted directly

### Story 2.8: The session presenter is the single node that turns emissions into the world

As a **user in the field**,
I want the session to feel like one coherent place — sound, haptics, the rail and the record all
moving together,
So that the app reads as a night happening rather than a set of features firing.

**Acceptance Criteria:**

**Given** the node `useSessionPresenter`
**When** its responsibilities are inspected
**Then** it is the **single** consumer of `Emission` and maps emissions to haptics, audio, store
writes, evidence commits and UI
**And** a capture is committed by the presenter and **nothing else**
**And** a test or lint rule asserts that no code outside the presenter reads an `Emission` — such a
read is a defect

**Given** the rail
**When** it renders
**Then** it is the session's single-line narration strip carrying **one sentence at a time and
nothing else**
**And** a directive may be re-read from it
**And** there is **no "give me another" control** — directives are scheduled, never on demand

**Given** the Session screen
**When** it is presented
**Then** it is immersive with the tab bar hidden
**And** tools push **above** it, full-screen, one at a time
**And** a live session is never more than one gesture from its tools

**Given** `Leave the Field`
**When** the user holds it
**Then** the Session ends and the Case seals
**And** holding is required — ending early is deliberate, not a back gesture

**Given** every hold in this epic
**When** it is inspected
**Then** haptics are never the only signal for anything — the fill hairline and the label carry the
same information

**Given** backgrounding
**When** the app leaves the foreground
**Then** all channels off, camera inactive, engine paused, elapsed time frozen
**And** on return, a two-second re-calibration grace period with no events

**Given** the app's silence behaviour
**When** the user asks a question on Voice
**Then** the app says nothing for **at least twelve seconds** — no loading indicator, no "listening…"
spinner, no countdown
**And** non-response is designed as the normal state
**And** there is **no pull-to-refresh anywhere in the app**

**Given** haptics
**When** proximity changes
**Then** they escalate — light for a weak signal, escalating pulses as it closes, a distinctive
pattern for a rare event, a strong short impact for an encounter
**And** **continuous vibration is forbidden**
**And** every haptic is safe to drop, because iOS silently suppresses them while the camera is
active, during dictation, in Low Power Mode, and when the user has disabled them
**And** a haptic is never the only signal for anything

**Given** the twelve sound categories
**When** audio is implemented
**Then** silence is used intentionally and there is no constant horror music
**And** **the world gets duller and quieter before an encounter, not louder**
**And** `silence` is one of the six ambience beds and is the Shadow Person hunt's default bed —
an empty slot there is a broken hunt

**Given** the session's live region
**When** evidence is captured or the phase changes
**Then** only those two events are announced
**And** hidden internal values are never announced

**Given** the app is backgrounded mid-session
**When** the user returns
**Then** the Case is recoverable from the checkpoint
**And** foregrounding never replays the digest and never continues the simulation

### Story 2.9: Home starts a night, resumes one, and reads the day's anomaly

As a **user opening the app at night**,
I want one screen that tells me what tonight could be and what I left unfinished,
So that starting is a decision with no menu in front of it.

**Acceptance Criteria:**

**Given** Home
**When** it renders
**Then** it presents the user's Investigator Clearance, a featured Hunt, the other Hunts, a resume
affordance when a Session was interrupted, recent Evidence, and the daily Anomaly
**And** it presents **no tool grid and no equipment navigation**

**Given** the Anomaly line
**When** it is drawn
**Then** it is a **single line** of atmospheric text from an authored, seeded set
**And** it is keyed to a seeded per-day draw, per AD-19
**And** it never produces a `SessionDirective` and never carries a guaranteed encounter
**And** the Anomaly is **not shareable in v1**

**Given** the Anomaly's composition
**When** a root line and a qualifier are combined
**Then** the qualifier is restricted to **conditions and time bands, never bearings**
**And** the composed line never names a target, a direction or an outcome

**Given** all Home copy
**When** it is inspected
**Then** it satisfies FR-33 and the claims lint from Story 1.5
**And** it obeys the voice rules — never asserts, never winks, never explains a mechanic

**Given** a Session is `active` because the app was killed
**When** the user foregrounds the app
**Then** Home offers to resume, and the resume path **seals from the last checkpoint** on the user's
confirmation
**And** it **never** replays the digest and **never** continues the simulation

**Given** a user with zero sealed Cases
**When** they open Home
**Then** nothing on Home tells them their first Session is treated differently
**And** no copy, indicator or visual difference on Home can ever mark such a directive
**And** this constraint is recorded here for the later story that introduces it, so that no surface
is later given a first-run tell

**Given** an interrupted Session that the user chooses not to resume
**When** they dismiss the resume affordance
**Then** the session's outcome is handled per the `sessions.status` rules — it discards if it ran
under sixty seconds, and otherwise produces a Case

**Given** the Journal has an unsealed case
**When** Home renders
**Then** the Field Journal tab shows its single `safelight` dot
**And** no other badge exists anywhere

### Story 2.10: A Field Note is a standing observation that produces no case

As a **user with three minutes and nowhere to be**,
I want to stand still and record what the night is doing,
So that attention is rewarded even when there is no investigation to run.

**Acceptance Criteria:**

**Given** Field Note mode
**When** the user enters it
**Then** it is presented as its **own mode with its own framing copy**
**And** it is **not** presented as a Hunt with a shorter timer
**And** it runs for roughly **three minutes** and closes on its own

**Given** a Field Note completes
**When** its output is inspected
**Then** it writes a short Journal entry containing its time, its place band and one line of
observed material
**And** it produces **no** Case Report and **no** Case reference

**Given** a Field Note
**When** its outcomes are inspected
**Then** **no Encounter** can result from it
**And** **no Case** can result from it
**And** **no Clearance advancement** can result from it alone
**And** tests assert all three

**Given** the user moves the device substantially or picks it up mid-note
**When** the motion is detected
**Then** the note **ends early** and records itself as **short**
**And** it does **not** discard what it captured
**And** no wording implies the user did something wrong

**Given** a Field Note is running
**When** the app is backgrounded
**Then** it behaves per the backgrounding hard stop — channels off, engine paused, elapsed time frozen
**And** on return the grace period applies

**Given** a Field Note's Journal entry
**When** it appears in the Journal
**Then** it is grouped by night at the 04:00 boundary, like any other entry (Epic 6's rule)
**And** it renders as a Field Note rather than as a Case with a missing report

**Given** a Field Note produces a Journal entry
**When** its copy is written
**Then** it satisfies FR-33 and the claims lint
**And** it never asserts anything about the real world

---

**Epic 2 complete:** 10 stories. FR-1, FR-2, FR-4, FR-5, FR-9, FR-10, FR-30 and FR-31 covered.
The engine core, the sensor layer, the Brief, intensity, the session shell with its presenter
bottleneck, Home and Field Note mode are all in place. A full Session runs end to end with no tools,
no report and no journal — which is what lets Epic 2 stand alone.

---

## Epic 3: The case the night wrote

The user can capture Evidence during a Session, have it committed at the moment of capture, and
afterwards triage every item themselves — marking it explained or unexplained and recording a reason
when it was explained. The session accumulates into a Signature stripped against the user's
Signature Archive. The Case resolves to a status derived from the user's own verdicts and whether an
Encounter occurred, and produces a complete Case Report. The user seals and files it with a sustained
hold, and can render a Share Card from it.

**FRs covered:** FR-18, FR-19, FR-20, FR-21, FR-22, FR-23, FR-24, FR-34, FR-35, FR-36
**UX-DRs covered:** UX-DR33–UX-DR37, UX-DR39–UX-DR43
**Governing invariants:** AD-8, AD-10, AD-11, AD-15, AD-16, AD-17, AD-18, AD-24, AD-25, AD-27

---

### Story 3.1: Evidence is committed the moment it is captured

As a **user who just caught something**,
I want the record to exist immediately and to be described honestly,
So that a crash, a force-quit or a dead battery cannot take back what I already found.

**Acceptance Criteria:**

**Given** the closed evidence vocabulary
**When** the kinds are enumerated
**Then** there are exactly ten persisted kinds: `emf_swing`, `voice_capture`, `word_bank_hit`,
`photo_anomaly`, `shadow_pass`, `footprint`, `tree_knock`, `sky_light`, `user_note`, `user_audio`
**And** `cold_spot` and `bearing_lock` are absent — `cold_spot` would reach a `thermal` channel on a
phone with no temperature sensor
**And** no eleventh kind can be introduced by content

**Given** the 22 per-hunt aliases
**When** the content-validation test runs
**Then** every alias resolves onto the closed ten-kind vocabulary
**And** the `transmission` alias resolves to `sky_light` and **never** to `word_bank_hit`, per FR-39
**And** the mapping is asserted in a dedicated test rather than inferred

**Given** Evidence carries its descriptor set
**When** an item is committed
**Then** it carries a kind, a certainty band of `AMBIGUOUS`/`SUGGESTIVE`/`COMPELLING`, a channel,
the tool that produced it, the phase it occurred in, and its source
**And** the channel is one of `emf`, `audio`, `visual`, `thermal`, `motion`, `log`
**And** the phase is one of the five
**And** the source equals the channel

**Given** a certainty band
**When** it is displayed anywhere, in any surface or accessibility label
**Then** it is never expressed as a number, a percentage or a fraction
**And** no rendering primitive exists that could express it that way

**Given** each evidence kind
**When** the glyph set is inspected
**Then** each kind maps to **exactly one** evidence glyph
**And** the glyph set is **closed against the kind list** by a content-validation test
**And** adding a kind without a glyph, or a glyph without a kind, fails the build

**Given** a capture is made with nothing active
**When** the item is committed
**Then** it commits as a `null_reading`
**And** it carries the copy `You marked a spot with no reading. That is also a record.`
**And** it **counts toward negative space** rather than being discarded
**And** it is indistinguishable in the ledger from any other honest log

**Given** two captures occur within 1.5 seconds
**When** they are committed
**Then** they coalesce into **one item** carrying a `×2` marker
**And** the coalesced item's certainty is not silently upgraded by the second capture

**Given** any capture
**When** it is committed
**Then** it is written to **durable storage at the moment of capture**, not at session end
**And** a crash or force-quit immediately afterwards loses nothing already logged
**And** the commit path runs through `EvidenceService` and the presenter, never around them

**Given** a session that ends under sixty seconds
**When** its evidence is inspected
**Then** the evidence is **unlinked rather than deleted**
**And** it renders with a `NO CASE` chip

**Given** evidence that is marked internally as contested
**When** it is committed
**Then** it is stored through the same path as any other item
**And** nothing in its stored shape or its rendering distinguishes it before triage
**And** this story commits such an item correctly without requiring the plant logic to exist yet —
the plant arrives in a later story and must not require a change to this commit path

### Story 3.2: The signature converges without ever concluding

As a **user building a picture across nights**,
I want to see how much of a signature I have matched without being told what I am matching,
So that the pattern feels discovered rather than assigned.

**Acceptance Criteria:**

**Given** a Case's Signature is presented
**When** the strip renders
**Then** it renders **7–9 slots read from the case**, never from a constant
**And** the slot count is derived from `HuntDefinition.signatureSlots`, which is content-validated
for a length of 7–9 with every entry drawn from the closed six:
`trace · voice · form · habit · place · refusal`

**Given** a Case's Signature resolves
**When** the outcome is shown
**Then** it is either `PARTIAL MATCH · UNIDENTIFIED` or `NO MATCH ON FILE`
**And** a Signature is **never** presented as a positive identification of a real creature
**And** no surface states or implies what a full match would identify

**Given** the Signature Archive
**When** it renders
**Then** it is a four-by-two grid
**And** a filled slot means a matched signature
**And** a marked slot means seen but unidentified
**And** an empty slot means never seen

**Given** an unidentified slot
**When** it renders
**Then** it is a `?` tile pulsing slowly at roughly **0.5 Hz** whenever the Archive is on screen
**And** the `?` tile is **never labeled, captioned, or the target of a callout or coach mark**
**And** tapping it may open exactly one line:
`A signature you have recorded but not identified. It will match, or it will not.`
**And** the pulse rate is not accelerated, smoothed or made configurable

**Given** there is no progress toward a signature
**When** any surface is inspected
**Then** there is **no progress readout, no stated unlock requirement, no completion count and no
per-Phenomenon checklist**
**And** there is no locked entry, silhouette, padlock, keyhole or "unlock" copy anywhere

**Given** a `signatureSlots` content field
**When** `HuntDefinition` is loaded
**Then** it validates for length 7–9 with entries from the closed six
**And** malformed content fails the build rather than reaching a user

**Given** the Journal's archive strip
**When** it renders alongside a Case's report strip
**Then** the archive renders a fixed 8 while the report renders 7–9 from the case
**And** the two are not conflated — six `signature_slot` categories and a 7–9 position strip are
different axes

### Story 3.3: Some evidence is planted, and the user is the one who disproves it

As a **user who expects to be fooled sometimes**,
I want the app to plant plausible signals and let me be the one who decides they were nothing,
So that my own judgment is what the case rests on.

**Acceptance Criteria:**

**Given** a Session's seeded forks
**When** a contested item is planted
**Then** the plant is driven by those forks, so it is **reproducible in replay**
**And** it is **absent from a seeded sweep in which it was not drawn**
**And** a test asserts both properties across the sweep

**Given** a contested item exists
**When** it is displayed before triage
**Then** it presents **identically to ordinary Evidence** in every surface — the tool, the capture
card, the ledger
**And** nothing in the interface tells the user it is contested before they triage it

**Given** the user triages a contested item
**When** they resolve it as explained
**Then** the resolution is recorded
**And** it is reflected in the explained ratio that drives status derivation
**And** **nothing congratulates them afterwards** — no confirmation, no badge, no reward copy

**Given** a contested item is left untriaged
**When** the case resolves
**Then** it stays `UNREVIEWED` and weighs toward `INCONCLUSIVE` like any other skipped item

**Given** a contested item
**When** its resolution is computed
**Then** it **never** resolves to `UNEXPLAINED` on its own
**And** it **never fabricates an Encounter**

**Given** a contested item is planted
**When** its evidence kind is assigned
**Then** it is drawn from the closed ten-kind vocabulary like any other item
**And** it is never a kind that only contested evidence can produce

**Given** the plant's copy is authored
**When** it is checked against AD-27
**Then** no sentence describes the app as having detected, confirmed or verified anything
**And** the item's own description is written in the same hedge vocabulary as ordinary evidence

### Story 3.4: The verdict is the user's, and the app never presents it as its own finding

As a **user reviewing a night's evidence**,
I want to mark each item myself and say why,
So that the record says what I decided rather than what the app concluded.

**Acceptance Criteria:**

**Given** the triage ritual
**When** it is presented
**Then** it is a **deliberate review, not a dismissible dialog**
**And** it presents **one evidence item per card**
**And** the three verdicts are full-width: `Unexplained` · `Inconclusive` · `Explained`

**Given** the user's verdicts
**When** they are recorded
**Then** the closed set is `UNEXPLAINED`, `INCONCLUSIVE`, `EXPLAINED`, `UNREVIEWED`
**And** an item the user skips stays `UNREVIEWED`
**And** skipped items weigh toward `INCONCLUSIVE`

**Given** the user chooses `Explained`
**When** the reason picker opens
**Then** the reason is drawn from a closed set of five: `A car` · `The building` ·
`My own movement` · `Equipment` · `Something else`
**And** the reason is stored as the reason phrase the model calls
`vehicle` · `building` · `own_movement` · `equipment` · `other`

**Given** a reason is recorded
**When** it renders in the ledger
**Then** it renders as **the user's verdict, not as a finding**
**And** no surface phrases it as something the app determined, concluded or detected
**And** a test or review item asserts this phrasing on every release

**Given** triage progress is displayed
**When** it renders
**Then** it is a **position, never a fraction**
**And** it **never** renders `3 of 7`, `43%` or any equivalent
**And** the progress hairline's segment count is derived from the case's actual evidence array

**Given** triage verdicts are recorded
**When** the Signature strip is considered
**Then** **triage verdicts never move the Signature strip**
**And** the Triage sheet's own header may re-render its strip live while the report's strip never moves

**Given** the user reviews a case in the sheet
**When** the sheet's strip updates
**Then** the update is confined to the sheet
**And** the persisted report values are untouched until seal

**Given** a case's evidence array is empty
**When** triage is reached
**Then** triage presents its own honest empty state with exactly one action
**And** the case can still be sealed and filed

### Story 3.5: Status is derived from what happened and what the user decided

As a **product owner whose app must never declare a haunting**,
I want status to be a pure function of evidence, verdicts and encounter — with the asymmetry intact,
So that `UNEXPLAINED` is structurally earned and never accidentally awarded.

**Acceptance Criteria:**

**Given** the status function
**When** it is implemented
**Then** it is **pure** and derives the slot count from the case it is given
**And** it takes only the evidence, the triage verdicts, and whether an Encounter occurred
**And** it lives in `src/engine/rules/**` with no side effects

**Given** the derivations
**When** they are implemented
**Then** convergence is the fraction of Signature slots filled
**And** the explained ratio is the fraction of triaged Evidence marked `EXPLAINED`

**Given** `UNEXPLAINED`
**When** it is awarded
**Then** it requires **all three**: convergence ≥ 0.60, **at least one Encounter**, and an
explained ratio < 0.34
**And** a test asserts that a case failing any one of the three does not receive it

**Given** `EXPLAINED`
**When** it is awarded
**Then** it requires an explained ratio ≥ 0.60

**Given** any other combination
**When** status resolves
**Then** it is `INCONCLUSIVE`

**Given** a case with no Encounter
**When** status resolves
**Then** it **can never** resolve to `UNEXPLAINED`, however strong its convergence
**And** a test asserts this over the full combinatorial sweep of convergence and explained ratio

**Given** a case that captured nothing at all
**When** status resolves
**Then** it still produces a **complete report with a valid status**

**Given** the three triage asymmetries
**When** they are implemented
**Then** they are deliberate and no mechanism exists that "fixes" them
**And** the interface does **not** explain the asymmetry
**And** **no copy** states that a combination of verdicts unlocks a status
**And** nothing congratulates the user after a contested item is disproved
**And** skipped items stay `UNREVIEWED` and weigh toward `INCONCLUSIVE`

**Given** the status function is where a lazy implementation would print its own thresholds
**When** `statusRationale` is authored
**Then** it is one authored sentence per status × dominant cause
**And** it is **never** a formula readout, a threshold display or a computed explanation

**Given** progression inputs
**When** the seal transaction opens
**Then** progression inputs are computed **before** the transaction opens
**And** they are **never** written afterwards

### Story 3.6: A session that produced nothing is named, not generalized

As a **user who had a quiet night**,
I want the record to say which kind of quiet it was,
So that the app's honesty extends to the nights it has nothing to show.

**Acceptance Criteria:**

**Given** the four no-event outcomes
**When** they are enumerated
**Then** they are exactly `QUIET_NIGHT`, `WINDOW_CLOSED_EMPTY`, `FALSE_POSITIVE` and `NOT_FRAMED`

**Given** `QUIET_NIGHT`
**When** it is recorded
**Then** the session held silence throughout
**And** it carries its own authored rail copy and its own treatment in the Case Report

**Given** `WINDOW_CLOSED_EMPTY`
**When** it is recorded
**Then** the encounter window opened and produced nothing
**And** it carries its own authored rail copy and its own report treatment

**Given** `FALSE_POSITIVE`
**When** it is recorded
**Then** a signal was logged and triage resolved it as ordinary
**And** its line appears **only when the user says so** — it is the one outcome the app does not
announce on the user's behalf

**Given** `NOT_FRAMED`
**When** it is recorded
**Then** an encounter occurred but the user was not looking at the right tool
**And** the Session records the missed window rather than hiding it

**Given** the attribution distinction
**When** the four outcomes are rendered
**Then** `FALSE_POSITIVE` and `NOT_FRAMED` are attributed to **the user's own action**
**And** `QUIET_NIGHT` and `WINDOW_CLOSED_EMPTY` are attributed to **the night**
**And** the distinction **survives into the copy** — the four are never collapsed into one generic state

**Given** the four outcomes are recorded
**When** the Journal renders them
**Then** it can show the user how many of each they have recorded
**And** the counts are the user's own historical counts, never a number they could verify against the world

**Given** no-event outcome copy
**When** it is authored
**Then** it satisfies FR-33 and the claims lint
**And** it never asserts anything about the real world

**Given** the six failure states
**When** they are recorded
**Then** `NOTICED`, `CORNERED`, `GONE`, `MISDIRECTED`, `INTERFERENCE` and `NOT_ALIGNED` are all
**first-class terminal evidence rather than aborted sessions**
**And** each produces a complete report

**Given** `MISDIRECTED` specifically
**When** its in-session behaviour is inspected
**Then** it has **no in-session tell**, and that is the design
**And** no warning, hint or subtle signal is added for it

### Story 3.7: The Case Report is a document, not a dashboard

As a **user who sealed a case**,
I want one complete document that reads the way a field report reads,
So that what I did has the weight of a record rather than the shape of a score screen.

**Acceptance Criteria:**

**Given** a sealed Case
**When** the report renders
**Then** it contains, **in this order**: a masthead carrying the case reference and date; a status
seal showing the status word, the case name and hunt metadata; a stat row; a signature strip; a
narrative account of three to six declarative lines; a souvenir reel of captured media; an evidence
ledger listing each item with type, time and triage verdict; a negative-space block; an investigator
note field; and a conditions footer carrying the Seed reference, the entertainment line and the
content version

**Given** the stat row
**When** it renders
**Then** it shows duration, evidence count, encounter count and source count, plus an activity band
of `LOW`/`MODERATE`/`HIGH`
**And** it shows **no percentage and no unit-bearing number of any kind**
**And** every value it can render is a count of things that happened or elapsed time

**Given** the narrative account
**When** it is written
**Then** it is **authored from a template bank** — **no text is generated at runtime**
**And** it is three to six declarative lines
**And** it never states or implies what the user saw

**Given** the investigator note
**When** the field renders
**Then** its prompt is `What did you notice?` and its placeholder is `The tools miss things. You don't.`
**And** it is an open field, and it is one of the schema's two free-text columns

**Given** the report is laid out
**When** it is measured
**Then** it is **one column** with generous margins and everything sharing one rhythm
**And** it is a document, not a dashboard — no widget grid, no cards, no tiles beyond the stat row

**Given** the report scrolls
**When** the user long-presses **any block**
**Then** it offers `Share this block`
**And** this is the only screen in the product where that is true on every element

**Given** a Session ends under sixty seconds
**When** the user reaches the end
**Then** there is **no report at all**
**And** the case is **discarded** with a one-line notice
**And** its evidence is unlinked and renders with a `NO CASE` chip

**Given** a Session with zero Evidence and zero Encounters
**When** the report renders
**Then** it still renders a **complete report** rather than an empty state
**And** its status is `INCONCLUSIVE`, its signature strip renders empty rather than being omitted,
and its `NOT RECORDED` panel renders prominently

**Given** the conditions footer
**When** it renders
**Then** it carries the Seed reference, the content version, and the entertainment line read from
the single exported constant
**And** the line is never retyped as a literal

**Given** the report is built and rendered
**When** the tables it needs are enumerated
**Then** this story creates the `cases` table and the frozen Case Report table, because it is the
first story that builds and persists a report
**And** the migration is additive — the session and evidence tables from Story 2.5 are untouched
**And** the report row is frozen at seal time, and sealing is a later story's transaction — this
story defines and renders the report; it does not write the frozen row

**Given** the report is read by VoiceOver or TalkBack
**When** the user navigates
**Then** the entire report is navigable
**And** live regions announce nothing on this screen — announcements belong to capture and phase
change only

### Story 3.8: The report can say what was not recorded

As a **user reading an honest account**,
I want the report to state what the session did not capture, where that absence actually means something,
So that the record is complete in both directions.

**Acceptance Criteria:**

**Given** the negative-space block
**When** it renders
**Then** it carries **two to four lines** drawn from an authored negative-space bank describing what
the session did not capture

**Given** the absence rule
**When** a line's eligibility is evaluated
**Then** absence is meaningful **only where a measurement was possible**
**And** a tool never opened generates no line
**And** a permission denied generates no line
**And** an absent sensor generates no line
**And** a test asserts each of those three exclusions

**Given** no line qualifies
**When** the block would render
**Then** the block is **omitted entirely**
**And** it is **not** filled with placeholder text, a generic line, or an apology

**Given** a case is re-rendered
**When** the negative-space lines are drawn
**Then** they are drawn from the **seeded report fork**
**And** a case's negative space is **stable across re-renders**
**And** a test asserts the same case renders the same lines twice

**Given** the session's sensor state
**When** the negative-space eligibility is computed
**Then** it consults the recorded sensor status, not the state at render time
**And** a phone with no magnetometer omits the EMF line

**Given** the negative-space copy
**When** it is authored
**Then** it satisfies FR-33 and the claims lint
**And** it describes what was not recorded rather than what was
**And** it never implies the app was looking for something specific

**Given** the nothing-case
**When** its negative space is computed
**Then** the block is **prominent**, because there is more absence than presence to report
**And** it is still bounded by the same eligibility rule — it does not list everything at once

### Story 3.9: A night that produced nothing is one of the best screens in the app

As a **user who sat for twenty minutes and caught nothing**,
I want a document that treats that as a result,
So that the app never makes me feel I played it wrong.

**Acceptance Criteria:**

**Given** a Session with zero Evidence and zero Encounters
**When** the Case Report renders
**Then** it renders **in full, not as an empty state**
**And** its status is `INCONCLUSIVE`
**And** its signature strip renders empty rather than being omitted

**Given** the nothing-case report
**When** the `NOT RECORDED` panel renders
**Then** it is **prominent** rather than tucked away
**And** the line above the stat row reads `Nothing was recorded tonight. That is a result.`

**Given** the nothing-case report
**When** it is reviewed for craft
**Then** it is **one of the best-looking screens in the app**
**And** this is an explicit acceptance condition, not an aspiration — it is reviewed as such
**And** the absence of content is treated as a design problem, not as a case to be skipped

**Given** the nothing-case Share Card
**When** it is generated
**Then** it renders the empty frame with `Nothing recorded` centred
**And** its field note reads `Some nights are for listening.`

**Given** a nothing-case
**When** triage is reached
**Then** triage presents its own honest empty state with exactly one action
**And** it does not fabricate an item for the user to triage

**Given** a nothing-case
**When** the user seals it
**Then** sealing works exactly as for any other case
**And** it produces a Case row and a frozen Case Report

**Given** a nothing-case is sealed
**When** progression is computed
**Then** the sealed Case counts toward Clearance as a sealed Case
**And** no Encounter, signature match or discovery is fabricated to compensate

**Given** the nothing-case copy
**When** it is authored
**Then** it never apologizes, never thanks the user, and never suggests they did something wrong
**And** it satisfies the voice rules — nine words maximum on any single line

### Story 3.10: Sealing freezes the record and an encounter is never a pop-up

As a **user filing a case**,
I want the record to become permanent when I seal it, and I want the night's moments to arrive as
the night's moments rather than as notifications,
So that a filed case means something and an encounter is not a dialog box.

**Acceptance Criteria:**

**Given** the `SEAL & FILE` gesture
**When** the user holds
**Then** it requires a sustained hold of roughly **600 ms** with the fill hairline
**And** sealing is an **explicit user action** and never happens automatically

**Given** a Case is sealed
**When** the report is later re-rendered
**Then** its values are **persisted at seal and never recomputed**
**And** resealing the same case produces the same report

**Given** a sealed Case is edited
**When** the edit is saved
**Then** it is **irreversible without producing a visible revision stamp**
**And** a filed case shows a sealed chip
**And** an edited case shows the revision stamp alongside it

**Given** a sealed report
**When** any surface renders it
**Then** it cannot be altered in a way that misrepresents what happened

**Given** the conditions footer
**When** it renders on any surface carrying the report
**Then** it **always** carries the entertainment line, read from the exported constant

**Given** an Encounter resolves during a Session
**When** it is presented
**Then** it is **never a full-screen pop-up**
**And** it arrives through a sensory channel: a sprite in the Camera, a sting plus found text, a
haptic pattern, or a single brief glitch frame
**And** the glitch frame appears **once per session and never twice**

**Given** an Encounter has resolved
**When** the aftermath is shown
**Then** a short aftermath line sits alone on **the rail**
**And** the rail carries one sentence at a time and nothing else

**Given** the artifact rule
**When** any Encounter resolves
**Then** it produces **at least one artifact**
**And** a captured frame reads as a glimpse, not footage — low opacity, off-centre, never in focus,
never a legible subject
**And** a test or review item asserts no encounter asset shows a creature in focus, centred, or
facing the lens

**Given** an Encounter window opens but the hunt's own rule suppresses its rendering
**When** the case is sealed
**Then** the record still reports that the **window opened**
**And** the suppression is never hidden, silently dropped, or rewritten as a non-event
**And** this story builds the reporting behaviour generically; the hunt-specific suppression rule is
supplied by content and by a later story without changing this path

**Given** the seal transaction
**When** it runs
**Then** it is the **sole writer** of the Case, the Case Report, `discoveries`, `badge_awards` and
`user_progress`
**And** it runs as one transaction
**And** it writes the frozen Case Report into the report table created by Story 3.7
**And** it creates `discoveries`, `badge_awards` and `user_progress` in the same additive migration,
because this is the first place they are written — Epic 6 only reads them

### Story 3.11: The share card leaves the app clean and carries no attribution

As a **user who wants to show someone**,
I want one image that looks like the case and carries nothing I did not put there,
So that sharing is an artifact rather than an advertisement.

**Acceptance Criteria:**

**Given** a sealed Case Report
**When** the user generates a Share Card
**Then** it is a **single image**
**And** it carries the case reference, an artifact block, the status word with its stamp ring, a
three-cell stat row, a short seeded field note, and a footer

**Given** the artifact block
**When** it renders
**Then** it shows the case's strongest artifact — a word, a captured frame, or a trace
**And** when there is none, it shows a negative-space treatment stating that nothing was recorded

**Given** the field note
**When** the card is first generated
**Then** it defaults to one of **four seeded options**
**And** the user may replace it with up to **sixty characters** of their own text
**And** **the app never generates the note**

**Given** the field note is edited
**When** the card re-renders
**Then** only the note is re-rendered — the card is **not regenerated around the edit**

**Given** the variant selector
**When** the user switches between `Story 9:16` and `Feed 4:5`
**Then** the card cross-fades between the two ratios
**And** both ratios render the same content

**Given** the media-library permission state
**When** `Save to Photos` is considered
**Then** it is available **only when the permission has been granted**
**And** if it has not been granted the control is **absent, not present-and-failing**
**And** the user is **not prompted from the card** for the permission

**Given** the card is re-rendered with the same content at the same device pixel ratio
**When** the two images are compared
**Then** they are **visually identical** — perceptual identity, not byte identity
**And** a test asserts perceptual identity rather than exact bytes

**Given** the Share Card footer
**When** it renders
**Then** it **always** carries the entertainment line from the exported constant

**Given** the Share Card is inspected
**When** the hard exclusions are checked
**Then** there is **no watermark, no URL, no QR code, no app-store badge and no attribution text**
**And** there is no "made with" line
**And** a test asserts the rendered image contains none of these

**Given** the user changes their mind
**When** they cancel
**Then** the card is discarded **without loss** — the case, its report and its evidence are untouched

**Given** the card is shared
**When** the user proceeds
**Then** it goes through the **system share sheet**, can be saved to photos, or can be canceled
**And** no in-app social surface, feed, or comparison exists anywhere in the path

**Given** the Share Card's stat row
**When** it renders
**Then** it is three cells rather than four
**And** no cell is a percentage or a unit-bearing number

---

**Epic 3 complete:** 11 stories. FR-18 through FR-24, FR-34, FR-35 and FR-36 covered. The evidence
model, the signature, contested evidence, triage, status derivation, the four no-event outcomes, the
Case Report, negative space, the nothing-case, sealing and the Share Card are all in place. This is
the epic that makes the growth loop real — tools generate, the report packages, the share recruits —
and it lands before any tool exists, per Override 14's report-first build order.

---

## Epic 4: Seven instruments, none of which lie

The user can reach all seven tool surfaces from a live Session in one gesture and use each one:
`SWEEP` the space for a field reading, `ORIENT` to a bearing and range band, `ASK` a question and
almost never receive a word, `RECORD` audio and mark moments, `FRAME` the environment and catch an
Encounter on camera, `FOLLOW` a trail, `ALIGN` to the sky. Every surface shows bands, words and
geometry — never a number, a unit, an axis or a degree. Every empty state carries exactly one action,
and every permission denial produces a working first-class alternative rather than a broken screen.

**FRs covered:** FR-11, FR-12, FR-13, FR-14, FR-15, FR-16, FR-17
**UX-DRs covered:** UX-DR26–UX-DR33, UX-DR44, UX-DR48, UX-DR53
**Governing invariants:** AD-2, AD-13, AD-15, AD-20, AD-27, AD-29

---

### Story 4.1: Every tool is one gesture away and none of them is a dead end

As a **user inside a live Session**,
I want to reach any instrument without leaving the night and never to land on a screen with nothing to do,
So that investigating stays continuous rather than becoming navigation.

**Acceptance Criteria:**

**Given** a live Session
**When** the tool row is presented
**Then** every tool surface is reachable within **one gesture**
**And** a test asserts that distance for all seven

**Given** tools push **above** the session
**When** a tool is opened and then popped
**Then** exactly **one** full-screen surface exists at a time
**And** the camera preview **unmounts** on pop
**And** a test asserts only one camera preview can exist at any moment

**Given** a tool surface has nothing to show
**When** its empty state renders
**Then** it carries **exactly one action**
**And** no empty state is a dead end — no screen presents a message with no way forward
**And** a test walks all seven surfaces in their empty state and asserts exactly one action each

**Given** the tool row under Dynamic Type
**When** type is scaled
**Then** the tool row is capped at **140%**
**And** at the largest sizes the body clamps and scrolls and primary buttons never leave the screen
**And** the tool row's form factor **past** the cap is an **open problem to solve, not to cap away** —
a two-row labelled grid is the direction worth validating, and it is recorded as unresolved rather
than closed
**And** this story does not claim to have resolved it

**Given** a tool produces a reading the app cannot explain
**When** the interference state applies
**Then** `INTERFERENCE` is first-class terminal evidence
**And** it is not treated as an error, an aborted session, or a tool failure

**Given** any tool surface
**When** it is presented
**Then** it renders within the session shell from Story 2.8
**And** sensor access flows through `src/sensors/**` and nowhere else
**And** no tool imports `expo-sensors`, `expo-location` or microphone capture directly

**Given** every tool's sensory output
**When** it reaches the user
**Then** it flows through the presenter from Story 2.8
**And** no tool writes evidence around the presenter

### Story 4.2: EMF sweeps for a field reading and never shows a number

As a **user sweeping a room**,
I want a trace that responds to the space without pretending to measure it,
So that I can read the room without being handed a figure I would have to believe.

**Acceptance Criteria:**

**Given** the EMF surface
**When** it renders
**Then** it offers `SWEEP` (arming for ten seconds) and `LOG THIS SPOT`
**And** its visible states are `STILL`, `DRIFT`, `STIR`, `INTERFERENCE` and `INFERRED`

**Given** the field is rendered
**When** it draws
**Then** it is an **arc whose width varies across four levels** with a rolling-window trace
**And** there is **no y-axis, no unit and no numeric readout anywhere on the surface**
**And** the surface **must not display raw magnetic strength as a paranormal reading**

**Given** the surface is presented as text to VoiceOver or TalkBack
**When** the state is announced
**Then** it announces the state word and nothing numeric
**And** no hidden value is exposed to assistive technology

**Given** no magnetometer is present
**When** the surface runs
**Then** it reports an **inferred** state from motion and clock
**And** it carries a **permanent `INFERRED` chip**
**And** the trace runs at **identical cadence** to the real one — the difference is honesty, not behaviour

**Given** the device is shaken
**When** excessive movement is detected
**Then** the trace dims to `HOLD STEADY`
**And** it does not produce an error or an interrupted-session state

**Given** `LOG THIS SPOT` is used on `STILL`
**When** the spot is logged
**Then** it produces a **dry log** — an honest empty record
**And** it is committed per Story 3.1 and counts toward the report's negative space

**Given** the trace's baseline
**When** it renders
**Then** it draws against a `ROOM` baseline
**And** the radial dial is **concentric arcs and never a needle**
**And** no dial element can render a numeric value

**Given** the EMF surface under Reduce Motion
**When** it renders
**Then** the sweeping animation is **static**
**And** the reading mechanism continues to update

### Story 4.3: Radar shows uncertainty as geometry and never locks on

As a **user orienting to a signal**,
I want contacts that express how little is known about them,
So that the radar reads as a range of possibility rather than a target list.

**Acceptance Criteria:**

**Given** the Radar surface
**When** it renders
**Then** it offers `SWEEP` and `ORIENT`
**And** it draws a rose with hairline rings and **eight compass letters**
**And** there are **no distance numbers** anywhere on the surface

**Given** a contact
**When** it is drawn
**Then** it is a **confidence cone whose angular width is its uncertainty**
**And** it is **never a dot** and **never a lock**
**And** contact count is expressed as a word: `CLEAR`, `ONE` or `SEVERAL`

**Given** targets are generated
**When** a target is born
**Then** it has a birth, a velocity, an uncertainty and a death
**And** it may appear briefly, drift, fade, approach or dissolve
**And** targets are **never randomly placed** and **never lock on**

**Given** a target's displayed uncertainty
**When** the user observes it directly
**Then** the cone may narrow
**And** in all other cases the uncertainty **only ever widens**
**And** the cone width **never collapses to a lock**, under any sequence of user actions

**Given** a twenty-minute session
**When** targets are counted
**Then** **no more than four concurrent targets** exist
**And** a test asserts the bound across the seeded sweep

**Given** a contact detail
**When** the user taps a cone
**Then** its detail strip opens as a sheet over the session
**And** holding the rose offers `LOG BEARING`

**Given** a logged bearing
**When** it is recorded
**Then** it is one of **eight compass points plus a range band**
**And** distance is **never shown in metres or any other unit**

**Given** no heading sensor is available
**When** the surface runs
**Then** it draws a **north-free rose** with a `RELATIVE` chip
**And** bearings are expressed as `LEFT`, `AHEAD` or `RIGHT`

**Given** a session in which no contact ever appears
**When** the surface renders
**Then** **zero contacts for a whole session is a designed outcome**
**And** the rose still animates, the chip still reads `CLEAR`, and no failure state is presented
**And** the report records `No bearing ever resolved.`

### Story 4.4: Voice asks a question and the app stays silent

As a **user speaking into the dark**,
I want the app to acknowledge only what I did and then say nothing,
So that I am never told something answered when nothing did.

**Acceptance Criteria:**

**Given** the Voice surface
**When** it renders
**Then** it offers `ASK` as a sustained hold and `LOG THIS`
**And** it carries the permanent disclaimer `Bands are theatre. Nothing here is received.`

**Given** the user releases the ask
**When** the surface acknowledges
**Then** it acknowledges **only the user's own act** — a bare input-level collapse
**And** it **must not** stamp `SENT` or any word implying a message left the device
**And** no wording anywhere on the surface, in its copy, or in its accessibility labels states or
implies that anything was **received, transmitted, heard or contacted**

**Given** the ask has completed
**When** the app responds
**Then** it says **nothing for at least twelve seconds**
**And** there is no loading indicator, no "listening…" spinner and no countdown
**And** a test asserts no progress indicator renders during that window

**Given** a response eventually arrives
**When** it renders
**Then** the sequence is a sweeping band line, a flattening ribbon, a **mandatory silence of roughly
300 ms**, then **at most one word**
**And** the word fades in, holds about 2.4 seconds, and fades out
**And** **at most one line is produced per ask**

**Given** response timing
**When** the seeded draw resolves
**Then** non-response is the **majority case** and is designed as the normal state
**And** a response may be delayed up to **ninety seconds**
**And** it **may arrive on a different tool than the one that asked**
**And** a test asserts the cross-tool case is reachable

**Given** a word is produced
**When** its source is inspected
**Then** it is drawn from an **authored bank** — **no text is generated at runtime**
**And** no word is composed, concatenated or templated at runtime

**Given** the microphone is denied
**When** the surface runs
**Then** it enters **archive mode**
**And** the button becomes `SCAN` with an `ARCHIVE` chip
**And** it shows **no response wording that implies anything answered**
**And** no coupling exists between speaking and answering

**Given** the Voice surface under Reduce Motion
**When** it renders
**Then** the sweeping band renders statically rather than animating

### Story 4.5: EVP records, marks and attributes nothing to itself

As a **user recording a session**,
I want to mark moments as mine and keep or discard them,
So that the record never credits the app with a finding I did not make.

**Acceptance Criteria:**

**Given** the EVP surface
**When** it renders
**Then** it offers `RECORD`/`STOP` and `MARK`
**And** it records over **rolling thirty-second segments**
**And** it draws a mirrored waveform with a marker lane beneath

**Given** the user marks a moment
**When** the pin drops
**Then** it carries an **inline label written by the user**
**And** it appears in the marker lane and can be played from the marker, kept as Evidence, or deleted

**Given** the system injects a possible-anomaly pin
**When** it renders
**Then** it is **unlabeled and undescribed**
**And** if the user keeps it, it reads `EVP · UNMARKED SEGMENT`
**And** the attribution is to **the user**, never to the app
**And** no copy credits the app with detecting, finding or identifying anything

**Given** the microphone is denied
**When** the tool carousel is built
**Then** the EVP tool is **not offered in the carousel at all**
**And** the Brief reads `EVP · unavailable`
**And** the surface is never reachable in a broken or degraded form

**Given** recording is interrupted
**When** the interruption occurs
**Then** the file is **finalised**
**And** a `SESSION PAUSED` marker is dropped so the gap is explained
**And** the gap is not silently closed or hidden

**Given** recorded audio exists
**When** any surface describes it
**Then** the surface **never asserts that recorded audio is paranormal**
**And** the app **never claims** an audio event was scientifically meaningful

**Given** a kept segment
**When** it is committed as Evidence
**Then** it is committed per Story 3.1 with the `user_audio` kind
**And** its certainty band is never a number

**Given** the EVP surface under Reduce Motion
**When** it renders
**Then** the waveform renders statically rather than animating

### Story 4.6: The camera is deliberately restrained and never shows a heading

As a **user framing the dark**,
I want an overlay that helps me compose without telling me where I am or how strong anything is,
So that the camera records rather than interprets.

**Acceptance Criteria:**

**Given** the Camera surface
**When** it renders by default
**Then** the overlay is exactly: rule-of-thirds grid, corner brackets, a **mono time strip**, an
**unlabeled three-bar meter**, a torch toggle and a vignette
**And** there is **no compass heading** and **no numbered or lettered axis** of any form
**And** a test asserts no degree value and no heading element exists on the surface

**Given** the mono time strip
**When** it renders
**Then** it shows elapsed session time
**And** it is not a recording timer that implies a measurement of anything but time

**Given** the three-bar meter
**When** it renders
**Then** it is **unlabeled and unnumbered**
**And** it can never render a numeric value or a percentage

**Given** night-vision styling, scan lines, heavy noise and chromatic aberration
**When** the surface is in its default state
**Then** **none of them appear**
**And** they arrive **only through the glitch channel**, enabled only at `Intense` and `Ritual`
**And** under Reduce Motion the glitch channel is disabled and **re-routed to audio**

**Given** the user captures a frame
**When** the capture fires
**Then** it produces a **brief, subdued flash and no shutter sound**
**And** the frame is committed per Story 3.1

**Given** an Encounter frame is rendered
**When** it appears
**Then** it is a **short sprite sequence at low opacity**
**And** it is **never centered and never in focus**
**And** it appears **caught rather than presented**
**And** a review item asserts no encounter asset shows a creature in focus, centred or facing the lens

**Given** the camera preview exists
**When** any navigation occurs
**Then** only **one** camera preview may exist at a time
**And** it unmounts when the screen loses focus

**Given** the camera is denied
**When** the surface runs
**Then** it falls back to a **dark-room renderer** preserving Encounter timing and Evidence output
**And** the hunt remains fully playable
**And** an Encounter can still resolve end to end on this path, so that a hunt whose rule depends on
the camera has a working camera-denied story available to it

**Given** the user attempts to pinch
**When** pinch-to-zoom would apply
**Then** it is **intentionally not implemented**
**And** no zoom control exists on the surface

**Given** the Camera surface orientation
**When** the device rotates
**Then** it is one of the two surfaces permitted to rotate, the other being Sky

### Story 4.7: The Tracker states its own limitation on its own surface

As a **user walking a bearing**,
I want the app to tell me plainly, where I am standing, that proximity is inferred from my own movement,
So that I never mistake my own footsteps for a measurement of something out there.

**Acceptance Criteria:**

**Given** the Tracker surface
**When** it renders
**Then** it shows a compass, a bearing chevron, a five-step proximity ladder, a dead-reckoned trail
path and a signal-age indicator
**And** the ladder's bands are `COLD`, `WARM`, `CLOSE`, `NEAR`, `HERE`

**Given** the proximity disclosure
**When** its placement is inspected
**Then** it is **reachable from the surface itself**
**And** it states that proximity is **inferred from the user's own movement rather than measured
against anything**
**And** long-pressing the ladder is its natural home
**And** it is **not buried in settings**
**And** a test asserts the disclosure is reachable from the surface without leaving it

**Given** the user logs a trail mark
**When** the action is attempted
**Then** it requires the ladder to have reached **`CLOSE`**
**And** below that band the action is unavailable and the reason is legible on the surface

**Given** any value on the surface
**When** it renders
**Then** **no numeric distance, speed or coordinate is ever displayed**
**And** the bearing chevron is geometry, not a degree readout

**Given** location is denied
**When** the surface runs
**Then** it enters **uncharted** mode
**And** it shows no path, carries an `UNCHARTED` chip, and hides all distances
**And** the hunt remains playable

**Given** the Tracker surface under Reduce Motion
**When** it renders
**Then** the trail and chevron render without animated interpolation

**Given** a trail mark is logged
**When** it is committed
**Then** it is committed per Story 3.1
**And** it carries no coordinate and no unit

### Story 4.8: The Sky label travels with the capture, in the pixels

As a **user pointing a phone at the sky**,
I want to know the starfield is generated, and I want that to remain true of any image I keep,
So that no capture of mine can ever be mistaken for a photograph of something real.

**Acceptance Criteria:**

**Given** the Sky surface
**When** it renders
**Then** it shows a procedurally generated starfield, a **reticle**, an **eight-segment alignment
meter**, an alignment tolerance, and `ALIGN DEVICE`
**And** there is **no azimuth readout and no altitude readout**
**And** a test asserts no degree value exists on the surface

**Given** the starfield
**When** it is presented
**Then** it is **permanently labeled as generated**
**And** it is **never presented as a real star catalogue**
**And** it is procedurally generated rather than sourced from an astronomical dataset

**Given** a scan is armed
**When** the user pans
**Then** the scan arms for a bounded period
**And** capture requires alignment within tolerance for a sustained moment
**And** alignment **decays at half rate when panning away**, so the user feels the search

**Given** alignment locks
**When** the lock occurs
**Then** the signal holds briefly and may then drift or die
**And** a lock is never presented as a confirmed object

**Given** a Sky capture is committed as Evidence
**When** it is stored
**Then** the **`GENERATED` label is composed into the stored pixels at capture**, not overlaid at
display time
**And** the label **travels with the capture** into every surface it later appears on — the evidence
ledger, the souvenir reel, the Case Report, and the Share Card
**And** a test asserts the label is present in the stored image bytes or its composed derivative
rather than in a display overlay

**Given** the Sky surface
**When** its evidence output is inspected
**Then** it produces **no evidence kind asserting an object was tracked or resolved**
**And** its committed kind is drawn from the closed ten-kind vocabulary per Story 3.1

**Given** the Sky surface orientation
**When** the device rotates
**Then** it is one of the two surfaces permitted to rotate, the other being Camera

**Given** the Sky surface is read by VoiceOver or TalkBack
**When** its state is announced
**Then** the generated label is part of the accessible description
**And** no numeric alignment value is announced

### Story 4.9: No tool surface can render a measurement

As a **product owner whose app must never present a number as a reading**,
I want the absence of measurement primitives to be structural rather than a convention,
So that no future story can reintroduce a percentage, an axis or a degree by accident.

**Acceptance Criteria:**

**Given** the seven tool surfaces
**When** their rendered output is scanned
**Then** there is **no `%` character** in any text, accessibility label or shipped debug string
**And** there is no degree symbol, no unit, no axis label, no numeric distance, no coordinate and no
raw signal-strength value

**Given** the UI component library
**When** its primitives are enumerated
**Then** no primitive can render a percentage, an axis, a degree, a unit-bearing number, a distance
or a raw signal strength
**And** adding one requires deleting a test rather than adding a prop
**And** this structural absence is asserted by a test over the primitive list

**Given** any tool needs to show progress
**When** it renders
**Then** it shows **position, never a fraction**
**And** onboarding shows four hairlines, a session shows five phase segments, and triage shows a
segment per evidence item
**And** no surface renders `3 of 7`, `43%` or any equivalent

**Given** the no-numbers law is a higher-authority constraint than any FR's UI text
**When** an FR's described readout conflicts with it
**Then** the readout is rendered as bands and words
**And** the conflict is recorded rather than silently resolved

**Given** a value would naturally be a number
**When** it is rendered
**Then** it becomes a band or a word — certainty becomes `AMBIGUOUS`/`SUGGESTIVE`/`COMPELLING`,
proximity becomes `COLD`/`WARM`/`CLOSE`/`NEAR`/`HERE`, contact count becomes
`CLEAR`/`ONE`/`SEVERAL`, activity becomes `LOW`/`MODERATE`/`HIGH`

**Given** hidden internal values — tension, Attunement, rarity, Seed
**When** any surface or accessibility tree is inspected
**Then** none of them is displayed, announced or exposed
**And** a test asserts they are absent from every rendered tree

**Given** the lint from Story 1.5
**When** it runs against the tool surfaces
**Then** it is the **second** line of defence
**And** this story's structural absence is the first

### Story 4.10: Every permission denial produces a working first-class alternative

As a **user who has denied something or whose phone lacks a sensor**,
I want the tool to still do something real,
So that my phone's limits change the app's honesty rather than its usability.

**Acceptance Criteria:**

**Given** the microphone is denied
**When** the tool row is presented
**Then** EVP is absent from the carousel and the Brief reads `EVP · unavailable`
**And** Voice enters archive mode with `SCAN` and an `ARCHIVE` chip
**And** a **microphone-only hunt is a fully supported, first-class configuration**

**Given** the camera is denied
**When** a Hunt whose Encounter requires the camera is played
**Then** the dark-room renderer preserves Encounter timing and Evidence output
**And** the hunt remains completable

**Given** location is denied
**When** the Session runs
**Then** the Hunt proceeds uncharted
**And** the Tracker shows bearing only with an `UNCHARTED` chip
**And** the Seed omits the place component

**Given** the magnetometer is absent
**When** the EMF surface runs
**Then** it runs on motion and clock at identical cadence with a permanent `INFERRED` chip
**And** calibration completes on an inferred baseline and says so

**Given** each of the four denial paths
**When** it is tested end to end
**Then** every one produces a **working first-class alternative**
**And** **none of them produces a broken screen, a dead end, or an unavailable tool with no substitute**

**Given** zero permissions are granted
**When** the app is played end to end
**Then** the full loop works — Brief, Session, Evidence, Triage, Report, Seal
**And** permissions are requested just in time, each explaining why in the moment
**And** a permanent denial swaps `Allow` for `Open Settings` and is never re-offered in the same session

**Given** a denial has occurred
**When** the user returns to that tool
**Then** the app does not nag, re-prompt or repeat the request
**And** no nag loop exists on any path

**Given** a denial path's copy
**When** it is authored
**Then** it never makes the user feel they configured their phone wrong
**And** it satisfies FR-33 and the claims lint

---

**Epic 4 complete:** 10 stories. FR-11 through FR-17 covered. All seven tool surfaces exist, each
reads in bands and words, each has a working degraded mode, and the absence of measurement
primitives is asserted structurally. Every tool routes its sensors through `src/sensors/**` and its
output through the presenter — so no tool can become a second source of truth inside a Session.

---

## Epic 5: Four phenomena, deep

The user can play four Hunts that are genuinely different: a Ghost that is slow, responsive and
audio-led; a Bigfoot that is fast, sudden and visual-led, and whose Encounter can only be rendered
with the Camera live; a Shadow Person that runs noticing in reverse — torch on, camera up and moving
in the dark *raise* the danger, and stillness is the only safe stance, taught only by consequence; and
an Alien that never says a word. Adding a fifth Phenomenon is a content drop, not an engine change.

**FRs covered:** FR-3, FR-6, FR-7, FR-8, FR-37, FR-38, FR-39
**UX-DRs covered:** UX-DR40, UX-DR41 (extended for the four hunt-specific outcomes)
**Governing invariants:** AD-6, AD-7, AD-9, AD-18, AD-20, AD-27

---

### Story 5.1: A user's first Session is guaranteed to reach a real encounter

As a **first-time user**,
I want my first night to actually produce something,
So that the app's premise is proven to me before it asks me to trust a quiet one.

**Acceptance Criteria:**

**Given** the user has **zero sealed Cases**
**When** a Session runs
**Then** the emission budget is **forced to at least one**
**And** at least **five minutes of silence** elapse before the first emission
**And** the first Evidence emission is **guaranteed capture-eligible**

**Given** the directive is active
**When** any surface, copy, sound or haptic is inspected
**Then** it is **invisible to the user**
**And** it produces **no copy, no indicator and no detectable behaviour**
**And** a test asserts nothing in the rendered tree or the emission sequence distinguishes a
first-run session from any other
**And** no analytics event marks it either

**Given** the user has **sealed one or more Cases**
**When** a later Session runs
**Then** the directive **does not apply**
**And** a test asserts it is off for any user with at least one sealed Case

**Given** the first Session runs on Shadow Person
**When** the user reaches `NOTICED` before the guaranteed emission resolves
**Then** the Session ends early with its own stamp
**And** the Evidence collected before `NOTICED` is preserved in full
**And** the Case still produces a complete report
**And** a test covers this interaction — the guarantee promises an emission, not a surviving Encounter

**Given** the first Session ends under sixty seconds
**When** the user reaches the end
**Then** the case is discarded per the `active → discarded` rule
**And** the user still has zero sealed Cases, so the directive applies again on their next Session
**And** a test covers this case

**Given** the guarantee interacts with intensity
**When** `Ambient` is selected on a first Session
**Then** Encounters remain **forbidden outright** and the guarantee does not override that
**And** the guarantee still produces its emission
**And** a test asserts `Ambient` is never overridden by the first-run directive

**Given** the guarantee interacts with the encounter budget
**When** the first Session's budget is composed
**Then** the guarantee never raises the encounter budget above what intensity allows
**And** the two rules are applied in a documented order rather than whichever runs first

### Story 5.2: Four archetypes with distinct behaviour, and an engine that does not know any names

As a **user playing a second and third Hunt**,
I want the hunt itself to behave differently, not just look different,
So that the difference is something I feel rather than something I am told.

**Acceptance Criteria:**

**Given** the four archetypes
**When** they are enumerated
**Then** there are exactly four: **Observer**, **Stalker**, **Mimic**, **Ambusher**
**And** each has a distinct **verb, pacing, sensory channel and failure state**

**Given** **Observer**
**When** it behaves
**Then** it is slow and tightening
**And** it is **haptic- and glitch-led** — a live camera is a **hazard, not the instrument**
**And** it fails as `NOTICED`, and the user's job is to avoid being seen

**Given** **Stalker**
**When** it behaves
**Then** it closes on the user **under its own power**
**And** it is haptic-led
**And** it fails as `CORNERED`

**Given** **Mimic**
**When** it behaves
**Then** it is audio-in and entity-out
**And** it fails as `MISDIRECTED`, and the user's job is to ask it something

**Given** **Ambusher**
**When** it behaves
**Then** it is fast and glance-and-gone
**And** it is visual-led
**And** it fails as `GONE`

**Given** the engine directory
**When** every file under `src/engine/**` is searched for a Phenomenon name
**Then** **none contains one**
**And** the engine references archetypes only, through a registry
**And** a test asserts that no Phenomenon name string appears anywhere under `src/engine/**`

**Given** a Phenomenon is reassigned to a different Archetype
**When** the change is made
**Then** it requires **content changes only**
**And** **no engine change**
**And** a test asserts the reassignment builds and runs without touching `src/engine/**`

**Given** an archetype's parameters
**When** they are inspected
**Then** they are **driven by JSON parameters** rather than hard-coded behaviour
**And** the archetype runtime is complete enough that content alone selects behaviour

**Given** the encounter resolution differs by archetype
**When** an encounter resolves
**Then** Observer's is haptic and glitch-led
**And** Stalker's is haptic-led
**And** Mimic's is audio-in with found text
**And** Ambusher's is visual-led and short
**And** each produces at least one artifact per Story 3.10

### Story 5.3: A new Phenomenon ships as content, and broken content fails the build

As a **product owner who intends to keep adding phenomena**,
I want a fifth entity to be a content drop,
So that the app can grow without the engine growing a special case for every creature.

**Acceptance Criteria:**

**Given** a new Phenomenon is added
**When** the work required is enumerated
**Then** it requires only: content definitions, assets, a registry entry, and a **content version increment**
**And** it requires **no engine change**

**Given** content definitions exist
**When** the build runs
**Then** they are validated by zod at **build time**
**And** malformed content **fails the build**

**Given** the app launches
**When** content is loaded
**Then** it is validated again at **launch**
**And** malformed content fails loudly at launch rather than reaching a user as a half-broken hunt

**Given** a `ContentVersion` increment
**When** replay parity is considered
**Then** it is the **only** event that invalidates replay parity
**And** it does so **knowingly** — the increment is a deliberate act, not a side effect of editing content

**Given** a content version has shipped
**When** fork labels are inspected
**Then** they are **never renamed** once that content version ships
**And** the rule is asserted by a test rather than by convention

**Given** a content drop introduces an eleventh evidence kind
**When** validation runs
**Then** it **fails the build**
**And** the closed ten-kind vocabulary cannot be extended by content

**Given** a content drop introduces a hunt whose `signatureSlots` has length outside 7–9, or an entry
outside the closed six
**When** validation runs
**Then** it fails the build, naming the offending hunt and entry

**Given** a content drop introduces a per-Hunt evidence alias
**When** validation runs
**Then** the alias must resolve onto the closed ten-kind vocabulary
**And** the `transmission` alias must never map to `word_bank_hit`

**Given** the content pipeline
**When** a story author adds content
**Then** the three content gates are respected: four hunt definitions must exist before the archetype
runtime can pass its own done-when, report copy must exist before the report service can render, and
event-table weights are **tuning** requiring simulation cycles rather than a single writing pass

### Story 5.4: Each Hunt binds differently, and every Hunt is winnable without an encounter

As a **user choosing a Hunt**,
I want each Hunt to be a different kind of night,
So that the choice matters and no Hunt is a reskinned version of another.

**Acceptance Criteria:**

**Given** the **Ghost** Hunt
**When** its binding is inspected
**Then** it is indoor, slow and responsive, audio-led, **10–30 minutes**
**And** its tools are Voice, EMF, EVP and Camera
**And** it has five objectives
**And** it seals on user action with an **automatic close at thirty minutes** and a **sixty-second minimum**

**Given** the **Bigfoot** Hunt
**When** its binding is inspected
**Then** it is outdoor, fast and sudden, visual-led, **15–40 minutes**
**And** its tools are Tracker, Camera and Radar

**Given** the **Shadow Person** Hunt
**When** its binding is inspected
**Then** it is indoor, slow and tightening, **haptic- and glitch-led**, **8–20 minutes**
**And** its tools are Camera, Radar and EMF
**And** its default ambience bed is `silence`, which is a real recorded bed rather than a missing file

**Given** the **Alien** Hunt
**When** its binding is inspected
**Then** it is outdoor under open sky, closing and escalating, visual- and haptic-led, **12–30 minutes**
**And** its tools are Sky, Camera and Radar

**Given** every Hunt's objectives
**When** they are earned
**Then** **every objective is earnable without reaching an Encounter**
**And** a test asserts that a run reaching no Encounter can still complete every objective
**And** no objective's completion condition references an Encounter

**Given** every Hunt's `signatureSlots`
**When** validation runs
**Then** the length is within 7–9 and every entry is drawn from the closed six

**Given** a Hunt's length band
**When** it is used
**Then** it **defaults the Brief's duration selection** per Story 2.6

**Given** the Hunt bindings
**When** a story author or engineer considers changing one
**Then** they are **load-bearing product decisions, not tuning**
**And** changing one is a product change requiring its own review

**Given** the four Hunts
**When** their ambient beds are inspected
**Then** all six ambience beds are distinct and file-backed
**And** no Hunt defaults to a bed that does not exist

### Story 5.5: Shadow Person runs noticing in reverse, and the app never explains it

As a **user who brought a torch and a camera because that is what you do**,
I want the hunt to punish exactly that and to never warn me,
So that the lesson arrives as a consequence I earned rather than a tip I was given.

**Acceptance Criteria:**

**Given** the `noticing` accumulator
**When** it is computed
**Then** it rises **against the user** and reaches `NOTICED` at **1.0**
**And** reaching it **ends the Session early with its own stamp**

**Given** the noticing rate
**When** it accrues
**Then** it accrues from **torch on**, **camera live**, and **movement**
**And** the rates are **held in content**, drawn from the seeded forks so they are reproducible in replay
**And** **standing still is safe** — stillness accrues nothing
**And** the source's `noticingRate` formula is the authority for the rates

**Given** a Session on Shadow Person
**When** emissions occur
**Then** **every emission reads as a response to the user** rather than as ambient activity
**And** the accumulated tension curve **inverts** relative to the other three Hunts
**And** a test asserts the inversion is present rather than merely intended

**Given** the inversion exists
**When** any surface is inspected for an explanation
**Then** there is **no tutorial, hint, tooltip, coach mark or line of copy** connecting stillness
to safety
**And** there is no copy connecting the torch, the camera or movement to danger
**And** **the report stamp is the entire teaching mechanism**
**And** this is recorded as an explicit AD-27 review item, because no lint can catch it

**Given** the user reaches `NOTICED`
**When** the Session ends
**Then** the Evidence collected before the ending is **preserved in full**
**And** the Case still produces a **complete report**
**And** the `NOTICED` stamp is a first-class terminal state rather than an aborted session

**Given** the fairness valve the source describes — the directive pool swapping to a stillness-biased
set after the first `shadow` evidence
**When** this story is considered complete
**Then** its status is recorded honestly: it is **logged as a missing requirement**, not delivered here
**And** this story does not claim to have built it
**And** a placeholder is not substituted — a half-built valve would misrepresent how the hunt teaches

**Given** the Shadow Person Hunt
**When** its default ambience bed is inspected
**Then** it is `silence`
**And** the bed is a real recorded file of dithered near-silence

**Given** the Shadow Person copy
**When** it is reviewed against the blind spots
**Then** the reviewer confirms no sentence connects stillness to safety
**And** the reviewer confirms no sentence explains the mechanic
**And** the reviewer confirms the report stamp is the only place the lesson appears

### Story 5.6: Bigfoot needs the camera live, and the Alien never says a word

As a **user playing the two extremes of the four Hunts**,
I want one Hunt that punishes not looking and one that never speaks,
So that the four Hunts differ in what they ask of me and not only in what they show me.

**Acceptance Criteria:**

**Given** the **Bigfoot** Hunt's Encounter
**When** it resolves
**Then** it can only be rendered if the **Camera surface is live** at the moment of resolution
**And** the Ambusher archetype's Encounter is **suppressed — not replaced and not downgraded** — when
the Camera is not the active tool surface at resolution time
**And** no fallback encounter, placeholder or downgraded variant fires instead

**Given** a suppressed Encounter
**When** the Session continues and the Case is later sealed
**Then** the Session **records the missed window rather than hiding it**
**And** the Case still reports that the window opened
**And** the outcome is `NOT_FRAMED` per Story 3.6

**Given** the other three Hunts
**When** they are played
**Then** each can be experienced without the camera
**And** Bigfoot **cannot** — and that is the design rather than a limitation

**Given** a Bigfoot Session with the camera **denied**
**When** the Encounter would resolve
**Then** the dark-room renderer from Story 4.6 preserves Encounter timing and Evidence output
**And** the Hunt remains completable
**And** the suppression rule applies to *the Camera not being the active surface*, not to the
permission state — the two are distinct and a test covers each

**Given** the **Alien** Phenomenon
**When** any of its emissions is inspected
**Then** **no emission contains a word, a phrase or any found text**
**And** Alien transmissions render as a **pulse glyph row, not as speech**

**Given** words exist in content
**When** their placement is inspected
**Then** they appear **only under the Mimic archetype**, which is the only archetype whose mechanic
is language
**And** no other archetype's content contains a word bank

**Given** the Alien word rule
**When** it is enforced
**Then** it is a **content-validation test over the Hunt's emission bank**
**And** a future content drop **cannot break it silently**
**And** the test fails the build rather than warning

**Given** the `transmission` alias
**When** it resolves
**Then** it **never** resolves to `word_bank_hit`
**And** it maps to `sky_light`
**And** this has its own dedicated build assertion rather than being covered incidentally by the
alias test

**Given** an Alien transmission is committed as Evidence
**When** it renders
**Then** it renders as a pulse glyph row
**And** no surface renders it as speech, a transcript, or a quoted phrase

**Given** the four Hunts' encounter assets
**When** they are reviewed
**Then** no asset shows a creature in focus, centred or facing the lens
**And** the ambiguity guarantee is intact across all four

---

**Epic 5 complete:** 6 stories. FR-3, FR-6, FR-7, FR-8, FR-37, FR-38 and FR-39 covered. Four
archetypes and four Hunts exist, content can add a fifth without touching the engine, the first-run
guarantee is invisible, Shadow Person's inversion is built and deliberately unexplained, and the
Alien's silence is enforced by a build-failing test. One item is honestly **not** delivered: the
stillness-biased directive valve, which is recorded as a missing requirement rather than
half-implemented.

---

## Epic 6: A journal that is yours alone

The user can browse their Cases, Phenomena, Evidence and Field Notes grouped by night, at a 04:00
boundary. They can export their data and delete it entirely, and the deletion screen tells them
plainly what deletion cannot reach. Their Clearance advances through named ranks on sealed Cases,
documented Phenomena and matched Signatures — never on elapsed time, never on events that fired —
and gates only cosmetic case-file themes. Streaks display and never penalize. Nothing in the Journal
is public, social, or comparable to anyone else's.

**FRs covered:** FR-25, FR-26, FR-27, FR-28, FR-29
**UX-DRs covered:** UX-DR38, UX-DR43, UX-DR57 (the reward-surface exclusions)
**Governing invariants:** AD-9, AD-10, AD-12, AD-21, AD-24, AD-27

---

### Story 6.1: The Journal is four segments grouped by night, and a deleted case still leaves a trace

As a **user looking back over months of nights**,
I want my record organized the way I actually remember it — by night — and I want deleting a case to
not quietly delete the evidence I kept,
So that the Journal is a history rather than a file manager.

**Acceptance Criteria:**

**Given** the Field Journal
**When** it renders
**Then** it is segmented into **Overview**, **Phenomena**, **Evidence** and **Cases**
**And** no fifth segment exists

**Given** entries are grouped by night
**When** the boundary is applied
**Then** it is **04:00**
**And** a session running past midnight belongs to **the evening it began**
**And** a test asserts a session at 02:30 groups with the prior evening's entries

**Given** an unsealed case exists
**When** the Journal tab renders
**Then** it is signaled with a **dot** on the Journal tab
**And** no other badge exists anywhere in the product

**Given** a list is loading
**When** the loading state renders
**Then** it uses **skeleton rows, never a spinner**
**And** there is no pull-to-refresh anywhere

**Given** a long list
**When** it is rendered
**Then** it is virtualized
**And** it scrolls at **60 fps on a mid-range Android with a 500-entry fixture**

**Given** a Case is deleted
**When** its Evidence is inspected
**Then** the Evidence is **unlinked rather than deleted**
**And** it keeps rendering with a `NO CASE` chip
**And** a test asserts deletion unlinks and does not cascade

**Given** a Case is deleted
**When** the Journal's Overview counts render
**Then** the counts reflect the deletion honestly
**And** no orphaned entry renders as broken or blank

**Given** the Journal is read by VoiceOver or TalkBack
**When** the user navigates
**Then** the entire Journal is navigable
**And** the four segments are reachable and their headings are announced

**Given** a Field Note entry
**When** it appears in the Journal
**Then** it renders as a Field Note rather than as a Case with a missing report
**And** it is grouped by the same 04:00 boundary

### Story 6.2: An unencountered phenomenon is absent, never locked

As a **user who has not met something yet**,
I want the app to simply not show it,
So that I am never shown a hole shaped like a thing I am being teased with.

**Acceptance Criteria:**

**Given** the Phenomena segment
**When** it renders
**Then** it shows discovered entries, entries seen but unidentified, and per-Phenomenon encounter
and evidence counts

**Given** a Phenomenon has never been encountered
**When** the segment renders
**Then** it is **simply absent**
**And** there are **no locked entries, no silhouettes, and no stated unlock requirements**
**And** a test asserts no locked-state rendering path exists in the Phenomena tree

**Given** the exclusions
**When** the segment is reviewed
**Then** there are **no greyed-out entries, padlocks, keyholes, "unlock" copy, progress ladders or
tier badges** anywhere
**And** this is recorded as an AD-27 review item, because no lint catches a silhouette

**Given** a per-Phenomenon count
**When** it renders
**Then** it is the **user's own historical count**
**And** it is **never a number the user could verify against the world**
**And** no count is compared to any other user's

**Given** an unidentified entry
**When** it renders
**Then** the `?` tile is **never labeled, captioned, pointed at, or the target of a coach mark**
**And** tapping it may open exactly one line: `A signature you have recorded but not identified.
It will match, or it will not.`
**And** its pulse rate is not accelerated, smoothed or made configurable

**Given** the Phenomena segment has nothing to show
**When** its empty state renders
**Then** it carries **exactly one action**
**And** the copy never implies something is waiting to be unlocked

**Given** Phenomena copy
**When** it is authored
**Then** it satisfies FR-33 and the claims lint
**And** it never asserts a Phenomenon exists, was detected, or was confirmed

### Story 6.3: The Journal can never be made public or social

As a **user who does not want an audience**,
I want there to be no way for this to become a feed,
So that the record stays mine because the app has no mechanism to make it otherwise.

**Acceptance Criteria:**

**Given** the entire app
**When** its routes and surfaces are enumerated
**Then** **no feed, friends list, public profile or comparison surface exists anywhere**
**And** a test asserts no such route is registered

**Given** sharing
**When** it occurs
**Then** it is **one-directional**
**And** it **always leaves the app as an image**, per the Share Card in Story 3.11
**And** there is no in-app recipient, follower, comment, like or reaction of any kind

**Given** Journal content
**When** its storage is inspected
**Then** it is **stored on the device only**
**And** it is **never transmitted**

**Given** the app has no backend and no account
**When** the codebase is searched
**Then** there is **no network call of any kind** — no fetch, no upload, no sync, no telemetry egress
**And** the app installs and runs end to end in **airplane mode** from a clean install

**Given** analytics exist
**When** their transport is inspected
**Then** they are **on-device only** with **no network egress and no third-party SDK**
**And** they contain **no coordinates, no free text and no media**
**And** `installRef` is a random, resettable UUID
**And** `analytics_events.session_id` is **deliberately not a foreign key**, so analytics outlive
case deletion

**Given** a Case Report
**When** it renders
**Then** **no coordinates appear on it**
**And** location is a coarse bucket plus a human label

**Given** logs
**When** they are written
**Then** they never contain evidence content, coordinates or free text

**Given** the two free-text columns in the schema
**When** they are audited
**Then** there are **exactly two** and no more
**And** a test asserts the count

### Story 6.4: Export produces something readable, and deletion tells the truth about its limits

As a **user who wants my data out, and who wants to be told the truth about deleting it**,
I want an export I can read and a deletion that does not overpromise,
So that I am never told data is gone when a copy is still out there.

**Acceptance Criteria:**

**Given** the user exports their Journal data
**When** the export completes
**Then** it produces a **user-readable file**
**And** it **includes the entertainment notice**, per the obligation recorded in Story 1.7
**And** it includes the safety content from the About notice

**Given** the user deletes their Journal content
**When** deletion completes
**Then** Journal content is **removed from the device**

**Given** the app has **no backend and no account**
**When** the deletion screen is presented
**Then** it states plainly that deletion is **necessarily local**
**And** it states that deletion **cannot reach data the user has already shared**
**And** it does **not** imply otherwise
**And** a review item asserts this on every release, because it is the sentence most likely to be
softened into a lie by copy editing

**Given** a user has shared Share Cards
**When** the deletion screen is read
**Then** it is clear that those images are outside the app's reach
**And** no wording suggests they will disappear

**Given** deletion runs
**When** it removes media
**Then** it removes the files under `Paths.document/cases/<caseRef>/` as well as the rows
**And** no orphaned media is left on disk
**And** a test asserts the directory is cleaned

**Given** deletion completes
**When** `analytics_events` is inspected
**Then** its rows **survive**, as designed by the deliberately absent foreign key
**And** this is documented rather than surprising — analytics carry no coordinates, no free text and
no media

**Given** the export file
**When** it is inspected
**Then** it satisfies the claims lint
**And** the entertainment line inside it is read from the exported constant

**Given** the user cancels either operation
**When** they back out
**Then** nothing is deleted and nothing is partially exported

### Story 6.5: Clearance advances on what was sealed, not on time spent

As a **user who has done the work**,
I want my rank to reflect what I actually filed,
So that progression means something and cannot be farmed by leaving the app open.

**Acceptance Criteria:**

**Given** the five Clearance ranks
**When** they are enumerated
**Then** they are `FIELD ASSISTANT`, `FIELD ASSISTANT II`, `CASE OFFICER`, `SENIOR CASE OFFICER`
and `ARCHIVIST`

**Given** Clearance advancement
**When** its inputs are computed
**Then** it depends on **sealed Cases, documented Phenomena and matched Signatures** and **nothing else**
**And** it **never** depends on elapsed time
**And** it **never** depends on the number of events that fired
**And** tests assert all three exclusions

**Given** a user leaves the app open for a week without sealing anything
**When** Clearance is recomputed
**Then** it does **not** advance
**And** a test asserts no time-based input exists

**Given** Clearance gates content
**When** the gated set is enumerated
**Then** it gates **only cosmetic case-file themes and journal art**
**And** it **never** gates a tool, an Evidence kind, a Hunt or an intensity level
**And** a test asserts no gameplay surface reads Clearance

**Given** progression is displayed
**When** any surface is inspected
**Then** **no XP value is displayed anywhere in the app**
**And** there is no progress bar toward a rank
**And** there is no numeric threshold shown

**Given** progression inputs are computed
**When** the seal transaction runs
**Then** they are computed **before** the transaction opens
**And** they are **never written afterwards**
**And** the seal transaction is the **sole writer** of `user_progress`

**Given** `user_progress` and `discoveries` need to exist
**When** this story reads them
**Then** they were created by the seal transaction migration, which is where they are written
**And** this story reads them and does not create them

**Given** the Profile screen
**When** it renders
**Then** it shows **no stat row**
**And** its identity block shows only two values: `CASES SEALED` and `PHENOMENA DOCUMENTED`

**Given** a rank advances
**When** it is presented
**Then** it is presented without celebration copy implying the user is now capable of more
**And** no copy implies a higher rank makes a hunt more likely to produce something

**Given** a user with zero sealed Cases
**When** Profile renders
**Then** the lowest rank is shown
**And** nothing implies they are being held back

### Story 6.6: A streak displays and a missed night costs nothing

As a **user who skipped a week**,
I want to come back without a penalty,
So that the app never makes absence into a debt.

**Acceptance Criteria:**

**Given** a streak exists
**When** it is displayed
**Then** it is **displayed but never enforced**
**And** missing a night has **no penalty, no loss and no notification**

**Given** the user misses a night
**When** the app next opens
**Then** **no notification is sent** about the missed night
**And** no copy references the gap
**And** no streak value is reduced as a consequence
**And** a test asserts no notification path exists for a missed night

**Given** the user returns after a long absence
**When** Home renders
**Then** nothing implies they fell behind
**And** no catch-up mechanic, no "restore your streak" offer and no apology copy exists

**Given** badges
**When** they are awarded
**Then** they appear as **case stamps within the Journal**
**And** they are **never a trophy wall** or a separate reward screen

**Given** the reward surfaces
**When** they are reviewed against the anti-pattern exclusions
**Then** there is **no trophy wall, no progress bar toward anything, no streak counter as a score
and no leaderboard**
**And** there is **no comparison between users** anywhere

**Given** a badge is awarded
**When** it renders
**Then** it is written by the seal transaction as part of `badge_awards`
**And** no badge is awarded outside the seal transaction

**Given** a streak's copy
**When** it is authored
**Then** it never congratulates the user for returning
**And** it never implies the streak is at risk
**And** it satisfies FR-33 and the claims lint

### Story 6.7: A quiet night is counted as a night, not as a failure

As a **user who had four quiet nights in a row**,
I want the Journal to record them as real entries,
So that the record of my nights is honest rather than only showing the ones that produced something.

**Acceptance Criteria:**

**Given** the Journal can show the four no-event outcomes
**When** a user has recorded some of each
**Then** the Journal shows them **how many of each they have recorded**
**And** the count is presented as a record rather than as a score

**Given** a `QUIET_NIGHT` is recorded
**When** the Journal renders it
**Then** it is treated **the same as any other night** — no greyed styling, no diminished treatment,
no collapsed row

**Given** a Field Note is recorded
**When** the Journal renders it
**Then** it is a first-class entry
**And** it is never presented as an incomplete case

**Given** the Journal's Overview counts
**When** they render
**Then** they count **things that happened or elapsed time**
**And** no value is a percentage, a fraction or a unit-bearing number
**And** the activity band remains `LOW`/`MODERATE`/`HIGH`

**Given** a case is `EXPLAINED`
**When** it renders in the Journal
**Then** it earns **no celebratory styling** — the status word is the only difference
**And** this is consistent with the Seal component's rule in Story 1.3

**Given** a nothing-case
**When** it renders in the Journal
**Then** it is **one of the better-looking entries rather than the emptiest-looking one**
**And** it is not hidden, filtered or collapsed by default

**Given** the Journal's numbers
**When** they are audited
**Then** every one is a count of something that happened or elapsed time
**And** none is verifiable against the world
**And** none is compared to another user's

---

**Epic 6 complete:** 7 stories. FR-25, FR-26, FR-27, FR-28 and FR-29 covered. The Journal is
browsable by night, unencountered phenomena are absent rather than locked, deleted cases leave their
evidence intact, sharing leaves the app as an image, deletion states its own limits, Clearance
advances only on sealed work, streaks never penalize, and quiet nights count as nights.

---

## Coverage Summary

**Functional requirements:** 39 of 39 mapped across 6 epics. Every FR appears in exactly one epic's
`FRs covered` line and in the FR Coverage Map above.

**Non-functional requirements:** all 20 addressed. NFR-1…NFR-3 and NFR-5 land in Epic 2 (rendering,
startup, list, battery, durability). NFR-4 lands in Epic 2 Story 2.4. NFR-6 lands in Epic 2 Story 2.1
and Epic 5 Story 5.3. NFR-7 lands in Epic 1 Story 1.1 and Epic 2 Story 2.1. NFR-8 and NFR-9 land in
Epic 6 Story 6.3. NFR-10 and NFR-11 land across Epic 1 Story 1.2, Epic 3 Story 3.7, Epic 4 Story 4.9
and Epic 6 Story 6.1. NFR-12 lands in Epic 2 Story 2.3 and Epic 4 Story 4.9. NFR-13 lands in Epic 4
Story 4.1. NFR-14 and NFR-15 land in Epic 2 Story 2.5 and Epic 5 Story 5.3. NFR-16 and NFR-17 land in
Epic 1 Story 1.1. NFR-18 lands in Epic 1 Story 1.5. NFR-19 lands in Epic 4 Story 4.10. NFR-20 is a
release-gate item recorded in Epic 1 Story 1.5.

**Additional requirements:** the greenfield scaffold (no starter template) is Epic 1 Story 1.1. The
four-layer import table, engine purity, the presenter bottleneck, the two table families, the
persistence rule and precedence, SQL containment, the model conventions and the route tree land in
Epic 1 Story 1.1, Epic 2 Stories 2.1, 2.3, 2.5 and 2.8, and Epic 1 Story 1.8. The report-first build
order is honoured by Epic 3 preceding Epic 4. The three dated content gates are recorded in Epic 5
Story 5.3. The `signatureSlots` content field is adopted in Epic 3 Story 3.2 and validated in Epic 5
Story 5.3. Build, CI, migration and test obligations land in Epic 1 Story 1.1 and Epic 2 Story 2.5.

**UX design requirements:** UX-DR1–UX-DR25, UX-DR38 and UX-DR52–UX-DR58 land in Epic 1.
UX-DR26–UX-DR32, UX-DR44–UX-DR51 and UX-DR56 land in Epic 2 (degradation modes and interaction
primitives) and Epic 4 (the seven surfaces). UX-DR33–UX-DR37 and UX-DR39–UX-DR43 land in Epic 3.
UX-DR40 and UX-DR41 are extended for the hunt-specific outcomes in Epic 5. UX-DR38, UX-DR43 and
UX-DR57 land in Epic 6. **Every UX-DR is covered by at least one story.**

**Two items deliberately not delivered, and recorded as such rather than quietly built:**
the stillness-biased directive valve for the Shadow Person hunt (recorded in Epic 5 Story 5.5 as a
missing requirement, not a conflict), and the tool row's form factor past the 140% Dynamic Type cap
(recorded in Epic 4 Story 4.1 as an open problem to solve rather than a cap to apply).
