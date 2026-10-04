---
title: NightTrace — Adversarial Skeptic Review
reviewer: adversarial (skeptic's-30-second-test mandate)
target: prd.md + addendum.md (prd-NightTrace-2026-10-04)
created: 2026-10-04
---

# Adversarial Review — Attacking NightTrace with Its Own #1 Risk

**Mandate.** The product's own documents name the top risk: *the skeptic's 30-second test* — a user inspects the app, concludes it is fake or lying, deletes it, and leaves a 1-star review (`brainstorm-intent.md` top risks; design doc §A.3 row 1; PRD §1 "Why now"). My job is to run that test against this PRD, not to be balanced. I attack the percentage override hardest, then every place the fiction can leak into a real-world claim, then the retention claim, then the store-review line.

**Verdict.** The percentage decision is not incoherent in the abstract, but it is **not defensible as specified**: the reconciliation rests on a distinction (index vs measurement) that the screen does not render, is contradicted by the typography the owner insisted on keeping, escapes the one screen the PRD confines it to via the Share Card, and breaks three separate engine invariants the PRD never reconciles. The share card — the most-distributed, least-framed surface — is the real hole, and the PRD never closes it. Separately, the artifact (image) escape hatch is entirely outside a sentence-scoped lint and is the single largest lint-invisible claim in the product.

I found **27 findings**. Nothing below is padded; where the product holds up, I say so at the end.

---

## Vector 1 — The Percentage Decision

### F-1. The `%` glyph *is* the measurement claim; the "case index" defense is contradicted by the retained typography. — **CRITICAL**

**The defense (OQ-1, A-2):** "a percentage on a sealed case file reads as the app's own index of its own night, not as a sensor measurement."

**The collapse.** An index has no denominator. "91%" does. A percentage is, by grammar, a proportion of a whole — it asserts a measurable quantity and a scale (0–100) against which the quantity was placed. "CASE SCORE 91" or "INDEX 91" is a case-file value; **"91%" is a measurement**, because the `%` glyph is doing exactly one job in typography. The addendum's rulings table is explicit that this is the problem: row 9 classifies `Activity level: 93%` as "Percentage = measurement claim," and the design doc's own cut list says *"All percentage readouts (`91%`, `82%`, `ACTIVITY 93%`) … Violates the only law that protects the whole product"* (§A.4). The owner's defense works only if the `%` is removed. The owner kept the `%`. **The reconciliation and the artifact are mutually exclusive, and the PRD ships the artifact.**

**Failure scenario.** A skeptic opens their first Case Report. They see `Strongest anomaly 91%` and read it the only way the glyph can be read: as a measurement. They then ask the obvious question — *91% of what?* The PRD contains no denominator anywhere. `%` without a denominator is not merely a measurement claim; it is a **nonsense** measurement claim, which is worse for this product, because "fake" is the verdict, not "wrong." A-2's own invalidation clause permits relabelling to "case metadata" — but "case metadata" that still reads "91%" is not a relabel, it is the same claim in a new caption.

**Fix the PRD should adopt:** strike the `%` glyph from the stat row entirely; keep the internal 0–100 anomaly score as an unshown engine value; if the owner's "feel" must survive, render `ANOMALY · STRONG` / `ACTIVITY · HIGH` (which is what rulings-table rows 9 and 11 already rule are safe). This is the only version of the override that does not break the lint's own logic.

---

### F-2. "Not a measurement" printed beneath "91%" is a self-defeating disclaimer — it reads as a guilty tell. — **HIGH**

FR-23 requires the footer line *"An investigation experience. Nothing here is a measurement."* FR-24 requires *"An investigation experience. Not a measurement."* Both sit on a document whose stat row now carries a percentage (FR-22). The PRD's own §4.6 note flags the adjacency but under-reads it: it says the pairing "should be reviewed as a single visual unit." It should be *deleted*, not reviewed.

**Failure scenario.** The skeptic's eye lands on `91%`, then on `NOT A MEASUREMENT`, two lines apart. The prior that the app is fake is now *confirmed by the app's own anxiety*: no honest product writes "this is not a measurement" directly under a number unless it knows the number looks like one. The disclaimer does not neutralise the claim; it **advertises that the claim exists**. This is the exact failure the design laws called out as "winking" — rulings-table row 24 deletes `Warning: this app is not a toy` on the grounds that it *"winks and claims simultaneously."* "Not a measurement," printed under a percentage, is the same move: it claims by denying. The PRD deletes the wink in marketing copy and keeps it on the hero screen.

---

### F-3. The Share Card is the real hole, and the PRD never closes it. — **CRITICAL**

**This is the finding the task asked me to find, and it is worse than OQ-1 says.**

FR-22 pins the percentage to "the Case Report." FR-24 says the Share Card is composed *from a sealed Case Report* and carries "a three-cell stat row." **The PRD never states which three cells, and never states whether the percentage is carried or excluded.** It enumerates hard exclusions for watermark, URL, QR, app-store badge, and attribution — and says nothing about numbers. The owner's source brief's Share Card literally was:

```
ENTITY THE WATCHER / ACTIVITY 93% / EVIDENCE 8 / ENCOUNTER RARE / STATUS UNEXPLAINED
```

— a three-value stat block in which **one of the three was the percentage**. A downstream engineer implementing FR-24 has no instruction to exclude it and a brief that says to include it. The default implementation carries `ACTIVITY 93%` onto the card.

**Failure scenario (concrete).** Devon (UJ-2) captures a silhouette, taps Share, and sends the card to a group chat **without editing anything** — that is the design. The card lands where none of the app's framing lives: no onboarding, no About, no conditions footer, no evidence ledger, no negative-space block. It carries a generated silhouette, a case reference, a status stamp, and a stat row. The only framing is the footer line in `caption` size at 60% (addendum I.5) — the smallest text on the image, next to likely display-type numbers.

The report is the app's most scrutinised screen **and it has the most context**. The card is the app's most **distributed** surface and has the **least** context. The PRD's growth engine (SM-1, the "sharing recruits" flywheel in §1) is built on the card. So the PRD has deliberately concentrated its riskiest claim on its most-shared, least-framed output, and left the containment rule unspecified. This is not OQ-1's stated concern (a skeptic looking at the report); it is strictly larger, because the card is viewed by people who never installed the app and have no way to reach the About notice.

**Fix:** FR-24 must carry an explicit, testable consequence: *the card's stat row is counts only; no percentage, no `%` glyph, no activity score appears on the card or on any share output.* If the owner refuses, the override is no longer "confined to the Case Report" and §4.6's claim that it is must be struck.

---

### F-4. FR-22 breaks three invariants the PRD and addendum otherwise treat as hard, and the audit trail under-reports the override. — **HIGH**

The PRD presents the percentage as *one* knowing exception ("this is the most significant ratified override," §4.6). It is at least four, and two of them are never recorded:

1. **FR-4 (tension state):** "The tension value is never displayed, announced, or exposed to assistive technology." The report's "activity level" is a monotone function of activity/tension (it is the same quantity the session hairline renders qualitatively). Displaying it on the report **displays a function of a value FR-4 forbids displaying.** The PRD never notices that FR-22 and FR-4 collide.
2. **Addendum C.10 (EmfPipeline):** "the score never reaches the UI as a number." FR-22's "strongest-anomaly percentage" is the max of exactly that score, reaching the UI as a number. Direct contradiction inside the addendum's own invariants list.
3. **Design doc F-17 (the report spec the PRD inherits):** specifies the stat row as *"a 4-cell stat row (DURATION, EVIDENCE, ENCOUNTERS, SOURCES) — **counts only, no percentages**."* FR-22 expands this to a row that adds two non-count numbers. The PRD's override table (addendum A.1 row 1) records the override against the **brief** but not against the **design doc's own report spec**, which was already counts-only. The audit trail therefore under-reports the scope of the override: a reader checking the trail will believe the design doc said "percentages everywhere," when on the report it said "counts only."
4. **Design doc A.2.1** states that after controls, *"the only numerals that survive anywhere in the product are (a) elapsed session time, (b) the user's own historical counts in the journal, and (c) radio-band frequencies inside the Spirit Box."* The report percentage is outside even this carve-out. Again unrecorded.

**Why it matters for the skeptic test:** a downstream implementer or a future contributor who reads FR-4 and C.10 will "fix" FR-22 — or, worse, will enforce FR-4 in the accessibility layer and expose the percentage to assistive tech by omitting it there, creating a "the app told my screen reader the number but not me" inconsistency. The PRD's discipline depends on the override being *exhaustively* recorded; it is not.

---

### F-5. The percentage's behaviour in the nothing-case is undefined — and that is the app's flagship scenario. — **HIGH**

FR-22 says the stat row shows the strongest-anomaly percentage, and separately that "A Session with zero Evidence and zero Encounters still renders a complete report." **The PRD never says what the percentage reads when nothing was recorded.** Two impossible-by-implication outcomes are both permitted by the spec:

- `Strongest anomaly 0%` — reads as an instrument returning a null measurement, i.e. the app reporting a real instrument's negative result. This is the most measurement-like sentence in the product, and it appears on the case the PRD most celebrates ("Nothing was recorded tonight. That is a result.").
- `Strongest anomaly 91%` with zero evidence — an outright contradiction a skeptic sees in one glance: a 91% anomaly with four empty cells beside it.

**Failure scenario.** UJ-1 (Mary, first case, `ENCOUNTERS 00`, INCONCLUSIVE, negative-space block) is the flagship "honest nothing" report and the report every new user is most likely to see first (SM-3). If it renders `Strongest anomaly 0%`, the app has just done the one thing it forbids itself: shown an instrument readout of a null result. If it renders a number, it contradicts its own ledger. The PRD built its most-praised feature (absence-as-outcome) and its most-risky feature (the percentage) onto the same screen and **never specified their intersection.**

---

### F-6. The percentage converts the "undetectable" First-Run Directive into a detectable one. — **HIGH**

FR-3 guarantees a first Encounter and requires the directive to be "invisible to the user and produces no copy, indicator, or behaviour the user can detect as special." A-4 rests on that undetectability: *"a detectable guarantee is worse than no guarantee."*

**Failure scenario.** The strongest-anomaly figure on the first report is inflated by the guaranteed Encounter (it is the max of a score the encounter moves). A user who plays four cases sees case 1 score high and cases 2–4 score lower — the app's only numeric surface has just revealed the first-run thumb on the scale. **The one screen the PRD chose to keep numbers on is the one screen from which the guarantee is legible.** OQ-1 and A-4 never reference each other; the interaction is invisible in the document. A skeptic who runs this test gets the 1-star verdict the product was designed to avoid, and gets it with arithmetic.

---

### F-7. Two different entertainment lines for one function. — **MEDIUM**

FR-23 footer: *"An investigation experience. Nothing here is a measurement."* FR-24 card footer: *"An investigation experience. **Not** a measurement."* UJ-2 quotes the card line as the second. The Glossary is declared normative and "a synonym introduced anywhere in the PRD is a discipline violation." These are not synonyms; they are two sentences for one legally-load-bearing function. A store reviewer comparing the report and the card sees the disclaimer change wording between surfaces — which invites the question of which one is the "real" disclaimer. Minor on its own; significant because it is the kind of inconsistency §3 says is a defect.

---

## Vector 2 — Asserting Without Asserting (What the Lint Cannot See)

The lint parses **strings** (FR-33; addendum B.2). It therefore cannot see: **images**, **mechanics**, **juxtaposition**, **visual hierarchy**, or the **sum** of individually-safe sentences. Every finding below lives in one of those five blind spots.

### F-8. A captured encounter frame on the Share Card is an image assertion, and an image is not a sentence. — **CRITICAL**

FR-33's law is scoped to *"No **sentence** anywhere in the app…"* and enforced as a build-failing lint over *shipped strings*. FR-24's artifact block "shows the case's strongest artifact — a word, **a captured frame**, or a trace." FR-15 makes the encounter a captured, saved, still image of a creature silhouette that becomes Evidence.

**Failure scenario.** The card's strongest-artifact selector picks the frame (it is the most compelling artifact by construction). The card now contains: a photograph-like image of a figure in the dark, a case reference, a status stamp reading UNEXPLAINED, and a stat row. Posted to a feed, that image is **indistinguishable from a real photograph of something unexplained.** No banlist word appears anywhere on it. The lint passes. SM-8 (claims cleanliness) reads zero. And the app has just made, in pixels, the single most powerful real-world assertion in its entire output — the one the entire claims architecture exists to prevent.

The PRD's mitigations (FR-15: "never centred and never in focus… the appearance of being caught rather than presented") reduce the *art direction*, not the *claim*. A blurry cryptid photo is a more credible cryptid photo, not a less assertive one.

**Fix:** FR-24/FR-15 need a consequence the lint cannot provide: the card's artifact block must never carry a captured frame or a generated sky object as its primary artifact — strongest-artifact selection must be restricted to word/trace artifacts, or a burned-in per-artifact caption must travel with the frame. This must be a *requirement*, not a rendering hope, because the lint cannot enforce it.

---

### F-9. The Sky tool's captured "UFO" travels unlabelled. — **HIGH**

FR-17 correctly requires the Sky surface be "permanently labelled as generated." The label is a property of the **surface**, not the **captured image**. An Alien-hunt capture becomes Evidence (FR-18) and can become the card's artifact (FR-24). Once captured, the starfield and the object are a photo of the night sky with a light in it — the label is gone, and the report's evidence ledger lists it as CAMERA/SKY Evidence with a time and a triage verdict. Same blind spot as F-8; distinct surface; same fix.

---

### F-10. FR-13 uses the verb "receive" and drops the line that reconciles the Spirit Box. — **HIGH**

FR-13, verbatim: *"The user can hold to ask a question and **receive**, very rarely, a single word fragment."*

Rulings-table row 19 deletes `Spirit box communicates with the dead` and rules the safe copy is `Voice tool` + *"Bands are theatre. **Nothing here is received.**"* The PRD's own normative requirement text uses the exact word the rulings table deleted, and **FR-13 does not carry the "nothing here is received" line anywhere.** FR-33's banned list does not contain "receive," so the lint cannot catch it. The PRD has therefore admitted into its normative text the one verb that turns the Spirit Box from theatre into a receiver, in a sentence no build check will ever flag.

**Failure scenario.** The Voice surface shows a word after the user asks a question. A skeptic who has read the About notice ("Bands are theatre. Nothing here is received") then reads an FR-derived UI string that says the tool "receives" a fragment — or, more likely, sees the mechanic perform exactly what "receive" describes — and the About notice is exposed as a fig leaf. The one place the PRD should have been most careful is its own requirement language.

---

### F-11. The Tracker ladder is driven by the user's own GPS movement, and FR-16 dropped the disclosure the design doc had. — **MEDIUM–HIGH**

Design doc F-12 for the Tracker: *"GPS movement (speed + heading) feeds `proximity` deltas"*, and the surface carries a long-press disclosure: *"Proximity is inferred from movement, not measured."* **The PRD's FR-16 lists the compass, chevron, ladder, trail, and signal-age — and omits the disclosure entirely.** FR-16's only guard is "No numeric distance, speed, or coordinate is ever displayed."

**Failure scenario.** A skeptic walks a hunt, sees the ladder close to CLOSE/NEAR, and tests it: they walk the wrong way, or stand still. For a Stalker target, the ladder closes on its own while the user is stationary — the app produces the felt claim *"something is approaching me"* with no mechanism and no on-surface disclosure. For an Ambusher, the user's own walking drives it, so reversing direction still closes the ladder (the target is following). Either test produces a demonstrable "it said NEAR and nothing was there." The bearing+band rule (which the PRD correctly kept over metres) survives the *pacing test*; the **ladder** does not survive the *standing-still test*, and the PRD deleted the one affordance that told the user it was invented.

---

### F-12. "Certainty band" is a locked glossary term that names a certainty the app cannot have. — **MEDIUM**

§3 (normative): **Certainty band** — "The three-level qualitative strength of Evidence: `AMBIGUOUS`, `SUGGESTIVE`, `COMPELLING`." The report's ledger (FR-22) shows each item with its certainty band.

**Failure scenario.** A skeptic reads the ledger: `CAMERA · 11:47 PM · COMPELLING`. The app has just told them an item of Evidence is *compelling*. That is a judgment about the contents of the world, rendered as a single word, from a fixed set, and it is exactly the class of claim the lint exists to prevent — but "certainty," "compelling," and "suggestive" are not on the banned list, and the Glossary *forbids* downstream from renaming them. So the leak is locked in: the term propagates to every ticket, string table, and accessibility label by mandate. The word "certainty" asserts an epistemic state the app's own premise denies it can occupy.

---

### F-13. The Spirit Box's word banks are learnable per-hunt tables — the thing the PRD says it will not ship. — **MEDIUM**

§4.2 rejects per-hunt probability tables on the grounds that *"learnable per-Hunt tables destroy uncertainty"* and FR-6 mandates "one engine, one hazard model." The source brief specified *"creature-specific word pools"* (§11), and the PRD's FR-13 says only "Words are drawn from authored banks" — **it neither confirms nor overrides creature-specific pools.** If the banks are creature-specific (the brief's spec, unoverridden), the word returned after a Ghost ask and after a Bigfoot ask come from overlapping-but-distinct pools. A user who plays both enough learns the pools — a per-hunt table in linguistic form. The PRD's anti-predictability architecture (FR-2, SM-C2, the inter-emission anti-metric) is built to stop exactly this, and the word layer is exempt from all of it.

