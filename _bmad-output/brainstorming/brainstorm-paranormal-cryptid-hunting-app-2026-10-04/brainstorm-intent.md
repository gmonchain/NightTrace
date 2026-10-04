# NightTrace — Brainstorm Intent

> Downstream input for `bmad-product-brief` → `bmad-prd` → `bmad-spec`. Only chosen decisions and load-bearing insights; everything else from the session is parked.

## Product concept

NightTrace is a **paranormal field journal that turns the mundane into the meaningful** — converting a commute, an attic, a backyard, or a dull night walk into a mystery worth investigating. The phone is **not a detector; it is a case file that writes itself** — a controller for a haunted world-layer overlaid on the real place. Users "hunt," but the true deliverable is the **Case Report**: a story they believe they took part in and that no one can disprove. Sensors (mic, camera, GPS, weather, haptics) are flavor, never proof. The real loop is **Wonder → Move → Notice → Record**, and the app must be good even when nothing happens.

## Core design laws (non-negotiable)

1. **Uncertainty is the product.** Judge every system by whether it *protects* or *spends* uncertainty. **Predictability is the primary anti-metric** — if the user can predict when an event fires, the product is dead.
2. **The verb is INVESTIGATE, not detect.** Detection implies proof; investigation implies process. Position strictly as a field journal whose sensors are flavor.
3. **The Case Report is the hero screen and the growth engine.** Every tool exists only to generate material for it. **Build the report + share card first**, then back-fit tools to feed it.
4. **Qualitative readouts everywhere; expose no number a user could verify.** Replace numeric scores with case status: **Unexplained / Inconclusive / Explained.**
5. **Absence is meaningful.** No-encounter sessions are valid — even good. Silence is a designed feature; mandate long gaps between signals.
6. **Seed every session from place + time + weather + sensor noise** = a one-time, unrepeatable fingerprint and the cheapest source of infinite variety.
7. **Four creatures deep, not many shallow** — each with a unique verb and a unique fail state. Creature definitions are **data-driven; the engine never hardcodes a creature.**
8. **Monetize content** (creatures, expeditions, case themes), **never the moment of fear.** The free first hunt must include a real encounter; place the paywall after the second case.
9. **Four tabs only: Home · Investigate · Field Journal · Profile.** Cut the Equipment tab — tools live inside hunts.
10. **Sharing is first-class** — if a moment can't be screenshotted, it didn't happen. Ship a native, watermark-free share card.
11. **Offline-first, zero-login, privacy by default;** account only to sync/restore. Just-in-time permissions — a mic-only hunt must work. No ads mid-session; monetize only at natural case boundaries.

## The 4 MVP creatures as behaviour archetypes

The MVP creatures are not four products; they are **four behavior archetypes** — future creatures are parameter sets, not code.

- **Observer** — visual-led, slow, haptic-supported; *you must avoid being noticed* (mirror of hunting). e.g. Shadow Person (Indoor + camera + slow + haptic-led).
- **Stalker** — proximity closes on its own; the creature finds you. Phone becomes a Geiger heartbeat that quickens as it nears.
- **Mimic** — audio-in, entity-out: it echoes *your* recorded audio back with a delay; the Spirit Box inverts to ask *you* questions first.
- **Ambusher** — fast, glance-and-gone, visual-led; e.g. Bigfoot (Outdoor + tracker + visual-led).

**What this unlocks:** new creatures ship as **content-only drops needing zero engine work**; hunts become combinatorial (environment × tool set × pacing × archetype × sensory channel × completion condition × failure mode); and new modes fall out for free (Escort, Containment, Observer).

## Three-engine architecture + report-first build order

Everything collapses into **three engines**; all else is data:

1. **Investigation Engine (seeded)** — session generation and the uncertainty-protecting event director; loads archetype behaviors; treats sensor noise as content.
2. **Evidence / Case system** — evidence compounds toward a creature **signature**; a triage + false-evidence deduction mini-layer makes the report feel earned; produces the Case Report, share card, and evidence reel.
3. **Journal / Progression** — private-by-default journal, diegetic **Investigator Clearance** (replaces XP), collection of rare evidence/cards, daily anomaly briefing, shared-seed nights.

**Build order (report-first):** Engine → Report → Journal. Ship the report and share card **before** the tools. This yields the growth flywheel: **tools generate → report packages → share recruits → new hunters generate more.**

## Key differentiators vs. generic "ghost detector" apps

- **No verifiable numbers, no falsifiable claims** — survives the skeptic's 30-second test that kills detector apps.
- **Protects uncertainty instead of spending it**; predictability is the enemy, not the goal.
- **Place + time seed** = unrepeatable fingerprint and the strongest moat against generic apps.
- **Report-first + shareable** growth loop vs. scan-and-forget utility.
- **Deep archetypes with unique verbs and fail states** vs. copy-paste reskins.
- **Nested novelty clock:** personal seed → daily anomaly → global shared-seed night (one idea at three altitudes).
- **Absence is a designed outcome** — the app is good even when nothing happens.
- **Offline-first, private journal, no forced login.**

## Top product risks

- **The skeptic's test (top risk):** any falsifiable claim kills retention and reviews in the first 30 seconds of scrutiny. Never make one — and never claim science; frame the simulation openly.
- **Predictability / boredom:** once users decode the event engine, the magic dies.
- **"Feels fake when tested":** tension between "no winking" immersion and openly-framed simulation.
- **Report quality:** if the hero screen is weak or ugly, the entire flywheel stalls.
- **Uncertainty vs. reward balance:** too little happening reads as *broken*, not atmospheric.
- **Battery / performance** from always-on sensors.
- **Scope:** 4 deep creatures is far more work than 40 shallow ones.

## Open questions / unresolved tensions

- How much direction (sweep here, ask a question) before it feels like a checklist rather than discovery?
- Does an explicit intensity slider fully reconcile "earned dread" with "scare me safely on my own terms"?
- How deterministic should unlocks be vs. rare-creature scarcity and 0.5% legendary events?
- Exactly where does the paywall sit to protect the free-first-hunt magic without giving away the loop?
- How to seed genuine variety without *visible* randomness that breaks the fiction?
- Does the shared audio-input bus (Mimic + whisper/keyword + Director Mode) ship in MVP despite mic friction?
- How much of Director Mode / local co-op is core vs. post-MVP?

## Recommended next steps

1. Prototype the **Case Report + share card** first — it is the hero screen and the growth engine.
2. Define the **4 archetypes as data-driven parameter sets**, each with its unique verb and fail state.
3. Specify the **place + time seed** and the uncertainty-protecting **event director**.
4. Lock the **four tabs** and the qualitative readout vocabulary (Unexplained / Inconclusive / Explained).
5. Stress-test **uncertainty vs. reward balance** in a paper/prototype pass — does silence read as designed?
6. Freeze scope to **4 deep creatures**; park all future creatures as content drops.
7. Feed this doc into `bmad-product-brief` → `bmad-prd` → `bmad-spec`.
