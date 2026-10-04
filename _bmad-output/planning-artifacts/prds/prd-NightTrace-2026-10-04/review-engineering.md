---
title: NightTrace — Engineering Feasibility Review of PRD
reviewer: engineering-feasibility
date: 2026-10-04
artifacts reviewed:
  - prd.md (PRD: NightTrace)
  - addendum.md (PRD Addendum)
source artifacts consulted:
  - _bmad-output/brainstorming/…/01-product-and-game-design.md
  - _bmad-output/brainstorming/…/02-engineering-and-delivery.md
verdict: BUILDABLE, with four findings that must be resolved before architecture locks
---

# Engineering Feasibility Review — NightTrace PRD

## Verdict

The PRD describes something that **can** be built by one senior engineer in roughly the stated window, but four requirements as written are either not achievable as specified or are achievable only under a narrower reading than the PRD states — and three of those four sit on the day-15–21 critical path (Phase 2, "Report first"), which is exactly where the source plan says the project is won or lost. The architecture is sound and unusually well-considered; the failures are in the *contract wording*, not the design. The single most dangerous item is the share card's "byte-identical" requirement, because Phase 2 is deliberately built before any tool exists, so a late discovery there has no slack to absorb it.

**Findings by severity: 4 HIGH, 3 MEDIUM, 2 LOW. No CRITICAL.**

---

## 1. Scope vs one engineer

**Risk: HIGH. Surfaces: EARLY (planning), bites LATE (days 35–45).**

The source plan is concrete and internally consistent. `02-engineering-and-delivery.md` defines **49 tickets** across Phases 0–6, with a stated capacity model (`§Q`): one senior engineer, full time, **30 calendar days with 4 buffer days already spent inside the 30**, and an explicit allowance for ~15% of a day lost to builds/simulators/store tooling. Day 30 is stated as the end of the **MVP-complete** sprint, not ship; shippable v1 lands **day 40–45**, and the post-30 window is enumerated (days 31–34 remaining tools, 35–39 three creature drops, 40–45 performance/battery/accessibility/store).

The problem is a **scope-label collision between the PRD and its own addendum**:

- The addendum says day 30 = **MVP-complete**, day 40–45 = **shippable v1**.
- The PRD §6.1 "In Scope" for **MVP** lists: four Hunts, **seven** tool surfaces, the engine, Evidence/Triage, the Case Report, Share Card, Journal, Clearance, Home, Field Note, onboarding/claims lint, **full sensor fallback coverage**, **accessibility baseline**, intensity system, on-device persistence.
- Per the source at-a-glance (`§Q.6`), day 30 ships **four** tool surfaces (EMF, Radar, Spirit Box, Voice); Camera, Tracker, and Sky are days 31–39. The **accessibility pass, battery measurement, store claims, and the EAS production build are all crammed into days 40–45** (`T-6.3`, `T-6.4`).

So the PRD's "MVP" is the source's "shippable v1." A downstream consumer (epics/stories, or the engineer estimating against "MVP") will plan a 7-tool, fully-accessible app against the 30-day framing. That is a **~15-day under-estimate** and it surfaces the moment `bmad-create-epics-and-stories` runs against §6.1.

Three secondary scope risks:

- **Content authoring is unbudgeted.** All 49 tickets are engineering. Nothing in the ticket list or the 30-day plan estimates the *authored* content the product is made of: the narrative template bank, the Spirit Box word banks (`data/wordbanks/{ambiguous,ghost,ufo}.json` — note only three files for four Phenomena), the Home anomaly set (365 lines per OQ-8), four Hunts' objective copy, and twelve sound categories of asset production. The architecture is designed so content is "parameter sets, not code" (FR-6, FR-7) — which is precisely why content volume is invisible on a ticket board. This is the classic failure mode for a content-driven engine: the engine is done on day 30 and the app still feels empty because nobody budgeted the writing.
- **Accessibility is one ticket inside a 5-ticket, 5-day window.** `T-6.3` covers "performance, battery and accessibility" together. The PRD's accessibility baseline (FR: VoiceOver **and** TalkBack on report **and** journal, Dynamic Type to 200%, Reduce Motion, contrast targets) is not a half-day alongside battery measurement and two other tickets.
- **OQ-2's ordering inversion.** The PRD says the low-power battery target "needs a target before architecture locks the sampling ladder" — but the addendum `§D.2` has *already specified* the ladder (`off|eco|ambient|focus` → 2/6/15 Hz) and the modes. The document that should be upstream of the decision is downstream of it.

