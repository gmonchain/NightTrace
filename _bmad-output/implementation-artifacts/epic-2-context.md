# Epic 2 Context: Enter the field

<!-- Generated from planning artifacts. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Give the user a field to enter: pick a Hunt, complete a deliberate Brief (calibrate the device, name the place, set an intention, choose an intensity), and hold to cross into a Session. The Session is a deterministic, seeded simulation that schedules emissions nobody can learn from, reads the device's sensors as generation material, and degrades gracefully when any is denied or absent; the user leaves deliberately or resumes an interrupted night. This epic lands the engine core, the sensor layer with its six-channel status model, the Brief, intensity, the immersive Session shell with its single presenter, Home, and Field Note mode — and it stands alone: a full Session runs with no tools, no report and no journal.

## Stories

- Story 2.1: The same seed always produces the same session
- Story 2.2: Emissions can be replayed but cannot be learned
- Story 2.3: The session advances through a phase ladder while a hidden tension value drives pacing
- Story 2.4: Every sensor channel reports its own state and none of them can block a session
- Story 2.5: The database persists what matters and can recompute what does not
- Story 2.6: The Brief prepares the user and the place before anything begins
- Story 2.7: Intensity is chosen once and then locked, and its promise is literally true
- Story 2.8: The session presenter is the single node that turns emissions into the world
- Story 2.9: Home starts a night, resumes one, and reads the day's anomaly
- Story 2.10: A Field Note is a standing observation that produces no case

## Requirements & Constraints

