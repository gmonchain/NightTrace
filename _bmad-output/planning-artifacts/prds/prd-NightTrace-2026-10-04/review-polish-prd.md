# Review — `prd.md` (NightTrace PRD v1)

**Lenses:** `structure`, then `prose` on top of structure.
**Reader calibrated for:** humans (default) / style guide: Microsoft Writing Style Guide.
**Structure model applied:** Strategic/Context (Pyramid) — a PRD is top-down, grouped, MECE, evidence-supporting.
**Document:** `prd.md` — 16,128 words before, 16,130 after (net +2; edits were wording-level, not scope-level).

> **This document exists to help** the builder, joining designers/engineers, and the downstream `bmad-ux` / `bmad-architecture` / `bmad-create-epics-and-stories` workflows turn NightTrace v1 into a buildable, honest, shareable product — with FR numbering and a normative Glossary stable enough for tickets to cite.

**Standing constraints honored:** every tag (`[OVERRIDE]`, `[OVERRIDE — RATIFIED THEN REVERSED]`, `[ASSUMPTION]`, `[NOTE FOR PM]`, `[NON-GOAL for MVP]`, `[CLOSED — 2026-10-04]`, `[RESOLVED …]`, `[RETIRED]`, `[BLOCKING …]`), every FR-N/UJ-N/SM-N/OQ-N/A-N id and its order, every cross-reference, the §10 conflict table, and the `01`/`02` citation style were left intact. Content is sacrosanct; only organization and expression were touched, and every change was applied directly to the file.

---

## Structure pass

The document's shape is sound for its purpose: Pyramid top-down works (Vision → Users → Glossary → Features → Non-Goals → Scope → Metrics → Open Questions → Assumptions → Conflicts), FR numbering is global and contiguous (1–39), and the Glossary is correctly front-loaded before the features that consume it. The pass found **no section that should be cut, merged, or moved wholesale** — the audit-trail verbosity in §8/§9 and the `[NOTE FOR PM]` blocks is functional scaffolding, not bloat.

| Pass | Original Text | Revised Text | Changes |
|---|---|---|---|
| structure | §4.5 `4.5` Description (~72 words) — "Triage is what converts a pile of **readings** into a conclusion the user reached rather than one the app announced." | Replaced "readings" with "Evidence" | **QUESTION/terminology.** Glossary's unit for this noun is **Evidence**; "readings" is a synonym and is also the word the product bans as a *measurement* framing. One word, no length change. |
| structure | §4.5 FR-34 Rationale — "without contested items, triage is a review of **readings**; with them, triage is an act of judgment." | "…a review of **Evidence**; …" | Same synonym drift as above, second occurrence. Consolidated into the terminology sweep rather than a second row. |
| structure | §4.7 FR-24 (~572 words) — the single longest FR. | **PRESERVE.** | It is long because it carries three closed OQ-14 decisions plus the lint-immunity reasoning for the one surface a banned-word list cannot reach. Cutting it would move load-bearing rationale, not trim fat. |
| structure | §8 Open Questions (~1,488 words) / §9 Assumptions (~842 words) | **PRESERVE.** | Largest sections, but they are the audit trail the brief explicitly protects; grouping is MECE (each OQ closed by a `[CLOSED …]` tag or stated as needing a decision, each A-N cross-referenced). |
| structure | §6.1 In Scope (~348 words) | **PRESERVE.** | Correctly placed *after* Non-Goals and *before* Success Metrics; the scope-honesty preamble prevents the day-30 under-plan. |

**Structural verdict:** No content belongs in `addendum.md` that isn't already deferred there (§0 already routes module layout / SQLite schema / package versions / test strategy to the addendum, and §4.8 A-9 / §4.7's byte-identity detail is *by design* referenced to the addendum's card rules). No reader-backtrack ordering problem found. This lens found **0 cut/merge/move dispositions**; the two findings above are terminology, applied under the prose pass.

---

## Prose pass

