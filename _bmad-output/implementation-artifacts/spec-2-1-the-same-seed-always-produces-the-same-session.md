---
title: 'Story 2.1 — The same seed always produces the same session'
type: 'feature'
created: '2026-10-09'
status: 'done'
baseline_revision: '05218bd0ad85f481548933d650667cf476a5de3f'
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

**Problem:** Nothing about a Session is reproducible today. There is no seed, no seeded random source, no time base, and no engine — `/Volumes/SSD/Documents_Backups/vietvtc4/Documents_SSD/BlueDuckLabs/NightTrace/src/engine/` holds only boundary fixtures and a purity test. A case file could not be reconstructed, and any later feature could quietly introduce non-determinism that makes replay a lie. Every remaining Epic 2 story (scheduler, phase ladder, sensors, persistence) builds on this substrate.

**Approach:** Land the determinism spine — branded engine models, a dependency-free `xmur3 → sfc32` PRNG behind a labelled-fork `RandomEngine`, one-shot `SeedParts` composition with a stable serialization, a `Clock` that is the only wall-clock reader and the only producer of `SessionMs`, and the pure `createInvestigationEngine` entry whose `tick` is a `(seed, tick input) → Emission[]` fold over immutable state. Emissions that need content, scheduling or phases are deliberately left to Stories 2.2, 2.3 and later.

## Boundaries & Constraints

**Always:** `src/engine/**` stays a pure TypeScript core — no `react`, `react-native`, `expo*`, `zustand`, no `Date.now()` / `Math.random()` / `performance.now()`, no filesystem/network/db/audio/haptics (AD-1). Randomness is drawn **only** through `RandomEngine.fork(label)` over the closed seven-label set plus `fork('rng.content.' + definitionId)` (AD-4); the label set is closed and a fork of the same label is order-independent. `SeedParts` is composed **once**, is pure, is serialized verbatim, and is never recomputed; the same `SeedInput` yields the same `Seed` (AD-3). `ContentVersion` is part of the seed derivation so a content bump changes the replay key. `services/Clock` is the **only** wall-clock reader in `src/` and the only producer of `SessionMs`. Models obey AD-14: every id branded, every field `readonly`, every variant set a discriminated union tagged `kind` handled with an exhaustive `switch` and `default: never`, absence spelled `null`, no `any` and no `as` outside a validator/brand factory. The engine returns a **new** state and never mutates the state it was given; it never reads a wall clock — the host supplies `SessionMs`/`TickIndex`.

**Never:** No event scheduling, authored event tables, silence distribution, cooldown/anti-repeat rules or directive scheduler (Story 2.2). No phase ladder, tension, Attunement or RLE tick digest (Story 2.3). No sensor hub or `expo-*` import (Story 2.4). No SQLite, repositories, migrations or `sessions` row write (Story 2.5) — 2.1 defines the seed/persistence **contract** and `db/kv.ts` already exists for later stories. No new engine boundary ESLint rule (AD-1 rules already exist and must not be re-implemented). No user-facing replay feature, no UI, no React component. Do not rename any existing `IdFactory` id alias and do not move the ids `IdFactory` still owns.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| SEED_COMPOSE | a `SeedInput` with coordinates | `SessionSeed.seed` equals `seedFromParts` of the canonical parts; `parts` echoes every input field verbatim, including `contentVersion` | No error expected |
| SEED_UNCHARTED | `coords: null` | `parts.coords === null`; the seed is still composed from time + fingerprint; the session is marked place-less | No error expected |
| SEED_STABLE | the same `SeedInput` twice, with object keys inserted in a different order | identical `Seed` and identical `serializeSeedParts` output | No error expected |
| FORK_CLOSED | `fork('rng.events')` | a substream whose stream depends only on `(seed, label)`, not on when it was forked | an unknown label is a programmer error → `invariant`/throw |
| FORK_ORDER | fork A then B vs fork B then A; a draw taken from one fork | the other fork's subsequent draws are unchanged | No error expected |
| PRNG_VECTOR | a fixed seed | the golden draw sequence, identical across runs and platforms | No error expected |
| CLOCK_MONOTONIC | a `SessionClock` advanced with increasing epoch ms | `SessionMs` never decreases; while paused it stays flat; resume continues | No error expected |
| REPLAY_IDENTICAL | the same seed + the same `TickInput[]`, twice | identical `TickResult[]` — state, emissions and `rng` snapshot | No error expected |
| CONTENT_VERSION | two `SeedInput`s differing only in `contentVersion` | different seeds — the version is part of the replay key | No error expected |

