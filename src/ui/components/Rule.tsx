/**
 * `Rule` — the two-variant hairline.
 *
 * The primary structural device of the whole design language: the page is
 * *ruled*, not boxed, so a NightTrace surface is separated by lines rather than
 * by borders drawn all the way around (DESIGN.md, Elevation & Depth; Do's and
 * Don'ts). Every other surface in this story composes it.
 *
 * Colour and height come from the token set — `colors.rule` /
 * `colors['rule-soft']` and `components.rule.height` /
 * `components['rule-soft'].height` — never a literal. The variant set is a
 * closed union and the `switch` over it is exhaustive.
 *
 * A hairline is decoration, so it is hidden from assistive technology (AD-28).
 */

import { View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, components } from '../theme/tokens';
import { DECORATIVE } from './a11y';

/** The two hairlines the design source names. */
export const RULE_VARIANTS = ['default', 'soft'] as const;

export type RuleVariant = (typeof RULE_VARIANTS)[number];

type RuleAppearance = {
  readonly backgroundColor: string;
  readonly height: number;
};

/** The colour and thickness of one variant, read from the tokens. */
function ruleAppearance(variant: RuleVariant): RuleAppearance {
  switch (variant) {
    case 'default':
      return { backgroundColor: colors.rule, height: components.rule.height };
    case 'soft':
      return {
        backgroundColor: colors['rule-soft'],
        height: components['rule-soft'].height,
      };
    default: {
      const exhaustive: never = variant;
      return exhaustive;
    }
  }
}

export type RuleProps = {
  readonly variant?: RuleVariant;
  /**
   * Margins only, merged last — the same convention the rest of the codebase
   * uses. Layout (the rule spans the full width of its column) is the
   * component's; spacing around it belongs to the surface composing it.
   */
  readonly style?: StyleProp<ViewStyle>;
};

export function Rule({ variant = 'default', style }: RuleProps): React.JSX.Element {
  const { backgroundColor, height } = ruleAppearance(variant);
  return (
    <View
      {...DECORATIVE}
      style={[{ alignSelf: 'stretch', backgroundColor, height }, style]}
    />
  );
}
