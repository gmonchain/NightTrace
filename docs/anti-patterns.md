# Anti-patterns — a review checklist, never a lint

This document records the product's **anti-pattern exclusions** as a human review
checklist. It is **not a lint** and must never become one. Story 1.8 records it
because the exclusions have to exist somewhere a reviewer looks; nothing here is
machine-checked, and nothing here is allowed to be added to `scripts/claims-lint.mjs`
or to an ESLint rule.

Source: `EXPERIENCE.md` → **Inspiration & Anti-patterns** (and the epic-1 context's
`Never produce:` line). The design source settles this text; do not re-author it.

## Why this is a document and not a gate

The claims lint (AD-16) parses **strings and nothing else**. Images, mechanics,
juxtaposition, visual hierarchy, and the sum of individually-safe sentences are
structurally out of its reach — those five are named release-review items, not
lint rules. Most of the anti-patterns below are visual or behavioural (a palette,
a silhouette, a control shape), so a machine cannot see them. Encoding them as a
lint would either miss them (producing a green build that lies) or over-fire on
innocent copy (producing `eslint-disable`s, which is how a gate gets switched
off). So the copy-authoring rules live in a lint (the claims boundary) and these
visual/behavioural rules live here, in a checklist a person walks before release.

## The exclusions — do not produce these

Mark each as you check it. Any ticked item is a defect.

- [ ] Cheesy Halloween styling
- [ ] Cartoon ghosts
- [ ] Cobwebs
- [ ] Dripping fonts
- [ ] Neon overload
- [ ] Cyberpunk glow
- [ ] Dense sci-fi HUDs
- [ ] Wireframe globes
- [ ] Tiny unreadable labels
- [ ] Fake EMF dials with red LED readouts
- [ ] Pulsing radar sweeps
- [ ] Skeuomorphic paper with torn edges or coffee stains
- [ ] Wax seals
- [ ] Trophy walls
- [ ] Progress bars toward anything
- [ ] Streak counters
- [ ] Leaderboards
- [ ] Any comparison between users

## Related exclusions the same review walks

These are stated elsewhere in the design source and fail the same review; they are
recorded here so one checklist carries them.

- **No locked or teased content anywhere.** Unencountered phenomena are *absent*,
  never locked: no greyed-out rows, silhouettes, keyholes, padlocks, "unlock"
  copy, stated requirements, progress ladders, or tier badges. No paywall, no
  in-app purchase, no subscription, no advertising (State Patterns → Absence).
- **No number that could be read as a measurement.** No percentage, axis, degree,
  unit, distance, coordinate, or raw signal strength on any surface; bands and
  words only (AD-15). The `%` character is additionally banned in every shipped
  string and is enforced by the claims lint — that one *is* a gate.
- **No transmission claim.** Nothing on the Voice surface may state or imply
  anything was received, transmitted, heard, or contacted (AD-27).
- **No watermark, URL, QR code, app-store badge, "made with" line, or any
  attribution** on a Share Card or anywhere in the user's output.

## The one-sentence test

Before calling anything finished: **Does this look like an instrument that a
careful person would trust with the record of their night?** If it looks like a
toy, a slot machine, or a ghost-hunting gadget, it is wrong — no matter how good
it looks.
