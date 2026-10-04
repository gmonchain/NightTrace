---
title: NightTrace — Input Reconciliation (01-product-and-game-design.md → PRD + Addendum)
status: draft
created: 2026-10-04
source: _bmad-output/brainstorming/brainstorm-paranormal-cryptid-hunting-app-2026-10-04/01-product-and-game-design.md
targets: prd.md, addendum.md
---

# Input Reconciliation — Product & Game Design

**Purpose.** The brainstorm's `01-product-and-game-design.md` (§A–F, J, K, L, N, O, P) was the brainstorm's authoritative product output. This document records everything in it that the PRD + addendum drop, thin, or contradict. It is a gap list for the PRD owner, not a change to the PRD.

**Method.** Status is one of:

- **Covered** — present and faithful in PRD or addendum.
- **Missing** — present in the INPUT, absent from both target documents.
- **Misrepresented** — present in both, but the PRD/addendum states it differently, usually by contradiction or by narrowing without an `[OVERRIDE]` tag.

Severity: **High** = changes shipped behaviour or breaks a stated rule; **Medium** = loses a designed decision, hook, or copy rule; **Low** = detail, copy, or implementation colour.

**Excluded by instruction.** The Case Report percentage override is documented (PRD §4.6 `[OVERRIDE]`, §8 OQ-1, §9 A-2; addendum §B.6, §A.1 #1) and is *not* re-reported as a gap. Everything the override *drags with it* **is** reported (Group 4 and the prose).

---

## 1. Reconciliation table

### Group 1 — Voice, tone, and line-level writing rules (INPUT §B.7, §A.7, §I.1)

| Input item | PRD status | Evidence | Severity |
|---|---|---|---|
| Six binding voice rules: never assert · never wink · never explain the mechanic · hedge is craft · short sentences · "ghost" only in the Hunt name (INPUT §B.7) | Covered (addendum only) | addendum §I.1 reproduces all six | Low |
| **"Max 9 words on any in-session line"** | Covered (addendum only) | addendum §I.1. No FR carries it; the addendum is explicitly non-normative (§ opening), so nothing in the build-failing lint enforces it | Medium |
| **"Never wink" as a *location* rule** — no `(this is just a game!)` **inside the fiction**; the framing lives only in onboarding, shared audio, and About, **never in the moment** (INPUT §B.7 rule 2) | Misrepresented | addendum §I.1 keeps the phrase "Never wink" but drops "inside the fiction" and the location rule; PRD FR-32/FR-33 govern *where the notice is reachable*, not *where framing is forbidden* | Medium |
| **"The app must never tell the user what they are about to find"** — every micro-directive is a verb offered, never a target named (INPUT §A.7, §F.10) | Covered (addendum only) | addendum §I.1 sentence 5. The rule is stated but its enforcement surface (the directive pool + its grep test) is gone — see Group 3 | Medium |
| Hedge vocabulary list: `Possible`, `unconfirmed`, `unsigned`, `no match on file`, `the record is unclear` (INPUT §B.7 rule 4) | Covered | addendum §I.1 | Low |
| In-session vocabulary: `signal`, `contact`, `movement`, `the record`; "ghost" only in the Hunt name | Covered | addendum §I.1 | Low |
| Failure copy examples: `It said something.` / `Movement. NE.` / `The record changed.` / `Nothing answered tonight.` (INPUT §D.5, §F.15, §F.5) | Missing | Not in PRD or addendum. FR-22 requires "three to six declarative lines" with no examples; no FR fixes the aftermath-line register | Low |

### Group 2 — Silence, absence, and the negative-space model (INPUT §A.5.5, §F.5, §F.9, §F.7 rule 10)

| Input item | PRD status | Evidence | Severity |
|---|---|---|---|
| **Four named no-event outcomes**, each an intentional positive result: `QUIET_NIGHT`, `WINDOW_CLOSED_EMPTY`, `FALSE_POSITIVE`, `NOT_FRAMED` (INPUT §F.5) | Missing | PRD FR-2, FR-21 and SM-7 gesture at empty windows but name no outcome and carry none of the four report lines | High |
| **`WINDOW_CLOSED_EMPTY` produces no text at all** — only the breathing dot slows and returns; "the single most sophisticated moment in the product" (INPUT §F.5) | Missing | No PRD/addendum mention | High |
| `FALSE_POSITIVE` rail copy *"That was the building."* — **only when the user says so** (INPUT §F.5) | Missing | PRD FR-20 has explained reasons; the rule that the app concedes in the user's voice is absent | Medium |
| `NOT_FRAMED` rail copy *"Movement. You missed it."* + report line *"1 possible visual event, not framed."* (INPUT §F.5, §F.9) | Missing | Not in PRD or addendum | Medium |
| **The negative-space honesty rule:** an absence line is written **only when the corresponding system was actually running**; never claim "no electromagnetic activity" on a phone with no magnetometer (INPUT §F.9) | Missing | PRD FR-22 says only "states plainly that nothing was recorded, and is omitted entirely when it does not apply" — a generic lander that loses the "absence is meaningful only where a measurement was possible" test | High |
| Negative space is capped at 4 lines and drawn from a defined generator (INPUT §F.9) | Missing | PRD FR-22 does not bound it | Low |
| **Rule 10 of the anti-predictability set:** "a long silence does not raise hazard" — the memoryless draw defeats the "nothing happened, so something is coming" inference; "the most important rule in the file" (INPUT §F.7) | Misrepresented | PRD FR-2 requires that timing "not be learnable" but never states the specific inference being defeated; addendum §C.6 gives the ratio target without the law | Medium |

### Group 3 — Directives (INPUT §A.7, §E6.5, §F.10, §J.3)

| Input item | PRD status | Evidence | Severity |
|---|---|---|---|
| **The whole micro-directive system** — a verb-with-no-object nudge offered on the rail (INPUT §F.10) | Missing | No FR in the PRD mentions directives. PRD FR-2's "A session directive may constrain the space of what can happen" is the *engine* `SessionDirective`, a different object | High |
| Directive pool with exact strings, split `open` / `mid` / `close` (INPUT §F.10) | Missing | Not in PRD or addendum | High |
| Directive rules: max 6/session · ≥3 min spacing · never names a target (grep-enforced) · never repeats · state-tied · dismissible · `I need a direction` re-request (INPUT §F.10) | Missing | Not in PRD or addendum | High |
| First-session micro-directive at 00:45 is the mechanism that keeps early silence legible (INPUT §A.3 risk 4, §D.3) | Missing | PRD FR-2/FR-3 mandate silence but supply no in-session accompaniment | Medium |
| **Shadow Person's one honest hint:** after the first `shadow` evidence the directive pool swaps to the stillness-biased set (`Hold still and listen.` / `Set the phone down and step back.`) (INPUT §J.3) | Missing | PRD FR-6 describes the Observer inversion ("avoid being seen") but not its fairness valve; that valve is a directive, which the PRD does not have | High |

### Group 4 — The Case Report (INPUT §F.17, §K.14, §A.2.1, §F.9, §K.1)

| Input item | PRD status | Evidence | Severity |
|---|---|---|---|
| Stat row is **"counts and durations only. No percentage, no score, no grade"** (INPUT §K.14) | Misrepresented — **documented override** | PRD FR-22 adds the strongest-anomaly % and activity level. *Reported here only for its collateral; see rows below and prose §2.1* | — |
| **`<StatRow>` dev assertion:** the shared component "asserts at runtime in dev that no value is a percentage string" (INPUT §K.1) | Missing (collateral) | PRD FR-22 will make this assertion throw. Not mentioned in OQ-1/A-2/§B.6 | High |
| **ASO screenshot rule:** "Screenshots must lead with the Case Report… **No screenshot may depict a numerical readout, a percentage, or a distance**" (INPUT §P.6) | Missing (collateral) | The report keeps a % *and* is required to be screenshot #1. No PRD or addendum text reconciles this | High |
| **The "surviving numerals" charter:** only (a) elapsed session time, (b) the user's own journal counts, (c) Spirit Box band frequencies may appear (INPUT §A.2.1) | Missing (collateral) | Neither PRD nor addendum states a bounded list of permitted numerals, so the report % has no charter to sit inside. PRD §8 OQ-1/A-2 argue the % is "case metadata" but never enumerate what else is permitted | Medium |
| **Share-card percentages** — the override preamble (PRD §4.6) names the brief's `ACTIVITY 93%` **on the share card**, but PRD FR-24 gives the card a "three-cell stat row" and no percentage, while INPUT §K.15/§P.2 row 9 keep the card numeric-free | Misrepresented (unresolved) | PRD §4.6 vs FR-24. The override is applied to the report and silently *not* applied to the card it also names | Medium |
| Fail-state **report stamps and lines**: `CASE TERMINATED — SUBJECT AWARE` · `CASE TERMINATED — PROXIMITY` · `ONE ENTRY RECLASSIFIED — self-sourced.` · `EQUIPMENT CONDITIONS — MAGNETIC INTERFERENCE DETECTED` · `1 SIGNAL UNRESOLVED — DEVICE NOT ALIGNED` (INPUT §F.9) | Missing | PRD FR-6 names the fail states but no report treatment; addendum is silent. The `MISDIRECTED` revision line is the INPUT's "best report beat in the game" | Medium |
| **Long-press any report block → `Share this block`** (INPUT §F.17, §K.14) | Missing | PRD FR-24 covers only whole-card sharing | Medium |
| Recovered case: a `RECOVERED CASE` banner on Home + report built from the checkpoint (INPUT §F.17, §K.14) | Misrepresented | PRD FR-30 has a "resume affordance"; the recovered-case banner, its copy (`NT-017 ended unexpectedly. Seal it?`) and the checkpoint-built report are absent | Medium |
| Session under 60 s → **no report**, case discarded with a one-line notice (INPUT §F.17) | Missing | PRD FR-8 gives Ghost a 60 s minimum but states no general discard rule | Low |
| 900 ms `COMPILING CASE FILE` deliberate beat before the report (INPUT §D.6, §K.14) | Missing | Not in PRD or addendum | Low |

### Group 5 — The Share Card (INPUT §F.18, §K.15, §I.5)

| Input item | PRD status | Evidence | Severity |
|---|---|---|---|
| Field note is **one of four seeded lines or the user's own**, and "**The app never generates this text**" (INPUT §F.18, §D.7) | Misrepresented | PRD FR-24 says "a short seeded field note" (singular); the four-option + write-your-own sheet and the never-generate rule are gone | Medium |
| Nothing-case card is **deliberately one of the best-looking cards in the app**; field note *"Some nights are for listening."* (INPUT §F.18) | Covered | addendum §I.1 carries the line; PRD FR-24 carries the negative-space treatment | Low |
| **78% width**, 9:16 default + 4:5 feed (INPUT §K.15, addendum §I.5) | Covered | addendum §I.5 | Low |
| Media-library-denied path: `Save to Photos` **hides entirely**, share still works (INPUT §K.15) | Missing | PRD FR-24 says the card "can be shared… saved to photos, or cancelled without loss" — no denied path | Low |
| About notice reachable by **long-pressing any share-card footer** (INPUT §C.4, §K.20) | Missing | Not in PRD or addendum | Low |

### Group 6 — The Triage ritual (INPUT §F.16, §F.9, §F.14, §K.14)

| Input item | PRD status | Evidence | Severity |
|---|---|---|---|
| **Triage asymmetry:** triaging everything `Unexplained` does not raise status; status comes from evidence diversity, encounter presence, and signature convergence — "the user cannot brute-force a better ending" (INPUT §F.16) | Partially Covered | PRD FR-21 encodes the *outcome* (status thresholds) but not the *anti-brute-force* intent or the asymmetry rule | Medium |
| **Badge `Nothing but the wind`** for sealing a case with ≥5 items all explained (INPUT §F.16) — a badge whose award condition is a triage behaviour | Missing | PRD FR-29 awards "case stamps" generically; §6.2 defers only *hidden* badges | Low |
| Re-triaging a sealed case is **allowed**, re-renders with a `REVISED` stamp and a new revision row (INPUT §F.16) | Covered | PRD FR-22 "a revision stamp if later edited" | Low |
| In-session capture card's `Mark as explained` writes a verdict **at capture time**, and ignoring the card still logs as `unreviewed` (INPUT §F.14) | Partially Covered | PRD FR-18/FR-20 cover commit-on-find and the verdicts; the "ignoring never loses a souvenir" rule is absent | Low |
| Skipped items stay `unreviewed` and weight toward `INCONCLUSIVE` (INPUT §F.16) | Covered | PRD FR-20 lists `UNREVIEWED`; FR-21 thresholds | Low |

### Group 7 — The Signature Archive and Journal (INPUT §F.19, §J.5, §K.16)

| Input item | PRD status | Evidence | Severity |
|---|---|---|---|
| The `?` slot is a **partial signature at convergence 0.3–0.6**, stored as unmatched (INPUT §F.19) | Missing | PRD FR-19 defines the three slot states but not the band or the mechanism | Medium |
| **A future creature drop can *complete* an existing `?` slot** — the strongest content-drop hook (INPUT §F.19, §J.5) | Missing | Not in PRD or addendum. Addendum §A.3 mentions `UNIDENTIFIED SIGNATURE` as a report outcome but not archive completion | Medium |
| The `?` tiles pulse `amber` at 0.5 Hz — "the strongest return hook" (INPUT §K.16) | Missing | Not in PRD or addendum | Low |
| Overview segment: 4-stat header + **30-day activity strip** (INPUT §K.16) | Missing | PRD FR-25 lists the segments only | Low |
| Phenomena card carries a **`BEHAVIOUR` line** (e.g. `Approaches. Avoids light.`) (INPUT §K.16) | Missing | PRD FR-25 gives counts only | Low |
| Evidence segment filters are **Newest / Rarest / Strongest** (INPUT §K.16) | Misrepresented | PRD §6.2 defers search but says "filters by kind and Phenomenon remain" — a different filter set | Low |
| Deleting a case unlinks evidence to `orphaned` with a `NO CASE` chip — "deleting a case must not silently erase the user's history of having found something" (INPUT §K.16) | Missing | Not in PRD or addendum | Medium |
| `UNIDENTIFIED SIGNATURE` (INPUT §A.2.10, §E17) | Covered | addendum §A.3 | Low |
| Signature strip renders 7–9 slots against the Archive | Covered | PRD FR-19 | — |

### Group 8 — Home and the Daily Anomaly (INPUT §F.02, §K.3, §A.5.4)

| Input item | PRD status | Evidence | Severity |
|---|---|---|---|
| Anomaly is `hash(dayKey + contentVersion)`: **every user on the same local day gets the same *class* of anomaly**, seeded differently per device (INPUT §F.02) | Missing | PRD FR-30 says "drawn from an authored, seeded set" — no day-determinism, no shared-class property. This is the honest, backend-free version of the deferred shared-seed night and it is lost | Medium |
| The **Anomaly card is itself shareable** via long-press (INPUT §F.02 Q3) | Missing | Not in PRD or addendum; a growth surface dropped | Medium |
| Anomaly card tap → fiction sheet → **`Investigate this`** routes to Investigate pre-filtered by the anomaly (INPUT §F.02) | Missing | PRD FR-30 has no anomaly deep-link | Low |
| Home conditions footer: `dusk · 21:04` / `light: dark` / `pressure: rising` (INPUT §K.3) | Missing | PRD FR-30 lists Home's blocks; no conditions line | Low |
| Pull-to-refresh **disabled** — "there is nothing to fetch, and a spinner would imply a server" (INPUT §K.3) | Missing | Not in PRD or addendum | Low |
| Barometer unavailable → conditions degrade to two facts and **never mention pressure** (INPUT §F.02) | Missing | PRD §6.2 covers the barometer proxy substitution, not the copy degradation | Low |

### Group 9 — Hunt Brief and Session ritual (INPUT §F.04, §F.06, §K.5, §K.6, §C.6, §D)

| Input item | PRD status | Evidence | Severity |
|---|---|---|---|
| **Hold-to-enter is 800 ms** (`<HoldButton durationMs={800}>`, INPUT §D.2 step 15, §K.5) | Misrepresented | PRD FR-9 says "roughly 600 ms". 600 ms is the INPUT's value for `SEAL & FILE` (§K.14), not for entering. No `[OVERRIDE]` | Medium |
| Gear-up rows: **Calibrate · Torch · Room tone · Auto-close duration** (INPUT §K.5) | Missing | PRD FR-9 names only calibration, name, intention, intensity, hold. Torch and Room-tone toggles and the duration row are absent | Medium |
| **User-selectable session duration** `10 / 20 / 30 / 45 / ∞`, default 30; auto-close produces a *completed* case, not an abandoned one (INPUT §D.2 step 14, §K.5) | Missing | PRD FR-8 gives per-Hunt length bands and one auto-close value; the user's duration choice is gone. INPUT §D.9 builds the whole "Vigil" session shape on it | Medium |
| Intention is three chips `Ask` / `Watch` / `Wait`, default `Watch`, with a **soft ±0.15 bias on the evidence gate** and stored for the report's `INTENT` line (INPUT §K.5) | Missing | PRD FR-9 says "set an intention" with no chips, no bias, no report line | Medium |
| Calibration is a **5-second ring** producing `Baseline set · quiet` / `· noisy surroundings` / `· inferred` (INPUT §K.5) | Missing | PRD FR-9 has "a calibration step" only | Low |
| Intensity is set at **onboarding and Profile only**; the Brief does *not* carry it (INPUT §C.1, §C.4, §C.6) | Misrepresented | PRD FR-9 lists "choose an intensity" as part of the Brief ritual. INPUT's intensity sheet is a modal reachable from Profile and the session rail, never the Brief | Medium |
| Intensity-lock copy: *"…A case is only worth something if you didn't."* (INPUT §C.6, §K.18) | Partially Covered | PRD FR-10 keeps the first sentence, drops the second — the sentence that carries the fiction | Low |
| `Leave the field` confirm sheet with `Seal the case now` / `Leave without a report`; swipe-back during a session is **not** a silent discard (INPUT §C.3, §C.4) | Missing | Not in PRD or addendum | Medium |
| `RECOVERED CASE` / `RESUME CASE` brief state (INPUT §K.5) | Missing | Not in PRD or addendum | Low |
| Session pause semantics: backgrounding **freezes elapsed time** ("a session does not advance while the phone is in a pocket"); foregrounding gives a 2 s recalibration window with no events (INPUT §F.06, §K.6) | Missing | Not in PRD or addendum; addendum §D.2 covers sensor suspension but not the no-phantom-events rule | Medium |

### Group 10 — Tools and Encounters (INPUT §F.07–F.15, §K.7–K.13, §J.2)

| Input item | PRD status | Evidence | Severity |
|---|---|---|---|
| **Ambusher posture gating** — the encounter is *rendered* only if the camera is already live at resolution time; otherwise it is delivered as peripheral movement in the previous tool (INPUT §F.11, §J.2 "the Ambusher's defining mechanic") | Missing | PRD FR-15 says the Camera can "receive an Encounter visually" but states no gating. Walks directly into `GONE`/`NOT_FRAMED`, both of which the PRD seeds without the rule that causes them | High |
| **Every encounter produces at least one artefact** — "an encounter with nothing to show is a rumour and a rumour cannot be shared" (INPUT §F.15) | Missing | PRD FR-24's negative-space branch implies it can be absent; the law is not stated anywhere | Medium |
| Aftermath line: a 3 s line alone on the rail with a fading `LOG IT` affordance for 8 s (INPUT §F.15) | Missing | Not in PRD or addendum | Medium |
| Mic denied → **EVP is removed from the tool carousel entirely** and the Brief shows `EVP · unavailable` (INPUT §F.10, §K.10) | Misrepresented | PRD FR-5 and addendum §D.4 both say "the Voice **and EVP** surfaces enter an archive mode". INPUT puts Voice in archive mode and *hides* EVP. No `[OVERRIDE]` | High |
| System-inserted EVP anomaly marker renders unlabeled in `inkFaint` and, if kept, is attributed to the user (`EVP · UNMARKED SEGMENT`), never to the app (INPUT §F.10) | Missing | Not in PRD or addendum | Medium |
| Dry log: `LOG` with no reading commits a `null_reading` reading *"You marked a spot with no reading. That is also a record."* and counts toward negative space (INPUT §F.14) | Missing | Not in PRD or addendum. A tone-bearing feature — the app logging an honest nothing | Medium |
| Camera capture composites the field overlay **out** by default; `Retain field overlay` toggle in Profile (INPUT §F.11, §K.11) | Missing | Not in PRD or addendum | Low |
| Glitch is reserved for `Intense`/`Ritual` **and the Shadow Person hunt at any intensity** (INPUT §J.3, §K.0) | Misrepresented | PRD FR-10: "Glitch-channel visuals are enabled only at `Intense` and `Ritual`"; FR-15 repeats it. addendum §A.1 #12 preserves the Shadow exception, so PRD and addendum disagree with each other | Medium |
| EMF: `HOLD STEADY` motion guard; interference rail line *"Something in this room is magnetic."*; `INTERFERENCE` suppresses EMF events for 30 s (INPUT §F.07, §K.7) | Partially Covered | addendum §C.7 covers the Ambusher stall and Voice lock; the EMF interference loop is only partially present | Low |
| Tracker: trail polyline stored only when location is granted and rendered **only as an abstract path, never a map with a pin** (INPUT §F.12) | Partially Covered | addendum §G.7 covers "no coordinates on any report"; the abstract-path rule is absent | Low |
| Radar: noise targets are indistinguishable from entity targets for their lifetime; decoys are a post-MVP archetype already supported (INPUT §F.08) | Missing | PRD FR-12 requires targets be procedural but not the noise/entity indistinguishability | Low |
| Sky: az/alt are "the only numbers saved in the product's evidence model" and are allowed because they describe the user's own device posture (INPUT §F.13) | Partially Covered | PRD FR-17 keeps the readout but does not carry the justification — which is the *only* place the PRD argues a numeral is safe outside the report override | Medium |

### Group 11 — Progression, hunting ladder, and power (INPUT §F.20, §F.21, §J, §K.17)

| Input item | PRD status | Evidence | Severity |
|---|---|---|---|
| **Hunt unlock ladder:** Ghost always; Bigfoot after 1 sealed case; Shadow Person after 2; Alien after 3 (INPUT §J matrix, §F.03) | Missing | PRD §4.2 lists all four Hunts with no gating. PRD FR-28 says Clearance "never gates a Hunt", which is true of *Clearance* but leaves the `casesSealed` gate unstated. With monetization deferred, whether the ladder survives is unresolved | High |
| **The Investigate screen** (tab 2 of 4, LOCKED): phenomenon cards with locked silhouettes, exact stated requirements, `READY` / `2 OF 3 FREE` / `LOCKED` chips, and "**Never a purchase CTA** from a locked card" (INPUT §C.1, §F.03, §K.4) | Missing | No PRD FR describes Investigate. The four-tab structure survives only in addendum §A.1 #8 and §G.6 never-cut item 2. "Locked silhouettes with stated requirements" is named in INPUT §Closing as one of the load-bearing return hooks | High |
| Locked rows state the requirement "as a **fact about the user's own record**, never as a tease and never with a countdown" (INPUT §K.4) | Missing | Not in PRD or addendum | Medium |
| Lock-reveal animation fires the `confirm` haptic **once**, guarded by a `seenUnlock` flag (INPUT §K.4) | Missing | Not in PRD or addendum | Low |
| Profile tab contents: Diagnostics long-press (seed, tick counts, `Copy diagnostics`), `Retain field overlay`, membership block (INPUT §K.17) | Missing | PRD FR-27 covers export/delete; the diagnostics bug-report path and Profile's structure are absent | Low |
| Badges named in the INPUT: `Seen, and stayed` (NOTICED), `Nothing but the wind` (≥5 explained) (INPUT §F.9, §F.16) | Missing | PRD FR-29 awards stamps generically | Low |
| Advancement shown as a **second stamped endorsement impression** on the report seal, never a progress bar (INPUT §F.20) | Missing | Not in PRD or addendum | Low |
| **Battery <5% → `Seal now and keep your case`**, producing a full report from the checkpoint — "this single behaviour prevents the worst possible outcome: losing a case" (INPUT §F.21, §K.19) | Missing | PRD FR-5's NFRs mention a low-power path; the critical-battery seal offer is absent | Medium |
| Low-power estimates are always **bands** (`about 40 min`), never a percentage — "the app does not report numbers the user could verify against the OS" (INPUT §K.19) | Missing | Not in PRD or addendum; directly relevant to the override's surviving-numerals problem | Medium |
| OS Low Power Mode is mirrored automatically and announced once (INPUT §F.21) | Missing | Not in PRD or addendum | Low |

### Group 12 — Claims, ASO, and review readiness (INPUT §P.3–P.6)

| Input item | PRD status | Evidence | Severity |
|---|---|---|---|
| Banned-term lint list and `%` scope: `%` **as a readout of anything the app senses** (INPUT §P.3) | Misrepresented | PRD FR-33 narrows it to "percentage used as a sensed readout **on a tool surface**". A lint built from INPUT §P.3 would fail the build on the report's retained %. The narrowing is the mechanism that makes the override survivable, and it is stated nowhere as deliberate | High |
| **Store-listing copy** written to spec, with the entertainment sentence in the first three lines (INPUT §P.6, §P.4 layer 1) | Partially Covered | addendum §B.5 gives the three-layer architecture; the listing text and the "second sentence, first three lines" requirement are not carried | Medium |
| **Screenshot order** and the no-numerals rule (INPUT §P.6) | Missing | addendum §G.7 covers `assets/store/*` only; see Group 4 collateral | High |
| Privacy label declares **Data Not Collected** (INPUT §P.5) | Missing | addendum §F.3 covers local-only analytics; the store label declaration is absent | Low |
| **App Review notes** must state (a)–(e): simulation for entertainment; no detection claims; all local; permissions optional/JIT; notice at Profile → About (INPUT §P.5) | Missing | Not in PRD or addendum. A delivery artifact, but a release gate in the INPUT | Medium |
| "A reviewer testing the app in a bright office must be able to reach the About screen in **two taps from launch**" (INPUT §P.5) | Missing | Not in PRD or addendum | Low |
| About notice's six sections including the exact `SAFETY` copy (INPUT §K.20, §P.4 layer 3) | Covered | addendum §B.5 lists all six section names | Low |
| **No encounter is ever a full-screen pop-up** — a named scare-app mitigation (INPUT §P.5, §F.15) | Partially Covered | PRD FR-15 says frames are "short sprite sequences… never centred"; the affirmative safety rule (never full-screen, so a surprise scare cannot happen) is not stated | Medium |
| iOS purpose strings, verbatim (INPUT §P.5) | Partially Covered | addendum §D.5 gives `NSMotionUsageDescription`; microphone and location strings are absent | Low |
| UGC-policy note that there is no feed/upload (INPUT §P.5) | Covered | PRD FR-26; addendum §P.5 rationale | Low |

### Group 13 — Engine and design law (INPUT §F.3, §F.4, §F.7, §A.2)

| Input item | PRD status | Evidence | Severity |
|---|---|---|---|
| **Attunement** (0..1) — the hidden scalar that rises with *engaged behaviour* (tool use, movement, asking, logging) and decays with idleness; "the anti-‘do nothing' valve" (INPUT §F.3.1) | Misrepresented | PRD FR-4 lists only "tension". addendum §H names attunement as a hidden scalar but not its behavioural role. The design property — a user who sweeps slowly gets a better night, and that is not a placebo — is lost | Medium |
| **Juice** (0..1) — sensor noise treated as content; **widens the event *family distribution* but never raises total event count** (INPUT §F.3.2) | Missing | Not in PRD or addendum. "Sensor noise changes the flavour of the night, never the quantity of the night" is a load-bearing branch line | Medium |
| **Temperament** — four fields drawn once per session, never revealed, never persisted to the report; "the cheapest and most important anti-predictability device in the product" (INPUT §F.3.3) | Partially Covered | addendum §C.3 names `temperament` under `rng.session`; its per-session, never-revealed, silence-scaling behaviour is not stated | Medium |
| **Rarity ladder** gated by tension (common/uncommon/rare/very_rare/legendary) and the **Legendary flag** drawn once at session creation, never announced as missed (INPUT §F.6) | Partially Covered | addendum §A.1 #4 and §C.6 give the 0.4–0.6% figure and "gated by flag"; the ladder and the "never told you missed one" rule are not in the PRD | Medium |
| **Max two encounter windows per session**; the second only if >20 min and budget remains — "a third would make encounters feel routine" (INPUT §F.1) | Missing | PRD FR-2 does not bound windows | Low |
| **Mimic's late answer** may arrive in `QUIET`/`SIGNALS` without a window (a 90 s tail is in-fiction) (INPUT §F.1, §F.8) | Missing | PRD FR-13 does not carry it | Low |
| Failures are **emissions with copy, not error states**; each archetype's fail "produces a *better story*, not a penalty" (INPUT §A.2.7, §F.9) | Partially Covered | PRD FR-6 lists fail states; the principle that failing is a better story is implicit in UJ-2 but not stated | Low |
| **No source doc contains a "rescue" emission** and it is test-asserted (INPUT §F.5) | Covered | PRD FR-2 "Silence is always a valid draw"; §F.11 testability table | Low |
| Seed includes `dailyAnomalyId` (INPUT §F.05) | Missing | addendum §C.3 `SeedParts` omits it | Low |
| `StatRow`/component contracts, tokens, haptics table, motion curves (INPUT §K.0, §K.1) | Covered (out of scope) | Correctly treated as implementation; addendum §C.1 places them downstream | Low |
| **No light mode**, ever; dark-only (INPUT §K.0) | Missing | Not in PRD or addendum. addendum §I.2 gives the palette but not the hard constraint | Low |
| **No spinners anywhere**; where a wait is authored, a `LoadBeat` types a line (INPUT §K.1) | Missing | Not in PRD or addendum | Low |
| **No sound plays at launch; no looping music ever; silence is a first-class bed and the default for Shadow Person** (INPUT §L.5) | Partially Covered | addendum §I.4 has "there is no constant horror music"; the silent-default-for-Shadow and no-sound-at-launch rules are absent | Low |
| Asset budget: **~218 files / ≈35 MB**, a second creature at ~2.5 MB (INPUT §L.8) | Missing (out of scope) | Not in PRD or addendum; correctly implementation-side, but it is the INPUT's stated constraint on content drops | Low |

### Group 14 — Scope, monetization, analytics (INPUT §N, §O)

| Input item | PRD status | Evidence | Severity |
|---|---|---|---|
| Monetization deferred to free MVP | Covered — **documented override** | addendum §A.1 #13; PRD §5, §6.2 | — |
| **The engine never knows what the user paid for** — "the moment the paywall touches the event engine, the product's central promise becomes a lie" (INPUT §N.2) | Missing | PRD §5/§6.2 defer monetization but state no architectural rule. This is the constitutional version of the deferral and it should survive it | Medium |
| Free-tier hunt limits (Bigfoot 3 cases, Shadow 1 case, Alien preview), `Intense`/`Ritual` gated (INPUT §N.2) | Missing (moot under free MVP) | Not carried; noted only so the hunt ladder decision (Group 11) is not conflated with the paywall | Low |
| Paywall choreography: after case 2, max 2 presentations per 7 days, never within 5 min of a moment of fear, never during a live session (INPUT §N.4) | Missing (moot under free MVP) | Deferred with the override; the "fear and monetization physically separated" rule is the part worth preserving if monetization returns | Low |
| **`report_shared / hunt_completed` target ≥ 25%** (INPUT §O.4, §N.6) | Misrepresented | PRD SM-1 sets **≥ 20%**. addendum §F.4 says SM-1..8 "are therefore new" — but the INPUT states a healthy value (≥25%), so SM-1 is a *lowering*, not a new target | Medium |
| Other INPUT metric targets: directive_followed/shown 30–55% · no tool <5% of `tool_opened` · paywall_viewed ≥55% · refund <2% · 1★ "money" reviews 0% (INPUT §O.4, §N.6) | Missing | PRD §7 carries share rate, D7, first-session completion, encounter rate, report view, triage engagement, silence holds, claims cleanliness. The directive and tool-share diagnostics — the two that would catch a broken directive system or a dead tool — are absent | Medium |
| `analytics_events` ring-buffered to 2,000; `session_id` deliberately not a FK; prop-shape dev assertions (INPUT §O.1, §O.3, §O.5) | Covered | addendum §F.1–F.3, §E.5 | — |
| Telemetry **never** collected: coordinates, raw sensor streams, free text, word fragments heard, media (INPUT §O.5) | Covered | addendum §F.3 | Low |

---

## 2. Prose: what the structured FR list drops

### 2.1 The percentage override's collateral (the part that *was* supposed to be re-reported)

The PRD documents the override itself thoroughly. What it does not document is that four other stated rules in the INPUT were built on the assumption that no percentage would ever appear on any screen, and the report is now the one place it does.

1. **The component-level guard dies.** INPUT §K.1 defines `<StatRow>` as a shared primitive that "asserts at runtime in dev that no value is a percentage string." FR-22 now requires a percentage inside that exact component. This is not a philosophical conflict; it is a failing assertion in the one component every stat surface uses, including the Share Card's three-cell row. The override text and OQ-1 mention only the *semantic* tension.

2. **The screenshot rule is now unsatisfiable as written.** INPUT §P.6 requires store screenshots to lead with the Case Report *and* forbids any screenshot from depicting "a numerical readout, a percentage, or a distance." Both cannot hold. Addendum §G.7 does not touch screenshots. This is the single most concrete collision the override creates, and it lands on the one artifact that store review looks at first.

3. **The "surviving numerals" charter is gone.** INPUT §A.2.1 enumerated exactly three permitted numerals: elapsed session time, the user's own journal counts, and Spirit Box band frequencies. (The Sky tool's az/alt are justified separately in §F.13 as device-posture, not measurement.) The PRD repeats the override but carries no bounded list of what else may be numeric, so there is no charter for FR-22's percentage to sit inside. A-2 asserts the percentage is "the app's own case-file index," but no document says what *else* qualifies as case metadata and what does not. Related: INPUT §K.19's rule that battery estimates are always bands, never a percentage, is also absent — an obvious place a future contributor will "helpfully" add a number.

