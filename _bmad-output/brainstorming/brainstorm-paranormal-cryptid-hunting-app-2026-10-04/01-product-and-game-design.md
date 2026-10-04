# NightTrace — 01: Product & Game Design

> Companion to **`02-engineering-and-delivery.md`** (the implementation contract: architecture, packages, models, SQLite schema, backlog, 30-day schedule). This document is the **product + game-design source of truth** and covers brief sections **A, B, C, D, E, F, J, K, L, N, O, P**. Sections G, H, I, M, Q live in `02-*`.
>
> Written against the master brief (`paranormal_cryptid_hunting_master_prompt.md`, 1700 lines) and the locked brainstorm intent. Where the brief and the design laws disagree, **the laws win** and the conflict is named explicitly in §A.9 and §P.
>
> This document makes decisions. Every "we could do X or Y" resolves to a choice, a one-line reason, and a rejected alternative.

---

## §A. Product critique

### A.1 What is genuinely strong

| # | Strength | Why it survives contact with the market |
|---|---|---|
| 1 | **Uncertainty as a managed resource** | The entire detector-app category spends uncertainty on the first launch and has nothing left. NightTrace is the only product in the category whose *core engineering problem* is protecting a scarce resource instead of spending it. This is a real moat, not a slogan. |
| 2 | **Report-first build order** | Inverts the category norm (build toys → bolt on results). The flywheel "tools generate → report packages → share recruits → new hunters generate more" only works if the report is art-directed before the tools exist. Correct call. |
| 3 | **Archetype parameterization** | Converts a content treadmill into a content pipeline. Four archetypes × environment × toolset × pacing × channel × completion × failure = hundreds of hunts from ~40 lines of engine. This is the single most valuable decision in the brief. |
| 4 | **Place + time seeding** | Free infinite variety, unrepeatable per session, and impossible for a clone to copy without the same discipline. |
| 5 | **Offline-first, zero-login, privacy-default** | In a category defined by ad-choked, permission-greedy shovelware, this is a *visible* differentiator in the store listing and the review section. |
| 6 | **"Absence is designed"** | Unlocks the widest job set in the brief: the 6-minute dog walk, the 40-minute attic vigil, the Friday-night date, the drive home. Most competitors only serve the 40-minute case. |
| 7 | **Qualitative readouts** | The only defensible position against the skeptic's 30-second test, and the only one that survives a 1-star review written by someone who "tested it properly". |

### A.2 What is weak, broken, or self-contradictory

Ordered by how much damage it does if shipped unchanged.

**A.2.1 — The brief contradicts its own design law on numbers.** §18 and §33 show `Strongest anomaly 91%`, `ACTIVITY 93%`, `Strength ████████░░ 82%`. §2's evidence mockup shows the same. These mockups predate the "expose no number a user could verify" law and are the single most dangerous artefact in the brief: they are the screens a coding AI will copy verbatim.
**Resolution:** the mockups are **overridden**. Every strength/activity readout becomes a qualitative band (§K.7). The only numerals that survive anywhere in the product are (a) elapsed session time, (b) the user's own historical counts in the journal, and (c) radio-band frequencies inside the Spirit Box, which are self-evidently theatre.

**A.2.2 — "XP" and "investigator level" contradict the fiction.** §3's loop and §20 both specify XP. XP is the tell that you are inside a mobile game; it pulls the user out of the investigation and into a grind. It also creates an optimisation instinct, and optimising an uncertainty engine is exactly the failure mode we are engineering against.
**Resolution:** XP is **cut**. Replaced with **Investigator Clearance** (diegetic rank, §E20), which advances on *cases sealed* and *phenomena documented* — activities that are the fiction, not adjacent to it.

**A.2.3 — The tool list is a catalogue, not a design.** §2 lists 23 tools. A user cannot hold 23 verbs, and the 23-tool list exists only to cover every creature in the brief. Twelve of them are synonyms (`Entity Camera` = `Night Vision Camera` = `Camera Scan`; `Motion Scanner` = `Movement Signal`; `Sound Detector` = `Vocalization Detector`).
**Resolution:** **7 tool surfaces, 5 real verbs** (§E7–E13): EMF, Radar, Voice, EVP, Camera, Tracker, Sky. `Sweep`, `Ask`, `Listen`, `Frame`, `Log`. Everything else in §2 is a rendering of one of these five.

**A.2.4 — "Different event probabilities per hunt" is the road to predictable.** If Ghost has one tuning table and Bigfoot has another, a user who plays both for a week learns both tables.
**Resolution:** one engine, one hazard model. Hunts differ by **archetype selection, tool set, sensory channel, phase timing, and the shape of the interval distribution** — never by a per-hunt probability constant (§F.4).

**A.2.5 — The rarity table is the wrong primitive.** `55 / 25 / 12 / 6 / 2` is a per-event lottery. It permits a Legendary at minute two of a cold session, which reads as arbitrary, and it permits three Rares in ninety seconds, which reads as broken.
**Resolution:** rarity is **gated, not drawn**. Rarity is a function of phase × tension × budget-consumed, and Legendary is drawn **once per session as a flag** with a 0.5% base rate (§F.7). The headline numbers in §2 become ceilings, not probabilities.

**A.2.6 — The 2-minute session is asserted, never designed.** §3 claims the loop must work for a casual 2-minute session; nothing in the brief supports it — a 2-minute session cannot contain a silence floor, a phase arc, and an evidence economy.
**Resolution:** the short session becomes a **named, honest mode: Field Note** (§E6.6) — a 3-minute standing observation with *different expectations* stated up front, not a truncated investigation. Never promise a case report from 2 minutes.

**A.2.7 — No failure experience is designed.** §M's failure modes are enumerated as list items (`nothing found`, `false positive`, `equipment failure`, `flee`) and then never appear again in 1700 lines. Failure is where this genre usually becomes hostile.
**Resolution:** all four failure modes become **emissions with their own copy, haptics, and report marks** (§F.9), and each archetype gets a unique fail state that produces a *better story*, not a penalty.

**A.2.8 — Battery is treated as a principle, not a system.** §37 items 13–16 are correct but there is no contract.
**Resolution:** a written power contract with duty-cycle rates, a dim mode, a camera budget, and a hard rule that no session may be killed by the OS (§E21).

**A.2.9 — The weather idea requires a network call the product has banned.** "Real-weather API drives event tables" (§ memlog) conflicts with "no backend" and with just-in-time location.
**Resolution:** replace with a **local weather proxy** — barometric trend (`expo-sensors` Barometer where available), ambient light, clock hour, and season. No network, no permission, same authorial effect (§F.3.5).

**A.2.10 — "Unknown Creature Hunt" is listed as an MVP menu item.** It is not a hunt; it is a *result* — the case where triage produces a signature that matches nothing on file. Putting it on a menu destroys the reveal.
**Resolution:** it becomes a **report outcome** — `UNIDENTIFIED SIGNATURE` (§E17), which is also the cheapest possible hook for every future creature drop.

### A.3 Biggest product risks, ranked with mitigation

| # | Risk | Metric that moves first | Mitigation (concrete) |
|---|---|---|---|
| 1 | **The skeptic's 30-second test.** Any falsifiable claim kills reviews and retention in the first scrutiny. | 1★ review text, D1 | §P copy audit is a **release gate**, not a review. Entertainment framing on install screen 1, about-entertainment always reachable from Profile, and a standing rule: *no sentence in the app asserts anything about the real world.* |
| 2 | **Predictability decay.** Users decode event rhythm → the magic dies → churn. | D7, D14 | Non-stationary hazard (§F.4), heavy-tail intervals (§F.5), per-session temperament the user cannot detect (§F.3.3), rarity gating (§F.7), and the `emission_interval_ms` anti-metric (§O). **If interval variance narrows across a cohort, the product is failing and we ship a pacing change.** |
| 3 | **Report quality.** Ugly hero → flywheel stalls → nothing else matters. | report_shared / hunt_completed | Report is built in Phase 1 before any tool (per `02-*` §M). Art-directed twice. Share card renders from the same view tree, so the report *is* the shareable. |
| 4 | **Silence reads as broken.** Uncertainty and bug are indistinguishable to a first-time user. | time-to-first-evidence, session abandonment <90 s | Onboarding teaches "quiet is data" on the intensity screen; the Session shell shows an explicit **Listening** state (a slow breathing dot) so silence is *visibly intentional*; the first 90 s carries one micro-directive (§E6.5). |
| 5 | **Battery / thermal.** Full-brightness camera + mic + magnetometer + screen will kill a phone in under an hour. | session duration, crash-free rate | Power contract §E21, duty-cycle ladder in `02-*` §G.5, hard camera budget, low-power mode, and no keep-awake in low-power. |
| 6 | **Scope: 4 deep creatures ≫ 40 shallow.** | — | Freeze the four. Prove the pipeline by shipping creature #5 (Mothman) as **content-only** — 1 JSON + assets, zero engine diff — before any new system work (§L, §J.5). |
| 7 | **Free tier too mean / too generous.** | paywall_viewed → subscription_started, and 1★ "money grab" | §N: two free fully-playable hunts, no tool ever paywalled, one paywall presentation per session maximum, presented diegetically inside the journal. |

### A.4 What to cut

| Cut | Why |
|---|---|
| Equipment tab | Already law. Additionally: tools are only meaningful inside a hunt; a tool grid teaches "toy", a tool carousel inside a session teaches "instrument". |
| XP, levels, "best case score" | §A.2.2. Replaced by Clearance + collection. |
| All percentage readouts (`91%`, `82%`, `ACTIVITY 93%`) | §A.2.1. Violates the only law that protects the whole product. |
| `182 m` distance readouts | A metre figure is falsifiable-feeling and invites "it said 182m but nothing was there". Bearing (8-wind) + band word (`FAR`) delivers the same information with no claim. |
| Equipment skins, radar skins as purchasable cosmetics | Cosmetics on a tool nobody looks at outside a hunt is weak revenue *and* it dilutes the field-journal fiction. Themes are sold as **case-file themes** (report + journal art), which is the surface users actually look at. |
| Director Mode, local co-op, shared-seed live sync | Post-MVP. The engine's `EventSource` seam and `session_ticks` digest in `02-*` §G.6 keep the door open at zero cost. |
| Real weather API | §A.2.9. |
| "Unknown Creature Hunt" menu entry | §A.2.10. |
| 2-minute promised session | §A.2.6 → Field Note. |
| Badges-as-trophies | Keep badges, but as **case stamps** (diegetic marks on the report), never as a trophy wall with progress bars. |
| Any generative AI, any cloud call, any account | Constitutional. |

### A.5 What to emphasize

1. **The Case Report and the share card.** Everything else is infrastructure for these two.
2. **The Hunt Brief ritual.** `Calibrate → Name → Intention → Hold to enter`. It is the cheapest dread-per-line-of-code in the entire product and it converts a utility launch into a threshold crossing.
3. **The signature / deduction layer.** Evidence that compounds into a *shape* is what makes the report feel earned rather than generated. It is also the load-bearing fiction that lets a case end `INCONCLUSIVE` and still feel like progress.
4. **The daily anomaly + shared-seed night clock.** The only honest answer to "why come back tomorrow" that does not require a backend.
5. **Silence, narrated.** Make quiet explicit, named, and counted as data. This is the product's signature move and its biggest differentiator against every competitor.
6. **The archetype fail states.** Four unique ways to lose is four unique stories. Most competitors have zero.

### A.6 The three product questions, applied to every feature

Every feature in §E carries a verdict against brief §38. The rule used:

- **Q1 — Does it make the user feel more like they are conducting a mysterious investigation?** If a feature makes the phone feel like a *measuring device*, it fails. If it makes the phone feel like a *case file that writes itself*, it passes.
- **Q2 — Does it create a reason to come back tomorrow?** Passing answers: the daily anomaly rotates, the signature archive has holes in it, a case was left unsealed, a phenomenon is still locked.
- **Q3 — Could it produce a moment worth sharing?** A shareable moment requires *one* of: a named status, a represented encounter, a line of found text, or a rare seal.

Anything that fails all three is cut in §E. Three features died this way: the numeric strength meter, the "activity level" gauge, and the equipment skin shop.

### A.7 The one thing the brief gets most right that is easy to lose

> The real loop is **Wonder → Move → Notice → Record**, not scan → find.

This has a hard engineering consequence that is easy to violate accidentally: **the app must never tell the user what they are about to find.** Every micro-directive (`Sweep the room slowly.`, `Ask it something.`) is a *verb offered*, never a *target named*. The moment the app says "look behind you", it has converted investigation into a checklist. §E6.5 codifies this as the Directive Rules.

### A.8 The competitive frame

| Competitor class | Their model | Their failure | NightTrace's answer |
|---|---|---|---|
| Ghost-detector utilities (thousands) | Random readouts on a radar; ad-fed | Spends all uncertainty in 5 minutes; makes falsifiable claims; review-bombed by skeptics | Qualitative readouts, entertained framing, seeded sessions, report-first |
| Horror walking sims | Scripted scares, one-time | Not replayable; no reason to return | Procedural, seeded, daily-rotating |
| AR ghost apps | Novelty camera filter | Gimmick, no record | Encounter is evidence that feeds a case file |
| Note/journal apps | Beautiful, no subject | Nothing to write about | The app writes the first draft |

The true competitor named in the memlog is correct and worth repeating: **boredom and the user's own skepticism.** Design against those two, not against other apps.

### A.9 Named conflicts between the brief and the laws (with the ruling)

| Brief says | Law says | Ruling |
|---|---|---|
| §2/§18/§33 numeric readouts (`82%`, `93%`, `91%`) | No verifiable numbers | **Law wins.** Qualitative bands. |
| §3/§20 XP and investigator level | Fiction integrity | **Law wins.** Investigator Clearance. |
| §23 Home shows "Equipment / Tools" tab | Four tabs only | **Law wins.** No Equipment tab. |
| §2 lists 23 tools | Four tabs, tools in-hunt | **Compromise:** 7 surfaces, 5 verbs, all inside a hunt. |
| §2 rarity `2%` per event | Uncertainty is the product | **Law-informed:** Legendary drawn once per session at 0.5%. |
| §14 `NW • 182m` | No verifiable numbers | **Law wins.** `NEAR · NW`. |
| §22 Director Mode as future | MVP scope freeze | Deferred; seam preserved in `EventSource`. |
| memlog "tonight, your area is active" | No falsifiable claim | **Cut.** Replaced with in-app fiction copy (§P.4). |
| memlog "no one in your area has seen it" | No falsifiable claim about the world | **Cut.** Replaced with a claim about *your own journal*: `No case file matches this signature.` |

---

## §B. Final product concept

### B.1 The one-paragraph concept

**NightTrace turns the phone into a paranormal field kit and a case file that writes itself.** You do not open tools; you open a *case*, walk into a place, and conduct a short investigation with instruments that behave like instruments and never like meters. The app generates each session from where you are, what hour it is, what the sky is doing, and what your device senses in the room — a one-time fingerprint that cannot be repeated. Sometimes something answers. Often nothing does, and that is a designed, named, and shareable outcome. At the end, the phone hands you the deliverable: a **Case Report** — collectible, stamped, and beautiful enough to post without editing.

### B.2 Positioning statement

> **NightTrace is a paranormal investigation experience.** You are not measuring the world; you are conducting an investigation in it. Nothing here is proof of anything — that is the point.

### B.3 What it is / what it is not

| It is | It is not |
|---|---|
| A field journal with instruments | A detector |
| A paranormal simulation, openly framed | A scientific instrument |
| A case generator | A scanning utility |
| A ritual with a beginning and an end | A toy with a radar |
| A collectible archive of your own nights | A social network |
| Offline, private, silent by default | Ad-supported, account-walled, always-listening |

### B.4 The promise, the deliverable, and the receipt

- **The promise** (made by the Home screen and the Hunt Brief): *something might be out there tonight.*
- **The deliverable** (made by the Case Report): *a story you can tell, that no one can disprove.*
- **The receipt** (made by the share card): *a link-free image that carries the story.*

### B.5 The loop

```
Wonder  ──▶  Move  ──▶  Notice  ──▶  Record
   ▲                                    │
   │                                    ▼
   └──── Case Report ── Share ── Journal ┘
```

Expanded as shipped:

```
Home (anomaly of the day)
  → Investigate (pick / unlock)
    → Hunt Brief (calibrate · name · intention · hold to enter)
      → Session (7 tools · 5 phases · silence mandated)
        → Evidence logged (souvenir, not data)
          → Encounter (brief, ambiguous, peripheral)  ← may not happen
            → Close the case (seal ritual)
              → CASE REPORT (hero) → Share card
                → Field Journal (signature archive grows)
                  → Clearance advances → tomorrow's anomaly
```

### B.6 The 25-word pitch (App Store subtitle candidates)

1. **Paranormal field journal.** (primary, 22 chars — chosen: no verb that implies measurement)
2. Investigate the unknown, on record.
3. A case file that writes itself.
4. Your night, on the record.

Chosen subtitle: **"Paranormal field journal."** It is the only candidate that makes a *category* claim rather than a *capability* claim, which is exactly the §P-safe posture.

### B.7 Voice and tone rules (binding on all copy)

1. **Never assert.** "The record shows movement", never "something is moving."
2. **Never wink.** No `(this is just a game!)` inside the fiction. The framing lives in onboarding, the shared audio, and the About screen — never in the moment.
3. **Never explain the mechanic.** The user is never told about phases, tension, budgets, or rarity. Ever.
4. **Hedge is a craft, not a disclaimer.** `Possible`, `unconfirmed`, `unsigned`, `no match on file`, `the record is unclear`.
5. **Short sentences at high tension.** Max 9 words on any in-session line.
6. **The word "ghost" appears only in the hunt name.** Inside a session the vocabulary is `signal`, `contact`, `movement`, `the record`.

---

## §C. Information architecture

### C.1 The four tabs (LOCKED)

**Home · Investigate · Field Journal · Profile.** There is no Equipment tab and no Settings tab (Settings lives inside Profile). Tools are not navigation; they are a carousel inside a live session.

| Tab | Route | The one job | Never does |
|---|---|---|---|
| **Home** | `/` | Answer "what is happening tonight?" and get the user into a brief in one tap | List tools; show a hunt grid with more than 5 entries |
| **Investigate** | `/investigate` | Choose or unlock a phenomenon; show tonight's conditions | Start a session directly (always routes through Brief) |
| **Field Journal** | `/journal` | Show the accumulated record: cases, phenomena, evidence, signature archive | Be a social feed |
| **Profile** | `/profile` | Settings, intensity, data ownership, the entertainment notice, clearance | Hold gameplay |

Tab bar: **Native Tabs** (`02-*` §G.1). Labels always visible. No badges on tabs except a single hairline dot on **Field Journal** when a case is unsealed (an unfinished case is the strongest return hook in the product and must be visible from anywhere).

### C.2 Full route tree

Mirrors `02-*` §G.2 exactly; this section is the product-side reading of that tree.

```text
src/app/
├── _layout.tsx                          GestureHandlerRootView → SQLiteProvider(migrate) → Theme → SessionHost
├── (onboarding)/
│   ├── index.tsx                        "Nothing Here Is Proof"  (entertainment framing, screen 1)
│   ├── disclaimer.tsx                   "Your Case Is Local"     (privacy + local-only, screen 2)
│   ├── calibrate.tsx                    "Choose Your Night"      (intensity + haptics + reduce-motion, screen 3)
│   └── permissions.tsx                  "Ask Only When Needed"   (screen 4 — no prompts fire here)
├── (tabs)/
│   ├── _layout.tsx                      NativeTabs: Home · Investigate · Field Journal · Profile
│   ├── index.tsx                        HOME
│   ├── investigate.tsx                  INVESTIGATE
│   ├── journal.tsx                      FIELD JOURNAL (segmented: Overview · Phenomena · Evidence · Cases)
│   └── profile.tsx                      PROFILE
├── hunt/[huntId]/
│   ├── _layout.tsx                      Stack, gestureEnabled: true  (swipe-back = leaving the field)
│   ├── brief.tsx                        HUNT BRIEF (ritual gear-up)  — modal-ish push, no tab bar
│   └── session.tsx                      SESSION SHELL (immersive, tick host, tool carousel)
├── tool/                                pushed above session; full-screen; each unmounts on pop
│   ├── emf.tsx  radar.tsx  voice.tsx  evp.tsx  camera.tsx  tracker.tsx  sky.tsx
├── case/[caseId]/
│   ├── report.tsx                       CASE REPORT — HERO SCREEN
│   ├── share.tsx                        SHARE CARD composer + share sheet
│   └── evidence/[evidenceId].tsx        single souvenir + triage verdict
└── (modals)/
    ├── intensity.tsx  low-power.tsx  permissions.tsx  about-entertainment.tsx  triage.tsx  confirm.tsx
```

### C.3 Presentation rules

| Route kind | Presentation | Dismiss | Notes |
|---|---|---|---|
| Tabs | Native tab bar, persistent | n/a | Blur hides the bar entirely |
| `hunt/[huntId]/*` | Push, **tab bar hidden** | Swipe-back (iOS) / explicit `Leave` (Android) | Swipe-back during a session triggers the **Leave the field** confirm sheet, not a silent discard |
| `tool/*` | Push **above** the session | Pop | Exactly one full-screen surface at a time. Camera preview must unmount on pop (`02-*` §G.0 — only one preview may exist) |
| `case/*` | Push over tabs, tab bar hidden | Explicit close | The report is a destination, not a modal; it should feel like a document |
| `(modals)/*` | iOS: `sheet` (medium/large detents). Android: `modal` full-bleed | Swipe / scrim / explicit | Never stacked two deep except `triage` over `session` |

### C.4 Modal and sheet inventory

| Sheet | Trigger | Detents | Contents |
|---|---|---|---|
| **Intensity** | Profile → Session; long-press the phase rail in-session (read-only there) | medium | 4 levels, descriptions, reduce-motion, haptics. **Locked during a live session** (§C.6) |
| **Low power** | Session rail battery chip; Profile → Session | medium | Dim screen, sensor rate, keep-awake off, camera budget. Shows estimated remaining session time in *bands* (`about 40 min`), never a percentage |
| **Permissions** | Any `permission_denied` fallback CTA | medium | What it is for, `Continue without`, `Open Settings` (`Linking.openSettings()`) |
| **Triage** | Evidence detail; Case Report ledger | large | One evidence item per card, three verdict buttons |
| **Confirm** | Leave field; discard case; delete all data | small | Two-line body, destructive action right, `Cancel` left |
| **About & entertainment** | Profile → About; onboarding footer; every share card footer long-press | large | Full §P disclosure, sensor list, local-data explainer, content version |
| **Leave the field** | Swipe-back during session | small | `Seal the case now` (primary) / `Leave without a report` (destructive) |

### C.5 Navigation invariants

1. **A live session is never more than one gesture from the tools.** Tool carousel lives on the session shell; tools are pushed, and a back gesture always returns to the shell (never to the tab).
2. **The report is always reachable from the journal** and always reachable at the end of a session. There is no path that ends a session without offering `Seal & file`.
3. **No dead ends.** Every empty state carries exactly one action.
4. **Deep links (reserved, not implemented in MVP):** `nighttrace://case/<ref>` for share-card attribution later, and `nighttrace://join/<code>` reserved for Director Mode.

### C.6 The intensity lock (a deliberate nav constraint)

Intensity is set at onboarding and changeable only **between cases**. During a live session the rail shows the current level as a static chip; tapping it opens a medium sheet that explains why it cannot be changed right now:

> **Intensity is fixed during a case.**
> Changing it mid-investigation would mean steering what you find. A case is only worth something if you didn't.

Rationale: allowing a mid-session intensity nudge lets the user *spend* uncertainty, which is the one thing the product must not permit. This is the correct friction. The user can always close the case and open a new one.

---

## §D. Complete user flow

Concrete, step-by-step, with exact strings. Assumes a cold install on iOS with no permissions granted.

### D.1 Install → first launch (0:00–0:20)

| Step | What the user sees | What the system does |
|---|---|---|
| 1 | Home screen icon: `NightTrace` on near-black with a pale-cyan trace glyph. | — |
| 2 | Launch → a 900 ms cold-open: pure `void` field, a single hairline trace draws left→right (240 ms `base` ease), a soft `selectionAsync()` haptic at 400 ms, then the wordmark fades in. **No splash logo, no spinner.** | No sensors. No permissions. No network. DB opens and migrates in the background. |
| 3 | **Onboarding 1 — "Nothing Here Is Proof."** Body: *"NightTrace is a paranormal investigation experience. It does not measure, prove, or detect anything supernatural — nothing can. It gives you the tools, the ritual, and the case file."* Button: `I understand`. | Writes `analytics: onboarding_started`. |
| 4 | **Onboarding 2 — "Your Case Is Local."** Body: *"Every case is generated from where you are, what hour it is, and what your device senses around you. No two cases are the same. Nothing leaves this phone."* Link: `What we never collect`. Button: `Continue`. | Opens the About sheet from the link. No permission prompts. |
| 5 | **Onboarding 3 — "Choose Your Night."** Four intensity levels (§K.16), default `Present`. Haptics toggle (default on). Reduce-motion toggle (default follows the OS). Body under the slider: *"Higher intensity means more signals. It never means a guaranteed encounter."* Button: `Continue`. | Persists to `kv-store`. `analytics: onboarding_intensity_set{level}`. |
| 6 | **Onboarding 4 — "Ask Only When Needed."** Body: *"NightTrace asks for a sensor at the moment a tool needs it — never at launch. Every hunt is playable if you say no."* Bullet list: `Microphone — used by Voice and EVP` / `Motion — used by Radar and EMF` / `Camera — used by the Camera tool` / `Location — optional, improves the place seed`. Button: `Enter NightTrace`. | **Fires zero permission prompts.** Marks `onboarding.complete`. |
| 7 | **HOME.** | `analytics: onboarding_completed`. Home computes the daily anomaly and the day's conditions locally. |

### D.2 Home → brief (0:20–1:40)

