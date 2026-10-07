import { render } from '@testing-library/react-native';

import { colors, rounded, typography } from '../../theme/tokens';
import { CHIP_LABELS, Chip } from '../Chip';
import type { HostElement } from './tree';
import { find, mergedStyle, styleProps, textContent } from './tree';

async function renderChip(element: React.JSX.Element): Promise<HostElement> {
  const { toJSON } = await render(element);
  const root = toJSON();
  expect(root).not.toBeNull();
  if (root === null) {
    throw new Error('Chip rendered nothing');
  }
  return root;
}

describe('Chip', () => {
  it('CHIP_DEFAULT: draws a rule-strong border at rounded.DEFAULT with a meta label', async () => {
    const view = await renderChip(<Chip label="READY" />);
    expect(styleProps(view)).toContainEqual(
      expect.objectContaining({
        borderColor: colors['rule-strong'],
        borderRadius: rounded.DEFAULT,
      }),
    );
    const text = find(view, (element) => element.type === 'Text');
    expect(text).toBeDefined();
    expect(text === undefined ? '' : textContent(text)).toBe('READY');
  });

  it('CHIP_LIVE: a live payload swaps the border to olive', async () => {
    const view = await renderChip(<Chip label="READY" live />);
    expect(styleProps(view)).toContainEqual(
      expect.objectContaining({ borderColor: colors.olive }),
    );
  });

  it('sets the label in typography.meta', async () => {
    const view = await renderChip(<Chip label="READY" />);
    const text = find(view, (element) => element.type === 'Text');
    expect(text).toBeDefined();
    if (text === undefined) {
      throw new Error('Chip rendered no label');
    }
    expect(mergedStyle(text)).toMatchObject({
      fontFamily: typography.meta.fontFamily,
      fontSize: typography.meta.fontSize,
      fontWeight: typography.meta.fontWeight,
    });
    expect(mergedStyle(text).letterSpacing).toBeCloseTo(
      typography.meta.fontSize * typography.meta.letterSpacing,
      6,
    );
  });

  it('carries any of the five labels', async () => {
    for (const label of CHIP_LABELS) {
      const view = await renderChip(<Chip label={label} />);
      const text = find(view, (element) => element.type === 'Text');
      expect(text === undefined ? '' : textContent(text)).toBe(label);
    }
  });

  it('is never a coloured fill and never carries an icon', async () => {
    const view = await renderChip(<Chip label="REVISED" live />);
    for (const style of styleProps(view)) {
      expect(style.backgroundColor).toBeUndefined();
    }
    // Exactly one child: the label Text. No icon, no trailing element.
    expect(view.children).toHaveLength(1);
  });

  it('the label is the accessible name, so state never rides on colour alone', async () => {
    const view = await renderChip(<Chip label="UNCHARTED" />);
    const text = find(view, (element) => element.type === 'Text');
    expect(text?.props.accessibilityRole).toBe('text');
  });
});
