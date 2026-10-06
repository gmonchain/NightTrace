# Content Plan — OQ-10

**Status: FINAL for the inventory; the estimate carries an explicit confidence note.** Resolves OQ-10.

The omission OQ-10 records is real and specific: the delivery plan's 49 tickets contain no line item for authored text or audio, and the PRD's own review put it in the reviewer gate as a HIGH finding. This plan states **what has to be authored**, **how much of it**, **what it costs**, and **where it gates the schedule** — which is the part that matters, because content is not a parallel workstream here. It is on the critical path in three places, and in one of them it gates a demo.

The engineering estimate does not change: shippable v1 stays at **day 40–45 for one senior engineer full time** (PRD A-10). Content adds **one explicit slot in that figure** rather than a new one — see *The estimate* below, which is the honest version of "it was never budgeted".

## Why this is not a parallel track

Three content dependencies block engineering work outright. Each is a hard gate, not a nicety:

| Gate | Blocks | Why it cannot be faked |
| --- | --- | --- |
| **T-1.5** — the four archetypes | Every engine ticket after it | An archetype is *driven by JSON parameters*. T-1.5's done-when requires four archetypes driven by content and no creature name in `engine/`. With no hunt JSON, T-1.5 cannot pass its own test. |
| **T-2.3** — `CaseReportService.build` | The hero screen, the share card, the whole growth loop | `statusRationale`, `headline` and every `CaseNarrativeBeat` are authored sentences. The report is the product's reason to exist and it is *entirely* copy. |
| **T-4.x + T-5.x** — the seven tools | Nothing structural, but all perceived quality | A tool that produces an unauthored caption is a tool that produces nothing to look at. |

**The first two land on the critical path inside week 2 and week 3** — the plan's own "make-or-break" and "money demo" weeks. So this is not "add a content contractor in week 5." A usable minimum of hunt JSON must exist by **day 11** and a usable minimum of report copy by **day 16**.

## What must be authored

### 1. Narrative and report copy — gates T-2.3 (day 16)

| Asset | Size | Note |
| --- | --- | --- |
| `headline` templates | ~30 | `"Nine minutes of nothing, then a knock."` — keyed on *what actually happened*, so the count is driven by the outcome space, not by flavour |
| `statusRationale` | ~12 | One authored sentence per status×dominant-cause. **Never a formula readout** — this is where a lazy implementation prints the thresholds |
| `CaseNarrativeBeat` bank | ~80 | The seven beat kinds: `conditions`, `silence`, `event`, `evidence`, `encounter`, `absence`, `turn`, `close`. Slot-filled from real session values |
| `negativeSpace` lines | ~24 | Six templates in `01` §F.9, each with variants. Gated by *the system was actually running* — a phone with no magnetometer must omit the EMF line |
| No-event outcome copy | 8 | Four outcomes × (rail line + report treatment). `FALSE_POSITIVE` is the only one whose line appears **only when the user says so** |
| Triage reason labels | 5 | Closed set, already drafted in `evidence-model.md` |
| Clearance rank names, badge names, field-note copy | ~40 lines | |

**Subtotal: ~200 authored strings.** This is the largest text block and the one with the most review exposure, because every line is subject to AD-16's claims lint and AD-27's misdescription review.

### 2. Hunt definitions — gates T-1.5 (day 11)

| Asset | Size | Note |
| --- | --- | --- |
| Four `HuntDefinition` JSON | 4 | Skeleton exists in `01` §J.1 |
| Four `CreatureDefinition` JSON | 4 | |
| Event tables | **~80 rows** | The source sketches roughly 20 rows per hunt (`01` §J.1–J.4). This is the real content-authoring cost of the engine and it is tuning data, not prose |
| Encounter tables | 4 | Per-archetype encounter selection and ambiguity tags |
| Alias declarations | 22 | Per `evidence-model.md` |
| Objectives | ~20 | Five per hunt, each with a label |

