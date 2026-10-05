# Review — `addendum.md`

**Lenses:** `structure`, then `prose` (prose run on top of structure, per the broader-before-narrower order).
**Content class:** docs (a PRD addendum — reference/explanation, judged against the Reference/Database and Strategic/Context models).
**Companion:** `prd.md` (being marked `status: final` in this pass; not edited here).

## Purpose / audience read

This document exists to preserve the depth behind NightTrace's finished PRD — rejected alternatives, ratified overrides, the engine's implementation contract, sensor and persistence behavior, analytics, delivery, accessibility, tone, and glossary extensions — for downstream authors (architecture, solution design, UX, epics) who would otherwise rediscover decisions that were already made. Per the brief, verbosity is the deliverable here when it records a reason; brevity is not a goal.

## Structural model

Closest fit is **Reference/Database** (random access, MECE sections, a consistent per-section schema) with a **Strategic/Context** warm-up (the ratified-override and liable-ruling tables lead). The document mostly holds to that shape; the findings below are places where a section is too thin to carry what it stores, where content sits in the wrong section, or where the reader has to backtrack.

## Findings applied

Numbered as applied. `CUT`/`MERGE`/`MOVE`/`CONDENSE`/`QUESTION`/`PRESERVE` tags per the structure lens; prose rows quote the fix.

