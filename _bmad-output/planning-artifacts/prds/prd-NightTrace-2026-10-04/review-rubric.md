# PRD Quality Review — NightTrace (prd-NightTrace-2026-10-04)

## Overall verdict

This is an unusually strong, thesis-driven consumer PRD: the vision is specific and non-transferable ("the phone is not a detector, it is a case file that writes itself"), the non-goals do real work, the success metrics carry genuine counter-metrics, and the four UJs each drive requirements rather than decorating the document. It is not green-light-to-build, however. Status derivation (FR-21) names thresholds it never sets and the evidence model (FR-18) names a count it never enumerates, so the product's central output is not implementable; several FR consequences restate their requirement instead of testing it; and the Glossary the PRD declares normative is violated by the PRD itself. The one `[BLOCKING]` open question (OQ-1) is unresolved and §5's flat monetization non-goal contradicts OQ-3 and the retained `paywall_viewed` event.

Dimensions: **Decision-readiness — strong. Substance over theater — adequate. Strategic coherence — strong. Done-ness clarity — thin. Scope honesty — adequate. Downstream usability — thin. Shape fit — strong.**

---

## 1. Decision-readiness — strong

Trade-offs are stated as decisions rather than smoothed to neutral: §4.6 records the percentage asymmetry as "the most significant ratified override in the product," names the risk ("the exact place a reviewer or store reviewer will look," FR-23 Notes), and confines it to one screen. `[NOTE FOR PM]` callouts sit at real tensions — FR-3 (a detectable first-run guarantee "is worse than no guarantee"), FR-5 (battery target is an open number), FR-21 (triage may read as a chore gating the hero screen), §6.2 (purchase seams are "emotionally load-bearing in the other direction"). Open Questions are genuinely open: OQ-5 and OQ-8 have no answer anywhere in the PRD or addendum.

The weakness is that one decision is asserted while its opposite remains open. §5 states and §6.2/OQ-3 reopens the same question, and OQ-1 is marked `[BLOCKING]` with no resolution path beyond "a written framing… one sentence."

