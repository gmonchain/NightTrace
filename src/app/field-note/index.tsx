import { RoutePlaceholder } from '@/features/shell/RoutePlaceholder';

/**
 * `FIELD NOTE` (Story 1.8) — a placeholder.
 *
 * Its own mode, not a case and with no report (the screen tree's standalone
 * surface): a sibling of `(tabs)`, so no tab bar renders here.
 */
export default function FieldNoteRoute() {
  return <RoutePlaceholder route="fieldNote" />;
}
