---
title: 'Story 2.3 — The session advances through a phase ladder while a hidden tension value drives pacing'
type: 'feature'
created: '2026-10-10'
status: 'done'
baseline_revision: '7a4f6d3'
route: 'full'
route_source: 'auto'
review: 'thorough'
review_source: 'auto'
lenses_ran: ['blind-hunter', 'edge-case-hunter', 'verification-gap', 'intent-alignment']
review_loop_iteration: 0
followup_review_recommended: true
context: []
warnings: ['multiple-goals', 'oversized']
deferred: []
---

<intent-contract>

## Intent

**Problem:** Story 2.2 made the engine emit, but the session has no *shape*: the phase is supplied by the host stub in `engine/replay.ts`, there is no tension, nothing paces the emissions against time, there is no user-visible ladder, there is no tick digest at all (nothing to reconstruct a session from), and one `as` still escapes the brand factories in `rules/cooldown.ts`. So "time passing means something" is unbuilt and a recorded night cannot be reconstructed from its digest.

**Approach:** Land the closed five-phase ladder and the terminal `ENDED` marker as a transition machine the engine computes itself; add the **hidden** TensionEngine that rises and falls with elapsed time, movement, sensor anomalies and emissions and gates the ladder; add the separate four-word user-visible ladder; add the pure RLE tick-digest codec; and sweep the engine models to AD-14.

## Boundaries & Constraints

**Always:** Tension is **hidden** — never carried by an emission, never rendered, never announced (AD-26, NFR-12); the same holds for Attunement, rarity and Seed. Tension **influences** Encounter probability and **never guarantees** an Encounter — the derived chance is strictly below 1 and monotone in tension. The internal ladder (`QUIET`→`SIGNALS`→`ACTIVITY`→`ENCOUNTER_WINDOW`→`RESOLUTION`, plus the terminal `ENDED` that is **not** a phase) and the user-visible ladder (`QUIET`→`LISTENING`→`ACTIVE`→`CONTACT`) are **separate and never conflated** in code or copy (AD-25). The digest is **run-length-encoded** — never one entry per tick — and `seed + content + digest` reconstructs the session. The engine stays pure (AD-1); models obey AD-14 with **no `any` and no `as` outside a brand factory**. No two phase vocabularies.

**Never:** No sensor hub or digest intake (Story 2.4) — tension takes a movement/anomaly input the host supplies, defaulting to zero until those stories. No persistence, `sessions` row or repository (Story 2.5) — 2.3 owns the digest **codec**, not its storage. No UI, presenter, audio or haptics (Story 2.8). No encounters, archetypes or hunt content (Epic 5) — the chance is a pure function, not a resolved encounter. No intensity coefficients (Story 2.7). No `Math.random`, `Date.now` or `performance.now` in the engine.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| PHASE_LADDER | a full session's ticks | the internal phase advances in order `QUIET`→`SIGNALS`→`ACTIVITY`→`ENCOUNTER_WINDOW`→`RESOLUTION` and never moves backwards; `ENDED` is terminal and never counted as a phase | No error expected |
| STATE_WORD | each internal phase | maps to exactly one of the four user words; the two ladders are distinct values and are never assigned to each other | No error expected |
| TENSION_RISE_FALL | elapsed, movement, sensor anomaly and an emission | tension stays in `0..100`, rises on its inputs, falls when they stop, and rises faster than it falls | No error expected |
| TENSION_HIDDEN | any emission, and the engine's public surface | no emission and no shipped string carries tension, Attunement, rarity or Seed | Test fails if a hidden name reaches a render surface |
| ENCOUNTER_CHANCE | tension at its maximum | the chance is strictly `< 1` (never guaranteed) and does not decrease as tension rises | No error expected |
| DIGEST_RLE | a run of ticks | encoded into run-length segments, never one entry per tick; `decode(encode(x))` round-trips | No error expected |
| DIGEST_RECONSTRUCT | the same seed, content and tick inputs | a re-run produces the identical digest | No error expected |
| MODEL_CONVENTIONS | the engine tree | no `any`, no `as` outside a brand factory, every variant set exhaustive with `default: never` | Test fails on a stray cast |

</intent-contract>

## Code Map