### Findings
- **[high] A settled non-goal is held open by an OQ (§5 vs §6.2/OQ-3; Addendum A.1 #13, F.1) —** §5 declares "NightTrace is not a monetized product in v1. No paywall, no in-app purchase, no subscription, no advertising at any point," yet OQ-3 asks "whether purchase seams survive a free MVP," A-1 says "may or may not be kept," and Addendum F.1 retains a `paywall_viewed` event "in the schema." A blocking-sounding assertion and an open question cannot both stand; a decision-maker reading §5 alone will believe it is closed. *Fix:* Rewrite §5 to "no monetization surface ships in v1" and move the seam question wholly into OQ-3, or delete OQ-3/A-1 and the `paywall_viewed` event.
- **[high] OQ-1 is `[BLOCKING]` and unresolved on the hero screen (§8 OQ-1; FR-22; §4.6) —** The PRD itself says the report "is the app's most scrutinised screen and its most exposed," and the resolution is deferred to a sentence that does not exist. For a public-launch PRD feeding architecture, a blocking question with no owner and no deadline is a gate, not a note. *Fix:* Write the framing sentence in the PRD (A-2 already states it: percentages are the app's own case-file index), or downgrade OQ-1 to non-blocking with a decision date.
- **[medium] FR-21 vs OQ-4 vs A-3 is unresolved in three places (§4.5 FR-21, §8 OQ-4, §9 A-3) —** FR-21 requires status partly from triage verdicts; OQ-4 says this is "untested"; A-3 asserts it "makes the report feel earned." The reader cannot tell whether the mechanism is a requirement or a hypothesis. *Fix:* State plainly that the mechanism ships in v1 and OQ-3/A-3 govern only its tuning.

---

## 2. Substance over theater — adequate

This is mostly earned content. §2.1's Jobs To Be Done are three distinct jobs with a fourth (collection) that actually drives the Journal, and each UJ persona is load-bearing: Mary drives FR-3/FR-9/FR-32, Devon drives the Share Card, Priya drives Field Note mode, Sam drives status derivation and the encounter-rate honesty. That is four personas, each justifying a feature — no persona theater. Innovation theater is absent: the "why now" is a coherent critique of the detector category rather than a restatement, and the Override audit table (Addendum A.1) is a real accountability artifact, not furniture.

NFR coverage is the theater risk. §4.4's only feature NFR is tool reachability; §4.1's performance NFR ("must not cause a React re-render per sample") is a mechanism, not a bound; §4.1's battery NFR is "an open number." The quantitative NFRs that do exist (Addendum H: Dynamic Type 200%, contrast ratios, Reduce Motion behaviours; Addendum C.6 tuning targets) are strong and product-specific, but they live in the addendum, so the PRD's own NFR surface reads boilerplate-adjacent.

### Findings
- **[medium] FR-29 is the weakest requirement in the document (§4.9) —** "The system can display streaks and award case stamps without pressuring the user" has no definition of a streak, no reset rule, no unit, and its guarded clause ("without pressuring") is an adjective, not a test. It is also the one feature that could contradict SM-C4 ("Time-in-app and daily opens. Do *not* optimize"). *Fix:* Define the streak unit and non-enforcement rule, or cut streaks and keep case stamps.
- **[medium] Core performance and battery NFRs are unnamed in the PRD (§4.1, §4.4) —** No frame-rate or latency bound for the live Session screen; the battery target is explicitly deferred. Architecture cannot lock the sampling ladder without the latter (OQ-2). *Fix:* Promote Addendum C.6/C.4 and a frame budget into §4.1 as bounded numbers.
- **[low] Addendum H carries accessibility numbers the PRD only gestures at (§6.1) —** §6.1 says "contrast targets met" without stating them; Addendum H states them. Pull the numbers up.

---

## 3. Strategic coherence — strong

There is a thesis, and it is load-bearing: honesty is the growth engine, not a constraint on it (§1: "the category's failure is… a failure of honesty"). Feature prioritization follows the thesis rather than ease — the build order is report-first (Addendum G.5) precisely because the loop is "tools generate → report packages → share recruits," and §4.6 argues the report is "the only screen that must be built first." Success Metrics validate the thesis (SM-1 share rate is "the product's single deciding number"; SM-7 measures empty encounter windows as evidence the engine protects uncertainty) and counter-metrics are real, named, and directionally specific (SM-C1 through SM-C4, each tied to the FR it balances).

The one coherence seam is measurement, not intent: several SMs cannot be measured with the instrumentation the PRD scopes.

### Findings
- **[high] Three Success Metrics have no instrumentation (§7 vs §6.2/Addendum F.1) —** SM-5 (report view rate ≥90%), SM-6 (triage engagement ≥60%), and SM-7 (silence holds 25–40%) cannot be computed from the six core analytics events (`hunt_started`, `hunt_completed`, `evidence_found`, `encounter_triggered`, `report_shared`, `paywall_viewed`). SM-7 is engine-derivable; SM-5 and SM-6 are not. A-6 asserts "six analytics events are sufficient for v1" while the PRD's own metrics require more. *Fix:* Add `report_viewed` and `triage_completed` to the core set, or restate SM-5/SM-6 as derived-from-`hunt_completed` properties and reconcile A-6.
- **[medium] SM targets are asserted without derivation (§7; Addendum F.4) —** The addendum concedes "the source contract states no funnel targets. SM-1 through SM-8… are therefore new." No benchmark, comparable, or simulation underlies ≥20% share rate or ≥25% D7. The SM-4 band and SM-7 band *are* simulation-derived (C.6) and should be distinguished from the invented ones. *Fix:* Mark each SM as simulated, benchmarked, or provisional.
- **[low] Dashboard metrics appear despite the thesis warning against them (§7 SM-2, SM-5) —** D7 retention and report-view rate are activity metrics; the PRD is careful to counter-balance them (SM-C4) but should say explicitly that SM-2 is a health check, not an optimization target, as it does for SM-4.

---

## 4. Done-ness clarity — thin

This is the dimension downstream story creation leans on hardest, and it is the PRD's weakest. Many consequences are genuinely testable and well-chosen: FR-1 (seed persisted verbatim, replay reproducibility), FR-2 (p50/p90 inter-emission ratio ≥3.0; longest silence 200–260 s at median; >5 min silence in 22–35% of sessions), FR-6 (no Phenomenon name under the engine directory), FR-33 (build-failing lint). Those are model requirements.

But the product's central output is not specified to a buildable level, and a recurring pattern of "consequences" restate the requirement rather than test it. The rubric asks for at least one testable consequence per FR; a fair count here is that roughly ten of thirty-three FRs have at least one hollow or unfalsifiable consequence.

### Findings
- **[critical] FR-21's thresholds are never set (§4.5 FR-21) —** Status derivation requires "signature convergence at or above the threshold," "an explained ratio below the threshold," and "at or above its threshold" — three distinct undefined constants. Status is the report's headline (`UNEXPLAINED`/`INCONCLUSIVE`/`EXPLAINED`), cited by UJ-1, UJ-2, and UJ-4. The thresholds appear nowhere in the PRD or the addendum. *Fix:* State the constants, or name them as configuration in Addendum C with default values and move the FR's testability onto them.
- **[high] FR-18 asserts a count it never enumerates (§4.5 FR-18) —** "Fourteen evidence kinds ship in v1." The kinds are not listed in the PRD or addendum; §4.2's Ghost objectives reference "three distinct evidence kinds" but never name them. Downstream cannot build the evidence model or the ledger. *Fix:* Enumerate the fourteen kinds (a table), or defer the count with an explicit "list owned by content" note.
- **[high] FR-8 specifies objectives and completion conditions for one Hunt of four (§4.2 FR-8) —** The consequence states each Hunt binds "objectives, a completion condition, and a length band," then gives Ghost five objectives plus an auto-close and floor, while Bigfoot, Shadow Person, and Alien receive only environment, pacing, length band, and tool set — no objectives, no completion condition. The requirement is therefore not testable for three quarters of the shipped content. *Fix:* Give all four Hunts their objective set and completion condition, as §4.2's Notes claim they are "load-bearing product decisions."
- **[high] FR-4 is untestable as written (§4.1 FR-4) —** The requirement is that tension "rises and falls with elapsed time, user movement, sensor anomalies, and Events, and drives pacing, audio, haptics, and Encounter probability." Neither consequence tests the mapping: consequence 1 is a non-exposure rule, consequence 2 ("influences Encounter probability but never guarantees") is a restatement of FR-2's guarantee ban. A developer cannot tell whether the implementation satisfies FR-4. *Fix:* Add a testable relationship (monotonic response to at least one input; a bounded range; a named effect on a named output).
- **[high] Hollow consequences that restate the requirement (§4.1 FR-3; §4.4 FR-13; §4.4 FR-15; §4.7 FR-24; §4.9 FR-29) —**
  - FR-3: "The directive is invisible to the user and produces no copy, indicator, or behaviour the user can detect as special" — no method for deciding detectability; this is the exact thing A-4 admits is unvalidated.
  - FR-13: "Long no-response periods are the norm, not the exception" — "norm" has no rate attached.
  - FR-15: "with the appearance of being caught rather than presented" — an aesthetic claim with no verification.
  - FR-24: "composed to be posted without editing" — unfalsifiable.
  - FR-29: "without pressuring the user" — unfalsifiable.
  *Fix:* Convert each to a measurable proxy (e.g., FR-13 → "≥X% of ASKs return no word"), or strike it from Consequences and leave it as prose.
- **[medium] FR-23's headline is unfalsifiable (§4.6 FR-23) —** "A sealed Case Report can never be altered in a way that misrepresents what happened" has no definition of misrepresentation. Only the revision-stamp consequence is testable. *Fix:* Replace the headline with the testable invariant ("post-seal edits produce a visible revision stamp and never mutate the sealed record").
- **[medium] No acceptance criteria for the hero screen's visual done-ness (§4.6 FR-22) —** The report is "art-directed twice," but the only done-ness is an ordered list of blocks. There is no minimum for the souvenir reel, no rule for the stat row when counts are zero beyond "still renders," and no criterion for a "complete" report beyond block presence. *Fix:* Add an explicit Acceptance block for FR-22 covering the zero-evidence case, the block ordering, and the byte-identical constraint on re-render.
- **[medium] FR-10's "states plainly" is a copy requirement with no string (§4.3 FR-10) —** "The selection screen states plainly that higher intensity means more signals and never a guaranteed Encounter" — a testable but unspecified string. Given FR-33's build-failing lint, the exact copy should be given. *Fix:* Quote the string.

---

## 5. Scope honesty — adequate

Omissions are mostly explicit, and this is where the PRD is strongest. §5 does real work — the ten non-goals each reject a feature that would otherwise be silently assumed (detector, social, monetized, multiplayer, cloud, AR, 3D, UGC, kid, biometric), and §6.2 names eight deferred items with reasons. Inline `[NON-GOAL for MVP]` tags appear at Director Mode, the global shared-seed night, share-card variants, iPad, biometrics, and monetization. Open-item density is high — 8 OQs, 8 assumptions, ~7 `[NOTE FOR PM]` callouts — which for a full-launch, green-light-to-build PRD is a concern rather than a virtue, but the items are real rather than rhetorical.

Two honesty failures: the monetization contradiction (filed under Decision-readiness) and an Assumptions Index that does not round-trip.

### Findings
- **[high] §5's "at any point" overclaims against deferred scope (§5, §6.2, OQ-3, Addendum F.1) —** "No paywall… no advertising at any point — including at natural case boundaries" is a permanent statement sitting inside a `[NON-GOAL for MVP]` bullet, while OQ-3 treats monetization as potentially returning in v1.x. Scope honesty requires the deferral be stated as a deferral. *Fix:* Split into "no monetization surface in v1" plus a separate, genuinely permanent statement about advertising (which the PRD treats as never).
- **[medium] iPad is deferred with no rationale or decision owner (§6.2, §5) —** Every other deferral carries a reason ("monetization is not on the critical path"; "content drops… are the point of the archetype model"). iPad gets "Phone-first." §2.2 lists "Users on iPad" as non-users, but the app is phone-first, so iPad users *are* users — the non-user entry is decorative and slightly false. *Fix:* State the reason (the seven tool surfaces assume a phone grip and portrait) or drop the non-user line.
- **[medium] The localisation assumption describes its own remedy without deciding it (§6.2, A-5, OQ-7) —** "This should be confirmed, because retrofitting localisation… is materially more expensive than planning it now." The cost asymmetry is named and the decision is left open, which is honest but means content authoring may begin against a structure A-5 says must change first. *Fix:* Resolve OQ-7 before the narrative template bank is authored, and say so.
- **[low] "Real weather integration" is filed as MVP scope but described as permanent (§6.2) —** The bullet says "Excluded permanently." Permanent exclusions belong in §5. *Fix:* Move it.

---

## 6. Downstream usability — thin

The PRD is chain-top (`bmad-ux` → `bmad-architecture` → `bmad-create-epics-and-stories`), so traceability is load-bearing here, and §0 explicitly promises "§3 Glossary is normative — every downstream artifact must use these terms exactly, and introducing a synonym anywhere is a defect." That promise is broken by the document making it.

IDs are clean: FR-1…FR-33 contiguous and unique; UJ-1…UJ-4 with named protagonists (Mary, Devon, Priya, Sam), each carrying context inline; SM-1…SM-8 plus SM-C1…SM-C4; OQ-1…OQ-8; A-1…A-8. Cross-references resolve (§4.12 → §8 OQ-1; §5 → §9 A-1; §6.2 → A-5/A-6; FR-30 → FR-33; SM-4 → FR-2/FR-4/FR-6). UJs are all anchored to entries and edges.

The failures are terminological and structural.

### Findings
- **[high] "Anomaly" is a same-term-two-meanings collision (§3, FR-22, §4.10, UJ-1) —** §3 defines **Anomaly** as "the single line of atmospheric… text on Home." FR-22's stat row then carries "the strongest-anomaly percentage" — an anomaly is a sensor-derived signal index there. A document that declares introducing a synonym a defect has given one noun two referents on its two most important screens. *Fix:* Rename one. The Home line could be **Anomaly** and the report value **Strongest signal**, or vice versa — but pick one and define both in §3.
- **[high] "Anomaly" vs "Daily Anomaly" across the document (§3 vs UJ-1, §4.10 heading, FR-30) —** The glossary term is "Anomaly"; UJ-1 says "the night's **Daily Anomaly**"; §4.10 is titled "Home and the Daily Anomaly"; FR-30 says "the daily Anomaly." Three spellings of one term. *Fix:* Fix the term in §3 and use it verbatim.
- **[medium] Two different entertainment lines (§4.6 FR-23 vs §4.7 FR-24 vs Addendum I.5) —** FR-23: "An investigation experience. **Nothing here is** a measurement." FR-24 and Addendum I.5 / B.4 row 31: "An investigation experience. **Not** a measurement." A downstream string table cannot tell whether these are one string or two deliberately different strings. *Fix:* State which string belongs to which surface, or unify.
- **[medium] UJ-1 names a Hunt that does not exist (§2.3 UJ-1 vs §4.2 FR-8) —** UJ-1 shows Home offering "one **Hunt**: *Ghost Investigation · Indoor*." §4.2 fixes the Hunt roster and names as "Ghost." "Ghost Investigation · Indoor" is not a glossary term nor a Hunt name. *Fix:* Use "Ghost."
- **[medium] Glossary omits nouns the FRs depend on (§3) —** **Objective** and **completion condition** (FR-8, FR-22), **place band** (FR-25, UJ-3), **night** (FR-25 "a boundary at 04:00"), and **Hunt Brief** (FR-9's heading is "Hunt Brief ritual"; the glossary has no entry) are load-bearing and undefined. FR-22 also enumerates report blocks — masthead, status seal, stat row, signature strip, narrative account, souvenir reel, evidence ledger, negative space, conditions footer — none of which are glossary terms. *Fix:* Add them; this is precisely what §0 says the glossary is for.
- **[low] §4 grouping vs the global FR numbering create one navigation hazard (§4.4 FR-11) —** FR-11's consequence refers to "the EMF surface" whose "*direct observation*" narrowing is defined only in FR-12 (Radar). Each FR should be extractable alone; FR-11's "INFERRED" state is defined in FR-5. *Fix:* Restate the dependency inline rather than relying on the reader holding FR-5/FR-12.

---

## 7. Shape fit — strong

The shape matches the product. This is a consumer product feeding UX, architecture, and stories, so UJs with named protagonists are load-bearing — and they are: four journeys, each with a named protagonist, entry state, path, climax, resolution, and edge case, and each realizing specific FRs. That is the correct density for a chain-top consumer PRD (not over-formalized, as UJs would be for a single-operator tool). The PRD is not brownfield (greenfield Expo app), so no existing-code references are needed. Non-functional sections use bounds where the source gave them (Addendum C.6, H) rather than adjectives.

One shape note: FR-33 (claims compliance) is written as a build-failing lint, which is the right shape for a regulatory-adjacent constraint running through a consumer product — it is the single best-shaped requirement in the document.

### Findings
- **[low] §6.1 reads as a feature inventory rather than a scope boundary (§6.1) —** It restates §4's features as bullets. The value-add of an MVP scope section is the boundary: what a slip cuts first. The never-cut list exists (Addendum G.6) but is not referenced from §6. *Fix:* Cross-reference the slip-triage never-cut list from §6.1 so scope and cut order are read together.

---

## Internal consistency (cross-cutting)

The task asked specifically whether any FR contradicts another or contradicts §5/§6.

- **[high] §5 (no monetization, "at any point") contradicts §6.2/OQ-3/A-1 and Addendum F.1's retained `paywall_viewed`.** Filed above under Decision-readiness and Scope honesty.
- **[medium] FR-33 vs FR-22 percentage tension is acknowledged and managed (§4.12 Notes, OQ-1, A-2) —** Credit where due: the PRD names the tension explicitly and does not hide it. But because OQ-1's framing sentence is unwritten, the PRD as it stands contains a build-failing lint (FR-33 bans `%` "as a sensed readout on a tool surface") and a required percentage on the report (FR-22), with the reconciliation existing only as an assumption. That is consistent only by fiat.
- **[medium] UJ-1's clearance behaviour contradicts FR-28 as written (§2.3 UJ-1 vs §4.9 FR-28) —** UJ-1's resolution says clearance "advances on sealed cases and documented phenomena, and one inconclusive case alone will not [move it]." FR-28 says advancement "depends on sealed Cases, distinct documented Phenomena, and matched Signatures only." If a sealed Case alone does not advance clearance, FR-28 needs a threshold; as written, one sealed case satisfies the stated dependency. *Fix:* State the rank thresholds (as with FR-21) or rewrite UJ-1.
- **[low] SM-3 vs FR-9 tension (§7 SM-3 ≥55% vs §4.3 FR-9) —** FR-9 requires calibration, a place name, an intention, and a ~600 ms hold before a Session starts; SM-3 requires 55% of new users to seal a first Case. The Brief is the funnel's riskiest step and the PRD does not note the interaction. Not a contradiction, but a coherence gap worth naming.
- **[low] FR-2's PRD floor vs Addendum's target (FR-2 vs Addendum C.6) —** FR-2 tests the p50/p90 ratio "at 3.0 or above"; Addendum C.6 sets the target at 4.2 and treats <3.0 as the anti-metric. The PRD should cite 4.2 with 3.0 as the failure floor, or the two will read as inconsistent in CI.

---

## Mechanical notes

Lighter weight; they do not drive the verdict but matter downstream.

- **Assumptions Index roundtrip is broken (§9 vs inline tags).** Inline `[ASSUMPTION]` tags exist at §4.8 (→A-7), §5 (→A-1), §6.2 (→A-5), §6.2 (→A-6). Index entries **A-2 (§4.6), A-3 (§4.5), A-4 (§4.1), and A-8 (§4.2)** have no corresponding inline `[ASSUMPTION]` tag — A-3 corresponds to a `[NOTE FOR PM]` at FR-21, and A-2 to the `[OVERRIDE]` block at §4.6. §9's claim that it surfaces "every `[ASSUMPTION]` from this document" over-delivers: half the index is not tagged inline. *Fix:* Tag A-2/A-3/A-4/A-8 inline, or restate §9 as "assumptions and ratified conditions."
- **The `[OVERRIDE]` completeness claim is false (§0, Addendum A.1).** §0 says "Every ratified override is marked `[OVERRIDE]` inline with the original demand named." Addendum A.1 lists fourteen; the PRD tags far fewer. Missing inline tags include #4 (rarity table), #10 (advanced journal never monetized), #11 (`expo-av` → `expo-audio`), and #14 (report-first build order) — #14 is the build order, the most consequential of the set. *Fix:* Either tag all fourteen or soften §0 to "every override that changes a visible behaviour."
- **Addendum J contradicts §3 (§3, Addendum J).** Addendum J introduces terms "not in the PRD's Glossary" and lists **Emission**, defining it — but §3 already defines Emission, and FR-2/FR-22 depend on it. Addendum J is redundantly redefining a PRD glossary term. *Fix:* Remove Emission from J or cross-reference §3.
- **ID continuity is clean.** FR-1…FR-33 (contiguous, unique, no gaps/dupes); UJ-1…UJ-4; SM-1…SM-8 + SM-C1…SM-C4; OQ-1…OQ-8; A-1…A-8. Cross-references resolve. No broken IDs found.
- **UJ protagonist naming is complete.** All four UJs name a protagonist and carry age/context inline; none float.
- **Required sections for the agreed stakes (consumer, chain-top, public launch) are present:** Vision, Target User, UJs, Glossary, Features/FRs, Non-Goals, MVP Scope, Success Metrics with counter-metrics, Open Questions, Assumptions Index. Missing: no explicit Acceptance Criteria section (consequences are meant to carry it — mostly they do), and no Risks section, despite §4.6 and OQ-1 both describing a product-level risk (the skeptic's thirty-second inspection) that has nowhere to live.

---

## Summary of severity

| Severity | Count | Items |
|---|---|---|
| Critical | 1 | FR-21 thresholds undefined |
| High | 10 | §5/OQ-3 monetization contradiction; OQ-1 unresolved blocking; 3 SMs unmeasurable; FR-18 kind list; FR-8 objectives for 3 Hunts; FR-4 untestable; hollow consequences (FR-3/13/15/24/29); Anomaly collision; Daily Anomaly drift; assumption roundtrip |
| Medium | 12 | FR-23 headline; FR-22 acceptance; FR-10 string; triage stalemate; SM target derivation; iPad rationale; localisation decision; entertainment-line drift; missing glossary nouns; UJ-1 Hunt name; clearance vs FR-28; FR-2 floor vs target |
| Low | 6 | NFR promotion; SM-2 framing; weather placement; FR-11 isolation; §6.1 inventory; SM-3/FR-9 interaction |

**Bottom line for the builder:** the vision, non-goals, and counter-metrics are ready. Before stories are cut, three things must land in the PRD: (1) FR-21's numeric thresholds and FR-18's evidence kinds, (2) objectives and completion conditions for all four Hunts, and (3) a decision closing the §5/OQ-3 monetization contradiction. The glossary must be repaired in the same pass, because §0 makes downstream correctness depend on a contract the PRD itself breaches.
