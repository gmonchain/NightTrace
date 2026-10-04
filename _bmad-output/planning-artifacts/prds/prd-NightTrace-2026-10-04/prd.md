---
title: NightTrace — Product Requirements Document
status: draft
created: 2026-10-04
updated: 2026-10-04
---

# PRD: NightTrace

*A paranormal field journal — working title, confirm.*

## 0. Document Purpose

This PRD specifies **NightTrace v1**, a free, offline mobile app that turns a phone into a paranormal field kit and produces a shareable **Case Report** of the user's night. It is written for the builder, for any designer or engineer joining the project, and for downstream workflows (`bmad-ux`, `bmad-architecture`, `bmad-create-epics-and-stories`).

**Structure.** §4 groups features; functional requirements are numbered globally (FR-1 … FR-N) so tickets can cite them stably even if features are reorganized. §3 Glossary is normative — every downstream artifact must use these terms exactly, and introducing a synonym anywhere is a defect. Inline `[ASSUMPTION]` tags mark inferences awaiting confirmation and are indexed in §9. Inline `[NON-GOAL for MVP]` tags mark deferred scope within a feature; §5 holds the broader statements.

**Source documents.** This PRD supersedes and consolidates four inputs, all of which remain on disk:

| Input | Location | Role |
|---|---|---|
| Owner's source brief (39 sections) | `paranormal_cryptid_hunting_master_prompt.md` | Original vision and constraints |
| Product spec + game design | `_bmad-output/brainstorming/…/01-product-and-game-design.md` | Sections A–F, J, K, L, N, O, P |
| Implementation contract | `_bmad-output/brainstorming/…/02-engineering-and-delivery.md` | Sections G, H, I, M, Q |
| Brainstorm intent + decision log | `_bmad-output/brainstorming/…/brainstorm-intent.md`, `.memlog.md` | Chosen decisions |

**Where the sources disagree, this PRD is authoritative.** The design brainstorm silently overrode roughly fourteen explicit demands from the owner's brief; the owner ratified those overrides in session on 2026-10-04. Every ratified override is marked `[OVERRIDE]` inline with the original demand named, so a reader can see what changed and why rather than discovering it later. Implementation-level detail from the engineering contract — module layout, SQLite schema, package versions, test strategy — is **not** reproduced here; it lives in `addendum.md` alongside rejected-alternative rationale and tuning parameter detail.

---

## 1. Vision

NightTrace is a paranormal field journal that turns an ordinary night — a commute, an attic, a backyard, a walk — into a case worth investigating. The user opens a case, walks into a place, and works it with instruments. At the end, the app hands them a **Case Report**: a story they took part in, that nobody can disprove.

**The phone is not a detector. It is a case file that writes itself.** This distinction is the product. Detection implies proof, and proof is falsifiable; investigation implies process, and process is not. Sensors — microphone, camera, magnetometer, GPS, clock, motion — are *material*, never measurement. Nothing the app shows is proof of anything. That is the point.

The deliverable is not a reading, it is a **receipt**: a Case Report and a Share Card the user wants to send to someone. Every tool in the app exists to generate material for that report. This is the growth engine — tools generate, the report packages, sharing recruits, new investigators generate more.

**The app must be good when nothing happens.** Most nights, nothing will. Absence is a designed outcome, not a failure. A session that records nothing still produces a complete, sealed Case Report, and the app says so plainly: *"Nothing was recorded tonight. That is a result."* An app that only pays off on a hit trains the user to expect hits, and an expected hit is not a mystery — it is a slot machine. NightTrace would rather be quiet and believable than loud and disposable.

**Why now.** The "ghost detector" app category trains users in thirty seconds to see through it, and they delete it. The category's failure is not technical — it is a failure of honesty: it makes claims it cannot support, so its moments of pleasure are unshareable, because sharing would expose the claim. A procedurally-generated, explicitly-framed simulation sidesteps the entire failure mode. Cheap on-device sensors, deterministic seeded generation, and a phone that is already a camera, a microphone, and a flashlight make this buildable by a small team with no backend, no cloud AI, and no running costs.

**The emotional arc.** A Session is a sequence, not a feature set, and the sequence is the product:

> **curiosity → tension → anticipation → uncertainty → surprise → collection → progression → a shareable moment**

The first five beats belong to one night; the last three belong to the weeks after it. Every requirement in this document is downstream of that arc: FR-2's silence floors exist to build *tension* before *surprise*, FR-19's Signature converging without resolving is *uncertainty* held open on purpose, and FR-24 exists because *a shareable moment* is the beat that recruits the next investigator. When a feature is proposed and it is not clear which beat it serves, that is the signal it does not belong.

**The product test.** Three questions, applied to every feature before it is built — from the owner's brief and retained verbatim because nothing in this document replaces them:

1. **Does this feature make the user feel more like they are conducting a mysterious investigation?** If not, remove it.
2. **Does this create a reason to come back tomorrow?**
3. **Could this produce a moment worth recording or sharing?**

The product must balance all three. The first is an authorship test and it is the one that gets lost: a feature can move a metric and still fail it. See §7's counter-metrics, which encode the same instinct numerically.

---

## 2. Target User

### 2.1 Jobs To Be Done

- **"Make tonight different."** The functional job: convert a mundane evening into an event with a beginning, a middle, and an end. The user is not looking for information; they are looking for an experience they can point at afterward.
- **"Give me a story I can tell."** The social job. The user wants an artifact — a Case Report, a Share Card — that carries a mystery to a friend without requiring the user to perform or embellish it. The artifact does the telling.
- **"Let me feel something without lying to me."** The emotional job. The user wants genuine suspense — the hair standing up — and wants to be able to enjoy it *because* the app never pretends it is real. This is the job that makes the product sustainable: the user can relax into the fiction precisely because the app is honest about being fiction.
- **"Give me somewhere to put it."** The collection job. A journal that accumulates the user's own nights — the evidence they logged, the cases they sealed — so that playing becomes a record of places and evenings, not a score.
- **Builder's job (during v1):** ship a complete, self-contained, honest product that proves the loop works and can be extended with content alone.

### 2.2 Non-Users (v1)

- **Users seeking a real detector.** Anyone hoping for a device that finds ghosts. The app will not satisfy this and must not imply it can. This is a targeting boundary, not a marketing stance: attempts to satisfy this user destroy the product for everyone else.
- **Users under 12.** Category rating is 12+/Teen. The app is atmospheric and can startle; it is not a children's toy.
- **Users wanting social features.** No feed, no friends list, no profiles, no comparison. Sharing is one-directional and leaves the app.
- **Users on iPad.** iPad is explicitly not a target for MVP — phone-first, portrait-locked except the Camera and Sky tools.
- **Users wanting a multi-hour RPG.** Progression is deliberately light; there is no XP grind, no equipment economy, no stat sheet.

### 2.3 Key User Journeys

Four journeys carry the product's core value. They are written as scenes because the beats — *what the user sees, in what order, and what tells them it worked* — are requirements, not narrative garnish.

- **UJ-1. Mary's first night is quiet, and that is fine.**
  - **Persona + context:** Mary, 34, moved into a 1920s house three months ago, mildly curious about its creaks, has never used an app like this. It is 10:40pm on a Tuesday. She is in the hallway outside the spare room.
  - **Entry state:** Fresh install. Completed the four onboarding screens earlier that evening, accepted the entertainment notice, granted no permissions yet.
  - **Path:** Opens the app → Home shows the night's **Daily Anomaly** as a single line of text and one **Hunt**: *Ghost Investigation · Indoor*. Taps START → the **Hunt Brief** asks her to calibrate (she holds the phone still for a moment), to name the place (*"Spare room"*), and to set an intention; she long-presses to enter → the **Session** opens. She taps **Sweep** for ten seconds; the phone asks for magnetometer permission *now*, explains why, and she allows it. The field dial stirs once, briefly, and settles. She taps **Ask**, holds the button, and says *"Is anyone here?"* — the band line flickers, silence holds for a long beat, and nothing comes back. She logs the spot anyway.
  - **Climax:** Somewhere past the fifth minute something happens — brief and ambiguous: a shape at the edge of the camera frame for perhaps two frames, then gone. She is not sure she saw it, which is exactly the intended effect, and it is guaranteed by FR-3 because this is her first case. She closes the case after eleven minutes. The **Case Report** renders in full: `CASE NT-003`, duration, five evidence items, `ENCOUNTERS 01`, and the status **INCONCLUSIVE** — the encounter happened, but her evidence never converged far enough to clear the threshold, and FR-21 requires convergence *and* an encounter for `UNEXPLAINED`. Beneath the ledger, the Negative Space block reads: *"Nothing conclusive was recorded tonight. That is a result."* She screenshots it.
  - **Resolution:** The case is `SEALED` and filed in her **Field Journal**. Home now shows the Anomaly of the next night. Her Clearance has not moved — it advances on sealed Cases and documented Phenomena, and one inconclusive case alone will not.
  - **Edge case:** If she denies the magnetometer, Sweep still runs — the field dial reports `INFERRED` from motion and clock instead, and the session never blocks or nags. The report is identical in shape.

- **UJ-2. Devon gets a share.**
  - **Persona + context:** Devon, 22, has sealed six cases and is chasing a creature he has not matched. He is walking a rail trail at 11:20pm with earbuds in.
  - **Entry state:** Returning user, 20 minutes into a **Bigfoot** hunt, outdoors, GPS and motion active, magnetometer denied.
  - **Path:** The **Tracker** shows a bearing of `NE · NEAR` and a proximity ladder sitting at `WARM`. He walks. The ladder reaches `CLOSE` and the phone pulses once, low. He raises the **Camera**; the frame catches a shape at the edge — two frames of a silhouette at 48% alpha, never centered, never in focus — and he captures. He marks a trail. The session reaches `ENCOUNTER_WINDOW` and stays there for ninety seconds before closing empty.
  - **Climax:** The Case Report's signature strip fills six of nine slots and reads `PARTIAL MATCH · UNIDENTIFIED`. Status: **UNEXPLAINED**. He taps **Share Card** and sends it to a group chat without editing anything — the card already carries the frame, the status stamp, and the line *"An investigation experience. Not a measurement."*
  - **Resolution:** Two people in the chat ask what app it is. Devon's **Signature Archive** now shows that slot as `?` rather than empty — he has seen it and not identified it, which is its own hook.
  - **Edge case:** If he had lost GPS, the hunt continues **uncharted** — bearing only, no place seed, seed derives from time and sensor fingerprint. The report notes the case was recorded without a location.

- **UJ-3. Priya takes a three-minute break.**
  - **Persona + context:** Priya, 41, has fifteen minutes between meetings and is sitting on a park bench at dusk. She is not going anywhere.
  - **Entry state:** Returning user, mid-day, no intention of a full investigation.
  - **Path:** Opens Investigate and chooses **Field Note** instead of a hunt. The screen says she will hold still for about three minutes. She sets the phone face-down on the bench. The app runs a single, minimal pass — mostly silence, one faint signal at 1:04 that she does not see because she is not looking at it.
  - **Climax:** At three minutes the Field Note closes on its own and writes a short entry into her Journal: time, place band, one line of observed material. No Case Report — a Field Note is not a case and the app does not pretend it was.
  - **Resolution:** The entry sits in the Journal beside her sealed cases. She reads the line on the train home.
  - **Edge case:** If she picks the phone up mid-note, the note ends early and records itself as short, rather than discarding what it captured.

