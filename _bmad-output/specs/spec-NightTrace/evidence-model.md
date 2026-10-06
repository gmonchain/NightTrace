# Evidence Model — the closed vocabularies

**Status: FINAL.** Resolves OQ-11. The *model* is fixed by architecture spine AD-18 — a closed ten-kind engine vocabulary with per-hunt content aliases mapping onto it. This file fixes **which alias each hunt uses**, the **triage reason set**, and the **other closed fields**, so content authoring can start.

The persisted side of this file is not a proposal: every union below is transcribed from the `CREATE TABLE` CHECK constraints in the implementation contract (`02` §I.5) and from `02` §H.5. Where the draft of this file disagreed with the schema, the schema won — AD-20 gives `02` precedence on anything storage does. Three such corrections are recorded under *Corrections*.

## The persisted vocabulary (closed — 10)

The engine layer. It is what a row stores, what the glyph set keys off, and what the `evidence_found` event carries. It is closed: a content-validation test asserts no hunt introduces an eleventh kind.

`emf_swing` · `voice_capture` · `word_bank_hit` · `photo_anomaly` · `shadow_pass` · `footprint` · `tree_knock` · `sky_light` · `user_note` · `user_audio`

## The per-hunt alias map (final)

Aliases are content-level names that resolve onto the ten. Each must resolve, and the resolution is asserted at build.

| Hunt | Alias (content) | Resolves to | Note |
| --- | --- | --- | --- |
| **Ghost** | `unknown_voice` | `word_bank_hit` | The Mimic's whole mechanic is authored words |
| | `evp_segment` | `voice_capture` | A recorded audio segment |
| | `emf_stir` | `emf_swing` | |
| | `emf_surge` | `emf_swing` | Two aliases, one kind. The *surge* is a strength, not a kind |
| | `shadow` | `shadow_pass` | |
| | `visual_encounter` | `photo_anomaly` | |
| **Bigfoot** | `footprint` | `footprint` | Direct |
| | `broken_trail` | `footprint` | A physical trace |
| | `tree_knock` | `tree_knock` | Direct. The hunt's signature sound — *3 knocks + 1 wood sequence* |
| | `vocalization` | `voice_capture` | Weak map — the alias names a howl, the kind names a captured voice |
| | `movement` | `shadow_pass` | Weak map — a thing seen moving vs a shadow passing |
| | `silhouette` | `photo_anomaly` | |
| | `proximity_spike` | `emf_swing` | Weak map — no proximity kind exists; the radar owns proximity |
| **Shadow Person** | `shadow` | `shadow_pass` | |
| | `motion` | `shadow_pass` | |
| | `camera_distortion` | `photo_anomaly` | |
| | `silhouette` | `photo_anomaly` | |
| | `peripheral_event` | `shadow_pass` | |
| | `visual_encounter` | `photo_anomaly` | |
| **Alien** | `unknown_signal` | `sky_light` | |
| | `sky_object` | `sky_light` | |
| | `electromagnetic_anomaly` | `emf_swing` | |
| | `transmission` | `sky_light` | **Must not** be `word_bank_hit` — FR-39 forbids any word on the Alien line |
| | `visual_encounter` | `photo_anomaly` | |

**Every engine kind now has at least one alias.** 22 aliases resolve onto the ten. Ghost and Alien each carry five, Bigfoot seven, Shadow Person six.

### Two aliases are deliberately dropped

Both were named in the source's per-hunt lists and both are removed by decision, not by oversight:

- **`cold_spot` (Ghost) — dropped.** Not because it lacks a home, which is what the draft of this file claimed, but because it has one and the home is a trap. The persisted channel union *does* contain `thermal` (`02` §H.5), so a `cold_spot` evidence row would validate cleanly — and would then carry a thermal glyph, a thermal caption, and a `thermal` channel into the report's `SOURCES` count. The product has no temperature sensor, the shipped-string lint bans thermal language outright, and the addendum deletes heat references from the claim surface entirely (row 7, *"Delete entirely. Never reference heat."*). A schema-valid thermal claim is a worse outcome than an unresolvable alias, because nothing downstream would catch it. **The Ghost hunt's event table may still fire a `cold_spot_pass` beat — as ambience, on the haptic channel, exactly as `01` authors it — but it never becomes Evidence.**
- **`bearing_lock` (Alien) — dropped.** A bearing is a Tracker surface state, not an Evidence kind, and a *lock* contradicts the radar rule that uncertainty never collapses to a resolved contact. The journal records bearings (`session.bearingsLogged`); the ledger does not.

### The alias most likely to be broken by a well-meaning author

**`transmission` must never resolve to `word_bank_hit`.** FR-39's separation rule says no Alien emission contains a word or found text, and `transmission` is the one alias whose *name* invites a word. It maps to `sky_light`. This deserves a content-validation assertion of its own, not merely the generic "every alias resolves" check — the generic check passes either way.

## The other closed fields

AD-18 closes four fields because AD-8 and FR-22 count them. The schema closes three more. All seven are transcribed here, because a story author needs the whole set in one place and the schema is the authority.

| Field | Closed set | Source |
| --- | --- | --- |
| **`channel`** | `emf` · `audio` · `visual` · `thermal` · `motion` · `log` | `02` §I.5 CHECK |
| **`strength`** | `faint` · `present` · `strong` · `unqualified` | `02` §I.5 CHECK |
| **`verdict`** | `unexplained` · `inconclusive` · `explained` | `02` §I.5 CHECK |
| **`signature_slot`** | `trace` · `voice` · `form` · `habit` · `place` · `refusal` | `02` §I.5 CHECK. Nullable — not every item is convergent |
| **`tool`** | `emf` · `radar` · `voice` · `evp` · `camera` · `tracker` · `sky` | AD-18; the seven surface ids |
| **`phase`** | `QUIET` · `SIGNALS` · `ACTIVITY` · `ENCOUNTER_WINDOW` · `RESOLUTION` | AD-18, AD-25 |
| **`source`** | the producing sensor channel | AD-18 |

