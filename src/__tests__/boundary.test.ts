import { execFileSync } from 'node:child_process';
import path from 'node:path';

/**
 * The epics acceptance criteria test ESLint's *rejection* of the six boundary
 * violations, not its presence. Asserting a rule exists in config is weaker
 * than linting a real file that violates it.
 *
 * Each fixture under `__boundary_fixtures__/` violates exactly one boundary.
 * ESLint is invoked through its CLI over a single file, which is the same path
 * a developer's `npx eslint <file>` takes; parsing `--format json` keeps the
 * assertion on the rule id and the AD named in the message. The `lint` script
 * excludes these directories, so the real tree still passes while this test
 * fails loudly if a rule is ever removed.
 */

const ROOT = path.resolve(__dirname, '..', '..');
const ESLINT_BIN = path.join(ROOT, 'node_modules', 'eslint', 'bin', 'eslint.js');

type LintMessage = {
  readonly ruleId: string | null;
  readonly severity: 0 | 1 | 2;
  readonly message: string;
};

function runEslint(
  args: readonly string[],
  input?: string,
): readonly LintMessage[] {
  const parse = (stdout: string): readonly LintMessage[] => {
    const parsed: unknown = JSON.parse(stdout);
    const results = parsed as readonly { messages: readonly LintMessage[] }[];
    return results.flatMap((result) => result.messages);
  };
  const options = {
    cwd: ROOT,
    encoding: 'utf8' as const,
    stdio: ['pipe', 'pipe', 'pipe'] as ['pipe', 'pipe', 'pipe'],
  };
  try {
    return parse(
      execFileSync(process.execPath, [ESLINT_BIN, ...args], {
        ...options,
        ...(input === undefined ? {} : { input }),
      }),
    );
  } catch (error) {
    // ESLint exits non-zero when it reports an error; the JSON report is still
    // valid and is exactly what the callers assert on.
    return parse((error as { stdout?: string }).stdout ?? '');
  }
}

/** Run ESLint over a file. */
function lintFile(relativePath: string): readonly LintMessage[] {
  return runEslint([relativePath, '--format', 'json']);
}

/**
 * Lint source text as if it lived at `filename`. This exercises the path-scoped
 * rules (the repository allowlist, the Logger console exemption) without
 * creating a file that would then belong to the tree.
 */
function lintText(content: string, filename: string): readonly LintMessage[] {
  return runEslint(
    ['--stdin', '--stdin-filename', filename, '--format', 'json'],
    content,
  );
}

type Expectation = {
  readonly file: string;
  readonly ruleId: string;
  readonly ad: string;
};

const FIXTURE_EXPECTATIONS: readonly Expectation[] = [
  {
    file: 'src/engine/__boundary_fixtures__/import-react-native.ts',
    ruleId: 'no-restricted-imports',
    ad: 'AD-1',
  },
  {
    file: 'src/engine/__boundary_fixtures__/call-math-random.ts',
    ruleId: 'no-restricted-syntax',
    ad: 'AD-1',
  },
  {
    file: 'src/engine/__boundary_fixtures__/call-expo-haptics.ts',
    ruleId: 'no-restricted-imports',
    ad: 'AD-1',
  },
  {
    // "an audio play" in the epics acceptance criterion. Kept as its own
    // fixture rather than folded into the haptics one so that a regression in
    // either module family fails on its own.
    file: 'src/engine/__boundary_fixtures__/call-expo-audio.ts',
    ruleId: 'no-restricted-imports',
    ad: 'AD-1',
  },
  {
    file: 'src/engine/__boundary_fixtures__/call-expo-sqlite.ts',
    ruleId: 'no-restricted-imports',
    ad: 'AD-1',
  },
  {
    file: 'src/engine/__boundary_fixtures__/call-view-shot.ts',
    ruleId: 'no-restricted-imports',
    ad: 'AD-1',
  },
  {
    // The clock ban, `Date.now()`. `no-restricted-globals` is a separate rule
    // from the import ban; before this fixture existed, deleting it left the
    // suite green.
    file: 'src/engine/__boundary_fixtures__/call-date-now.ts',
    ruleId: 'no-restricted-globals',
    ad: 'AD-1',
  },
  {
    // The clock ban, `performance.now()`.
    file: 'src/engine/__boundary_fixtures__/call-performance-now.ts',
    ruleId: 'no-restricted-globals',
    ad: 'AD-1',
  },
  {
    // A relative specifier into the Shell: the import ban must match relative
    // paths as well as the `@/` alias.
    file: 'src/engine/__boundary_fixtures__/import-relative-shell.ts',
    ruleId: 'no-restricted-imports',
    ad: 'AD-1',
  },
  {
    // Story 1.6's zero-permission / zero-sensor claim: an onboarding screen may
    // not import a sensor or permission module, or the path would prompt.
    file: 'src/features/onboarding/__boundary_fixtures__/import-expo-location.ts',
    ruleId: 'no-restricted-imports',
    ad: 'Story 1.6',
  },
  {
    // Story 1.7 extends the same claim to the About feature files: the notice
    // surface may not import a sensor or permission module.
    file: 'src/features/about/__boundary_fixtures__/import-expo-camera.ts',
    ruleId: 'no-restricted-imports',
    ad: 'Story 1.7',
  },
  {
    // ...and to the Profile feature files: the Profile body may not either.
    file: 'src/features/profile/__boundary_fixtures__/import-expo-sensors.ts',
    ruleId: 'no-restricted-imports',
    ad: 'Story 1.7',
  },
];

