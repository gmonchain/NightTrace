---
name: NightTrace
description: A paranormal field journal. Paperwork-lit, warm-black, one ink colour. The record, not the reading.
status: final
updated: 2026-10-05
sources:
  - ../../prds/prd-NightTrace-2026-10-04/prd.md
  - ../../prds/prd-NightTrace-2026-10-04/addendum.md
  - imports/nighttrace-interactive-prototype/project/NightTrace.dc.html
colors:
  night: '#060A07'
  night-deep: '#030504'
  ledger: '#0B140E'
  plate: '#121C14'
  rule: '#1C2A1F'
  rule-soft: '#142017'
  rule-strong: '#2B3D2D'
  bone: '#CFDCC6'
  prose: '#AAB9A5'
  ash: '#859581'
  dim: '#5A6B58'
  safelight: '#A3FF2B'
  safelight-soft: '#C6FF66'
  olive: '#2A4A0C'
typography:
  display:
    fontFamily: Newsreader
    fontSize: 46px
    fontWeight: 300
    lineHeight: 1.02
    letterSpacing: -0.01em
  title:
    fontFamily: Newsreader
    fontSize: 30px
    fontWeight: 300
    lineHeight: 1.15
  heading:
    fontFamily: Newsreader
    fontSize: 22px
    fontWeight: 400
    lineHeight: 1.3
  account:
    fontFamily: Newsreader
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.55
  prose-small:
    fontFamily: Newsreader
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: IBM Plex Mono
    fontSize: 12px
    fontWeight: 400
    letterSpacing: 0.14em
  meta:
    fontFamily: IBM Plex Mono
    fontSize: 10.5px
    fontWeight: 400
    letterSpacing: 0.16em
  micro:
    fontFamily: IBM Plex Mono
    fontSize: 9.5px
    fontWeight: 400
    letterSpacing: 0.18em
  stamp:
    fontFamily: IBM Plex Mono
    fontSize: 26px
    fontWeight: 600
    letterSpacing: 0.08em
rounded:
  DEFAULT: 2px
  sm: 3px
  md: 4px
  sheet: 14px
  full: 9999px
spacing:
  '1': 4px
  '2': 6px
  '3': 8px
  '4': 12px
  '5': 16px
  '6': 22px
  '7': 28px
  '8': 40px
  '9': 56px
motion:
  quick: 120ms
  base: 180ms
  enter: 240ms
  screen: 380ms
  seal: 900ms
  breathe: 5s
  dot: 3s
  pulse: 2s
components:
  rule:
    color: '{colors.rule}'
    height: 1px
  rule-soft:
    color: '{colors.rule-soft}'
    height: 1px
  seal:
    ring: '{colors.bone}'
    ink: '{colors.safelight-soft}'
    rotation: -4deg
    distortion: ntInk
  stat-cell:
    label: '{typography.meta}'
    value: '{typography.label}'
    color: '{colors.bone}'
    labelColor: '{colors.ash}'
  signature-slot:
    size: 30px
    lit: '{colors.safelight-soft}'
    unlit: '{colors.rule}'
    litBorder: '{colors.olive}'
  ledger-row:
    glyph: '{typography.label}'
    divider: '{colors.rule}'
  evidence-card:
    surface: '{colors.ledger}'
    border: '{colors.rule}'
    radius: '{rounded.DEFAULT}'
  chip:
    border: '{colors.rule-strong}'
    radius: '{rounded.DEFAULT}'
    label: '{typography.meta}'
    color: '{colors.ash}'
  hold-button:
    height: 50px
    border: '{colors.bone}'
    radius: '{rounded.DEFAULT}'
    fill: '{colors.safelight}'
    label: '{typography.label}'
  sheet:
    surface: '{colors.ledger}'
    radius: '{rounded.sheet}'
    grabber: '{colors.rule-strong}'
  tab-bar:
    surface: '{colors.night}'
    active: '{colors.bone}'
    idle: '{colors.ash}'
    badge: '{colors.safelight}'
  grain:
    opacity: 0.55
