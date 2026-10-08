import { ENTERTAINMENT_LINE } from './entertainment';

/**
 * The About notice — the third layer of the three-layer disclaimer
 * (addendum §B.5).
 *
 * Layer 1 is the store listing, layer 2 is onboarding (Story 1.6), and this is
 * layer 3: the permanent notice reachable from Profile that travels with the
 * user's exported data (FR-27). It is the content Story 1.7 renders and exports;
 * this story authors the table only.
 *
 * **The §B.5 heading "A NOTE ON SCIENCE" is re-authored.** Addendum §B.2 bans
 * the token `science` flatly, so the section that disclaims the app's
 * relationship to it is headed without the word — the notice disclaims without
 * shipping the term it disclaims. The body text is the prototype's, which is
 * already clean.
 *
 * **`WHAT IT DOES` carries the one ratified safe form.** `Nothing here is proof.`
 * (addendum §B.4 row 27) still contains the banned token `proof`, so the claims
 * lint's whole-word match would reject it; `scripts/claims/config.json`
 * `allowedPhrases` subtracts exactly this ratified form, and the section reads
 * as the epic's own frame.
 *
 * **The §B.5 `SENSORS USED` section carries the inventory.** Its one paragraph
 * is built from `ABOUT_NOTICE_SENSORS` and `ABOUT_NOTICE_SENSOR_NOTE`, so the
 * list of sensors the notice names cannot drift from the table the notice
 * renders — and `app.config.ts` declares a purpose string for every one of them.
 *
 * The entertainment line is imported, never retyped — `ABOUT_NOTICE.entertainmentLine`
 * is `ENTERTAINMENT_LINE` by identity, and the same constant is placed in the
 * `WHAT THIS IS` paragraph rather than spelled again.
 */

/** One labelled section of the notice. */
export type AboutNoticeSection = {
  readonly heading: string;
  readonly paragraphs: readonly string[];
};

/** One sensor row: a sensor the app can use, and the limit on its use. */
export type AboutSensorRow = {
  readonly sensor: string;
  readonly note: string;
};

/** The note every sensor row carries (addendum §B.5). */
export const ABOUT_NOTICE_SENSOR_NOTE = 'Only while in use.' as const;

/** The sensors the app can use, each marked "Only while in use." (§B.5). */
export const ABOUT_NOTICE_SENSORS: readonly AboutSensorRow[] = [
  { sensor: 'Microphone', note: ABOUT_NOTICE_SENSOR_NOTE },
  { sensor: 'Motion', note: ABOUT_NOTICE_SENSOR_NOTE },
  { sensor: 'Camera', note: ABOUT_NOTICE_SENSOR_NOTE },
  { sensor: 'Location', note: ABOUT_NOTICE_SENSOR_NOTE },
] as const;

/** The sensor inventory the `SENSORS USED` paragraph carries (§B.5). */
const SENSOR_INVENTORY = ABOUT_NOTICE_SENSORS.map((row) => row.sensor).join(', ');

/** The labelled sections, in §B.5 order. */
export const ABOUT_NOTICE_SECTIONS: readonly AboutNoticeSection[] = [
  {
    heading: 'WHAT THIS IS',
    paragraphs: [
      'A paranormal investigation experience. A field journal that writes your night into a case file.',
      ENTERTAINMENT_LINE,
    ],
  },
  {
    heading: 'WHAT IT DOES',
    paragraphs: [
      'It uses what your phone senses as material for a case. Nothing here is proof.',
    ],
  },
  {
    heading: 'SENSORS USED',
    paragraphs: [`${SENSOR_INVENTORY} — ${ABOUT_NOTICE_SENSOR_NOTE}`],
  },
  {
    heading: 'WHAT WE NEVER DO',
    paragraphs: [
      'No account. No sign-in.',
      'No network connection.',
      'No audio or photos leave this device.',
      'No advertising.',
      'No analytics sent anywhere.',
    ],
  },
  {
    heading: 'A NOTE ON WHAT THIS IS NOT',
    paragraphs: [
      'No instrument here can measure what this app is about; the tools are props for paying attention.',
    ],
  },
  {
    heading: 'SAFETY',
    paragraphs: [
      'Brief visual distortions may appear at the two highest intensities. Sounds can arrive suddenly. The app is designed to startle. Ambient or Present keeps both to a minimum.',
    ],
  },
] as const;

/** The notice as Story 1.7 will render it. */
export const ABOUT_NOTICE = {
  title: 'ABOUT & ENTERTAINMENT',
  sections: ABOUT_NOTICE_SECTIONS,
  sensors: ABOUT_NOTICE_SENSORS,
  sensorNote: ABOUT_NOTICE_SENSOR_NOTE,
  entertainmentLine: ENTERTAINMENT_LINE,
} as const;
