# Input Reconciliation — `02-engineering-and-delivery.md`

**PRD:** `prd-NightTrace-2026-10-04/prd.md`
**Addendum:** `prd-NightTrace-2026-10-04/addendum.md`
**INPUT:** `_bmad-output/brainstorming/brainstorm-paranormal-cryptid-hunting-app-2026-10-04/02-engineering-and-delivery.md` (sections G, H, I, M, Q — 2,843 lines)
**Date:** 2026-10-04

**Method.** Every load-bearing item in the INPUT was checked against the PRD *and* the addendum. Implementation detail (module layout, SQL DDL, package versions, test strategy) is expected to live in the addendum and is not treated as a gap. A finding is raised only where the item is absent from **both** documents, or where the PRD states something the INPUT contradicts with no `[OVERRIDE]` tag and no note. Monetization-is-free is documented (PRD §5, §6.2, A-1, OQ-3) and is deliberately not re-reported.

Severity: **Critical** = a product-facing contradiction a builder would implement wrong; **High** = a product guarantee, count, or scope that silently disagrees; **Medium** = a user-visible behaviour or vocabulary disagreement; **Low** = hygiene.

---

## 1. Reconciliation table

| # | INPUT item (section) | PRD status | Evidence | Severity |
|---|---|---|---|---|
| 1 | **Intensity has three levels.** `IntensityLevel = 'gentle' | 'standard' | 'intense'` (§H.12); schema `CHECK (intensity IN ('gentle','standard','intense'))` (§I.5) | **MISREPRESENTED** | FR-10 and §6.1 state **four** levels (`Ambient`, `Present`, `Intense`, `Ritual`) with per-level copy; addendum A.1 #12 and C.4 ("4 archetypes × 4 intensities") both say four. No `[OVERRIDE]`, no note. | **Critical** |
| 2 | **Clearance has six rungs:** `visitor → field_notes → accredited → senior → archivist → unknown_sightings`, "six rungs, no more" (§H.10); mirrored in the `user_progress` CHECK (§I.5) | **MISREPRESENTED** | FR-28 and §6.1 give **five** ranks, all differently named (`FIELD ASSISTANT`, `FIELD ASSISTANT II`, `CASE OFFICER`, `SENIOR CASE OFFICER`, `ARCHIVIST`). Neither name nor count matches the INPUT; no `[OVERRIDE]`. | **Critical** |
| 3 | **Ten evidence kinds.** `EvidenceKind` = `emf_swing, voice_capture, word_bank_hit, photo_anomaly, shadow_pass, footprint, tree_knock, sky_light, user_note, user_audio` (§H.5); the schema `CHECK` enumerates the same ten (§I.5) | **MISREPRESENTED** | FR-18 and §6.1 say **"Fourteen evidence kinds ship in v1."** Neither the PRD nor the addendum enumerates the fourteen; the INPUT contract can store ten. No `[OVERRIDE]`. | **High** |
| 4 | **Six engine phases.** `SessionPhase` = `threshold, establishing, investigating, escalating, closing, debris` (§H.3); the schema `CHECK` and the RLE digest's `phase` byte (`SESSION_PHASE_ORDER`, §I.6) both use these six | **MISREPRESENTED** | PRD §4.1/FR-4 and addendum C.8 both assert **five** phases (`QUIET`, `SIGNALS`, `ACTIVITY`, `ENCOUNTER_WINDOW`, `RESOLUTION`). An implementer builds five; the INPUT's schema requires six and indexes the digest by them. No `[OVERRIDE]`. | **High** |
| 5 | **`contested` evidence / the Trickster mechanic.** "True for evidence the Trickster plants… Sealed at triage time; the report renders it exactly like any other item until the user's own triage flips it" (§H.5); `explained_contested` badge credits disproving your own evidence (§H.7); radar `provenance: 'trickster'` (§H.7) | **MISSING from both documents** | No mention of the Trickster, planted/contested evidence, or an `explained_contested` badge anywhere in the PRD (FR-18/FR-20/FR-21 do not cover it) or the addendum. A user-visible mechanic with no requirement anywhere. | **High** |
| 6 | **The Daily Anomaly is mechanical, not just copy.** `daily_anomalies` carries `directive_json` — "SessionDirective applied to tonight's hunts" (§I.5); `GuaranteedEncounter.reason` includes `'daily_anomaly'` and `dailyAnomalyDirective()` exists (§H.3); T-3.6 "the anomaly's directive is applied to tonight's sessions" | **MISREPRESENTED** | PRD §3 Glossary and FR-30 frame the Anomaly purely as retention copy ("a single line of atmospheric text"), giving no reason to open the app on a night the user does not hunt. Both documents omit that an anomaly can alter pacing and can carry a **guaranteed encounter** — which would falsify FR-3's claim that the First-Run Directive is "the single deliberate departure from the engine's otherwise total honesty" and SM-C3's "must not be extended past the first Case." | **High** |
| 7 | **`§Q.7` cut list is conditional** — "What gets cut, in order, **the moment the schedule slips**": (1) `evidence_reel`+`conditions_slip` variants, (2) hidden badges, (3) Sky-tool quality, (4) `RemoteDirectorSource.stub`, (5) Journal FTS, (6) Camera tool, (7) Tracker dead-reckoning, (8) analytics beyond six | **MISREPRESENTED** | PRD §6.2 defers items 1, 2, 5, 8 **unconditionally** as MVP non-goals ("Hidden badges. Deferred; … the hidden set does not [ship]", "Journal full-text search. Deferred", "Additional Share Card variants … beyond the primary"). The INPUT ships all of these in the base (no-slip) plan — e.g. T-2.8 tests two card variants, migration `005_evidence_fts` is on the shipping list (§I.9). The PRD never names the slip-triage mechanism, the three scenarios, or the never-cut list. | **Medium** |
| 8 | **Journal entries can be struck/hidden, never deleted** — "The user can strike a line from their own journal. The row stays for the report; it hides from the timeline." (§H.11 decision; `hidden`/`pinned` columns, §I.5) | **MISSING from both documents** | FR-25 covers Journal browsing/segmentation but never the user's ability to hide an entry; the addendum does not mention it. This is a deliberate product affordance (user edits the timeline without breaking report/progression integrity). | **Medium** |
| 9 | **The report's graph gallery and per-case sections.** `CaseReport.graphs: CaseGraph[]` (rendered at seal, label-free "texture"), `sectors: SectorRecord[]`, `objectives: ObjectiveResult[]`, `headline`, `statusRationale`, `clearanceAfter`, `badgesAwarded` (§H.9); "a page of text does not feel like a case file" | **PARTIALLY MISSING** | FR-22 enumerates the report contents and omits the **graph gallery**, **sector records**, **objectives**, and the **status rationale**. The addendum never enumerates the report either. The hero screen's visual trace (a stated reason the report reads as a case file) has no requirement in either document. (The *ledger*, *negative space*, *souvenir reel* and *note* are correctly carried.) | **Medium** |
| 10 | **Certainty strength is four-valued internally** — `EvidenceStrength = 'faint' | 'present' | 'strong' | 'unqualified'` (§H.5); the schema `CHECK` matches (§I.5) | **MISREPRESENTED** | PRD §3/FR-18 define the certainty band as three values (`AMBIGUOUS`/`SUGGESTIVE`/`COMPELLING`); addendum B.4 row 9 shows only two (`COMPELLING`, `SUGGESTIVE`). The INPUT's four-valued `strength` (and its separation of user `verdict` from engine `strength`, §H.5) appears in neither document. | **Medium** |
| 11 | **Absence is a first-class encounter outcome** — `EncounterDelivery = … | 'absence'`, "the designed non-encounter: a moment that *should* have happened" (§H.6 decision); `outcome: 'absent'` | **PARTIALLY MISSING** | The PRD names the Failure states and SM-7 ("windows closing empty") but never the `absence` delivery/outcome as a model; the addendum's I.1 "Absence gets a line" is tone, not structure. The INPUT treats it as the strongest evidence the app can produce. | **Low** |
| 12 | **`TriageVerdict` is three values**, with untriaged modelled as `verdict IS NULL` and a paired-constraint `CHECK ((verdict IS NULL) = (triaged_at_ms IS NULL))` (§H.5, §I.5) | **MISREPRESENTED** | FR-20 lists four verdicts — `UNEXPLAINED`, `INCONCLUSIVE`, `EXPLAINED`, **`UNREVIEWED`** — presenting a not-yet-triaged state as a verdict. Harmless, but the vocabulary diverges from the contract with no note. | **Low** |
| 13 | **Positive navigation IA is four tabs** — `Home · Investigate · Field Journal · Profile`; "No Equipment tab exists (law 9)" (T-0.4, §G.2) | **PARTIALLY MISSING** | The PRD carries the *exclusions* ("no equipment menu", FR-30 "no tool grid") but never states the four-tab structure itself; the only home for it is the addendum's G.6 quotation of the never-cut list and A.1 #8. | **Low** |
| 14 | **`Environment` and `Intention` are closed five/seven-value sets** — `Intention = 'contact' | 'observe' | 'document' | 'debunk' | 'accompany'` (§H.3); `Environment` seven values (§H.2) | **MISSING** | FR-9 requires "an intention" but never enumerates; the addendum does not either. The `debunk` intention in particular is the fiction's honesty affordance. | **Low** |
| 15 | **Internal INPUT inconsistency, PRD is correct.** T-3.6's goal string literally reads a "tonight, in your area" briefing — the exact phrasing INPUT §B.4 row 14 bans as a claim about the user's neighbourhood | **NOT a PRD gap** | Recorded so a downstream reader does not "restore" the phrase. The PRD correctly does not carry it. | **Low (note)** |

