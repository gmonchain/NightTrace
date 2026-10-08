# Release review items

**Last worked through:** 2026-10-08, with Story 1.5 (the claims lint). Read this
file on every release; none of these items gates a build step, so nothing else
will surface them.

These are the release items a lint structurally cannot check — AD-17's
colour-alone rule (AD-28/UX-DR25), the typographic floor's open question, the
`safelight` hue's open question, and — added by Story 1.5 — AD-16's five
string-blind review items and NFR-20's store-metadata review. They are read on
release, and the README's Gates section is what makes them reachable: this file
is not referenced by anything that executes, so it is the README paragraph a
release reader follows, not a CI comment.

> **Owner status: open — no named person.** AD-30 requires a release item of
> this class be *"owned by a named person, not an intention."* No personal name
> exists anywhere in this repository, and inventing one would be worse than
> admitting the gap: an unattributed item a reader believes someone owns is a
> claim that is false. Every item below therefore carries **Owner: unassigned**
> and the requirement is recorded as **unmet**, not as though a person had
> accepted it. Closing this needs a human to put a name against each item.

This file now also carries AD-16's five blind spots (images, mechanics,
juxtaposition, visual hierarchy, and the sum of individually-safe sentences),
NFR-20's store-metadata review, and the `%`-scope exclusion (RE-3). Story 1.5
added them as owned release items: its claims lint parses strings and nothing
else, so a passing build is evidence about strings and nothing else. The lint
does **not** automate any item below.

---

## OQ-R1 — Colour-alone risk in live/active state

**Owner:** unassigned (see the owner status above)
**Governing:** ARCHITECTURE-SPINE.md AD-17, AD-28; UX-DR25; `DESIGN.md` Colors.
**Status:** open.

**What actually carries colour in the shipped design.** `DESIGN.md` does *not*
confine colour to one verdict. Three forms are colour-carried today, and this is
the reserved set rather than a sample:

- `safelight-soft` marks **live and resolved outcome text** — the current
  Clearance rank, the `CONTINUE CASE` label, `ACTIVE TONIGHT`, the
  `UNEXPLAINED` verdict chip, and report stamps (`DESIGN.md:183`, `:243`).
- `safelight` is reserved without exception for **recorded moments** — the seal
  impression, the REC dot, lit signature slots, the hold-fill bar, active radar
  cones and the tracker chevron (`DESIGN.md:182`) — each of which is hue-carried
  at a glance.
- A `safelight` dot is the **tab bar's one badge**, shown on Field Journal when
  a case is unsealed (`DESIGN.md:259`) — a colour-only signal of "unsealed".

So an unsealed case and a live session are, at a glance, identified by hue. The
Seal is the counter-example the rule is built on: only `UNEXPLAINED` takes a
colour, and `INCONCLUSIVE` and `EXPLAINED` differ *only* by the status word
(`DESIGN.md:243`).

**The item's limit, as data.** Every status must also be **a word**, and colour
may only reinforce it — never replace it. This is the property the token-sync
test cannot check (it sees values, not rendered meaning), which is exactly why
it is a review item rather than a rule.

