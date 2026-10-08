import { useContext, type ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { Rule } from '@/ui/components';
import { colors, spacing, typography } from '@/ui/theme/tokens';
import { textStyle } from '@/ui/theme/type';

/**
 * `OnboardingFrame` — the shared frame the four onboarding screens sit in.
 *
 * One frame, so the position indicator cannot drift between screens (Story 1.6,
 * Design Notes). Top to bottom: **four hairlines** across the top, a small-caps
 * kicker, a display headline, the body lines, and the action slot pinned above
 * the safe area. The frame carries the device's safe-area insets so neither the
 * kicker nor the action sits under a notch or the home indicator.
 *
 * The copy block is a `ScrollView` and the action slot sits **outside** it: at
 * the largest Dynamic Type sizes the body clamps and scrolls, and the button
 * never leaves the screen (the design brief's own edge case).
 *
 * **The indicator is exactly four hairlines — never a percentage, a fraction or
 * "2 of 4".** It is composed from `Rule` (whose own `DECORATIVE` hides it from
 * assistive technology) so it is decorative: it announces no position, and the
 * screen's own headline and body carry the meaning. The current position is the
 * one brighter hairline (`Rule`'s `default` variant); the others are the `soft`
 * variant. Four hairlines, a subtle position, no count.
 *
 * The kicker's small-caps look is `textTransform: 'uppercase'`, not
 * `toUpperCase()`, so the string the user's assistive technology reads is the
 * authored sentence case.
 *
 * The frame is a function of its props — no store, no fetching, no clock — so a
 * later story can render any screen through it, and this story's suite can
 * assert the anatomy directly.
 */

/** The four positions, in path order — a closed union. */
export const ONBOARDING_STEPS = [1, 2, 3, 4] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

/** The four hairlines are the whole indicator; nothing else counts. */
export const ONBOARDING_HAIRLINE_COUNT = ONBOARDING_STEPS.length;

export type OnboardingFrameProps = {
  /** Which of the four screens this is, `1..4` — the brighter hairline. */
  readonly step: OnboardingStep;
  readonly kicker: string;
  readonly headline: string;
  readonly body: readonly string[];
  /** The action slot, pinned above the safe area. */
  readonly children: ReactNode;
  readonly style?: StyleProp<ViewStyle>;
};

const kickerStyle = textStyle(typography.label);
const headlineStyle = textStyle(typography.title);
const bodyStyle = textStyle(typography['prose-small']);

export function OnboardingFrame({
  step,
  kicker,
  headline,
  body,
  children,
  style,
}: OnboardingFrameProps): React.JSX.Element {
  // Read the insets from the context so a frame rendered outside a provider
  // resolves to zero rather than throwing (the Story 1.4 convention).
  const insets = useContext(SafeAreaInsetsContext);
  const topInset = insets?.top ?? 0;
  const bottomInset = insets?.bottom ?? 0;

  return (
    <View
      style={[
        styles.frame,
        {
          paddingTop: topInset + spacing['6'],
          paddingBottom: bottomInset + spacing['6'],
        },
        style,
      ]}
    >
      <View testID="onboarding-progress" style={styles.progress}>
        {ONBOARDING_STEPS.map((position) => (
          <Rule
            key={position}
            // `default` (colors.rule) is the current position; `soft`
            // (colors['rule-soft']) the others. Both are decorative.
            variant={position === step ? 'default' : 'soft'}
            style={styles.hairline}
          />
        ))}
      </View>

      <ScrollView
        testID="onboarding-copy"
        style={styles.scroll}
        contentContainerStyle={styles.copy}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[kickerStyle, styles.kicker]}>{kicker}</Text>
        <Text
          accessibilityRole="header"
          style={[headlineStyle, styles.headline]}
        >
          {headline}
        </Text>
        {body.map((line, index) => (
          // The index is part of the key so a repeated line cannot collide.
          <Text key={`${index}-${line}`} style={[bodyStyle, styles.bodyLine]}>
            {line}
          </Text>
        ))}
      </ScrollView>

      <View style={styles.action}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: colors.night,
    flex: 1,
    paddingHorizontal: spacing['6'],
  },
  progress: {
    flexDirection: 'row',
    gap: spacing['2'],
  },
  hairline: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  copy: {
    // `flexGrow` (not `flex`) so a short body centres in the remaining space
    // while a long one scrolls behind the pinned action.
    flexGrow: 1,
    gap: spacing['4'],
    justifyContent: 'center',
  },
  kicker: {
    color: colors.dim,
    // Small caps without changing the authored string the screen reader reads.
    textTransform: 'uppercase',
  },
  headline: {
    color: colors.bone,
  },
  bodyLine: {
    color: colors.prose,
  },
  action: {
    paddingTop: spacing['5'],
  },
});