4. **The lint's scope narrowing is doing all the work, and it is unstated as deliberate.** INPUT §P.3 bans `%` "as a readout of anything the app senses." FR-33 narrows this to "on a tool surface." That narrowing is precisely what makes the override survivable, and the PRD presents it as a definition rather than as the load-bearing carve-out it is. A lint implemented from the INPUT's wording will fail the build on the hero screen.

5. **The Share Card is left ambiguous.** The override preamble names the brief's `ACTIVITY 93%` *on the share card*, but FR-24 keeps the card's stat row at three counts and the INPUT treats the card as numeric-free. It is not stated whether the card inherits the report's numbers (which would put a percentage in the lead screenshot *and* in the thing users post) or stays clean. The two readings have very different risk profiles.

One further note on A-2's framing: the INPUT's percentage ban rested on the claim that a percentage is a measurement claim. The PRD re-labels the report's percentage as "case metadata," but "strongest anomaly 91%" and an "activity level" are, mechanically, sensor-derived anomaly readings — the weakest possible candidates for the metadata framing. If OQ-1 is resolved by renaming rather than restricting, the second-order problem is that both fields are literally the sensor's output rendered as a number, which is what INPUT §F.03/F-07/F.13 went out of their way to keep off every tool surface.

### 2.2 The directives are the missing nervous system

