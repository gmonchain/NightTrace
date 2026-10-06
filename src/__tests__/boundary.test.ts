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
