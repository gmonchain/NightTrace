const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

/**
 * Boundary rules for NightTrace. These encode architecture decisions, not style
 * preferences; each message names the AD it enforces so a violation is
 * self-explaining (ARCHITECTURE-SPINE.md AD-1, AD-12).
 *
 * The deliberately-violating fixtures under `__boundary_fixtures__/` are
 * excluded from the `lint` script's glob — not from this config — so the
 * boundary test can lint them here and assert they are rejected.
 */

const ENGINE = ['src/engine/**/*.{ts,tsx}'];
const SENSORS = ['src/sensors/**/*.{ts,tsx}'];
const CONTENT = ['src/data/**/*.{ts,tsx}', 'src/db/**/*.{ts,tsx}'];
const APP = ['src/app/**/*.{ts,tsx}'];
const SOURCE = ['src/**/*.{ts,tsx}'];

/** `src/db/repositories/**` is AD-12's allowlisted SQL path. */
const REPOSITORIES = ['src/db/repositories/**/*.{ts,tsx}'];

const AD1_IMPORT_MESSAGE =
  'AD-1: the engine is a pure function. src/engine/** may import only engine/** ' +
  'and dependency-free TypeScript - no react, react-native, expo*, or zustand. ' +
  'The shell owns all I/O.';

const AD1_LAYER_MESSAGE =
  'AD-1: dependency arrows point only downward in the Core / Input adaptation ' +
  '/ Content / Shell table. This import reaches a layer above the one it lives in.';

const AD1_CLOCK_MESSAGE =
  'AD-1: the engine reads no wall clock. The host supplies SessionMs and ' +
  'TickIndex, each carrying its own timestamp; Date and performance.now() are ' +
  'unavailable under src/engine/**.';

const AD1_RANDOM_MESSAGE =
  'AD-1: the engine draws no global random source. Randomness is ' +
  'RandomEngine.fork(label); Math.random() is banned under src/engine/**.';

const AD12_SQL_MESSAGE =
  'AD-12: SQL string literals exist only under src/db/repositories/**. Routes ' +
  'own no data access - a screen composes components and calls a service.';

const AD12_IMPORT_MESSAGE =
  'AD-12: routes own no data access and no engine calls. src/app/** may not ' +
  'import db/** or engine/**; compose components and call a service instead.';

const AD30_CONSOLE_MESSAGE =
  'AD-30 / Consistency Conventions (Logging): src/services/Logger.ts is the ' +
  'only module that logs. No console.* outside it - logs never carry evidence ' +
  'content, coordinates, or free text, and Logger is the type that enforces it.';

// --- The four-layer import table (ARCHITECTURE-SPINE.md, Design Paradigm) ---
//
// | Layer            | Directory                                        | May import                    |
// | Core (pure)      | src/engine/**                                    | engine/** and pure TS only    |
// | Input adaptation | src/sensors/**                                   | native sensor APIs, models    |
// | Content          | src/data/**, src/db/**                           | zod, models                   |
// | Shell            | src/services/**, src/features/**, src/ui/**, src/app/** | everything             |
//
// Every group below names the layers a file may NOT reach. Because flat-config
// `no-restricted-imports` patterns are matched with last-match-wins, a trailing
// `!` pattern re-permits a narrower specifier (the same mechanism that keeps
// `src/services/Logger.ts` importable from the Content layer).

const REACT_PACKAGES = [
  'react',
  'react/*',
  'react-dom',
  'react-dom/*',
  'react-native',
  'react-native/*',
  'react-native-*',
];

const STATE_PACKAGE = ['zustand', 'zustand/*'];

/** The Shell layer, importable by nothing below it. */
const SHELL_SOURCES = [
  '@/services/**',
  '**/services/**',
  '@/features/**',
  '**/features/**',
  '@/ui/**',
  '**/ui/**',
  '@/app/**',
  '**/app/**',
  '@/store/**',
  '**/store/**',
];

const SENSOR_SOURCES = ['@/sensors/**', '**/sensors/**'];
const CONTENT_SOURCES = ['@/data/**', '**/data/**', '@/db/**', '**/db/**'];

/**
 * The Content layer may reach only `engine/models`, not the engine's top-level
 * stages. `@/engine/*` matches `@/engine/models`, so the negation re-permits it.
 */
const ENGINE_MODELS_ONLY = [
  '@/engine/*',
  '**/engine/*',
  '!@/engine/models',
  '!@/engine/models/**',
  '!**/engine/models',
  '!**/engine/models/**',
];

/**
 * Content's edge to the Shell is exactly one module: `services/Logger`
 * (Consistency Conventions' Config + Logging rows require it, since `db/kv.ts`
 * must log a parse failure and no other module may). Every other Shell import
 * is upward and rejected.
 */
