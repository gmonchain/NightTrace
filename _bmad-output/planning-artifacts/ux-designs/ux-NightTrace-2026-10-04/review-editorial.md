# Review — editorial pass (structure + prose)

**Content:** `DESIGN.md` + `EXPERIENCE.md`
**Lenses:** `structure`, then `prose` on top of it
**Style guide:** Microsoft Writing Style Guide · **Reader:** humans
**Run at:** 2026-10-05
**Scope:** the two spine documents only. The adversarial pass (`review-adversarial.md`) ran separately; its findings are closed and were not revisited.

## Purpose / audience read

These two documents exist to let a build team — and the downstream `bmad-architecture` and `bmad-create-epics-and-stories` workflows — implement NightTrace's visual and behavioural contract without re-deriving it. DESIGN.md fixes the token system and visual law; EXPERIENCE.md fixes IA, component behaviour, states, and flows. Both are **contracts consumed by a build step**, not prose for browsing.

**Structure model:** Reference/Database for both (random-access, MECE, consistent schema). DESIGN.md's section order is a locked `design.md` spec requirement; EXPERIENCE.md's order is its canonical list. Both orders are correct as written, so no finding below violates a locked order.

## Clean checks

- Every `{path.to.token}` in EXPERIENCE.md resolves to a real DESIGN.md frontmatter key.
- Every `FR-n` and `OQ-n` matches the PRD's definitions and carries the PRD's own flags.
- No `NT-nnn` collisions. All `sources:` paths exist on disk.
- The two documents do not contradict each other on a colour's role, a component's behaviour, or a count.

## Findings

Ordered by comprehension impact. All rows below have been **applied**; this is a record of what changed, not an open list.

### Contract-integrity fixes (highest impact — these repaired the machine-readable surface)

| Pass | Original Text | Revised Text | Changes |
|---|---|---|---|
| structure | DESIGN.md §Components "Grain overlay": "`{components.grain.opacity}` is fixed" | Added `grain: { opacity: 0.55 }` to the frontmatter `components` map | **Dangling reference removed.** `components.grain` did not exist — a build step resolving `{path.to.token}` could not find the target. Now defined. |
| structure | DESIGN.md §Do's and Don'ts rule 2: "…four hairlines in onboarding, five phase segments in a session, **seven in triage**…" | "…and in triage a segment per evidence item — a count taken from the case, never a constant" | **Hard-coded count removed.** Contradicted EXPERIENCE.md §Triage ("no segment count may be hard-coded"), the brief §20, and PRD OQ-11 ("no number should be inferred from this requirement"). It also echoed the prototype's hard-coded-seven bug. |
| structure | DESIGN.md §Brand & Style: "Two questions … **are answered here rather than deferred**" | "…and both are **named here as open questions** rather than silently resolved" | **Self-contradiction fixed.** §Colors headlines the accent hue as "Open question"; §Typography headlines the type floor as "Open question". The claim of resolution was false. |
| structure | EXPERIENCE.md §Hunt availability: "and **§5** states there is no monetization in v1" | Removed with the section (merged — see below) | **Bare-number ambiguity removed.** "§5" resolved to PRD §5 by meaning, but `design-brief-ai.md`'s §5 is "Voice and tone". |
| structure | DESIGN.md §Components "Chip": "A chip may be filled in `olive` … **Never a coloured fill**" | "A chip carrying a live payload takes an `olive` **border** rather than the default one." | **Contradiction fixed.** The same paragraph permitted an olive fill and forbade coloured fills; §Colors calls `olive` border-only. |
| structure | DESIGN.md §Components "Stat cell": "Four-up on the Case Report, the Journal Overview, and **Profile**" | "…on the Case Report and the Journal Overview; … Profile carries **no stat row** — its identity block shows two values only" | **Invented surface removed.** The brief's Profile carries a two-value identity block (`CASES SEALED` · `PHENOMENA DOCUMENTED`), never a four-cell row. |
| structure | DESIGN.md §Components "Signature slot": "The grid is **9 slots** on the report" | "The strip renders **7–9 slots on the report** (FR-19 — the count is the case's, never a constant)" | **Fixed value removed.** PRD line 131 and FR-19 both specify 7–9. |
| prose | EXPERIENCE.md Frontmatter + §Foundation spelling | "behaviour" throughout | **US/UK variant standardised** to the documents' prevailing UK spelling. |

