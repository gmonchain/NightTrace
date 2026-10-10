---
title: 'Story 2.2 — Emissions can be replayed but cannot be learned'
type: 'feature'
created: '2026-10-09'
status: 'done'
baseline_revision: '98d19e2'
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

**Problem:** Story 2.1 landed a pure engine that never actually emits anything — `tick` returns the lifecycle notices and an empty emission list, no event table exists, and there is no silence model, cooldown, or directive. A user's second or tenth night would be identical to their first, and "replayable but unlearnable" is unproven because there is nothing to replay.

**Approach:** Land the emission scheduler and its authored content: phase-keyed `EventTable`s whose `emptyWeight` keeps silence a valid draw, a **memoryless** interval draw with a per-table silence floor, engine-held cooldown/anti-repeat, an authored directive pool surfaced as object-less verbs, and the `event`/`directive` emission variants. The engine becomes genuinely replayable through the committed golden-seed fixture, and a seeded sweep measures the §C.6 pacing bands.

## Boundaries & Constraints

**Always:** `src/engine/**` stays pure (AD-1). Randomness is drawn only from the labelled forks: the scheduler uses `rng.events`, the directive scheduler `rng.session`, content-driven draws use `rng.content.<definitionId>` (AD-4). Every event table's `emptyWeight` is **strictly greater than zero** (AD-5), asserted by test over the whole shipped set. The interval draw is **memoryless** — a long quiet stretch never raises the chance of an event (FR-2); the hazard rate must not increase with time since the last emission. Cooldown and anti-repeat live **in the engine, not in content**, so a content change alone cannot make the pattern learnable (FR-2). A `SessionDirective` may constrain the space of events but may **never name one** (AD-6); at most six fire per session, at least three minutes apart, scheduled, and each is a verb with no object naming no phenomenon, outcome, direction or thermal concept. The engine never names a phenomenon (AD-7). Models obey AD-14. `TickResult` stays deep-equal for deep-equal `(seed, TickInput[])`.

**Never:** No tension, Attunement, rarity, phase *transitions*, or the user-visible ladder — those are Story 2.3; 2.2 defines the closed `SessionPhase` vocabulary and receives the active phase on each tick. No `HuntDefinition` or hunt→table binding — that is Story 5.4 (FR-8); 2.2 ships engine-level tables. No sensors/digest (2.4), no persistence or DB (2.5), no audio/haptics/UI (2.8), no evidence kinds (Epic 3), no encounter scheduling (Epic 5). No `Math.random`/`Date.now`/`performance.now` in the engine. No user-facing copy outside a declared string surface.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| EMPTY_WEIGHT | every shipped event table | `emptyWeight > 0` — silence is always a valid draw | Test fails on a table with `emptyWeight <= 0` |
| SILENCE_DRAW | a table draw where the empty entry wins | no `event` emission this interval; the next gap is drawn | No error expected |
| MEMORYLESS | many draws at varying elapsed-since-last-emission | the hazard rate does not increase with time since the last emission | No error expected |
| COOLDOWN | an event whose `cooldownMs` has not elapsed | it cannot be selected again until the cooldown expires | No error expected |
| ONCE_PER_SESSION | an event already fired in this session | it is never selected twice | No error expected |
| EXTENDS_SILENCE | a `silence`-category event drawn | it extends the floor instead of emitting an event | No error expected |
| DIRECTIVE_CAP | a session long enough for seven directives | exactly at most six fire, each ≥ 3 minutes apart | No error expected |
| DIRECTIVE_NO_OBJECT | the authored directive pool | every directive is an object-less verb naming no target/direction/thermal idea | Content test fails on a violating string |
| SWEEP_INTERVALS | 500 seeded 20-minute sessions | interval p50/p90 ≥ 3.0; longest silence p50 in 200–260 s; a >5 min silence in 22–35% of sessions | Test fails if a band is missed |
| GOLDEN_SEED | seed + hunt + content version + committed expected emissions | the replay is identical | Test fails on any divergence |

</intent-contract>

## Code Map

