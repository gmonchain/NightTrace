---
id: SPEC-NightTrace
companions:
  - ../../planning-artifacts/prds/prd-NightTrace-2026-10-04/prd.md
  - ../../planning-artifacts/prds/prd-NightTrace-2026-10-04/addendum.md
  - ../../planning-artifacts/architecture/architecture-NightTrace-2026-10-05/ARCHITECTURE-SPINE.md
  - ../../planning-artifacts/ux-designs/ux-NightTrace-2026-10-04/DESIGN.md
  - ../../planning-artifacts/ux-designs/ux-NightTrace-2026-10-04/EXPERIENCE.md
  - capability-map.md
  - evidence-model.md
  - content-plan.md
sources:
  - ../../../paranormal_cryptid_hunting_master_prompt.md
  - ../../brainstorming/brainstorm-paranormal-cryptid-hunting-app-2026-10-04/brainstorm-intent.md
  - ../../brainstorming/brainstorm-paranormal-cryptid-hunting-app-2026-10-04/01-product-and-game-design.md
  - ../../brainstorming/brainstorm-paranormal-cryptid-hunting-app-2026-10-04/02-engineering-and-delivery.md
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.
>
> **Read the companions.** Four of the eight are **adopted** — written and owned by the PRD, architecture and UX runs — and bmad-spec does not edit them. `prd.md` carries FR-1 … FR-39, UJ-1 … UJ-4, SM-1 … SM-8, OQ-1 … OQ-16 and the source-conflict table; `addendum.md` carries the claims boundary with its 40-row rulings table, the engine implementation contract, the schema, the stack and the tuning targets; `ARCHITECTURE-SPINE.md` carries AD-1 … AD-30 and the Structural Seed; `DESIGN.md` and `EXPERIENCE.md` carry the visual and behavioural spines. Four are spec-authored: `capability-map.md` joins the CAP ids to the FRs and ADs, `evidence-model.md` closes the Evidence vocabulary OQ-11 left open, and `content-plan.md` estimates the authored text and audio OQ-10 found unbudgeted.

# NightTrace — Paranormal Field Journal

## Why

**A vision to realize, with an opportunity attached.** NightTrace turns an ordinary night — a commute, an attic, a backyard, a walk — into a case worth investigating, and hands the user a **Case Report**: a story they took part in that nobody can disprove. The phone is a case file that writes itself. It is not a detector and must never behave like one, because detection implies proof and proof is falsifiable.

The category this enters is a **failure of honesty**. "Ghost detector" apps train users in thirty seconds to see through them, and they delete it; their moments of pleasure are unshareable because sharing would expose the claim. A procedurally-generated, openly-framed simulation sidesteps the whole failure mode. Cheap on-device sensors, deterministic seeded generation, and a phone that is already a camera, a microphone and a flashlight make it buildable by a small team with **no backend, no cloud AI and no running costs**.

What makes it matter is the second-order claim: **the app has to be good when nothing happens.** Most nights, nothing will. Absence is a designed outcome rather than a failure — a session that records nothing still produces a complete, sealed Case Report, and the app says so plainly. An app that only pays off on a hit trains the user to expect hits, and an expected hit is not a mystery.

The emotional arc is the product: *curiosity → tension → anticipation → uncertainty → surprise → collection → progression → a shareable moment.* The first five beats belong to one night; the last three belong to the weeks after it. A feature that cannot be located on that arc does not belong.

## Capabilities

- **CAP-1 — A session you cannot predict**
  - **intent:** The system can generate a Session of investigative events from a Seed composed of place, time, conditions and sensor noise, scheduling them so the timing of any event is not learnable from the user's prior Sessions.
  - **success:** Over a seeded sweep of 500 twenty-minute sessions per archetype, the median-to-90th-percentile inter-emission interval ratio holds at ≥ 3.0; the longest silence lands in the 200–260 s band at the median; ≥ 12% of sessions emit nothing at all by the ten-minute mark; and given a Session's Seed, Hunt, content version and recorded tick digest, the simulation replays to an identical emission sequence. *(FR-1, FR-2, FR-4, FR-35)*

- **CAP-2 — Seven instruments, none of which lie**
  - **intent:** The user can work a live Session through EMF, Radar, Voice, EVP, Camera, Tracker and Sky, each rendered as a qualitative band or a word rather than a number, and each still usable when its sensor is denied or absent.
  - **success:** No surface renders a percentage, unit, axis, degree, distance, coordinate or signal-strength value. Each of the four documented denials — microphone, camera, location, magnetometer — produces a working first-class alternative, and the app is playable end to end with **zero permissions granted**. *(FR-5, FR-11, FR-12, FR-13, FR-14, FR-15, FR-16, FR-17)*

