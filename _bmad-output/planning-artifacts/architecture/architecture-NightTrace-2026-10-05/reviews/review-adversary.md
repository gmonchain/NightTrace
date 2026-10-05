---
title: Adversarial review — ARCHITECTURE-SPINE.md
target: architecture/architecture-NightTrace-2026-10-05/ARCHITECTURE-SPINE.md
method: construct two letter-compliant units one level down that still build incompatibly
status: findings
created: 2026-10-05
---

# Adversarial review — NightTrace architecture spine

**Verdict: NOT READY.** Eight pairs of units were constructed that each obey AD-1…AD-23 to the letter, every convention, and the functional-core paradigm, and still build mutually incompatible systems on disk. Four of the eight are schema-shaping and therefore expensive under AD-22.

**Method.** For each finding I named two units (an epic, a service, or a tool surface), confirmed that each satisfies every AD and convention it touches, and showed the exact point at which their outputs diverge. The fixes are one-line tightenings or one new AD each; I have not proposed a rewrite.

---

## F1 — The evidence commit has no owner: presenter or tool action handler

**Units.** (A) `useSessionPresenter` + `services/EvidenceService.ts` + `db/repositories/Evidence*`. (B) The seven tool surfaces in `features/{emf,radar,voice,evp,camera,tracker,sky}` + their action hooks in `store/sessionStore`.

**ADs obeyed.** AD-2 (exactly one node maps emissions to haptics/audio/store/UI; "any code outside the presenter that reads an `Emission` is a defect"). AD-11 (evidence commits at the moment of capture, never at session end). AD-10 (evidence is user data → in SQLite before the screen closes). AD-18 (the ten-kind vocabulary).

**Incompatibility.** AD-2's enumerated responsibilities for the presenter are *"haptics, audio, store writes, and UI"* — **evidence is not on that list** — and AD-2's `Binds` is `engine/**`, `features/**`, `audio/**`, `haptics/**`, `store/**`, which **omits `src/services/**` entirely**. AD-11 binds `SessionService.ts` and `EvidenceService.ts`. Neither AD says where the `commit()` call originates.

- Builder A reads the emission inside the presenter and calls `EvidenceService.commit(emissionPayload)`.
- Builder B calls `EvidenceService.commit(storePayload)` from the `LOG THIS SPOT` / `MARK` / `CAPTURE` / `LOG BEARING` handler. This is fully compliant: the handler reads the **store**, not an `Emission`, so AD-2's defect clause never fires, and the presenter keeps doing its four listed jobs.

Both are letter-perfect and they diverge permanently on: (1) which layer decides capture-eligibility, so FR-3's *"the first Evidence emission is guaranteed to be capture-eligible"* is a structural property in A and a re-derivation in B; (2) whether `kind`, `certainty`, `phase`, and `source` come from the emission or from a store mirror — note AD-18 fixes `kind` but the spine never states the emission carries it; (3) FR-18's 1.5-second coalescing rule lives in the service in A and in the store in B; (4) FR-18's dry-log `null_reading` is a service branch in A and a tool branch in B.

**Fix (tighten AD-2).** Add `src/services/EvidenceService.ts` to AD-2's `Binds`, add evidence commits to the presenter's enumerated responsibilities, and add one sentence: *"The engine's `Emission` carries the evidence payload (kind, certainty band, channel, tool, phase, source); a capture is committed by the presenter and by nothing else."*

---

## F2 — `Case` is a first-class entity everywhere except the schema, and `sessions.status` has no lifecycle

**Units.** (A) `db/repositories/Journal*` + `features/journal` — must list Cases, show the unsealed-case tab dot (FR-25), render a `NO CASE` chip on orphaned evidence, and count `CASES SEALED` in the Overview stat row. (B) `services/SessionService.ts` + `services/CaseReportService.ts` + `db/mappers/*` — the write side.

**ADs obeyed.** AD-9 (two table families; FKs only within the user family). AD-11 (a row on start with `status='active'`; checkpoint; seal in one transaction). AD-12 (SQL only in repositories). AD-14 (branded ids). AD-22 (shipped migrations immutable).

