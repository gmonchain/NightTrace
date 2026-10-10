/**
 * `FieldView` — the session's resting surface.
 *
 * Three concentric hairlines around a centre dot, breathing once per
 * `animations.ntBreathe.durationMs` — the product's resting heartbeat — with the
 * state word beneath in `typography.label` at **0.42em** tracking (the one place
 * the design uses letter-spacing as layout rather than texture, so a
 * five-character word spans the field). The tracking goes through `textStyle`,
 * so the em converts to absolute points exactly once (DESIGN.md, Typography;
 * Components).
 *
 * **The rings and the dot are decoration; the state word is the content.** They
 * are hidden from assistive technology, and the word is what is announced
 * (AD-28). The word is a closed union — `QUIET` · `LISTENING` · `ACTIVE` ·
 * `CONTACT` — so a caller cannot render a reading through it.
 *
 * The ring stack is geometry the design source does not tokenize; it is derived
 * from the `spacing` stops (the outer diameter and the two insets), and only the
 * outer ring breathes, matching the reference prototype.
 *
 * **Under Reduce Motion the animation is `none`**: the loop is never started and
 * the rings sit static at rest (NFR-11 / UX-DR54). The branch lives inside the
 * component so no caller can forget it, and the suite asserts it directly.
 */

import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import {
  animations,
  colors,
  rounded,
  spacing,
  typography,
} from '../theme/tokens';
import { textStyle } from '../theme/type';
import { DECORATIVE } from './a11y';
import { SESSION_STATE_WORDS } from '../../engine/models';

/**
 * The four session state words — the **engine's** closed union, aliased here so
 * the design primitive and the session ladder can never drift apart (AD-25).
 */
export const FIELD_STATES = SESSION_STATE_WORDS;

export type FieldState = (typeof FIELD_STATES)[number];

export type FieldViewProps = {
  readonly state: FieldState;
  readonly style?: StyleProp<ViewStyle>;
};

/** The state word's tracking — the design's `0.42em`, in `em` as the tokens spell it. */
export const STATE_TRACKING_EM = 0.42;

/** The ring stack's geometry — exported so a suite imports it, never re-spells it. */
export const FIELD_SIZE = spacing['9'] * 4 + spacing['2'];
export const RING_MID_INSET = spacing['7'] + spacing['2'];
export const RING_INNER_INSET = spacing['9'] + spacing['6'];

/**
 * The outer ring's breath amplitude — the opacity and scale it breathes between
 * (the low end of the breath; the top is `1`). Exported so a suite can pin it.
 */
export const BREATH_DIM = 0.55;
export const BREATH_SCALE = 0.96;

const stateStyle = textStyle({ ...typography.label, letterSpacing: STATE_TRACKING_EM });

/**
 * The tracked word's absolute tracking, taken from the one conversion
 * `textStyle` performed rather than computed a second time by hand.
 */
const STATE_TRACKING_POINTS = stateStyle.letterSpacing ?? 0;

/**
 * The breath's two halves, composed from `animations.ntBreathe`. Exported so a
 * suite can assert the two halves sum to the token period — the loop is
 * composed from the token, never a literal.
 */
export function ntBreatheHalves(): {
  readonly downMs: number;
  readonly upMs: number;
} {
  const period = animations.ntBreathe.durationMs;
  return { downMs: period / 2, upMs: period / 2 };
}

function ringBox(inset: number): ViewStyle {
  return {
    position: 'absolute',
    top: inset,
    left: inset,
    right: inset,
    bottom: inset,
    borderRadius: rounded.full,
    borderWidth: 1,
  };
}

export function FieldView({ state, style }: FieldViewProps): React.JSX.Element {
  const [breath] = useState(() => new Animated.Value(1));

  useEffect(() => {
    let cancelled = false;
    let stopLoop: (() => void) | null = null;
    // NFR-11 / UX-DR54: a user who asks for reduced motion gets static rings,
    // so the loop is never started for them.
    void AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (cancelled || reduceMotion) {
        return;
      }
      const { downMs, upMs } = ntBreatheHalves();
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(breath, {
            toValue: 0,
            duration: downMs,
            useNativeDriver: true,
          }),
          Animated.timing(breath, {
            toValue: 1,
            duration: upMs,
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
      stopLoop = () => {
        loop.stop();
      };
    });
    return () => {
      cancelled = true;
      stopLoop?.();
    };
  }, [breath]);

  const outerStyle = {
    opacity: breath.interpolate({
      inputRange: [0, 1],
      outputRange: [BREATH_DIM, 1],
    }),
    transform: [
      {
        scale: breath.interpolate({
          inputRange: [0, 1],
          outputRange: [BREATH_SCALE, 1],
        }),
      },
    ],
  };

  return (
    <View style={[styles.container, style]}>
      <View {...DECORATIVE} style={styles.ringStack}>
        <Animated.View
          style={[ringBox(0), { borderColor: colors['rule-strong'] }, outerStyle]}
        />
        <View style={[ringBox(RING_MID_INSET), { borderColor: colors.rule }]} />
        <View
          style={[ringBox(RING_INNER_INSET), { borderColor: colors['rule-soft'] }]}
        />
        <View style={styles.dot} />
      </View>
      <Text
        accessibilityRole="text"
        style={[
          stateStyle,
          {
            color: colors.bone,
            // Offset the trailing tracking so the tracked word stays centred —
            // the same points `textStyle` already converted the `em` into.
            paddingLeft: STATE_TRACKING_POINTS,
          },
        ]}
      >
        {state}
      </Text>
    </View>
  );
}

const styles = {
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['7'],
  },
  ringStack: {
    width: FIELD_SIZE,
    height: FIELD_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: spacing['2'],
    height: spacing['2'],
    borderRadius: rounded.full,
    backgroundColor: colors.safelight,
  },
} as const satisfies Record<string, ViewStyle>;
