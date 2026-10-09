import { RoutePlaceholder } from '@/features/shell/RoutePlaceholder';

/**
 * `CASE REPORT` (Story 1.8) — a placeholder.
 *
 * It is a **destination, not a modal**: it is pushed over the tabs on the root
 * stack (its group has no presentation override), so it reads as a document
 * rather than a sheet — the screen tree's rule.
 */
export default function CaseReportRoute() {
  return <RoutePlaceholder route="caseReport" />;
}