- **UJ-4. Sam cannot find anything, and the app is honest about it.**
  - **Persona + context:** Sam, 29, has sealed four cases and has never seen an encounter. He is starting to suspect the app is broken.
  - **Entry state:** Fourth session, indoors, `Present` intensity, 22 minutes in, no encounter.
  - **Path:** The session state hairline has been sitting at `ACTIVE` for some minutes, then moves to `CONTACT` — no encounter, but the record is moving. He keeps working the room. At minute 26 the window opens and closes empty.
  - **Climax:** The Case Report is complete and the status is **EXPLAINED** — three of his evidence items were triaged as ordinary (a car passing, his own footsteps, building noise) during the triage ritual, and the explained ratio crossed the threshold. The report does not apologize and does not tease. It shows him his four cases in the Journal side by side, and only one of them is `UNEXPLAINED`.
  - **Resolution:** Sam understands the model: encounters are uncommon by design, and a case that resolves to *explained* is a legitimate, satisfying outcome rather than a failure. He is not being strung along; he is being told the truth about a simulation.
  - **Edge case:** If a user reports the app broken, the Journal's Onboarding-to-About path carries a plain statement of the encounter rate band, so the expectation is set in-product rather than in a support reply.

---

## 3. Glossary

Downstream workflows must use these terms exactly. FRs, UJs, and SMs use Glossary terms verbatim; a synonym introduced anywhere in the PRD is a discipline violation.

- **Case** — One sealed unit of investigation work, identified by a case reference (`NT-003`). A Case is the container for a Session's output: its Evidence, its Encounters, its report. Cases are what the Journal archives and what the user counts. Cardinality: one Session produces at most one Case; a Field Note produces a Journal entry and no Case.
- **Session** — A single continuous run of the simulation, from the moment the user enters a Hunt to the moment the report is sealed. A Session has a Seed, a phase progression, and a bounded duration. `[OVERRIDE]` The engineering contract's type is `Session`; the owner's brief called this a `HuntSession`.
- **Hunt** — The authored, selectable configuration the user chooses before a Session: Ghost, Bigfoot, Shadow Person, or Alien. A Hunt binds a **Phenomenon** to an environment, a tool set, a pacing profile, and a set of objectives. Hunts are content; the engine does not know their names.
- **Phenomenon** — The class of thing under investigation, named in the fiction: Ghost, Bigfoot, Shadow Person, Alien. Four in v1. Distinct from **Archetype**: a Phenomenon is what the user believes they are hunting; an Archetype is how the simulation behaves.
- **Archetype** — One of four behavioral parameter sets the engine runs: **Observer**, **Stalker**, **Mimic**, **Ambusher**. An Archetype carries the verb and the failure mode. Archetypes are the engine's only vocabulary; new Phenomena are new parameter sets, not new code.
- **Verb** — The single thing a user must *do* to work a Hunt, expressed as an imperative with no object: *Ask it something.* (Mimic), *Don't look away.* (Ambusher), *Avoid being seen.* (Observer), *Stay ahead of it.* (Stalker). Verbs are never told to the user directly; they are learned from the Hunt's behavior.
- **Failure state** — The Hunt-specific way a Session can go wrong, named in the fiction: `MISDIRECTED`, `GONE`, `NOTICED`, `CORNERED`, `INTERFERENCE`, `NOT_ALIGNED`. A Failure state is an *outcome*, not a loss; a Case that reaches one still produces a complete Case Report. See FR-6, FR-35.
- **No-event outcome** — One of the four named ways a Session records that nothing was found: `QUIET_NIGHT`, `WINDOW_CLOSED_EMPTY`, `FALSE_POSITIVE`, `NOT_FRAMED`. Distinct from a **Failure state**, which is a defined ending, and from an empty state, which is an absence of design. See FR-35.
- **Tool surface** — One of seven places in a live Session where a user works: EMF, Radar, Voice, EVP, Camera, Tracker, Sky. `[OVERRIDE]` The owner's brief specified 23 named tools with a dedicated Equipment tab.
- **Evidence** — A typed atom captured during a Session, carrying a kind, a **certainty band**, a channel, the tool that produced it, the phase it occurred in, and its source. Evidence is a souvenir, not a datum.
- **Certainty band** — The three-level qualitative strength of Evidence: `AMBIGUOUS`, `SUGGESTIVE`, `COMPELLING`. Never numeric.
- **Triage** — The post-Session ritual in which the user reviews each Evidence item and marks it explained or unexplained. Triage is what makes the report feel earned.
- **Signature** — The pattern a Session's Evidence converges toward, displayed as a strip of 7–9 slots and matched against the **Signature Archive**. A Signature is `MATCHED`, `PARTIAL MATCH · UNIDENTIFIED`, or `NO MATCH ON FILE`.
- **Encounter** — The rare, brief, ambiguous appearance of the Phenomenon during a Session. An Encounter may not occur. When it does, it is short, peripheral, and never centered or in focus.
- **Case Report** — The hero screen. The sealed, permanent record of a Case, containing the masthead, status seal, stat row, signature strip, narrative account, souvenir reel, evidence ledger, negative space, investigator note, and conditions footer.
- **Share Card** — The single, watermark-free image the user shares from a Case Report. Bearing no URL, no QR code, no app-store badge, and no attribution.
- **Field Journal** — The permanent, private, on-device archive of the user's Cases, Phenomena, Evidence, and Field Notes. Segmented as Overview · Phenomena · Evidence · Cases.
- **Investigator Clearance** — The user's progression rank, advancing on sealed Cases, documented Phenomena, and matched Signatures. `[OVERRIDE]` Replaces the owner's brief XP/investigator-level system.
- **Field Note** — A standalone, roughly three-minute standing observation. Not a truncated investigation and not a Case. `[OVERRIDE]` Replaces the owner's brief "2-minute casual session."
- **Seed** — The per-Session value composed from place, time, conditions, and a device sensor fingerprint. The Seed makes a Session unrepeatable and is the replay key for the whole simulation.
- **Emission** — A single unit of output the engine produces on a tick: a signal, a reading, a silence, an Encounter. The engine emits; the presenter renders. Emissions are the only interface between simulation and presentation.
- **Silence** — A deliberate interval in which the engine emits nothing. Silence is a designed feature and is weighted to be more likely than any event.
- **Intensity** — The user's pre-Session choice of signal density: `Ambient`, `Present` (default), `Intense`, `Ritual`. Intensity changes how much the app emits; it never guarantees an Encounter. Intensity is fixed once a Case begins.
- **Anomaly** — The single line of atmospheric, non-falsifiable text on Home that rotates daily and gives the user a reason to open the app on a night they do not hunt.
- **Activity band** — The Case Report's statement of a case's overall signal density, expressed as `LOW`, `MODERATE`, or `HIGH`. Qualitative by design; never a number. See FR-22.
- **Anomaly Index** — `[RETIRED]` The percentage formerly specified for the Case Report. **Removed by owner decision on 2026-10-04** after review showed that a percentage carries a denominator and therefore reads as a measurement claim, which the product's no-verifiable-numbers law forbids and its #1 risk punishes. The term appears in this document only as a warning that it must not reappear. See §8 OQ-1, now closed.

---

## 4. Features

### 4.1 The Investigation Engine (Session Generation)

**Description:** The engine is the product's central system and its most constrained. It runs the simulation for one Session, drawing from a Seed, and it exists to **protect uncertainty** rather than spend it — the scarce resource it manages is the user's not-knowing. The engine's contract in one line: *decide how long to say nothing, and then make the first thing said feel inevitable and unprovable.* Realizes UJ-1, UJ-4.

Every Session runs through five phases — `QUIET`, `SIGNALS`, `ACTIVITY`, `ENCOUNTER_WINDOW`, `RESOLUTION` — with a mandated silence floor at the start and a budgeted total emission count. The Session's visible state progresses through four words (`QUIET` → `LISTENING` → `ACTIVE` → `CONTACT`) rendered as a hairline, never a number. Not every Session reaches `ENCOUNTER_WINDOW`, and not every window produces an Encounter.

The engine is honest about its own construction, with exactly one bounded exception: the **First-Run Directive**, which guarantees a first-time user reaches a real Encounter. It applies only while the user has zero sealed Cases, mandates at least five minutes of genuine silence before anything happens, and is deleted from the code path the moment the user seals their first Case. This exists because a first session that produced nothing would teach the user the app does nothing.

**Functional Requirements:**

#### FR-1: Seeded Session generation

The system can generate a complete Session from a Seed composed of the Hunt, the user's location if available, the start time, environmental conditions, and a one-shot device sensor fingerprint, such that the same Seed reproduces the same Session exactly. Realizes UJ-1, UJ-2.

**Consequences (testable):**
- The Seed is composed and persisted verbatim on the Session record before the Session begins, and is never recomputed.
- Given a Session's Seed, Hunt, content version, **and its recorded tick digest**, the simulation replays to the identical emission sequence. The digest is required: the Seed alone is a level, and the digest is the crossing.
- Replay is a debugging and audit property, not a user-facing promise. The app never claims to reproduce "your night" and never offers a replay feature.
- A Session recorded without location still generates from time and sensor fingerprint alone, and is marked in the record as having no place component.
- The engine reads no wall clock of its own; the host supplies elapsed time, and every user action carries its own timestamp so it can be quantised to a tick.

#### FR-2: Uncertainty-protecting event direction

The engine can schedule emissions such that the timing of any emission is not learnable from the user's prior Sessions. Realizes UJ-1, UJ-4.

**Consequences (testable):**
- Silence is always a valid draw: the empty outcome carries non-zero weight in every event table, so a tick can always resolve to nothing.
- Across a seeded sweep of twenty-minute Sessions, the ratio of the median to the 90th-percentile inter-emission interval holds at 3.0 or above.
- Rapid, repetitive, and impossible sequences are suppressed by cooldown and anti-repeat rules held in the engine, not in content.
- A session directive may constrain the space of what can happen but can never name a specific event in advance.
- Directives are surfaced to the user as verbs with no object — *sweep the north side*, *ask something* — never as instructions with a known outcome. A session presents no more than six directives, spaced at least three minutes apart, drawn from an authored pool.
- Over a sweep of Sessions, the longest silence in a session falls in the 200–260 second band at the median, and at least one silence exceeding five minutes occurs in 22–35% of sessions.

#### FR-3: First-Run Directive

While the user has zero sealed Cases, the system can guarantee their first Session reaches a real Encounter. Realizes UJ-1.

**Consequences (testable):**
- With zero sealed Cases, the Session's emission budget is forced to at least one and at least five minutes of silence elapse before the first emission.
- The first Evidence emission in a first-run Session is guaranteed to be capture-eligible.
- The directive is not applied once the user has sealed one or more Cases.
- The directive is invisible to the user and produces no copy, indicator, or behavior the user can detect as special.

**Notes:** This is the single deliberate departure from the engine's otherwise total honesty, and it is bounded to one Case. `[NOTE FOR PM]` If reviewer feedback finds first-run sessions feel different in a detectable way, the fix is to lengthen the guaranteed silence rather than to widen the guarantee.

#### FR-4: Tension state

The system can maintain an internal tension value that rises and falls with elapsed time, user movement, sensor anomalies, and emissions, and drives pacing, audio, haptics, and Encounter probability. Realizes UJ-2, UJ-4.

**Consequences (testable):**
- The tension value is never displayed, announced, or exposed to assistive technology.
- Tension influences Encounter probability but never guarantees an Encounter.

#### FR-5: Sensor-derived material with graceful fallbacks

The system can use the magnetometer, accelerometer, gyroscope, motion, ambient light, location, microphone level, and camera state as generation material, and can degrade gracefully when any is denied or absent, without blocking the Session. Realizes UJ-1, UJ-2.

**Consequences (testable):**
- Every sensor channel reports one of: ready, permission not yet requested, permission denied (with whether it can be asked again), hardware unavailable, unsupported platform, or error.
- Denial of any single sensor never prevents a Session from starting or completing, and never produces a nag loop.
- With the magnetometer absent, the EMF surface reports an inferred state derived from motion, clock, and generation rather than failing or showing nothing.
- With location denied or reduced, the Hunt proceeds as uncharted, the Tracker shows bearing only, and the Seed omits the place component.
- With the microphone denied, the Voice and EVP surfaces enter an archive mode gated on elapsed time only, and the app makes no claim that anything answered.
- Sensor sampling stops whenever the Session screen loses focus or the app leaves the foreground.

