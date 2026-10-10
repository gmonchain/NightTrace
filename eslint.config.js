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

/**
 * Story 2.2 — the content-validation tests' import ban.
 *
 * The §C.6 seeded sweep and the golden-seed replay fold the *shipped* content
 * (`src/data/**`) through the engine, so the content **test** tree must be able
 * to import the engine's stages. This is that one relaxation: the engine's
 * `ENGINE_MODELS_ONLY` patterns are filtered out of the Content ban for
 * `src/data/__tests__/**` alone. Shipment code under `src/data/**` still reaches
 * `engine/models` and nothing else (AD-1), and the boundary test keeps asserting
 * that `src/data/x.ts` cannot import `@/engine/InvestigationEngine`.
 */
const CONTENT_TEST_BAN = CONTENT_BAN.filter(
  (pattern) => !ENGINE_MODELS_ONLY.includes(pattern),
);

const CONTENT_TEST_ENGINE_MESSAGE =
  'Story 2.2: a content-validation test may fold the shipped content through ' +
  'the engine (the §C.6 seeded sweep and the golden replay). Shipment content ' +
  'under src/data/** still reaches engine/models only (AD-1).';

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

// --- AD-17: raw values are banned under the Shell block ----------------------
//
// Components read tokens from `src/ui/theme/tokens.ts` and never hard-code a
// raw value. The selectors are deliberately **neither anchored to a whole
// string nor an unbounded substring**:
//
//   * An anchored `^…$` match lets every compound style string through —
//     `'1px solid #0B140E'`, `'8px 12px'`, `'translateY(8px)'` — which is the
//     commonest hard-code shape in a React Native component.
//   * An unbounded substring match is worse: `'Case #123456'`, `'tag #abc123'`
//     and `'ID #ABCDEF'` are six-digit case references and hashtags, and
//     `'The 1950s were strange'` / `'made in the 70s'` are ordinary prose.
//     Flagging those would force `eslint-disable`s into UI copy, which is how a
//     gate gets switched off. (The three-digit `'Case #123'` / `'Room #4b2'` /
//     `'tag #abc'` forms are excluded by the 6/8-digit rule below, not by this
//     boundary; they are not what motivates it.)
//
// So every pattern carries a left boundary *and* a right boundary.
//
// The hex matcher requires its left boundary to be the **start of the literal or
// a value delimiter** (`=`, `:`, `,`, `(`, `[`, `{`, `;`) optionally followed by
// whitespace. That is what separates a hex *value* (`'#0B140E'`, `'(#0B140E)'`,
// `'color: #0B140E'`) from a hex preceded by an ordinary word and a space — a
// case reference or prose (`'Case #123456'`, `'tag #abc123'`, `'ID #ABCDEF'`).
// Its right boundary rejects a trailing hex digit.
//
// The hex matcher is **6- and 8-digit only**; the 3-digit `#rgb` form is
// deliberately excluded. A bare 3-digit literal (`'#123'`) is lexically
// identical to this product's case references, which the boundary requires stay
// clean, and `DESIGN.md` spells every colour as 6 or 8 digits — so 3-digit
// colours are not a shape the design source produces and matching them buys only
// false positives (AD-20: the design source settles the AC's wording).
//
// The `px`/`pt` and duration matchers keep a word-boundary left edge, because no
// required clean string contains a measurement: that is what catches
// `'0 0 10px #0B140E'` (whose `10px` is space-preceded) as well as the
// literal-start and delimiter-led forms.
//
// The duration matcher's **`s` half is start-of-literal only**. A space-preceded
// `s` duration is deliberately excluded, because it is lexically
// indistinguishable from a decade — `'the 1950s'` and `'transform 5s'` are the
// same shape — and the intent's own boundary requires `'1950s'`/`'70s'` stay
// clean. So `'5s'` (standalone) is rejected, while `'animation: 5s'`,
// `'breathe 5s'` and `'The 1950s were strange'` lint clean. The `ms` half keeps
// the word boundary, so `'240ms'` (and `'240MS'`) is rejected wherever it
// stands. Unit letters are matched case-insensitively (`'10PX'`, `'240MS'` are
// the same values as their lowercase forms).
//
// Out of scope, as the intent enumerates it: unitless numeric dimensions
// (`fontSize: 24`), `rgba()`/`hsl()` colour functions, `em`/`rem` lengths,
// interpolated durations (`` `${240}ms` ``), and raw values in JSX text children
// (the selectors target `Literal`/`TemplateElement`, so `<Text>The 1950s</Text>`
// is not visible to them).
//
// Reach: the selectors ride in the shared Shell block, so they fire under
// `src/services/**`, `src/features/**`, `src/ui/**` and `src/store/**` — wider
// than the AC's `src/ui/**` wording, and deliberately so (a stricter gate harms
// no consumer). They are re-permitted for `src/ui/theme/tokens.ts` alone and for
// `__tests__` files under those four directories.

