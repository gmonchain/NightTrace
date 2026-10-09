import { act, render, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo, Animated } from 'react-native';

import { animations, colors, components } from '../../theme/tokens';
import {
  SignatureStrip,
  ntPulseHalves,
  type SignatureSlotKind,
} from '../SignatureStrip';
import { find, flatten, styleProps, textContent, withProperty, type HostElement } from './tree';

/** The cell size is the token's, not a literal the suite re-spells. */
const SLOT_SIZE = components['signature-slot'].size;

/** The strip's children are its cells, one per slot. */
async function cellsFor(
  slots: readonly SignatureSlotKind[],
): Promise<readonly HostElement[]> {
  const { toJSON } = await render(<SignatureStrip slots={slots} />);
  const root = toJSON();
  if (root === null) {
    return [];
  }
  return flatten(root).filter(
    (element) =>
      element.type === 'View' &&
      styleProps(element).some(
        (style) => style.width === SLOT_SIZE && style.height === SLOT_SIZE,
      ),
  );
}

describe('SignatureStrip', () => {
  it('STRIP_FROM_CASE: renders exactly one cell per slot, never a constant', async () => {
    expect(await cellsFor(['lit', 'unlit', 'unlit', 'lit', 'unlit', 'lit', 'unlit'])).toHaveLength(7);
    expect(
      await cellsFor([
        'lit', 'lit', 'unlit', 'unlit', 'unidentified', 'lit', 'unlit', 'lit', 'unlit',
      ]),
    ).toHaveLength(9);
  });

  it('STRIP_EMPTY: an empty array renders zero cells and does not throw', async () => {
    const { toJSON, getByLabelText } = await render(
      <SignatureStrip slots={[]} />,
    );
    const root = toJSON();
    // Only the container renders; it has no cells.
    expect(root?.children ?? []).toHaveLength(0);
    expect(getByLabelText('0 signature slots')).toBeTruthy();
  });

  it('STRIP_UNLIT: an unlit slot is colors.rule on nothing', async () => {
    const { toJSON } = await render(<SignatureStrip slots={['unlit']} />);
    const root = toJSON();
    const cell =
      root === null
        ? undefined
        : find(root, (element) =>
            styleProps(element).some(
              (style) => style.width === SLOT_SIZE && style.height === SLOT_SIZE,
            ),
          );
    expect(cell).toBeDefined();
    if (cell === undefined) {
      throw new Error('no cell');
    }
    expect(styleProps(cell)).toContainEqual(
      expect.objectContaining({ borderColor: colors.rule }),
    );
    expect(cell.children).toHaveLength(0);
  });

  it('STRIP_LIT: a lit slot carries three uneven safelight-soft marks behind an olive border', async () => {
    const { toJSON } = await render(<SignatureStrip slots={['lit']} />);
    const root = toJSON();
    if (root === null) {
      throw new Error('no tree');
    }
    const cell = find(root, (element) =>
      styleProps(element).some((style) => style.borderColor === colors.olive),
    );
    expect(cell).toBeDefined();
    if (cell === undefined) {
      throw new Error('no lit cell');
    }
    const marks = flatten(cell).filter((element) =>
      styleProps(element).some(
        (style) => style.backgroundColor === colors['safelight-soft'],
      ),
    );
    expect(marks).toHaveLength(3);
    const heights = marks.map((mark) => {
      const style = styleProps(mark)[0];
      return typeof style?.height === 'number' ? style.height : Number.NaN;
    });
    expect(heights.every((height) => Number.isFinite(height))).toBe(true);
    // The design fixes the property, not the proportions: the marks are uneven.
    expect(new Set(heights).size).toBe(3);
  });

  it('STRIP_UNIDENTIFIED: renders a ? on the ntPulse cycle read from the token', async () => {
    const { toJSON } = await render(
      <SignatureStrip slots={['unidentified']} />,
    );
    const root = toJSON();
    if (root === null) {
      throw new Error('no tree');
    }
    const glyph = find(root, (element) => element.type === 'Text');
    expect(glyph === undefined ? '' : textContent(glyph)).toBe('?');

    const halved = ntPulseHalves();
    expect(halved.riseMs + halved.fallMs).toBe(animations.ntPulse.durationMs);
  });

  it('composes the tile’s pulse from the token’s halves, and starts it', async () => {
    // The composed animation is what actually runs on the tile; asserting
    // `ntPulseHalves()` alone would stay green if the durations became literals
    // or `pulse.start()` were dropped. Spying on `Animated.timing` observes the
    // animation the tile builds, and the loop mock observes the `start()`.
    //
    // `isReduceMotionEnabled` is replaced by assignment and restored by
    // reference: it is already a `vi.fn` (the RN test mock), so
    // `mockRestore()` would reset it to a no-op rather than to its default.
    const originalReduceMotion = AccessibilityInfo.isReduceMotionEnabled;
    Reflect.set(AccessibilityInfo, 'isReduceMotionEnabled', () =>
      Promise.resolve(false),
    );
    const start = vi.fn();
    const loop = vi.spyOn(Animated, 'loop').mockReturnValue({
      start,
      stop: () => {},
      reset: () => {},
    });
    const timing = vi.spyOn(Animated, 'timing');
    try {
      await render(<SignatureStrip slots={['unidentified']} />);
      await waitFor(() => expect(timing).toHaveBeenCalledTimes(2));

      const durations = timing.mock.calls.map(([, config]) => config.duration);
      const { riseMs, fallMs } = ntPulseHalves();
      expect(durations).toEqual([riseMs, fallMs]);
      // The two halves are composed from `animations.ntPulse`, not re-spelled.
      expect((durations[0] ?? 0) + (durations[1] ?? 0)).toBe(
        animations.ntPulse.durationMs,
      );
      expect(loop).toHaveBeenCalledTimes(1);
      expect(start).toHaveBeenCalledTimes(1);
    } finally {
      timing.mockRestore();
      loop.mockRestore();
      Reflect.set(
        AccessibilityInfo,
        'isReduceMotionEnabled',
        originalReduceMotion,
      );
    }
  });

  it('does not start the pulse when Reduce Motion is on', async () => {
    // Hold the reduce-motion query pending so the effect’s continuation is
    // observed deterministically once it resolves. Restored by reference (see
    // above) so the RN mock survives.
    let resolveReduceMotion: (value: boolean) => void = () => {};
    const originalReduceMotion = AccessibilityInfo.isReduceMotionEnabled;
    Reflect.set(
      AccessibilityInfo,
      'isReduceMotionEnabled',
      () =>
        new Promise<boolean>((resolve) => {
          resolveReduceMotion = resolve;
        }),
    );
    const loop = vi.spyOn(Animated, 'loop');
    const timing = vi.spyOn(Animated, 'timing');
    try {
      await render(<SignatureStrip slots={['unidentified']} />);
      await act(async () => {
        resolveReduceMotion(true);
        await Promise.resolve();
      });
      expect(timing).not.toHaveBeenCalled();
      expect(loop).not.toHaveBeenCalled();
    } finally {
      timing.mockRestore();
      loop.mockRestore();
      Reflect.set(
        AccessibilityInfo,
        'isReduceMotionEnabled',
        originalReduceMotion,
      );
    }
  });

  it('the pulse period is read from animations.ntPulse, not re-spelled', () => {
    // Mutating the token singleton *is* how the suite proves the value is read;
    // `as const` does not freeze at runtime. Restored unconditionally.
    withProperty(animations.ntPulse, 'durationMs', 4000, () => {
      const halved = ntPulseHalves();
      expect(halved.riseMs + halved.fallMs).toBe(4000);
    });
    const restored = ntPulseHalves();
    expect(restored.riseMs + restored.fallMs).toBe(
      animations.ntPulse.durationMs,
    );
  });

  it('announces its slot count and unidentified count as one label', async () => {
    const { toJSON } = await render(
      <SignatureStrip slots={['lit', 'unlit', 'unidentified']} />,
    );
    const root = toJSON();
    expect(root?.props.accessibilityLabel).toBe(
      '3 signature slots, 1 unidentified',
    );
  });

  it('announces the singular label for a single slot', async () => {
    const { toJSON } = await render(<SignatureStrip slots={['unlit']} />);
    const root = toJSON();
    expect(root?.props.accessibilityLabel).toBe('1 signature slot');
  });
});