- **CAP-3 — An encounter worth the wait**
  - **intent:** A Session can produce a rare, brief, ambiguous appearance of the Phenomenon — short, peripheral, never centered and never in focus — with a bounded, invisible guarantee that a first-time user reaches exactly one.
  - **success:** Of non-first-run sessions, 42–58% produce an Encounter and 25–40% of those that reach the Encounter Window close it empty. In a first-run Session the emission budget is forced to ≥ 1 with ≥ 5 minutes of silence first, it applies only while the user has zero sealed Cases, and no copy, indicator or behavior reveals that it happened. *(FR-3, FR-38, FR-2)*

- **CAP-4 — Four phenomena deep, not forty shallow**
  - **intent:** The system can run Ghost, Bigfoot, Shadow Person and Alien as four distinct Archetype behaviors — Observer, Stalker, Mimic, Ambusher — each with its own verb, pacing, sensory channel and unique failure state, and can gain a fifth Phenomenon as content alone.
  - **success:** No file under the engine directory contains a Phenomenon name; reassigning a Phenomenon to a different Archetype requires content changes and no engine change; adding a fifth Phenomenon requires only a content definition, its assets, a registry entry and a content-version bump. *(FR-6, FR-7, FR-8, FR-37, FR-38, FR-39)*

- **CAP-5 — Evidence that converges without concluding**
  - **intent:** The user can capture Evidence during a Session, and the system can accumulate it into a Signature presented as a 7–9 slot strip against a Signature Archive, including internally contested items the user can later disprove.
  - **success:** Evidence commits to durable storage at the moment of capture, so a crash or force-quit mid-session loses nothing already logged. A Signature resolves only to `MATCHED`, `PARTIAL MATCH · UNIDENTIFIED` or `NO MATCH ON FILE`, and no surface states or implies that a full match is reachable, that one exists, or what a completed slot would identify. *(FR-18, FR-19, FR-34)*

- **CAP-6 — The conclusion is the user's**
  - **intent:** The user can review each Evidence item after a Session and rule it explained or unexplained with a mundane reason, and the system can derive the Case's status from the evidence, those rulings and whether an Encounter occurred.
  - **success:** `UNEXPLAINED` requires all three of convergence ≥ 0.60, ≥ 1 Encounter and explained ratio < 0.34; `EXPLAINED` requires explained ratio ≥ 0.60; anything else is `INCONCLUSIVE`. Triage verdicts never move the Signature strip, and no copy anywhere states what combination unlocks what status. *(FR-20, FR-21)*

- **CAP-7 — The Case Report**
  - **intent:** The user can view, seal and file a complete Case Report at the end of every Session that produced a Case — including a Session with zero Evidence and zero Encounters — and that report can state plainly what was *not* recorded.
  - **success:** The report renders in order masthead, status seal, stat row, signature strip, narrative account, souvenir reel, evidence ledger, negative-space block, investigator note and conditions footer. The stat row shows duration, evidence count, encounter count, source count and one `LOW`/`MODERATE`/`HIGH` band, and **no percentage or unit-bearing number of any kind**. Sealing is a ~600 ms hold and is irreversible without a visible `REVISED` stamp. *(FR-22, FR-23, FR-36)*

- **CAP-8 — The share card is the growth engine**
  - **intent:** The user can generate and share a single image card from a sealed Case Report — carrying the case reference, the strongest artifact, the status word with its stamp ring, three stat cells, a seeded or user-written note, and the entertainment line — with nothing appended to their output.
  - **success:** The card carries no watermark, URL, QR code, app-store badge or attribution text of any kind; re-rendering the same Case at the same device pixel ratio produces a perceptually identical image; the user may replace the seeded note with up to sixty characters; and the footer always carries `An investigation experience. Not a measurement.` Target: ≥ 25% of sealed Cases produce a shared card. *(FR-24, SM-1)*

- **CAP-9 — A journal that is yours alone**
  - **intent:** The user can browse the private, on-device archive of Cases, Phenomena, Evidence and Field Notes grouped by night, and can export it or delete it entirely.
  - **success:** No feed, friends list, public profile or comparison surface exists anywhere; entries group by a 04:00 night boundary; a Phenomenon never encountered is simply absent rather than shown locked or silhouetted; export produces a user-readable file carrying the entertainment notice; and deletion removes journal content from the device and says plainly that it cannot reach what the user already shared. *(FR-25, FR-26, FR-27)*

