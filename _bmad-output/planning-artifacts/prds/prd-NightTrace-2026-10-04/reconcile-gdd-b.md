---
title: Reconciliation Audit — GDD sections J–P (INPUT lines 1300–end) vs PRD + Addendum
status: complete
created: 2026-10-04
scope: >
  INPUT = brainstorming/brainstorm-paranormal-cryptid-hunting-app-2026-10-04/01-product-and-game-design.md,
  lines 1300–2659 ONLY (§J First 4 hunts, §K UI spec, §L asset list, §N monetization,
  §O analytics, §P store-safety, closing). §N (monetization) is out of scope per instruction.
---

# Reconciliation Audit — GDD §J–§P against PRD + Addendum

## 0. Method and scope

- **INPUT** read: lines 1300–2659 of `01-product-and-game-design.md` (line numbers cited as `IN L####`).
- **PRD** and **ADDENDUM** read in full.
- Severity: **High** = a load-bearing product decision or a hard number that downstream tickets will get wrong; **Medium** = a mechanic, ritual, or copy rule with no FR/non-goal/addendum home; **Low** = visual spec, string, or edge case a later UX pass can recover from the INPUT.
- **Excluded from this audit, per instruction, and NOT counted as gaps:**
  - (a) the Case Report's retained percentages (PRD FR-22 override of INPUT's numeric ban) — knowingly kept;
  - (b) monetization / §N — deferred at the owner's instruction.
- **Excluded as already carried** (checked, not reported): the 40-row RISKY→SAFE table (§P.2 → addendum B.4); the §P.3 banned-words list (→ addendum B.2) and approved market terms (→ B.3); the three-layer disclaimer (→ B.5); voice rules incl. nine-word cap, "ghost" only in Hunt names, hedging vocabulary, and the two absence lines (→ addendum I.1); share-card footer/ratio/hard rules (→ addendum I.5); contrast, Dynamic Type, Reduce Motion, orientation, iPad (→ addendum H); seed composition and PRNG (→ addendum C.3); the five phases and the four state words (→ addendum C.8); rail buffer 2 000 and PII rules (→ addendum F); four archetypes, five verbs, seven tool surfaces, four Hunts, five clearance ranks, four intensities (→ PRD §3, §4.2, §4.4, FR-6, FR-10, FR-28).

---

## 1. Master gap table

### 1.1 Case Report (§K.14, IN 2000–2020) — FR-22

| INPUT item | PRD status | Evidence | Severity |
|---|---|---|---|
| Stat-row cells named `DURATION · EVIDENCE · ENCOUNTERS · SOURCES` | Carried (FR-22) | IN 2007 / PRD 422 | — |
| Status-seal visual: 200 px ring, 2 px `stamp` @50%, 4° rotation, scale 0.9→1.0 on first render | Absent | IN 2006 | Low |
| Status colours: `UNEXPLAINED` trace / `INCONCLUSIVE` inkDim / `EXPLAINED` amber | Absent (only palette in addendum I.2) | IN 2006, 2030 | Low |
| Signature strip: 24 px squares, `r1`, `s2` gap, filled = glyph in `trace`, empty = 1 px `line` | Absent (FR-19 gives slot count only) | IN 2008 | Low |
| Narrative account is a template bank **keyed on status × strongest channel**, never generated | Partly — FR-22 says "authored template bank"; the status×channel keying is dropped | IN 2009 | Low |
| Souvenirs reel: 140×140 cards, playable inline (1.4 s max), `+N` tile past 8 | Partly — FR-22 says "souvenir reel of captured media" | IN 2010 | Low |
| Negative-space header string `NOT RECORDED`, 2–4 caption lines, panel not rendered if empty | Partly — FR-22 keeps the omit-if-empty rule; the string is dropped | IN 2012 | Low |
| Actions: `SEAL & FILE` (hold 600 ms), `Share card`, `Review the evidence` (opens Triage), `Discard case` (destructive, two-step) | Partly — FR-22 keeps the seal hold; the triage and discard entry points are not named | IN 2015 | Low |
| Recovered convalescence: `RECOVERED` ribbon (`amber`, micro) across the masthead | Absent | IN 2017 | Low |
| Compile beat: 900 ms `deliberate` void, one `mono` line typed at 28 chars/s (`NT-017 · 07 evidence · 01 encounter`), slide-up `spring.sheet`, **no spinner** | Absent | IN 2017 | Medium |
| Long-press any block → `Share this block` via `captureRef` | Absent | IN 2020 | Low |
| Zero-evidence state renders in full as `INCONCLUSIVE` with one extra caption line | Carried (quote in PRD §1) | IN 2017 / PRD 39 | — |

