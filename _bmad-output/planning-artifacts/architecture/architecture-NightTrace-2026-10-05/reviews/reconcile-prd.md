---
title: Input Reconciliation Review — PRD/Addendum → ARCHITECTURE-SPINE
status: final
created: 2026-10-05
reviewer: input-reconciliation
source:
  - ../../prds/prd-NightTrace-2026-10-04/prd.md
  - ../../prds/prd-NightTrace-2026-10-04/addendum.md
target: ../ARCHITECTURE-SPINE.md
verdict: 8 genuine gaps — 2 structural (missing AD), 3 cross-surface prohibition clusters, 3 partial
---

# Input Reconciliation — did the spine carry what the PRD required?

**Question asked:** for every FR, UJ, SM, ratified override, and addendum section, did the spine **carry** it (an AD, a convention, the capability map, or a Deferred entry names it), or is it **legitimately silent** because it is not architecture? This review hunts **silent drop-outs**, not quality. Quiet requirements — a tone, a prohibition, a "never told" — are called out because an AD-structured spine tends to lose them; they have no requirement id to hang on.

**Headline:** the spine is strong on the engine contract (§C), persistence (§E), analytics (§F), platform (§G.1–G.6) and the claims lint. It drops the **entire accessibility section (§H)**, the **First-Run Directive as a rule (FR-3)**, and a **cluster of cross-surface prohibitions** — the "no surface may Z" class that AD-15 and AD-16 exist for but only half cover.

---

## 1. Coverage ledger

Legend: **C** carried · **P** partial · **GAP** dropped · **silent-OK** not architecture.

### Functional requirements

| FR | Topic | Status | Where (or why not) |
|---|---|---|---|
| FR-1 | Seeded Session generation | **C** | AD-3, AD-4 |
| FR-2 | Uncertainty-protecting direction | **C** | AD-5, AD-6 |
| FR-3 | **First-Run Directive** | **GAP** | Only referenced inside AD-19's Binds; no AD states the rule |
| FR-4 | Tension state | **P** | `TensionEngine.ts` modelled; "never displayed / never announced / never exposed to AT" not carried |
| FR-5 | Sensor fallbacks | **C** | AD-13, Deferred (sampling ladder) |
| FR-6 | Four Archetypes | **C** | AD-7 |
| FR-7 | Content-only expansion | **C** | AD-7, AD-9 |
| FR-8 | Per-Hunt binding | **C** | capability map §4.2; bands/tool sets are content |
| FR-9 | Hunt Brief ritual | **C** | capability map §4.3 |
| FR-10 | Intensity select/lock | **C** | AD-20 names the four levels |
| FR-11…FR-17 | Seven tool surfaces | **P** | capability map §4.4; per-tool *prohibitions* (FR-13, FR-16, FR-17) dropped — see G-4 |
| FR-18 | Evidence capture | **C** | AD-11, AD-18 |
| FR-19 | Signature convergence | **P** | AD-8 covers status; the *no-progress / no-unlock* prohibitions dropped — see G-4 |
| FR-20 | Triage ritual | **C** | AD-8 (incl. "no copy may state what combination unlocks what") |
| FR-21 | Status derivation | **C** | AD-8 |
| FR-22 | Case Report rendering | **C** | AD-15 |
| FR-23 | Report integrity | **P** | AD-16 carries the entertainment line; seal-irreversibility / revision stamp unstated |
| FR-24 | Share Card composition | **P** | AD-15/AD-16; card hard-exclusions dropped — see G-4 |
| FR-25 | Journal archive | **P** | capability map §4.8; "no locked entries, no silhouettes, no unlock requirements" dropped — see G-4 |
| FR-26 | Private by default | **P** | "no network call, ever" carried; no-feed/no-social unstated (minor) |
| FR-27 | Export & deletion | **P** | capability map §4.8; "export includes the entertainment notice" dropped — see G-5 |
| FR-28 | Clearance advancement | **C** | AD-20 (five ranks) |
| FR-29 | Streaks & badges | **silent-OK** | not architecture |
| FR-30 | Home & Anomaly | **C** | AD-19 (incl. not-shareable) |
| FR-31 | Field Note mode | **C** | capability map §4.11 |
| FR-32 | Onboarding & consent | **P** | capability map §4.12; the three-layer placement dropped — see G-5 |
| FR-33 | No real-world assertion | **C** | AD-16 |
| FR-34 | Contested Evidence | **P** | capability map names FR-34; "nothing tells the user an item is contested, nothing congratulates them" dropped — see G-4 |
| FR-35 | Named no-event outcomes | **C** | AD-5 |
| FR-36 | Negative space | **C** | capability map §4.1 |
| FR-37 | Observer inversion | **P** | capability map §4.2; **"the app never tells the user any of this"** dropped — see G-4 |
| FR-38 | Posture gating (Bigfoot) | **C** | capability map §4.2 |
| FR-39 | Mimic/Alien separation | **C** | AD-7, AD-18 |

