---
review: rubric-walkthrough
target: ../ARCHITECTURE-SPINE.md
reviewed: 2026-10-05
reviewer: rubric-walker
verdict_tally: 2 PASS · 7 PARTIAL · 1 FAIL
---

# Rubric review — NightTrace Architecture Spine

Judged as written. Upstream context (PRD, addendum, UX spines) read only to check coverage and ratification. The stack was web-verified separately on 2026-10-05; this review instead probes claims asserted from memory.

**Tally:** PASS 2 (AD-slot item 2, mermaid) · PARTIAL 7 · FAIL 1.

---

## 1. Does it fix the real divergence points for the level below it (epics/features), and miss none?

**Verdict: PARTIAL**

What it gets right, and this is the bulk of it: the module/dependency boundary (`engine/**` purity, `sensors/**` isolation, `db/repositories` SQL monopoly, routes own nothing), the emissions contract with a single presenter, the determinism recipe (seed + hunt_id + content_version + tick_digest), the catalogue/user table split, the migration discipline, the model-convention surface, and the build chain. These are exactly the places two epic teams would otherwise diverge, and each one carries a named enforcement mechanism (ESLint `no-restricted-imports`, a test, a CI gate) rather than an intention. The `Capability → Architecture Map` gives epics a routing table, and the `Structural Seed` fixes the directory shape. That is a good spine.

Divergence points it misses or leaves under-specified:

- **The accessibility floor is not a rule anywhere.** The PRD §6.1 lists an accessibility baseline in scope, and addendum §H + `EXPERIENCE.md → Accessibility Floor` carry real invariants: hidden scalars (Tension, Attunement, rarity, Seed) are **never announced** to assistive technology; live regions announce only evidence capture and phase change; Reduce Motion disables glitch and re-routes it to audio; portrait-locked except Camera and Sky. The spine's only accessibility content is one Deferred bullet about the tool row's breakpoint. Four surfaces can each implement Reduce Motion differently and the spine will not notice.
- **FR-5's performance invariant has no home.** "Sensor-derived visuals must not cause a React re-render per sample" (PRD FR-5 NFR; addendum §D.3's ring buffers + Reanimated `SharedValue`) is a cross-cutting rule that epics will each rediscover. It appears nowhere in the spine — not in the Conventions table, not in AD-13.
- **The engine's tick signature is described two ways.** The Design Paradigm and AD-2 say the output is `Emission[]` and nothing else; the Consistency Conventions row says "The engine returns new state per tick". Those are different contracts (`(digest) → Emission[]` vs `(state, digest) → (state', Emission[])`), and the engine's function signature is precisely the kind of thing epics must not each decide.
- **CI is referenced but never defined.** The spine asserts gaps are "CI-blocking" in at least four places (quality gates, token-sync test, golden seeds, content validation, migration idempotency) while the build section says builds run locally. Nothing names the CI provider or the pipeline. A rule that says "a CI test asserts…" is unenforceable until CI is a named thing.
- **The Case Report's stat-row cells are unresolved across upstream.** PRD FR-22 specifies duration / evidence count / encounter count / **source count**; `DESIGN.md → Components` specifies `CASES · HOURS · EVIDENCE · ENCOUNTERS`. AD-15 binds FR-22 and the report and says only "counts plus a band", so the disagreement passes through untouched. Minor, but it is a per-epic decision the spine was positioned to close.

Not a divergence point, but worth one line: the Clearance-gated cosmetic theme system (FR-28) has no model in the spine; AD-17 assumes exactly one theme.

---

## 2. Is every AD's Rule ENFORCEABLE, and does the Rule actually prevent its stated divergence?

**Verdict: PASS**

This is the spine's strongest area. Twenty of the twenty-three ADs name their own enforcement surface, and the surfaces are real: ESLint boundary rules (AD-1, AD-12, AD-13), TypeScript configuration (AD-14), a schema plus repository-layer validation (AD-9), golden-seed replay (AD-3), an `emptyWeight > 0` assertion over the content set (AD-5), a content-validation test closing the kind set and the glyph set (AD-18), a token-agreement test (AD-17), migration idempotency asserted by test (AD-22), and a build-failing string lint with an explicitly enumerated surface set (AD-16). AD-16's "Note — the disclaimer is not the defense" is exemplary: it names what the mechanism cannot see and hands those five blind spots to a release-review item instead of pretending the lint covers them.

Every "Prevents" clause lines up with its Rule except one, and only partially:

- **AD-18** — "Prevents: content authoring, the glyph set, **the triage reasons**, and **the analytics event** each keying off a different count." The Rule closes the kind union, the alias resolution, and the glyph mapping, and says nothing about the triage reason set or `evidence_found`'s props. Two of the four named divergences are not actually prevented by the rule as written.

Two lesser notes, not verdict-changing:

- **AD-2** — "Any code outside the presenter that reads an `Emission` is a defect" is enforceable only by restricting the `Emission` type's import graph; stated as a defect it is a review item, not a check. The other half of the rule (single presenter node, engine mutates nothing) is enforceable and aligns.
- **AD-15** — "There is no primitive that renders a percentage, an axis, a unit, a distance, or a signal strength" is partly structural (no such primitive in `ui/`) and partly a claim about composition the `%`-lint cannot see. The spine's own AD-16 honesty about lint limits makes this acceptable.

---

## 3. Could anything under "Deferred" actually let two units diverge?

**Verdict: FAIL**

Most of the Deferred list is correctly deferred: tuning values, the sampling ladder's rungs, the mono family, the per-hunt alias list, Director Mode, localisation, and the PRD §6.2 exclusions are all genuinely parameter- or content-level, and each pairs its deferral with the invariant that is *not* deferred ("The *shape* … is fixed by AD-3 and AD-5"; "a closed ten-kind engine vocabulary with content aliases" with only the alias list deferred). That is the right pattern.

One entry breaks it:

> **The tool row's large-type form factor.** OQ-15 fixes the *rule* (one scrolling row by default, a two-row labelled grid at ≥ 160% Dynamic Type); the exact breakpoint and the grid's geometry are UI implementation.

This is an invariant wearing a deferral. Whether the tool row is one row or a labelled two-row grid at a stated type scale is shipped UI behaviour an epic must implement, not a parameter — and the sentence contradicts itself in one line, fixing the breakpoint at 160% and then deferring "the exact breakpoint". It also silently replaces the upstream cap: addendum §H and `EXPERIENCE.md` both say the tool row is **capped at 140%**, and `EXPERIENCE.md` marks the form factor explicitly unresolved, asking that the cap not be treated as the answer. Two epic teams reading this bullet and the UX spine will build different things at 150%.

A second, weaker instance: "Director Mode and the global shared-seed night. Engine `sources/` reserves a `RemoteDirectorSource` seam and the store reserves a storage seam; no implementation ships in v1." A reserved seam is a structural commitment, not a deferral of scope, and it sits oddly beside AD-21's categorical "There are no purchase seams" and AD-10's persistence rule — one deferred future feature gets a reserved storage seam while another is forbidden one. The PRD makes the same reservation, so this ratifies rather than invents; but placing it under Deferred, where nothing is supposed to be an invariant, hides it.

---

## 4. Is named technology verified-current — and are any unverified claims asserted from training data?

**Verdict: PARTIAL**

The stack table itself holds up. Spot-checks against live sources today:

- Expo SDK 57 stable / 58 beta-only, `expo@57.0.26`, RN 0.86.3, React 19.2.3, Node ≥ 22.13 — consistent with the memlog's verification pass and with the SDK-57 pins it records (`react-native-view-shot` 5.1.0, `@shopify/flash-list` 2.0.2) and with the "npm latest is 2.3.3 — let `expo install` choose" hedge, which is the correct instinct.
- **`expo-audio` `useAudioStream` for PCM mic capture — verified.** The current Expo audio reference documents `useAudioStream(options)` returning an `AudioStreamResult` for "real-time PCM microphone capture", plus `Audio.requestRecordingPermissionsAsync()`. The claim is accurate and current.
- **Google Play target API 36 — verified.** developer.android.com states new apps and updates must target API 36 from **August 31 2026**, which is the date the memlog records.
- **Apple iOS 26 SDK requirement — verified.** Apple's developer news states that from **April 28 2026** iOS and iPadOS apps uploaded to App Store Connect must be built with the iOS 26 SDK or later. The spine's date is exactly right.
- **App Store guideline 1.1.6 — verified verbatim.** The guideline reads: *"False information and features, including inaccurate device data or trick/joke functionality, such as fake location trackers. Stating that the app is 'for entertainment purposes' won't overcome this guideline."* AD-16's Note quotes the substance accurately. 2.3.7 does say metadata "should not … make unverifiable product claims", so the 2.3.1(a)/2.3.7 citation is fair (2.3.1(a) is worded around misleading marketing and hidden features rather than "unverifiable claims" specifically, but the use here is defensible).

The one claim that does not survive:

- **AD-23's "a **G2 Sub-CA** intermediate for new certificates."** Apple's only current G2 Sub-CA notice concerns **Developer ID** certificates — the authority used to sign Mac software distributed outside the Mac App Store — and says explicitly that "previously signed and notarized Mac software … will keep working". It is not a requirement for iOS App Store distribution signing, which is what this product ships through. The fact is real; its attribution to this product's iOS/Android store path is not. It is stated beside the (correct) iOS 26 SDK requirement, which makes it read as a store-submission floor. This is precisely the class the checklist asks about: a platform-behaviour claim carried from memory and not caught by the version-verification pass, because that pass covered package versions and store SDK floors, not certificate authorities.
- Minor, unverifiable-as-stated: "subset Latin-1" for the font pipeline is a strategy assertion, not a checked capability; and the `G2` line is the only store fact the memlog's verification pass does not cover.

---

## 5. Does it ratify rather than contradict the upstream PRD/addendum/UX?

**Verdict: PARTIAL**

Ratification is mostly clean and explicit, which is the spine's second-best quality. AD-20 ratifies OQ-16 exactly as the PRD proposes and correctly restates the values it settles (five phases, four intensities, five ranks). AD-18 adopts the PRD's own A-12 reading of OQ-11 (two layers) and correctly refuses to invent an alias list. AD-19 resolves OQ-9 the way the PRD's A-11 already frames it. AD-8 correctly cites and rejects the prototype's `statusOf()`, matching `EXPERIENCE.md → The three deliberate asymmetries in triage` blow-for-blow, including "Triage verdicts never move the signature strip". AD-9's catalogue and user table lists match addendum §E.1 name for name; AD-11's session row matches §E.3; AD-16's five lint blind spots match FR-33's note; AD-21's "nothing leaves this phone / not nothing is recorded" is lifted verbatim from the UX spine. Good.

Three places where it contradicts rather than ratifies:

1. **AD-15 vs. FR-17 (and FR-15).** AD-15's Rule: "readouts are qualitative bands and words only. There is no primitive that renders a percentage, an axis, **a unit**, a distance, or a signal strength. The only numerals that may appear are counts of things that happened and elapsed session time." FR-17 requires the Sky surface to show "an **azimuth and altitude readout**" — unit-bearing angles in degrees — and FR-15's camera overlay carries "compass heading". `EXPERIENCE.md` renders Sky as "an eight-segment alignment meter" and silently drops the azimuth/altitude readout, so the UX spine and the FR disagree and the architecture spine resolves it by fiat in the direction that deletes an FR consequence. Either the FR must be restated as a form (a reticle and a compass rose) or AD-15 needs a carve-out; the spine does neither, and the mismatch is invisible because AD-15 cites FR-22/FR-24 and not FR-17.
2. **AD-21 vs. addendum §F.1.** The addendum says plainly that `paywall_viewed` "is kept from the same brief even though it cannot fire, **so the schema does not need a migration when monetization returns**", and OQ-3 asks for a stance rather than treating one as taken. AD-21 states "**There are no purchase seams**: no `paywall_tier` column, no hunt gate, no purchase event." That is a legitimate exercise of the spine's authority to resolve an open question — and the memlog records the trade explicitly — but the AD presents the reversal as settled fact without naming the addendum instruction it overrides. A downstream reader comparing the two documents sees a contradiction, not a decision.
3. **The tool-row breakpoint at ≥160% vs. addendum §H / `EXPERIENCE.md`'s 140% cap.** Covered under item 3; recorded here as the third upstream contradiction.

Also worth noting as a borderline case rather than a contradiction: AD-13's "every one of them degrades to a content-equivalent path" sits against `EXPERIENCE.md`'s mic-denied rule that "EVP is **not offered in the carousel at all**". Removing a tool from the carousel is honest visible absence, not a content-equivalent path. The digest contract is genuinely unchanged, so no hunt breaks, but the two documents describe the same denial differently.

---

## 6. Does it cover the PRD's capabilities (FR-1…FR-39, UJ-1…UJ-4, SM-1…SM-8)?

**Verdict: PARTIAL**

**FRs: full by name.** Every one of FR-1 … FR-39 appears in the `Capability → Architecture Map`, and the mapping is honest — the rows cite the real governing ADs, not decorative ones. No FR is missing.

**FRs whose governance is nominal only.** Required reading of the map is that a named FR is "decided, deferred, or named". Several are named but not decided, and the map's AD citations do not reach them:

- **FR-4 (tension)** — AD-10 keeps it out of the database; nothing states the other half of the FR, that tension is never displayed **or exposed to assistive technology**. Tension/Attunement/rarity/Seed are never-announce invariants (`addendum §H`).
- **FR-23 (report integrity)** — no rule anywhere. Sealing is irreversible except for a visible `REVISED` stamp; that is a data-model decision (revision, immutability) an epic will make alone.
- **FR-27 (export and deletion)** — named under §4.8, no decision. What is exported, in what format, and what deletion actually removes (including that analytics outlive case deletion, which AD-21 does cover) is left open.
- **FR-34 (contested evidence)** — named under §4.5 but no governing AD. Its two load-bearing invariants ("never resolves to `UNEXPLAINED` on its own", "never fabricates an Encounter") and its seed-driven reproducibility are absent.
- **FR-36 (negative space)** — the rule "absence is meaningful only where a measurement was possible" is a content-and-query invariant with no home.
- **FR-38 / FR-39 (posture gating; Mimic/Alien separation)** — both are enforced by tests upstream (FR-39 explicitly "as a content-validation test over the Hunt's emission bank"), and a content-validation test is exactly the kind of enforcement surface this spine names elsewhere. Neither is named here.
- **FR-29 (streaks/badges)** — no rule; the `badges` catalogue table is in AD-9 and `badge_awards` in the ER diagram, which is thin but arguably enough for a deliberately light system.

**UJs.** UJ-1 … UJ-4 appear only in the frontmatter `binds:` list. No journey is decided, deferred, or opened. Arguably out of architecture's altitude — a spine cannot "decide" a journey — but by the checklist's literal test they are neither decided, deferred, nor named as open.

**SMs.** SM-5, SM-6, SM-7 are covered by AD-21 (which is explicit that the event set is extended to whatever they require); SM-8 by AD-16; SM-C3 by AD-19. **SM-1 (share rate), SM-2 (D7), SM-3 (first-session completion) and SM-4 (encounter rate) are named only in the frontmatter.** SM-3 and SM-1 do have architectural reach — SM-3's stated leading cause is FR-9's front-loaded Brief plus the silence floor, and both are in the spine's scope — but nothing addresses them. Fair to call this a metrics-layer omission rather than a gap, given SM-4 is tuning and SM-1/SM-2 are product targets.

**Nothing in the PRD is silently absent** — the omission is in the second pass (naming without deciding), not in the map.

---

## 7. Is every dimension the altitude owns decided, deferred, or an open question — including the operational/environmental envelope?

**Verdict: PARTIAL**

**What is genuinely covered, and covered well.** There is a `Deployment & environments` block that is not boilerplate: there is no backend, no server, no network call; three build profiles (**dev** / **preview** / **production**) that differ "only in signing identity, bundle/package id suffix, and whether analytics debug assertions are active"; the only external systems are the two stores and the only runtime dependency on them is installation. Infra/provider strategy is therefore *decided by construction* (the device is the runtime), which is the right answer for this product and is stated rather than implied. Signing and submission are decided (AD-23: CNG, gitignored native projects, `app.config.ts` as sole native-config truth, local `expo prebuild` + Xcode / Gradle, **fastlane** for signing and store submission on both platforms, EAS explicitly out of the path), including the corollary that `fastlane/` must sit at the repo root because `expo prebuild --clean` destroys `ios/` and `android/`. That corollary is a real operational trap caught in advance. AD-22 covers migration/upgrade safety, which is the other half of "environments" for an offline app. Data lifecycle has AD-21 (analytics) and the media/storage conventions.

**What is silent.** Measured against the checklist's own list:

- **Crash reporting** — no decision anywhere. This is the most consequential omission, because AD-21's "no network egress and no third-party SDK" makes a hosted crash reporter a violation, and the only observability the spine provides is `services/Logger.ts`. Whether logs persist, where, whether a crash is recorded locally, and whether the session checkpoint in AD-11 is the crash-recovery story are all unanswered. For an app whose worst outcome is "losing a night's work", the crash story deserves a line.
- **Secrets** — no decision. Certificates, provisioning profiles, keystore, and the fastlane credentials path are named by nobody. AD-23 says fastlane owns signing; it does not say where signing material lives or who can read it.
- **Release process** — thin. AD-23 stops at "signed binary → store". Versioning, build numbering, staged/phase rollout, and how a bad build is withdrawn are absent; So is any defined owner or cadence for the release-review item that AD-16 and SM-8 both depend on. AD-16 says each of the five lint blind spots "carries a release-review item" — but no release process exists to carry it.
- **CI** — referenced as the enforcement locus five-plus times, never defined (see item 1).
- **Low-power mode as behaviour, not just a budget.** The memlog records OQ-2 as a decision with user-visible consequences ("the sampling ladder dropping to its lowest rung and ambience/glitch disabled"), and FR-5 makes the low-power path a feature-level NFR. The spine compresses this into a Deferred bullet that keeps only the `≤ 4%/hour` budget and defers "the duty-cycle shapes" — dropping the two facts an epic needs (the toggle exists; it disables ambience and glitch) into an implementation note.
- **Accessibility** — see item 1; the floor is not a dimension anywhere in the spine.

---

## 8. Is the seed (Stack, Structural Seed) minimal — or has an invariant or a mirror-to-maintain been smuggled in?

**Verdict: PARTIAL**

The Stack table is the right shape: name plus version, with one line of pinning rationale on the rows where the version is surprising (`react-native-view-shot` "SDK-57 pinned", flash-list "npm latest is 2.3.3", "SDK 58 is beta only, do not adopt"). The Structural Seed is a directory tree with one-line roles. Both are broadly minimal. Three things are not:

1. **The Stack duplicates the Conventions table and the ADs.** `TypeScript | strict + noUncheckedIndexedAccess, exactOptionalPropertyTypes, noImplicitOverride` is the same string as the Conventions row "Quality gates". `Testing | jest-expo 57.0.5 · @testing-library/react-native 14.0.1 (two projects)` restates the Conventions row "Testing", including "(two projects)". `Build & release | CNG (expo prebuild) · expo-dev-client · fastlane (signing + store submission)` restates AD-23's Rule. A stack table that also carries config flags and process decisions is a second copy of decisions that live elsewhere — the exact mirror the checklist asks about. It is small, but it is the kind of mirror that drifts.
2. **The Structural Seed annotates itself with AD numbers.** `engine/ # PURE TS — the functional core (AD-1)`, `sensors/ # ONLY importer of expo-sensors / expo-location / mic (AD-13)`, `data/ # content as data, zod-validated (AD-9)`, `db/ # client · migrations · mappers · repositories · kv (AD-12)`, `app/ # Expo Router: routes ONLY (no SQL, no engine calls)`, `app.config.ts # the ONLY source of native config truth`. Every one of those comments is a restatement of an AD's Rule, so the tree becomes a second place to maintain when an AD changes. The tree's *own* irreducible content is small: directory names and the specific file list under `engine/` and `services/`.
3. **`assets/db/catalogue-seed.db` (plus `metro.config.js # .db asset ext preserved for the bundled catalogue seed`) contradicts AD-9.** AD-9's Rule is categorical: catalogue tables "are rebuilt from bundled JSON — delete, batch insert, one exclusive transaction — whenever the stored content version differs". The seed ships a second, parallel content-provisioning mechanism as a pre-built SQLite file and arranges the Metro config around it. The `# optional` hedge does not resolve it: an optional second path for populating the catalogue is precisely the divergence AD-9 exists to prevent, and no AD governs when the pre-baked DB is used versus the JSON rebuild.