- **CAP-10 — Progression without a grind**
  - **intent:** The user's Investigator Clearance can advance through named ranks on what they actually did — sealed Cases, documented Phenomena and matched Signatures — with streaks and case stamps that never penalize a missed night.
  - **success:** Clearance depends on those three inputs and never on elapsed time or on the number of events that fired; no XP value appears anywhere in the app; Clearance gates only cosmetic case-file themes and journal art and never a tool, an Evidence kind, a Hunt or an intensity level; and missing a night carries no penalty, loss or notification. *(FR-28, FR-29)*

- **CAP-11 — Start tonight, in any amount of time**
  - **intent:** The user can start a Hunt, resume an interrupted Session and read the night's Anomaly from Home, or run a roughly three-minute standing Field Note when they have no time for a case.
  - **success:** Home presents the user's Clearance, a featured Hunt, the other Hunts, a resume affordance, recent Evidence and the Anomaly, with no tool grid and no equipment navigation. A Field Note writes a Journal entry containing its time, place band and one line of observed material, produces **no** Case Report and no case reference, and can yield no Encounter, no Case and no Clearance advancement. *(FR-30, FR-31)*

- **CAP-12 — Nothing here is proof, and the build enforces it**
  - **intent:** A first-time user can learn the app's frame and acknowledge it before their first Session, and the shipped product can be verified as making no assertion about the real world on any surface it declares.
  - **success:** Onboarding is four screens with a non-skippable entertainment notice that stays reachable from Profile and travels with any data export. The build fails if any banned term appears in a declared, enumerated string-surface set that names at least the UI string tables, the iOS `Info.plist` purpose strings, the Android manifest permission strings, the store title and description, screenshot captions and the About notice — and the release review separately counts claim leaks on the five surfaces a string lint structurally cannot read. Rating is 12+/Teen, derived from recorded questionnaire inputs. *(FR-32, FR-33, SM-8)*

- **CAP-13 — The threshold before the field**
  - **intent:** The user can pass through a deliberate pre-Session ritual — calibrating the device, naming the place, setting an intention and choosing an intensity — and enter the field through a sustained hold rather than a tap, with exactly one deliberate way back out.
  - **success:** The Brief requires calibration, a place name and an intention before a Session can start, and a sustained 800 ms hold to enter, with early release cancelling cleanly and leaving the Brief intact. Intensity is one of `Ambient`, `Present` (default), `Intense` or `Ritual`, is locked once the Case is live, and the app states plainly that higher intensity means more signals and never a guaranteed Encounter. During a Session there is exactly one exit, `Leave the Field`, requiring a hold, and it seals the Case like any other ending. *(FR-9, FR-10)*

## Constraints

