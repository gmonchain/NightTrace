---
title: NightTrace — Input Reconciliation (Master Prompt vs PRD + Addendum)
status: draft
created: 2026-10-04
source_input: paranormal_cryptid_hunting_master_prompt.md (39 sections, 1707 lines)
audited_against: prd.md + addendum.md (prd-NightTrace-2026-10-04)
---

# Input Reconciliation — `paranormal_cryptid_hunting_master_prompt.md`

**Method.** Every demand, deliverable, constraint, and qualitative statement in the owner's 39-section brief was checked against the PRD and the addendum. A finding is recorded where the input item has **no FR**, **no non-goal**, **no addendum mention**, or where the PRD **contradicts** the input **without an `[OVERRIDE]` tag naming the original demand**.

The PRD's own override audit (addendum §A.1, fourteen rows) is taken as authoritative for what was *deliberately* changed. Findings below are items that audit does **not** cover — the silent drops.

Severity key: **Critical** (owner's core intent lost) · **High** (a demanded behaviour or deliverable absent) · **Medium** (real gap, recoverable downstream) · **Low** (texture, detail, or administrative).

---

## Part 1 — Coverage table

| # | Input item (§) | PRD status | Evidence / where it lands | Severity |
|---|---|---|---|---|
| 1 | **§1 — The eight emotional beats, in order:** curiosity → tension → anticipation → uncertainty → surprise → collection → progression → shareable "I found something" moments | **missing** | No FR, no §, no addendum mention. §2.1 substitutes five Jobs-To-Be-Done; the beat *arc* (ordered, cumulative) is nowhere. §1 Vision captures tone prose only. | **Critical** |
| 2 | **§1 — "The app must make the user feel: 'I am actually going out to investigate something' instead of 'I am looking at a fake radar animation.'"** | covered (partial) | §1 states "The phone is not a detector"; §4.4 tool-inside-hunt law. The *aspiration sentence itself* is not carried as a design test. | Low |
| 3 | **§1 — Product is a hybrid of six things:** investigation toolkit · monster/cryptid hunting *game* · immersive camera experience · sensor-driven exploration · collectible field journal · shareable content generator | covered (partial) | PRD never states the hybrid framing. "game" as a self-description is absent (PRD prefers "experience"/"simulation"). Camera and journal covered by §4.6/§4.8. | Low |
| 4 | **§2 Pillar A — Hunts with different *instructions* and different *sound design*** | covered | FR-8 (objectives, pacing, tools); addendum I.4 sound categories. | — |
| 5 | **§2 Pillar B — 23 named tools incl. Motion Scanner, Footprint Evidence, Movement Signal, Sound/Vocalization Detector, Encounter Camera, Proximity Scanner** | covered | `[OVERRIDE]` §4.4 — 7 surfaces / 5 verbs. Correctly tagged. | — |
| 6 | **§2 Pillar B — "Do not expose every tool on the home screen. Tools should appear inside the hunt flow."** | **misrepresented** | §4.4 and §4.10 both tag as `[OVERRIDE]`: *"The owner's brief placed a tool grid and an Equipment tab on Home."* **The brief says the opposite** — §2 forbids the home-screen tool grid, and §23 says "Think critically about whether Equipment deserves its own tab. Do not create unnecessary tabs." The decision was right; the provenance is wrong. An override tag is attached to a demand the owner never made. | **High** |
| 7 | **§2 Pillar C — Evidence carries `rarity`** | **missing** | FR-18 lists kind, certainty band, channel, tool, phase, source. Rarity is absent from the PRD entirely. Addendum A.1 row 4 covers the *probability table*, not per-evidence rarity as an attribute. | **High** |
| 8 | **§2 Pillar C — Evidence carries `creature association` and `confidence contribution`** | covered | Addendum C.12 (`evidence.creature_id`); FR-19 signature convergence. | — |
| 9 | **§2 Pillar C — Evidence block shows `Possible match BIGFOOT`** | **misrepresented** | FR-19 forbids naming a creature as a match; addendum B.4 row 13 rules it out. **No `[OVERRIDE]` tag anywhere names this demand** — it is a ban on an explicit owner-specified UI element, undisclosed. | **High** |
| 10 | **§2 Pillar C — Journal tracks: total hunts, encounters, **strongest evidence**, **best case score**, **rare events**, badges, creature progress** | missing | FR-25 gives Overview/Phenomena/Evidence/Cases with counts. "Strongest evidence" survives partly as the share card's *strongest artifact* (FR-24). **"Best case score" and "rare events" have no home.** | **High** |
| 11 | **§2 Pillar D — Encounter examples incl. "strange eyes appear in darkness", "phone vibrates while proximity rapidly increases"** | covered | FR-15 sprite encounters; addendum I.4 haptics escalation. "Eyes" not specifically named. | Low |
| 12 | **§2 Pillar D — Rarity framework 55/25/12/6/2** | covered | `[OVERRIDE]` addendum A.1 row 4 — gated thresholds, legendary ~0.5% flag. Correctly tagged. | — |
| 13 | **§3 — Gameplay loop as a named diagram**, ending "XP / Unlock / Journal → Start Another Hunt" | covered | Loop is realized across FR-9→FR-22; XP→Clearance `[OVERRIDE]` tagged §4.9. PRD never renders the loop as a single artifact. | Low |
| 14 | **§3 — "The loop must work for a 2-minute casual session"** | covered | `[OVERRIDE]` §4.11 / addendum A.1 row 5 — Field Note ~3 min. Correctly tagged. | — |
| 15 | **§4 — Ghost evidence `cold-spot simulation`** | **missing** | No mention of a cold-spot / temperature mechanic in PRD or addendum. FR-18 says "fourteen evidence kinds" but never enumerates them. | **High** |
| 16 | **§4 — Bigfoot evidence `footprint`, `broken trail`; Shadow evidence `camera distortion`; Alien evidence `transmission`, `electromagnetic anomaly`** | unverifiable | FR-18 fixes "fourteen kinds" without listing them; no document enumerates them. Cannot be confirmed present. | Medium |
| 17 | **§5 — Future creatures: Mothman, Werewolf, Lake Monster, **Haunted Doll, Unknown Humanoid, Night Creature, Forest Entity, Sewer Creature, original monsters unique to this app**"** | missing (partial) | §6.2 names Mothman, Werewolf, Lake Monster only. The five other named creatures and the "original monsters" ambition are dropped from the roadmap. | Medium |
| 18 | **§7 — Engine inputs include `difficulty`** | missing | No difficulty concept. FR-10 Intensity governs emission density, not difficulty; the addendum never equates them. Probably a silent rename, but unrecorded. | Low |
| 19 | **§7 — "creature-specific event tables"** | covered | `[OVERRIDE]` addendum A.1 row 3 (one engine, one hazard model). Correctly tagged. | — |
| 20 | **§7 — Emission union (11 values)** | covered | Addendum C.9 reproduces it verbatim. | — |
| 21 | **§8 — Tension affects audio, radar frequency, haptic intensity, **UI flicker**, encounter probability, background ambience** | covered (partial) | FR-4 names pacing, audio, haptics, encounter probability. UI flicker / radar frequency / ambience not named. | Low |
| 22 | **§9 — EMF pipeline (raw → smoothing → baseline → delta → anomaly score)** | covered | FR-11 + addendum C.10. | — |
| 23 | **§10 — Radar target behaviours: "may appear briefly, move, fade, disappear, **approach, retreat, split into noise**"** | misrepresented | FR-12 gives "appear briefly, drift, fade, approach, dissolve". **`retreat` and `split into noise` are gone with no tag.** Addendum C.11 says "`dissolve` is the only removal". | Medium |
| 24 | **§11 — Spirit Box: looping static, tuning animation, pre-recorded fragments, **creature-specific word pools**, long silence, rare clearer response** | covered (partial) | FR-13 covers band line, silence, one word, authored banks. "Creature-specific word pools" not stated (addendum C.3 `rng.words` is global). | Low |
| 25 | **§11 — Spirit Box UI shows `87.4 MHz`, `SCANNING...`, `SIGNAL LOST`** | covered | Banned by the numeric-readout `[OVERRIDE]` in §4.4 / FR-33. Tagged in aggregate. | — |
| 26 | **§12 — EVP: `waveform` display** | missing | FR-14 gives RECORD/STOP, MARK, rolling 30 s segments, marker lane. Waveform never mentioned (PRD FR-11 bans a y-axis on EMF; no waveform ruling for EVP). | Medium |
| 27 | **§12 — Optional entertainment feature: "event engine can insert a 'possible anomaly marker'"** | **missing** | FR-14 has user-driven `MARK` only. The engine-inserted marker is not in the PRD, not in a non-goal, not in the addendum. Untagged drop of a named feature. | **High** |
| 28 | **§13 — Camera overlays include a `radar reticle`** | missing | FR-15 lists rule-of-thirds, corner brackets, timer, heading, signal bar, torch, vignette. Reticle absent. | Low |
| 29 | **§13 — Night-vision / scan lines / noise / chromatic aberration overlays** | covered | `[OVERRIDE]` §4.4 and addendum A.1 row 12 (glitch channel / Intense+Ritual / Shadow Person). Correctly tagged. | — |
| 30 | **§14 — Bigfoot flow `NW • 182m`** | covered | `[OVERRIDE]` addendum A.1 row 6 / FR-12 (8-wind + range band). Correctly tagged. | — |
| 31 | **§14 — Bigfoot: "Calibrating compass..." step** | covered | FR-9 calibration step in the Hunt Brief. | — |
| 32 | **§15 — Ghost: `Room baseline ████████ 100%`** | covered | Numeric readout banned; Ghost objectives include "establishing a baseline" (FR-8). Covered by the aggregate numeric `[OVERRIDE]`. | — |
| 33 | **§16 — Shadow Person: `movement warnings`, `direction hints`, `peripheral events`, **rare "behind you" event**"** | **missing** | FR-8 reduces Shadow Person to "indoor, slow and tightening, haptic and glitch-led". The "behind you" event — the signature moment of that Hunt — appears nowhere. No tag. | **High** |
| 34 | **§17 — Alien: `SIGNAL LOCK`, `VISUAL CONFIRMATION POSSIBLE`** | **misrepresented** | FR-12 ("cone width never collapses to a lock") and FR-33/B.2 (bans *confirm*/confirmation language) both contradict the input. **Neither is tagged as an override of §17.** | **High** |
| 35 | **§17 — Sky tool with azimuth/altitude, alignment meter, tolerance** | covered | FR-17. | — |
| 36 | **§18 — Case Report stat row: Duration, Evidence, Strongest anomaly %, **Visual encounters**, **EVP**, Activity level, STATUS** | covered (partial) | FR-22 keeps duration, evidence, encounter, source counts + strongest-anomaly % + activity level. **Separate `Visual encounters` and `EVP` counts are collapsed into "source count".** Not tagged. | Low |
| 37 | **§18 — Case reference format `CASE #024`** | misrepresented | Glossary/§2.3 use `NT-003` / `CASE NT-003`. Format changed silently (cosmetic). | Low |
| 38 | **§18 — Report should "feel collectible, premium, shareable"; allow save as image, share, archive** | covered | FR-22, FR-23, FR-24; §4.6 "art-directed twice". | — |
| 39 | **§19 — Journal Overview: total hunts, **investigation hours**, evidence, encounters** | covered (partial) | FR-25 names the four segments but never their contents. "Investigation hours" unspecified. | Low |
| 40 | **§19 — Journal Evidence section: `newest`, **`rarest`**, `strongest`** | **missing** | FR-25 gives counts and a per-Phenomenon breakdown. No rarity ordering, no "strongest" surface. | **High** |
| 41 | **§20 — Progression: XP, investigator level, creature discovery, badges, equipment skins, journal themes, radar themes, **rare evidence**, streaks** | covered | Clearance `[OVERRIDE]` tagged §4.9/A.1 row 2; skins/themes cut and tagged A.1 rows 9–10; badges + streaks FR-29. **"Rare evidence" as a progression vector has no home.** | Medium |
| 42 | **§21 — "The app should track which rare events the user has seen."** | **missing** | This is *not* the probability model that A.1 row 4 overrode — it is a user-facing collected-set. FR-19's Signature Archive tracks *signatures*, not rare events. §6.2 defers "hidden badges". Untagged drop. | **High** |
| 43 | **§21 — Rarity tiers Common / Uncommon / Rare / Legendary as user-visible** | missing (partial) | Internal `legendary` flag survives (addendum C.3, C.6 at 0.4–0.6%). No user-facing tier vocabulary anywhere. §33's card field `ENCOUNTER RARE` cannot be rendered. | Medium |
| 44 | **§22 — Director Mode** | covered | §5 non-goals + addendum A.3 (source seam). | — |
| 45 | **§23 — Navigation: Home / Journal / Equipment-Tools / Profile** | **missing** | PRD has **no Information Architecture section at all** — no tab list, no screen map, no modal/sheet structure. Addendum G.6 references "the four-tab structure" as never-cut but never names it. §36C demanded exactly this deliverable. | **High** |
| 46 | **§23 — "Header Investigator Level"** | covered | FR-30 shows Clearance on Home. | — |
| 47 | **§23 — "Think critically about whether Equipment deserves its own tab. Do not create unnecessary tabs."** | misrepresented | Same finding as #6 — the critique was *requested*; §4.4/§4.10 narrate it as a demand that was overridden. | High |
| 48 | **§24 — Visual direction + palette + anti-references** | covered | Addendum I.2, near-verbatim. | — |
| 49 | **§25 — Twelve sound categories** | covered | Addendum I.4 reproduces all twelve. | — |
| 50 | **§26 — Haptics escalation ladder; no continuous vibration** | covered | Addendum I.4. | — |
| 51 | **§27 — Offline-first; SQLite; folder architecture** | covered | §5 non-goals, FR-27, addendum C.1/E. | — |
| 52 | **§28 — Zustand + SQLite; transient vs persistent state separation** | covered | Addendum C.1 (`store/`), E.6 ("Never stored"). | — |
| 53 | **§29 — Data model incl. `SensorSnapshot`** | missing | Addendum A.2 records renames for Creature, Hunt, HuntSession, CaseReport, Badge. **`SensorSnapshot` is simply absent** — no table in E.1, no rename, no note. (E.6 implies it is deliberately not persisted, but the type's removal is unrecorded.) | Low |
| 54 | **§29 — Strict TypeScript, avoid `any`** | covered | Addendum G.1 (strict + three extra flags). | — |
| 55 | **§30 — MVP scope / do-not-include list (chat, social, marketplace, cloud backend, live multiplayer, generative AI, 3D, LiDAR, ARKit-only)** | covered | §5, §6.2, addendum A.3. Every item accounted for. | — |
| 56 | **§31 — "The free user must experience at least one memorable hunt before seeing a strong purchase screen."** | covered | FR-3 First-Run Directive guarantees a first Encounter. (The PRD's stated rationale differs — it protects perceived liveliness, not paywall goodwill — but the behaviour is present.) | — |
| 57 | **§31 — Monetization structure, Paranormal Pro, IAP-vs-subscription evaluation** | covered | `[OVERRIDE]` §5/§6.2/OQ-3, addendum A.1 rows 10, 13 (owner instruction "free for now"). Correctly tagged. | — |
| 58 | **§32 — Preferred positioning language: "paranormal investigation **simulator**", "sensor-powered entertainment", "cryptid exploration game", "immersive paranormal toolkit"** | **misrepresented** | Addendum B.3 replaces this list wholesale with `paranormal · ghost hunt · cryptid · investigator · field journal · EMF · EVP · spooky · adventure · night`. **Two of the approved terms (`spooky`, `adventure`) appear nowhere in the brief**, and all four of the brief's chosen phrases are absent. No `[OVERRIDE]` tag. `simulator` in particular is the owner's own word for the product. | **High** |
| 59 | **§33 — Share card carries an entity name: `ENTITY / THE WATCHER`** | **missing** | FR-24's card carries case ref, artifact block, status, three-cell stat row, seeded note, footer. **No named-entity concept exists anywhere in the PRD** — Phenomena are classes (Ghost, Bigfoot), never individuals with names. The owner's own share-card mockup has this line. Untagged structural drop. | **Critical** |
| 60 | **§33 — Share card `ACTIVITY 93%`** | covered | `[OVERRIDE]` §4.6 / OQ-1 / A-2 / addendum B.6 — percentages retained on the report. Extensively tagged. | — |
| 61 | **§33 — Share card `ENCOUNTER RARE`** | missing | Depends on the missing rarity vocabulary (#43). FR-24's card has a status word, not an encounter rarity tier. | Medium |
| 62 | **§33 — "investigation score" as a shareable moment** | **missing** | No score system exists in the PRD, no non-goal names it, no addendum mentions it. (Same gap as #10's "best case score".) | **High** |
| 63 | **§33 — "Share output should be beautiful enough that the user does not need to edit it externally."** | covered | FR-24 ("composed to be posted without editing"), addendum I.5. | — |
| 64 | **§34 — Content-driven creature addition; load descriptions, rarity, progression rules without engine change** | covered | FR-7; addendum C.1 (`data/`), E.1 (catalogue rebuild). | — |
| 65 | **§35 — Implementation phases 0–7** | covered | `[OVERRIDE]` addendum A.1 row 14 (Report-first, `Engine → Report → Journal`). Correctly tagged; phases 4–7 land in G.5/G.6. | — |
| 66 | **§36 A — Product critique deliverable** | covered | §1 "Why now", addendum A.3 (rejected alternatives). Fragmented but present. | — |
| 67 | **§36 B — Final product concept** | covered | §1. | — |
| 68 | **§36 C — Information architecture: tabs, screens, navigation, modal/sheet structure** | **missing** | No IA section in PRD or addendum. See #45. | **High** |
| 69 | **§36 D — Complete user flow: install → onboarding → first hunt → first evidence → first encounter → case report → journal → second session** | covered | §2.3 UJ-1…UJ-4. The precise first-evidence / first-encounter micro-sequence is implicit rather than specified. | Low |
| 70 | **§36 E — Per-feature spec incl. required APIs, stored data, edge cases** | covered (partial) | FRs carry purpose + testable consequences; storage and edge cases are in addendum C/E. APIs are in G. | Low |
| 71 | **§36 F — Engine spec **with pseudocode**"** | missing | Addendum C gives the contract, invariants, and tuning table; no pseudocode. | Low |
| 72 | **§36 H — Production TypeScript models** | missing | §0 explicitly defers implementation detail to the addendum; the addendum gives field sketches (`SeedParts`, `SensorFingerprint`) but **no interface bodies**. The demanded deliverable is not in either document. | Medium |
| 73 | **§36 I — SQLite schema** | covered | Addendum E.1 (tables), E.3–E.8. | — |
| 74 | **§36 J — First 4 hunt definitions** | covered | FR-8 (objectives, length bands, tools, completion). | — |
| 75 | **§36 K — UI specification: spacing, hierarchy, card types, button placement, states, animations, haptics, empty states, loading states** | **missing** | Nothing in PRD or addendum. §0 pushes it to `bmad-ux` — defensible, but the demanded deliverable has no owner in this pair of documents, and **empty/loading states are not mentioned anywhere at all** (§4.4's "no tool may present a dead end" is the only trace). | **High** |
| 76 | **§36 L — Asset list classified must-have MVP / later / optional** | **missing** | No asset list. Addendum mentions `assets/store/*` (G.7), sprite sequences (FR-15), and twelve sound categories (I.4) — but no inventory and no classification. | **High** |
| 77 | **§36 M — Implementation backlog / tickets** | covered | §0 defers to `bmad-create-epics-and-stories`. | — |
| 78 | **§36 N — Monetization plan** | covered | Deferred at owner instruction; tagged (A.1 row 13). | — |
| 79 | **§36 O — Analytics plan incl. `subscription_started`** | covered (partial) | Addendum F reproduces the six core events. **`subscription_started` is dropped** (no subscriptions), and §9 A-6 states "the brief named **six**" — **the brief names seven** (§36 O). Minor factual error in the PRD's own assumption. | Low |
| 80 | **§36 P — App Store safety / claim review** | covered | Addendum B.1–B.6, extensively. | — |
| 81 | **§36 Q — 30-day implementation plan** | covered | Addendum G.6; PRD declines to restate a date (reasonable). | — |
| 82 | **§37.7 — "Allow seeded random sessions for debugging"** | covered (partial) | FR-1 enables replay from a Seed; addendum C.5 golden seeds. No stated *debug affordance* for a human to enter a seed. | Low |
| 83 | **§37.18 — "The experience should feel mysterious, not dishonest."** | missing | The principle is enacted throughout (FR-33, addendum B) but never stated as the design law it is in the brief. Tone-level loss. | Medium |
| 84 | **§38 — The three-question product test:** (1) does this make the user feel more like they are conducting a mysterious investigation? (2) does this create a reason to come back tomorrow? (3) could this produce a moment worth recording or sharing? | **missing** | No feature-review heuristic in the PRD or addendum. Addendum J references "the eleven design laws in `brainstorm-intent.md`" but the owner's own three-question filter is not among them and is not reproduced anywhere. | **High** |
| 85 | **§39 — "compare briefly, choose one, explain why"** | covered | Addendum A.3 (rejected alternatives) does exactly this. | — |
| 86 | **§39 — Optimize for: strong MVP, realistic implementation, **viral potential**, **retention**, maintainable codebase, future expansion** | covered | SMs (SM-1 share rate, SM-2 D7), addendum G.6, FR-7. | — |

---

## Part 2 — The qualitative losses

### 2.1 The eight emotional beats were replaced by a jobs-to-be-done frame, and the arc is gone

This is the largest single loss in the reconciliation, and it is invisible in a coverage check because every *feature* the beats imply exists.

The owner's §1 does not present eight feelings as a list of benefits. It presents them as a **sequence the product must walk a user through**: curiosity → tension → anticipation → uncertainty → surprise → collection → progression → shareable "I found something" moments. The order is the design. Curiosity earns the first minute, tension holds the middle, anticipation and uncertainty make the silence bearable, surprise pays it off, and collection / progression / sharing convert one night into the next. Remove any one and the chain breaks — surprise without uncertainty is a jump scare; collection without surprise is a spreadsheet.

The PRD replaces this with §2.1's five Jobs-To-Be-Done. Those are good jobs, and the emotional job ("Let me feel something without lying to me") is arguably a sharper statement of the product's honesty premise than anything in the brief. But a JTBD list is **unordered and non-sequential** — it describes steady-state needs, not a session arc. Nothing in the PRD or addendum tells a designer that anticipation must precede surprise, or that collection is what makes surprise repeatable, or that the progression step exists to make the *next* curiosity cheap. The individual feelings are scattered across §4.1 (tension), §4.6 (surprise→report), §4.8 (collection), §4.9 (progression), §4.7 (sharing) — as features, decoupled from the arc that gives them meaning.

**Consequence:** downstream `bmad-ux` will art-direct each screen for its own feeling and no one will own the transitions between them. The brief's arc is exactly the artifact that would have made the transitions a requirement.

### 2.2 The owner's three-question product test is not carried anywhere

§38 is the brief's decision rule — the thing the owner would use to kill a feature. It reduces to three questions, and the first is the product's north star:

> Does this feature make the user feel more like they are conducting a mysterious investigation?

The PRD has no equivalent filter. It has FRs, non-goals, and eight success metrics — all of which measure outcomes after the fact. None of them tell a contributor in week three whether the feature in front of them belongs. The brief gave the product an immune system; the PRD replaced it with a scoreboard.

The loss is compounded because the answer to question three ("could this produce a moment worth recording or sharing?") *is* SM-1, and question two *is* SM-2. So the PRD has the measurement half and lost the authorship half. A one-line "Design test" callout in §0 or §1, quoting the three questions, would restore it at near-zero cost.

### 2.3 The texture between the FRs: named entities, rarity, and score

Three interlocking concepts in the input are systematically absent, and they are the same kind of loss — **the vocabulary that makes the fiction feel populated rather than procedural**.

- **Named entities.** The owner's own share-card mockup (§33) reads `ENTITY / THE WATCHER`. That is a *specific individual*, not a phenomenon class. The PRD's model has Phenomena (Ghost, Bigfoot, Shadow Person, Alien) and Archetypes (Observer, Stalker, Mimic, Ambusher) — both of them categories. There is no individual, no name, no identity that a user could recognize as "the one I met on the rail trail." The share card lost its most human line, and the encounter lost its most memorable attribute, and neither loss is tagged.
- **Rarity.** The input returns to rarity five separate times: as an evidence attribute (§2 Pillar C), as a journal Evidence sort (§19: newest / rarest / strongest), as a progression vector (§20: "rare evidence"), as a set to collect (§21: "track which rare events the user has seen"), and as a share-card field (§33: `ENCOUNTER RARE`). The PRD's override audit covers only the *probability model* (A.1 row 4) — that per-event lottery was correctly killed. But the audit does not notice that rarity-as-a-label, rarity-as-a-collection, and rarity-as-a-card-field all went with it. A `legendary` boolean survives internally (addendum C.3, tuned to 0.4–0.6% in C.6) and is never surfaced to anyone. The user's deck of rare moments has no face.
- **Score.** "Best case score" (§19) and "investigation score" (§33) appear in two different parts of the brief and in no part of the PRD. There is no score system, no non-goal declaring a score out of scope, and no addendum note. It is the kind of thing that was probably killed deliberately during the brainstorm — a score is a verifiable number and it fights the anti-gamification stance — but it was killed silently, which means a downstream contributor reading §33 will try to build it.

### 2.4 The shadow of the "fake radar animation" — the framing the product was built to avoid

The brief's §2 Pillar D and §16 both carry an explicit anti-goal that the PRD never adopts: **fear should come from anticipation, not from cheap jumpscares**, and the encounter should be rare because *if every session guarantees a ghost, the experience becomes predictable*. The PRD agrees with all of this — §4.1 protects silence, §5 says the app is "not designed around jump scares" — but the brief's version is a *positive design instruction*, and it is where the Shadow Person findings come from.

§16 specifies Shadow Person with `movement warnings`, `direction hints`, `peripheral events`, and a rare **"behind you" event**. FR-8 flattens Shadow Person to one line: *"indoor, slow and tightening, haptic and glitch-led, 8–20 minutes, tools Camera/Radar/EMF."* The environment is right, the pacing is right, the failure state (`NOTICED`) is right — and the one moment a Shadow Person player would tell a friend about is gone. The same shape of loss recurs at §12 (the engine-inserted "possible anomaly marker" in EVP, dropped), §10 (radar targets that `retreat` or `split into noise`, dropped), §13 (the radar reticle overlay, dropped), and §4 (the cold-spot simulation, dropped). Individually each is a detail. Collectively they are the reason the four Hunts might feel more similar in the build than they read on paper — which is precisely the failure §4.2's own Notes ("so downstream tickets cannot quietly flatten the four Hunts toward a common shape") was written to prevent.

### 2.5 The framing drift in §32, and `simulator`

The owner's §32 names four phrases the product should prefer, and one of them is the owner's own category word: **"paranormal investigation simulator."** The brief uses "simulation" as the product's self-description five times across §1, §2, §14, and §32. The addendum's approved market-term list (B.3) keeps none of the four phrases and adds two words — `spooky`, `adventure` — that appear nowhere in the brief. The PRD's subtitle is "Paranormal field journal", which is defensible on its own terms and is a better shelf description than "simulator". But the owner wrote the word, and the change from `simulation` to `journal` is the difference between a product that says *we are pretending* and a product that says *we are recording*. Given that §1's entire honesty thesis rests on the app being openly a fiction, that is a positioning decision the owner should have been shown rather than absorbed.

### 2.6 Deliverable gaps — the brief asked for four artifacts that have no owner

Four of the §36 deliverables are absent from both documents, and none is attached to a downstream workflow in §0's hand-off table:

| §36 item | Status |
|---|---|
| **C — Information architecture** (tabs, screens, navigation, modal/sheet structure) | Absent. §0 hands design to `bmad-ux` implicitly, but the IA is a *product* decision — the tab count is on the never-cut list (addendum G.6) and is never enumerated. |
| **K — UI specification** (spacing, hierarchy, animations, **empty states**, **loading states**) | Absent. `bmad-ux` will cover most of it; empty and loading states are named nowhere in either document, which for an app whose thesis is that nothing happens most nights is a conspicuous omission. |
| **L — Asset list**, classified must-have / later / optional | Absent. No inventory exists despite FR-15's sprite sequences, addendum I.4's twelve sound categories, and addendum G.7's `assets/store/*`. |
| **H — Production TypeScript models** | Absent. Addendum A.2 records *renames* and C.3 sketches `SeedParts`, but no interface bodies are reproduced anywhere. |

### 2.7 Two findings about the PRD's own audit

Recording these here because they undermine the confidence a reader should place in the override tags generally:

1. **An `[OVERRIDE]` tag is attached to a demand the owner never made.** §4.4 and §4.10 tag the removal of a Home tool grid and an Equipment tab as overrides of the brief. The brief's §2 says *"Do not expose every tool on the home screen. Tools should appear inside the hunt flow,"* and §23 says *"Think critically about whether Equipment deserves its own tab. Do not create unnecessary tabs."* The decision matched the owner's instruction; the tag claims it contradicted one. A reader auditing the tags would conclude the owner had wanted a tool grid — the reverse of the truth.
2. **§9 A-6 miscounts the brief.** It states "the brief named six" analytics events. §36 O names seven (`subscription_started` included). Minor in itself, but it is the kind of error that occurs when a claim about the source is made from memory rather than from the source — which is the failure mode this reconciliation exists to catch.

Both are fixable in a line. The first should be corrected in §4.4 and §4.10 (and addendum A.1 row 8) so the audit trail stays trustworthy; the second in §9 A-6.

---

## Part 3 — Recommended actions, in priority order

1. **Add the eight-beat emotional arc to §1**, as an ordered sequence, and say explicitly which FRs serve each beat and in what order they fire. (Fixes #1.)
2. **Add the §38 three-question design test** as a normative callout in §0 or §1. (Fixes #84.)
3. **Resolve the named-entity question** — decide whether v1 ships individually-named entities (`THE WATCHER`), and if not, record it as a tagged override with the reason. (Fixes #59.)
4. **Re-import rarity as a label, not a probability model**: an evidence attribute, a journal sort, a card field, and a collected-set of rare events. (Fixes #7, #10, #21, #40, #41, #43, #61.)
5. **Decide the score's fate** — build it or write it as a non-goal. (Fixes #62.)
6. **Correct the misrepresented override tags** in §4.4 / §4.10 / addendum A.1 row 8, and add `[OVERRIDE]` tags to the §32 positioning-language swap, the §17 lock-on/confirmation ban, the Pillar C `Possible match BIGFOOT` ban, and the §16 Shadow Person reductions. (Fixes #6, #9, #23, #33, #34, #47, #58.)
7. **Close the four deliverable gaps** (§36 C, H, K, L) by naming an owning workflow for each in §0's hand-off table. (Fixes #68, #72, #75, #76.)
8. **Restore the small drops** — cold-spot evidence, EVP waveform and engine-inserted anomaly marker, radar reticle, radar retreat/split, the five unnamed future creatures, `SensorSnapshot`'s removal note. (Fixes #15, #17, #26, #27, #28, #53.)