Nothing else looks smuggled. The Stack's font row ("Serif for anything a person would write; mono for anything the machine records — `Newsreader` + a mono") is a decision with a pointer to Open, which is appropriate.

---

## 9. Is the prose terse and decision-shaped, or has rationale bloat crept in?

**Verdict: PARTIAL**

The AD blocks are the right form and mostly the right length: **Binds / Prevents / Rule**, with the Rule written as an instruction and the enforcement named in the same paragraph. Many are genuinely tight — AD-4, AD-5, AD-6, AD-9, AD-12, AD-14, AD-18, AD-22 are all decision-shaped with no padding. The `Prevents` clauses are unusually good: they name the specific defect class rather than a virtue ("the spendable-uncertainty-meter defect", "a metronome with extra steps", "content and user data being modelled as one family").

Where rationale has crept in:

- **AD-16's "Note — the disclaimer is not the defense"** is a five-line argument about App Store policy. It is valuable (it kills a recurring proposal) but it is argument, not decision, and it is the longest block in the document.
- **The Design Paradigm's second paragraph** ("This is not a style preference — it is the load-bearing decision. It is what makes…") is three lines of justification for a decision the following table already states structurally.
- **The `Deployment & environments` paragraph** repeats itself: "There is no backend, no server, and no network call — the operational envelope *is* the device" and then, three clauses later, "there is no environment with a different runtime behaviour, because there is nothing to point at." One of the two is enough.
- **The FK-asymmetry paragraph under the ER diagram** restates AD-9 in prose. The diagram is self-explanatory once AD-9 is read.
- Scattered rhetorical phrasing inside Rules — "the product's #1 risk and the one claim the category's skeptics punish in thirty seconds" (AD-15), "the bug class a content-driven system produces at scale, and the one unit tests catch last" (AD-14), "which is the one thing the product must not permit" (AD-8). Each is a single clause and each earns its place as a tie-breaker, so this is minor — but the density is higher than a spine needs.