### 1.2 Share Card (§K.15, IN 2022–2041) — FR-24

| INPUT item | PRD status | Evidence | Severity |
|---|---|---|---|
| 78% width, 9:16 default, 4:5 feed variant, `r4` container | Mostly carried (addendum I.5) | IN 2026 / Add I.5 | Low |
| Artefact block = 40% of card height; status ring 120 px `stamp`; stat row is 3 cells `EVIDENCE/ENCOUNTERS/SOURCES` | Partly — FR-24 names the blocks, not the metrics | IN 2027–2031 | Low |
| Field note: 1–2 lines, max **60 chars**, seeded from `rng.report` so re-sharing renders identically | Partly — FR-24 says "seeded field note"; the 60-char cap and `rng.report` seeding are dropped | IN 2032 | Low |
| **Note sheet:** tapping the field note opens 4 seeded radio options + `Write your own` (60-char input, no emoji picker, no suggestions), re-rendering the card live | **Absent** — the user-authored note path does not exist in the PRD | IN 2035 | Medium |
| Buttons `Share` / `Save to Photos` / `Back to the case` | Absent as named actions (FR-24 names share/save/cancel generically) | IN 2036 | Low |
| Media-library denied → `Save to Photos` **hides itself entirely** + caption `Sharing works without photo access.` | Absent | IN 2038 | Medium |
| Share sheet dismissed → nothing happens; no toast, no retry | Absent | IN 2038 | Low |
| The card is **never animated beyond its entry** — "it is a still image and must look like one" | Absent | IN 2039 | Low |
| Long-press the share-card footer opens the About screen | Absent | IN 2104 | Low |
| Hard rules: no watermark/QR/URL/"made with"/app-store badge; only branding = wordmark + case ref | Carried | IN 2041 / FR-24 | — |

### 1.3 Triage ritual (§F-15, IN 656–660) — FR-20

| INPUT item | PRD status | Evidence | Severity |
|---|---|---|---|
| Triage sheet: large detent, one item per card, 2 px progress hairline (`3 of 7`), three full-width verdict buttons (`Unexplained` trace / `Inconclusive` neutral / `Explained` dim + 40 px `strike`) | Absent (FR-20 keeps verdicts + "deliberate review") | IN 656 | Low |
| Reason picker strings: `A car` · `The building` · `My own movement` · `Equipment` · `Something else` | Partly — FR-20 paraphrases to "a vehicle, a building, the user's own movement, equipment, or other" | IN 656 / PRD 391 | Low |
| **Mechanic:** explained items are removed from the signature and *increase* `explainedRatio`; triaging everything `Unexplained` does **not** raise status — the user cannot brute-force a better ending | **Absent** — FR-21 says status derives from triage verdicts but never states the asymmetry | IN 658 | Medium |
| Badge `Nothing but the wind` (seal a case with ≥ 5 items, all explained) | Absent | IN 658 | Low |

### 1.4 Signature Archive (§K.16, IN 2048) — FR-19

| INPUT item | PRD status | Evidence | Severity |
|---|---|---|---|
| 4×2 grid, 88 px tiles; filled = glyph + micro name; `?` = seen-not-identified (`amber` @50%, `?` in title2); empty = `line` outline + `—` | Core carried (FR-19 describes filled/marked/empty); tile sizes and colours dropped | IN 2048 | Low |
| `?` tile tap sheet copy: `A signature you have recorded but not identified. It will match, or it will not.` and **no App Store link in this sheet** | Absent | IN 2052 | Medium |
| `?` tiles pulse `amber` at 0.5 Hz — "the single 'unfinished' animation in the product, and the strongest return hook" | Absent | IN 2059 | Medium |
| Signature glyph set = 9 abstract marks (wave, fork, spiral), **never a picture of a creature** | Absent | IN 2166 | Low |

