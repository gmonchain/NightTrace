/**
 * The navigation declaration (Story 1.8) — the one source the shell and its
 * tests read.
 *
 * This module is a *declaration*, not a screen: it names the four tabs, maps
 * each to the route file inside `(tabs)/`, records the product's whole screen
 * tree with each surface's presentation rule, and states the five navigation
 * invariants. The shell layout (`src/app/(tabs)/_layout.tsx`) reads
 * `TAB_ROUTES` to render exactly four tabs; the placeholder routes read
 * `ROUTE_TREE` (through `RoutePlaceholder`) for the name they render; and the
 * suite reads all of it, so a fifth tab or a missing surface is a failing test
 * rather than a silent drift.
 *
 * The labels are **read from the `TabBar` primitive's own `TAB_IDS`**, never
 * re-authored here — the IA's vocabulary lives in one place (AD-29).
 *
 * Sources: `EXPERIENCE.md` (the four tabs, the full screen tree, the
 * presentation table, the five invariants, the anti-patterns) and
 * `ARCHITECTURE-SPINE.md` AD-29 + the Structural Seed. No surface declared
 * here is built by this story: every route renders a placeholder, and none
 * reads a sensor, a permission or the network.
 */

import { TAB_IDS, type TabId } from '@/ui/components/TabBar';

/** The four tab labels, in the IA's own order — read from `TabBar.TAB_IDS`. */
export const TAB_LABELS: readonly TabId[] = TAB_IDS;

/** A tab's route-file name inside `(tabs)/`. */
export type TabRouteName = 'home' | 'investigate' | 'journal' | 'profile';

/**
 * The router for each tab: `TabId` → the route file's name inside `(tabs)/`.
 * Exhaustive over `TabId`, so a fifth tab is a compile error here *and* a
 * failing tab-list test.
 */
export const TAB_ROUTES: Readonly<Record<TabId, TabRouteName>> = {
  HOME: 'home',
  INVESTIGATE: 'investigate',
  'FIELD JOURNAL': 'journal',
  PROFILE: 'profile',
};

/** The four tab route names, in the IA's own order. */
export const TAB_ROUTE_NAMES: readonly TabRouteName[] = TAB_IDS.map(
  (id) => TAB_ROUTES[id],
);

/**
 * A surface's presentation *kind*.
 *
 * - `tab`   — one of the four tabs, held in the persistent tab bar.
 * - `push`  — pushed onto a stack (Hunt, Session, a tool, the Case surfaces,
 *             Field Note, onboarding).
 * - `sheet` — a transient modal sheet (the fourteen `(modals)` surfaces).
 */
export type PresentationKind = 'tab' | 'push' | 'sheet';

/**
 * Whether the tab bar renders while a surface is on top.
 *
 * - `visible` — the surface *is* a tab; the bar is on screen.
 * - `hidden`  — the surface covers where the bar would be (Hunt, Session,
 *               tools, the Case surfaces, the sheets).
 * - `absent`  — the surface lives in a navigator that has no tab bar at all
 *               (onboarding, Field Note, the root gate).
 */
export type TabBarVisibility = 'visible' | 'hidden' | 'absent';

export type RoutePresentation = {
  readonly kind: PresentationKind;
  readonly tabBar: TabBarVisibility;
  /** Tools push above the live Session, one full-screen surface at a time. */
  readonly aboveSession: boolean;
};

/** A surface's group in the screen tree — the acceptance criteria's own sets. */
export type RouteGroup =
  | 'onboarding'
  | 'tabs'
  | 'hunt'
  | 'tools'
  | 'case'
  | 'sheets'
  | 'standalone';

/** A stable key for every declared surface (the placeholder's `route` prop). */
export type RouteKey =
  | 'notice'
  | 'local'
  | 'night'
  | 'onboardingPermissions'
  | 'home'
  | 'investigate'
  | 'journal'
  | 'profile'
  | 'huntBrief'
  | 'sessionShell'
  | 'toolEmf'
  | 'toolRadar'
  | 'toolVoice'
  | 'toolEvp'
  | 'toolCamera'
  | 'toolTracker'
  | 'toolSky'
  | 'caseReport'
  | 'shareCard'
  | 'evidenceDetail'
  | 'sheetIntensity'
  | 'sheetLowPower'
  | 'sheetPermissions'
  | 'sheetTriage'
  | 'sheetConfirm'
  | 'sheetLeaveTheField'
  | 'sheetLowBattery'
  | 'sheetDirective'
  | 'sheetAnomaly'
  | 'sheetFieldNoteEditor'
  | 'sheetClearance'
  | 'sheetDeleteMyData'
  | 'sheetDiscardCase'
  | 'sheetAbout'
  | 'fieldNote';

