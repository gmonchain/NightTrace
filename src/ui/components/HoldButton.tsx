/**
 * `HoldButton` — the product's *only* progress affordance.
 *
 * The two deliberate holds (`HOLD TO ENTER THE FIELD`, 800 ms; `SEAL & FILE`,
 * 600 ms) are the same control: a `components['hold-button'].height` box with a
 * `colors.bone` border at `rounded.DEFAULT` and its label in
 * `typography.label`. On press a `colors.safelight` fill advances along the
 * bottom edge over the variant's duration, read from
 * `components['hold-button'].fillDurations` — **never a literal and never a
 * prop**. The variant is the closed union `'enter' | 'seal'`, so the duration
 * cannot be smuggled in: "the fill indicates a gesture, never a quantity" is a
 * property of the component's surface, not a convention (DESIGN.md, Components;
 * AD-29).
 *
 * **The label swap is the Brief hold's alone.** Past half the `enter` duration
 * the label reads `Crossing over…`; the `seal` hold never swaps (EXPERIENCE.md,
 * Interaction Primitives). The swap is timed from `fillDurations.enterMs / 2`,
 * so it moves with the token.
 *
 * **The authored label is uppercased by the component.** The design says the
 * label is "uppercase tracked" (DESIGN.md, Components), so `label` is
 * uppercased here rather than trusted from the caller; the swap word
 * `Crossing over…` is the design source's own mixed-case string and is rendered
 * verbatim.
 *
 * **Nothing here is the sole signal for anything.** The fill and the label
 * carry the same information; the control's accessible name stays its own label
 * (never the transient swap word), the hold's state change is reported through
 * `accessibilityValue`, and `accessibilityHint` names the gesture. An
 * assistive-technology activation has its own path (`onAccessibilityTap`) that
 * completes the hold rather than reading as an early release. There is no live
 * region — NFR-10 restricts those to evidence capture and phase change. Haptics
 * are out of scope — no haptics dependency is installed — and the hold is still
 * completable without one.
 *
 * **Reduce Motion does not gate the fill.** The fill is direct-manipulation
 * feedback for a gesture the user is performing, not a decorative transition or
 * a loop; NFR-11's branch names the loops this story renders (`ntBreathe`,
 * `ntPulse`) and the one-shot entrance transitions. Suppressing the fill would
 * leave the gesture with no feedback at all, which is the opposite of the
 * intent.
 *
 * The callback refs and the unmount cleanup keep a re-render from firing a
 * stale closure and an unmount mid-hold from setting state or firing a
 * callback for a screen that is gone.
 */

import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import {
  colors,
  components,
  rounded,
  spacing,
  typography,
} from '../theme/tokens';
import { textStyle } from '../theme/type';

/** The two holds the design names — a closed union. */
export const HOLD_VARIANTS = ['enter', 'seal'] as const;

export type HoldVariant = (typeof HOLD_VARIANTS)[number];

/**
 * Why a hold was cancelled. `released-early` is the soft-warning reason: the
 * primitive reports it so the composing surface can say so and leave its own
 * state intact (EXPERIENCE.md, Interaction Primitives).
 */
export const HOLD_CANCEL_REASONS = ['released-early'] as const;

export type HoldCancelReason = (typeof HOLD_CANCEL_REASONS)[number];

/** The Brief hold's swap word, verbatim from the design source. */
export const HOLD_SWAP_LABEL = 'Crossing over…';

/** The gesture hint the control names to assistive technology. */
export const HOLD_ACCESSIBILITY_HINT = 'Press and hold to confirm';

/** The accessible value while the hold is at rest (its state change is the swap). */
export const HOLD_ACCESSIBILITY_VALUE_READY = 'Ready';

export type HoldButtonProps = {
  readonly variant: HoldVariant;
  /** Authored copy, e.g. `HOLD TO ENTER THE FIELD`. Uppercased by the component. */
  readonly label: string;
  readonly onComplete: () => void;
  readonly onCancel: (reason: HoldCancelReason) => void;
  readonly style?: StyleProp<ViewStyle>;
};

/** The fill's thickness: two of them make `spacing['1']` (the 2px rule the prototype draws). */
const FILL_HEIGHT = spacing['1'] / 2;

const labelStyle = textStyle(typography.label);

/**
 * The fill duration for a variant, read from
 * `components['hold-button'].fillDurations`. Exported so a suite can assert the
 * duration against the token rather than a re-spelled literal.
 */