Epic context: `_bmad-output/implementation-artifacts/epic-2-context.md` (valid). Continuity from `spec-2-1-the-same-seed-always-produces-the-same-session.md` (done): `engine/models/{brand,ids,seed,emission,index}.ts`, `engine/prng.ts`, `engine/RandomEngine.ts` (`FORK_LABELS`, `seedFromParts`, `createRandomEngine` with `next`/`int`/`bool`/`fork`/`snapshot`/`restore`), `engine/InvestigationEngine.ts` (`SimulationState`/`TickInput`/`TickResult`, `tick`, `finish`), `services/Clock.ts`, `services/SeedService.ts`, `data/ContentVersion.ts`. Sources: `ARCHITECTURE-SPINE.md` AD-4/5/6/7/25/26; the engine contract `02` §G.6, §H.7 (`EventDefinition`, `EventTable`, `WeightedEvent`), §H.8 (the emission union), `addendum.md` §C.6 (tuning targets), §C.7 (cooldowns), §C.8 (the five phases), §C.12 (hard invariants); `epics.md` Story 2.2. Follow-up risk carried from 2.1: `TickResult.rng` never drew — 2.2 makes it the scheduler's stream.

- `src/engine/models/phase.ts` — CREATE. `SessionPhase` as the **closed five** (`QUIET` → `SIGNALS` → `ACTIVITY` → `ENCOUNTER_WINDOW` → `RESOLUTION`) plus the terminal `ENDED` marker that is not a phase, and `SESSION_PHASES`. Vocabulary only — the transition machine, tension gates and the user-visible four-word ladder are Story 2.3.
- `src/engine/models/event.ts` — CREATE. `EventCategory` (`ambient` · `signal` · `bait` · `escalation` · `retreat` · `false_positive` · `ritual` · `silence`), `EventDefinition` (`id`, `category`, `weight`, `cooldownMs`, `oncePerSession`, `extendsSilenceMs` — the scheduler-relevant subset of `02` §H.7; digest/phase/tension/evidence fields arrive with their stories), `WeightedEvent`, and `EventTable` (`id`, `phase`, `entries: readonly WeightedEvent[]`, `emptyWeight`, `silenceFloorMs`, `intervalMeanMs`). Every field `readonly`; ids branded.
- `src/engine/models/emission.ts` — MODIFY. Add an `event` variant (`definitionId`, `category`, `atMs`, `strength`) and a `directive` variant (`directiveId`, `text`, `atMs`), each tagged `kind`; `assertNever` already gates every consumer.
- `src/engine/models/index.ts` — MODIFY. Export the new models.
- `src/engine/RandomEngine.ts` — MODIFY. Add the distribution helpers deferred from 2.1: `exponent(meanMs)` (a hard floor plus a long tail, memoryless), `weighted(entries)` (a weighted draw incl. an empty weight), `pick(items)`. No new fork label.
- `src/engine/rules/silence.ts` — CREATE. The memoryless gap draw: `nextGapMs(rng, floorMs, meanMs, silenceScale)` = `floorMs * silenceScale` + an exponential draw; and `Rng`-free helpers. A long quiet stretch never changes the distribution.
- `src/engine/rules/cooldown.ts` — CREATE. Engine-held cooldown and anti-repeat: `isCoolingDown(state, id, atMs)`, `advanceCooldowns(...)`, once-per-session. Content supplies the `cooldownMs`; the *rule* lives here.
- `src/engine/EventScheduler.ts` — CREATE. `createScheduler()` → a pure `step(input)`: if `elapsedMs < nextEmissionAtMs` return silence; else draw the tick's table by phase, filter by cooldown/once-per-session, `weighted()` over the survivors plus `emptyWeight`; empty → silence (draw the next gap); a winner → emit it and set the cooldown; a `silence`-category winner extends the floor. Returns new state + emissions.
- `src/engine/directives/SessionDirective.ts` — CREATE. The `SessionDirective` shape (`silenceScale`, `bannedEvents`, `flavourNote`, and the constraint fields from `02` §H.3) and `DEFAULT_DIRECTIVE`.
- `src/engine/directives/DirectiveScheduler.ts` — CREATE. Draws from the authored pool via `rng.session`, ≤ 6 per session, ≥ 3 minutes apart, scheduled (never on demand). A directive never names an event.
- `src/engine/InvestigationEngine.ts` — MODIFY. `TickInput` gains `phase: SessionPhase`; `SimulationState` gains the scheduler/cooldown/directive state; `createInvestigationEngine(session, deps)` takes the content (`tables`, `directives`) and forks `rng.events`/`rng.session` once at construction. `tick` runs the schedulers and returns the `event`/`directive` emissions; `TickResult.rng` becomes the `rng.events` stream's snapshot so a replay compares draws. Update Story 2.1's tests for the new `TickInput`/signature.
- `src/data/events/definitions.json` + `src/data/events/tables.json` + `src/data/directives/pool.json` — CREATE. The shipped content (`resolveJsonModule` is on): phase-keyed tables with `emptyWeight > 0`, a per-table `silenceFloorMs`/`intervalMeanMs`, and the directive pool. Authored, not generated.
- `src/data/content.ts` — CREATE. A typed loader/registry exposing `EVENT_DEFINITIONS`, `EVENT_TABLES`, `DIRECTIVES`, and `tableForPhase(phase)`. Content may import `engine/models` only.
- `scripts/golden-seed.mjs` + `package.json` `golden:seed` script + a `ci.yml` step — CREATE/MODIFY. The committed golden-seed fixture (seed + hunt + content version + expected emission sequence) replays identically; CI-blocking, appended to the pipeline's gate ledger as the ledger itself instructs.
- Tests: `src/engine/__tests__/{scheduler,silence,cooldown,directives}.test.ts`, `src/engine/__tests__/golden-seed.test.ts`, and — because the engine may not import `src/data/**` — `src/data/__tests__/{tables,directives}.test.ts` (the `emptyWeight` sweep, the directive-pool grep, and the §C.6 sweep).