**`source` is not a second concept.** It is *identical in meaning to `channel`* — the field the report's `SOURCES` count counts — stored so the count is answerable without a join. Writing it is not an authoring task.

**Not every kind reaches every channel, and `thermal` reaches none.** The kind→channel map a content author needs:

| Kind | Channel | Kind | Channel |
| --- | --- | --- | --- |
| `emf_swing` | `emf` | `tree_knock` | `audio` |
| `voice_capture` | `audio` | `sky_light` | `visual` |
| `word_bank_hit` | `audio` | `user_note` | `log` |
| `photo_anomaly` | `visual` | `user_audio` | `audio` |
| `shadow_pass` | `visual` or `motion` | `footprint` | `visual` or `motion` |

With `cold_spot` dropped, **`thermal` is a member of the channel union that no evidence kind can reach.** Either it is deleted from the CHECK constraint and the TS union, or it is retained as reserved. It is harmless if retained — the `SOURCES` count is computed from rows, not from the union — but a dead enum member that names a sensor the product does not have is the kind of thing a future author reaches for. **Recommendation: delete `thermal` in the same migration that would otherwise add nothing.** Flagged rather than decided, because it is a schema change.

## The triage reason set (closed — 5)

From FR-20, closed and mundane by design. A reason is recorded as **what the user decided, never as a finding**, and the ledger renders it as the user's verdict.

`vehicle` (*A car*) · `building` (*The building*) · `own_movement` (*My own movement*) · `equipment` (*Equipment*) · `other` (*Something else*)

## Corrections this pass made to its own draft

Recorded so the earlier version is not cited as authority:

1. **The channel union was wrong.** The draft listed the six *sensor hardware* names — `magnetometer`, `accelerometer/gyroscope/deviceMotion`, `light`, `location`, `microphone`, `camera`. The persisted union is `emf` · `audio` · `visual` · `thermal` · `motion` · `log`. Hardware names never reach storage; AD-13 keeps them behind `SensorHub`.
2. **`cold_spot`'s rationale was wrong.** The draft said it "has no home." It has one — `channel: 'thermal'` — and that is precisely why it must be dropped. See above.
3. **Three closed fields were missing entirely** — `strength`, `verdict` and `signature_slot`. All three are CHECK constraints in the shipped schema.

## Six slots and a nine-wide strip — resolved, and not a conflict

A draft of this file flagged the schema's six `signature_slot` values against FR-19's seven-to-nine slot strip as a cardinality conflict. **That was wrong, and it was the same category error this project has already made once.** The two numbers are different axes:

| | What it is | Its count | Where it lives |
| --- | --- | --- | --- |
| **`signature_slot`** | the **category** an Evidence item belongs to — its department | **6** | a nullable column on the evidence row (`02` §I.5) |
| **strip width** | the number of **glyph positions** the case's Signature renders | **7–9** | read from the case, never a constant (AD-8) |

Nothing requires positions to equal categories. Six categories populating nine positions is coherent, and the surrounding numbers agree with it rather than with a six-wide strip:

- `01` §L budgets a **9-glyph signature set** — *"Signature strip, signature archive (these are abstract marks — a wave, a fork, a spiral — never a picture of a creature)"*.
- The Signature Archive is a **4×2 grid** — eight tiles, the storage side of the same strip.
- The key user journey opens with *"Signature strip shows 7 evidence glyphs"*.
- **AD-8 is explicit and ratified:** *"The signature slot count is read from the case (7–9), never from a constant."*

So the strip is 7–9 positions drawing on 6 categories. This is the identical shape to AD-18's own resolution one layer down — *the engine vocabulary is shaped by sensor channel while the hunt names are shaped by phenomenology* — where two enumerations of different sizes describe one thing from two directions, and the answer is that both are right.

**The real gap is narrower and it is a content-model gap, not a cardinality conflict.** AD-8 says the width is *read from the case*, but **no content model declares it**. The four `HuntDefinition` JSON sketches in `01` §J.1–J.4 carry `id`, `archetype`, `evidenceTypes`, `intensityProfile`, `objectives` and twelve other fields — and **no signature-strip field of any kind**. As written, "read it from the case" has nothing to read.

**Recommendation:** add a `signatureSlots` field to `HuntDefinition`, typed as a `readonly SignatureSlot[]` of length 7–9, and assert at content-validation time that (a) the length is in range and (b) every entry is drawn from the closed six. That makes AD-8's rule satisfiable and gives the strip a declared shape per Phenomenon. It is a **content-schema addition**, so it belongs with T-0.8 rather than in this file.


## The rules that hold this closed

- Each kind maps to **exactly one** glyph, and the glyph set is closed against the kind list by the same content-validation test.
- **The glyph set must be re-derived from the ten kinds.** `01` §L.4's glyph table lists **24** glyph ideas keyed to the old alias names — including `null_reading`, `interference`, `magnetic_disturbance` and `wing_sound`, none of which is a kind. That table is the origin of the unsubstantiable "14 evidence kinds" claim the PRD's own note already retracts. Ten kinds means ten glyphs; the other fourteen entries are not a budget to spend.
- A log action with no reading commits an ordinary row whose reading is `null` — **not** an eleventh kind — and counts toward the report's negative space.
- A contended item presents identically to an ordinary one until triaged.
- `evidence_found`'s `kind` and `channel` props are drawn from these same unions, so a missing field is a compile error.