**Feature-specific NFRs:**
- Battery: sensors are duty-cycled by ladder rather than run continuously; the Session offers a low-power path that keeps the loop intact.
- Performance: sensor-derived visuals must not cause a React re-render per sample.

**Notes:** `[NOTE FOR PM]` The low-power battery budget was left as an open number in the source contract. It needs a target before architecture locks the sampling ladder.

#### FR-35: Named no-event outcomes

The system can distinguish, name, and report the different ways a Session can legitimately produce nothing. Realizes UJ-1, UJ-4.

**Consequences (testable):**
- Four no-event outcomes exist and are named in the record: `QUIET_NIGHT` (the session held silence throughout), `WINDOW_CLOSED_EMPTY` (the encounter window opened and produced nothing), `FALSE_POSITIVE` (a signal was logged and triage resolved it as ordinary), and `NOT_FRAMED` (an encounter occurred but the user was not looking at the right tool).
- Each outcome carries its own authored rail copy and its own treatment in the Case Report. They are not collapsed into a single generic "nothing happened" state.
- `FALSE_POSITIVE` and `NOT_FRAMED` are attributed to the user's own action; `QUIET_NIGHT` and `WINDOW_CLOSED_EMPTY` are attributed to the night. The distinction is deliberate and must survive into the copy.
- The Journal can show a user how many of each they have recorded.

**Rationale:** This is the shipped form of the product's "absence is meaningful" law, and it is where that law stops being a slogan. A single generic empty state says *the app did nothing*; four named outcomes say *four different things happened, and none of them was a sighting*. `NOT_FRAMED` in particular is doing real work — it tells a user who missed an encounter that they were looking at the wrong instrument, which is both true and a reason to try again, without the app ever having to claim anything.

#### FR-36: Negative space

The Case Report can state what was *not* recorded, using the absence rule. Realizes UJ-1, UJ-4.

**Consequences (testable):**
- The report carries two to four lines drawn from a negative-space bank, describing what the session did not capture.
- **Absence is meaningful only where a measurement was possible.** A tool that was never opened, a permission that was denied, or a sensor that was absent does not generate a negative-space line — the app does not report the absence of something it never looked for.
- The block is omitted entirely when no line qualifies, rather than filled with placeholder text.
- Lines are drawn from the seeded report fork, so a case's negative space is stable across re-renders.

---

### 4.2 The Four Phenomena

**Description:** NightTrace v1 ships four Hunts. They are not four reskins of one mode — each is a distinct **Archetype** with its own verb, its own sensory channel, its own pacing, and its own unique failure state. The design principle is *four deep, not forty shallow*: a gravity well of four real behaviors beats a wide shelf of near-identical ones, and the archetype model means every future Phenomenon is a parameter set rather than an engineering project. Realizes UJ-1, UJ-2, UJ-4.

`[OVERRIDE]` The owner's brief specified this MVP roster as Ghost, Bigfoot, Shadow Person, and Alien/UFO — which this PRD preserves — but the brief framed each as a Hunt with its own per-Hunt event probabilities. The brainstorm replaced per-Hunt probability constants with a single engine and a single hazard model, on the grounds that learnable per-Hunt tables destroy uncertainty.

**Functional Requirements:**

#### FR-6: Four distinct Archetype behaviors

The system can run four behaviors — Observer, Stalker, Mimic, Ambusher — each with a distinct verb, pacing, sensory channel, and failure state. Realizes UJ-1, UJ-2, UJ-4.

**Consequences (testable):**
- Observer is slow and tightening, camera- and glitch-led, and fails as `NOTICED`; the user's job is to avoid being seen.
- Stalker closes on the user under its own power, haptic-led, and fails as `CORNERED`; the user's job is to stay ahead of it.
- Mimic is audio-in and entity-out, failing as `MISDIRECTED`; the user's job is to ask it something.
- Ambusher is fast and glance-and-gone, visual-led, and fails as `GONE`; the user's job is not to look away.
- No file under the engine directory contains a Phenomenon name; the engine references archetypes only, through a registry.
- Reassigning a Phenomenon to a different Archetype requires content changes only and no engine change.

#### FR-7: Content-only Phenomenon expansion

The system can add a new Phenomenon to the shipped app with no engine change. Realizes UJ-2.

**Consequences (testable):**
- Adding a Phenomenon requires only content definitions and assets, plus a content version increment.
- Content definitions are validated at build and at launch, so malformed content fails the build rather than reaching a user.
- A content version increment is the only event that invalidates Session replay parity, and it does so knowingly.

#### FR-8: Per-Hunt binding

Each Hunt can bind a Phenomenon to an environment, a tool set, a pacing profile, objectives, a completion condition, and a length band. Realizes UJ-1, UJ-2, UJ-3.

**Consequences (testable):**
- Ghost: indoor, slow and responsive, audio-led, 10–30 minutes, tools Voice/EMF/EVP/Camera, five objectives including establishing a baseline, asking a question, collecting three distinct evidence kinds, holding still for two minutes, and resolving. It closes when the user seals, with an automatic close at thirty minutes and a minimum duration of sixty seconds.
- Bigfoot: outdoor, fast and sudden, visual-led, 15–40 minutes, tools Tracker/Camera/Radar.
- Shadow Person: indoor, slow and tightening, haptic and glitch-led, 8–20 minutes, tools Camera/Radar/EMF.
- Alien: outdoor under open sky, closing and escalating, visual and haptic-led, 12–30 minutes, tools Sky/Camera/Radar.
- Every Hunt's objectives are earnable without reaching an Encounter.

**Notes:** The specific objectives, length bands, and tool bindings above are load-bearing product decisions, not tuning; they are recorded as requirements so downstream tickets cannot quietly flatten the four Hunts toward a common shape.

#### FR-37: The Observer inversion (Shadow Person)

The Shadow Person Hunt runs noticing in reverse: activity endangers the user rather than the Phenomenon. Realizes UJ-3.

**Consequences (testable):**
- A `noticing` accumulator rises against the user and reaches `NOTICED` at 1.0, ending the Session early with its own stamp.
- It accrues from torch on, camera live, and movement, at rates held in content. Standing still is safe. Every emission reads as a response to the user rather than as ambient activity.
- The accumulated tension curve inverts relative to the other three Hunts: more user activity produces more danger, not more information.
- **The app never tells the user any of this.** There is no tutorial, no hint, no tooltip, and no line of copy that connects stillness to safety. The mechanic is learned from consequence — a `NOTICED` ending, and the stamp it leaves on the report.
- Evidence collected before a `NOTICED` ending is preserved in full; the Case still produces a complete report.

**Notes:** `[NOTE FOR PM]` The deliberate non-instruction is the requirement, not an oversight, and it is the single easiest thing in this PRD for a well-meaning author to "fix" by adding a hint. Doing so destroys the product's best discovery moment. The report stamp is the entire teaching mechanism and it is sufficient.

#### FR-38: Posture gating (Bigfoot)

The Bigfoot Hunt's Encounter can only be rendered if the Camera surface is live at the moment of resolution. Realizes UJ-2, UJ-3.

**Consequences (testable):**
- The Ambusher archetype's Encounter is suppressed — not replaced, not downgraded — when the Camera is not the active tool surface at resolution time.
- The other three Hunts can be experienced without the camera; this one cannot.
- The Session records the missed window rather than hiding it, so a Case sealed after a suppressed Encounter can still report that the window opened.

**Notes:** This is what makes Bigfoot the product's most physically active Hunt. The tired arm is the memory, and the rule is the only reason the Hunt is not a reskin of the other visual-led archetype.

#### FR-39: The Mimic/Alien separation rule

The Mimic archetype answers in words. The Alien Phenomenon never does. Realizes UJ-3.

**Consequences (testable):**
- No Alien Hunt emission contains a word, a phrase, or any found text. Alien transmissions render as a pulse glyph row, not as speech.
- Words appear in content only under the Mimic archetype, which is the only archetype whose mechanic is language.
- The rule is enforced as a content-validation test over the Hunt's emission bank, so a future content drop cannot break it silently.

**Notes:** The source design calls this a hard separation rule and warns it must survive content drops. Collapsing it does not merely blur two Hunts — it makes the Mimic's Parker-esque echo, which is the most unsettling thing the app does, into a generic voice effect.

---

### 4.3 The Hunt Brief and Session Ritual

**Description:** Before a Session begins, the user passes through the **Hunt Brief** — a short, deliberate ritual that calibrates the phone, records the place, and captures the user's intention. The Brief is the second most important screen in the app after the Case Report, because it converts a tap into a decision and sets the fiction's frame: *you are about to conduct an investigation, not start a game.* It also carries the Intensity choice, which is locked for the duration of the Case. Realizes UJ-1, UJ-2.

**Functional Requirements:**

#### FR-9: Hunt Brief ritual

The user can calibrate the device, name the place, set an intention, choose an intensity, and enter a Session through a deliberate hold gesture. Realizes UJ-1, UJ-2.

**Consequences (testable):**
- The Brief requires a calibration step, a place name, and an intention before the Session can start. The intention is `Ask`, `Watch` (default), or `Wait`, and it biases likelihood only — it never changes what can be found.
- Entering a Session requires a sustained hold of roughly **800 ms**, not a tap, with a hairline that fills left to right and a label that changes partway through. Releasing early cancels with a soft warning and leaves the Brief intact.
- The Brief offers a duration selection of 10, 20, 30, 45 minutes, or open-ended. The Hunt's own length band (FR-8) is the default.
- The Brief captures the one-shot sensor fingerprint used in the Seed, and reports the calibration outcome as either a quiet or a noisy baseline. Neither outcome is a judgment; both are used.
- If calibration is interrupted or no magnetometer is present, the Brief completes on an inferred baseline and says so rather than failing or blocking entry.
- The Brief can be abandoned at any point before the hold, with no Session row created.
- A hold that is interrupted by backgrounding aborts silently and resets: entering the field is a foreground act.

**Notes:** The 800 ms figure is deliberate and distinct from the 600 ms hold that seals a Case at the end of a Session. The two gestures are the product's opening and closing brackets, and the entry hold is the longer of the pair because it is crossing a threshold rather than confirming a decision.

#### FR-10: Intensity selection and locking

The user can choose one of four intensity levels before a Session, and cannot change it once the Case has begun. Realizes UJ-1.

**Consequences (testable):**
- Levels are `Ambient` ("Few signals. Nothing sudden."), `Present` ("The intended night. Signals, and long silences."), `Intense` ("More signals. Sharper stings. Glitch events enabled."), and `Ritual` ("Everything on. Nothing held back."). `Present` is the default.
- The selection screen states plainly that higher intensity means more signals and never a guaranteed Encounter, and that intensity is fixed during a case.
- Once a Case is live, the intensity control is locked and explains why: changing it mid-investigation would mean steering what the user finds.
- Glitch-channel visuals are enabled only at `Intense` and `Ritual`. `[OVERRIDE]` The source design gated the glitch channel at `Present` and above; this PRD raises the gate to `Intense`, because glitch is the one visual effect that reads as *equipment malfunction* rather than as *toolkit behavior*, and an app whose most-effects-heavy level is its default is an app that looks like a toy at exactly the moment a first-time user is deciding. `Present` stays the intended night and keeps its sharper stings.

---

### 4.4 The Tool Set

**Description:** Tools are how the user works a room. There are seven surfaces and five real verbs — **Sweep**, **Ask**, **Listen**, **Frame**, **Log** — and every tool lives *inside* a live Session. There is no equipment menu, no loadout screen, and no tool the user can browse outside a hunt, because a tool examined outside a hunt is an object, and a tool used inside one is an instrument. `[OVERRIDE]` The owner's brief specified 23 named tools on a dedicated Equipment tab; the brainstorm consolidated them and cut the tab.

