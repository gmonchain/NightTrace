---
name: NightTrace — Experience
description: Information architecture, behaviour, states, and journeys for the NightTrace paranormal field journal.
status: final
updated: 2026-10-05
sources:
  - ../../prds/prd-NightTrace-2026-10-04/prd.md
  - ../../prds/prd-NightTrace-2026-10-04/addendum.md
  - imports/nighttrace-interactive-prototype/project/NightTrace.dc.html
  - design-brief-ai.md
---

# Foundation

> **These two spines win on conflict with the prototype, and the prototype is `imports/`-listed only.** `imports/nighttrace-interactive-prototype/project/NightTrace.dc.html` was returned by the design handoff and is the source of this system's visual language, but it is a **reference**, not a specification. It is known to be wrong in three places, all recorded above as open questions or below as rules: it stamps `SENT` on the Voice surface (FR-13 forbids any transmission claim), its `statusOf()` derives status from a hard-coded 7 and ignores FR-21's encounter and convergence conditions, and it renders seal status in `safelight-soft` for every status where `DESIGN.md → Components` specifies colour by status. **Build from these spines.** Where the prototype does something not covered here, this pair is incomplete — record the gap rather than copying the prototype.

**Form factor.** Handset only. iOS and Android, built in React Native on Expo SDK 57 (New Architecture). **No iPad layout, no tablet surface, no desktop.** The product is a thing you hold while standing in a dark room; a larger screen would change what it is.

**Orientation.** Portrait-locked, with exactly two exceptions — the Camera tool and the Sky tool may rotate, because both ask the user to point the device at the world.

**Theme.** Dark only. `{colors.night}` is the ground for every surface. There is no light mode and there will not be one: a paranormal field tool that flashes white at 11pm is a broken product. The system is designed to be used in the dark without spoiling the user's dark-adapted eye.

**UI system.** None inherited. NightTrace defines its own language (see `DESIGN.md`), drawn from paperwork rather than from iOS or Material. Platform conventions are honoured for *platform behaviour* (back gesture, share sheet, permission prompts, Dynamic Type, Reduce Motion) and deliberately not for *visual chrome*.

**Offline and account-free, structurally.** No network calls, no account, no sign-in, no server, and **no third-party or networked analytics**. The only instrumentation is a local, on-device, PII-free event record (addendum §F) that never leaves the phone and is erasable by the user with their data. This distinction is load-bearing for the copy: the product may say **nothing leaves this phone**, and it may not say **nothing is recorded**. UIS strings must use the first form.

**Determinism.** Everything the app generates is seeded from place, time, light band, and device sensor noise, computed on-device. No generative model, no cloud inference, no runtime-authored prose. Every sentence the app displays comes from an authored template bank. This is a hard constraint: it is what makes the record reproducible and the app auditable.

---

# Information Architecture

## The four tabs

Four tabs, and only four. There is no Equipment tab (tools live inside a live session) and no Settings tab (settings live inside Profile).

| Tab | Its one job | It never does |
|---|---|---|
| **Home** | Answer *"what is happening tonight?"* and get the user into a case in one tap | List tools; show more than a handful of hunts |
| **Investigate** | Choose a phenomenon; show tonight's conditions | Start a session directly — always routes through the Brief |
| **Field Journal** | Show the accumulated record: cases, phenomena, evidence, the signature archive | Be a social surface, a feed, or a comparison |
| **Profile** | Settings, intensity, data ownership, the entertainment notice, clearance | Hold gameplay |

## Full screen tree

```
Onboarding
  ├── 1 — "Nothing Here Is Proof"
  ├── 2 — "Your Case Is Local"
  ├── 3 — "Choose Your Night"
  └── 4 — "Ask Only When Needed"

Tabs
  ├── HOME
  ├── INVESTIGATE
  ├── FIELD JOURNAL   (Overview · Phenomena · Evidence · Cases)
  └── PROFILE

Hunt
  ├── HUNT BRIEF      (tab bar hidden — the ritual gear-up)
  └── SESSION SHELL   (immersive; tick host; tool row)

Tools (pushed above the session, full-screen, one at a time)
  ├── EMF  ├── RADAR  ├── VOICE  ├── EVP
  ├── CAMERA  ├── TRACKER  └── SKY

Case
  ├── CASE REPORT     (the hero screen)
  ├── SHARE CARD      (composer + system share sheet)
  └── EVIDENCE DETAIL (single item + triage verdict)

Sheets
  ├── Intensity · Low power · Permissions · Triage
  ├── Confirm · Leave the field · Low battery offer
  ├── Directive · Anomaly · Field note editor
  └── Clearance · Delete my data · Discard case · About & entertainment

Standalone
  └── FIELD NOTE      (its own mode — not a case, no report)
```

## Presentation rules