**Subtotal: 12 JSON files, ~100 authored data rows.** Cheaper than it looks in bodies, but it is the gate that blocks week 2, and the event tables' weights are *tuning* — they interact with FR-2's silence floors and the §C.6 targets, so they need a simulation pass rather than a single writing pass.

### 3. Word banks — the Spirit Box

| Asset | Size | Note |
| --- | --- | --- |
| Ambiguous word fragments | **48 authored + 48 recorded** | `01` §L.5 calls this "the single biggest audio investment and the correct one" — 1–4 syllables, dry, close-mic, room tone baked |
| Additional per-creature banks | 24 fragments each | **Post-MVP.** Only a content drop needs them |
| The **Directives Rule** constraint on every word | — | A directive is a **verb with no object**. A unit test greps the pool for creature and evidence nouns. `"Find the coldest wall."` is in the shipped pool and names a banned thermal idea — it should be caught by that test and is currently not, because *coldest* is not a creature or evidence noun |

**Subtotal: 48 fragments, recorded.** The recording is the cost, not the writing.

### 4. The Daily Anomaly set — recommended combinatorial, not 365

| Asset | Size | Note |
| --- | --- | --- |
| Anomaly **root lines** | **~60** | The recommendation, and the figure this plan commits to |
| Anomaly **qualifiers** | ~8 | Appended by a seeded draw: a direction, a time band, a condition |
| *(rejected)* hand-written daily lines | *365* | The literal reading of the gap, and OQ-8's shelf-life worry in its raw form |

OQ-8 asks whether a hand-written line per day survives a year of daily use. It does not: a user who opens the app every night exhausts a hand-written set in months, and the PRD's own reviewer gate already counted "365 anomaly lines" as unbudgeted.

**Recommendation: ~60 root lines composed with a seeded qualifier.** 60 × 8 is 480 distinct rendered lines from 68 authored strings — a sixth of the authoring, and no repeat within a year. It also fits the engine rather than fighting it: the Anomaly is *already* keyed to a seeded per-day draw and AD-19 already fixes it as *"one authored line drawn from a seeded set"*, so composing root + qualifier at the same draw site is the existing pattern, not a new mechanism.

**The constraint that decides it:** AD-19 says the Anomaly *"never produces a `SessionDirective` and never carries a guaranteed encounter."* Sixty lines that compose into four hundred is still **copy and nothing else** — the composition changes the string, never the simulation. A combinatorial set is safe here precisely because the Anomaly has no mechanical authority to compound.

**One risk the combinatorial approach carries:** the qualifier must not make the line *actionable*. `"A cold patch, to the north."` names a direction the user can walk — and the Directives Rule forbids naming a target or a direction. Qualifiers are therefore restricted to **conditions and time bands, never bearings**. That restriction is part of the recommendation, not a detail.

### 5. Audio — the largest single line item

The inventory is **already specified** in `01` §L.5 and **needs no authoring decision**, only funding. It is transcribed here so the plan carries a complete count:

| Category | Files | Format |
| --- | --- | --- |
| Ambience beds | 6 | m4a 96k mono, 30–60 s, loopable |
| Encounter stings | 8 | m4a 128k mono, 0.4–2.0 s |
| Radar / UI cues | 10 | wav 44.1k mono, 40–200 ms |
| Word fragments (Mimic / Ghost) | 48 | wav 44.1k mono, 0.3–0.9 s |
| Vocalizations (Bigfoot) | 6 | wav 44.1k mono, 1.8–3.2 s |
| Transmission bursts (Alien) | 4 | wav 44.1k mono, 2–4 s |
| Foley (Bigfoot / Shadow) | 12 | m4a 96k mono, 0.2–1.0 s |
| Haptic-adjacent tones | 3 | wav, 100 ms |

**97 files, ≈ 22 MB.** Routed through the Twelve sound categories in addendum §I.4.

**`silence` is one of the six ambience beds and is not a missing file** — a real 4 s of dithered near-silence. It is the Shadow Person hunt's **default** bed, so an empty slot in this table is a broken hunt, not a smaller download.