`[OVERRIDE — RATIFIED THEN REVERSED]` The owner's brief also specified that the Spirit Box and other readouts display numbers and percentages. The brainstorm banned numeric readouts, and the owner originally ratified that ban for tools only. **That asymmetry is gone** — see §4.6 and §8 OQ-1: the percentage was removed from the Case Report as well, so the brief's numeric readouts are overridden in full, on every surface, with no exception left standing.

**Functional Requirements:**

#### FR-11: EMF surface

The user can sweep a space for a magnetic field reading and log a spot. Realizes UJ-1.

**Consequences (testable):**
- The surface offers two verbs: `SWEEP`, which arms for ten seconds, and `LOG THIS SPOT`.
- Visible states are `STILL`, `DRIFT`, `STIR`, `INTERFERENCE`, and `INFERRED`.
- The field is rendered as an arc whose width varies across four levels, and the trace shows a rolling window. There is no y-axis, no unit, and no numeric readout anywhere on the surface.
- The surface must not display raw magnetic strength as a paranormal reading.

#### FR-12: Radar surface

The user can sweep for targets, observe a bearing and a range band, and log a bearing. Realizes UJ-1, UJ-2.

**Consequences (testable):**
- Targets are procedurally generated with a birth, a velocity, an uncertainty, and a death; they may appear briefly, drift, fade, approach, or dissolve. Targets are never randomly placed and never lock on.
- Bearing is expressed as one of eight compass points plus a range band; distance is never shown in metres or any other unit.
- A target's displayed uncertainty only ever widens or is narrowed by direct observation; cone width never collapses to a lock.
- No more than four concurrent targets exist in a twenty-minute session.

#### FR-13: Voice surface (Spirit Box)

The user can hold to ask a question and, very rarely, have the surface show a single word fragment. Realizes UJ-1.

**Consequences (testable):**
- The surface offers `ASK` as a sustained hold and `LOG THIS`.
- Output is a sweeping band line, then a flattening ribbon, then a mandatory silence of roughly 300 ms, then at most one word, which fades in, holds about 2.4 seconds, and fades out.
- The surface produces at most one line in response to a single ask.
- **No wording anywhere on the surface or in its copy states or implies that anything was received, transmitted, heard, or contacted.** The band line is theatre; the word is drawn from an authored bank by the simulation and is displayed because the simulation chose to display it. This is enforced against the surface's own string set, because the rulings table's safe form for this tool is *"Bands are theatre. Nothing here is received."* and the requirement text must not contradict it.
- **Non-response is the majority case.** A response, when it comes, may be delayed by up to ninety seconds, and **may arrive on a different tool than the one that asked** — a word overheard on the EVP surface, or a bearing shift on the Radar, rather than an answer where the question was put. A user who asks and waits at the Voice surface will usually get nothing.
- The delay and the cross-tool delivery are load-bearing, not decoration: they are the mechanism that makes the Mimic archetype's verb (*Ask it something*) and its `MISDIRECTED` failure state possible. Shortening the delay to a conversational beat, or confining the answer to the asking tool, destroys both.
- Words are drawn from authored banks; no text is generated at runtime.
- With the microphone denied, the surface enters an archive mode and shows no response wording that implies anything answered.

**Notes:** `[NOTE FOR PM]` The verb in this requirement was "receive" in an earlier draft, which is the word the rulings table exists to delete and which no banned-term lint contains. It is corrected here because a normative requirement is the last place the product can afford a claim — downstream UI strings are derived from FR text, so an error here propagates into shipped copy that the lint would still pass.

#### FR-14: EVP surface

The user can record audio during a Session, mark moments, and keep or discard segments as Evidence. Realizes UJ-1.

**Consequences (testable):**
- The surface offers `RECORD`/`STOP` and `MARK`, over rolling thirty-second segments.
- Marked moments appear in a marker lane and can be played from the marker, kept as Evidence, or deleted.
- The surface never asserts that recorded audio is paranormal, and the app never claims an audio event was scientifically meaningful.

#### FR-15: Camera surface

The user can frame the environment, catch an Encounter on camera, and capture a frame as Evidence. Realizes UJ-1, UJ-2, UJ-4.

**Consequences (testable):**
- Default overlay is deliberately restrained: rule-of-thirds, corner brackets, a recording timer, compass heading, an unlabeled and unnumbered signal bar, a torch toggle, and a vignette. Night-vision styling, scan lines, heavy noise, and chromatic aberration are **not** defaults and appear only through the glitch channel at `Intense` and `Ritual`.
- Capture triggers a brief, subdued flash and produces no shutter sound.
- Encounter frames are short sprite sequences at low opacity, never centered and never in focus, with the appearance of being caught rather than presented.
- Only one camera preview may exist at a time; it unmounts when the screen loses focus.
- With the camera denied, the surface falls back to a dark-room renderer that preserves Encounter timing and Evidence output — the same experience in a different visual form.
- Pinch-to-zoom is intentionally not implemented.

#### FR-16: Tracker surface

The user can walk a hunt toward a bearing and log trail marks. Realizes UJ-2.

**Consequences (testable):**
- The surface shows a compass, a bearing chevron, a five-step proximity ladder (`COLD`, `WARM`, `CLOSE`, `NEAR`, `HERE`), a dead-reckoned trail path, and a signal-age indicator.
- Logging a trail mark requires the proximity ladder to have reached `CLOSE`.
- No numeric distance, speed, or coordinate is ever displayed.
- **The surface carries a reachable disclosure stating that proximity is inferred from the user's own movement rather than measured against anything.** It is available from the surface itself, not buried in settings.

**Notes:** `[NOTE FOR PM]` The disclosure is not a nicety. The proximity ladder is driven by GPS-derived movement deltas, which means the ladder closes fastest when the *user* is walking toward something — a mechanic that reads as the app tracking a subject unless the surface says otherwise. It is the same class of problem as FR-13's "receive": a truthful mechanic described in words that overstate what is happening. The design doc carried this line and the requirement dropped it.

#### FR-17: Sky surface

The user can scan the sky, pan, and capture an object. Realizes UJ-2.

**Consequences (testable):**
- The surface shows a generated starfield, an azimuth and altitude readout, an alignment meter, and an alignment tolerance. It is permanently labeled as generated.
- A scan arms for a bounded period; capture requires alignment within tolerance for a sustained moment.
- The starfield is procedurally generated and is never presented as a real star catalogue.
- **The generated label travels with the capture.** A Sky capture committed as Evidence (FR-18) carries the generated marking into every surface it later appears on — the evidence ledger, the souvenir reel, the report, and the Share Card artifact block. A captured image that leaves this surface without the marking is a photograph of the night sky with a light in it, and the single most falsifiable asset the product can produce.
- The Sky surface produces no Evidence kind that asserts an object was tracked or resolved; a capture records that the user aimed and captured, not that anything was there.

**Notes:** `[NOTE FOR PM]` This requirement exists because the label is a property of the *surface*, and the claim it disclaims travels with the *image*. The string lint cannot reach a photo, so the marking has to be part of the composition rather than part of the screen behind it. See FR-24's out-of-scope note for the same problem on the Share Card.

**Feature-specific NFRs:**
- Every tool surface must be reachable within one gesture from the live Session, and no tool may present a dead end — every empty state carries exactly one action.

---

### 4.5 Evidence and Triage

**Description:** Evidence is what a Session leaves behind: typed atoms, each with a certainty band, that accumulate toward a **Signature**. Evidence is a souvenir, not a datum — its job is to make the report feel like a record of work. After the Session, the user walks the **Triage** ritual and marks each item explained or unexplained. Triage is what converts a pile of Evidence into a conclusion the user reached rather than one the app announced. Realizes UJ-1, UJ-2, UJ-4.

**Functional Requirements:**

#### FR-18: Evidence capture

The user can capture Evidence during a Session, and the system commits each item at the moment of capture rather than at session end. Realizes UJ-1, UJ-2.

**Consequences (testable):**
- Evidence carries a kind, a certainty band of `AMBIGUOUS`/`SUGGESTIVE`/`COMPELLING`, a channel, the tool that produced it, the phase it occurred in, and its source.
- Each kind maps to exactly one evidence glyph, and the glyph set is closed against the kind list by a content-validation test.
- A capture made with nothing active still commits, as a `null_reading` with the copy *"You marked a spot with no reading. That is also a record."* It is counted toward the report's negative space (FR-36) rather than discarded.
- Two captures within 1.5 seconds coalesce into one item with a `×2` marker.
- Evidence is written to durable storage at the moment of capture, so a crash or force-quit mid-session does not lose what was already logged.
- No certainty band is ever expressed as a number or a percentage.
- The **kind list itself is not fixed by this PRD** — see §8 OQ-11. The count is unresolved across the source documents, and no number should be inferred from this requirement.

**Notes:** `[NOTE FOR PM]` An earlier draft of this requirement said "fourteen evidence kinds ship in v1." That number could not be substantiated: the product doc names 20 distinct kinds across the four Hunts while its own asset table budgeted glyphs for 14, and the implementation contract enumerates 10. Asserting a count I could not source would have made content authoring, the glyph set, and the Signature strip all key off a number that does not exist. The requirement is stated without a count deliberately.

#### FR-19: Signature convergence

The system can accumulate a Session's Evidence into a Signature and present it as a strip of slots against the user's Signature Archive. Realizes UJ-2, UJ-4.

**Consequences (testable):**
- The strip renders 7–9 slots and resolves to `PARTIAL MATCH · UNIDENTIFIED` or `NO MATCH ON FILE`.
- A Signature is never presented as a positive identification of a real creature; a match reads as a partial or unsigned match.
- The Archive is a four-by-two grid where a filled slot means a matched signature, a marked slot means seen-but-unidentified, and an empty slot means never seen.
- An unidentified slot renders as a `?` tile that pulses slowly, at roughly **0.5 Hz**, whenever the Archive is on screen.
- The `?` tile is never labeled, never given an explanatory caption, and is never the target of a callout or coach mark. It advertises a gap and says nothing about what fills it.
- **No surface states or implies that a full match is reachable, that one exists, or what any slot's completion would identify.** There is no progress readout toward a match, no stated unlock requirement, no completion count, and no per-Phenomenon signature checklist. The Archive shows what the user has seen and the gaps beside it, and stops there.

**Notes:** `[NOTE FOR PM]` The pulse rate is a product decision, not a style detail, and the source design judges it the product's strongest single return hook: it converts a grid of what the user has into a slow advertisement of what they have not. It must not be accelerated, and it must not be explained — a `?` with a tooltip is a tutorial, and a tutorial about a mystery is a spoiler.

The no-progress clause is doing more work than it looks like, and it is the answer to an argument worth stating plainly. A menu entry named **Bigfoot**, a Signature strip that fills six of nine slots, and a label reading `PARTIAL MATCH` together imply a whole that exists and is reachable — at which point "partial" has not hedged the claim, it has named it. The implication survives any wording change, because it lives in the *structure*, not the sentence: a slot count tells the user a target exists, and a stated unlock requirement tells them it is a goal. Removing the progress apparatus is what removes the claim. The `?` tile survives that removal because it asserts only that the user has not seen something, which is true.

#### FR-20: Triage ritual

The user can review each Evidence item after a Session and mark it explained or unexplained, and can record a reason for an explained item. Realizes UJ-1, UJ-4.