| Surface | Presentation | Dismissed by | Notes |
|---|---|---|---|
| Tabs | Persistent tab bar | — | Hidden entirely during Brief and Session |
| Hunt (Brief, Session) | Push, **tab bar hidden** | Swipe-back / explicit `Leave` | Swipe-back during a session raises the **Leave the field** sheet, never a silent discard |
| Tools | Push **above** the session | Pop | Exactly one full-screen surface at a time; the camera preview unmounts on pop |
| Case Report | Push over tabs, tab bar hidden | Explicit close | A **destination, not a modal** — it should feel like a document |
| Sheets | Detents as noted | Swipe / scrim / explicit | Never stacked two deep, except Triage over a session |

## Navigation invariants

These are testable, and each is a bug if violated.

1. A live session is never more than one gesture from its tools.
2. There is no path that ends a session without offering `SEAL & FILE`.
3. The report is always reachable from the Journal, and always reachable at the end of a session.
4. No dead ends. Every empty state carries **exactly one action**.
5. Intensity is locked during a case.

## Hunt availability — resolved

The PRD (FR-28) forbids Investigator Clearance from gating a Hunt, and §5 states there is no monetization in v1. It does **not** state whether any other mechanism may gate them. **Decided by the owner, 2026-10-05: all four phenomena are selectable from first launch, with no unlock mechanism of any kind.**

A discovery progression was considered and rejected. If one is ever revisited it must be non-monetized, and it must not use the locked-entry pattern — see **State Patterns → Absence**.

---

# Voice and Tone

The register is a **field log written by a careful, slightly detached observer**. Not a narrator, not a character, not a friend. Somebody who writes things down accurately and does not embellish.

**Rules for every visible string.**

- **Never assert.** `The record shows movement.` — never `Something is moving.`
- **Never wink.** No humour, no asides, no exclamation marks, no emoji, no `(it's just a game!)`. The entertainment framing lives in onboarding and About, never in the moment.
- **Never explain the mechanic.** The user is never told about phases, probability, rarity, or what unlocks what.
- **Hedge is craft, not weakness.** `Possible` · `unconfirmed` · `unsigned` · `no match on file` · `the record is unclear`.
- **Short.** Nine words maximum on any single line.
- **Silence is narrated, not empty.** A quiet moment gets a sentence, not a blank.
- The word **"ghost"** appears only as a Hunt name. Inside a record the vocabulary is `signal`, `contact`, `movement`, `the record`.

**Banned terms:** `detect` · `prove` · `proof` · `confirm` · `verify` · `authentic` · `real ghost` · `scientific` · `science` · `thermal` · `radiation` · `Geiger` · `accuracy` · `algorithm` · `AI` · `%` · `metres`/`meters` as distance · `haunted` as fact · `evidence of the paranormal`.

**Approved:** `paranormal` · `ghost hunt` · `cryptid` · `investigator` · `field journal` · `EMF` · `EVP` · `spooky` · `adventure` · `night`.

**The one exact string.** The entertainment line is `An investigation experience. Not a measurement.` It appears on the Case Report and the Share Card, always, unmodified. The corpus also contains an earlier variant — `Nothing here is a measurement.` — which is wrong. This string is lint-checked at build; see `DESIGN.md → Do's and Don'ts`.

**Cross-reference:** brand voice lives in `DESIGN.md → Brand & Style`. This section covers microcopy only.

---

# Component Patterns

Behavioural specification. Visual specs live in `DESIGN.md → Components`.

## The seven tools

Every tool lives **inside** a live session. There is no equipment menu, no loadout, no browsable tool outside a hunt. Each tool's stance is carried by a rendered verb — `SWEEP`, `ORIENT`, `ASK`, `RECORD`, `FRAME`, `FOLLOW`, `ALIGN` — and no verb is ever taught. The user learns what the app expects by using it, and a tool's verb is the only instruction it gets.

> **The single most important rule across all seven tools: no tool displays a number that could be read as a measurement.** No axis, no unit, no distance, no coordinate, no percentage, no signal-strength value. Bands and words only. This is the difference between a field journal and a fake detector.

**EMF (`SWEEP`)** — a rolling trace with no axis, over a `ROOM` baseline. A three-state chip (`STILL` / `DRIFT` / `STIR`), and a radial dial of concentric arcs that is never a needle. `LOG THIS SPOT` on `STILL` produces a dry log. No magnetometer → the trace runs on motion and clock at identical cadence with a permanent `INFERRED` chip. Shaking the device dims the trace to `HOLD STEADY`.

