/**
 * `RoutePlaceholder` — the one shared placeholder surface (Story 1.8).
 *
 * Every declared route this story adds is a placeholder: it renders the route's
 * **declared name** (read from `navigation.ts`'s `ROUTE_TREE` through the route
 * key), and nothing else. It authors **no product copy** — the name is the
 * route's own identifier from the declaration, not a shipped sentence, so a
 * placeholder can never drift from the screen tree it stands in for.
 *
 * It carries no behaviour: no data access, no engine call (AD-12), no
 * navigation, no permission, no sensor and no network. It is the three-line
 * body every placeholder route wraps, so the tree the acceptance criteria
 * requires is declared once and rendered everywhere.
 */

import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/ui/theme/tokens';
import { textStyle } from '@/ui/theme/type';

import { routeEntry, type RouteKey } from './navigation';

export type RoutePlaceholderProps = {
  /** The declared route this placeholder stands in for. */
  readonly route: RouteKey;
};

const nameStyle = textStyle(typography.heading);

export function RoutePlaceholder({
  route,
}: RoutePlaceholderProps): React.JSX.Element {
  const entry = routeEntry(route);
  return (
    <View
      testID={`route-placeholder:${entry.id}`}
      style={styles.screen}
    >
      <Text accessibilityRole="header" style={[nameStyle, styles.name]}>
        {entry.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: 'center',
    backgroundColor: colors.night,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing['6'],
  },
  name: {
    color: colors.bone,
  },
});
