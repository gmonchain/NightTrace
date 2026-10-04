# MASTER BRAINSTORM + IMPLEMENTATION PROMPT
## Paranormal & Cryptid Hunting App

You are acting as a **senior product strategist, mobile game designer, UX architect, and React Native/Expo engineer**.

Your task is to help me **turn the following concept into a production-ready mobile app**, not merely brainstorm generic ideas.

The app is a **Paranormal & Cryptid Hunting Experience**: a mobile app that turns the user's phone into a fictional/simulation-based toolkit for hunting ghosts, mysterious entities, cryptids, monsters, and UFO-like phenomena.

The product should feel like a hybrid of:

- paranormal investigation toolkit
- monster/cryptid hunting game
- immersive camera experience
- sensor-driven exploration
- collectible field journal
- shareable social-media content generator

The app must NOT be positioned as scientifically proving ghosts or supernatural entities exist.

It should clearly be presented as:
- entertainment
- paranormal simulation
- exploration experience
- sensor-driven game

The app should NOT depend on cloud AI or generative AI.

Prefer:
- deterministic logic
- procedural systems
- local rules
- phone sensors
- scripted events
- randomization
- local/offline data
- prebuilt assets/audio/animations

The product must be designed so I can realistically implement it in **React Native + Expo**, with native modules only where they materially improve the experience.

---

# 1. PRODUCT VISION

Do NOT design another generic "Ghost Detector" app where the user opens a radar, sees random dots, gets bored after 5 minutes, and deletes the app.

The real product vision is:

> Turn the user's phone into a portable paranormal field kit and monster-hunting game.

The core emotional experience should be:

1. curiosity
2. tension
3. anticipation
4. uncertainty
5. surprise
6. collection
7. progression
8. shareable "I found something" moments

The app must make the user feel:

> "I am actually going out to investigate something."

instead of:

> "I am looking at a fake radar animation."

---

# 2. CORE PRODUCT PILLARS

Design the app around these 4 pillars.

## Pillar A — Hunts

The user starts an investigation instead of opening isolated tools.

Examples:

- Ghost Hunt
- Bigfoot Hunt
- Shadow Person Hunt
- Alien / UFO Hunt
- Mothman Hunt
- Werewolf Hunt
- Unknown Creature Hunt

Each hunt should have:
- different atmosphere
- different instructions
- different event probabilities
- different evidence types
- different sound design
- different visual behavior
- different completion conditions

But underneath, hunts should reuse the same technical engines wherever possible.

---

## Pillar B — Investigation Tools

The app should include a reusable toolkit such as:

### Ghost / paranormal tools
- EMF Scanner
- Ghost Radar
- Spirit Box
- EVP Recorder
- Night Vision Camera
- Entity Camera
- Motion Scanner
- Evidence Logger

### Cryptid tools
- Compass Tracker
- Proximity Scanner
- Footprint Evidence
- Sound / Vocalization Detector
- Movement Signal
- Camera Scan
- Trail Tracker
- Encounter Camera

### UFO / Alien tools
- Sky Scanner
- Compass / azimuth
- signal strength
- radar
- camera encounter
- strange transmission event

Do not expose every tool on the home screen.

Tools should appear **inside the hunt flow** so the user understands why they are using them.

---

## Pillar C — Evidence & Field Journal

The app needs a retention system.

Each investigation can generate evidence such as:

- EMF Spike
- EVP
- Unknown Voice
- Footprint
- Shadow
- Motion
- Visual Encounter
- Unknown Signal
- Vocalization
- Camera Distortion
- Proximity Event
- Electromagnetic Anomaly

Each evidence item should have:

- type
- timestamp
- hunt session
- rarity
- strength
- optional image/audio
- creature association
- confidence contribution

Example:

```text
EVIDENCE FOUND

UNKNOWN VOCALIZATION

Strength
████████░░ 82%

Time
11:42 PM

Possible match
BIGFOOT
```

The Field Journal should track:

- creatures discovered
- encounters
- total hunts
- strongest evidence
- best case score
- rare events
- badges
- creature progress

---

## Pillar D — Encounters

The app should occasionally create a memorable encounter.

Examples:

- ghost silhouette briefly appears
- shadow moves across the camera
- unknown shape disappears behind an object
- Bigfoot silhouette appears far away
- strange eyes appear in darkness
- UFO crosses the sky
- radar suddenly spikes
- Spirit Box generates a disturbing phrase
- phone vibrates while proximity rapidly increases
- screen glitches when something is "near"