---

## Brand & Style

NightTrace is a document that happens to be lit — not a device that happens to glow. That single sentence is the whole visual posture, and everything below follows from it.

The product is a paranormal field journal. The user walks into a place with seven instrument-shaped tools, works it for twenty minutes, and leaves with a sealed case file. The design problem is therefore not "make a ghost app look scary." It is: **make a thing that a careful person would trust with the record of their night.** A field notebook. A cold-case folder. An observatory log.

The consequence is a visual language borrowed from paperwork rather than from machinery. Ruled hairlines instead of boxes. Ledger rows. A rubber stamp. A typed footer. Instruments draw shapes — traces, cones, ladders, arcs — but never a scale, an axis, or a needle. **A shape can be read; it cannot be checked.** That distinction is the entire product law rendered as a visual rule, and it is why every readout in this system is a form rather than a figure.

Two surface families, and the difference is load-bearing:

- **In-session surfaces** are dark instrument panels. The camera preview must stay readable; the tool chrome must recede to nothing.
- **Documents** — the Case Report and the Share Card — sit in the sheet family: slightly lifted off the ground, bordered rather than shadowed, and laid out with the generous margins of a printed page.

The register is restrained to the point of asceticism. There is no glow, no scan lines, no drop shadows, no gradient beyond the vignette that keeps a camera preview from bleeding into its frame. Nothing in the interface moves faster than a breath except a haptic.

This spine is derived from a working interactive prototype rather than authored alongside it. **The prototype is a reference, not a specification:** `imports/nighttrace-interactive-prototype/project/NightTrace.dc.html` is the source of this visual language, and every token value below was read from it or chosen against it. Where the prototype contains a contradiction, it is named here as an open question rather than quietly resolved — see the safelight note in **Colors** and the small-type note in **Typography**. Where the prototype's *token values* disagree with a value below, the value below is the system. Two questions were left open by the design brief, and both are named here as open questions rather than silently resolved: the accent hue, and the behaviour of the tool row at accessibility text sizes.

## Colors

The palette splits three ways. Four warm-blacks — `night`, `night-deep`, `ledger`, `plate` — hold the ground and never carry meaning. Three hairlines — `rule`, `rule-soft`, `rule-strong` — do the structural work. Everything else is either a text tone or an accent, and those six values do the disciplined work. It is warm black, never blue: blue-black reads as a screen, and this product has to read as paper under a dim lamp.