**Radar (`SWEEP` / `ORIENT`)** — a rose with hairline rings and eight compass letters, no distance numbers. **Contacts are confidence cones whose angular width is their uncertainty** — never dots, never locks. Contact count is a word: `CLEAR` / `ONE` / `SEVERAL`. Tap a cone for its detail strip; hold the rose for `LOG BEARING`. No heading sensor → north-free rose, `RELATIVE` chip, bearings become `LEFT / AHEAD / RIGHT`. **Zero contacts for a whole session is a designed outcome**: the rose still animates, the chip still reads `CLEAR`, and the report records `No bearing ever resolved.`

**Voice (`ASK` / `LOG THIS`)** — a hold-to-talk button with a live input ring. **On release the surface acknowledges the user's own act and nothing else** — a bare input-level collapse. It must not stamp `SENT`, or any word implying a message left the device. Then **the app says nothing for at least twelve seconds**. A response may arrive up to ninety seconds later, **and may arrive on a different tool than the one that asked.** Non-response is the majority case and must be designed as the normal state, not a broken one. Microphone denied → the surface enters archive mode, the button becomes `SCAN`, and there is no coupling between speaking and answering. **No wording anywhere on this surface may state or imply that anything was received, transmitted, heard, or contacted**; the surface carries a permanent disclaimer line reading `Bands are theatre. Nothing here is received.`

**EVP (`RECORD` / `MARK`)** — a mirrored waveform with a marker lane beneath. `MARK` drops a pin with an inline label; a system-injected possible-anomaly pin renders **unlabeled and undescribed**, and if kept reads `EVP · UNMARKED SEGMENT` — attribution to the user, never to the app. Microphone denied → **the tool is not offered in the carousel at all**, and the Brief reads `EVP · unavailable`. Honest visible absence beats a broken screen. An interruption finalises the file and drops a `SESSION PAUSED` marker so the gap is explained.

**Camera (`FRAME`)** — a restrained overlay: rule-of-thirds grid, corner brackets, a mono time strip, and an unlabeled three-bar meter. **No night-vision green, scan lines, or heavy noise by default** — those arrive only through **the glitch channel**, the session's reserved stack of distortion and noise effects, which is enabled only at the two highest intensities and is disabled entirely under Reduce Motion (routed to audio instead). `CAPTURE` fires a subdued flash and **no shutter sound**. **Pinch-to-zoom is deliberately not implemented**: zoom invites "let me look closer," and looking closer is what an encounter must resist. Camera denied → a dark-room renderer with the same timing, the same encounter, and the same evidence output.

**Tracker (`FOLLOW`)** — a compass rose, a bearing chevron, and a **five-step proximity ladder** with band words (`COLD` / `WARM` / `CLOSE` / `NEAR` / `HERE`). **The surface itself must carry the disclosure that proximity is inferred from the user's own movement, not measured** — long-pressing the ladder is its natural home. It must not be buried in settings. Location denied → uncharted mode: no path, the chip reads `UNCHARTED`, all distances hidden.

**Sky (`ALIGN`)** — a procedurally generated star field **permanently labelled `GENERATED`**, a reticle, an eight-segment alignment meter, and `ALIGN DEVICE`. Alignment fills as the device approaches and **decays at half rate when panning away**, so the user feels the search. On lock, the signal holds briefly then may drift or die. **The `GENERATED` label travels with any capture into every surface it later appears on** — the ledger, the souvenir reel, the report, the Share Card. This is the most falsifiable asset the product can emit, and the label is what keeps it honest.

## The evidence card

The **evidence card** is the component; the **capture card** is its one in-session instance. The capture card is **never full-screen**. It slides up from the bottom of the current tool and sits over it, because the user must not lose the field.

Anatomy: a type label, a three-row meta block (`Certainty` · `Channel` · `Possible match`), and two buttons — `Keep` and `Mark as explained`. A progress hairline along the top edge auto-dismisses after six seconds. **Ignoring the card still logs the item** as unreviewed; a missed tap must never cost the user a souvenir.

**Certainty is always a band** — `AMBIGUOUS` · `SUGGESTIVE` · `COMPELLING`. Never a number.

**The dry log.** If the user taps a log action when nothing is active, the app does **not** show an error. It commits an honest empty record reading `NOTHING LOGGED` with the line `You marked a spot with no reading. That is also a record.` It counts toward the report's negative space. **This is the product's thesis in one interaction** — the moment the app proves it would rather record nothing truthfully than invent something.

## Encounters

An encounter is **never a full-screen pop-up**. It arrives through a sensory channel — a sprite in the Camera, a sting plus found text, a haptic pattern, or a single brief glitch frame (once per session, never twice). Afterwards a short aftermath line sits alone on **the rail** — the session's single-line narration strip, which carries one sentence at a time and nothing else: `It said something.` · `Movement. NE.` · `The record changed.`