Encounters must NOT happen constantly.

Uncertainty is important.

If every session guarantees a ghost, the experience becomes predictable.

Use rarity.

Example probability framework:

```text
Common event      55%
Uncommon event    25%
Rare event        12%
Very Rare event    6%
Legendary event    2%
```

These numbers are examples only.

Design a better probability model if necessary.

---

# 3. CORE GAMEPLAY LOOP

The main loop should be:

```text
Choose Hunt
    ↓
Prepare Investigation
    ↓
Enter Investigation Mode
    ↓
Explore / Move / Scan
    ↓
Sensor + procedural events
    ↓
Find Evidence
    ↓
Possible Encounter
    ↓
Finish Investigation
    ↓
Case Report
    ↓
XP / Unlock / Journal
    ↓
Start Another Hunt
```

Analyze this loop carefully and improve it.

The loop must work for:
- a 2-minute casual session
- a 10–20 minute investigation
- repeated daily use

---

# 4. STARTING CREATURES FOR MVP

Do NOT build 20 creatures initially.

Design the MVP around:

## 1. Ghost

Style:
- indoor
- dark
- slow tension
- EMF
- EVP
- Spirit Box
- entity camera

Possible evidence:
- EMF
- EVP
- cold-spot simulation
- shadow
- visual entity
- unknown sound

---

## 2. Bigfoot

Style:
- outdoor
- exploration
- compass
- movement
- footprints
- distant sounds

Possible evidence:
- footprint
- movement
- howl/vocalization
- broken trail
- silhouette
- proximity spike

---

## 3. Shadow Person

Style:
- indoor
- low light
- camera-heavy
- movement-focused
- sudden appearances

Possible evidence:
- shadow
- motion
- silhouette
- camera distortion
- visual event

---

## 4. Alien / UFO

Style:
- outdoors
- sky scanning
- radar
- electromagnetic signals
- strange transmissions

Possible evidence:
- unknown signal
- sky object
- electromagnetic anomaly
- transmission
- visual encounter

---

# 5. FUTURE CREATURE EXPANSION

Architecture must make it easy to add:

- Mothman
- Werewolf
- Lake Monster
- Haunted Doll
- Unknown Humanoid
- Night Creature
- Forest Entity
- Sewer Creature
- original monsters unique to this app

Prefer data-driven creature definitions instead of hardcoding every hunt.

Example conceptual schema:

```ts
type CreatureDefinition = {
  id: string
  name: string
  category: 'ghost' | 'cryptid' | 'alien' | 'unknown'
  rarity: number
  environments: EnvironmentType[]
  preferredTime?: TimeCondition
  evidenceTypes: EvidenceType[]
  eventPool: EventDefinition[]
  encounterPool: EncounterDefinition[]
  unlockCondition?: UnlockCondition
}
```

Improve this model.

---

# 6. SENSOR STRATEGY

Use real phone sensors where useful, but interpret them as entertainment mechanics.

Potential sources:

- magnetometer
- accelerometer
- gyroscope
- compass / heading
- microphone volume
- camera
- GPS
- time of day
- movement speed
- ambient conditions that the OS exposes safely

Possible Expo libraries:

- expo-sensors
- expo-camera
- expo-location
- expo-haptics
- expo-audio
- expo-av if needed
- expo-file-system
- expo-sqlite
- expo-sharing

Research current Expo compatibility before implementation.

Do not fabricate sensors that phones do not have.

For example:
- do not claim real thermal imaging
- do not claim radiation detection
- do not claim scientifically verified ghost detection

---

# 7. EVENT ENGINE

This is one of the most important systems.

Create a central `InvestigationEngine`.

It should receive:

- hunt type
- elapsed time
- user movement
- sensor values
- evidence collected
- recent events
- rarity state
- environment conditions
- difficulty
- randomness seed

It should output events such as:

```ts
type InvestigationEvent =
  | 'emf_spike'
  | 'radar_ping'
  | 'audio_whisper'
  | 'footstep'
  | 'vocalization'
  | 'movement'
  | 'camera_glitch'
  | 'shadow_event'
  | 'entity_encounter'
  | 'ufo_signal'
  | 'nothing'
```

The engine must prevent:

- excessive events
- repetitive events
- impossible combinations
- legendary encounters appearing too often
- predictable timing