/**
 * One declared surface: the name a placeholder renders, its router `path`, the
 * on-disk route `file` (relative to `src/app/`), its `group` in the screen tree,
 * and its `presentation` rule.
 *
 * `file` is what lets the route-tree test assert each surface actually exists
 * on disk without re-deriving expo-router's group-stripping from a path.
 */
export type RouteEntry = {
  readonly id: RouteKey;
  readonly name: string;
  readonly path: string;
  readonly file: string;
  readonly group: RouteGroup;
  readonly presentation: RoutePresentation;
};

// --- The presentation rules, named once --------------------------------------

/** A tab: the persistent tab bar shows. */
const TAB: RoutePresentation = {
  kind: 'tab',
  tabBar: 'visible',
  aboveSession: false,
};

/** A pushed surface with no tab bar (Hunt, Session, the Case surfaces). */
const PUSH: RoutePresentation = {
  kind: 'push',
  tabBar: 'hidden',
  aboveSession: false,
};

/** A pushed surface in a navigator that has no tab bar at all. */
const PUSH_ABSENT: RoutePresentation = {
  kind: 'push',
  tabBar: 'absent',
  aboveSession: false,
};

/** A tool: pushed above the live Session, one full-screen surface at a time. */
const TOOL: RoutePresentation = {
  kind: 'push',
  tabBar: 'hidden',
  aboveSession: true,
};

/** A sheet: a transient modal surface. */
const SHEET: RoutePresentation = {
  kind: 'sheet',
  tabBar: 'hidden',
  aboveSession: false,
};

/**
 * The surfaces that are real screens rather than this story's placeholders:
 * Story 1.6's four onboarding screens, Story 1.7's Profile and About. The
 * suites that separate "declared" from "placeholder" read this one set, so a
 * screen graduating from placeholder to real is a single edit.
 */
export const REAL_SCREEN_IDS: readonly RouteKey[] = [
  'notice',
  'local',
  'night',
  'onboardingPermissions',
  'profile',
  'sheetAbout',
];

/**
 * The four tab surfaces, derived from `TabBar`'s `TAB_IDS` — the IA's one
 * vocabulary — so a tab label is never re-authored here. The route and file
 * come from `TAB_ROUTES`; the label *is* the id.
 */
const TAB_ENTRIES: readonly RouteEntry[] = TAB_IDS.map((id) => {
  const route = TAB_ROUTES[id];
  return {
    id: route,
    name: id,
    path: `/${route}`,
    file: `(tabs)/${route}.tsx`,
    group: 'tabs' as const,
    presentation: TAB,
  };
});

/**
 * The whole screen tree, in `EXPERIENCE.md` order: onboarding (4), the four
 * tabs, the Hunt pair, the seven tools, the Case trio, the fourteen sheets and
 * the standalone Field Note. Every route is a placeholder this story adds,
 * except the onboarding screens (Story 1.6) and Profile/About (Story 1.7).
 */