## Tasks & Acceptance

**Execution:**
- [x] `src/engine/models/{phase,event}.ts` + `emission.ts` + `index.ts` -- the phase vocabulary, the event/table/definition models, and the two new emission variants -- every later scheduler piece reads these.
- [x] `src/engine/RandomEngine.ts` -- `exponent`/`weighted`/`pick` -- the distribution helpers 2.1 deferred to their first consumer.
- [x] `src/engine/rules/{silence,cooldown}.ts` -- the memoryless gap draw and the engine-held cooldown/anti-repeat -- silence and unlearnability are engine rules, never content.
- [x] `src/engine/EventScheduler.ts` -- weighted selection incl. `emptyWeight`, phase-keyed tables, silence-category extension -- the scheduler's whole behaviour.
- [x] `src/engine/directives/{SessionDirective,DirectiveScheduler}.ts` -- the directive seam and the ≤6 / ≥3 min scheduler -- directives constrain, never name.
- [x] `src/engine/InvestigationEngine.ts` -- wire the schedulers into `tick`; `TickInput.phase`; `deps` content; `TickResult.rng` = the events stream -- the engine now emits.
- [x] `src/data/{events/*.json,directives/pool.json,content.ts}` -- the authored tables, definitions and directive pool -- the "shipped content" the ACs measure.
- [x] `scripts/golden-seed.mjs` + `package.json` + `.github/workflows/ci.yml` -- the CI-blocking replay gate -- append it to the pipeline's own gate ledger.
- [x] the test suites -- one case per matrix row plus the §C.6 sweep -- the ACs are proved, not asserted.

**Acceptance Criteria:**
- Given any event table in the shipped content, when its weights are inspected, then `emptyWeight > 0` in every one, asserted across the set.
- Given a seeded sweep of twenty-minute sessions, when the inter-emission intervals are measured, then the p50/p90 ratio holds at ≥ 3.0.
- Given the interval draw, when it is inspected, then it is memoryless and a test asserts the hazard rate does not increase with time since the last emission.
- Given cooldown and anti-repeat, when rapid, repetitive or impossible sequences would occur, then they are suppressed by engine rules and a content change alone cannot make the pattern learnable.
- Given the directive scheduler, when a directive is emitted, then it is a verb with no object naming no specific event, at most six fire per session at least three minutes apart.
- Given the silence distribution over the sweep, then the longest silence lands in the 200–260 s band at the median and a >5 min silence occurs in 22–35% of sessions.
- Given the directive pool, when the content-validation test runs, then a directive naming a target, a direction or a thermal concept fails it.
- Given the golden-seed replay test, when CI runs, then a committed fixture of seed + hunt + content version + expected emission sequence replays identically and the test is CI-blocking.
- Given `npm run verify` and `npm run bundle`, then typecheck, lint, both Vitest projects, the claims lint and the iOS export all pass.