</intent-contract>

## Code Map

Epic context: `/Volumes/SSD/Documents_Backups/vietvtc4/Documents_SSD/BlueDuckLabs/NightTrace/_bmad-output/implementation-artifacts/epic-2-context.md` (valid). Sources: `ARCHITECTURE-SPINE.md` AD-1/2/3/4/14, the Structural Seed (`src/engine/**`, `src/engine/models/`), and the Consistency Conventions; the engine contract `02` §G.6/§H.0–H.3 for the concrete shapes (`RandomEngine`, `SeedParts`, `SessionMs`/`TickIndex`/`EpochMs`/`Unit`); `epics.md` Story 2.1. Continuity: `spec-1-1-app-installs-and-runs-on-device.md` (the engine purity lint + `purity.test.ts`), `spec-1-2-design-tokens.md` (token discipline the services layer inherits).

- `src/engine/models/brand.ts` — CREATE. `Brand<T, B>` over a module-private `unique symbol`, exactly as `02` §H.0. The canonical declaration; nothing else declares a brand.
- `src/engine/models/ids.ts` — CREATE. Branded types: `Seed`, `ContentVersion` (`'YYYY.MM.DD.N'`), `HuntId`, `SessionId`, `EventDefinitionId`, and the numeric brands `SessionMs` (elapsed), `TickIndex`, `EpochMs`, `Unit`; plus `unit(n): Unit`, the one clamping brand factory (the `02` §H.1 precedent for a single assertion).
- `src/engine/models/seed.ts` — CREATE. `GeoPoint`, `Environment`, `SkyCondition`, `TemperatureBand`, `SensorFingerprint`, `SeedParts`, `SessionSeed`, `ConditionsSummary`, and `serializeSeedParts(parts): string` (key-order-stable). Shapes follow `02` §H.2; `SessionMs`/`TickIndex` branding follows `02` §H.1.
- `src/engine/models/emission.ts` — CREATE. `EngineNotice`, `Emission` — a discriminated union tagged `kind`, of which 2.1 defines only the `notice` variant. Later stories add `event` (2.2), `phase` (2.3), `evidence` (Epic 3) and the rest; a consumer's `default: never` then makes each addition a compile error until handled.
- `src/engine/models/index.ts` — CREATE. The barrel `02` §H names (`src/engine/models/index.ts`); so consumers import from one place and later stories extend it without touching importers.
- `src/engine/prng.ts` — CREATE. `xmur3` (string→32-bit seed hash) and `sfc32` (the generator), both dependency-free, plus the `Prng` shape (`next()` in `[0, 1)` and a serializable 4-word state). No global state, no `Math.random`.
- `src/engine/RandomEngine.ts` — CREATE. `FORK_LABELS` (the closed seven), `ForkLabel`, `ContentForkLabel` (`` `rng.content.${string}` ``), `RandomState`, `RandomEngine`, `createRandomEngine(seed)`, `seedFromParts(parts)`. `fork(label)` re-derives its substream from `seedFromParts([seed, label])` so it is order-independent; `next`/`int`/`bool` are the 2.1 draw surface (the distribution helpers `pick`/`weighted`/`gaussian`/`exponent` arrive with Story 2.2, their first consumer). Deliberately stateful internally to be fast; snapshot/restore make it replayable.
- `src/engine/InvestigationEngine.ts` — CREATE. `SimulationState` (readonly), `TickInput` (`tickIndex`, `elapsedMs`), `TickResult` (`state`, `emissions`, `rng`), `InvestigationEngine`, `createInvestigationEngine(session)`. The engine derives its own `RandomEngine` from `session.seed` (never injected) so replay cannot diverge; `tick(input)` returns a new state and emits `notice: 'session_started'` on the first tick, `finish(reason)` emits `notice: 'session_ended'`. `TickInput` grows additively (`digest` in 2.4, `userActions` in Epic 4) — do not pre-add fields.
- `src/services/Clock.ts` — CREATE. `Clock` (`nowEpochMs(): EpochMs`, `nowIso(): string`, `dayKey(): string`) — the only `Date`/wall-clock call site in `src/` — and `createSessionClock(startEpochMs): SessionClock` with `elapsedMs(): SessionMs`, `advance(nowEpochMs): SessionMs`, `pause()`, `resume()`: the single producer of `SessionMs` inside a live session, monotonic, flat while paused.
- `src/services/SeedService.ts` — CREATE. `SeedInput` (`huntId`, `coords: GeoPoint | null`, `startedAtMs: EpochMs`, `fingerprint: SensorFingerprint`, `environment`, `sky`, `temperatureBand`), `composeSeed(input): SessionSeed` — pure, one-shot, delegates the hash to `seedFromParts` and returns the parts verbatim. Persistence onto the session row is Story 2.5's write; 2.1 guarantees composition is pure and the parts serialize stably.
- `src/data/ContentVersion.ts` — CREATE. `CONTENT_VERSION: ContentVersion` (a `'YYYY.MM.DD.N'` constant). Lives in the Content layer, which may import `engine/models` only — matches the existing eslint `CONTENT_BAN`.
- `src/services/IdFactory.ts` — MODIFY. Import `Brand` from `@/engine/models/brand` and delete its local `declare const brand`/`Brand` so there is exactly one brand declaration in the tree. Leave the id aliases and the `mint` helpers otherwise unchanged.
- Tests: `src/engine/__tests__/prng.test.ts`, `src/engine/__tests__/RandomEngine.test.ts`, `src/engine/__tests__/seed.test.ts`, `src/engine/__tests__/replay.test.ts`, `src/engine/__tests__/purity.test.ts` (extend), `src/engine/models/__tests__/models.test.ts`, `src/services/__tests__/Clock.test.ts`, `src/services/__tests__/SeedService.test.ts`.