**Incompatibility.** The ERD has **no `cases` table**; `EVIDENCE` hangs off `CASE_REPORTS` (`CASE_REPORTS ||--o{ EVIDENCE : "ledgers"`), and `SESSIONS ||--o| CASE_REPORTS : "seals at most one"`. But the naming convention makes §3 Glossary normative — *"A Case is the container for a Session's output"* and *"one Session produces at most one Case"* — and four surfaces need a Case that is not a report: the unsealed-case dot, the `NO CASE` evidence chip, `CASES SEALED`, and FR-31's Field Note (a Journal entry with **no Case**). "Unsealed case" cannot mean "session without a report row" while `CASES SEALED` counts reports, because the Journal lists *cases*. Builder A adds a `cases` table with `case_reports.case_id`; Builder B keeps `case_reports` as the Case and adds `evidence.case_id`. Both satisfy AD-9/AD-12/AD-14, both are valid under AD-22, and the two schemas are mutually exclusive — AD-22 then forbids reconciling them without a destructive migration.

**Second half — the lifecycle.** AD-11 names exactly one status literal (`status='active'`) and never states the terminal set or who promotes a row. PRD §6.2 says *"Nothing resumes a Session mid-stream"*; FR-30 says Home presents *"a resume affordance when a Session was interrupted."* Builder A treats a live `active` row on foreground as **resume** (replay the digest, continue). Builder B treats it as **seal-from-checkpoint**, extending AD-11's battery path. Each obeys AD-11; the `sessions.status` enums differ, the Journal contents differ, and the "under sixty seconds → no report at all, the case is discarded" rule (EXPERIENCE.md) has no defined effect on already-committed evidence.

**Fix (new AD-24 — "The Case is an entity, and a session has a lifecycle").** Define `cases` as its own user table; state `sessions.status ∈ {active, sealed, discarded}` with the legal transitions and the owning service for each; state that `evidence.case_id` survives case deletion as `NO CASE`; and state which of FR-30 vs §6.2 wins on foreground resume.

---

## F3 — AD-10 forbids persisting exactly the values a sealed report must freeze

**Units.** (A) `services/CaseReportService.ts` (the sealer). (B) `features/report` + `services/ShareCardService.ts` (the renderers).

**ADs obeyed.** AD-10 (clause 1: recomputable values must not be persisted; clause 2: what the user would be angry to lose must be in SQLite). AD-3 (replay reconstructible from `seed + hunt_id + content_version + tick_digest[]`; a `ContentVersion` bump *"deliberately breaks replay parity"*). AD-8 (status is a pure function reading the slot count *"from the case"*). AD-15. FR-23 (a sealed report can never be altered), FR-24 (a re-render is visually identical).

**Incompatibility.** Every value that makes up the sealed report — status, activity band, encounter count, source count, the 7–9 slot count, the negative-space lines, the narrative lines, the seeded field note, the seal variant — is recomputable from `(seed + content version + tick log)`. **AD-10 clause 1 therefore forbids persisting all of them.** But AD-3 guarantees that the next content drop changes what recomputation yields, which would silently mutate a document FR-23 calls immutable and FR-24 requires to re-render identically. Builder A persists a frozen report snapshot in a `report_snapshot` column, leaning on clause 2 and FR-23. Builder B recomputes at render from the seed, leaning on clause 1. **AD-10 states no precedence between its own two sentences, and the spine never names a frozen snapshot.** Under Builder B, FR-24's "visually identical image" is unsatisfiable after any drop.

The same shape recurs one level up: FR-28's Clearance rank is recomputable from cases/discoveries/signatures (so clause 1 says do not persist it) but is exactly what clause 2 calls anger-inducing to lose. Builder A persists `user_progress.clearance`; Builder B recomputes it at render — and then a deleted case retroactively demotes a rank the user already saw.

**Fix (tighten AD-10, one sentence).** *"AD-10 governs live session state only. From the moment a Case is sealed, the values that constitute its report are persisted as the record and are never recomputed, because AD-3 guarantees a content-version bump would change them. Persisted-but-recomputable is the correct answer for a sealed Case Report and for nothing else."*

---

## F4 — AD-4's closed fork set and AD-7's content-only expansion cannot both hold

**Units.** (A) `engine/RandomEngine.ts` + `engine/archetypes/registry.ts`. (B) A content drop: `data/archetypes/**` + `data/hunts/**` adding a fifth Phenomenon whose behaviour needs its own randomness stream.

