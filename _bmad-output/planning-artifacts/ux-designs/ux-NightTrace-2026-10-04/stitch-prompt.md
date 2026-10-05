# NightTrace — Design Handoff Prompt (Google Stitch)

> **How to use.** Paste everything below the `---` divider into Google Stitch. Stitch will emit a `DESIGN.md` plus one HTML file per screen. Save every output into this folder (`ux-NightTrace-2026-10-04/`). Then return here and say "outputs are in" — EXPERIENCE.md follows via Update mode, and the spines will be reconciled against whatever Stitch returns.
>
> **Assembled by:** bmad-ux, 2026-10-04. **Producer:** Google Stitch (default per `workflow.design_handoffs`).
> **Scope decided by owner:** Case Report + Share Card only.
> **Lavender icon:** rejected by owner. Night-horror framing retained in full.

---

## BRIEF

Design a dark, cinematic, slightly tactical mobile app called **NightTrace**. It is a **paranormal field journal** — an investigation simulation, not a detector. Render **two screens**: the **Case Report** and the **Share Card**. Emit a `DESIGN.md` conforming to the Google Labs DESIGN.md spec, plus one HTML file per screen.

**This is not a horror game.** It is a case-file document that a person holds after a night of investigation. The register is forensic, restrained, and premium — the visual language of a cold-case archive, a field notebook, or an observatory log. It should feel *evidence-like*, never *entertaining*.

---

## 1. THE PRODUCT IN ONE PARAGRAPH

The user opens an app, picks a hunt (Ghost, Bigfoot, Shadow Person, Alien), walks into a place, and works it with instrument-like tools. The app's sensors are *material*, never measurement — **the phone is not a detector; it is a case file that writes itself.** At the end, the user receives a **Case Report**: a sealed, permanent document of their night. That document is the product's reason to exist and its growth engine — it is the thing people screenshot and send to friends.

Critically: **the app must be good when nothing happens.** Most nights produce nothing. A session that records nothing still produces a complete, sealed report, and the report says so plainly. Absence is a designed outcome, not a failure state.

---

## 2. HARD CONSTRAINTS — VIOLATING ANY OF THESE FAILS THE DESIGN

These are not preferences. They come from a ratified product decision log and an adversarial review.

1. **No percentage sign. Anywhere. Ever.** No `91%`, no `ACTIVITY 93%`, no progress rings that read as percentages. A percentage has a denominator and therefore reads as a measurement claim about the world. This was explicitly designed in, reviewed, and removed.
2. **No number that could be read as a measurement.** The only numerals permitted are: **counts of things that happened** (`EVIDENCE 07`, `ENCOUNTERS 01`) and **elapsed session time** (`DURATION 18:42`). Those are facts about the session. Nothing else.
3. **Qualitative bands replace every score.** `LOW` / `MODERATE` / `HIGH` for activity. `AMBIGUOUS` / `SUGGESTIVE` / `COMPELLING` for evidence certainty. `UNEXPLAINED` / `INCONCLUSIVE` / `EXPLAINED` for case status.
4. **The footer always carries this exact line,** on both screens: `An investigation experience. Not a measurement.`
5. **The Share Card carries no watermark, no URL, no QR code, no app-store badge, no "made with" line, no attribution of any kind.** Nothing is ever appended to the user's output.
6. **No light mode.** Dark only. A paranormal field tool that flashes white at 11pm is a broken product.
7. **Never wink.** No `(it's just a game!)` inside the interface. No playful aside. The framing lives in onboarding and About, never in the moment.
8. **Never assert.** Copy says *"The record shows movement"*, never *"something is moving."*

---

## 3. ANTI-REFERENCES — DO NOT PRODUCE THESE

- Cheesy Halloween styling; cartoon ghosts; cobwebs; dripping fonts
- Neon overload; cyberpunk magenta/cyan glow
- Overly complicated sci-fi HUDs; dense telemetry chrome; wireframe globes
- Tiny unreadable technical labels
- Any "ghost hunting gadget" app aesthetic — fake EMF dials, red LED readouts, pulsing radar sweeps
- Skeuomorphic paper, torn edges, coffee stains, wax seals

---

## 4. VISUAL DIRECTION

**Near-black ground. Desaturated green as the primary signal accent. Pale cyan for sky/radar/heading. Warning amber for caution. Muted red for destruction only.**

The organizing metaphor is a **field instrument readout crossbred with an archive document**. Restraint over decoration. Colour is used *sparingly* — the discipline is that colour means something is happening, so static text is never coloured.

