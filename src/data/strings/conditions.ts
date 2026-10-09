/**
 * The conditions board's words (Story 2.1).
 *
 * A declared UI string table: `scripts/claims/config.json` lists it as a
 * `ui-string-table` surface, so the claims lint (Story 1.5) checks every word
 * here like any other shipped string — the banned terms, the banned patterns
 * and the `%` character. Authoring these words anywhere else would put them
 * outside the lint's declared surface set.
 *
 * They are the words the Brief and the Case Report render for the night's sky
 * and place: bands and words, never a reading (AD-15).
 */

import type { SkyCondition, SkyReadout } from '@/engine/models';

/** The sky condition, as the board shows it. */
export const SKY_READOUTS: Readonly<Record<SkyCondition, SkyReadout>> = {
  clear: 'clear',
  overcast: 'overcast',
  precipitation: 'rain',
  storm: 'storm',
  fog: 'fog',
  unknown: 'unreadable',
};

/** The place line: charted or place-less, never a coordinate. */
export const PLACE_READOUTS = {
  charted: 'Charted',
  uncharted: 'Uncharted',
} as const;