**Addendum C.3** has `rng.words` for "word-bank selection only" and never states whether bank *content* is per-creature. This is an unrecorded gap in the override discipline, and it sits on the most sensitive surface (the surface whose mechanic most resembles "communication").

---

### F-14. The triage reason list is closed and mundane, so status is gameable by menu selection. — **MEDIUM**

FR-20: an explained item's reason is "a vehicle, a building, the user's own movement, equipment, or other." FR-21 derives status from the explained ratio. OQ-4 frames the risk as *"a user can talk themselves out of an `UNEXPLAINED`"* and calls it intentional.

The sharper reading: because the reason menu is **closed**, a user who wants UNEXPLAINED simply never picks an explained reason — the status is a function of button presses, not of anything the app detected. And the reason list is itself an authored claim about ordinary reality ("a vehicle," "a building") asserted by the app on a report that presents itself as a record. A skeptic reading a sealed report sees `EXPLAINED — a vehicle` for a sound in a sealed attic. No banlist word appears; SM-8 stays at zero; and the report has just published a mundane cause the app cannot know.

---

### F-15. The Daily Anomaly is shareable per the design doc and has no footer rule in the PRD. — **MEDIUM**

Design doc F-02: the Anomaly card *"is itself shareable via long-press."* The PRD's FR-30 says nothing about sharing the anomaly, and FR-33's sentence law covers "its share output" generically — but the anomaly is *designed* to be non-falsifiable atmosphere, so no banned word will ever appear in it, and the lint has nothing to catch. If it ships shareable, an atmospheric line leaves the app as a standalone image with no campaign footer requirement. If it does not ship shareable, the PRD has silently cut a designed Q3-passing feature without recording it. Either way, the PRD and the design doc disagree and the PRD does not say which wins.