**Is it realistically a one-engineer build?** The engineering is — the module layout (`§C.1`), the pure-TS engine boundary enforced by ESLint (`engine/` may not import react/react-native/expo/zustand; no `Date.now()`, no `Math.random()`), the single presenter node, and the branded-id type discipline are genuinely one-person-scale and the source explicitly notes tools parallelize trivially if a second engineer appears. The *content* is not obviously one-person-scale and is not estimated at all. Recommend: re-label §6.1 "MVP" as "MVP / v1 scope", split it explicitly into day-30 and day-45 tiers, and add a content-authoring burndown before epics are cut.

---

## 2. The Share Card

**Risk: HIGH. Surfaces: MID, but on the critical path (Phase 2, days 20–21 in the source; built first by design).**

### 2a. The mechanism the addendum names does not satisfy the requirement as written

The addendum names the mechanism in two places, and they are consistent with each other but not with FR-24:

- `§G.1` lists **`react-native-view-shot`** in the stack.
- `§A.3` records, as a *rejected* alternative: "**Skia `makeImageSnapshot`; server-rendered PNG** — rejected for the share card. The card must render byte-identically and offline."
- `§I.5`: "Re-rendering produces a byte-identical image."

The source is more honest about what it is actually claiming. `02-*` `T-2.8` "Done when" reads: *"`captureRef()` produces a PNG at a fixed reference resolution regardless of device; … rendering the same case twice produces byte-identical output (checksum test) **so a re-share is not visibly different**."* The clause after "so" reveals the real goal: **perceptual** identity ("not visibly different"). The PRD hardened a perceptual goal into a **byte-exact** test and dropped the explanation.

`captureRef()` rasterizes the native view hierarchy (iOS `drawViewHierarchyInRect`/`UIGraphicsImageRenderer`; Android `View.draw(Canvas)`). Its output is not byte-reproducible in general, for four concrete reasons:

1. **The view tree must be fully settled.** The card's artifact block shows "the case's strongest artifact — a word, a captured frame, or a trace" (FR-24). A captured frame is a decoded image; if capture fires before decode/scale settles, the pixels differ per render. There is no "wait for settle" protocol anywhere in FR-24 or `T-2.8`.
2. **Font rasterization and anti-aliasing differ** across OS versions, GPU paths, and iOS/Android. Even pinned to a "fixed reference resolution," glyph edges are not bit-stable.
3. **Live surfaces.** Anything Reanimated/`SharedValue`-driven (the source drives 60 fps visuals from a SharedValue written on the UI thread, `§D.3`) is sampled at whatever frame the capture lands on.
4. **"Regardless of device"** (source `T-2.8`) and "byte-identical" (PRD) cannot both hold. Byte-identity across devices is unachievable; byte-identity on *one* device across two renders is plausible only under (1)–(3).

**Actual mechanism, and whether it works:** live React view → `captureRef()` → PNG in cache → `Sharing.shareAsync(uri, {UTI, mimeType:'image/png'})`; `Save to Photos` → `Asset.create(fileUri, album)`; media-library denial hides Save and leaves Share as the only path. Offline, yes — `expo-sharing` and `expo-media-library` are local. Watermark-free, yes — it is a composition of views, nothing appended. But **the "byte-identical" consequence is untestable as written and will fail a literal SHA-256 CI check** on the first device matrix that includes two OS versions.

**Recommendation:** restate FR-24's consequence as *"rendering the same card twice on the same device with a settled view tree produces identical output (checksum test)"*, and keep perceptual identity as the product goal across devices. The source's own fallback (`§Q.8` Scenario C) is to "ship the card as a composed PNG from static assets + text" — that path *is* byte-reproducible and is worth naming in the PRD as the determinism escape hatch.

### 2b. Machine-readable — this requirement is not in the PRD, and would contradict it if added