| # | Pass | Location | Finding | Fix applied |
|---|---|---|---|---|
| 1 | structure | §G.6 `NOTE FOR PM` | **QUESTION (blocking inconsistency).** Told the PM to rewrite the law with a "case metadata" carve-out so the documents "stop contradicting" — but the PRD removed the number rather than the law, so the note instructs a change that would *reintroduce* the contradiction. | Rewrote: no carve-out is needed; the exception was reversed and the law holds everywhere. |
| 2 | structure | §J "Slice of the design laws" | Same stale claim ("partially overridden on the Case Report"). Glossary entries must be exact; this one asserted a live exception that no longer exists. | Rewrote to state law 1 stands in full, with the reversal noted. |
| 3 | structure | §F.4 | **QUESTION.** The section stated "SM-1 (share rate ≥ 20%)" — a number the PRD never adopts (PRD SM-1 is **≥ 25%**, explicitly "the source design's own number, not a reduction of it"). This was a silent numeric drift of the exact kind the PRD exists to prevent. | Corrected to ≥ 25% and reframed so the metric *set* is new while the *target* is adopted. |
| 4 | structure | §B.4 | **PRESERVE + equilibrium fix.** The section is the load-bearing table but said nothing about why rows keep their source numbering, inviting a future editor to renumber. | Added one line: rows keep source numbering because the PRD and §B.6 cite them by number. No row touched. |
| 5 | structure | §E.8 | **CONDENSE/reshape.** Four numeric facts in one dense sentence; unreadable for a storage-budget reference and hard to update. | Reshaped into a 4-row table; values preserved verbatim. |
| 6 | structure | §C.8 | **MOVE (reader backtracks).** The five engine phases and the four user-visible state words were presented adjacently with no statement that they are *different ladders*. A reader reasonably assumes 5 = 5. | Split them and stated the four-word ladder is separate and does not map 1:1; added the replay-digest reason the phase count is structural. |
| 7 | structure | §C.1 / §C.2 | **QUESTION (missing scaffolding).** The module layout is the enforcement surface for the boundary rules that follow, but nothing said so. | Added a lead sentence tying §C.1 to §C.2. |
| 8 | structure | §A.2, §E.6, §D.1, §B.5, §B.1 | **QUESTION (cross-references).** Sections restated a rule without pointing at the section that governs it, forcing the reader to hold both in working memory. | Added targeted cross-refs (§A.2→§C.12/§E.1, §E.6→§E.2, §D.1→§C.2, §B.5 self-contained, §B.1 scope note). |
| 9 | structure | §B.3 | **QUESTION (heading vs content).** Heading read "Approved market terms" but the section also carries app name, subtitle, category, and rating. | Renamed to "Approved market terms and store framing"; content unchanged. |
| 10 | structure | §F | **QUESTION (heading vs content).** Repeated bare `OQ-3` / `OQ-1` references with no document prefix, unlike the PRD's `§8 OQ-1` convention. | Normalised to `§8 OQ-3` / `§8 OQ-1`. |
| 11 | prose | Multiple | **Glossary-case.** Glossary terms were lowercase in running text (`share card`, `the report`, `evidence`, `tension`, `attunement`, `rarity`), against PRD §3's verbatim-use rule. | Capitalised `Share Card`, `Case Report`, `Field Journal`, `Evidence`, `Encounter`, `Tension`, `Attunement` where they name the Glossary concept. |
| 12 | prose | Multiple | **Missing reasons (the document's core value).** Several assertions stated a decision without its why — the exact failure this addendum exists to prevent. | Added the reason for: §E.5 retention (un-exported keeps digest; 5 MB bound), §E.7 migration edit rule, §C.7 cooldowns, §C.11 radar lock-on rule, §C.12 invariants, §E.3 60-second window, §H live-region scoping, §G.7 free-text column count, §I.4 continuous-vibration ban, §G.3 dev-build constraint, §B.5 three layers, §B.1 scope. |
| 13 | prose | Multiple | **Content in the wrong place / thin sections.** §I.4 carried "continuous vibration is forbidden" with no reason and omitted that iOS suppresses haptics entirely (a real implementation hazard); §J lacked definitions for Tension, Attunement, and the rarity band, which the body uses as load-bearing scalars. | Extended §I.4 with the no-op rule; added three glossary entries to §J and clarified the design-laws entry. |
| 14 | prose | §G.6 | **Passive/actor-hiding.** "The remaining scope … runs a further 10–15 days" hid *whose* estimate it is. | Named the source contract as the author of the estimate. |
| 15 | prose | §G.2 | **First person inconsistent with the document's voice** ("our own RMS and VAD"). | Changed to "the engine's own RMS and VAD". |
| 16 | prose | §A.1 row 5 | `truncated case` lowercased a Glossary term. | `truncated Case`. |

## Percentage-removal consistency check — PASSED (with one straggler found and fixed)

The brief asked specifically that §A.1 row 1, §B lint list, §B.6, and §I.5 all read consistently with the product displaying no percentage anywhere.

- **§A.1 row 1** — consistent: "Banned on every surface; counts and qualitative bands only", reversal dated. **PASS.**
- **§B lint list** — consistent: `` `%` (anywhere — no carve-out on any surface) ``. This matches PRD FR-33's strengthened wording ("flat ban on the `%` character in any shipped string"). **PASS.**
- **§B.6** — consistent after edit: now says the product "complies with the rulings table completely — no exception … survives on any surface", and names the retired term **Anomaly Index**. **PASS** (was passing on the number, improved on precision).
- **§I.5** — consistent: "no percentage, per §8 OQ-1". **PASS.**

**One straggler found, outside the four named sections:**

- **§G.6 `[NOTE FOR PM]`** — instructed the PM to rewrite the never-cut law as "qualitative readouts everywhere except the Case Report's **case metadata**", preserving exactly the carve-out that the percentage removal deleted. This is the document still implying a percentage (or at least a numeric-readout exception) survives on the Case Report's stat row. **Fixed.**
- **§J "Slice of the design laws"** — a second straggler of the same shape: "law 1 (no verifiable numbers) is **partially overridden** on the Case Report". **Fixed.**

No other surface in the addendum implies a surviving percentage. The remaining `%` occurrences are all either safely inside the banned-terms list/banned-examples table (#9, #11, #23), or legitimate non-readout figures (tuning targets, storage percentages, contrast ratios, card width).

## Deliberately left alone

- **§B.4 row numbering and all 40 rows** — cited from the PRD and §B.6; renumbering would break those citations. Verified 40 rows, numbered 1–40, and 14 rows in §A.1.
- **Rarefi/legendary "~0.5%" and "0.4–0.6%"** — these are *engine tuning frequencies*, not user-facing readouts; removing them would destroy the gating rationale. Kept.
- **§I.3 lavender icon paragraph** — verbose and hedged, but that hedging is the record: the item is exploratory and must not be mistaken for approved. Condensing it would overstate the decision.
- **§A.3 rejected-alternative list** — left whole; each bullet is a recorded rejection, which is the point.
- **The `01` / `02` source-document names** — preserved; added a preamble legend explaining them rather than spelling them out everywhere.
- **Verbosity overall** — not cut. Per the brief, verbosity is the deliverable where it records a decision. The pass added ~1,360 words (5,604 → 6,966) and removed almost none.

## Summary

**~47 edits applied.** No section lettering, ordering, subsection, table row, or row number changed except two heading renames (§B.3, §F.4) and the reshaping of §E.8's prose sentence into a table. Every recorded rejected alternative, stated reason, numeric tuning value, and the `01`/`02` naming are intact.

**Estimated net effect:** +1,362 words (+24.3%). No length target was given; the increase is deliberate depth (reasons and cross-references) rather than restatement.

**Comprehension trade-offs:** none. The additions are all reasons, cross-references, and two structural reshapes; nothing was cut that carried meaning.
