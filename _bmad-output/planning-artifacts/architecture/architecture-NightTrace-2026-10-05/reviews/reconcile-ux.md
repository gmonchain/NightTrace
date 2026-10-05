# Reconcile — UX spines → Architecture Spine

**Sources (requirements):**
- `../../ux-designs/ux-NightTrace-2026-10-04/EXPERIENCE.md` (primary — behaviour, states, IA)
- `../../ux-designs/ux-NightTrace-2026-10-04/DESIGN.md` (visual system, token set, hard "never" rules)
- `../../ux-designs/ux-NightTrace-2026-10-04/design-brief-ai.md` (cross-check only)

**Target:** `../ARCHITECTURE-SPINE.md`

**Reconciled by:** input-reconciliation reviewer, 2026-10-05
**Job:** find what the sources **required** that the spine **failed to carry**. Not quality judgments, not recommendations the sources don't state.

---

## Method

Read both spines in full, then checked the spine's 23 ADs, its conventions table, capability map, stack and Deferred list against each named requirements cluster: IA + screen tree, the five navigation invariants, the presentation-rules table, the seven tools' non-negotiables, the four permission-denied modes, DESIGN.md's mandates, the triage asymmetries, and the outcome/state taxonomies. Each finding below names the source section and states whether it is **architecture** (belongs in the spine) or **implementation/epic-level**.

## What the spine does carry (checked; not reported as gaps)

Token set and two-source sync (AD-17) · "no number that reads as a measurement" (AD-15) · `%` banned everywhere (AD-15/16) · exact entertainment string as a single constant (AD-16) · blocked-terms lint over an enumerated surface set, plus the five lint blind spots (AD-16) · the safelight-hue open question and the serif/mono split, both preserved in Deferred · offline / no-account / no-network structure and the "*nothing leaves this phone*, never *nothing is recorded*" wording split (AD-21) · determinism and non-replay audit posture (AD-3) · directive scheduling, six max, three-minute spacing, no "give me another" (AD-6) · the status asymmetry's encounter requirement and "verdicts never move the signature strip" (AD-8) · "no copy may state what unlocks what" (AD-8) · evidence-kind closed vocabulary (AD-18) · playable with zero permissions (AD-13) · the seven tool surfaces exist as `features/*` and converge on one presenter (AD-2, §4.4) · tool-row large-type form factor (OQ-15, Deferred).

Those are genuinely landed. The rest is below.

---

## PART 1 — CONFLICTS (the spine contradicts a source)

### C-1 — AD-13 "every channel degrades to a content-equivalent path" contradicts "EVP is not offered"

- **Source:** `EXPERIENCE.md → State Patterns → Permission-denied modes`: "Microphone | **EVP is not offered in the carousel** (Brief shows `EVP · unavailable`) … Honest visible absence beats a broken screen." Reinforced in `Component Patterns → EVP` ("the tool is not offered in the carousel **at all**").
- **What the spine says:** AD-13 — "Every channel resolves to one of … `permission_denied` … and **every one of them degrades to a content-equivalent path**: the digest's contract is unchanged, so no hunt depends on hardware."
- **Why it conflicts:** AD-13's rule reads as a mandate that *every* channel — microphone included — has a working first-class fallback. The UX gives EVP **no fallback by design**; it removes the tool. An implementer following AD-13 literally builds an EVP degraded mode that the UX explicitly forbids, and the product loses its deliberate "visible absence" honesty signal.
- **Classification:** **Architecture.** AD-13 needs the carve-out stated: "no *hunt* depends on hardware; one tool (EVP) is deliberately removed, not degraded."
- **Note:** the other three denial modes (`Camera` dark-room renderer, `Location` uncharted tracker, magnetometer-absent `INFERRED` EMF) are consistent with AD-13 and are carried implicitly — but the spine names none of them, so the camera/location fallback contracts are also unstated (see A-9).

---

## PART 2 — ARCHITECTURE GAPS (requirements that belong in the spine and are simply absent)

### A-1 — The session-outcome taxonomy is absent from the domain entirely