Neither FR-2's "≥0.70 explained-ratio…" nor any tuning value is expected in the spine (Deferred covers §C.6) — correct.

### Journeys / metrics / overrides

- **UJ-1…UJ-4** — frontmatter binds all four; only UJ-1/UJ-4 appear in AD text. Journeys are **silent-OK** (not architecture); the frontmatter **overstates** coverage.
- **SM-1…SM-8** — SM-1, SM-5, SM-6, SM-7, SM-8 carried (AD-21, AD-15). **SM-2, SM-3, SM-4 not carried**; **SM-C1, SM-C2, SM-C4 not carried** (only SM-C3 via AD-19). Counter-metrics are **silent-OK** as requirements, but the frontmatter's `SM-1 … SM-8` binding overstates.
- **§A.1 14 ratified overrides** — rows 1, 2, 5, 7, 10, 11, 13 carried (AD-15, AD-20, capability §4.11, §4.4, AD-21, Stack). **Row 4 (rarity gated, not drawn)** partial — Deferred holds the *values*, not the *rule*. **Rows 3, 6, 8, 9, 12, 14** land only through AD-20's precedence rule or AD-15's general number ban — acceptable, but row 6 (8-wind bearing) and row 12 (glitch-only overlays) have no explicit home (§4.4/UX).

### Addendum sections

| § | Topic | Status |
|---|---|---|
| §B | Claims boundary (banned terms, line, 40-row table) | **C** — AD-16 (lint + surface set + entertainment constant); the 40-row table itself is content, correctly not reproduced |
| §C | Engine contract | **C** — AD-1…AD-7, AD-18; C.12 invariants all landed; C.6/C.7/C.9/C.10/C.11 correctly deferred as implementation |
| §D | Sensors / degradation | **C** — AD-13 |
| §E | Persistence | **C** — AD-9, AD-10, AD-11, AD-22, Media convention |
| §F | Analytics | **C** — AD-21 |
| §G | Platform / tooling | **C** — AD-23, Stack; **§G.7 privacy invariants partial — see G-6** |
| §H | **Accessibility** | **GAP — see G-1** |
| §I | Tone / visual | **P** — §I.3 icon (AD-17 tokens); §I.1 voice rules and §I.4 haptics-drop rules not carried (see non-architecture list) |
| §J | Glossary extensions | **P** — `Emission`, `Tick`, `ContentVersion`, `SessionDirective`, `ArchetypeEffect` covered by AD-1/3/4/6/7; **`Attunement` and `Rarity band` absent** — see G-3, G-7 |

---

## 2. Genuine gaps

