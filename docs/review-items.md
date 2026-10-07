# Release review items

**Last worked through:** 2026-10-07, with Story 1.2 (design tokens). Read this
file on every release; none of these items gates a build step, so nothing else
will surface them.

These are the release items a lint structurally cannot check — AD-17's
colour-alone rule (AD-28/UX-DR25), the typographic floor's open question, and
the `safelight` hue's open question. They are read on release, and the README's
Gates section is what makes them reachable: this file is not referenced by
anything that executes, so it is the README paragraph a release reader follows,
not a CI comment.

> **Owner status: open — no named person.** AD-30 requires a release item of
> this class be *"owned by a named person, not an intention."* No personal name
> exists anywhere in this repository, and inventing one would be worse than
> admitting the gap: an unattributed item a reader believes someone owns is a
> claim that is false. Every item below therefore carries **Owner: unassigned**
> and the requirement is recorded as **unmet**, not as though a person had
> accepted it. Closing this needs a human to put a name against each item.

This file does **not** claim AD-16's five blind spots (images, mechanics,
juxtaposition, visual hierarchy, and the sum of individually-safe sentences).
Those are a different release item, owned elsewhere.

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
