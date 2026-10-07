/**
 * `TabBar` — the product's whole information architecture, and its only badge.
 *
 * Four tabs on `colors.night` with a top hairline (the composed `Rule`). The
 * active label reads `components['tab-bar'].active` (`colors.bone`) with a
 * `bone` underline; the other three read `components['tab-bar'].idle`
 * (`colors.ash`). The set is a closed union (`HOME`, `INVESTIGATE`,
 * `FIELD JOURNAL`, `PROFILE`), so an unknown tab id is a compile error and a
 * fifth tab is a deliberate change to this component (AD-29; DESIGN.md,
 * Components).
 *
 * **Exactly one badge type exists in the product.** A single
 * `components['tab-bar'].badge` (`colors.safelight`) dot sits on Field Journal
 * when a case is unsealed. The component therefore takes one boolean, not a
 * badge map: a second badge kind cannot be added without editing this
 * component's prop surface *and* the suite that pins the rule
 * (`__tests__/tab-badge.test.tsx`). The dot itself is decorative to assistive
 * technology; the unsealed state is announced as a word on the tab, so nothing
 * rides on colour alone (AD-28).
 *
 * Labels are uppercased by the component, not the caller — every `TabId` is
 * already uppercase, so the transform is a defensive no-op, not the guard.
 *
 * **The active tab is not selectable.** Pressing the tab that is already active
 * is a no-op — the bar reports a *change*, so a re-tap never fires `onSelect`
 * and never re-navigates a screen that is already on top.
 *
 * The bar is the bottom-most surface, so it carries the device's bottom
 * safe-area inset: the labels are lifted clear of the home indicator.
 */

import { useContext } from 'react';
import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import {
  colors,
  components,
  rounded,
  spacing,
  typography,
} from '../theme/tokens';
import { textStyle } from '../theme/type';
import { DECORATIVE } from './a11y';
import { Rule } from './Rule';

/** The four tabs, in the IA's own order — a closed union. */
export const TAB_IDS = ['HOME', 'INVESTIGATE', 'FIELD JOURNAL', 'PROFILE'] as const;

export type TabId = (typeof TAB_IDS)[number];

export type TabBarProps = {
  readonly activeTab: TabId;
  readonly onSelect: (tab: TabId) => void;
  /**
   * A single badge: a `safelight` dot on Field Journal when a case is unsealed.
   * There is no other badge kind, and no map of badges.
   */
  readonly unsealedCase?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

/** The one tab that can carry the badge. */
const BADGE_TAB: TabId = 'FIELD JOURNAL';

const labelStyle = textStyle(typography.meta);

type TabProps = {
  readonly id: TabId;
  readonly active: boolean;
  readonly badge: boolean;
  readonly onSelect: (tab: TabId) => void;
};

function Tab({ id, active, badge, onSelect }: TabProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={badge ? `${id}, case unsealed` : id}
      onPress={() => {
        // The bar reports a change; re-selecting the active tab is a no-op.
        if (!active) {
          onSelect(id);
        }
      }}
      style={{
        flex: 1,
        alignItems: 'center',
        gap: spacing['2'],
        paddingVertical: spacing['3'],
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['2'] }}>
        <Text style={[labelStyle, { color: active ? colors.bone : colors.ash }]}>
          {id.toUpperCase()}
        </Text>
        {badge ? <View {...DECORATIVE} style={badgeDotStyle} /> : null}
      </View>
      <View
        style={{
          alignSelf: 'stretch',
          height: components.rule.height,
          backgroundColor: active ? colors.bone : 'transparent',
        }}
      />
    </Pressable>
  );
}

const badgeDotStyle = {
  width: spacing['2'],
  height: spacing['2'],
  borderRadius: rounded.full,
  backgroundColor: colors.safelight,
} as const;

export function TabBar({
  activeTab,
  onSelect,
  unsealedCase = false,
  style,
}: TabBarProps): React.JSX.Element {
  // The bottom safe-area inset lifts the labels clear of the home indicator. A
  // bar rendered outside a provider resolves to zero rather than throwing.
  const insets = useContext(SafeAreaInsetsContext);
  const bottomInset = insets?.bottom ?? 0;

  return (
    <View
      style={[
        { backgroundColor: colors.night, paddingBottom: bottomInset },
        style,
      ]}
    >
      <Rule />
      <View style={{ flexDirection: 'row' }}>
        {TAB_IDS.map((id) => (
          <Tab
            key={id}
            id={id}
            active={id === activeTab}
            badge={id === BADGE_TAB && unsealedCase}
            onSelect={onSelect}
          />
        ))}
      </View>
    </View>
  );
}