export function holdDurationMs(variant: HoldVariant): number {
  switch (variant) {
    case 'enter':
      return components['hold-button'].fillDurations.enterMs;
    case 'seal':
      return components['hold-button'].fillDurations.sealMs;
    default: {
      const exhaustive: never = variant;
      return exhaustive;
    }
  }
}

/**
 * When the label swaps to `HOLD_SWAP_LABEL`, or `null` when it never swaps. Only
 * the `enter` hold swaps, at half its fill duration.
 */
export function labelSwapMs(variant: HoldVariant): number | null {
  return variant === 'enter'
    ? components['hold-button'].fillDurations.enterMs / 2
    : null;
}

export function HoldButton({
  variant,
  label,
  onComplete,
  onCancel,
  style,
}: HoldButtonProps): React.JSX.Element {
  // A lazy state initialiser keeps the `Animated.Value` stable across renders
  // without reading a ref during render (the React compiler forbids the latter).
  const [fill] = useState(() => new Animated.Value(0));
  const [swapped, setSwapped] = useState(false);
  const running = useRef<Animated.CompositeAnimation | null>(null);
  const swapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // A pressOut only cancels a press this control actually saw begin.
  const pressed = useRef(false);
  // Guards exactly one completion/cancel callback per press.
  const settled = useRef(false);
  // The current callbacks, so a parent re-render mid-hold cannot fire a stale
  // closure captured at press-in.
  const onCompleteRef = useRef(onComplete);
  const onCancelRef = useRef(onCancel);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onCancelRef.current = onCancel;
  }, [onComplete, onCancel]);

  useEffect(
    () => () => {
      // Unmount mid-hold: clear the label-swap timer and stop the fill so no
      // state is set and no callback fires for a screen that is gone.
      if (swapTimer.current !== null) {
        clearTimeout(swapTimer.current);
        swapTimer.current = null;
      }
      running.current?.stop();
      running.current = null;
    },
    [],
  );

  const renderedLabel = label.toUpperCase();

  const clearSwapTimer = (): void => {
    if (swapTimer.current !== null) {
      clearTimeout(swapTimer.current);
      swapTimer.current = null;
    }
  };

  const handlePressIn = (): void => {
    pressed.current = true;
    settled.current = false;
    clearSwapTimer();
    fill.setValue(0);
    setSwapped(false);

    const swapAt = labelSwapMs(variant);
    if (swapAt !== null) {
      swapTimer.current = setTimeout(() => {
        setSwapped(true);
      }, swapAt);
    }

    const animation = Animated.timing(fill, {
      toValue: 1,
      duration: holdDurationMs(variant),
      useNativeDriver: true,
    });
    running.current = animation;
    animation.start(({ finished }) => {
      // `stop()` reports `finished: false`; an early release is handled below.
      if (!finished || settled.current) {
        return;
      }
      settled.current = true;
      clearSwapTimer();
      setSwapped(false);
      onCompleteRef.current();
    });
  };

  const handlePressOut = (): void => {
    if (!pressed.current) {
      return;
    }
    pressed.current = false;
    clearSwapTimer();
    setSwapped(false);

    const animation = running.current;
    running.current = null;
    animation?.stop();
    fill.setValue(0);

    if (!settled.current) {
      settled.current = true;
      onCancelRef.current('released-early');
    }
  };

  /**
   * The assistive-technology activation path. A VoiceOver/TalkBack activate is
   * not a hold, so it completes the control directly rather than reading as an
   * early release.
   */
  const handleAccessibilityTap = (): void => {
    if (settled.current) {
      return;
    }
    pressed.current = false;
    settled.current = true;
    clearSwapTimer();
    const animation = running.current;
    running.current = null;
    animation?.stop();
    fill.setValue(1);
    setSwapped(false);
    onCompleteRef.current();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={renderedLabel}
      accessibilityHint={HOLD_ACCESSIBILITY_HINT}
      accessibilityValue={{
        text: swapped ? HOLD_SWAP_LABEL : HOLD_ACCESSIBILITY_VALUE_READY,
      }}
      onAccessibilityTap={handleAccessibilityTap}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        {
          height: components['hold-button'].height,
          borderWidth: 1,
          borderColor: colors.bone,
          borderRadius: rounded.DEFAULT,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: FILL_HEIGHT,
          backgroundColor: colors.safelight,
          // `scaleX` grows the fill from the button's leading edge. It is
          // numeric, so no percentage is ever rendered (AD-15).
          transform: [{ scaleX: fill }],
          transformOrigin: 'left',
        }}
      />
      <Text style={[labelStyle, { color: colors.bone }]}>
        {swapped ? HOLD_SWAP_LABEL : renderedLabel}
      </Text>
    </Pressable>
  );
}
