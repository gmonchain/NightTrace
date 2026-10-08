import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { ONBOARDING_COPY, ONBOARDING_SCREENS } from '@/data/strings';
import { colors, components, spacing } from '@/ui/theme/tokens';
import {
  find,
  flatten,
  mergedStyle,
  textContent,
  type HostElement,
} from '@/ui/components/__tests__/tree';

import {
  ONBOARDING_HAIRLINE_COUNT,
  ONBOARDING_STEPS,
  OnboardingFrame,
} from '../OnboardingFrame';

/**
 * Story 1.6 — the shared frame.
 *
 * The load-bearing assertion is the position indicator: **exactly four
 * hairlines**, each decorative (hidden from assistive technology), never a
 * percentage or a fraction. The frame's headline and body carry the meaning.
 *
 * The body fixture is built from the shipped `ONBOARDING_COPY` rather than a
 * retyped string — a single-line fixture would let `body.slice(0, 1)` strip the
 * screens' teaching copy with the suite green, so the fixture is screen 4's
 * real three-line body.
 */

/** The three-line body screen 4 ships, used as the frame's own fixture. */
const SCREEN = ONBOARDING_COPY.permissions;

/** The fraction / percentage shapes the indicator must never render. */
const FRACTION = /\d+\s*(?:\/|of)\s*\d+/i;

function renderFrame(step: 1 | 2 | 3 | 4) {
  return render(
    <OnboardingFrame
      step={step}
      kicker={SCREEN.kicker}
      headline={SCREEN.headline}
      body={SCREEN.body}
    >
      <Text>ACTION</Text>
    </OnboardingFrame>,
  );
}

function progressRow(root: HostElement | null): HostElement {
  const row = find(root, (element) => element.props.testID === 'onboarding-progress');
  if (row === undefined) {
    throw new Error('no progress row');
  }
  return row;
}

/** The four hairline nodes inside the indicator row. */
function hairlines(root: HostElement | null): readonly HostElement[] {
  return progressRow(root).children.filter(
    (child): child is HostElement => typeof child !== 'string',
  );
}

describe('OnboardingFrame', () => {
  it('renders exactly four hairlines as the position indicator', async () => {
    const { toJSON } = await renderFrame(1);
    const lines = hairlines(toJSON());
    expect(lines).toHaveLength(ONBOARDING_HAIRLINE_COUNT);
    expect(ONBOARDING_HAIRLINE_COUNT).toBe(4);
    for (const line of lines) {
      const style = mergedStyle(line);
      expect(style.height).toBe(components.rule.height);
      expect([colors.rule, colors['rule-soft']]).toContain(style.backgroundColor);
    }
  });

  it('never renders a percentage or a fraction', async () => {
    const { toJSON, queryByText } = await renderFrame(1);
    // No text node in the whole tree carries a percentage or a fraction of the
    // path. The rule is narrow on purpose: `\bof\b` would fail the real copy
    // ("Every part of a night works without it.").
    for (const element of flatten(toJSON())) {
      for (const child of element.children) {
        if (typeof child === 'string') {
          expect(child).not.toContain('%');
          expect(child).not.toMatch(FRACTION);
        }
      }
      const text = textContent(element);
      expect(text).not.toContain('%');
      expect(text).not.toMatch(FRACTION);
    }
    expect(queryByText('2 of 4')).toBeNull();
  });

  it('the real onboarding copy carries no percentage or fraction', () => {
    // The same rule, asserted against every authored line rather than a fixture.
    const lines = ONBOARDING_SCREENS.flatMap((screen) => [
      screen.kicker,
      screen.headline,
      ...screen.body,
      screen.actionLabel,
    ]);
    for (const line of lines) {
      expect(line).not.toContain('%');
      expect(line).not.toMatch(FRACTION);
    }
  });

  it('hides the indicator from assistive technology', async () => {
    const { toJSON } = await renderFrame(3);
    for (const line of hairlines(toJSON())) {
      expect(line.props.accessible).toBe(false);
      expect(line.props.accessibilityElementsHidden).toBe(true);
      expect(line.props.importantForAccessibility).toBe('no-hide-descendants');
    }
  });

  it('marks the current position with exactly one brighter hairline', async () => {
    for (const step of ONBOARDING_STEPS) {
      const { toJSON } = await renderFrame(step);
      const lines = hairlines(toJSON());
      const bright = lines.filter(
        (line) => mergedStyle(line).backgroundColor === colors.rule,
      );
      expect(bright).toHaveLength(1);
      // The bright one is the current step (index step - 1).
      expect(lines.indexOf(bright[0] as HostElement)).toBe(step - 1);
    }
  });

  it('renders the kicker, headline and every body line', async () => {
    const { getByText, queryByText, toJSON } = await renderFrame(2);
    // The kicker ships in authored sentence case; the small-caps look is a
    // style, so the screen reader reads the authored string.
    const kickerNode = find(
      toJSON(),
      (element) => mergedStyle(element).textTransform === 'uppercase',
    );
    expect(kickerNode).toBeDefined();
    expect(textContent(kickerNode as HostElement)).toBe(SCREEN.kicker);
    expect(queryByText(SCREEN.kicker.toUpperCase())).toBeNull();

    expect(getByText(SCREEN.headline)).toBeTruthy();
    for (const line of SCREEN.body) {
      expect(getByText(line)).toBeTruthy();
    }
    expect(getByText('ACTION')).toBeTruthy();
  });

  it('marks the headline as a header for assistive technology', async () => {
    const { toJSON } = await renderFrame(3);
    const header = find(
      toJSON(),
      (element) => element.props.accessibilityRole === 'header',
    );
    expect(header).toBeDefined();
    expect(textContent(header as HostElement)).toBe(SCREEN.headline);
  });

  it('keys consecutive identical body lines apart', async () => {
    const { getAllByText } = await render(
      <OnboardingFrame step={1} kicker="K" headline="H" body={['same', 'same']}>
        <Text>ACTION</Text>
      </OnboardingFrame>,
    );
    expect(getAllByText('same')).toHaveLength(2);
  });

  it('keeps the action outside the scrolling copy block', async () => {
    const { toJSON } = await renderFrame(1);
    // A single `toJSON()` call, so the element identities compared below are the
    // same objects.
    const root = toJSON();
    const scroll = find(
      root,
      (element) => element.props.testID === 'onboarding-copy',
    );
    expect(scroll).toBeDefined();
    const inside = flatten(scroll as HostElement);
    const action = find(root, (element) => textContent(element) === 'ACTION');
    const headline = find(
      root,
      (element) => textContent(element) === SCREEN.headline,
    );
    expect(action).toBeDefined();
    expect(headline).toBeDefined();
    // The pinned action is not inside the scroll; the copy is.
    expect(inside).not.toContain(action);
    expect(inside).toContain(headline);
  });

  it('applies the safe-area insets around its content', async () => {
    const { toJSON } = await render(
      <SafeAreaInsetsContext.Provider
        value={{ top: 59, bottom: 34, left: 0, right: 0 }}
      >
        <OnboardingFrame
          step={1}
          kicker="K"
          headline="H"
          body={['B']}
        >
          <Text>ACTION</Text>
        </OnboardingFrame>
      </SafeAreaInsetsContext.Provider>,
    );
    const root = toJSON();
    expect(root === null ? null : mergedStyle(root).paddingTop).toBe(59 + spacing['6']);
    expect(root === null ? null : mergedStyle(root).paddingBottom).toBe(
      34 + spacing['6'],
    );
  });
});