**The artifact rule.** Every encounter produces at least one artifact, and a captured frame must read as **a glimpse, not footage** — low opacity, off-centre, never in focus, never a legible subject. **A blurred creature photo under an `UNEXPLAINED` stamp is the strongest claim this app can accidentally make.** Treat any loosening of this — higher opacity, a centred subject, a sharper sprite, a longer hold — as a defect.

Missing an encounter is a legitimate, common, designed outcome. **The user who misses one gets a better story than the user who catches one.**

## Triage

One evidence item per card, a progress hairline whose segment count is derived from the case's actual evidence array, and three full-width verdicts: `Unexplained` · `Inconclusive` · `Explained`. Choosing `Explained` opens a reason picker (`A car` · `The building` · `My own movement` · `Equipment` · `Something else`). **A reason is recorded as what the user decided, not as what the app determined**, and the ledger must render it as the user's verdict, never as a finding.

> **The verdicts do not move the signature strip.** Convergence is derived from the case's **Evidence** (FR-21), not from the user's rulings. A strip that visibly filled as the user tapped verdicts would be a spendable uncertainty meter: it would let a user watch `UNEXPLAINED` become reachable and grind toward it, which is the one thing the product must not permit. It would also teach the asymmetry by experiment — the outcome **State Patterns** forbids stating in words — rendering in slots what no tooltip may say.
>
> Exactly one exception: the Triage sheet's own header may re-render its strip live, because it sits inside the review ritual and states no threshold. **The report's strip never moves**, and even in the sheet the strip is fed by evidence, so no verdict tap ever changes it.

**Triage progress is pending OQ-11.** The evidence kind set is unresolved in the PRD (`OQ-11`, `[BLOCKING — CONTENT AUTHORING]`), so no segment count may be hard-coded, and the indicator is a **position, never a fraction** — it never renders `3 of 7`, because a numerator over a denominator is the readout the no-percentage law exists to prevent.

## The Case Report

A **document, not a dashboard**: one column, generous margins, everything sharing one rhythm. In order — masthead, status seal, stat row, signature strip, narrative account, souvenir reel, evidence ledger, `NOT RECORDED` panel, investigator note, conditions footer.

**The seal is the emotional centre.** The status word in `{typography.stamp}` with a stamped ring (`ntInk` filter, `-4deg`), the case name beneath, the hunt metadata beneath that.

**Everything is scrollable, and long-pressing any block offers `Share this block`.** The report is the only screen in the product where this is true on every element.

**Under sixty seconds → no report at all.** A forty-second session has no arc, and issuing a report for it would cheapen every other report. The case is discarded with a one-line notice.

**Sealing is a deliberate act** — a ~600ms hold. It is irreversible without leaving a visible `REVISED` mark, and that finality is what makes the document worth keeping.

## The Share Card

Composed to be posted without any editing. A variant selector (`Story 9:16` / `Feed 4:5`) cross-fades the card on switch. Composition: case reference, artifact block, status word with its seal, three-cell stat row, field note, footer with the exact entertainment line.

**The field note is drawn from authored options or written by the user** — the app never generates it. Tapping it opens four seeded choices plus `Write your own`, capped at sixty characters.

**Hard exclusions, no exceptions: no watermark, no URL, no QR code, no app-store badge, no "made with" line, no attribution of any kind.** Nothing is ever appended to the user's output. The only branding is the wordmark and the case reference.

**Re-rendering the same case produces a visually identical image.** A re-share must never change the artifact.

---

# State Patterns

## Absence is the product

Three shapes of absence, each with its own law.

**Unencountered phenomena are absent, not locked.** No locked rows, no greyed-out entries, no silhouettes, no keyholes, no padlocks, no "unlock" copy, no stated requirements, no progress ladder, no tier badges, **anywhere in the product**. A phenomenon the user has not met is simply not in the Journal's list. There is no paywall, no in-app purchase, no subscription, and no advertising.

**Empty states carry exactly one action.**

| Surface | Copy | Action |
|---|---|---|
| Home (no cases) | featured card + `Nothing on file yet.` | `BEGIN BRIEF` |
| Journal · Overview | `Your record starts with one night.` | `Begin a case` |
| Journal · Phenomena | `Four phenomena on file. None documented yet.` | `Open the field guide` |
| Journal · Evidence | `Nothing kept yet.` | `Begin a case` |
| Journal · Cases | `No cases sealed.` | `Begin a case` |

**Absence in the report is scoped.** The `NOT RECORDED` panel lists only what was **meaningful to have caught**. A tool that was never opened, a permission that was denied, or a sensor that was absent generates no line. When no line qualifies, the panel is not rendered at all. Never an empty panel, never placeholder text.

## The four named no-event outcomes

A session that produces nothing is **never** collapsed into one generic state. There are four, each named, each with its own rail line and its own report treatment.