To be precise: **the PRD does not require the card to be machine-readable.** What it requires is (a) byte-identical re-render, (b) watermark-free, (c) no URL/QR/badge/attribution, (d) an offline, on-device composition with no server-side rendering. (d) is satisfied. If a machine-readable payload *were* added, it would be **architecturally contradictory**: the only on-image machine-readable channels are QR / DataMatrix / barcode, or OCR-target text with an encoded destination — and QR is explicitly banned in FR-24 and the glossary. The card does carry `NT-017` as human/machine-*legible* text, but it encodes no destination. So: no action needed, but if any downstream artifact introduces a "scan-to-open" idea, it is dead on arrival against the no-network law.

### 2c. The attribution ban silently removes the brand from the growth loop

FR-24: "no attribution of any kind"; "Nothing is ever appended to a user's output." The source card design (`01-*` `F-18`, line 2041) says the opposite: *"The only branding is the wordmark and the case ref, both of which are content"* — footer `NIGHTTRACE` wordmark + date + entertainment line.

The PRD is authoritative and wins, but the consequence is unremarked: with no URL, no QR, no badge, **and now no wordmark**, a recipient who likes the card has no in-image path to the app. UJ-2 resolves this by "two people in the chat ask what app it is" — i.e., the growth loop now depends on a human asking. SM-1 (share rate ≥20%) is the product's single deciding number and the PRD calls the card "the growth engine." Removing the one branding element that the source deemed *content* is a material growth decision disguised as a claims-compliance cleanup. It should be made deliberately and recorded, not inherited from an over-broad reading of "attribution." **Severity: MEDIUM.**

---

## 3. Determinism vs the real world

**Risk: HIGH. Surfaces: MID (week 2 golden-seed work; the false promise surfaces in the field / in QA).**

### 3a. The bucketing claim is plausible for *level*, not for *timing*

The addendum's claim (`§C.3`) is: "The sensor digest is bucketed so devices with different noise floors agree." The source's rationale (`§H.4`) has three parts, the relevant one being: *"two phones in the same place disagree on `emfMicroTesla` by 30%, so a bucket based on the device's own baseline makes the same seed produce the same session shape on both."*

This is **half true**. The `SensorDigest` (`§H.4`) buckets are `magnetic: floor|low|mid|high|unknown`, `magneticDelta: none|settling|twitch|swing|surge`, `motion: still|micro|moving|agitated`, `sound: silence|room|voice|loud`. Normalizing against the device's own baseline genuinely makes the *ordinal level* agree across phones. It cannot make the **timing of bucket crossings** agree, because a `twitch`/`surge` transition is a real magnetometer event and a `moving`/`agitated` transition is real human motion. Two "identical" sessions differ in *when* each bucket flips. The engine ticks on that digest, so emission timing — the thing the whole product is about — is not reproducible from the seed alone.

### 3b. The PRD promises exact reproduction and then quietly withdraws it

**FR-1 headline:** *"the same Seed reproduces the same Session exactly."*

**FR-1 consequence 2:** *"Replaying a recorded Session's Seed, Hunt, content version, **and tick digest** reproduces the identical emission sequence."*

These are different claims. The headline is false for any live session; the consequence is true, because it smuggles in the recorded digest. That is the honest architecture — replay key = `seed + hunt_id + content_version + tick_digest[]` (`§C.3`, `§E.2`) — but the PRD states the strong claim as the requirement and the weak one as the test, and a downstream reader will implement to the headline. **Recommendation:** FR-1 should read "the same Seed **and recorded tick digest** reproduce the same Session exactly." A user-facing "replay your case" view is only possible because the digest is stored — that is a recorded replay, not a seed regeneration.

The engine's purity is real and valuable: `RandomEngine` is a 40-line dependency-free xmur3→sfc32 with `fork(label)` substreams for order-independence (`§C.3`), and the module boundary is ESLint-enforced. That part is exactly right.

### 3c. What this implies for the replay tests' value