describe('boundary fixtures are rejected by ESLint', () => {
  it.each(FIXTURE_EXPECTATIONS)(
    'rejects $file with $ruleId naming $ad',
    ({ file, ruleId, ad }) => {
      const messages = lintFile(file);
      const match = messages.find(
        (message) =>
          message.ruleId === ruleId && message.message.includes(ad),
      );
      expect(match).toBeDefined();
      expect(match?.severity).toBe(2);
    },
    // The first ESLint invocation pays the module-load cost for the whole
    // TypeScript-aware config; later calls are sub-second.
    60_000,
  );
});

/**
 * The SQL text under test, assembled from fragments so that this file — which
 * is not under `src/db/repositories/**` — does not itself contain a SQL literal
 * and so does not trip the very rule it asserts.
 */
const SQL = ['SELE', 'CT case_id FROM evidence WHERE case_id IS NULL'].join('');

describe('SQL containment', () => {
  it('permits a SQL literal under src/db/repositories/**', () => {
    const messages = lintText(
      `export const query = '${SQL}';\n`,
      'src/db/repositories/EvidenceRepository.ts',
    );
    const sqlViolations = messages.filter(
      (message) => message.ruleId === 'no-restricted-syntax',
    );
    expect(sqlViolations).toHaveLength(0);
  });

  it('rejects the same literal in a feature module with a message naming AD-12', () => {
    const messages = lintText(
      `export const query = '${SQL}';\n`,
      'src/features/query.ts',
    );
    const sqlViolations = messages.filter(
      (message) => message.ruleId === 'no-restricted-syntax',
    );
    expect(sqlViolations).toHaveLength(1);
    expect(sqlViolations[0]?.message).toContain('AD-12');
  });

  it('rejects a SQL statement in a route with a message naming AD-12', () => {
    const messages = lintText(
      `export const query = '${SQL}';\n`,
      'src/app/report.ts',
    );
    const sqlViolations = messages.filter(
      (message) => message.ruleId === 'no-restricted-syntax',
    );
    expect(sqlViolations).toHaveLength(1);
    expect(sqlViolations[0]?.message).toContain('AD-12');
  });

  /**
   * The false positive the loopback exists to remove. Each of these is ordinary
   * screen copy whose *first word* is a SQL keyword; Stories 1.6 and 1.7 author
   * exactly this, so the selector must match statement grammar, not the leading
   * keyword.
   */
  it.each([
    'Select a night to investigate',
    'Delete my data',
    'Create a new case',
    'Update your intention',
    'Replace this note',
    'With your permission',
  ])('passes ordinary UI copy: %s', (copy) => {
    const messages = lintText(
      `export const label = ${JSON.stringify(copy)};\n`,
      'src/features/copy.ts',
    );
    const sqlViolations = messages.filter(
      (message) => message.ruleId === 'no-restricted-syntax',
    );
    expect(sqlViolations).toHaveLength(0);
  });
});