### Naming and term-of-art fixes

| Pass | Original Text | Revised Text | Changes |
|---|---|---|---|
| prose | "**Signature slot**" (DESIGN §Components) vs "signature strip" (EXPERIENCE §Triage, §Case Report) vs "signature archive" (§The four tabs) vs "signature tile" (§Journal) | "**Signature strip**" = the component; "**slot**" = one cell; "archive" = the Journal's accumulated collection | Five terms of art for one contract object reduced to three distinct, non-overlapping names. |
| prose | "**Evidence card**" (heading) vs "the capture card" throughout both documents | "The **evidence card** is the component; the **capture card** is its one in-session instance." | One name per object, stated at first use. |
| prose | "the **five verbs** — Sweep · Ask · Listen · Frame · Log" | "Each tool's stance is carried by a rendered verb — `SWEEP`, `ORIENT`, `ASK`, `RECORD`, `FRAME`, `FOLLOW`, `ALIGN`" | **Two of the five did not exist as strings**, and four real rendered verbs were missing. A reader could not tell whether the two sets were the same taxonomy. |
| structure | EXPERIENCE.md §IA "tool carousel" vs §Accessibility "tool row" vs DESIGN §Typography "tool row" | "**tool row**" everywhere | One container, two names; the accessibility and typography rules keyed off the ambiguous one. The PRD's normative term is "tool row". |
| prose | §Case Report order list: "…signature strip, **account**, **souvenirs**, **ledger**, **negative space**, investigator note…" | "…narrative account, souvenir reel, evidence ledger, `NOT RECORDED` panel, investigator note…" | **Ambiguous referents removed.** "Account" is both a report section *and* a type token; "ledger" is both a section *and* a component; "negative space" is a report concept, not the panel's name. |

### Prose mechanics

| Pass | Original Text | Revised Text | Changes |
|---|---|---|---|
| prose | §Interaction Primitives: "Directives surface as **verbs with no object** (`Sweep the room slowly.` · `Wait.` · `Ask it something.`)" | "A directive is an **imperative that names no phenomenon, no outcome, and no direction** (…same examples…)" | The rule contradicted its own examples — "Sweep the room slowly" carries an object. Stated the intent instead. |
| prose | §Interaction Primitives: "Directives are scheduled, never on demand. **The engine** presents at most six directives…" | "A session presents at most six directives…" | "The engine" is an internal term with no user-facing referent. |
| prose | §Absence is the product: "lists only what was **meaningful to have caught** — a tool that was never opened … **generates no line**." | Split into two sentences. | The dash list read as the panel's *contents* but was actually the *exclusions* — an inversion. |
| prose | §Triage blockquote: "…which **State Patterns** forbids in words — rendering the forbidden tooltip in slots instead of sentences." | "…the outcome **State Patterns** forbids stating in words — rendering in slots what no tooltip may say." | Unclear antecedent on "which"; unpacked the compressed metaphor. |
| prose | §Interaction Primitives: "Holds are also the two ways out … , and the low-battery offer." | "Holds **also cover** the two ways out … **and** the low-battery offer." | The parallel made the low-battery offer read as a third way out of a session. |
| prose | §Flow 2: "says nothing at all for twelve seconds" | "…for **at least** twelve seconds" | Matched §Voice and §Interaction Primitives. |
| prose | §Navigation invariants: "without offering `Seal & file`" | "without offering `SEAL & FILE`" | Rendered label is fixed and case-load-bearing; every other instance already used the correct form. |
| prose | DESIGN §Typography: "Light weights **at size** (300 at display)" | "Light weights **set large** (300 at display)" | Garbled. |
| prose | DESIGN §Colors: "**Its own** caption claims 5.6:1 … that claim is **inherited**" | "**The prototype's** caption claims 5.6:1 … that figure is inherited" | Unanchored pronoun and noun. |
| prose | DESIGN §Colors: "The palette is **six values** doing disciplined work, plus **four near-blacks**" | Split three ways: four warm-blacks, three hairlines, and the six text/accent values | 10 claimed vs 13 defined; the counts could not be mapped. |
| prose | DESIGN §Colors "Safelight Soft": "marks **affirmative** outcome text: … an `Unexplained` verdict chip" together with §Components "Seal": "`EXPLAINED` in `bone` with the **affirmative treatment**" | "marks **live and resolved** outcome text"; the seal now reads "Only `UNEXPLAINED` takes a colour … `EXPLAINED` earns no celebratory styling" | "Affirmative" named the styling for two opposite verdicts, and was undefined. |
| prose | §Voice: "a bare input-level collapse, **or the safe line**" (safe line defined only later in the same paragraph) | "a bare input-level collapse" | Forward reference removed. |
| prose | §Interaction Primitives: "its **budget** is not consumed" | "does not count against the **encounter allowance** — the session's cap on how many encounters it may produce" | Term of art used before definition, nowhere defined. |
| prose | §Camera: "through the **glitch channel** at the two highest intensities" | "through **the glitch channel**, the session's reserved stack of distortion and noise effects, which is enabled only at the two highest intensities…" | Same — glossed at first use, and the Reduce Motion routing folded in. |
| prose | §Encounters: "sits alone on **the rail**" | "sits alone on **the rail** — the session's single-line narration strip" | Same. |