**ADs obeyed.** AD-4 (*"the label set is closed: `rng.session`, `rng.events`, `rng.radar`, `rng.words`, `rng.encounters`, `rng.report`, `rng.signals`. A new feature takes a **new** fork label; it never draws from an existing one."*) AD-7 (*"Adding a phenomenon is one content definition, its assets, a registry entry, and a content-version bump… No file under `src/engine/` contains a phenomenon name"*, and its `Prevents` names *"adding a phenomenon becoming an engineering task"*). AD-3 (the digest is the replay key).

**Incompatibility.** A content-authored behaviour needing its own draws satisfies one AD only by breaking the other. Builder A has the new archetype fork `rng.events` — no engine diff, AD-7 satisfied, and AD-4's whole reason for existing (draw-order coupling: *"adding a draw in one silently shifts every value the other produces"*) is voided for the new archetype. Builder B adds an eighth label — AD-4's "a new feature takes a new fork label" satisfied, but the label set is declared **closed**, so this is an engine diff and AD-7 fails. Both drops pass `ad-7`'s registry test and AD-4's no-reuse test only on the side each chose. Because the fork name is the deterministic replay key (AD-3), the two choices are not interchangeable after the fact.

**Fix (tighten AD-4, one sentence + one carve-out in AD-7).** State that the seven labels are the closed set **of purposes for v1**, and that a content-driven behaviour receives a namespaced derived label allocated from a closed *grammar*: `fork('rng.content.' + definitionId)`. This adds a substream per content definition with no engine edit and no shared stream.

---

## F5 — The Sky `GENERATED` marking: burned into pixels, or re-applied by every reader?

**Units.** (A) `sensors/` + `features/sky` capture path (the writer of the image). (B) `services/ShareCardService.ts` + `features/report` + the evidence ledger and souvenir reel (the readers FR-17 requires it to survive into).

**ADs obeyed.** The Media convention (*"Files on disk under `Paths.document/cases/<caseRef>/`; rows store `relative_path`, `mime`, `bytes`, `duration_ms`, `checksum`. Never a BLOB."*). AD-10 (a `generated` flag is derivable from the evidence kind `sky_light` → recomputable → must not be persisted). AD-15. AD-16 (which names this exact leak in its blind-spot list but assigns no mechanism).