const HEX_COLOUR = '(^|[=:,(\\[{;]\\s*)#[0-9a-fA-F]{6}(?:[0-9a-fA-F]{2})?(?![0-9a-fA-F])';
const PX_DIMENSION = '\\b\\d+(?:\\.\\d+)?(?:[pP][xX]|[pP][tT])\\b';
const DURATION = '(?:\\b\\d+(?:\\.\\d+)?[mM][sS]\\b|^\\d+(?:\\.\\d+)?[sS]\\b)';

const AD17_MESSAGE =
  'AD-17: components read tokens from src/ui/theme/tokens.ts and never ' +
  'hard-code a raw value. This file is under the Shell block (src/services/**, ' +
  'src/features/**, src/ui/**, src/store/**), where a raw hex colour, a raw ' +
  'px/pt dimension and a literal millisecond duration are banned. Substitute ' +
  'colors.*, typography.*, spacing.*, rounded.*, motion.*, components.*, ' +
  'filters.*, fontFamilies.* or theme.*. Only src/ui/theme/tokens.ts and ' +
  '__tests__ files under those directories are exempt.';

/** The three banned value shapes, each with the shape name its message names. */
const AD17_PATTERNS = [
  { name: 'hex colour', pattern: HEX_COLOUR },
  { name: 'px/pt dimension', pattern: PX_DIMENSION },
  { name: 'literal duration', pattern: DURATION },
];

/**
 * Both halves of each family: a plain `Literal` and a template literal's
 * `TemplateElement`. A rule with one half only is a rule a template-literal
 * hard-code walks straight past.
 */
const AD17_SELECTORS = AD17_PATTERNS.flatMap(({ name, pattern }) => [
  {
    selector: `Literal[value=/${pattern}/]`,
    message: `${AD17_MESSAGE} (${name})`,
  },
  {
    selector: `TemplateElement[value.raw=/${pattern}/]`,
    message: `${AD17_MESSAGE} (${name})`,
  },
]);

/**
 * The `__tests__` exemption, spelled out rather than globbed as a bare
 * `src/<anything>` so it reaches only the four directories the Shell block
 * governs. Flat-config is last-match-wins and this block *replaces*
 * `no-restricted-syntax` for every path it matches, so a whole-tree glob would
 * silently delete the engine block's `Math.random` selector (AD-1) for engine
 * test files and re-impose the SQL ban on the repository test files (AD-12's
 * allowlist). Enumerated here to make that reach unmistakable.
 */
const AD17_EXEMPT_FILES = [
  'src/services/**/__tests__/**/*.{ts,tsx}',
  'src/features/**/__tests__/**/*.{ts,tsx}',
  'src/ui/**/__tests__/**/*.{ts,tsx}',
  'src/store/**/__tests__/**/*.{ts,tsx}',
];

/** The token module alone — never the whole `src/ui/theme/**` directory. */
const AD17_EXEMPT_TOKEN_FILE = ['src/ui/theme/tokens.ts'];

// --- Story 1.6: the onboarding path requests no permission, reads no sensor --
//
// The epic's zero-permission playability constraint promises every onboarding
// screen renders with nothing granted and requests nothing before it is needed,
// so the one way a screen could break that is by importing a sensor,
// permission, audio, camera or notification module. These two blocks ban exactly
// those modules on the onboarding feature files and routes.
//
// Each block declares only `no-restricted-imports`, so it replaces no
// `no-restricted-syntax` list: the Shell block's SQL / console / AD-17 selectors
// (for `src/features/onboarding/**`) and the route block's SQL / console
// selectors (for `src/app/(onboarding)/**`) both stay in force.
const ONBOARDING_FEATURE = ['src/features/onboarding/**/*.{ts,tsx}'];
const ONBOARDING_ROUTES = ['src/app/(onboarding)/**/*.{ts,tsx}'];