## Implementation Notes

Implemented on the `full` route across two passes (the first hit its turn limit; the second finished the tree). Verification is green on the settled tree.

**What was built.** The phase vocabulary (`engine/models/phase.ts`), the event/table/definition models (`engine/models/event.ts`), the directive model (`engine/models/directive.ts`), the content bundle (`engine/models/content.ts`), the two new emission variants (`engine/models/emission.ts`), the memoryless gap and engine-held cooldown rules (`engine/rules/{silence,cooldown}.ts`), the scheduler (`engine/EventScheduler.ts`), the directive seam and cadence (`engine/directives/*`), the wired engine (`engine/InvestigationEngine.ts`), the replay driver (`engine/replay.ts`), the shipped content (`src/data/{events/*.json,directives/pool.json,content.ts}`), the golden-seed gate (`scripts/golden-seed.mjs` + `npm run golden:seed` + a `ci.yml` step), and the test suites (`engine/__tests__/*`, `data/__tests__/*`).

**Decisions.** The phase arrives on `TickInput` because the transition machine is Story 2.3; `engine/replay.ts` supplies a time-based host schedule for the sweep and gate, which 2.3 replaces. Content is engine-level (FR-8 binds hunts in Story 5.4). `TickResult.rng` is now the `rng.events` fork snapshot, so a replay compares the stream that drove emissions. `src/data/__tests__/**` gained a narrowly-scoped eslint relaxation so the content-validation tests can fold shipped content through the engine; shipment content under `src/data/**` still reaches `engine/models` only.

**Surprise — an `npm install` hazard I caused.** A `npm install --save-dev --offline vite@8.3.4` run under this shell's ambient `NODE_ENV=production` pruned `vite`/`vitest`/`vitest-expo` (npm omits devDependencies in production). Recovered with `npm ci --include=dev`; `vite` is now declared explicitly (the golden script imports it, and it was only a transitive dep of vitest). All verification re-run afterwards.

## Spec Change Log

## Review Triage Log

### 2026-10-09 — Review pass 1