### G-1 — §H Accessibility: the entire section is absent. *(architecture — belongs in the spine)*
**Source:** PRD §6.1 (accessibility baseline), addendum §H.
The spine has **no accessibility AD and no capability-map row** (`VoiceOver`, `TalkBack`, `Reduce Motion`, `contrast`, `orientation` all return zero hits). Not landed:
- Screen-reader navigability for the Case Report and Field Journal; live regions limited to evidence capture and phase change.
- **Hidden scalars are never announced — Tension, Attunement, rarity, and Seed never reach assistive technology.** This is a hard invariant and it is the AT half of FR-4.
- Dynamic Type to 200%, with the intensity rail and tool row capped at 140%.
- Reduce Motion: cross-fades replace transitions, the sweep goes static, **glitch is disabled and re-routed to audio**, radar dots animate statically at 0.5 Hz. (This directly conditions AD-15's "glitch" and AD-17's motion tokens.)
- Contrast ratios; portrait lock except the Camera and Sky surfaces.
**Why it matters:** a spine that carries AD-15 (no measurement-shaped readout) but not "no hidden scalar reaches assistive tech" has carried the sighted half of the honesty rule and dropped the other. Recommend one cross-cutting AD plus a capability-map row.

### G-2 — FR-3 First-Run Directive is not carried as a rule. *(architecture — belongs in the spine)*
**Source:** PRD FR-3, §4.1, §9 A-4.
The spine mentions FR-3 **only** inside AD-19's `Binds` line and its `Prevents` sentence (Anomaly). No AD states the directive itself:
- With zero sealed Cases the emission budget is forced to ≥ 1 and ≥ 5 minutes of silence elapse before the first emission.
- The first Evidence emission in a first-run Session is capture-eligible.
- The directive is not applied once the user has sealed ≥ 1 Case.
- It is **invisible** — no copy, indicator, or behaviour the user can detect as special.
This is a bounded departure from engine honesty with its own fail-mode (A-4), i.e. exactly AD-shaped. It is the one engine rule the spine's own AD-19 leans on to make SM-C3 coherent, and the spine never states it.

### G-3 — FR-4 / §J: hidden scalars (Tension, Attunement, rarity) are ungoverned. *(architecture)*
**Source:** FR-4, addendum §J, §H.
The spine names `TensionEngine.ts` and classifies tension as recomputable (AD-10), but never carries **"the tension value is never displayed, announced, or exposed to assistive technology"** nor **"tension influences Encounter probability but never guarantees an Encounter."** `Attunement` — the hidden `clamp01` scalar that gates the `QUIET`→`SIGNALS`→`ACTIVITY` transitions (addendum §J) — does not appear in the spine at all. Rarity's rule (row 4: gated by phase × tension × budget, Legendary a per-Session flag) is not stated; Deferred holds the numbers, not the rule.

### G-4 — Cross-surface prohibitions ("no surface may Z") are dropped. *(architecture — the AD-15/AD-16 class)*
**Source:** FR-13, FR-16, FR-17, FR-19, FR-24, FR-25, FR-30, FR-34, FR-37.
AD-15 bans the *number* and AD-16 bans the *word*. Neither carries the third prohibition class the PRD relies on: **a truthful mechanic must not be described in words that overstate it.** Specifically not landed:
- **FR-37:** *"The app never tells the user any of this"* — no tutorial, hint, tooltip, or line of copy connects stillness to safety. The deliberate non-instruction is the requirement, and it has no home.
- **FR-19:** no progress readout toward a match, no stated unlock requirement, no completion count, no per-Phenomenon checklist; the `?` tile is never labelled, captioned, or coach-marked.
- **FR-25:** the Journal shows no locked entries, no silhouettes, no unlock requirements.
- **FR-13:** no surface copy states or implies anything was received, transmitted, heard, or contacted.
- **FR-16:** the Tracker's disclosure (proximity is inferred from the user's own movement) is reachable **from the surface itself**.
- **FR-17:** the Sky capture's *generated* marking travels with the image into the ledger, reel, report, and Share Card.
- **FR-24 / FR-30:** Share Card hard exclusions (no watermark, URL, QR, badge, attribution); the Anomaly is not shareable as a standalone image.
- **FR-34:** nothing tells the user an item is contested before triage; nothing congratulates them after.
AD-16 acknowledges images and mechanics as lint blind spots but supplies only a *release-review* item, not a rule. Recommend one AD: "a truthful mechanic is never described in copy that overstates it; the enumerated prohibitions above are the enforcement surface."

