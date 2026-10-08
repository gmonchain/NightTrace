/**
 * The UI string-table location — `src/data/strings/**`.
 *
 * This directory is the declared "UI string tables" surface in
 * `scripts/claims/config.json`, and every file here must appear in that set
 * (Story 1.5's coverage test fails when a new table is added without it). The
 * barrel is the one import surface later stories read: the shared entertainment
 * line and the About notice table Story 1.7 renders and exports.
 */
export { ENTERTAINMENT_LINE } from './entertainment';
export {
  ABOUT_NOTICE,
  ABOUT_NOTICE_SECTIONS,
  ABOUT_NOTICE_SENSORS,
  ABOUT_NOTICE_SENSOR_NOTE,
  type AboutNoticeSection,
  type AboutSensorRow,
} from './aboutNotice';