**Consequences (testable):**
- Triage verdicts are `UNEXPLAINED`, `INCONCLUSIVE`, `EXPLAINED`, and `UNREVIEWED`.
- An explained item carries a reason drawn from a fixed set: a vehicle, a building, the user's own movement, equipment, or other.
- **A reason phrase is recorded as what the user decided, not as what the app determined, and it is rendered in the ledger as the user's verdict rather than as a finding.** The report may show that the user explained an item and why they said so; it never presents a mundane cause as a fact the app established. The set is closed and mundane by design, and a closed set plus app-authored phrasing would turn a user's judgement into the product's assertion about the world.
- The triage ritual is presented as a deliberate review, not a dismissible dialog.
- **The asymmetry is structural and must hold:** marking items explained raises the explained ratio and therefore moves a Case toward `EXPLAINED`; marking items unexplained does *not* move it toward `UNEXPLAINED`, because that status additionally requires an Encounter (FR-21). Triaging everything unexplained on a night with no Encounter cannot manufacture an `UNEXPLAINED`.
- The interface does not explain this asymmetry, and no copy anywhere states that a particular combination of verdicts unlocks a particular status.

#### FR-21: Status derivation

The system can derive the Case's status from the evidence, the triage verdicts, and whether an Encounter occurred. Realizes UJ-1, UJ-4.

**Consequences (testable):**
- Status is `UNEXPLAINED`, `INCONCLUSIVE`, or `EXPLAINED`.
- Convergence is the fraction of Signature slots filled. An explained ratio is the fraction of triaged Evidence marked `EXPLAINED`.
- `UNEXPLAINED` requires all three: convergence at or above **0.60**, at least **one** Encounter, and an explained ratio below **0.34**.
- `EXPLAINED` requires an explained ratio at or above **0.60**.
- Any other combination resolves to `INCONCLUSIVE`.
- An Encounter is required for `UNEXPLAINED`; a case with no Encounter can never resolve to it, however strong its convergence.
- A case that captured nothing at all still produces a complete report with a valid status.

**Notes:** `[NOTE FOR PM]` These are the design doc's stated thresholds, imported here so the requirement is testable rather than referential. They are tuning values and are expected to move; what is *not* expected to move is the structural rule that `UNEXPLAINED` needs an Encounter as well as convergence. `[NOTE FOR PM]` Deriving status partly from triage verdicts means a user can talk themselves out of an `UNEXPLAINED`. That is intentional — it makes the conclusion theirs — but it should be watched in review for the opposite failure, where triage feels like a chore the report depends on.

#### FR-34: Contested Evidence

The system can plant false Evidence during a Session and let the user disprove it at Triage. Realizes UJ-4.

**Consequences (testable):**
- Some Evidence is marked internally as contested: it presents identically to ordinary Evidence until the user triages it.
- At Triage, a contested item can be resolved as explained, and doing so is recorded and reflected in the explained ratio that drives status derivation (FR-21).
- A contested item's plant is driven by the Session's seeded forks, so it is reproducible in replay and absent from a Sweep in which it was not drawn.
- A contested item never resolves to `UNEXPLAINED` on its own and never fabricates an Encounter.
- Nothing in the interface tells the user that an item is contested before they triage it, and nothing congratulates them for catching it afterward.

**Rationale (not a requirement, but the reason this FR exists):** This is the strongest available defense of the product's honesty claim, and the source documents call it exactly that. An app that plants phantoms for the user to catch and discard has demonstrated, *in the product's own behavior*, that it feeds the user material to be rejected. That is a considerably stronger answer to "is this app lying to me?" than any disclaimer sentence, and it is the reason FR-33's string lint does not have to carry the whole honesty burden alone. It also makes Triage (FR-20) mean something: without contested items, triage is a review of Evidence; with them, triage is an act of judgment.

**Out of Scope:**
- `[NON-GOAL for MVP]` A contested item never invents an Encounter and never fabricates a Signature match. The mechanism plants *evidence a user can reason about*, not *a sighting they cannot unsee* — the first is the honesty defense, the second would be the opposite of one.

---

### 4.6 The Case Report

**Description:** The Case Report is the hero screen and the product's reason to exist. It is the only screen that must be built first and art-directed twice. Every tool in the app is upstream of this screen: tools generate material, and the report packages it. A weak report stalls the entire growth loop, because the loop is *tools generate → report packages → share recruits → new investigators generate more*. Realizes UJ-1, UJ-2, UJ-4.

`[OVERRIDE — RATIFIED THEN REVERSED]` This screen carries the product's most consequential decision, and it changed twice. The brainstorm's first design law banned every verifiable number including the `%` character, on the grounds that a percentage is a measurement claim. The owner's original brief specified the opposite — a report carrying `Strongest anomaly 91%` and an activity level — and on 2026-10-04 the owner initially ratified the brief. **An adversarial review then showed the original framing could not hold**: a bare count has no denominator and a percentage does, so `91%` invites "of what?" and every available answer describes a measurement the app is not making. Relabelling could not fix it, because the problem is the number's form, not its caption. The **Share Card compounded it**: the card is composed from the report, so the percentage was never confined to the one screen that carries the framing apparatus — it traveled to the most-distributed surface in the product, which arrives with no onboarding and no About notice.

**Final ruling: the Case Report shows counts and qualitative bands, and no percentage appears anywhere in the product.** Counts are honest — `EVIDENCE 05` is a fact about the session, not a claim about the world. A percentage is not. The owner reversed the earlier ratification on the evidence, and the reasoning is recorded in §8 OQ-1 so that it is not re-litigated.

**Functional Requirements:**

#### FR-22: Case Report rendering

The user can view a complete Case Report at the end of every Session that produced a Case, and can seal and file it. Realizes UJ-1, UJ-2, UJ-4.

**Consequences (testable):**
- The report contains, in order: a masthead carrying the case reference and date; a status seal showing the status word, the case name, and hunt metadata; a stat row; a signature strip; a narrative account of three to six declarative lines; a souvenir reel of captured media; an evidence ledger listing each item with its type, time, and triage verdict; a negative-space block; an investigator note field; and a conditions footer carrying the Seed reference, the entertainment line, and the content version.
- The stat row shows duration, evidence count, encounter count, and source count, plus an activity band of `LOW`, `MODERATE`, or `HIGH`. **It shows no percentage and no unit-bearing number of any kind.** The only numerals on the report are counts of things that happened and the elapsed session time.
- The narrative account is written from an authored template bank. No text is generated at runtime.
- The negative-space block states plainly what was not recorded, and is omitted entirely when no absence qualifies. See FR-36.
- The investigator note is an open field with the prompt *"What did you notice?"* and the placeholder *"The tools miss things. You don't."*
- Filing requires a sustained hold of roughly 600 ms. A filed case shows a sealed chip and a revision stamp if later edited.
- A Session with zero Evidence and zero Encounters still renders a complete report.

#### FR-23: Report integrity

A sealed Case Report can never be altered in a way that misrepresents what happened. Realizes UJ-4.

**Consequences (testable):**
- Sealing is an explicit user action and is irreversible without producing a visible revision stamp.
- The conditions footer always carries the entertainment line *"An investigation experience. Not a measurement."*

**Notes:** `[NOTE FOR PM]` The entertainment line sits at the foot of a report that contains no claim to disclaim. That is the intended end state: the line is not a patch over a problem elsewhere in the document, it is a plain statement of what the artifact is. It should be reviewed as a single visual unit with the stat row before the report is art-directed a second time.

---

### 4.7 The Share Card

**Description:** Sharing is first-class, not a bonus: if a moment cannot be screenshotted, it did not happen. The Share Card is the growth engine made concrete — a single image, composed to be posted without editing, carrying the case's status and its strongest artifact. Realizes UJ-2.

**Functional Requirements:**

#### FR-24: Share Card composition

The user can generate and share a single image card from a sealed Case Report. Realizes UJ-2.

**Consequences (testable):**
- The card carries the case reference, an artifact block, the status word with its stamp ring, a three-cell stat row, a short seeded field note, and a footer.
- The artifact block shows the case's strongest artifact — a word, a captured frame, or a trace — or, when there is none, a negative-space treatment stating that nothing was recorded.
- The field note defaults to one of four seeded options drawn from the Case, and the user may replace it with up to sixty characters of their own text before sharing. The card is not regenerated around the edit beyond re-rendering the note.
- The card supports a default portrait ratio and a feed ratio.
- `Save to Photos` is available only when the media-library permission has been granted. If it has not been granted, the control is **absent**, not present-and-failing, and the user is not prompted to grant it from the card.
- Re-rendering the same card with the same content, at the same device pixel ratio, produces a visually identical image. `[ASSUMPTION]` See §9 A-9 — the requirement is *perceptual* identity, not byte identity, because the card is rendered by rasterising a native view tree and that is not bit-reproducible across OS, font, and GPU paths. If byte identity is genuinely needed, the composition path must change to a composed image from static assets rather than a view capture.
- **Hard exclusions:** the card carries no watermark, no URL, no QR code, no app-store badge, and no attribution text. Nothing is ever appended to a user's output.
- The footer always carries the line *"An investigation experience. Not a measurement."*
- The card can be shared through the system share sheet, saved to photos, or canceled without loss.

**Out of Scope:**
- `[NON-GOAL for MVP]` Additional card variants beyond the primary case-file card are deferred. The card is the loop; the variants are polish.

**Notes:** `[NOTE FOR PM]` **The card is the one surface the claims policy cannot reach by string lint, and it is the surface that travels furthest.** Every other screen is protected by a banned-word list; the card is an *image*, and a card carrying a blurry creature frame under an `UNEXPLAINED` stamp asserts something no lint checks. Two consequences follow, and both need a decision before the card is designed:

1. **Captured images need a constraint the lint cannot supply.** The authored encounter sprites are already constrained (low alpha, never centered, never in focus) and that constraint is what keeps a frame readable as a *glimpse* rather than as *footage*. Anything that loosens it — higher opacity, a centered subject, a sharper sprite, a longer hold — converts the app's strongest asset into its strongest liability. This should be enforced as a design rule with a test that can actually see images, not merely as an intention.
2. **The stat row the card inherits is now counts-only.** `[RESOLVED 2026-10-04]` Because the card is composed from the report, the report's stat row is what travels — and since OQ-1 ruled the percentage out of the product, the card carries three counts and a band, and nothing else. This is the containment the earlier design hoped to achieve by narrowing the card alone; removing the number at the source achieved it for both surfaces at once.

---

### 4.8 The Field Journal

**Description:** The Journal is the user's permanent, private, on-device archive — the place their nights accumulate. It is what makes NightTrace a *journal* rather than a session game: it holds sealed Cases, documented Phenomena, captured Evidence, and Field Notes, and it is the reason to come back on a night the user is not hunting. The Journal is private by default and never has a public or social surface. Realizes UJ-1, UJ-2, UJ-4.

**Functional Requirements:**

#### FR-25: Journal archive

The user can browse their Cases, Phenomena, Evidence, and Field Notes, organized by night. Realizes UJ-1, UJ-4.

**Consequences (testable):**
- The Journal is segmented into Overview, Phenomena, Evidence, and Cases.
- Entries are grouped by night using a boundary at 04:00, so a session that runs past midnight belongs to the evening it began.
- The Phenomena section shows discovered entries, entries seen but unidentified, and locked entries with their stated unlock requirements, plus per-Phenomenon encounter and evidence counts.
- An unsealed case is signaled with a dot on the Journal tab.
- The Journal presents a user's own historical counts; it never presents a number the user could verify against the world.

#### FR-26: Private by default

The Journal can never be made public or social. Realizes UJ-1.

**Consequences (testable):**
- No feed, friends list, public profile, or comparison surface exists anywhere in the app.
- Sharing is one-directional and always leaves the app as an image.
- Journal content is stored on the device only and is never transmitted.

#### FR-27: Data export and deletion

The user can export their Journal data and delete it entirely. Realizes UJ-1.

**Consequences (testable):**
- Export produces a user-readable file including the entertainment notice.
- Deletion removes Journal content from the device.
- `[ASSUMPTION]` Because the app has no backend and no account, deletion is necessarily local and cannot reach data the user has already shared. The deletion screen must say so rather than implying otherwise.

---

### 4.9 Progression — Investigator Clearance