- **Source:** `EXPERIENCE.md → State Patterns → The four named no-event outcomes` and `→ The six failure states`.
- **Requirement:** four named no-event outcomes — `QUIET_NIGHT`, `WINDOW_CLOSED_EMPTY`, `FALSE_POSITIVE`, `NOT_FRAMED` — each with its own rail line, its own report treatment, and a **night-attributed / user-attributed distinction that must survive into the copy**; and six failure states — `NOTICED`, `CORNERED`, `GONE`, `MISDIRECTED`, `INTERFERENCE`, `NOT_ALIGNED` — **all of which still produce a complete report**. `MISDIRECTED` carries an explicit prohibition: "**No in-session signal at all, and that is the design. Do not add a warning.**"
- **What the spine does:** neither set appears anywhere (0 hits for every token). No emission, no DB column, no report field, no engine rule.
- **Why it is architecture:** these are the engine's terminal outputs and the report's contract. The engine's `Emission` union (AD-2/AD-14 exhausted `switch`) cannot be complete without them, and the report renderer keys off them. The `MISDIRECTED` "no tell" rule is a quiet prohibition an AD-shaped spine cannot pick up.
- **Classification:** **Architecture.**

### A-2 — Sky's `GENERATED` provenance is not carried into the data model or renderers

- **Source:** `EXPERIENCE.md → Component Patterns → Sky`: the star field is "**permanently labelled `GENERATED`**" and "**the `GENERATED` label travels with any capture into every surface it later appears on** — the ledger, the souvenir reel, the report, the Share Card. This is the most falsifiable asset the product can emit, and the label is what keeps it honest."
- **What the spine does:** `GENERATED` appears only as "CNG-generated" (AD-23). No provenance field, no "label travels" rule.
- **Why it is architecture:** this is a persistence contract — a capture's provenance must be stored and honoured by every downstream renderer, not a per-screen styling choice. It is exactly the class of thing an architecture spine exists to guarantee.
- **Classification:** **Architecture.**

### A-3 — Contested (internally-planted) evidence has no representation

- **Source:** `EXPERIENCE.md → State Patterns → three deliberate asymmetries, #2`: "Some evidence is internally planted so the user can catch and discard it. **It presents identically to ordinary evidence until triaged, and nothing in the interface says an item is contested — and nothing congratulates the user afterwards.**"
- **What the spine does:** absent (0 hits). AD-18 fixes the evidence-kind vocabulary but has no notion of a planted item, and AD-8 fixes status without one.
- **Why it is architecture:** it requires a hidden, never-surfaced flag on the evidence record, plus a content-authoring path for planting. It is a data-model requirement with a hard "never surface it" rule.
- **Classification:** **Architecture.**

### A-4 — Backgrounding hard-stop semantics are dropped