**Incompatibility.** FR-17: *"The generated label travels with the capture… into every surface it later appears on — the evidence ledger, the souvenir reel, the report, and the Share Card artifact block."* Builder A composes `GENERATED` into the stored pixels at capture; the file is self-describing and the media row stays exactly the five columns the convention names. Builder B stores a flag and re-applies the overlay per surface; the file stays clean, but the media row now needs a sixth column the convention does not list, and a surface that forgets the overlay drops the marking. AD-10 pushes toward A (derivable → don't persist); the convention's closed column list pushes toward A as well; but **no AD assigns the mechanism**, so B is fully compliant — and the two produce different bytes for the same capture, so FR-24's perceptual-identity requirement holds for one builder and not the other. AD-16 correctly identifies that the string lint cannot see this; the spine then leaves the mechanism unowned.

**Fix (tighten the Media convention + AD-18).** One sentence: *"A marking that must travel with a capture — the Sky `GENERATED` label — is composed into the stored pixels at capture. No surface may re-derive it, and a display-time overlay does not satisfy the requirement."*

---

## F6 — Two owners of the live session's clock and phase

**Units.** (A) `store/sessionStore` + `useSessionPresenter`. (B) `services/SessionService.ts` + `services/Clock.ts`.

**ADs obeyed.** AD-1 (*"The host supplies elapsed time and user actions, each carrying its own timestamp"* — the host is never named). AD-2 (the presenter writes the store). The Dates & time convention (*"The engine speaks only `SessionMs` (elapsed) and `TickIndex`. `EpochMs` is produced only by `services/Clock`"* — which names the producer of `EpochMs`, **not of `SessionMs`**). The State-mutation convention (*"Only `services/*` and `store/*` mutate"*). Both `store --> engine` and `services --> engine` are drawn in the spine's own graphs.

**Incompatibility.** Both builders satisfy every arrow. Builder A advances the tick in a session-store action and holds `SessionMs` as store state. Builder B advances it in `SessionService`, owning the elapsed accumulator and mirroring it into the store. They produce the identical emission stream for a fixed digest, so nothing catches the difference — but AD-11's *"updates elapsed time"* needs one authoritative `SessionMs` to read the 60-second checkpoint boundary from, and a background/foreground transition (EXPERIENCE.md: *"A session does not advance while the phone is in a pocket… On foreground, a two-second re-calibration grace period"*) is re-derived in one builder and frozen in the other. Divergent `session_ticks` digests and a divergent crash-loss window follow.

**Fix (tighten AD-11).** Name `services/Clock` as the single producer of `SessionMs` inside a live session; state that the store holds only a render mirror; state that the checkpoint boundary is read from that same value.

---

## F7 — `Evidence.source` is undefined, so the report's `SOURCES` count means two different things

**Units.** (A) `engine/rules/evidence.ts` + `engine/models/Evidence.ts`. (B) `db/mappers/*` + `db/repositories/Evidence*` + `features/report`'s stat row.

**ADs obeyed.** AD-14 (branded ids, `readonly`, discriminated unions, `null` not `undefined`, no `any`). AD-18 (the kind vocabulary is the closed ten). AD-15 (counts of things that happened are permitted numerals).

**Incompatibility.** FR-18 says Evidence carries *"a kind, a certainty band, a channel, the tool that produced it, the phase it occurred in, and its source."* AD-18 fixes **only `kind`**. The spine types `channel`, `tool`, `phase`, and `source` nowhere, yet AD-8/FR-22 make the report's stat row count `source` and AD-15 blesses it. Builder A reads `source` as the producing sensor channel (a closed six-way union), so `SOURCES 03` counts channels and `channel` duplicates it. Builder B reads `source` as the emission's origin (`rng.events` / `rng.signals` / `archetype:<id>`) and `channel` as the sensor — so `SOURCES` counts emission origins. Both compile under AD-14, both map identically under AD-12, both pass AD-18, and AD-15 cannot arbitrate because both are counts of things that happened. The persisted `evidence` columns and the number on the hero screen disagree. This is not cosmetic: addendum §F.2 already makes `channel` load-bearing for the `evidence_found{kind, channel, strength, withMedia}` metric.

**Fix (tighten AD-18).** Extend the closed-vocabulary rule from `kind` to the whole `Evidence` shape: enumerate `channel` (the six sensor channels from addendum §D.1), `tool` (the seven surface ids), `phase` (the five phases), and define `source` once — then state which field the report's `SOURCES` count counts.

---

## F8 — Two owners of the finish transaction's progression write

**Units.** (A) `services/SessionService.ts`'s seal transaction. (B) `services/ProgressionService.ts` + `db/repositories/Progression*` (the capability map assigns §4.9 to these).

**ADs obeyed.** AD-11 (*"Finish is a single transaction that seals the report, discoveries, badges and progression"*). AD-10 (Clearance is recomputable from sealed cases, documented Phenomena, and matched Signatures → clause 1 says do not persist; clause 2 says the user would be angry to lose it). AD-12.

**Incompatibility.** AD-11 assigns the **write**; no AD assigns the **computation**, and `ProgressionService` exists in the capability map with its own repositories. Builder A computes Clearance inside the seal transaction (`user_progress.clearance` written atomically). Builder B writes the seal, then has `ProgressionService` recompute the rank at the next Home render from the repository (ADR-10 clause 1), which AD-11 tolerates if "seals progression" is read as "progression becomes visible then." The two diverge observably: B's rank is not transactional with the seal and can change retroactively if a case is later deleted; A's cannot. FR-28's `matched Signatures` input is itself AD-8's pure function over non-persisted state, so B's recompute crosses a content-version boundary that A's frozen write does not.

**Fix (tighten AD-11 or AD-24).** State that the seal transaction is the sole writer of `user_progress`, `badge_awards`, and `discoveries`, name the service that computes their inputs, and state that a sealed Clearance rank is a frozen value on the same terms as the report (F3).

---

## Checked and *not* reported — the spine already handles these

Recorded so the findings above are not mistaken for gaps already closed: the two table families and the no-crossing FK rule (AD-9); the commit-on-find vs checkpoint split itself (AD-11); the `%` ban and the enumerated lint surface set (AD-15/AD-16); the single exported entertainment constant; the presenter as the only emission consumer *as a count of one* (AD-1/AD-2 — F1 is about the commit's origin, not about there being two presenters); status derivation's thresholds and the no-copy rule (AD-8); the evidence-kind two-layer resolution and the alias test (AD-18); fork-label isolation *as a principle* (AD-4 — F4 is about closure vs expansion); the analytics non-FK (AD-21); CNG/fastlane placement (AD-23).