## Tasks & Acceptance

**Execution:**
- [x] `src/engine/models/{brand,ids,seed,emission,index}.ts` -- the branded model layer -- every later story imports these instead of re-declaring brands.
- [x] `src/engine/prng.ts` -- `xmur3` + `sfc32`, dependency-free -- the PRNG is our own, per AD-4 and `02` line 61.
- [x] `src/engine/RandomEngine.ts` -- closed-label `fork` over `seedFromParts([seed, label])` -- order-independence is what keeps draw order from coupling features.
- [x] `src/services/SeedService.ts` -- `composeSeed` + `SeedInput` -- the one-shot seed composition; `serializeSeedParts` in the models module.
- [x] `src/data/ContentVersion.ts` -- the version constant that salts the seed -- a bump is the one deliberate replay break (AD-3).
- [x] `src/services/Clock.ts` -- the wall-clock reader and the `SessionMs` producer -- AD-1 forbids either inside `engine/`.
- [x] `src/engine/InvestigationEngine.ts` -- the pure tick/`finish` fold over immutable state -- the `(seed, tick input) → Emission[]` shape the AC names.
- [x] `src/services/IdFactory.ts` -- single-source `Brand` -- two brand declarations would make the same tag mutually unassignable.
- [x] the test suites -- one case per matrix row, plus the exhaustion/`default: never` check -- the ACs are proved, not asserted.

