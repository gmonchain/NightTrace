/**
 * `EvidenceCard` — the card that logs evidence without ever measuring it.
 *
 * `colors.ledger` (the `evidence-card` surface) on a `colors.rule` border at
 * `rounded.DEFAULT`. The anatomy is a type label, a **three-row word-only meta
 * block** (`Certainty` · `Channel` · `Possible match`) and two actions, `Keep`
 * and `Mark as explained` (EXPERIENCE.md, The evidence card).
 *
 * **Certainty is always a band, never a number.** It is the closed union
 * `AMBIGUOUS` · `SUGGESTIVE` · `COMPELLING`, so no prop can carry a value. The
 * other two meta rows are authored copy (the design source itself passes
 * `'Audio · captured live'`, `'No match on file'`), covered by the epic-wide
 * rendered-output scan rather than a closed type.
 *
 * **This is also the in-session capture card.** With `capture`, it is never
 * full-screen: it enters on `animations.ntUp`, and a progress hairline along its
 * top edge auto-dismisses it after its window. **Letting it auto-dismiss reports
 * the item as `unreviewed` rather than discarding it** — a missed tap must never
 * cost the user a souvenir. The hairline is a position, never a fraction: it
 * advances, and no count, percentage or "3 of 7" is rendered.
 *
 * Each action fires exactly one callback — `onResolve('kept')` or
 * `onResolve('explained')` — and the card dismisses.
 *
 * Under Reduce Motion the slide is dropped and the hairline does not advance;
 * the card still auto-dismisses on its window and still reports `unreviewed`
 * (NFR-11).
 *
 * **A reused instance is a fresh card.** The inner card is keyed by the item's
 * identity, so when the identifying props change it remounts: the settled guard
 * resets, any prior resolution clears, and the next item runs its own window. A
 * rejected Reduce Motion read seeds the resting state, so the capture card is
 * visible rather than stranded transparent, and both the entrance and the
 * hairline are stopped on resolve and on unmount.
 */

import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import {
  animations,
  colors,
  components,
  rounded,
  spacing,
  typography,
} from '../theme/tokens';
import { textStyle } from '../theme/type';

/** The three certainty bands — a closed union. Certainty is never a number. */
export const EVIDENCE_CERTAINTIES = [
  'AMBIGUOUS',
  'SUGGESTIVE',
  'COMPELLING',
] as const;

export type EvidenceCertainty = (typeof EVIDENCE_CERTAINTIES)[number];

/**
 * What a card resolution reports. `unreviewed` is the auto-dismiss outcome: the
 * item is logged, not discarded.
 */
export const EVIDENCE_OUTCOMES = ['kept', 'explained', 'unreviewed'] as const;

export type EvidenceOutcome = (typeof EVIDENCE_OUTCOMES)[number];

/**
 * The capture card's dwell window. EXPERIENCE.md fixes it at six seconds; the
 * design source does not tokenize it, so it is fixed here rather than invented
 * as a token the design source would then have to carry.
 */
export const EVIDENCE_AUTO_DISMISS_MS = 6000;

/** The meta label column — geometry the design source does not tokenize. */
const META_LABEL_WIDTH = spacing['9'] * 2;

/** The action height, at the 44pt floor AD-28 makes binding. */
const ACTION_HEIGHT = spacing['8'] + spacing['1'];

/** The capture card's entrance offset. */
const CARD_RISE = spacing['5'] + spacing['3'];