// --- Story 1.7: the Profile→About path requests no permission, reads no sensor -
//
// The zero-permission playability constraint covers the About path too: a user
// who reaches About with nothing granted must see every screen render and no
// prompt. The same closed module list the onboarding path bans is extended to
// the About/Profile feature files and routes, so the AC's claim is a gate rather
// than a comment. `ONBOARDING_MODULE_BAN` is reused verbatim — it is the sensor/
// permission/audio/camera/notification set the constraint names, not an
// onboarding-specific list.
//
// The route scope is the **three files actually on the Profile→About path** —
// the About sheet, the Profile route, and the placeholder home that links to
// Profile — not whole groups. Banning all of `src/app/(modals)/**` and
// `src/app/(tabs)/**` would be a gate far wider than the story's claim: the
// arch spine gives `(modals)` the product's permissions sheet (which *must*
// request a permission) and `(tabs)` INVESTIGATE / FIELD JOURNAL (which later
// epics give sensors), and those legitimate imports must not be blocked here.
// `src/app/index.tsx` is included because it is on the path and is the file the
// story modifies; it was previously outside the scope entirely.
const ABOUT_PROFILE_FEATURE = [
  'src/features/about/**/*.{ts,tsx}',
  'src/features/profile/**/*.{ts,tsx}',
];
const ABOUT_PROFILE_ROUTES = [
  'src/app/(modals)/about.tsx',
  'src/app/(tabs)/profile.tsx',
  'src/app/index.tsx',
];

const ONBOARDING_MODULE_BAN = [
  'expo-sensors',
  'expo-sensors/*',
  'expo-sensors/**',
  'expo-location',
  'expo-location/*',
  'expo-location/**',
  'expo-camera',
  'expo-camera/*',
  'expo-camera/**',
  'expo-av',
  'expo-av/*',
  'expo-av/**',
  'expo-audio',
  'expo-audio/*',
  'expo-audio/**',
  'expo-notifications',
  'expo-notifications/*',
  'expo-notifications/**',
];

const ONBOARDING_NO_PERMISSION_MESSAGE =
  'Story 1.6: the onboarding path requests no permission and reads no sensor. ' +
  'A screen on this path may not import expo-sensors, expo-location, ' +
  'expo-camera, expo-av, expo-audio or expo-notifications.';