describe('console containment', () => {
  it('rejects a console call outside Logger, naming the governing AD', () => {
    const messages = lintText("console.log('leak');\n", 'src/features/leak.ts');
    // The AD-named selector, not only the bare `no-console` baseline: the
    // acceptance criterion requires the message to name its governing rule.
    const violations = messages.filter(
      (message) =>
        message.ruleId === 'no-restricted-syntax' &&
        message.message.includes('AD-30'),
    );
    expect(violations).toHaveLength(1);
    expect(violations[0]?.severity).toBe(2);
  });

  it('permits the console calls inside the real Logger file', () => {
    const messages = lintFile('src/services/Logger.ts');
    const consoleViolations = messages.filter(
      (message) => message.ruleId === 'no-console',
    );
    expect(consoleViolations).toHaveLength(0);
    // The AD-named selector is lifted for Logger too.
    const syntaxConsole = messages.filter(
      (message) =>
        message.ruleId === 'no-restricted-syntax' &&
        message.message.includes('AD-30'),
    );
    expect(syntaxConsole).toHaveLength(0);
  });

  it('lints the real tree clean, Logger exemption included', () => {
    const messages = runEslint([
      '.',
      '--ignore-pattern',
      'src/**/__boundary_fixtures__/**',
      '--format',
      'json',
    ]);
    expect(messages.filter((message) => message.severity === 2)).toEqual([]);
  }, 60_000);
});

/**
 * AD-17's raw-value ban. The rule rides in the shared Shell block, so it fires
 * under `src/services/**`, `src/features/**`, `src/ui/**` and `src/store/**` —
 * wider than the acceptance criterion's `src/ui/**` wording — and is re-permitted
 * for `src/ui/theme/tokens.ts` alone plus `__tests__` files under those four
 * directories.
 *
 * Two failure modes are pinned here at once. A rule with no *rejecting* case is
 * one CI cannot see removed; a rule with no *clean* case is one whose over-reach
 * is invisible. So every family is exercised in both the plain-`Literal` half and
 * the `TemplateElement` half (delete either selector and a case fails), the
 * compound and alpha-hex forms the AC's own boundary names are caught, and the
 * ordinary-copy strings the boundary must not touch are asserted clean.
 */
const AD17 = 'AD-17';

/** Every `no-restricted-syntax` message, whatever AD it names. */
function syntaxMessages(messages: readonly LintMessage[]): readonly LintMessage[] {
  return messages.filter((message) => message.ruleId === 'no-restricted-syntax');
}

/**
 * Only the AD-17 messages. Note this filter alone would let a "clean" fixture
 * that also raised a console or SQL error read as clean, so the clean cases
 * below assert `syntaxMessages` is empty rather than only this slice.
 */
function ad17Messages(messages: readonly LintMessage[]): readonly LintMessage[] {
  return syntaxMessages(messages).filter((message) =>
    message.message.includes(AD17),
  );
}