None of this is disqualifying. The document reads as decision-shaped with pockets of argument, not as an essay.

---

## Mermaid validity

**Verdict: PASS** (validated by inspection; `mmdc` is not installed on this machine, so no render was performed)

**Diagram 1 — dependency graph (`graph TD`).** Valid. Node ids are declared with labels on first use (`app["…"]`, `features["…"]`) and then referenced bare (`features --> services`), which is the supported form. All labels are double-quoted, so the `<br/>`, the `·`, the `—` and the commas inside them are safe.

**Diagram 2 — runtime container (`graph LR` with `subgraph`).** Valid. `subgraph device["The phone — the entire runtime"]` uses the supported `id[label]` subgraph form; using the subgraph id as an edge endpoint afterwards (`STORE -.install only.-> device`, `device -. "no network call, ever" .-> X["✕"]`) is supported. Both dotted link forms are correct: `-.signed binary.->` (text between the dots) and `-. "text" .->` (quoted, spaced). The `style` lines are well-formed. The only soft spot is `stroke-dasharray: 4 4` — a value containing a space inside a comma-separated style list. Mermaid accepts this in current versions, but if it ever warns, quoting the value (`stroke-dasharray:"4 4"`) is the fix. Not a defect.

**Diagram 3 — ER diagram.** Valid. All three cardinality forms used (`||--o|`, `||--o{`, `}o--||`, `}o--||`) are legal, and `ANALYTICS_EVENTS }o..o{ SESSIONS` uses the correct non-identifying `..` operator for the deliberately-FK-less relation. Entity names are `SCREAMING_SNAKE` with no spaces, and every relation label is quoted.