const CONTENT_SHELL_EDGE = [
  '@/services/**',
  '!@/services/Logger',
  '**/services/**',
  '!**/services/Logger',
  '@/features/**',
  '**/features/**',
  '@/ui/**',
  '**/ui/**',
  '@/app/**',
  '**/app/**',
  '@/store/**',
  '**/store/**',
];

const ENGINE_BAN = [
  ...REACT_PACKAGES,
  'expo',
  'expo/*',
  'expo-*',
  'expo-*/**',
  ...STATE_PACKAGE,
  ...SHELL_SOURCES,
  ...SENSOR_SOURCES,
  ...CONTENT_SOURCES,
];

/**
 * Input adaptation runs on native sensor APIs only, so `expo-sensors` and
 * `expo-location` are re-permitted out of the general `expo-*` ban.
 */
const SENSORS_BAN = [
  ...REACT_PACKAGES,
  'expo',
  'expo/*',
  'expo-*',
  'expo-*/**',
  '!expo-sensors',
  '!expo-sensors/*',
  '!expo-sensors/**',
  '!expo-location',
  '!expo-location/*',
  '!expo-location/**',
  ...STATE_PACKAGE,
  ...SHELL_SOURCES,
  // Content sits above Input adaptation, so `@/data/**` and `@/db/**` are
  // upward arrows and must be rejected here too.
  ...CONTENT_SOURCES,
  // Input adaptation may import itself (internal modules).
  ...SENSOR_SOURCES,
  ...ENGINE_MODELS_ONLY,
];

/**
 * Content persists through `expo-sqlite` — the spine's Persistence row — so
 * `expo-sqlite` is the one expo module re-permitted here. Everything else
 * upward is rejected.
 */
const CONTENT_BAN = [
  ...REACT_PACKAGES,
  'expo',
  'expo/*',
  'expo-*',
  'expo-*/**',
  '!expo-sqlite',
  '!expo-sqlite/*',
  '!expo-sqlite/**',
  ...STATE_PACKAGE,
  ...CONTENT_SHELL_EDGE,
  ...SENSOR_SOURCES,
  ...ENGINE_MODELS_ONLY,
];

/** AD-1's random source. `Math.floor` and friends stay legal; this one call does not. */
const ENGINE_SYNTAX = [
  {
    selector:
      'CallExpression[callee.object.name="Math"][callee.property.name="random"]',
    message: AD1_RANDOM_MESSAGE,
  },
];

/**
 * The console ban. `no-console` (DECLARED_CONSOLE_RULE) is the documented rule
 * the eslint-config-expo baseline may special-case; this AD-named selector is
 * the one the boundary test asserts on, so a violation reports *why* rather
 * than a bare "unexpected console". Both are declared for the same files.
 */
const CONSOLE_SYNTAX_SELECTOR = {
  selector: 'CallExpression[callee.object.name="console"]',
  message: AD30_CONSOLE_MESSAGE,
};

/** The one file permitted to log. */
const CONSOLE_EXEMPT_FILES = ['src/services/Logger.ts'];

/**
 * AD-12's SQL containment.
 *
 * The selector matches a SQL *statement*, not any sentence whose first word is a
 * keyword. Requiring statement grammar after the keyword is what lets ordinary
 * UI copy through — `'Select a night to investigate'`, `'Delete my data'`,
 * `'Create a new case'`, `'Update your intention'`, `'Replace this note'` and
 * `'With your permission'` must all lint clean, because Stories 1.6 and 1.7
 * exist to author exactly that copy. `Literal` catches a plain string;
 * `TemplateElement` catches a template literal.
 *
 * SELECT additionally requires a projection and a FROM clause: `SELECT` alone
 * is a verb before "a night to investigate", and only the FROM marks it a
 * statement.
 */
const SQL_STATEMENT_GRAMMAR =
  '^\\s*(' +
  'SELECT\\s+\\S(.|\\n)*\\bFROM\\b' +
  '|INSERT\\s+INTO\\b' +
  '|UPDATE\\s+\\S+\\s+SET\\b' +
  '|DELETE\\s+FROM\\b' +
  '|CREATE\\s+(TABLE|INDEX|VIEW|TRIGGER|UNIQUE)\\b' +
  '|DROP\\s+(TABLE|INDEX|VIEW|TRIGGER)\\b' +
  '|ALTER\\s+TABLE\\b' +
  '|PRAGMA\\s+\\w' +
  '|WITH\\s+\\S+\\s+AS\\b' +
  '|REPLACE\\s+INTO\\b' +
  ')';

const SQL_SELECTORS = [
  {
    selector: `Literal[value=/${SQL_STATEMENT_GRAMMAR}/i]`,
    message: AD12_SQL_MESSAGE,
  },
  {
    selector: `TemplateElement[value.raw=/${SQL_STATEMENT_GRAMMAR}/i]`,
    message: AD12_SQL_MESSAGE,
  },
];

