/**
 * `SignatureStrip` — a row of bordered cells, one per signature slot.
 *
 * The strip takes `slots` and renders **exactly that many** cells: the count is
 * the case's, never a constant (DESIGN.md, Components; FR-19). An archive
 * wanting eight passes eight; a report wanting seven or nine passes that.
 *
 * - **unlit** is `colors.rule` on nothing.
 * - **lit** carries three vertical marks in `colors['safelight-soft']` behind a
 *   `colors.olive` border. The marks are deliberately *uneven* — the design
 *   source tokenizes neither their count nor their proportions, so the property
 *   (uneven, `safelight-soft`, inside an `olive` border) is fixed here and
 *   asserted by the suite rather than inventing tokens the design source would
 *   then have to carry.
 * - **unidentified** renders a `?` and pulses once per
 *   `animations.ntPulse.durationMs` — the `?` tile is the product's strongest
 *   return hook, so its period is read from the token, never a literal and
 *   never a prop. Under Reduce Motion the `?` sits static (NFR-11 / UX-DR54).
 *
 * The strip exposes **one** accessible name, composed on the container from the
 * slot count and the unidentified count (`3 signature slots, 1 unidentified`),
 * so an unidentified slot is announced as unidentified rather than as a bare
 * `?` — the child tiles carry no label of their own (AD-28).
 *
 * The cell size is fixed at `components['signature-slot'].size` and a strip is
 * a single row of 7–9 cells, so a full strip cannot fit at 320pt: it neither
 * wraps nor shrinks — a wrapped strip is not a strip — and the surface that
 * composes it owns fitting it.
 */

import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  View,
  type ViewStyle,
} from 'react-native';

import { animations, colors, components, typography } from '../theme/tokens';
import { textStyle } from '../theme/type';

/** The three slot states the design source names. */
export const SIGNATURE_SLOT_KINDS = ['lit', 'unlit', 'unidentified'] as const;

export type SignatureSlotKind = (typeof SIGNATURE_SLOT_KINDS)[number];

export type SignatureStripProps = {
  readonly slots: readonly SignatureSlotKind[];
};

/**
 * The lit cell's three marks. The proportions are geometry the design source
 * does not tokenize, so they live here as ratios of the cell size — the one
 * thing the design *does* fix is that the marks are uneven.
 */
const LIT_MARK_HEIGHT_RATIOS = [0.5, 0.7, 0.4] as const;
const LIT_MARK_WIDTH_RATIO = 1 / 15;
const MARK_GAP_RATIO = 1 / 15;

/** The `?` tile's resting opacity at the bottom of its pulse. */
const PULSE_FLOOR = 0.2;

/**
 * The unidentified tile's pulse, derived from `animations.ntPulse`. Exported so
 * the suite can assert the two halves sum to the token period — the pulse is
 * composed from the token, never a literal.
 */
export function ntPulseHalves(): {
  readonly riseMs: number;
  readonly fallMs: number;
} {
  const period = animations.ntPulse.durationMs;
  return { riseMs: period / 2, fallMs: period / 2 };
}

/** The border colour of a slot, read from the tokens. */
function slotBorderColor(kind: SignatureSlotKind): string {
  switch (kind) {
    case 'lit':
      return colors.olive;
    case 'unlit':
    case 'unidentified':
      return colors.rule;
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}

function slotBox(size: number, borderColor: string): ViewStyle {
  return {
    width: size,
    height: size,
    borderWidth: 1,
    borderColor,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  };
}

const glyphStyle = textStyle(typography.meta);

/** Three uneven vertical marks in `safelight-soft`. */
function LitMarks({ size }: { readonly size: number }): React.JSX.Element {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: size * MARK_GAP_RATIO }}>
      {LIT_MARK_HEIGHT_RATIOS.map((ratio) => (
        <View
          key={ratio}
          style={{
            width: size * LIT_MARK_WIDTH_RATIO,
            height: size * ratio,
            backgroundColor: colors['safelight-soft'],
          }}
        />
      ))}
    </View>
  );
}

/** A `?` on the `ntPulse` cycle. The pulse is intrinsic, not an external effect. */
function UnidentifiedTile({ size }: { readonly size: number }): React.JSX.Element {
  // A lazy state initialiser keeps the `Animated.Value` stable across renders
  // without reading a ref during render (the React compiler forbids the latter).
  const [opacity] = useState(() => new Animated.Value(1));
  const { riseMs, fallMs } = ntPulseHalves();
  useEffect(() => {
    let cancelled = false;
    let stopPulse: (() => void) | null = null;
    // NFR-11 / UX-DR54: a user who asks for reduced motion gets a static `?`,
    // so the loop is never started for them.
    void AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (cancelled || reduceMotion) {
        return;
      }
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: PULSE_FLOOR,
            duration: riseMs,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: fallMs,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      stopPulse = () => {
        pulse.stop();
      };
    });
    return () => {
      cancelled = true;
      stopPulse?.();
    };
  }, [opacity, riseMs, fallMs]);
  return (
    <View style={slotBox(size, slotBorderColor('unidentified'))}>
      <Animated.Text style={[glyphStyle, { color: colors.ash, opacity }]}>
        ?
      </Animated.Text>
    </View>
  );
}

function SignatureCell({
  kind,
  size,
}: {
  readonly kind: SignatureSlotKind;
  readonly size: number;
}): React.JSX.Element {
  switch (kind) {
    case 'lit':
      return (
        <View style={slotBox(size, slotBorderColor('lit'))}>
          <LitMarks size={size} />
        </View>
      );
    case 'unlit':
      return <View style={slotBox(size, slotBorderColor('unlit'))} />;
    case 'unidentified':
      return <UnidentifiedTile size={size} />;
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}

/**
 * The strip's one accessible name: the slot count and, when any slot is
 * unidentified, how many — so an unidentified slot is announced as unidentified
 * rather than as a bare `?` (AD-28). A count, not a measurement.
 */
export function stripLabel(slots: readonly SignatureSlotKind[]): string {
  const count = slots.length;
  const unidentified = slots.filter((kind) => kind === 'unidentified').length;
  const base = `${count} signature slot${count === 1 ? '' : 's'}`;
  return unidentified === 0 ? base : `${base}, ${unidentified} unidentified`;
}

export function SignatureStrip({
  slots,
}: SignatureStripProps): React.JSX.Element {
  const size = components['signature-slot'].size;
  return (
    <View
      style={{ flexDirection: 'row', gap: size * MARK_GAP_RATIO }}
      accessible
      accessibilityRole="text"
      accessibilityLabel={stripLabel(slots)}
    >
      {slots.map((kind, index) => (
        <SignatureCell key={index} kind={kind} size={size} />
      ))}
    </View>
  );
}
