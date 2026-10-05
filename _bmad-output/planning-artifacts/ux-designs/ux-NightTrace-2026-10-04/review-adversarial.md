# Adversarial design review — NightTrace UX artifacts

Reviewer brief: find real defects only. The PRD is authoritative; where any other document
disagrees with it, the PRD wins. Five pre-known issues were excluded from this review by
instruction (bare-count `statusOf()`, safelight-red-vs-lime rationale, mono below the 9.5px
floor, green-tinted `BONE` captioned warm white, and the already-corrected
`MAGNETIC INTERFERENCE DETECTED` term) and are not repeated below.

Files reviewed in full:
- `_bmad-output/planning-artifacts/prds/prd-NightTrace-2026-10-04/prd.md` (923 lines)
- `_bmad-output/planning-artifacts/prds/prd-NightTrace-2026-10-04/addendum.md` (535 lines)
- `_bmad-output/planning-artifacts/ux-designs/ux-NightTrace-2026-10-04/DESIGN.md` (269 lines)
- `_bmad-output/planning-artifacts/ux-designs/ux-NightTrace-2026-10-04/EXPERIENCE.md` (416 lines)
- `_bmad-output/planning-artifacts/ux-designs/ux-NightTrace-2026-10-04/design-brief-ai.md` (794 lines)
- `…/ux-NightTrace-2026-10-04/imports/nighttrace-interactive-prototype/project/NightTrace.dc.html` (1317 lines)

---

## BLOCKER

### B-1. The Voice surface stamps `SENT` on release — the exact transmission claim FR-13 forbids

**Where:** `EXPERIENCE.md:146` (spec) · `imports/nighttrace-interactive-prototype/project/NightTrace.dc.html:440`
(rendered stamp) and `:1239` (`voiceUp` sets `voiceSent:true`) · authority `prd.md:399-405` (FR-13).

**What is wrong.** EXPERIENCE.md's Voice paragraph reads: *"Release → a `SENT` stamp… **No wording
anywhere on this surface may state or imply that anything was received, transmitted, heard, or
contacted**; the permanent safe line is `Bands are theatre. Nothing here is received.`"*
The spec writes the prohibition and the violation in the same paragraph. FR-13 is explicit that
this is enforced **"against the surface's own string set"** and that the safe form is
*"Bands are theatre. Nothing here is received."* `SENT` is not a hedge and is not a label for the
simulation's own act — it is the word a radio operator sees when a message left the device. The
prototype ships it as a rotated stamp at `:440`, so this is not hypothetical copy; it is drawn on
screen on every ask.

**Why it matters.** This is the single most damaging string in the product. `SENT` asserts an
outbound transmission — the one event the entire "phone is a case file, not a detector" law exists
to deny. It is worse than a banned term because `SENT` is not on the FR-33 lint list, so it passes
the lint while carrying the claim the lint was written to prevent. FR-13's own note explains that
downstream UI strings are derived from FR text and that an error here "propagates into shipped copy
that the lint would still pass" — this is that exact failure, one layer down, in the spine and the
prototype.

**Fix.** Delete the `SENT` stamp from `EXPERIENCE.md:146` and from the prototype (`:440`, `:1239`,
and the `voiceSent` state and its `sc-if` guard). Replace the release acknowledgement with something
that records the user's own act and nothing else — e.g. no stamp at all, or `LOGGED.` — or reuse the
already-approved safe line `Bands are theatre. Nothing here is received.` Add `SENT` to the FR-33
banned-term lint so it cannot return, and reconcile the brief (`design-brief-ai.md:390`, same
`SENT` on release) which is where the spine inherited it.

---

### B-2. The Signature strip is driven by triage verdict count, not by evidence — a live, spendable convergence meter

**Where:** `EXPERIENCE.md:176` ("Each verdict re-renders the signature strip live") ·
`imports/…/NightTrace.dc.html:1269` (`const lit=N?0:Math.min(9,un*2+inc);`) ·
authority `prd.md:483-505` (FR-19) and `prd.md:508-524` (FR-21).