---

### F-16. "PARTIAL MATCH" under a Bigfoot hunt is the hedge that carries the claim. — **HIGH**

FR-19: "A Signature is never presented as a positive identification of a real creature; a match reads as a partial or unsigned match." Rulings-table row 13 deleted `Possible match: BIGFOOT` in favour of `Signature: PARTIAL`. The PRD believes it has handled this. It has not.

**Failure scenario.** Devon (UJ-2) starts a hunt labelled **Bigfoot** (FR-8 ships a menu item named for a real cryptid), fills six of nine signature slots, and the report reads `PARTIAL MATCH · UNIDENTIFIED`. The user's own reading: *the app has a Bigfoot signature and I got a partial match.* "Partial" does not retract the claim; it **implies a whole** — a full match exists, is reachable, and is Bigfoot. The PRD then *celebrates* this as a hook: UJ-2's resolution says the unfilled slot *"is its own hook."* The product is monetizing the implication that a named cryptid is identifiable by evidence. The signature archive with locked silhouettes and "stated unlock requirements" (FR-25) reinforces it: the app presents Bigfoot as a discoverable entity with criteria.

The hedge is doing the same work as the percentage's "case index" label: it names the claim while appearing to disclaim it.

---

## Vector 3 — The Retention Claim

### F-17. D7 ≥25% is asserted, not defended, and the addendum admits every SM is invented. — **HIGH**