| Outcome | What happened | Attributed to |
|---|---|---|
| `QUIET_NIGHT` | The session held silence throughout | the night |
| `WINDOW_CLOSED_EMPTY` | The encounter window opened and produced nothing | the night |
| `FALSE_POSITIVE` | A signal was logged and triage resolved it as ordinary | **the user's own action** |
| `NOT_FRAMED` | An encounter occurred but the user was looking at the wrong tool | **the user's own action** |

**The night-attributed / user-attributed distinction must survive into the copy.** `NOT_FRAMED` does real work: it tells a user who missed an encounter that they were watching the wrong instrument — true, and a reason to come back, without the app ever claiming anything.

## The six failure states

Each hunt has a unique way to end badly, and **all of them still produce a complete report**.

| Stamp | In session | On the report |
|---|---|---|
| `NOTICED` | Ambience cuts to silence; one haptic; rail reads `It saw you.` | `CASE TERMINATED — SUBJECT AWARE`. Evidence preserved in full. |
| `CORNERED` | Haptics double briefly, then stop; rail reads `It's here.` | `CASE TERMINATED — PROXIMITY` |
| `GONE` | Rail reads `Movement. You missed it.` | `1 POSSIBLE VISUAL EVENT — NOT FRAMED` |
| `MISDIRECTED` | **No in-session signal at all** | `ONE ENTRY RECLASSIFIED — self-sourced.` |
| `INTERFERENCE` | Chip reads `INTERFERENCE`; EMF events suppressed briefly | `EQUIPMENT CONDITIONS — MAGNETIC INTERFERENCE` |
| `NOT_ALIGNED` | `SIGNAL LOST` | `1 SIGNAL UNRESOLVED — DEVICE NOT ALIGNED` |

> **`MISDIRECTED` has no in-session tell, and that is the design.** The user discovers it only in the report. Do not add a warning.

## The nothing-case

Zero evidence, zero encounters. **The report renders in full, not as an empty state**: `INCONCLUSIVE`, an empty signature strip, a prominent `NOT RECORDED` panel, and the line above the stat row — `Nothing was recorded tonight. That is a result.`

**This is not an error state. It is the product's central promise made visible, and it must be one of the best-looking screens in the app.** The nothing-case Share Card is the same: the empty frame is the artifact, and the field note reads `Some nights are for listening.` **Absence must be shareable or the entire law collapses.**

## The three deliberate asymmetries in triage

**Do not "fix" any of these.**

1. **The status asymmetry.** Marking items `Explained` moves a case toward `EXPLAINED`. Marking items `Unexplained` does **not** move it toward `UNEXPLAINED` — that also requires an encounter. **The interface does not explain this, and no copy states that a combination of verdicts unlocks a status.** If you find yourself wanting a tooltip that teaches the thresholds, that is the defect, not the fix.

2. **Contested evidence is invisible.** Some evidence is internally planted so the user can catch and discard it. **It presents identically to ordinary evidence until triaged, and nothing in the interface says an item is contested — and nothing congratulates the user afterwards.** This is the product's strongest honesty defence: an app that plants phantoms for the user to reject has demonstrated, in its own behaviour, that it hands the user material to be doubted.

3. **Skipped items stay `Unreviewed`** and weigh toward `INCONCLUSIVE`.

> **Build note.** The prototype's `statusOf()` function computes `UNEXPLAINED` from a bare count of `Unexplained` verdicts, with no encounter requirement, and `EXPLAINED` from a ratio against a hard-coded seven. The rendered copy is clean — the rule is never stated — but the *behaviour* is discoverable by experiment, which violates asymmetry 1. The fix belongs in the status function.

## Journal behaviour

**Deleting a case does not erase its evidence.** The evidence unlinks and keeps rendering with a `NO CASE` chip — deleting a case must not silently erase the user's history of having found something.

**The `?` signature tile is never labelled, captioned, pointed at, or the target of a coach mark.** Tapping it may open one line: `A signature you have recorded but not identified. It will match, or it will not.` **No surface anywhere states or implies that a full match is reachable, that one exists, or what completing a slot would identify.**

**Loading uses skeleton rows, never a spinner.** A spinner would imply a fetch, and there is nothing to fetch.

## Permission-denied modes

Every denial produces a **working, first-class alternative**, never a broken screen.

| Denied | Behaviour |
|---|---|
| Microphone | EVP is not offered in the carousel (Brief shows `EVP · unavailable`); Voice enters archive mode (`SCAN`, `ARCHIVE` chip) |
| Camera | Dark-room renderer — same timing, same encounter, same evidence, over a black field with overlays intact |
| Location | Uncharted tracker — no path, `UNCHARTED` chip, distances hidden; Home conditions drop the pressure line |
| Magnetometer absent | EMF runs on motion and clock at identical cadence, permanent `INFERRED` chip |