**The measured contrast, read from the live tokens.** `ash` (#859581) on `night`
(#060A07) measures **6.27:1**, clearing the AA body-text floor of 4.5:1; `dim`
(#5A6B58) measures **3.49:1**, so it is caps/metadata only and never actionable
text. Both are asserted against the values in `DESIGN.md`'s frontmatter by the
sync test — the prototype's inherited 5.6:1 figure is wrong and must not return.

**Review at release:** confirm each live/active surface above renders its status
as a word that survives with colour removed (monochrome, or read by a screen
reader), so the hue is reinforcement and not the carrier.

---

## OQ-R2 — Legibility at the 9.5px floor

**Owner:** unassigned (see the owner status above)
**Governing:** `DESIGN.md` Typography; ARCHITECTURE-SPINE.md AD-28; UX-DR55.
**Status:** **open** — this file carries no measurement that would settle it.

`DESIGN.md` sets mono at `micro` 9.5px and states a "never below 9.5px" floor,
while noting the prototype sets some mono at 7.5px and 8px
(`DESIGN.md:202`). The design source names the Share Card footer as the specific
risk: it carries the entertainment line, which UX-DR55 makes a safety notice
rather than decoration.

**Why this is open, not resolved.** A floor this file asserts is only real if it
is measured. The Share Card footer's smallest supported text configuration — its
size, its measured contrast ratio against its background, and its line count —
has not been taken in this story. Until that measurement exists, the item stays
open; asserting the footer is "measured against the floor" without the
measurement would be a claim this file does not make good on.

**Review at release:** measure the footer at the smallest supported Dynamic Type
configuration (AD-28 caps the tool row and intensity rail at 140%), record the
size, contrast ratio and line count here, and confirm the string is neither
truncated nor below the floor. The entertainment line's exact spelling
(`An investigation experience. Not a measurement.`) is the string to check.

---

## OQ-R3 — The `safelight` hue

**Owner:** unassigned (see the owner status above)
**Governing:** `DESIGN.md` Colors; ARCHITECTURE-SPINE.md AD-20.
**Status:** open — a design decision, not a code change.

`DESIGN.md`'s prototype rationale is headed *"Why safelight red"* — darkrooms
and astronomers use deep red to spare a dark-adapted eye — while the implemented
token is a lime/chartreuse (`#A3FF2B`), and a second chromatic accent
(`safelight-soft`, `#C6FF66`) contradicts that column's claim that the accent is
"the only chromatic colour" (`DESIGN.md:186`). The reasoning is sound; the hue
does not implement it.

The choice is explicit: move `safelight` to a genuine deep red and accept that
red also reads as "destructive" in most mobile vocabularies, or keep the green
and rewrite the rationale to be honest about the dark-adaptation trade-off.

**The `safelight` token *name* is stable** — the code and the sync test are
unaffected either way; only the value changes, and `DESIGN.md`'s frontmatter
remains the source of truth for it. Do not ship the argument as written: a
rationale that contradicts its own token is worse than none.

**Review at release:** resolve the hue, then update `DESIGN.md`'s frontmatter
and rationale together. The sync test fails until `tokens.ts` follows.

---

## RE-1 — The five AD-16 blind spots

**Owner:** unassigned (see the owner status above)
**Governing:** ARCHITECTURE-SPINE.md AD-16, AD-30; epics Story 1.5; SM-8.
**Status:** open — a human sentence-level review on every release.

The claims lint (`npm run claims:check`) parses **strings and nothing else**. A
sentence can misdescribe what the app actually did without containing a banned
term, and the lint cannot see any of the five classes below. These are not
lint rules; they are read by a person on every release (SM-8's second count).
**Story 1.5 does not claim to have automated any of them.**

- **Images.** A screenshot, a capture card or a share card whose pixels imply a
  reading the strings deny — a curve that looks like a chart, a glow that looks
  like a confirmed contact.
- **Mechanics.** What the app actually *does*, as opposed to what it says — a
  fake scan loop, an animation that implies a sensor is working.
- **Juxtaposition.** Two individually-clean sentences or labels placed together
  so the pair asserts what neither does alone.
- **Visual hierarchy.** Emphasis that turns a qualifier into the point — the
  band word set large while `inferred` sits small.
- **The sum of individually-safe sentences.** A screen whose every sentence is
  clean but whose whole reads as a claim.

**Review at release:** walk every shipped screen, screenshot and share surface
as a whole and ask what a stranger would believe the app just did; confirm the
answer is "it wrote a case file", never "it detected, proved or measured
something".

---

## RE-2 — NFR-20: store-metadata review against App Store 2.3.1 / 2.3.7

**Owner:** unassigned (see the owner status above)
**Governing:** epics NFR-18, NFR-20; ARCHITECTURE-SPINE.md AD-16; App Store
Review Guidelines 1.1.6, 2.3.1(a), 2.3.7.
**Status:** open — a submission-time review, not a build gate.

The claims lint checks the store title, subtitle, description and screenshot
captions against the banned-term list and the `%` ban. It does **not** check
them against the App Store's own metadata rules: **2.3.1(a)** barring
unverifiable claims and **2.3.7** barring misleading metadata. Guideline 1.1.6
is explicit that calling an app "for entertainment purposes" does not by itself
excuse false information, so the product is defended by its design, not its
disclaimer. `assets/store/listing.json` is the surface to read; the rating
(`12+/Teen`) is derived from the recorded questionnaire inputs, and its inputs
and derivation live in that file.

**Review at release:** before submission, read `assets/store/listing.json`
against 2.3.1/2.3.7 — not only against the banned-term list — and confirm the
description, title, subtitle and every screenshot caption claim nothing a
reviewer could check and falsify.

---

## RE-3 — The `%` scope excludes `src/ui/theme/**`

**Owner:** unassigned (see the owner status above)
**Governing:** ARCHITECTURE-SPINE.md AD-16; epics FR-33; `scripts/claims/config.json` `shippedCharacterScope`.
**Status:** open — a scope narrowing a human must re-confirm at release.

FR-33 bans `%` "anywhere — no carve-out on any surface". The claims lint enforces
the `%` ban over the declared surface set and, to widen it, over
`shippedCharacterScope` — the shipped source the surface set does not enumerate.
That scope deliberately **omits `src/ui/theme/**`**: the one `%` there is the
Seal's SVG filter-region extent (`'-10%'`, `'120%'` in
`src/ui/theme/tokens.ts`), a style value rather than copy, and Story 1.4's
`no-measurement` suite pins it as the only `%`-bearing surface. So the ban is not
literally universal: a new `%` added under `src/ui/theme/**` would not fail the
build.

**Review at release:** confirm `src/ui/theme/**` still carries no `%` beyond the
Seal's SVG filter-region value and authors no copy; if either changes, add the
offending file to the declared surface set (or its root to
`shippedCharacterScope`) rather than relying on the exclusion.