| Step | Screen state |
|---|---|
| 8 | Home shows: header (`NIGHTTRACE` micro-caps + `FIELD ASSISTANT` clearance chip) → **Anomaly of the Day** card → **Featured hunt**. With zero cases, the featured card is `GHOST INVESTIGATION` / `Indoor · Slow · Audio-led` / `Active tonight` and the primary button reads **`BEGIN BRIEF`**. Below, an empty `RECENT EVIDENCE` rail reading *"Nothing on file yet."* |
| 9 | Tap `BEGIN BRIEF` → push `/hunt/ghost/brief`, tab bar hides, background shifts one step darker (`basalt` → `void`) and a 400 ms low-pass ambience fades in at −30 dB. The tab bar's disappearance is the first physical cue that the user has left the app and entered a case. |
| 10 | **HUNT BRIEF** renders top→bottom: `GHOST INVESTIGATION` (title) → `CASE NT-017` (mono, pre-assigned) → **NAME THIS CASE** field (placeholder `e.g. The Attic, Second Night`, helper *"Named cases are easier to remember. This is the name on the report."*) → **SET YOUR INTENTION** three chips `Ask` / `Watch` / `Wait` → **GEAR-UP** four rows → primary button. |
| 11 | **Gear-up row 1 — Calibrate.** The user taps `Calibrate`. Copy: *"Hold still. Establishing a quiet baseline."* A 5-second ring fills; magnetometer + mic RMS + accelerometer variance are sampled and cached into the seed fingerprint. Result chip appears: `Baseline set · quiet` or `Baseline set · noisy surroundings`. Neither is a judgment; both are true and both are used. |
| 12 | **Gear-up row 2 — Torch.** `Torch off` by default in indoor hunts. Toggling it is free and reversible. |
| 13 | **Gear-up row 3 — Room tone.** `Ambience on`. Toggling off gives a *silent* session bed — a legitimate, scarier choice, honoured by `AudioBus.bed({silence})`. |
| 14 | **Gear-up row 4 — Duration.** `Auto-close after 30 min`. Options `10 / 20 / 30 / 45 / none`. The auto-close produces a *completed* case, not an abandoned one. |
| 15 | The primary button reads **`HOLD TO ENTER THE FIELD`**. Press-and-hold for 800 ms: a hairline fills left→right under the label, the label swaps to `Crossing over…` at 400 ms, a rising `impactAsync(Medium)` fires at 600 ms. Release early → `Hold to enter.` (a soft `notificationAsync(Warning)`). Complete → a 220 ms fade to black, then the Session shell. |
| 16 | On the transition, the engine requests the **microphone** just-in-time (Ghost's tool set includes Voice). If granted, an `AudioStream` PCM channel spins up. If denied, the Voice tool enters **archive mode** and the session continues — no nag, ever. |

### D.3 First session — the silence (1:40–4:30)

| Step | Experience |
|---|---|
| 17 | **Session shell** boots into **Phase QUIET**. The rail shows: `NT-017` (mono, left) · an unlabeled 5-segment phase hairline (center) · `00:12` elapsed + a slow-breathing dot (right). The center surface is the Ghost hunt's default tool — **Radar** — showing your position, an empty rose, and three faint range rings. |
| 18 | At **00:45** the app fires its first micro-directive on the rail: *`Sweep the room slowly.`* No target named, no direction given. This is the Directives Rule in practice (one verb, no object). |
| 19 | Between 00:45 and **02:40** the user sweeps, moves, and gets nothing. The radar draws one **`AMBIENT`** tick at 01:30 — a 400 ms noise arc at 0.15 strength that resolves into static — and nothing else. It is a *system-alive* signal, not an event. Attunement rises slowly. |
| 20 | The user opens **Voice** at 02:41. Presses `ASK A QUESTION`. The static bed rises; the tuning ribbon moves. Nothing. Thirty seconds of static. The rail's directive at 03:10 reads *`Wait.`* |
| 21 | This silence is the product. Three minutes with no event is **inside spec** (`QUIET` floor is 45 s and the tail is exponential). The session shell's breathing dot reassures: the app is listening, not broken. |

### D.4 First evidence (4:30–6:00)

| Step | Experience |
|---|---|
| 22 | At **04:38**, an `AMBIENT_NOISE` draw is followed at 04:52 by the first real emission: **`audio_whisper`**, family `AUDIO`. Because it is the user's first-ever evidence and the First Run Directive is active (`guaranteedEncounterOnFirstRun`), the directive also forces the draw to be a **capture-eligible** event. |
| 23 | A 300 ms **evidence capture card** slides up over the tool (never full-screen — the user must not lose the field): |

```text
EVIDENCE LOGGED                        NT-017 · 11:42 PM
─────────────────────────────────────────────────────
UNKNOWN VOCALIZATION
Certainty      SUGGESTIVE
Channel        Audio · captured live
Possible match —
[ Keep ]   [ Mark as explained ]        auto-dismiss 6 s
```

| Step | Experience |
|---|---|
| 24 | `Keep` commits a row to `evidence` immediately (`02-*` §G.3, commit-on-find) and drops a **souvenir chip** into the session's evidence rail. Haptic `confirm`. |
| 25 | The directive fires at 05:10: *`Ask it something.`* The user returns to Voice and speaks. The mic VAD registers voice; attunement jumps; the box's next response may echo the user's own cadence (Mimic trait, §F.8). |
| 26 | One more evidence item lands at 05:40 (`emf_stir`). The phase hairline advances to segment 2 (**SIGNALS**). The user is not told what the segments mean — they simply notice the rail has moved. |

### D.5 First encounter (6:00–8:10)

| Step | Experience |
|---|---|
| 27 | At **06:12** the Ghost session crosses `tension ≥ 62` for the fourth consecutive tick and **Phase 4 (Encounter Window)** opens. The window opening is signalled only by: the ambience bed losing its upper band, the breathing dot slowing to half rate, and a single `impactAsync(Light)`. No text. |
| 28 | At **07:24** an `audio_whisper` fires at strength 0.7, followed within the window by a **Mimic encounter**: the Voice tool's static resolves for 900 ms into a phrase drawn from the ambiguous word bank, speaks one second of near-silence, and cuts. Copy on screen: `SIGNAL LOST`. |
| 29 | Simultaneously the rail writes one line: *`It said something.`* (9 words max rule holds — 3 words.) |
| 30 | Encounter budget is now 1 of 1. Tension decays. The session enters **RESOLUTION** and the rail directive becomes *`Close the case when you're ready.`* |
| 31 | The user taps `CLOSE CASE`. Confirm sheet: `Seal the case now` / `Keep investigating` (extends the auto-close by 10 minutes, once). |

### D.6 Case Report (8:10–9:30)

| Step | Experience |
|---|---|
| 32 | A deliberate **900 ms "COMPILING CASE FILE"** beat: near-black, a mono line types out `NT-017 · 07 evidence · 01 encounter`, then the report slides up. This is a designed pause, not a spinner (`02-*` §G.1: no loading spinners). |
| 33 | **CASE REPORT** (§K.12) renders in full. Status seal: **UNEXPLAINED** in display type with a stamped ring that scales in over 220 ms at a 4° rotation, `impactAsync(Heavy)` + `notificationAsync(Success)` 120 ms later. |
| 34 | Signature strip shows 7 evidence glyphs and a `PARTIAL MATCH` slot. The strongest souvenir is playable inline. The triage ledger shows 5 of 7 items untriaged. |
| 35 | The user taps `Review the evidence` → the triage sheet walks them through the 2 remaining items. Each verdict re-renders the signature strip live. Triage is the deduction mini-layer: it is the difference between "the app gave me a result" and "I concluded something". |
| 36 | `Investigator note` field: *"What did you notice that the tools couldn't?"* Free text, optional, saved to the case. |
| 37 | Primary: **`SEAL & FILE`**. Hold-to-confirm 600 ms. The seal ring rotates closed, `seal` haptic, the report compacts with a 380 ms `slow` scale-and-fade into the journal stack. Secondary: `Share card`. Tertiary: `Discard case` (destructive, two-step). |

### D.7 Share card (9:30–10:00)

| Step | Experience |
|---|---|
| 38 | `Share card` pushes `/case/NT-017/share`. A live-rendered 9:16 card sits on a dark scrim, with a horizontal variant selector (`Story 9:16` / `Feed 4:5`) that cross-fades the card in 180 ms. |
| 39 | The **field note** line is one of four seeded lines chosen by status × strongest evidence, or the user's own text. Tap the line → a sheet of four options + `Write your own`. **The app never generates this text.** |
| 40 | `Share` → `captureRef` → PNG in cache → `Sharing.shareAsync`. `Save to Photos` → `Asset.create`. The card carries **no URL, no QR, no watermark** — only the case ref and the wordmark. |
| 41 | `analytics: report_shared{channel, variant, status}`. |
| 42 | The user lands back in the **Field Journal**, now on the `Cases` segment, with NT-017 at the top and a `NEW` hairline. The Phenomena segment shows Ghost at `1 encounter · 7 evidence`; the other three are sealed silhouettes. |

### D.8 Second session (next day, ~4 minutes)

| Step | Experience |
|---|---|
| 43 | Day 2 open → Home shows a **different** Anomaly of the Day (it rotates on the local `dayKey`) and Bigfoot as the featured hunt because its conditions (`dusk + outdoor`) are met at the user's local hour. |
| 44 | The user begins **Bigfoot**. This is deliberately a *different verb*: the Tracker, not the Voice. It is also the moment the product proves it is not one game reskinned — outdoor, fast, visual, bearing-based, with a moving target and a **different fail state** (`GONE`). |
| 45 | Bigfoot runs a 6-minute arc, yields 4 evidence items including a `FOOTPRINT` from `LOG TRAIL MARK`, and one **Ambusher encounter**: a 700 ms far-off silhouette in the Camera. The user fails to raise the camera in time in 40% of sessions and gets `GONE` — a *better* story than a catch ("I missed it"). |
| 46 | Case 2 seals as **INCONCLUSIVE**. |
| 47 | **Now the paywall.** It does not interrupt. The journal's Phenomena segment scrolls to the two sealed entries and a sheet rises from the bottom with a 380 ms `slow` spring. Copy: `Two cases on file. Two phenomena unopened.` Products, price, `Restore`, `Not tonight`. One presentation per session, maximum, ever. `analytics: paywall_viewed{placement: 'post_case_2'}`. |
| 48 | The user dismisses with `Not tonight` and the journal remains fully usable: both cases readable, the share card re-shareable, Ghost unlimited, Bigfoot at 2 of 3 free cases. The app never mentions the paywall again until the user opens it from Profile or taps an `Open the field guide` card in Phenomena. |
| 49 | On day 3+, the return hook is structural: an unsealed case dot on the Journal tab, a rotating anomaly, a signature archive with holes, and two locked silhouettes with stated requirements. |

### D.9 The four session shapes the flow must support

| Shape | Duration | Entry | Expected outcome | Designed for |
|---|---|---|---|---|
| **Field Note** | 3 min | Investigate → `Field Note` on any hunt | 0–2 evidence, no encounter, a `FIELD NOTE` report (a short-form case, one third the length) | The commute, the walk, the 2-minute claim from §3, honestly scoped |
| **Standard case** | 10–20 min | Home featured / Investigate | 3–8 evidence, 0–1 encounter | The default |
| **Vigil** | 30–45 min | Brief → duration `45` | 6–14 evidence, 1–2 encounters, a genuine possibility of nothing at all | The attic, the empty house, the Friday night |
| **Expedition** | 30 min+, premium | Investigate → premium phenomenon | A themed case-file with a unique report skin | Monetized content (§N) |

---

## §E. MVP feature specification

24 features. Each carries: **Purpose · UI · Interactions · Internal logic · APIs · Stored data · Edge cases · §38 verdict.** Feature IDs (`F-01`…`F-24`) are stable and referenced by `02-*` §M's backlog.

Global conventions used below:
- Spacing tokens: `s1=4 s2=8 s3=12 s4=16 s5=24 s6=32 s7=48 s8=64`.
- Radii: `r1=8 r2=12 r3=16 r4=24 rfull`.
- Durations: `instant=120ms fast=180ms base=240ms slow=380ms deliberate=900ms`.
- Haptics named per `02-*`: `tickLight` (`impactAsync(Light)`), `tickMedium`, `tickHeavy`, `confirm` (`notificationAsync(Success)`), `warn` (`notificationAsync(Warning)`), `seal` (custom pattern `[40,80,40]`), `encounter` (custom `[0,60,40,120]`), `select` (`selectionAsync()`).

---

### F-01 · Onboarding (4 screens)

| | |
|---|---|
| **Purpose** | Establish the entertainment framing (§P) *before* any sensor, set intensity, and teach the permission philosophy. It is a legal shield and a tone-setter in one flow. |
| **UI** | 4 full-bleed screens on `void`. Format per screen: micro-caps kicker (`s4` top) → display headline (`title1`, 30/34) → body (`body`, 16/24, `inkDim`, max 3 lines) → optional link row → primary button, pinned `s5` above the safe area. Progress: four 2 px hairlines at the top, `s4` inset, 6 px gaps, filled `trace`. |
| **Interactions** | Swipe or tap to advance; `I understand` on screen 1 is the only screen with no back. Screen 3 slider is draggable with `select()` on each detent. Screen 4 has no button that requests permission — only `Enter NightTrace`. |
| **Internal logic** | No sensor initialisation, no prompt, no network. Writes `onboarding.completed`, `intensity`, `haptics`, `reduceMotion` to `kv-store`. Under 20 seconds total. |
| **APIs** | `expo-sqlite/kv-store` only. |
| **Stored data** | `settingsStore` + `kv-store` scalars. `analytics_events`: `onboarding_started`, `onboarding_intensity_set{level}`, `onboarding_completed`. |
| **Edge cases** | Reduce-motion on → no slide transitions, cross-fade only. Reinstall → onboarding is not re-run (kv persists in app data; it *is* cleared on a real uninstall, which is correct). Accessibility text size XXL → body clamps at 3 lines and scrolls; button never moves off-screen. |
| **§38 verdict** | Q1 pass (sets tone) · Q2 n/a · Q3 n/a. **Kept**, and deliberately short: a longer onboarding would delay the first threshold crossing, which is the product. |

---

### F-02 · Home + Anomaly of the Day

| | |
|---|---|
| **Purpose** | Answer "what is happening tonight?" and put the user into a Brief in one tap. Establish the return hook without a notification. |
| **UI** | Scrollable. Header (`s4` inset, `s6` top): `NIGHTTRACE` micro-caps left, clearance chip right (`FIELD ASSISTANT · 01`). Then, in order: **Anomaly of the Day** card → **Featured Hunt** card (large, 16:9 art plate) → `CONTINUE CASE` strip (only when an unsealed case exists) → `RECENT EVIDENCE` rail (horizontal, 96 px tiles) → footer line `Tonight's conditions: dusk · rising pressure · quiet band`. |
| **Interactions** | Featured card tap → `/hunt/[id]/brief` (skip Investigate entirely — this is the one-tap path). Anomaly card tap → a medium sheet explaining the anomaly in fiction + `Investigate this` (routes to Investigate pre-filtered). Evidence tile tap → `/case/[caseId]/evidence/[evidenceId]`. Pull-to-refresh is **disabled** — there is nothing to fetch, and a spinner would break the illusion of a local instrument. |
| **Internal logic** | `SeedService.dailyAnomaly(dayKey)` returns a deterministic anomaly from `hash(dayKey + contentVersion)` — every user on the same local day gets the same *class* of anomaly, seeded differently per device. Featured hunt is chosen by a deterministic scorer: `conditionsMatch(hunt, tonight) * 2 + !recentlyPlayed * 1 + unlockBias`. |
| **APIs** | `expo-sensors` Barometer (optional, ambient pressure trend), `expo-sensors` LightSensor (Android, optional), `Clock.dayKey()`, local time. Zero network. |
| **Stored data** | Read-only over `case_reports`, `evidence`, `user_progress`. Writes nothing. |
| **Edge cases** | 0 cases → featured card carries the extra line `Your first case is free. No account needed.` Fresh install at 03:00 → conditions read `deep night`. Barometer unavailable → the conditions line degrades to two facts (`deep night · quiet band`) and never mentions pressure. All four hunts locked → impossible, Ghost is never locked. |
| **§38 verdict** | Q1 pass (it is the case board) · **Q2 pass** (rotating anomaly) · Q3 pass (the anomaly card is itself shareable via long-press). |

---

### F-03 · Investigate (hunt picker)

| | |
|---|---|
| **Purpose** | The unlock surface and the honest scope display. Where the user sees that this is four deep phenomena, not forty shallow ones. |
| **UI** | A vertical list of **phenomenon cards**, not a grid. Each card: 72×72 silhouette plate left (locked = `inkFaint` at 12% with a hairline keyhole), name (`title3`), a 3-token meta row (`Indoor · Slow · Audio-led`), and a right-aligned state chip (`READY` / `2 OF 3 FREE` / `LOCKED`). Locked cards show their **exact requirement** as the meta row — never a mystery. Below the list: `FIELD NOTE` entry (a compact row, `s5` spacing above) and tonight's conditions repeated once. |
| **Interactions** | Tap an unlocked card → Brief. Tap a locked card → a medium sheet with the requirement, current progress, and a single action (`Open Ghost investigation`, `View the field guide`). Never a purchase CTA from a locked card without the user tapping through. |
| **Internal logic** | `ProgressionService.unlockedHunts(progress)`. Lock rules are deterministic and visible (§E20). |
| **APIs** | None. |
| **Stored data** | Reads `user_progress`, `discoveries`. |
| **Edge cases** | Requirement met while the screen is open → the card animates its keyhole to a silhouette over 380 ms on next focus, with `confirm`. Zero cases yet → the three locked cards still render (showing the shape of the product is a retention asset, and it is honest because requirements are stated). |
| **§38 verdict** | Q1 pass · Q2 pass (visible locked silhouettes with stated requirements) · Q3 fail (this screen is not shareable, correctly). |

---

### F-04 · Hunt Brief (the ritual gear-up) — **emphasis feature**

| | |
|---|---|
| **Purpose** | Convert an app launch into a threshold crossing. Four micro-actions (calibrate, name, intend, hold) make the user co-author the case before it exists, which is what makes the eventual report feel like *theirs*. |
| **UI** | Single scroll column, `s5` inset, background `void`. Order and spacing: title block (`s6` top, `s3` bottom) → **case ref** (`mono`, `inkFaint`, e.g. `NT-017`) → **NAME THIS CASE** label + input (56 px, `r2`, `surface1`, 1 px `line`, placeholder text) + helper (`caption`, `inkFaint`) → **SET YOUR INTENTION** label + 3 chips in a row (44 px, equal width, `s2` gap) → **GEAR-UP** label + 4 rows (56 px each, 1 px dividers, icon + label + control, tap target full-width) → conditions summary (3 mono lines) → primary button (56 px, `r3`, `trace` fill, `s5` bottom inset). |
| **Interactions** | **Calibrate**: tap starts a 5 s ring; the rows below dim to 40%; on completion the row's right side becomes a chip `Baseline set · quiet` and the ring settles to a static mono tick. Re-tappable. **Name**: free text, 40 chars, clears to placeholder on empty; not required. **Intention**: single-select, default `Watch`. **Duration**: segmented control `10/20/30/45/∞`. **Hold to enter**: 800 ms press with a hairline progress fill; releasing early shows `Hold to enter.` |
| **Internal logic** | Calibration samples `magnetometer` (2 Hz, 5 s), mic RMS, and accelerometer variance into a `BaselineFingerprint{magMean, magVar, rmsFloor, motionFloor}`. These become (a) the EMF baseline, (b) the seed's sensor-fingerprint term, (c) the session temperament inputs (§F.3.3). The intention is **soft**: it biases one coefficient (±0.15 on the evidence-emission gate) and is stored for the report's `INTENT` line. It never changes what can be found, only what is likelier to be *noticed*. |
| **APIs** | `expo-sensors` Magnetometer + Accelerometer (via `SensorHub`), `expo-audio` `useAudioStream` if mic already granted, `expo-haptics`, `expo-camera` torch (`enableTorch`, optional row toggle). |
| **Stored data** | `sessions` row created **here** with `status='brief'`, `seed`, `case_name`, `intention`, `duration_pref`, `conditions_snapshot`, `baseline`. Media: none. |
| **Edge cases** | Calibration interrupted (app backgrounded) → resumes on foreground, restarts the ring from 0, never fails. No magnetometer → the ring completes in 2 s and the chip reads `Baseline set · inferred`. User holds but backgrounded at 700 ms → the hold aborts silently and resets; entering the field must be a foreground act. Torch on + Camera tool denied later → the torch row is disabled in-session, and the brief's toggle is remembered. |
| **§38 verdict** | Q1 **strong pass** (this is the single most investigation-feeling screen in the app) · Q2 pass (case refs and names accumulate) · Q3 pass (the named case is what the share card carries). |

---

### F-05 · Session seed (the Session Fingerprint)

| | |
|---|---|
| **Purpose** | Guarantee that no two sessions can ever be the same, without visible randomness — the retention half of the uncertainty engine. |
| **UI** | No dedicated screen. The seed surfaces as: the brief's conditions summary (3 mono lines), and a `Conditions` row in the Case Report. Raw seed is visible only in Profile → Diagnostics (long-press the version number) for bug reports. |
| **Interactions** | None. Fully automatic. |
| **Internal logic** | `seed = seedFromParts([huntId, contentVersion, lat.toFixed(3), lon.toFixed(3), startedAtMs, baselineFingerprint.hash, ambientLightBucket, pressureTrendBucket, dailyAnomalyId])`. Where `coords` are absent (location denied) the seed degrades to `seedFromParts([huntId, contentVersion, startedAtMs, fingerprint, lightBucket, pressureBucket, dailyAnomalyId])` — still unique, because `startedAtMs` is. The seed is then `fork()`ed into named substreams so draw order never couples systems: `rng.session`, `rng.events`, `rng.radar`, `rng.words`, `rng.report`, `rng.encounters`. |
| **APIs** | `expo-location` (optional), `expo-sensors` LightSensor (Android), Barometer (optional), `Clock` (host-supplied time; the engine never reads a clock). |
| **Stored data** | `sessions.seed`, `sessions.conditions_snapshot` (JSON: `{hourBucket, lightBucket, pressureTrend, weatherProxy, placeLabel?}`). |
| **Edge cases** | Clock changed mid-session → `startedAtMs` is captured once and never re-read. Location reduced-accuracy → the coords are still used, rounded to 3 dp, and the report says `unverified coordinates`. Two sessions started in the same minute → forks differ because `baselineFingerprint` differs. |
| **§38 verdict** | Q1 pass (invisible, but it is why the user's night is theirs) · **Q2 pass** (this is the mechanism behind "different every time") · Q3 pass (the conditions line on the report is a shareable detail). |

---

### F-06 · Session shell

| | |
|---|---|
| **Purpose** | The field itself: a persistent, chrome-minimal frame that holds the tool carousel, the phase rail, and the tick host. It is a cockpit, not a screen. |
| **UI** | Three fixed regions over a `void` background. **Status rail** (top, 56 px, `s4` inset, hairline bottom `line`): case ref (mono, left) · **phase hairline** (center, 5 segments, 2 px, filled `trace` as phases complete, unfilled `inkFaint`) · elapsed `MM:SS` (mono, right) with a 6 px breathing dot to its left. **Field** (center, full bleed): the active tool surface, or, in the default `Listening` view, a large radial breathing ring (`rfull`, 180 px, `trace` at 25%, 4 s cycle) with the state word beneath in `title3`: `QUIET` → `LISTENING` → `ACTIVE` → `CONTACT`. **Tool row** (bottom, 72 px + safe area, horizontal scroll, `s3` gaps, `s4` inset): 7 icon buttons, 44 px, active one filled `trace` on `surface2` with a 2 px top indicator. Above the tool row, a single **evidence chip rail** (48 px) that appears only when evidence exists. |
| **Interactions** | Tap a tool → push its full-screen surface. Tap the evidence rail → scroll horizontally, tap a chip → the evidence sheet. Swipe down on the field → opens the **directive card** (the last directive plus `I need a direction` which requests one from the directive pool). Tap the elapsed time → low-power sheet. Long-press the phase hairline → a read-only explanation of the phases in *vague* terms: `The record tends to move through five stages.`
| **Internal logic** | `SessionHost` mounts exactly one interval at `SENSOR_TICK_HZ = 6`. Each tick: `hub.digest()` → `engine.tick()` → `presenter(emissions)`. The shell renders from *store selectors* only; it never touches sensors. Checkpoint every 60 s and on `AppState` change. |
| **APIs** | `expo-keep-awake` (`useKeepAwake('session')`, skipped in low-power), `AppState`, `expo-haptics`, Reanimated for the breathing ring. |
| **Stored data** | `sessions.elapsed_ms` + RLE tick digest every 60 s; evidence committed on find. |
| **Edge cases** | Backgrounded → all channels `off`, camera `active={false}`, engine paused (tick loop stops, `elapsedMs` freezes — a session does not advance while the phone is in a pocket, which prevents phantom events with no user present). Foregrounded → a 2 s re-calibration grace period with no events. Incoming call → same as backgrounded. Low-power toggle mid-session → the rail chip changes, camera budget halves, and the phase timing stretches by 1.15× for the remainder. |
| **§38 verdict** | Q1 **strong pass** (the field is the product's face) · Q2 pass (the unsealed case) · Q3 pass (this is where screenshots come from). |

---

### F-07 · EMF tool — verb: **SWEEP**

| | |
|---|---|
| **Purpose** | The gateway instrument and the tutorial for "quiet is data". It converts real magnetometer noise into a *story about a room*, with zero scientific claim. |
| **UI** | Full-screen, `void`. Center: a **rolling trace** (a 1 px `trace` line, 128 px tall, right-to-left, 24 s window, no axis labels, no units, no numbers ever). Behind it a horizontal `line` at 40% height labelled `ROOM` in micro-caps (the baseline, never a value). Left-top: `EMF` micro-caps. Right-top: a 3-state chip `STILL` / `DRIFT` / `STIR`. Bottom third: a 220 px radial **field dial** — concentric arcs with a moving highlight that widens (never a needle, never a number). Bottom button row: `SWEEP` (56 px, primary) and `LOG THIS SPOT` (secondary). |
| **Interactions** | `SWEEP` arms a 10 s window; the user walks slowly with the phone level. `LOG THIS SPOT` captures the current 6 s window as an evidence candidate. Tool leave → the trace freezes for 400 ms then fades. |
| **Internal logic** | Pipeline (per `02-*` `EmfPipeline.ts`): `magnitude = sqrt(x²+y²+z²)` → EMA (α 0.08 at 6 Hz) → baseline (`baseline.magMean` from calibration, with slow adaptive re-baselining at 0.01/tick) → `delta` → `z = delta / max(baseline.magVar, ε)` → hysteresis-banded into 3 states (`STILL |z| < 1.2`, `DRIFT 1.2–2.4`, `STIR > 2.4` with a 0.3 release margin). The **banded state** — never `z` — is what the engine receives in the `SensorDigest`. The dial's width maps the state; the trace's amplitude maps a clamped, smoothed `|z|` so the visual is expressive but unquantifiable. |
| **APIs** | `expo-sensors` Magnetometer (via `SensorHub`, rate `ambient` 6 Hz, `focus` 15 Hz while `SWEEP` is armed). |
| **Stored data** | A `LOG THIS SPOT` produces an `emf_stir` evidence candidate carrying `{bandState, windowRms, atMs, toolStateSnapshot}` — **no raw z, no µT value persisted to the report**. Raw samples live only in the ring buffer and are discarded. |
| **Edge cases** | No magnetometer → **residual mode**: the trace is driven by `motionVariance + clock + rng.emfFork`, identical cadence, identical engine contract, and the top chip gains a permanent `INFERRED` micro-label. Copy: `No magnetic sensor here — readings are inferred.` Metal desk / speaker magnets → the adaptive baseline absorbs it in ~8 s; if `|z|` pins above 4.0 for > 20 s the chip shows `INTERFERENCE` and the engine suppresses EMF-sourced events for 30 s (this is the **false-positive** failure mode, §F.9). User shakes the phone → accelerometer guards: if motion > threshold, the trace dims 40% and shows `HOLD STEADY`. |
| **§38 verdict** | Q1 pass (it reads as an instrument, and `INTERFERENCE` is a *great* investigation beat) · Q2 pass (the room changes night to night) · Q3 pass (a `STIR` trace screenshot is a classic share). |

---

### F-08 · Radar tool — verb: **SWEEP / ORIENT**

| | |
|---|---|
| **Purpose** | Spatialise the unknown. Give the user a reason to *move and turn* without ever giving them a verifiable position. |
| **UI** | Full-screen, `void`. Center: a 320 px radar rose, hairline rings at 3 radii, 8-wind compass letters at 40% opacity, no distance numbers. Your position is a small `trace` triangle at center. Contacts render as **confidence cones**: a filled arc wedge (`rfull`) spanning 20–70° with a soft alpha falloff at the edges (`trace` at 12–22%), not a dot. A contact's angular width *is* its uncertainty. Behind the rose: a slow 8 s sweeping gradient (one revolution), 6% `trace` alpha. Top-right chip: contact count as a word — `CLEAR` / `ONE` / `SEVERAL`. Bottom: a bearing line of text, e.g. `NE · NEAR` (never metres). |
| **Interactions** | Rotate the device to orient (heading-driven, gyro-smoothed). Tap a cone → it expands to a detail strip: `FIRST SEEN 06:12 · MOVING · UNSIGNED`. Tap again to close. Press-and-hold the rose → `LOG BEARING` captures the strongest cone as an evidence candidate. |
| **Internal logic** | `RadarSimulator` maintains `RadarTarget[]` with `{id, bearingDeg, bearingUncertaintyDeg, rangeBand: NEAR|FAR|DISTANT, velocityBearingDegPerMin, lifetimeMs, strength 0..1, kind: 'entity'|'noise'|'decoy', birthTick, deathTick}`. Targets are **born, move, and die** — never ambiently random. `rangeBand` is a *word*, deliberately coarse. Signal strength drives cone alpha and width *inversely* (weak = wider = vaguer). Noise targets are indistinguishable from entity targets for their lifetime; only the engine knows. Decoys are Trickster-archetype false evidence (post-MVP, already supported). |
| **APIs** | `expo-sensors` DeviceMotion/Gyroscope (heading via magnetometer or `expo-location` heading), `expo-haptics` (`tickLight` on target birth, one `tickMedium` on approach-closing past a threshold). |
| **Stored data** | `LOG BEARING` yields evidence `{bearing8, rangeBand, targetAgeMs, targetKind: 'unresolved'}`. Target lifetimes are recorded in the tick digest for replay. |
| **Edge cases** | No heading sensor → the rose renders north-free with a `RELATIVE` micro-label and bearings become `LEFT / AHEAD / RIGHT`. This is a graceful, readable degradation. Zero contacts for a whole session → the rose still animates, the chip reads `CLEAR`, and the Case Report records `No bearing ever resolved.` as a line — a **feature**, not a hole (§F.9). Target birth during a `HOLD STEADY` motion guard → suppressed. |
| **§38 verdict** | Q1 **strong pass** (the single most "I am doing something out there" surface) · Q2 pass · Q3 **strong pass** (cone + bearing is a screenshot). |

---

### F-09 · Voice tool (Spirit Box + spoken question) — the Mimic's stage

| | |
|---|---|
| **Purpose** | The audio-in/entity-out primitive. Merges the brief's Spirit Box (§11) and the memlog's whisper ritual into **one** surface. It is the only tool that lets the user *speak into the fiction*. |
| **UI** | Full-screen, near-black. Top: `VOICE` micro-caps left; a mono band line right that sweeps through plausible FM values (`87.4`, `89.1`, `92.8`, `104.3`…) with no relationship to anything — pure theatre, no claim, no units implied beyond MHz (harmless, and the brief's own example). Center: a **tuning ribbon** — a horizontal waveform whose amplitude and vertical drift are procedural; beneath it, when a response arrives, one line of found text in `title2` with a 40 px mono `»` prefix, centered, e.g. `» leave`. Bottom: a 64 px `ASK A QUESTION` button (hold-to-talk, `rfull`) that inverts the Spirit Box: **it invites the user to ask first**, and the entity's answer may arrive up to 90 seconds later, on another tool, which is the whole trick. |
| **Interactions** | Hold `ASK A QUESTION` → mic arm, live input level draws as a ring around the button, release → a `SENT` stamp + `tickMedium`. The app then says nothing for at least 12 s (a mandated non-answer). The user may leave the tool; the question remains pending in the session state and can be answered anywhere. Tapping a returned line → `LOG THIS` captures it as `unknown_voice` evidence. |
| **Internal logic** | A `QuestionTicket` is created with `{askedAtTick, durationMs, cadence, vadSpoke, rmsEnvelope}`. The engine's **Mimic hook**: if the archetype is Mimic, the answer's *timing* is drawn against the user's cadence (a stretched, delayed echo of the recorded envelope) and the word is drawn from `wordbanks/ambiguous.json` weighted by the question's length bucket. Non-Mimic archetypes answer from their own pool or not at all. Words are pre-recorded fragments, concatenated from a bank — **never generated**. Word selection is `rng.words` (its own fork), so word choice never perturbs event timing. |
| **APIs** | `expo-audio` `useAudioStream()` PCM → local RMS + voice-activity estimator (`02-*` §G.1); `expo-audio` `useAudioPlayer` for the static bed and word fragments; `expo-haptics`. |
| **Stored data** | Evidence: `{wordId, bankId, latencyMs, wasAnswerToQuestion: bool, archetypeTag}`. The audio fragment itself is **not** saved (it is a pre-baked asset, not a recording) — only the id and the timing. |
| **Edge cases** | Mic denied → **archive mode**: the word bank fires on elapsed-time gates only, no `ASK` button (it becomes `SCAN`), no "it answered you" coupling, and the tool's top shows `ARCHIVE`. Copy: `Microphone is off — the box still scans.` `AudioStream` unsupported → recorder `metering` fallback at 500 ms, VAD threshold widened, responses delayed one tick. User asks a question then ends the session → the pending ticket dies with the session and is recorded in the report as `1 question unanswered` (which is a *great* report line). |
| **§38 verdict** | Q1 **strong pass** (asking the dark a question is the most on-thesis verb available) · Q2 pass · Q3 **strong pass** (a single word on a black screen is the most shareable artefact in the app). |

---

### F-10 · EVP Recorder — verb: **LISTEN / MARK**

| | |
|---|---|
| **Purpose** | Make the user a participant in the record: they decide what was worth keeping. It also gives the camera-shy user an activity for the whole session. |
| **UI** | Full-screen, `void`. Top: `EVP` micro-caps + a blinking 8 px `REC` dot when armed + elapsed. Center: a scrolling waveform (1 px `trace`, 96 px tall, 30 s window, mirrored). Marker pins appear as 2×12 px `amber` ticks in a lane beneath the waveform. Bottom row: `RECORD` (primary, toggles) · `MARK` (secondary, large, right-thumb) · and a mono readout of marker count (`3 marks`). |
| **Interactions** | `RECORD` arms continuous capture to cache. `MARK` drops a pin at the current position with `tickMedium`, a 120 ms amber flash on the lane, and an inline `+ MARK 04` label. Tap a pin → a small popover with `Play from here`, `Keep as evidence`, `Delete`. |
| **Internal logic** | Audio buffers to `Paths.cache/session/<id>/evp-<n>.caf` in 30 s rolling segments (never one long file — a phone dying at minute 20 must not lose the first 19). Markers store `{atMs, segmentRef, rmsAtMark}`. The engine may inject a **`possible anomaly marker`** (per brief §12) as a *system pin* rendered in `inkFaint` rather than amber, unlabeled, and it is **never** described as paranormal. If the user keeps a system pin as evidence, the evidence card reads `EVP · UNMARKED SEGMENT` — attribution to the user, not the app. |
| **APIs** | `expo-audio` `useAudioRecorder(RecordingPresets.HIGH_QUALITY)`, `AudioModule.requestRecordingPermissionsAsync()`, `expo-file-system` (`File`, `Paths.cache`), `expo-media-library` `Asset.create` for export. |
| **Stored data** | `media` rows (`relative_path`, `mime`, `bytes`, `duration_ms`, `checksum`) + `evidence` rows referencing them. Segments are deleted at case close unless kept. |
| **Edge cases** | Mic denied → the tool is not offered in the carousel at all for that session (the tool set filters itself by availability) and the brief's gear-up shows `EVP · unavailable` — an honest, visible absence rather than a broken screen. Storage < 200 MB free → recording is limited to 60 s segments and a one-line notice `Storage is low — keeping shorter segments.` Interruption (call) → the recorder pauses, the file is finalised, and a marker `SESSION PAUSED` is dropped so the waveform's gap is explained. |
| **§38 verdict** | Q1 pass (marking is investigator behaviour) · Q2 pass (kept segments accumulate) · Q3 pass (a waveform with user marks is a shareable artefact and user-authored). |

---

### F-11 · Camera / Entity Camera — verb: **FRAME**

| | |
|---|---|
| **Purpose** | The encounter delivery surface and the most emotionally load-bearing tool. It must be brief, ambiguous, peripheral, and rare. |
| **UI** | Full-screen immersive preview with a restrained overlay stack: 1 px `line` rule-of-thirds (18% opacity), corner brackets (`trace`, 24 px arms, 6% — subtle), a top-left mono strip `CAM · 01:24`, a top-right heading readout (`NNE`), a bottom-left 3-bar **signal meter** (`trace`, unlabeled), and a 90% black vignette. A `TORCH` toggle sits bottom-right. **No night-vision green, no scan lines by default** — those read as gimmick. A `NIGHT` look exists as an intensity-gated optional film (a lifted-shadow LUT), off below `Present`. |
| **Interactions** | `CAPTURE` button bottom-center (72 px, `rfull`); shutter = a 90 ms white 25% flash + `tickMedium`, **no sound** (a shutter sound would break the field). Torch toggles with `select()`. Pinch = nothing (zoom is disabled; a zoom feature invites "let me look closer", which breaks ambiguity). |
| **Internal logic** | Encounters are resolved by the engine and handed to the tool as a `ResolvedEncounter` with `{assetId, anchor: 'peripheral_left'|'peripheral_right'|'distance'|'behind', durationMs (400–900), intensity, ambiguousBy: 'motion_blur'|'overexposure'|'never_facing'|'occlusion'}`. The presenter renders the sprite sequence **only if the camera is currently live and the user is holding the phone up** — otherwise the same encounter is delivered as a peripheral movement in the *previous* tool (the user misses it, and that is the Ambusher fail state `GONE`, §J.2). |
| **APIs** | `expo-camera` `<CameraView />` + `useCameraPermissions()` + `enableTorch`, `takePictureAsync({pictureRef:true})`; `expo-haptics` — with `HapticsService.setCameraActive(true)` because **iOS silences haptics while the camera is active** (`02-*` §G.0), so the encounter's haptic must be routed to a *distinct* cue or deferred to the moment the camera pops. |
| **Stored data** | A capture yields `media` + an `evidence` row of type `visual_encounter` with `{assetId, anchor, durationMs, ambiguityTag, frameRef}`. The stored image is the user's photo **with the overlay composited out** by default, plus an optional `Retain field overlay` toggle — because a clean photo is more believable and more shareable, and compositing the overlay would be a *claim*. |
| **Edge cases** | Camera denied → **dark-room renderer**: the same timing, the same encounter, driven over a black field with pre-rendered overlays. Copy: `No camera access — rewinding to the dark-room view.` Only one preview may exist (`02-*` §G.0) → the surface is a pushed route and unmounts on pop; the shell must never mount a second preview. Encounter fires while the camera is *not* open → it becomes an audio + haptic event in the current tool plus a rail line, and the Report records `1 possible visual event, not framed` (§F.9). Too dark / too bright → the engine's `ResolvedEncounter` may include `ambiguousBy:'overexposure'`; the sprite renders at lower alpha and the evidence certainty stays `AMBIGUOUS`. |
| **§38 verdict** | Q1 **strong pass** · Q2 pass · Q3 **strong pass** (this is the screenshot). |

---

### F-12 · Tracker (compass + proximity) — verb: **FOLLOW**

| | |
|---|---|
| **Purpose** | The outdoor verb. Give the user a direction and a *closing feeling* without a distance claim. Merges the brief's compass and proximity scanner. |
| **UI** | Full-screen, `void`. A large compass rose (280 px) that rotates with heading; beneath it a single **bearing chevron** at the edge pointing to the current contact. A **proximity ladder** below: 5 stacked hairlines that fill `trace` as the target closes — explicitly *not* a number, and the ladder uses **bands**, so it renders `COLD / WARM / CLOSE / NEAR / HERE` in micro-caps beneath. A `TRAIL` toggle switches to a dead-reckoned path trace of the user's own movement (dots every 20 s), which is the "broken trail" evidence surface. Bottom row: `LOG TRAIL MARK` · `SIGNAL AGE` (`fresh` / `stale` in words). |
| **Interactions** | Walk. The chevron and ladder update on proximity changes with `tickLight` pulses that quicken with the ladder. `LOG TRAIL MARK` drops a footprint evidence candidate when the ladder is ≥ `CLOSE`. Long-press the ladder → a one-line explanation: `Proximity is inferred from movement, not measured.` |
| **Internal logic** | The virtual target has a `bearingDeg` and a `proximity 0..1` that **closes on its own** (Stalker) or **must be followed** (Ambusher, where the user's own speed and heading change drive `proximity`). Distance is never computed in metres for display; internally `proximity` is a scalar, externally it is a band word. GPS movement (speed + heading) feeds `proximity` deltas; with no GPS, `proximity` is driven by elapsed time and step-motion (accelerometer periodicity). Haptics are the primary channel: a `tickLight` that quickens is the single best use of haptics in the product (§K.22). |
| **APIs** | `expo-location` `watchPositionAsync` (foreground), `expo-sensors` Magnetometer (heading), Accelerometer (step cadence), `expo-haptics`. |
| **Stored data** | Evidence: `{bearing8, bandAtLog, trailPointCount, proximityBand}`, plus a `trail` polyline in the session record. Trail coordinates are stored **only if location permission was granted**, and they are never rendered as a map with a pin — only as an abstract path. |
| **Edge cases** | Location denied → **uncharted mode**: no polyline, ladder driven by time + motion, the top chip reads `UNCHARTED`, and all distances are hidden (there were none to show). Copy: `Going uncharted. Distances are hidden.` Reduced accuracy → the same as uncharted, with the chip reading `APPROXIMATE`. Target stalls (Ambusher) → the ladder holds at `WARM` for up to 4 minutes with no updates, and the `SIGNAL AGE` reads `stale` — this is a *designed* dead end that the reader-notes section of the report makes meaningful. |
| **§38 verdict** | Q1 **strong pass** (nothing feels more like tracking) · Q2 pass · Q3 pass (ladder + bearing is shareable, especially with `stale`). |

---

### F-13 · Sky Scanner — verb: **ALIGN**

| | |
|---|---|
| **Purpose** | The one tool where the phone's *physical posture* is the mechanic: the user must point the device at the sky, which is a ritual act and a genuinely novel interaction. |
| **UI** | Full-screen. A dark sky field with a faint star field (procedural, deterministic from seed — and labelled `GENERATED` in micro-caps, because a real star map would be a claim). Center: a **reticle** (two 40 px brackets, `trace`). When a signal is live: an azimuth/altitude readout in `mono` (`AZ 287°  ALT 51°`), an **alignment meter** (a horizontal 8-segment bar), and `ALIGN DEVICE` in `title3`. On lock: `SIGNAL LOCK` in `title2`, the reticle closes to 20 px, and `impactAsync(Heavy)`. |
| **Interactions** | Physically pan the device toward the indicated azimuth/altitude. Alignment fills as the device approaches; it decays at half rate when panning away (so the user feels the "hunt" for the point). On lock, the tool holds for 3 s and then the signal may move (`it drifted`) or die (`SIGNAL LOST`). `CAPTURE` at lock is the evidence action. |
| **Internal logic** | The engine emits a `ufo_signal` event with `{azimuthDeg, altitudeDeg, driftDegPerSec, durationMs, resolutionChance}`. Alignment is `1 - angularDistance / 45°` clamped, with a 0.6 decay multiplier. Camera posture is derived from `DeviceMotion` attitude (pitch > 15° up counts as "toward sky"). |
| **APIs** | `expo-sensors` DeviceMotion (attitude), Magnetometer (azimuth), `expo-location` heading fallback, `expo-camera` optional preview, `expo-haptics`. |
| **Stored data** | Evidence: `{azimuthDeg, altitudeDeg, lockDurationMs, driftDegPerSec, resolved: bool}`. Az/alt are the only *numbers* saved in the product's evidence model, and they are numerals of **the user's own device posture**, not a measurement of anything — this is exactly the distinction §P.5 draws. |
| **Edge cases** | Device held flat (never toward sky) → after 45 s of a live signal, `SIGNAL LOST` fires and the report records `not aligned` — a fail state, not a bug. DeviceMotion unavailable → alignment uses magnetometer + a coarse shake heuristic; the meter's update rate drops and the copy is unchanged. Outdoor daylight → the sky field lightens to `surface2` and the star field is hidden (a bright sky screen would be a visible lie). |
| **§38 verdict** | Q1 **strong pass** (pointing a phone at the sky at 11pm *is* the memory) · Q2 pass · Q3 **strong pass** (a lock frame is an excellent share). |

---

### F-14 · Evidence capture & logging

| | |
|---|---|
| **Purpose** | Convert a moment into a **souvenir** — the atomic unit the whole product is built from. |
| **UI** | A **capture card** (never full-screen): slides up 300 ms from the bottom of the current tool, 320 px tall, `r3`, `surface1`, `line` border, 16 px inset. Layout: type label (`title3`) → a 3-row meta block (`Certainty`, `Channel`, `Possible match` — each label `inkFaint` + value `ink`) → two buttons `Keep` (primary) / `Mark as explained` (secondary). Auto-dismiss in 6 s with a 2 px progress hairline along the card's top edge. |
| **Interactions** | `Keep` → commits, `confirm` haptic, card compresses into a chip in the evidence rail over 240 ms. `Mark as explained` → commits with `verdict:'explained'` and the chip renders with a struck-through glyph. Ignore → auto-dismisses and the item is **still logged** as `unreviewed` (never silently lost — the user can triage later; a missed tap must not cost a souvenir). Swipe the card up → `Keep`. Swipe down → dismiss. |
| **Internal logic** | Evidence candidates come from two sources: (a) an emission with `captureEligible: true`, (b) a user action (`LOG THIS SPOT`, `LOG BEARING`, `LOG TRAIL MARK`, `LOG THIS` on a voice response, `CAPTURE` on camera/sky). Certainty is computed from `strength × channelReliability × persistenceBonus` and **banded** into `AMBIGUOUS / SUGGESTIVE / COMPELLING`. No numeric value is ever displayed or persisted to the report. |
| **APIs** | `expo-sqlite` (immediate insert), `expo-haptics`. |
| **Stored data** | `evidence` row: `{id, session_id, type, certaintyBand, channel, maskLevel, at_ms, tool, wordId?, media_id?, bearing8?, bandAtLog?, verdict, archetypeTag, signatureWeight}`. Committed **at find time** (a dead phone must not lose the souvenir). |
| **Edge cases** | Two captures in < 1.5 s → coalesced into one with `×2`. Capture while the app is backgrounding → still committed (the insert is synchronous-ish and the checkpoint flushes). Capture with no candidate (user taps `LOG` with nothing active) → an honest `dry log`: a card reading `NOTHING LOGGED` with the line *"You marked a spot with no reading. That is also a record."* and it commits as a `null_reading` evidence type that **counts toward the report's negative space** (§F.9). |
| **§38 verdict** | Q1 **strong pass** (this card is the moment the app becomes a case file) · Q2 pass (the archive) · Q3 pass (each card is individually shareable). |

---

### F-15 · Encounters

| | |
|---|---|
| **Purpose** | The memory. Brief, ambiguous, peripheral, rare, and always accompanied by an artefact. |
| **UI** | Never a full-screen pop-up. Delivery is by **sensory channel** (per the archetype): `visual` (sprite in Camera or a movement in the field), `audio` (a sting + a line of found text, or a voice fragment), `haptic` (a distinctive escalating pattern), `glitch` (a 120 ms frame distortion + chromatic edge + scan tear, once, never repeated twice in a session). Post-encounter, a 3 s **aftermath line** sits alone on the rail: e.g. `It said something.` / `Movement. NE.` / `The record changed.` |
| **Interactions** | Optional: `LOG IT` appears on the aftermath line for 8 s (a fade-out affordance). Framing it in the Camera is the "catch". Missing it is a legitimate, common, *designed* outcome. |
| **Internal logic** | Resolved by `archetype.selectEncounter(ctx, rng)` only when: phase is `ENCOUNTER_WINDOW`, `tension ≥ threshold`, `encounterBudgetRemaining > 0`, cooldown expired, and the First-Run Directive permits. Every encounter produces at least one **artefact** — a word, a sprite frame, a bearing, a glitch recording — because an encounter with nothing to show is a rumour and a rumour cannot be shared. |
| **APIs** | `expo-camera` (visual), `expo-audio` (audio), `expo-haptics` (haptic + glitch), Reanimated (glitch frame). |
| **Stored data** | `encounters` row: `{id, session_id, definition_id, archetype, channel, strengthBand, at_ms, artefactId?, framed: bool, aftermathLineId}`. |
| **Edge cases** | Encounter fires while the user is in a modal/sheet → deferred to the next tick, never rendered under a sheet. Encounter fires with the app backgrounded → **suppressed entirely** (no undelivered encounters; the budget is not consumed). Encounter fires while the Camera is pushed but not yet rendering → it downgrades to the audio channel and the report notes `not framed`. Two encounter definitions resolve the same tick → the higher-priority one wins and the other is returned to the pool for the next window. |
| **§38 verdict** | Q1 **strong pass** · **Q2 strong pass** (encounters are what the user describes to others) · **Q3 strong pass** (the primary share moment). |

---

### F-16 · Triage / deduction layer

| | |
|---|---|
| **Purpose** | Make the report feel **earned**. The user rates evidence, the app removes false positives, and a **signature** emerges. It is the only place the user *concludes* something. |
| **UI** | A `Triage` sheet (large detent), one evidence item per card, a 2 px progress hairline at the top (`3 of 7`), and three full-width verdict buttons at the bottom: `Unexplained` (trace) / `Inconclusive` (neutral) / `Explained` (dim, with a 40 px `strike` glyph). Card content: type label, time, channel, the artefact (playable word, viewable frame, boring data row), and — for `Explained` — a **reason picker** (`A car`, `The building`, `My own movement`, `Equipment`, `Something else`). |
| **Interactions** | One verdict per item, swipe-left to skip, `Back` to revise. On each verdict the signature strip in the header **re-renders live** — glyphs illuminate or go dark. A `Close` at the end returns to the report with the seal re-rendered. |
| **Internal logic** | Each evidence item carries `signatureWeight` and `falsePositiveWeight`. `Explained` items are removed from the signature entirely and **increase** `explainedRatio`, which is a *positive* signal for `EXPLAINED` status and a badge (`Nothing but the wind` — awarded for sealing a case with ≥ 5 items all explained). Triaging everything `Unexplained` does **not** raise the status: status is computed from evidence diversity, encounter presence, and signature convergence, never from user optimism. This asymmetry is deliberate — the user cannot brute-force a better ending, so their verdicts are honest. |
| **APIs** | `expo-sqlite`, `expo-haptics` (`select()` per verdict, `confirm` on close). |
| **Stored data** | `evidence.verdict`, `evidence.verdictReason`; `case_reports.explained_ratio`, `case_reports.signature_json`. |
| **Edge cases** | 0 evidence → triage is not offered (button hidden). 1 evidence → offered, fine. User closes mid-triage → verdicts so far are persisted; the report's status is provisional until the case is sealed. Skipped items stay `unreviewed` and count toward `INCONCLUSIVE` weighting. Re-triaging a sealed case → allowed, and it re-renders the report with a `REVISED` stamp and a new `revision` row (the archive is append-only in spirit, revisioned in fact). |
| **§38 verdict** | Q1 **strong pass** (concluding is investigation) · Q2 **strong pass** (an untriaged case is an unfinished file) · Q3 pass (a signature strip is shareable). |

---

### F-17 · Case Report — **HERO SCREEN**

| | |
|---|---|
| **Purpose** | The deliverable, the receipt, and the growth engine. If this screen is not beautiful, the product does not work. |
| **UI** | A document, not a dashboard. Single column, `s5` inset, max 560 px, background `void` with a subtle `paper` texture at 3%. Order: (1) `CASE NT-017` mono + date; (2) **STATUS SEAL** — the case name in `title1` and, above it, the qualitative status in `display` (44/48) with a stamped ring, `UNEXPLAINED` in `trace` / `INCONCLUSIVE` in `inkDim` / `EXPLAINED` in `amber`; (3) a 4-cell stat row (`DURATION 18:42`, `EVIDENCE 07`, `ENCOUNTERS 01`, `SOURCES 04`) — *counts only, no percentages*; (4) **SIGNATURE STRIP** (7–9 glyph slots, illuminated per convergent evidence, with `PARTIAL MATCH · UNIDENTIFIED` beneath); (5) **ACCOUNT** — 3–6 auto-written lines of plain prose; (6) **SOUVENIRS** — a horizontal reel of evidence cards, each playable/viewable; (7) **LEDGER** — the triage ledger with per-item verdict chips; (8) **NEGATIVE SPACE** — a bordered panel listing what did **not** happen (see §F.9); (9) `INVESTIGATOR NOTE` (editable); (10) footer: conditions (3 mono lines), case ref, content version, and the entertainment notice in `caption`. Primary action: `SEAL & FILE` (hold 600 ms) or `SEALED` state. Secondary: `Share card`. |
| **Interactions** | Everything is scrollable and shareable via long-press on any block (`Share this block`). The seal animates on entry: ring scales 0.9→1.0 with a 4° rotation over 220 ms, `impactAsync(Heavy)` then `notificationAsync(Success)` 120 ms later. `SEAL & FILE` is hold-to-confirm. |
| **Internal logic** | `CaseReportService.build()` is pure given `(session, evidence[], encounters[], rng.report)`. Status rule: `UNEXPLAINED` if `signatureConvergence ≥ 0.6 && encounters ≥ 1 && explainedRatio < 0.34`; `EXPLAINED` if `explainedRatio ≥ 0.6`; else `INCONCLUSIVE`. **Encounter presence is required for `UNEXPLAINED`** — the app never declares an unexplained case on weak evidence alone, both for honesty and because it makes `UNEXPLAINED` genuinely scarce and therefore meaningful. |
| **APIs** | `expo-sqlite`, `react-native-view-shot` (for a whole-report export), `expo-haptics`, Reanimated. |
| **Stored data** | `case_reports` row (full serialised report + `signature_json`), `report_revisions`, `discoveries` upsert, `badge_awards` upsert, `user_progress` update. |
| **Edge cases** | 0 evidence, 0 encounters (a real outcome) → the report is **still generated**, shorter, with `INCONCLUSIVE` and a prominent NEGATIVE SPACE panel; the copy above the fold reads *"Nothing was recorded tonight. That is a result."* Session ended by app kill → on next launch, a `RECOVERED CASE` banner appears on Home (`NT-017 ended unexpectedly. Seal it?`) and the report builds from the checkpoint. Session under 60 s → no report; the case is discarded with a one-line notice (a 40-second session has no arc, and issuing a report for it would cheapen every other report). |
| **§38 verdict** | Q1 **strong pass** (it is the case file) · Q2 **strong pass** (unsealed cases are the return hook) · Q3 **strong pass** (it is the growth engine). |

---

### F-18 · Share card

| | |
|---|---|
| **Purpose** | Convert a case into an image that carries the story. No watermark, no URL, no app-store begging. |
| **UI** | `/case/[id]/share`, `void` scrim, the card centered at 78% width with a 380 ms entry spring. Variant selector: `Story 9:16` / `Feed 4:5`, cross-fading the card in 180 ms. Card composition (top→bottom): case ref (`mono`, `inkFaint`) → silhouette plate or the strongest artefact (word / frame / trace) → **status word** in `display` with the stamped ring → 3-cell stat row (counts only) → the **field note** line (seeded or user-written) → footer `NIGHTTRACE` wordmark + local date + the entertainment line in `caption` at 60% — *"An investigation experience. Not a measurement."* Bottom bar: `Share` (primary) · `Save` (secondary) · `Edit note` (tertiary). |
| **Interactions** | `Share` → `captureRef` → PNG → `Sharing.shareAsync(uri, {UTI, mimeType:'image/png', dialogTitle:'NightTrace case NT-017'})`. `Save` → `expo-media-library` `Asset.create(fileUri, album)`; if permission denied, fall back to `Share` with a one-line notice. `Edit note` opens the note sheet (4 seeded options + `Write your own`). |
| **Internal logic** | `rng.report` picks the seeded note candidate so the same case always renders the same card (a re-share must not change the artefact). The card renders **from a live React view tree** — the same components as the report blocks — so the card is always in sync with the design. |
| **APIs** | `react-native-view-shot` `captureRef`, `expo-sharing`, `expo-media-library`, `expo-file-system` (cache path). |
| **Stored data** | `case_reports.share_note`, `case_reports.share_count`, `case_reports.last_shared_at`. Analytics: `report_shared{channel, variant, status}`. |
| **Edge cases** | Share sheet dismissed → `report_shared{dismissed:true}`, no nag. Media-library denied → `Save` hides itself and `Share` becomes the only path. Card with no artefact (a nothing-case) → renders a `NEGATIVE SPACE` card variant: the status word, `Nothing recorded`, the conditions lines, and the field note *"Some nights are for listening."* — **the nothing-case share card is deliberately one of the best-looking cards in the app**, because absence must be shareable or the whole law collapses. |
| **§38 verdict** | Q1 pass · Q2 pass (sharing recruits) · **Q3 strong pass — this feature exists for Q3.** |

---

### F-19 · Field Journal

| | |
|---|---|
| **Purpose** | The archive, the return hook, and the home of the collection loop. Private by default, always. |
| **UI** | Four segments in a sticky header (`Overview · Phenomena · Evidence · Cases`, `s4` inset, 2 px underline indicator): **Overview** — a 4-stat header, a 30-day activity strip (single-row calendar of hairlines), and the `SIGNATURE ARCHIVE` (a 4×2 grid of slots; filled = a matched signature, `?` = an unmatched signature you have *seen but not identified*, empty = never seen); **Phenomena** — cards per creature with encounter count, evidence count, and a `BEHAVIOUR` line (e.g. `Approaches. Avoids light.`); **Evidence** — newest / rarest / strongest tabs, a virtualised timeline with filter chips; **Cases** — a virtualised case list, each row `NT-017 · GHOST · UNEXPLAINED · 11:42 PM`. |
| **Interactions** | Every card pushes to detail. Long-press any entry → `Share this`. `?` slots tap → a sheet: `A signature you have recorded but not identified. It will match, or it will not.` No path to the App Store. |
| **Internal logic** | All read-mostly. `getEachAsync` streaming for the timeline (`02-*` §G.4). The `?` slot is the key mechanic: a **partial** signature (convergence 0.3–0.6) is stored as unmatched, which is both honest and the strongest possible content-drop hook — a future creature can *complete* an existing `?` slot. |
| **APIs** | `expo-sqlite`, `@shopify/flash-list`, `expo-haptics`. |
| **Stored data** | Reads everything user-side. Writes nothing. |
| **Edge cases** | Fresh install → each segment has a real empty state with one action (§K.14). 500+ cases → FlashList virtualisation; the 30-day strip is a fixed-width sparkline, never a scroll container. Case deleted → evidence unlinks to `orphaned` and still renders with a `NO CASE` chip (deleting a case must not silently erase the user's history of having found something). |
| **§38 verdict** | Q1 pass · **Q2 strong pass** (`?` slots, locked silhouettes, unsealed cases) · Q3 pass. |

---

### F-20 · Progression: Investigator Clearance

| | |
|---|---|
| **Purpose** | Reward repeated use **diegetically**. Replaces XP (§A.2.2). |
| **UI** | A clearance chip in the Home header and Profile (`FIELD ASSISTANT` → `FIELD ASSISTANT II` → `CASE OFFICER` → `SENIOR CASE OFFICER` → `ARCHIVIST`). Advancement is shown as a **stamped endorsement** animation on the report's seal (a second ring impression with `impactAsync(Heavy)`), never as a progress bar. |
| **Interactions** | Purely passive; the only interaction is tapping the chip for a sheet listing the 5 ranks and what advances each. |
| **Internal logic** | Advance on `casesSealed` and `distinctPhenomenaDocumented` and `signaturesMatched` — never on time or event count (which would reward grinding the engine, i.e. incentivise the anti-metric). Ranks gate nothing that affects play; they gate **case-file themes** and journal art (§N). |
| **APIs** | `expo-sqlite`. |
| **Stored data** | `user_progress{clearanceRank, casesSealed, phenomenaDocumented, signaturesMatched, streakDays}`. |
| **Edge cases** | All ranks reached → the chip reads `ARCHIVIST` and the sheet shows the next content drop's requirement (a date, not a number). Streak broken → no penalty, no notification, no "you lost your streak" screen. Streaks are displayed only, never enforced, because an enforced streak is a dark pattern in a product whose core value is voluntary wonder. |
| **§38 verdict** | Q1 pass (diegetic rank) · Q2 pass · Q3 pass (rank appears on the share card). |

---

### F-21 · Power management & Low-power mode

| | |
|---|---|
| **Purpose** | Make a 45-minute vigil survivable on a phone, without ever letting the OS decide when the session ends. |
| **UI** | A small battery glyph chip in the status rail (right of elapsed). It is a *band* glyph (4 bars), never a percentage. Tapping opens the low-power sheet: `Dim the screen`, `Slower sensors`, `Skip keep-awake`, and an estimate in bands (`about 40 min left`). |
| **Interactions** | Toggle any of the three; each takes effect at the next tick with a 240 ms fade of the screen brightness via `expo-brightness`. Exiting low-power restores the captured original brightness. |
| **Internal logic** | Duty-cycle ladder (`02-*` §G.5): sensors run at `eco 2 Hz` in low-power, `ambient 6 Hz` normally, `focus 15 Hz` while a tool is armed. The battery chip's band derives from `expo-battery` if available, else from a session-length heuristic. Camera is the budget-eater: in low-power, the camera surface auto-closes after 90 s of no capture and the tool returns to the shell. |
| **APIs** | `expo-brightness`, `expo-battery` (optional), `expo-keep-awake` (hook skipped in low-power). |
| **Stored data** | `settings.lowPower`, `settings.dimLevel`. |
| **Edge cases** | Low-power toggled mid-encounter-window → the window is not cancelled, but its timing stretches 1.15×. OS Low Power Mode active → the app mirrors it automatically (detected via `expo-battery` state or a battery-level threshold) and says so once: `Battery saver is on — sensors are running slower.` Battery < 5% → the app offers `Seal now and keep your case` (which produces a full report from the checkpoint) rather than letting the phone die mid-session. This single behaviour prevents the worst possible outcome: losing a case. |
| **§38 verdict** | Q1 neutral · Q2 pass (a case that can survive a 45-minute vigil is a case worth coming back to) · Q3 neutral. **Kept on Q2 and on pure retention grounds.** |

---

### F-22 · Just-in-time permissions & graceful fallbacks

| | |
|---|---|
| **Purpose** | Ship a product that is fully playable with zero permissions, and never nags. |
| **UI** | The **permissions sheet** (medium detent) is only ever opened from a *tool that needs the sensor*: a one-line title (`The Radar wants motion data.`), a 2-line body, an optional fallback chip telling the user exactly what will happen if they say no (`Without it, bearings will be relative.`), and two buttons: `Allow` / `Continue without`. A permanent `Open Settings` link appears only after a denial with `canAskAgain === false`. |
| **Interactions** | `Allow` → the real OS prompt fires from a user gesture (required on iOS). `Continue without` → dismisses and the hunt proceeds on the fallback path. No second prompt in the same session. |
| **Internal logic** | `PermissionService` (per `02-*` §G.5) with a full `SensorAvailability` union. The brief's gear-up rows show `unavailable` states honestly. **Nothing at launch.** A mic-only Ghost hunt is a fully supported, first-class configuration. |
| **APIs** | `expo-camera` `useCameraPermissions`, `expo-location` foreground permission (+ iOS reduced-accuracy handling), `expo-audio` `AudioModule.requestRecordingPermissionsAsync`, `expo-sensors` motion permission via the `motionPermission` config plugin, `Linking.openSettings()`. |
| **Stored data** | Denial acknowledgements in `kv-store` so the sheet is not re-offered. |
| **Edge cases** | Denied with `canAskAgain: false` → the sheet swaps `Allow` for `Open Settings`. Revoked mid-session (iOS Settings change) → the channel reports `permission_denied` at the next tick, the tool falls back live, and a single rail line appears: `Microphone is off.` No crash, no modal. Reduced location accuracy (iOS 14+) → treated as a distinct, first-class state with its own copy (`APPROXIMATE`). |
| **§38 verdict** | Q1 pass (a nag is the opposite of immersion) · Q2 pass (friction kills return visits) · Q3 neutral. |

---

### F-23 · Intensity system

| | |
|---|---|
| **Purpose** | Reconcile "earned dread" with "scare me safely on my own terms" (the memlog's own open question). |
| **Levels** | `Ambient` · `Present` (default) · `Intense` · `Ritual`. Four, not a slider — a continuous slider implies a precision the engine does not offer, and a deterministic 4-step is honest. |
| **UI** | Set at onboarding, editable in Profile and in the Intensity sheet. Each level: a name (`title3`), a one-line description, and a **three-chip expectation row** (`Signals: sparse/normal/frequent`, `Encounters: possible/likely/rare-by-design`, `Content: none/restrained/intense`). Never a numeric multiplier. |
| **Interactions** | Single select, `select()` per detent. A footer line on every level: *"Higher intensity means more signals. It never means a guaranteed encounter."* |
| **Internal logic** | The level scales exactly four coefficients and nothing else: `emissionRateMultiplier` (0.7 / 1.0 / 1.35 / 1.6), `encounterBudget` (0 / 1 / 2 / 2), `contentCeiling` (which encounter definitions are eligible: `Ritual` unlocks the `intense` tag), and `stingGain`. It **never** scales the silence floor distribution below the mandated minimum (§F.5) — intensity cannot make the app *predictable*. |
| **APIs** | `expo-sqlite/kv-store`, `expo-haptics`. |
| **Stored data** | `settings.intensity` + `sessions.intensity_at_start` (so a report can be honest about what kind of night it was — the report shows `INTENSITY: PRESENT`). |
| **Edge cases** | Locked during a case (§C.6). `Ambient` with a Stalker archetype → the archetype still closes on the user, but with no haptics escalation and no glitch channel, so the hunt reads as "uneasy" not "threatening" — the coefficient set is still coherent. Content ceiling changed between sessions → previously unlocked intense encounters are not retro-invalidated. |
| **§38 verdict** | Q1 pass (dread on your own terms *is* the fiction of the field kit — a real investigator chooses their equipment) · Q2 pass · Q3 neutral. |

---

### F-24 · Sensory director (audio + haptics)

| | |
|---|---|
| **Purpose** | The product's nervous system. Silence, ambience, and haptics are how tension is transmitted without a UI. |
| **UI** | None. Two surfaces: an `Ambience` toggle in the brief and Profile, and a `Haptics` toggle in onboarding + Profile. |
| **Interactions** | Toggles only. |
| **Internal logic** | `AudioBus` with three layers: **bed** (looping ambience, or `{silence}` as a first-class choice), **sting** (encounter only, never continuous music), **voice** (word-bank fragments). The bed's gain and filter cutoff track tension: as tension rises, the bed's upper band is progressively low-passed away, so the world gets *duller and quieter* before an encounter rather than louder. Music is used **only** as an encounter sting (per the memlog's own prohibition on constant horror score). Haptics: `HapticDirector` maps emissions to the pattern table (§K.22) and **rate-limits to one haptic per 800 ms** so vibration never becomes wallpaper. |
| **APIs** | `expo-audio` (`useAudioPlayer`, `createAudioPlayer`, `setAudioModeAsync({playsInSilentMode, allowsRecording, interruptionMode})`), `expo-haptics` (`performAndroidHapticsAsync` on Android per `02-*` §G.0). |
| **Stored data** | Nothing. |
| **Edge cases** | iOS silent switch → `playsInSilentMode: false` means no ambience; the app detects nothing and instead the brief's `Room tone` row warns: `Your phone is on silent. Ambience will not play.` Haptics unavailable (iOS disables them while the camera is active, in Low Power Mode, or via the system setting) → `HapticsService.setCameraActive()` + a no-op path; the presentation layer must therefore never make a haptic the *only* signal for anything. Audio interruption (call) → the bed suspends and resumes with a 600 ms fade; the session pauses as in F-06. Reduce-motion → the glitch channel is disabled and its encounters re-route to audio. |
| **§38 verdict** | Q1 **strong pass** (the pocket Geiger haptic is the product's signature sensation) · Q2 pass · Q3 pass (a latterly-perceived moment is a story even unshared). |

---

## §F. Investigation Engine specification

The engine is **pure TypeScript**, imports nothing from React/RN/Expo (`02-*` §G.2), never reads a clock, never calls `Math.random`, and never touches a store or a repository. It receives a `TickInput` and returns `(nextState, emissions, rngState)`. Everything below is deterministic given `(seed, contentVersion, tickLog)`.

### F.0 The engine's contract in one line

> **The engine's job is to decide how long to say nothing, and then to make the first thing it says feel inevitable and unprovable.**

Everything else is bookkeeping.

### F.1 Session state machine

```
        ┌──────────┐
        │  BRIEF   │  (not an engine state; the UI's gear-up)
        └────┬─────┘
             │ enterField()
             ▼
   ┌──────────────────┐
   │ 1. QUIET         │  no signals except AMBIENT ticks. floor 45 s, median ~150 s
   └────────┬─────────┘
            │ quietSatisfied && attunement ≥ θ1
            ▼
   ┌──────────────────┐
   │ 2. SIGNALS       │  low-family events, sporadic. ~25% of session time
   └────────┬─────────┘
            │ attunement ≥ θ2 || evidence ≥ 2
            ▼
   ┌──────────────────┐
   │ 3. ACTIVITY      │  mid-family, evidence-frequent, radar productive
   └────────┬─────────┘
            │ tensionWindow() == true
            ▼
   ┌──────────────────┐
   │ 4. ENCOUNTER     │  a bounded window (60–180 s). may open and close with nothing
   │    WINDOW        │
   └────────┬─────────┘
            │ windowClosed || encounterDelivered
            ▼
   ┌──────────────────┐
   │ 5. RESOLUTION    │  tension decays, no new signals, close-prompt appears
   └────────┬─────────┘
            │ seal() | autoClose | leaveField()
            ▼
      ┌───────────┐
      │  ENDED    │  → report
      └───────────┘
```

**Transition rules (all deterministic, all in `TensionEngine.ts` + `EventScheduler.ts`):**

| Transition | Condition | Notes |
|---|---|---|
| QUIET → SIGNALS | `elapsed ≥ quietFloor(hunt)` **and** `attunement ≥ θ1` | `quietFloor` is hunt-typed: 45 s indoor, 90 s outdoor (outdoor needs time to walk). |
| SIGNALS → ACTIVITY | `attunement ≥ θ2` **or** `evidenceCount ≥ 2` | Attunement rises on movement, tool use, questions asked. **This is the anti-"do nothing" valve**: an engaged user reaches ACTIVITY faster, a passive user does not. |
| ACTIVITY → ENCOUNTER_WINDOW | `tension ≥ windowThreshold` for `N` consecutive ticks (N = 4) | Hysteresis. A single spike cannot open a window. |
| ENCOUNTER_WINDOW → RESOLUTION | window lifetime elapsed (60–180 s, drawn) **or** encounter delivered | A window **may close with nothing in it**. That is a designed outcome and is recorded as `WINDOW_CLOSED_EMPTY`. |
| ACTIVITY/RESOLUTION → ACTIVITY | **allowed once**: a second `ACTIVITY → WINDOW` cycle may occur if `duration > 20 min` and `budgetRemaining > 0` | Max 2 windows per session. A third would make encounters feel routine. |
| any → ENDED | `autoClose` timer, user `seal()`, or user leaves | Never a third-party kill. |

**Never reached:** an encounter cannot occur in QUIET or SIGNALS **unless** the First-Run Directive is active (§F.10) — with the one exception of `Mimic`'s late answer to a question asked in QUIET (a 90-second tail is in-fiction and does not require a window).

### F.2 Tick loop (pseudocode)

```ts
// engine/InvestigationEngine.ts
const TICK_MS = 1000 / 6; // 6 Hz

function tick(input: TickInput): TickResult {
  const { tickIndex, elapsedMs, digest, userActions, sourceIntents } = input;
  const s0 = state;
  const rng = rngFor(tickIndex);              // substream-independent, replay-exact

  // ── 1. ACCUMULATE ─────────────────────────────────────────────
  let acc = {
    ...s0.accum,
    motion:      ema(s0.accum.motion,      digest.motionIntensity, 0.15),
    emf:         ema(s0.accum.emf,          digest.emfBand.score,   0.10),
    audio:       ema(s0.accum.audio,        digest.audioRmsBand,    0.12),
    light:       ema(s0.accum.light,        digest.lightBand,       0.05),
    stillnessMs: digest.motionIntensity < 0.08 ? s0.accum.stillnessMs + TICK_MS : 0,
    toolUseMs:   digest.activeTool !== null   ? s0.accum.toolUseMs + TICK_MS : s0.accum.toolUseMs,
    edgeMs:      digest.movedMetres > 1.0     ? s0.accum.edgeMs + TICK_MS : s0.accum.edgeMs,
  };

  // ── 2. ATTUNEMENT (the "your behaviour matters" scalar, hidden) ──
  // Rises with engaged behaviour; decays when the user is passive.
  const attunement = clamp01(
      s0.attunement
    + 0.0009 * (acc.toolUseMs / 60_000)          // using instruments
    + 0.0022 * digest.movedMetres                // moving through the place
    + 0.0060 * (userActions.some(isAsk) ? 1 : 0) // asking the dark
    + 0.0035 * (userActions.some(isLog) ? 1 : 0) // logging anything
    - 0.0040 * (acc.stillnessMs > 90_000 ? 1 : 0)
    - 0.00004                                     // slow universal decay
  );

  // ── 3. JUICE (the "the room is doing something" scalar, hidden) ──
  // Fed by sensor noise AND by the archetype. Sensor noise is CONTENT, not error.
  const juice = clamp01(
      0.55 * acc.emf
    + 0.25 * acc.audio
    + 0.20 * acc.motion
    + archetype.juiceBias(ctx)                    // e.g. Stalker bias rises with proximity
  );

  // ── 4. TENSION (invisible, 0..100) ──────────────────────────────
  const tension = tensionEngine.step({
    prev: s0.tension,
    phase: s0.phase,
    attunement, juice,
    evidenceCount: s0.evidenceCount,
    encounterBudgetRemaining: s0.encounterBudget,
    elapsedMs,
    rng: rng.fork('tension'),
  });

  // ── 5. PHASE (may transition at most once per tick) ─────────────
  const phase = tensionEngine.nextPhase(s0, { tension, attunement, evidenceCount: s0.evidenceCount });

  // ── 6. COOLDOWNS ────────────────────────────────────────────────
  const cooldowns = tickCooldowns(s0.cooldowns, tickIndex);

  // ── 7. EVENT DECISION — silence-first ───────────────────────────
  // The default answer is "nothing". We only ask the question when the
  // scheduler's own gate says a question is even legal this tick.
  const emissions: EngineEmission[] = [];

  if (phase !== s0.phase) {
    emissions.push({ kind: 'phase', phase });
    metrics.record('phase_transition', { from: s0.phase, to: phase, atMs: elapsedMs });
  }

  const gate = scheduler.gate({                        // cheap, pure, no RNG
    phase, cooldowns, elapsedMs,
    sinceLastSignalMs: elapsedMs - s0.lastSignalAtMs,
    sessionBudgetUsed: s0.sessionBudgetUsed,
    intensity: s0.intensity,
    silenceFloorMs: scheduler.silenceFloor(s0, elapsedMs),
  });

  if (gate.allow) {
    // 7a. THE SILENCE DRAW. Always performed when the gate opens; it decides
    //     not the event, but whether we are even permitted to consider one.
    const quiet = rng.fork('events').exponent(scheduler.quietMean(s0));
    gate.earliestFireAtMs = elapsedMs + Math.max(silenceFloorMs, quiet * 1000);
  }

  if (gate.allow && elapsedMs >= gate.earliestFireAtMs) {
    const chosen = archetype.selectEvent(ctx, rng.fork('events'));   // → EventDefinitionId | null
    if (chosen !== null) {
      const resolved = resolveEvent(chosen, ctx, rng);
      emissions.push({ kind: 'event', event: resolved });
      cooldowns.set(resolved.definitionId, tickIndex + resolved.cooldownTicks);
      cooldowns.set('__family__' + resolved.family, tickIndex + familyCooldown(resolved.family));
      s0.lastSignalAtMs = elapsedMs;
      s0.sessionBudgetUsed += resolved.cost;
      s0.eventHistory.push({ definitionId: resolved.definitionId, atTick: tickIndex });

      if (resolved.captureEligible) {
        emissions.push({ kind: 'evidence', intent: toEvidenceIntent(resolved) });
      }
    } else {
      // Explicit "we looked and chose nothing". Costs nothing. Is recorded.
      metrics.record('null_draw', { phase, atMs: elapsedMs });
    }
  }

  // ── 8. AMBIENT TICKS (system-alive, never evidence, never an event) ──
  if (scheduler.ambientDue(s0, tickIndex)) {
    emissions.push({ kind: 'radar', command: { kind: 'ambient_tick', strength: 0.15 } });
  }

  // ── 9. ENCOUNTER RESOLUTION (window only) ───────────────────────
  if (phase === 'ENCOUNTER_WINDOW' && s0.encounterBudget > 0 && !s0.encounterFiredThisWindow) {
    const encId = archetype.selectEncounter(ctx, rng.fork('encounters'));
    if (encId !== null) {
      const resolved = resolveEncounter(encId, ctx, rng);
      emissions.push({ kind: 'encounter', encounter: resolved });
      s0.encounterBudget -= 1;
      s0.encounterFiredThisWindow = true;
      metrics.record('encounter_triggered', { id: encId, atMs: elapsedMs, phase });
    }
  }

  // ── 10. ARCHETYPE EFFECTS (radar bodies, proximity, mimic tails) ──
  emissions.push(...archetype.onTick(ctx, rng.fork('radar')).map(toEmission));

  // ── 11. FAILURE EVALUATION ──────────────────────────────────────
  const fail = archetype.evaluateFail(ctx);
  if (fail !== null && !s0.failStates.has(fail)) {
    s0.failStates.add(fail);
    emissions.push({ kind: 'notice', notice: { kind: 'fail_state', failState: fail } });
  }

  // ── 12. DIRECTIVES (nudges, never targets — see E6.5) ────────────
  const directive = directivePool.maybeOffer(s0, ctx, rng.fork('events'));
  if (directive) emissions.push({ kind: 'notice', notice: { kind: 'directive', directive } });

  return { state: next(s0, { acc, attunement, juice, tension, phase, cooldowns }), emissions, rng: rng.snapshot() };
}
```

**Three properties this loop guarantees and that tests must assert:**

1. **No two consecutive ticks can both emit an event**, because `gate.allow` recomputes `earliestFireAtMs` after every event and `silenceFloorMs > TICK_MS` always.
2. **The engine can emit nothing for arbitrarily long.** There is no "nothing has happened, force something" path anywhere in the code. It does not exist. Its absence is the feature.
3. **Draw order is fixed** and every subsystem uses a named `fork()`, so adding a new subsystem cannot change the timing of an old one (this is what makes replay-exact tests possible).

### F.3 The hidden scalars

Four scalars drive everything. **None of them is ever shown.** They are exposed to the presenter only as *derived, qualitative* signals (audio filter cutoff, haptic rate, breathing-dot period).

#### F.3.1 Attunement (0..1) — "the place is responding to your attention"

Rises with **engaged behaviour**, decays with idleness. It is the engine's way of rewarding the *verb* (investigate) rather than the *outcome* (find). It is the reason a user who sweeps a room slowly gets a better night than one who stands still — and the reason that is not a placebo.

| Input | Δ per tick (6 Hz) |
|---|---|
| A tool is open | +0.0009 |
| Movement (`movedMetres`) | +0.0022 / m |
| `ASK A QUESTION` action | +0.0060 (one-shot) |
| Any `LOG` action | +0.0035 (one-shot) |
| Stillness > 90 s | −0.0040 |
| Baseline decay | −0.00004 |

At a brisk walking pace (~1.2 m/tick) attunement reaches θ2 (0.35) in roughly 110 s — which is why a walking Bigfoot hunt opens up faster than a stationary attic vigil, exactly as the fiction demands.

#### F.3.2 Juice (0..1) — "the room's raw noise, treated as content"

`juice = 0.55·emf + 0.25·audio + 0.20·motion + archetype.juiceBias`. A noisy old building has high juice; a modern apartment has low juice. Juice **widens the event family distribution** (a juicy room may surface a `camera_glitch` early and an `emf_spike` late) but does **not** raise total event count — total count is gated by the silence machinery. This is the key design move: **sensor noise changes the flavour of the night, never the quantity of the night.**

#### F.3.3 Temperament (per-session, 4 fields, drawn once)

Drawn once at session creation from `rng.session` and **never revealed, never persisted to the report**:

```ts
interface Temperament {
  patience: number;    // 0.6..1.6  scales quietMean (how long this session likes silence)
  shyness:  number;    // 0.5..1.5  scales the evidence-emission gate (how generous)
  late:     number;    // 0.0..1.0  shifts the tension curve later (a slow-burn night)
  glitchy:  number;    // 0.0..1.0  bias toward the screen-glitch channel
}
```

Temperament is why two consecutive sessions in the same room feel different even though the seed differs only by a few seconds. It is the **cheapest and most important anti-predictability device in the product**, because it changes behaviour *between* sessions without changing a single constant *within* one. A user cannot learn "NightTrace fires an event every 3 minutes" if the session's patience varies 0.6–1.6.

#### F.3.4 Tension (0..100) — the pacing machine

```ts
function step({ prev, phase, attunement, juice, evidenceCount, encounterBudgetRemaining, elapsedMs, rng }): number {
  // (a) structural ramp: the longer you stay, the more the place has to say.
  const ramp = phase === 'QUIET'    ? 0.05
             : phase === 'SIGNALS'  ? 0.14
             : phase === 'ACTIVITY' ? 0.28
             : phase === 'ENCOUNTER_WINDOW' ? 0.0     // windows HOLD, they do not climb
             : -0.55;                                  // RESOLUTION decays

  // (b) behavioural term: attention, juice.
  const behavioural = 0.22 * attunement + 0.18 * juice;

  // (c) evidence term: each souvenir pushes the room further (diminishing).
  const evidenceTerm = 1.6 / (1 + evidenceCount * 0.6);

  // (d) fatigue: after the budget is spent, tension cannot climb back to window level.
  const fatigue = encounterBudgetRemaining === 0 ? -0.30 : 0;

  // (e) late-burn temperament shifts the ramp.
  const late = 1 - ctx.temperament.late * (1 - clamp01(elapsedMs / (25 * 60_000)));

  // (f) micro-jitter: ±0.4/tick, seeded. Prevents a smooth, learnable curve.
  const jitter = rng.gaussian(0, 0.4);

  const delta = (ramp * late + behavioural + evidenceTerm + fatigue) + jitter;
  return clamp(prev + delta, 0, 100);
}

function windowThreshold(ctx) {
  // Depth floor: a first encounter needs a real night behind it.
  const depth = ctx.elapsedMs < 6 * 60_000 ? 78 : 62;
  return depth + ctx.temperament.late * 12;      // a late-burn session needs more
}
```

**Why tension can never be shown.** The user would learn that 62 means "soon". Every visible proxy is therefore deliberately **non-linear and noisy**: the breathing dot's period is `4000ms / (1 + tension/140)` plus ±300 ms jitter, the ambience cutoff is a 6-step band mapping, and the rail never shows the phase's true index — only how many segments have filled.

### F.4 Event weighting — the non-stationary hazard

There is **no fixed probability table**. The engine samples an *interval*, not an outcome.

```ts
// engine/rules/silence.ts

/** The mandated minimum gap. Nothing can fire inside this window. Ever. */
export function silenceFloorMs(s: State, elapsedMs: number): number {
  const base = s.hunt.environment === 'indoor' ? 45_000 : 75_000;   // outdoor hunts breathe slower
  const earlyBonus = elapsedMs < 3 * 60_000 ? 15_000 : 0;           // the opening is the quietest
  const intensityRelief = { ambient: +10_000, present: 0, intense: -5_000, ritual: -10_000 }[s.intensity];
  return Math.max(30_000, base + earlyBonus + intensityRelief);     // hard floor: 30 s
}

/** The mean of the silence distribution. Exponential → a hard floor + a long tail. */
export function quietMean(s: State): number {
  const phaseMean = { QUIET: 150_000, SIGNALS: 105_000, ACTIVITY: 78_000,
                      ENCOUNTER_WINDOW: 60_000, RESOLUTION: 240_000 }[s.phase];
  return (phaseMean / s.intensityRate) * s.temperament.patience;    // patience 0.6..1.6
}
```

Because the draw is `exponent(mean)` (memoryless), the distribution has **a long right tail**: a mean of 150 s still produces a 9-minute silence ~2.5% of the time, and a 45 s gap ~74% of the time. Users experience this as "sometimes it's quiet, sometimes it's *really* quiet" — which is exactly the intended read, and is impossible to learn as a schedule.

**Event family selection** (only after the gate opens and the interval has elapsed):

```ts
function selectFamily(ctx, rng): Family {
  // Weights are computed live from state, never stored as constants.
  const w = {
    AMBIENT: 2.0,                                   // always available; the "system alive" floor
    EM:      ctx.juice * 2.4 + 0.4,                 // electromagnetic flavour
    AUDIO:   ctx.attunement * 1.8 + 0.6,
    MOTION:  ctx.temperament.glitchy * 1.2 + ctx.accum.motion * 1.6,
    VISUAL:  ctx.phase === 'ACTIVITY' ? 1.1 : 0.25, // visual only really opens at ACTIVITY
    GLITCH:  ctx.temperament.glitchy * 1.4 * (ctx.intensity === 'ambient' ? 0 : 1),
  };
  // Hard rule: VISUAL and GLITCH are 0 in QUIET and SIGNALS unless the directive forces it.
  if (ctx.phase === 'QUIET' || ctx.phase === 'SIGNALS') { w.VISUAL = 0; w.GLITCH = 0; }
  return rng.weighted(entries(w));
}
```

**Anti-repeat rules** (`rules/cooldown.ts`):

| Rule | Value | Why |
|---|---|---|
| Same `definitionId` cooldown | 8 min | The single biggest predictability killer is repetition of the *same* sound. |
| Same `family` cooldown | 90 s | Two EMF sprites back to back reads as a broken detector. |
| Same `channel` (haptic/audio/visual/glitch) cooldown | 45 s | Prevents one sensory mode from dominating. |
| Max `VISUAL`-family events per 10 min | 3 | Scarcity is the whole value of a visual. |
| Max total events per session | `round(12 * intensityRate * minutes/20)`, floor 4 | The session budget. A 20-min `Present` session can emit at most 12 events. |
| Max events in `QUIET` | 1 | QUIET is QUIET. |
| Encounter cooldown after any encounter | rest of session + fatigue | See F.1 fatigue. |

### F.5 Silence floors, absence, and the four no-event outcomes

The memlog's law — *silence-crank + no-encounter protection + qualitative readouts are one design law* — is implemented as **four distinct, named, positive outcomes.** Each has copy and a report artefact.

| Outcome | Trigger | In-session copy (rail) | Report line | Why it is good |
|---|---|---|---|---|
| **`QUIET_NIGHT`** | Session ends with 0 events and 0 evidence | `Nothing answered tonight.` | `No signal was recorded. The record is silent.` + the full NEGATIVE SPACE panel | It is the cranked-silence fantasy from the memlog, shipped as a first-class result. |
| **`WINDOW_CLOSED_EMPTY`** | An encounter window opened and closed with no encounter | *(nothing — only the rail's breathing dot slows and returns)* | `Activity was consistent. Nothing resolved.` | The user *felt* the window without being told. This is the single most sophisticated moment in the product. |
| **`FALSE_POSITIVE`** | `INTERFERENCE` sustained >20 s, **or** the user verdicts an item `Explained` | `That was the building.` (only when the user says so) | Counted in `explainedRatio`, which *raises* toward `EXPLAINED` | Teaches the user that the app will concede. This is what earns trust and defeats the skeptic. |
| **`NOT_FRAMED`** | An encounter resolved but the camera was not live | `Movement. You missed it.` | `1 possible visual event, not framed.` | Missing it is the *better* story, and it is the Ambusher archetype's designed fail state. |

**The QUIET guarantee.** No session may be *forced* to produce an encounter — with exactly one exception: the **First-Run Directive** (§F.10), which is bounded, invisible, and only ever applies to case #1. `tests: engine/__tests__/no-forced-events.spec.ts` asserts that 10 000 seeded sessions with the directive disabled produce encounters at the archetype's natural rate and that **no session contains a "rescue" emission**.

### F.6 Session budget & the rarity ladder (gated, not drawn)

Rarity is a **ladder**, climbed by tension, not a lottery:

```ts
function rarityCeiling(ctx: Ctx): Rarity {
  if (ctx.phase === 'QUIET')    return 'common';
  if (ctx.phase === 'SIGNALS')  return ctx.tension > 45 ? 'uncommon' : 'common';
  if (ctx.phase === 'ACTIVITY') return ctx.tension > 72 ? 'rare' : 'uncommon';
  if (ctx.phase === 'ENCOUNTER_WINDOW' || ctx.phase === 'RESOLUTION') return 'rare';
  return 'common';
}
```

| Tier | Eligibility (all must hold) | Session cap | Nominal share |
|---|---|---|---|
| `common` | any phase | unbounded | ~62% of emissions |
| `uncommon` | `tension ≥ 40` | 5 | ~26% |
| `rare` | `tension ≥ 70` **and** `phase ∈ {ACTIVITY, WINDOW}` | 2 | ~10.5% |
| `very_rare` | `tension ≥ 82` **and** ≥ 1 evidence logged **and** ≥ 8 min elapsed | 1 | ~1.4% |
| `legendary` | `session.legendaryFlag === true` (see below) | 1 | ~0.1% |

**The Legendary draw.** `legendaryFlag` is decided **once, at session creation**, by a *single* `rng.session.bool()` at a base rate of **0.5%**, modulated by attunement-independent factors only (so it cannot be farmed):

```ts
const legendaryFlag = rng.fork('session').bool(
  0.005
  + (ctx.progress.casesSealed >= 10 ? 0.003 : 0)   // a long record earns a little luck
  + (ctx.anomalyIsSharedSeedNight ? 0.010 : 0)     // the global night
);
```

If the flag is false, **no legendary definition is even eligible to be selected**, so a legendary can never fire "by accident" from the weighting maths, and no amount of grinding raises the chance within a session. If the flag is true, the legendary still requires the full eligibility gate above (tension ≥ 82, evidence ≥ 1, ≥ 8 min) — so a flagged session that ends at minute 4 produces a *normal* case, and the user never learns they "missed" one. This is the correct treatment of a 0.5% event in a product where predictability is the anti-metric: **rare, unattainable by effort, and never announced as missed.**

### F.7 Anti-predictability rules (the consolidated list)

The enforcement set. Every one of these exists to spend a specific, named predictability leak.

| # | Leak | Rule |
|---|---|---|
| 1 | Fixed intervals | Memoryless exponential draw with a hard floor. No "next event at T+180 s" anywhere. |
| 2 | Learnable per-hunt constants | `temperament` drawn per session; no per-hunt probability constant exists in content. |
| 3 | Same-sound repetition | 8-minute per-definition cooldown. |
| 4 | Rapid happy-hour clustering | 90 s family cooldown, 45 s channel cooldown, rising silence floor with intensity. |
| 5 | Encounter-guaranteed sessions | Encounter requires a window; windows require sustained tension; tension requires time + attention. Only case #1 has a directive. |
| 6 | Grind-rewarding | Nothing rare is reachable by repetition: legendary is one seeded coin at creation; session budget is time-scaled; attunement is *behaviour*-scaled, not count-scaled. |
| 7 | Visible randomness | No `Math.random` in presentation. All visuals are driven by the same seeded streams, so a replay looks identical. |
| 8 | Tension curve learnable from UI | The only visible proxies are non-linear, noisy, and band-mapped; no numeral is shown. |
| 9 | Phase tell | The phase rail shows *filled segments*, never a label; the number of segments (5) does not equal the number of transits (2–4). |
| 10 | The "nothing happened, so something is about to happen" inference | A `null_draw` costs nothing and is recorded — crucially, **a long silence does not raise hazard**. The draw is memoryless, so "it's been quiet for 5 minutes" genuinely does not mean anything is due. This is the most important rule in the file. |

**The anti-metric (from `02-*` §O).** `emission_interval_ms` is tracked as a histogram per session. The instrumentation alert is:

> **If the p50/p90 ratio of `emission_interval_ms` across a cohort drops below 3.0, the engine has become predictable and a pacing change ships.**

A ratio of 3.0 means the 90th-percentile gap is at least three times the median. The exponential draw with `patience ∈ [0.6, 1.6]` targets ~4.2.

### F.8 Archetype runtime — four behaviours, no hardcoded creature

The engine never names a creature. `InvestigationEngine` receives an `ArchetypeRuntime` resolved from content (`02-*` §G.6). Each archetype is a **parameter set plus four hooks**.

```ts
interface ArchetypeDefinition {
  id: 'observer' | 'stalker' | 'mimic' | 'ambusher';
  verb:        string;                 // the user's verb, shown in the Brief: "Avoid being seen"
  failState:   FailStateId;            // unique per archetype — the design law
  pace:        'slow' | 'closing' | 'responsive' | 'sudden';
  channelBias: Channel[];              // primary sensory channel(s)
  eventBias:   Partial<Record<EventDefinitionId, number>>;
  encounterBias: Partial<Record<EncounterDefinitionId, number>>;
  params: {
    noticingRate:      number;   // observer: how fast "being noticed" accrues
    proximityClosure:  number;   // stalker: proximity units/sec at zero user motion
    echoDelayMs:       [number, number]; // mimic: the delay band for the echoed answer
    burstWindowMs:     number;   // ambusher: how long a window stays open
    stillnessPenalty:  number;   // observer: how much standing still costs you
    lightPenalty:      number;   // observer/ambusher: how much torch costs you
  };
}
```

| Archetype | Verb (user-facing) | Unique fail state | Hook behaviour that makes it *feel* different |
|---|---|---|---|
| **Observer** | *Avoid being seen.* | `NOTICED` — you were seen. The session ends early with a distinct report stamp. | `noticingRate` accrues with **torch on**, **camera live**, and **movement**. Standing still is safe. The tension machine is inverted: more activity = more danger. Every emission feels like a *response to you*. |
| **Stalker** | *Stay ahead of it.* | `CORNERED` — proximity reached `HERE`. | `proximityClosure` closes on its own every tick, faster when the user is still. The radar is the *only* tool that matters; the haptic rate is the primary channel. It is the only archetype whose `juiceBias` rises with its own proximity, so the app physically tightens as it closes. |
| **Mimic** | *It will answer you.* | `MISDIRECTED` — you followed your own voice. | Any recorded/asked audio is queued as a `QuestionTicket`; the answer returns in the `echoDelayMs` band (12–90 s), possibly in a *different tool*, with the user's own cadence stretched. The fail state fires when the user's own EVP playback is later logged as contact — the app lets you fool yourself, then shows it in the report. |
| **Ambusher** | *Don't look away.* | `GONE` — it moved and you missed it. | A window opening is announced by nothing; the encounter resolves in `burstWindowMs` (0.4–0.9 s) and **requires the camera to already be live**. Movement is rewarded (it is a chase), stillness is punished (it leaves). Its fail state is the most common in the game and the most *likeable*. |

**The archetype contract in tests:** `archetypes/__tests__/contract.spec.ts` runs a shared conformance suite over all four runtimes — every archetype must (a) emit only definitions in its content table, (b) be capable of a 0-event session, (c) produce a non-null `evaluateFail` under its documented stress conditions, (d) never mutate engine state. New creatures are new parameter sets and must pass the same suite untouched.

### F.9 Failure & negative-space model

Failures are **emissions with copy**, not error states.

| Fail state | Archetype | When | In-session rendering | Report treatment |
|---|---|---|---|---|
| `NOTICED` | Observer | `noticing ≥ 1.0` | The ambience cuts to silence for 1.5 s; a single `encounter` haptic; rail: `It saw you.` | `CASE TERMINATED — SUBJECT AWARE` stamp; full evidence preserved; a badge (`Seen, and stayed`). |
| `CORNERED` | Stalker | `proximity ≥ 0.95` | Haptic rate doubles for 3 s, then stops entirely; rail: `It's here.` | `CASE TERMINATED — PROXIMITY`; a `HERE` band log. |
| `MISDIRECTED` | Mimic | A logged `unknown_voice` is later matched to the user's own EVP playback | No in-session signal at all (this is the crux) | A revision line: `ONE ENTRY RECLASSIFIED — self-sourced.` This is the best report beat in the game. |
| `GONE` | Ambusher | Window closed with the encounter unframed | Rail: `Movement. You missed it.` | `1 POSSIBLE VISUAL EVENT — NOT FRAMED`, with the aftermath line. |
| `INTERFERENCE` | any | Sustained `|z| > 4.0` for 20 s | Chip: `INTERFERENCE`; EMF-sourced events suppressed 30 s | `EQUIPMENT CONDITIONS — MAGNETIC INTERFERENCE DETECTED` (a *true* statement about the room, which is why it is safe). |
| `NOT_ALIGNED` | Alien/Sky | A `ufo_signal` dies unframed | `SIGNAL LOST` | `1 SIGNAL UNRESOLVED — DEVICE NOT ALIGNED`. |

**Negative space** is the report panel that lists absences as facts. It is generated from what *didn't* fire:

```ts
function negativeSpace(session: Session, evidence: Evidence[]): NegativeLine[] {
  const lines: NegativeLine[] = [];
  if (evidence.length === 0)                     lines.push(N('No evidence was recorded.'));
  if (session.emfEverStirred === false)          lines.push(N('The magnetic baseline never left STILL.'));
  if (session.windowsOpened > 0
      && session.encounters.length === 0)        lines.push(N('One activity window opened. Nothing resolved.'));
  if (session.questionsAsked > 0
      && session.questionsAnswered === 0)        lines.push(N('1 question was asked. No answer was recorded.'));
  if (session.bearingsLogged === 0)              lines.push(N('No bearing ever resolved.'));
  if (session.movedMetres < 20)                  lines.push(N('The device did not leave its position.'));
  return lines.slice(0, 4);                       // never more than 4 lines
}
```

> **The negative-space rule.** An absence line is only written when the corresponding system was *actually running*. We never claim "no electromagnetic activity" on a phone with no magnetometer; in that case the line is omitted. **Absence is meaningful only where a measurement was possible** — this is the honesty line that keeps the whole product credible.

### F.10 Directives (nudges) and the First-Run Directive

**The Directives Rule (binding):** a directive is a **verb with no object**. It may never name a target, a direction, or an expected result.

```ts
// engine/directives/SessionDirective.ts
export const DIRECTIVE_POOL = {
  open:    ['Sweep the room slowly.', 'Walk the perimeter.', 'Hold still and listen.',
            'Ask it something.', 'Find the coldest wall.', 'Set the phone down and step back.'],
  mid:     ['Try a different tool.', 'Go back the way you came.', 'Wait.',
            'Ask a shorter question.', 'Start the recorder.', 'Point the camera at the dark corner.'],
  close:   ['Close the case when you\'re ready.', 'One more sweep.', 'Log what you noticed.'],
} as const;
```

| Rule | Value |
|---|---|
| Max directives per session | 6 |
| Minimum spacing | 3 min |
| Never names a target | enforced by a unit test that greps the pool for creature/evidence nouns |
| Never repeats within a session | enforced |
| Tied to state | `open` in QUIET, `mid` in SIGNALS/ACTIVITY, `close` in RESOLUTION |
| Dismissible | swiping the directive card dismisses it for the session; `I need a direction` re-requests one |

**First-Run Directive.** A `SessionDirective` object with one field:

```ts
interface SessionDirective {
  readonly guaranteedEncounterOnFirstRun?: {
    readonly minElapsedMs: number;      // 300_000 — the encounter cannot come earlier
    readonly forceCaptureEligible: boolean; // true — case #1's first evidence is always keepable
    readonly maxUses: 1;
  };
}
```

Applied **only** when `progress.casesSealed === 0`. Effects: (a) the encounter budget is forced to `≥ 1` and the window threshold is `62` regardless of temperament (never below the depth floor), (b) the first evidence emission is guaranteed capture-eligible, (c) `minElapsedMs = 300_000` guarantees the user has had **five real minutes of silence first** — because the free first hunt must reach a real encounter *and* must teach that silence comes first. Both halves are mandatory, and the directive is deleted from the code path the moment `casesSealed ≥ 1`.

> This is the only place in the product where the engine is anything other than honest, and it is bounded to a single case, invisible, and produces a moment the user would have reached anyway on a longer arc.

### F.11 Randomness, seeding and testability

```ts
// engine/RandomEngine.ts — xmur3 hash → sfc32 PRNG, ~40 lines, zero deps
export function seedFromParts(parts: (string|number)[]): Seed {
  return xmur3(parts.map(p => String(p)).join('\u0000')) as Seed;
}
export function createRandomEngine(seed: Seed): RandomEngine { /* sfc32 + fork table */ }

// Forking is the contract that keeps subsystems decoupled:
//   rng.session    — temperament, legendaryFlag, archetype tie-break
//   rng.events     — silence draws, family choice, definition choice, directives
//   rng.radar      — target birth/velocity/uncertainty/death
//   rng.words      — word-bank selection only
//   rng.encounters — encounter selection and ambiguity tags
//   rng.report     — status tie-breaks, seeded note choice, seal variant
```

**Golden-seed tests** (`engine/__tests__/golden/*.spec.ts`): a checked-in list of `{seed, huntId, scriptedActions[]}` → an expected `emission digest`. Any change to the engine that alters the fire timing of an existing seed **fails the build** unless the golden file is consciously regenerated in the same PR. This is how the team knows it has not accidentally made the product predictable.

**Testability guarantees:** the engine takes no `Date.now()` (host supplies `elapsedMs`), no `Math.random()` (lint-enforced), no I/O. A 30-minute session is simulable in under 40 ms, so the pacing matrix (4 archetypes × 4 intensities × 3 durations × 500 seeds = 24 000 sessions) runs in CI in seconds and asserts the distribution table in F.5.

### F.12 Engine tuning targets (the acceptance numbers)

These are the numbers a change must not break. All measured over 500 seeded 20-minute `Present` sessions per archetype.

| Metric | Target | Failure means |
|---|---|---|
| Emissions per 20-min session, p50 | 7–11 | <5 reads as broken; >14 reads as a toy |
| `emission_interval_ms` p50 / p90 ratio | **≥ 3.0** (target 4.2) | Below 3.0 the engine is predictable |
| Longest silence in a session, p50 | 200–260 s | Below 150 s the silence is not a feature |
| Sessions with ≥ 1 silence > 5 min | 22–35% | Below 15% the cranked-silence fantasy never lands |
| Sessions with 0 emissions at 10 min | 12–20% | Below 8% the app never feels truly quiet |
| Encounter rate, non-first-run | 42–58% of sessions | >70% encounters become routine; <30% the app reads as broken |
| Encounter rate, first-run | 100% (directive) | Must be exactly 100% |
| Legendary rate across all sessions | 0.4–0.6% | — |
| `QUIET` phase duration, p50 | 90–180 s | <60 s the ritual has no weight |
| Sessions reaching `ENCOUNTER_WINDOW` | 55–70% | >80% windows become expected |
| Windows opened that close empty | 25–40% | Below 20% the window has no mystery |

---

## §J. First 4 hunt definitions

Each of the four MVP hunts is **one JSON file plus assets**. No engine code names a creature. The deliverable for each: a `HuntDefinition`, a `CreatureDefinition`, an archetype binding, an event table, an encounter table, and an unlock condition. The four are four archetypes, four verbs, four fail states, and four *different games*.

**The comparative matrix first — this is the whole design in one table:**

| | **Ghost** | **Bigfoot** | **Shadow Person** | **Alien / UFO** |
|---|---|---|---|---|
| Archetype | **Mimic** | **Ambusher** | **Observer** | **Stalker** |
| User verb | *Ask it something.* | *Don't look away.* | *Avoid being seen.* | *Stay ahead of it.* |
| Environment | Indoor | Outdoor | Indoor | Outdoor (open sky) |
| Pace | Slow, responsive | Fast, sudden | Slow, tightening | Closing, escalating |
| Primary channel | Audio | Visual | Haptic + glitch | Visual + haptic |
| Tool set | Voice · EMF · EVP · Camera | Tracker · Camera · Radar | Camera · Radar · EMF | Sky · Camera · Radar |
| Unique fail | `MISDIRECTED` | `GONE` | `NOTICED` | `CORNERED` |
| Signature evidence | `unknown_voice` | `footprint` | `shadow` | `sky_object` |
| Senses used | mic + magnetometer | GPS + motion + camera | camera + motion | motion + magnetometer + camera |
| Session length | 10–30 min | 15–40 min | 8–20 min | 12–30 min |
| Share artefact | a word on black | a footprint + trail path | a distortion frame | an az/alt lock |
| Unlock | Default (always) | After 1 sealed case | After 2 sealed cases | After 3 sealed cases |
| Free tier | Unlimited | 2 cases | 1 case | Preview (brief only) |

### J.1 GHOST — the Mimic

```jsonc
// src/data/hunts/ghost.json
{
  "id": "ghost",
  "creatureId": "ghost",
  "title": "GHOST INVESTIGATION",
  "meta": ["Indoor", "Slow", "Audio-led"],
  "archetype": "mimic",
  "environment": "indoor",
  "estimatedMinutes": [10, 30],
  "atmosphere": "claustrophobic-patience",
  "artPlate": "hunt/ghost/plate.png",
  "audioBed": "ambience.room_hum",
  "tools": ["voice", "emf", "evp", "camera"],
  "toolOrder": { "default": "emf", "afterFirstVoice": "voice" },
  "intensityProfile": { "quietMeanScale": 1.15, "windowThreshold": 62, "maxWindows": 2 },
  "objectives": [
    { "id": "baseline",  "label": "Establish a room baseline",       "kind": "tool",     "target": "emf_sweep_10s" },
    { "id": "ask",       "label": "Ask it something",                "kind": "action",   "target": "voice_ask" },
    { "id": "collect",   "label": "Record three kinds of evidence",  "kind": "evidence", "target": 3, "distinctTypes": true },
    { "id": "listen",    "label": "Hold still for two minutes",      "kind": "behaviour","target": "stillness_120s" },
    { "id": "resolve",   "label": "Attempt a resolution",            "kind": "outcome",  "target": "seal_any_status" }
  ],
  "evidenceTypes": ["unknown_voice", "evp_segment", "emf_stir", "shadow", "visual_encounter", "cold_spot"],
  "completion": { "primary": "userSeals", "autoCloseMin": 30, "minDurationMs": 60000 },
  "failureModes": ["misdirected", "interference", "quiet_night"],
  "unlock": { "kind": "always" },
  "conditionsPreference": { "timeOfDay": "night", "lightBand": ["dark","very_dark"], "weight": 1.0 },
  "reportTheme": "default"
}
```

**Atmosphere.** A building that is listening back. The Ghost hunt is the *quietest* of the four: `quietMeanScale 1.15` stretches every interval, and the audio bed sits at −30 dB with no music until an encounter. The dominant sensation is that your own voice is the loudest thing in the room.

**Sensory direction.** Audio-first. The Voice tool is the star; the EMF tool is the second screen and deliberately the calm one (the trace barely moves — that is the point). Haptics are sparse and low (`tickLight` only) so that the single `encounter` pattern in a session lands like a hand on the shoulder.

**Distinct feel rule.** Ghost must feel like *conversation*, not pursuit: nothing closes on you, nothing appears in the corner of your eye, and the fail state is about **fooling yourself**.

**Event table sketch** (`src/data/events/ghost.json`):

| Event id | Family | Rarity floor | Channel | Weight (base × bias) | Capture? |
|---|---|---|---|---|---|
| `ambient_hum_shift` | AMBIENT | common | audio | 2.0 | no |
| `emf_stir` | EM | common | visual | 2.4 | yes |
| `emf_surge` | EM | uncommon | visual+haptic | 1.1 | yes |
| `knock_distant` | AUDIO | uncommon | audio | 1.0 | yes |
| `whisper_fragment` | AUDIO | uncommon | audio | 1.3 | yes |
| `direct_answer` | AUDIO | rare | audio | 0.7 (×2.0 if a question is pending) | yes |
| `cold_spot_pass` | AMBIENT | uncommon | haptic | 0.9 | yes |
| `camera_glitch_soft` | GLITCH | rare | glitch | 0.5 | yes |
| `evp_window` | AUDIO | rare | audio | 0.6 | yes |
| `breath_close` | AUDIO | very_rare | audio | 0.2 | yes |
| `full_manifest` | VISUAL | legendary | visual | legendaryFlag only | yes |

**Encounter table sketch** (`src/data/encounters/ghost.json`):

| Encounter | Channel | Duration | Ambiguity tag | Aftermath line |
|---|---|---|---|---|
| `answer_echo` | audio | 900 ms | `tail_uncertain` | `It said something.` |
| `answer_name` | audio | 1100 ms | `partial_word` | `It used a word.` |
| `shadow_cross` | visual | 400 ms | `motion_blur` | `Movement. NE.` |
| `glitch_greet` | glitch | 120 ms | `never_repeated` | `The record changed.` |

**Audio/visual direction.** Word fragments are **1–4 syllables**, from `wordbanks/ghost.json` (48 entries: `leave`, `here`, `again`, `not yet`, `cold`, `who`, `stay`, `behind`…). Every fragment is recorded dry, close-mic, with room tone baked in, then played through a band-pass that tracks tension (the higher the tension, the narrower the band — so a late answer sounds *further away*, which is backwards from expectation and therefore memorable). Visual: nothing on screen except the tuning ribbon; the word appears at 40% opacity in `title2`, holds 2.4 s, fades over 400 ms. Never more than one word-line on screen at a time.

**Unlock.** Always available. This is the free first hunt and the tutorial for the whole product.

---

### J.2 BIGFOOT — the Ambusher

```jsonc
// src/data/hunts/bigfoot.json
{
  "id": "bigfoot",
  "creatureId": "bigfoot",
  "title": "BIGFOOT EXPEDITION",
  "meta": ["Outdoor", "Fast", "Visual-led"],
  "archetype": "ambusher",
  "environment": "outdoor",
  "estimatedMinutes": [15, 40],
  "atmosphere": "wide-open-pursuit",
  "artPlate": "hunt/bigfoot/plate.png",
  "audioBed": "ambience.forest_night",
  "tools": ["tracker", "camera", "radar"],
  "toolOrder": { "default": "tracker" },
  "intensityProfile": { "quietMeanScale": 0.85, "windowThreshold": 58, "maxWindows": 2, "burstWindowMs": [400, 900] },
  "objectives": [
    { "id": "compass",   "label": "Calibrate the compass",            "kind": "tool",     "target": "tracker_calibrate" },
    { "id": "trail",     "label": "Log three trail marks",            "kind": "action",   "target": "tracker_log", "count": 3 },
    { "id": "frame",     "label": "Frame it",                         "kind": "action",   "target": "camera_frame_during_encounter", "optional": true },
    { "id": "route",     "label": "Cover 300 metres",                 "kind": "behaviour","target": "distance_300m" },
    { "id": "resolve",   "label": "Close the expedition",             "kind": "outcome",  "target": "seal_any_status" }
  ],
  "evidenceTypes": ["footprint", "broken_trail", "vocalization", "movement", "silhouette", "proximity_spike"],
  "completion": { "primary": "userSeals", "autoCloseMin": 40, "minDurationMs": 90000 },
  "failureModes": ["gone", "uncharted", "quiet_night"],
  "unlock": { "kind": "casesSealed", "count": 1 },
  "conditionsPreference": { "timeOfDay": "dusk|night", "lightBand": ["dim","dark"], "outdoor": true, "weight": 1.2 },
  "reportTheme": "field"
}
```

**Atmosphere.** A thing that is bigger than you and knows the ground better. The Bigfoot hunt is fast by design: `quietMeanScale 0.85` and `windowThreshold 58` mean things happen sooner and windows are cheaper — but the encounter is the shortest and hardest to catch of the four (`burstWindowMs 400–900`). It is a chase, not a vigil.

**Sensory direction.** Visual-led with the **haptic as a chase meter**. The Tracker's proximity ladder inherits the Stalker-style haptic quickening even though Bigfoot is an Ambusher — this is a per-hunt `params` override (`proximityClosure` reused from the stalker set to `0.35×` so it *can* be outrun). Chase haptics are the only place the product ever uses more than 1 haptic per 800 ms, and only for ≤ 3 s.

**Distinct feel rule.** Bigfoot must feel like *missing things*. The signature experience is the camera coming up 300 ms too late. `GONE` should fire in roughly 30–40% of Bigfoot cases, and it should be the outcome users describe most fondly.

**The Ambusher's defining mechanic — posture gating.** The encounter can only be *rendered* if the camera is live at resolution time. Every other hunt can be experienced passively; Bigfoot must be *attended to*. This single rule makes Bigfoot the most active hunt in the product and the reason the user's arm gets tired — which is a *good* physical memory.

**Event table sketch** (`src/data/events/bigfoot.json`):

| Event id | Family | Rarity floor | Channel | Weight (base × bias) | Capture? |
|---|---|---|---|---|---|
| `ambient_forest_shift` | AMBIENT | common | audio | 2.0 | no |
| `branch_crack` | AUDIO | common | audio | 2.6 | yes |
| `distant_knock` | AUDIO | uncommon | audio | 1.2 | yes |
| `howl_far` | AUDIO | uncommon | audio | 1.0 | yes |
| `howl_answer` | AUDIO | rare | audio | 0.6 | yes |
| `movement_brush` | MOTION | common | visual | 2.2 | yes |
| `silhouette_far` | VISUAL | rare | visual | 0.8 | yes |
| `trail_break` | MOTION | uncommon | visual | 1.4 | yes |
| `proximity_surge` | MOTION | uncommon | haptic | 1.3 | yes |
| `thermal_absence` | EM | uncommon | visual | 0.9 | yes |
| `wood_knock_sequence` | AUDIO | very_rare | audio | 0.25 | yes |
| `full_manifest_ridge` | VISUAL | legendary | visual | legendaryFlag only | yes |

**Encounter table sketch:**

| Encounter | Channel | Duration | Ambiguity tag | Aftermath line |
|---|---|---|---|---|
| `silhouette_crossing` | visual | 700 ms | `occlusion` | `Movement. NE.` |
| `ridge_walker` | visual | 900 ms | `distance` | `Something on the ridge.` |
| `eyes_pair` | visual | 500 ms | `overexposure` | `Two points of light.` |
| `double_knock_close` | audio | 1400 ms | `unresolved` | `It answered.` |
| `behind_pass` | haptic | 600 ms | `never_facing` | `Something went past.` |

**Audio/visual direction.** Vocals are *long* — 1.8–3.2 s, low, formant-shifted, recorded with heavy forest reverb and placed 15–40 m back in the stereo field. The howl is the most recognisable sound in the product and must be **one asset used sparingly** (8-minute cooldown) because overuse destroys it. Visuals: 4 pre-rendered sprite sequences (2–4 frames each) composited at 35–60% alpha behind a foreground occlusion layer, always at the frame edge or beyond 30 m of parallax, never centred, never facing the lens. **The creature is never in focus.**

**Unlock.** One sealed case (any status — including `QUIET_NIGHT`, so a user who had a genuinely quiet first night is not punished).

---

### J.3 SHADOW PERSON — the Observer

```jsonc
// src/data/hunts/shadow-person.json
{
  "id": "shadow-person",
  "creatureId": "shadow-person",
  "title": "SHADOW PERSON",
  "meta": ["Indoor", "Tense", "Camera-led"],
  "archetype": "observer",
  "environment": "indoor",
  "estimatedMinutes": [8, 20],
  "atmosphere": "peripheral-watched",
  "artPlate": "hunt/shadow/plate.png",
  "audioBed": "ambience.room_hum_low",
  "tools": ["camera", "radar", "emf"],
  "toolOrder": { "default": "camera" },
  "intensityProfile": { "quietMeanScale": 1.0, "windowThreshold": 55, "maxWindows": 1, "noticingRateScale": 1.0 },
  "objectives": [
    { "id": "lights",   "label": "Kill the lights",                 "kind": "behaviour","target": "torch_off_established" },
    { "id": "camera",   "label": "Hold the camera on the dark",     "kind": "behaviour","target": "camera_live_60s" },
    { "id": "still",    "label": "Stay still while it passes",      "kind": "behaviour","target": "stillness_during_encounter" },
    { "id": "collect",  "label": "Log a distortion",                "kind": "evidence", "target": "camera_distortion" },
    { "id": "resolve",  "label": "Get out clean",                   "kind": "outcome",  "target": "seal_without_noticed" }
  ],
  "evidenceTypes": ["shadow", "motion", "camera_distortion", "silhouette", "peripheral_event", "visual_encounter"],
  "completion": { "primary": "userSeals", "autoCloseMin": 20, "minDurationMs": 60000, "earlyEndOnNoticed": true },
  "failureModes": ["noticed", "interference", "quiet_night"],
  "unlock": { "kind": "casesSealed", "count": 2 },
  "conditionsPreference": { "timeOfDay": "night", "lightBand": ["very_dark"], "weight": 1.4 },
  "reportTheme": "shadow"
}
```

**Atmosphere.** The only hunt where the user is the one being observed, and the only one where **your own behaviour is the hazard**. It is the mirror of hunting — exactly as the memlog demands.

**The Observer inversion (the mechanic that makes this hunt unique).** Noticing accrues against the user:

```ts
noticingRate =
    0.0022 * (torchOn          ? 1 : 0)     // light draws it
  + 0.0016 * (cameraLive       ? 1 : 0)     // a lens is a gaze
  + 0.0030 * clamp01(movedMetres / 2)       // movement in the dark
  + 0.0010 * (deviceScreenBright ? 1 : 0)
  - 0.0018 * (stillnessMs > 30_000 ? 1 : 0) // standing still is safe
```

`noticing ≥ 1.0` → `NOTICED` → session ends early with a distinct stamp. **This means the correct way to play Shadow Person is the opposite of every other hunt: stand still, torch off, camera down.** The app never tells the user this. They discover it. That discovery is the best "aha" in the product, and it is delivered entirely through consequence — after one `NOTICED` ending, the report's `SEEN, AND STAYED` stamp is enough for the user to work it out.

To make that discovery fair, the session gives **one honest hint only**: after the first `shadow` evidence, the rail's directive pool changes to the stillness-biased set (`Hold still and listen.` / `Set the phone down and step back.`).

**Sensory direction.** Haptic + glitch primary. It is the *screen-glitch* hunt: `GlitchFrame` and `ChromaticEdge` overlays are reserved almost exclusively for this hunt and for `Ritual` intensity. The camera look is a lifted-shadow LUT at 8% so the dark is readable but never bright.

**Distinct feel rule.** Shadow Person must feel like *being watched*, which requires the app to be quiet, peripheral, and reactive. Encounters are the shortest in the game (300–600 ms), always at the frame edge or fully behind the user (`behind_pass`), and the aftermath line is always directionless (`Something moved.`).

**Event table sketch** (`src/data/events/shadow-person.json`):

| Event id | Family | Rarity floor | Channel | Weight | Capture? |
|---|---|---|---|---|---|
| `ambient_room_tick` | AMBIENT | common | audio | 1.6 | no |
| `peripheral_pass` | VISUAL | common | visual | 2.8 | yes |
| `distortion_bloom` | GLITCH | common | glitch | 2.2 | yes |
| `motion_edge` | MOTION | common | haptic | 2.0 | yes |
| `light_flicker` | GLITCH | uncommon | glitch | 1.1 | yes |
| `breath_behind` | AUDIO | rare | audio | 0.6 | yes |
| `shadow_full` | VISUAL | rare | visual | 0.7 | yes |
| `screen_tear` | GLITCH | rare | glitch | 0.5 | yes |
| `behind_you` | VISUAL | very_rare | visual+haptic | 0.18 | yes |
| `the_turn` | VISUAL | legendary | visual | legendaryFlag only | yes |

**Encounter table sketch:**

| Encounter | Channel | Duration | Ambiguity tag | Aftermath line |
|---|---|---|---|---|
| `edge_pass` | visual | 350 ms | `motion_blur` | `Something moved.` |
| `behind_pass` | haptic | 600 ms | `never_facing` | `It went behind you.` |
| `distortion_frame` | glitch | 120 ms | `never_repeated` | `The record changed.` |
| `doorway_shape` | visual | 500 ms | `occlusion` | `There was a shape.` |
| `two_points_of_light` | visual | 450 ms | `overexposure` | `Eyes. Maybe.` |

**Audio/visual direction.** Almost no new audio assets — the Shadow Person hunt is built from **glitch and silence**, which is why it is the cheapest of the four to produce and the most effective. The sprite sequences are pure black matte shapes with no interior detail at any alpha; the ambiguity is achieved by *frame count* (2–3 frames), never by blur. The `distortion_bloom` overlay is a single 4-frame chromatic-aberration + horizontal-tear sequence, used at most 4× per session.

**Unlock.** Two sealed cases.

---

### J.4 ALIEN / UFO — the Stalker

```jsonc
// src/data/hunts/alien.json
{
  "id": "alien",
  "creatureId": "alien",
  "title": "SKY CONTACT",
  "meta": ["Outdoor", "Sky", "Signal-led"],
  "archetype": "stalker",
  "environment": "outdoor",
  "estimatedMinutes": [12, 30],
  "atmosphere": "exposed-watched-from-above",
  "artPlate": "hunt/alien/plate.png",
  "audioBed": "ambience.open_field",
  "tools": ["sky", "camera", "radar"],
  "toolOrder": { "default": "sky" },
  "intensityProfile": { "quietMeanScale": 0.95, "windowThreshold": 60, "maxWindows": 2, "proximityClosure": 0.0042 },
  "objectives": [
    { "id": "scan",      "label": "Sweep the sky",                   "kind": "tool",     "target": "sky_scan_120s" },
    { "id": "align",     "label": "Align the device to a signal",    "kind": "action",   "target": "sky_align" },
    { "id": "lock",      "label": "Hold a signal lock",              "kind": "action",   "target": "sky_lock_3s", "optional": true },
    { "id": "transmit",  "label": "Log a transmission",              "kind": "evidence", "target": "transmission" },
    { "id": "resolve",   "label": "Break contact",                   "kind": "outcome",  "target": "seal_after_contact" }
  ],
  "evidenceTypes": ["unknown_signal", "sky_object", "electromagnetic_anomaly", "transmission", "visual_encounter", "bearing_lock"],
  "completion": { "primary": "userSeals", "autoCloseMin": 30, "minDurationMs": 60000 },
  "failureModes": ["cornered", "not_aligned", "quiet_night"],
  "unlock": { "kind": "casesSealed", "count": 3 },
  "conditionsPreference": { "timeOfDay": "night", "cloudCover": "clear", "pressureTrend": "rising", "weight": 1.3 },
  "reportTheme": "signal"
}
```

**Atmosphere.** Open, exposed, and looked down upon. The Alien hunt is the only one where the thing **finds you**: `proximityClosure 0.0042` closes on its own, faster when the user is still, and the fail state is `CORNERED`. It is also the only hunt with a **procedural posture mechanic** — the user must physically aim the phone at the sky.

**Sensory direction.** Visual + haptic. The Sky tool's alignment meter is the product's only "skill" surface and it is deliberately generous (`45°` tolerance) so that it is achievable while panning and never frustrating. The haptic escalation carries the closing sensation because the sky gives no proximity cue until a lock.

**Distinct feel rule.** Alien must feel like *being approached from above*: the invisible ones are closer than they look, and the fail state is not "you missed it" but "it got here". This is why the alien hunt is the only one where the user can lose by standing still and watching — the opposite of Bigfoot, and the strongest possible proof that the four are four games.

**The transmission mechanic (post-MVP-lite, in MVP as audio only).** A `transmission` evidence arrives as a 2–4 s burst of structured-sounding audio: a fast pulse train with a rhythm, band-limited, unmistakably not speech and not music. Words are **never** used for the alien creature — that would collapse the Alien into the Mimic. The alien speaks in *intervals*, and the report renders that as a pulse glyph row rather than text. This is a hard separation rule between the two archetypes and it must not be broken when content drops add more creatures.

**Event table sketch** (`src/data/events/alien.json`):

| Event id | Family | Rarity floor | Channel | Weight | Capture? |
|---|---|---|---|---|---|
| `ambient_field_tone` | AMBIENT | common | audio | 1.6 | no |
| `magnetic_disturbance` | EM | common | visual | 2.4 | yes |
| `radar_blip` | MOTION | common | visual | 2.6 | yes |
| `signal_pulse` | EM | uncommon | audio+haptic | 1.6 | yes |
| `transmission_burst` | AUDIO | uncommon | audio | 1.2 | yes |
| `sky_drift` | VISUAL | uncommon | visual | 1.3 | yes |
| `em_anomaly_strong` | EM | rare | visual+glitch | 0.7 | yes |
| `triangulated_signal` | EM | rare | haptic | 0.6 | yes |
| `craft_far` | VISUAL | rare | visual | 0.7 | yes |
| `directed_signal` | EM | very_rare | all | 0.2 | yes |
| `the_arrival` | VISUAL | legendary | visual | legendaryFlag only | yes |

**Encounter table sketch:**

| Encounter | Channel | Duration | Ambiguity tag | Aftermath line |
|---|---|---|---|---|
| `light_formation` | visual | 800 ms | `distance` | `Three lights. Moving.` |
| `fast_crossing` | visual | 400 ms | `motion_blur` | `It crossed.` |
| `signal_lock_moment` | audial+haptic | 1200 ms | `unresolved` | `It locked on.` |
| `em_surge` | glitch | 150 ms | `never_repeated` | `The record changed.` |
| `overhead_pass` | haptic | 700 ms | `never_facing` | `Something went over.` |

**Audio/visual direction.** The sky field is procedural and **labelled `GENERATED`** in micro-caps (§F-13) — the product shows stars but never pretends to know where the real ones are. Craft assets are 3-frame silhouettes at 25–45% alpha against the procedural star field, deliberately small (14–28 px), always moving faster than a satellite and slower than a meteor, at a bearing that requires the user to pan. Transmission audio: 2–4 s pulse trains at 2.5–6 Hz with an irregular interval sequence drawn from `rng.words`'s sibling `rng.signals` fork.

**Unlock.** Three sealed cases. The Alien is the intended "act 2" content — the hunt that teaches that the four are four games, at the moment the user has enough of a record to appreciate it.

### J.5 The content-drop proof (why the four are a pipeline, not a product)

To prove the archetype parameterization before it is claimed, ship **creature #5 — Mothman — as a content-only drop** (a 1.x update) with **zero engine diff**:

```jsonc
{
  "id": "mothman", "archetype": "ambusher", "environment": "outdoor",
  "verbOverride": "Don't blink.",           // the only new string
  "tools": ["camera", "radar", "emf"],
  "params": { "burstWindowMs": [300, 600], "lightPenalty": 0.4, "proximityClosure": 0.0026 },
  "eventBias": { "wing_sound": 3.0, "red_eyes": 1.4, "distant_shadow": 1.8, "emf_surge": 1.2 },
  "evidenceTypes": ["silhouette", "wing_sound", "red_eyes", "emf_stir", "visual_encounter"],
  "unlock": { "kind": "signatureMatched", "signatureId": "unidentified_sig_02" },
  "reportTheme": "signal"
}
```

The only new engine-adjacent surface is `verbOverride` (a display string), and the only new assets are 4 sprites + 3 sounds. **If shipping Mothman requires touching `engine/`, the archetype model has failed and the team should stop and fix it before building creature #6.**

---

## §K. UI specification

This section is written so a coding AI can implement every screen without a screenshot. Tokens are defined once here and referenced by name everywhere else. **There is no light mode.** The app is dark-only: a paranormal field tool that flashes white at 11pm is a broken product, and a light theme would also destroy the encounter contrast. `reduceMotion` and Dynamic Type are honoured; dark is not optional.

### K.0 Design tokens

```ts
// src/ui/theme/colors.ts
export const colors = {
  void:      '#07090B',   // app background, camera surround, session field
  basalt:    '#0D1114',   // sheets, modals, pushed surfaces
  surface1:  '#131A1E',   // cards, list rows, cards in the report
  surface2:  '#1B242A',   // controls, active chips, tool button base
  line:      '#2A363C',   // 1px hairline — borders, dividers, rails
  ink:       '#E6EDF0',   // primary text
  inkDim:    '#9AA8B0',   // secondary text, inactive tab labels
  inkFaint:  '#5B6B73',   // mono meta, labels, disabled
  trace:     '#6FE3C4',   // PRIMARY accent — "signal"
  cyan:      '#7FD3E8',   // sky / radar / heading
  amber:     '#E8A33D',   // caution, EXPLAINED status, interference
  danger:    '#C4553F',   // destructive only — never used for atmosphere
  glitch:    '#B45CE8',   // reserved: glitch channel, `Ritual` intensity only
  stamp:     '#C8B98F',   // report seal ink, stamp impressions
} as const;
```

**Colour discipline (binding).** `danger` never appears in a session except on a destructive confirm. `glitch` is used at most 4× per session and only in the Shadow Person hunt or at `Ritual` intensity. Static text is never `trace` — accent is reserved for live signal so that "something is happening" is legible at a glance in peripheral vision. Every overlay that tints the camera preview (vignette, glitch, chromatic edge) must keep the preview's mean luminance within ±15% of untinted.

```ts
// src/ui/theme/spacing.ts
export const s = { s1: 4, s2: 8, s3: 12, s4: 16, s5: 24, s6: 32, s7: 48, s8: 64 } as const;
export const r = { r1: 8, r2: 12, r3: 16, r4: 24, rfull: 9999 } as const;

// src/ui/theme/typography.ts  (family: Inter / system; mono: JetBrains Mono / system mono)
export const type = {
  display:    { size: 44, line: 48, weight: '700', tracking: -0.5 },
  title1:     { size: 30, line: 34, weight: '600', tracking: -0.2 },
  title2:     { size: 22, line: 28, weight: '600' },
  title3:     { size: 18, line: 24, weight: '600' },
  body:       { size: 16, line: 24, weight: '400' },
  bodyStrong: { size: 16, line: 24, weight: '600' },
  caption:    { size: 13, line: 18, weight: '400' },
  micro:      { size: 11, line: 14, weight: '600', tracking: 1.2, transform: 'uppercase' },
  mono:       { size: 14, line: 20, weight: '500', numeric: 'tabular' },
} as const;

// src/ui/theme/motion.ts
export const d = { instant: 120, fast: 180, base: 240, slow: 380, deliberate: 900 };
export const ease = {
  standard: [0.2, 0, 0, 1],
  enter:    [0.16, 1, 0.3, 1],
  exit:     [0.4, 0, 1, 1],
};
export const spring = {
  sheet: { damping: 22, stiffness: 240 },
  seal:  { damping: 14, stiffness: 120 },
  chip:  { damping: 20, stiffness: 300 },
};

// src/ui/theme/elevation.ts   — dark UI: NO SHADOWS. Depth = background step + border.
export const elev = {
  flat:    { bg: colors.void,     border: null },
  card:    { bg: colors.surface1, border: colors.line },
  raised:  { bg: colors.surface2, border: colors.line },
  sheet:   { bg: colors.basalt,   border: colors.line },
};
```

**Haptic vocabulary** (`src/haptics/patterns.ts`) — every entry is a named token, because a haptic is a design decision, not a call site.

| Token | Implementation | Used for |
|---|---|---|
| `tickLight` | `impactAsync(Light)` | radar target birth, proximity band change, marker drop |
| `tickMedium` | `impactAsync(Medium)` | evidence capture, shutter, signal lock |
| `tickHeavy` | `impactAsync(Heavy)` | sky lock, seal confirm, low-battery prompt |
| `select` | `selectionAsync()` | intensity detent, verdict, segment change, toggle |
| `confirm` | `notificationAsync(Success)` | evidence kept, case sealed, clearance advanced |
| `warn` | `notificationAsync(Warning)` | hold-to-enter aborted, interference, permission continued-without |
| `seal` | pattern `[40, 80, 40]` ms | the report seal closing |
| `encounter` | pattern `[0, 60, 40, 120]` ms | encounter delivered (once per session; never repeated) |
| `escalate(level)` | pattern `[0, 30*n, 40+10n]` | Stalker/Tracker proximity ladder, n = 1..5 |

Global haptic rules: **one haptic per 800 ms maximum** except `escalate` (bounded to 3 s). Every screen is fully usable with haptics off — a haptic is never the *only* carrier of information (`02-*` §G.0: iOS silences haptics while the camera is active, in Low Power Mode, and when the user has disabled them).

### K.1 Shared component contracts

Implemented once in `src/ui/primitives/*`, used by every screen. **No screen invents a button.**

| Component | Spec |
|---|---|
| `<Button variant>` | Height 56. `primary`: bg `trace`, label `void` at `bodyStrong`. `secondary`: bg `surface2`, label `ink`, 1px `line` border. `ghost`: label `trace`, no bg. `destructive`: bg transparent, 1px `danger` border, label `danger`. Radius `r3`. Pressed state: scale 0.97 + bg alpha −8%, `d.fast`. Disabled: 38% opacity, no press. Minimum hit target 48×48 (padding, not size). Optional `icon` left, `trailing` label right. |
| `<HoldButton durationMs>` | Same metrics as `primary`. On press: a 2px `void`-at-30% fill sweeps left→right under the label at `durationMs`. At 60% an `impactAsync(Light)` fires; at 100% `tickHeavy` + the action. Early release: label flashes `Hold to enter.` for 1.2 s in `inkDim` + `warn`. Label swaps to a `progressLabel` at 50%. |
| `<Card>` | bg `surface1`, radius `r3`, 1px `line`, padding `s4`. Optional `kicker` (micro, `inkFaint`), `title` (title3), `meta` row (mono, `inkFaint`), `trailing` slot. Pressed: scale 0.985, `d.fast`. |
| `<Panel>` | bg `void`, 1px `line`, radius `r2`, padding `s4`. Used for the report's bordered blocks (negative space, ledger). |
| `<Chip>` | Height 32 (compact) / 44 (actionable). bg `surface2`, radius `rfull`, padding-x `s3`, label `caption`. `active`: bg `trace`-at-14%, border `trace`-at-40%, label `trace`. `locked`: bg transparent, border `line`, label `inkFaint`. |
| `<StatRow>` | N cells, equal width, `s4` between. Each: value in `title1` (`ink`), label in `micro` (`inkFaint`). Values are **counts or durations only** — `StatRow` asserts at runtime in dev that no value is a percentage string. |
| `<SignalBars level>` | 3–5 bars, 3px wide, 2px gap, heights 6/10/14/18/22. Filled = `trace`, empty = `line`. No label, no number. |
| `<ConfidenceCone>` | Arc wedge from center: `innerR`, `outerR`, `bearingDeg`, `widthDeg`, `alpha ∈ [0.08, 0.24]`. Built with Reanimated + `react-native-svg`. **Width encodes uncertainty** — this is the only place the radar's honesty lives. |
| `<BreathingDot periodMs>` | 8px circle, `trace`, opacity 0.35→1.0 and scale 0.8→1.0 on a sine over `periodMs` (±300 ms jitter supplied by the presenter). Implemented as a Reanimated `withRepeat` on a `SharedValue` — never a JS-driven animation, because it runs while the JS thread ticks the engine. |
| `<TraceLine>` | A single 1px `trace` polyline over a ring buffer of N values. No axes, no units, no labels, no gridlines, ever. Fades to `inkFaint` when stale (> 3 s without a sample). |
| `<EmptyState>` | Centered, `s7` above and below. 96px hairline illustration (`inkFaint` at 40%), title (`title3`, `inkDim`), one line of body (`caption`, `inkFaint`, max 2 lines), **exactly one** action button. Never an illustration of a cartoon ghost (§P). |
| `<LoadBeat>` | **There are no spinners anywhere in the app.** Where a wait is authored (report compile, seed generation), use `<LoadBeat>`: a `void` field with one `mono` line that types out at 28 chars/s, held at `deliberate`. If a real I/O wait exceeds 400 ms (SQLite read on a 500-case journal), the list renders a `<SkeletonRow>` shimmer at 6% `ink` — never a spinner. |

### K.2 Onboarding (4 screens)

**Route** `(onboarding)/index | disclaimer | calibrate | permissions` · **Purpose** §F-01.

- **Layout.** Full-bleed `void`. Content column `s5` inset, max 480. Vertical order with fixed anchors: kicker `micro` `inkFaint` at `s6` from top; headline `title1` `ink` `s3` below; body `body` `inkDim` `s4` below, max 3 lines; optional link row (`caption`, `trace`) `s5` below; primary `<Button primary>` pinned `s5` above the safe-area bottom. Top: 4 progress hairlines, 2px tall, `s4` inset, `s2` gap, filled `trace`, unfilled `line`.
- **Per-screen copy (exact).**

| # | Kicker | Headline | Body | Action |
|---|---|---|---|---|
| 1 | `NIGHTTRACE` | `Nothing here is proof.` | `NightTrace is a paranormal investigation experience. It does not measure, prove, or detect anything supernatural — nothing can. It gives you the tools, the ritual, and the case file.` | `I understand` |
| 2 | `YOUR DATA` | `Your case is local.` | `Every case is generated from where you are, what hour it is, and what your device senses around you. No two cases are the same. Nothing leaves this phone.` | `Continue` + link `What we never collect` |
| 3 | `SETUP` | `Choose your night.` | `Higher intensity means more signals. It never means a guaranteed encounter.` | `Continue` |
| 4 | `SENSORS` | `Ask only when needed.` | `NightTrace asks for a sensor the moment a tool needs it — never at launch. Every hunt is playable if you say no.` | `Enter NightTrace` |

- **Screen 3 body (extra rows).** Four intensity rows (§K.16) as a radio list, then two toggle rows: `Haptics` (on) and `Reduce motion` (follows OS). Each row 56px, 1px `line` divider, label `body`, control right-aligned.
- **Screen 4 body (extra rows).** Four permission explainer rows, 44px, icon + label + purpose, `caption` `inkFaint`. Each row is **informational only** — tapping one does nothing but reveal a one-line detail. No prompt fires on this screen.
- **States.** Fresh install only. `reduceMotion` → screens cross-fade at `d.base` instead of sliding. Dynamic Type XXL → body clamps at 3 lines, the column scrolls, the button stays pinned.
- **Animation.** Enter: content translates +16px → 0 with fade at `d.base` `ease.enter`, staggered 40ms per block. Screen 1's trace glyph draws left→right over 240 ms.
- **Haptics.** `select` on each intensity detent and toggle. `confirm` on `I understand`. `tickLight` on final `Enter NightTrace`.
- **Empty / loading.** None. This flow has no async work.
- **Never.** No permission prompt, no network call, no skip button that bypasses screens 1–2 (the framing is a release gate, §P).

### K.3 Home

**Route** `(tabs)/index` · **Purpose** §F-02.

- **Layout.** `FlashList`/`ScrollView` on `void`. Content inset `s4`; top `s6` above the header. Blocks, top→bottom with `s5` between:
  1. **Header** — row, `s4` tall. Left: `NIGHTTRACE` (`micro`, `inkFaint`). Right: clearance `<Chip locked>` reading `FIELD ASSISTANT` (`micro`, `inkDim`, border `line`).
  2. **Anomaly of the Day** — `<Card>` 96px tall, bg `surface1`, left edge a 3px `cyan` vertical accent bar (full card height, radius `r3` left only). Kicker `TONIGHT` (`micro`, `cyan`). Title `title3` `ink`: `A low, steady pressure.` Meta row (`mono`, `inkFaint`): `local · rotates at midnight`. Trailing: a 24px `chevron` `inkFaint`.
  3. **Featured hunt** — a 16:9 art plate card (`r3`, image + 60% `void` scrim bottom). Overlay bottom-left: hunt title (`title2`, `ink`), meta row (`mono`, `inkDim`) `Indoor · Slow · Audio-led`. Overlay bottom-right: `<Chip active>` `ACTIVE TONIGHT`. Below the plate, inside the same card: a full-width `<Button primary>` `BEGIN BRIEF` (`s4` padding). Fresh install adds one line above the button: `Your first case is free. No account needed.` (`caption`, `inkFaint`).
  4. **Continue case** — rendered only when an unsealed case exists. `<Card>` `raised` with a `trace` left accent bar. Kicker `UNSEALED`. Title = the case name. Meta = `NT-017 · 07 evidence`. Button `<Button secondary>` `SEAL THE CASE`.
  5. **Recent evidence** — horizontal rail, 96×96 tiles, `s3` gap. Each tile: bg `surface1`, `r2`, centered evidence glyph (`trace` at 70%) and a `micro` label under it. Empty: a single `<Panel>` reading `Nothing on file yet.` (`caption`, `inkFaint`).
  6. **Conditions footer** — 3 `mono` lines, `inkFaint`, `s6` bottom inset: `dusk · 21:04` / `light: dark` / `pressure: rising`.
- **Interactions.** Featured card or button → `/hunt/[id]/brief`. Anomaly card → medium sheet (title, 2 lines of fiction, `Investigate this` → `/investigate?anomaly=…`). Evidence tile → `/case/[id]/evidence/[id]`. **Pull-to-refresh is not implemented** — there is nothing to fetch, and the gesture would imply a server.
- **States.** *Empty* (0 cases): block 3 shows the first-case line; blocks 4 and 5 are absent; block 6 present. *Loading*: none — Home reads SQLite synchronously-fast for < 20 rows; above that the two rails render `<SkeletonRow>`. *Error*: if the DB fails to open, a full-screen `<Panel>` with `Your case file could not be opened.` + `Try again` (the only retry button in the app).
- **Animation.** On focus, blocks fade+rise 12px, staggered 50 ms, `d.base`. The anomaly card's accent bar pulses its opacity 0.6→1.0 over 4 s.
- **Haptics.** `select` on every tap. `tickLight` when the stray `UNSEALED` chip appears.
- **Growth note.** A dot on the **Field Journal** tab appears whenever a case is unsealed; it is cleared only by sealing. This is the return hook, and it is the only tab badge in the product.

### K.4 Investigate (hunt picker)

**Route** `(tabs)/investigate` · **Purpose** §F-03.

- **Layout.** `void`, `s4` inset. Header `INVESTIGATE` (`title1`) with the conditions line beneath (`mono`, `inkFaint`). Then a vertical list, `s4` between rows. Each row is a `<Card>` 104px tall, row layout:
  - **Left:** 72×72 plate, `r2`, `surface2`. Unlocked: the creature silhouette at 55% `inkDim`. Locked: a hairline keyhole glyph (`inkFaint`, 30%).
  - **Middle:** title `title3` `ink`; meta `mono` `inkFaint` `Indoor · Slow · Audio-led`; a third line `caption` `inkDim` = the verb (`Ask it something.`) when unlocked, the exact requirement when locked (`Seal one more case.`).
  - **Right:** state chip — `READY` (`trace`), `2 OF 3 FREE` (`amber`), `LOCKED` (`inkFaint`).
- **Below the list.** `s5` gap, then the **Field Note** row: a compact `<Panel>` with `FIELD NOTE` (`micro`), `3 minutes. No case file. Just a look.` (`caption`), and a `<Button ghost>` `TAKE ONE`.
- **Interactions.** Unlocked card → `/hunt/[id]/brief`. Locked card → medium sheet: requirement, current progress as a count (`1 of 2 cases sealed`), and one action — `Open GHOST INVESTIGATION` or `View the field guide`. **Never a purchase CTA.** The paywall is not reachable from this screen.
- **States.** *Empty*: impossible (Ghost is always present); if content fails to load, one `<Panel>` `The field guide is empty. Reinstall to restore content.` *Loading*: skeletons at 104px. *All-previous-unlocked*: the list is simply four rows, no scroll.
- **Animation.** On focus after an unlock was earned, the newly unlocked row's keyhole cross-fades to the silhouette over `d.slow` with a 6px scale-up, and a `confirm` haptic fires **once** (guarded by a `seenUnlock` flag so it never repeats).
- **Haptics.** `select` on tap; `confirm` on the one-time unlock reveal.
- **Copy rule.** Locked rows state the requirement as a *fact about the user's own record*, never as a tease and never with a countdown (§P).

### K.5 Hunt Brief (ritual gear-up)

**Route** `hunt/[huntId]/brief` · **Purpose** §F-04. **This is the app's second-most important screen after the report.**

- **Layout.** `void`, single column, `s5` inset, max 520, scrollable. Order and metrics:
  1. `s6` top. Kicker `micro` `inkFaint`: `CASE FILE`.
  2. Title `title1` `ink`. `s2` below.
  3. **Case ref** `mono` `inkFaint`, e.g. `NT-017`. `s5` below.
  4. Divider `1px line`, full bleed. `s5` both sides.
  5. Label `micro` `inkFaint`: `NAME THIS CASE`. `s3` below. `<TextInput>` 56px, bg `surface1`, `r2`, 1px `line`, padding-x `s4`, placeholder `e.g. The Attic, Second Night` (`inkFaint`), max 40 chars. `s2` below: helper `caption` `inkFaint`: `Named cases are easier to remember. This is the name on the report.`
  6. `s5` below. Label `micro`: `SET YOUR INTENTION`. `s3` below. Row of 3 `<Chip>` 44px, equal width, `s2` gap: `Ask` · `Watch` · `Wait`. Default `Watch`.
  7. `s5` below. Label `micro`: `GEAR-UP`. `s3` below. Four rows, 56px each, 1px `line` dividers between:
     - `Calibrate` — trailing: `<Button ghost>` `Calibrate`, becoming a `<Chip locked>` `Baseline set · quiet` / `· noisy surroundings` / `· inferred` on success.
     - `Torch` — trailing `<Switch>` (off for indoor hunts, on for outdoor).
     - `Room tone` — trailing `<Switch>` (on). Sub-line only in the on state: `Ambience plays during the case.`
     - `Auto-close` — trailing segmented `10 / 20 / 30 / 45 / ∞`, default `30`.
     - Optional 5th row when a tool is unavailable: `EVP` trailing `<Chip locked>` `unavailable` + sub-line `Microphone access is off.` Non-interactive.
  8. `s5` below. **Conditions panel** `<Panel>`: 3 `mono` lines `inkFaint` — the same three as Home, plus a 4th line `seed: assigned`.
  9. `s6` below. `<HoldButton durationMs={800}>` label `HOLD TO ENTER THE FIELD`, `progressLabel` `Crossing over…`. Full width, 56px, `r3`, `trace`.
  10. `s5` bottom inset. Secondary `<Button ghost>` `Leave` (returns to the previous tab).
- **Interactions.** Calibrate: a 5s ring draws anticlockwise around the row's trailing control; the other gear rows dim to 40% opacity during the 5s; on completion the chip appears with a `d.fast` fade and `confirm`. Re-tappable at any time. Hold-to-enter requires a foreground gesture; if the app backgrounds during the hold, the hold silently aborts and the label resets.
- **States.** *Calibrating*: ring + `Hold still. Establishing a quiet baseline.` (`caption`, `inkDim`) replacing the conditions panel temporarily. *Entered*: a 220ms fade to `void`, then the route replaces to `session`. *Back from session with an unsealed case*: the Brief returns with the case ref and name pre-filled and the primary button reading `RESUME CASE`.
- **Animation.** Entry: the title block fades+rises 16px `d.base`; the gear rows stagger 40ms each. The hold fill is a Reanimated width `SharedValue` on the UI thread — it must never stutter.
- **Haptics.** `select` on intent chips and switches. `tickMedium` at 60% of the hold, `tickHeavy` + the entry transition on completion. `warn` on an aborted hold. `confirm` when calibration lands.
- **Loading.** Maximum 400ms of real work (seed generation + session insert). No spinner: the hold fill covers it, and the route transition begins only when the insert has committed. If the insert exceeds 400ms, the label swaps to `Preparing the file…` and stays until commit — never a failure state; a failed insert shows `Could not open the case.` with `Try again`.

### K.6 Session shell (status rail + tool carousel)

**Route** `hunt/[huntId]/session` · **Purpose** §F-06.

- **Layout.** `void`, immersive, tab bar hidden, no back button chrome (gesture only). Three fixed regions:
  - **Status rail** — height 56 + safe-area top, `s4` horizontal padding, 1px `line` bottom border. Left→right: case ref (`mono`, `inkFaint`) · **phase hairline** (center, 5 segments, each flex-1, 2px tall, `s1` gap, filled `trace` / unfilled `line`, `s7` max width) · elapsed `MM:SS` (`mono`, `inkDim`) + `<BreathingDot>` 6px `trace` to its left. A 6th slot at the far right only in low-power: a 4-bar battery glyph (`inkFaint`).
  - **Field** — flex-1. Default view is the **Listening surface**: a centered 180px ring (1px `trace` at 25%, radius `rfull`), a `<BreathingDot>` 10px at its center, and beneath it the state word in `title3` `inkDim`: `QUIET` → `LISTENING` → `ACTIVE` → `CONTACT`. Under the word, one line of `caption` `inkFaint` — the current directive, if any. When a tool is active, the tool's own surface renders here and the Listening ring is hidden.
  - **Evidence rail** — 48px, rendered only when ≥1 item exists. Horizontal scroll, `s3` gap, chips = 48×48 `surface1` `r2` with the evidence glyph (`trace` 70%). A `+N` overflow chip past 8.
  - **Tool row** — 72px + safe-area bottom, horizontal scroll, `s3` gap, `s4` inset. Seven buttons 44×44 (`r2`): EMF · Radar · Voice · EVP · Camera · Tracker · Sky. Only the tools in the hunt's `tools` array are present; unavailable hardware hides a tool entirely (never a dead button). Active tool: bg `surface2`, icon `trace`, plus a 2px `trace` top indicator. Inactive: bg `surface1`, icon `inkDim`.
- **Interactions.** Tap a tool → push its route. Tap the elapsed time → low-power sheet. Tap the battery glyph → low-power sheet. Long-press the phase hairline → an explanatory sheet in vaguer terms: `The record tends to move through five stages.` Swipe **down** on the field → the directive card (last directive + `I need a direction`). Swipe back at the screen edge → the **Leave the field** sheet.
- **States.** *Paused* (backgrounded): the field dims to 40% and a `<Panel>` reads `Paused. Time is not passing.`; the tick loop is stopped, not throttled. *Re-entering from background*: the rail shows `Recalibrating · 2s` and **no event may fire in that window**. *Low-power*: rail gains the battery glyph; the Listening ring's period lengthens 1.4×.
- **Animation.** Phase transitions: the new segment fills left→right over `d.slow` `ease.standard`; the ambience bed's low-pass cutoff drops one step over `d.deliberate` (so the world goes dull *before* something happens, never loud). Evidence chips pop in with `spring.chip` + a 4px rise.
- **Haptics.** `tickLight` on ambient radar ticks. `tickMedium` on evidence capture. `encounter` on an encounter. `warn` on the low-battery prompt. **No haptic on phase transitions** — the user must not be able to feel the machine's gears.
- **Invariants.** The shell never renders a number that is not elapsed time or a count. The shell never names a creature. The shell never says what is about to happen.

### K.7 EMF tool

**Route** `tool/emf` · **Purpose** §F-07.

- **Layout.** `void`. Top strip (`s4`, 40px): `EMF` (`micro`, `inkFaint`) left; state chip right — `STILL` (`inkFaint`) / `DRIFT` (`cyan`) / `STIR` (`trace`) / `INTERFERENCE` (`amber`) / `INFERRED` (`inkFaint`, appended as a micro-label when in residual mode).
- **Trace block.** `s5` below the strip. Full-width, 128px tall. `<TraceLine>` with a 24s window, 1px `trace`. A horizontal `<Panel>`-style `line` at 40% height, labelled `ROOM` (`micro`, `inkFaint`) at its right end. **No y-axis, no units, no numeric readout.** When stale, the line fades to `inkFaint`.
- **Field dial.** `s6` below the trace. A 220px dial: 4 concentric arcs (`line`), and a highlight arc whose **angular width** (never a needle) maps the banded state: STILL ≈ 8°, DRIFT ≈ 30°, STIR ≈ 70°, INTERFERENCE ≈ full ring in `amber` with a slow rotation.
- **Buttons.** `s6` below. `<Button primary>` `SWEEP` (full width, 10s armed window; the label becomes `SWEEPING · 10s` and a hairline drains under it). `s3` below: `<Button secondary>` `LOG THIS SPOT`.
- **Interactions.** `SWEEP` arms; while armed, the sensor rate rises to `focus` (15 Hz) and the dial's highlight gains a subtle 1.2× amplitude. `LOG THIS SPOT` captures the last 6 s as an `emf_stir` candidate. Motion guard: if accelerometer variance exceeds threshold, the trace dims 40% and a `HOLD STEADY` label appears under it.
- **States.** *No magnetometer* → residual mode: identical visuals, state chip permanently carries `INFERRED`, and a one-time `<Panel>` at first open reads `No magnetic sensor here — readings are inferred.` *Interference sustained > 20 s* → the chip goes `amber`, the dial slows, and a rail line appears: `Something in this room is magnetic.` (a factually true sentence about the room).
- **Animation.** The trace scrolls continuously (Reanimated `SharedValue`, 60fps, UI thread). Band changes cross-fade the chip over `d.fast`. Dial width animates over `d.slow` `ease.standard`.
- **Haptics.** `tickLight` on a band change *upward* only (never downward — falling back to STILL should feel like relief, not an alarm). `tickMedium` on `SWEEP` completion.
- **Empty/loading.** None. The trace starts flat.

### K.8 Radar tool

**Route** `tool/radar` · **Purpose** §F-08.

- **Layout.** `void`. Top strip (`s4`): `RADAR` (`micro`) left; contact-count chip right — `CLEAR` / `ONE` / `SEVERAL` (`inkFaint` / `cyan` / `trace`). Optional `RELATIVE` micro-label when there is no heading sensor.
- **Rose.** Centered, 320px. Three hairline rings (`line`) at r=60/110/160. Eight compass letters (`micro`, `inkFaint`, 40% opacity, r=180). A slow sweeping gradient (one revolution per 8 s, 6% `trace` alpha, a 30°-wide wedge). Your position: a 10px equilateral triangle in `trace` at center. Behind it all, a 1px `line` crosshair.
- **Contacts.** Each `<ConfidenceCone>` drawn from center at r=40→radius, `bearingDeg` from the simulator, `widthDeg = 20 + 50*(1-strength)` (so weak = vague), alpha `0.08 + 0.16*strength`. Tapping a cone highlights it (`trace` border arc) and expands a detail strip beneath the rose.
- **Detail strip.** `<Panel>`, `s3` padding, appears `d.fast` under the rose: `FIRST SEEN 06:12` / `MOVING` / `UNSIGNED` (three `mono` lines) — no distance, no speed number.
- **Bearing line.** Under the rose, `s4` below: `NE · NEAR` (`title3`, `ink`) — 8-wind bearing + a band word (`NEAR` / `FAR` / `DISTANT`). When multiple contacts exist: `SEVERAL · NE`.
- **Button.** `s5` below: full-width `<Button secondary>` `LOG BEARING` (enabled only when a cone is selected; otherwise disabled at 38%).
- **Interactions.** Rotate the device to orient. Press-and-hold the rose → `LOG BEARING` for the strongest cone (a shortcut). Tap a cone to select/deselect.
- **States.** *No contacts* → rose still animates, chip `CLEAR`, beneath the rose a single `caption` `inkFaint` line: `Nothing on the rose.` *No heading sensor* → `RELATIVE` label; bearings become `LEFT / AHEAD / RIGHT` and the compass letters are hidden. *Uncharted (no location)* → band words replaced by `—` and the rail keeps only the bearing.
- **Animation.** Cones are **born** (scale 0.4→1.0 + alpha 0→target over `d.slow`), **move** (bearing interpolates at `velocity × dt`), and **die** (alpha → 0 over 600ms, then removal). The sweep wedge rotates continuously on a `SharedValue`. A cone that approaches past a threshold pulses its alpha at 1.5 Hz. **A target never teleports and never appears at full strength.**
- **Haptics.** `tickLight` on target birth. `escalate(n)` when a target's range band closes one step, capped at 5 pulses over 3 s, then silence. Nothing on death — deaths should be quiet and slightly unsettling.
- **Empty/loading.** None.

### K.9 Voice tool (Spirit Box + ask)

**Route** `tool/voice` · **Purpose** §F-09.

- **Layout.** Near-black (`void`). Top strip (`s4`): `VOICE` (`micro`, `inkFaint`) left; an `ARCHIVE` micro-label right when mic is unavailable. **Band line** `s5` below, `mono` `inkFaint`, centered: a sweeping value (`87.4`, `89.1`, `92.8`, `104.3`…) changing every 1.4 s with an irregular step so it never looks like a counter.
- **Tuning ribbon.** Center, full-width, 160px tall. A procedural waveform: a mirrored envelope whose amplitude is drawn from a slow noise walk (seeded by a `rng.signals` fork, so it is deterministic per session) plus a vertical drift. 1px `trace` at 60% alpha. When a response arrives, the ribbon **flattens** to a thin line for 300ms before the word appears — the quiet before the sound is the whole effect.
- **Response line.** Centered `s5` below the ribbon. A `»` glyph in `mono` `inkFaint` + the word in `title2` `ink`, fading in over 200ms, holding 2.4 s, fading over 400ms. **One line on screen at a time, ever.** Tapping it within the hold window opens `LOG THIS`.
- **Ask control.** `s6` below, centered. `<HoldButton>` circular, 64px, `rfull`, bg `surface2`, label `ASK` (`micro`). While held: the mic arms, a 3px `trace` ring tracks live input level, and the label becomes `LISTENING`. On release: a `SENT` stamp (`micro`, `trace`) and the control locks for 12 s (`cooling`) showing a thin draining hairline.
- **State machine.** `idle` → `held` → `sent` (12 s non-answer lock) → `idle` → `answered` (word appears) or `expired` (nothing ever answers; no notification that it expired).
- **Interactions.** Hold-to-ask. Tap a returned word to log it. Long-press the band line → a one-line explainer: `Bands are theatre. Nothing here is received.` (this exists for the skeptic's 30-second test, §P, and it is honest and on-brand).
- **States.** *Mic denied* → `ARCHIVE`: the ask control is replaced by a `<Button ghost>` `SCAN`, words fire on elapsed-time gates only, and a one-time `<Panel>` reads `Microphone is off — the box still scans.` *`AudioStream` unsupported* → identical UI, responses delayed one tick, VAD widened (invisible to the user). *Question pending* → the control shows a small `trace` dot until answered or the case closes.
- **Animation.** Ribbon flatten-wait-word is the product's signature audio beat and must be tuned to: flatten `d.instant`, silence 300ms, word fade `d.fast`.
- **Haptics.** `tickLight` on hold start; `tickMedium` on send; **no haptic on a response** — the word arrives in silence, which is scarier, and a haptic would double-signal it.

### K.10 EVP Recorder

**Route** `tool/evp` · **Purpose** §F-10.

- **Layout.** `void`. Top strip (`s4`): `EVP` (`micro`) left; a `mono` `inkDim` right readout of the local time; a blinking 8px `danger` `REC` dot with `RECORDING` (`micro`) beneath the title when armed.
- **Waveform.** `s5` below, full-width, 96px tall, mirrored around a center `line`. 1px `trace`.
- **Marker lane.** `s2` below the waveform, 16px tall. Markers are 2×12 `amber` ticks. System-inserted anomaly markers are 2×12 `inkFaint` ticks with no label. A running label under the lane: `3 marks` (`caption`, `inkFaint`).
- **Buttons.** `s5` below, a row: `<Button primary>` `RECORD` (toggles to `STOP`), `<Button secondary>` `MARK` (flex-2, right-thumb reachable, larger label). `s3` gap.
- **Marker popover.** Tapping a marker opens a `surface2` popover anchored above it: `Play from here` / `Keep as evidence` / `Delete`. 44px rows, `select` on each.
- **Interactions.** `RECORD` arms rolling 30s segments to cache. `MARK` drops a pin with a 120ms `amber` flash on the lane and an inline `+ MARK 04` label that fades after 1.4 s.
- **States.** *Mic denied* → the tool is not in the carousel at all; the Brief's gear-up shows `EVP · unavailable`. *Low storage (< 200 MB)* → a one-line notice `Storage is low — keeping shorter segments.` and segments drop to 60 s. *Interruption (call)* → recording pauses, the file is finalised, and a `SESSION PAUSED` marker is inserted so the gap in the waveform is explained rather than looking like a bug.
- **Animation.** The waveform scrolls right→left continuously. Markers pop with `spring.chip`.
- **Haptics.** `tickMedium` on `MARK`. `tickLight` on record arm/stop.
- **Loading.** None — file writes are async and silent. A write failure shows one inline `caption` line: `Could not save that segment.`

### K.11 Camera / Entity Camera

**Route** `tool/camera` · **Purpose** §F-11. **Unmount on blur is mandatory** (`02-*` §G.0: only one camera preview may exist).

- **Layout.** Full-bleed `<CameraView>` with an absolutely-positioned overlay stack, all `pointerEvents="none"` except controls:
  - **Rule-of-thirds**: 2 vertical + 2 horizontal 1px `line` at 18% opacity, inset `s4`.
  - **Corner brackets**: `trace` at 6% alpha, 24px arms, 2px stroke, inset `s4`.
  - **Top-left strip**: `CAM · 01:24` (`mono`, `inkDim`, on a `void`-at-40% pill for legibility).
  - **Top-right**: heading readout `NNE` (`mono`, `inkDim`).
  - **Bottom-left**: `<SignalBars level>` (3 bars), unlabeled.
  - **Bottom-right**: `<Button ghost>` `TORCH` (toggles icon fill).
  - **Vignette**: radial, 90% `void` at the corners → 0% at 60% radius. Always on.
  - **Optional `NIGHT` look** (Intense/Ritual only): a lifted-shadow LUT applied via an overlay, not a filter — `ink` at 6% multiply. Off below `Present`.
  - **Excluded by default**: scan lines, chromatic aberration, glitch frames, green tint. These are reserved for encounter delivery and the Shadow Person / glitch channel only.
- **Capture button.** Bottom-center, 72px, `rfull`, 2px `ink` ring + 6px inner `ink` disc. On tap: a 90ms white 25% full-screen flash + `tickMedium`. **No shutter sound.**
- **Interactions.** Torch toggles. **Pinch-to-zoom is intentionally not implemented** (zoom invites "let me look closer", which breaks ambiguity). Rotation is locked to the current orientation at open; rotating mid-tool re-lays-out the overlay after 250ms of stability (debounced) so the brackets never jitter.
- **States.** *Camera denied* → **dark-room renderer**: a `void` field with the same overlay stack, the same timing, and encounters delivered as sprite-layer events. One-time `<Panel>`: `No camera access — rewinding to the dark-room view.` *Encounter firing while camera is not live* → handled outside this route (§K.6 state rail + `NOT_FRAMED`). *Encounter resolves while the route is mounted* → the sprite renders according to its `anchor` with the ambiguity preset applied; the overlay dims to 20% for the encounter's duration so the frame is as clean as possible.
- **Animation.** Encounter sprites: 2–4 frames at native speed, no easing, always partially occluded, alpha 35–60%, never centred. A glitch encounter is a single 4-frame sequence at `d.instant` followed by a 90ms settle.
- **Haptics.** `tickMedium` on shutter. **The encounter haptic is delivered when the camera route pops**, because iOS suppresses haptics while the camera is active (`02-*` §G.0) — the presenter holds the cue and fires it on exit, which lands *after* the visual and is therefore more unsettling.
- **Storage.** Captures write to `Paths.document/cases/<ref>/` and insert a `media` row. Default: overlay composited **out** (a clean photo is more believable and more shareable); a `Retain field overlay` toggle in Profile flips this.

### K.12 Tracker (compass + proximity)

**Route** `tool/tracker` · **Purpose** §F-12.

- **Layout.** `void`. Top strip (`s4`): `TRACKER` (`micro`) left; a state chip right — `CHARTED` (`cyan`) / `UNCHARTED` (`inkFaint`) / `APPROXIMATE` (`amber`).
- **Compass.** Centered, 280px. A rotating rose: cardinal letters (`title3`, `ink` for N/E/S/W, `micro` for intercardinals, `inkFaint`), tick marks every 15° (1px `line`, taller at 45°). A fixed 12px `ink` index triangle at 12 o'clock.
- **Bearing chevron.** Drawn on the rose's rim at the target's bearing: a 16px `trace` chevron pointing outward. When no target: absent, and a `caption` line under the rose reads `No contact.`
- **Proximity ladder.** `s5` below the rose. Five stacked hairlines, full-width, 3px tall, `s2` apart. Filled count = band (`COLD` 1, `WARM` 2, `CLOSE` 3, `NEAR` 4, `HERE` 5), fill `trace`, unfilled `line`. Beneath: the band word (`title3`, `ink`) centered. **No numbers, ever.**
- **Trail strip.** A `TRAIL` toggle (top-right of the ladder block) swaps the ladder area for a 120px dead-reckoned path: a 1px `trace` polyline with a 6px dot every 20 s, no map, no scale, no north arrow — an abstract signature, not a location.
- **Buttons.** `s5` below: full-width `<Button secondary>` `LOG TRAIL MARK` (enabled at band ≥ `CLOSE`; else disabled 38%) and, `s3` below, a `mono` `inkFaint` line `SIGNAL AGE · fresh` / `· stale`.
- **Interactions.** Walk. Haptics carry the closing sensation. Long-press the ladder → `Proximity is inferred from movement, not measured.`
- **States.** *Location denied* → `UNCHARTED`: the trail toggle is hidden, bands are time+motion driven, `SIGNAL AGE` still works. *Reduced accuracy* → `APPROXIMATE` chip, same behaviour. *Ambusher stall* → the ladder holds at `WARM` for up to 4 minutes with `SIGNAL AGE · stale` — a **designed dead end**, not a bug.
- **Animation.** The ladder's newest filled line animates its width 0→100% over `d.slow`; the chevron interpolates bearing with `ease.standard`. A closing target's chevron pulses alpha at 1 Hz.
- **Haptics.** `escalate(level)` on band change (1 pulse for `WARM` up to 5 for `HERE`), then silence. `tickMedium` on `LOG TRAIL MARK`.

### K.13 Sky Scanner

**Route** `tool/sky` · **Purpose** §F-13.

- **Layout.** `void` (or `surface2` in daylight). Top strip (`s4`): `SKY` (`micro`) left; right, `GENERATED` (`micro`, `inkFaint`, 50%) — permanent, always visible, non-negotiable (§P).
- **Sky field.** Full-bleed behind everything. 140 procedural star points (deterministic from the session seed), 1–2px, `ink` at 20–70% alpha, static. Below the horizon line (a 1px `line` at 78% height) the field is empty `void`, labelled `HORIZON` (`micro`, `inkFaint`, 30%).
- **Reticle.** Center, 2 brackets 40px, 2px `trace` at 70%. When locked: the brackets close to 20px over `d.slow` and turn solid `trace`.
- **Signal readout.** `s5` above the reticle when a signal is live: `AZ 287°  ALT 51°` (`mono`, `ink`), centered. Beneath it the alignment meter: 8 segments, flex-1, 3px tall, `s1` gap, filled `trace`, unfilled `line`. Beneath that: `ALIGN DEVICE` (`title3`, `inkDim`) → on lock `SIGNAL LOCK` (`title2`, `trace`).
- **Buttons.** Bottom, `s5` inset: `<Button primary>` `CAPTURE` (enabled only during lock; hidden otherwise) and, `s3` above it, a `<Button ghost>` `SCAN` that arms a 120s passive listening window (the tool then finds signals on its own while the user just holds the phone up).
- **Interactions.** Physically pan the device. Alignment rises with proximity to the target az/alt and decays at 0.6× when panning away. On lock, a 3s hold completes and the signal either drifts (`driftDegPerSec`) or dies (`SIGNAL LOST`).
- **States.** *Never aligned* → after 45s of a live signal, `SIGNAL LOST` and the report records `not aligned`. *Daylight* → the sky field lightens to `surface2` and the stars are hidden (a visible starfield in daylight would be a lie). *No DeviceMotion* → alignment uses magnetometer + a coarse shake heuristic; the meter's update rate drops and the copy is unchanged.
- **Animation.** Signal acquisition: the reticle's brackets jitter ±1px at 4 Hz while alignment < 40%, settling as alignment rises (a hand-held, unstable feel). Lock: brackets snap closed with `spring.seal`. Signal death: the readout fades over `d.slow` and the reticle returns to 40px.
- **Haptics.** `tickLight` at each alignment segment gained. `tickHeavy` on lock. `warn` on `SIGNAL LOST`.

### K.14 Case Report — **HERO SCREEN**

**Route** `case/[caseId]/report` · **Purpose** §F-17. This screen is built first (`02-*` §M) and art-directed twice.

- **Layout.** A document. `void` background with a `paper` texture at 3% opacity (a subtle grain, generated once as a 512×512 tiling PNG). Single column, `s5` inset, max 560, centered. Blocks, `s5` between, scroll:
  1. **Masthead.** `CASE NT-017` (`mono`, `inkFaint`) left; the local date right (`mono`, `inkFaint`).
  2. **Status seal.** Centered, `s6` above and below. A 200px ring (2px, `stamp` at 50%) with a 4° rotation. Inside it: the status word in `display` — `UNEXPLAINED` (`trace`) / `INCONCLUSIVE` (`inkDim`) / `EXPLAINED` (`amber`). Beneath, the case name in `title1` `ink`. Beneath that, the hunt meta (`mono`, `inkFaint`). On first render only: the ring scales 0.9→1.0 with the 4° rotation over `d.base` `spring.seal`, then `tickHeavy` + `confirm` at +120ms.
  3. **Stat row.** `<StatRow>` with 4 cells: `DURATION 18:42` · `EVIDENCE 07` · `ENCOUNTERS 01` · `SOURCES 04`. **Counts and durations only.** No percentage, no score, no grade.
  4. **Signature strip.** A `<Panel>` containing 7–9 slots (24px squares, `r1`, `s2` gap). Filled slots show the evidence glyph in `trace`; empty slots show a 1px `line` outline. Beneath: `PARTIAL MATCH · UNIDENTIFIED` (`mono`, `inkFaint`) or `NO MATCH ON FILE` (`mono`, `amber`).
  5. **Account.** 3–6 lines of auto-written prose, `body`, `inkDim`, `s5` line height +2. Each line is a plain declarative sentence built from the session's own facts (`Movement was recorded twice, both times to the north-east.`). Assembled from a template bank keyed on status × strongest channel; **never generated text**, always a selected template with its slots filled from real session values.
  6. **Souvenirs.** Horizontal reel, `s3` gap. Each card 140×140 `surface1` `r2`: the artefact (a playable word, a tappable frame, a small trace) + a `micro` type label. Playable inline (tap to play, 1.4 s max). A `+N` tile past 8.
  7. **Ledger.** A `<Panel>` listing every evidence item as a row: glyph, type (`caption`, `ink`), time (`mono`, `inkFaint`), verdict chip (`UNEXPLAINED` / `INCONCLUSIVE` / `EXPLAINED` / `UNREVIEWED`). Tapping a row opens the evidence detail.
  8. **Negative space.** A `<Panel>` with a `line` border and a `micro` header `NOT RECORDED`. 2–4 `caption` `inkDim` lines from `negativeSpace()` (§F.9). If the list is empty, the panel is **not rendered at all** — never an empty panel.
  9. **Investigator note.** Label `micro` `inkFaint` `WHAT DID YOU NOTICE?`, then a 3-line `<TextInput>` on `surface1`, placeholder `The tools miss things. You don't.` Saved on blur.
  10. **Conditions footer.** 3–4 `mono` lines `inkFaint`: hour, light band, pressure trend, `seed NT-017·a4f2`. Then the entertainment notice in `caption` `inkFaint` at 70%: `An investigation experience. Nothing here is a measurement.` Then `CONTENT V1.0`.
- **Actions.** Primary `<HoldButton durationMs={600}>` `SEAL & FILE`, full width, `s5` above the bottom inset. Secondary `<Button secondary>` `Share card`, `s3` above. Tertiary `<Button ghost>` `Review the evidence` (opens triage) and `<Button ghost>` `Discard case` (destructive, two-step confirm).
- **Sealed state.** After sealing: the primary button becomes a static `<Chip locked>` `SEALED · 4 OCT`, and a `REVISED` stamp appears if the case is later re-triaged.
- **States.** *0 evidence, 0 encounters* → the report still renders in full: `INCONCLUSIVE`, empty signature strip, `NOT RECORDED` panel with up to 4 lines, and one extra line above the stat row in `caption` `inkDim`: `Nothing was recorded tonight. That is a result.` *Recovered case* → a `RECOVERED` ribbon across the masthead (`amber`, `micro`). *Compile beat* → before the report: a `deliberate` (900ms) `void` field where a `mono` line types `NT-017 · 07 evidence · 01 encounter` at 28 chars/s, then the report slides up `spring.sheet`. **No spinner.**
- **Animation.** Entry: masthead fades; the seal scales+rotates; the stat row counts up over 400ms (each cell's number rolls, not types); the signature slots illuminate left→right, 60ms apart. Everything after that is static — a report is a document, not a dashboard.
- **Haptics.** `tickHeavy` + `confirm` on seal entry. `select` per illuminated slot. `seal` on `SEAL & FILE` completion.
- **Long-press.** Any block opens `Share this block` → renders that block alone as a card via `captureRef`.

### K.15 Share card

**Route** `case/[caseId]/share` · **Purpose** §F-18.

- **Layout.** `void` scrim at 92%. Centered card at 78% of screen width, 9:16 by default, entry `spring.sheet`. Card composition, all inside a `r4` container with a 1px `line` border:
  1. `CASE NT-017` (`mono`, `inkFaint`) at `s4` inset.
  2. **Artefact block**, 40% of card height: the strongest artefact — a word in `display`, a captured frame, or a trace line. On `void`. If there is no artefact → a `NEGATIVE SPACE` layout: an empty frame outline (`line`) with `Nothing recorded` centered in `title3` `inkDim`.
  3. **Status word** in `display` with a 120px `stamp` ring, centered.
  4. On `UNEXPLAINED`: a small `trace` dot after the word. On `EXPLAINED`: `amber`.
  5. **Stat row.** 3 cells, counts only: `EVIDENCE 07` · `ENCOUNTERS 01` · `SOURCES 04`.
  6. **Field note.** 1–2 lines, `body` `ink`, italic-free, centered, max 60 chars. Seeded from `rng.report` (so re-sharing renders identically), or the user's own text.
  7. **Footer.** `NIGHTTRACE` wordmark (`micro`, `inkDim`) + the local date + one line in `caption` `inkFaint` at 60%: `An investigation experience. Not a measurement.`
- **Variant selector.** Two chips `Story 9:16` / `Feed 4:5`, `s5` above the card. Switching cross-fades the card at `d.fast`.
- **Note sheet.** Tapping the field note opens a medium sheet: 4 seeded options (radio) + `Write your own` (a 60-char input, no emoji picker, no suggestions). Applying re-renders the card live.
- **Buttons.** Bottom, `s4` inset: `<Button primary>` `Share`, `s3` above: `<Button secondary>` `Save to Photos`, `s3` above: `<Button ghost>` `Back to the case`.
- **Interactions.** `Share` → `captureRef` → PNG in cache → `Sharing.shareAsync`. `Save` → `Asset.create`. Both are fire-and-dismiss; the user returns to the report with a `d.base` fade.
- **States.** *Media-library denied* → `Save to Photos` hides itself entirely (no disabled button, no nag) and a `caption` line appears: `Sharing works without photo access.` *Share sheet dismissed* → nothing happens; no toast, no retry prompt.
- **Animation.** The card is **never animated beyond its entry** — it is a still image and must look like one. The variant switch is the only motion.
- **Haptics.** `confirm` on `Share` completion. `select` on variant change.
- **Hard rules.** No watermark. No QR code. No URL. No "made with". No app-store badge. The only branding is the wordmark and the case ref, both of which are *content*.

### K.16 Field Journal

**Route** `(tabs)/journal` · **Purpose** §F-19.

- **Layout.** `void`. Sticky header: title `FIELD JOURNAL` (`title1`) with the clearance chip right. `s4` below: four segment labels (`Overview · Phenomena · Evidence · Cases`) in `body`, `inkDim` when inactive / `ink` when active, with a 2px `trace` underline indicator that slides between them over `d.base`. `s5` below, the active segment's content.
- **Overview segment.** (a) `<StatRow>` 4 cells: `CASES 12` · `HOURS 04:20` · `EVIDENCE 47` · `ENCOUNTERS 05`. (b) **Activity strip**: 30 columns (one per day), each 6px wide, 24px tall, `r1`; a day with a case is `trace` at 40–100% by case count, a day without is `line`. One `micro` label at each end (`30 days ago` / `tonight`). (c) **Signature archive**: a 4×2 grid of 88px tiles. Filled = the signature glyph (`trace`) + a `micro` name. `?` = a recorded-but-unidentified signature (glyph `amber` at 50%, a `?` in `title2`). Empty = a 1px `line` outline with a `—`.
- **Phenomena segment.** One `<Card>` per creature: 64px silhouette left, name (`title3`), meta (`mono`, `inkFaint`) `Encountered 8× · Evidence 31`, and a `BEHAVIOUR` line (`caption`, `inkDim`) — e.g. `Approaches. Avoids light.` Locked creatures render as a `surface2` card with the keyhole and the requirement; **they are still listed**, because the shape of the product is a feature.
- **Evidence segment.** Three filter chips `Newest · Rarest · Strongest`, then a virtualised timeline (`FlashList`). Each row 72px: glyph, type (`body`), time + case ref (`mono`, `inkFaint`), verdict chip right. Long-press → `Share this`.
- **Cases segment.** Virtualised list. Each row 88px: `NT-017` (`mono`) + status word (`title3`, status-coloured) + case name (`caption`, `inkDim`) + `11:42 PM · 18:42 · 7 evidence` (`mono`, `inkFaint`).
- **Interactions.** Segment switch. Tap any row → detail. Long-press any entry → `Share this`. Tap a `?` tile → medium sheet: `A signature you have recorded but not identified. It will match, or it will not.` **No App Store link anywhere in this sheet.**
- **Empty states (one per segment, each with exactly one action).**
  - Overview: `Your record starts with one night.` → `Begin a case`
  - Phenomena: `Four phenomena on file. None documented yet.` → `Open the field guide`
  - Evidence: `Nothing kept yet.` → `Begin a case`
  - Cases: `No cases sealed.` → `Begin a case`
- **Loading.** Above ~40 rows the list renders `<SkeletonRow>`s (72px, 6% `ink` shimmer at 1.2 s). Never a spinner.
- **Animation.** The segment indicator slides `d.base`. The signature grid's `?` tiles pulse their `amber` at 0.5 Hz — the single "unfinished" animation in the product, and the strongest return hook.
- **Haptics.** `select` on segment change and row tap.

### K.17 Profile

**Route** `(tabs)/profile` · **Purpose** §E20, §N, §O, §P.

- **Layout.** `void`, `s4` inset, grouped `<Panel>` sections separated by `s6`:
  1. **Identity block.** Clearance chip (large, 44px) + `CASES SEALED 12` / `PHENOMENA DOCUMENTED 3` (`mono`, `inkFaint`) + a `<Button ghost>` `What advances clearance?` → medium sheet listing the 5 ranks and what advances each.
  2. **SESSION** — rows (56px, 1px dividers): `Intensity` (value: level name) · `Haptics` (switch) · `Ambience` (switch) · `Low power` (switch) · `Reduce motion` (switch, follows OS by default) · `Retain field overlay on photos` (switch, off).
  3. **DATA** — rows: `Everything is stored on this phone` (static, `inkDim`, no control) · `Export case file` (`JSON` + media, via the system share sheet) · `Delete all data` (destructive, two-step, requires typing `DELETE`).
  4. **ABOUT** — rows: `About & entertainment notice` → `(modals)/about-entertainment` · `Sensors used` → sheet listing each sensor and its in-app purpose · `Content version 1.0` · `Case engine version` · and, at the very bottom, `PRESS AND HOLD FOR DIAGNOSTICS` (a 3 s hold reveals the seed, tick counts, and a `Copy diagnostics` button — the bug-report path).
  5. **Membership** (only when a paywall has been seen): `NightTrace Field Pass` row with the current state (`Free` / `Active · renews 4 Nov` / `Lifetime`) and one action (`See what's included` → the paywall, or `Manage` → the platform's subscription settings).
- **States.** No purchase ever made → the membership block is absent (no upsell shelf on Profile for a free user; the paywall is reached from the journal, not from a settings row).
- **Animation.** Section entry fade+rise 8px, staggered 30ms.
- **Haptics.** `select` on every toggle. `warn` on `Delete all data` confirmation.

### K.18 Intensity sheet

**Route** `(modals)/intensity` · **Purpose** §F-23.

- **Layout.** Medium detent, `basalt`, `s5` inset. Title `Intensity` (`title2`). `s4` below: four rows, 72px each, `s3` between, each `<Panel>`:
  - Row: radio (right, 22px, `trace` when selected, `line` ring otherwise), name (`title3`), one-line description (`caption`, `inkDim`).
  - `Ambient` — `Few signals. Nothing sudden.`
  - `Present` — `The intended night. Signals, and long silences.` *(default)*
  - `Intense` — `More signals. Sharper stings. Glitch events enabled.`
  - `Ritual` — `Everything on. Nothing held back.`
  - Under each name, a `micro` `inkFaint` expectation row: `Signals: sparse · Encounters: possible · Content: none`.
- **Footer.** A `<Panel>` at the bottom, `caption`, `inkDim`: `Higher intensity means more signals. It never means a guaranteed encounter.` And a second line in `inkFaint`: `Intensity is fixed during a case.`
- **Interactions.** Tap a row to select (`select` haptic). Selection writes immediately to `kv-store`. Dismiss by swipe or scrim.
- **States.** Opened during a live session → all rows render as `locked` (38% opacity, radio replaced by a `lock` glyph), the footer's first line is replaced by: `Changing this mid-investigation would mean steering what you find. A case is only worth something if you didn't.` and a single `<Button secondary>` `Close` appears. This is §C.6.

### K.19 Low-power sheet

**Route** `(modals)/low-power` · **Purpose** §F-21.

- **Layout.** Medium detent, `basalt`, `s5` inset. Title `Low power` (`title2`). Body line (`caption`, `inkDim`): `For long nights on a small battery.`
- **Rows** (56px, dividers): `Dim the screen` (switch, on) · `Slower sensors` (switch, on) · `Skip keep-awake` (switch, on) · `Close the camera after 90s idle` (switch, on).
- **Estimate panel.** `<Panel>`: `Estimated remaining` (`micro`, `inkFaint`) + a value in bands only — `about 40 min` / `about 20 min` / `under 10 min` (`title2`). **Never a battery percentage**; the app does not report numbers the user could verify against the OS.
- **Footer.** `<Button ghost>` `Turn off low power` when active, else nothing.
- **States.** OS Low Power Mode detected → an `amber` `<Panel>` at the top: `Battery saver is on. NightTrace is already running slower.` The switches below are still operable. Battery < 5% → a `danger` panel replaces the estimate: `Battery is nearly flat. Seal the case now and keep the file?` with `<Button primary>` `SEAL NOW` and `<Button ghost>` `Keep going`.
- **Haptics.** `select` per toggle. `warn` on the low-battery panel's first appearance (once per session).

### K.20 About & entertainment notice

**Route** `(modals)/about-entertainment` · **Purpose** §P. Reachable from onboarding screen 2, Profile → About, and by long-pressing the footer of any share card.

- **Layout.** Large detent, `basalt`, `s5` inset, scrollable. Sections, `s6` apart, each with a `micro` header:
  1. **`WHAT THIS IS`** — `NightTrace is a paranormal investigation experience — a simulation built for entertainment. It is not a measuring instrument, and it does not detect, prove, or record anything supernatural. Nothing can.`
  2. **`WHAT IT DOES`** — `It generates a case from your location, the time, environmental conditions, and readings from your device's sensors. Those readings are used as material for a story, not as evidence of anything. Every case is different, and no two can be repeated.`
  3. **`SENSORS USED`** — a table-style list: `Motion & orientation — used by Radar, EMF and Tracker` · `Microphone — used by Voice and EVP, only while those tools are open` · `Camera — used by the Camera tool, only while it is open` · `Location — optional, used to seed a case and to show bearings` · `Ambient light — used to describe the conditions of a case`. Each row ends with `Only while in use.` in `inkFaint`.
  4. **`WHAT WE NEVER DO`** — bullets: `No account. No sign-in.` · `No network connection. NightTrace works with no signal.` · `No audio or photos leave this device.` · `No advertising.` · `No analytics sent anywhere.`
  5. **`A NOTE ON SCIENCE`** — `Real paranormal investigators use EMF meters, recorders and cameras as part of a process, not as proof. We respect that. NightTrace borrows the process and the atmosphere, and makes no claim beyond them.`
  6. **`SAFETY`** — `Investigate safely. Watch where you walk, respect private property, and don't enter anywhere you wouldn't go without this app. Never investigate alone in an unsafe place.`
- **Footer.** `CONTENT VERSION 1.0` + `CASE ENGINE V1` in `mono` `inkFaint`, and a `<Button ghost>` `Close`.
- **Hard rule.** This screen's content is not editable by content drops without a copy review against §P. It is the app's complete defence and it must be readable in under 90 seconds.

### K.21 Accessibility and platform behaviour (cross-cutting)

| Concern | Decision |
|---|---|
| Dynamic Type | All text respects the OS scale up to 200%. Layouts that cannot grow (the status rail, the tool row) cap at 140% and switch to a compact variant. No text is ever clipped. |
| Reduce Motion | Slide/pop transitions become cross-fades; the radar sweep becomes a static gradient; the glitch channel is disabled and its encounters re-route to audio; the breathing dot becomes a static dot with an opacity pulse at 0.5 Hz. |
| VoiceOver / TalkBack | Every icon-only control carries a label. Live regions are used for exactly two things: an evidence capture ("Evidence logged: unknown vocalization") and a phase change ("The record is more active"). **The engine's hidden scalars are never announced.** |
| Contrast | `ink` on `void` ≈ 15:1, `inkDim` ≈ 7:1, `inkFaint` ≈ 3.2:1 (used only for non-essential meta and 11px labels). `trace` on `void` ≈ 11:1. `amber` on `void` ≈ 8:1. Nothing essential is below 4.5:1. Colour is never the only carrier of state (chips carry text; bars carry count). |
| Orientation | Portrait-locked everywhere except the Camera and Sky tools, which allow landscape (encounters are better in landscape, and the sky demands it). |
| Safe areas | All bottom-pinned controls sit above the safe-area inset; the tool row uses `s4` + inset. Nothing is ever placed under the home indicator. |
| iPad | Not a target for MVP. The app renders in a phone-width column with `void` gutters rather than being letterboxed. |
| Back gesture | Android hardware back → the same behaviour as the iOS swipe: within a session it opens **Leave the field**, never a silent discard. |
| Interruptions | Calls, Siri, and notification banners pause the session (see §F-06). A banner must never appear over an encounter at full opacity; the presenter dims overlays while `AppState !== 'active'`. |

---

## §L. Asset list

Every asset below is content, not code. The MVP budget is deliberately **small enough for one engineer plus one sound designer plus one illustrator to ship in 30 days**, because the brief's biggest scope trap ("4 deep creatures is far more work than 40 shallow ones") is real. The rules that keep it small:

1. **Sprites are 2–4 frames, black-matte or silhouette-only.** No rigged characters, no 3D, no video, no animated texture atlases. The ambiguity *is* the art direction, and it is also the budget.
2. **One sound, used sparingly, outperforms ten sounds used often.** Word fragments are the only place we spend on count, because a repeated word destroys the Mimic.
3. **Overlays are procedural in code wherever possible.** Scan lines, noise fields, vignettes, chromatic edges, and torch beams are `react-native-svg` / Reanimated shaders we author, not PNG sequences. Only the glitch frame sequence is a raster asset (4 frames, because reproducing film-style tear procedurally looked wrong in the art pass).

**Format conventions.** Sprites: **WebP with alpha**, 1×/2×/3× (RN supports WebP on both platforms via Expo). Static images: WebP; a single PNG fallback only for the share card's paper texture. Audio: **m4a/AAC 96–128 kbps mono** for ambience and stings (size), **wav 44.1 kHz mono** for word fragments and vocalizations (they get pitch/formant-shifted at runtime, and lossy artefacts become audible under shifting). Fonts: **Inter** (variable, 3 weights) + **JetBrains Mono** (2 weights) — subset to Latin-1.

### L.1 Icons (MUST-HAVE MVP)

| Group | Count | Format | Notes |
|---|---|---|---|
| Tool row icons | 7 | SVG (mono, 24px grid, 2px stroke) | EMF · Radar · Voice · EVP · Camera · Tracker · Sky. One style only. |
| Tab bar icons | 4 | SVG + SF Symbols mapping | Home · Investigate · Journal · Profile. Native Tabs supplies the platform look; SVGs are the Android/custom fallback. |
| Evidence glyphs | 14 | SVG | One per evidence type (§L.4). Must read at 20px inside a signature slot. |
| Action icons | 12 | SVG | sweep · log · ask · mark · record · capture · torch · trail · align · close · share · hold |
| Status glyphs | 8 | SVG | unsealed · sealed · revised · recovered · interference · archived · inferred · uncharted |
| Verdict glyphs | 3 | SVG | unexplained · inconclusive · explained (the third carries a `strike` component) |
| Lock / keyhole | 1 | SVG | Used on every locked phenomenon and every locked intensity row |
| **MVP icon total** | **~49** | | Drawn as one family; this is a single illustrator-day. |

### L.2 Silhouettes (MUST-HAVE MVP)

The locked-and-unlocked visual vocabulary. All **black matte, no interior detail, no face, no eyes** — an interior detail would be a claim about what the thing is.

| Asset | Count | Format | Size | Used by |
|---|---|---|---|---|
| Ghost silhouette | 1 | WebP α | 256px | Investigate card, Journal Phenomena card, share card |
| Bigfoot silhouette | 1 | WebP α | 256px | same |
| Shadow Person silhouette | 1 | WebP α | 256px | same |
| Alien craft silhouette | 1 | WebP α | 256px | same |
| Locked keyhole plate | 1 | SVG | 72px | Investigate locked rows |
| Signature glyph set | 9 | SVG | 24px | Signature strip, signature archive (these are abstract marks — a wave, a fork, a spiral — never a picture of a creature) |
| **MVP silhouette total** | **~17** | | | |

### L.3 Overlays (MUST-HAVE MVP)

| Asset | Count | Format | Notes |
|---|---|---|---|
| Vignette | 1 | **procedural (SVG radial)** | Always on in Camera |
| Rule-of-thirds grid | 1 | **procedural** | Camera |
| Corner brackets | 1 | **procedural** | Camera, Sky |
| Scan lines | 1 | **procedural** | Reserved for glitch channel only |
| Noise field | 1 | **procedural** | Camera low-light |
| Chromatic edge | 1 | **procedural** | Glitch channel |
| Glitch frame sequence | **4 frames** | PNG α, 1080×1920 | The only raster overlay — film-style tear does not reproduce procedurally |
| Torch beam gradient | 1 | **procedural** | Camera |
| Dark-room field | 1 | **procedural** | Camera-denied fallback |
| Paper texture | 1 | PNG 512×512 tile | Case Report background, 3% opacity |
| Star field | 0 | **procedural (seeded)** | Sky tool — 140 deterministic points, no asset |
| **MVP overlay file total** | **6 files** | | 10 of 11 overlays cost zero bytes of art. |

### L.4 Evidence glyphs (MUST-HAVE MVP)

One 24px SVG per evidence type. These are the atoms of the signature strip and the evidence rail, so they must be distinguishable at 20px in a single accent colour.

| Type | Glyph idea | Type | Glyph idea |
|---|---|---|---|
| `emf_stir` | a forked vertical bar | `footprint` | an oval + 3 toe marks |
| `emf_surge` | the same bar, doubled | `broken_trail` | a dashed arc |
| `unknown_voice` | a small speech tick | `vocalization` | a long low wave |
| `evp_segment` | a waveform segment | `silhouette` | a filled half-form |
| `shadow` | a soft-edged blob | `movement` | an arrow with a tail |
| `cold_spot` | a snowflake-adjacent asterisk | `proximity_spike` | concentric rings |
| `camera_distortion` | a torn rectangle | `unknown_signal` | a dot with rays |
| `visual_encounter` | a frame with a shape in it | `sky_object` | a small triangle over a line |
| `transmission` | a pulse train | `electromagnetic_anomaly` | a zigzag |
| `peripheral_event` | a corner arrow | `bearing_lock` | a crosshair |
| `null_reading` | an empty frame outline | `magnetic_disturbance` | a compass needle |
| `interference` | a struck-through wave | `wing_sound` *(Mothman, LATER)* | a chevron pair |

**14 types ship in MVP** (all four creatures' evidence unions overlap heavily; the shared set is small by design).

### L.5 Audio (MUST-HAVE MVP)

Audio is where the product actually lives, so this is the largest single line item — and still modest.

| Category | Count | Format | Length | Notes |
|---|---|---|---|---|
| **Ambience beds** | 6 | m4a 96k mono, loopable | 30–60 s | `room_hum` · `room_hum_low` · `forest_night` · `open_field` · `silence` (a real 4 s of dithered near-silence, not a missing file) · `interior_empty` |
| **Stings (encounter)** | 8 | m4a 128k mono | 0.4–2.0 s | One generic + one per archetype + two glitch-channel + one for the critical-battery moment. **Music exists only here** (per the memlog's ban on a constant horror score). |
| **Radar / UI cues** | 10 | wav 44.1k mono | 40–200 ms | ambient tick · target birth · band change · marker drop · shutter · lock · sweep complete · capture · seal · chip |
| **Word fragments (Mimic / Ghost)** | **48** | wav 44.1k mono | 0.3–0.9 s | The single biggest audio investment and the correct one. Dry, close-mic, room tone baked. 1–4 syllables. Runtime band-pass + pitch shift. |
| **Vocalizations (Bigfoot)** | 6 | wav 44.1k mono | 1.8–3.2 s | 3 howls at different distances + 3 knocks + 1 wood sequence. The howl is the most recognisable sound in the product and must never appear twice in one session. |
| **Transmission bursts (Alien)** | 4 | wav 44.1k mono | 2–4 s | Pulse trains, 2.5–6 Hz, irregular interval sequences. Never speech-like. |
| **Foley (Bigfoot/Shadow)** | 12 | m4a 96k mono | 0.2–1.0 s | branch crack · brush pass · distant knock · door shift · breath (2) · steps (3) · cloth · click · low thud |
| **Haptic-adjacent tones** | 3 | wav | 100 ms | used to accompany `escalate`, `seal`, `encounter` when haptics are off |
| **MVP audio total** | **~97 files**, ≈ **22 MB** at these bitrates | | | |

**Audio rules (binding).** No sound plays at launch. No looping music ever. Silence is a first-class bed and is the **default** for the Shadow Person hunt. Every sting's gain is capped at −6 dBFS and the encounter sting is the only sound permitted above −12 dBFS. In `playsInSilentMode: false` the app must remain fully playable (haptics + visuals carry everything), and if the user's device is on silent the Brief warns once (`Your phone is on silent. Ambience will not play.`).

### L.6 Encounter sprite sequences (MUST-HAVE MVP)

| Asset | Frames | Format | Notes |
|---|---|---|---|
| Ghost: shadow cross | 3 | WebP α, 1080×1920 | Frame-edge only, alpha 35–55% |
| Ghost: full manifest (legendary) | 4 | WebP α | Still never in focus; 4 frames, never more |
| Bigfoot: silhouette crossing | 3 | WebP α | Behind an occlusion layer |
| Bigfoot: ridge walker | 3 | WebP α | Beyond 30 m parallax, 14–28 px tall |
| Bigfoot: eyes pair | 2 | WebP α | The only "eyes" asset in the product; 2 frames, so it reads as a glint, not a stare |
| Shadow: edge pass | 2 | WebP α | The shortest encounter in the game |
| Shadow: doorway shape | 3 | WebP α | Occluded by a real doorway edge in-frame |
| Shadow: behind pass | 0 | — | **Haptic-only. Deliberately has no visual asset** — the fear is what you cannot turn around for |
| Alien: light formation | 3 | WebP α | Three small points; the formation, not a craft |
| Alien: fast crossing | 2 | WebP α | Small, fast, motion-blurred by frame timing, not by blur |
| Alien: craft far | 3 | WebP α | 14–20 px; never larger, ever |
| Shared: glitch frame | 4 | PNG α | Reused across Ghost + Alien + Shadow |
| **MVP encounter asset total** | **29 files** (11 sequences) | | ≈ **6 MB** |

**The rule that keeps this list honest:** no encounter asset shows a creature in focus, centred, or facing the lens. This is simultaneously the art direction, the ambiguity guarantee, and the reason the asset budget is 29 files instead of 290.

### L.7 Backgrounds & plates

| Asset | Count | Format | Size |
|---|---|---|---|
| Hunt art plates (16:9) | 4 | WebP, no alpha | 1600×900 @2× |
| Onboarding illustrations | 3 | WebP α, hairline style | 800×800 |
| Empty-state illustrations | 4 | WebP α, hairline | 400×400 |
| Report seal rings | 3 | SVG | procedural-friendly vector |
| Journal signature-archive tile textures | 1 | WebP | 512×512 |
| **Total** | **15 files** | | ≈ **4 MB** |

### L.8 The MVP asset budget (the number to defend)

| Bucket | Files | Approx size |
|---|---|---|
| Icons (SVG) | 49 | < 200 KB |
| Silhouettes + signature glyphs | 17 | ~600 KB |
| Overlays | 6 | ~1.5 MB |
| Audio | 97 | ~22 MB |
| Encounter sprites | 29 | ~6 MB |
| Backgrounds & plates | 15 | ~4 MB |
| Fonts (subset) | 5 | ~700 KB |
| **MVP TOTAL** | **~218 files** | **≈ 35 MB** |

**35 MB is the constraint.** It ships comfortably inside a 200 MB app budget with room for the code, the catalogue DB, and future content. A second creature costs **~4 sprites + ~3 sounds + 1 silhouette + 1 plate ≈ 2.5 MB**, which is why content drops are economically viable and why the "4 deep vs 40 shallow" trap is avoidable: the *engine* is the expensive part and it is written once.

### L.9 LATER (post-MVP, prioritized)

| Item | Why it is deferred | Rough cost when it ships |
|---|---|---|
| Mothman content pack (creature #5) | The proof that archetypes are a pipeline (§J.5) | 4 sprites · 3 sounds · 1 silhouette · 1 plate · 1 JSON |
| Werewolf content pack | Second Ambusher variant; needs a different verb to justify itself | same |
| Lake Monster content pack | Water environment; needs a new environment enum + a "surface" tool variant | same + 1 tool variant |
| 3 premium case-file themes | §N revenue; needs report + journal reskins | 3 plates · 3 seal rings · 3 textures |
| Night-vision LUT (a real, tasteful one) | Currently a 6% multiplies overlay; a proper LUT is polish | 1 asset + shader work |
| Legendary encounter sequences (2) | The 0.5% event deserves its own art | 4 frames each |
| Additional word banks (per creature) | Content drops need their own vocabulary | 24 fragments each |
| Landscape-optimised encounter sprites | Encounters land better in landscape; MVP composites portrait | re-export at 1920×1080 |

### L.10 OPTIONAL (only if a metric justifies it)

| Item | Gate |
|---|---|
| Step-motion footstep synthesis | Only if Tracker telemetry shows the motion path is confusing |
| Real star catalog | **Rejected permanently** — a real star map is a falsifiable claim, and the tool is explicitly labelled `GENERATED` |
| Thermal-camera styling | **Rejected permanently** — brief §6 forbids claiming thermal imaging |
| ARKit / LiDAR apparitions | Post-MVP, opt-in, and only if it never becomes the core loop |
| Share-card video (evidence reel) | Only if `report_shared` is a top-3 event and users ask for it |
| Custom journal fonts / themes (cosmetic IAP) | Only if the Field Pass underperforms and a second revenue line is needed |

---

## §N. Monetization plan

### N.1 The decision, stated once

| Question | **Decision** | Rejected alternative · why |
|---|---|---|
| Free vs paid | **Free to download, free to play a complete game.** | *Paid upfront*: kills the share-driven growth loop, which is the entire acquisition strategy; a ghost app at $4.99 with no reviews converts near zero. |
| Subscription vs IAP | **A single non-consumable "Field Pass" unlock, plus one optional cosmetic-style subscription for ongoing content.** | *Subscription-only*: the memlog correctly identifies "energy timers that block hunts" as a worst-possible-idea, and a recurring fee on a local, offline, finished product reads as a hostage situation. *IAP-only*: leaves no mechanism to fund a content pipeline. |
| What is sold | **Content only**: creatures, expeditions (new environments), and case-file themes. | *Tools, intensity levels, encounter frequency, evidence slots, cases-per-day*: all four would monetize the moment of fear, which is the single forbidden move. |
| Where the wall sits | **After the second sealed case.** | *After the first*: violates the "free first hunt must contain a real encounter and the user must have a real night before being asked for anything" law. *Never*: leaves the product unfunded. |
| Ads | **None. Ever. Not in MVP, not later.** | A mid-session ad during a silence would be the most destructive possible decision in this product. |

### N.2 The free tier (what a non-paying user gets, permanently)

This is deliberately generous, because the product's growth engine is the share card and a user who cannot play cannot share.

| Free, unlimited, forever | Free, limited | Never free |
|---|---|---|
| **Ghost Investigation** — full, unlimited, with real encounters and a full Case Report | **Bigfoot** — 3 cases, then locked | Alien / Sky Contact (preview only: the Brief is viewable, the hunt is not startable) |
| All 7 tool surfaces, always | **Shadow Person** — 1 case (so the user experiences the Observer inversion once, which is the best sales pitch the product has) | Expedition phenomena (any future content-drop creature) |
| The Case Report in full, for every case, forever | Field Notes — 3 per day (a soft ceiling that only matters to a grinder) | Case-file themes (default theme is fully designed, not a crippled version) |
| The share card, watermark-free, unlimited | | Legendary encounter sequences (the flag can still fire on a free hunt; the *themed* presentation is premium) |
| The Field Journal, signature archive, clearance | | |
| Intensity levels: `Ambient` and `Present` | `Intense` and `Ritual` unlock with the Field Pass | |

**Design law check.** The free user's first hunt (Ghost) is the *best* hunt in the product, not a demo. It has a guaranteed encounter (First-Run Directive, §F.10), a full report, and a share card with no watermark. Nothing about the free experience is degraded, and no free user is ever shown fewer signals, weaker haptics, or a shorter silence floor — the engine does not know or care what the user has paid for. **This is non-negotiable:** the moment the paywall touches the event engine, the product's central promise ("uncertainty is the product") becomes a lie, because the user will suspect that paying changes what they find.

### N.3 SKUs and prices

All prices quoted in USD, tier-aligned to Apple's price points. Regional pricing follows the platform's automatic tiers.

| SKU | Type | Price | Contents | Rationale |
|---|---|---|---|---|
| **NightTrace** | Free download | $0 | The full free tier above | Growth |
| **Field Pass** | Non-consumable IAP | **$9.99** (launch price $6.99 for the first 30 days) | Unlocks: Shadow Person unlimited · Bigfoot unlimited · Alien / Sky Contact · `Intense` and `Ritual` intensity · all three case-file themes · the ability to start Expedition hunts | One purchase, permanent, no negotiation. A local, offline, finished product should be *bought*, not rented. This is the SKU the design recommends and the one the product should steer toward. |
| **Field Pass — Supporter** | Non-consumable IAP | **$19.99** | Field Pass + all future creature content packs + the Supporter seal on the report | The "fund the pipeline" tier for the committed user. No gameplay difference from Field Pass beyond future creatures. |
| **Field Notes Monthly** *(optional, ships post-MVP if the content cadence justifies it)* | Auto-renewing subscription, 1 month | **$1.99 / mo** | Everything in Field Pass **plus** a new creature or expedition each month while subscribed, and a rotating monthly case-file theme | Only ships if the team can actually hold a monthly content cadence. **A subscription that does not deliver content is a dark pattern**, and this SKU is explicitly conditional on the pipeline proving it (§J.5's Mothman drop is the gate). |
| **Field Notes Annual** | Auto-renewing subscription, 1 year | **$14.99 / yr** (≈ $1.25/mo) | As above | The annual is priced so it undercuts the monthly decisively: the product wants *fewer, longer* commitments. |
| **Restore Purchases** | Required by the platform | — | Restores any prior entitlement | Always present on the paywall and in Profile → Membership. |

**Why not a $2.99 "unlock one creature" SKU?** Because it turns the product into a storefront and makes each creature feel like a transaction. Field Pass is one decision, made once, and it *ends*. That respects the user and it means the paywall can never become a recurring interruption.

### N.4 Paywall timing and placement (the exact choreography)

The wall is **diegetic and singular**. It is not a modal that interrupts; it is a document the user is offered.

| # | Trigger | Presentation | Copy |
|---|---|---|---|
| 1 | **After the second case is sealed**, when the user lands in the Field Journal, the Phenomena segment auto-scrolls to the two locked entries. A sheet rises from the bottom over `spring.sheet` (`d.slow`). | Sheet, large detent, `basalt` | Header: `Two cases on file.` Body: `Two phenomena unopened.` Then the phenomena list with the third and fourth items visible but keyholed. |
| 2 | The sheet's product block: **Field Pass** with a 3-bullet benefit list (`Shadow Person, unlimited` · `Bigfoot, unlimited` · `Sky Contact`), the price, and `<Button primary>` `Open the Field Pass`. Secondary `<Button ghost>` `Not tonight`. Tertiary link `Restore`. | | |
| 3 | `Not tonight` dismisses. **No second presentation in the same session, ever.** | | |
| 4 | The paywall becomes reachable thereafter only from (a) the journal's Phenomena segment via a single `Open the field guide` card, and (b) Profile → Membership. **Never** from a locked Investigate card, never from Home, never mid-session, never after a failed or quiet case. | | |
| 5 | Maximum paywall presentations per rolling 7 days: **2**. | | |
| 6 | Never shown to a user with 0 sealed cases. Never shown during a live session. Never shown within 60 s of a case seal (the seal must be allowed to land). | | |

**The one rule that overrides all of the above:** the paywall is **never** presented in, during, or adjacent to a moment of fear. No encounter, no window, no glitch, no sting may precede or follow a paywall presentation within 5 minutes. Monetization and the moment of fear are physically separated in the session timeline.

**Paywall copy (exact, complete).**

```
FIELD PASS

Everything in NightTrace, once.

  · Shadow Person, unlimited
  · Bigfoot, unlimited
  · Sky Contact
  · Intense and Ritual intensity
  · Three case-file themes
  · Every expedition

$9.99   One purchase. Kept forever.

[ Open the Field Pass ]
Not tonight        Restore

Cases, evidence and reports are always free.
```

### N.5 Premium content roadmap (what the money buys)

| Drop | Cadence target | Type | Monetized as |
|---|---|---|---|
| Mothman | 1.x, ~4 weeks post-launch | Creature (Ambusher variant) | Included in Field Pass; excluded from the free tier |
| The Lake (water environment + 1 creature) | 1.x | Expedition | Field Pass or Supporter |
| Case-file themes (Vault · Field · Signal) | Launch | Cosmetic | Field Pass |
| Legendary sequences (2) | 1.x | Presentation | Field Pass |
| Creature #7–9 | Post-1.0 | Creature + expedition | Supporter / Field Notes |

**Content that is never monetized, at any tier:** the Case Report, the share card, the journal, the archive, evidence export, the entertainment notice, and the 30-day schedule.

### N.6 Retention vs revenue: the honest trade

| Metric | Target | Note |
|---|---|---|
| Free → paywall_viewed (post case 2) | ≥ 55% | If lower, the journal is not leading the user to the locked rows |
| paywall_viewed → subscription_started (i.e. Field Pass purchased) | 4–9% | A local, offline, single-player product; a higher rate would suggest the free tier is too mean |
| D7 retention, free users | ≥ 25% | The share card is the acquisition engine; retention must be structural (locked silhouettes, `?` slots, unsealed cases) |
| Refund rate | < 2% | Anything higher means the product was sold on a promise the engine does not keep |
| 1★ reviews containing "money" / "scam" / "paywall" | **0%** | This is the metric that tells us whether §N.4 was honoured |

---

## §O. Analytics plan

### O.1 The constraint that shapes everything

The product is **offline-first, zero-login, and privacy-by-default**, and the memlog explicitly lists "no analytics sent anywhere" as a promise made to the user inside the About screen (§K.20). Therefore:

| Rule | Implementation |
|---|---|
| **Local only.** | Events are written to a local SQLite table. Nothing is transmitted in MVP. The About screen's claim — `No analytics sent anywhere` — is literally true and must stay true. |
| **Ring-buffered.** | Keep the most recent **2 000** analytics rows; older rows are deleted on write (`DELETE FROM analytics_events WHERE id NOT IN (SELECT id FROM analytics_events ORDER BY id DESC LIMIT 2000)`). Playback/digest tables are pruned separately (`02-*` §G.4). |
| **No PII.** | No name, no email, no account id, no device advertising id, no IDFV/GAID, no IP (there is no network). Install id is a random UUID generated on first launch, stored in `kv-store`, and **resettable** from Profile → Delete all data. |
| **No coordinates.** | Latitude/longitude are **never** written to analytics. `seed_hash` is a truncated hash, not the input. Location presence is recorded only as a boolean (`has_fixed_location`). |
| **No free text.** | The user's case name, investigator note, and share-note text are **never** logged, never hashed, never truncated into an event. Only their *presence* and *length bucket* (`none` / `short` / `long`). |
| **No content of any kind.** | No audio, no photos, no transcripts, no word-bank fragments chosen. `evidence_type` is logged; the evidence's *media* never is. |
| **Exportable and erasable.** | Profile → `Export case file` writes a single JSON including the analytics table (the user owns it). Profile → `Delete all data` truncates `analytics_events`. |

### O.2 Event schema

```ts
// src/services/AnalyticsService.ts
export interface AnalyticsRow {
  readonly id: number;
  readonly name: AnalyticsEventName;
  readonly atMs: number;          // monotonic-ish, from Clock; no wall-clock correlation needed
  readonly dayOffset: number;     // days since install — the only time dimension retained
  readonly sessionRef: string | null;  // local case ref (NT-017), never a server id
  readonly props: string;         // JSON, schema-validated per event, no free text
  readonly appVersion: string;
  readonly contentVersion: string;
  readonly installRef: string;    // random UUID, resettable
}
```

**Property discipline.** Every event's props are **enumerated, typed, and low-cardinality**. There is a dev-mode assertion that fails a test if any prop value is a free-form string longer than 24 chars, contains a space-and-capital pattern (a likely name), or matches a coordinate regex. This is the mechanical guarantee behind the "no PII" promise.

### O.3 The event list

| # | Event | When it fires | Properties (typed) |
|---|---|---|---|
| 1 | `app_launched` | Cold start, before any UI | `cold_start: boolean` · `first_launch: boolean` |
| 2 | `onboarding_started` | Screen 1 appears | — |
| 3 | `onboarding_intensity_set` | Screen 3 selection changes | `level: 'ambient'\|'present'\|'intense'\|'ritual'` |
| 4 | `onboarding_completed` | Screen 4's `Enter NightTrace` | `duration_ms: number` · `final_level: Level` |
| 5 | `home_viewed` | Home gains focus | `has_unsealed: boolean` · `anomaly_id: string` |
| 6 | `anomaly_opened` | Anomaly card tapped | `anomaly_id: string` |
| 7 | `hunt_picker_viewed` | Investigate gains focus | `unlocked_count: number` · `locked_count: number` |
| 8 | `locked_hunt_tapped` | A locked phenomenon row tapped | `hunt_id: string` · `requirement_kind: 'casesSealed'\|'signatureMatched'` |
| 9 | `brief_opened` | Hunt Brief mounts | `hunt_id: string` · `intensity: Level` · `duration_pref: number` |
| 10 | `brief_calibrated` | Calibration completes | `hunt_id: string` · `result: 'quiet'\|'noisy'\|'inferred'` · `duration_ms: number` |
| 11 | `brief_abandoned` | Brief left without entering | `hunt_id: string` · `after_step: 'calibrate'\|'name'\|'intention'\|'gear'\|'hold'` |
| 12 | **`hunt_started`** | Hold-to-enter completes and the session row commits | `hunt_id: string` · `archetype: 'observer'\|'stalker'\|'mimic'\|'ambusher'` · `intensity: Level` · `duration_pref: number` · `has_fixed_location: boolean` · `has_mic: boolean` · `has_camera: boolean` · `has_magnetometer: boolean` · `legendary_flag: boolean` · `first_run: boolean` · `seed_hash: string` (8 chars) |
| 13 | `session_low_power_enabled` | Low-power toggled on mid-session | `at_ms: number` · `battery_band: 'high'\|'mid'\|'low'\|'critical'` |
| 14 | `session_paused` | `AppState` → background | `at_ms: number` · `cause: 'background'\|'interrupt'` |
| 15 | `session_resumed` | `AppState` → active | `at_ms: number` · `paused_ms: number` |
| 16 | `tool_opened` | A tool route pushes | `tool: ToolId` · `at_ms: number` · `phase: Phase` |
| 17 | `directive_shown` | A directive appears on the rail | `pool: 'open'\|'mid'\|'close'` · `at_ms: number` |
| 18 | `directive_followed` | The named verb is performed within 60 s | `pool: string` · `latency_ms: number` |
| 19 | `question_asked` | Voice `ASK` send | `at_ms: number` · `phase: Phase` · `turns_since_last: number` |
| 20 | `question_answered` | A pending question resolves | `latency_ms: number` · `tool_at_answer: ToolId` · `answered: boolean` |
| 21 | **`evidence_found`** | An evidence row commits | `evidence_type: string` · `certainty_band: 'ambiguous'\|'suggestive'\|'compelling'` · `channel: string` · `tool: ToolId` · `at_ms: number` · `phase: Phase` · `source: 'engine'\|'user_log'\|'user_capture'` · `null_reading: boolean` |
| 22 | `evidence_kept` | Capture card `Keep` | `evidence_type: string` · `latency_ms: number` (time on card) |
| 23 | `evidence_explained` | Capture card / triage `Explained` | `evidence_type: string` · `reason: 'car'\|'building'\|'own_movement'\|'equipment'\|'other'` |
| 24 | **`encounter_triggered`** | An encounter resolves | `encounter_id: string` · `archetype: string` · `channel: 'visual'\|'audio'\|'haptic'\|'glitch'` · `phase: Phase` · `at_ms: number` · `strength_band: 'low'\|'mid'\|'high'` · `framed: boolean` · `preceded_by_window_ms: number` |
| 25 | `encounter_missed` | A window closed with the encounter unframed | `encounter_id: string` · `cause: 'not_framed'\|'not_aligned'\|'camera_down'` |
| 26 | `fail_state_reached` | Any archetype fail state fires | `fail_state: 'noticed'\|'cornered'\|'misdirected'\|'gone'\|'interference'\|'not_aligned'` · `at_ms: number` · `phase: Phase` |
| 27 | `window_opened` | Phase → ENCOUNTER_WINDOW | `at_ms: number` · `tension_band: 'mid'\|'high'` |
| 28 | `window_closed_empty` | A window closed with nothing in it | `at_ms: number` · `duration_ms: number` |
| 29 | `triage_opened` | Triage sheet opens | `item_count: number` · `source: 'report'\|'evidence_detail'` |
| 30 | `triage_verdict` | A verdict is chosen | `verdict: 'unexplained'\|'inconclusive'\|'explained'` · `reason_present: boolean` · `index: number` |
| 31 | `session_ended` | Session ends for any reason | `reason: 'user_seal'\|'auto_close'\|'left_field'\|'recovered'\|'low_battery'` · `duration_ms: number` · `evidence_count: number` · `encounter_count: number` · `emission_count: number` |
| 32 | **`hunt_completed`** | A case report is committed | `hunt_id: string` · `case_ref: string` · `status: 'unexplained'\|'inconclusive'\|'explained'` · `duration_ms: number` · `evidence_count: number` · `encounter_count: number` · `explained_ratio: number` (2dp) · `signature_slots_filled: number` · `signature_matched: boolean` · `silence_longest_ms: number` · `null_reading_count: number` |
| 33 | `report_viewed` | Report route mounts | `case_ref: string` · `status: string` · `is_revision: boolean` |
| 34 | `report_block_long_pressed` | A block's `Share this block` | `block: 'seal'\|'stats'\|'signature'\|'account'\|'ledger'\|'negative'\|'souvenirs'` |
| 35 | **`report_shared`** | Share sheet completes or is dismissed | `case_ref: string` · `variant: 'story'\|'feed'` · `status: string` · `channel: 'system_sheet'\|'saved_photos'\|'block'` · `dismissed: boolean` · `note_source: 'seeded'\|'user'` |
| 36 | `share_card_opened` | Share route mounts | `case_ref: string` |
| 37 | `case_sealed` | `SEAL & FILE` completes | `case_ref: string` · `duration_ms: number` · `revision_count: number` |
| 38 | `case_discarded` | `Discard case` confirmed | `case_ref: string` · `duration_ms: number` |
| 39 | `journal_viewed` | Journal gains focus | `segment: 'overview'\|'phenomena'\|'evidence'\|'cases'` · `cases_total: number` |
| 40 | `signature_unknown_tapped` | A `?` tile tapped | `slot_index: number` |
| 41 | `clearance_advanced` | Rank increments | `rank_from: number` · `rank_to: number` · `cases_sealed: number` |
| 42 | `badge_awarded` | A badge/stamp is earned | `badge_id: string` |
| 43 | **`paywall_viewed`** | The paywall renders | `placement: 'post_case_2'\|'journal_phenomena'\|'profile'` · `cases_sealed: number` · `presentations_7d: number` |
| 44 | `paywall_dismissed` | Paywall closed without purchase | `placement: string` · `dwell_ms: number` |
| 45 | **`subscription_started`** | A purchase completes | `sku: 'field_pass'\|'field_pass_supporter'\|'field_notes_monthly'\|'field_notes_annual'` · `price_tier: string` · `placement: string` · `is_restore: boolean` |
| 46 | `purchase_restored` | Restore completes | `sku: string` · `found: boolean` |
| 47 | `permission_sheet_shown` | A JIT permission sheet opens | `sensor: SensorId` · `tool: ToolId` |
| 48 | `permission_outcome` | The prompt resolves | `sensor: SensorId` · `outcome: 'granted'\|'denied'\|'continue_without'` · `can_ask_again: boolean` |
| 49 | `fallback_engaged` | A sensor fallback path activates | `sensor: SensorId` · `fallback: string` |
| 50 | `intensity_viewed` | Intensity sheet opens | `placement: 'onboarding'\|'profile'\|'session_locked'` |
| 51 | `intensity_changed` | An intensity level is selected | `from: Level` · `to: Level` · `placement: string` |
| 52 | `about_opened` | About & entertainment mounts | `source: 'onboarding'\|'profile'\|'share_footer'` |
| 53 | `data_exported` | `Export case file` completes | `cases: number` · `bytes_band: 'small'\|'mid'\|'large'` |
| 54 | `data_deleted` | `Delete all data` completes | `cases_deleted: number` · `confirmed_by_typing: boolean` |
| 55 | `perf_frame_drop` | Sustained dropped frames during a session | `tool: ToolId` · `drop_ratio: number` (1dp) · `device_class: 'low'\|'mid'\|'high'` |
| 56 | `perf_session_duration` | Session ends | `duration_ms: number` · `battery_start_band: string` · `battery_end_band: string` · `thermal_band: string` |

**56 events, of which 6 are the named headline events from the brief** (`hunt_started`, `hunt_completed`, `evidence_found`, `encounter_triggered`, `report_shared`, `paywall_viewed`, `subscription_started`).

### O.4 The product metrics these events exist to answer

| Question | Derived from | Healthy | Meaning of an unhealthy value |
|---|---|---|---|
| **Is the engine predictable?** | `evidence_found.at_ms` + `encounter_triggered.at_ms` → per-session interval histogram; cohort p50/p90 ratio | **≥ 3.0** | Below → the anti-metric has been violated; ship a pacing change |
| Does silence read as designed? | `hunt_completed.silence_longest_ms`, `window_closed_empty`, sessions with 0 emissions at 10 min | p50 200–260 s; 25–40% empty windows | Below → users experience quiet as broken; raise the ambience cue, do **not** raise the event rate |
| Is the report the growth engine? | `report_shared / hunt_completed` | ≥ 25% | Below → the report is not beautiful enough, or the share flow has friction |
| Does the first hunt land? | `hunt_started.first_run → hunt_completed` + `encounter_triggered` on case 1 | ≥ 80% completion, 100% encounter | A drop here is a bug, not a tuning issue (the First-Run Directive guarantees it) |
| Is the paywall honest? | `paywall_viewed.presentations_7d` + 1★ reviews containing "paywall" | ≤ 2 / 7 days; 0% of 1★ | Either value drifting means §N.4 is being violated |
| What tool is dead weight? | `tool_opened` distribution | No tool < 5% share | A tool nobody opens is a candidate for the axe, or for better onboarding |
| Do directives work? | `directive_followed / directive_shown` | 30–55% | Below 25% → directives are not actionable; above 70% → they are a checklist and violate the Directives Rule |
| Is the invitee path real? | `report_shared.channel` + subsequent `app_launched.first_launch` (installs are not attributable without a link, so this is directional only) | — | Documented honestly as directional; we deliberately do not add a link to the share card |

### O.5 Telemetry that is deliberately **not** collected

| Never collected | Why |
|---|---|
| Coordinates, place names, or any location history | Privacy promise; also the seed's value is that the place never leaves the phone |
| Raw sensor streams, tick digests, or replay data | Only useful for a server we do not have; the tick digest exists for local replay and bug export only |
| Case names, investigator notes, share notes | Free text is the highest-risk PII surface and has no analytical value |
| Which word fragments a user heard | Would let us (or anyone) reconstruct what they experienced; also unnecessary |
| Photos or audio, at any resolution | Constitutional |
| Device model, OS version string | Only `device_class` (`low`/`mid`/`high`) and `thermal_band` are retained, for performance work |
| Any identifier that survives uninstall | `installRef` is random per install, is not written to any shared store, and is destroyed by `Delete all data` |

---

## §P. App Store safety / claim review

### P.1 The governing rule

> **No sentence in NightTrace may assert anything about the real world.** Every claim must be about the app, the case, or the user's own record.

This is the only rule that matters. Everything below is its application. It exists because the memlog identifies the skeptic's 30-second test as the top product risk, and because a single falsifiable claim in a store listing or an in-app string can produce a review-bomb, a rejection, or a regulator's interest in a category that has already attracted both.

### P.2 The RISKY → SAFE table

Every string below is either **currently in the brief or memlog**, or is the kind of copy a coding AI would naturally write. Each gets a safe replacement that keeps the atmosphere.

| # | ✗ RISKY | Why it is dangerous | ✓ SAFE |
|---|---|---|---|
| 1 | `Scientifically detects ghosts` | Falsifiable claim + a science claim. Instant rejection and instant 1★. | `A paranormal investigation experience` |
| 2 | `Proves paranormal activity` | Literal falsifiable claim about the world. | `Builds a case file about your night` |
| 3 | `Detects spirits with certainty` | Claims both detection and certainty — the two things the product is built to avoid. | `Records signals you can't explain` |
| 4 | `Real monster detection` | Falsifiable + implies capability. | `Cryptid exploration, outdoors` |
| 5 | `Ghost detector` / `Paranormal detector` | The category's taint; also a capability claim. | `Paranormal field journal` |
| 6 | `EMF detector` / `Real EMF scanning` | A magnetometer *is* real, so this is a half-truth that invites the exact test that kills the app ("it read 42 µT next to my speaker"). | `EMF tool` (the tool name) + in-app: `Readings are inferred. They are not a measurement.` |
| 7 | `Thermal imaging` / `Heat signature detection` | Phones have no thermal sensor. A flat lie, and §6 of the brief forbids it. | **Delete entirely.** Never reference heat. |
| 8 | `Radiation detection` / Geiger `mSv` values | Phones have no radiation sensor. | The `Geiger heartbeat` metaphor is kept as **copy only**: `The phone becomes a pulse that quickens.` No units, no radiation word. |
| 9 | `Activity level: 93%` / `Strongest anomaly 91%` / `Strength 82%` | A percentage is a measurement claim, and it is exactly the number a skeptic will test. Also violates design law 4. | `Activity: HIGH` (a band) · strongest souvenir labelled `COMPELLING` · `Certainty: SUGGESTIVE` |
| 10 | `NW • 182m` | A metric distance to a thing that does not exist is the single most testable claim in the product. | `NE · NEAR` (8-wind bearing + range band) |
| 11 | `Signal strength 87%` | Same as #9. | `<SignalBars level>` — unlabeled, unnumbered |
| 12 | `Confirmed` / `Verified` / `Authenticated` (anywhere) | Certainty language. | `Unconfirmed` · `Unsigned` · `No match on file` |
| 13 | `Possible match: BIGFOOT` (from the brief's evidence mockup) | Names a real cryptid as a *conclusion*, which reads as a claim about the world. | `Possible match —` (an em dash, deliberately empty) or `Signature: PARTIAL` |
| 14 | `Tonight, your area is active` (from the memlog) | A factual claim about the user's real neighbourhood that the app cannot support. | `Your last case was two nights ago.` (a claim about the user's own record) |
| 15 | `No one in your area has seen it` (from the memlog) | Claims knowledge of other people. Untrue, and creepy. | `No case file matches this signature.` (a claim about the local database — literally true) |
| 16 | `Entity detected nearby` | Detection + presence claim. | `A reading you can't source` |
| 17 | `A ghost is in this room` | The most falsifiable sentence possible. | `The record is unclear here.` |
| 18 | `Real EVP capture` | EVP is a pseudoscience term used as a capability claim. | `EVP recorder` (tool name, as the brief uses it) + `Audio you marked yourself.` |
| 19 | `Spirit box communicates with the dead` | Both a claim and an offensive one to many users. | `Voice tool` + in-app: `Bands are theatre. Nothing here is received.` (The tool is *named* Voice specifically to avoid this.) |
| 20 | `Scientific spirit box` | Oxymoronic and a science claim. | — (never used) |
| 21 | `Our algorithm analyses real paranormal signals` | Claims both a signal and an analysis. | `Cases are generated locally and procedurally.` |
| 22 | `AI-powered detection` | Implies capability, and the product explicitly has no AI. | `Deterministic, offline, procedural` (About screen) |
| 23 | `100% accurate` / `99% of users` / any statistic | Unverifiable and legally exposed. | **Never use statistics in marketing.** |
| 24 | `Warning: this app is not a toy` | Implies the app *is* real while denying it — the worst framing (winks and claims simultaneously). | **Delete.** The framing is stated once, plainly, and never again. |
| 25 | `Do not use if you have a heart condition` (as a scare device) | Using a medical warning as a marketing scare is a rejection risk and ethically poor. | A real, calm safety line inside About: `Investigate safely. Watch where you walk and respect private property.` |
| 26 | `Detects: ghosts, demons, spirits, poltergeists` (keyword list) | Keyword stuffing with claim words; ASO suicide and a review magnet. | Keyword set: `paranormal, ghost hunt, cryptid, investigator, field journal, EMF, EVP, spooky, adventure, night` |
| 27 | `Uses your camera to see entities` | Suggests the camera reveals something real. | `Camera tool` + `Nothing here is proof.` (the onboarding headline, repeated on the About screen) |
| 28 | `Your phone can sense what you can't` | A capability claim about the hardware. | `Your device's readings are used as material for a case.` |
| 29 | `Share your real ghost encounters` | Invites users to present fiction as testimony, which makes the *user* the one making a false claim. | `Share your case file.` |
| 30 | `Find out if your house is haunted` | A direct service claim. | `Investigate your own place, on the record.` |
| 31 | `Real paranormal evidence` (in share-card branding) | Turns user output into a claim. | Share footer: `An investigation experience. Not a measurement.` |
| 32 | `Scanning for entities...` scrolling as fake telemetry | Suggests a sensor process that is not happening. | **Deleted.** No fake progress, no fake scan loops, anywhere. |
| 33 | `GPS-verified hotspot` | Claims verified geography. | `Seed: place · time · conditions` (a description of what the app *does*, which is true) |
| 34 | `Weather-linked events` (if implemented via a real API) | Would require a network call and a data claim. | Local proxy only: `pressure: rising` from the barometer. If unavailable, the line is simply absent. |
| 35 | `Join thousands of investigators` | Unverifiable social proof; the product has no server. | **Delete.** No social proof of any kind. |
| 36 | `Best ghost app 2026` (self-awarded) | Misleading metadata. Rejection risk. | **Delete.** |
| 37 | App name `Ghost Detector Pro` | Name-level claim. | Name: **NightTrace**. Subtitle: **Paranormal field journal.** |
| 38 | `Detect` as a verb anywhere in the UI | Violates design law 2. | `Investigate` · `Record` · `Investigate` |
| 39 | `Record and prove your encounters` | The word "prove". | `Record and keep your cases` |
| 40 | `Sensor data confirms` | Confirmation language. | `The record shows…` |

### P.3 Words that must never appear in the app or the listing

`detect` · `prove` · `proof` · `confirm` · `verify` · `authentic` · `real ghost` · `scientific` · `science` · `thermal` · `radiation` · `Geiger` (as a unit) · `accuracy` · `algorithm` · `AI` · `%` (as a readout of anything the app senses) · `metres`/`meters` (as a distance to a contact) · `haunted` (as a fact) · `evidence of the paranormal` (as distinct from `evidence` as a noun for a souvenir).

### P.4 The three-layer disclaimer architecture

A single disclaimer is not enough — users do not read them, and reviewers look for them. NightTrace places the framing at three depths so it is present at install, in the moment of first use, and permanently.

| Layer | Placement | Copy | Requirement |
|---|---|---|---|
| **1. Store listing** | App Store / Play description, second sentence | `NightTrace is a paranormal investigation experience — a simulation built for entertainment. It does not detect, prove, or record anything supernatural.` | Must be in the **first 3 lines** visible before "more" |
| **2. First launch** | Onboarding screen 1 (cannot be skipped) | `NightTrace is a paranormal investigation experience. It does not measure, prove, or detect anything supernatural — nothing can. It gives you the tools, the ritual, and the case file.` + `I understand` | Cannot be dismissed, cannot be deep-linked past |
| **3. Permanent** | About & entertainment notice (§K.20), reachable from Profile, onboarding, and every share card footer | Full 6-section disclosure including the `A NOTE ON SCIENCE` and `SAFETY` sections | Exported with `Export case file`, so it travels with the user's data |

**Additionally:** the store listing must carry `Entertainment` as the primary category (not `Utilities`, not `Lifestyle`), and the age rating must reflect the content honestly (**12+/Teen** for horror themes and brief limited scares — **never** rated for younger audiences, because a rating below the content is itself a rejection and complaint vector).

### P.5 The specific hazards, and how each is closed

| Hazard | Why it applies here | Closure |
|---|---|---|
| **Fake-science rejection** (Apple 3.1.1 / 5.6-style "misleading" and Google's Deceptive Behaviour policy) | A sensor app making efficacy claims is a classic rejection | The §P.2 table is applied as a **release-gate lint**: a CI script greps `src/**/*.tsx?`, `app.json`, and the store metadata for every word in §P.3 (with a whitelist for `evidence` as a noun and for the About screen's own explanatory text, which must *contain* the words in order to deny them). **Build fails on a hit.** |
| **Health claims** (Apple 1.4.1 / Google medical policies) | A horror app that scares people can drift into health-adjacent framing ("raises your heart rate", "fear response") | Never describe physiological effects. No heart-rate integration in MVP (the memlog's wearable idea is parked, and if it ships it is a *tension input*, never a health feature). |
| **Permission misuse** (Apple 5.1.1 / Google location + microphone policies) | A mic-greedy app with no justification is a rejection and a trust failure | Every permission is JIT (§F-22), has an explicit purpose string, is refusable with a full fallback, and the About screen enumerates each sensor with `Only while in use.` The iOS purpose strings are exact: `NSMicrophoneUsageDescription` → `NightTrace uses the microphone while the Voice and EVP tools are open.` · `NSMotionUsageDescription` → `NightTrace uses motion and orientation while a case is open.` · `NSLocationWhenInUseUsageDescription` → `NightTrace can use your location to seed a case with the place and to show bearings. It is optional.` |
| **Data-collection label mismatch** | Declaring "no data collected" while shipping analytics would be a metadata violation | The privacy label declares **Data Not Collected**, which is true: analytics never leave the device and are erasable (§O.1). The `installRef` is not linked to identity and is generated locally. |
| **User-generated content** (Google's UGC policy) | Share cards could be construed as UGC | There is **no in-app feed, no upload, and no user-visible content from other users.** Sharing leaves the app via the OS share sheet into the user's own channels. Google's UGC requirements are therefore not triggered; this must be stated plainly in the review notes. |
| **Scare-app complaints** | Users can be genuinely distressed, and a *surprise* scare to an unprepared user is a 1★ and a refund | Three mitigations, all mandatory: the intensity chooser at onboarding (§K.18) with `Ambient` available; the entertainment framing before any content; and a hard rule that **no encounter is ever a full-screen pop-up** (design law: brief, ambiguous, peripheral). A reviewer testing the app in a bright office must be able to reach the About screen in two taps from launch. |
| **Review-notes clarity** | A reviewer who cannot find the framing will reject | The App Review notes must state: (a) the app is a simulation for entertainment; (b) it makes no detection claims; (c) all content is local, with no network calls; (d) permissions are optional and JIT; (e) the About & entertainment notice is at Profile → About. |
| **ASO keyword taint** | Buying/using `ghost detector` keywords repositions the product beside the apps it is designed to beat | The keyword set in §P.2 row 26 is the only approved set. `detector` is not in it. |

### P.6 The store listing, written to spec

```
NightTrace — Paranormal Field Journal

Investigate your own place, and leave with a case file.

NightTrace is a paranormal investigation experience — a simulation
built for entertainment. It does not detect, prove, or record
anything supernatural. Nothing can.

Turn where you are into a case. Every case is generated from your
location, the hour, conditions, and readings from your device — so
no two nights are ever the same.

· Seven instruments: EMF, radar, voice, EVP, camera, tracker, sky
· Long silences, and the rare things that answer them
· A Case Report for every night — sealed, stamped and shareable
· A field journal of everything you have recorded
· Four deep phenomena, each played completely differently
· Works offline. No account. Nothing leaves your phone.

Some nights you will find something. Most nights you will not.
Both are the point.

Entertainment. Not a measuring instrument.
```

**ASO notes.** Title = brand + category (`Paranormal Field Journal`), which is the highest-value keyword slot and makes no capability claim. Screenshots must lead with the **Case Report**, then the share card, then the radar, then the journal — because the report is the product. No screenshot may depict a numerical readout, a percentage, or a distance. The first screenshot's caption: `Every night becomes a case file.`

---

## Closing: the three product-test questions, against the design laws

Brief §38 asks three questions of every feature. They map exactly onto the three design laws that carry the product, and the mapping is not a coincidence — it is why the laws were chosen.

**"Does this make the user feel more like they are conducting a mysterious investigation?"**
This is design law 2 (the verb is *investigate*) enforced by law 5 (absence is meaningful) and law 4 (qualitative readouts). Every surface in §K was cut or kept on this question alone: the numeric strength meter died here, the activity gauge died here, the fake scanning loop died here. What survived — the Brief's hold-to-enter, the Voice tool's 300 ms of silence before a word, the radar's confidence cones, the `NOT RECORDED` panel — survived because each one makes the phone behave like a case file rather than a meter.

**"Does this create a reason to come back tomorrow?"**
This is law 6 (the place-and-time seed) and law 7 (four deep creatures) working as one clock at three altitudes: the personal seed, the daily anomaly, and the shared-seed night. The return hook is never a notification and never a streak — it is an unsealed case, a `?` signature slot, a locked silhouette with a stated requirement, and the knowledge that tonight's conditions cannot be repeated. Law 12 (four archetypes) is what makes tomorrow a *different game* rather than the same game with a different skin.

**"Could this produce a moment worth sharing?"**
This is law 3 (the Case Report is the hero and the growth engine), law 10 (sharing is first-class), and law 8 (monetize content, never the moment of fear). The share card is watermark-free, carries no link, and is composed from the same view tree as the report — so the thing the user posts is the thing the product is proudest of. And because law 1 (uncertainty is the product) forbids a guaranteed encounter, the nothing-case share card had to be designed to be *beautiful too*: `Nothing recorded` over the conditions lines is one of the strongest cards in the set, because absence is only a design law if it is also shareable.

**The laws that are not covered by these three questions** are the ones that keep the other eleven honest: law 9 (four tabs) and law 11 (offline, zero-login, JIT permissions) remove the friction that would make any of the above feel like a product instead of an experience; law 13 (Wonder → Move → Notice → Record) is the loop the other tests are measured *against*; and law 14 (no cloud AI, deterministic, seeded, local) is what makes the first question answerable twice — because a session that can be replayed exactly is a session that was generated, not guessed at.

**One sentence to build against.** Every feature that ships must be defensible as: *it made the night feel investigated, it gave a reason to go out again, or it made the case worth showing — and it never once claimed anything was real.*



