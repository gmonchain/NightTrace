# Proposed PRD patches — three source conflicts

**Status: PROPOSAL. Not applied.** `prd.md` is an **adopted companion** — it is owned by the PRD run, and bmad-spec does not edit it. Each patch below is written as an exact before/after so it can be applied or rejected independently.

These are the three conflicts SPEC.md's Open Questions has been carrying. Two of them were re-verified against the sources this pass rather than relayed from earlier notes, and one of them is **worse than "conflict"** — it is a correctness bug that would produce a hunt where the documented play style is the losing play style.

---

## Patch 1 — FR-6 inverts the Shadow Person mechanic (the consequential one)

**Location:** `prd.md:263` (FR-6 consequences)

**Current:**
> - Observer is slow and tightening, camera- and glitch-led, and fails as `NOTICED`; the user's job is to avoid being seen.

**Proposed:**
> - Observer is slow and tightening, haptic- and glitch-led, and fails as `NOTICED`; the user's job is to avoid being seen. **The inversion is the mechanic: raising the camera, switching on the torch, or moving in the dark *increases* the Phenomenon's noticing, and stillness is the only safe stance.** The app never teaches this; the user learns it from one `NOTICED` ending.

**Why this is not a matter of taste.** `01` §J.3 gives the Observer's noticing rate as an explicit formula:

```
noticingRate =
    0.0022 * (torchOn  ? 1 : 0)     // light draws it
  + 0.0016 * (cameraLive ? 1 : 0)   // a lens is a gaze
  + 0.0030 * clamp01(movedMetres / 2)
  + 0.0010 * (deviceScreenBright ? 1 : 0)
  - 0.0018 * (stillnessMs > 30_000 ? 1 : 0)   // standing still is safe
```

**A live camera is a hazard, not the instrument.** The source states the consequence outright: *"the correct way to play Shadow Person is the opposite of every other hunt: stand still, torch off, **camera down**."* The comparative matrix agrees — Shadow Person's primary channel is **Haptic + glitch**, and the *"Sensory direction"* line reads *"Haptic + glitch primary… the screen-glitch hunt."*

So the PRD **already contains the correct version** — FR-8 says Shadow Person is *"haptic and glitch-led"* — and FR-6 is the one that is wrong. **This patch fixes FR-6 to match FR-8**, it does not choose between two equals. That matters for review: the authority is FR-8 plus `01` §J.3, not a preference.

**The failure mode if unfixed.** A story author reading FR-6 builds the hunt *camera-led* — camera prominent, camera rewarded. The user then holds the camera up, which is precisely what raises `noticingRate` toward the `NOTICED` fail state. The documented play style becomes the losing play style, and the hunt's whole "aha" (*stand still*) inverts into a trap. The design also loses its fairness valve, which the source pairs with the inversion: after the first `shadow` evidence the directive pool swaps to the stillness-biased set — and that valve is separately logged as missing from the PRD (`reconcile-product-game-design.md:59`, severity High).

---

## Patch 2 — FR-15 and FR-17 specify readouts AD-15 bans

Both FRs describe UI that renders a measurable number, in a product whose no-numbers law is a higher-authority constraint.

### 2a — FR-15, Camera overlay

**Location:** `prd.md:423`

**Current:**
> - Default overlay is deliberately restrained: rule-of-thirds, corner brackets, a recording timer, compass heading, an unlabeled and unnumbered signal bar, a torch toggle, and a vignette.

**Proposed:**
> - Default overlay is deliberately restrained: rule-of-thirds, corner brackets, a mono time strip, an unlabeled three-bar meter, a torch toggle, and a vignette. **No compass heading and no numbered or lettered axis** — a heading in degrees is a degree, which AD-15 bans.

**Authority:** `EXPERIENCE.md` §Camera renders exactly *"rule-of-thirds grid, corner brackets, a mono time strip, and an unlabeled three-bar meter"* — seven elements, **no heading of any form**. The compass lives elsewhere: Radar carries *"a rose with hairline rings and **eight compass letters**"* and Tracker carries *"a compass rose, a bearing chevron"*. So FR-15 does not merely need its heading de-numbered; `EXPERIENCE.md` removed it from the Camera. If a heading is wanted there after all, it must be an **eight-wind word**, never a degree readout — and that is a design decision, not a wording fix.

### 2b — FR-17, Sky surface

**Location:** `prd.md:447`

**Current:**
> - The surface shows a generated starfield, an azimuth and altitude readout, an alignment meter, and an alignment tolerance. It is permanently labeled as generated.

**Proposed:**
> - The surface shows a generated starfield, **a reticle**, an eight-segment alignment meter, and an alignment tolerance. It is permanently labeled as generated, and the label travels with any capture.

**Authority:** AD-20 **already records this decision** — *"the Sky surface renders alignment as a reticle and meter rather than the azimuth/altitude readout FR-17 names (AD-15)"* — and `EXPERIENCE.md` §Sky renders *"a reticle, an eight-segment alignment meter, and `ALIGN DEVICE`"*. Azimuth and altitude are degrees; AD-15 bans degrees, and the no-numbers constraint is a higher-authority product law than FR text. **This patch applies a ratified decision to text that was never updated to it.** No new decision is being made.

---

## Patch 3 — the verb count is unreconciled

**Location:** `prd.md:367` (§4.4), repeated at `prd.md:779`

**Current:**
> There are seven surfaces and five real verbs — **Sweep**, **Ask**, **Listen**, **Frame**, **Log** — and every tool lives *inside* a live Session.

**Proposed:**
> There are seven surfaces and seven rendered verbs — **`SWEEP`**, **`ORIENT`**, **`ASK`**, **`RECORD`**, **`FRAME`**, **`FOLLOW`**, **`ALIGN`** — and every tool lives *inside* a live Session. (A *conceptual* five-verb grouping — sweep, ask, listen, frame, log — describes what the user is doing; it is not the rendered set and must not be presented as it.)

**Why.** This collapse is **already logged as unresolved** in the PRD's own reconciliation: `reconcile-gdd-a.md:71` (severity Low) — *"The INPUT's own header says '5 real verbs' but its per-tool sections name seven (ORIENT, FOLLOW, ALIGN, MARK are lost). **The collapse is asserted, not reconciled.**"* And the PRD contradicts itself internally: FR-14 states *"The surface offers two verbs: `SWEEP` … and `LOG THIS SPOT`"* — rendered verbs outside the five-list.

**This one is a framing question, not purely an error**, which is why the patch keeps the conceptual layer as a parenthetical rather than deleting it. §4.4's abstract five may be a deliberate simplification. If so, the fix is to **say which layer is which** rather than to renumber — the defect is a reader not knowing whether to build five verbs or seven, and that is fixed either way. **Recommend the seven as the rendered set**, since `EXPERIENCE.md` §140 states it as the rendered truth and the verbs are rendered text in shipped UI.

---

## What is not in this patch

- **Observer's fairness valve** (the stillness-biased directive swap after the first `shadow` evidence). It is logged as a missing requirement, not a conflicting one, and adding a requirement is a different edit from reconciling two. Patch 1 states the inversion; the valve belongs in its own change.
- **The rift-severity items already in the PRD's own reconcile files.** Those are the PRD run's to close, and re-reporting them here would be noise.

## Applying this

Each patch is independent and each names its authority, so any subset can be accepted. **Recommended order: Patch 1 first** — it is the only one that changes how a hunt plays, and it is the one that would be baked into stories if this waits.