**Acceptance Criteria:**
- Given a `SeedInput`, when `composeSeed` runs, then `SeedParts` holds the hunt, the location (or `null`), the start time, the conditions and the one-shot fingerprint, and it is serialized verbatim and never recomputed — a second call with the same input yields an identical `Seed`.
- Given a Session recorded without location, when the seed is composed, then it is generated from time + fingerprint alone, `coords` is `null`, and the session is marked place-less.
- Given the `RandomEngine`, when its API is inspected, then randomness is drawn only from `fork(label)` over the closed seven-label set, `fork('rng.content.' + definitionId)` is the only expansion, and an unknown label fails.
- Given the PRNG, when the same input is drawn twice (and on any platform), then it produces the same output, asserted against a committed golden vector list.
- Given `src/engine/**`, when it is linted and tested, then it imports no `react`/`react-native`/`expo*`/`zustand`, calls no `Date.now()`/`Math.random()`/`performance.now()`, and the `engine` Vitest project still runs on the node environment.
- Given a live Session, when time is read, then `services/Clock` is the single producer of `SessionMs` and the engine receives elapsed time as input and reads no wall clock.
- Given a Session recorded with its seed, hunt, content version and tick inputs, when the simulation is replayed, then it produces an identical emission sequence — replay is an audit property with no UI and no displayed promise.
- Given a `ContentVersion` bump, when replay parity is considered, then it is the only event that invalidates parity and it does so knowingly; fork labels are never renamed once a version ships.
- Given the new models, when they are inspected, then every id is branded, every field is `readonly`, every variant set is a discriminated union tagged `kind` with an exhaustive switch and `default: never`, absence is `null`, and there is no `any` and no `as` outside the brand factory.
- Given `npm run verify` and `npm run bundle`, then typecheck, lint, both Vitest projects, the claims lint and the iOS export all pass.

## Implementation Notes

Implemented on the `full` route; the determinism spine landed whole and verification is green on the settled tree.

**What was built.** `src/engine/models/{brand,ids,seed,emission,index}.ts` (the single `Brand`, the branded ids and numeric aliases with their factories, `SeedParts`/`SessionSeed`/`ConditionsSummary` with `seedValuesFromParts` and `serializeSeedParts`, and the one-variant `Emission` union + `assertNever`); `src/engine/prng.ts` (`xmur3`/`sfc32`); `src/engine/RandomEngine.ts` (`seedFromParts`, `createRandomEngine`, the closed `FORK_LABELS`, order-independent `fork`, `snapshot`/`restore`); `src/engine/InvestigationEngine.ts` (the pure `tick`/`finish` fold over immutable state); `src/services/Clock.ts` (`Clock` + `SessionClock`); `src/services/SeedService.ts` (`composeSeed`); `src/data/ContentVersion.ts`; and `src/services/IdFactory.ts` re-pointed at the single `Brand`.

**Decisions.**
- `SessionSeed` carries no `sessionId` — the host mints it (2.5/2.8) and the engine is constructed from the composed seed; a SessionId declaration exists in `engine/models/ids.ts` matching `IdFactory`'s.
- `createInvestigationEngine(session)` derives its own `RandomEngine` from `session.seed` rather than taking it as a dependency, so a replay cannot diverge by injection. `EngineDeps`/content and the tick draw set arrive with 2.2.
- The tick emits only lifecycle `notice` emissions in 2.1; `TickInput` grows additively (`digest` in 2.4, `userActions` in Epic 4).
- `hourBandOf` derives the night band from the epoch hour (no timezone is readable from a pure composer); the Brief refines it with the user's local hour in 2.6.
- The conditions-board words live in the declared `src/data/strings/conditions.ts` table so the claims lint covers them.

**Surprise — the ambient `NODE_ENV=production`.** This shell exports `NODE_ENV=production`, which makes React's production build omit `act` and fails every `ui`-project suite (`actImplementation is not a function`). It is pre-existing and ambient — an untouched test (`src/ui/components/__tests__/Rule.test.tsx`) fails the same way, and CI sets no `NODE_ENV` — so all verification ran with `NODE_ENV=test`.

## Spec Change Log

## Review Triage Log

### 2026-10-09 — Review pass 1