**A microphone-only hunt is a fully supported, first-class configuration.** The product must be playable end to end with **zero permissions granted**.

## Intensity, locked

Intensity is fixed during a case. Opening the sheet mid-session renders every row **locked**, and the footer line is replaced by: `Changing this mid-investigation would mean steering what you find. A case is only worth something if you didn't.`

**This friction is deliberate.** Letting a user nudge intensity mid-session would let them *spend* uncertainty, which is the one thing the product must not permit.

---

# Interaction Primitives

**Hold, not tap, for anything irreversible or initiating.** Two holds exist, and their durations are semantic:

| Gesture | Duration | Meaning |
|---|---|---|
| `HOLD TO ENTER THE FIELD` | 800ms | Crossing a threshold into a session |
| `SEAL & FILE` | 600ms | Making a document permanent |

The label swaps to `Crossing over…` at the 400ms mark on the Brief hold. Releasing early cancels cleanly with a soft warning and **leaves the Brief intact**. A `safelight` fill advances along the button — **the only progress indicator in the product, and it indicates a gesture, never a quantity.**

**Holds also cover the two ways out of a live session** (`Seal the case now` / `Leave without a report`) and the low-battery offer. **Ending early is deliberate, not a back gesture.**

**Backgrounding is a hard stop.** On background: all channels off, camera inactive, engine paused, elapsed time frozen. A session does not advance while the phone is in a pocket — that would manufacture events with nobody present. On foreground, a two-second re-calibration grace period with no events. An incoming call is treated as backgrounded. An encounter that fires while backgrounded is **suppressed entirely and does not count against the encounter allowance** — the session's cap on how many encounters it may produce.

**Silence is a first-class interaction.** After a Voice question the app says nothing for at least twelve seconds. No loading indicator, no "listening…" spinner, no countdown. The absence of a response is the designed norm and must never be decorated with activity.

**No pull-to-refresh anywhere.** There is nothing to fetch, and a spinner would break the illusion of a local instrument.

**Haptics escalate with proximity** — light for a weak signal, escalating pulses as it closes, a distinctive pattern for a rare event, a strong short impact for an encounter. **Continuous vibration is forbidden**: it burns battery, reads as a malfunction, and hands the user a tell that a sensor is running. **A haptic is never the only signal for anything** — on iOS they are silently suppressed while the camera is active, during dictation, in Low Power Mode, and whenever the user has disabled them, so every haptic must be safe to drop.

**Sound has twelve categories** and **silence is used intentionally**. There is no constant horror music. **The world should get duller and quieter before an encounter, not louder.**

**Directives are scheduled, never on demand.** A session presents at most **six directives, spaced at least three minutes apart** (FR-2). A surface may show the *last* directive and let the user re-read it, but **there is no "give me another" control** — a user-triggered advance would let someone grind through the authored pool, turning pacing into a menu and reducing the pool to a finite checklist. A directive is an **imperative that names no phenomenon, no outcome, and no direction** (`Sweep the room slowly.` · `Wait.` · `Ask it something.`). It may name a place or an action; it may never name a target or promise a result.

---

# Accessibility Floor

Behavioural requirements. Visual contrast lives in `DESIGN.md → Colors`.

**Screen reader.** The **Case Report** and **Field Journal** must be fully navigable with VoiceOver and TalkBack. **Live regions announce only evidence capture and phase change** — an over-eager live region interrupts more often than it informs. **Hidden values are never announced**: several internal values drive pacing but are invisible to sighted users, and announcing them would be both an accessibility defect and a tell.

**Dynamic Type** to 200%, with the intensity rail and the tool row capped at 140%. At the largest sizes the body clamps and scrolls; primary buttons never leave the screen. **The tool row's form factor at 200% is an open question** (PRD OQ-15) — a scrolling row of seven small targets is the most likely place in the product to break. **The cap is not an answer**; the row needs a different form factor at large sizes, and the shape of that form factor is unresolved. The direction worth validating is **a two-row labelled grid rather than shrinking targets**. Treat it as a problem to solve, not to cap away — and do not treat it as solved, because the reference prototype does **not** implement it.

**Reduce Motion** → cross-fades replace transitions, sweeping animations become static, glitch is disabled and re-routed to audio, and animated dots move statically.

**Orientation.** Portrait-locked except Camera and Sky.

**Touch targets.** No target below 44pt. The mono floor of 9.5px applies to *type*, not to hit areas.

**Contrast.** `ash` (`{colors.ash}`) is the floor for anything a user must read; its inherited 5.6:1 claim is unverified and must be measured. `dim` (`{colors.dim}`) is for non-actionable captions only. **No information is ever conveyed by colour alone** — every status is a word, and colour reinforces it.