**What is wrong.** FR-21 defines convergence as *"the fraction of Signature slots filled"* and
derives it from Evidence; FR-19 defines the Signature as *"a Session's Evidence"* accumulated into a
strip. EXPERIENCE.md and the prototype both instead light the strip from **triage verdicts**: the
prototype computes `lit` as `un*2 + inc` (Unexplained verdicts count double, Inconclusive single),
so the strip changes as the user taps verdicts, before the report is even sealed.

**Why it matters.** Two distinct product laws break at once:
1. *Uncertainty is the product, and the user must never be able to predict or spend it.* The strip
   is a visible convergence readout the user can watch move as they triage. Because `UNEXPLAINED`
   requires convergence ≥0.60 (FR-21), a user learns — by experiment, which is the only way the
   app permits them to learn it — that marking items `Unexplained` fills the strip. That is a
   spendable uncertainty mechanic dressed as a decorative fingerprint.
2. *The asymmetry must not be taught.* FR-20 and the brief (`design-brief-ai.md:500`) state that the
   interface must not explain that a combination of verdicts unlocks a status, and that "if you find
   yourself wanting to add a tooltip that teaches the thresholds, that is the defect." A strip that
   fills on verdict taps is that tooltip, rendered in slots instead of words.

This also contradicts FR-19's structural intent: the strip is supposed to show what was *seen*
(evidence converged), not what was *asserted* (verdicts given).

**Fix.** Drive the strip from evidence convergence per FR-19/FR-21, not from `verdicts`. In
EXPERIENCE.md:176, change *"Each verdict re-renders the signature strip live"* to a statement that
the strip renders once from the sealed case's Evidence and does not move with triage. In the
prototype, compute `lit` from evidence count (per the FR-21 convergence definition) and remove the
live redraw on verdict tap. If the intent was that triage *feeds* convergence, that is an
engine-contract question (`addendum.md` §C) and must be stated in the PRD before any spine encodes
it — as written, the PRD says Evidence.

---

## SHOULD-FIX

### S-1. Directives are on-demand and unbounded, contradicting FR-2's six-per-session cap

**Where:** `EXPERIENCE.md:322` ("I need a direction") · prototype `:864` / `nextDirective`
(`:1310` `directive:s.directive+1`) · authority `prd.md:180` (FR-2).

**What is wrong.** FR-2: *"A session presents no more than six directives, spaced at least three
minutes apart."* EXPERIENCE.md and the prototype both offer an on-demand control — the user taps
"I need a direction" and `nextDirective` increments `s.directive` with no ceiling and no spacing.
The prototype's directive sheet can be reopened indefinitely.

**Why it matters.** The cap and the spacing are the mechanism that keeps directives from becoming a
to-do list with an outcome — the pacing is what makes them feel like the night talking, not a menu.
An unbounded on-demand directive also lets a user grind through the authored pool, which reduces the
authored pool to a finite checklist (an FR-2 "known outcome" leak).

**Fix.** Either remove the on-demand control and surface directives only on the engine's schedule
(cap six, spaced ≥3 min), or, if the on-demand control stays, gate it: it may request the next
scheduled directive but never exceed the FR-2 cap and never bypass the FR-2 spacing. State the
chosen behavior in EXPERIENCE.md and change the prototype's `nextDirective` accordingly.

### S-2. `?` tile pulse cadence disagrees with the PRD and the PRD calls this a product decision

**Where:** `DESIGN.md:230` ("pulses at `ntPulse` on a 6s cycle") and prototype `:23`
(`@keyframes ntPulse` … `:215` `animation:ntPulse 6s …`) · authority `prd.md:489` (FR-19).

**What is wrong.** FR-19 specifies the `?` tile pulses *"at roughly **0.5 Hz**"* — once every two
seconds. The spine and prototype specify a six-second cycle (≈0.167 Hz), a factor of three slower.
FR-19's note is explicit that *"the pulse rate is a product decision, not a style detail"* and that
it *"must not be accelerated."*