No malformed mermaid.

---

## Findings, ranked

1. **AD-15 contradicts FR-17 (and FR-15).** AD-15 bans every unit-bearing readout and permits numerals only as counts and elapsed time; FR-17 mandates an azimuth-and-altitude readout on the Sky surface and FR-15 a compass heading. `EXPERIENCE.md` quietly drops them, so the contradiction is invisible unless both are read side by side.
2. **The tool-row rule is an invariant parked under Deferred, self-contradictory within one sentence, and silently replaces the addendum's 140% cap with ≥160%.** Directly actionable: it is the one Deferred bullet that lets two epics diverge.
3. **AD-23's "G2 Sub-CA intermediate for new certificates" is a Developer ID (macOS) requirement, not an iOS App Store signing requirement** — the one store fact asserted that does not survive verification, sitting beside a store fact that does.
4. **AD-21's blanket "no purchase seams" overrides addendum §F.1's explicit instruction to retain `paywall_viewed`** — the right call, presented without naming the override, which makes a decision read as a contradiction.
5. **The operational envelope is silent on crash reporting, signing-material storage, CI identity (though rules are "CI-blocking"), and release rollout/versioning** — and the accessibility floor plus FR-5's no-re-render-per-sample invariant have no home at all.
6. **`assets/db/catalogue-seed.db` + the `.db` Metro asset extension contradict AD-9's "catalogue rebuilt from bundled JSON".** A second catalogue-provisioning path with no rule governing when each is used.
7. **FR-23, FR-27, FR-34, FR-36, FR-38, FR-39 are named in the capability map but have no governing decision**, and FR-4's never-announce half is unstated.
8. **The Stack table and Structural Seed carry mirrors of the Conventions table and the ADs** (TS flags, testing, build chain, and per-directory `(AD-n)` annotations in the tree).