Addendum F.4: *"The source contract states no funnel targets. SM-1 through SM-8 in the PRD are therefore new."* No baseline, no comparator, no derivation is offered anywhere for SM-2's ≥25%. For a free entertainment app with **no notifications, no streak enforcement (FR-29), no time-based progression (FR-28), no social surface (FR-26), no ads, and an explicit counter-metric forbidding optimization of daily opens (SM-C4)**, 25% D7 is a top-decile number in the category, and the PRD's own design laws remove every mechanism that produces it. The target and the architecture are pulling in opposite directions. Either the target is wrong or the laws are; the PRD asserts both without noting the tension.

### F-18. The pre-agreed response to a first-run retention problem is to make the leading silence longer. — **HIGH**

FR-3 note: *"If reviewer feedback finds first-run sessions feel different in a detectable way, the fix is to lengthen the guaranteed silence rather than to widen the guarantee."*

FR-2 already sets the pre-Encounter floor at "at least one silence exceeding five minutes … in 22–35% of sessions" and a longest-silence median of 200–260 s. So the documented remedy for "the first session does not land" is **more nothing, for longer, at the front** — the exact prescription design-doc risk #4 identifies as the thing that makes users conclude the app is broken. This is the product designed against its own retention, in writing, with the remedy pre-agreed.