**The entertainment line is a safety notice, not decoration.** It must be legible at the smallest supported configuration, must never be truncated, and must never be reworded.

---

# Key Flows

> These journeys are **derived from the product's design**, not narrated by the owner. They are written with named protagonists to make the beats concrete; if a real user session is narrated later, these should be reconciled against it.
>
> **The PRD's Key User Journeys (UJ-1 … UJ-4) are normative; these flows are illustrative.** They are beaten out at the level of screen behaviour — which surface, in what order, and what tells the user it worked — because that is what a UX spine has to pin down. Where a flow here and a PRD UJ disagree, the PRD wins. **The two sets are not one-to-one and should not be read as a mapping.**
>
> They diverge in ways worth stating plainly so no one mistakes a flow for a requirement. **Priya appears in both by accident of naming**: the PRD's Priya is 41 and runs a Field Note on a park bench; the Priya in Flow 1 below is 41 and runs a Shadow Person hunt on her back stairs. Same name, different scenario — the Flow 1 scenario is illustrative, the UJ-3 persona is normative. **No flow here covers UJ-2's Bigfoot/Tracker journey or the Share Card's role in it**, and **no flow covers onboarding, the Brief's calibrate→name→intention sequence, or the Journal's Onboarding-to-About path**. Those live in the PRD's UJs and in the IA above, and are not re-narrated.
>
> What the four flows *do* exercise: the terminated-early report, a thin night that still produces a document, an interrupted Field Note, and the nothing-case. Read them as worked examples of those four surfaces, not as coverage of the four UJs.

## Flow 1 — Priya, 41, on the back stairs at 11:40pm

Priya has had the app for nine days. Her partner is asleep. She has been meaning to try the Shadow Person hunt because the first one felt too safe.

1. **Entry.** She opens the app from the home screen. No notification ever brought her here — the app sends none. The Journal tab carries a single dot; she has an unsealed case from Tuesday.
2. **Choice.** She taps **Investigate**, reads the four rows, and picks `SHADOW PERSON`. Its meta line reads `Indoor · Tense · Camera-led`. The list shows all four; nothing is locked, nothing is teased.
3. **Gear-up.** In the Brief she names the case `Back Stairs`. She sets her intention to `Wait`. She calibrates — five seconds holding still, and the chip reads `Baseline set · quiet`. She turns the torch **off**, which is the right choice for this hunt and which nothing tells her.
4. **Threshold.** She holds `HOLD TO ENTER THE FIELD` for 800ms. The label turns at 400ms. **This is the beat where she stops being a person holding a phone and becomes an investigator.** The app asks for the microphone here, just in time, not at launch.
5. **Work.** She opens **Camera**. The dark-room view fills the screen — no green, no scan lines, just a vignette and corner brackets. She holds the device on the dark at the top of the stairs. Twice she opens **Radar** and sees a single confidence cone widen and narrow. She logs one bearing. On the **EMF**, the chip sits at `STILL` for ninety seconds, and she logs a dry record — `You marked a spot with no reading. That is also a record.`
6. **Tension.** Nine minutes in, the ambience drops out. Nothing is playing. The rail is silent. She does not know whether this is the app being quiet or the app being *quiet on purpose*, and the design does not tell her. She raises the camera again.
7. **Climax.** A single frame distorts — once, briefly, at the edge of the preview, low opacity and out of focus. A haptic pattern she has not felt before. The rail reads `It saw you.` The ambience is gone entirely. **She does not know whether she did something wrong, and the app will never say.** The session ends early.
8. **Consequence.** The Case Report opens. `CASE TERMINATED — SUBJECT AWARE` in an olive box. `INCONCLUSIVE`. Four evidence items, all preserved. The `NOT RECORDED` panel says `No bearing resolved after 11:49 PM.` She reads it twice.
9. **Resolution.** She writes in the investigator note, `It was watching before I saw it.` She holds `SEAL & FILE` for 600ms. The seal lands with a wobbled ring. She makes a **Share Card**, changes the field note to her own words, and sends it to one friend.

**What made the flow work:** she was never told the mechanic, the ending was legible without being explained, and the failure produced a document rather than a "you lose" screen.

## Flow 2 — Tomás, 61, on a Tuesday, in his kitchen

Tomás bought the app for the ghost hunt and does not care about the cryptid one. He has twenty minutes and low expectations.

