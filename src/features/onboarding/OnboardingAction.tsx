import {
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, components, rounded, spacing, typography } from '@/ui/theme/tokens';
import { textStyle } from '@/ui/theme/type';

/**
 * `OnboardingAction` — the onboarding path's primary action.
 *
 * `DESIGN.md`'s Components list names no `Button`, so this is **feature-local,
 * not a thirteenth `src/ui/components` primitive** (Story 1.6, Design Notes). It
 * is composed entirely from tokens — `colors.ledger` on a `rule-strong` hairline
 * border at `rounded.DEFAULT`, the label in `typography.label` — so it obeys the
 * raw-value rule (AD-17) and cannot invent a visual language the design system
 * does not own.
 *
 * The label is rendered as authored (the design source spells the onboarding
 * buttons sentence-case: `I understand`, `Continue`, `Enter NightTrace`) and is
 * also the accessible name, so the action reads as a word rather than as a
 * colour or position.
 */

export type OnboardingActionProps = {
  readonly label: string;
  readonly onPress: () => void;
  readonly style?: StyleProp<ViewStyle>;
};

const labelStyle = textStyle(typography.label);

export function OnboardingAction({
  label,
  onPress,
  style,
}: OnboardingActionProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.action, style]}
    >
      <Text style={[labelStyle, styles.label]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  action: {
    alignItems: 'center',
    backgroundColor: colors.ledger,
    borderColor: colors['rule-strong'],
    borderRadius: rounded.DEFAULT,
    borderWidth: components.rule.height,
    paddingHorizontal: spacing['6'],
    paddingVertical: spacing['5'],
  },
  label: {
    color: colors.bone,
  },
});