### G-5 — §B.5 three-layer disclaimer placement + export obligation. *(partly architecture)*
**Source:** addendum §B.5, FR-27, FR-32.
AD-16 carries the lint and the entertainment-line constant, but not: store-listing sentence two within the first three lines; onboarding screen one non-skippable requiring `I understand`; the permanent About notice reachable from Profile and **included in any data export**; the About notice's enumerated sections. The export clause is a persistence/service obligation (architecture); the placement is implementation/UX.

### G-6 — §G.7 privacy invariants. *(architecture — schema-level)*
**Source:** addendum §G.7.
Not landed: **"No coordinates appear on any Case Report"** (AD-21 restricts coordinates in *analytics* only — the report surface is unstated), and **"only two free-text columns exist in the entire schema"** — the privacy budget that keeps every added text column an explicit decision. Both are schema/model invariants of the same family AD-10 and AD-14 already govern.

### G-7 — §C.8 phase composition and the user-visible ladder are partial. *(architecture — engine invariant)*
**Source:** PRD FR-4, addendum §C.8, §10 row 4.
AD-20 names "five phases," which is the load-bearing half (the count is baked into the RLE replay digest, so a six-phase build cannot replay a five-phase session). But the spine never states the ladder itself — `QUIET` → `SIGNALS` → `ACTIVITY` → `ENCOUNTER_WINDOW` → `RESOLUTION` → `ENDED` — nor the **separate four-word user-visible state** (`QUIET` → `LISTENING` → `ACTIVE` → `CONTACT`) rendered as a hairline, nor that "the user is never told what either means." Given §10 row 4 exists precisely because the phase count is a replay-corrupting defect, one line belongs in AD-3 or AD-20.

### G-8 — Build order: report-first is unstated. *(architecture-planning — marginal)*
**Source:** §A.1 row 14, addendum §G.5.
Override 14 ratified Report-first (`Engine → Report → Journal`; the Case Report and Share Card built *before* any tool). The spine defines the stack and the tree but states no build sequence. This is sequencing/epics material more than an invariant — flagged as the weakest of the eight.

---

## 3. Legitimately silent (not architecture) — recorded so it is not mistaken for a drop-out

- **FR-8** objective lists, length bands, tool bindings — content (capability map names §4.2).
- **FR-12** radar target rules, **FR-18** ≤1.5 s coalescing and `null_reading` copy, **FR-20** reason set, **FR-21** threshold tuning — implementation/content.
- **FR-23** 600 ms hold, **FR-29** streaks and badge stamps, **FR-30** Home layout — UI/implementation.
- **§C.6/C.7/C.10/C.11** tuning targets, cooldowns, EMA stages, radar internals — correctly deferred (Deferred entry names §C.6).
- **§E.5/E.8** retention windows and storage budgets — implementation.
- **§I.1** voice rules (nine-word cap, "ghost" only in the Hunt name, never assert/wink) and **§I.4** haptics ("a no-op, not an error, where the OS suppresses them"; no continuous vibration) — tone/implementation, no architectural enforcement surface. Worth a UX/content ticket, not a spine AD.
- **§I.3** the lavender icon — explicitly non-binding (addendum), correctly not carried.
- **SM-2/SM-3/SM-4** and **SM-C1/SM-C2/SM-C4** — measurement/eval concerns, not architecture.

## 4. Note for the spine author

The frontmatter binds `FR-1 … FR-39`, `UJ-1 … UJ-4`, `SM-1 … SM-8` as a blanket range while the body carries FR-3 only by reference, no UJ beyond 1/4, and SM-1/5/6/7/8/C3 only. Either the gaps above close, or the frontmatter should enumerate the ids the spine actually binds — a blanket range reads as coverage the document does not have.
