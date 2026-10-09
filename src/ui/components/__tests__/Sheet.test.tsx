import { act, render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import {
  animations,
  colors,
  components,
  rounded,
  spacing,
} from '../../theme/tokens';
import { SHEET_SCRIM_OPACITY, Sheet } from '../Sheet';
import type { HostElement } from './tree';
import {
  find,
  flatten,
  mergedStyle,
  setReduceMotion,
  spyOnTiming,
  styleProps,
} from './tree';

const FORBIDDEN_STYLE_KEYS = [
  'shadowColor',
  'shadowOffset',
  'shadowOpacity',
  'shadowRadius',
  'shadowPath',
  'elevation',
  'backdropFilter',
  'blurRadius',
] as const;

function panelOf(root: HostElement): HostElement | undefined {
  return find(root, (element) =>
    styleProps(element).some(
      (style) => style.backgroundColor === colors.ledger,
    ),
  );
}

function scrimOf(root: HostElement): HostElement | undefined {
  return find(root, (element) =>
    styleProps(element).some(
      (style) => style.backgroundColor === colors['night-deep'],
    ),
  );
}

describe('Sheet', () => {
  it('SHEET_ENTER: ledger surface, sheet radius on top corners, grabber, entering on ntUp over an ntFade scrim', async () => {
    const restore = setReduceMotion(false);
    const spy = spyOnTiming();
    try {
      const { toJSON } = await render(
        <Sheet>
          <Text>SHEET BODY</Text>
        </Sheet>,
      );
      const root = toJSON();
      expect(root).not.toBeNull();
      if (root === null) {
        throw new Error('Sheet rendered nothing');
      }

      // The sheet is modal to assistive technology: the covered screen is not
      // reachable behind it.
      expect(root.props.accessibilityViewIsModal).toBe(true);

      const panel = panelOf(root);
      expect(panel).toBeDefined();
      if (panel === undefined) {
        throw new Error('no panel');
      }
      const panelStyle = mergedStyle(panel);
      expect(panelStyle.backgroundColor).toBe(colors.ledger);
      expect(panelStyle.borderTopLeftRadius).toBe(rounded.sheet);
      expect(panelStyle.borderTopRightRadius).toBe(rounded.sheet);
      expect(panelStyle.borderTopWidth).toBe(components.rule.height);
      expect(panelStyle.borderTopColor).toBe(colors['rule-strong']);

      // The grabber bar is `rule-strong`.
      const grabber = flatten(root).find((element) =>
        styleProps(element).some(
          (style) => style.backgroundColor === colors['rule-strong'],
        ),
      );
      expect(grabber).toBeDefined();

      // The scrim is the `night-deep` dim behind the sheet.
      expect(scrimOf(root)).toBeDefined();

      // The entrance is composed from the two entrance tokens.
      await waitFor(() => expect(spy.configs()).toHaveLength(2));
      const durations = spy
        .configs()
        .map((config) => config.duration)
        .sort((a, b) => (a ?? 0) - (b ?? 0));
      expect(durations).toEqual(
        [animations.ntUp.durationMs, animations.ntFade.durationMs].sort(
          (a, b) => a - b,
        ),
      );
      // The scrim fades up to the scrim opacity; the panel slides to rest.
      expect(spy.configs().map((config) => config.toValue)).toEqual(
        expect.arrayContaining([SHEET_SCRIM_OPACITY, 0]),
      );

      expect(find(root, (element) => element.type === 'Text')).toBeDefined();
    } finally {
      spy.timing.mockRestore();
      restore();
    }
  });

  it('renders no shadow, glow or blur', async () => {
    const restore = setReduceMotion(false);
    const spy = spyOnTiming();
    try {
      const { toJSON } = await render(
        <Sheet>
          <Text>SHEET BODY</Text>
        </Sheet>,
      );
      const root = toJSON();
      if (root === null) {
        throw new Error('no tree');
      }
      const offending = flatten(root)
        .flatMap((element) => styleProps(element))
        .filter((style) => FORBIDDEN_STYLE_KEYS.some((key) => key in style));
      expect(offending).toEqual([]);
    } finally {
      spy.timing.mockRestore();
      restore();
    }
  });

  it('drops the slide under Reduce Motion and presents the panel and scrim at rest', async () => {
    const restore = setReduceMotion(true);
    const spy = spyOnTiming();
    try {
      const { toJSON } = await render(
        <Sheet>
          <Text>SHEET BODY</Text>
        </Sheet>,
      );
      await act(async () => {
        await Promise.resolve();
      });
      const root = toJSON();
      if (root === null) {
        throw new Error('no tree');
      }
      // No entrance animation is started for a reduced-motion user.
      expect(spy.timing).not.toHaveBeenCalled();
      const panel = panelOf(root);
      const scrim = scrimOf(root);
      expect(panel).toBeDefined();
      expect(scrim).toBeDefined();
      if (panel === undefined || scrim === undefined) {
        throw new Error('missing panel or scrim');
      }
      // What the branch renders: the panel is presented at rest — animated
      // opacity 1, not translated — and the scrim at its full dim.
      expect(mergedStyle(panel).opacity).toBe(1);
      expect(mergedStyle(panel).transform).toEqual([{ translateY: 0 }]);
      expect(mergedStyle(scrim).opacity).toBe(SHEET_SCRIM_OPACITY);
      expect(mergedStyle(panel).backgroundColor).toBe(colors.ledger);
      expect(find(root, (element) => element.type === 'Text')).toBeDefined();
    } finally {
      spy.timing.mockRestore();
      restore();
    }
  });

  it('applies the bottom safe-area inset to the panel', async () => {
    const restore = setReduceMotion(false);
    const spy = spyOnTiming();
    try {
      const { toJSON } = await render(
        <SafeAreaInsetsContext.Provider
          value={{ top: 0, bottom: 34, left: 0, right: 0 }}
        >
          <Sheet>
            <Text>SHEET BODY</Text>
          </Sheet>
        </SafeAreaInsetsContext.Provider>,
      );
      const root = toJSON();
      if (root === null) {
        throw new Error('no tree');
      }
      const panel = panelOf(root);
      expect(panel).toBeDefined();
      if (panel === undefined) {
        throw new Error('no panel');
      }
      expect(mergedStyle(panel).paddingBottom).toBe(
        spacing['9'] - spacing['5'] + 34,
      );
    } finally {
      spy.timing.mockRestore();
      restore();
    }
  });

  it('sits above its content and is bottom-aligned', async () => {
    const restore = setReduceMotion(false);
    const spy = spyOnTiming();
    try {
      const { toJSON } = await render(
        <SafeAreaInsetsContext.Provider
          value={{ top: 0, bottom: 0, left: 0, right: 0 }}
        >
          <Sheet>
            <Text>SHEET BODY</Text>
          </Sheet>
        </SafeAreaInsetsContext.Provider>,
      );
      const root = toJSON();
      if (root === null) {
        throw new Error('no tree');
      }
      expect(mergedStyle(root).justifyContent).toBe('flex-end');

      const panel = panelOf(root);
      expect(panel).toBeDefined();
      if (panel === undefined) {
        throw new Error('no panel');
      }
      // The panel's real padding, read from the tokens. The inset is pinned to
      // zero here rather than left to the runner's default: jest-expo resolved
      // no provider to `bottom: 0`, but vitest-native models a real device
      // (`bottom: 34`), so the base padding is asserted against an explicit zero
      // inset and the sibling test covers the nonzero case.
      const panelStyle = mergedStyle(panel);
      expect(panelStyle.paddingHorizontal).toBe(spacing['6']);
      expect(panelStyle.paddingTop).toBe(spacing['3']);
      expect(panelStyle.paddingBottom).toBe(spacing['9'] - spacing['5']);
    } finally {
      spy.timing.mockRestore();
      restore();
    }
  });
});