### Items verified as correctly covered (no action)

Determinism and replay (FR-1; addendum C.3/C.5); offline purity and "nothing leaves the device" (§5, FR-26, FR-33; addendum B.5/G.7); the commit-on-find guarantee (FR-18; addendum E.2); crash-safe checkpoints and resume (§6.1; addendum E.3); export/deletion completeness and its locality caveat (FR-27, A-7); byte-identical, watermark-free share card (FR-24; addendum I.5); the claims boundary and build-failing lint (FR-32/33; addendum B); just-in-time permissions and no nag loop (FR-5, FR-33; addendum D.5); sensor fallback table / "reduce, never block" (FR-5; addendum D.4); the seeded PRNG and the First-Run Directive (FR-1/FR-3; addendum C.3); six analytics events and the twenty-event gap (A-6; addendum F.1/F.2); delivery reality and the day-40–45 date (addendum G.6); accessibility, contrast, Dynamic Type, Reduce Motion (addendum H); migrations, retention, storage budget, FK asymmetry (addendum E); no AR, no 3D, no UGC, no biometrics, no weather API (PRD §5; addendum A.3).

---

## 2. Prose

### 2.1 The pattern

The PRD and addendum are faithful to the INPUT's *architecture* — the engine boundary, determinism, the persistence rule, the claims boundary, the report-first build order. Almost every finding above is in one of two families, and both families are the same underlying failure: **the PRD adopted the addendum's numbers without the INPUT's contract, and nothing reconciles them.**