- verdicts: 54 findings — high 0, medium 12, low 41, false 1, maybe-false 0
- lenses: blind-hunter (25), edge-case-hunter (13), verification-gap (3 + 2 other), intent-alignment (11, descriptive). All four reported; edge-case-hunter and verification-gap errored on the first launch and were re-run.
- findings:
  - `[low]` `[patch]` Spec artifact ships with empty sections, stale frontmatter and unticked tasks (blind-hunter) — this finalize fills the notes/triage/result, ticks the tasks and sets `status: done`.
  - `[medium]` `[patch]` The fixture's content version is never compared with the shipped one (blind-hunter; same root as edge-case E11 and verification-gap V3) — `scripts/golden-seed.mjs` now exits 1 when the fixture's version differs from `CONTENT_VERSION`.
  - `[low]` `[reject]` `directives.pool.json` `bannedEvents` "names events" against AD-6 (blind-hunter) — `bannedEvents` is AD-6's own constraint mechanism (`02` §H.3); the *rendered* directive names no event.
  - `[low]` `[reject]` The object-less-verb gate is a blocklist with omissions (blind-hunter) — a documented lexical heuristic; the stored verbs legitimately use "still"/"quiet", and the semantic check is AD-27's review, not a token list.
  - `[low]` `[reject]` `EventDefinition.weight` is unread and disagrees with the table entry weight (blind-hunter; same root as E10) — §H.7 selection uses the table entry's weight; the definition weight is reserved for a later consumer.
  - `[medium]` `[patch]` The MEMORYLESS test hard-copies the QUIET parameters (blind-hunter; same root as VG-other-2) — it now reads the QUIET table from `EVENT_TABLES`.
  - `[low]` `[reject]` The directive cadence is fixed after the first fire (blind-hunter) — the ≥3 min floor is met and the first fire is jittered; FR-2's unlearnability governs events, not directive spacing.
  - `[low]` `[reject]` An all-filtered table with `emptyWeight 0` makes `weighted` throw (blind-hunter; same root as E1) — unreachable: AD-5 requires `emptyWeight > 0` and the content test asserts it; a loud failure on an unreachable state is correct.
  - `[low]` `[reject]` `weighted`'s doc is inexact and the new helpers have no direct edge tests (blind-hunter) — the helpers are exercised through the scheduler; the doc nuance is a wording nit.
  - `[low]` `[reject]` The new model modules ship without tests (blind-hunter) — the vocabulary is exercised through `content.ts`'s `isSessionPhase`/`isEventCategory` narrowing and the content tests.
  - `[low]` `[reject]` `engine/replay.ts` is absent from the Code Map and untested directly (blind-hunter) — the Code Map is not exhaustive, and `replay.ts` is exercised by the golden test and the sweep.
  - `[low]` `[reject]` The Code Map omits the silence helpers (blind-hunter) — a spec-doc wording issue; the fix would edit this spec.
  - `[low]` `[reject]` The spec describes `exponent` as having a floor (blind-hunter) — the floor is added by `silence.ts`; a spec-doc wording issue.
  - `[low]` `[reject]` No content-authoring documentation for the JSON (blind-hunter) — the model docstrings carry the contract.
  - `[low]` `[reject]` `content.ts` overstates what `resolveJsonModule` catches (blind-hunter) — the guard is `isEventCategory`/`isSessionPhase`; a comment nit.
  - `[medium]` `[patch]` Nothing ties `category` to `extendsSilenceMs` (blind-hunter) — the `CONTENT_INTEGRITY` test now asserts a `silence` definition carries an extension and nothing else does.
  - `[medium]` `[patch]` Directive `bannedEvents` ids are never resolved against content (blind-hunter) — the `CONTENT_INTEGRITY` test now asserts every ban id resolves.
  - `[low]` `[reject]` The golden gate never exercises `finish` (blind-hunter) — the fixture pins the emission sequence; `finish` is covered by the engine replay tests.
  - `[low]` `[reject]` The golden comparison is key-order-sensitive and its docstring overstates (blind-hunter) — the fixture is script-generated; a formatting nit.
  - `[low]` `[reject]` Two independent "load the shipped content" implementations can drift (blind-hunter) — the script loads the real `content.ts`; the test's `fs` loader is the documented AD-1 workaround.
  - `[low]` `[reject]` The sweep's "silence" definition is an unexamined comment (blind-hunter) — documented inline, and the median event-count guard holds.
  - `[low]` `[reject]` Dead state in the replay-compared surface (blind-hunter) — `lastEventAtMs`/`emissionCount` are later stories' inputs; the compared surface is intentional.
  - `[false]` `[reject]` The eslint relaxation drops `ENGINE_SYNTAX` so a random source could be re-permitted (blind-hunter) — the Content block carries only `SQL_SELECTORS` and the console selector, never `ENGINE_SYNTAX` (it is engine-only); the new block re-states exactly those, so nothing is re-permitted.
  - `[low]` `[reject]` The AD-1 boundary change is not recorded in the spec (blind-hunter) — this finalize records it in the Implementation Notes; the fix would edit this spec.
  - `[low]` `[reject]` `verify` excludes `golden:seed` so a local verify misses it (blind-hunter) — the Verification section lists `golden:seed` separately and CI runs it.
  - `[low]` `[reject]` A single-entry directive pool repeats back to back (edge-case; and the engine fixture uses one) — a one-entry pool cannot avoid repeating; the fallback is correct.
  - `[low]` `[reject]` Duplicate pool ids empty the candidates and throw as "empty pool" (edge-case) — guard-adding for a content-author error; content validation is Story 3.1.
  - `[low]` `[reject]` `replaySession` hangs on `tickMs <= 0` (edge-case) — guard-adding; no caller passes zero, and `defaultPhaseSchedule` pins 1000.
  - `[low]` `[reject]` A first tick whose phase is not QUIET uses QUIET's first gap (edge-case) — the ladder always starts `QUIET` and the phase is a host input.
  - `[low]` `[reject]` Duplicate definition ids / two tables per phase are silently unreachable (edge-case) — the `CONTENT_INTEGRITY` test now asserts definition-id uniqueness and the phase test asserts one table per phase.
  - `[low]` `[patch]` The golden test's serialize `default` arm passes an unknown kind through (edge-case) — it now ends `default: assertNever(emission)`.
  - `[low]` `[reject]` The golden comparison is key-order-sensitive (edge-case) — the fixture is script-generated; a hand reorder would report a misleading divergence, but that is not everyday use.
  - `[medium]` `[patch]` `golden-seed.mjs` imports `vite`, not a declared dependency (edge-case; same root as VG-other-1) — `vite` is now declared in `devDependencies`.
  - `[low]` `[reject]` `EventDefinition.weight` unread (edge-case) — same root as the weight rejection above.
  - `[low]` `[patch]` The fixture's content version is unobserved (edge-case; same as the golden content-version patch above).
  - `[low]` `[patch]` The directive copy is outside the declared surface set (edge-case; same root as VG2) — declared as `content.directive-pool`.
  - `[low]` `[patch]` README still lists the golden-seed replay as a later gate (edge-case) — the README gate ledger is updated.
  - `[medium]` `[patch]` V1 — the engine's content-independent minimum gap is never observed where it is applied (verification-gap) — a scheduler-path test now drains a zero-floor table and asserts every emitted gap ≥ `ENGINE_MIN_GAP_MS`.
  - `[medium]` `[patch]` V2 — the new user-facing directive copy is not on a declared string surface (verification-gap; same root as the edge-case copy finding) — `src/data/directives/pool.json` is declared (`content-string-table`) and added to `COPY_ROOTS`; the claims lint now reports 9 surfaces.
  - `[medium]` `[patch]` V3 — the golden gate never compares the fixture's content version (verification-gap; same as above) — the script now compares it.
  - `[medium]` `[patch]` VG-other-1 — `vite` is not a declared dependency (verification-gap) — declared.
  - `[medium]` `[patch]` VG-other-2 — the MEMORYLESS block hardcodes the QUIET parameters (verification-gap) — reads the shipped table now.
  - `[low]` `[reject]` D-1 — the diff implements one story (2.2) of the two the invocation names (intent-alignment, descriptive) — this run is one story of the two by design; Story 2.3 is the next iteration.
  - `[low]` `[reject]` D-2 — the acceptance criteria are authored by the diff's own spec (intent-alignment) — the spec is this workflow's contract for the story; the epic ACs and ADs are cited in the Code Map.
  - `[low]` `[reject]` D-3 — every sweep runs through a host stub phase schedule (intent-alignment) — the phase is a host input by design; Story 2.3 computes it.
  - `[low]` `[reject]` D-4 — replay regenerates from a schedule rather than a recorded tick log (intent-alignment) — the tick digest/log is Story 2.3/2.5; the audit property here is deterministic regeneration.
  - `[low]` `[patch]` D-5 — memorylessness is measured on a helper with literal parameters (intent-alignment) — the MEMORYLESS test now reads the shipped QUIET parameters.
  - `[low]` `[reject]` D-6 — the object-less-verb gate is a lexical surface (intent-alignment) — same root as the blocklist rejection.
  - `[low]` `[reject]` D-7 — the §C.6 bands are measured on the stub schedule over event emissions only (intent-alignment) — the schedule is 2.3's to replace; the AC asks for the bands over the shipped content.
  - `[low]` `[reject]` D-8 — the AD-1 boundary is relaxed for the content test tree (intent-alignment) — documented and test-only; shipment content is unchanged.
  - `[low]` `[reject]` D-9 — several assertions verify test scaffolding (intent-alignment) — the content-side suites assert the shipped values directly.
  - `[low]` `[reject]` D-10 — no user-visible surface exists (intent-alignment) — by design; the presenter is Story 2.8.
  - `[low]` `[reject]` D-11 — the diff edits the CI gate ledger it depends on (intent-alignment) — that is the ledger's own instruction for the story that appends a gate.