describe('raw-value lint (AD-17) rejects raw values under the Shell block', () => {
  const REJECTED: readonly (readonly [string, string])[] = [
    // The three families the acceptance criterion names, in the bare form.
    ["export const x = '#0B140E';", 'bare hex'],
    ["export const x = '10px';", 'bare px dimension'],
    ["export const x = '240ms';", 'bare millisecond duration'],
    // The commonest hard-code shape: a value inside a compound style string.
    ["export const x = '1px solid #0B140E';", 'compound border'],
    ["export const x = '8px 12px';", 'compound padding'],
    ["export const x = 'translateY(8px)';", 'transformed dimension'],
    ["export const x = '0 0 10px #0B140E';", 'compound shadow'],
    // An 8-digit alpha hex is still a hex colour.
    ["export const x = '#0B140EAA';", '8-digit alpha hex'],
    // A hex glued to its delimiter (no space after the colon).
    ["export const x = 'color:#0B140E';", 'hex glued to delimiter'],
    // Unit letters are case-insensitive.
    ["export const x = '10PX';", 'uppercase PX'],
    ["export const x = '240MS';", 'uppercase MS'],
    // `pt` is a dimension too.
    ["export const x = '12pt';", 'pt dimension'],
    // The product's own motion spelling at the start of a literal.
    ["export const x = '5s';", 'bare second duration'],
    // The string-start decade the matcher's `s` branch actually flags — pinned
    // so the boundary's real shape is recorded rather than assumed.
    ["export const x = '70s';", 'string-start decade'],
    ["export const x = ['70s', '80s'];", 'array of decades'],
  ];

  it.each(REJECTED)(
    'rejects %s (%s) naming AD-17 with a severity-2 error',
    (literal) => {
      const messages = ad17Messages(
        lintText(`${literal}\n`, 'src/ui/components/Foo.tsx'),
      );
      expect(messages.length).toBeGreaterThanOrEqual(1);
      expect(messages[0]?.severity).toBe(2);
    },
  );

  /**
   * The `TemplateElement` half of every family. Each family emits a `Literal`
   * selector and a `TemplateElement[value.raw=…]` selector, so a rejecting case
   * written as a plain string covers only the first; deleting the second leaves
   * the suite green unless a template literal is exercised.
   */
  const REJECTED_TEMPLATES: readonly (readonly [string, string])[] = [
    ['export const x = `#0B140E`;', 'template bare hex'],
    ['export const x = `10px`;', 'template bare px'],
    ['export const x = `240ms`;', 'template duration'],
    ['export const x = `1px solid #0B140E`;', 'template compound border'],
    ['export const x = `8px 12px`;', 'template compound padding'],
    ['export const x = `translateY(8px)`;', 'template transformed dimension'],
    ['export const x = `#0B140EAA`;', 'template alpha hex'],
    ['export const x = `5s`;', 'template second duration'],
  ];

  it.each(REJECTED_TEMPLATES)(
    'rejects the template-literal form %s (%s)',
    (literal) => {
      const messages = ad17Messages(
        lintText(`${literal}\n`, 'src/ui/components/Foo.tsx'),
      );
      expect(messages.length).toBeGreaterThanOrEqual(1);
      expect(messages[0]?.message).toContain(AD17);
    },
  );

  /**
   * The false-positive boundary. Each of these is ordinary screen copy —
   * case references, hashtags, prose timings — whose shape collides with the
   * value shapes above. `syntaxMessages` (not `ad17Messages`) is asserted empty,
   * so a collateral console or SQL error in the same fixture cannot hide behind
   * the AD-17 filter and read as clean.
   */
  const CLEAN: readonly (readonly [string, string])[] = [
    ["export const x = 'Case #123';", 'case reference'],
    ["export const x = 'Room #4b2';", 'room reference'],
    ["export const x = 'tag #abc123';", 'hashtag'],
    ["export const x = 'ID #ABCDEF';", 'id reference'],
    ["export const x = 'The 1950s were strange';", 'space-preceded decade'],
    ["export const x = 'made in the 70s';", 'space-preceded decade 2'],
    // The seconds branch is start-of-literal only: a space-preceded `s` is
    // deliberately not a duration, because `'transform 5s'` and `'the 1950s'`
    // are the same shape.
    ["export const x = 'animation: 5s';", 'space-preceded seconds'],
    ["export const x = 'breathe 5s';", 'motion sentence'],
    // The 3-digit `#rgb` form the matcher deliberately excludes, pinned clean
    // so a future matcher that starts matching 3-digit colours has a case to
    // break.
    ["export const x = '#123';", 'bare 3-digit hex'],
    ['export const x = `#123`;', 'template 3-digit hex'],
    // Value shapes the acceptance criterion keeps out of scope, pinned clean in
    // both selector halves so a tightening that starts flagging them fails here.
    ["export const x = '0.42em';", 'em length'],
    ["export const x = 'rgba(0,0,0,0.5)';", 'rgba colour'],
    ['export const x = `the 1950s`;', 'template prose timing'],
    ['export const x = `animation: 5s`;', 'template space-preceded seconds'],
  ];

  it.each(CLEAN)('permits the ordinary copy %s (%s)', (literal) => {
    const messages = lintText(`${literal}\n`, 'src/ui/components/Foo.tsx');
    expect(syntaxMessages(messages)).toHaveLength(0);
  });

  it('permits a component that reads its values from the token module', () => {
    const component = [
      "import { colors, rounded, spacing } from '../theme/tokens';",
      'export const card = {',
      '  backgroundColor: colors.ledger,',
      '  borderColor: colors.rule,',
      '  padding: spacing[4],',
      '  borderRadius: rounded.DEFAULT,',
      '};',
      '',
    ].join('\n');
    const messages = lintText(component, 'src/ui/components/Card.tsx');
    expect(syntaxMessages(messages)).toHaveLength(0);
  });

  it('permits raw values inside the token module itself', () => {
    const messages = lintText(
      "export const night = '#0B140E';\nexport const gap = '10px';\nexport const ms = '240ms';\n",
      'src/ui/theme/tokens.ts',
    );
    expect(ad17Messages(messages)).toHaveLength(0);
  });

  it('does not extend the re-permit to a component beside the token module', () => {
    // The re-permit is scoped to `tokens.ts`, never the whole `src/ui/theme/**`
    // directory, so a file placed beside it still carries the ban.
    const messages = ad17Messages(
      lintText("export const night = '#0B140E';\n", 'src/ui/theme/Swatch.tsx'),
    );
    expect(messages).toHaveLength(1);
    expect(messages[0]?.severity).toBe(2);
  });

  it('message names the directories it governs', () => {
    const messages = ad17Messages(
      lintText("export const x = '#0B140E';\n", 'src/ui/components/Foo.tsx'),
    );
    expect(messages[0]?.message).toContain('src/services');
    expect(messages[0]?.message).toContain('src/features');
    expect(messages[0]?.message).toContain('src/ui');
    expect(messages[0]?.message).toContain('src/store');
  });
});

