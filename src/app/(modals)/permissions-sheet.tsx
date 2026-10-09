import { RoutePlaceholder } from '@/features/shell/RoutePlaceholder';

/**
 * The Permissions sheet (Story 1.8) — a placeholder.
 *
 * Its file is `permissions-sheet.tsx` (route `/permissions-sheet`) rather than
 * `permissions` because Story 1.6's onboarding screen 4 already owns
 * `/permissions`: two routes may not resolve to the same path, and a plain
 * `(modals)/permissions.tsx` makes expo-router resolve `/permissions` to this
 * sheet, shadowing the onboarding screen. The sheet's *declared name* is still
 * `PERMISSIONS` (see `navigation.ts`); only the file/route is disambiguated.
 */
export default function PermissionsSheetRoute() {
  return <RoutePlaceholder route="sheetPermissions" />;
}