export type EvidenceCardProps = {
  /** Authored copy, e.g. `FRAME`. Rendered verbatim. */
  readonly typeLabel: string;
  readonly certainty: EvidenceCertainty;
  /** Authored copy — the channel word the design source passes through. */
  readonly channel: string;
  readonly possibleMatch: string;
  readonly onResolve: (outcome: EvidenceOutcome) => void;
  /** Render as the in-session capture card: ntUp entrance, hairline, auto-dismiss. */
  readonly capture?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const typeStyle = textStyle(typography.label);
const metaLabelStyle = textStyle(typography.meta);
const metaValueStyle = textStyle(typography.label);
const keepStyle = textStyle(typography.label);
const explainStyle = textStyle(typography.meta);

/**
 * The card's identity, from its identifying props. A reused `EvidenceCard`
 * handed a new item remounts its inner card on this key, so the new item's
 * settled guard, timer and animations start from scratch rather than inheriting
 * the previous item's resolution.
 */
function cardIdentity(props: EvidenceCardProps): string {
  return `${props.typeLabel}\u0000${props.certainty}\u0000${props.channel}\u0000${props.possibleMatch}`;
}

export function EvidenceCard(props: EvidenceCardProps): React.JSX.Element {
  return <EvidenceCardItem key={cardIdentity(props)} {...props} />;
}

function EvidenceCardItem({
  typeLabel,
  certainty,
  channel,
  possibleMatch,
  onResolve,
  capture = false,
  style,
}: EvidenceCardProps): React.JSX.Element | null {
  const [progress] = useState(() => new Animated.Value(0));
  const [rise] = useState(() => new Animated.Value(1));
  const [resolved, setResolved] = useState(false);
  // Guards exactly one resolution per card (action or auto-dismiss).
  const settled = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The entrance and the hairline, kept so they can be stopped on resolve and
  // on unmount rather than left running against a screen that is gone.
  const entrance = useRef<Animated.CompositeAnimation | null>(null);
  const hairline = useRef<Animated.CompositeAnimation | null>(null);
  // Kept in a ref so an inline `onResolve` cannot restart the dwell effect.
  const onResolveRef = useRef(onResolve);

  useEffect(() => {
    onResolveRef.current = onResolve;
  }, [onResolve]);

  useEffect(() => {
    if (!capture) {
      return undefined;
    }
    let cancelled = false;
    // NFR-11: under Reduce Motion the entrance is dropped and the hairline does
    // not advance — but the window still expires and still reports unreviewed.
    const play = (reduceMotion: boolean): void => {
      if (cancelled) {
        return;
      }
      progress.setValue(0);
      if (reduceMotion) {
        rise.setValue(0);
        return;
      }
      entrance.current = Animated.timing(rise, {
        toValue: 0,
        duration: animations.ntUp.durationMs,
        useNativeDriver: true,
      });
      entrance.current.start();
      hairline.current = Animated.timing(progress, {
        toValue: 1,
        duration: EVIDENCE_AUTO_DISMISS_MS,
        useNativeDriver: true,
      });
      hairline.current.start();
    };
    void AccessibilityInfo.isReduceMotionEnabled()
      .then(play)
      // A rejected read must not leave the card invisible for its whole window:
      // seed the resting state so the capture card is visible.
      .catch(() => {
        if (!cancelled) {
          rise.setValue(0);
        }
      });
    timer.current = setTimeout(() => {
      if (settled.current) {
        return;
      }
      settled.current = true;
      entrance.current?.stop();
      entrance.current = null;
      hairline.current?.stop();
      hairline.current = null;
      setResolved(true);
      onResolveRef.current('unreviewed');
    }, EVIDENCE_AUTO_DISMISS_MS);
    return () => {
      cancelled = true;
      entrance.current?.stop();
      entrance.current = null;
      hairline.current?.stop();
      hairline.current = null;
      if (timer.current !== null) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [capture, progress, rise]);

  const resolve = (outcome: EvidenceOutcome): void => {
    if (settled.current) {
      return;
    }
    settled.current = true;
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    entrance.current?.stop();
    entrance.current = null;
    hairline.current?.stop();
    hairline.current = null;
    setResolved(true);
    onResolveRef.current(outcome);
  };

  if (resolved) {
    return null;
  }

  const metaRows = [
    { label: 'Certainty', value: certainty },
    { label: 'Channel', value: channel },
    { label: 'Possible match', value: possibleMatch },
  ] as const;

  const body = (
    <>
      {capture ? (
        <View style={styles.hairlineTrack}>
          <Animated.View
            style={[styles.hairlineBar, { transform: [{ scaleX: progress }] }]}
          />
        </View>
      ) : null}
      <View style={styles.body}>
        <Text style={[typeStyle, { color: colors.bone }]}>{typeLabel}</Text>
        <View style={styles.meta}>
          {metaRows.map((row) => (
            <View key={row.label} style={styles.metaRow}>
              <Text style={[metaLabelStyle, styles.metaLabel, { color: colors.ash }]}>
                {row.label}
              </Text>
              <Text style={[metaValueStyle, { color: colors.bone }]}>
                {row.value}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              resolve('kept');
            }}
            style={[styles.action, styles.keep]}
          >
            <Text style={[keepStyle, { color: colors.bone }]}>Keep</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              resolve('explained');
            }}
            style={[styles.action, styles.explain]}
          >
            <Text style={[explainStyle, { color: colors.prose }]}>
              Mark as explained
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  );

  if (!capture) {
    return <View style={[styles.card, style]}>{body}</View>;
  }

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: rise.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
          transform: [
            {
              translateY: rise.interpolate({
                inputRange: [0, 1],
                outputRange: [0, CARD_RISE],
              }),
            },
          ],
        },
        style,
      ]}
    >
      {body}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.ledger,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: rounded.DEFAULT,
    overflow: 'hidden',
  },
  hairlineTrack: {
    height: components.rule.height,
    backgroundColor: colors.rule,
  },
  hairlineBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.safelight,
    transformOrigin: 'left',
  },
  body: {
    paddingHorizontal: spacing['5'],
    paddingVertical: spacing['4'],
    gap: spacing['4'],
  },
  meta: {
    gap: spacing['2'],
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing['3'],
  },
  metaLabel: {
    width: META_LABEL_WIDTH,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing['3'],
  },
  action: {
    height: ACTION_HEIGHT,
    borderWidth: 1,
    borderRadius: rounded.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['3'],
  },
  keep: {
    flex: 1,
    borderColor: colors.bone,
  },
  explain: {
    flex: 1.4,
    borderColor: colors['rule-strong'],
  },
});