The golden-seed tests (`§C.5`) assert `{seed, huntId, scriptedActions[]}` → expected emission digest, in the **node** Jest project, which "is only possible because the engine imports nothing from React Native or Expo" (`§G.4`). Consequence: the tests **cannot see the sensor boundary at all.** They feed a synthetic/scripted digest and prove that *given a digest stream*, the engine is deterministic and that a firing-timing change fails the build. That is genuinely the most valuable correctness net in the project and it should be kept.

But it gives **false confidence about two things**:
1. `seed → session` determinism in the field, which does not hold (3a).
2. The **quantizer** itself (`sensors/quantize.ts`, `§C.1`), which is where "devices agree" is actually decided, is in `sensors/` — outside the pure engine project, and covered by no golden-seed test.

So the audit story is: *engine determinism, provable in CI; sensor×engine agreement, not provable and not tested.* And the source's tuning targets (`§C.6`) — encounter rate 42–58%, inter-emission p50/p90 ≥3.0, longest-silence band — are all **measured over 500 synthetic seeded sessions**, i.e. against a digest distribution no real phone produces. SM-4 then asks the PRD to hold 42–58% for **real** sessions. That band cannot be delivered on-device without field data. OQ-6 admits this ("derived from simulation, not from real users"); the PRD should say so in SM-4 itself, not only in the open questions.

**Does the PRD promise anything reproducibility-wise the architecture cannot deliver?** Yes, two: FR-1's headline exactness, and SM-4's on-device band. Both are fixable in wording.

### 3d. A related, unaddressed haptics hole

The source flags (`§G.0`): the iOS **Taptic Engine is a no-op when the camera is active, during dictation, in Low Power Mode, or if haptics are disabled.** The Stalker archetype is "haptic-led" (FR-6) and the Alien hunt is "visual and haptic-led" (FR-8). There is no specified fallback for "haptic-led archetype on a device where haptics are silently no-op." A Stalker hunt run through the Camera tool, or on a phone in Low Power Mode, loses its primary channel with no degradation path — even though FR-5 requires graceful fallback for *every* sensor channel and the addendum `§D.4` claims "reduce, never block." Haptics is not in the sensor table, so it is ungoverned. **Severity: MEDIUM. Surfaces: MID-LATE (week 4, when the presenter meets the camera).**

---

## 4. The percentage requirement's engineering implication

**Risk: HIGH (as an invariant breach), LOW (as an implementation problem). Surfaces: EARLY–MID (Case Report, Phase 2 — but by design the first thing built).**

### 4a. Where does the number come from? Not the engine.

The engine boundary is strict and coherent: the engine "returns **emissions** and nothing else" (`§C.2`); `EventTable.emptyWeight > 0`; archetypes emit `ArchetypeEffect` values and never touch state (`§C.12`). The anti-falsification rationale for bucketing the digest is explicit (`§H.4`): *"a rule cannot accidentally leak a number into UI copy if no number exists downstream of the hub."* `EmfPipeline` ends `… → anomaly score → bucket`, and `§C.10` states flatly: *"the score never reaches the UI as a number."* FR-4 requires tension to be "never displayed, announced, or exposed to assistive technology."

So the strongest-anomaly percentage **cannot** come from the engine or from a live scalar. It must be **synthesized at seal time inside `CaseReportService`**, derived from persisted qualitative data (evidence count, certainty bands, signature convergence, encounter count), and **persisted as a field in `case_reports`** so it is frozen. That is actually a clean design: the report is already a materialized document with JSON sections and a few indexed columns (`§E.1`, source `§I.6`), sealing is irreversible (FR-23), and a frozen derived field is exactly what a case file is.

**So the implementation is fine.** The tension is not "impossible to build."

### 4b. Is it a genuine architectural conflict, or a policy distinction?

**It is a policy distinction whose *enforcement mechanism* is architecturally defeated on exactly one screen — and that is the genuine conflict.**

