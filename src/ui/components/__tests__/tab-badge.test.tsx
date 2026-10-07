import { render } from '@testing-library/react-native';

import { colors, rounded } from '../../theme/tokens';
import { TAB_IDS, TabBar } from '../TabBar';
import type { HostElement } from './tree';
import { flatten, styleProps } from './tree';

/**
 * The single-badge product rule (epics.md): the product has **exactly one**
 * badge, a `safelight` dot on Field Journal when a case is unsealed. This suite
 * pins the rule structurally: a second badge kind cannot be added without
 * editing this test.
 */

function rootOf(node: HostElement | null): HostElement {
  if (node === null) {
    throw new Error('TabBar rendered nothing');
  }
  return node;
}

/** Every `safelight` badge dot in the tree. */
function badgeDots(root: HostElement): readonly HostElement[] {
  return flatten(root).filter((element) =>
    styleProps(element).some(
      (style) =>
        style.backgroundColor === colors.safelight &&
        style.borderRadius === rounded.full,
    ),
  );
}

/** The subtree of one tab, found by its accessible name. */
function tabSubtree(root: HostElement, label: string): HostElement | undefined {
  return flatten(root).find(
    (element) => element.props.accessibilityLabel === label,
  );
}

describe('the single tab badge', () => {
  it('TAB_BADGE: exactly one safelight dot, on Field Journal', async () => {
    const { toJSON } = await render(
      <TabBar activeTab="HOME" onSelect={() => {}} unsealedCase />,
    );
    const root = rootOf(toJSON());
    const dots = badgeDots(root);
    expect(dots).toHaveLength(1);

    const journal = tabSubtree(root, 'FIELD JOURNAL, case unsealed');
    expect(journal).toBeDefined();
    if (journal === undefined) {
      throw new Error('no Field Journal tab');
    }
    expect(flatten(journal)).toContain(dots[0]);
  });

  it('TAB_BADGE: the dot is hidden when the prop is false', async () => {
    const { toJSON } = await render(
      <TabBar activeTab="HOME" onSelect={() => {}} />,
    );
    const root = rootOf(toJSON());
    expect(badgeDots(root)).toEqual([]);
  });

  it('no other tab ever carries a badge', async () => {
    for (const activeTab of TAB_IDS) {
      const { toJSON } = await render(
        <TabBar activeTab={activeTab} onSelect={() => {}} unsealedCase />,
      );
      const root = rootOf(toJSON());
      const dots = badgeDots(root);
      expect(dots).toHaveLength(1);
      const journal = tabSubtree(root, 'FIELD JOURNAL, case unsealed');
      if (journal === undefined) {
        throw new Error('no Field Journal tab');
      }
      expect(flatten(journal)).toContain(dots[0]);
    }
  });

  it('the IA is exactly the four tabs', () => {
    expect(TAB_IDS).toEqual([
      'HOME',
      'INVESTIGATE',
      'FIELD JOURNAL',
      'PROFILE',
    ]);
  });
});

/**
 * The **accepts** half: a badge map and an unknown tab id are compile errors.
 * Each `@ts-expect-error` line *is* the assertion — a `tsc --noEmit` failure if
 * the escape it forbids is ever added. The runtime call proves only that the
 * array was built.
 */
function typeLevelGuards(): readonly (() => React.JSX.Element)[] {
  return [
    // @ts-expect-error there is one badge boolean, not a map of badges
    () => <TabBar activeTab="HOME" onSelect={() => {}} badges={{ HOME: true }} />,
    // @ts-expect-error an unknown tab id is not in the closed union
    () => <TabBar activeTab="SETTINGS" onSelect={() => {}} />,
    // @ts-expect-error unsealedCase is a single boolean, not a badge descriptor
    () => <TabBar activeTab="HOME" onSelect={() => {}} unsealedCase="yes" />,
  ];
}

describe('no escape hatch exists to add a second badge', () => {
  it('every forbidden prop shape is a compile error', () => {
    expect(typeLevelGuards()).toHaveLength(3);
  });
});