- **Routing.** No `intent_gap` and no `bad_spec`: every survivor's smallest fix is local (a test assertion, a script comparison, a declared surface, a dependency declaration, a doc update) and adds no new public API. Nine `patch` groups cover 18 findings (6 `medium`, 12 `low`); 35 `low` rejects and 1 `false`, none `defer`. All patches applied and re-verified on the settled tree.

## Design Notes

**Why the phase is an input, not a computed transition.** `EventTable.phase` means the scheduler must know the active phase, but the transition machine, tension and the user-visible ladder are Story 2.3. So 2.2 defines the closed `SessionPhase` vocabulary and receives the phase on each `TickInput`; the sweep drives a time-based phase schedule as the host. 2.3 then computes that phase and nothing here is discarded.

**Why content is engine-level and not hunt-bound.** Epic 2's FRs are FR-1/2/4/5/9/10/30/31 — FR-8 (a Hunt binding a Phenomenon to tools, environment and pacing) is Epic 5, and `HuntDefinition` arrives with Story 5.4. 2.2 therefore ships the tables and the directive pool as engine content; `tableForPhase` is the seam 5.4 binds a hunt to.

**Why the interval is drawn per gap and not per tick.** A per-tick constant probability is memoryless too, but a drawn gap makes the "silence floor + long tail" shape explicit, testable as an interval distribution, and independent of the tick rate — a tick-rate change must not change pacing. The gap depends only on `rng.events`, the floor and the mean, so nothing about the elapsed time since the last emission can raise the hazard.