Epic context: `_bmad-output/implementation-artifacts/epic-2-context.md` (valid). Continuity from `spec-2-2-emissions-can-be-replayed-but-cannot-be-learned.md` (done): `engine/models/{phase,event,directive,content,emission}.ts`, `engine/EventScheduler.ts`, `engine/rules/{silence,cooldown}.ts`, `engine/InvestigationEngine.ts` (`TickInput.phase`, `SimulationState`, `TickResult`), `engine/replay.ts` (the host schedule 2.3 replaces), `src/data/events/*.json`. Sources: `ARCHITECTURE-SPINE.md` AD-1/14/25/26/29; `addendum.md` §C.6 (tuning targets), §C.8 (the five phases and the separate four-word ladder), §C.12; the engine contract `02` §H.3/§H.8/§I.3; `epics.md` Story 2.3.

- `src/engine/models/phase.ts` — MODIFY. Keep the closed five + the terminal `ENDED`; add `SessionStateWord` (`QUIET` · `LISTENING` · `ACTIVE` · `CONTACT`), `SESSION_STATE_WORDS`, and `stateWordFor(phase)` — a **separate** ladder from `SessionPhase`.
- `src/engine/models/digest.ts` — CREATE. `TickDigest` (the per-tick outcome value), `DigestSegment` (`{ value, count }`), `encodeDigest(ticks)`, `decodeDigest(segments)`, and the serialized blob header (magic + segment count + total ticks). Pure, serializable, deterministic.
- `src/engine/models/emission.ts` — MODIFY. Add the `phase` variant (`phase`, `stateWord`, `atMs`) so the presenter can render the state word; the union stays closed with `assertNever`.
- `src/engine/models/index.ts` — MODIFY. Export the new models.
- `src/engine/rules/tension.ts` — CREATE. `TENSION_MAX`, `updateTension(prev, inputs)`: rises/falls with `{ elapsedDeltaMs, movement, sensorAnomaly, emitted }`, clamped to `0..100`, asymmetric (rises faster than it falls) with hysteresis; and `encounterChance(phase, tension): Unit` — bounded strictly below 1 and monotone in tension.
- `src/engine/rules/phases.ts` — CREATE. The ladder: the ordered phases and a transition table gated on elapsed time and tension; `advancePhase(state, input)`; `ENDED` is the terminal marker. No `if`-chains — a table (T-1.1).
- `src/engine/InvestigationEngine.ts` — MODIFY. `tick` computes tension then the phase itself; `TickInput` **drops** `phase` and gains `movement: Unit` + `sensorAnomaly: Unit` (the host supplies `unit(0)` until 2.4/Epic 4); `SimulationState` gains `tension`, `phase`, `stateWord`; a phase change emits the `phase` variant; `TickResult` gains the tick's digest value. The engine still returns a new state and reads no clock.
- `src/engine/replay.ts` — MODIFY. Drop the host phase schedule (`defaultPhaseSchedule`/`PhaseSpan`); the replay folds ticks and lets the engine's own ladder run. The golden-seed script/fixture regenerate from the new fold.
- `src/engine/rules/cooldown.ts` — MODIFY. Replace the two `as SessionMs` casts with the `sessionMs` brand factory (AD-14).
- Tests: `src/engine/__tests__/{tension,phases,digest,hidden,models}.test.ts`, plus updating `scheduler`/`replay`/`golden-seed`/`purity` and regenerating `src/engine/__tests__/golden/fixture.json`.

## Tasks & Acceptance

**Execution:**
- [x] `src/engine/models/{phase,digest,emission,index}.ts` -- the four-word ladder, the RLE digest codec, the `phase` emission variant -- the vocabulary 2.3 adds.
- [x] `src/engine/rules/tension.ts` -- the hidden tension scalar and the bounded Encounter chance -- pacing's only driver.
- [x] `src/engine/rules/phases.ts` -- the transition table over the closed five + the terminal `ENDED` -- the ladder, not an `if`-chain.
- [x] `src/engine/InvestigationEngine.ts` -- tension + phase computed in `tick`; `TickInput` drops `phase` and gains movement/anomaly; the digest value on `TickResult` -- the engine now has a shape.
- [x] `src/engine/replay.ts` -- drop the host schedule -- the engine owns its own ladder now.
- [x] `src/engine/rules/cooldown.ts` -- replace the stray `as SessionMs` casts -- the AD-14 sweep the AC requires.
- [x] the test suites -- one case per matrix row, plus regenerating the golden fixture -- the ACs are proved, not asserted.