- **No backend, no account, no network.** No sign-in, no server, no network call of any kind, and no generative or cloud AI anywhere in the product at any version. All generation is deterministic, seeded and on-device, and every sentence the app displays comes from an authored template bank.
- **No real-world assertion.** No sentence in the app, its metadata, its screenshots or its share output may assert anything about the real world. Enforced as a **build-failing lint over a declared, enumerated string-surface set** — a surface not on the set is not covered. Approved market terms are a closed list, and the app never claims science, accuracy, or that a reading corresponds to anything.
- **No verifiable number on any surface.** No percentage, unit, axis, degree, distance, coordinate or signal-strength value, and `%` is banned in every shipped string. The only numerals that may appear are **counts of things that happened** and elapsed session time. Readouts are qualitative bands and words: `AMBIGUOUS`/`SUGGESTIVE`/`COMPELLING`, `LOW`/`MODERATE`/`HIGH`, an eight-wind compass word, a five-step proximity band.
- **A sealed Case Report is immutable.** The only way it changes is an explicit revision that leaves a permanent visible `REVISED` mark. Report values are persisted as the record at seal and never recomputed, because a content-version bump would change what recomputation yields.
- **Absence is a designed outcome.** Every Session that produces nothing — including one with zero Evidence and zero Encounters — still renders a complete Case Report and a shareable card. The four no-event outcomes are named and distinct (`QUIET_NIGHT`, `WINDOW_CLOSED_EMPTY`, `FALSE_POSITIVE`, `NOT_FRAMED`), and the night-attributed / user-attributed distinction survives into the copy.
- **The engine is a pure function.** No framework import, no wall clock, no global random source, no I/O — enforced by ESLint boundary rules, not by discipline. Randomness is drawn only from labelled substreams, and a fork label is part of the replay key and is never renamed once a content version ships.
- **The interval draw is memoryless; silence never accrues hazard.** A long quiet stretch does not raise the chance of an event, because the draw carries no history. A scheduler that raises event probability after a quiet spell is the single most damaging defect the engine can ship — it converts silence from a designed state into a countdown, and the user learns the countdown. *(FR-2)*
- **A Session holds at most two Encounter Windows.** The second may open only after twenty minutes with budget remaining. A third would make encounters feel routine, which is the uncertainty law failing.
- **`Ambient` intensity forbids Encounters outright.** An `Ambient` Session can never produce one, so the level's own promise — *Few signals. Nothing sudden.* — is literally true rather than hedged. Intensity scales exactly four coefficients — emission rate, encounter budget (`0`/`1`/`2`/`2`), content ceiling and sting gain — and never scales the silence floor below its mandated minimum, so intensity can never make the app predictable. *(FR-10)*
- **A session never advances while backgrounded.** On background — an incoming call included — all channels go off, the camera goes inactive, the engine pauses and elapsed time freezes. An encounter that would fire then is suppressed entirely and does not count against the session's encounter allowance.
- **No purchase seam exists.** No paywall, purchase, subscription or advertising in v1, and no purchase event, tier column or hunt gate retained in the schema. Reinstating monetization later is accepted as a migration. Nothing may present, advertise or hint at a purchase.
- **The hidden stays hidden.** Tension, Attunement, rarity and Seed are never displayed, announced or exposed to assistive technology.
- **Hold, not tap, for anything irreversible or initiating.** 800 ms to enter the field, 600 ms to seal. No navigation path ends a session without offering `SEAL & FILE`, and there is no dead end — every empty state carries exactly one action.
- **Report-first build order.** The Case Report and Share Card are built before any tool exists. The growth loop is *tools generate → report packages → share recruits → new investigators generate more*, and a weak report stalls it at the first step.
- **Four tabs, and no others** — Home · Investigate · Field Journal · Profile. No Equipment tab (tools live inside a live Session) and no Settings tab (settings live inside Profile).
- **Handset only, portrait-locked**, except the Camera and Sky surfaces. No tablet layout, no desktop, no landscape elsewhere, and no light theme.
- **Zero permissions is a supported configuration.** Permissions are requested just in time by the tool that needs them, never at launch, each request explains why in the moment, and a permanent denial swaps `Allow` for `Open Settings` and is never re-offered in the same session.
- **The entertainment line is one exported constant** — `An investigation experience. Not a measurement.` — never a retyped literal. It appears unmodified on the Case Report, the Share Card, the store listing, onboarding and the About notice, and any data export carries it too.
- **Expo SDK 57 / React Native 0.86 / React 19.2.3, New Architecture mandatory**, iOS 16.4+ and Android 7+ at compile and target SDK 36. Native projects are CNG-generated from `app.config.ts` and gitignored; builds run locally and **fastlane owns signing and store submission for both platforms**. EAS is not in the path and Expo Go is not a delivery target.

## Non-goals

- **Not a detector.** No claim that anything it shows corresponds to anything in the world, and a feature that violated this would be rejected however well it tested.
- **Not a social product.** No feed, friends list, public profile, leaderboard, user comparison or public journal — ever.
- **Not monetized in v1**, and never monetizes the moment of fear at any version.
- **Not multiplayer in v1.** Director Mode is deferred to a reserved engine seam with no user-facing surface to reach it.
- **Not an AR, 3D or user-generated-content product.** No ARKit gameplay, no LiDAR requirement, no real-time rendering pipeline, no chat or user-submitted content.
- **Not a children's toy and not a jump-scare device.** Category Entertainment, rating 12+/Teen.
- **Permanent exclusions:** a real weather API (it would be a network call), a real star catalogue (it is a falsifiable claim), and thermal-camera styling (phones have no thermal sensor).
- **Deferred from v1:** iPad, localisation, journal full-text search, hidden badges, additional Share Card variants, additional Phenomena, the global shared-seed night, biometrics, in-session rewind, and real analytics beyond the core event set.

## Success signal

The product is judged by **share rate — ≥ 25% of sealed Cases produce a shared Share Card** — because it is the growth loop's only real test: if a stranger does not send the card, nothing else about the app matters. Below target, the report is not beautiful enough or the share flow has friction, and the fix is one of those two things and never more events.