The largest single omission is the directive system. The PRD's engine section states the constraint — "a session directive may constrain the space of what can happen but can never name a specific event" — but that is the engine's `SessionDirective`, an internal object. The *product* directive is different: a rail line, offered no more than six times a session, at least three minutes apart, drawn from an authored open/mid/close pool, greppable to prove it never names a creature or an evidence noun, dismissible, and re-requestable with `I need a direction`. It is also the only thing that keeps a first session's silence legible (the 00:45 line in §D.3) and the only fairness valve on Shadow Person's deliberately undiscoverable inversion. Without it, two things the PRD *does* require — that the user learns the fiction by doing, and that silence reads as designed rather than broken — have no mechanism.

### 2.3 Silence is narrated in the INPUT and merely permitted in the PRD

The PRD gets the silence *engineering* exactly right and faithfully: floors, exponential tails, the 200–260 s median, the 22–35% five-minute tail, the p50/p90 ≥3.0 anti-metric. What it drops is the narration. INPUT §F.5 defines four named, positive no-event outcomes, each with its own in-session line and its own report line, and it argues that these — not the encounter — are the product's differentiator. The most valuable of the four, `WINDOW_CLOSED_EMPTY`, is defined by the *absence* of text: the window opens and closes and the only evidence is that the breathing dot slows and returns. That is the INPUT's "single most sophisticated moment in the product," and it is not in the PRD.

