import { render } from '@testing-library/react-native';

import { Chip } from '../Chip';
import { LedgerRow } from '../LedgerRow';
import { Rule } from '../Rule';
import { Seal } from '../Seal';
import { SignatureStrip } from '../SignatureStrip';
import { StatCell } from '../StatCell';
import type { JsonNode } from 'test-renderer';
import { find, flatten, testCase, textContent } from './tree';

/**
 * AD-28 for the document primitives: the meaning these components carry is
 * carried by **words**, and a word only the eye can read is not carried at all.
 * This suite asserts each primitive exposes its word to assistive technology and
 * that the decorative `Rule` is hidden from it — the contract is otherwise
 * unobservable.
 */

/** A hidden internal value (AD-26) must never reach assistive technology. */
const HIDDEN_INTERNAL = /seed|tension|attunement|rarity/i;

function allLabels(node: JsonNode | null): readonly string[] {
  return flatten(node)
    .map((element) => element.props.accessibilityLabel)
    .filter((label): label is string => typeof label === 'string');
}

describe('the accessibility contract', () => {
  it('Rule is hidden from assistive technology', async () => {
    const { toJSON } = await render(<Rule />);
    expect(toJSON()?.props.accessibilityElementsHidden).toBe(true);
    expect(toJSON()?.props.importantForAccessibility).toBe(
      'no-hide-descendants',
    );
  });

  it('Chip announces its label as a word', async () => {
    const { getByText } = await render(<Chip label="READY" />);
    expect(getByText('READY')).toBeTruthy();
  });

  it('StatCell announces its label and value', async () => {
    const { getByText } = await render(<StatCell label="CASES" value={4} />);
    expect(getByText('CASES')).toBeTruthy();
    expect(getByText('4')).toBeTruthy();
  });

  it('LedgerRow announces its verdict word and its NO CASE mark', async () => {
    const { getByText } = await render(
      <LedgerRow
        glyph="⁘"
        typeLabel="EMF SWING"
        time="11:36 PM"
        verdict="EXPLAINED"
        caseDeleted
      />,
    );
    expect(getByText('EXPLAINED')).toBeTruthy();
    expect(getByText('NO CASE')).toBeTruthy();
  });

  it('LedgerRow hides its decorative glyph but keeps its words announced', async () => {
    const { toJSON, getByText } = await render(
      <LedgerRow
        glyph="⁘"
        typeLabel="EMF SWING"
        time="11:36 PM"
        verdict="EXPLAINED"
      />,
    );
    // The glyph is decoration (AD-28): hidden from assistive technology, like
    // the sibling `Rule`.
    const glyph = find(toJSON(), (element) => textContent(element) === '⁘');
    expect(glyph).toBeDefined();
    expect(glyph?.props.accessibilityElementsHidden).toBe(true);
    expect(glyph?.props.importantForAccessibility).toBe('no-hide-descendants');
    expect(glyph?.props.accessible).toBe(false);
    // The words still reach assistive technology.
    expect(getByText('EMF SWING')).toBeTruthy();
    expect(getByText('11:36 PM')).toBeTruthy();
    expect(getByText('EXPLAINED')).toBeTruthy();
  });

  it('Seal announces its status word', async () => {
    const { getByLabelText } = await render(<Seal status="UNEXPLAINED" />);
    expect(getByLabelText('UNEXPLAINED')).toBeTruthy();
  });

  it('SignatureStrip composes its count and unidentified count into one label', async () => {
    const { getByLabelText } = await render(
      <SignatureStrip slots={['lit', 'unlit', 'unidentified']} />,
    );
    // One label on the container carries both facts, so the unidentified slot
    // is announced as unidentified rather than as a bare `?` (AD-28).
    expect(getByLabelText('3 signature slots, 1 unidentified')).toBeTruthy();
  });

  const CASES: readonly (readonly [string, React.JSX.Element])[] = [
    testCase('Rule', <Rule />),
    testCase('Chip', <Chip label="REVISED" />),
    testCase('StatCell', <StatCell label="ENCOUNTERS" value={1} />),
    testCase(
      'SignatureStrip',
      <SignatureStrip slots={['lit', 'unidentified', 'unlit']} />,
    ),
    testCase(
      'LedgerRow',
      <LedgerRow
        glyph="⁘"
        typeLabel="EMF SWING"
        time="11:36 PM"
        verdict="UNEXPLAINED"
      />,
    ),
    testCase('Seal', <Seal status="INCONCLUSIVE" />),
  ];

  for (const [name, element] of CASES) {
    it(`${name} announces no hidden internal value`, async () => {
      const { toJSON } = await render(element);
      for (const label of allLabels(toJSON())) {
        expect(HIDDEN_INTERNAL.test(label)).toBe(false);
      }
    });
  }
});