Add:
- cooldown
- event weighting
- escalating tension
- session phases
- anti-repeat rules
- creature-specific event tables

Suggested session phases:

```text
Phase 1 — Quiet
Phase 2 — Signals
Phase 3 — Activity
Phase 4 — Encounter Window
Phase 5 — Resolution
```

But do not force every session to reach an encounter.

Design the engine properly.

---

# 8. TENSION SYSTEM

Create an invisible session value such as:

```ts
tension: 0 -> 100
```

Tension should gradually change based on:
- time
- movement
- sensor anomalies
- evidence
- events
- creature rules

Tension may affect:
- audio
- radar frequency
- haptic intensity
- UI flicker
- encounter probability
- background ambience

Avoid showing the exact tension value to users.

It is an internal pacing mechanic.

---

# 9. EMF SYSTEM

Use magnetometer values.

Calculate magnitude approximately as:

```text
sqrt(x² + y² + z²)
```

Do not directly interpret raw magnetic strength as paranormal activity.

Create:
- rolling average
- local baseline
- noise filtering
- anomaly score
- spike detection
- cooldown

Example concept:

```text
raw magnetometer
       ↓
smoothing
       ↓
baseline
       ↓
delta
       ↓
normalized anomaly score
       ↓
InvestigationEngine
```

Make the UI visually exciting while keeping implementation reasonable.

---

# 10. RADAR SYSTEM

The radar should NOT merely place fully random dots.

Create believable behavior.

Entities/signals should have:
- angle
- distance
- velocity
- lifetime
- signal strength
- uncertainty

A radar target may:
- appear briefly
- move
- fade
- disappear
- approach
- retreat
- split into noise

Radar data can be generated procedurally by the event engine.

Use sensor activity to influence probability, not to make false scientific claims.

---

# 11. SPIRIT BOX

Spirit Box should be immersive but lightweight.

Possible implementation:

- looping radio/static audio
- procedural tuning animation
- randomized pre-recorded word fragments
- creature-specific word pools
- long periods with no response
- rare clearer response

Example:

```text
SCANNING...

87.4 MHz
89.1 MHz
92.8 MHz

— static —

"...leave..."

SIGNAL LOST
```

Do NOT use generative AI.

Use:
- local audio
- scripted word banks
- weighted random selection
- context rules

---

# 12. EVP RECORDER

Allow the user to record audio during investigation.

Features:

- record
- waveform
- timestamps
- evidence markers
- replay
- save to session
- manually mark interesting moments

Optional entertainment feature:
- event engine can insert a "possible anomaly marker"
- but never claim an audio event is scientifically paranormal

---

# 13. CAMERA / ENTITY EXPERIENCE

Camera should be one of the app's strongest features.

Use full-screen immersive camera.

Possible overlays:

- night-vision look
- radar reticle
- scan lines
- noise
- vignette
- subtle chromatic aberration
- signal bars
- compass heading
- recording timer

Do not overdo the visual effects.

An encounter should be:
- brief
- ambiguous
- visually believable
- rare

Examples:
- silhouette at edge of frame
- figure in distance
- shadow crossing
- two glowing eyes
- UFO shape moving quickly

Prefer pre-rendered transparent assets / sprite sequences where practical.

---

# 14. BIGFOOT HUNT GAMEPLAY

Bigfoot should NOT be a ghost mode reskin.

Possible flow:

```text
START BIGFOOT HUNT

Calibrating compass...

Move slowly through the area.

SIGNAL FOUND
NW • 182m

↓

Unknown vocalization

↓

Possible trail

↓

Footprint evidence

↓

Movement nearby

↓

Possible visual encounter
```

Use:
- heading
- GPS movement
- procedural virtual target location
- audio events
- camera encounter
- evidence system

The target does NOT need to correspond to a real creature in the real world.

Treat it as game simulation.

---

# 15. GHOST HUNT GAMEPLAY

Ghost Hunt should feel slower and more claustrophobic.

Possible sequence:

```text
BEGIN INVESTIGATION

Room baseline
████████████ 100%

↓

EMF anomaly

↓

Ask a question

↓

Spirit Box

↓

Possible EVP

↓

Radar activity

↓

Camera scan requested

↓

Possible encounter
```

Use silence aggressively.

Do not make something happen every 10 seconds.

---

# 16. SHADOW PERSON GAMEPLAY

Camera-focused.