### 1.5 Daily Anomaly (§K.3, IN 1824) — FR-30

| INPUT item | PRD status | Evidence | Severity |
|---|---|---|---|
| Card spec: 96 px `surface1`, 3 px `cyan` left accent bar, kicker `TONIGHT`, title `title3`, trailing 24 px chevron | Absent | IN 1824 | Low |
| Meta line `local · rotates at midnight`; rotation on the local `dayKey` | Absent (FR-30/OQ-8 say "daily"; no midnight boundary) | IN 1824, 395 | Medium |
| Example title `A low, steady pressure.` | Absent (PRD says authored seeded set) | IN 1824 | Low |
| Anomaly card → medium sheet (title, 2 lines of fiction, `Investigate this` → `/investigate?anomaly=…`) | Absent | IN 1829 | Low |
| Accent bar pulses opacity 0.6→1.0 over 4 s | Absent | IN 1831 | Low |

### 1.6 Intensity levels (§K.18, IN 2076–2089) — FR-10

| INPUT item | PRD status | Evidence | Severity |
|---|---|---|---|
| Four levels, names, one-line descriptions, `Present` default | Carried — exact | IN 2082–2086 / PRD 269 | — |
| Footer `Intensity is fixed during a case.` | Carried | IN 2087 / PRD 270 | — |
| Per-level `micro` expectation row: `Signals: sparse · Encounters: possible · Content: none` | **Absent** — this row is the only place content gating per level is stated | IN 2086 | Medium |
| Locked-during-session copy: `Changing this mid-investigation would mean steering what you find. A case is only worth something if you didn't.` | Paraphrased only | IN 2089 | Low |

### 1.7 Clearance / progression (§F-20, IN 711–722) — FR-28/FR-29

| INPUT item | PRD status | Evidence | Severity |
|---|---|---|---|
| 5 ranks, names; advancement = casesSealed + distinctPhenomenaDocumented + signaturesMatched; never time/events; cosmetic gating only | Carried — exact | IN 716–718 / PRD 513–515 | — |
| Advancement shown as a **stamped endorsement** (a second ring impression on the report seal, `impactAsync(Heavy)`), **never a progress bar** | **Absent** | IN 716 | Medium |
| Chip copy: `FIELD ASSISTANT` → `FIELD ASSISTANT · 01` … | Absent (names only) | IN 446, 1823 | Low |
| All ranks reached → chip `ARCHIVIST`, sheet shows the next content drop's requirement **as a date, not a number** | Absent | IN 721 | Low |
| Streak broken → no penalty, no notification | Carried (FR-29) | IN 721 / PRD 522 | — |

### 1.8 Evidence kinds (§L.4, IN 2186–2205) — FR-18

| INPUT item | PRD status | Evidence | Severity |
|---|---|---|---|
| Count = 14 kinds ship in MVP | Carried — FR-18 says fourteen | IN 2205 / PRD 372 | — (see C-note below) |
| **The enumeration itself** — `emf_stir`, `emf_surge`, `unknown_voice`, `evp_segment`, `shadow`, `cold_spot`, `camera_distortion`, `visual_encounter`, `transmission`, `peripheral_event`, `null_reading`, `interference`, `footprint`, `broken_trail`, `vocalization`, `movement`, `silhouette`, `proximity_spike`, `unknown_signal`, `sky_object`, `electromagnetic_anomaly`, `bearing_lock`, `magnetic_disturbance` | **Absent** — the PRD never names a single evidence kind | IN 2190–2203 | **Medium** |
| Per-Hunt `evidenceTypes` (six each, IN 1393/1464/1539/1625) | Absent | IN 1393 etc. | Medium |
| Glyph ideas and the rule that glyphs read at 20 px in one accent colour | Absent | IN 2188 | Low |

