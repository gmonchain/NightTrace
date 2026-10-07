import { render } from '@testing-library/react-native';

import { colors, typography } from '../../theme/tokens';
import { STAT_CELL_LABELS, StatCell } from '../StatCell';
import type { HostElement } from './tree';
import { byType, mergedStyle, textContent } from './tree';

async function renderCell(element: React.JSX.Element): Promise<HostElement> {
  const { toJSON } = await render(element);
  const root = toJSON();
  expect(root).not.toBeNull();
  if (root === null) {
    throw new Error('StatCell rendered nothing');
  }
  return root;
}

describe('StatCell', () => {
  it('STATCELL_COUNT: shows CASES in meta/ash above 4 in label/bone', async () => {
    const view = await renderCell(<StatCell label="CASES" value={4} />);
    const texts = byType(view, 'Text');
    expect(texts).toHaveLength(2);
    const [label, value] = texts;
    if (label === undefined || value === undefined) {
      throw new Error('StatCell did not render two text nodes');
    }
    expect(textContent(label)).toBe('CASES');
    expect(textContent(value)).toBe('4');
    // Order: label above value.
    expect(view.children.indexOf(label)).toBeLessThan(
      view.children.indexOf(value),
    );
    expect(mergedStyle(label)).toMatchObject({
      fontFamily: typography.meta.fontFamily,
      fontSize: typography.meta.fontSize,
      color: colors.ash,
    });
    expect(mergedStyle(value)).toMatchObject({
      fontFamily: typography.label.fontFamily,
      fontSize: typography.label.fontSize,
      color: colors.bone,
    });
  });

  it('STATCELL_NO_UNIT: appends nothing to the value', async () => {
    const view = await renderCell(<StatCell label="HOURS" value={18.42} />);
    const rendered = byType(view, 'Text')
      .map((text) => textContent(text))
      .join('');
    expect(rendered).not.toContain('%');
    expect(rendered).not.toContain('⁄');
    expect(rendered).not.toContain('½');
    // The rendered value is exactly the number's own string.
    expect(rendered).toContain(String(18.42));
  });

  it('carries any of the report’s four count labels', async () => {
    for (const label of STAT_CELL_LABELS) {
      const view = await renderCell(<StatCell label={label} value={1} />);
      const texts = byType(view, 'Text');
      expect(texts[0] === undefined ? '' : textContent(texts[0])).toBe(label);
    }
  });
});