Mechanics:
- movement warnings
- direction hints
- peripheral events
- very short sightings
- screen distortion
- rare "behind you" event

Avoid cheap jumpscares every session.

Fear should mostly come from anticipation.

---

# 17. UFO / ALIEN HUNT GAMEPLAY

Use:

- camera toward sky
- heading
- procedural azimuth
- radar
- electromagnetic events
- signal lock
- transmission
- visual sky encounter

Example:

```text
UNKNOWN SIGNAL

AZ 287°
ALT 51°

ALIGN DEVICE

████████░░

SIGNAL LOCK

VISUAL CONFIRMATION POSSIBLE
```

---

# 18. CASE REPORT

At the end of every meaningful hunt, create a report.

Example:

```text
CASE #024

GHOST INVESTIGATION

Duration
18:42

Evidence
07

Strongest anomaly
91%

Visual encounters
01

EVP
02

Activity level
HIGH

STATUS
UNEXPLAINED
```

The case report should feel:
- collectible
- premium
- shareable

Allow:
- save as image
- share
- archive in Field Journal

---

# 19. FIELD JOURNAL

Create a dedicated tab.

Sections:

### Overview
- total hunts
- investigation hours
- evidence
- encounters

### Creatures
- discovered
- unknown
- locked
- encounter count

### Evidence
- newest
- rarest
- strongest

### Cases
- investigation history

Example:

```text
FIELD GUIDE

DISCOVERED
4 / 24

Ghost
Encountered 8x
Evidence 31

Bigfoot
Encountered 2x
Evidence 7

Mothman
LOCKED

???
UNKNOWN
```

---

# 20. PROGRESSION

Add lightweight progression.

Possible:

- XP
- investigator level
- creature discovery
- badges
- equipment skins
- journal themes
- radar themes
- rare evidence
- streaks

Avoid turning the app into a bloated RPG.

Progression exists to:
- reward repeated use
- unlock content
- make collection satisfying

---

# 21. RARE ENCOUNTERS

Design rare events carefully.

Examples:

### Common
- weak radar ping
- low EMF movement
- ambient sound

### Uncommon
- strong magnetic spike
- footprint
- whisper

### Rare
- shadow
- strange vocalization
- visual signal

### Legendary
- full entity appearance
- rare creature encounter
- unique sound/event sequence

The app should track which rare events the user has seen.

---

# 22. DIRECTOR MODE — FUTURE FEATURE

Design architecture so a future multiplayer "Director Mode" is possible.

Concept:

Player A investigates.

Player B secretly controls events.

Possible controls:

- EMF spike
- whisper
- footsteps
- radar signal
- screen glitch
- creature sound
- apparition
- proximity alert

Potential connection:
- room code
- WebSocket
- local network
- nearby session

Do NOT build this in MVP unless architecture makes it easy.

---

# 23. HOME SCREEN

Home should emphasize hunts, not tools.

Possible structure:

```text
Header
Investigator Level

Featured Hunt

GHOST HUNT
Indoor • Night
START

Other Hunts
Bigfoot
Shadow Person
Alien

Continue Investigation

Recent Evidence

Navigation
Home
Journal
Equipment / Tools
Profile
```

Think critically about whether Equipment deserves its own tab.

Do not create unnecessary tabs.

---

# 24. VISUAL DIRECTION

Target:

- dark
- mysterious
- cinematic
- modern
- premium
- slightly tactical
- paranormal-tech

Avoid:
- cheesy Halloween style
- cartoon ghosts everywhere
- neon overload
- overly complicated sci-fi HUD
- tiny unreadable technical labels

Potential palette:

- almost-black background
- desaturated green
- pale cyan
- warning amber
- muted red for danger

Use color sparingly.

The camera view should remain readable.

---

# 25. SOUND DESIGN

Sound is extremely important.

Create categories:

- ambient hum
- static
- radio noise
- distant footsteps
- breathing
- wind
- knocks
- vocalization
- UI chirps
- radar pulse
- EMF warning
- encounter sting

Use silence intentionally.

Do not play constant horror music.

---

# 26. HAPTICS

Use haptics as part of immersion.

Examples:

- weak signal = light
- increasing proximity = escalating pulses
- rare event = distinctive pattern
- encounter = strong short impact

Avoid continuous vibration.

---

# 27. OFFLINE-FIRST

The core app should work offline.

Store locally:

- creature database
- hunt definitions
- event tables
- evidence
- cases
- settings
- progression

Use SQLite.

Potential architecture:

```text
src/
  app/
  components/
  features/
    hunts/
    radar/
    emf/
    spiritBox/
    evp/
    camera/
    evidence/
    journal/
  engine/
    InvestigationEngine.ts
    EventScheduler.ts
    TensionEngine.ts
    RandomEngine.ts
  sensors/
    magnetometer.ts
    motion.ts
    heading.ts
    location.ts
  data/
    creatures/
    hunts/
    events/
  store/
  database/
  audio/
  assets/
```

Improve this architecture if necessary.

---

# 28. STATE MANAGEMENT

Use a clean state model.

Suggested:

- Zustand for app/session state
- SQLite for persistence
- local asset manifests

Separate:

### transient state
- live hunt
- sensor readings
- tension
- current event

from:

### persistent state
- XP
- unlocked creatures
- evidence
- cases
- settings

---

# 29. DATA MODEL

Design robust TypeScript models for at least:

- Creature
- Hunt
- HuntSession
- Evidence
- Encounter
- InvestigationEvent
- SensorSnapshot
- UserProgress
- CaseReport
- Badge

Use strict TypeScript.

Avoid `any`.

---

# 30. MVP SCOPE

MVP should contain:

## Hunts
- Ghost
- Bigfoot
- Shadow Person
- Alien/UFO

## Tools
- EMF
- Radar
- Camera
- Spirit Box
- EVP
- Compass/proximity

## Systems
- Investigation Engine
- Tension System
- Event Scheduler
- Evidence
- Case Report
- Field Journal
- XP / simple progression
- local persistence
- share report

Do NOT include initially:

- chat
- social network
- user-generated monster marketplace
- complex cloud backend
- live multiplayer
- generative AI
- expensive 3D environments
- LiDAR requirement
- ARKit-only core gameplay

---

# 31. MONETIZATION

Brainstorm monetization that does not ruin the experience.

Potential structure:

### Free
- Ghost Hunt
- limited Bigfoot hunts
- core tools
- basic journal

### Premium
- all creatures
- rare expeditions
- premium case-file themes
- extra radar styles
- advanced journal
- special encounters

Potential subscription:

```text
Paranormal Pro
Weekly / Monthly / Annual
```

But critically evaluate whether:
- one-time unlock
- subscription
- hybrid IAP

would be better.

Do not aggressively paywall the first useful experience.

The free user must experience at least one memorable hunt before seeing a strong purchase screen.

---

# 32. STORE POSITIONING

The product must avoid misleading scientific claims.

Avoid phrases like:

- scientifically detects ghosts
- proves paranormal activity
- detects spirits with certainty
- real monster detection

Prefer:

- paranormal investigation simulator
- ghost hunting experience
- sensor-powered entertainment
- cryptid exploration game
- immersive paranormal toolkit

Add appropriate entertainment disclaimer.

---

# 33. VIRALITY

Design moments users naturally want to record/share.

Examples:

- rare Bigfoot sighting
- ghost silhouette
- Spirit Box response
- investigation score
- legendary evidence
- UFO encounter
- rare case card

Share output should be beautiful enough that the user does not need to edit it externally.

Possible share card:

```text
PARANORMAL CASE #184

ENTITY
THE WATCHER

ACTIVITY
93%

EVIDENCE
8

ENCOUNTER
RARE

STATUS
UNEXPLAINED
```

---

# 34. CONTENT SYSTEM

Make the app content-driven.

I should be able to add a creature mostly through data + assets.

For example:

```ts
{
  id: 'mothman',
  category: 'cryptid',
  environments: ['outdoor'],
  preferredConditions: ['night'],
  events: [
    'wing_sound',
    'red_eyes',
    'distant_shadow',
    'radar_spike'
  ],
  evidence: [
    'visual',
    'audio',
    'movement'
  ]
}
```

The system should load:
- event definitions
- encounter assets
- sounds
- descriptions
- rarity
- progression rules

without rewriting the engine.

---

# 35. IMPLEMENTATION PHASES

Create a practical roadmap.

Suggested structure:

## Phase 0 — Foundation
- project architecture
- theme
- navigation
- persistence
- sensor abstraction

## Phase 1 — Investigation Engine
- session
- event scheduler
- tension
- random seed
- cooldown

## Phase 2 — Ghost Hunt
- EMF
- radar
- Spirit Box
- camera
- evidence

