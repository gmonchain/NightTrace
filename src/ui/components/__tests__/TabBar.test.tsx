import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { colors, components } from '../../theme/tokens';
import { TAB_IDS, TabBar, type TabId } from '../TabBar';
import type { HostElement } from './tree';
import { find, flatten, mergedStyle, styleProps, textContent } from './tree';

function renderTabBar(activeTab: TabId, onSelect: (tab: TabId) => void) {
  return render(
    <TabBar activeTab={activeTab} onSelect={onSelect} />,
  );
}

function rootOf(node: HostElement | null): HostElement {
  if (node === null) {
    throw new Error('TabBar rendered nothing');
  }
  return node;
}

function textNode(root: HostElement, content: string): HostElement | undefined {
  return find(
    root,
    (element) => element.type === 'Text' && textContent(element) === content,
  );
}

function tabSubtree(root: HostElement, id: TabId): HostElement | undefined {
  return find(root, (element) => element.props.accessibilityLabel === id);
}

describe('TabBar', () => {
  it('TAB_SELECTED: four tabs on the night surface with a top hairline', async () => {
    const { toJSON } = await renderTabBar('HOME', () => {});
    const root = rootOf(toJSON());

    expect(mergedStyle(root).backgroundColor).toBe(colors.night);
    // The top hairline is the composed `Rule`.
    expect(
      find(root, (element) =>
        styleProps(element).some(
          (style) =>
            style.backgroundColor === colors.rule &&
            style.height === components.rule.height,
        ),
      ),
    ).toBeDefined();
    for (const id of TAB_IDS) {
      expect(textNode(root, id)).toBeDefined();
    }
  });

  it('TAB_SELECTED: the active label is bone with a bone underline; the others are ash', async () => {
    const { toJSON } = await renderTabBar('INVESTIGATE', () => {});
    const root = rootOf(toJSON());

    for (const id of TAB_IDS) {
      const label = textNode(root, id);
      expect(label).toBeDefined();
      if (label === undefined) {
        throw new Error(`no label ${id}`);
      }
      const expected = id === 'INVESTIGATE' ? colors.bone : colors.ash;
      expect(mergedStyle(label).color).toBe(expected);
    }

    // The active tab carries a bone underline; an inactive one does not.
    const active = tabSubtree(root, 'INVESTIGATE');
    const inactive = tabSubtree(root, 'HOME');
    expect(active).toBeDefined();
    expect(inactive).toBeDefined();
    if (active === undefined || inactive === undefined) {
      throw new Error('missing tab subtree');
    }
    const underline = flatten(active).find((element) =>
      styleProps(element).some(
        (style) => style.backgroundColor === colors.bone,
      ),
    );
    expect(underline).toBeDefined();
    expect(
      flatten(inactive).some((element) =>
        styleProps(element).some(
          (style) => style.backgroundColor === colors.bone,
        ),
      ),
    ).toBe(false);
  });

  it('announces the selected state and reports the chosen tab', async () => {
    const onSelect = jest.fn();
    const { getByLabelText, toJSON } = await renderTabBar('HOME', onSelect);
    const root = rootOf(toJSON());
    const home = tabSubtree(root, 'HOME');
    expect(home?.props.accessibilityState).toEqual({ selected: true });
    expect(tabSubtree(root, 'PROFILE')?.props.accessibilityState).toEqual({
      selected: false,
    });

    await fireEvent(getByLabelText('FIELD JOURNAL'), 'press');
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('FIELD JOURNAL');
  });

  it('renders every label uppercase', async () => {
    const { toJSON } = await renderTabBar('PROFILE', () => {});
    const root = rootOf(toJSON());
    for (const id of TAB_IDS) {
      const label = textNode(root, id);
      expect(label === undefined ? '' : textContent(label)).toBe(
        id.toUpperCase(),
      );
    }
  });

  it('does not select the already-active tab', async () => {
    const onSelect = jest.fn();
    const { getByLabelText } = await renderTabBar('HOME', onSelect);
    // Re-selecting the active tab is a no-op.
    await fireEvent(getByLabelText('HOME'), 'press');
    expect(onSelect).not.toHaveBeenCalled();
    // A different tab still reports the change.
    await fireEvent(getByLabelText('PROFILE'), 'press');
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('PROFILE');
  });

  it('applies the bottom safe-area inset', async () => {
    const { toJSON } = await render(
      <SafeAreaInsetsContext.Provider
        value={{ top: 0, bottom: 34, left: 0, right: 0 }}
      >
        <TabBar activeTab="HOME" onSelect={() => {}} />
      </SafeAreaInsetsContext.Provider>,
    );
    const root = rootOf(toJSON());
    expect(mergedStyle(root).paddingBottom).toBe(34);
  });
});