const ABOUT_NO_PERMISSION_MESSAGE =
  'Story 1.7: the Profile-to-About path requests no permission and reads no ' +
  'sensor. A screen on this path may not import expo-sensors, expo-location, ' +
  'expo-camera, expo-av, expo-audio or expo-notifications.';

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
  // (Consistency Conventions, AD-30). AD-17's raw-value selectors ride in this
  // block, so they fire under every one of these directories; the two blocks
  // below re-permit them for the token module and for `__tests__` files.
  {
    files: ['src/services/**/*.{ts,tsx}', 'src/features/**/*.{ts,tsx}', 'src/ui/**/*.{ts,tsx}', 'src/store/**/*.{ts,tsx}'],
    rules: {
      'no-console': 'error',
      'no-restricted-syntax': [
        'error',
        ...SQL_SELECTORS,
        CONSOLE_SYNTAX_SELECTOR,
        ...AD17_SELECTORS,
      ],
    },
  },

  // AD-17's re-permit is scoped to the token module alone — never the whole
  // `src/ui/theme/**` directory — so a component placed beside `tokens.ts`
  // cannot escape the ban. Because last-match-wins replaces the list wholesale,
  // the SQL and console selectors are re-included here.
  {
    files: AD17_EXEMPT_TOKEN_FILE,
    rules: {
      'no-restricted-syntax': [
        'error',
        ...SQL_SELECTORS,
        CONSOLE_SYNTAX_SELECTOR,
      ],
    },
  },

  // AD-17 targets shipped components; a `__tests__` file's job is to hold
  // literal values as fixtures (the sync test carries `'#FFFFFF'` and `'900ms'`
  // precisely to drive the drift path). Without this exemption the rule would
  // forbid its own gate. The `files` globs reach only the four directories the
  // Shell block governs, so the engine block's `Math.random` selector (AD-1) and
  // the repository allowlist (AD-12) are untouched.
  {
    files: AD17_EXEMPT_FILES,
    rules: {
      'no-restricted-syntax': [
        'error',
        ...SQL_SELECTORS,
        CONSOLE_SYNTAX_SELECTOR,
      ],
    },
  },

  // Logger is the one file permitted to log; both console rules are lifted for
  // it alone. It is still a Shell path, so its block must re-include
  // `...AD17_SELECTORS` — declared last, it replaces the Shell block's list
  // wholesale, and omitting them would let `src/services/Logger.ts` escape AD-17
  // while every description claims the Shell block covers it.
  {
    files: CONSOLE_EXEMPT_FILES,
    rules: {
      'no-console': 'off',
      'no-restricted-syntax': [
        'error',
        ...SQL_SELECTORS,
        ...AD17_SELECTORS,
      ],
    },
  },

  // Story 1.6: the onboarding feature files gain only the sensor/permission
  // import ban. They carried no `no-restricted-imports` before, so this replaces
  // nothing, and their SQL / console / AD-17 syntax selectors are untouched.
  {
    files: ONBOARDING_FEATURE,
    rules: {
      'no-restricted-imports': importBan(
        ONBOARDING_MODULE_BAN,
        ONBOARDING_NO_PERMISSION_MESSAGE,
      ),
    },
  },

  // The onboarding routes: declaring `no-restricted-imports` here replaces the
  // route block's AD-12 ban (same rule id) for these files, so its engine/db
  // patterns are re-included alongside the sensor ban — last-match-wins.
  {
    files: ONBOARDING_ROUTES,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ONBOARDING_MODULE_BAN,
              message: ONBOARDING_NO_PERMISSION_MESSAGE,
            },
            {
              group: ['@/engine/**', '**/engine/**', '@/db/**', '**/db/**'],
              message: AD12_IMPORT_MESSAGE,
            },
          ],
        },
      ],
    },
  },

  // Story 1.7: the About/Profile feature files gain only the sensor/permission
  // import ban. Like the onboarding feature files they carried no
  // `no-restricted-imports` before — the Shell block declares only
  // `no-restricted-syntax` — so this replaces nothing and their SQL / console /
  // AD-17 syntax selectors are untouched.
  {
    files: ABOUT_PROFILE_FEATURE,
    rules: {
      'no-restricted-imports': importBan(
        ONBOARDING_MODULE_BAN,
        ABOUT_NO_PERMISSION_MESSAGE,
      ),
    },
  },

  // The About/Profile routes: declaring `no-restricted-imports` here replaces
  // the route block's AD-12 ban (same rule id) for these files, so its
  // engine/db patterns are re-included alongside the sensor ban —
  // last-match-wins, exactly as the onboarding routes block does.
  {
    files: ABOUT_PROFILE_ROUTES,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ONBOARDING_MODULE_BAN,
              message: ABOUT_NO_PERMISSION_MESSAGE,
            },
            {
              group: ['@/engine/**', '**/engine/**', '@/db/**', '**/db/**'],
              message: AD12_IMPORT_MESSAGE,
            },
          ],
        },
      ],
    },
  },

  // Story 2.2: the content-validation tests fold the shipped content through
  // the engine, so the engine's stages are re-permitted for `src/data/__tests__/**`
  // alone (see `CONTENT_TEST_BAN`). Everything else the Content ban rejects —
  // react, expo, the Shell, the sensors — still applies here. Declared last so
  // it wins over the Content block for these files (flat-config last-match-wins);
  // the SQL and console syntax selectors are re-included because declaring the
  // block replaces the inherited `no-restricted-syntax` list.
  {
    files: ['src/data/__tests__/**/*.{ts,tsx}'],
    rules: {
      'no-console': 'error',
      'no-restricted-imports': importBan(
        CONTENT_TEST_BAN,
        CONTENT_TEST_ENGINE_MESSAGE,
      ),
      'no-restricted-syntax': ['error', ...SQL_SELECTORS, CONSOLE_SYNTAX_SELECTOR],
    },
  },
]);
