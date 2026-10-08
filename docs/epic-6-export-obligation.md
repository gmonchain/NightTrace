# Epic 6 export obligation — the entertainment notice travels with the data

**Status:** open — owned by the Epic 6 export story (FR-27).
**Recorded by:** Story 1.7, `_bmad-output/implementation-artifacts/spec-1-7-about-notice.md`.
**Governing requirements:** PRD FR-27 (data export and deletion), FR-32 (the
notice stays permanently reachable and is included in any data export); epics
Story 1.7 AC 2 and Story 6.4 (`6-4-export-produces-something-readable-and-deletion-tells-the-tr`).

## The obligation

**Any data export the app produces must include the entertainment notice, in
full, in the exported file.** Nobody has to hunt for it: this file is the named
artifact Epic 6's export story reads, and Epic 6's own acceptance criterion points
back at the obligation recorded here ("And it includes the entertainment notice,
per the obligation recorded in Story 1.7").

Concretely, the exported document must carry the About notice — the same content
Story 1.7 renders from **`ABOUT_NOTICE` at `src/data/strings/aboutNotice.ts`**.
That table is the source of truth for the notice, and this artifact deliberately
does **not** retype it (a second copy would drift from the table); the export must
follow the table:

- every section, in §B.5 order, exactly as `ABOUT_NOTICE.sections` lists them —
  the six section headings and their paragraphs come from the table, not from
  this file;
- the sensor inventory exactly as `ABOUT_NOTICE.sensors` lists it — each sensor
  with its note (`ABOUT_NOTICE_SENSOR_NOTE`);
- **the entertainment line**, exactly as the exported constant spells it, and
  never retyped:

  > An investigation experience. Not a measurement.

- the safety content whole — photosensitivity (the glitch channel's visual
  effects), sudden audio, and that the app is designed to startle. It is a
  person's safety notice: it must not be truncated and must not be reworded.

The entertainment line is the one exported constant at
`src/data/strings/entertainment.ts` (`ENTERTAINMENT_LINE`). The export must read
that same constant (or the notice table that imports it), so the string exists in
exactly one place in the source and cannot drift between the in-app notice and
the exported file.

## Why this is an artifact, not code

Story 1.7 lands the notice's reachability (Profile → About) and records this
obligation; it deliberately does **not** implement the export. FR-27's export and
deletion are Epic 6's, and building any of it here would pre-empt Story 6.4. So
the obligation is written down where the Epic 6 story can find it — a named
artifact with the exact content the exported file must carry — and the export
story is what satisfies it.

## How this is checked today

Story 1.7's suite asserts that this artifact exists, that it names FR-27, and
that it names the entertainment line — so the obligation cannot be quietly
dropped. The content it must carry is asserted against the live table rather than
against this file: the rendered notice is **every section of `ABOUT_NOTICE` in
order**, with the sensor inventory rendered as **rows built from
`ABOUT_NOTICE.sensors`** (each sensor and its note) rather than the section's
derived prose paragraph, and the entertainment line is the exported constant by
identity, never a literal. The export implementation itself is verified by Epic
6's own suite when that story lands.

## Where the pieces live

| Piece | Source |
| --- | --- |
| The entertainment line (single exported constant) | `src/data/strings/entertainment.ts` |
| The About notice table (sections, sensors, safety) | `src/data/strings/aboutNotice.ts` |
| The notice surface that renders it | `src/features/about/NoticeSurface.tsx` |
| The Profile → About path | `src/features/profile/ProfileScreen.tsx`, `src/app/(tabs)/profile.tsx`, `src/app/(modals)/about.tsx` |
| The obligation's check | `src/features/about/__tests__/exportObligation.test.ts` |