/** `no-restricted-imports` entry for one layer's banned-specifier group. */
function importBan(group, message) {
  return [
    'error',
    {
      patterns: [{ group, message }],
    },
  ];
}

module.exports = defineConfig([
  ...expoConfig,

  {
    ignores: [
      'node_modules/',
      '.expo/',
      'dist/',
      'web-build/',
      'coverage/',
      'ios/',
      'android/',
      // Planning artifacts and the imported UX prototype are not application
      // source; `src/**` is the only linted tree.
      '_bmad/',
      '_bmad-output/',
      'docs/',
      'fastlane/',
    ],
  },

  // AD-12: SQL is confined to the repository layer. Applied across the source
  // tree, then narrowed off for repositories. The console ban rides alongside:
  // `no-restricted-syntax` is replaced wholesale by each later layer block, so
  // every block that overrides it re-includes the console selector.
  {
    files: SOURCE,
    ignores: REPOSITORIES,
    rules: {
      'no-console': 'error',
      'no-restricted-syntax': ['error', ...SQL_SELECTORS],
    },
  },

  // AD-1: the engine is pure. Listed after the SQL block so the engine's own
  // rule set (imports + globals + syntax) replaces the SQL-only set for
  // engine files.
  {
    files: ENGINE,
    rules: {
      'no-console': 'error',
      'no-restricted-imports': importBan(ENGINE_BAN, AD1_IMPORT_MESSAGE),
      // The engine's clock is SessionMs/TickIndex supplied by the host, so the
      // wall-clock `Date` constructor and `performance` have no pure use here.
      'no-restricted-globals': [
        'error',
        { name: 'Date', message: AD1_CLOCK_MESSAGE },
        { name: 'performance', message: AD1_CLOCK_MESSAGE },
      ],
      'no-restricted-syntax': [
        'error',
        ...ENGINE_SYNTAX,
        ...SQL_SELECTORS,
        CONSOLE_SYNTAX_SELECTOR,
      ],
    },
  },

  // AD-1: Input adaptation sits above Core. It reaches native sensor APIs and
  // `engine/models`, and nothing in the Shell or Content layers.
  {
    files: SENSORS,
    rules: {
      'no-console': 'error',
      'no-restricted-imports': importBan(SENSORS_BAN, AD1_LAYER_MESSAGE),
      'no-restricted-syntax': ['error', ...SQL_SELECTORS, CONSOLE_SYNTAX_SELECTOR],
    },
  },

  // AD-1: Content sits above Input adaptation. It reaches zod and
  // `engine/models`; its one edge into the Shell is `services/Logger`.
  {
    files: CONTENT,
    rules: {
      'no-console': 'error',
      'no-restricted-imports': importBan(CONTENT_BAN, AD1_LAYER_MESSAGE),
      'no-restricted-syntax': ['error', ...SQL_SELECTORS, CONSOLE_SYNTAX_SELECTOR],
    },
  },

  // The repository allowlist narrows only the SQL rule off; the console ban and
  // the console selector still apply under src/db/repositories/**.
  {
    files: REPOSITORIES,
    rules: {
      'no-console': 'error',
      'no-restricted-syntax': ['error', CONSOLE_SYNTAX_SELECTOR],
    },
  },

  // AD-12: a route owns no data access and no engine calls. The `**/…/**`
  // globs match relative specifiers (`../db/kv`, `./engine/…`) as well as the
  // `@/` alias, because a route is free to import without the alias.
  {
    files: APP,
    rules: {
      'no-console': 'error',
      'no-restricted-imports': importBan(
        ['@/engine/**', '**/engine/**', '@/db/**', '**/db/**'],
        AD12_IMPORT_MESSAGE,
      ),
      'no-restricted-syntax': ['error', ...SQL_SELECTORS, CONSOLE_SYNTAX_SELECTOR],
    },
  },

  // The Shell's remaining directories — Logger is the only module that logs
  // (Consistency Conventions, AD-30).
  {
    files: ['src/services/**/*.{ts,tsx}', 'src/features/**/*.{ts,tsx}', 'src/ui/**/*.{ts,tsx}', 'src/store/**/*.{ts,tsx}'],
    rules: {
      'no-console': 'error',
      'no-restricted-syntax': ['error', ...SQL_SELECTORS, CONSOLE_SYNTAX_SELECTOR],
    },
  },

  // Logger is the one file permitted to log; both console rules are lifted for
  // it alone, and it keeps the SQL and clock rules every source file carries.
  {
    files: CONSOLE_EXEMPT_FILES,
    rules: {
      'no-console': 'off',
      'no-restricted-syntax': ['error', ...SQL_SELECTORS],
    },
  },
]);