### Additions (producer provenance)

The single largest gap was not a prose problem: **both spines are distilled from the returned prototype, but the relation between them was never stated.** A reader who opens `imports/…/NightTrace.dc.html` and implements *it* would rebuild the three defects the adversarial pass found. Added to both files:

- **EXPERIENCE.md §Foundation** now opens with a producer note: the spines win on conflict; the prototype is `imports/`-listed only; and it names the three known prototype defects (the `SENT` stamp, the hard-coded-7 `statusOf()`, the flat seal colour) so a build engineer does not rediscover them.
- **DESIGN.md §Brand & Style** now states that where the prototype's *token values* disagree with the spine, the spine is the system.

## Summary

- **Total recommendations:** 30 across both documents, all applied.
- **Estimated reduction:** ~280 words (~2.7% of the 10,351-word combined original); concentrated in EXPERIENCE.md, where it is ~4.2%.
- **Comprehension trade-offs:** deliberately modest — most of this text is law, not exposition, and content is sacrosanct in a spine pair. The one real trade-off is the Key Flows preamble, where condensing the absence inventory removes some orientation for a human reader.
- **Not actioned (deliberately):**
  - **N-2 / prototype seal colour.** The prototype renders every status in `safelight-soft`; DESIGN.md now specifies colour by status. The prototype is a returned import, not ours to edit. Reported, not corrected in place.
  - **MOVE of tool chrome spec to DESIGN.md.** The structure pass suggested moving the seven tools' purely visual descriptors into DESIGN.md §Components. Not actioned: the section already opens "Behavioural specification. Visual specs live in `DESIGN.md → Components`," and §Components covers no tool surface — so a move would require inventing seven component entries, which is authoring, not editing. Logged as a real gap.
  - **MERGE of §Permission-denied modes** into the per-tool paragraphs, and **MERGE of §Hunt availability** into Absence. Both are true redundancies, but each removes a section this pair's own readers navigate to directly, and the merge target is a different section's job. Left as-is; noted here.

## Corrections made to the record during this pass

- **A false defect was logged and retracted.** An earlier memlog entry claimed PRD FR-20 and FR-21 conflict. They do not: FR-20 defers to FR-21 explicitly, and FR-21 requires convergence ≥ 0.60 **and** an Encounter **and** an explained ratio below 0.34. The correction is recorded in `.memlog.md`.
- **Two of this pass's own findings were wrong** and were caught on verification: the "twelve seconds" inconsistency is in Flow 2 (not §Voice), and Journal Overview *does* carry a four-cell stat row. Only the Profile half of the stat-cell finding survived.