### F-19. The most likely early-uninstall FR is FR-2 as gated by FR-9. — **HIGH**

**Failure scenario.** A fresh installer (Mary, UJ-1) reaches the Hunt Brief. FR-9 makes calibration, a place name, and an intention **mandatory** before the session can start — a form, before the app has delivered any value. She then holds 600 ms to enter. What she gets is FR-2's mandated silence floor and, via FR-3, "at least five minutes of genuine silence before the first emission." The PRD's named mitigation for silence-reads-as-broken (design doc risk #4) was a first-90-seconds micro-directive plus an explicit breathing "Listening" state. The PRD carries the four-word hairline but **drops the micro-directive**, and FR-9's mandatory ritual front-loads cost onto the least-invested moment in the user's lifetime. The most likely early uninstall is not one FR — it is FR-9 feeding FR-2, and FR-2's budget is set by design to be quiet.

### F-20. The onboarding funnel is sized to lose nearly half of installers before the hero screen. — **MEDIUM**

SM-3 targets ≥55% of new users sealing their first case; the PRD therefore anticipates ~45% never seeing the Case Report — the entire product. Combined with SM-2 (≥25% D7), the modelled funnel is: about half never reach the hero, and three quarters of the rest are gone within a week. The PRD states both numbers flat, with no discussion of what the app does for the majority it expects to lose.

### F-21. The only retention surface is a one-line string table. — **MEDIUM**

With FR-28 (no time-based advancement), FR-29 (no enforced streak, no notification), FR-26 (no social), SM-C4 (do not optimize daily opens) and no push infrastructure anywhere in the product, the return hooks reduce to: the Daily Anomaly line, the unsealed-case dot, and the signature archive's holes. OQ-8 concedes the Anomaly set's shelf life is unresolved and may be exhausted "quickly." The PRD calls the Anomaly "the app's cheapest retention surface" — it is also the **only** one, and it is one authored sentence per day with an admitted exhaustion problem. D7 ≥25% is not defensible against that instrumentation.

---

## Vector 4 — Store Review (Apple / Google)

### F-22. The percentage is a metadata claim the moment the Share Card appears in a screenshot. — **MEDIUM**

There is no IAP review path (the app ships free, §5), so the reviewer's exposure is: metadata, screenshots, category, rating. FR-33 explicitly extends the sentence law to "its metadata, its screenshots." The Share Card is the natural screenshot asset (it is the product's proudest surface). **If the card carries the percentage (F-3), then the app's App Store screenshot set contains a measurement-style claim — the exact surface where "no misleading claims" guidelines actually bite**, and where the app's one-line framing may not survive the screenshot crop. This is the second-order cost of leaving FR-24's stat cells unspecified: it is not only a product risk, it is a metadata risk.