The companion loss is the negative-space honesty rule: an absence line may only be written when the corresponding system was actually running. "Absence is meaningful only where a measurement was possible." FR-22 collapses this into "states plainly that nothing was recorded," which loses the distinction between *nothing happened* and *we could not have known* — and that distinction is what keeps the block credible to a skeptic, which is the product's own #1 risk.

### 2.4 Voice rules survive, but as non-normative prose

The addendum reproduces INPUT §B.7 almost verbatim, which is good — hedging vocabulary, the one-sentence engine contract, "silence is narrated," the nine-word cap, the two absence lines. But the addendum states at its head that "nothing here is normative," and the PRD's own §0 architecture puts all enforcement in FRs and the build-failing lint. So the nine-word cap, the never-wink location rule, and the "never tell the user what they are about to find" rule are recorded but unenforceable: no FR cites them, no test asserts them, and the lint (FR-33) checks lexical bans, not sentence length or register. A discipline that lives only in a non-normative document will not survive the first ticket written by someone who has not read it. This is a process gap, not a content gap, and it is cheap to close by promoting the §B.7 list into FR-33's consequences.

### 2.5 Contradictions with no `[OVERRIDE]` tag

Five INPUT decisions are reversed or narrowed silently. Each deserves either an override entry or a correction:

- **800 ms → 600 ms** for hold-to-enter (INPUT §K.5 vs FR-9). 600 ms is the INPUT's *seal* duration.
- **EVP under a denied microphone is hidden from the carousel** (INPUT §F.10, §K.10), not "in archive mode" (FR-5, addendum §D.4).
- **Verbs are shown to the user** in Investigate and briefly in the Brief (INPUT §F.03/K.4, §F.8 interface comment: "the user's verb, shown in the Brief"). The PRD Glossary states the opposite in bold terms: "Verbs are never told to the user directly; they are learned from the Hunt's behaviour." This is a real change to how the fiction is delivered, and it is not marked.
- **Field Note produces a short-form report** in one INPUT passage (§D.9: "a `FIELD NOTE` report (a short-form case, one third the length)") and explicitly does *not* in another (§A.2.6: "Never promise a case report from 2 minutes"). FR-31 chose the second reading. That is defensible, and the INPUT contradicts itself, but the PRD does not record which side it took or why.
- **Intensity is chosen at onboarding and Profile, never in the Brief** (INPUT §C.1, §C.4); FR-9 puts it in the Brief ritual.

### 2.6 Things with no FR and no non-goal

Beyond the directives and the hunt ladder, several INPUT decisions simply have nowhere to live in the PRD: long-press-to-share any report block; the recovered-case banner and checkpoint-built report; `Leave the field` as the only in-session exit; the user-selectable duration that creates the "Vigil" session shape; the dry log that records an honest nothing; the rule that an encounter always yields an artefact; the Ambusher's posture gating that causes `GONE`; the battery-critical "seal now" escape hatch; the fail-state report stamps; and the extension of the `?` slot so a future creature can complete it. Individually most are Medium or Low. Two patterns tie them together. First, **the PRD's report is described by its blocks, not by what each block says in the hard cases** — absence, failure, recovery, and revision all lose their copy. Second, **the PRD treats the four Hunts as four tool-sets and four pacing profiles**, which is faithful as far as it goes, but loses the mechanical identity of each (posture gating for the Ambusher, the directive swap for the Observer, the late answer for the Mimic, self-closure for the Stalker) — the very things that make the four "four games" rather than one game with four reskins, which is the INPUT's most emphatic claim about them.