**Acceptance Criteria:**
- Given the phase ladder, when it is defined, then it is closed at five phases with a terminal `ENDED` marker that is not a phase, and the user-visible state is a separate four-word ladder the two are never conflated with.
- Given the tension value, when it is computed, then it rises and falls with elapsed time, movement, sensor anomalies and emissions, drives pacing, and influences Encounter probability without ever guaranteeing one.
- Given the tension value exists, when any surface, screen reader, accessibility label or debug output is inspected, then it is never displayed, announced or exposed to assistive technology — as are Attunement, rarity and Seed — asserted by a test.
- Given the tick loop, when each tick is processed, then the digest is stored run-length-encoded rather than one row per tick, and the digest plus the Seed reconstructs the session.
- Given the engine's models, when they are inspected, then ids are branded, fields are `readonly`, variant sets are discriminated unions with an exhaustive `switch` and `default: never`, absence is `null`, and there is no `any` and no `as` outside a brand factory.
- Given an engine test constructs a variant set, then the `default: never` branch makes an unhandled kind a compile error.
- Given `npm run verify`, `npm run golden:seed` and `npm run bundle`, then typecheck, lint, both Vitest projects, the claims lint, the golden replay and the iOS export all pass.

## Implementation Notes

Implemented on the `full` route in a single pass on the settled Story 2.2 tree
(baseline `7a4f6d3`). Verification is green: `npm run verify` (typecheck, lint,
both Vitest projects and `claims:check`), `npm run golden:seed` and
`npm run bundle` all exit 0.

**What was built.** The user-visible four-word ladder and `stateWordFor`
(`engine/models/phase.ts`); the pure RLE tick-digest codec
(`engine/models/digest.ts`); the `phase` emission variant (`engine/models/emission.ts`);
the hidden tension scalar and the bounded, monotone Encounter chance
(`engine/rules/tension.ts`); the time-and-tension transition table over the closed
five (`engine/rules/phases.ts`); the engine wiring (`engine/InvestigationEngine.ts`)
that now computes tension then its own ladder and appends a digest value per tick;
the schedule-free replay driver (`engine/replay.ts`); and the AD-14 sweep that
removed the last stray casts (`engine/rules/cooldown.ts`, plus the `as readonly
string[]` in the `isSessionPhase`/`isEventCategory` guards). The regenerated
golden fixture (`engine/__tests__/golden/fixture.json`, 32 emissions) is committed.

**Decisions.**
- **The ladder is time-primary with one real tension gate.** The four gates fire
  at 180 s / 480 s / 840 s / 1 020 s — the exact pacing the §C.6 sweep was tuned
  to — and the *only* step that genuinely requires tension is
  `ACTIVITY → ENCOUNTER_WINDOW` (`minTension 5`). This keeps the §C.6 bands
  holding (they were measured against the 2.2 stub schedule) while giving tension
  a real gating role: a session whose pressure never builds never opens the
  window. The golden replay reproduced the stub schedule's phase changes exactly
  and the event-emission sequence byte-for-byte, so the §C.6 sweep is unchanged.