**Why `TickResult.rng` becomes the events stream.** Story 2.1's review found the field was a never-drawn constant. Now that the scheduler draws, the snapshot must be the stream that drives emissions, so a replay comparison detects a divergence in the actual draw sequence rather than in generator identity alone.

## Verification

**Commands:**
- `npm run verify` -- expected: `tsc --noEmit`, ESLint, both Vitest projects and `claims:check` exit 0
- `npm run golden:seed` -- expected: the committed fixture replays identically, exit 0
- `npm run bundle` -- expected: `expo export --platform ios` exits 0
- Probe: set a table's `emptyWeight` to `0` -- expected: the `emptyWeight` test fails
- Probe: change an event-table weight -- expected: the golden-seed fixture diverges and its test fails
- Probe: add a directive naming a direction (e.g. `Walk north.`) -- expected: the directive-pool test fails

**Manual checks (if no CLI):**
- `src/engine/**` still imports no `react`/`react-native`/`expo*`/`zustand` and no `@/data/**`.
- The shipped tables all carry `emptyWeight > 0` and a `silenceFloorMs`.

## Auto Run Result

Status: done

Story 2.2 makes the engine *emit*. The scheduler draws a memoryless gap from `rng.events` (`floor × silenceScale + exp(mean)`, clamped to an engine floor), then draws a weighted winner over the active phase's table entries **plus `emptyWeight`** — so silence is always a valid draw — filtered by the engine-held cooldown/anti-repeat/once-per-session rules; a `silence`-category winner extends the floor instead of firing. A directive scheduler draws object-less verbs from the authored pool via `rng.session`, at most six per session at least three minutes apart. The shipped content (definitions, phase-keyed tables, the directive pool) lives in `src/data/**` and is loaded through `src/data/content.ts`. `TickResult.rng` is now the `rng.events` snapshot, so a replay compares the draw stream that drove emissions, and the committed golden-seed fixture is CI-blocking.

