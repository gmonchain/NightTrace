import { useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { PROFILE_COPY } from '@/data/strings';
import { Rule } from '@/ui/components';
import { DECORATIVE } from '@/ui/components/a11y';
import { colors, spacing, typography } from '@/ui/theme/tokens';
import { textStyle } from '@/ui/theme/type';

/**
 * `ProfileScreen` — the Profile body (Story 1.7).
 *
 * This is the minimal Profile *destination* Story 1.8's four-tab shell will
 * hold. It carries the screen title and one row — `About & entertainment` —
 * that opens the notice. It deliberately has **no stat row**: the design's
 * Profile identity block needs case data a later epic owns, and inventing one
 * here would pre-empt it.
 *
 * The row is a **normal destination**, not a hidden or developer gesture: a
 * full-width, ruled, tappable row labelled for assistive technology, styled in
 * the product's ledger language (a `Rule` hairline rather than a box). It takes
 * `onOpenAbout` and never navigates itself (the route owns navigation, AD-12).
 * No permission is requested and no sensor is read on this screen.
 */

export type ProfileScreenProps = {
  /** Open the About notice — the route owns the navigation. */
  readonly onOpenAbout: () => void;
};

/** The row's trailing affordance glyph — decorative, read by no screen reader. */
const CHEVRON = '\u203A';

const titleStyle = textStyle(typography.heading);
const rowLabelStyle = textStyle(typography['prose-small']);
const chevronStyle = textStyle(typography['prose-small']);

export function ProfileScreen({
  onOpenAbout,
}: ProfileScreenProps): React.JSX.Element {
  // Read the insets from the context so a screen rendered outside a provider
  // resolves to zero rather than throwing (the Story 1.4 / Story 1.6
  // convention) — the title clears the status bar and any notch.
  const insets = useContext(SafeAreaInsetsContext);
  const topInset = insets?.top ?? 0;

  return (
    <View style={[styles.screen, { paddingTop: topInset + spacing['6'] }]}>
      <Text accessibilityRole="header" style={[titleStyle, styles.title]}>
        {PROFILE_COPY.title}
      </Text>
      <Rule />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={PROFILE_COPY.aboutRowLabel}
        onPress={onOpenAbout}
        style={styles.row}
      >
        <Text style={[rowLabelStyle, styles.rowLabel]}>
          {PROFILE_COPY.aboutRowLabel}
        </Text>
        <Text {...DECORATIVE} style={[chevronStyle, styles.chevron]}>
          {CHEVRON}
        </Text>
      </Pressable>
      <Rule variant="soft" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.night,
    flex: 1,
    gap: spacing['4'],
    paddingHorizontal: spacing['6'],
    // `paddingTop` is supplied at render time from the safe-area inset.
  },
  title: {
    color: colors.bone,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing['3'],
    justifyContent: 'space-between',
    paddingVertical: spacing['5'],
  },
  rowLabel: {
    color: colors.bone,
  },
  chevron: {
    color: colors.ash,
  },
});