- **Source:** `EXPERIENCE.md → Interaction Primitives`: "**Backgrounding is a hard stop.** On background: all channels off, camera inactive, engine paused, elapsed time frozen. … On foreground, a two-second re-calibration grace period with no events. An incoming call is treated as backgrounded. An encounter that fires while backgrounded is **suppressed entirely and does not count against the encounter allowance**."
- **What the spine does:** AD-11 mentions "on every backgrounding, one exclusive transaction updates elapsed time, appends the RLE tick digest" — i.e. it treats backgrounding as a *checkpoint trigger only*. It never states that elapsed time freezes, that the engine halts, that the camera deactivates, or that an encounter fired while backgrounded is suppressed and does not consume the encounter allowance (an engine concept — the session's cap — that also does not exist in the spine).
- **Why it is architecture:** it is app-lifecycle + engine-time semantics ("a session does not advance while the phone is in a pocket"), and AD-3's determinism depends on it.
- **Classification:** **Architecture.**

### A-5 — "Under sixty seconds → no report at all" is absent, and sits in tension with AD-11

- **Source:** `EXPERIENCE.md → The Case Report`: "**Under sixty seconds → no report at all.** … The case is discarded with a one-line notice."
- **What the spine does:** no mention. Worse, AD-11 states "**Evidence commits at the moment of capture**, not at session end." A sub-60s session therefore already has evidence in SQLite when the discard rule fires, but the spine states no behaviour for it. This is a real fork: does the discarded case's evidence unlink (as with case deletion, A-6) or is it removed?
- **Why it is architecture:** it is a lifecycle/business rule on the session→report transition.
- **Classification:** **Architecture.**

### A-6 — Case deletion must not erase evidence

- **Source:** `EXPERIENCE.md → State Patterns → Journal behaviour`: "**Deleting a case does not erase its evidence.** The evidence unlinks and keeps rendering with a `NO CASE` chip — deleting a case must not silently erase the user's history of having found something."
- **What the spine does:** AD-21 protects *analytics* from case deletion (no FK) and AD-9 explains the catalogue/user FK asymmetry, but the case→evidence unlink behaviour is never stated. The erDiagram's `CASE_REPORTS ||--o{ EVIDENCE` implies the opposite.
- **Classification:** **Architecture** (data lifecycle).

### A-7 — The five navigation invariants are absent

- **Source:** `EXPERIENCE.md → Information Architecture → Navigation invariants` (stated as testable; "each is a bug if violated"):
  1. a live session is never more than one gesture from its tools;
  2. **no path ends a session without offering `SEAL & FILE`**;
  3. the report is always reachable from the Journal and at the end of a session;
  4. **no dead ends — every empty state carries exactly one action**;
  5. **intensity is locked during a case.**
- **What the spine does:** none appear. Invariant 5 is the sharpest drop: the intensity-lock is a product law ("Changing this mid-investigation would mean steering what you find…"), an anti-spendable-uncertainty rule of the same family AD-8 protects, and the spine never mentions intensity locking at all. Invariant 2 ties directly to the `SEAL & FILE` hold (A-8/via holds) and to "ending early is deliberate, not a back gesture".
- **Classification:** **Architecture** (invariants 1–3 are routing/state-machine; 4 is a UI contract that could be epics; 5 is domain law — belongs in the spine).

### A-8 — The hold gesture and irreversible sealing are absent

- **Source:** `EXPERIENCE.md → Interaction Primitives` and `→ The Case Report`: two holds with semantic durations — `HOLD TO ENTER THE FIELD` **800ms**, `SEAL & FILE` **600ms**; "**Hold, not tap, for anything irreversible or initiating**"; sealing is "a ~600ms hold … irreversible without leaving a visible `REVISED` mark"; the `safelight` fill is "the only progress indicator in the product, and it indicates a gesture, never a quantity."
- **What the spine does:** "seals the report" (AD-11) and "seals at most one" (erDiagram). No hold durations, no seam between hold-completion and the write, no `REVISED` state on the case record, no "ending early is a deliberate act, not a back gesture".
- **Why it is architecture:** the `REVISED` mark is a persisted field; the hold is the gate on an irreversible write, which is a state-machine rule.
- **Classification:** **Architecture** (persisted `REVISED` + seal-transition rule); the 800/600ms values themselves are implementation.

### A-9 — Permission-denied fallback *contracts* are named nowhere

- **Source:** `EXPERIENCE.md → Permission-denied modes` (the four-row table) and `→ Component Patterns` per tool.
- **Requirement:** Camera denied → dark-room renderer "with the same timing, the same encounter, and the same evidence output"; Location denied → uncharted tracker (no path, `UNCHARTED` chip, distances hidden, Home drops the pressure line); magnetometer absent → EMF runs on motion+clock "at identical cadence" with a permanent `INFERRED` chip; mic denied → Voice archive mode (`SCAN`, `ARCHIVE` chip) **and** EVP removed (see C-1).
- **What the spine does:** AD-13 gives the channel-state enum and the general "degrades" claim but names none of these four contracts. "The *same timing, the same encounter, the same evidence output*" is a testable equivalence requirement and is nowhere.
- **Classification:** **Architecture** (the digest/contract equivalence); the chip strings are implementation.

### A-10 — The Voice surface's prohibitions and the twelve-second silence

- **Source:** `EXPERIENCE.md → Component Patterns → Voice` and `→ Interaction Primitives`.
- **Requirement:** (a) on release the surface "must not stamp `SENT`, or any word implying a message left the device"; (b) "**No wording anywhere on this surface may state or imply that anything was received, transmitted, heard, or contacted**"; the permanent disclaimer `Bands are theatre. Nothing here is received.`; (c) the app says nothing for **at least twelve seconds** ("Silence is a first-class interaction"); (d) a response may arrive up to 90s later "**and may arrive on a different tool than the one that asked**."
- **What the spine does:** absent. AD-16's lint runs the FR-33 banned-term list; `SENT`, `received`, `transmitted`, `heard`, `contacted` are **not on that list** (the list is `detect · prove · proof · confirm · verify · authentic · real ghost · scientific · science · thermal · radiation · Geiger · accuracy · algorithm · AI · % · metres/meters · haunted · evidence of the paranormal`). So the spine's claims-boundary AD does not cover the Voice surface's specific prohibition.
- **Why it is architecture:** (c) and (d) are engine/presenter timing rules (the 12s floor and cross-tool answer routing); (a)/(b) are a per-surface claims rule the banned-term lint cannot see.
- **Classification:** **Architecture** (timing + cross-tool routing + the surface-specific prohibition), not merely copy.

### A-11 — The honest-empty "dry log" record is absent

- **Source:** `EXPERIENCE.md → Component Patterns → The dry log`: tapping a log action with nothing active "does **not** show an error. It commits an honest empty record reading `NOTHING LOGGED`… It counts toward the report's negative space. **This is the product's thesis in one interaction.**"
- **What the spine does:** absent. AD-18's evidence vocabulary is a closed ten kinds; `NOTHING LOGGED` is not one and no path represents a logged-nothing record.
- **Why it is architecture:** it is a write path on the evidence store plus a report input ("negative space"), i.e. a domain rule the evidence service must implement.
- **Classification:** **Architecture.**

### A-12 — Tracker's proximity-is-inferred disclosure must live on the surface

- **Source:** `EXPERIENCE.md → Component Patterns → Tracker`: "**The surface itself must carry the disclosure that proximity is inferred from the user's own movement, not measured** — long-pressing the ladder is its natural home. **It must not be buried in settings.**"
- **What the spine does:** absent (0 hits for `INFERRED`/`UNCHARTED`/proximity). AD-15 guarantees no measurement-shaped *readout*, but this is the stronger, separate claim-of-method requirement: the tracker must disclose its own inference, in the tool.
- **Classification:** **Architecture** (a disclosure invariant on the surface contract — the "not in settings" half makes it a placement law, not styling). Could be argued epic-level, but it is a "never" the spine drops.

### A-13 — Camera's no-pinch-zoom is a deliberate non-feature, not an omission

- **Source:** `EXPERIENCE.md → Component Patterns → Camera`: "**Pinch-to-zoom is deliberately not implemented**: zoom invites 'let me look closer,' and looking closer is what an encounter must resist."
- **What the spine does:** absent (0 hits). Nothing forbids a builder from adding `PinchGesture` to `CameraView`.
- **Why it is architecture-ish:** it is a product law about what the camera may do, adjacent to the encounter-artifact rule (`EXPERIENCE.md → Encounters → the artifact rule`, also absent) that a captured frame must read as "a glimpse, not footage".
- **Classification:** **Implementation** (a UI gesture veto) — but it is a stated prohibition, so record it so it is not "fixed" later.

### A-14 — The `GENERATED`/`?` archive prohibitions on inference

- **Source:** `EXPERIENCE.md → State Patterns → Journal behaviour`: "the `?` signature tile is never labelled, captioned, pointed at, or the target of a coach mark… **No surface anywhere states or implies that a full match is reachable, that one exists, or what completing a slot would identify.**"
- **What the spine does:** absent. AD-8 bans copy stating *what unlocks a status*; this is a separate ban on implying signature-match completability.
- **Classification:** **Architecture** (an invariant on the signature component + copy; AD-8 is the sibling rule and should reference it).

### A-15 — Accessibility floor is not a cross-cutting concern in the spine

- **Source:** `EXPERIENCE.md → Accessibility Floor` and `→ Responsive & Platform`.
- **Requirement:** Case Report and Field Journal fully navigable with VoiceOver/TalkBack; **live regions announce evidence capture and phase change only**; **hidden internal values are never announced**; Dynamic Type to 200% with **intensity rail and tool row capped at 140%**; Reduce Motion disables the glitch channel and routes it to audio; no target below 44pt.
- **What the spine does:** OQ-15's tool-row form factor is carried (Deferred). Nothing else appears — no accessibility row in the capability map or conventions table, no Dynamic-Type-cap values, no reduce-motion→audio routing, no live-region policy. Grep: 0 hits for VoiceOver, Reduce Motion, Dynamic Type.
- **Why it is architecture:** the live-region policy and "hidden values are never announced" are behavioural contracts (and the latter is a determinism/tell rule, not a visual one); the caps are constants that tests can assert.
- **Classification:** **Architecture** (a cross-cutting row the spine is missing); the caps are implementation constants.

### A-16 — Dark-only mandate is dropped and has no enforcing home

- **Source:** `EXPERIENCE.md → Foundation`: "Dark only. `{colors.night}` is the ground for every surface. There is no light mode and there will not be one." `DESIGN.md → Colors` and `→ Do's and Don'ts` reinforce ("No information is ever conveyed by colour alone").
- **What the spine does:** the token `night` exists, and AD-17 syncs the token *set* — but nothing states there is no light theme, and the sync test cannot catch a second palette added later. "No information conveyed by colour alone" is likewise absent.
- **Classification:** **Architecture** (a constraint AD-17's test should encode) / partly implementation.

### A-17 — The four-tab IA, the screen tree, and the sheet set have no architectural home

- **Source:** `EXPERIENCE.md → Information Architecture` (four-tab table, "Full screen tree", "Presentation rules").
- **Requirement:** four tabs and only four, each with a stated job and a stated "it never does"; a fixed screen tree including `EVIDENCE DETAIL`, `SHARE CARD`, tabs `HOME/INVESTIGATE/FIELD JOURNAL/PROFILE`, the Journal's four segments, and ~14 sheets; the presentation table (push vs modal vs sheet; **tab bar hidden during Brief and Session**; **tools push above the session and the camera preview unmounts on pop**; capture card never full-screen; sheets never stacked two-deep except Triage over a session).
- **What the spine does:** `app/` is "routes ONLY" and `features/` is "one folder per surface", with a partial capability map naming only `app/hunt/[huntId]/brief`, `app/(onboarding)/`, `app/(modals)/about` and the tool/report/journal/home feature folders. **No route or feature for `Evidence Detail`, `Share Card` composer, the Investigate tab, the Profile tab, the Field Journal tab shell, or any of the ~14 sheets.** No tab bar, no tab-hidden rule, no camera-unmount rule.
- **Why it is architecture:** with `expo-router` typed routes, the URL/route tree **is** the IA — it belongs in the spine at this altitude.
- **Classification:** **Architecture.** (The spine's own altitude note "keeps epics" is why it may have been omitted, but the tab shell and route tree are structure, not epic content.)

### A-18 — Haptics and sound laws are absent

- **Source:** `EXPERIENCE.md → Interaction Primitives`.
- **Requirement:** haptics escalate with proximity; **continuous vibration is forbidden**; **"a haptic is never the only signal for anything"** (iOS suppresses haptics while the camera is active, in dictation, in Low Power Mode, when disabled); sound has twelve categories, **silence is used intentionally**, and "**the world should get duller and quieter before an encounter, not louder**."
- **What the spine does:** `haptics/` and `audio/` exist and are fed by the presenter (AD-2). None of the laws above appear.
- **Classification:** **Architecture** for "a haptic is never the only signal" (it forces every haptic-bearing emission to also carry a visual/audible channel — a presenter contract); the escalation shape and 12 categories are implementation.

### A-19 — The `NOT RECORDED` panel's scoping rule is absent

- **Source:** `EXPERIENCE.md → State Patterns → Absence is the product`: the panel "lists only what was **meaningful to have caught**. A tool that was never opened, a permission that was denied, or a sensor that was absent generates no line. When no line qualifies, the panel is not rendered at all."
- **What the spine does:** absent. Note the tie-in: this scoping rule is precisely how the permission-denied modes and the empty panel stay consistent with A-9/C-1.
- **Classification:** **Architecture** (report-content derivation rule) — the "panel not rendered at all" half is presentation.

---

## PART 3 — DROPPED QUIET REQUIREMENTS ALSO WORTH RECORDING

These are genuine source statements the spine does not carry. Most are **implementation/epic-level**; listed so a later phase does not silently lose them, not because the spine must absorb them all.

- **Presentation/loading:** "Loading uses **skeleton rows, never a spinner**" and "**No pull-to-refresh anywhere**" (`State Patterns → Journal behaviour`, `Interaction Primitives`). Both are prohibitions ("a spinner would imply a fetch"). Implementation.
- **Capture card:** "the capture card is **never full-screen**"; a progress hairline auto-dismisses after **six seconds**; ignoring the card still logs as unreviewed; `Keep` / `Mark as explained` (`Component Patterns → The evidence card`). The auto-dismiss/never-full-screen halves are presentation; "ignoring still logs" is already covered by AD-11.
- **Share Card:** hard exclusions — "**no watermark, no URL, no QR code, no app-store badge, no "made with" line, no attribution of any kind**"; **re-rendering the same case produces a visually identical image**; the field note is drawn from authored options or user-written, **the app never generates it**, capped at 60 chars (`Component Patterns → The Share Card`). The deterministic re-render is borderline architecture (a raster determinism guarantee); the rest is implementation.
- **Onboarding:** Screen 1 is "the only screen with **no back** — acknowledgement is required"; Screen 4 "**fires zero permission prompts**" (`design-brief-ai.md §11`; the spine's AD-13 just-in-time rule covers Screen 4's intent, not Screen 1's no-back gate). Implementation.
- **Entrance-framing gaps:** `EXPERIENCE.md → Key Flows` explicitly notes it does **not** cover onboarding, the Brief's calibrate→name→intention sequence, or the Journal's Onboarding-to-About path — those live in the PRD UJs, so their absence from the spine is not a drop from *these* sources.
- **Depth/decoration prohibitions:** `DESIGN.md → Elevation & Depth` / `Shapes` / `Motion` prose — no drop shadows, glows, or blur; no element faster than the 5s field breath except a haptic; `ntPulse` at 2s must not be accelerated; the grain overlay at `.55` must not be raised. DESIGN.md remains a bound source and AD-17 syncs its frontmatter tokens, but these **prose** rules are outside the sync test and outside the spine. Design/implementation; flagging because AD-17's sync test cannot enforce them.

---

## Summary of classification

| ID | Requirement dropped | Class |
|---|---|---|
| C-1 | AD-13 "every channel degrades" vs EVP "not offered" | **Conflict — resolve in AD-13** |
| A-1 | Four no-event outcomes + six failure states (domain taxonomy) | Architecture |
| A-2 | Sky `GENERATED` provenance travels with the capture | Architecture |
| A-3 | Contested/planted evidence, never surfaced | Architecture |
| A-4 | Backgrounding hard stop (freeze, 2s grace, encounter suppression/allowance) | Architecture |
| A-5 | Under-60s session → no report (tension with AD-11) | Architecture |
| A-6 | Deleting a case does not erase its evidence (`NO CASE`) | Architecture |
| A-7 | The five navigation invariants (esp. #2 SEAL & FILE, #5 intensity locked) | Architecture |
| A-8 | Holds (800/600ms), irreversible seal, `REVISED` mark | Architecture |
| A-9 | Camera/Location/magnetometer fallback contracts (same timing/encounter/evidence) | Architecture |
| A-10 | Voice surface prohibitions + 12s silence + cross-tool answer routing | Architecture |
| A-11 | Dry log / `NOTHING LOGGED` honest-empty record | Architecture |
| A-12 | Tracker proximity-inferred disclosure on the surface | Architecture |
| A-13 | Camera no-pinch-zoom | Implementation |
| A-14 | `?` tile / no "full match reachable" prohibition | Architecture |
| A-15 | Accessibility floor as a cross-cutting concern | Architecture |
| A-16 | Dark-only mandate; no colour-only encoding | Architecture |
| A-17 | Four-tab IA, screen tree, sheet set, presentation rules | Architecture |
| A-18 | Haptic-never-sole-signal; haptics/sound laws | Architecture (partial) |
| A-19 | `NOT RECORDED` panel scoping rule | Architecture |
| Part 3 | Skeletons-not-spinners, no pull-to-refresh, capture-card, Share Card exclusions, onboarding gates, DESIGN.md prose | Implementation/epic-level |
