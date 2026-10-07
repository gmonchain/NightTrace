import { render } from '@testing-library/react-native';

import { colors, components } from '../../theme/tokens';
import { RULE_VARIANTS, Rule } from '../Rule';
import type { HostElement } from './tree';
import { styleProps } from './tree';

/** Render a `Rule` and return its single host node. */
async function renderRule(element: React.JSX.Element): Promise<HostElement> {
  const { toJSON } = await render(element);
  const root = toJSON();
  expect(root).not.toBeNull();
  if (root === null) {
    throw new Error('Rule rendered nothing');
  }
  return root;
}

describe('Rule', () => {
  it('RULE_DEFAULT: draws a full-width 1px colors.rule hairline', async () => {
    const view = await renderRule(<Rule />);
    const styles = styleProps(view);
    expect(styles).toContainEqual(
      expect.objectContaining({
        alignSelf: 'stretch',
        backgroundColor: colors.rule,
        height: components.rule.height,
      }),
    );
  });

  it('RULE_SOFT: the soft variant draws rule-soft at its own height', async () => {
    const view = await renderRule(<Rule variant="soft" />);
    expect(styleProps(view)).toContainEqual(
      expect.objectContaining({
        backgroundColor: colors['rule-soft'],
        height: components['rule-soft'].height,
      }),
    );
  });

  it('reads each variant’s colour from the tokens', async () => {
    for (const variant of RULE_VARIANTS) {
      const view = await renderRule(<Rule variant={variant} />);
      const expected =
        variant === 'soft' ? colors['rule-soft'] : colors.rule;
      expect(styleProps(view)).toContainEqual(
        expect.objectContaining({ backgroundColor: expected }),
      );
    }
  });

  it('draws a hairline, never a card border', async () => {
    const view = await renderRule(<Rule />);
    for (const style of styleProps(view)) {
      expect(style).not.toHaveProperty('borderWidth');
      expect(style).not.toHaveProperty('borderColor');
      expect(style).not.toHaveProperty('borderRadius');
    }
  });

  it('is hidden from assistive technology', async () => {
    const view = await renderRule(<Rule />);
    expect(view.props.accessibilityElementsHidden).toBe(true);
    expect(view.props.importantForAccessibility).toBe('no-hide-descendants');
    expect(view.props.accessible).toBe(false);
  });

  it('merges an optional margin style last', async () => {
    const view = await renderRule(<Rule style={{ marginTop: 8 }} />);
    expect(styleProps(view)).toContainEqual(
      expect.objectContaining({ marginTop: 8 }),
    );
  });
});