1. **Entry.** He opens the app. **Home** answers his only question: `Tonight's conditions: deep night · quiet band`. The featured card says `GHOST INVESTIGATION · Indoor · Slow · Audio-led`.
2. **One tap.** He taps the featured card. He is in the **Brief** — he skipped Investigate entirely, which is the intended one-tap path.
3. **Gear-up.** He declines to name the case. He sets `Watch`. He leaves ambience **on** and the torch **off**. Duration auto-closes at 30 minutes. He holds to enter.
4. **Work.** He asks two questions on **Voice**. After each, the app says nothing at all for at least twelve seconds. He asks a third, and fourteen seconds later a single word appears — `» leave` — and it appears on the **EVP**, not the Voice surface he asked from. **This is the beat the design is built around**: the answer arrived somewhere he wasn't looking.
5. **Nothing else.** No encounter. No frame. He logs the word and one EMF drift. The session auto-closes at thirty minutes — **a completed case, not an abandoned one.**
6. **Climax (quiet).** The report opens `INCONCLUSIVE`. `NOT RECORDED` reads `No second word followed the first.` The Account says `A question was asked at 11:38 PM. One word followed, on a different instrument.` **The app has been honest about a thin night, and it is still a good document.**
7. **Resolution.** He does not share it. He seals it. It goes into the Journal, and his Overview stat row moves from 11 cases to 12. Clearing `FIELD ASSISTANT` is now one case closer, and no screen ever told him that.

**What made the flow work:** a mediocre night produced a complete, handsome artifact, and the app never pretended it had been more than it was.

## Flow 3 — Ade, 22, on the bus, with three minutes

1. **Entry.** Ade is not doing a hunt. He opens **Investigate** and taps the **`FIELD NOTE`** row — `A short standing observation. About three minutes.`
2. **Framing.** The screen states plainly that it is not a case and has no report: `Not a case. No report, no reference. A line in the journal.` **This is the whole point of the mode** — it must never be presented as a hunt with a shorter timer.
3. **Work.** He holds still. The ring fills. Mostly silence.
4. **Interruption.** He picks the phone up at ninety seconds. **The note ends early and records itself as short** rather than discarding what it captured. The meta line gains `· short` and the line reads `The room was quiet for the part that was kept.`
5. **Resolution.** `WRITTEN TO THE JOURNAL` → `Open the journal`. The line sits under `FIELD NOTES · NOT CASES`, below the case rows, in its own section. **It will never appear as a case, never count toward Clearance, and never produce a report.**

**What made the flow work:** an interruption degraded the output honestly instead of losing it, and the mode refused to inflate itself into something it isn't.

## Flow 4 — the night nothing happened

1. A user runs a full thirty-minute Ghost hunt with the microphone denied. EMF reads `INFERRED` throughout. No contact, no window, no encounter.
2. The report renders **in full**: `INCONCLUSIVE`, an empty signature strip, `EVIDENCE 00`, `ENCOUNTERS 00`, an activity band of `LOW`.
3. `NOT RECORDED` carries three lines, and the rail attributes the outcome: `QUIET_NIGHT · Attributed to the night.`
4. The line above the stat row reads: `Nothing was recorded tonight. That is a result.`
5. They seal it and share it. The Share Card renders the empty frame with `Nothing recorded` centred, and the note `Some nights are for listening.`

**What made the flow work:** the app's worst-case night is one of its best-looking screens, because if absence is not presentable the entire product law collapses.

---

# Inspiration & Anti-patterns

**Inspired by:** a cold-case archive · a field notebook · an observatory log · a darkroom safelight · a rubber stamp on a manila folder · ruled ledger paper · the tonality of a well-printed annual report.

**Anti-patterns — do not produce these:** cheesy Halloween styling · cartoon ghosts · cobwebs · dripping fonts · neon overload · cyberpunk glow · dense sci-fi HUDs · wireframe globes · tiny unreadable labels · fake EMF dials with red LED readouts · pulsing radar sweeps · skeuomorphic paper with torn edges or coffee stains · wax seals · trophy walls · progress bars toward anything · streak counters · leaderboards · any comparison between users.

**The one-sentence test.** Before calling anything finished: *Does this look like an instrument that a careful person would trust with the record of their night?* If it looks like a toy, a slot machine, or a ghost-hunting gadget, it is wrong — no matter how good it looks.

---

# Responsive & Platform

**iOS.** Honour the system back swipe as a *navigation* gesture, but intercept it inside a live session to raise the `Leave the field` sheet rather than discarding. Use the native share sheet. Request permissions through the standard just-in-time prompt, and after a permanent denial swap `Allow` for `Open Settings` — never re-offer in the same session, and never nag. Respect Low Power Mode by offering (never imposing) the low-power configuration.

**Android.** Back gesture must map to the same interception as iOS swipe-back. Permission copy follows the same just-in-time discipline. Haptics differ in character from iOS; the escalation *shape* is the spec, not the exact waveform.

**Both.** Portrait-locked. No tablet layout. No landscape except Camera and Sky. `Dynamic Type` / font-scale supported to 200% with the two documented caps.

**Not in v1, and each is a product change rather than a feature:** any backend, any account, any social surface, any monetization, any notification, any web companion, any iPad layout, light mode.
