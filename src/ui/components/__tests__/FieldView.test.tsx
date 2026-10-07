import { act, render, waitFor } from '@testing-library/react-native';
import { Animated } from 'react-native';

import { animations, colors, rounded, typography } from '../../theme/tokens';
import {
  BREATH_DIM,
  BREATH_SCALE,
  FIELD_SIZE,
  FIELD_STATES,
  FieldView,
  ntBreatheHalves,
  STATE_TRACKING_EM,
} from '../FieldView';
import type { HostElement } from './tree';
import { find, flatten, mergedStyle, setReduceMotion, spyOnTiming, styleProps, textContent } from './tree';

function rootOf(node: HostElement | null): HostElement {
  if (node === null) {
    throw new Error('FieldView rendered nothing');
  }
  return node;
}

function ringStack(root: HostElement): HostElement | undefined {
  return find(root, (element) =>
    styleProps(element).some(
      (style) =>
        style.width === FIELD_SIZE && style.height === FIELD_SIZE,
    ),
  );
}

const RING_COLOURS = [
  colors['rule-strong'],
  colors.rule,
  colors['rule-soft'],
] as const;

function ringNodes(root: HostElement): readonly HostElement[] {
  return flatten(root).filter((element) => {
    const style = mergedStyle(element);
    return (
      style.borderWidth === 1 &&
      style.borderRadius === rounded.full &&
      RING_COLOURS.some((colour) => colour === style.borderColor)
    );
  });
}

describe('FieldView', () => {
  it('announces the state word in typography.label at 0.42em tracking', async () => {
    const { toJSON, getByText } = await render(<FieldView state="QUIET" />);
    expect(getByText('QUIET')).toBeTruthy();
    const root = rootOf(toJSON());
    const word = find(
      root,
      (element) => element.type === 'Text' && textContent(element) === 'QUIET',
    );
    expect(word).toBeDefined();
    if (word === undefined) {
      throw new Error('no state word');
    }
    const style = mergedStyle(word);
    expect(style.fontFamily).toBe(typography.label.fontFamily);
    expect(style.fontSize).toBe(typography.label.fontSize);
    // The tracking is the design's 0.42em, converted to absolute points.
    expect(style.letterSpacing).toBeCloseTo(
      typography.label.fontSize * STATE_TRACKING_EM,
      6,
    );
    // The centring offset is the same converted tracking, not a second `em`.
    expect(style.paddingLeft).toBe(style.letterSpacing);
    expect(style.color).toBe(colors.bone);
  });

  it('renders the four state words', async () => {
    for (const state of FIELD_STATES) {
      const { getByText } = await render(<FieldView state={state} />);
      expect(getByText(state)).toBeTruthy();
    }
  });

  it('draws three concentric hairline rings around a safelight centre dot', async () => {
    const { toJSON } = await render(<FieldView state="LISTENING" />);
    const root = rootOf(toJSON());
    expect(ringNodes(root)).toHaveLength(3);
    const dot = flatten(root).find((element) => {
      const style = mergedStyle(element);
      return (
        style.backgroundColor === colors.safelight &&
        style.borderRadius === rounded.full
      );
    });
    expect(dot).toBeDefined();
  });

  it('breathes only the outer ring, by the pinned amplitude', async () => {
    const restore = setReduceMotion(true);
    try {
      const { toJSON } = await render(<FieldView state="ACTIVE" />);
      const rings = ringNodes(rootOf(toJSON()));
      // Exactly one ring carries the animated values — a second breathing ring
      // fails here.
      const animated = rings.filter((element) => {
        const style = mergedStyle(element);
        return 'opacity' in style && 'transform' in style;
      });
      expect(animated).toHaveLength(1);
      // And it is the outermost ring.
      const breathing = animated[0];
      expect(breathing === undefined ? undefined : mergedStyle(breathing).borderColor).toBe(
        colors['rule-strong'],
      );
      // The amplitude is pinned: neither end may drift.
      expect(BREATH_DIM).toBe(0.55);
      expect(BREATH_SCALE).toBe(0.96);
    } finally {
      restore();
    }
  });

  it('hides the decorative rings and dot from assistive technology', async () => {
    const { toJSON } = await render(<FieldView state="ACTIVE" />);
    const stack = ringStack(rootOf(toJSON()));
    expect(stack).toBeDefined();
    expect(stack?.props.accessibilityElementsHidden).toBe(true);
    expect(stack?.props.importantForAccessibility).toBe('no-hide-descendants');
    expect(stack?.props.accessible).toBe(false);
  });

  it('composes the breath from animations.ntBreathe', () => {
    const halves = ntBreatheHalves();
    expect(halves.downMs + halves.upMs).toBe(
      animations.ntBreathe.durationMs,
    );
  });

  it('starts the loop with the token halves', async () => {
    const restore = setReduceMotion(false);
    const start = jest.fn();
    const loop = jest.spyOn(Animated, 'loop').mockReturnValue({
      start,
      stop: () => {},
      reset: () => {},
    });
    const spy = spyOnTiming();
    try {
      await render(<FieldView state="ACTIVE" />);
      await waitFor(() => expect(spy.timing).toHaveBeenCalledTimes(2));
      const durations = spy.configs().map((config) => config.duration);
      const { downMs, upMs } = ntBreatheHalves();
      expect(durations).toEqual([downMs, upMs]);
      expect((durations[0] ?? 0) + (durations[1] ?? 0)).toBe(
        animations.ntBreathe.durationMs,
      );
      expect(loop).toHaveBeenCalledTimes(1);
      expect(start).toHaveBeenCalledTimes(1);
    } finally {
      spy.timing.mockRestore();
      loop.mockRestore();
      restore();
    }
  });

  it('FIELD_REDUCED_MOTION: the rings sit static and no loop runs', async () => {
    const restore = setReduceMotion(true);
    const loop = jest.spyOn(Animated, 'loop');
    const spy = spyOnTiming();
    try {
      const { toJSON } = await render(<FieldView state="QUIET" />);
      await act(async () => {
        await Promise.resolve();
      });
      expect(spy.timing).not.toHaveBeenCalled();
      expect(loop).not.toHaveBeenCalled();
      // The rings still render, at rest.
      expect(ringStack(rootOf(toJSON()))).toBeDefined();
    } finally {
      spy.timing.mockRestore();
      loop.mockRestore();
      restore();
    }
  });
});