describe('the AD-17 reach covers every Shell directory it claims', () => {
  const REACH: readonly (readonly [string, string])[] = [
    ['src/services/Other.ts', 'services'],
    ['src/features/session.ts', 'features'],
    ['src/ui/components/Foo.tsx', 'ui'],
    ['src/store/cases.ts', 'store'],
    // Logger is a Shell path too: its own block re-declares the rule list, so
    // omitting `...AD17_SELECTORS` there would let this one file escape.
    ['src/services/Logger.ts', 'Logger'],
  ];

  it.each(REACH)('rejects a raw hex at %s (%s)', (filename) => {
    const messages = ad17Messages(
      lintText("export const x = '#0B140E';\n", filename),
    );
    expect(messages).toHaveLength(1);
    expect(messages[0]?.severity).toBe(2);
  });

  it('leaves the two Logger statements agreeing', () => {
    const logger = ad17Messages(
      lintText("export const x = '#0B140E';\n", 'src/services/Logger.ts'),
    );
    const other = ad17Messages(
      lintText("export const x = '#0B140E';\n", 'src/services/Other.ts'),
    );
    expect(logger).toHaveLength(other.length);
  });
});

describe('the AD-17 test exemption stays scoped to the Shell directories', () => {
  it.each([
    ['src/services/__tests__/x.ts', 'services'],
    ['src/features/__tests__/x.ts', 'features'],
    ['src/ui/__tests__/x.ts', 'ui'],
    ['src/store/__tests__/x.ts', 'store'],
    ['src/ui/theme/__tests__/x.ts', 'theme'],
  ])('permits literals in %s (%s)', (filename) => {
    const messages = ad17Messages(
      lintText("export const fixture = '#0B140E';\n", filename),
    );
    expect(messages).toHaveLength(0);
  });

  /**
   * The two cross-layer regressions a whole-tree `__tests__` glob would cause.
   * The exemption block replaces `no-restricted-syntax` for every path it
   * matches, so if it spanned the tree it would delete the engine block's
   * `Math.random` selector (AD-1) and re-impose the SQL ban on the repository
   * allowlist (AD-12). These are the tripwires against that.
   */
  it('keeps AD-1’s Math.random ban alive in an engine test file', () => {
    const messages = syntaxMessages(
      lintText('export const draw = Math.random();\n', 'src/engine/__tests__/x.ts'),
    );
    const ad1 = messages.filter((message) => message.message.includes('AD-1'));
    expect(ad1).toHaveLength(1);
  });

  it('keeps a SQL literal clean in a repository test file', () => {
    const messages = syntaxMessages(
      lintText(`export const query = '${SQL}';\n`, 'src/db/repositories/__tests__/x.ts'),
    );
    expect(messages).toHaveLength(0);
  });
});

