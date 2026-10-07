/**
 * `Chip` — the system's state marker.
 *
 * A `rule-strong` border at `rounded.DEFAULT` with its label in
 * `typography.meta`. The label set is the design source's closed five —
 * `READY`, `INFERRED`, `UNCHARTED`, `INTERFERENCE`, `REVISED` — so a caller
 * cannot render an arbitrary word through it and, above all, cannot smuggle a
 * measurement or a second vocabulary through a free-text prop.
 *
 * A chip carrying a **live** payload swaps the border to `colors.olive` and
 * nothing else: never a coloured fill, never an icon, never a trailing element
 * (DESIGN.md, Components; Do's and Don'ts).
 *
 * The label renders in uppercase (the design says uppercase, not the caller).
 * Every `ChipLabel` is already spelled uppercase, so the component's
 * `.toUpperCase()` is a **defensive no-op, not the guard** — the closed union
 * is what forbids an arbitrary or measurement-bearing word. The word is also
 * the accessible name, so state never rides on colour alone (UX-DR25, AD-17).
 */

import { Text, View } from 'react-native';

import { colors, rounded, spacing, typography } from '../theme/tokens';
import { textStyle } from '../theme/type';

/** The design source's five state labels — a closed union. */
export const CHIP_LABELS = [
  'READY',
  'INFERRED',
  'UNCHARTED',
  'INTERFERENCE',
  'REVISED',
] as const;

export type ChipLabel = (typeof CHIP_LABELS)[number];

export type ChipProps = {
  readonly label: ChipLabel;
  /** A chip carrying a live payload takes the `olive` border. */
  readonly live?: boolean;
};

const labelStyle = textStyle(typography.meta);

export function Chip({ label, live = false }: ChipProps): React.JSX.Element {
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: live ? colors.olive : colors['rule-strong'],
        borderRadius: rounded.DEFAULT,
        paddingHorizontal: spacing['2'],
        paddingVertical: spacing['1'],
      }}
    >
      <Text accessibilityRole="text" style={[labelStyle, { color: colors.ash }]}>
        {/* Defensive: every ChipLabel is already uppercase, so this is a no-op. */}
        {label.toUpperCase()}
      </Text>
    </View>
  );
}