**Description:** Progression exists to reward repeated investigation and make the collection satisfying; it explicitly does not exist to create a grind. `[OVERRIDE]` The owner's brief specified XP and an investigator level. The brainstorm replaced it with **Investigator Clearance** — a diegetic rank that advances on what the user *did*, never on how long they played or how many events fired, on the grounds that an XP bar is "the tell that you are inside a mobile game." Realizes UJ-1, UJ-2.

**Functional Requirements:**

#### FR-28: Clearance advancement

The user's Clearance can advance through named ranks based on sealed Cases, documented Phenomena, and matched Signatures. Realizes UJ-1, UJ-2.

**Consequences (testable):**
- Ranks are `FIELD ASSISTANT`, `FIELD ASSISTANT II`, `CASE OFFICER`, `SENIOR CASE OFFICER`, and `ARCHIVIST`.
- Advancement depends on sealed Cases, distinct documented Phenomena, and matched Signatures only. It never depends on elapsed time or on the number of events that fired.
- Clearance gates only cosmetic case-file themes and journal art. It never gates a tool, an Evidence kind, a Hunt, or an intensity level.
- No XP value is displayed anywhere in the app.

#### FR-29: Streaks and badges

The system can display streaks and award case stamps, and never penalizes a missed night. Realizes UJ-1.

**Consequences (testable):**
- A streak is displayed but never enforced: missing a night has no penalty, no loss, and no notification.
- Badges appear as case stamps within the Journal, never as a trophy wall or a separate reward screen.

---

### 4.10 Home and the Daily Anomaly

**Description:** Home is a threshold, not a dashboard. It exists to answer one question — *is tonight worth going out?* — and to get the user into a Hunt in one action. It rotates a single **Anomaly** line daily, which gives the user a reason to open the app on nights they will not hunt and is the app's cheapest retention surface.

Home emphasizes Hunts over tools, and this is the owner's own instruction rather than a change to it: the brief directed that not every tool be exposed on the home screen and that Home emphasize Hunts. The brainstorm removed the Equipment tab that the brief had also proposed, which *is* an override and is recorded in §4.4. Realizes UJ-1, UJ-3.

**Functional Requirements:**

#### FR-30: Home surface

The user can start a Hunt, resume an interrupted Session, and see the night's Anomaly from Home. Realizes UJ-1, UJ-3.

**Consequences (testable):**
- Home presents the user's Investigator Clearance, a featured Hunt, the other Hunts, a resume affordance when a Session was interrupted, recent Evidence, and the daily Anomaly.
- Home presents no tool grid and no equipment navigation.
- The Anomaly line is a single line of atmospheric text drawn from an authored, seeded set.
- The Anomaly line and all Home copy must satisfy FR-33: no sentence may assert anything about the real world, and specifically may not claim knowledge of the user's neighbourhood or of other users.
- **The Anomaly is not shareable in v1.** Because it is designed to be non-falsifiable atmosphere, no banned term will ever appear in it and the lint has nothing to catch, so a shareable Anomaly would leave the app as a standalone image carrying no footer, no framing, and no status context — the only string in the product engineered specifically to be un-disprovable, travelling with nothing around it. If it becomes shareable later it must compose onto a Share Card so the entertainment line travels with it.

**Notes:** `[NOTE FOR PM]` The design doc made the Anomaly card shareable by long-press and this PRD does not. That is a cut, recorded here rather than left for a reader to find. It is worth revisiting once the Share Card exists as a composition target, because the Anomaly is genuinely good shareable material — the problem is the standalone image, not the line.

**Out of Scope:**
- `[NON-GOAL for MVP]` The global shared-seed night — one seed shared across all users on a given night — is deferred. The storage seam for it is reserved, but no shared-night experience ships in v1.

---

### 4.11 Field Note Mode

**Description:** Not every user has forty minutes. `[OVERRIDE]` The owner's brief asked for a session playable in two minutes; the brainstorm rescoped this into **Field Note** — a standalone, roughly three-minute standing observation, because compressing an investigation into two minutes is exactly how a product becomes a fake radar. `[OVERRIDE]` The brainstorm also reduced the Field Note's output: where the source design gave it a short-form `FIELD NOTE` report roughly a third the length of a Case Report, this PRD gives it a Journal entry and no report at all. The reason is that a report is the product's promise — a paper trail of an investigation — and a Field Note is explicitly not an investigation; issuing a report-shaped object for it would blur the one boundary the mode exists to draw. A Field Note still produces a real, readable artifact; it is a Journal entry with its own short-form treatment rather than a sealed Case. Realizes UJ-3.

**Functional Requirements:**

#### FR-31: Field Note mode

The user can run a short standing observation that produces a Journal entry but not a Case. Realizes UJ-3.

**Consequences (testable):**
- A Field Note is presented as its own mode with its own framing copy, not as a Hunt with a shorter timer.
- A Field Note runs for roughly three minutes and closes on its own.
- A Field Note writes a short Journal entry containing its time, its place band, and one line of observed material. It produces **no** Case Report and no Case reference.
- If the user moves the device substantially or picks it up mid-note, the note ends early and records itself as short rather than discarding what it captured.
- No Encounter, no Case, and no Clearance advancement can result from a Field Note alone.

---

### 4.12 Onboarding and Claims Compliance

**Description:** NightTrace makes no claim about the real world, and this is a product law rather than a legal footnote. `[OVERRIDE]` The owner's brief required an entertainment disclaimer and prohibited misleading claims; the brainstorm hardened this into a constitutional rule — *no sentence in NightTrace may assert anything about the real world* — enforced by a build-failing lint rather than by reviewer diligence. This protects three things at once: the user's trust, the app-store review, and the product's central fiction, which only works if the app never winks. Realizes UJ-1, UJ-4.

**Functional Requirements:**

#### FR-32: Onboarding and consent

A first-time user can learn the app's frame and acknowledge it before their first Session. Realizes UJ-1.

