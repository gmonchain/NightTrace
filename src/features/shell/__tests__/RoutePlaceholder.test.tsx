import { render, screen } from '@testing-library/react-native';

import { isElement, textContent } from '@/ui/components/__tests__/tree';

import { RoutePlaceholder } from '../RoutePlaceholder';
import { REAL_SCREEN_IDS, ROUTE_TREE, type RouteKey } from '../navigation';

/**
 * Story 1.8 — `RoutePlaceholder` renders the route's declared name.
 *
 * Every placeholder route wraps this one surface, so proving it renders the
 * declared name authorises the whole tree. It authors no product copy beyond the
 * name: the case below asserts the rendered text is the name and nothing else.
 */

const NON_PLACEHOLDER_IDS = new Set<RouteKey>(REAL_SCREEN_IDS);

const placeholders = ROUTE_TREE.filter(
  (entry) => !NON_PLACEHOLDER_IDS.has(entry.id),
);

describe('RoutePlaceholder', () => {
  it('renders the declared name with a per-route testID', async () => {
    await render(<RoutePlaceholder route="huntBrief" />);
    expect(screen.getByText('HUNT BRIEF')).toBeTruthy();
    expect(screen.getByTestId('route-placeholder:huntBrief')).toBeTruthy();
  });

  it.each(placeholders.map((entry) => [entry.id, entry.name] as const))(
    'renders %s as its declared name %s',
    async (id, name) => {
      await render(<RoutePlaceholder route={id} />);
      expect(screen.getByText(name)).toBeTruthy();
    },
  );

  it('authors no product copy beyond the route name', async () => {
    const { toJSON } = await render(<RoutePlaceholder route="toolEmf" />);
    const root = toJSON();
    if (root === null || !isElement(root)) {
      throw new Error('RoutePlaceholder rendered no element tree');
    }
    expect(textContent(root)).toBe('EMF');
  });
});
