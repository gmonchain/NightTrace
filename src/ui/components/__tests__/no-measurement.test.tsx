import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { CHIP_LABELS, Chip } from '../Chip';
import { EVIDENCE_CERTAINTIES, EvidenceCard } from '../EvidenceCard';
import { FIELD_STATES, FieldView } from '../FieldView';
import { GrainOverlay } from '../GrainOverlay';
import { HOLD_VARIANTS, HoldButton } from '../HoldButton';
import { LEDGER_VERDICTS, LedgerRow } from '../LedgerRow';
import { RULE_VARIANTS, Rule } from '../Rule';
import { SEAL_STATUSES, Seal } from '../Seal';
import { Sheet } from '../Sheet';
import { SignatureStrip } from '../SignatureStrip';
import { STAT_CELL_LABELS, StatCell } from '../StatCell';
import { TAB_IDS, TabBar } from '../TabBar';
import type { JsonNode } from 'test-renderer';
import { find, flatten, propStrings, styleProps, testCase } from './tree';

/**
 * The structural half of "no measurement is representable".
 *
 * Every component is rendered through its public props and the *whole* host
 * tree is scanned — rendered text, style props, and SVG attributes — for a
 * percentage, a unit suffix, a degree or a distance. Adding such a primitive
 * requires deleting a test, not adding a prop (epics.md Story 1.4's AC, applied
 * to this epic's components).
 *
 * The **accepts** clause is scoped to value-shaped props — the number- and
 * union-typed channels that could carry a measurement — and is proven by the
 * `@ts-expect-error` lines below. Authored copy that is *not* value-shaped is
 * covered by the run's measurement scan of the rendered output, not by a closed
 * type: `LedgerRow`'s free-text `glyph`, `typeLabel` and `time`, and
 * `EvidenceCard`'s free-text `typeLabel`, `channel` and `possibleMatch`, are all
 * rendered below so the scan actually sees them.
 */

/** A number followed by a percent, a unit suffix, a degree or a distance unit. */
const MEASUREMENT =
  /\d\s*(?:%|px|pt|pc|deg|°|cm|mm|km|m\b|ft\b|in\b|yd\b|mi\b|kg|mg|lb\b|oz\b|hz|khz|db\b|dba\b|mph|kt\b|kn\b|µt|μt|ut\b|gauss|µsv|msv|m\/s|km\/h|°c|°f)/i;

/** A fraction glyph — a proportion written as a mark. */
const FRACTION = /[⁄⅟½⅓⅔¼¾]/;

const FORBIDDEN_STYLE_KEYS = [
  'shadowColor',
  'shadowOffset',
  'shadowOpacity',
  'shadowRadius',
  'shadowPath',
  'elevation',
  'backdropFilter',
  'blurRadius',
  'textShadowColor',
  'textShadowOffset',
  'textShadowRadius',
  'glowColor',
] as const;

function isMeasurement(value: string): boolean {
  return MEASUREMENT.test(value) || FRACTION.test(value);
}

/**
 * Every measurement-shaped string in the tree. The one node skipped is the ink
 * `Filter` *definition*: its `x`/`y`/`width`/`height` are the token's own
 * coordinate-space region (`'-10%'`, `'120%'`), a declaration rather than
 * rendered output. `seal-filter.test.tsx` asserts that region against the token,
 * so the skip is scoped to the token's own values and not a hole.
 */
function measurementStrings(node: JsonNode | null): readonly string[] {
  const found: string[] = [];
  for (const element of flatten(node)) {
    if (element.type === 'RNSVGFilter') {
      continue;
    }
    for (const [key, value] of Object.entries(element.props)) {
      if (key === 'children') {
        continue;
      }
      for (const candidate of propStrings(value)) {
        if (isMeasurement(candidate)) {
          found.push(candidate);
        }
      }
    }
    for (const child of element.children) {
      if (typeof child === 'string' && isMeasurement(child)) {
        found.push(child);
      }
    }
  }
  return found;
}

function shadowStyles(node: JsonNode | null): readonly Record<string, unknown>[] {
  return flatten(node)
    .flatMap((element) => styleProps(element))
    .filter((style) =>
      FORBIDDEN_STYLE_KEYS.some((key) => key in style),
    );
}

/**
 * Every public-prop shape of every component: `LedgerRow` is exercised with each
 * of its four verdicts and again with `caseDeleted`, and `Seal` with all three
 * statuses, so the free-text props are actually rendered and scanned.
 */
const LEDGER_ROWS: readonly (readonly [string, React.JSX.Element])[] = [
  ...LEDGER_VERDICTS.map((verdict) =>
    testCase(
      `LedgerRow ${verdict}`,
      <LedgerRow
        glyph="⁘"
        typeLabel="EMF SWING"
        time="11:36 PM"
        verdict={verdict}
      />,
    ),
  ),
  testCase(
    'LedgerRow caseDeleted',
    <LedgerRow
      glyph="⁘"
      typeLabel="EMF SWING"
      time="11:36 PM"
      verdict="UNREVIEWED"
      caseDeleted
    />,
  ),
];

