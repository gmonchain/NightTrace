/**
 * `LedgerRow` — glyph, type label, time and a verdict chip, separated by a
 * `Rule` and never by a card.
 *
 * The ledger is the case's running record: rows are ruled hairlines, not boxes
 * (DESIGN.md, Layout & Spacing; Components). The glyph is set in the type step
 * `components['ledger-row'].glyph` names, and the trailing divider is the
 * `components['ledger-row'].divider` hairline (`colors.rule`) the `Rule`
 * component already draws.
 *
 * The verdict set is closed: `UNEXPLAINED`, `INCONCLUSIVE`, `EXPLAINED`,
 * `UNREVIEWED`. An `EXPLAINED` row carries a struck-through glyph; a row whose
 * case was deleted stays and carries a `NO CASE` chip rather than disappearing
 * (AD-24). Every verdict renders in the same `ash` — `UNREVIEWED` included —
 * except `UNEXPLAINED`, which takes the ink.
 *
 * The verdict and `NO CASE` chips are the ledger's own marks, **not** the state
 * `Chip`: that component's label union is the closed five state labels and a
 * verdict is not one of them, so widening it would be wrong. This local chip
 * reuses the state chip's document geometry — a `rule-strong` border (or
 * `olive` when live) at `rounded.DEFAULT` with its label in `typography.meta`.
 */

import { Text, View } from 'react-native';

import { colors, rounded, spacing, typography } from '../theme/tokens';
import { textStyle } from '../theme/type';
import { DECORATIVE } from './a11y';
import { Rule } from './Rule';

/** The four verdicts a ledger row can carry — a closed union. */
export const LEDGER_VERDICTS = [
  'UNEXPLAINED',
  'INCONCLUSIVE',
  'EXPLAINED',
  'UNREVIEWED',
] as const;

export type LedgerVerdict = (typeof LEDGER_VERDICTS)[number];

export type LedgerRowProps = {
  /** The evidence glyph, e.g. `⁘`. */
  readonly glyph: string;
  readonly typeLabel: string;
  readonly time: string;
  readonly verdict: LedgerVerdict;
  /** The row's case was deleted: keep the row, add a `NO CASE` chip (AD-24). */
  readonly caseDeleted?: boolean;
};

type LedgerChipTone = 'ash' | 'ink';

const typeStyle = textStyle(typography.label);
const timeStyle = textStyle(typography.meta);
// The glyph's type step is the one `components['ledger-row'].glyph` names.
const glyphStyle = textStyle(typography.label);
const chipLabelStyle = textStyle(typography.meta);

/** Every verdict collapses to `ash` except `UNEXPLAINED`, which takes the ink. */
function verdictTone(verdict: LedgerVerdict): LedgerChipTone {
  switch (verdict) {
    case 'UNEXPLAINED':
      return 'ink';
    case 'INCONCLUSIVE':
    case 'EXPLAINED':
    case 'UNREVIEWED':
      return 'ash';
    default: {
      const exhaustive: never = verdict;
      return exhaustive;
    }
  }
}

function chipTone(tone: LedgerChipTone): {
  readonly borderColor: string;
  readonly color: string;
} {
  switch (tone) {
    case 'ash':
      return { borderColor: colors['rule-strong'], color: colors.ash };
    case 'ink':
      return { borderColor: colors.olive, color: colors['safelight-soft'] };
    default: {
      const exhaustive: never = tone;
      return exhaustive;
    }
  }
}

/** The ledger's own chip — the state `Chip`'s geometry, a verdict's vocabulary. */
function LedgerChip({
  label,
  tone,
}: {
  readonly label: string;
  readonly tone: LedgerChipTone;
}): React.JSX.Element {
  const { borderColor, color } = chipTone(tone);
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor,
        borderRadius: rounded.DEFAULT,
        paddingHorizontal: spacing['2'],
        paddingVertical: spacing['1'],
      }}
    >
      <Text style={[chipLabelStyle, { color }]}>{label}</Text>
    </View>
  );
}

export function LedgerRow({
  glyph,
  typeLabel,
  time,
  verdict,
  caseDeleted = false,
}: LedgerRowProps): React.JSX.Element {
  const explained = verdict === 'EXPLAINED';
  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing['3'],
          paddingVertical: spacing['4'],
        }}
      >
        <Text
          {...DECORATIVE}
          style={[
            glyphStyle,
            { color: colors['safelight-soft'] },
            explained ? { textDecorationLine: 'line-through' } : null,
          ]}
        >
          {glyph}
        </Text>
        <View style={{ flex: 1, gap: spacing['1'] }}>
          <Text style={[typeStyle, { color: colors.bone }]}>{typeLabel}</Text>
          <Text style={[timeStyle, { color: colors.ash }]}>{time}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['2'] }}>
          {caseDeleted ? <LedgerChip label="NO CASE" tone="ash" /> : null}
          <LedgerChip label={verdict} tone={verdictTone(verdict)} />
        </View>
      </View>
      <Rule />
    </View>
  );
}