## Phase 3 — Case / Journal
- results
- history
- progression

## Phase 4 — Bigfoot
- compass
- GPS movement
- virtual target
- footprints
- audio

## Phase 5 — Shadow Person
- camera events
- motion
- encounter

## Phase 6 — Alien
- sky scanner
- heading
- radar
- visual event

## Phase 7 — Monetization / polish
- paywall
- premium content
- analytics
- onboarding
- performance
- App Store assets

Improve this phase plan if you see a better dependency order.

---

# 36. WHAT I NEED FROM YOU

Do NOT answer with a generic brainstorm.

Produce a serious implementation package.

I want your response in the following order:

## A. Product critique
Analyze:
- what is strong
- what is weak
- biggest product risks
- what should be cut
- what should be emphasized

## B. Final product concept
Summarize the app in a concise product vision.

## C. Information architecture
Design:
- tabs
- screens
- navigation
- modal/sheet structure

## D. Complete user flow
From:
- install
- onboarding
- first hunt
- first evidence
- first encounter
- case report
- journal
- second session

## E. MVP feature specification
For every MVP feature explain:
- purpose
- UI
- user interactions
- internal logic
- required APIs
- stored data
- edge cases

## F. Investigation Engine specification
Go deep.

Define:
- states
- events
- pacing
- randomness
- cooldown
- tension
- rarity
- failure/no-event outcomes

Give pseudocode.

## G. Technical architecture
Provide:
- recommended Expo/RN packages
- folder structure
- state architecture
- SQLite architecture
- sensor abstraction
- service interfaces

## H. TypeScript models
Write production-quality interfaces/types.

## I. Database schema
Design SQLite tables and relationships.

## J. First 4 hunt definitions
Write detailed configurations for:
- Ghost
- Bigfoot
- Shadow Person
- Alien

## K. UI specification
Describe each important screen in enough detail that another coding AI could implement it without screenshots.

Include:
- spacing
- hierarchy
- card types
- button placement
- states
- animations
- haptics
- empty states
- loading states

## L. Asset list
List every asset we need:
- icons
- silhouettes
- overlays
- sounds
- backgrounds
- encounter assets

Classify:
- must-have MVP
- later
- optional

## M. Implementation backlog
Break the project into small engineering tickets.

Each ticket should contain:
- goal
- files/modules affected
- dependencies
- acceptance criteria

## N. Monetization plan
Recommend:
- free vs paid
- subscription vs IAP
- paywall timing
- premium content

## O. Analytics plan
Define events such as:
- hunt_started
- hunt_completed
- evidence_found
- encounter_triggered
- report_shared
- paywall_viewed
- subscription_started

## P. App Store safety / claim review
Flag wording that could cause problems.

## Q. 30-day implementation plan
Create a realistic execution schedule.

---

# 37. ENGINEERING PRINCIPLES

Follow these rules:

1. Keep logic modular.
2. Keep hunt content data-driven.
3. Avoid giant screen components.
4. Avoid tightly coupling sensors to UI.
5. Avoid hardcoded creature behavior.
6. Make all random logic testable.
7. Allow seeded random sessions for debugging.
8. Separate simulation from presentation.
9. Make event frequencies configurable.
10. Prefer offline-first architecture.
11. Use strict TypeScript.
12. Build graceful fallbacks for missing sensors.
13. Preserve battery life.
14. Stop sensors when screens lose focus.
15. Handle denied permissions cleanly.
16. Do not request permissions before they are needed.
17. Do not build fake scientific accuracy into the UI.
18. The experience should feel mysterious, not dishonest.

---

# 38. IMPORTANT PRODUCT TEST

For every feature, ask:

> Does this feature make the user feel more like they are conducting a mysterious investigation?

If the answer is no, remove it.

Also ask:

> Does this create a reason to come back tomorrow?

and:

> Could this produce a moment worth recording or sharing?

The product should balance all three.

---

# 39. FINAL GOAL

At the end of your response, I should have enough specificity to immediately begin implementing the app.

Do not just describe possibilities.

Make decisions.

Where multiple approaches exist:
- compare briefly
- choose one
- explain why

Optimize for:
- strong MVP
- realistic implementation
- viral potential
- retention
- maintainable React Native / Expo codebase
- future creature expansion

The final result should feel like a **real product specification + game design document + engineering plan**, not a loose list of ideas.