### F-23. FR-33 says "shipped strings" and never defines the string surface set a reviewer reads first. — **MEDIUM**

FR-33's consequence is "the build fails if any banned term appears in shipped strings," and addendum G.7 says "a grep test rejects the banned phrases." Neither enumerates the surface set. Missing by name: **iOS `Info.plist` purpose strings** (`NSMotionUsageDescription` is explicitly required per addendum D.5), the **store description**, **screenshot captions**, and the **About notice** itself. A reviewer's first encounter with the app is the description and the purpose strings — the two surfaces the lint's scope does not clearly cover. The magnetometer purpose string is the highest-risk single string in the product (it sits next to a "field" reading) and the PRD never states it.

### F-24. The ratified safety line is missing from the About notice. — **LOW–MEDIUM**

Design doc ruling #25 rules *"Do not use if you have a heart condition"* → "Calm safety line inside About," and addendum B.5 lists the About notice's sections (WHAT THIS IS / WHAT IT DOES / SENSORS USED / WHAT WE NEVER DO / A NOTE ON SCIENCE / SAFETY). The **PRD never specifies the safety line's content** and FR-32's onboarding/notice requirements never mention SAFETY at all. A horror-adjacent app rated 12+ with encounter stings and glitch events has an unstated, ratified safety element.