- As a *policy* distinction it is defensible and the PRD argues it well (OQ-1, A-2): a percentage on a sealed case file is the app's own index of its own night; metres-to-a-contact is testable by pacing the room. Different falsifiability. Fine.
- As an *invariant* it is broken. The safety property the source relies on is global: **no number exists downstream of the hub**, therefore no rule can leak one. FR-22 introduces a screen that requires a number, so the hub boundary must be crossed *somewhere*. Either the anomaly score reaches the report layer (breaking `§C.10`), or the report service re-derives an equivalent scalar from qualitative inputs (a second, parallel definition of "anomaly strength" that must stay consistent with the bucket thresholds — a dual-source-of-truth hazard). Invariants with a carve-out are how the carve-out becomes the bug. This is a real architectural fork, not a wording quibble, and it needs a decision before Phase 2 starts.
- **The accessibility contradiction is sharper and unaddressed.** The addendum `§H` states: *"Hidden scalars are never announced — tension, attunement, rarity, and seed never reach assistive technology."* But the PRD's accessibility baseline requires the **report** to be VoiceOver/TalkBack navigable, and FR-22's stat row contains the percentage. A screen reader on the report **must** announce it. So the percentage is a hidden-scalar-derived value that is deliberately exposed to assistive technology, in direct contradiction of the blanket rule as literally written. The rule needs narrowing to "live engine scalars are never announced" before someone "fixes" the accessibility layer by hiding the number.

### 4c. Two unspecified pieces

- **"the activity level"** (FR-22) is named but never defined. The brief's `ACTIVITY 93%` is a percentage (row 9 of the addendum's own risky→safe table); the safe ruling was `Activity: HIGH`. If the activity level is a band, the report carries **one** percentage, and FR-33's lint can allowlist it. If it is a second percentage, the report carries two, and the framing sentence in OQ-1 must cover both. Unresolved, and it changes the lint's design.
- **Thresholds.** FR-21 requires "signature convergence at or above the threshold" and "an explained ratio below the threshold." No threshold value appears anywhere in the PRD or addendum. Untestable until specified (see §5).