/**
 * AD-12's route containment, every alias/relative combination for both layers.
 * The fixtures prove the rule fires; these prove the four specifiers the
 * acceptance criterion names are each matched, so an over-narrow glob cannot
 * pass while the committed fixtures happen to use the covered spelling.
 */
describe('route import containment (AD-12)', () => {
  it.each([
    ['@/db/kv', 'alias into db'],
    ['@/engine/InvestigationEngine', 'alias into engine'],
    ['../../db/kv', 'relative into db'],
    ['../../engine/InvestigationEngine', 'relative into engine'],
  ])('rejects %s (%s) naming AD-12', (specifier) => {
    const messages = lintText(
      `import { thing } from '${specifier}';\nexport const x = thing;\n`,
      'src/app/session.tsx',
    );
    const violations = messages.filter(
      (message) =>
        message.ruleId === 'no-restricted-imports' &&
        message.message.includes('AD-12'),
    );
    expect(violations).toHaveLength(1);
  });

  it('permits a route importing the Shell below it', () => {
    const messages = lintText(
      "import { kv } from '@/features/session/store';\nexport const x = kv;\n",
      'src/app/session.tsx',
    );
    const violations = messages.filter(
      (message) =>
        message.ruleId === 'no-restricted-imports' &&
        message.message.includes('AD-12'),
    );
    expect(violations).toHaveLength(0);
  });
});

/**
 * AD-1's four-layer import table — Core / Input adaptation / Content / Shell.
 * The epics acceptance criterion requires the *whole* table, not the Core row
 * alone, so each layer's upward imports are witnessed here. A rule with no test
 * can be deleted with the suite green; a permitted edge with no test can be
 * over-tightened the same way.
 */