**Why it matters.** FR-19 states the pulse is the product's *"strongest single return hook"* and
that the rate is why. A spine that quietly re-times it to a third of the specified rate ships a
different product than the PRD describes, and the PRD's own note flags the rate as load-bearing
rather than cosmetic. One of the two numbers has to be wrong; the PRD wins.

**Fix.** Change `DESIGN.md:230` and the prototype's `ntPulse` to ~2s (0.5 Hz), or, if six seconds is
the intended feel, change FR-19 — but do not let the artifacts disagree, because a builder reading
the spine will ship six. Add a line to DESIGN.md's frontmatter or Components noting the PRD
reference so the two cannot drift again.

### S-3. EXPERIENCE.md asserts the prototype answers the large-type tool-row question with a two-row grid — the prototype has one scrolling row

**Where:** `EXPERIENCE.md:328` ("The prototype's answer is **a two-row labelled grid rather than
shrinking targets**") · prototype `:578-583` (a single `overflow-x:auto` row of seven 56px targets)
· authority `prd.md:881` (OQ-15).

**What is wrong.** EXPERIENCE.md resolves the open OQ-15 question ("whether the tool row should
express the seven surfaces as one row on every device") by citing the prototype as already having
solved it with a two-row grid. The prototype has no such grid: it renders exactly one horizontally
scrolling row (`<div style="flex:1;display:flex;overflow-x:auto">` with a single `sc-for` over
`toolRow`).

**Why it matters.** An accessibility answer that rests on a prototype behavior the prototype does
not have is a build trap — the implementer reads "the prototype already does this" and stops
solving it. OQ-15 is explicitly unresolved in the PRD; EXPERIENCE.md is not entitled to close it by
citing evidence that does not exist.

**Fix.** Either build the two-row labelled grid into the prototype (making the claim true), or
rewrite EXPERIENCE.md:328 to state that the two-row grid is a *proposed* direction to be validated,
and leave OQ-15 open. Do not leave the spine asserting a prototype behavior the prototype lacks.

### S-4. Negative-space lines are a fixed array, not gated on whether the measurement was possible

**Where:** prototype `:1274`
(`const negative=N?['No evidence was recorded.','The magnetic baseline never left STILL.','No bearing ever resolved.',O[1]]:['No second word followed the first.','The magnetic baseline never reached STIR.','No bearing resolved after 11:49 PM.'];`)
and the same un-gated copy is the brief's own example (`design-brief-ai.md:524`) · authority
`prd.md:238-247` (FR-36).

**What is wrong.** FR-36: *"Absence is meaningful only where a measurement was possible. A tool that
was never opened, a permission that was denied, or a sensor that was absent does not generate a
negative-space line — the app does not report the absence of something it never looked for."* The
prototype emits the magnetic-baseline and bearing lines unconditionally, regardless of whether the
EMF or Radar tool was ever opened or the magnetometer/location permission was ever granted. The
brief (§21, line 524) supplies the identical un-gated lines as its example copy, so the error is in
the design brief, not only the prototype.

**Why it matters.** This is a direct honesty-law violation: *"The magnetic baseline never left
STILL"* is a statement about a sensor that may never have run. Telling a user what a magnetometer
did when no magnetometer was present is exactly the fabricated-measurement claim the product's
whole framing forbids. FR-36 is also where the "absence is meaningful" law "stops being a slogan" —
shipping a version that reports absences the app could not have observed guts the law while
appearing to honor it.

**Fix.** Gate each negative-space line on a boolean the session already tracks (tool opened,
permission granted, sensor present) and drop any line whose measurement was not possible; omit the
block entirely when nothing qualifies (FR-36 already says this). Fix the brief's example copy at
`design-brief-ai.md:524` so builders do not copy the un-gated form. Add a unit test asserting no
negative-space line renders for a permission-denied sensor.

### S-5. Radar's designed zero-contact `CLEAR` outcome is not rendered anywhere in the prototype

**Where:** `EXPERIENCE.md:144` (Radar zero-contacts-designed-outcome) · prototype `toolData`
`:1119-1120` (`o.cones=[…].concat(two?[…]:[])` always emits at least one cone; `o.contacts` is only
`'ONE'`/`'SEVERAL'`) · authority `prd.md:226-236` (FR-35) and FR-36's `No bearing ever resolved.`

**What is wrong.** EXPERIENCE.md:144 designs a first-class outcome: *"Zero contacts for a whole
session is a designed outcome: the rose still animates, the chip still reads `CLEAR`, and the report
records `No bearing ever resolved.`"* The prototype's Radar surface never produces it — `toolData`
always draws ≥1 cone and `contacts` only ever takes the values `ONE` or `SEVERAL`. The string
`No bearing ever resolved.` appears only in the nothing-case negative array, never as the Radar
surface's own outcome.

**Why it matters.** Absence handling is a review priority, and this is the Radar's absence-of-
contacts case — one of the four named no-event outcomes FR-35 exists to make first-class. If the
*only* available Radar behavior in the reference build is "there is always a contact," the strongest
absence state for that tool is not demonstrated, and a builder working from the prototype will not
see it. FR-19/"nothing-happened must be a first-class, best-looking outcome" is precisely at stake.

**Fix.** Add a zero-contact branch to the prototype's Radar: render the animated rose with no cones
and the chip reading `CLEAR`, and wire `reportVals` to emit `No bearing ever resolved.` from the
Radar outcome (not from the generic nothing-case array). Keep EXPERIENCE.md:144 as the spec.

### S-6. DESIGN.md calls the stat cell a four-up grid "used on … the Share Card" — the Share Card's stat row is three cells

**Where:** `DESIGN.md:228` ("a four-up grid used on the report, the Share Card, the Journal
Overview, and Profile") · authority `prd.md:585-596` (FR-24, "a three-cell stat row") ·
`EXPERIENCE.md:328`/§22 and `design-brief-ai.md:522` (report stat row is four cells).

**What is wrong.** FR-24 specifies the Share Card carries *"a three-cell stat row."* DESIGN.md's
Stat cell component says the four-up grid is used on the Share Card. The report's stat row is four
cells (brief §22: `DURATION · EVIDENCE · ENCOUNTERS · SOURCES`) — the card's is not.

**Why it matters.** The card is a shareable artifact and the count is load-bearing: three cells is a
deliberate reduction (the card is a memento, not the report). A spec sheet that tells the builder to
render four cells on the card ships the wrong artifact and contradicts FR-24 directly.

**Fix.** Amend `DESIGN.md:228` to note the stat cell is a four-up grid on the report, Journal
Overview, and Profile, and a **three-up** grid on the Share Card per FR-24.

### S-7. Triage progress is hard-coded to seven segments while the evidence count is unresolved

**Where:** `EXPERIENCE.md:176` ("a progress hairline of seven segments") and prototype
`:1297-1298` (`triProg:Math.min(7,s.tri+1)+' of 7'`; `triBars:Array.from({length:7},…)`) ·
authority `prd.md:477`, `prd.md:782`, `prd.md:867` (OQ-11).

**What is wrong.** The evidence kind set and count are explicitly unresolved: `prd.md:867` marks
OQ-11 `[BLOCKING — CONTENT AUTHORING]` and `prd.md:477` says *"no number should be inferred from
this requirement."* Both EXPERIENCE.md and the prototype nonetheless hard-code seven — and the
prototype's `triProg` reads `'N of 7'`, a literal progress readout against an unresolved denominator,
in the same artifact that elsewhere bans percentage progress.

**Why it matters.** Encoding seven before OQ-11 closes bakes a blocked content decision into the IA
and the reference build, and the `'N of 7'` string is a stated-fraction progress readout — the thing
FR-19's no-progress clause and the "no percentage" law exist to prevent. If the resolved count is
not seven (the PRD's own reconciliation table at `prd.md:914` says the sources name 10, 14, or 20),
the triage screen and its progress apparatus are both wrong.

**Fix.** Replace the hard-coded seven with a length derived from the case's actual evidence array,
and replace `'N of 7'` with a non-numeric marker (e.g. a bare hairline with no count, or
`segment i of n` rendered as position without a fraction). Mark the EXPERIENCE.md line as pending
OQ-11.

### S-8. EXPERIENCE.md states "no analytics" while the addendum ships local on-device analytics and the PRD requires measurement

**Where:** `EXPERIENCE.md:23` ("No network calls, no account, no sign-in, no analytics, no server.")
· authority `addendum.md:342, 365, 390, 412` (§F: `analytics_events`, the six core events,
`installRef`) and `prd.md` §6.2 / SM-1…SM-8.

**What is wrong.** EXPERIENCE.md makes a flat, unqualified "no analytics" claim as part of the
product's structural framing. Addendum §F documents a local-only, on-device, PII-free analytics
subsystem — `analytics_events` table, ring-buffered to 2,000 rows, six core events, a resettable
`installRef` UUID — and the PRD's §6.2 success metrics require measurement that this subsystem
exists to serve. The two are reconcilable (on-device ≠ networked), but EXPERIENCE.md's flat "no
analytics" does not distinguish them, so the spine reads as a promise the addendum breaks.

**Why it matters.** The framing is used rhetorically in the same paragraph to justify the product's
"nothing leaves this phone" claim. A reader who then finds an analytics subsystem in the addendum
cannot tell whether the product is contradicting itself; the honest statement ("no network egress,
no server, no third-party analytics — only local, erasable, on-device events") is not what the spine
says. Since the PRD is authoritative and §6.2/SM-1…SM-8 require measurement, the spine is the
document that is wrong.

**Fix.** Rewrite `EXPERIENCE.md:23` to distinguish on-device from networked: no network, no account,
no server, **no third-party or networked analytics** — local on-device event records only, as
specified in addendum §F. The "nothing leaves this phone" claim survives that wording; the flat
"no analytics" does not survive contact with the addendum.

---

## NIT

### N-1. DESIGN.md's Do's reference a "grain overlay" with no grain token

**Where:** `DESIGN.md:260` ("Let the grain overlay sit at low opacity over everything") · token
table at the top of DESIGN.md. **What:** the grain overlay is used in a Do and appears in the
prototype's aesthetic, but there is no `grain` token, opacity value, or blend mode in the token
table, so a builder has no spec for it. **Why:** an unspecified overlay is the kind of thing that
gets "enhanced" until it competes with the type — the very Don't on the next line. **Fix:** add a
grain token (opacity, blend mode, source) or delete the Do if grain is not a real layer.

### N-2. Prototype renders the seal status in safelight-soft for every status; DESIGN.md specifies bone for INCONCLUSIVE/EXPLAINED

**Where:** prototype `:606` (`color:#c6ff66` on `{{ rep.status }}`, unconditional) · `DESIGN.md:226`
(`UNEXPLAINED` in safelight-soft; `INCONCLUSIVE` in `bone`; `EXPLAINED` in `bone` with affirmative
treatment). **What:** the prototype's seal prints every status word in the accent colour; the spine
assigns colour by status. **Why:** the status word is the report's headline honesty signal; if every
status reads identically, `UNEXPLAINED` is no longer visually reserved, and the `EXPLAINED`
affirmative treatment is unexpressed. **Fix:** bind the seal status colour to the status value per
DESIGN.md:226.

### N-3. Journey personas diverge from the PRD's UJs, and EXPERIENCE.md acknowledges reconciliation is owed

**Where:** `EXPERIENCE.md:344-394` (Priya and the other named journeys) vs `prd.md:81-111`
(the PRD's User Journeys UJ-1…UJ-4). `EXPERIENCE.md:344` states the journeys are "derived… not
narrated by the owner" and "should be reconciled against" a real session. **What:** the derived
journeys are written with names, ages, and backstory the PRD does not contain. **Why:** the PRD's
UJs are the testable spine; prose personas that drift from them quietly re-specify the product in
the reader's imagination. **Fix:** the reconciliation is already flagged — do it, or label the
journeys explicitly as illustrative and restate the PRD UJs as the normative ones.

### N-4. Intensity "encounters · likely" chip edges toward a probability claim

**Where:** prototype `:1016` (`INTENS` table: `Intense` → `encounters:'likely'`, `Ritual` →
`'rare by design'`) · authority `prd.md:353` (FR-10) and the "never a guaranteed encounter" framing.
**What:** the intensity picker labels the `Intense` tier `likely` and `Ritual` `rare by design`,
which reads as a prediction about encounter frequency. **Why:** FR-10 describes intensity as
changing the character of a session, not announcing odds; "likely" is a probability statement about
the real session the user is about to have. (Note `addendum.md` §C.6 does give encounter-rate tuning
targets, but those are engine internals and never user-facing.) **Fix:** replace `likely` /
`rare by design` with non-predictive descriptive copy (e.g. the brief's own `more signals, sharper
stings`).

### N-5. Design-brief §19 says a non-rendering camera encounter "downgrades to the audio channel"; FR-38 says suppressed — not downgraded

**Where:** `design-brief-ai.md:478` · authority `prd.md:305-315` (FR-38: *"suppressed — not
replaced, not downgraded"*). **What:** the brief specifies a downgrade-to-audio fallback; the PRD
specifies suppression with the missed window recorded. **Why:** the brief is the ideological source
the spines were distilled from, so a contradiction there is where the next spine will inherit it.
The spikes currently do not carry the downgrade language, but the brief still states it. **Fix:**
align `design-brief-ai.md:478` with FR-38 (suppressed, window recorded), or change FR-38 if the
downgrade is intended — but reconcile them.

---

## Sections checked and found clean

- **Banned terms and the honesty vocabulary.** DESIGN.md Colors "Never" list and EXPERIENCE.md's
  Voice rules consistently ban the words and mechanics that would read as measurement; the one
  breach found is `SENT` (B-1), which is not on the lint list — everything the lint does cover is
  applied correctly.
- **The four named no-event outcomes (FR-35).** `QUIET_NIGHT`, `WINDOW_CLOSED_EMPTY`,
  `FALSE_POSITIVE`, `NOT_FRAMED` and their report copy are consistently first-class and have no
  "you failed" framing anywhere in the spines.
- **The nothing-case / dry-log treatment.** The nothing-case report is a complete, dignified report
  with a valid status; the dry-log moment is written as the product's thesis, not a punishment.
- **The Share Card hard exclusions and the exact entertainment line.** No watermark, URL, QR, badge,
  or attribution; the footer line is the exact `An investigation experience. Not a measurement.`
  variant only — the wrong `Nothing here is a measurement.` variant appears nowhere in the spines.
- **The triage-asymmetry prohibition on teaching thresholds.** The brief and EXPERIENCE both forbid
  explaining that verdict combinations unlock a status. (The *strip* violates the spirit of this —
  B-2 — but the written rule itself is sound and consistently stated.)
- **Hidden values are never announced.** Tension, Attunement, rarity, and Seed are specified as
  never shown and never announced to assistive tech, including the live-region rule.
- **The seven tools' no-number rule.** EMF, Radar, Voice, EVP, Camera, Tracker, and Sky all keep to
  bands and words; the Sky `GENERATED` label correctly travels with captures and no tool leaks an
  axis, unit, or percentage.
- **Permission-denied first-class modes.** Denied microphone, camera, location, and magnetometer
  each have designed honest fallbacks (archive mode, `INFERRED`/`RELATIVE` chips, absent controls)
  rather than disabled or broken states.
- **Monetization, social, iPad, and light-mode exclusions.** The product excludes ads, IAP, social
  feeds, iPad layouts, and light mode as framing decisions, and no spine reintroduces them.

---

*Severity counts: 2 blocker · 8 should-fix · 5 nit. Findings are ordered most-severe first within
each section.*
