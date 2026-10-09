/**
 * The Profile/About UI copy (Story 1.7).
 *
 * This is a declared UI string table — `scripts/claims/config.json` lists it as
 * a `ui-string-table` surface, so Story 1.5's claims lint checks every string
 * here like any other shipped sentence (banned terms, the banned patterns, the
 * `%` character). It holds only the *UI chrome* for the Profile→About path: the
 * Profile screen title, the `About & entertainment` row label, and the notice's
 * close action. The notice *content* is Story 1.5's `ABOUT_NOTICE` table and is
 * never authored here.
 *
 * None of these lines assert anything about the real world, so they read clean
 * under the claims lint; `About & entertainment` is the label `EXPERIENCE.md`'s
 * screen tree names for the sheet.
 */

/** The Profile screen's chrome (Story 1.7). */
export type ProfileCopy = {
  /** The Profile screen's title. */
  readonly title: string;
  /** The row that opens the About notice — a normal Profile destination. */
  readonly aboutRowLabel: string;
};

/** The About notice's own action copy (Story 1.7). */
export type AboutCopy = {
  /** The notice's close action, which returns to Profile. */
  readonly closeLabel: string;
};

export const PROFILE_COPY: ProfileCopy = {
  title: 'Profile',
  aboutRowLabel: 'About & entertainment',
};

export const ABOUT_NOTICE_COPY: AboutCopy = {
  closeLabel: 'Close',
};