| Pass | Original Text | Revised Text | Changes |
|---|---|---|---|
| prose | FR-4 (~line 197): "…with elapsed time, user movement, sensor anomalies, and **Events**, and drives pacing…" | "…and **emissions**, and drives pacing…" | **Glossary violation (highest value).** `Event` is not a Glossary term; the engine's unit of output is an **Emission** (§3 Emission), and elsewhere the doc consistently says "events" only for *analytics* events. Fixed to the Glossary term. |
| prose | §6.1 (~line 749): "…watermark-free, **byte-identical** on re-render…" | "…**perceptually identical** on re-render…" | **Contradiction with FR-24/A-9.** A-9 and the addendum both state byte identity is not achievable and not required; §6.1 asserted the opposite. Since the banned-word lint keys off shipped strings, an unqualified "byte-identical" here is a defect. Fixed to the ratified condition. |
| prose | FR-23 (~line 549): entertainment line **"An investigation experience. Nothing here is a measurement."** | **"An investigation experience. Not a measurement."** | **Duplicated statement, two variants.** The line is quoted three times; FR-24, UJ-2, and the addendum's rulings table all fix the wording as "Not a measurement." FR-23 was the odd one out. Fixed so the string is stated once, identically. |
| prose | UJ-1 Resolution (~line 86): "Her **clearance** has not moved — it advances on sealed **cases** and documented **phenomena**…" | "Her **Clearance** has not moved — it advances on sealed **Cases** and documented **Phenomena**…" | Glossary capitalization: Clearance, Case, Phenomenon are Glossary terms; the surrounding prose uses them capitalized. Also fixed the same clause's "the anomaly of the next night" → "the Anomaly". |
| prose | §6.2 (~line 771): "The source contract defines twenty; the brief named **six**." | "…the brief named **seven**." | **Arithmetic/consistency.** §9 A-6 lists seven brief-named events, and the bullet's own heading says "beyond the six core events" only because two of the seven are purchase events. Count corrected to the sourced seven. |
| prose | FR-18 (~line 450): "…the system commits each item **when it is found** rather than at session end." | "…commits each item **at the moment of capture**…" | **Untestable requirement.** "When it is found" has no testable condition; "at the moment of capture" is the testable form already used in FR-18's own consequences line ("written to durable storage at the moment of capture"). |
| prose | FR-29 (~line 641): "The system can display streaks and award case stamps **without pressuring the user**." | "…and **never penalizes a missed night**." | **Untestable / hedged requirement.** "Without pressuring" is unfalsifiable; "never penalizes a missed night" is the testable condition FR-29 already spells out in its own consequences. |
| prose | FR-31 (~line 684): "A Field Note runs for **approximately** three minutes…" | "…for **roughly** three minutes…" | Hedging-variant drift: the Glossary defines Field Note as "roughly three-minute" and §4.11 uses "roughly." One adverb for one concept. |
| prose | UJ-2 (~line 93) + FR-24 heading (~line 561) + §6 (~line 739): "**Share card**" / "a **share card**" | "**Share Card**" | Glossary term is **Share Card**. UJ-2, the FR-24 heading, and the MVP-scope bullet used lowercase "card," inconsistent with the other 15+ capitalized uses. |
| prose | Glossary Session (~line 120) + FR-22 footer (~line 535): "A Session has a **seed**…" / "the **seed** reference" | "…a **Seed**…" / "the **Seed** reference" | Glossary term is **Seed**. Two lowercase slips; the rest of the doc capitalizes it. |
| prose | US/UK spelling split across the doc: `defence`×2, `labelled`×3, `labelling`, `centred`/`centre`×7, `travelled`, `cancelled`, `signalled`, `emphasises`/`emphasise`, `localisation`×3, `favour`×2, `behaviour`×4, `organised`, `apologise`, `judgement`×3 | US forms throughout (`defense`, `labeled`, `centered`, `traveled`, `canceled`, `signaled`, `emphasizes`, `localization`, `favor`, `behavior`, `organized`, `apologize`, `judgment`) | **Inconsistent terminology.** The document's baseline is US English (`artifact`, `behavior`, `organization`) but carried a UK-spelling subset. Normalized in one batch (17 replacements) plus the trailing `unlabeled` / `favorable` fixes. |

**Prose verdict:** 12 distinct prose findings, all applied. No passive voice hid an actor in a way that altered a requirement (the passives found — "is written", "is presented", "is stored" — point at the system or the app and are correct for a spec). No further typos found beyond the spelling-normalization set.

---

## Deliberately left alone

| Item | Reason |
|---|---|
| `[NOTE FOR PM]` blocks and A-2's tombstone (§9) | Explicitly protected audit trail; verbosity is the record of reasoning and rejected framings. |
| FR-24's ~572-word length, §8's ~1,488 words, §9's ~842 words | PRESERVE per structure lens — longest sections are the load-bearing rationale the brief protects. |
| SM-1's "≥ 25%" vs the addendum's "≥ 20%" | **Flagged, not changed.** `reconcile-product-game-design.md` notes the source target is ≥ 25% and calls a 20% value a *lowering*; the PRD body and summary both say 25%, and only addendum §F.4 says 20%. Looks like a stale addendum figure, but the brief scopes this review to `prd.md` and forbids altering numbers/content — surfaced here for the PM. |
| FR-37's "through?" spacing, "four deep, not forty shallow" vs OQ-13's "40 shallow … 4 deep" | Prose variants of an intentionally-quoted design law; changing the quotation would misquote the source. |
| §3 Glossary "Fifteen terms listed under fourteen bolded labels" wording | No such defect exists; not present. |
| `[NOTE FOR PM]` verbosity in FR-18/FR-19/FR-21/FR-23 | Protected reasoning blocks. |

---

## Summary

- **Edits applied:** 24 `Edit` operations to `prd.md` (≈41 discrete wording changes, including a 17-replacement US-spelling normalization batch).
- **Structure:** 0 cut/merge/move; 2 terminology findings resolved under prose. Shape is correct for a Pyramid PRD.
- **Prose:** 12 findings, all applied. Highest value: **FR-4 "Events" → "emissions"** (Glossary violation) and **§6.1 "byte-identical" → "perceptually identical"** (direct contradiction of FR-24/A-9 on the claims-sensitive share surface).
- **Glossary violations caught:** `Events` → `emissions` (FR-4); "readings" → "Evidence" (×2); "Share card" → "Share Card" (×3); lowercase `seed` → `Seed` (×2); lowercase `clearance`/`cases`/`phenomena` → capitalized (UJ-1). Plus the entertainment-line variant reconciliation.
- **Testability fixes:** FR-18 ("when it is found" → "at the moment of capture"), FR-29 ("without pressuring the user" → "never penalizes a missed night").
- **Estimated word impact:** net +2 words — the changes were precision edits, not cuts; no length target was provided, and none was needed.
- **Unresolved, flagged for PM:** SM-1 25% (PRD) vs 20% (addendum §F.4) — a stale-figure discrepancy, left in place as instructed.
