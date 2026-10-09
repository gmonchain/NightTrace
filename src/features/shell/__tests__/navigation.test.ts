import { TAB_IDS } from '@/ui/components/TabBar';

import {
  NAVIGATION_INVARIANTS,
  REAL_SCREEN_IDS,
  ROUTE_TREE,
  TAB_LABELS,
  TAB_ROUTES,
  TAB_ROUTE_NAMES,
  routeEntry,
  routeName,
  type RouteKey,
} from '../navigation';

/**
 * Story 1.8 — the navigation declaration (`src/features/shell/navigation.ts`).
 *
 * The declaration is the one source the shell and these suites read, so these
 * cases prove the acceptance criteria directly: the tab list is exactly the
 * four tabs (no Equipment, no Settings), every named surface is declared with a
 * presentation rule, and the five invariants are recorded as testable
 * statements.
 */

/** The ids that are real screens, not placeholders — the declaration's own set. */
const NON_PLACEHOLDER_IDS = new Set<RouteKey>(REAL_SCREEN_IDS);

describe('the four tabs', () => {
  it('is exactly HOME · INVESTIGATE · FIELD JOURNAL · PROFILE, in order', () => {
    expect(TAB_LABELS).toEqual([
      'HOME',
      'INVESTIGATE',
      'FIELD JOURNAL',
      'PROFILE',
    ]);
  });

  it('reads its labels from the TabBar primitive, never re-authored', () => {
    expect(TAB_LABELS).toEqual(TAB_IDS);
  });

  it('has no Equipment tab and no Settings tab', () => {
    expect(TAB_LABELS).not.toContain('EQUIPMENT');
    expect(TAB_LABELS).not.toContain('SETTINGS');
    expect(TAB_LABELS).toHaveLength(4);
  });

  it('maps every tab to exactly one route file', () => {
    expect(Object.keys(TAB_ROUTES).sort()).toEqual([...TAB_IDS].sort());
    expect(new Set(Object.values(TAB_ROUTES)).size).toBe(4);
    expect(TAB_ROUTE_NAMES).toEqual([
      'home',
      'investigate',
      'journal',
      'profile',
    ]);
  });
});

describe('the screen tree', () => {
  it('declares exactly the named surfaces, by group', () => {
    const counts = ROUTE_TREE.reduce<Record<string, number>>((acc, entry) => {
      acc[entry.group] = (acc[entry.group] ?? 0) + 1;
      return acc;
    }, {});
    expect(counts).toEqual({
      onboarding: 4,
      tabs: 4,
      hunt: 2,
      tools: 7,
      case: 3,
      sheets: 14,
      standalone: 1,
    });
  });

  it('gives every surface a unique id, a name, a path and a file', () => {
    const ids = ROUTE_TREE.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const entry of ROUTE_TREE) {
      expect(entry.name.length).toBeGreaterThan(0);
      expect(entry.path.startsWith('/')).toBe(true);
      expect(entry.file.length).toBeGreaterThan(0);
      expect(entry.file.endsWith('.tsx')).toBe(true);
    }
  });

  it('carries the four tabs on the tab route names the shell renders', () => {
    const tabRoutes = ROUTE_TREE.filter((entry) => entry.group === 'tabs').map(
      (entry) => entry.file,
    );
    for (const name of TAB_ROUTE_NAMES) {
      expect(tabRoutes).toContain(`(tabs)/${name}.tsx`);
    }
  });

  it('resolves a declared surface and its name by key', () => {
    expect(routeName('huntBrief')).toBe('HUNT BRIEF');
    expect(routeName('sessionShell')).toBe('SESSION SHELL');
    expect(routeEntry('caseReport').path).toBe('/case/[caseId]');
  });

  it('exposes the placeholder surfaces as the ones with declared names', () => {
    const placeholders = ROUTE_TREE.filter(
      (entry) => !NON_PLACEHOLDER_IDS.has(entry.id),
    );
    // The seven tools, the Hunt pair, the three Case surfaces, the four tab
    // placeholders (profile excepted) and the sheets all render a name.
    expect(placeholders.length).toBeGreaterThan(0);
    for (const entry of placeholders) {
      expect(entry.name).toBe(entry.name.toUpperCase());
    }
  });
});

describe('the five navigation invariants', () => {
  it('records exactly five, each a testable statement', () => {
    expect(NAVIGATION_INVARIANTS).toHaveLength(5);
    const ids = NAVIGATION_INVARIANTS.map((invariant) => invariant.id);
    expect(new Set(ids).size).toBe(5);
    for (const invariant of NAVIGATION_INVARIANTS) {
      expect(invariant.statement.length).toBeGreaterThan(0);
    }
  });

  it('records each invariant verbatim, so a later epic asserts the exact text', () => {
    // The statements are the contract a later epic's test asserts against, so
    // they are pinned by exact text (and id) — a substring check would pass on
    // a weakened statement.
    expect(
      Object.fromEntries(
        NAVIGATION_INVARIANTS.map((invariant) => [
          invariant.id,
          invariant.statement,
        ]),
      ),
    ).toEqual({
      'tools-one-gesture':
        'A live session is never more than one gesture from its tools.',
      'seal-and-file-offered':
        'There is no path that ends a session without offering SEAL & FILE.',
      'report-reachable':
        'The report is always reachable from the Journal, and always at the end of a session.',
      'no-dead-ends':
        'No dead ends — every empty state carries exactly one action.',
      'intensity-locked': 'Intensity is locked during a case.',
    });
  });
});