- **Night (`#060A07`)** is the ground. Every screen sits on it. It is a warm near-black with a faint green bias — the colour of a dark room, not a powered-down display.
- **Night Deep (`#030504`)** is one step below Night, used only for the page behind the device frame and the base of the camera and Sky fields. It exists so that Night can read as a *surface* rather than as emptiness.
- **Ledger (`#0B140E`)** lifts cards, sheets, and the Share Card off the ground. This is the elevation mechanism. See **Elevation & Depth**.
- **Plate (`#121C14`)** is the inner stop of the radial gradients that stand in for photographs. It never appears as a flat fill; it exists only as the centre of an image substitute.
- **Rule (`#1C2A1F`)** is the hairline. It divides at the lowest contrast that still reads, and it is the most-used structural colour in the system after the text tones. **The page is ruled, not boxed** — a NightTrace surface is separated by lines, not by borders drawn all the way around.
- **Rule Soft (`#142017`)** is the faintest rule, for container edges that should barely register: the frame around a signature grid, the baseline under a waveform.
- **Rule Strong (`#2B3D2D`)** borders controls that are meant to be touched — chips, secondary buttons, sheet edges.
- **Bone (`#CFDCC6`)** is the primary text colour, and it is not a neutral off-white. It is a pale green-tinted grey, and at 225 uses it is the single most common value in the system. Combined with the accent it gives the whole product a green cast. That is a deliberate choice for the subject — this is a night-vision palette, not a monochrome one — but it should be described as what it is rather than as "warm white."
- **Prose (`#AAB9A5`)** carries secondary body text: the Account, sheet descriptions, journal lines. A half-step down from Bone so that a document can have two registers of the same voice.
- **Ash (`#859581`)** is labels and metadata. It is the mono tone — anything the machine wrote rather than the investigator. The prototype's caption claims 5.6:1 on Night; that figure is inherited and unverified, and should be measured before build.
- **Dim (`#5A6B58`)** is the floor: prototype captions, panel headings, the disabled state of the version string. Nothing a user must act on is ever set in Dim.
- **Safelight (`#A3FF2B`)** is the ink. It is reserved, without exception, for moments where something was *recorded*: the seal impression, the REC dot, lit signature slots, the hold-fill bar, the single Field Journal badge, active radar cones, the tracker chevron. It is never decorative, never atmospheric, and never used to indicate brand.
- **Safelight Soft (`#C6FF66`)** is the second, lighter accent. It marks live and resolved outcome text: the current Clearance rank, the `CONTINUE CASE` label, `ACTIVE TONIGHT`, the `UNEXPLAINED` verdict chip, and report stamps.
- **Olive (`#2A4A0C`)** is a border-only tone for boxes that carry a live or positive payload — a Continue Case card, a terminal-stamp box, a sealed-date box.

**Open question — the safelight hue.** The prototype's own rationale column is headed *"Why safelight red"* and argues, correctly, that darkrooms and astronomers use deep red because it spares a dark-adapted eye. The implemented accent is a lime/chartreuse: the internal variable is even named `RED` while holding a green, and `#C6FF66` is a second chromatic accent, which contradicts that same column's claim that the accent is "the only chromatic colour." **The reasoning is sound and the hue does not implement it.** The choice has to be made explicitly: either move `safelight` to a genuine deep red and accept that red also carries "destructive" in most mobile vocabularies, or keep the green and rewrite the rationale to be honest about the dark-adaptation trade-off. Do not ship the argument as written — a design rationale that contradicts its own token is worse than no rationale.

**Never:** any percentage glyph anywhere, in any context, for any reason. No colour used to encode activity level, certainty, or case status *as a value* — those are bands rendered as words, and the words carry the meaning. No red for atmosphere; if a red enters this palette it means destruction and nothing else.

## Typography

Two families, and the split is the product's central typographic idea.

**Newsreader** is *the record*. Headlines, the Account, directives, case names, field-note lines, and every sentence a person would write. Light weights set large (300 at display), italic for narrated silence — an empty state, a conditions line, a quiet aside. If a human voice is speaking, it is set in Newsreader.

**IBM Plex Mono** is *the instrument*. Labels, bands, counts, case references, timestamps, and the stamp itself. Tracked caps throughout, and never below 9.5px at default text size. If the machine is speaking, it is set in mono. This is not a stylistic contrast; it is how the reader tells, at a glance and without being told, which parts of the case file were written by a person and which were written by a box.

The semantic ramp: `display` for a screen's one big sentence, `title` for a case name or a sheet question, `heading` for section heads inside a document, `account` for the narrative body of the Case Report, `prose-small` for sheet descriptions and journal lines, `label` for buttons and field labels, `meta` for chips and timestamps, `micro` for the smallest tracked caps, `stamp` for the status word inside the seal.

Tracking is the system's signature tic and it is not uniform: tracked caps cluster between `0.14em` and `0.2em`, screen titles push to `0.28em`, and the session's state word (`QUIET` / `LISTENING` / `ACTIVE` / `CONTACT`) opens to `0.42em` so that a five-character word spans the width of the field. That last value is the one place where letter-spacing is doing layout work rather than texture work.