**Net:** genuine tension, resolvable in one sentence plus one persisted column, but the PRD itself marks OQ-1 `[BLOCKING]` and does not resolve it. It should be resolved *before* the report is art-directed, not after — because "one sentence, used consistently wherever the number appears" (OQ-1's own ask) is a copy decision that changes the visual unit the PM already flagged for review (FR-23 note).

---

## 5. Requirements that are untestable as written

**Risk: MEDIUM-HIGH. Surfaces: EARLY (they will be "tested" vacuously or skipped).**

| FR | "Testable" consequence | Why it is not testable | What makes it testable |
|---|---|---|---|
| **FR-2** | "the timing of any emission is not learnable from the user's prior Sessions" | "Not learnable" is a statement about an adversary's inference, not a property of the engine. The listed consequences (p50/p90 ≥3.0, longest-silence band) are *proxies* — a session can pass both and still be trivially predictable (e.g. fixed period + jitter). | State the actual adversarial test: train a predictor on N sessions' emission timestamps, assert next-emission-time error ≥ X. Or restate the FR as the proxies it actually means and drop the learnability claim. |
| **FR-3** | "The directive is invisible to the user and produces no copy, indicator, or behaviour the user can detect as special" | A human-factors claim. No CI assertion can establish it; A-4 acknowledges it and offers no protocol. | A/B protocol: N first-run users vs N returning users, measure "did you notice anything different", with a stated non-inferiority margin. Otherwise mark `[ASSUMPTION]`, not `(testable)`. |
| **FR-7** | "Content definitions are validated at build **and at launch**" | Testable in CI, but *contradicts the cold-start budget*: `T-6.3` targets "cold start to an interactive Home under 2 s." Full-schema validation of all catalogue JSON on every launch competes with that budget. | Validate at build always; at launch, validate only when `stored content version ≠ current` (which is what `§E.1`'s rebuild trigger already implies). |
| **FR-18** | "**Fourteen** evidence kinds ship in v1" | The number is asserted but thirteen of the fourteen are unnamed. The source `EvidenceKind` union has **ten** (`emf_swing, voice_capture, word_bank_hit, photo_anomaly, shadow_pass, footprint, tree_knock, sky_light, user_note, user_audio`). | Enumerate the fourteen kinds in the Glossary, or correct the count to the source's ten. As written this is unverifiable and will produce a "which four?" conversation mid-build. |
| **FR-21** | "…at or above the threshold… below the threshold" | No threshold values exist in the PRD or addendum (see §4c). | Name the numeric thresholds (they are tuning constants; they belong in the addendum's `§C.6` table). |
| **FR-22** | "the strongest-anomaly percentage and the activity level" | Undefined source of the scalar (§4a) and undefined whether "activity level" is a number or a band (§4c). | Define the derivation and freeze it in `case_reports`; define the activity level as a band. |
| **FR-24** | "Re-rendering the same card produces a byte-identical image" | Not achievable as written (§2a). | Narrow the device scope and add a settle protocol, or adopt the composed-PNG fallback. |
| **FR-27** | "Export produces a user-readable file" | No format specified. | Name the format (the source's evidence-export decision implies a JSON/CSV bundle with the entertainment notice embedded). |
| **FR-33** | Build fails if "**percentage used as a sensed readout on a tool surface**" appears | A grep lint cannot evaluate "used as a sensed readout." It is semantic. And `%` must be *allowed* on the Case Report, so the lint needs a file-scoped allowlist — which contradicts "the build fails if any banned term appears." | Split into (a) mechanically grep-able terms and (b) a file-scoped rule: `%` is banned in `src/features/tool/**` and permitted in `src/features/report/**`. Write it as two rules so it is provable by grep. |
| **FR-25** | "it never presents a number the user could verify against the world" | A count of the user's own cases *is* verifiable against their own memory. | Restate as "presents no number derived from outside the device." |

Two additional internal contradictions worth fixing while in here:

- **FR-25 vs FR-28.** FR-25's Phenomena segment shows "locked entries with their stated unlock requirements"; FR-28 says Clearance "never gates a tool, an Evidence kind, a Hunt, or an intensity level." A locked Phenomena entry is a Hunt gate by another name. With the paywall removed (A-1, R13), what unlocks them is unspecified.
- **Glossary drift.** PRD certainty bands are `AMBIGUOUS/SUGGESTIVE/COMPELLING`; the source `EvidenceStrength` is `faint/present/strong/unqualified`, with `confidence: Unit` as a separate internal scalar. The PRD declares its Glossary normative, which is fine — but the mapping must be written down or the first persistence layer built from the source types will diverge from the report copy.

---

## 6. Battery and performance claims

**Risk: MEDIUM-HIGH. Surfaces: MID (ladder already locked) and LATE (measurement is days 40–45).**

### 6a. The battery target does not exist, and the ladder is already locked without it

FR-5's NFR: "sensors are duty-cycled by ladder rather than run continuously." Addendum `§D.3`: "Duty-cycling is the battery strategy." The only measurement commitment is `T-6.3`: *"A 40-minute session in `session_low_power` costs under a stated battery budget on a mid-range Android (measured, and the number goes in `01-*`, not the UI)."* The PRD's OQ-2 confirms: *"The source contract leaves the low-power Session battery target as a number deferred… It needs a concrete target before the sampling ladder is locked, because the ladder's shape determines what the app can promise."*

**The ladder is locked (`§D.2`) and the target is absent.** So there is no way to validate FR-5's battery NFR, and the decision the target should have informed has already been made. This is not a contradiction so much as an ordering defect, and it is cheap to fix now, expensive after the ladder hardens.

### 6b. The rate ladder and the tick rate are consistent — good

`SENSOR_TICK_HZ = 6` (`§G.5`), `SensorRate ∈ {eco:2, ambient:6, focus:15}` (`§D.2`). The claim that sensors can run at 2 Hz "with the exact same game feel, which *is* the battery strategy" is internally consistent: the engine ticks on the digest, so sampling rate affects fidelity, not pacing. No contradiction here.

### 6c. Duty-cycling does not cover the dominant sink

The rate ladder governs **sensors**. It does not govern the **camera**, which is the largest battery consumer on any phone and runs at frame rate whenever the Camera or Sky tool is open. FR-15 and FR-17 make the Camera and Sky tools first-class, and the Bigfoot hunt is 15–40 minutes with the Camera tool live (FR-8). So a "sensors are duty-cycled" session that is actually camera-bound is presenting a battery story that does not describe the session the user is in. The low-power path (`session_low_power`) skips keep-awake and dims the screen (`§D.3`), which helps around the edges — but there is no specified camera duty-cycle or Camera-tool power cap, and `T-6.3`'s single battery measurement will either be taken with the camera closed (and be unrepresentative) or with it open (and fail). **Recommendation:** state the battery budget per tool-open configuration, not per session.

### 6d. "Offline-instant"

The addendum's "instant" comes from a real source claim: the report is "a single indexed row read with zero joins, which is what makes the share-deep-link cold launch instant" (`§I.6`), and the measurable target is "cold start to an interactive Home under 2 s" (`T-6.3`). "Instant" as prose is fine; the risk is that FR-7's unconditional launch-time content validation (§5) erodes the 2 s budget, and the PRD never states the 2 s number at all, so nothing downstream is accountable to it. Recommend carrying the 2 s cold-start target into the PRD's NFRs and gating FR-7's launch validation on the content-version check.

---

## 7. Summary table

| # | Finding | Severity | Surfaces | Fix cost |
|---|---|---|---|---|
| 1 | "MVP" in §6.1 is the source's day-45 v1; a 15-day scope-label collision; content authoring entirely unbudgeted | **HIGH** | early (planning), bites late | Reconciling labels + a content burndown |
| 2 | Share card "byte-identical" is unachievable via `captureRef`; source's real goal was perceptual; no settle protocol | **HIGH** | mid, on the critical path (Phase 2) | One sentence + a settle protocol, or the composed-PNG fallback |
| 3 | FR-1 headline "same Seed reproduces the same Session exactly" is false on live sensors; bucketing stabilizes level, not timing; golden-seed tests can't see the sensor boundary | **HIGH** | mid | Reword FR-1 to include the digest; state the quantizer is untested |
| 4 | Percentage: policy distinction is fine, but the "no number downstream of the hub" invariant and "hidden scalars are never announced" both acquire a carve-out; derivation unassigned; "activity level" undefined | **HIGH** | early–mid (Phase 2, built first) | One framing sentence, one persisted column, narrow the a11y rule |
| 5 | Untestable "testable" consequences (FR-2, FR-3, FR-7, FR-18, FR-21, FR-22, FR-24, FR-27, FR-33) | **MEDIUM-HIGH** | early | Per-FR rewording; enumerate 14 evidence kinds or correct to 10 |
| 6 | Battery target absent while the sampling ladder is already locked; duty-cycling doesn't cover the camera; 2 s cold-start target not carried into the PRD | **MEDIUM-HIGH** | mid + late | State the budget; scope it per tool configuration |
| 7 | Attribution ban silently removes the wordmark — the only in-image brand path in the growth loop | **MEDIUM** | early | Deliberate decision, recorded |
| 8 | iOS haptics are a no-op under camera/Low Power Mode; haptic-led archetypes have no fallback | **MEDIUM** | mid–late (week 4) | Add haptics to the fallback table |
| 9 | FR-25 "locked Phenomena entries" vs FR-28 "Clearance never gates a Hunt"; certainty-band vocabulary drift vs source types | **LOW** | early | Glossary fixes |

---

## 8. What must be settled before architecture locks

1. **FR-24's determinism claim** — restate to same-device + settled tree, or commit to the composed-PNG path. This is the one item with no schedule slack, because Phase 2 is deliberately first.
2. **The percentage's derivation and its persistence** — decide whether the report service re-derives from qualitative data (and freeze it in `case_reports`), and narrow the a11y rule to "live engine scalars."
3. **The 14 evidence kinds** — enumerate them or correct the count.
4. **FR-21's thresholds and FR-22's "activity level"** — numbers and type.
5. **§6.1's "MVP" label** — split day-30 vs day-45, and add content authoring to the plan.
6. **The battery target** — before the ladder is treated as final.

None of these block the architecture conceptually; all six block *estimation*, and five of them block it on the critical path. The engine design, the module boundaries, the replay key, the persistence rule ("if it can be recomputed from seed+content version+tick log, do not persist it"), the commit-on-find rule, and the just-in-time permission model are all sound and genuinely one-engineer-scale. The PRD's problem is not that the product cannot be built — it is that four of its requirements are written more strongly than the implementation can honestly deliver, and three of those land in the phase the plan itself calls make-or-break.