const CASES: readonly (readonly [string, React.JSX.Element])[] = [
  ...RULE_VARIANTS.map((variant) =>
    testCase(`Rule ${variant}`, <Rule variant={variant} />),
  ),
  ...CHIP_LABELS.map((label) =>
    testCase(`Chip ${label}`, <Chip label={label} />),
  ),
  testCase('Chip live', <Chip label="REVISED" live />),
  ...STAT_CELL_LABELS.map((label) =>
    testCase(`StatCell ${label}`, <StatCell label={label} value={4} />),
  ),
  testCase(
    'SignatureStrip',
    <SignatureStrip
      slots={['lit', 'unlit', 'unidentified', 'lit', 'unlit', 'lit', 'unlit']}
    />,
  ),
  testCase('SignatureStrip empty', <SignatureStrip slots={[]} />),
  ...LEDGER_ROWS,
  ...SEAL_STATUSES.map((status) =>
    testCase(`Seal ${status}`, <Seal status={status} />),
  ),
  // Story 1.4 — the interaction components.
  ...HOLD_VARIANTS.map((variant) =>
    testCase(
      `HoldButton ${variant}`,
      <HoldButton
        variant={variant}
        label="HOLD TO ENTER THE FIELD"
        onComplete={() => {}}
        onCancel={() => {}}
      />,
    ),
  ),
  testCase(
    'Sheet',
    <Sheet>
      <Text>SHEET BODY</Text>
    </Sheet>,
  ),
  ...TAB_IDS.map((activeTab) =>
    testCase(
      `TabBar ${activeTab}`,
      <TabBar activeTab={activeTab} onSelect={() => {}} />,
    ),
  ),
  testCase(
    'TabBar unsealed',
    <TabBar activeTab="FIELD JOURNAL" onSelect={() => {}} unsealedCase />,
  ),
  ...FIELD_STATES.map((state) =>
    testCase(`FieldView ${state}`, <FieldView state={state} />),
  ),
  testCase('GrainOverlay', <GrainOverlay />),
  ...EVIDENCE_CERTAINTIES.map((certainty) =>
    testCase(
      `EvidenceCard ${certainty}`,
      <EvidenceCard
        typeLabel="FRAME"
        certainty={certainty}
        channel="Camera · captured"
        possibleMatch="No match on file"
        onResolve={() => {}}
      />,
    ),
  ),
  testCase(
    'EvidenceCard capture',
    <EvidenceCard
      typeLabel="FRAME"
      certainty="AMBIGUOUS"
      channel="Camera · captured"
      possibleMatch="No match on file"
      onResolve={() => {}}
      capture
    />,
  ),
];

describe('no component renders a measurement', () => {
  for (const [name, element] of CASES) {
    it(`${name} renders no percentage, unit, degree, distance, fraction or shadow`, async () => {
      const { toJSON } = await render(element);
      expect(measurementStrings(toJSON())).toEqual([]);
      expect(shadowStyles(toJSON())).toEqual([]);
    });
  }

  it('scopes the ink filter’s region to the token, not to a hole', async () => {
    const { toJSON } = await render(<Seal status="UNEXPLAINED" />);
    const filter = find(toJSON(), (element) => element.type === 'RNSVGFilter');
    // The only `%`-bearing surface in the story is the ink region — the skip in
    // `measurementStrings` is scoped to these token values.
    expect(filter).toBeDefined();
    const strings = filter === undefined ? [] : propStrings(filter.props);
    expect(strings.filter((value) => value.includes('%'))).toEqual([
      '-10%',
      '-10%',
      '120%',
      '120%',
    ]);
  });
});

/**
 * The **accepts** half, scoped to value-shaped props (numbers and the closed
 * unions). Each `@ts-expect-error` line *is* the assertion: it is a
 * `tsc --noEmit` failure if the escape it forbids is ever added to a prop. The
 * runtime call proves only that the array was built — the compile-time surface
 * is the test. Free-text authored copy — `LedgerRow`'s and `EvidenceCard`'s — is
 * not a value-shaped channel and is covered above by the rendered-output scan.
 */
function typeLevelGuards(): readonly (() => React.JSX.Element)[] {
  return [
    // @ts-expect-error StatCell.value is a number — a string carrying a unit is rejected
    () => <StatCell label="CASES" value="4%" />,
    // @ts-expect-error StatCell.label is the closed count union, not a free string
    () => <StatCell label="TEMPERATURE" value={4} />,
    // @ts-expect-error Chip.label is the closed five-label union
    () => <Chip label="EXPLAINED" />,
    // @ts-expect-error SignatureStrip.slots take slot kinds, not raw numbers
    () => <SignatureStrip slots={[1, 2]} />,
    // @ts-expect-error LedgerRow.verdict is the closed verdict union
    () => <LedgerRow glyph="⁘" typeLabel="X" time="1" verdict="NOPE" />,
    // @ts-expect-error Seal.status is the closed status union
    () => <Seal status="MAYBE" />,
    // @ts-expect-error Rule.variant is the closed two-variant union
    () => <Rule variant="strong" />,
    // @ts-expect-error HoldButton's fill duration is read from the token, not a prop
    () => <HoldButton variant="enter" label="X" onComplete={() => {}} onCancel={() => {}} durationMs={800} />,
    // @ts-expect-error HoldButton.variant is the closed two-variant union
    () => <HoldButton variant="hold" label="X" onComplete={() => {}} onCancel={() => {}} />,
    // @ts-expect-error TabBar.activeTab is the closed four-tab union
    () => <TabBar activeTab="SETTINGS" onSelect={() => {}} />,
    // @ts-expect-error FieldView.state is the closed four-word union
    () => <FieldView state="LOUD" />,
    // @ts-expect-error EvidenceCard.certainty is the closed band union, never a number
    () => <EvidenceCard typeLabel="X" certainty={0.9} channel="c" possibleMatch="m" onResolve={() => {}} />,
    // @ts-expect-error Sheet holds a surface, not a depth level
    () => <Sheet depth={2}><Text>x</Text></Sheet>,
  ];
}

describe('no escape hatch exists to add a measurement', () => {
  it('every forbidden prop shape is a compile error', () => {
    // The assertion is the `@ts-expect-error` lines above; this proves only that
    // the array built.
    expect(typeLevelGuards()).toHaveLength(13);
  });
});
