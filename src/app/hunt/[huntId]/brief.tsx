import { RoutePlaceholder } from '@/features/shell/RoutePlaceholder';

/**
 * `HUNT BRIEF` (Story 1.8) — a placeholder.
 *
 * It is a sibling of `(tabs)`, so the tab bar is structurally absent here (the
 * screen tree: "tab bar hidden — the ritual gear-up"). The Brief's own surfaces
 * are a later epic.
 */
export default function HuntBriefRoute() {
  return <RoutePlaceholder route="huntBrief" />;
}