It is read together with two supporting signals and never against them. **D7 retention ≥ 25%** is retained at the source's number but recorded honestly as a hope rather than a forecast, because the app ships with no notifications, no enforced streak, no time-based progression and no social surface — every mechanism that normally produces a 25% D7 has been deliberately removed, and if it misses the question is *which of the three remaining hooks is doing the work*, never whether to add notifications. **First-session completion ≥ 55%** tests the other end: if it misses, the first thing to examine is what the first ninety seconds give back, not how much silence they contain.

Four counter-metrics are as load-bearing as the targets and **must not be optimized upward**: raw session count and length, emission volume per session, the first-run encounter rate (pinned at 100% and never extended past the first Case), and time-in-app and daily opens. If emission volume rises while share rate stays flat, the engine has started spending uncertainty to buy engagement — the exact failure this product exists to avoid.

## Assumptions

- **The architecture spine and the UX spines are binding constraint sources alongside the PRD**, not merely explanatory. They post-date the PRD and were ratified, and several kernel constraints — engine purity, the hidden scalars, hold-gating, the single allowed presenter, the claims-lint surface set — appear only there.
- **The PRD's 39 FRs and its source-conflict table are authoritative** over the two brainstorm documents and the owner's master prompt, which are absorbed rather than re-specified.
- **"MVP" means the first shipped version**, not the delivery plan's day-30 checkpoint. The two differ by roughly a fortnight, putting shippable v1 at roughly day 40–45 for one senior engineer full time. *(PRD A-10)*
- **v1 ships English-only with localisation retrofitted**, since no source document contains an i18n plan and the content model carries a single locale column. *(PRD A-5, OQ-7)*
- **The evidence model is two layers** — a closed ten-kind engine vocabulary with per-hunt content aliases mapping onto it — which is the spine's resolution of a three-way disagreement between the source documents, not a value any of them stated. *(AD-18, OQ-11)*
- **The Daily Anomaly is copy and nothing else**, never a session directive and never carrying a guaranteed encounter. *(AD-19, OQ-9)*
- **The Share Card's re-render requirement is perceptual identity, not byte identity**, because the card rasterises a native view tree. *(PRD A-9)*
- **Free at launch is the MVP state**, adopted from the owner's instruction rather than derived from a schedule. *(PRD A-1)*

## Resolved

The questions this pass closed. Recorded here rather than deleted, because each one's *reason* is load-bearing to a downstream author.

- **OQ-11 — resolved; the evidence vocabulary is closed.** `evidence-model.md` fixes the per-hunt alias map (22 aliases resolving onto the ten engine kinds, every kind now reachable), the closed triage reason set, and the four other closed fields the schema checks. Two source aliases are dropped by decision: `cold_spot`, because the persisted channel union *does* contain `thermal` and a schema-valid thermal claim would reach the glyph, the caption and the report's source count on a phone with no temperature sensor; and `bearing_lock`, because a bearing is a Tracker surface state and a *lock* contradicts the radar's uncertainty rule. One alias carries its own build assertion: `transmission` must never resolve to `word_bank_hit`, per FR-39.
- **OQ-10 — resolved; content is now inventoried and gated.** `content-plan.md` carries the authored-content inventory (~200 report and narrative strings, 12 hunt JSON files with ~100 event-table rows, 48 recorded word fragments, the Anomaly set, and the 97-file audio list `01` §L.5 already specifies) and estimates **15–20 working days** for one writer with a review pass. The load-bearing part is not the total but the **three gates**: four hunt definitions must exist by **day 11** or T-1.5 cannot pass its own done-when, report copy by **day 16** or T-2.3 has nothing to render and week 3's money demo dies, and the event-table weights are *tuning* that needs simulation cycles rather than one writing pass. Content fits inside A-10's day 40–45 figure **only if it starts in week 1**.
- **The Signature strip's width is declared in content, not read from a constant.** Settled, and the `signatureSlots` field is adopted: **`HuntDefinition` gains `signatureSlots: readonly SignatureSlot[]`, content-validated for a length of 7–9 with every entry drawn from the closed six `trace · voice · form · habit · place · refusal`.** AD-8 requires the count to be *"read from the case (7–9), never from a constant"*, and the field is what makes that rule satisfiable — the four `HuntDefinition` sketches carried fifteen fields and no strip declaration, so the rule had nothing to read. Six **categories** populating a 7–9 position strip is coherent, not a conflict: they are different axes, and the 9-glyph set in `01` §L, the 4×2 Archive grid and UJ-1's *"7 evidence glyphs"* all agree with the width. The build assertion belongs with T-0.8. See `evidence-model.md`.