### 6. The rest of the asset budget

`01` §L.8 already fixes this at **~218 files / ≈ 35 MB**, and it is a constraint, not an estimate. Recorded for completeness — icons 49, silhouettes and glyphs 17, overlays 6, backgrounds 15, fonts 5, encounter sprites 29. **The one correction: the glyph set is 10, not 24** (see `evidence-model.md`).

The rule that keeps the sprite budget honest also keeps the *writing* budget honest, and it is worth restating because it governs every line in this plan: **no encounter asset shows a creature in focus, centred, or facing the lens.** The ambiguity guarantee is what makes 29 sprite files enough. The same discipline applies to copy — a caption that says what the user saw has broken the product.

## The estimate

**Stated as confidence bands, not points**, because a per-item hour count on creative work is false precision and the recipient should discount it accordingly.

| Block | Volume | Confidence | Shape of the cost |
| --- | --- | --- | --- |
| Narrative and report copy | ~200 strings | **Medium-high** | Writing is fast; **review is the cost.** Every line passes AD-16's lint and AD-27's by-hand pass, and the second has no automation |
| Hunt JSON and event tables | 12 files, ~100 rows | **Low** | The JSON is cheap. The **weights are tuning** against §C.6's targets and need simulation cycles |
| Word fragments | 48 recorded | **Medium** | Studio time, not writing time |
| Anomaly set | ~60 (recommended) or 365 | **Medium** | One sitting if combinatorial; a daily grind if literal |
| Audio | 97 files | **High** | Fully specified already. This is procurement |
| **Delivery plan slot** | **15–20 working days** | — | One writer with a review pass, overlapping weeks 2–5 |

**This does not move the day 40–45 ship date, and that is the point of stating it this way.** A-10's figure already includes a following 10–15 day window beyond day 30. Content fits inside that window **only if it starts in week 1**. Started in week 5, it adds its own duration to the end of the schedule, which is the failure OQ-10 predicts.

## The gates, restated as dates

| Day | Content must exist | Otherwise |
| --- | --- | --- |
| ~7 | Four placeholder hunt JSON files that validate | T-0.8's `validate:content` test has nothing to validate against |
| **11** | Four real hunt definitions + event tables | **T-1.5 cannot pass its done-when.** Week 2's demo is the hardest correctness claim in the product and it dies here |
| **16** | `statusRationale` + `headline` + first narrative beats | **T-2.3 has nothing to render.** Week 3's money demo — day 20, no tools built yet — dies here |
| 20 | Full narrative beat bank + negative-space lines | T-2.5's silence-beat rendering has no copy |
| 24 | Anomaly set | T-3.6 has an empty `anomalyText.json` |
| 26–30 | Ambience beds and stings | T-4.1's presenter boundary is provable without audio; the *feel* is not |

## What this plan does not decide

- **Who authors.** This is a scope and sequencing document, not a staffing one.
- **The thermal channel's fate.** Whether `thermal` is deleted from the schema's channel union is a schema change and is flagged in `evidence-model.md`, not decided here.
- **The Anomaly's final form** — the plan commits to the ~60-root combinatorial recommendation above and prices it, but the owner has not ratified it, and the *qualifier restriction* (conditions and time bands, never bearings) is part of what needs ratifying rather than a detail that can be dropped.

**Corrected this pass:** this section previously listed a "signature-slot cardinality conflict" as an open blocker. There is no such conflict — six `signature_slot` categories and a 7–9 position strip are different axes, and AD-8 says so outright. The real and much smaller gap is that no content field declares the strip's width. See `evidence-model.md`.

## Where this lands

This file is a **spec-authored companion** of `SPEC.md`. It closes OQ-10's "needs a content plan with its own estimate" and prices OQ-8's recommended resolution. The three gates above are the load-bearing part: a story author or a scheduler who reads only one section of this file should read that one.
