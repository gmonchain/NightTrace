/**
 * `Sheet` — the ledger surface every sheet in the product rises on.
 *
 * `colors.ledger` at `rounded.sheet` on its **top corners only**, a
 * `colors['rule-strong']` grabber bar, entering on `animations.ntUp` over a
 * scrim that fades on `animations.ntFade` (DESIGN.md, Components). Depth is the
 * tone step plus the top hairline — **there is no blur behind the sheet and no
 * shadow**; the scrim dims for focus, never for depth (DESIGN.md, Elevation &
 * Depth). A document surface is never fully rounded, so the bottom corners stay
 * square (DESIGN.md, Shapes).
 *
 * **"Sheets never stack two deep" is a navigation rule, and this primitive
 * cannot hold it.** Whether a sheet is presented over a session or replaced is
 * the route tree's decision (AD-29); inventing a guard here would let a
 * presentational component veto a screen. The composing screen owns it — as it
 * owns dismissal, which is why the scrim carries no press handler and the
 * design's sheets each carry their own button.
 *
 * The panel's translateY entrance is a token-free geometry offset (the design
 * source does not tokenize it) — the *durations* are the tokens, and they are
 * the part the design fixes.
 *
 * **Under Reduce Motion the entrance does not animate: the branch snaps both
 * values to rest in the presenting frame** — the panel at `rise = 0` (animated
 * opacity `1`, no translate) and the scrim at `SHEET_SCRIM_OPACITY` — so the
 * sweeping `ntUp` slide NFR-11 requires removed is dropped rather than
 * shortened, and the sheet is *presented* at its resting state instead of
 * transitioning into it. A caller that cross-fades content *into* the sheet
 * owns that cross-fade; this primitive holds one static surface.
 *
 * **A sheet is modal to assistive technology.** `accessibilityViewIsModal`
 * makes VoiceOver ignore the elements behind the presented surface, so a screen
 * reader cannot reach or activate the screen a sheet covers (AD-28).
 */

import { useContext, useEffect, useState, type ReactNode } from 'react';
import {
  AccessibilityInfo,
  Animated,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import {
  animations,
  colors,
  components,
  rounded,
  spacing,
} from '../theme/tokens';
import { DECORATIVE } from './a11y';

/**
 * How far the scrim dims what is behind it. The design source tokenizes the
 * sheet's surface, radius and grabber but not its dim strength, so the value the
 * reference prototype draws (`rgba(2,4,3,.72)`) is fixed here rather than
 * invented as a token the design source would then have to carry.
 */
export const SHEET_SCRIM_OPACITY = 0.72;

/** The panel's entrance offset — geometry the design source does not tokenize. */
const SHEET_RISE = spacing['5'] + spacing['3'];

/** The panel's resting bottom padding, before the device's safe-area inset. */
const SHEET_PADDING_BOTTOM = spacing['9'] - spacing['5'];

/** The grabber bar's thickness: three of the 1px rule. */
const GRABBER_HEIGHT = components.rule.height * 3;

export type SheetProps = {
  readonly children: ReactNode;
  readonly style?: StyleProp<ViewStyle>;
};

export function Sheet({ children, style }: SheetProps): React.JSX.Element {
  const [scrim] = useState(() => new Animated.Value(0));
  const [rise] = useState(() => new Animated.Value(1));

  // The bottom safe-area inset keeps the sheet's last row off the home
  // indicator. Read from the context so a sheet rendered outside a provider
  // resolves to zero rather than throwing.
  const insets = useContext(SafeAreaInsetsContext);
  const bottomInset = insets?.bottom ?? 0;

  useEffect(() => {
    let cancelled = false;
    let fade: Animated.CompositeAnimation | null = null;
    let up: Animated.CompositeAnimation | null = null;
    // The resting state: the panel at rest and the scrim at its full dim.
    const rest = (): void => {
      scrim.setValue(SHEET_SCRIM_OPACITY);
      rise.setValue(0);
    };
    // NFR-11: a user who asks for reduced motion gets the sheet presented at
    // rest — no slide, no fade — rather than a panel that sweeps up the screen.
    const apply = (reduceMotion: boolean): void => {
      if (cancelled) {
        return;
      }
      if (reduceMotion) {
        rest();
        return;
      }
      fade = Animated.timing(scrim, {
        toValue: SHEET_SCRIM_OPACITY,
        duration: animations.ntFade.durationMs,
        useNativeDriver: true,
      });
      fade.start();
      up = Animated.timing(rise, {
        toValue: 0,
        duration: animations.ntUp.durationMs,
        useNativeDriver: true,
      });
      up.start();
    };
    void AccessibilityInfo.isReduceMotionEnabled()
      .then(apply)
      // A rejected read must not leave the sheet invisible: seed the resting
      // state so the panel and scrim are visible without an entrance.
      .catch(() => {
        if (!cancelled) {
          rest();
        }
      });
    return () => {
      cancelled = true;
      fade?.stop();
      fade = null;
      up?.stop();
      up = null;
    };
  }, [scrim, rise]);

  return (
    // The sheet is modal: VoiceOver ignores the screen behind it.
    <View accessibilityViewIsModal style={[styles.container, style]}>
      <Animated.View
        {...DECORATIVE}
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: colors['night-deep'], opacity: scrim },
        ]}
      />
      <Animated.View
        style={[
          styles.panel,
          { paddingBottom: SHEET_PADDING_BOTTOM + bottomInset },
          {
            opacity: rise.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
            }),
            transform: [
              {
                translateY: rise.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, SHEET_RISE],
                }),
              },
            ],
          },
        ]}
      >
        <View {...DECORATIVE} style={styles.grabber} />
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: colors.ledger,
    borderTopWidth: components.rule.height,
    borderTopColor: colors['rule-strong'],
    borderTopLeftRadius: rounded.sheet,
    borderTopRightRadius: rounded.sheet,
    paddingTop: spacing['3'],
    paddingHorizontal: spacing['6'],
  },
  grabber: {
    alignSelf: 'center',
    width: spacing['8'],
    height: GRABBER_HEIGHT,
    borderRadius: rounded.DEFAULT,
    backgroundColor: colors['rule-strong'],
  },
});