## Open Questions

- **OQ-2 — the low-power Session battery target is unset**, and the sampling ladder cannot be locked until it is, because the ladder's shape determines what the app can promise.
- **OQ-6 — the 42–58% encounter band is a simulation target, not a field measurement**, and needs re-derivation against the first hundred real sessions — specifically against the risk that a *correct* rate still reads as broken to a user who has had two quiet nights.
- **OQ-5 — how much the opening may direct the user** before investigation becomes a checklist. This has a concrete second form: the Brief front-loads a calibration, a place name, an intention and an 800 ms hold *before* the user has any reason to trust the app, and there is a live unresolved proposal to add a short micro-directive at roughly the ninety-second mark of the first Session.
- **OQ-4 — whether triage feels compulsory is untested.** Deriving status partly from the user's own verdicts is what makes the conclusion theirs; it may also make triage read as a chore gating the hero screen. Needs prototype evidence from the first playable report.
- **OQ-15 — the tool row's form factor past the 140% Dynamic Type cap is unresolved.** The cap is not an answer; a horizontally scrolling row of seven targets is the most likely place in the product to break, and the two-row labelled grid is the direction worth validating.
- **Three source disagreements are reconciled in a draft patch rather than silently resolved.** `proposed-prd-patches.md` carries exact before/after text for each, for the PRD owner to apply or reject, because `prd.md` is an adopted companion this skill does not edit. **Until a patch lands, these are the governing forms and a story author must build to them:**
  - **Shadow Person is haptic- and glitch-led, and the camera is a hazard, not the instrument.** FR-6 calls Observer *"camera- and glitch-led"*; FR-8, `01` §J.3's `noticingRate` formula (`+0.0016 * cameraLive`) and `EXPERIENCE.md` all say otherwise, and the source's own play instruction is *"stand still, torch off, **camera down**."* Building FR-6 literally makes the hunt's documented play style its losing play style. **FR-8 governs** — the patch makes FR-6 agree with it, so no outside authority is being introduced.
  - **No compass heading on Camera, no azimuth/altitude on Sky.** AD-15 bans degrees and AD-20 already decided the upgrade-time Sky renders a reticle and meter instead. `EXPERIENCE.md` renders Camera as *"rule-of-thirds grid, corner brackets, a mono time strip, and an unlabeled three-bar meter"* — no heading at all.
  - **The rendered verb set is the seven** — `SWEEP`, `ORIENT`, `ASK`, `RECORD`, `FRAME`, `FOLLOW`, `ALIGN` — as `EXPERIENCE.md` §140 states. The PRD's five-verb grouping has no unreconciled rationale; its own reconcile file logs the collapse as *"asserted, not reconciled,"* and FR-14 already names two rendered verbs outside the five.
- **The haptic rate limit has no home.** The source design limits haptics to one per 800 ms so vibration never becomes wallpaper — a real engineering budget that no consolidated document states, and whose number collides confusingly with the 800 ms entry hold that *is* carried. The two other engine behaviours that were open here are now Constraints above — the memoryless draw and the two-Encounter-Window cap — and `Ambient`'s encounter ban is a Constraint too; this rate limit is the last one needing a decision on where it belongs.
- **A daily Anomaly set may not survive a year of daily use** (OQ-8), and it is one of only three return hooks the product has, so the resolution affects SM-2 rather than being cosmetic. `content-plan.md` recommends composing **~60 root lines with a seeded qualifier** (≈480 rendered lines from 68 authored strings) rather than hand-writing 365, and restricts the qualifier to conditions and time bands — never bearings, because the Directives Rule forbids naming a direction. The recommendation is priced in the plan but not ratified.
- **The safelight accent's hue is unresolved.** `DESIGN.md`'s rationale argues for a deep red on dark-adaptation grounds while the implemented token is lime. The token name is stable, so code is unaffected either way, but the design owner should decide.
- **Whether Clearance unlocks a cosmetic case-file theme is unresolved**, since the token-sync test assumes exactly one theme.
- **The CI provider and the release rollout and withdrawal path are open.** The architecture spine fixes *that* a pipeline runs the named gates and *that* release is manual, reversible and owned by a named person; it does not fix what runs it.