- verdicts: 38 findings — high 0, medium 8, low 28, false 2, maybe-false 0
- lenses: blind-hunter (20), edge-case-hunter (10), verification-gap (5 + 2 other), intent-alignment (1, descriptive). All four ran; none died.
- findings:
  - `[low]` `[reject]` `SessionSeed` omits `sessionId` vs `02` §H.2 (blind-hunter) — the host composes the seed and mints the id (2.5/2.8); Story 2.1's ACs never name one, and adding it would mint a Shell-owned id inside the pure core. Not met in use; fix adds surface.
  - `[low]` `[reject]` No `EngineDeps`/content seam (blind-hunter) — the spec scopes `createInvestigationEngine(session)`; deps arrive with 2.2. No defect met in use.
  - `[false]` `[reject]` Daily anomaly missing from the seed (blind-hunter) — `02` §H.2 is canonical and declares `SeedParts` **without** an anomaly; §G.6's line is a preview comment, and `conditionsSummary.anomalyOfTheDay` is the board's inert field.
  - `[low]` `[patch]` `serializeSeedParts` was a positional array, not a `SeedParts` serializer (blind-hunter) — rewritten to a named-field, key-order-stable JSON that `JSON.parse` round-trips; `seed.test.ts` updated.
  - `[low]` `[reject]` `CONTENT_VERSION` has no production reader (blind-hunter) — the Brief (2.6) supplies it through `SeedInput`; the constant is the one declared value. Not met in use.
  - `[low]` `[reject]` The new services are imported only by tests (blind-hunter) — expected for the substrate story; the consumers are 2.5/2.6/2.8.
  - `[medium]` `[patch]` The tick never draws, so `REPLAY_IDENTICAL` was vacuous (blind-hunter; same root as verification-gap V1) — `replay.test.ts` now asserts `rng.seed`/`state.seed` equal the session seed and adds a discriminating different-seed case, so a hardcoded generator fails. The tick's draw set is 2.2's by design.
  - `[low]` `[patch]` `finish` had no terminal guard (blind-hunter; same root as edge-case E1) — an invariant now rejects a second `finish`, with a test. The bundled `request()` half is Epic 4 and rejected.
  - `[medium]` `[patch]` `RandomEngine.restore` ignored `RandomState.seed` (blind-hunter; same root as edge-case E3 and verification-gap other-2) — an invariant now rejects a foreign snapshot; test added.
  - `[low]` `[reject]` `bool`/`int` accept out-of-range or non-integer inputs (blind-hunter; same root as E4/E5) — guard-adding for inputs no demonstrated caller produces; V4's straddle test covers `bool`'s actual correctness.
  - `[low]` `[reject]` `unit(NaN)` passes through (blind-hunter; same root as E7) — guard-adding; the fingerprint is a quantized sensor input, not an arbitrary number.
  - `[low]` `[patch]` `seedFromParts` was a second `as` (blind-hunter) — now routed through `ids.seedId`, so the brand assertion stays in one module. The join-ambiguity half is rejected: the parts are typed fields and closed enums, so the NUL join is injective over real inputs.
  - `[low]` `[reject]` `contentVersion` checks shape, not calendar range (blind-hunter) — a mistyped version is an authoring error at the boundary, not a user-facing defect; fix adds validation.
  - `[low]` `[patch]` `hourBandOf` untested (blind-hunter) — every boundary is now asserted (V2). The UTC-vs-local half is rejected: the band is inert until 2.6, which owns the user's local hour.
  - `[medium]` `[patch]` `summarizeConditions` unasserted and its words outside the claims surface (blind-hunter; same root as V2/V3) — every sky mapping, hour boundary and place value is now asserted, and the words moved to the declared `src/data/strings/conditions.ts` table.
  - `[low]` `[patch]` `dayKeyOf` untested at the 04:00 cutoff (blind-hunter; same root as V5) — a fake-timer test pins 23:20/01:10 as one night and 05:00 as the rollover. The DST edge is rejected as unreachable in that window.
  - `[low]` `[patch]` Spec artifacts empty and the tracker says `backlog` (blind-hunter) — this finalize fills `## Implementation Notes`/`## Auto Run Result`, ticks the Execution tasks, sets `status: done`, and updates `sprint-status.yaml`.
  - `[low]` `[patch]` `epic-2-context.md` said "two Jest projects" (blind-hunter; same root as V-other-1) — corrected to Vitest; the baseline commit `05218bd` is the Jest→Vitest migration.
  - `[false]` `[reject]` No CI wiring for this story's gates (blind-hunter) — the new suites run under `npm test`, which `npm run verify` runs, which `ci.yml` runs; `ci.yml`'s ledger tracks *separate* gates (grain:check, golden-seed).
  - `[low]` `[patch]` `assertNever`'s message named `Emission` though it is generic (blind-hunter) — message generalised.
  - `[low]` `[patch]` `finish()` called twice (edge-case-hunter) — same root as the `finish` guard above.
  - `[low]` `[reject]` `tick` accepts a regressed `elapsedMs`/`tickIndex` (edge-case-hunter) — the sole producer is `Clock`, which already ignores a backwards read; a guard adds a branch for a state no caller reaches.
  - `[low]` `[patch]` `restore()` from a foreign seed (edge-case-hunter) — same root as the `restore` guard above.
  - `[low]` `[reject]` `bool` probability outside `[0,1]` (edge-case-hunter) — same root as the `bool`/`int` guard rejection.
  - `[low]` `[reject]` `int` fractional/NaN bounds (edge-case-hunter) — same root as the `bool`/`int` guard rejection.
  - `[low]` `[reject]` `fork('rng.content.')` empty id (edge-case-hunter) — guard-adding; no caller passes an empty definition id.
  - `[low]` `[reject]` `unit(NaN)` (edge-case-hunter) — same root as the `unit(NaN)` rejection.
  - `[low]` `[reject]` `Clock` resume rebase with a backwards read (edge-case-hunter) — guard-adding; `Clock` itself ignores non-monotonic reads.
  - `[low]` `[reject]` "only producer of `SessionMs`" is imprecise (edge-case-hunter) — `sessionMs` is the brand constructor; `Clock` produces the values. Naming, no harm.
  - `[low]` `[reject]` The tick-signature claim (edge-case-hunter) — AD-2's shorthand; the seed is bound at construction (documented in Design Notes).
  - `[medium]` `[patch]` V1 — engine randomness never tied to the session seed by any test (verification-gap; mutation proved it) — fixed by the `replay.test.ts` assertions above.
  - `[medium]` `[patch]` V2 — conditions board derived fields asserted nowhere (verification-gap) — table-driven cases added for every `SkyCondition` mapping and every `HourBand` boundary, plus charted place / anomaly / notice.
  - `[medium]` `[patch]` V3 — the board's user-facing copy outside the declared claims surface (verification-gap) — moved to `src/data/strings/conditions.ts`, declared `ui.conditions-copy` (`ui-string-table`) in `scripts/claims/config.json`; the claims lint now reports 8 surfaces.
  - `[medium]` `[patch]` V4 — `bool`'s only test could not observe an inverted comparison (verification-gap; mutation proved it) — a straddle assertion (draw 0.8834 → `bool(0.9)` true, `bool(0.5)` false) now fails for `>`.
  - `[medium]` `[patch]` V5 — `Clock.dayKey`'s 04:00 cutoff unobservable (verification-gap; mutation proved it) — a fake-timer test pins the rollover.
  - `[low]` `[patch]` V-other-1 — `epic-2-context.md` Jest/Vitest (verification-gap) — same as the Jest/Vitest correction above.
  - `[low]` `[patch]` V-other-2 — `restore()` ignores `seed` (verification-gap) — same as the `restore` guard above.
  - `[low]` `[reject]` IA1 — the diff implements one story (2.1) of the three the invocation names, at the module-contract surface (intent-alignment, descriptive) — this run is one story of the three by design; Stories 2.2/2.3 are the next iterations, and Story 2.1's own ACs name the substrate the diff exercises. Descriptive only; no action.
