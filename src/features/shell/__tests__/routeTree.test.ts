import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

import { REAL_SCREEN_IDS, ROUTE_TREE, type RouteKey } from '../navigation';

/**
 * Story 1.8 — the declared route tree on disk, and the presentation rules.
 *
 * `TREE_DECLARED`: every surface `navigation.ts` declares exists as a route file
 * under `src/app/`. `TAB_BAR_ABSENT` (structural half): Hunt and Session live
 * outside `(tabs)`, so the tab bar cannot render there. The presentation rules
 * are read straight off the declaration.
 */

const APP_DIR = path.resolve(__dirname, '..', '..', '..', 'app');

/** The ids that are real screens, not placeholders — the declaration's own set. */
const NON_PLACEHOLDER_IDS = new Set<RouteKey>(REAL_SCREEN_IDS);

describe('every declared surface exists as a route file', () => {
  it.each(ROUTE_TREE.map((entry) => [entry.id, entry.file] as const))(
    'declares %s at src/app/%s',
    (_id, file) => {
      expect(existsSync(path.join(APP_DIR, file))).toBe(true);
    },
  );

  it('declares no route file under src/app that the tree does not name', () => {
    // A file the declaration does not name is a surface the IA has no slot for
    // (test files and `_layout` files excepted).
    const declared = new Set(ROUTE_TREE.map((entry) => entry.file));
    const onDisk = collectRouteFiles(APP_DIR).filter(
      (file) =>
        !declared.has(file) &&
        // Layouts are not surfaces, and the root `index.tsx` is Story 1.6's
        // first-launch gate (it owns `/`), which is not part of the screen tree.
        !file.endsWith('_layout.tsx') &&
        file !== 'index.tsx',
    );
    expect(onDisk).toEqual([]);
  });
});

describe('the placeholder routes render their declared name', () => {
  const placeholders = ROUTE_TREE.filter(
    (entry) => !NON_PLACEHOLDER_IDS.has(entry.id),
  );

  it.each(placeholders.map((entry) => [entry.id, entry.file] as const))(
    'wires %s to RoutePlaceholder with its key',
    (id, file) => {
      const source = readFileSync(path.join(APP_DIR, file), 'utf8');
      expect(source).toContain('RoutePlaceholder');
      expect(source).toContain(`route="${id}"`);
    },
  );
});

describe('the presentation rules', () => {
  it('keeps Hunt and Session outside (tabs), with no tab bar', () => {
    for (const entry of ROUTE_TREE.filter((e) => e.group === 'hunt')) {
      expect(entry.presentation.tabBar).toBe('hidden');
      expect(entry.file.startsWith('(tabs)/')).toBe(false);
    }
  });

  it('shows the persistent tab bar only on the four tabs', () => {
    for (const entry of ROUTE_TREE) {
      if (entry.group === 'tabs') {
        expect(entry.presentation.kind).toBe('tab');
        expect(entry.presentation.tabBar).toBe('visible');
        expect(entry.file.startsWith('(tabs)/')).toBe(true);
      } else {
        // A non-tab never shows the bar: it is `hidden` (covers the bar) or
        // `absent` (a navigator with no bar). The two are asserted exactly
        // below rather than conflated.
        expect(['hidden', 'absent']).toContain(entry.presentation.tabBar);
      }
    }
  });

  it('marks the navigators that have no tab bar at all as absent', () => {
    for (const entry of ROUTE_TREE.filter(
      (e) => e.group === 'onboarding' || e.group === 'standalone',
    )) {
      expect(entry.presentation.tabBar).toBe('absent');
    }
  });

  it('marks the surfaces that cover the bar as hidden', () => {
    for (const entry of ROUTE_TREE.filter(
      (e) => e.group === 'hunt' || e.group === 'tools' || e.group === 'case' || e.group === 'sheets',
    )) {
      expect(entry.presentation.tabBar).toBe('hidden');
    }
  });

  it('pushes every tool above the session, one full-screen surface at a time', () => {
    const tools = ROUTE_TREE.filter((e) => e.group === 'tools');
    expect(tools).toHaveLength(7);
    for (const entry of tools) {
      expect(entry.presentation.kind).toBe('push');
      expect(entry.presentation.aboveSession).toBe(true);
      // Inside the session stack, so a tool pushes above the live session.
      expect(entry.file.startsWith('session/tools/')).toBe(true);
    }
  });

  it('makes the Case Report a destination, never a modal', () => {
    const report = ROUTE_TREE.find((e) => e.id === 'caseReport');
    expect(report?.presentation.kind).toBe('push');
    for (const entry of ROUTE_TREE.filter((e) => e.group === 'case')) {
      expect(entry.presentation.kind).toBe('push');
    }
  });

  it('presents the fourteen sheets as sheets', () => {
    const sheets = ROUTE_TREE.filter((e) => e.group === 'sheets');
    expect(sheets).toHaveLength(14);
    for (const entry of sheets) {
      expect(entry.presentation.kind).toBe('sheet');
      expect(entry.file.startsWith('(modals)/')).toBe(true);
    }
  });
});

/** Every `.tsx` route file under `src/app/`, relative to `src/app/`. */
function collectRouteFiles(directory: string): readonly string[] {
  const files: string[] = [];
  const visit = (dir: string): void => {
    for (const name of readdirSync(dir)) {
      const full = path.join(dir, name);
      if (statSync(full).isDirectory()) {
        if (name !== '__tests__' && name !== '__boundary_fixtures__') {
          visit(full);
        }
      } else if (name.endsWith('.tsx')) {
        files.push(path.relative(APP_DIR, full));
      }
    }
  };
  visit(directory);
  return files;
}