**Open question — legibility at the floor.** The prototype sets some mono text at 7.5px and 8px. The type specimen's own rule is "never below 9.5px." Resolve this before build: either raise the floor and let the tightest metadata blocks reflow, or justify the exceptions explicitly. At the smallest sizes the Share Card footer is the specific risk — it carries the legally load-bearing entertainment line, and a disclaimer nobody can read is not a disclaimer.

**Never:** any display or headline face other than Newsreader. No third family. No weight above 500 in Newsreader. No mono below the agreed floor. No `text-wrap` default on a large headline — `balance` for headlines, `pretty` for prose, always.

## Layout & Spacing

The scale is `1` (4) · `2` (6) · `3` (8) · `4` (12) · `5` (16) · `6` (22) · `7` (28) · `8` (40) · `9` (56). It is a soft scale rather than a strict 4px grid, because document typography needs the odd half-step more than it needs arithmetic tidiness.

The governing rule is **rule-direction, not container**. Vertical rhythm between major blocks is set by a hairline and a gap (`spacing.6` or `spacing.7`); horizontal rhythm inside a row is tight (`spacing.2` to `spacing.4`). Lists are separated by rules, not by cards, and a card is reserved for an object that is genuinely an object — an evidence item, a phenomenon, the featured hunt.

Two margins exist. **Document margins** — the Case Report and the Share Card — are generous, single-column, and never exceed a comfortable measure; the report is a page and should set like one. **Instrument margins** — the session shell and every tool — are tight, because the field view is full-bleed and the chrome must not compete with it.

The four-tab bar is fixed at the bottom of the ground, on `colors.night`, with a hairline above it. It is hidden entirely during a Hunt Brief and a live session: the field takes the whole screen.

## Elevation & Depth

**There are no shadows.** Not on cards, not on sheets, not on the seal. Depth is expressed two ways only:

1. **Tone.** A raised surface is a lighter warm-black than the surface beneath it — `ledger` above `night`, `plate` above `ledger`. One step is enough. Two steps is a mistake.
2. **A hairline.** A raised surface carries a `rule` border so that its edge is legible on a dark ground where tone alone can be ambiguous.

The device frame in the prototype carries a shadow, but that is prototype chrome depicting a phone, not part of the product's elevation language.

The one permitted exception is the **camera vignette** — an inset shadow that holds a live preview away from its frame. It is not elevation; it is a lens artefact, and it should be understood as part of the camera tool rather than as a system token.

**Never:** drop shadows for hierarchy, glows, coloured shadows, blur behind sheets, or backdrop-dim as a depth cue. A sheet is dimmed behind by a scrim for focus, not for depth.

## Shapes

Radii are almost absent, and that is the point. **`rounded.DEFAULT` (2px)** covers buttons, chips, cards, and most surfaces — enough to take the machine-edge off a rectangle, not enough to read as a "card." `sm` (3px) and `md` (4px) exist for slightly larger objects. Bottom sheets carry `sheet` (14px) on their top corners only, because a sheet sliding over a field needs a soft leading edge. `full` is reserved for the genuinely circular: the notch pill, the camera shutter, radio dots, the microphone ring.

The aesthetic is **ruled paper, not iOS pills.** Nothing in a document surface is fully rounded, and no control is a capsule.

The `seal` is the system's sole irregular shape. It is a ring rendered through an SVG turbulence-and-displacement filter so that its edge wobbles like pressed ink, and it is rotated `-4deg` so that it reads as applied by hand rather than drawn by a machine. The same filter is applied to the `REVISED` stamp. **The filter is reserved for stamps that record an act the *user or the app* performed on the file** — it is never applied to a word that claims something happened in the world. The seal is the single most graphic element in the product and the only place where the system deliberately breaks its own geometry.

Imagery — evidence frames, plate placeholders, souvenir artwork — follows its container's corner exactly. Photographs do not get their own radius.

## Components