- **Determinism.** A session is fully reconstructible from seed + hunt + content version + tick digest[]; the seed is persisted verbatim before the session begins and never recomputed. Replay is an audit property with no user-facing feature.
- **Unlearnable scheduling.** Silence is always a valid draw (every event table's empty weight is > 0); the interval draw is memoryless, so a long quiet stretch never raises the chance of an event; cooldown and anti-repeat live in the engine, not content. Seeded 20-minute sweep targets: median-to-90th-percentile interval ratio ≥ 3.0, longest silence in the 200–260 s band at the median, and a > 5-minute silence in 22–35% of sessions. Directives are object-less verbs, ≤ 6 per session, ≥ 3 minutes apart, and scheduled — never on demand.
- **Hidden state.** Tension (and Attunement, rarity, seed) is never displayed, announced, or exposed to assistive technology; tension influences but never guarantees an encounter.
- **Sensors as material.** Magnetometer, accelerometer, gyroscope, motion, ambient light, location, mic level and camera state feed generation; each channel reports exactly one of ready / not-yet-requested / denied (with whether it can be asked again) / hardware-unavailable / unsupported-platform / error. No single denial blocks a session, nags, or repeats a prompt. Mic denied removes EVP from the carousel; location denied runs the hunt uncharted; magnetometer absent infers from motion and clock. The app is playable end to end with zero permissions, requested just in time.
- **Brief & ritual.** Calibration, place name and intention are required before entry; the intention (Ask / Watch(default) / Wait) biases likelihood only; duration is 10/20/30/45 or open-ended, defaulting to the Hunt's length band; entry is a ~800 ms hold whose label turns at the 400 ms mark; early release leaves the Brief intact and abandoning before the hold creates no session row. There is exactly one way out of a session — `Leave the Field`, hold-gated — and leaving seals the case.
- **Intensity.** Ambient / Present(default) / Intense / Ritual, chosen before and locked for the case; glitch visuals only at Intense and Ritual; Ambient forbids encounters outright; intensity scales exactly four coefficients (emission rate, encounter budget 0/1/2/2, content ceiling, sting gain) and never drops the silence floor below its minimum.
- **Performance, durability, gates.** No per-sample React re-render (sensor rates reach Reanimated shared values and the digest); cold start to Home under 2 s; long lists virtualized at 60 fps; a session survives crash or force-quit from its own 60-second checkpoint with no crash reporter and no upload. Engine purity, migration idempotency and content validation are CI-blocking. Store floors: iOS 16.4+ (iOS 26 SDK), Android compile/target SDK 36.

## Technical Decisions

- **Functional core / imperative shell.** `src/engine/**` is `(seed, tick input) → Emission[]`; everything else is the shell. A four-layer import table (Core → Input adaptation → Content → Shell) is an ESLint rule, arrows only downward.
- **One presenter.** Emissions are the engine's only output; exactly one node, `useSessionPresenter`, maps them to haptics, audio, store writes, evidence commits and UI. Nothing else commits a capture or reads an Emission.
- **Randomness from labelled substreams.** `fork(label)` over the closed seven-label set (`rng.session`, `rng.events`, `rng.radar`, `rng.words`, `rng.encounters`, `rng.report`, `rng.signals`); content-driven behaviour uses `fork('rng.content.' + definitionId)`. PRNG is a dependency-free xmur3 → sfc32; fork labels are part of the replay key and never renamed after a content version ships.
- **Sensor isolation.** `src/sensors/**` is the only importer of expo-sensors / expo-location / mic capture; the engine sees only a quantized, tick-rate `SensorDigest`.
- **Two table families.** Catalogue tables rebuild from bundled JSON (delete + batch insert, one exclusive transaction); user tables are never touched by a rebuild; foreign keys point only within the user family. Content is zod-validated at build and boot.
- **Persistence rule.** Anything recomputable from (seed + content version + tick log) is never stored; anything the user would hate to lose is in SQLite before the screen closes. Sessions checkpoint one row every 60 s and on backgrounding; `services/Clock` is the single producer of session time.
- **Model, storage & settings conventions.** Branded ids; readonly fields; discriminated unions tagged `kind` with an exhaustive switch and `default: never`; absence spelled `null`; no `any` or `as` outside mappers. SQL lives only in `src/db/repositories/*` and routes hold none; settings live in `expo-sqlite/kv-store` behind a typed `db/kv.ts` (no settings table).
- **Route tree is the IA.** Exactly four tabs (Home · Investigate · Field Journal · Profile); tab bar hidden during Brief and Session; tools push above the session one full-screen surface at a time; the Case Report is a destination, not a modal; sheets never stack two deep except Triage over a session.
- **Closed taxonomies.** Engine phases closed at five (QUIET → SIGNALS → ACTIVITY → ENCOUNTER_WINDOW → RESOLUTION) plus a terminal ENDED that is not a phase; a separate four-word user-facing ladder (QUIET → LISTENING → ACTIVE → CONTACT); four named no-event outcomes; six failure states, all first-class terminal evidence rather than aborted sessions.
- **Backgrounding is a hard stop** — channels off, camera inactive, engine paused, elapsed time frozen, plus a two-second no-event grace period on foreground; a would-fire encounter is suppressed entirely and does not count against the session's allowance.
- **Stack.** Expo SDK 57 (`expo@57.0.26`), RN 0.86.3, React 19.2.3, Node ≥ 22.13, expo-router, zustand, expo-sqlite, Reanimated; two Vitest projects (engine on the node environment, ui on vitest-expo).

## UX & Interaction Patterns

- **The Brief is a ritual.** Calibration reports a quiet or noisy baseline (neither a judgment); interrupted or magnetometer-less calibration completes on an inferred baseline and says so. The hold is the threshold gesture; the safelight fill is the product's only progress indicator — it indicates a gesture, never a quantity.
- **The session shell** is immersive: the rail is a single-line narration strip carrying one sentence at a time, and the field view is concentric rings breathing on a 5 s cycle with a state word beneath. Haptics escalate with proximity, continuous vibration is forbidden, and a haptic is never the only signal for anything. Silence is a first-class interaction — after a Voice ask the app stays silent for ≥ 12 s with no spinner or countdown; there is no pull-to-refresh anywhere.
- **Locked intensity** mid-session renders every row locked with the "steering what you find" footer line.
- **Home** answers "what is tonight" in one screen: Clearance, a featured Hunt, the other Hunts, a resume affordance for an interrupted session, recent evidence, and the daily Anomaly — a single authored, seeded atmospheric line that is never a directive, never carries a guaranteed encounter, and is not shareable. No tool grid, no equipment navigation.
- **Field Note** is its own mode with its own framing copy (not a Hunt with a shorter timer): ~3 minutes, closes on its own, writes a Journal entry (time, place band, one observed line) with no Case and no report; picking the device up ends it early and records it as short rather than discarding it.
- **Every denial degrades to a working first-class alternative**, never a broken screen: mic → EVP absent and Voice in archive mode; camera → dark-room renderer with identical timing and output; location → uncharted; magnetometer absent → inferred EMF.
- **Accessibility floor.** Dynamic Type to 200% (intensity rail and tool row capped at 140%); Reduce Motion cross-fades transitions, freezes the sweep and disables glitch (re-routed to audio); portrait-locked except Camera and Sky; no target below 44pt; nothing conveyed by colour alone.

## Cross-Story Dependencies

- **Epic 2 stands alone** — a full Session runs with no tools, no report and no journal.
- **Internal order.** 2.1 → 2.2 → 2.3 are the engine core; 2.4 (sensor hub) and 2.5 (persistence) feed it; 2.6 (Brief) and 2.7 (intensity) gate entry; 2.8 (the presenter) turns emissions into the world; 2.9 (Home) and 2.10 (Field Note) are the entry surfaces.
- **Downstream.** Epic 3 needs Epic 2's session and evidence model; Epic 4 needs its session shell; Epic 5 needs its archetype runtime (both Epic 2 and Epic 5 touch `src/engine/**` and `src/data/**` — Epic 2 builds the runtime and one Hunt end to end, Epic 5 completes the remaining archetypes and Hunts); Epic 6 needs Epic 3's sealed cases.
- **Recorded for a later epic:** nothing on Home may ever mark a first-run session as different (the first-run guarantee arrives in a later epic and must stay undetectable).