**Files changed**
- `src/engine/models/{phase,event,directive,content}.ts` (new) + `emission.ts`, `ids.ts`, `index.ts` (modified) — the phase vocabulary, the event/table/definition and directive models, the content bundle, and the `event`/`directive` emission variants.
- `src/engine/RandomEngine.ts` (modified) — `pick`/`weighted`/`exponent`.
- `src/engine/rules/{silence,cooldown}.ts` (new) — the memoryless gap draw and the engine-held cooldown/anti-repeat rules.
- `src/engine/EventScheduler.ts` (new) — weighted selection, phase keying, silence extension.
- `src/engine/directives/{SessionDirective,DirectiveScheduler}.ts` (new) — the directive seam and its ≤6 / ≥3 min cadence.
- `src/engine/InvestigationEngine.ts` (modified) — `TickInput.phase`, the content deps, both schedulers wired into `tick`, `TickResult.rng` = the events fork.
- `src/engine/replay.ts` (new) — the pure replay driver and the host phase schedule.
- `src/data/content.ts` (new) + `src/data/events/{definitions,tables}.json`, `src/data/directives/pool.json` (new) — the shipped content and its typed loader.
- `scripts/golden-seed.mjs` (new), `package.json` (modified — `golden:seed`, `vite`), `.github/workflows/ci.yml` (modified) — the CI-blocking golden-seed gate.
- `eslint.config.js` (modified) — a test-only relaxation so `src/data/__tests__/**` can fold shipped content through the engine.
- `scripts/claims/config.json` + `src/config/__tests__/claims.test.ts` (modified) — the directive pool declared as a `content-string-table` surface.
- `README.md` (modified) — the gate ledger now names the golden-seed gate.
- Tests (new/modified): `src/engine/__tests__/{scheduler,silence,cooldown,directives,golden-seed,replay,purity}.test.ts`, `src/engine/__tests__/golden/fixture.json`, `src/engine/models/__tests__/models.test.ts`, `src/data/__tests__/{tables,directives}.test.ts`.
- `_bmad-output/implementation-artifacts/spec-2-2-emissions-can-be-replayed-but-cannot-be-learned.md` (new) — this spec.

**Review findings breakdown.** 54 findings, 0 high, 12 medium, 41 low, 1 false, 0 maybe-false, across four lenses into 9 `patch` groups covering 18 findings, 35 `low` rejects and 1 `false`, none deferred. Patched: the golden fixture's content-version comparison, the declared surface for the directive copy (claims now 9 surfaces), the engine min-gap clamp observed through the scheduler, the content-integrity assertions (ban ids resolve; `category`↔`extendsSilenceMs`), the MEMORYLESS test reading the shipped QUIET parameters, `vite` declared as a devDependency, the golden test's exhaustiveness arm, the README gate ledger, and this spec's completion. Rejected as `false`: the eslint-relaxation claim (the Content block never carried the `Math.random` ban). Rejected as `low`: the AD-6 `bannedEvents` wording tension, the lexical directive gate, the unused `EventDefinition.weight`, the fixed directive cadence, the unreachable `weighted` throw, guard-adding on inputs no caller produces, and the descriptive intent-alignment divergences.

**Follow-up review recommendation:** `true` — a first pass that patched six `medium` entries (the golden content-version identity, the directive-copy surface, the min-gap clamp, the content integrity, the MEMORYLESS parameters, and the `vite` dependency). The specific unverified risk: every §C.6 pacing measurement runs through the Story 2.2 stub phase schedule in `src/engine/replay.ts` (fractions 0.15/0.4/0.7/0.85), which Story 2.3 replaces with the real transition machine — so the bands are proven against a host schedule the same story invented, not against the shipped ladder. A secondary, unflagged deviation: emissions per 20-minute session p50 ≈ 22 against addendum §C.6's 7–11 band (not one of the spec's required bands, and in tension with the required 200–260 s longest-silence band).

**Verification performed** (on the settled, patched tree, with `NODE_ENV=test` because this shell's ambient `NODE_ENV=production` fails every `ui`-suite): `npm run typecheck` exit 0; `npm run lint` exit 0; `npm test` — 57 suites, 718 tests green across both Vitest projects; `npm run claims:check` exit 0 (`clean — 9 surfaces, 103 files, 1680 strings checked`); `npm run golden:seed` exit 0 (`the committed fixture replays identically (27 emissions)`); `npm run bundle` — `expo export --platform ios` exit 0. The spec probes behave as written: `emptyWeight → 0` fails the `emptyWeight` test; a winning-weight change diverges the fixture and fails `golden:seed`; a `Walk north.` directive fails the pool test.

**Residual risks.** The §C.6 bands are measured on the 2.2 stub phase schedule (2.3 replaces it). Emissions/session p50 (~22) exceeds §C.6's 7–11 band, which is not one of this story's required bands and conflicts with the required longest-silence band — 2.3's real ladder is where pacing is re-tuned. `src/data/__tests__/**` carries a test-only AD-1 relaxation. The golden Vite script depends on `vite` (now declared) and on the fixture's content version, which the script now checks.
