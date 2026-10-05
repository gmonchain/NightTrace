# NightTrace — Design Brief for AI Designer

> **How to use.** Paste everything below the `---` into your AI design tool (Stitch, v0, Claude, Figma AI, or a human designer's brief). Save whatever comes back into this folder.
>
> **Prepared by:** bmad-ux · 2026-10-04 · NightTrace.
>
> **What this brief is:** a complete structural and behavioral inventory of the app — every screen, every element, in order, with its exact copy, its interactions, and its states.
>
> **What this brief deliberately is NOT:** any visual direction. No colours, no fonts, no spacing, no shadows, no motion values, no styling rules. The visual language is yours to invent from the product's context. There is one exception, and it is a product constraint rather than a style one: the app is dark by necessity (see §3, Constraint 6) — everything else on the visual side is open.

---

# PART I — CONTEXT AND LAW

## 1. What NightTrace is

A **paranormal field journal**. The user opens a case, walks into a place, and works it with instrument-like tools. At the end they receive a **Case Report**: a sealed document describing their night.

The organizing idea, stated once and load-bearing throughout:

> **The phone is not a detector. It is a case file that writes itself.**

Detection implies proof, and proof can be falsified. Investigation implies process, and process cannot. The app's sensors — microphone, camera, magnetometer, GPS, clock, motion — are **material, never measurement**. Nothing the app shows is proof of anything. That is the entire point, and it is why the app survives the thirty-second skepticism test that kills every other app in its category.

Four consequences shape every screen:

1. **The Case Report is the hero screen and the growth engine.** Every tool exists only to generate material for it. The loop is *tools generate → the report packages → sharing recruits → new investigators generate more*.
2. **The app must be good when nothing happens.** Most nights produce nothing. A session that records nothing still produces a complete, sealed report — and the report says so plainly, without apology. An app that only pays off on a hit trains the user to expect hits, and an expected hit is not a mystery.
3. **Uncertainty is the product.** Predictability is the primary anti-metric. If the user can predict when something happens, the product is dead. No progress bars, no timers that promise, no locked silhouettes, no completion percentages.
4. **Absence is meaningful.** Silence is a designed feature, not a gap. The app narrates silence rather than leaving it blank.

## 2. The user's arc

A session is a sequence, and the sequence is the product:

> **curiosity → tension → anticipation → uncertainty → surprise → collection → progression → a shareable moment**

The first five beats belong to one night. The last three belong to the weeks after it. Every screen should know which beat it serves.

## 3. Hard constraints — these are product law, not preferences

Violating any of these fails the design regardless of how good it looks.

1. **No percentage sign. Anywhere. Ever.** Not `91%`, not `ACTIVITY 93%`, not a progress ring that reads as a percentage. A percentage has a denominator, and a denominator turns a fact about the session into a claim about the world. This was designed in, reviewed adversarially, and removed. There is no carve-out on any surface.
2. **No number that could be read as a measurement.** The only numerals permitted anywhere are: **counts of things that happened** (`EVIDENCE 07`, `ENCOUNTERS 01`) and **elapsed session time** (`DURATION 18:42`). Those are facts about the session, not claims about the world. Everything else is qualitative.
3. **Qualitative bands replace every score.**
   - Case status: `UNEXPLAINED` · `INCONCLUSIVE` · `EXPLAINED`
   - Activity: `LOW` · `MODERATE` · `HIGH`
   - Evidence certainty: `AMBIGUOUS` · `SUGGESTIVE` · `COMPELLING`
   - Proximity: `COLD` · `WARM` · `CLOSE` · `NEAR` · `HERE`
   - Bearing: one of eight compass points + a range band. **Never metres, never any unit.**
4. **This exact line appears in the footer of both the Case Report and the Share Card, always:**
   `An investigation experience. Not a measurement.`
5. **The Share Card carries no watermark, no URL, no QR code, no app-store badge, no "made with" line, and no attribution of any kind.** Nothing is ever appended to the user's output.
6. **The app is dark. There is no light mode.** It is a tool used at 11pm in a dark room; a bright surface would wreck the user's night vision and destroy the contrast the encounter moments depend on. You choose the palette — but it must live on the dark end.
7. **The app never winking.** No `(it's just a game!)`, no playful aside, no humour, no exclamation marks, no emoji. The framing lives in onboarding and About — never in the moment.
8. **The app never asserts.** Copy says `The record shows movement`, never `something is moving.` The full banned-term list is in §4.
9. **The app never explains its own mechanics.** The user is never told about phases, probability, rarity, or how anything is generated. Ever.
10. **No fake telemetry.** No scanning loops, no progress bars that imply work in progress, no "analysing…" states. The app never pretends to be measuring something.
11. **No social proof, no leaderboards, no comparisons between users, no public profiles, no feed.** Ever.

## 4. Banned terms and banned copy patterns

The shipped app runs a build-failing check on these strings. Treat them as hard.

**Banned words:** `detect` · `prove` · `proof` · `confirm` · `verify` · `authentic` · `real ghost` · `scientific` · `science` · `thermal` · `radiation` · `Geiger` · `accuracy` · `algorithm` · `AI` · `%` · `metres`/`meters` (as distance) · `haunted` (as fact) · `evidence of the paranormal`

**Banned patterns:**
- Any statistic, user count, award, or social proof
- Any claim about the user's neighbourhood or about other users
- Any "X% accurate" or "99% of users"
- Any warning language about health conditions in the main flow

**Approved vocabulary:** `paranormal` · `ghost hunt` · `cryptid` · `investigator` · `field journal` · `EMF` · `EVP` · `spooky` · `adventure` · `night`

**The word "ghost" appears only as a Hunt name.** Inside a session the vocabulary is `signal`, `contact`, `movement`, `the record`.

**The term `Anomaly Index` is retired** and must not reappear in any form.

## 5. Voice and tone — applies to every visible string you write

Write all copy yourself in this voice. **Do not use lorem ipsum** — the exact words are part of the design.

- **Never assert.** `The record shows movement` — not `something is moving`.
- **Never wink.** No humour, no asides, no exclamation marks, no emoji.
- **Never explain the mechanic.**
- **Hedge is craft, not weakness.** `Possible` · `unconfirmed` · `unsigned` · `no match on file` · `the record is unclear`
- **Short sentences at high tension.** Maximum nine words on any single line inside a session.
- **Silence is narrated, not empty.** The app must never tell the user what they are about to find.
- **Absence gets a line, not an apology.** `Nothing was recorded tonight. That is a result.`
- The register is a **field log kept by a careful, slightly detached observer** — forensic, patient, unexcited.

## 6. Accessibility floor — behavioral, non-negotiable

- **Screen readers:** the Case Report and Field Journal must be fully navigable with VoiceOver and TalkBack. Live regions announce **only** evidence capture and phase change — an over-eager live region interrupts the user mid-flow more often than it informs them.
- **Hidden values are never announced.** Several internal values drive pacing but are invisible to sighted users; announcing them to assistive technology would be both an accessibility defect and a tell.
- **Dynamic Type** supported to **200%**, with the intensity rail and tool row capped at **140%**.
- **Reduce Motion:** cross-fades replace transitions, sweeping animations become static, glitch effects are disabled and re-routed to audio, and animated dots move statically at 0.5 Hz.
- **Orientation:** portrait-locked, **except the Camera and Sky tools**, which rotate.
- **iPad is not a target.** Phone-first.
- Every empty state carries **exactly one action**. There are no dead ends anywhere in the app.

---

# PART II — NAVIGATION ARCHITECTURE

## 7. The four tabs

Four tabs, and only four. There is no Equipment tab and no Settings tab — tools live inside a live session, and settings live inside Profile.

| Tab | The one job | It never does |
|---|---|---|
| **Home** | Answer *"what is happening tonight?"* and get the user into a case in one tap | List tools; show a hunt grid of more than five entries |
| **Investigate** | Choose a phenomenon; show tonight's conditions | Start a session directly — it always routes through the Brief |
| **Field Journal** | Show the accumulated record: cases, phenomena, evidence, the signature archive | Be a social surface |
| **Profile** | Settings, intensity, data ownership, the entertainment notice, clearance | Hold gameplay |

**Tab bar:** labels always visible.

**The only badge in the product:** a single hairline dot on **Field Journal** whenever a case is unsealed. An unfinished case is the strongest return hook the app has, and it must be visible from anywhere.

## 8. Full screen tree

```
Onboarding
  ├── Screen 1 — "Nothing Here Is Proof"
  ├── Screen 2 — "Your Case Is Local"
  ├── Screen 3 — "Choose Your Night"
  └── Screen 4 — "Ask Only When Needed"

Tabs
  ├── HOME
  ├── INVESTIGATE
  ├── FIELD JOURNAL        (segmented: Overview · Phenomena · Evidence · Cases)
  └── PROFILE

Hunt
  ├── HUNT BRIEF            (tab bar hidden — the ritual gear-up)
  └── SESSION SHELL         (immersive; tick host; tool carousel)

Tools (pushed above the session, full-screen, one at a time)
  ├── EMF   ├── RADAR   ├── VOICE   ├── EVP
  ├── CAMERA   ├── TRACKER   └── SKY

Case
  ├── CASE REPORT           (the hero screen)
  ├── SHARE CARD            (composer + system share sheet)
  └── EVIDENCE DETAIL       (single item + triage verdict)

Sheets & modals
  ├── Intensity             ├── Low power       ├── Permissions
  ├── Triage                ├── Confirm         ├── Leave the field
  └── About & entertainment
```

## 9. Presentation rules

| Surface | Presentation | Dismissed by | Notes |
|---|---|---|---|
| Tabs | Persistent tab bar | — | Blur hides the bar entirely |
| Hunt (Brief / Session) | Push, **tab bar hidden** | Swipe-back (iOS) / explicit `Leave` (Android) | A swipe-back during a session triggers the **Leave the field** sheet, never a silent discard |
| Tools | Push **above** the session | Pop | Exactly one full-screen surface at a time. The camera preview must unmount on pop |
| Case Report | Push over tabs, tab bar hidden | Explicit close | The report is a **destination, not a modal**. It should feel like a document |
| Sheets | Detents as noted | Swipe / scrim / explicit | Never stacked two deep, except Triage over Session |

## 10. Navigation invariants — these are testable

1. **A live session is never more than one gesture from its tools.**
2. **There is no path that ends a session without offering `Seal & file`.**
3. **The report is always reachable from the Journal**, and always reachable at the end of a session.
4. **No dead ends.** Every empty state carries **exactly one action**.
5. **Intensity is locked during a case.** See §15.3.

---

# PART III — SCREEN BY SCREEN

## 11. Onboarding — four screens

**Purpose:** establish the framing before any sensor is touched, set intensity, and teach the permission philosophy. It is a tone-setter and a legal shield in one flow.

**Entry:** cold install, first launch.

**Shared template, top to bottom:** a small caps kicker → a display headline → body → an optional link row → a primary button pinned above the safe area. Four hairlines across the top track progress.

### Screen 1 — `Nothing Here Is Proof`
- **Body:** `NightTrace is a paranormal investigation experience. It does not measure, prove, or detect anything supernatural — nothing can. It gives you the tools, the ritual, and the case file.`
- **Primary button:** `I understand`
- **This is the only screen with no back.** Acknowledgement is required.

### Screen 2 — `Your Case Is Local`
- **Body:** `Every case is generated from where you are, what hour it is, and what your device senses around you. No two cases are the same. Nothing leaves this phone.`
- **Link:** `What we never collect` → opens the About sheet
- **Primary button:** `Continue`

### Screen 3 — `Choose Your Night`
- Four intensity levels (§15.1), default `Present`
- A **Haptics** toggle (default on)
- A **Reduce motion** toggle (default follows the OS)
- **Body beneath the selector:** `Higher intensity means more signals. It never means a guaranteed encounter.`
- **Primary button:** `Continue`

### Screen 4 — `Ask Only When Needed`
- **Body:** `NightTrace asks for a sensor at the moment a tool needs it — never at launch. Every hunt is playable if you say no.`
- **Bullet list:**
  - `Microphone — used by Voice and EVP`
  - `Motion — used by Radar and EMF`
  - `Camera — used by the Camera tool`
  - `Location — optional, improves the place seed`
- **Primary button:** `Enter NightTrace`
- **This screen fires zero permission prompts.** That is the point of it.

**Edge cases:** with Reduce Motion on, screens cross-fade rather than slide. At the largest text sizes the body clamps and scrolls; the button never leaves the screen.

**Exit:** `Enter NightTrace` → Home. No sensor initialisation, no prompt, no network. Total under twenty seconds.

---

## 12. Home

**Purpose:** answer *"what is happening tonight?"* and put the user into a case in one tap. It establishes the return hook without ever sending a notification.

**Entry:** the Home tab; app launch after onboarding.

**Elements, top to bottom:**

1. **Header** — `NIGHTTRACE` in small caps (left) · the **clearance chip** (right), reading `FIELD ASSISTANT`
2. **Anomaly of the Day** card — a single line of atmospheric text
3. **Featured Hunt** card — large, with an art plate
4. **`CONTINUE CASE` strip** — appears **only** when an unsealed case exists
5. **`RECENT EVIDENCE` rail** — a horizontal strip of tiles
6. **Conditions footer** — one line, e.g. `Tonight's conditions: dusk · rising pressure · quiet band`

**Interactions:**
- Featured card → Hunt Brief. **This is the one-tap path; it skips Investigate entirely.**
- Anomaly card → a sheet explaining the anomaly *in fiction* + `Investigate this` (routes to Investigate, pre-filtered)
- Evidence tile → that evidence item's detail
- **Pull-to-refresh is disabled.** There is nothing to fetch, and a spinner would break the illusion of a local instrument.

**States:**
- **Zero cases** → featured card: `GHOST INVESTIGATION` · `Indoor · Slow · Audio-led` · `Active tonight`; primary button `BEGIN BRIEF`. Empty rail reads `Nothing on file yet.` The whole Home screen is unchanged from any other night — the first launch is not a special mode, and it is not gated by anything.
- **Fresh install at 03:00** → conditions read `deep night`
- **Barometer unavailable** → the conditions line degrades to two facts (`deep night · quiet band`) and **never mentions pressure** — the app does not report the absence of something it never looked for

**The Anomaly is not shareable in v1.** It is one line of seeded atmospheric text, rotating on the local day key.

---

## 13. Investigate

**Purpose:** the hunt picker, and the honest display of scope. This is where the user sees that the app is *four deep phenomena, not forty shallow ones*.

**Entry:** the Investigate tab; also from the Home anomaly sheet, pre-filtered.

**Elements, top to bottom:**

1. **A vertical list of phenomenon cards** — a list, **not a grid**. Each card carries:
   - a silhouette plate on the left
   - the phenomenon name
   - a three-token meta row, e.g. `Indoor · Slow · Audio-led`
   - a state chip on the right, e.g. `READY`
2. **`FIELD NOTE`** entry — a compact row below the list, opening the three-minute mode (§24)
3. **Tonight's conditions**, repeated once

**The four phenomena:** `GHOST INVESTIGATION` · `BIGFOOT EXPEDITION` · `SHADOW PERSON` · `SKY CONTACT`. All four carry their own verb, environment, pace, channel, tool set, and unique failure state — see §16.

**Interactions:** tapping a card → Hunt Brief.

**State:** with zero cases, all four cards render and all four are selectable.

> **Design constraint — read this twice.** There are **no locked entries, no greyed-out rows, no silhouettes, no keyholes, no padlocks, no "unlock" copy, and no stated requirements** anywhere on this screen. A phenomenon the user has not yet encountered is simply **absent from the Field Journal's list** — it is not shown as a teaser. Do not add a progress ladder, a "coming soon" row, a tier badge, or a free/premium distinction. The product is free and complete; there is no paywall, no in-app purchase, no subscription, and no advertising anywhere in this version.

---

## 14. Hunt Brief — the ritual gear-up

**Purpose:** convert an app launch into a **threshold crossing**. Four small actions — calibrate, name, intend, hold — make the user co-author the case before it exists, which is what makes the eventual report feel like *theirs*.

**Entry:** Home featured card, or an Investigate card. Pushed with the tab bar hidden.

**Elements, top to bottom, single scrolling column:**

1. **Title** — e.g. `GHOST INVESTIGATION`
2. **Case reference** — e.g. `CASE NT-017`, pre-assigned
3. **`NAME THIS CASE`** — a text field. Placeholder `e.g. The Attic, Second Night`. Helper line: `Named cases are easier to remember. This is the name on the report.`
4. **`SET YOUR INTENTION`** — three chips in a row: `Ask` · `Watch` · `Wait`. Single-select, default `Watch`.
5. **`GEAR-UP`** — four full-width rows:
   - **Calibrate.** Copy: `Hold still. Establishing a quiet baseline.` A ring fills over five seconds. On completion the row's right side becomes a chip reading `Baseline set · quiet` or `Baseline set · noisy surroundings`. **Neither is a judgment.** Re-tappable.
   - **Torch.** `Torch off` by default indoors. Free and reversible.
   - **Room tone.** `Ambience on`. Toggling it off gives a **silent** session bed — a legitimate, scarier choice, and the app honours it.
   - **Duration.** `Auto-close after 30 min`. Options `10 / 20 / 30 / 45 / none`. An auto-close produces a **completed** case, not an abandoned one.
6. **Conditions summary** — three mono lines
7. **Primary button:** `HOLD TO ENTER THE FIELD`

**The hold is the ritual.** Press and hold for **800 ms**. A hairline fills left to right beneath the label; the label swaps to `Crossing over…` at the 400 ms mark. Releasing early cancels with a soft warning and leaves the Brief intact.

**States:**
- Calibration interrupted by backgrounding → restarts the ring from zero on return. It never fails.
- No magnetometer present → the ring completes in two seconds and the chip reads `Baseline set · inferred`.
- Hold interrupted by backgrounding → aborts silently and resets. **Entering the field must be a foreground act.**

**Exit:** the hold → Session shell. That transition is where the app requests the microphone *just in time*, if the hunt's tool set needs it.

---

## 15. Session shell

**Purpose:** the field itself. A persistent, chrome-minimal frame holding the tool carousel, the phase rail, and the evidence rail. **A cockpit, not a screen.**

**Entry:** auto-enter after the Brief's hold; also returned to by any tool pop.

**Regions, top to bottom:**

1. **Status rail (top)** — case reference in mono (left) · a **five-segment phase hairline** (centre) · elapsed `MM:SS` in mono (right) with a slowly breathing dot beside it
2. **Field (centre, full bleed)** — the active tool surface; or, in the default listening view, a large radial breathing ring with a state word beneath it: `QUIET` → `LISTENING` → `ACTIVE` → `CONTACT`
3. **Evidence rail** — appears only once evidence exists; sits above the tool row
4. **Tool row (bottom, horizontally scrolling)** — seven icon buttons; the active one carries an indicator. The seven are **EMF · Radar · Voice · EVP · Camera · Tracker · Sky**

**Interactions:**
- Tap a tool → push its full-screen surface
- Tap an evidence chip → that item's sheet
- Swipe down on the field → the **directive card** (the last directive, plus `I need a direction` which requests a fresh one)
- Tap the elapsed time → the **Low power** sheet
- Long-press the phase hairline → a read-only, deliberately vague explanation: `The record tends to move through five stages.`

**Directive strings seen on the rail** — note that these are verbs with no object, and they never name a target or a direction:
`Sweep the room slowly.` · `Wait.` · `Ask it something.` · `It said something.` · `Close the case when you're ready.`

**States:**
- **Backgrounded** → all channels off, camera inactive, engine paused, elapsed time frozen. A session does not advance while the phone is in a pocket — that would manufacture events with nobody present.
- **Foregrounded** → a two-second re-calibration grace period with no events
- **Incoming call** → treated as backgrounded
- **Low power toggled mid-session** → the rail gains a band glyph, the camera budget halves, and phase timing stretches slightly for the remainder

**Exit points:**
- `CLOSE CASE` → confirm sheet (`Seal the case now` / `Keep investigating`) → Case Report
- Swipe-back → the **Leave the field** sheet: `Seal the case now` (primary) / `Leave without a report` (destructive)
- **There is exactly one way out of a live session and it requires a hold.** Ending early is deliberate, not a back gesture.

---

## 16. The four Hunt behaviours

Each Hunt is a distinct behaviour with its own verb, environment, pace, channel, tool set, and unique failure state. **The user is never told their verb** — they learn it from how the hunt behaves.

| | **Ghost** | **Bigfoot** | **Shadow Person** | **Sky Contact** |
|---|---|---|---|---|
| **Title** | `GHOST INVESTIGATION` | `BIGFOOT EXPEDITION` | `SHADOW PERSON` | `SKY CONTACT` |
| **Meta line** | `Indoor · Slow · Audio-led` | `Outdoor · Fast · Visual-led` | `Indoor · Tense · Camera-led` | `Outdoor · Sky · Signal-led` |
| **The user's job (never shown)** | *Ask it something.* | *Don't look away.* | *Avoid being seen.* | *Stay ahead of it.* |
| **Tools** | Voice · EMF · EVP · Camera | Tracker · Camera · Radar | Camera · Radar · EMF | Sky · Camera · Radar |
| **Unique failure stamp** | `MISDIRECTED` | `GONE` | `NOTICED` | `CORNERED` |

**Objectives** appear inside the Brief. Every Hunt's objectives must be earnable **without** ever reaching an encounter — an encounter is a bonus, never the goal.

- **Ghost:** `Establish a room baseline` · `Ask it something` · `Record three kinds of evidence` · `Hold still for two minutes` · `Attempt a resolution`
- **Bigfoot:** `Calibrate the compass` · `Log three trail marks` · `Frame it` · `Cover the ground` · `Close the expedition`
- **Shadow Person:** `Kill the lights` · `Hold the camera on the dark` · `Stay still while it passes` · `Log a distortion` · `Get out clean`
- **Sky Contact:** `Sweep the sky` · `Align the device to a signal` · `Hold a signal lock` · `Log a transmission` · `Break contact`

**Failure is an outcome, not a loss.** A case that reaches a failure state still produces a complete Case Report. Four behavioural rules the designer must not smooth over:

1. **Shadow Person never teaches its mechanic.** In that hunt a `noticing` value rises against the user when the torch is on, the camera is live, or the user moves. Reaching the top ends the session early with the stamp `NOTICED`. **There is no tutorial, no hint, no tooltip, and no line of copy anywhere that connects standing still to safety.** The ending and the stamp *are* the teaching mechanism.
2. **Bigfoot's encounter can only be rendered if the camera is live** at the moment of resolution. It is suppressed otherwise — not downgraded, not replaced. The session still records that the window opened.
3. **Sky Contact's transmissions never contain words.** They render as a **pulse glyph row, never as text.** Words appear only under the Ghost hunt.
4. **Nothing ever says what is about to happen.**

---

## 17. The seven tools

Every tool lives **inside** a live session. **There is no equipment menu, no loadout screen, and no browsable tool outside a hunt.** Every tool surface must be reachable within one gesture, and **no tool may present a dead end — every empty state carries exactly one action.**

The five verbs, which the user learns by using the tools: **Sweep · Ask · Listen · Frame · Log**.

> **The single most important rule across all seven tools: no tool displays a number that could be read as a measurement.** No axes, no units, no distances in metres, no coordinates, no percentages, no signal strength values. Bands and words only. This is the difference between a field journal and a fake detector.

### 17.1 EMF — verb `SWEEP`
- **Elements:** a rolling trace running right to left across a 24-second window, with **no axis labels, no units, and no numbers, ever**. Behind it a baseline line labelled `ROOM`. Top-left `EMF` in small caps. Top-right a three-state chip: `STILL` · `DRIFT` · `STIR`. Bottom third: a **radial field dial** — concentric arcs with a moving highlight that widens. **Never a needle, never a number.** Bottom row: `SWEEP` (primary) and `LOG THIS SPOT` (secondary).
- **Interaction:** `SWEEP` arms a ten-second window; the user walks slowly with the phone level. `LOG THIS SPOT` captures the current window as an evidence candidate.
- **States:** no magnetometer → the trace runs on motion, clock, and seed at identical cadence, and the chip gains a permanent `INFERRED` label. Copy: `No magnetic sensor here — readings are inferred.` Metal or a speaker nearby → the baseline absorbs it within a few seconds; if it persists the chip reads `INTERFERENCE`. The user shakes the phone → the trace dims and shows `HOLD STEADY`.

### 17.2 Radar — verbs `SWEEP` / `ORIENT`
- **Elements:** a radar rose with hairline rings at three radii and eight compass letters, **no distance numbers**. The user's position is a small triangle at centre. **Contacts render as confidence cones** — filled wedges whose angular width *is* their uncertainty, never dots, never locks. A slow gradient sweeps behind the rose. Top-right, a contact count **as a word**: `CLEAR` · `ONE` · `SEVERAL`. Bottom: a bearing line, e.g. `NE · NEAR` — never metres.
- **Interaction:** rotate the device to orient. Tap a cone → a detail strip: `FIRST SEEN 06:12 · MOVING · UNSIGNED`. Hold the rose → `LOG BEARING` captures the strongest cone.
- **States:** no heading sensor → the rose renders north-free with a `RELATIVE` label and bearings become `LEFT / AHEAD / RIGHT`. Zero contacts for an entire session → the rose still animates, the chip still reads `CLEAR`, and the report records `No bearing ever resolved.` as a line. **That is a feature, not a hole.**

### 17.3 Voice — verbs `ASK` / `LOG THIS`
- **Elements:** top-left `VOICE` in small caps; top-right a mono band line that sweeps through plausible values as pure theatre. Centre: a **tuning ribbon** — a waveform whose amplitude drifts procedurally. Beneath it, when a response arrives, one line of found text with a `»` prefix, e.g. `» leave`. Bottom: a hold-to-talk **`ASK A QUESTION`** button that draws the live input level as a ring around itself.
- **Interaction:** hold the button, speak, release → the surface acknowledges **your own act only** (a bare input-level collapse, or the safe line). It must **not** stamp `SENT` or any word implying a message left the device. **The app then says nothing for at least twelve seconds.** A response may arrive up to ninety seconds later, and **may arrive on a different tool than the one that asked** — a word overheard on EVP, a bearing shift on Radar. Tapping a returned line → `LOG THIS` captures it.
- **Non-response is the majority case.** Design the surface so that nothing is happening is the normal state, not a broken one.
- **Hard copy rule:** no wording anywhere on this surface, in its states, or in its copy may state or imply that anything was received, transmitted, heard, or contacted. The safe form is a permanent line: `Bands are theatre. Nothing here is received.`
- **States:** microphone denied → the surface enters archive mode; the button becomes `SCAN`; there is no coupling between the user speaking and an answer, and the top reads `ARCHIVE`. Copy: `Microphone is off — the box still scans.`

### 17.4 EVP — verbs `RECORD` / `MARK`
- **Elements:** top-left `EVP` with a blinking `REC` dot and elapsed time when armed. Centre: a scrolling mirrored waveform over a thirty-second window. A **marker lane** beneath it holds pins. Bottom row: `RECORD` (toggles) · `MARK` · and a mono count in words, e.g. `3 marks`.
- **Interaction:** `MARK` drops a pin with an inline label `+ MARK 04`. Tapping a pin opens `Play from here` · `Keep as evidence` · `Delete`. The inline play affordance is short — the app never plays long audio back at the user.
- **Copy rule:** the surface never asserts that recorded audio is paranormal.
- **States:** microphone denied → **the tool is not offered in the carousel at all for that session.** The tool set filters itself by availability, and the Brief's gear-up shows `EVP · unavailable`. Honest visible absence beats a broken screen. Low storage → shorter segments with a one-line notice. An interruption → the recording pauses, the file finalises, and a `SESSION PAUSED` marker is dropped so the gap in the waveform is explained.
- The engine may inject a possible-anomaly marker as a **system pin**, rendered unlabeled and never described as paranormal. If the user keeps it, the evidence card reads `EVP · UNMARKED SEGMENT` — attribution to the user, never to the app.

### 17.5 Camera — verb `FRAME`
- **Elements:** the preview, with a deliberately restrained overlay — a rule-of-thirds grid, corner brackets, a top-left mono strip `CAM · 01:24`, a top-right heading readout, a **three-bar signal meter that is unlabeled and unnumbered**, and a vignette. A `TORCH` toggle. A `CAPTURE` button at bottom centre.
- **Night-vision green, scan lines, heavy noise, and chromatic aberration are NOT defaults.** They appear only through the glitch channel at the two highest intensity levels.
- **Interaction:** `CAPTURE` fires a brief subdued flash and produces **no shutter sound** — a shutter sound would break the field. **Pinch-to-zoom is deliberately not implemented**: zoom invites "let me look closer", and looking closer is the one thing the encounter must resist. Exactly one camera preview may exist at a time; it unmounts when the screen leaves focus.
- **Encounter frames** are short sprite sequences at low opacity — **never centred, never in focus, and with the appearance of having been caught rather than presented.** See §19 for why this is a hard rule and not a stylistic preference.
- **States:** camera denied → a **dark-room renderer** with the same timing, the same encounter, and the same evidence output, over a black field with the overlays intact. Copy: `No camera access — rewinding to the dark-room view.`

### 17.6 Tracker — verb `FOLLOW`
- **Elements:** a large compass rose rotating with heading; below it a single **bearing chevron** at the edge pointing to the current contact; below that a **five-step proximity ladder** of stacked hairlines that fill as the target closes, with band words beneath: `COLD` · `WARM` · `CLOSE` · `NEAR` · `HERE`. A `TRAIL` toggle switches to a dead-reckoned path of the user's own movement. Bottom row: `LOG TRAIL MARK` · and a signal-age word, `fresh` or `stale`.
- **Interaction:** walk; the chevron and ladder update with light pulses that quicken as the ladder rises. `LOG TRAIL MARK` drops a footprint candidate once the ladder has reached `CLOSE`.
- **Required disclosure:** the surface itself must carry a reachable line stating that **proximity is inferred from the user's own movement, not measured against anything**. Long-pressing the ladder is the natural home for it: `Proximity is inferred from movement, not measured.` It must not be buried in settings.
- **Hard rule:** no numeric distance, speed, or coordinate is ever displayed.
- **States:** location denied → **uncharted mode**; no path, the ladder driven by time and motion, the chip reads `UNCHARTED`, all distances hidden. Copy: `Going uncharted. Distances are hidden.` Reduced accuracy → the same, with the chip reading `APPROXIMATE`. **A stalled target is a designed dead end**, not a bug — the ladder holds and the signal ages to `stale`.

### 17.7 Sky — verb `ALIGN`
- **Elements:** a dark sky field with a faint procedurally-generated star field, **permanently labelled `GENERATED`** in small caps — a real star map would be a claim. A central reticle of two brackets. When a signal is live: an azimuth/altitude readout in mono, an **alignment meter** of eight segments, and `ALIGN DEVICE`. On lock: `SIGNAL LOCK` and the reticle closes. `CAPTURE` becomes available at lock.
- **Interaction:** physically pan the device toward the indicated azimuth and altitude. Alignment fills as the device approaches and **decays at half rate when panning away**, so the user feels the search for the point. On lock the signal holds briefly, then may drift or die (`SIGNAL LOST`).
- **The generated label travels with the capture.** A Sky capture kept as evidence carries the `GENERATED` marking into **every surface it later appears on** — the evidence ledger, the souvenir reel, the report, and the Share Card's artifact block. **This is the single most falsifiable asset the product can emit**, and the label is what keeps it honest. Do not design a capture treatment that loses the label.
- **States:** the device held flat and never raised → after a sustained period `SIGNAL LOST` fires and the report records `not aligned`. That is a failure state, not a bug. In daylight the sky field lightens and the stars hide — a bright sky screen would be a visible lie.

---

## 18. Evidence capture — the card

**Purpose:** convert a moment into a **souvenir**. Evidence is the atomic unit the entire product is built from.

**The capture card is never full-screen.** It slides up from the bottom of the current tool and sits **over** it, because the user must not lose the field.

**Elements, top to bottom:**

1. A **type label**, e.g. `UNKNOWN VOCALIZATION`
2. A **three-row meta block**, each row a label and a value: `Certainty` · `Channel` · `Possible match`
3. **Two buttons:** `Keep` (primary) and `Mark as explained` (secondary)
4. A **progress hairline** along the card's top edge, auto-dismissing after six seconds

```
EVIDENCE LOGGED                        NT-017 · 11:42 PM
─────────────────────────────────────────────────────
UNKNOWN VOCALIZATION
Certainty      SUGGESTIVE
Channel        Audio · captured live
Possible match —
[ Keep ]   [ Mark as explained ]        auto-dismiss 6 s
```

**Certainty is always a band** — `AMBIGUOUS` · `SUGGESTIVE` · `COMPELLING`. **Never a number, never a percentage, never a strength value.**

**Interactions:**
- `Keep` → commits, and the card compresses into a chip in the session's evidence rail
- `Mark as explained` → commits with the explained verdict and the chip renders with a struck-through glyph
- **Ignoring the card still logs the item** as unreviewed. A missed tap must never cost the user a souvenir.

**The dry log — design this one carefully.** If the user taps a log action when nothing is active, the app does **not** show an error. It commits an honest empty record with its own card reading `NOTHING LOGGED` and the line:
`You marked a spot with no reading. That is also a record.`
This item counts toward the report's negative space. **The dry log is the product's thesis in one interaction** — it is the moment the app proves it would rather record nothing truthfully than invent something.

---

## 19. Encounters

**Purpose:** the memory. Brief, ambiguous, peripheral, rare, and always accompanied by an artifact.

**An encounter is NEVER a full-screen pop-up.** It is delivered through a sensory channel, per the hunt's behaviour:

- **visual** — a sprite in the Camera, or a movement in the field
- **audio** — a sting plus a line of found text, or a voice fragment
- **haptic** — a distinctive escalating pattern
- **glitch** — a single brief frame distortion, once, and never twice in a session

Afterwards, a short **aftermath line** sits alone on the rail. Examples: `It said something.` · `Movement. NE.` · `The record changed.`

**The artifact rule — this is a hard constraint, not a style note.** Every encounter produces at least one artifact. When that artifact is a captured frame, it must read as **a glimpse, not footage**: low opacity, off-centre, never in focus, never a legible subject. **A blurry creature photo under an `UNEXPLAINED` stamp is the single strongest claim this app can accidentally make**, and it is the one thing no automated check can catch. Treat any loosening of this — higher opacity, a centred subject, a sharper sprite, a longer hold — as a product defect.

**States:**
- An encounter that fires while the user is in a sheet → deferred to the next moment, never rendered under a sheet
- An encounter that fires while the app is backgrounded → **suppressed entirely**, and its budget is not consumed
- An encounter that fires while the camera is open but not yet rendering → it is **suppressed, not downgraded and not replaced**, and the report records that the window opened and was missed. Do not design a fallback channel for it, and do not design a softer version of it.
- **Missing it is a legitimate, common, designed outcome.** The user who misses an encounter gets a better story than the user who catches one.

---

## 20. Triage — where the user concludes something

**Purpose:** make the report feel **earned**. The user reviews each piece of evidence and rules on it.

**Entry:** an evidence item's detail, or the report's ledger via `Review the evidence`.

**Elements:**
- A large sheet. **One evidence item per card.** A progress hairline across the top marking **position, never a fraction** — it advances as you move through the items and never renders a count over a total. The number of items depends on how much the session actually recorded, so do not design for a fixed count.
- Each card carries: the type label, the time, the channel, the artifact (a playable word, a viewable frame, or a plain data row), and — once `Explained` is chosen — a **reason picker**: `A car` · `The building` · `My own movement` · `Equipment` · `Something else`
- Three full-width verdict buttons at the bottom: `Unexplained` · `Inconclusive` · `Explained`

**A reason is recorded as what the user decided, not as what the app determined.** The ledger must render a reason as the user's verdict, never as a finding.

**Interactions:** one verdict per item; swipe-left to skip; back to revise. Each verdict re-renders the signature strip in the header live — glyphs illuminate or go dark.

**Three deliberate asymmetries. Do not "fix" any of them.**

1. **The status asymmetry.** Marking items `Explained` raises the explained ratio and moves a case toward `EXPLAINED`. Marking items `Unexplained` does **not** move it toward `UNEXPLAINED` — that also requires an encounter. **The interface does not explain this, and no copy anywhere states that a combination of verdicts unlocks a status.** If you find yourself wanting to add a tooltip that teaches the thresholds, that is the defect, not the fix.
2. **Contested evidence is invisible.** Some evidence is internally planted so the user can catch and discard it. **It presents identically to ordinary evidence until triaged, and nothing in the interface tells the user an item is contested — and nothing congratulates them afterwards.** This is the product's strongest honesty defense: an app that plants phantoms for the user to reject has demonstrated, in its own behaviour, that it hands the user material to be doubted.
3. **Skipped items stay `Unreviewed`** and weigh toward `INCONCLUSIVE`.

**States:** zero evidence → triage is not offered and the control is hidden. Closed mid-triage → verdicts so far persist and the status stays provisional until sealing. Re-triaging a sealed case → permitted, and it re-renders the report with a `REVISED` stamp.

---

## 21. The Case Report — the hero screen

**This is the product.** If this screen is not beautiful, nothing else matters. Design it as **a document, not a dashboard**: a single column, generous margins, scrollable, with everything sharing one rhythm.

**Elements, in this order:**

1. **Masthead** — `CASE NT-017` on the left, the local date on the right
2. **Status seal** — the emotional centre of the screen. The status word in the largest type on the screen, with a **stamped ring** around it, and the case name beneath, and the hunt metadata beneath that.
   - `UNEXPLAINED` · `INCONCLUSIVE` · `EXPLAINED`
   - **Design the ring as a physical stamp impression** — slightly irregular ink, not a clean vector circle. It is the single most graphic element in the product.
3. **Stat row** — four cells: `DURATION 18:42` · `EVIDENCE 07` · `ENCOUNTERS 01` · `SOURCES 04`, plus an **activity band** of `LOW` · `MODERATE` · `HIGH`.
   - **Counts and one band. No percentage and no unit-bearing number of any kind.** The only numerals permitted on this entire screen are counts of things that happened and the elapsed time.
4. **Signature strip** — a bordered panel of **seven to nine slots**, illuminated or dark according to how much evidence converged, with one of these beneath it: `PARTIAL MATCH · UNIDENTIFIED` or `NO MATCH ON FILE`. It should read like a **partial fingerprint match** — some slots filled, some empty, the pattern suggestive and unresolved.
5. **Account** — three to six lines of plain declarative prose describing the night, e.g. `Movement was recorded twice, both times to the north-east.` Written from an authored template bank; never generated at runtime.
6. **Souvenirs** — a horizontal reel of artifact cards, each playable or viewable, with a short inline play affordance.
7. **Ledger** — every evidence item as a row: its glyph, type, time, and a verdict chip. Tapping a row opens that item.
8. **Negative space** — a bordered panel headed `NOT RECORDED`, carrying the lines the session earned. **Every line must be gated on whether that observation was actually possible** — the app never reports the absence of something it never looked for.
   - **Absence is meaningful only where a measurement was possible.** A tool that was never opened, a permission that was denied, or a sensor that was absent **generates no line**.
   - So a magnetic-baseline line appears **only** if the EMF was opened and a magnetometer existed. A bearing line appears **only** if the Radar was opened. A microphone line appears **only** if the microphone was granted.
   - **When no line qualifies, the panel is not rendered at all.** Never an empty panel, never placeholder text. Do not ship a fixed array of absence lines — the set is computed per session, and it is frequently empty.
9. **Investigator note** — an open field. Prompt: `What did you notice?` Placeholder: `The tools miss things. You don't.` Saved on blur.
10. **Conditions footer** — three or four mono lines (hour · light band · pressure trend · the seed reference), then the case reference and content version, and finally, always:
    `An investigation experience. Not a measurement.`

**Actions:**
- Primary: `SEAL & FILE` — **hold-to-confirm for roughly 600 ms.** Show the pressed state clearly: a ring closing, or a bar filling.
- Secondary: `Share card`
- Tertiary: `Review the evidence` → Triage
- Tertiary: `Discard case` — destructive, two-step confirm

**Everything is scrollable, and long-pressing any block offers `Share this block`.**

**States:**
- **Sealed** → the primary button becomes a static chip, e.g. `SEALED · 4 OCT`. If the case is edited later it gains a `REVISED` stamp.
- **Recovered case** → a `RECOVERED` ribbon across the masthead; the report builds from the last checkpoint.
- **Under sixty seconds** → no report at all; the case is discarded with a one-line notice. A forty-second session has no arc, and issuing a report for it would cheapen every other report.
- **The nothing-case — design this one with the most care.** Zero evidence, zero encounters. The report renders **in full**, not as an empty state: `INCONCLUSIVE`, an empty signature strip, a prominent `NOT RECORDED` panel, and the line above the stat row:
  `Nothing was recorded tonight. That is a result.`
  **This screen is not an error state. It is the product's central promise made visible, and it must be one of the best-looking screens in the app.**

**Sealing is a deliberate act.** It is irreversible without leaving a visible revision mark. That finality is what makes the document worth keeping.

---

## 22. The Share Card

**Purpose:** the growth engine made concrete. A single image, composed to be posted without any editing.

**Entry:** `Share card` from the report, or long-press any block.

**Elements, top to bottom:**

- A **variant selector** above the card: `Story 9:16` and `Feed 4:5`, cross-fading the card on switch
- **The card** itself, centred:
  1. The case reference, e.g. `CASE NT-017`
  2. **Artifact block** — the case's strongest artifact, in priority order: a captured frame, a spoken word, or a trace. It occupies roughly the top two-fifths of the card.
     - When there is no artifact → a **negative-space layout**: an empty frame outline with `Nothing recorded` centred.
  3. **The status word** with its stamped ring, centred
  4. **A three-cell stat row** — counts only: `EVIDENCE 07` · `ENCOUNTERS 01` · `SOURCES 04`
  5. **The field note** — one or two lines, seeded from the case, replaceable by the user with up to sixty characters of their own
  6. **Footer** — the `NIGHTTRACE` wordmark, the local date, and always:
     `An investigation experience. Not a measurement.`
- **Buttons:** `Share` (primary) · `Save to Photos` (secondary) · `Back to the case` (tertiary)

**Hard exclusions — no exceptions:**
**No watermark. No URL. No QR code. No app-store badge. No "made with" line. No attribution of any kind. Nothing is ever appended to the user's output.** The only branding is the wordmark and the case reference.

**Note editing:** tapping the field note opens a sheet with four seeded options plus `Write your own`. **The app never generates this text** — it draws from authored options.

**States:**
- **Photo-library permission not granted → `Save to Photos` is ABSENT, not disabled.** No greyed-out button, no nag, and a caption line explains: `Sharing works without photo access.`
- **Share sheet dismissed** → nothing happens. No toast, no retry prompt.
- **The nothing-case card** → the status word, `Nothing recorded`, the conditions lines, and the field note `Some nights are for listening.`
  **The nothing-case card is deliberately one of the best-looking cards in the app**, because absence must be shareable or the entire law collapses.

**Re-rendering the same card with the same content produces a visually identical image.** A re-share must never change the artifact.

---

## 23. Field Journal

**Purpose:** the archive, the return hook, and the home of the collection loop. **Private by default, always.**

**Entry:** the Journal tab. A dot appears on the tab whenever a case is unsealed.

**Sticky header:** the title `FIELD JOURNAL`, a clearance chip on the right, and four segments — **`Overview` · `Phenomena` · `Evidence` · `Cases`** — with an underline indicator that slides between them.

### Overview segment
- A **stat row** of four cells: `CASES 12` · `HOURS 04:20` · `EVIDENCE 47` · `ENCOUNTERS 05`
- An **activity strip** — thirty columns, one per day. A day with a case is filled; a day without is empty. End labels `30 days ago` and `tonight`.
- The **signature archive** — a four-by-two grid. A filled tile is a matched signature. A tile marked with **`?`** is a signature the user recorded but has not identified, and it **pulses slowly**. An empty tile is one never seen.
  - **The `?` tile is never labelled, never captioned, and never the target of a callout, coach mark, or first-run pointer.** Tapping it may open a single line: `A signature you have recorded but not identified. It will match, or it will not.`
  - **No surface anywhere states or implies that a full match is reachable, that one exists, or what completing a slot would identify.** No progress readout toward a match, no stated unlock requirement, no completion count.

### Phenomena segment
- One card per **discovered** phenomenon: a silhouette, the name, a meta line such as `Encountered 8× · Evidence 31`, and a short behaviour line, e.g. `Approaches. Avoids light.`
- **A phenomenon the user has not yet encountered is simply absent.** Not greyed out, not keyholed, not teased, not listed with a requirement. **There are no locked entries, no silhouettes for undiscovered phenomena, and no unlock ladder anywhere in this screen.**
- No per-phenomenon checklist and no completion progress.

### Evidence segment
- Three filter chips: `Newest` · `Rarest` · `Strongest`
- A timeline of rows: a glyph, the type, the time, the case reference, and a verdict chip on the right. Long-press → `Share this`.

### Cases segment
- A list of rows: `NT-017` · the status word · the case name · a compact summary such as `11:42 PM · 18:42 · 7 evidence`

**Empty states — one per segment, each carrying exactly one action:**
- Overview: `Your record starts with one night.` → `Begin a case`
- Phenomena: `Four phenomena on file. None documented yet.` → `Open the field guide`
- Evidence: `Nothing kept yet.` → `Begin a case`
- Cases: `No cases sealed.` → `Begin a case`

**States:**
- **Deleting a case does not erase its evidence.** The evidence unlinks and keeps rendering with a `NO CASE` chip — deleting a case must not silently erase the user's history of having found something.
- **Loading uses skeleton rows, never a spinner.**

**Hard rule:** this screen shows the user's own historical counts. **It never shows a number the user could check against the world, and it is never a feed, a friends list, a public profile, or a comparison surface.**

---

## 24. Field Note mode

**Purpose:** a short standing observation — the commute, the walk, the two minutes between meetings.

**Entry:** the `FIELD NOTE` row in Investigate.

**Elements:** a screen that states plainly the user will hold still for about three minutes, and then runs a single minimal pass, mostly in silence. The screen closes **on its own** at the end.

**On completion it writes a short Journal entry** containing its time, its place band, and one line of observed material.

**Critical rules:**
- A Field Note is **presented as its own mode with its own framing**, not as a hunt with a shorter timer.
- It produces **no Case Report and no case reference.** A Field Note is not a case and the app never pretends it was.
- No encounter, no case, and no progression advancement can result from a Field Note alone.
- If the user picks the phone up mid-note, **the note ends early and records itself as short** rather than discarding what it captured.

---

## 25. Profile

**Purpose:** settings, data ownership, the entertainment notice, and clearance. **It never holds gameplay.**

**Elements:**
- **Identity block** — the clearance chip, plus `CASES SEALED 12` and `PHENOMENA DOCUMENTED 3`, and a button `What advances clearance?`
- **SESSION rows** — `Intensity` (opens §15.1) · `Haptics` (switch) · `Ambience` (switch) · `Low power` (opens §27.2)
- **DATA rows** — `Export my data` · `Delete my data` · and a line stating plainly that deletion is local, because there is no account and no server: **the app must never imply it can reach data the user has already shared.**
- **ABOUT row** — `About & entertainment` (§27.6)
- A `Diagnostics` section reachable by long-pressing the version number, exposing the raw seed for bug reports

**Clearance — five ranks:** `FIELD ASSISTANT` · `FIELD ASSISTANT II` · `CASE OFFICER` · `SENIOR CASE OFFICER` · `ARCHIVIST`

- Advancement is on **sealed cases, distinct phenomena documented, and matched signatures only** — **never on elapsed time and never on a count of events that fired.**
- Ranks gate **only cosmetic case-file themes and journal art.** They **never** gate a tool, an evidence kind, a hunt, or an intensity level.
- **No experience-point value is displayed anywhere in the app.**
- Advancement is shown as a **stamped endorsement** — a second ring impression on the report's seal. **Never a progress bar.**
- **A streak is displayed but never enforced.** Missing a night carries no penalty, no loss, and no notification. Badges appear as **case stamps inside the Journal**, never as a trophy wall or a separate reward screen.

---

## 26. Modals and sheets

| Sheet | Opened from | Contents |
|---|---|---|
| **Intensity** | Onboarding 3 · Profile · long-press the phase rail in-session | The four levels and their descriptions (below). **Locked during a live session.** |
| **Low power** | The session rail's battery chip · Profile | Four switches and an estimate **in bands only** (below) |
| **Permissions** | Any tool that needs a sensor | Explains what it is for, offers `Continue without`, and `Open Settings` only after a permanent denial |
| **Triage** | Evidence detail · the report's ledger | See §20 |
| **Confirm** | Leaving the field · discarding a case · deleting all data | Two lines, destructive action on the right, `Cancel` on the left |
| **Leave the field** | Swipe-back during a session | `Seal the case now` (primary) / `Leave without a report` (destructive) |
| **About & entertainment** | Profile · onboarding screen 2 · long-pressing any share card footer | The full notice, the sensor list, the local-data explainer, and the content version |

### 26.1 Intensity — four levels
- `Ambient` — `Few signals. Nothing sudden.`
- `Present` — `The intended night. Signals, and long silences.` **(default)**
- `Intense` — `More signals. Sharper stings. Glitch events enabled.`
- `Ritual` — `Everything on. Nothing held back.`

Each row also carries a **three-chip expectation row** — described in words, never as a multiplier, and **never as an odds**: signals (`sparse` / `normal` / `frequent`) · encounter character (`gentle` / `assertive` / `unrestrained`) · content (`none` / `restrained` / `intense`).

> **The encounters chip describes character, not likelihood.** Do not label any level `likely`, `rare`, `common`, or any other word that reads as a probability about the night the user is about to have. It would contradict the sheet's own footer on the same screen, and it is the one claim the product cannot make. Say what an encounter would *feel* like, never how often one will come.

**Footer, always:**
`Higher intensity means more signals. It never means a guaranteed encounter.`
`Intensity is fixed during a case.`

**Opened during a live session** → every row renders **locked**, and the first footer line is replaced by:
`Changing this mid-investigation would mean steering what you find. A case is only worth something if you didn't.`
This friction is deliberate. Letting a user nudge intensity mid-session would let them **spend** uncertainty, which is the one thing the product must not permit.

### 26.2 Low power
Four switches: `Dim the screen` · `Slower sensors` · `Skip keep-awake` · `Close the camera after 90s idle`. Body line: `For long nights on a small battery.`

**The estimate is shown in bands only** — `about 40 min` · `about 20 min` · `under 10 min`. **Never a battery percentage.**

**At critically low battery the app OFFERS to seal the case immediately** from the live session, producing a complete report from the checkpoint:
`Battery is nearly flat. Seal the case now and keep the file?` with `SEAL NOW` and `Keep going`.
**The offer is the user's to accept. A case is never sealed automatically.**

### 26.3 Permissions
Just-in-time only. The sheet opens from the tool that needs the sensor, never at launch.

**Copy shape:** a one-line title naming the tool — e.g. `The Radar wants motion data.` — a two-line body, and a **fallback chip telling the user exactly what happens if they decline**: `Without it, bearings will be relative.` Buttons: `Allow` / `Continue without`.

**After a permanent denial** the sheet swaps `Allow` for `Open Settings`. **A denial is never re-offered in the same session, and there is no nag loop anywhere.**

**A microphone-only hunt is a fully supported, first-class configuration.** The product must be playable end to end with **zero permissions granted**.

### 26.4 About & entertainment
Contains, in labelled sections: **WHAT THIS IS** · **WHAT IT DOES** · **SENSORS USED** (each marked `Only while in use.`) · **WHAT WE NEVER DO** · **A NOTE ON SCIENCE** · **SAFETY**.

The `WHAT WE NEVER DO` block reads exactly:
`No account. No sign-in.` `No network connection.` `No audio or photos leave this device.` `No advertising.` `No analytics sent anywhere.`

**The SAFETY section carries a calm, factual line** covering photosensitivity (the glitch channel's visual effects), sudden audio, and the fact that the app is designed to startle. **It does not diagnose and it does not use alarm language.** It lives here rather than on the onboarding path, so the first-run flow stays short.

---

# PART IV — CROSS-CUTTING RULES

## 27. Every state the designer must draw

For every screen, produce the **empty**, **normal**, and **edge** state. The following are the states this product treats as first-class, and each one must look designed rather than broken.

### 27.1 The four named no-event outcomes
A session that produces nothing is **never** collapsed into one generic "nothing happened" state. There are four, each named, each with its own rail line and its own treatment in the report:

| Outcome | What happened | Attributed to |
|---|---|---|
| `QUIET_NIGHT` | The session held silence throughout | the night |
| `WINDOW_CLOSED_EMPTY` | The encounter window opened and produced nothing | the night |
| `FALSE_POSITIVE` | A signal was logged and triage resolved it as ordinary | **the user's own action** |
| `NOT_FRAMED` | An encounter occurred but the user was looking at the wrong tool | **the user's own action** |

**The distinction between night-attributed and user-attributed outcomes must survive into the copy.** `NOT_FRAMED` does real work: it tells a user who missed an encounter that they were watching the wrong instrument — which is both true and a reason to come back, without the app ever claiming anything. The Journal can show how many of each the user has recorded.

### 27.2 The failure states
Each hunt has a unique way to end badly. **All of them still produce a complete report.**

| Stamp | In-session | On the report |
|---|---|---|
| `NOTICED` | Ambience cuts to silence; one encounter haptic; rail reads `It saw you.` | A `CASE TERMINATED — SUBJECT AWARE` stamp. Evidence preserved in full. |
| `CORNERED` | Haptics double for a few seconds, then stop; rail reads `It's here.` | `CASE TERMINATED — PROXIMITY` |
| `GONE` | Rail reads `Movement. You missed it.` | `1 POSSIBLE VISUAL EVENT — NOT FRAMED` |
| `MISDIRECTED` | **No in-session signal at all** | A revision line: `ONE ENTRY RECLASSIFIED — self-sourced.` |
| `INTERFERENCE` | A chip reads `INTERFERENCE`; EMF events suppressed briefly | `EQUIPMENT CONDITIONS — MAGNETIC INTERFERENCE` |
| `NOT_ALIGNED` | `SIGNAL LOST` | `1 SIGNAL UNRESOLVED — DEVICE NOT ALIGNED` |

### 27.3 Sound and haptics — behaviour the design must respect
- **Twelve sound categories:** ambient hum, static, radio noise, distant footsteps, breathing, wind, knocks, vocalization, UI chirps, radar pulse, EMF warning, encounter sting.
- **Silence is used intentionally.** There is **no constant horror music.** The world should get duller and quieter before an encounter, not louder.
- **Haptics escalate with proximity** — light for a weak signal, escalating pulses as it closes, a distinctive pattern for a rare event, a strong short impact for an encounter.
- **Continuous vibration is forbidden.** It burns battery, reads as a malfunction, and hands the user a tell that a sensor is running.
- **A haptic is never the only signal for anything.** On iOS they are silently suppressed while the camera is active, during dictation, in Low Power Mode, and whenever the user has disabled them — so every haptic must be safe to drop without the user losing information.

### 27.4 Orientation, text size, and motion
- **Portrait-locked**, except the Camera and Sky tools.
- **Dynamic Type to 200%**, with the intensity rail and the tool row capped at 140%.
- **Reduce Motion** → cross-fades replace transitions, sweeping animations become static, glitch is disabled and re-routed to audio, and animated dots move statically.
- **The tool row's form factor at the largest text sizes is an open question** — a scrolling row of seven small targets may need a different shape at 200%. Treat it as a problem to solve, not to cap away.

### 27.5 Screen reader behaviour
- The **Case Report** and **Field Journal** must be fully navigable with VoiceOver and TalkBack.
- **Live regions announce only evidence capture and phase change.** An over-eager live region interrupts the user mid-flow more often than it informs them.
- **Hidden values are never announced.** Several internal values drive pacing but are invisible to sighted users; announcing them would be both an accessibility defect and a tell.

---

# PART V — DELIVERABLES

## 28. What to produce

1. **A visual identity** — your own. Colour, type, spacing, shape, elevation, motion, iconography. Invent it from the context above. The only constraints are the ones in §3, and specifically: it must live on the **dark** end, it must survive being used at 11pm without wrecking the user's night vision, and it must not lean on any of the anti-references in §29.

2. **A screen-by-screen design** covering every surface in Part III — the four tabs, the in-session shell, all seven tools, the evidence card, the report, the share card, the journal, and every sheet in §26.

3. **The states from §27** — at minimum the empty, normal, and edge state for each screen, and specifically: the **nothing-case Case Report**, the **nothing-case Share Card**, and the **dry log** card.

4. **A written note on your choices** — how the visual language expresses *"investigation, not detection"*, and where you deliberately held back.

## 29. Anti-references — do not produce these

Cheesy Halloween styling · cartoon ghosts · cobwebs · dripping fonts · neon overload · cyberpunk glow · dense sci-fi HUDs · wireframe globes · tiny unreadable labels · fake EMF dials with red LED readouts · pulsing radar sweeps · skeuomorphic paper with torn edges or coffee stains · wax seals · trophy walls · progress bars toward anything.

## 30. The one-sentence test

Before you call anything finished, hold it against this:

> **Does this look like an instrument that a careful person would trust with the record of their night?**

If it looks like a toy, a slot machine, or a ghost-hunting gadget, it is wrong — no matter how good it looks.