export const ROUTE_TREE: readonly RouteEntry[] = [
  // --- Onboarding — four screens, one path, no tab bar ------------------------
  {
    id: 'notice',
    name: 'NOTICE',
    path: '/notice',
    file: '(onboarding)/notice.tsx',
    group: 'onboarding',
    presentation: PUSH_ABSENT,
  },
  {
    id: 'local',
    name: 'LOCAL',
    path: '/local',
    file: '(onboarding)/local.tsx',
    group: 'onboarding',
    presentation: PUSH_ABSENT,
  },
  {
    id: 'night',
    name: 'NIGHT',
    path: '/night',
    file: '(onboarding)/night.tsx',
    group: 'onboarding',
    presentation: PUSH_ABSENT,
  },
  {
    id: 'onboardingPermissions',
    name: 'PERMISSIONS',
    path: '/permissions',
    file: '(onboarding)/permissions.tsx',
    group: 'onboarding',
    presentation: PUSH_ABSENT,
  },

  // --- The four tabs — the persistent tab bar ---------------------------------
  ...TAB_ENTRIES,

  // --- The Hunt pair — pushed, tab bar hidden ---------------------------------
  {
    id: 'huntBrief',
    name: 'HUNT BRIEF',
    path: '/hunt/[huntId]/brief',
    file: 'hunt/[huntId]/brief.tsx',
    group: 'hunt',
    presentation: PUSH,
  },
  {
    id: 'sessionShell',
    name: 'SESSION SHELL',
    path: '/session',
    file: 'session/index.tsx',
    group: 'hunt',
    presentation: PUSH,
  },

  // --- The seven tools — pushed above the Session -----------------------------
  {
    id: 'toolEmf',
    name: 'EMF',
    path: '/session/tools/emf',
    file: 'session/tools/emf.tsx',
    group: 'tools',
    presentation: TOOL,
  },
  {
    id: 'toolRadar',
    name: 'RADAR',
    path: '/session/tools/radar',
    file: 'session/tools/radar.tsx',
    group: 'tools',
    presentation: TOOL,
  },
  {
    id: 'toolVoice',
    name: 'VOICE',
    path: '/session/tools/voice',
    file: 'session/tools/voice.tsx',
    group: 'tools',
    presentation: TOOL,
  },
  {
    id: 'toolEvp',
    name: 'EVP',
    path: '/session/tools/evp',
    file: 'session/tools/evp.tsx',
    group: 'tools',
    presentation: TOOL,
  },
  {
    id: 'toolCamera',
    name: 'CAMERA',
    path: '/session/tools/camera',
    file: 'session/tools/camera.tsx',
    group: 'tools',
    presentation: TOOL,
  },
  {
    id: 'toolTracker',
    name: 'TRACKER',
    path: '/session/tools/tracker',
    file: 'session/tools/tracker.tsx',
    group: 'tools',
    presentation: TOOL,
  },
  {
    id: 'toolSky',
    name: 'SKY',
    path: '/session/tools/sky',
    file: 'session/tools/sky.tsx',
    group: 'tools',
    presentation: TOOL,
  },

  // --- The Case trio — pushed destinations, never modals ----------------------
  {
    id: 'caseReport',
    name: 'CASE REPORT',
    path: '/case/[caseId]',
    file: 'case/[caseId]/index.tsx',
    group: 'case',
    presentation: PUSH,
  },
  {
    id: 'shareCard',
    name: 'SHARE CARD',
    path: '/case/[caseId]/share',
    file: 'case/[caseId]/share.tsx',
    group: 'case',
    presentation: PUSH,
  },
  {
    id: 'evidenceDetail',
    name: 'EVIDENCE DETAIL',
    path: '/case/[caseId]/evidence/[evidenceId]',
    file: 'case/[caseId]/evidence/[evidenceId].tsx',
    group: 'case',
    presentation: PUSH,
  },

  // --- The fourteen sheets — transient modal surfaces -------------------------
  {
    id: 'sheetIntensity',
    name: 'INTENSITY',
    path: '/intensity',
    file: '(modals)/intensity.tsx',
    group: 'sheets',
    presentation: SHEET,
  },
  {
    id: 'sheetLowPower',
    name: 'LOW POWER',
    path: '/low-power',
    file: '(modals)/low-power.tsx',
    group: 'sheets',
    presentation: SHEET,
  },
  {
    id: 'sheetPermissions',
    name: 'PERMISSIONS',
    // The onboarding Permissions screen (Story 1.6) owns `/permissions`, so the
    // sheet is disambiguated to `/permissions-sheet` — a plain
    // `(modals)/permissions.tsx` makes `/permissions` resolve to the sheet and
    // shadow onboarding. The sheet's declared *name* is unchanged.
    path: '/permissions-sheet',
    file: '(modals)/permissions-sheet.tsx',
    group: 'sheets',
    presentation: SHEET,
  },
  {
    id: 'sheetTriage',
    name: 'TRIAGE',
    path: '/triage',
    file: '(modals)/triage.tsx',
    group: 'sheets',
    presentation: SHEET,
  },
  {
    id: 'sheetConfirm',
    name: 'CONFIRM',
    path: '/confirm',
    file: '(modals)/confirm.tsx',
    group: 'sheets',
    presentation: SHEET,
  },
  {
    id: 'sheetLeaveTheField',
    name: 'LEAVE THE FIELD',
    path: '/leave-the-field',
    file: '(modals)/leave-the-field.tsx',
    group: 'sheets',
    presentation: SHEET,
  },
  {
    id: 'sheetLowBattery',
    name: 'LOW BATTERY OFFER',
    path: '/low-battery',
    file: '(modals)/low-battery.tsx',
    group: 'sheets',
    presentation: SHEET,
  },
  {
    id: 'sheetDirective',
    name: 'DIRECTIVE',
    path: '/directive',
    file: '(modals)/directive.tsx',
    group: 'sheets',
    presentation: SHEET,
  },
  {
    id: 'sheetAnomaly',
    name: 'ANOMALY',
    path: '/anomaly',
    file: '(modals)/anomaly.tsx',
    group: 'sheets',
    presentation: SHEET,
  },
  {
    id: 'sheetFieldNoteEditor',
    name: 'FIELD NOTE EDITOR',
    path: '/field-note-editor',
    file: '(modals)/field-note-editor.tsx',
    group: 'sheets',
    presentation: SHEET,
  },
  {
    id: 'sheetClearance',
    name: 'CLEARANCE',
    path: '/clearance',
    file: '(modals)/clearance.tsx',
    group: 'sheets',
    presentation: SHEET,
  },
  {
    id: 'sheetDeleteMyData',
    name: 'DELETE MY DATA',
    path: '/delete-my-data',
    file: '(modals)/delete-my-data.tsx',
    group: 'sheets',
    presentation: SHEET,
  },
  {
    id: 'sheetDiscardCase',
    name: 'DISCARD CASE',
    path: '/discard-case',
    file: '(modals)/discard-case.tsx',
    group: 'sheets',
    presentation: SHEET,
  },
  {
    id: 'sheetAbout',
    name: 'ABOUT & ENTERTAINMENT',
    path: '/about',
    file: '(modals)/about.tsx',
    group: 'sheets',
    presentation: SHEET,
  },

  // --- Standalone — its own mode, not a case, no report -----------------------
  {
    id: 'fieldNote',
    name: 'FIELD NOTE',
    path: '/field-note',
    file: 'field-note/index.tsx',
    group: 'standalone',
    presentation: PUSH_ABSENT,
  },
];