- **Rule** — a 1px `colors.rule` hairline. The primary structural device. Divides list rows, sections, and footer blocks. A `rule-soft` variant exists for container edges that should barely register.

- **Seal** — the status impression at the top of the Case Report and on the Share Card. A ring in `colors.bone` passed through the `ntInk` distortion filter, rotated `-4deg`, carrying the ring text `NIGHTTRACE · FIELD` and the status word in `typography.stamp`. Only `UNEXPLAINED` takes a colour: it reads in `safelight-soft`. `INCONCLUSIVE` and `EXPLAINED` both read in `bone` — the status word is the only difference between them, never a colour, and `EXPLAINED` earns no celebratory styling. A second, smaller impression — the Clearance endorsement — may be stamped inside it. Never animates on appearance except as part of the 600ms seal hold, and never appears clean-edged.

- **Stat cell** — a grid of counts. **Four-up** on the Case Report and the Journal Overview (`CASES` · `HOURS` · `EVIDENCE` · `ENCOUNTERS`); **three-up on the Share Card** (FR-24 — the card is a memento, not the report, and the reduction is deliberate). Profile carries **no stat row** — its identity block shows two values only (`CASES SEALED` · `PHENOMENA DOCUMENTED`). Label in `typography.meta` and `colors.ash` above, value in `typography.label` and `colors.bone` below. Values are counts of things that happened or elapsed time. No percentage. No unit. No exception.