**Two surface families, and the difference matters:**
- **In-session surfaces** (not being rendered here, but they set the tone) are dark instrument panels — the camera preview must stay readable.
- **The Case Report and Share Card** are **documents**. They sit in the sheet/modal family: slightly lifted off the background, bordered rather than shadowed.

### Inherited token baseline

These tokens exist in the product's design specification and should be your **starting point**, not your ceiling. Refine them if you can justify it — but stay inside the described direction.

```
Colours
  void      #07090B   app background, session field
  basalt    #0D1114   sheets, modals, pushed surfaces
  surface1  #131A1E   cards, list rows, report blocks
  surface2  #1B242A   controls, active chips
  line      #2A363C   1px hairline — borders, dividers, rails
  ink       #E6EDF0   primary text
  inkDim    #9AA8B0   secondary text
  inkFaint  #5B6B73   mono meta, labels, disabled
  trace     #6FE3C4   PRIMARY accent — "signal"
  cyan      #7FD3E8   sky / radar / heading
  amber     #E8A33D   caution, EXPLAINED status, interference
  danger    #C4553F   destructive only — never atmospheric
  stamp     #C8B98F   report seal ink, stamp impressions

Spacing    4 · 8 · 12 · 16 · 24 · 32 · 48 · 64
Radii      8 · 12 · 16 · 24 · full

Typography
  display     44/48   weight 700   tracking -0.5
  title1      30/34   weight 600   tracking -0.2
  title2      22/28   weight 600
  title3      18/24   weight 600
  body        16/24   weight 400
  caption     13/18   weight 400
  micro       11/14   weight 600   tracking +1.2   UPPERCASE
  mono        14/20   weight 500   tabular numerals

Typefaces  Inter (variable) for prose · JetBrains Mono for all metadata,
           references, numerals, and stamps. The mono/sans split is load-bearing:
           mono = machine-written record, sans = human-authored narrative.

Motion     120 / 180 / 240 / 380 ms — nothing slower than 380 except a
           deliberate 900 ms seal animation
Elevation  NO SHADOWS. Depth comes from a background step plus a 1px border.
           This is a dark UI; shadows read as mud.
```

**Contrast targets** (these were specified as accessibility floors): `ink` ≈15:1, `inkDim` ≈7:1, `inkFaint` ≈3.2:1, `trace` ≈11:1, `amber` ≈8:1. `inkFaint` at 3.2:1 is *deliberately* below body-text threshold — it is used only for rarely-read mono metadata, never for anything a user must act on. Keep it that way; do not "fix" it by brightening.

**The `stamp` colour is special.** It exists for one purpose: the impression of a rubber stamp on a case file. It should read as slightly aged, desaturated gold-khaki, not as a brand colour.

---

## 5. SCREEN 1 — THE CASE REPORT

This is the hero screen. The product's own documentation says of it: *"If this screen is not beautiful, the product does not work."* Design it as a **document, not a dashboard.** Single column, generous inset, max content width 560px, scrollable.

**Content order, top to bottom:**

1. **Masthead** — `CASE NT-017` in mono, + the date. Small, flush left. This is a case reference, like a police file number.
2. **Status Seal** — the emotional centre of the screen. The case name in `title1` (e.g. `Spare Room`), and above it the **status word in `display` at 44px** with a **stamped ring** around it.
   - `UNEXPLAINED` → `trace` (the desaturated green)
   - `INCONCLUSIVE` → `inkDim` (grey)
   - `EXPLAINED` → `amber`
   - This ring should look like a physical stamp impression — slightly irregular ink, not a clean vector circle. It is the single most graphic element in the product.
3. **Stat row** — four cells: `DURATION 18:42` · `EVIDENCE 07` · `ENCOUNTERS 01` · `SOURCES 04`. Mono, tabular. **Counts only.** Beneath or beside it, an **activity band**: `LOW` / `MODERATE` / `HIGH`.
4. **Signature Strip** — 7–9 glyph slots in a row, illuminated or dark according to how much evidence converged. Beneath it: `PARTIAL MATCH · UNIDENTIFIED`. This should read like a partial fingerprint match — some slots filled, some empty, the pattern suggestive and unresolved. Other possible readings: `MATCHED`, `NO MATCH ON FILE`.
5. **Account** — 3–6 lines of plain authored prose describing the night. Set in `body`, generous line height. This is the human-readable narrative.
6. **Souvenirs** — a horizontal scrolling reel of captured evidence cards, each viewable.
7. **Ledger** — a list of every evidence item with its type, time, and a triage verdict chip (`EXPLAINED` / `UNEXPLAINED`).
8. **Negative Space** — a bordered panel stating what was *not* recorded. Visually distinct from the ledger — this block is about absence, so it should feel quieter and more spacious than everything around it. Representative copy: `Nothing was recorded tonight. That is a result.`
9. **Investigator Note** — an editable open field. Label: `INVESTIGATOR NOTE`. Prompt: `What did you notice?` Placeholder: `The tools miss things. You don't.`
10. **Conditions footer** — three mono lines of environmental conditions, then the case reference, the content version, and finally in `caption`: `An investigation experience. Not a measurement.`