- **Routing.** No `intent_gap` and no `bad_spec`: every survivor's smallest fix is local (test assertions, two small guards, a strings-table move, an artifact/context correction) and adds no new public API. Ten `patch` groups cover 20 findings (5 `medium`, 15 `low`): the engine-rng/seed test gap, the conditions board (assertions + declared copy), the `bool` straddle, the `dayKey` cutoff, the `finish` guard, the `restore` guard, the brand-assertion + serializer honesty, `assertNever`, the epic-context correction, and this spec/tracker completion. 18 `reject` (2 `false`, 16 `low`), none `defer`. All patches applied and re-verified on the settled tree.

## Design Notes

**Why the engine is a fold, not a scheduler.** The AC asks for `(seed, tick input) → Emission[]`, so 2.1 lands the pure shape and the determinism guarantees and nothing else. The tick advances `TickIndex`/`SessionMs` and returns a **new** `SimulationState`; `TickResult` carries the post-tick `rng` snapshot so a replay can be compared tick by tick. What fills `emissions` — the authored event tables (2.2), the phase ladder and tension (2.3), the sensor digest (2.4) — each extend the same fold additively.

**Why the fork label is in the replay key.** A fork's substream must depend on `(seed, label)` and nothing else, so two features cannot shift each other's draws by adding one. Deriving `fork(label)` from `seedFromParts([seed, label])` (rather than from a parent generator's current position) is what makes draw order irrelevant — and it is why a label, once shipped, can never be renamed.

**Why `ContentVersion` salts the seed rather than being stored beside it.** AD-3 says a content bump is the only thing that breaks replay parity. Putting the version into the `SeedParts` that feed the hash makes that break structural: the same night on a newer content version derives a different seed, deliberately, instead of silently replaying against tables that no longer exist.

**Why `Clock` and `SessionClock` are split.** AD-1 forbids the engine a wall clock and the Consistency Conventions make `services/Clock` the single producer of `SessionMs` and `EpochMs`. `Clock` reads the wall clock; `SessionClock` converts epoch deltas into monotonic `SessionMs` and freezes when paused — the shape AD-29's backgrounding hard-stop needs, without implementing that behaviour here.

## Verification

**Commands:**
- `npm run verify` -- expected: `tsc --noEmit`, ESLint, both Vitest projects and `claims:check` exit 0
- `npm run bundle` -- expected: `expo export --platform ios` exits 0 (the engine is imported by no route yet; the export proves nothing under `src/app/**` regressed)
- `npm test` -- expected: the new engine suites run in the `engine` (node) project and the new service suites in the `ui` project
- Probe: add an eighth entry to `FORK_LABELS` -- expected: the closed-set test fails until the test is updated deliberately
- Probe: call `Date.now()` inside `src/engine/InvestigationEngine.ts` -- expected: lint (AD-1 `no-restricted-globals`) fails

**Manual checks (if no CLI):**
- `src/engine/**` contains no import of `react`, `react-native`, `expo*` or `zustand` and no `Math.random`.
- Replaying the same `(seed, TickInput[])` twice yields byte-identical `TickResult[]` output.

## Auto Run Result

Status: done

Story 2.1 lands the determinism spine for Epic 2. A `SessionSeed` is composed once and purely from hunt, location (or `null`), start time, environment/sky/temperature, the one-shot sensor fingerprint and the content version, with a key-order-stable serialization; randomness flows only through `RandomEngine.fork(label)` over the closed seven-label set plus `fork('rng.content.' + id)`, backed by a dependency-free `xmur3 → sfc32` PRNG pinned to committed golden vectors; `services/Clock` is the single wall-clock reader and the single producer of `SessionMs`; and `createInvestigationEngine` is the pure `tick`/`finish` fold over immutable state that emits the lifecycle `notice`s. Event scheduling (2.2), the phase ladder and tension (2.3), sensors (2.4) and persistence (2.5) are deliberately out of scope.

**Files changed**
- `src/engine/models/brand.ts` (new) — the single `Brand<T, B>` declaration.
- `src/engine/models/ids.ts` (new) — branded ids and numeric aliases (`Seed`, `ContentVersion`, `HuntId`, `SessionId`, `EventDefinitionId`, `SessionMs`, `TickIndex`, `EpochMs`, `Unit`) with their factories.
- `src/engine/models/seed.ts` (new) — `SeedParts`/`SessionSeed`/`ConditionsSummary`; `seedValuesFromParts` (hash preimage) and `serializeSeedParts` (named-field, round-trippable).
- `src/engine/models/emission.ts` (new) — the one-variant `Emission` union (`notice`) and the generic `assertNever`.
- `src/engine/models/index.ts` (new) — the models barrel.
- `src/engine/prng.ts` (new) — dependency-free `xmur3`/`sfc32`.
- `src/engine/RandomEngine.ts` (new) — `seedFromParts`, `createRandomEngine`, the closed `FORK_LABELS`, order-independent `fork`, `snapshot`/`restore`.
- `src/engine/InvestigationEngine.ts` (new) — the pure `tick`/`finish` fold.
- `src/services/Clock.ts` (new) — `Clock` and `SessionClock`.
- `src/services/SeedService.ts` (new) — `SeedInput` and `composeSeed`.
- `src/data/ContentVersion.ts` (new) — `CONTENT_VERSION`, part of the replay key.
- `src/data/strings/conditions.ts` (new) — the declared conditions-board word table.
- `src/data/strings/index.ts` (modified) — exports the conditions table.
- `src/services/IdFactory.ts` (modified) — imports `Brand` from the engine models instead of declaring its own.
- `scripts/claims/config.json` (modified) — declares `ui.conditions-copy`.
- `src/engine/__tests__/{prng,RandomEngine,seed,replay,purity}.test.ts`, `src/engine/__tests__/fixtures.ts`, `src/engine/models/__tests__/models.test.ts`, `src/services/__tests__/{Clock,SeedService}.test.ts` (new/modified) — one case per I/O-matrix row plus the review patches.
- `_bmad-output/implementation-artifacts/epic-2-context.md` (new) — the compiled epic context (the Stack line corrected to Vitest).

**Review findings breakdown.** 38 findings, 0 high, 8 medium, 28 low, 2 false, 0 maybe-false, across four lenses into 10 `patch` groups covering 20 findings, 16 `low` rejects and 2 `false` rejects, none deferred. Patched: the engine-rng/seed test gap (medium), the conditions board — assertions plus a declared copy surface (medium), the `bool` straddle assertion (medium), the `dayKey` cutoff test (medium), the `restore` seed guard (medium); and `serializeSeedParts`' honesty, the `finish` terminal guard, single-sourcing the `seedFromParts` brand assertion, generalising `assertNever`, the epic-context Vitest correction, and this spec/tracker completion. Rejected as `false`: the "daily anomaly missing" and "no CI wiring" claims. Rejected as `low` (guard-adding, or not met in everyday use): input-range guards (`bool`/`int`/`unit(NaN)`/empty content fork), a `tick` regression guard, `contentVersion` calendar validation, the `SessionSeed.sessionId` omission, the absent `EngineDeps` seam, the inert-services observation, the `hourBandOf` UTC half, and the two descriptive claim notes.

**Follow-up review recommendation:** `true` — a first pass that patched five `medium` entries (the rng/seed test gap, the conditions board, the `bool` straddle, the `dayKey` cutoff, and the `restore` guard). The specific unverified risk: the `replay.test.ts` assertions now prove the engine's generator is keyed to the session seed and that two seeds differ, but `TickResult.rng` is still the *undrawn* initial snapshot on every tick (the tick's draw set arrives with 2.2), so the audit property is proven at the generator-identity level and not yet at the emission level.

**Verification performed** (on the settled, patched tree, with `NODE_ENV=test` because this shell's ambient `NODE_ENV=production` is a pre-existing condition that fails every `ui`-suite): `npm run typecheck` exit 0; `npm run lint` exit 0; `npm test` — 50 suites, 659 tests green across both Vitest projects; `npm run claims:check` exit 0 (`clean — 8 surfaces, 89 files, 1161 strings checked`); `npm run bundle` — `expo export --platform ios` exit 0. Both spec probes behave as written: an eighth `FORK_LABELS` entry fails the closed-set test, and a `Date.now()` in `InvestigationEngine.ts` fails the AD-1 lint.

**Residual risks.** The engine emits no scheduled events yet, so `REPLAY_IDENTICAL` is proven over an emission sequence that is only the lifecycle notices plus an identical `rng` snapshot; Story 2.2 supplies the draw set and the golden-seed fixture. `HourBand` is derived from the epoch (UTC) hour because a pure composer cannot read a timezone; the Brief refines it in 2.6. The board copy is now linted, but only because it was moved to a declared surface — a future string authored elsewhere in `src/services/**` remains outside the banned-term scan by design.
