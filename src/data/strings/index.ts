/**
 * The UI string-table location — `src/data/strings/**`.
 *
 * This directory is the declared "UI string tables" surface in
 * `scripts/claims/config.json`, and every file here must appear in that set
 * (Story 1.5's coverage test fails when a new table is added without it). The
 * barrel is the one import surface later stories read: the shared entertainment
 * line, the About notice table Story 1.7 renders and exports, and Story 1.6's
 * four onboarding screens' copy.
 */
export { ENTERTAINMENT_LINE } from './entertainment';
export {
  ABOUT_NOTICE,
  ABOUT_NOTICE_SECTIONS,
  ABOUT_NOTICE_SENSOR_HEADING,
  ABOUT_NOTICE_SENSORS,
  ABOUT_NOTICE_SENSOR_NOTE,
  type AboutNoticeSection,
  type AboutSensorRow,
} from './aboutNotice';
export {
  ONBOARDING_COPY,
  ONBOARDING_SCREENS,
  ONBOARDING_SCREEN_KEYS,
  type OnboardingScreenCopy,
  type OnboardingScreenKey,
} from './onboarding';
export {
  ABOUT_NOTICE_COPY,
  PROFILE_COPY,
  type AboutCopy,
  type ProfileCopy,
} from './profile';
