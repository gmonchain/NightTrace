import { act, fireEvent, render } from '@testing-library/react-native';

import { colors, components, rounded, typography } from '../../theme/tokens';
import {
  HOLD_ACCESSIBILITY_HINT,
  HOLD_ACCESSIBILITY_VALUE_READY,
  HOLD_SWAP_LABEL,
  HOLD_VARIANTS,
  HoldButton,
  holdDurationMs,
  labelSwapMs,
} from '../HoldButton';
import type { HostElement } from './tree';
import { flatten, mergedStyle, spyOnTiming, styleProps } from './tree';

const LABEL = 'HOLD TO ENTER THE FIELD';

function fillNode(view: HostElement): HostElement | undefined {
  return flatten(view).find((element) =>
    styleProps(element).some(
      (style) => style.backgroundColor === colors.safelight,
    ),
  );
}

describe('HoldButton', () => {
  it('HOLD_COMPLETE: the enter fill runs the token duration and completes once', async () => {
    const spy = spyOnTiming();
    const onComplete = vi.fn();
    const onCancel = vi.fn();
    try {
      const { getByLabelText } = await render(
        <HoldButton
          variant="enter"
          label={LABEL}
          onComplete={onComplete}
          onCancel={onCancel}
        />,
      );
      await fireEvent(getByLabelText(LABEL), 'pressIn');

      const [config] = spy.configs();
      expect(config?.duration).toBe(
        components['hold-button'].fillDurations.enterMs,
      );
      expect(onComplete).not.toHaveBeenCalled();

      const finished = spy.lastCallback();
      expect(finished).not.toBeNull();
      await act(async () => {
        finished?.({ finished: true });
      });
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(onCancel).not.toHaveBeenCalled();
    } finally {
      spy.timing.mockRestore();
    }
  });

  it('HOLD_SEAL: the seal variant runs over the seal duration and never swaps its label', async () => {
    const spy = spyOnTiming();
    const onComplete = vi.fn();
    const onCancel = vi.fn();
    try {
      const { getByLabelText, queryByText } = await render(
        <HoldButton
          variant="seal"
          label="SEAL & FILE"
          onComplete={onComplete}
          onCancel={onCancel}
        />,
      );
      await fireEvent(getByLabelText('SEAL & FILE'), 'pressIn');
      const [config] = spy.configs();
      expect(config?.duration).toBe(
        components['hold-button'].fillDurations.sealMs,
      );
      expect(labelSwapMs('seal')).toBeNull();
      expect(queryByText(HOLD_SWAP_LABEL)).toBeNull();
      expect(queryByText('SEAL & FILE')).toBeTruthy();
    } finally {
      spy.timing.mockRestore();
    }
  });

  it('HOLD_EARLY_RELEASE: releasing before the duration cancels once with the soft-warning reason', async () => {
    const spy = spyOnTiming();
    const onComplete = vi.fn();
    const onCancel = vi.fn();
    try {
      const { getByLabelText } = await render(
        <HoldButton
          variant="enter"
          label={LABEL}
          onComplete={onComplete}
          onCancel={onCancel}
        />,
      );
      const button = getByLabelText(LABEL);
      await fireEvent(button, 'pressIn');
      // The animation is stopped mid-flight; its callback reports `finished: false`.
      await fireEvent(button, 'pressOut');
      expect(spy.stopCount()).toBe(1);
      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onCancel).toHaveBeenCalledWith('released-early');
      expect(onComplete).not.toHaveBeenCalled();
    } finally {
      spy.timing.mockRestore();
    }
  });

  it('firing the stopped animation does not complete after an early release', async () => {
    const spy = spyOnTiming();
    const onComplete = vi.fn();
    const onCancel = vi.fn();
    try {
      const { getByLabelText } = await render(
        <HoldButton
          variant="enter"
          label={LABEL}
          onComplete={onComplete}
          onCancel={onCancel}
        />,
      );
      const button = getByLabelText(LABEL);
      await fireEvent(button, 'pressIn');
      const callback = spy.lastCallback();
      await fireEvent(button, 'pressOut');
      await act(async () => {
        callback?.({ finished: false });
      });
      expect(onComplete).not.toHaveBeenCalled();
      expect(onCancel).toHaveBeenCalledTimes(1);
    } finally {
      spy.timing.mockRestore();
    }
  });

  it('HOLD_LABEL_SWAP: the label swaps at half the enter duration and only for the enter hold', async () => {
    const spy = spyOnTiming();
    try {
      const onComplete = vi.fn();
      const onCancel = vi.fn();
      const { getByLabelText, queryByText } = await render(
        <HoldButton
          variant="enter"
          label={LABEL}
          onComplete={onComplete}
          onCancel={onCancel}
        />,
      );
      const button = getByLabelText(LABEL);
      expect(labelSwapMs('enter')).toBe(
        components['hold-button'].fillDurations.enterMs / 2,
      );

      vi.useFakeTimers();
      try {
        await fireEvent(button, 'pressIn');
        expect(queryByText(LABEL)).toBeTruthy();
        expect(queryByText(HOLD_SWAP_LABEL)).toBeNull();
        await act(async () => {
          vi.advanceTimersByTime(
            components['hold-button'].fillDurations.enterMs / 2,
          );
        });
        expect(queryByText(HOLD_SWAP_LABEL)).toBeTruthy();
        await fireEvent(button, 'pressOut');
        expect(queryByText(LABEL)).toBeTruthy();
        expect(queryByText(HOLD_SWAP_LABEL)).toBeNull();
      } finally {
        vi.useRealTimers();
      }
    } finally {
      spy.timing.mockRestore();
    }
  });

  it('fires the callbacks from the latest render, not the ones captured at press-in', async () => {
    const spy = spyOnTiming();
    const firstComplete = vi.fn();
    const secondComplete = vi.fn();
    const onCancel = vi.fn();
    try {
      const { getByLabelText, rerender } = await render(
        <HoldButton
          variant="enter"
          label={LABEL}
          onComplete={firstComplete}
          onCancel={onCancel}
        />,
      );
      await fireEvent(getByLabelText(LABEL), 'pressIn');
      // The parent re-renders mid-hold with a new callback.
      await rerender(
        <HoldButton
          variant="enter"
          label={LABEL}
          onComplete={secondComplete}
          onCancel={onCancel}
        />,
      );
      const finished = spy.lastCallback();
      expect(finished).not.toBeNull();
      await act(async () => {
        finished?.({ finished: true });
      });
      expect(firstComplete).not.toHaveBeenCalled();
      expect(secondComplete).toHaveBeenCalledTimes(1);
    } finally {
      spy.timing.mockRestore();
    }
  });

  it('clears the swap timer and stops the fill when unmounted mid-hold', async () => {
    const spy = spyOnTiming();
    const onComplete = vi.fn();
    const onCancel = vi.fn();
    vi.useFakeTimers();
    try {
      const { getByLabelText, unmount } = await render(
        <HoldButton
          variant="enter"
          label={LABEL}
          onComplete={onComplete}
          onCancel={onCancel}
        />,
      );
      await fireEvent(getByLabelText(LABEL), 'pressIn');
      await unmount();
      // The fill is stopped, and advancing past the swap point fires nothing.
      expect(spy.stopCount()).toBe(1);
      await act(async () => {
        vi.advanceTimersByTime(
          components['hold-button'].fillDurations.enterMs,
        );
      });
      expect(onComplete).not.toHaveBeenCalled();
      expect(onCancel).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
      spy.timing.mockRestore();
    }
  });

  it('completes from an assistive-technology activation rather than cancelling', async () => {
    const spy = spyOnTiming();
    const onComplete = vi.fn();
    const onCancel = vi.fn();
    try {
      const { getByLabelText } = await render(
        <HoldButton
          variant="enter"
          label={LABEL}
          onComplete={onComplete}
          onCancel={onCancel}
        />,
      );
      // A VoiceOver/TalkBack activate is not a hold: it completes, never reads
      // as an early release.
      await fireEvent(getByLabelText(LABEL), 'accessibilityTap');
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(onCancel).not.toHaveBeenCalled();
    } finally {
      spy.timing.mockRestore();
    }
  });

  it('uppercases the authored label by the component', async () => {
    const spy = spyOnTiming();
    try {
      const { getByText } = await render(
        <HoldButton
          variant="enter"
          label="hold to enter the field"
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />,
      );
      expect(getByText('HOLD TO ENTER THE FIELD')).toBeTruthy();
    } finally {
      spy.timing.mockRestore();
    }
  });

  it('names the gesture and reports the hold state to assistive technology', async () => {
    const spy = spyOnTiming();
    vi.useFakeTimers();
    try {
      const { getByLabelText } = await render(
        <HoldButton
          variant="enter"
          label={LABEL}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />,
      );
      const button = getByLabelText(LABEL);
      expect(button.props.accessibilityHint).toBe(HOLD_ACCESSIBILITY_HINT);
      expect(button.props.accessibilityValue).toEqual({
        text: HOLD_ACCESSIBILITY_VALUE_READY,
      });

      await fireEvent(button, 'pressIn');
      await act(async () => {
        vi.advanceTimersByTime(
          components['hold-button'].fillDurations.enterMs / 2,
        );
      });
      expect(getByLabelText(LABEL).props.accessibilityValue).toEqual({
        text: HOLD_SWAP_LABEL,
      });
    } finally {
      vi.useRealTimers();
      spy.timing.mockRestore();
    }
  });

  it('reads its duration for each variant from components[\'hold-button\'].fillDurations', () => {
    expect(holdDurationMs('enter')).toBe(
      components['hold-button'].fillDurations.enterMs,
    );
    expect(holdDurationMs('seal')).toBe(
      components['hold-button'].fillDurations.sealMs,
    );
    for (const variant of HOLD_VARIANTS) {
      expect(holdDurationMs(variant)).toBeGreaterThan(0);
    }
  });

  it('draws the token surface: token height, bone border at rounded.DEFAULT, a label step', async () => {
    const spy = spyOnTiming();
    try {
      const { toJSON } = await render(
        <HoldButton
          variant="enter"
          label={LABEL}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />,
      );
      const root = toJSON();
      expect(root).not.toBeNull();
      if (root === null) {
        throw new Error('no tree');
      }
      const style = mergedStyle(root);
      expect(style.height).toBe(components['hold-button'].height);
      expect(style.borderColor).toBe(colors.bone);
      expect(style.borderRadius).toBe(rounded.DEFAULT);
      const label = flatten(root).find(
        (element) => element.type === 'Text',
      );
      expect(label === undefined ? {} : mergedStyle(label)).toMatchObject({
        fontFamily: typography.label.fontFamily,
        fontSize: typography.label.fontSize,
        color: colors.bone,
      });
    } finally {
      spy.timing.mockRestore();
    }
  });

  it('renders the fill in the token safelight and no percentage', async () => {
    const spy = spyOnTiming();
    try {
      const { toJSON } = await render(
        <HoldButton
          variant="enter"
          label={LABEL}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />,
      );
      const root = toJSON();
      if (root === null) {
        throw new Error('no tree');
      }
      expect(fillNode(root)).toBeDefined();
      // The fill is the only progress affordance: no number, no fraction glyph.
      const rendered = JSON.stringify(root);
      expect(rendered).not.toContain('%');
      expect(rendered).not.toContain('⁄');
      expect(rendered).not.toContain('½');
    } finally {
      spy.timing.mockRestore();
    }
  });

  it('is an accessible button carrying its own label, not the transient swap word', async () => {
    const spy = spyOnTiming();
    try {
      const { getByLabelText, toJSON } = await render(
        <HoldButton
          variant="enter"
          label={LABEL}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />,
      );
      const button = getByLabelText(LABEL);
      expect(button.props.accessibilityRole).toBe('button');
      expect(toJSON()?.props.accessibilityLabel).toBe(LABEL);
    } finally {
      spy.timing.mockRestore();
    }
  });
});