**Primary action:** `SEAL & FILE` — a **hold-to-confirm** button requiring a sustained press of roughly 600ms (design the pressed state: a ring filling, or a bar advancing). Once sealed, this becomes a static `SEALED` chip. Secondary action: `Share card`.

**Design at least one state variant.** The most important variant in the product is the **nothing-case**: zero evidence, zero encounters, `INCONCLUSIVE`. Per the product law, this report is *not* an empty state and must not look like one — it renders **in full**, with a prominent negative-space panel. Representative copy: `Nothing was recorded tonight. That is a result.`

---

## 6. SCREEN 2 — THE SHARE CARD

A single image, composed to be posted without any editing. **78% of screen width**, default **9:16 portrait** with a **4:5 feed variant** (include a variant selector). Presented centred on a `void` scrim.

**Card composition, top to bottom:**

1. **Case reference** — `mono`, `inkFaint`, small.
2. **Artifact block** — the case's strongest artifact, in this priority: a captured frame, a spoken word, or a trace pattern. When there is no artifact, a **negative-space treatment** stating nothing was recorded.
   - If you depict a captured frame: it must read as a **glimpse, not footage**. Low alpha, off-centre, never in focus, never a legible subject. A blurry creature photo under an `UNEXPLAINED` stamp is the single strongest claim this app can accidentally make, and it is the one thing the design must prevent. Treat this as a hard rule.
3. **Status word** in `display` with the same stamped ring as the report.
4. **Three-cell stat row** — counts only, no percentage.
5. **Field note** — one line, either seeded from the case or user-written (up to 60 characters).
6. **Footer** — the `NIGHTTRACE` wordmark, the local date, and in `caption` at 60% opacity: `An investigation experience. Not a measurement.`

**The card carries no watermark, no URL, no QR code, no app-store badge, no attribution.** The footer entertainment line is the only "branding" and it is legally load-bearing.

**Design the nothing-case variant too.** Per the product documentation, *"the nothing-case share card is deliberately one of the best-looking cards in the app, because absence must be shareable or the whole law collapses."* Its field note is: `Some nights are for listening.`

---

## 7. VOICE AND TONE — APPLIES TO EVERY VISIBLE STRING

Write all copy yourself in this voice. Do not use lorem ipsum. The register is a **field log written by a careful, slightly detached observer**.

- **Never assert.** `The record shows movement` — not `something is moving`.
- **Never wink.** No humour, no asides, no exclamation marks, no emoji.
- **Never explain the mechanic.** The user is never told about phases, probability, or rarity.
- **Hedge is craft, not weakness.** `Possible` · `unconfirmed` · `unsigned` · `no match on file` · `the record is unclear`.
- **Short sentences.** Maximum nine words on any single line.
- **Silence is narrated, not empty.**
- The word **"ghost"** appears only as a hunt name. Inside the record the vocabulary is `signal`, `contact`, `movement`, `the record`.

---

## 8. DELIVERABLES

1. **`DESIGN.md`** conforming to the Google Labs DESIGN.md spec — YAML frontmatter carrying `colors`, `typography`, `rounded`, `spacing`, and `components` tokens, followed by a markdown body in canonical order: Brand & Style · Colors · Typography · Layout & Spacing · Elevation & Depth · Shapes · Components · Do's and Don'ts. In the body, explain *why* each colour exists and what it is **not** used for — the exclusions are as important as the inclusions.
2. **One HTML file per screen**, at 1:1 fidelity, rendering the Case Report and the Share Card with real copy in the voice above.
3. **State variants**: the nothing-case for both screens.

**Where you refine the inherited tokens, say so explicitly in `DESIGN.md`** so the change is reviewable rather than silent.