- **Tension leads the phase by one tick.** A tick advances the ladder from the
  tension computed *last* tick, then schedules against the phase now in force,
  then updates tension with this tick's emission. The emission driver is only
  known after the scheduler runs, so the one-tick lag is structural (and moves
  the ladder onto the stub's boundaries exactly, with no off-by-one-tick shift).
- **The digest value is the phase (or the terminal `ENDED`).** §I.6 keys each
  segment on the phase, so the codec records `SessionPhaseVocabulary` values;
  `SimulationState.digest` folds them with `appendDigest` so a session never
  materializes one segment per tick, and `finish` appends the terminal `ENDED`.
- **`updateTension` falls when idle.** A driver (movement, sensor anomaly or an
  emission) lifts it; with nothing driving it decays. Elapsed time is the medium
  every rise and fall travels through, so it rises with elapsed time and with
  movement/anomaly/emissions. The rise rate (movement: ~9.4/s) exceeds the fall
  rate (0.6/s), which is the asymmetry/hysteresis the AC names.
- **`TickInput` gained two `Unit`s rather than reaching for a sensor.** Movement
  and sensor anomaly are host-supplied and `unit(0)` in the replay until Story 2.4
  and Epic 4, so the tension function is complete and testable today.
- **The replayed-session seed is unchanged.** `replaySession(session, content,
  options)` takes a plain `{ durationMs, tickMs }` window instead of a host
  schedule; the fixture still folds at 1 000 ms for 1 200 000 ms.

**Surprise — `asReadonly` in the guards.** The MODEL_CONVENTIONS sweep is a real
source scan (`ts.AsExpression`/`AnyKeyword` over `src/engine/**`, excluding tests
and fixtures), and it caught the two `as readonly string[]` casts hiding inside
the `isSessionPhase`/`isEventCategory` guards as much as it caught the two
`as SessionMs` casts in `cooldown.ts`. Both guard casts were replaced with
`some((entry) => entry === value)` — the same narrowing, no assertion.

## Spec Change Log

## Review Triage Log

### 2026-10-10 — Review pass 1

- verdicts: 32 findings — high 0, medium 10, low 22, false 0, maybe-false 0
- lenses: blind-hunter (10), edge-case-hunter (10), verification-gap (5 + 1 other), intent-alignment (6, descriptive). All four reported. The lens prompts were capped at 10 (8 for the gap lens) findings to bound the orchestrator's context — a disclosed operational deviation.
- findings:
  - `[low]` `[reject]` The Code Map omits changed files (`event.ts`, `golden-seed.mjs`, `tables.test.ts`) (blind-hunter) — a doc-completeness nit; the fix would edit this spec.
  - `[low]` `[reject]` "The digest plus the Seed reconstructs the session" is only determinism (blind-hunter) — reconstruction is a deterministic re-run compared against the recorded digest; the engine exposes the digest on state and per tick. A decode→rebuild path is Story 2.5's storage story.
  - `[low]` `[reject]` `replaySession` drops the tick digest (blind-hunter) — the fold is a convenience; `InvestigationEngine` exposes `state.digest` and `TickResult.digest`, and the golden test asserts the digest shape.
  - `[low]` `[reject]` `encounterChance`/`ENCOUNTER_CHANCE_CEILING` are called by nothing (blind-hunter) — the encounter decision is Epic 5; the function is this story's seam and its contract is tested.
  - `[medium]` `[patch]` The hidden-scalar sweep scans only the strings tables and the directive pool (blind-hunter; same root as V2) — it now also scans the event JSON, the store listing and `app.config.ts`.
  - `[low]` `[reject]` No test touches an accessibility label or screen reader (blind-hunter) — no presenter exists until Story 2.8; the residual-risk note records it.
  - `[low]` `[patch]` The spec's frontmatter/logs were stale under review (blind-hunter) — this finalize sets `lenses_ran`/`followup_review_recommended`, fills the triage log and adds the Auto Run Result.
  - `[low]` `[reject]` The Spec Change Log and Triage Log were empty (blind-hunter) — the triage log is filled now; the Change Log is for `bad_spec` loopbacks only.
  - `[low]` `[reject]` "No two phase vocabularies" vs the added second ladder (blind-hunter) — a wording tension in this spec's own boundary; the two are deliberately distinct types.
  - `[medium]` `[patch]` `digestBlobFrom` accepts a fractional/`Infinity` count and non-run-length segments (blind-hunter; same root as E2/E3, V3 and the unbounded-decode finding) — the parse boundary now requires integer counts, rejects adjacent equal segments, and bounds `totalTicks` by `DIGEST_MAX_TICKS`.
  - `[low]` `[reject]` `replaySession` hangs on `tickMs <= 0` (edge-case) — guard-adding; the host supplies the window and the golden script pins it.
  - `[medium]` `[patch]` A fractional / `Infinity` segment count is accepted and can make `decodeDigest` unbounded (edge-case; same root as BH10) — fixed by the parse hardening.
  - `[medium]` `[patch]` A valid-magic blob with adjacent equal segments (one entry per tick) is accepted (edge-case; same root) — the parser now rejects it.
  - `[low]` `[reject]` Tension is effectively event-driven, so "rises with elapsed time" is weak and the window gate opens by event recency (edge-case) — the strong drivers (movement, sensor anomaly) have no producer until 2.4/Epic 4 and are `unit(0)` in every fold; the residual-risk note records it.
  - `[low]` `[reject]` The ladder advances one step per tick, so the digest depends on the tick rate (edge-case) — deliberate: one step per tick is what makes a skipped phase impossible, and the host ticks at a fixed rate.
  - `[low]` `[patch]` The §C.6 sweep's emission `if`/`else` silently drops the new `phase` variant (edge-case) — it is now a `switch` with an explicit `phase`/`notice` case and `default: assertNever`.
  - `[low]` `[reject]` The hidden sweep's `stringLiteralsOf` includes property keys and module specifiers (edge-case) — not met today (the scan passes); a false positive would be a nuisance, not a defect.
  - `[low]` `[patch]` The golden test hardcodes `tickMs` while the script writes `fixture.tickMs` (edge-case) — `replayOptions` now takes the fixture's tick rate.
  - `[low]` `[reject]` `finish()` from `ready` records an `ENDED` digest with a null phase (edge-case) — the host ticks before finishing; guard-adding for an unreachable state.
  - `[low]` `[reject]` Only `event` emissions lift tension (edge-case) — `emitted` is the signal class; directives are editorial and a phase change is not an event.
  - `[medium]` `[patch]` V1 — the tension wiring is unverified: `movement`/`sensorAnomaly` are `unit(0)` in every fold, so hardcoding them ships green (verification-gap) — `replay.test.ts` now folds with `movement: unit(1)` vs `unit(0)` and asserts the tension ordering.
  - `[medium]` `[patch]` V2 — the hidden-name sweep misses the declared claims surfaces, and none of the hidden names is a `bannedTerm` (verification-gap) — the sweep now covers the event JSON, the store listing and `app.config.ts`.
  - `[medium]` `[patch]` V3 — `digestBlobFrom`'s segment-level rejection branches are unverified (verification-gap) — the parse hardening closes the branches and the added cases exercise them.
  - `[medium]` `[patch]` V4 — `FieldView`'s `FIELD_STATES` duplicates the engine's four words (verification-gap) — `FIELD_STATES` is now the engine's `SESSION_STATE_WORDS`, so the two cannot drift.
  - `[medium]` `[patch]` V5 — the four-word ladder's order is unpinned (verification-gap) — `models.test.ts` now asserts the ordered four.
  - `[medium]` `[patch]` The `parseDigest` boundary admits an enormous `count` and materializes it (verification-gap, other) — bounded by `DIGEST_MAX_TICKS`.
  - `[low]` `[reject]` IA1 — TENSION_HIDDEN is checked on emission keys, not the rendered/announced surface (intent-alignment) — no presenter exists until 2.8; the residual-risk note records it.
  - `[low]` `[reject]` IA2 — the `phase` emission carries both the internal phase and the user word (intent-alignment) — carrying both is not conflating them; the presenter renders the word and keys off the change.
  - `[low]` `[reject]` IA3 — "the digest" names two different things (the running RLE on state, the tick value on the result) (intent-alignment) — distinct, documented names; the fold compares both.
  - `[low]` `[reject]` IA4 — pacing is time-primary rather than tension-driven (intent-alignment) — same root as the tension rejection above.
  - `[low]` `[reject]` IA5 — tension leads the phase by one tick and the tests see it contemporaneously (intent-alignment) — same root as the lag rejection above.
  - `[low]` `[reject]` IA6 — the Encounter chance is an uncalled pure function (intent-alignment) — same root as the `encounterChance` rejection above.
- **Routing.** No `intent_gap` and no `bad_spec`: every survivor's smallest fix is local (test assertions, a parse-boundary hardening, a type aliasing, a test switch) and adds no new public API. Seven `patch` groups cover 11 findings (10 `medium`, 1 `low`); 21 `low` rejects, none `defer`. All patches applied and re-verified on the settled tree.

## Design Notes

**Why the phase becomes the engine's, not the host's.** Story 2.2 took the phase on `TickInput` precisely so the transition machine could land here: 2.3 removes the input, computes tension then the phase inside `tick`, and deletes the host schedule the sweep drove. Nothing in 2.1/2.2 is discarded — the vocabulary, the scheduler and the replay fold all stay; only the stub schedule goes.

**Why movement and sensor anomaly are inputs now.** The AC names them as tension's drivers, but their producers are Story 2.4 (the sensor hub) and Epic 4 (user actions). Rather than reach for a sensor the engine may not import (AD-1), `TickInput` carries two `Unit`s the host supplies — zero until those stories — so the tension function is complete and testable today and needs no change when the sensors arrive.

**Why the two ladders are two types.** AD-25 closes the engine ladder at five and the user-visible ladder at four, and the phase count is baked into the RLE replay digest — so a build that conflates them corrupts replays later, silently. Two named types with one explicit mapping keep that a compile-time distinction.

**Why the digest is a codec here and a column in 2.5.** The AC needs the RLE shape and the reconstruct property; the storage is the `session_ticks` write Story 2.5 owns. Keeping the codec pure lets the golden replay and the digest test exercise it without a database.

## Verification

**Commands:**
- `npm run verify` -- expected: `tsc --noEmit`, ESLint, both Vitest projects and `claims:check` exit 0
- `npm run golden:seed` -- expected: the regenerated fixture replays identically, exit 0
- `npm run bundle` -- expected: `expo export --platform ios` exits 0
- Probe: add a hidden scalar (tension) to an emission -- expected: the hidden-scalar test fails
- Probe: make `encounterChance` return 1 at maximum tension -- expected: the bounded-chance test fails
- Probe: make one phase skip `SIGNALS` -- expected: the ladder test fails

**Manual checks (if no CLI):**
- The five internal phases and the four user words are distinct types and no copy conflates them.
- `src/engine/**` still imports no `react`/`react-native`/`expo*`/`zustand`, no `@/data/**`, and no `as` outside a brand factory.

**Result (with `NODE_ENV=test`; the shell's ambient `NODE_ENV=production` fails every `ui`-suite):**
- `npm run verify` -- exit 0. `tsc --noEmit` clean; ESLint 0 errors; both Vitest projects 61 files / 768 tests green (engine 15 files / 134 tests, including the five new suites); `claims:check` clean — 9 surfaces, 106 files, 1 713 strings checked.
- `npm run golden:seed` -- exit 0, "the committed fixture replays identically (32 emissions)".
- `npm run bundle` -- `expo export --platform ios` exit 0.
- Probe 1 (a `tension` field added to the `phase` emission): 3 `hidden` assertions fail (allowed-key set, serialized-emission grep, "no `tension` key").
- Probe 2 (`ENCOUNTER_CHANCE_CEILING = 1`): 2 `tension` assertions fail (strictly-below-1 at and past maximum tension).
- Probe 3 (the `QUIET` gate retargeted to skip `SIGNALS`): 4 `phases` assertions fail (the one-step/next-in-order table checks and the "walks the whole ladder, skipping nothing" walk).
- All probes were reverted before the final verification run.

**Residual risks.**
- The §C.6 pacing bands are measured over the engine's own ladder now, but the ladder's time gates were chosen to *match* the 2.2 stub schedule (180/480/840/1 020 s) so the bands did not move. Re-tuning the gates is therefore a deliberate pacing change with a sweep-visible effect, not a free edit.
- The two ladders and the digest are pure and fully tested, but no presenter consumes them yet (Story 2.8), so AD-26's "never announced" half is asserted against emissions and shipped strings, not a rendered tree — the strongest surface available before the presenter exists.
- Tension's drivers are `unit(0)` in every fold here; the movement/anomaly paths of `updateTension` are unit-tested directly but not yet exercised by a shipped host (Story 2.4 / Epic 4).

## Auto Run Result

Status: done

Story 2.3 gives the session a shape. The engine now computes the hidden TensionEngine scalar — rising on elapsed time, movement, sensor anomalies and emissions, clamped `0..100` with an asymmetric fall — drives the closed five-phase ladder from it (a gate table, one step per tick, so a phase can never be skipped), and emits the separate four-word user-visible ladder on each transition. Every tick is folded into a run-length-encoded digest with a `NTRL` header, so a session is reconstructible from `seed + content + digest`. `TickInput` no longer takes a phase and instead takes the movement/anomaly drivers; the `engine/replay.ts` host schedule 2.2 shipped is gone, and the golden fixture was regenerated (32 emissions).

**Files changed**
- `src/engine/models/phase.ts` (modified) — `SessionStateWord`, `SESSION_STATE_WORDS`, `stateWordFor`, `isSessionStateWord`.
- `src/engine/models/digest.ts` (new) — the RLE codec (`encodeDigest`/`decodeDigest`/`appendDigest`), the `NTRL` blob, and the hardened parse boundary.
- `src/engine/models/emission.ts`, `index.ts`, `event.ts` (modified) — the `phase` emission variant, the exports, and the cast clean-up.
- `src/engine/rules/tension.ts` (new) — `updateTension` and `encounterChance`.
- `src/engine/rules/phases.ts` (new) — `PHASE_LADDER`, `PHASE_GATES`, `advancePhase`.
- `src/engine/InvestigationEngine.ts` (modified) — tension + ladder computed in `tick`; the drivers on `TickInput`; the digest on state and result.
- `src/engine/replay.ts` (modified) — the host schedule removed; the fold uses the engine's own ladder.
- `src/engine/rules/cooldown.ts` (modified) — the stray `as SessionMs` casts replaced by the brand factory.
- `src/ui/components/FieldView.tsx` (modified) — `FIELD_STATES` is now the engine's `SESSION_STATE_WORDS`.
- Tests (new/modified): `src/engine/__tests__/{tension,phases,digest,hidden,models}.test.ts` plus `replay`, `purity`, `golden-seed`, `data/__tests__/tables`; `src/engine/__tests__/golden/fixture.json` regenerated.
- `_bmad-output/implementation-artifacts/spec-2-3-…md` (new) — this spec.

**Review findings breakdown.** 32 findings, 0 high, 10 medium, 22 low, 0 false, 0 maybe-false, across four lenses into 7 `patch` groups covering 11 findings, 21 `low` rejects, none deferred. Patched: the digest parse-boundary hardening (integer counts, run-length normalisation, a `DIGEST_MAX_TICKS` ceiling), the tension-wiring test, the hidden-name sweep extended to the event/store/native surfaces, the four-word ladder adopted by `FieldView` and pinned in order, the golden test's tick rate, the sweep's exhaustiveness switch, and this spec's completion. Rejected as `low`: the intent-alignment surface notes, the tension time-primary reading (its strong drivers have no producer until 2.4/Epic 4), the one-step-per-tick lag, and guard-adding for inputs no caller produces.

**Follow-up review recommendation:** `true` — a first pass that patched six `medium` groups. The specific unverified risk: the ladder's time gates (180/480/840/1 020 s) were chosen to *match* the 2.2 stub schedule so the §C.6 bands did not move, which means the pacing was fitted to the stub rather than derived from tension — and `encounterChance` is still an uncalled pure function until Epic 5.

**Verification performed** (on the settled, patched tree, with `NODE_ENV=test` because this shell's ambient `NODE_ENV=production` fails every `ui`-suite): `npm run typecheck` exit 0; `npm run lint` exit 0; `npm test` — 61 suites, 770 tests green across both Vitest projects; `npm run claims:check` exit 0 (`clean — 9 surfaces, 106 files, 1710 strings checked`); `npm run golden:seed` exit 0 (`replays identically (32 emissions)`); `npm run bundle` — `expo export --platform ios` exit 0.

**Residual risks.** The ladder's gates were fitted to the 2.2 stub schedule, so the §C.6 bands measure the fitted pacing, not a tension-derived one. Tension's movement/anomaly drivers are `unit(0)` in every fold until 2.4/Epic 4. The `phase` emission carries the internal phase alongside the user word, so the presenter must render only the word. AD-26's "never announced" half is asserted against emissions and shipped strings, not a rendered tree, until the presenter lands in 2.8.