**Consequences (testable):**
- Onboarding is four screens: that nothing here is proof, that the case is local, that the user chooses their night, and that permissions are asked only when needed.
- The entertainment notice is non-skippable on first launch and must be acknowledged.
- The notice remains permanently reachable from Profile, is included in any data export, and contains the ratified **safety line** for a horror-adjacent app — a calm statement covering photosensitivity (the glitch channel's visual effects), sudden audio, and the fact that the app is designed to startle. It does not diagnose and does not use alarm language.
- The safety content appears in the About notice, not on the onboarding path, so the first-run screens stay short enough to reach the first Session quickly.

#### FR-33: No real-world assertion

No sentence anywhere in the app, its metadata, its screenshots, or its share output may assert anything about the real world. Realizes UJ-4.

**Consequences (testable):**
- The build fails if any banned term appears in shipped strings: detection and proof language, confirmation and verification language, authenticity claims, scientific and science claims, thermal and radiation language, accuracy claims, algorithm and AI claims, `%` anywhere in any shipped string, metres as a distance to a contact, and haunted as a statement of fact.
- **The banned-term check runs against a declared, enumerated string-surface set, not against a glob of the app binary.** The set must name at least: UI string tables, the iOS `Info.plist` purpose strings (`NSMotionUsageDescription` and `NSMicrophoneUsageDescription` in particular, which sit beside a field reading and are the highest-risk strings in the product), the Android manifest permission strings, the store description and title, screenshot captions, and the About notice. A surface not on the set is not covered, and the check's coverage is the thing being asserted — not the existence of a lint.
- Approved market terms are limited to: paranormal, ghost hunt, cryptid, investigator, field journal, EMF, EVP, spooky, adventure, night.
- App name is **NightTrace**; subtitle is **Paranormal field journal**. Category is Entertainment; rating 12+/Teen.
- **The rating is derived from stated questionnaire inputs, not asserted.** The answers covering horror and fear themes, sudden or loud audio, and flashing visuals are recorded with the requirement, so the rating can be defended to a reviewer and re-derived if the glitch channel changes.
- No statistic, social proof, award, or count of users ever appears in marketing copy.
- No fake telemetry or progress-scanning language appears anywhere in the product.
- The app requests no permission before it is needed, and each request explains why in the moment.

**Notes:** `[NOTE FOR PM]` This requirement and FR-22 were briefly in tension, and the tension was resolved by removing the exception rather than by justifying it: percentages are banned on tool surfaces as sensed readouts *and* absent from the Case Report as case metadata, so the rule now has no carve-out anywhere. See §8 OQ-1, closed. The lint term is therefore a flat ban on the `%` character in any shipped string, which is both simpler to enforce and impossible to misread.

`[NOTE FOR PM]` **What this requirement cannot do, stated here so no reader mistakes the lint for the whole policy.** The check parses strings. It cannot see images, mechanics, juxtaposition, visual hierarchy, or the *sum* of individually-safe sentences. Every claim leak the adversarial review found lives in one of those five blind spots: a blurry encounter frame on the Share Card, a Sky capture that loses its generated label, a proximity ladder that closes on the user's own walking, a Signature strip whose slot count implies a reachable whole. A passing build is evidence about strings and nothing else. SM-8 carries the second count for exactly this reason.

---

## 5. Non-Goals (Explicit)

- **NightTrace is not a detector.** It makes no claim that anything it shows corresponds to anything in the world. This is not a disclaimer; it is the product's premise, and a feature that violated it would be rejected regardless of how well it tested.
- **NightTrace is not a social product.** No feed, no friends, no profiles, no user comparison, no leaderboard, no public journal, ever.
- **NightTrace is not a monetized product in v1.** No paywall, no in-app purchase, no subscription, and no advertising ship in v1, including at natural case boundaries. `[ASSUMPTION]` See §9 A-1. Whether the *schema* retains purchase seams for a possible later version is a separate and open question — see §8 OQ-3. Nothing in v1 may present, advertise, or hint at a purchase.
- **NightTrace is not a multiplayer product in v1.** `[NON-GOAL for MVP]` Director Mode — one user secretly steering another's session — is deferred. The engine reserves a source seam for it; no remote-director implementation ships.
- **NightTrace is not a cloud product.** No backend, no account, no sign-in, no network call. No generative AI and no cloud AI anywhere in the product, at any version.
- **NightTrace is not an AR product.** No ARKit-dependent gameplay, no LiDAR requirement.
- **NightTrace is not a 3D engine.** No expensive 3D environments, no real-time rendering pipeline.
- **NightTrace is not a user-generated-content product.** No chat, no monster marketplace, no user-submitted content. `[OVERRIDE]` The owner's brief initially listed these as out of scope and the brainstorm retained the exclusion.
- **NightTrace is not a kid's toy.** Not targeted below 12, not designed around jump scares, and not a physiological stress device.
- **NightTrace is not a heart-rate or biometric product in v1.** `[NON-GOAL for MVP]` No biometric integration.

---

## 6. MVP Scope

**A scope-honesty note before the lists.** "MVP" here means **the scope of the first shipped version**, and that is a materially larger thing than the delivery plan's own day-30 checkpoint. The source plan's thirty-day milestone delivers a four-tab loop, a real report, a Share Card, two tools, and a signed build — and its own documentation is explicit that this is *not* the ship date. Camera, Tracker, Sky, the three non-ghost creature drops, accessibility, battery hardening, and store readiness land in a following window, putting shippable v1 at roughly day 40–45. Anyone estimating from this section should read it as "what version 1 contains," not "what fits in thirty days," or they will under-plan by roughly a fortnight. `[ASSUMPTION]` See §9 A-10.

### 6.1 In Scope

- **Four Hunts** — Ghost, Bigfoot, Shadow Person, Alien — each with its own Archetype, verb, pacing, sensory channel, unique failure state, and objectives.
- **Seven tool surfaces** — EMF, Radar, Voice, EVP, Camera, Tracker, Sky — against five verbs, all inside a live Session.
- **The Investigation Engine** — seeded generation, five-phase pacing, silence floors, cooldowns, anti-repeat rules, tension state, First-Run Directive, and the four named no-event outcomes.
- **Authored content** — the narrative template bank, the Spirit Box word banks, the daily Anomaly set, the directive pool, the negative-space bank, and the twelve categories of sound. `[NOTE FOR PM]` This is listed as a scope line deliberately and not as a footnote: the engineering review found that content authoring appears in **none** of the delivery plan's forty-nine tickets, and this app's entire perceived quality rests on written words and recorded sound. See OQ-10.
- **Evidence and Triage** — the evidence kind set (enumeration pending, see OQ-11), certainty bands, signature convergence, the triage ritual, status derivation.
- **The Case Report** — the hero screen, with its masthead, status seal, stat row of counts and an activity band, signature strip, narrative account, souvenir reel, ledger, negative space, investigator note, and conditions footer.
- **The Share Card** — one composition, watermark-free, perceptually identical on re-render, no attribution of any kind.
- **The Field Journal** — Overview / Phenomena / Evidence / Cases, private by default, with export and deletion.
- **Investigator Clearance** — five ranks, advanced on cases sealed, Phenomena documented, and Signatures matched.
- **Home and the Daily Anomaly.**
- **Field Note mode.**
- **Onboarding and claims compliance** — the four-screen onboarding, the non-skippable entertainment notice, the build-failing banned-term lint, and an offline-clean cold install.
- **Full sensor fallback coverage** — every sensor channel degrades without blocking, including denied permissions, absent hardware, and an uncharted hunt.
- **Accessibility baseline** — VoiceOver and TalkBack navigability for the report and journal, Dynamic Type to 200%, Reduce Motion honoured, contrast targets met.
- **An intensity system** with four levels, locked per case.
- **On-device persistence** with crash-safe evidence commits and session resume.

### 6.2 Out of Scope for MVP

- **Paywall, purchases, subscriptions, and advertising.** Deferred at the owner's instruction. Reason: monetization is not on the critical path to proving the loop. `[NOTE FOR PM]` This is emotionally load-bearing in the other direction — the owner may want a decision recorded on whether purchase seams stay in the schema now to avoid a migration later.
- **Director Mode and any multiplayer.** Deferred to a later version; the engine source seam is the only artifact. `[NOTE FOR PM]` The source contract's own position is that this is "pure seam work with no user-visible effect today."
- **The global shared-seed night.** Deferred; storage seam reserved only.
- **Additional creature content** — Mothman, Werewolf, Lake Monster, and further Phenomena. Deferred to content drops, which is the point of the archetype model: the test of the architecture is that shipping one requires no engine change.
- **Additional Share Card variants** beyond the primary case-file card.
- **Journal full-text search.** Deferred; filters by kind and Phenomenon remain.
- **Hidden badges.** Deferred; the criteria engine ships, the visible badge set ships, the hidden set does not.
- **iPad support.** Phone-first. `[NON-GOAL for MVP]`
- **Localisation.** `[ASSUMPTION]` See §9 A-5 — v1 is English-only; the source contract contains no i18n plan and only a single-wordbank locale column. This should be confirmed, because retrofitting localization into an app whose central mechanic is a written word bank and a hand-tuned narrative template bank is materially more expensive than planning it now.
- **Analytics beyond the six core events.** The source contract defines twenty; the brief named seven. `[ASSUMPTION]` See §9 A-6.
- **Real weather integration.** Excluded permanently — a weather API would be a network call, and the app makes none. A local barometer proxy substitutes where available.

---

## 7. Success Metrics

Stakes are launch-public, so these are quantitative. Every metric cross-references the FRs it validates. Counter-metrics are load-bearing: they exist to stop the natural instinct to make the app *louder* in order to move a number.

**Primary**

- **SM-1**: **Share rate** — the fraction of sealed Cases that produce a shared Share Card. **Target: ≥ 25%.** This is the product's single deciding number, because it is the growth loop's only real test: if a stranger does not send the card, nothing else about the app matters. The target is the source design's own number, not a reduction of it — the source's stated failure reading applies verbatim: below target, the report is not beautiful enough or the share flow has friction, and the fix is one of those two things. Validates FR-22, FR-24.
- **SM-2**: **D7 retention** — the fraction of new users returning seven days after first launch. **Target: ≥ 25%.** Validates FR-25, FR-30, FR-9. `[NOTE FOR PM]` **This target is asserted, and it is in tension with the design laws. It is recorded as a tension rather than quietly lowered**, because the tension is the finding: the app ships with no notifications, no enforced streak (FR-29), no time-based progression (FR-28), no social surface (FR-26), no advertising, and a counter-metric (SM-C4) that forbids optimizing daily opens. Every mechanism that normally produces a 25% D7 has been deliberately removed, and the three return hooks that remain are the Anomaly line, the unsealed-case indicator, and the Signature archive's gaps. **The honest reading is that SM-2 is a hope, not a forecast.** It is retained at the source's number because lowering it would hide the problem without addressing it, and it should be re-read after the first cohort with the question *which of the three hooks is actually doing the work* — not with a decision to add notifications.
- **SM-3**: **First-session completion** — the fraction of new users who seal a first Case. **Target: ≥ 55%.** A first-run user who abandons before sealing never sees the hero screen, which means they never see the product. Validates FR-3, FR-9, FR-22. `[NOTE FOR PM]` This number and SM-2 together describe a funnel that loses roughly half of installers before the hero screen and three quarters of the rest within a week. That is a large expected loss to state flatly, and it is stated flatly because the alternative is a target nobody believes. The leading candidate cause of the early loss is not FR-3 or FR-2 in isolation but their combination with **FR-9**: a mandatory calibration, place name, and intention form, then a hold gesture, then a mandated silence floor — cost and delay front-loaded onto the user with the least reason to trust the app. If SM-3 misses, the first thing to examine is what the first ninety seconds give back, not how much silence they contain.
- **SM-4**: **Encounter rate, non-first-run** — the fraction of sessions producing an Encounter. **Target: 42–58%.** This is a *band*, not a floor. Below it the app reads as broken; above it encounters become routine and stop being memorable. Validates FR-2, FR-4, FR-6.

**Secondary**

- **SM-5**: **Report view rate** — the fraction of completed sessions whose Case Report is opened. **Target: ≥ 90%.** Validates FR-22.
- **SM-6**: **Triage engagement** — the fraction of sealed cases where the user triaged at least half their Evidence. **Target: ≥ 60%.** Validates FR-20. `[NOTE FOR PM]` If this runs low, the likely cause is friction rather than disinterest, and the fix is to make triage faster, not to make it mandatory.
- **SM-7**: **Silence holds** — the fraction of sessions reaching the `ENCOUNTER_WINDOW` phase without producing an Encounter. **Target: 25–40%.** A window that opens and closes empty is the clearest evidence the engine is protecting uncertainty rather than spending it. Validates FR-2.
- **SM-8**: **Claims cleanliness** — count of banned-term lint failures, **plus** the count of claim leaks found by the surfaces the lint cannot read. **Target: zero on both counts.** Validates FR-33. `[NOTE FOR PM]` As originally written this metric was circular: it measured the lint's coverage and reported it as the product's honesty, so it would have read a clean `0` while images, mechanics, and juxtapositions leaked claims the lint is structurally blind to — a captured frame, a Sky capture stripped of its generated label, a proximity ladder driven by the user's own walking. The second count has no automated source, which is the point: it is a review item on every release, discharged against the enumerated blind spots (images, mechanics, juxtaposition, visual hierarchy, and the sum of individually-safe sentences) rather than inferred from a passing build.

**Counter-metrics (do not optimize)**

- **SM-C1**: **Raw session count and session length.** Do *not* optimize. If sessions get longer or more frequent because the app emits more, the engine has started spending uncertainty to buy engagement, which is the failure this product exists to avoid. Counterbalances SM-2 and SM-4.
- **SM-C2**: **Emission volume per session.** Do *not* optimize upward. A rising emission count with a flat SM-1 means the app is getting noisier without getting better. The correct response to a flat share rate is better report quality, never more events. Counterbalances SM-4.
- **SM-C3**: **First-run Encounter rate.** Held at 100% by FR-3 and must *not* be extended past the first Case. Letting the guarantee leak into later sessions would convert the product into the slot machine it was designed to avoid. Counterbalances SM-3.
- **SM-C4**: **Time-in-app and daily opens.** Do *not* optimize. The Anomaly line exists to give a reason to return, not to manufacture a habit loop; an enforced streak is a dark pattern and a rising daily-open count paired with flat SM-1 indicates the app is farming attention rather than producing moments. Counterbalances SM-2.

---

## 8. Open Questions

- **OQ-1. The percentage on the Case Report. `[CLOSED — 2026-10-04]`** Raised by adversarial review and decided by the owner the same day. **Outcome: percentages are removed from the product entirely; the Case Report shows counts and an activity band.** The reasoning is recorded here rather than deleted, because it is the kind of decision that gets re-proposed by someone who has not seen the argument:

  A count is a fact about the session — `EVIDENCE 05` asserts that five things were logged, which the app can verify and the user can too. A percentage is a claim about a *quantity being compared to something*, and that something is always a denominator the app would have to invent. So `91%` obliges the app to describe a measurement it is not making, and no choice of caption fixes it, because the problem is the number's form rather than its label. The containment argument failed for a second, independent reason: the Share Card is composed from the report, so the number was never confined to the screen that carries the disclaimer — it rode out to the most-distributed surface in the product, which arrives with no framing at all.

  **What was kept:** the owner's instinct that the report should feel *instrumented* rather than soft. The stat row keeps its counts and its activity band; evidence strength is expressed as `COMPELLING` / `SUGGESTIVE` / `AMBIGUOUS`; the bands, the Signature strip, and the stamped status word all do the work the percentage was doing, without asserting anything. See FR-22.

  **What this buys:** the product's hero screen is now clean under its own #1 risk. The skeptic's thirty-second inspection finds counts, bands, an explicitly-simulated status, and a disclaimer — and nothing to catch it on.

- **OQ-2. Low-power battery budget.** The source contract leaves the low-power Session battery target as a number deferred to the product side. It needs a concrete target before the sampling ladder is locked, because the ladder's shape determines what the app can promise.

- **OQ-3. Whether purchase seams survive a free MVP.** If monetization may return in v1.x, the content model should keep a paywall-tier column and the Hunt gate now, at near-zero cost, rather than migrating users later. If it will not return, the seams should be deleted. **Needs a stance, not a schedule.**

- **OQ-4. Triage's effect on status feels right but is untested.** Deriving status partly from the user's own triage verdicts (FR-21) is what makes the conclusion theirs. It may also mean a user can accidentally talk their way out of an `UNEXPLAINED`, and it may make triage feel compulsory. **Needs:** prototype evidence from the first playable report.

- **OQ-5. Direction vs. discovery.** How much the app may direct the user — sweep here, ask a question — before an investigation starts to feel like a checklist rather than discovery. The four Hunts' objectives sit exactly on this line.

- **OQ-6. Encounter rate calibration in the field.** The 42–58% band (SM-4) is a tuning target derived from simulation, not from real users. It should be re-derived after the first hundred real sessions, and specifically checked against the risk that a *correct* rate still reads as "broken" to a user who has had two quiet nights in a row.

- **OQ-7. Localisation timing.** Whether v1 ships English-only with localization retrofitted, or whether the narrative template bank and word banks are structured for translation now. See A-5.

- **OQ-8. The Anomaly line's shelf life.** A single authored line per day is cheap and effective early, but a daily user will exhaust a hand-written set quickly. Whether the set is large enough to survive a year, or whether the line should be seeded combinatorially, is unresolved.

- **OQ-9. The Daily Anomaly may be mechanical, not copy.** The implementation contract applies a session directive from the Anomaly and allows it to carry a guaranteed encounter. This PRD frames the Anomaly as a line of text (FR-30). If the mechanical reading is correct, then FR-3's claim to be "the single deliberate departure from the engine's honesty" is false and SM-C3 must be rewritten, because the engine would be making favorable draws on other nights too. **Needs:** a decision on whether the Anomaly is atmosphere or mechanism. This is a small question with a large blast radius — it decides whether first-run sympathy is a one-off or a standing system.

- **OQ-10. Content authoring is unbudgeted.** The delivery plan's 49 tickets contain no line item for writing the narrative template banks, the Spirit Box word banks, the daily Anomaly set, or sourcing the twelve sound categories. The engineering review flags this as a real omission rather than a rounding error: the app's entire perceived quality rests on authored text and audio, and if it is not scheduled it will be improvised. **Needs:** a content plan with its own estimate before the schedule is treated as real.

- **OQ-11. Evidence kinds have no agreed list. `[BLOCKING — CONTENT AUTHORING]`** FR-18 states its requirement without asserting a count, because the count could not be sourced. The three available answers disagree:

  - **`02` (implementation contract)** enumerates a closed union of **10**: `emf_swing`, `voice_capture`, `word_bank_hit`, `photo_anomaly`, `shadow_pass`, `footprint`, `tree_knock`, `sky_light`, `user_note`, `user_audio`. This is the only *enumerated* list in either document, and it is the one a schema would be built from.
  - **`01` (product/GDD)** names **20 distinct kinds** across the four Hunt definitions — six per Hunt (Ghost: `unknown_voice`, `evp_segment`, `emf_stir`, `shadow`, `visual_encounter`, `cold_spot`; Bigfoot: `footprint`, `broken_trail`, `vocalization`, `movement`, `silhouette`, `proximity_spike`; Shadow Person: `shadow`, `motion`, `camera_distortion`, `silhouette`, `peripheral_event`, `visual_encounter`; Alien: `unknown_signal`, `sky_object`, `electromagnetic_anomaly`, `transmission`, `visual_encounter`, `bearing_lock`) — with overlaps across Hunts, which is what brings the distinct total down.
  - **`01`'s own asset budget** lists **14** evidence glyphs and says "one per evidence type," so the product document contradicts its own Hunt definitions.

  **Needs:** an enumerated list agreed once, before content authoring starts. It is blocking, and it is a *small* piece of work with a large blast radius: evidence kinds are the unit that content authoring, the glyph set, the Signature strip, the triage reasons, the report ledger, and the analytics `evidence_found` event all key off. The most likely resolution is that `02`'s 10 is the *engine* vocabulary and `01`'s per-Hunt names are *content-level* aliases that map onto it — which would make both correct and would need to be written down as a mapping rather than as a merged list.

- **OQ-12. Triage asymmetry. `[CLOSED — 2026-10-04]`** Raised by input reconciliation and closed in the same pass. The asymmetry is now stated as a structural consequence of FR-20: marking items explained moves a Case toward `EXPLAINED`, while marking them unexplained cannot manufacture an `UNEXPLAINED`, because FR-21 additionally requires an Encounter. This is what stops the verdict being brute-forceable by triaging everything one way, and it is now a testable requirement rather than an implicit property. The interface still must not explain it.

- **OQ-13. The three per-Hunt defining mechanics. `[CLOSED — 2026-10-04]`** Raised by input reconciliation and closed by promotion. All three are now requirements: **FR-37** (the Observer inversion, including the deliberate refusal to teach it), **FR-38** (Bigfoot's posture gating), and **FR-39** (the Mimic/Alien separation rule, enforced as a content-validation test over the emission bank). Without these the four Hunts were four parameter sets distinguished only by numbers, which is precisely the "40 shallow instead of 4 deep" failure the design laws exist to prevent.

- **OQ-14. Share Card decisions. `[CLOSED — 2026-10-04]`** Raised by input reconciliation and closed by promotion. All three are now requirements: the user-authored note sheet (four seeded options plus an optional sixty-character line of the user's own) and the media-denied rule (FR-24), and the slow pulse on an unidentified Signature tile, which the source calls the product's strongest single return hook (FR-19).

- **OQ-15. Whether the tool row should express the seven surfaces as one row on every device.** The source design specifies a horizontally scrolling row of seven 44 px targets. At 200% Dynamic Type on a small device that row is the most likely place in the product to break, and the accessibility section caps it at 140% rather than solving it. **Needs:** a decision on whether the cap is the answer or whether the row needs a different form factor at large type sizes.

- **OQ-16. No stated rule for resolving source disagreements.** §10 records six conflicts found during this pass and the side this PRD took on each. Four were resolved on product grounds; two are unresolved. There is no stated rule for which document wins, so the same conflicts will be re-litigated during architecture and epics unless a precedence is ratified now. **Needs:** a yes-or-no on the rule this PRD actually applied — **`01` wins on anything the user experiences; `02` wins on anything the engine or storage does; and where they conflict on a shared contract (phases, evidence kinds, intensity), the value is a product decision and `01` wins.**

---

## 9. Assumptions Index

Every `[ASSUMPTION]` from this document, surfaced for explicit confirmation. Each carries the condition that would invalidate it.

- **A-1** (from §5) — **"Free" is the launch state for MVP, and purchase seams may or may not be kept in the schema for a later version.** The owner's instruction was "free for now." *Invalidated if:* monetization is expected within the same milestone window, in which case the content model and the Hunt gate must retain paywall seams now rather than migrating later. See OQ-3.
- **A-2** (from §4.6) — **`[RESOLVED — no longer an assumption]`** This entry originally assumed that the Case Report's percentage could be justified as the app's own case-file index rather than a sensor measurement. Review showed the framing does not survive: a percentage carries a denominator, and the denominator is what makes it read as a measurement. The owner removed the percentage rather than defend it. **The decision is recorded in §8 OQ-1 (closed), and the term must not reappear.** A-2 is retained here as a tombstone so that a downstream reader who finds the framing in an older draft knows it was considered and rejected, not overlooked.
- **A-3** (from §4.5) — **Deriving Case status partly from the user's triage verdicts (FR-21) makes the report feel earned rather than announced.** *Invalidated if:* playtesting shows users feel the report's conclusion is theirs to get wrong, or that triage reads as a chore gating the hero screen.
- **A-4** (from §4.1) — **The First-Run Directive is undetectable as a special case.** It guarantees a first Encounter while mandating five minutes of silence first. *Invalidated if:* reviewers can tell a first session apart from a later one — a detectable guarantee is worse than no guarantee, because it teaches the user the app has a tell.
- **A-5** (from §6.2) — **v1 ships English-only, with localization retrofitted.** No i18n plan exists in any source document; the content model has a single locale column. *Invalidated if:* non-English launch is in scope, in which case the narrative template bank, the Spirit Box word banks, and the Anomaly set must be restructured for translation *before* content authoring begins, not after.
- **A-6** (from §6.2) — **Seven analytics events are sufficient for v1, minus the ones that cannot fire while the app is free.** The owner's brief §36-O named seven: `hunt_started`, `hunt_completed`, `evidence_found`, `encounter_triggered`, `report_shared`, `paywall_viewed`, `subscription_started`. The implementation contract defines twenty; the design doc defines 56. **The two purchase events cannot fire in a free MVP**, leaving five live events. This is a problem, not a saving: SM-5, SM-6, and SM-7 cannot be measured with five events. *Invalidated if:* the five are relied on as sufficient — they are not, and at least the report-view, triage, and phase-reach events named in the implementation contract must be added back before v1 ships, or the PRD's own success metrics become unmeasurable.
- **A-7** (from §4.8) — **Journal deletion is necessarily local, and the deletion screen says so.** With no backend and no account, the app cannot reach content the user has already shared. *Invalidated if:* the product later gains sync, at which point the deletion promise must be restated to match.
- **A-8** (from §4.2) — **The four Hunts' objectives, length bands, and tool bindings are product decisions, not tuning.** Recorded as requirements so downstream tickets cannot flatten the four Hunts toward a common shape. *Invalidated if:* the owner intends these as starting points open to revision during implementation.
- **A-9** (from §4.7) — **The Share Card's re-render requirement is perceptual identity, not byte identity.** The card is produced by rasterising a native view tree. *Invalidated if:* anything downstream depends on the bytes matching — for example a verification feature, a server-side check, or a claim that a card is unmodified. None is planned, but the requirement as written would have implied one.
- **A-10** (from §6) — **"MVP" in this document means the first shipped version, not the delivery plan's day-30 checkpoint.** The two differ by roughly a fortnight of work. *Invalidated if:* the owner intends to ship at the day-30 checkpoint instead — in which case §6.1 is wrong, three of the four Hunts do not ship, and FR-11 through FR-17 would need explicit per-tool ship dates.
- **A-11** (from §8 OQ-9) — **The Daily Anomaly is a line of copy, not a session directive.** The implementation contract's reading would let the Anomaly carry a guaranteed encounter, which would make the engine favorable on ordinary nights too. *Invalidated if:* OQ-9 resolves the other way, in which case FR-3's uniqueness claim and SM-C3 both fail and must be rewritten, and FR-30 must be restated as a mechanic.
- **A-12** (from §8 OQ-11) — **The engine's evidence-kind vocabulary and the Hunts' evidence-type names are two layers, not one list.** `02`'s ten kinds would be the persisted vocabulary, and `01`'s per-Hunt names content-level aliases that map onto them. *Invalidated if:* the intent is a single flat list, in which case one of the two source enumerations is simply wrong and the other must be adopted wholesale.

---

## 10. Source Conflicts Requiring Resolution

These are places where the two source design documents disagree with each other. This PRD picked a side in each case, on product grounds, but the choice is recorded here so it can be reversed deliberately rather than discovered by a build failure. **A schema built from the implementation contract would not match this PRD on any of the first four rows.**

| # | Item | Product/GDD doc (`01`) | Implementation contract (`02`) | This PRD | Note |
|---|---|---|---|---|---|
| 1 | Intensity levels | 4 — `Ambient`, `Present`, `Intense`, `Ritual` | 3 — `gentle`, `standard`, `intense`, plus a schema CHECK constraint | **4** (FR-10) | The implementation's CHECK constraint would reject the PRD's levels |
| 2 | Clearance ranks | 5 | 6, differently named | **5** (FR-28) | |
| 3 | Evidence kinds | **Three different answers internally** — the four Hunt definitions name 20 distinct kinds in total, while the asset table budgets **14** glyphs | **10**, enumerated as a closed union | **Unresolved** — no count asserted; see OQ-11 | This is not a two-document disagreement, it is a three-way one, and `01` disagrees with itself |
| 4 | Session phases | 5 | 6 | **5** (FR-4, addendum C.8) | **Structural:** the phase count is baked into the run-length-encoded replay digest, so changing it after ship breaks replay |
| 5 | Confirmed / Contested evidence | Present — planted false evidence the user disproves at triage | Present | **Retained** as FR-34 | Was missing from the first draft of this PRD; restored |
| 6 | Daily Anomaly | Copy plus a session directive | Applies a directive; may carry a guaranteed encounter | **Unresolved** — see OQ-9 | If mechanical, FR-3's uniqueness claim fails |

**Two rows are unresolved, and both are open questions rather than PRD defects:** row 3 (evidence kinds) is **OQ-11**, and row 6 (Daily Anomaly) is **OQ-9**. Rows 1, 2, 4, and 5 were decided on product grounds and are stated as requirements. The precedence rule this PRD applied when choosing is proposed for ratification in **OQ-16**.

**Why this section exists at all:** the first four rows are contract-level values — an enum, a CHECK constraint, a phase count — and every one of them would have been resolved silently by whoever wrote the first schema. The phase count in particular is not a preference: it is baked into the run-length-encoded replay digest, so a build that adopts `02`'s six phases cannot replay a session recorded against this PRD's five. That is a defect that surfaces as corrupt replays weeks after it is introduced, which is considerably more expensive than a disagreement surfaced now.