describe('four-layer import containment (AD-1)', () => {
  /** Assert the given import specifier is (or is not) rejected as an upward edge. */
  function expectImport(
    specifier: string,
    fromFile: string,
    { rejected }: { readonly rejected: boolean },
  ): void {
    const messages = lintText(
      `import { thing } from '${specifier}';\nexport const x = thing;\n`,
      fromFile,
    );
    const violations = messages.filter(
      (message) =>
        message.ruleId === 'no-restricted-imports' &&
        message.message.includes('AD-1'),
    );
    if (rejected) {
      expect(violations).toHaveLength(1);
    } else {
      expect(violations).toHaveLength(0);
    }
  }

  it('Core imports no Shell module, by alias or by relative path', () => {
    expectImport('@/services/Logger', 'src/engine/x.ts', { rejected: true });
    expectImport('../../services/Logger', 'src/engine/x.ts', {
      rejected: true,
    });
    expectImport('../../db/kv', 'src/engine/x.ts', { rejected: true });
  });

  it('Core imports its own modules relatively', () => {
    expectImport('./models/Emission', 'src/engine/x.ts', { rejected: false });
  });

  it('Input adaptation imports native sensor APIs and engine/models only', () => {
    expectImport('expo-sensors', 'src/sensors/x.ts', { rejected: false });
    expectImport('expo-location', 'src/sensors/x.ts', { rejected: false });
    expectImport('@/engine/models/SensorDigest', 'src/sensors/x.ts', {
      rejected: false,
    });
    // Not a sensor API, and not engine/models: both are upward.
    expectImport('expo-haptics', 'src/sensors/x.ts', { rejected: true });
    expectImport('@/engine/InvestigationEngine', 'src/sensors/x.ts', {
      rejected: true,
    });
    expectImport('@/services/Logger', 'src/sensors/x.ts', { rejected: true });
    // Content sits above Input adaptation: `@/data/**` and `@/db/**` are upward
    // arrows too, and must be rejected here as well.
    expectImport('@/db/kv', 'src/sensors/x.ts', { rejected: true });
    expectImport('@/data/things', 'src/sensors/x.ts', { rejected: true });
  });

  it('Content imports zod, engine/models, and the one Logger edge', () => {
    expectImport('zod', 'src/db/x.ts', { rejected: false });
    expectImport('expo-sqlite', 'src/db/x.ts', { rejected: false });
    expectImport('@/engine/models/Emission', 'src/data/x.ts', {
      rejected: false,
    });
    // The single edge into the Shell required by the Config + Logging rows.
    expectImport('@/services/Logger', 'src/db/kv.ts', { rejected: false });
    // Every other Shell module is upward, and the engine's stages are off-limits.
    expectImport('@/services/Clock', 'src/db/x.ts', { rejected: true });
    expectImport('@/features/session', 'src/db/x.ts', { rejected: true });
    expectImport('@/engine/InvestigationEngine', 'src/data/x.ts', {
      rejected: true,
    });
    expectImport('react', 'src/db/x.ts', { rejected: true });
  });

  it('Shell imports everything below it', () => {
    expectImport('@/engine/models/Emission', 'src/features/x.ts', {
      rejected: false,
    });
    expectImport('@/db/kv', 'src/features/x.ts', { rejected: false });
    expectImport('@/sensors/hub', 'src/services/x.ts', { rejected: false });
    expectImport('@/services/Logger', 'src/ui/x.ts', { rejected: false });
  });
});

/**
 * Story 1.7's zero-permission / zero-sensor claim on the Profile→About path.
 *
 * The feature-file half is witnessed by the two committed fixtures above; the
 * route half — the three files actually on the path (`src/app/(modals)/about.tsx`,
 * `src/app/(tabs)/profile.tsx`, `src/app/index.tsx`) — is witnessed here with
 * `lintText`, because a fixture under `src/app/**` would itself become a route
 * the export must resolve (see the README's "Nothing may sit under src/app
 * except real routes"). The route blocks re-declare `no-restricted-imports`, so
 * the AD-12 engine/db patterns must survive alongside the sensor ban —
 * last-match-wins replaced the route block's list.
 */
describe('the Profile-to-About path boundary (Story 1.7)', () => {
  it.each([
    ['src/app/(modals)/about.tsx', 'the About sheet route'],
    ['src/app/(tabs)/profile.tsx', 'the Profile route'],
    // The placeholder home is on the path (it is what links to Profile) and is
    // the file the story modifies; the ban must reach it too.
    ['src/app/index.tsx', 'the placeholder home route'],
  ])('rejects a sensor import in %s (%s) naming Story 1.7', (filename) => {
    const messages = lintText("import * as Camera from 'expo-camera';\n", filename);
    const violations = messages.filter(
      (message) =>
        message.ruleId === 'no-restricted-imports' &&
        message.message.includes('Story 1.7'),
    );
    expect(violations).toHaveLength(1);
    expect(violations[0]?.severity).toBe(2);
  });

  it('permits a route on the path that imports only Shell modules below it', () => {
    const messages = lintText(
      "import { Sheet } from '@/ui/components';\nexport const x = Sheet;\n",
      'src/app/(modals)/about.tsx',
    );
    const violations = messages.filter(
      (message) => message.ruleId === 'no-restricted-imports',
    );
    expect(violations).toEqual([]);
  });

  it('keeps the route block’s AD-12 engine/db ban alive on the new routes', () => {
    const messages = lintText(
      "import { kv } from '@/db/kv';\nexport const x = kv;\n",
      'src/app/(tabs)/profile.tsx',
    );
    const violations = messages.filter(
      (message) =>
        message.ruleId === 'no-restricted-imports' &&
        message.message.includes('AD-12'),
    );
    expect(violations).toHaveLength(1);
  });
});
