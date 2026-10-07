import { render } from '@testing-library/react-native';

import { colors, components, rounded, typography } from '../../theme/tokens';
import {
  LEDGER_VERDICTS,
  LedgerRow,
  type LedgerVerdict,
} from '../LedgerRow';
import type { HostElement } from './tree';
import { find, mergedStyle, styleProps, textContent } from './tree';

const GLYPH = '⁘';
const TYPE_LABEL = 'EMF SWING';
const TIME = '11:36 PM';

async function renderRow(
  verdict: LedgerVerdict,
  caseDeleted = false,
): Promise<HostElement> {
  const { toJSON } = await render(
    <LedgerRow
      glyph={GLYPH}
      typeLabel={TYPE_LABEL}
      time={TIME}
      verdict={verdict}
      caseDeleted={caseDeleted}
    />,
  );
  const root = toJSON();
  expect(root).not.toBeNull();
  if (root === null) {
    throw new Error('LedgerRow rendered nothing');
  }
  return root;
}

/** The local chip whose only child renders `label`. */
function chipFor(root: HostElement, label: string): HostElement | undefined {
  return find(
    root,
    (element) =>
      element.type === 'View' &&
      element.children.some(
        (child) =>
          typeof child !== 'string' &&
          child.type === 'Text' &&
          textContent(child) === label,
      ),
  );
}

function textFor(root: HostElement, content: string): HostElement | undefined {
  return find(
    root,
    (element) => element.type === 'Text' && textContent(element) === content,
  );
}

const INK_VERDICT = 'UNEXPLAINED';

describe('LedgerRow', () => {
  it('LEDGER_EXPLAINED: strikes the glyph through and shows an EXPLAINED chip', async () => {
    const root = await renderRow('EXPLAINED');
    const glyph = textFor(root, GLYPH);
    expect(glyph).toBeDefined();
    expect(styleProps(glyph ?? ({} as HostElement))).toContainEqual(
      expect.objectContaining({ textDecorationLine: 'line-through' }),
    );
    expect(chipFor(root, 'EXPLAINED')).toBeDefined();
  });

  it('LEDGER_NO_CASE: keeps the row and adds a NO CASE chip', async () => {
    const root = await renderRow('UNEXPLAINED', true);
    expect(textFor(root, TYPE_LABEL)).toBeDefined();
    expect(chipFor(root, 'NO CASE')).toBeDefined();
    expect(chipFor(root, 'UNEXPLAINED')).toBeDefined();
  });

  it('separates the row with a Rule, never a card border', async () => {
    const root = await renderRow('INCONCLUSIVE');
    const divider = find(root, (element) =>
      styleProps(element).some(
        (style) =>
          style.backgroundColor === colors.rule &&
          style.height === components.rule.height,
      ),
    );
    expect(divider).toBeDefined();
    // The row itself carries no card: no border, no radius, no surface.
    expect(root.props.style).toBeUndefined();
  });

  it('renders every verdict, UNREVIEWED included, in the same ash except UNEXPLAINED', async () => {
    for (const verdict of LEDGER_VERDICTS) {
      const root = await renderRow(verdict);
      const chip = chipFor(root, verdict);
      expect(chip).toBeDefined();
      if (chip === undefined) {
        continue;
      }
      const expectedText =
        verdict === INK_VERDICT ? colors['safelight-soft'] : colors.ash;
      const expectedBorder =
        verdict === INK_VERDICT ? colors.olive : colors['rule-strong'];
      expect(styleProps(chip)).toContainEqual(
        expect.objectContaining({
          borderColor: expectedBorder,
          borderRadius: rounded.DEFAULT,
        }),
      );
      const label = find(chip, (element) => element.type === 'Text');
      expect(styleProps(label ?? ({} as HostElement))).toContainEqual(
        expect.objectContaining({ color: expectedText }),
      );
    }
  });

  it('sets the type label in label/bone and the time in meta/ash', async () => {
    const root = await renderRow('UNEXPLAINED');
    const typeLabel = textFor(root, TYPE_LABEL);
    const time = textFor(root, TIME);
    expect(typeLabel).toBeDefined();
    expect(time).toBeDefined();
    if (typeLabel === undefined || time === undefined) {
      throw new Error('LedgerRow did not render its type label and time');
    }
    expect(mergedStyle(typeLabel)).toMatchObject({
      fontFamily: typography.label.fontFamily,
      fontSize: typography.label.fontSize,
      color: colors.bone,
    });
    expect(mergedStyle(time)).toMatchObject({
      fontFamily: typography.meta.fontFamily,
      fontSize: typography.meta.fontSize,
      color: colors.ash,
    });
  });

  it('does not strike the glyph on a verdict other than EXPLAINED', async () => {
    const root = await renderRow('UNREVIEWED');
    const glyph = textFor(root, GLYPH);
    expect(glyph).toBeDefined();
    for (const style of styleProps(glyph ?? ({} as HostElement))) {
      expect(style.textDecorationLine).toBeUndefined();
    }
  });
});