- **Signature strip** — a row of bordered 30px cells. The **Signature slot** is one cell: unlit is `colors.rule` on nothing; lit carries vertical marks in `safelight-soft` with an `olive` border. An unidentified signature renders a `?` and pulses on a **2s cycle (0.5 Hz)**. The strip renders **7–9 slots on the report** (FR-19 — the count is the case's, never a constant) and a fixed 8 in the Journal archive. The archive is the accumulated collection; the strip is the component. It should read like a partial fingerprint match — some marks present, some absent, the pattern suggestive and unresolved. **The pulse rate is a product decision, not a style detail** — it is the product's strongest return hook and must not be accelerated. Do not "smooth" it to a slower breathing cadence.

- **Ledger row** — glyph, type label, time, and a verdict chip. Separated by `rule`, never by a card. A row for an `Explained` item may carry a struck-through glyph; a row whose case was deleted carries a `NO CASE` chip rather than disappearing.

- **Evidence card** — `colors.ledger` on `colors.rule` at `rounded.DEFAULT`. Used for the in-session capture card, evidence-detail art, and journal timeline entries. The capture card is never full-screen; it slides up from the bottom of the current tool and sits over it.

- **Chip** — `rule-strong` border, `rounded.DEFAULT`, label in `typography.meta`. The system's state marker: `READY`, `INFERRED`, `UNCHARTED`, `INTERFERENCE`, `REVISED`. A chip carrying a live payload takes an `olive` **border** rather than the default one. Never a coloured fill, never an icon.

- **Hold button** — 50px, `colors.bone` border at `rounded.DEFAULT`, label in `typography.label` uppercase tracked. On press, a `safelight` fill advances along it — 800ms for `HOLD TO ENTER THE FIELD`, 600ms for `SEAL & FILE`. The fill is the only progress indicator in the product, and it indicates a *gesture*, never a quantity.

- **Sheet** — `colors.ledger`, `rounded.sheet` top corners, grabber bar in `rule-strong`, entering on `ntUp` over a scrim that fades on `ntFade`. Sheets never stack two deep, except Triage over a session.

- **Tab bar** — four tabs on `colors.night` with a top hairline. Active label in `colors.bone` with a `bone` underline; inactive in `colors.ash`. Exactly one badge exists in the product: a single `safelight` dot on Field Journal when a case is unsealed.

- **Field view** — the session's default surface: concentric rings breathing on `ntBreathe` (5s) around a centre dot, with a state word in `typography.label` at `0.42em` tracking beneath. Under Reduce Motion the animation is `none` and the rings sit static.

- **Grain overlay** — a full-screen `feTurbulence` fractal-noise tile (180×180, `baseFrequency .85`, two octaves), tinted to a warm grey and composited at **`opacity .55`** with `pointer-events: none`, above all content. It is a **token, not a decoration**: `{components.grain.opacity}` is fixed, and raising it is a defect because the grain will begin to compete with the type it sits over. It is the only global texture in the product. It never animates.

## Motion

Four durations, and nothing exceeds them except the seal:

| Token | Duration | Used for |
|---|---|---|
| `motion.quick` | 120ms | Chip and toggle state changes |
| `motion.base` | 180ms | Sheet grabber, button press feedback |
| `motion.enter` | 240ms | Tool push, card slide-up |
| `motion.screen` | 380ms | Screen transitions |
| `motion.seal` | 900ms | The seal landing, once, after the 600ms hold completes |

Named animations: **`ntBreathe`** (5s, the field ring — the product's resting heartbeat), **`ntDot`** (3s, the elapsed-time dot), **`ntPulse`** (2s, the unidentified signature tile — see FR-19), **`ntUp`** (240ms, tool cards and sheets rising), **`ntFade`** (240ms, screen and scrim entrances).

**Under Reduce Motion every one of these becomes `none`**, transitions become cross-fades, sweeping animations freeze, and the glitch channel is disabled and re-routed to audio.

**The rate ceiling is a product rule.** Nothing in the interface moves faster than the 5s field breath except a haptic. That is why the radar sweep turns once a minute, the tracker chevron drifts rather than snaps, and no element carries a looping attention animation. **`ntPulse` at 2s is the single deliberate exception** and it is specified by the PRD, not chosen here.

## Do's and Don'ts

| Do | Don't |
|---|---|
| Rule the page with 1px hairlines | Box a section in a border when a rule would do |
| Express elevation as one tone step plus a hairline | Use a drop shadow, glow, or blur for hierarchy |
| Reserve `safelight` strictly for recorded moments | Use the accent decoratively, atmospherically, or as brand |
| Set anything a person would say in Newsreader | Set narrative prose in mono, or labels in the serif |
| Set anything the machine records in IBM Plex Mono | Mix the two roles within a single label |
| Track caps between `0.14em` and `0.2em` | Track body text, or set mono below the agreed floor |
| Render every abstract quantity as a shape or a word | Draw a scale, an axis, a needle, or a numeric readout |
| Keep `rounded.DEFAULT` at 2px on controls and cards | Round a document surface into a pill or a capsule |
| Apply the `ntInk` filter to the seal, and only to stamps | Distort type, rules, or any text the user must read |
| Rotate the seal `-4deg` so it reads as hand-applied | Centre it perfectly or animate it in on every mount |
| Let the grain overlay sit at low opacity over everything | Raise the grain until it competes with the type |
| Keep encounter artwork low-opacity, off-centre, and out of focus | Render a legible subject, a centred figure, or a sharp creature |
| Verify the instrument renders forms the eye can read | Verify anything that looks like a measurement |
| Ship the exact string `An investigation experience. Not a measurement.` | Rephrase, translate, or truncate the entertainment line |

**Two rules that are build-failing, not stylistic.**

1. **The entertainment line is exact.** `An investigation experience. Not a measurement.` The PRD spelling is the only permitted spelling; the corpus also contains an earlier variant reading "Nothing here is a measurement," and it is wrong. This string is lint-checked. A designer or engineer who "improves" it breaks the product.

2. **No percentage sign may appear anywhere in the rendered product** — not in copy, not in an accessibility label, not in a debug string that ships. A percentage has a denominator, and a denominator turns a fact about a session into a claim about the world. Where the system needs to show progress it shows position (four hairlines in onboarding, five phase segments in a session, and in triage a segment per evidence item — a count taken from the case, never a constant). Never a proportion.
