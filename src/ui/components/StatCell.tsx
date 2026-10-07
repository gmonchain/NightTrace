/**
 * `StatCell` — a label-above / value-below count.
 *
 * The label sits in `typography.meta` / `colors.ash` above the value in
 * `typography.label` / `colors.bone` (DESIGN.md, Components). It is used
 * four-up on the Case Report and Journal Overview (`CASES` · `HOURS` ·
 * `EVIDENCE` · `ENCOUNTERS`) and three-up on the Share Card, a subset.
 *
 * **A measurement is unrepresentable, from either prop.** The value is a
 * `number` and the component appends nothing to it — no unit, no `%`, no
 * fraction glyph, no formatter or suffix prop exists to carry one. The label is
 * a **closed union of the report's four count labels**, not a bare `string`,
 * because a free-text label is a second channel a caller could render a
 * measurement through. A non-finite `value` is programmer error at the call
 * site (AD-14 locates it in the shell), not a state this presentational
 * primitive guards.
 */

import { Text, View } from 'react-native';

import { colors, spacing, typography } from '../theme/tokens';
import { textStyle } from '../theme/type';

/** The report's four count labels; the Share Card's three-up is a subset. */
export const STAT_CELL_LABELS = [
  'CASES',
  'HOURS',
  'EVIDENCE',
  'ENCOUNTERS',
] as const;

export type StatCellLabel = (typeof STAT_CELL_LABELS)[number];

export type StatCellProps = {
  readonly label: StatCellLabel;
  /** A count of things that happened or a span of elapsed time. Never a unit. */
  readonly value: number;
};

const labelStyle = textStyle(typography.meta);
const valueStyle = textStyle(typography.label);

export function StatCell({ label, value }: StatCellProps): React.JSX.Element {
  return (
    <View style={{ gap: spacing['1'] }}>
      <Text style={[labelStyle, { color: colors.ash }]}>{label}</Text>
      <Text style={[valueStyle, { color: colors.bone }]}>{value}</Text>
    </View>
  );
}