### 2.2 Family one — counts and vocabularies that disagree silently

Four separate enumerations in the PRD contradict the INPUT's own schema, and none carries an `[OVERRIDE]`:

- **Intensity**: three (INPUT §H.12, §I.5) vs four (FR-10, addendum C.4).
- **Clearance**: six rungs with different names (INPUT §H.10, §I.5) vs five ranks (FR-28).
- **Evidence kinds**: ten (INPUT §H.5, §I.5) vs "fourteen" (FR-18).
- **Engine phases**: six (INPUT §H.3, §I.5, §I.6) vs five (PRD §4.1, addendum C.8).
- Plus two vocabularies: certainty bands three-valued in the PRD, two-valued in addendum B.4, four-valued (`strength`) in the INPUT; and a fourth triage verdict (`UNREVIEWED`) the INPUT models as a null.

These are not implementation detail. Each is a stated product fact — the number of difficulty settings a user picks, the number of ranks they climb, the number of evidence kinds the game ships, the number of phases a session runs through. The addendum repeats the PRD's numbers (C.4, C.8) rather than correcting them, so the addendum reinforces the divergence instead of resolving it. **The addendum is where the INPUT's values should have surfaced; it does not surface them.**

The phase case is the most acute, because it is the one the INPUT makes structural: the RLE tick digest stores `phase` as a single byte indexing `SESSION_PHASE_ORDER`, and §I.6's header hard-codes `tickHz = 6`. A five-phase `SESSION_PHASE_ORDER` is not the INPUT's six, and the digest is the replay key the whole determinism claim rests on. This needs a decision recorded, not a rewrite.

### 2.3 Family two — mechanics with no home in either document

Three INPUT features are user-visible and appear in *neither* the PRD nor the addendum:

1. **Contested evidence / the Trickster.** The INPUT devotes a schema field, a badge criterion, a radar provenance value, and two design decisions to a mechanic where the entity plants false evidence that the report renders identically to real evidence until the user's own triage flips it. It is, by the INPUT's own words, "the cheapest insurance against the skeptic's test" — the single best defence of the product's core honesty claim, which is the PRD's entire §4.12 thesis. It is absent everywhere. If the PRD intends contested evidence to exist, it needs a requirement; if it intends to drop it, it needs an `[OVERRIDE]`, because the mechanic is load-bearing for the argument the PRD makes for itself.

2. **The Daily Anomaly's directive.** The INPUT's anomaly is not copy — it applies a `SessionDirective` to tonight's hunts and can carry a **guaranteed encounter** (`reason: 'daily_anomaly'`). The PRD describes the anomalaly as "a single line of atmospheric text." This matters because FR-3 calls the First-Run Directive "the *single* deliberate departure from the engine's otherwise total honesty" and SM-C3 insists the guaranteed-encounter rate "must *not* be extended past the first Case." A daily-anomaly guarantee would be a second, unbounded departure. Either the INPUT's `daily_anomaly` guarantee reason is dead and should be struck, or the PRD's "single deliberate departure" claim is false.

3. **Hiding a journal entry.** A small but deliberately-designed affordance ("the timeline is the user's to edit while the record stays whole"), with two dedicated columns and a stated rationale, absent from FR-25.

### 2.4 §Q.7 vs the MVP Scope section — a conditional list read as permanent

The task asked specifically whether the PRD's MVP Scope agrees with the INPUT's cut list. It **agrees in content and disagrees in kind.** Four of the eight cuts (share-card variants, hidden badges, Journal FTS, analytics beyond six) appear verbatim in PRD §6.2 — so the PRD did read §Q.7. But §Q.7 opens by saying these are "what gets cut **the moment the schedule slips**"; the base plan ships every one of them (migration `005_evidence_fts` is on the shipping migration list, §I.9; T-2.8 tests two card variants; the hidden-badge set is part of the badge wall in T-3.4). The PRD has converted a slip-contingency into a permanent non-goal list without noting the conversion.

Two consequences. First, a reader of the PRD concludes the hidden badge set was always out of scope, when the INPUT treats its absence as a schedule failure. Second, the PRD discards the mechanism itself — the ordered cut list, the three pre-agreed slip scenarios, and the **never-cut list** — which the INPUT calls out as the device that "makes a slip a decision rather than a negotiation." Addendum G.6 quotes the never-cut list, so the ordering survives, but the *conditional* nature of §6.2's items does not.

On the other three cut items (Sky-tool quality, Camera tool, Tracker dead-reckoning) the PRD §6.1 correctly lists all seven tool surfaces as in scope, matching the INPUT's base plan — so the PRD is *more* generous than §Q.7's fallback there, and the two documents agree.

### 2.5 What this reconciliation is not saying

It is not saying the PRD is thin. The PRD correctly carries every product *guarantee* the INPUT states — determinism, offline purity, commit-on-find, crash-safety, export/deletion, the claims boundary, the no-nag permission model, the never-cut list's substance. The gaps are concentrated in enumerations and in three mechanics, and the enumeration gaps share one remedy: **the addendum should list the INPUT's actual values and mark each divergence as either a correction or a ratified override.** Two of the divergences (intensity, clearance) are the kind a builder will implement literally from the PRD, and both would produce a schema that contradicts the shipped migration.

---

## 3. Recommended actions, in priority order

1. **Add an `[OVERRIDE]` or a correction note for intensity (3→4), Clearance (6 rungs→5 ranks), evidence kinds (10→14), and engine phases (6→5).** Each is a builder-visible number; each currently has neither tag.
2. **Decide and record contested/Trickster evidence.** Either a new FR in §4.5 or an explicit `[OVERRIDE]` dropping it; silence is the one untenable option, given its role in the honesty argument.
3. **Reconcile the Daily Anomaly's directive.** Strike `'daily_anomaly'` from the guarantee reasons, or soften FR-3's "single deliberate departure" and SM-C3 to match.
4. **Re-word §6.2** so the four §Q.7 items read as slip-contingent deferrals, and note that the base plan ships them — or record them as deliberate permanent cuts.
5. **Restore the missing report contents** (graph gallery, sectors, objectives, status rationale) to FR-22 or the addendum, and the journal hide-entry affordance to FR-25.
6. **Fix the certainty-band vocabulary** to one set across PRD §3, addendum B.4, and the INPUT's `EvidenceStrength`.