### F-25. Rating-questionnaire accuracy is unaddressed. — **LOW**

§2.2 states the app "is atmospheric and can startle." FR-33 fixes "rating 12+/Teen" but the PRD never states the rating questionnaire answers for horror/fear themes, sudden loud audio, or flashing (glitch channel at Intense/Ritual, FR-10). "12+/Teen" is a conclusion without the inputs that produce it. Low review probability; real if the glitch channel ships with flashing at `Ritual`.

### F-26. SM-8 is circular: it measures only what the lint can see. — **HIGH**

SM-8 (Claims cleanliness) target zero, measured as "count of banned-term lint failures and store-review claim rejections," validating FR-33. But every finding in Vector 2 — the captured-frame image (F-8), the Sky capture (F-9), "receive" (F-10), the tracker mechanic (F-11), "certainty/COMPELLING" (F-12), "PARTIAL MATCH" (F-16) — is invisible to both a banned-term lint and (unless it escalates to rejection) to a store reviewer. So the PRD's headline claims-safety metric will report **100% clean while the product ships at least six lint-invisible claim leaks.** SM-8 is a metric that measures the lint's coverage, not the product's honesty; a skeptic would call that a tautology dressed as a guarantee.

### F-27. UJ-1 and FR-3 are in direct, normatively-binding contradiction. — **HIGH**

UJ-1: "**Fresh install** … granted no permissions yet," first session, and the Case Report renders with **`ENCOUNTERS 00`** and status **INCONCLUSIVE**. FR-3: "While the user has zero sealed Cases, the system can guarantee their first Session reaches a real Encounter." UJ-1's user has zero sealed cases at session start, and her session produces zero encounters. **One of the two is wrong, and both are normative.** UJ-1 is the canonical first-run scene the PRD uses to define onboarding, permissions, Home, the Brief, the report, and the negative-space block; FR-3 is the mechanism the PRD calls out as the fix for the first-session-must-land problem. Downstream ticket writers will implement both and ship one of them broken. This is also the showcase case for the app's honesty — and as written, the showcase cannot happen.

---

## What I Could Not Break (in fairness, and because a hostile review that finds everything is not credible)