> **Self-inconsistency inside the INPUT (not a PRD fault):** §L.4 tabulates 22 glyphs (excluding Mothman's `wing_sound`) yet states "14 types ship in MVP"; the four §J `evidenceTypes` unions total ~20; `motion` appears only in Shadow Person. The PRD's "fourteen" inherits this ambiguity. Flagged so downstream does not treat 14 as verified.

### 1.9 Analytics event schema (§O.1–O.4, IN 2400–2509) — PRD §6.2, addendum F

| INPUT item | PRD status | Evidence | Severity |
|---|---|---|---|
| 56 typed events with enumerated, low-cardinality, schema-validated props | Deferred to six (PRD §6.2, A-6); addendum F.2 says "defines 56" but lists only five, with **different property names than the INPUT** | IN 2435–2496 / Add F.2 | Medium |
| Dev-mode assertion: prop string > 24 chars, space-and-capital pattern, or coordinate regex fails the build | Carried (addendum F.3) | IN 2433 | — |
| Headline events: `hunt_started`, `hunt_completed`, `evidence_found`, `encounter_triggered`, `report_shared`, `paywall_viewed`, `subscription_started` | Addendum F.1 lists six (drops `subscription_started`, which cannot fire on a free MVP) | IN 2496 / Add F.1 | Low |
| Typed props for the six core events (e.g. `hunt_started{hunt_id, archetype, intensity, duration_pref, has_fixed_location, has_mic, has_camera, has_magnetometer, legendary_flag, first_run, seed_hash}`; `hunt_completed{… explained_ratio, signature_slots_filled, signature_matched, silence_longest_ms, null_reading_count}`) | Absent / contradicted — addendum F.2 gives `evidence_found{kind, channel, strength, withMedia}` where the INPUT has `evidence_type, certainty_band, channel, tool, at_ms, phase, source, null_reading` | IN 2450, 2459, 2470 / Add F.2 | Medium |
| Ring buffer: most recent 2 000 rows, pruned on write | Carried (addendum E.5) | IN 2409 | — |
| **Metric targets derived from events:** `directive_followed / directive_shown` = 30–55%; `report_shared / hunt_completed` ≥ 25%; paywall ≤ 2 presentations / 7 days; "no tool < 5% share" | Absent from PRD SMs (see contradiction C2) | IN 2502–2509 | Medium |
| Never collected: coordinates, raw sensor streams, case names/notes, which word fragments were heard, photos/audio, device model + OS string, uninstall-surviving identifiers | Carried (addendum F, O.5) | IN 2511–2521 | — |

### 1.10 Store positioning (§P.4–P.6, IN 2584–2637) — FR-32/FR-33

| INPUT item | PRD status | Evidence | Severity |
|---|---|---|---|
| Category Entertainment; rating 12+/Teen; name + subtitle | Carried | IN 2594 / PRD 592 | — |
| **Store-listing copy, written to spec** (headline "Investigate your own place, and leave with a case file.", the "Some nights you will find something. Most nights you will not. Both are the point." close) | **Absent** — addendum B.5 records the disclaimer layer only | IN 2609–2635 | Medium |
| Listing feature bullets (seven instruments · long silences · a report for every night · a field journal · four deep phenomena · works offline) | Absent | IN 2624–2629 | Low |
| ASO rules: title slot = brand + `Paranormal Field Journal`; screenshots must lead Case Report → share card → radar → journal; **no screenshot may depict a number, percentage, or distance**; first-screenshot caption `Every night becomes a case file.` | Absent | IN 2637 | Medium |
| Exact iOS purpose strings (`NSMicrophoneUsageDescription`, `NSMotionUsageDescription`, `NSLocationWhenInUseUsageDescription`) | Absent | IN 2602 | Low |
| §P.5 hazard table, 9 rows (fake-science rejection, health claims, permission misuse, data-label mismatch, UGC policy, scare complaints, review-notes clarity, ASO keyword taint) | Absent — the closure mechanics (e.g. "reviewer in a bright office must reach About in two taps"; three mandatory scare mitigations; privacy label "Data Not Collected") have no home | IN 2598–2607 | Medium |
| Release-gate lint scope: greps `src/**/*.tsx?`, `app.json`, and store metadata, with a whitelist for `evidence` as a noun and the About screen's own text | Partly — FR-33 says "build fails on a banned term"; scope and whitelist absent | IN 2600 | Low |
| §P.2 in-app copy strings: `Readings are inferred. They are not a measurement.` (row 6); `Bands are theatre. Nothing here is received.` (row 19); `Nothing here is proof.` repeated on About (row 27) | Addendum keeps rows 6/19 in shortened form; row 27's About repetition is dropped | IN 2544–2565 | Low |
| Closing: the three product-test questions and their design-law mapping; "one sentence to build against" | Absent | IN 2641–2656 | Low |

### 1.11 Per-Hunt / engine detail in range (§J, IN 1346–1689) — FR-6/FR-8

| INPUT item | PRD status | Evidence | Severity |
|---|---|---|---|
| Comparative matrix: archetype, verb, environment, pace, channel, toolset, unique fail, signature evidence, senses used, session length, share artefact, unlock, free tier | Mostly carried (FR-6/FR-8 + §6); "senses used" and "share artefact" dropped | IN 1352–1366 | Low |
| Full `HuntDefinition` JSON: objectives with exact labels, `completion{autoCloseMin, minDurationMs}`, `conditionsPreference`, `reportTheme`, `intensityProfile` values | Partly — FR-8 carries tools/length/verbs; the objectives, autoClose/minDuration, conditions and theme values are dropped | IN 1372–1631 | Medium |
| **Observer inversion formula** — noticing accrues via `0.0022·torch + 0.0016·camera + 0.0030·clamp01(movedMetres/2) + 0.0010·screenBright − 0.0018·stillness`, `noticing ≥ 1.0 → NOTICED` | **Absent** — the defining mechanic of Shadow Person has no FR | IN 1553–1561 | Medium |
| "The app never tells the user this. They discover it." — plus the single honest hint (after the first `shadow` evidence, the directive pool switches to the stillness-biased set `Hold still and listen.` / `Set the phone down and step back.`) | Absent | IN 1561–1563 | Medium |
| Bigfoot **posture gating** — the encounter can only be *rendered* if the camera is live at resolution time | Absent | IN 1479 | Medium |
| Bigfoot `GONE` should fire in 30–40% of cases | Absent | IN 1477 | Low |
| Alien **transmission separation rule** — words are never used for the Alien; it speaks in intervals; hard rule for all future content | Absent | IN 1640 | Medium |
| Sky alignment tolerance = 45° | Absent (FR-17 leaves "alignment tolerance" undefined) | IN 1636 | Low |
| Mothman proof-of-pipeline + `verbOverride` contract ("if shipping Mothman requires touching `engine/`, the archetype model has failed") | Partly (addendum A.3 rejects "Unknown Creature Hunt"; PRD §6.2 defers Mothman); the `verbOverride`/zero-engine-diff test is dropped | IN 1674–1689 | Low |
| Encounter aftermath lines (`It said something.` · `Movement. NE.` · `The record changed.` · `Something on the ridge.` · `Eyes. Maybe.` · `It went behind you.`) and per-encounter durations/ambiguity tags | Absent | IN 1428–1666 | Medium |

### 1.12 Qualitative / tonal material the FR list drops

| INPUT item | PRD status | Evidence | Severity |
|---|---|---|---|
| **Colour discipline (binding):** `danger` never in a session except a destructive confirm; `glitch` ≤ 4×/session and only Shadow Person or `Ritual`; static text is never `trace`; every camera overlay keeps mean luminance within ±15% | Absent — colour appears only as palette in addendum I.2, without the binding rules | IN 1719 | Medium |
| **There is no light mode.** "a paranormal field tool that flashes white at 11pm is a broken product" | Absent | IN 1695 | Medium |
| **There are no spinners anywhere**; `<LoadBeat>` types at 28 chars/s; `<SkeletonRow>` shimmer instead | Absent | IN 1794 | Medium |
| Haptic vocabulary: 9 named tokens + global rule "one haptic per 800 ms maximum" except `escalate` (≤ 3 s); "a haptic is never the only carrier" | Addendum I.4 carries vague prose only — no tokens, no 800 ms rule | IN 1763–1775 | Medium |
| Onboarding exact copy, all four screens (kicker/headline/body/action) | Absent — FR-32 describes themes, not strings | IN 1805–1808 | Medium |
| About & entertainment notice, full six-section text + the rule it must be readable in < 90 s and is copy-reviewed against §P | Addendum B.5 summarizes headers + the `WHAT WE NEVER DO` bullets only | IN 2107–2114 | Medium |
| Empty-state copy set: Home `Nothing on file yet.`; Radar `Nothing on the rose.`; Tracker `No contact.`; Brief `Hold still. Establishing a quiet baseline.`; session `Paused. Time is not passing.`; phase hairline long-press `The record tends to move through five stages.`; EMF `No magnetic sensor here — readings are inferred.`; Voice `Bands are theatre. Nothing here is received.`; EVP `Storage is low — keeping shorter segments.` / `Could not save that segment.`; Camera `No camera access — rewinding to the dark-room view.` | Absent as a set (two survive inside addendum B.4 rows 6/19) | IN 1827–2048 | Medium |
| Journal per-segment empty states, each with exactly one action (`Your record starts with one night.` → `Begin a case`; `Four phenomena on file. None documented yet.` → `Open the field guide`; `Nothing kept yet.`; `No cases sealed.`) | Absent | IN 2053–2057 | Medium |
| Interaction invariants: "the shell never renders a number that is not elapsed time or a count"; "the shell never names a creature"; pull-to-refresh deliberately not implemented; pinch-to-zoom not implemented | Partly (FR-15 keeps pinch-to-zoom); the rest absent | IN 1889, 1829 | Low |
| Haptic-anatomy rules: no haptic on phase transitions ("the user must not be able to feel the machine's gears"); no haptic on a Voice response; `tickLight` on an upward band change only | Absent | IN 1888, 1933, 1902 | Low |
| Report intents: "a report is a document, not a dashboard"; everything static after entry | Absent | IN 2018 | Low |
| Asset discipline: sprites 2–4 frames black-matte; the creature is never in focus / centred / facing the lens; 35 MB budget; ~218 files | Absent (some in addendum G.6 as build scope, not as art rules) | IN 2134–2269 | Low |

---

## 2. Contradictions — exact INPUT vs PRD numbers and names, with no `[OVERRIDE]`

| # | Item | INPUT | PRD | Tag | Severity |
|---|---|---|---|---|---|
| **C1** | **Session-entry hold duration** | `HOLD TO ENTER THE FIELD`, `<HoldButton durationMs={800}>` (IN 1868) | FR-9: "Entering a Session requires a sustained hold of roughly **600 ms**" (PRD 261) | none | **Medium** |
| **C2** | **Share rate target** | §O.4 `report_shared / hunt_completed`, healthy **≥ 25%** (IN 2504) | SM-1: "**Target: ≥ 20%** … the product's single deciding number" (PRD 659) | none | **High** |
| **C3** | **Failure-state set** | 8 distinct names: `MISDIRECTED`, `GONE`, `NOTICED`, `CORNERED`, `INTERFERENCE`, `NOT_ALIGNED`, **`QUIET_NIGHT`**, **`UNCHARTED`** (IN 1360, 1395, 1466, 1541, 1627, 2464) | §3 Glossary lists 6: `MISDIRECTED`, `GONE`, `NOTICED`, `CORNERED`, `INTERFERENCE`, `NOT_ALIGNED` (PRD 111) | none | Medium |
| **C4** | **Analytics event properties** | `evidence_found{evidence_type, certainty_band, channel, tool, at_ms, phase, source, null_reading}`; `hunt_started{…11 props}`; `hunt_completed{…9 props}` (IN 2450–2470) | Addendum F.2: `evidence_found{kind, channel, strength, withMedia}`; `hunt_started{huntId, intensity, lowPower, charted}` etc. (Add 383–387) | none | Medium |
| **C5** | **Report seal entry haptic timing** | Status seal scales in over `d.base` then `tickHeavy` + `confirm` at **+120 ms** (IN 2006) | FR-22 silent; addendum I.4 generic | none | Low |

### 2.1 Counts and names that DO NOT contradict (checked explicitly)

| Dimension | INPUT | PRD | Verdict |
|---|---|---|---|
| Intensity levels | 4 — `Ambient`, `Present`, `Intense`, `Ritual` | 4 — same names, same one-line descriptions, `Present` default (FR-10) | **Match** |
| Clearance ranks | 5 — `FIELD ASSISTANT`, `FIELD ASSISTANT II`, `CASE OFFICER`, `SENIOR CASE OFFICER`, `ARCHIVIST` | 5 — identical (FR-28) | **Match** |
| Evidence kind count | 14 ship in MVP | 14 (FR-18) | **Match** (though the 14 are unnamed in both — see 1.8) |
| Session phases | 5 — `QUIET`, `SIGNALS`, `ACTIVITY`, `ENCOUNTER_WINDOW`, `RESOLUTION` | 5 — identical; 4 visible state words identical | **Match** |
| Statuses | `UNEXPLAINED`, `INCONCLUSIVE`, `EXPLAINED` (+ per-item `UNREVIEWED`) | identical (FR-21, FR-20) | **Match** |
| Proximity bands | `COLD`, `WARM`, `CLOSE`, `NEAR`, `HERE`; log at ≥ `CLOSE` | identical (FR-16) | **Match** |
| Second-run encounter band | 42–58% (IN 1337) | 42–58% (SM-4) | **Match** |
| Voice 300 ms silence / 2.4 s hold | 300 ms / 2.4 s (IN 1927) | identical (FR-13) | **Match** |
| Tracker/EMF/Camera state chips | `CHARTED/UNCHARTED/APPROXIMATE`, `STILL/DRIFT/STIR/INTERFERENCE/INFERRED`, `RELATIVE` | named in FR-11/FR-12/FR-16 | **Match** |

### 2.2 Status-derivation thresholds — the exact INPUT formula, absent from the PRD

INPUT §F-17 (IN 673), quoted exactly:

> `UNEXPLAINED` if `signatureConvergence ≥ 0.6 && encounters ≥ 1 && explainedRatio < 0.34`;
> `EXPLAINED` if `explainedRatio ≥ 0.6`;
> else `INCONCLUSIVE`.

PRD FR-21 states only: "`UNEXPLAINED` requires signature convergence **at or above the threshold**, at least one Encounter, and an explained ratio **below the threshold**. `EXPLAINED` requires an explained ratio **at or above its threshold**." **No threshold value survives anywhere in the PRD or addendum.** The input's `0.6 / 0.34 / 0.6` triple is the only place these numbers exist. Severity: **High** — this is the formula that decides the hero screen's verdict, and two independent implementers will pick different constants.

---

## 3. Conflict-ruling tables in range

Three table-like ruling artefacts exist in the read range; only the first is a "risky wording → ruling" table:

1. **§P.2 RISKY → SAFE table, 40 rows** (IN 2533–2578). **Carried** in addendum B.4. Two caveats where the addendum *dilutes a ruling*:
   - Rows 13, 17, 19, 24, 26, 32, 36 have their `✓ SAFE` column **blanked** in the addendum. The INPUT's rulings for those rows are: 13 → `Possible match —` (em dash, deliberately empty) or `Signature: PARTIAL`; 17 → `The record is unclear here.`; 19 → `Voice tool` + in-app `Bands are theatre. Nothing here is received.`; 24 → **Delete**; 26 → the approved keyword set; 32 → **Deleted**; 36 → **Delete**. (Severity: Low–Medium.)
   - Row 9 is the knowingly-overridden row (percentages on the Case Report) — documented in addendum B.6 and excluded per instruction.
2. **§P.4 three-layer disclaimer** (IN 2584–2594) → addendum B.5. Carried; the per-layer exact copy strings are shortened.
3. **§P.5 hazard table, 9 rows** (IN 2598–2607) → **not carried anywhere**. Each hazard's closure is a product requirement (e.g. "a reviewer testing the app in a bright office must be able to reach the About screen in two taps from launch"; privacy label must declare Data Not Collected; the UGC policy non-trigger statement must appear in review notes). Severity: **Medium**.

No other conflict-ruling table appears in lines 1300–2659.

---

## 4. Prose — what the shape of this material tells us

**The PRD is a behavioural document; the INPUT range is a specification of *surfaces*.** Roughly 80% of what this range contains is not behaviour at all — it is the exact strings, colours, haptics, timings, tile sizes, and copy rules that make the app feel like a field instrument rather than a list of features. A structured FR list legitimately drops most of that, and the PRD says so (§0: implementation detail lives in the addendum, and `bmad-ux` is downstream). The audit's job is therefore not to demand every tile size back into the PRD — it is to separate three things:

1. **Genuine product decisions hiding inside UI spec.** These deserve a home somewhere even if not the PRD: the Share Card **user-authored note sheet** (a writer, not a viewer, decision); the media-denied rule (`Save to Photos` disappears rather than greys out — a trust decision); the `?`-tile pulse as *the* return hook; the Triage **anti-brute-force asymmetry** (explained items raise the ratio; unmarked items cannot manufacture an `UNEXPLAINED`); Bigfoot **posture gating**; the Alien **words-never rule**; the Shadow Person **noticing formula and its deliberate non-teaching**. Each of these changes what the product *is*, and none has an FR, a non-goal, or an addendum line.

2. **Binding tonal/systems rules that a builder will violate by default.** "No light mode." "No spinners anywhere." "One haptic per 800 ms." "Danger never appears in a session." "Max nine words on an in-session line." "A report is a document, not a dashboard." "The card is a still image." These are the rules that keep the product coherent across a dozen screens; today they exist only in the INPUT, and the addendum's tone section (I) captures the voice rules but almost none of the systems rules.

3. **Exact copy and thresholds that are load-bearing.** Three stand out. The **status-derivation triple (`≥0.6 / <0.34 / ≥0.6`)** is the mechanical definition of the hero screen's verdict and is stated nowhere in the PRD. The **share-rate target** is the product's "single deciding number" and the PRD silently publishes 20% where the INPUT says 25% — no `[OVERRIDE]`, so downstream has no way to know which is authoritative. The **session-entry hold** is 800 ms in the INPUT and "roughly 600 ms" in FR-9, which looks like the report-seal hold (correctly 600 ms) bleeding into the Brief.

**Highest-value repairs, in order:** (1) resolve the 25% vs 20% share-rate discrepancy and tag it; (2) put the status-derivation thresholds and the Triage asymmetry into FR-21; (3) add the Shadow Person noticing formula, Bigfoot posture gating, and the Alien words-never rule to FR-6/FR-8; (4) give the dropped-but-decided Share Card note sheet, media-denial rule, and `?`-tile return hook an FR or an explicit non-goal; (5) capture the binding systems/tonal rules (no light mode, no spinners, haptic budget, colour discipline, nine-word cap is already in addendum I) in one addendum section so they survive contact with implementation; (6) correct FR-9's hold to 800 ms; (7) reconcile failure-state names (add `QUIET_NIGHT`, `UNCHARTED`) and the addendum F.2 property names against the INPUT's actual schemas.

---

## 5. Coverage note — what this range contains that IS carried

For completeness, and so this audit is not read as a list of absences: the four Hunts and their archetypes/verbs/environments/pacing/channels/failure states/tool sets/length bands (FR-6, FR-8); the seven tool surfaces with their verbs, states, empty states and fallbacks (FR-11–FR-17); the four intensity levels verbatim (FR-10); the five clearance ranks and their advancement rule (FR-28); the whole Claims Boundary — banned words, approved terms, three-layer disclaimer, name/category/rating (FR-33, addendum B); the seed/PRNG architecture (addendum C.3); the five phases and state words (addendum C.8); the analytics privacy model (addendum F, §O.1); the share-card hard exclusions (FR-24, addendum I.5); accessibility (addendum H); the RLE digest, SQLite schema, testing and build order (addendum C/E/G). The gap is not that the PRD ignored this range — it is that the range's *decisions inside presentation spec*, its *exact numbers*, and its *binding tonal rules* fell through the extract boundary.
