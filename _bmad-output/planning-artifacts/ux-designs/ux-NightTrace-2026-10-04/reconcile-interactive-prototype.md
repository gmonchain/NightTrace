# Reconcile — interactive prototype

**Import:** `imports/nighttrace-interactive-prototype/project/NightTrace.dc.html`
**Producer:** Claude Design (claude.ai/design), handoff bundle, 2026-10-05
**Reconciled by:** bmad-ux, 2026-10-05

## What was asked for vs. what came back

| Asked (stitch-prompt.md) | Returned |
|---|---|
| `DESIGN.md` per the Google Labs spec | **Not emitted.** The visual identity arrives as in-artifact evidence: a swatch block, two type specimens, and four rationale columns rendered inside the prototype. |
| One HTML file per screen, 1:1 | **Superseded.** A single interactive HTML file covering far more ground than the two screens originally scoped. |
| Case Report + Share Card only | **4 nav sections, 7 tools, 4 in-session moments, 3 case surfaces, 1 standalone mode, 12 sheets** — plus a Scenario panel to force every first-class state. |

The scope expansion is a gain, not a deviation. The missing `DESIGN.md` is a format gap that this run closes by distilling `DESIGN.md` from the artifact.

## Coverage — accepted into the spines

Everything in `PART III` of `design-brief-ai.md` is present in the prototype and was used as the behavioural source for `EXPERIENCE.md`: onboarding (4), Home, Investigate, Hunt Brief, Session shell, all seven tools, evidence card, dry log, encounters (audio + glimpse), failure states, Case Report, nothing-case report, Share Card (both variants), Journal (4 segments, populated and empty), Profile, Field Note (idle/run/done), and all twelve sheets including the locked-intensity variant and the low-battery offer.

## Verified against product law

Checked by direct inspection of the artifact, not by reading its own claims:

- **Disclaimer string.** Appears twice — report footer and Share Card footer — reading exactly `An investigation experience. Not a measurement.` **PRD spelling, not the brainstorm variant.** ✅
- **No percentage sign** in any rendered text node. ✅
- **No watermark, URL, QR code, app-store badge, or attribution** on the Share Card. ✅
- **`GENERATED` label propagates** from the Sky star field into the evidence type `SKY CAPTURE · GENERATED`. ✅
- **No paywall, tier badge, locked phenomenon, keyhole, or purchase affordance** anywhere. ✅
- **No locked Journal entries**; the Phenomena segment lists three discovered phenomena and simply omits Bigfoot. ✅

## Defects carried into the spines as open items

1. **`statusOf()` violates the status asymmetry.** `EXPLAINED` is computed from a ratio against a hard-coded seven; `UNEXPLAINED` from a bare count of two verdicts, with no encounter requirement. The rendered copy is clean — the mechanic is never stated — but the behaviour is discoverable by experiment. **Fix belongs in the status function, not the design.** Recorded in `EXPERIENCE.md → State Patterns`.

2. **The safelight rationale contradicts the safelight token.** The note column is headed *"Why safelight red"* and argues for deep red on dark-adaptation grounds; the implemented accent `#a3ff2b` is lime/chartreuse, the internal variable is named `RED` while holding a green, and `#c6ff66` is a second chromatic accent contradicting the same column's claim of exclusivity. **Named as an open question in `DESIGN.md → Colors`, not silently resolved.**

3. **Mono set below its own stated floor.** The type specimen's rule is "never below 9.5px"; the artifact uses 7.5px and 8px. Riskiest on the Share Card footer, which carries the legally load-bearing entertainment line. **Named in `DESIGN.md → Typography`.**

4. **`BONE #cfdcc6` is described as warm white but is a pale green-tinted grey** (225 uses — the most common value in the system), giving the whole product a green cast. Defensible for the subject; named honestly rather than inherited uncritically.

## Corrections made to upstream artifacts

- **`design-brief-ai.md` amended.** The prototype's own *"Deviations from the brief"* column caught a real error: the `INTERFERENCE` report stamp read `EQUIPMENT CONDITIONS — MAGNETIC INTERFERENCE DETECTED`, and `DETECTED` is on the brief's own banned-terms list. Amended to end at `MAGNETIC INTERFERENCE` — the prototype's wording. **The handoff worked in both directions.**

## Dropped

Nothing was dropped. Every surface in the brief is represented. The prototype's own **design-rationale columns and Scenario panel are prototype scaffolding**, not product UI, and were deliberately not carried into either spine.

## Still open

- The four Hunts' availability from first launch (PRD forbids Clearance gating them but does not forbid other mechanisms). Default: all four available. See `EXPERIENCE.md → Information Architecture`.
- `ash` (`#859581`) contrast — the artifact's own 5.6:1 claim is inherited and unverified.
