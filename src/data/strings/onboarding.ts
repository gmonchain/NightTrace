import { ENTERTAINMENT_LINE } from './entertainment';

/**
 * The onboarding copy — four screens, in order (Story 1.6).
 *
 * This is the declared UI-string-table surface for the onboarding path, so
 * Story 1.5's claims lint checks every line here like any other shipped string
 * (banned terms, the `%` character). Two rules are honoured throughout:
 *
 * - **Nine words maximum on any single line** (EXPERIENCE.md, Voice and Tone),
 *   counted per `kicker` / `headline` / `body[]` / `actionLabel` entry.
 * - **Never assert, never wink, never explain the mechanic, hedge as craft** —
 *   and `ghost` appears only ever as a Hunt name, so it appears nowhere here.
 *
 * Screen 1 is the entertainment notice: it is the only screen with no back, it
 * carries `ENTERTAINMENT_LINE` (imported, never retyped — ARCHITECTURE-SPINE.md
 * AD-16 places the line on a non-skippable onboarding screen), and its `I
 * understand` action is the acknowledgement. The safety content
 * (photosensitivity, sudden audio, that the app is designed to startle) is
 * deliberately **not** here — it lives in the About notice (`aboutNotice.ts`).
 *
 * The screen titles are the epic's own frame sentences: nothing here is proof;
 * your case is local; you choose your night; permissions are asked only when
 * needed. Screen 3 teaches the frame and nothing more — it carries no intensity
 * control and no haptics/reduce-motion toggle (those belong to FR-9/FR-10 and
 * Story 2.7).
 *
 * Body-line provenance (Story 1.6 review). The design brief's own bodies
 * (`design-brief-ai.md` §11) carried banned terms, so they were re-authored:
 *  - **Design brief, re-authored here:** screen 1's two non-imported lines
 *    (brief: "It gives you the tools, the ritual, and the case file." / "It does
 *    not measure, prove, or detect anything supernatural"); screen 2's three
 *    lines (brief: "Every case is generated from where you are, what hour it
 *    is..."); screen 4's three lines (brief: "asks for a sensor at the moment a
 *    tool needs it — never at launch").
 *  - **Epic frame sentences:** the four headlines are the epic's own frame
 *    (EXPERIENCE.md; `epic-1-context.md`), not the brief's screen titles.
 *  - **Authored here:** screen 3's two lines, which teach the frame in place of
 *    the brief's intensity-control body (Story 2.7 owns that control).
 */

/** The four screens, in the order the path presents them — a closed union. */
export const ONBOARDING_SCREEN_KEYS = [
  'notice',
  'local',
  'night',
  'permissions',
] as const;

export type OnboardingScreenKey = (typeof ONBOARDING_SCREEN_KEYS)[number];

/** One screen's copy: a kicker, a headline, body lines and the action label. */
export type OnboardingScreenCopy = {
  readonly key: OnboardingScreenKey;
  readonly kicker: string;
  readonly headline: string;
  readonly body: readonly string[];
  readonly actionLabel: string;
};

const notice: OnboardingScreenCopy = {
  key: 'notice',
  kicker: 'Before you start',
  // The ratified safe form (addendum §B.4 row 27); the claims lint's
  // `allowedPhrases` carves it out, and it is the epic's own frame sentence.
  headline: 'Nothing here is proof.',
  body: [
    // Imported constant — the one string the whole product shares.
    ENTERTAINMENT_LINE,
    'It offers tools, a ritual, and a record.',
    'It measures nothing and concludes nothing.',
  ],
  actionLabel: 'I understand',
};

const local: OnboardingScreenCopy = {
  key: 'local',
  kicker: 'Your case',
  headline: 'Your case is local.',
  body: [
    'Each case is drawn from where you are.',
    'The hour and the light shape it.',
    // The EXPERIENCE.md-mandated form: "nothing leaves this phone" — never
    // "nothing is recorded".
    'Nothing leaves this phone.',
  ],
  actionLabel: 'Continue',
};

const night: OnboardingScreenCopy = {
  key: 'night',
  kicker: 'Your night',
  headline: 'You choose your night.',
  body: [
    'The night starts when you say it does.',
    'You set it before the field opens.',
  ],
  actionLabel: 'Continue',
};

const permissions: OnboardingScreenCopy = {
  key: 'permissions',
  kicker: 'Permissions',
  headline: 'Permissions are asked only when needed.',
  body: [
    'A sensor is only asked for when needed.',
    'Nothing at launch. Nothing without a tool.',
    'Every part of a night works without it.',
  ],
  actionLabel: 'Enter NightTrace',
};

/** The four screens' copy, in path order. */
export const ONBOARDING_SCREENS: readonly OnboardingScreenCopy[] = [
  notice,
  local,
  night,
  permissions,
];

/** The copy keyed by screen, for a screen that renders its own body. */
export const ONBOARDING_COPY: Readonly<
  Record<OnboardingScreenKey, OnboardingScreenCopy>
> = {
  notice,
  local,
  night,
  permissions,
};