/** The declared surface for a key. Always present; the throw is unreachable. */
export function routeEntry(id: RouteKey): RouteEntry {
  const found = ROUTE_TREE.find((entry) => entry.id === id);
  if (found === undefined) {
    throw new Error(`navigation: no route declared for key "${id}"`);
  }
  return found;
}

/** A surface's declared name — what a placeholder renders. */
export function routeName(id: RouteKey): string {
  return routeEntry(id).name;
}

/**
 * A navigation invariant: an id and the statement a later epic asserts.
 * `EXPERIENCE.md`'s five are normative; each is a bug if violated.
 */
export type NavigationInvariant = {
  readonly id: string;
  readonly statement: string;
};

/**
 * The five navigation invariants, recorded as testable statements
 * (`EXPERIENCE.md` → Navigation invariants).
 */
export const NAVIGATION_INVARIANTS: readonly NavigationInvariant[] = [
  {
    id: 'tools-one-gesture',
    statement:
      'A live session is never more than one gesture from its tools.',
  },
  {
    id: 'seal-and-file-offered',
    statement:
      'There is no path that ends a session without offering SEAL & FILE.',
  },
  {
    id: 'report-reachable',
    statement:
      'The report is always reachable from the Journal, and always at the end of a session.',
  },
  {
    id: 'no-dead-ends',
    statement:
      'No dead ends — every empty state carries exactly one action.',
  },
  {
    id: 'intensity-locked',
    statement: 'Intensity is locked during a case.',
  },
];

/** The ids `ROUTE_TREE` actually declares. */
type DeclaredRouteKey = (typeof ROUTE_TREE)[number]['id'];

/** Asserts a condition at compile time — `Assert<false>` fails `tsc`. */
type Assert<T extends true> = T;

/**
 * Every `RouteKey` must have a `ROUTE_TREE` entry. A key added to the union
 * without an entry makes this `Assert<false>` and fails `tsc`, keeping the
 * runtime throw in `routeEntry` unreachable.
 */
export type _EveryRouteKeyDeclared = Assert<
  RouteKey extends DeclaredRouteKey ? true : false
>;