- **The distance rule (bearing + band, no metres)** genuinely holds. A skeptic can pace a room and expose "182 m"; they cannot pace out "NE · NEAR." The PRD correctly kept the brainstorm's ruling over the brief and recorded the asymmetry. This is the one place the owner's line-drawing is sound.
- **The starfield labelled as generated** (FR-17) and **no thermal/radiation/real-star-catalogue** (addendum A.3, B.4) are correct and survive scrutiny.
- **The three-layer disclaimer** (listing / non-skippable onboarding / permanent About, addendum B.5) is well-specified and exportable.
- **Just-in-time permissions** with documented fallbacks (FR-5, addendum D.4–D.5) is genuinely cleaner than the category and is a *visible* differentiator a reviewer would notice favourably.
- **Negative space** ("Nothing was recorded tonight. That is a result.") is a real differentiator and correctly designed — my objection to it is only where it intersects the percentage (F-5) and the checkpoint that never happens (F-27).
- **The anti-predictability engine design** (FR-2, addendum C.6–C.7, golden-seed replays) is the strongest part of the document as engineering. My objection is that its discipline stops at the word layer (F-13) and the report (F-4).

---

## Ranked Summary

| # | Finding | Severity |
|---|---|---|
| F-1 | `%` glyph *is* the measurement; "case index" defense contradicted by retained typography | CRITICAL |
| F-3 | Share Card carriage of the percentage unspecified; most-distributed, least-framed surface | CRITICAL |
| F-8 | Captured encounter frame on the card is an image assertion outside a sentence-scoped lint | CRITICAL |
| F-2 | "Not a measurement" under "91%" is a self-defeating disclaimer | HIGH |
| F-4 | FR-22 breaks FR-4, addendum C.10, and design-doc F-17; audit trail under-reports | HIGH |
| F-5 | Percentage in the nothing-case undefined; intersects the flagship honest-nothing report | HIGH |
| F-6 | Percentage makes the "undetectable" First-Run Directive detectable | HIGH |
| F-9 | Sky capture travels unlabelled into the card | HIGH |
| F-10 | FR-13 uses "receive"; the reconciling line is dropped; lint cannot catch | HIGH |
| F-16 | "PARTIAL MATCH" under a named cryptid carries the claim | HIGH |
| F-17 | D7 ≥25% asserted with no basis; addendum admits all SMs are invented | HIGH |
| F-18 | Pre-agreed first-run retention remedy is longer silence | HIGH |
| F-19 | Most likely early uninstall: FR-9 ritual feeding FR-2 silence floor | HIGH |
| F-26 | SM-8 measures lint coverage, not honesty; circular | HIGH |
| F-27 | UJ-1 (`ENCOUNTERS 00`) contradicts FR-3 (guaranteed first Encounter) | HIGH |
| F-11 | Tracker ladder driven by user movement; FR-16 dropped the disclosure | MEDIUM–HIGH |
| F-7 | Two different entertainment lines for one function | MEDIUM |
| F-12 | "Certainty band"/`COMPELLING` names an epistemic state the app denies | MEDIUM |
| F-13 | Spirit Box word banks may be learnable per-hunt tables | MEDIUM |
| F-14 | Triage reason list closed → status gameable by menu selection | MEDIUM |
| F-15 | Daily Anomaly shareable per design doc; no footer rule in PRD | MEDIUM |
| F-20 | Funnel sized to lose ~45% before the hero screen | MEDIUM |
| F-21 | Only retention surface is one line of text per day | MEDIUM |
| F-22 | Percentage reaches App Store screenshots if the card carries it | MEDIUM |
| F-23 | FR-33's string surface set undefined (plist, description, captions) | MEDIUM |
| F-24 | Ratified safety line missing from About | LOW–MEDIUM |
| F-25 | Rating-questionnaire inputs unstated | LOW |

**The single sentence the owner needs:** the percentage override is survivable *only* if the `%` glyph is removed (F-1), the card is explicitly counts-only (F-3), and the image artifacts are constrained by requirement (F-8) — because those three are the findings that actually kill the app, and none of them is what OQ-1 currently asks.
