import { execFileSync } from 'node:child_process';
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import ts from 'typescript';

import type { ConfigContext } from 'expo/config';

import {
  ABOUT_NOTICE,
  ABOUT_NOTICE_SECTIONS,
  ABOUT_NOTICE_SENSOR_NOTE,
  ABOUT_NOTICE_SENSORS,
  ENTERTAINMENT_LINE,
} from '@/data/strings';

import resolveConfig from '../../../app.config';

/**
 * Story 1.5 — the claims lint's own gate.
 *
 * An unasserted gate is a gate that can be deleted with the suite green, so
 * every I/O-matrix row is exercised through the real CLI (`--config`), the
 * declared surface set's coverage is asserted against the files on disk, and
 * the store and native surfaces are checked for the facts NFR-18/NFR-20 name.
 * The `%`-ban and the `allowedPhrases` carve-out are proved by running the
 * checker over disposable fixtures, not by re-describing the rule.
 */

const ROOT = path.resolve(__dirname, '..', '..', '..');
const SRC = path.join(ROOT, 'src');
const CONFIG_PATH = path.join(ROOT, 'scripts', 'claims', 'config.json');
const LINT_BIN = path.join(ROOT, 'scripts', 'claims-lint.mjs');
const LISTING_PATH = path.join(ROOT, 'assets', 'store', 'listing.json');
const WRONG_VARIANT = 'Nothing here is a measurement.';

// The carriers the declared surface kinds resolve to, as repo-relative paths.
const NATIVE_CONFIG = 'app.config.ts';
const UI_STRINGS_ROOT = path.join('src', 'data', 'strings');
const LISTING_REL = path.join('assets', 'store', 'listing.json');
const DIRECTIVE_POOL_REL = path.join('src', 'data', 'directives', 'pool.json');

/**
 * The kind→carrier table. Every declared surface kind resolves to exactly one
 * carrier: a `ui.*` kind to the `src/data/strings` string tables, a `native.*`
 * kind to `app.config.ts`, a `store.*` kind to `assets/store/listing.json`, and
 * a `content.*` kind to the content JSON it names. The coverage test walks these
 * carriers, so a new file under one is not covered until it is declared.
 */
const KIND_CARRIER: Readonly<Record<string, string>> = {
  'ui-string-table': UI_STRINGS_ROOT,
  'about-notice': UI_STRINGS_ROOT,
  'ios-purpose-string': NATIVE_CONFIG,
  'android-permission-string': NATIVE_CONFIG,
  'store-title': LISTING_REL,
  'store-subtitle': LISTING_REL,
  'store-description': LISTING_REL,
  'screenshot-caption': LISTING_REL,
  'content-string-table': DIRECTIVE_POOL_REL,
};

/** The roots the declared surfaces live in — every file there must be declared. */
const COPY_ROOTS = [
  UI_STRINGS_ROOT,
  path.dirname(LISTING_REL),
  NATIVE_CONFIG,
  DIRECTIVE_POOL_REL,
];

/** The iOS purpose string each sensor in the notice's inventory must declare. */
const SENSOR_PURPOSE_STRING: Readonly<Record<string, string>> = {
  Microphone: 'NSMicrophoneUsageDescription',
  Motion: 'NSMotionUsageDescription',
  Camera: 'NSCameraUsageDescription',
  Location: 'NSLocationWhenInUseUsageDescription',
};

// --- small narrowing helpers (this file parses JSON; it is the validator) ----

function asObject(value: unknown, what: string): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${what} is not an object`);
  }
  return value as Record<string, unknown>;
}

function asString(value: unknown, what: string): string {
  if (typeof value !== 'string') {
    throw new Error(`${what} is not a string`);
  }
  return value;
}

function asStringArray(value: unknown, what: string): readonly string[] {
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw new Error(`${what} is not an array of strings`);
  }
  return value;
}

function readJson(filePath: string): Record<string, unknown> {
  return asObject(JSON.parse(readFileSync(filePath, 'utf8')) as unknown, filePath);
}

type Surface = { readonly key: string; readonly path: string; readonly kind: string };

function asSurface(value: unknown): Surface {
  const record = asObject(value, 'surface');
  return {
    key: asString(record.key, 'surface.key'),
    path: asString(record.path, 'surface.path'),
    kind: asString(record.kind, 'surface.kind'),
  };
}

type Config = {
  readonly bannedTerms: readonly string[];
  readonly allowedPhrases: readonly { readonly phrase: string; readonly ruling: string }[];
  readonly bannedCharacters: readonly string[];
  readonly bannedPatterns: readonly string[];
  readonly approvedMarketTerms: readonly string[];
  readonly surfaces: readonly Surface[];
  readonly shippedCharacterScope: readonly string[];
};

function loadConfig(): Config {
  const raw = readJson(CONFIG_PATH);
  const allowedPhrases = (raw.allowedPhrases as unknown[]).map((entry) => {
    const record = asObject(entry, 'allowedPhrase');
    return {
      phrase: asString(record.phrase, 'allowedPhrase.phrase'),
      ruling: asString(record.ruling, 'allowedPhrase.ruling'),
    };
  });
  const surfaces = (raw.surfaces as unknown[]).map(asSurface);
  return {
    bannedTerms: asStringArray(raw.bannedTerms, 'bannedTerms'),
    allowedPhrases,
    bannedCharacters: asStringArray(raw.bannedCharacters, 'bannedCharacters'),
    bannedPatterns: asStringArray(raw.bannedPatterns, 'bannedPatterns'),
    approvedMarketTerms: asStringArray(raw.approvedMarketTerms, 'approvedMarketTerms'),
    surfaces,
    shippedCharacterScope: asStringArray(raw.shippedCharacterScope, 'shippedCharacterScope'),
  };
}

const CONFIG = loadConfig();

// --- the CLI -----------------------------------------------------------------

type RunResult = { readonly status: number; readonly stdout: string; readonly stderr: string };

function runLint(args: readonly string[]): RunResult {
  try {
    const stdout = execFileSync(process.execPath, [LINT_BIN, ...args], {
      cwd: ROOT,
      encoding: 'utf8',
    });
    return { status: 0, stdout, stderr: '' };
  } catch (error) {
    const failure = error as { status?: number; stdout?: string; stderr?: string };
    return {
      status: typeof failure.status === 'number' ? failure.status : -1,
      stdout: failure.stdout ?? '',
      stderr: failure.stderr ?? '',
    };
  }
}

// --- string-literal extraction (the same shape the lint walks) ---------------

function scriptKindFor(filePath: string): ts.ScriptKind {
  if (filePath.endsWith('.json')) return ts.ScriptKind.JSON;
  if (filePath.endsWith('.tsx')) return ts.ScriptKind.TSX;
  return ts.ScriptKind.TS;
}

function stringLiteralsOf(filePath: string, text: string): readonly string[] {
  const sourceFile = ts.createSourceFile(
    filePath,
    text,
    ts.ScriptTarget.Latest,
    false,
    scriptKindFor(filePath),
  );
  const found: string[] = [];
  const visit = (node: ts.Node): void => {
    if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node)
    ) {
      found.push(node.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return found;
}

const SKIP_DIRS = new Set(['__tests__', '__boundary_fixtures__']);

function sourceFilesUnder(directory: string): readonly string[] {
  const files: string[] = [];
  const visit = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) visit(full);
      } else if (/\.(ts|tsx|js|jsx|json)$/.test(entry.name)) {
        files.push(full);
      }
    }
  };
  visit(directory);
  return files;
}

/** Every shipped source file: the app tree, the native config, the store copy. */
function shippedSourceFiles(): readonly string[] {
  return [...sourceFilesUnder(SRC), path.join(ROOT, 'app.config.ts'), LISTING_PATH];
}

// --- the entertainment line --------------------------------------------------

describe('the entertainment line is one exact exported constant', () => {
  it('is exactly the ratified string', () => {
    expect(ENTERTAINMENT_LINE).toBe('An investigation experience. Not a measurement.');
  });

  it('is imported by the About notice, never retyped', () => {
    expect(ABOUT_NOTICE.entertainmentLine).toBe(ENTERTAINMENT_LINE);
  });

  it('appears as a literal in exactly one shipped source file', () => {
    const holders = shippedSourceFiles().filter((file) =>
      stringLiteralsOf(file, readFileSync(file, 'utf8')).includes(ENTERTAINMENT_LINE),
    );
    expect(holders.map((file) => path.relative(ROOT, file))).toEqual([
      path.join('src', 'data', 'strings', 'entertainment.ts'),
    ]);
  });

  it('never contains the earlier wrong variant', () => {
    const offenders = shippedSourceFiles().filter((file) =>
      stringLiteralsOf(file, readFileSync(file, 'utf8')).some((literal) =>
        literal.includes(WRONG_VARIANT),
      ),
    );
    expect(offenders.map((file) => path.relative(ROOT, file))).toEqual([]);
  });
});

// --- the declared surface set is the coverage --------------------------------

const REQUIRED_MINIMUM_KINDS = [
  'ui-string-table',
  'ios-purpose-string',
  'android-permission-string',
  'store-title',
  'store-subtitle',
  'store-description',
  'screenshot-caption',
  'about-notice',
] as const;

describe('the declared surface set covers every required surface', () => {
  it('is an enumerated list, never a glob', () => {
    expect(CONFIG.surfaces.length).toBeGreaterThan(0);
    for (const surface of CONFIG.surfaces) {
      expect(surface.path).not.toMatch(/[*?[\]]/);
    }
  });

  it('contains the required minimum surface kinds', () => {
    const kinds = new Set(CONFIG.surfaces.map((surface) => surface.kind));
    expect([...REQUIRED_MINIMUM_KINDS].filter((kind) => !kinds.has(kind))).toEqual([]);
  });

  it('names the iOS and Android native purpose strings by name', () => {
    const surfacePaths = CONFIG.surfaces.map((surface) => surface.path);
    expect(surfacePaths).toContain('app.config.ts');
    const config = resolveProduction();
    expect(config.ios?.infoPlist?.NSMotionUsageDescription).toBeTruthy();
    expect(config.ios?.infoPlist?.NSMicrophoneUsageDescription).toBeTruthy();
    expect(config.android?.permissions).toEqual(
      expect.arrayContaining([
        'android.permission.RECORD_AUDIO',
        'android.permission.ACTIVITY_RECOGNITION',
      ]),
    );
  });

  it('enumerates every file under the declared copy roots', () => {
    const declared = new Set(CONFIG.surfaces.map((surface) => surface.path));
    const onDisk = COPY_ROOTS.flatMap((root) => {
      const absolute = path.join(ROOT, root);
      return statSync(absolute).isDirectory()
        ? sourceFilesUnder(absolute).map((file) => path.relative(ROOT, file))
        : [root];
    });
    expect(onDisk.length).toBeGreaterThan(0);
    expect(onDisk.filter((file) => !declared.has(file))).toEqual([]);
  });

  it('ties every declared kind to its carrier file', () => {
    // Every kind resolves to one carrier, and the surface's own path agrees with
    // it: a `ui.*` surface is a `src/data/strings` table, a `native.*` surface is
    // `app.config.ts`, a `store.*` surface is `assets/store/listing.json`.
    for (const surface of CONFIG.surfaces) {
      const carrier = KIND_CARRIER[surface.kind];
      expect(carrier).toBeDefined();
      if (carrier === UI_STRINGS_ROOT) {
        expect(path.dirname(surface.path)).toBe(UI_STRINGS_ROOT);
      } else {
        expect(surface.path).toBe(carrier);
      }
    }
  });

  it('names every declared surface on disk', () => {
    for (const surface of CONFIG.surfaces) {
      expect(() => readFileSync(path.join(ROOT, surface.path), 'utf8')).not.toThrow();
    }
  });

  it('keeps the shipped-character scope over the source roots that author copy', () => {
    const scope = new Set(CONFIG.shippedCharacterScope);
    expect(scope.has('app.config.ts')).toBe(true);
    expect(scope.has('assets/store')).toBe(true);
    for (const root of ['src/app', 'src/data', 'src/ui/components', 'src/features', 'src/services']) {
      expect([...scope].some((entry) => entry === root || root.startsWith(`${entry}/`))).toBe(true);
    }
  });
});

// --- the About notice's sensor inventory vs the declared native surfaces -------

describe("the About notice's sensor inventory", () => {
  it('places the entertainment line in a notice section paragraph', () => {
    const paragraphs = ABOUT_NOTICE_SECTIONS.flatMap((section) => section.paragraphs);
    expect(paragraphs).toContain(ENTERTAINMENT_LINE);
  });

  it('carries the inventory and the note in a SENSORS USED section', () => {
    const section = ABOUT_NOTICE_SECTIONS.find((entry) => entry.heading === 'SENSORS USED');
    expect(section).toBeDefined();
    const body = section?.paragraphs.join(' ') ?? '';
    for (const { sensor } of ABOUT_NOTICE_SENSORS) {
      expect(body).toContain(sensor);
    }
    expect(body).toContain(ABOUT_NOTICE_SENSOR_NOTE);
  });

  it('names a declared iOS purpose string for every sensor row', () => {
    // A sensor the notice names but the binary does not declare is a notice that
    // overstates the app: iOS aborts when the tool that needs it is opened.
    const config = resolveProduction();
    const infoPlist = (config.ios?.infoPlist ?? {}) as Record<string, unknown>;
    for (const { sensor } of ABOUT_NOTICE_SENSORS) {
      const key = SENSOR_PURPOSE_STRING[sensor];
      expect(key).toBeDefined();
      expect(typeof infoPlist[key ?? '']).toBe('string');
    }
  });

  it('declares a matching Android permission for every sensor row', () => {
    const config = resolveProduction();
    const permissions = config.android?.permissions ?? [];
    const expected: Readonly<Record<string, string>> = {
      Microphone: 'android.permission.RECORD_AUDIO',
      Motion: 'android.permission.ACTIVITY_RECOGNITION',
      Camera: 'android.permission.CAMERA',
      Location: 'android.permission.ACCESS_FINE_LOCATION',
    };
    for (const { sensor } of ABOUT_NOTICE_SENSORS) {
      expect(permissions).toContain(expected[sensor]);
    }
  });
});

// --- the closed lists --------------------------------------------------------

describe('the closed lists come from the ratified addendum', () => {
  it('bans the §B.2 terms and keeps % out of the term list', () => {
    expect(CONFIG.bannedTerms).toEqual(
      expect.arrayContaining([
        'detect',
        'prove',
        'proof',
        'confirm',
        'verify',
        'authentic',
        'real ghost',
        'scientific',
        'science',
        'thermal',
        'radiation',
        'Geiger',
        'accuracy',
        'algorithm',
        'AI',
        'metres',
        'meters',
        'haunted',
        'evidence of the paranormal',
      ]),
    );
    expect(CONFIG.bannedTerms).not.toContain('%');
  });

  it('carries the FR-33 inflections whole-word matching would miss', () => {
    expect(CONFIG.bannedTerms).toEqual(
      expect.arrayContaining([
        'detects',
        'detected',
        'detecting',
        'detection',
        'detections',
        'detector',
        'detectors',
        'proves',
        'proved',
        'proving',
        'proofs',
        'confirms',
        'confirmed',
        'confirming',
        'confirmation',
        'verifies',
        'verified',
        'verifying',
        'verification',
        'authenticity',
        'scientifically',
        'accurately',
        'algorithms',
      ]),
    );
  });

  it('bans the % character everywhere', () => {
    expect(CONFIG.bannedCharacters).toEqual(['%']);
  });

  it('carries the statistic, social-proof and fake-telemetry prohibitions as patterns', () => {
    const matches = (sample: string) =>
      CONFIG.bannedPatterns.some((source) => new RegExp(source, 'i').test(sample));
    expect(matches('Join thousands of investigators')).toBe(true); // social proof
    expect(matches('Scanning for entities')).toBe(true); // fake telemetry
    expect(matches('Award-winning ghost app')).toBe(true); // an award
    // A bare count is NOT a banned pattern: AD-15 permits counts of things that
    // happened and elapsed session time, so the statistic rule is scoped to the
    // marketing surfaces below, not to every shipped string.
    expect(matches('87')).toBe(false);
    expect(matches('Pick your night.')).toBe(false);
  });

  it('allows only the row-27 safe form that still contains a banned token', () => {
    expect(CONFIG.allowedPhrases.map((entry) => entry.phrase)).toEqual(['Nothing here is proof.']);
    for (const entry of CONFIG.allowedPhrases) {
      expect(entry.ruling).toContain('B.4');
    }
  });

  it('carries the §B.3 approved market terms verbatim as a writer’s reference', () => {
    // The approved list is the vocabulary marketing MAY use; it is not a
    // blocklist, so the lint never fails on a marketing string for omitting it.
    expect(CONFIG.approvedMarketTerms).toEqual([
      'paranormal',
      'ghost hunt',
      'cryptid',
      'investigator',
      'field journal',
      'EMF',
      'EVP',
      'spooky',
      'adventure',
      'night',
    ]);
  });
});

// --- the CLI over the committed surfaces and over fixtures --------------------

describe('the claims CLI', () => {
  let scratch: string;

  beforeAll(() => {
    scratch = mkdtempSync(path.join(os.tmpdir(), 'claims-'));
  });

  afterAll(() => {
    rmSync(scratch, { recursive: true, force: true });
  });

  /** A config that points at one disposable surface and scans nothing else. */
  function probeConfig(surfacePath: string): string {
    const base = readJson(CONFIG_PATH);
    const configPath = path.join(scratch, 'config.json');
    writeFileSync(
      configPath,
      JSON.stringify({
        ...base,
        surfaces: [{ key: 'probe', path: surfacePath, kind: 'ui-string-table' }],
        shippedCharacterScope: [],
      }),
    );
    return configPath;
  }

  /** Write a fixture and its config; returns the config path. */
  function probe(name: string, source: string, extension = '.ts'): string {
    const fixture = path.join(scratch, `${name}${extension}`);
    writeFileSync(fixture, source);
    return probeConfig(fixture);
  }

  /** A config that is otherwise valid but overrides one key (for the exit-2s). */
  function invalidConfig(name: string, override: Record<string, unknown>): string {
    const configPath = path.join(scratch, `invalid-${name}.json`);
    writeFileSync(configPath, JSON.stringify({ ...readJson(CONFIG_PATH), ...override }));
    return configPath;
  }

  it('CLEAN_TREE: exits 0 over the committed surfaces with only a summary', () => {
    const result = runLint([]);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('clean');
  });

  it('BANNED_TERM: exits 1 naming the term, the file and the 1-based line', () => {
    const source = [
      'export const a = "Pick your night.";',
      'export const b = "Work the place.";',
      'export const c = "The tool will prove it was a real ghost.";',
      '',
    ].join('\n');
    const result = runLint(['--config', probe('term', source)]);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain('"prove"');
    expect(result.stdout).toContain('"real ghost"');
    expect(result.stdout).toContain('term.ts:3');
  });

  it('BANNED_CHAR: exits 1 naming the character and its location', () => {
    const source = ['export const a = "Pick your night.";', 'export const b = "Strength 87%";', ''].join(
      '\n',
    );
    const result = runLint(['--config', probe('percent', source)]);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain('"%"');
    expect(result.stdout).toContain('percent.ts:2');
  });

  it('BANNED_PATTERN: exits 1 naming the pattern, the file and the 1-based line', () => {
    const source = [
      'export const a = "Pick your night.";',
      'export const b = "Join thousands of investigators.";',
      '',
    ].join('\n');
    const result = runLint(['--config', probe('pattern', source)]);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain('banned pattern');
    expect(result.stdout).toContain('thousands');
    expect(result.stdout).toContain('pattern.ts:2');
  });

  it('JSX_TEXT: exits 1 for a % authored as a JSX text child', () => {
    // The literal-only selector reads "0 strings checked" for a `.tsx` surface
    // whose only shipped text is a JSX child; this is that boundary.
    const source = ['export const Probe = () => <Text>Strength 87%</Text>;', ''].join('\n');
    const result = runLint(['--config', probe('jsx-text', source, '.tsx')]);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain('"%"');
    expect(result.stdout).toContain('jsx-text.tsx:1');
  });

  it('ALLOWED_FORM: exits 0 for the ratified safe form', () => {
    const source = 'export const ok = "Nothing here is proof.";\n';
    const result = runLint(['--config', probe('allowed', source)]);
    expect(result.status).toBe(0);
  });

  it('CONFIG_UNREADABLE: exits 2 naming a missing config', () => {
    const missing = path.join(scratch, 'nope.json');
    const result = runLint(['--config', missing]);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain(missing);
  });

  it('CONFIG_UNREADABLE: exits 2 naming a malformed config', () => {
    const broken = path.join(scratch, 'broken.json');
    writeFileSync(broken, '{ not json');
    const result = runLint(['--config', broken]);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain(broken);
  });

  it('CONFIG_INVALID: exits 2 on an empty bannedTerms array', () => {
    const result = runLint(['--config', invalidConfig('empty-terms', { bannedTerms: [] })]);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain('bannedTerms');
  });

  it('CONFIG_INVALID: exits 2 on an empty bannedCharacters array', () => {
    const result = runLint(['--config', invalidConfig('empty-chars', { bannedCharacters: [] })]);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain('bannedCharacters');
  });

  it('CONFIG_INVALID: exits 2 on an empty surfaces array', () => {
    const result = runLint(['--config', invalidConfig('empty-surfaces', { surfaces: [] })]);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain('surfaces');
  });

  it('CONFIG_INVALID: exits 2 on an empty-string bannedTerms entry', () => {
    const result = runLint(['--config', invalidConfig('empty-term', { bannedTerms: [''] })]);
    expect(result.status).toBe(2);
  });

  it('CONFIG_INVALID: exits 2 on an empty-string approvedMarketTerms entry', () => {
    const result = runLint(
      ['--config', invalidConfig('empty-market', { approvedMarketTerms: [''] })],
    );
    expect(result.status).toBe(2);
  });

  it('CONFIG_INVALID: exits 2 on an empty-string shippedCharacterScope entry', () => {
    const result = runLint(
      ['--config', invalidConfig('empty-scope', { shippedCharacterScope: [''] })],
    );
    expect(result.status).toBe(2);
  });

  it('CONFIG_INVALID: exits 2 on a multi-character bannedCharacters entry', () => {
    const result = runLint(['--config', invalidConfig('long-char', { bannedCharacters: ['%%'] })]);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain('bannedCharacters');
  });

  it('CONFIG_INVALID: exits 2 on an empty bannedPatterns entry', () => {
    const result = runLint(['--config', invalidConfig('empty-pattern', { bannedPatterns: [''] })]);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain('bannedPatterns');
  });

  it('CONFIG_INVALID: exits 2 on a bannedPatterns source that is not a valid regex', () => {
    const result = runLint(['--config', invalidConfig('bad-pattern', { bannedPatterns: ['('] })]);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain('bannedPatterns');
  });

  it('is wired as the npm script', () => {
    const pkg = readJson(path.join(ROOT, 'package.json'));
    const scripts = asObject(pkg.scripts, 'package.json scripts');
    expect(scripts['claims:check']).toBe('node scripts/claims-lint.mjs');
  });
});

// --- the store and native metadata surfaces -----------------------------------

function resolveProduction() {
  const previous = process.env.APP_VARIANT;
  process.env.APP_VARIANT = 'production';
  try {
    const context = {
      projectRoot: ROOT,
      staticConfigPath: null,
      packageJsonPath: null,
      config: {},
    } satisfies ConfigContext;
    return resolveConfig(context);
  } finally {
    if (previous === undefined) {
      delete process.env.APP_VARIANT;
    } else {
      process.env.APP_VARIANT = previous;
    }
  }
}

const SEVERITY_RANK: Readonly<Record<string, number>> = {
  none: 0,
  infrequent: 1,
  frequent: 2,
  intense: 2,
};

/**
 * The recorded questionnaire answers → the store rating, per §B.3: the rating
 * is *derived* from the answers, never asserted. Mature-content descriptors
 * dominate; the horror/fear, sudden-audio and flashing descriptors that this
 * app answers "frequent" to set the floor at 12+.
 */
function deriveRating(answers: Readonly<Record<string, string>>): string {
  const level = (key: string): number => SEVERITY_RANK[answers[key] ?? 'none'] ?? 0;
  const mature = Math.max(
    level('violence'),
    level('bloodAndGore'),
    level('sexualContent'),
    level('nudity'),
    level('profanity'),
    level('alcoholTobaccoOrDrugs'),
    level('gambling'),
    level('matureOrSuggestiveThemes'),
  );
  const fear = Math.max(
    level('horrorOrFearThemes'),
    level('suddenOrLoudAudio'),
    level('flashingOrStrobingVisuals'),
  );
  if (mature >= 2) return '17+/Mature';
  if (fear >= 2) return '12+/Teen';
  if (fear >= 1 || mature >= 1) return '9+/Everyone 10+';
  return '4+/Everyone';
}

describe('the store metadata surface', () => {
  const listing = readJson(LISTING_PATH);

  it('carries the ratified name, subtitle and category', () => {
    expect(listing.title).toBe('NightTrace');
    expect(listing.subtitle).toBe('Paranormal field journal');
    expect(listing.category).toBe('Entertainment');
  });

  it('opens the description with the entertainment line', () => {
    expect(asString(listing.description, 'description').startsWith(ENTERTAINMENT_LINE)).toBe(true);
  });

  it('derives the 12+/Teen rating from the recorded questionnaire inputs', () => {
    const ratingInputs = asObject(listing.ratingInputs, 'ratingInputs');
    const answersRecord = asObject(ratingInputs.answers, 'ratingInputs.answers');
    const answers: Record<string, string> = {};
    for (const [key, value] of Object.entries(answersRecord)) {
      answers[key] = asString(value, `answer ${key}`);
    }
    expect(asString(listing.rating, 'rating')).toBe(deriveRating(answers));
    expect(listing.rating).toBe('12+/Teen');
  });

  it('carries screenshot captions', () => {
    const screenshots = listing.screenshots;
    expect(Array.isArray(screenshots)).toBe(true);
    const captions = (screenshots as readonly unknown[]).map((shot) =>
      asString(asObject(shot, 'screenshot').caption, 'screenshot.caption'),
    );
    expect(captions.length).toBeGreaterThan(0);
    for (const caption of captions) {
      expect(caption.length).toBeGreaterThan(0);
    }
  });

  it('keeps marketing copy free of statistics, social proof, awards and fake telemetry', () => {
    const marketing: readonly string[] = [
      asString(listing.description, 'description'),
      asString(listing.subtitle, 'subtitle'),
      ...(listing.screenshots as readonly unknown[]).map((shot) =>
        asString(asObject(shot, 'screenshot').caption, 'screenshot.caption'),
      ),
    ];
    // The statistic/social-proof/telemetry rules live in the config now, so the
    // lint enforces them over the declared surfaces; this test reads the same
    // `bannedPatterns` the lint does rather than re-describing the rule.
    for (const text of marketing) {
      // A statistic or bare number is prohibited in *marketing* copy; AD-15
      // permits counts and elapsed time in the product's own UI, so this rule
      // is asserted here for the store surfaces rather than as a lint pattern.
      expect(text).not.toMatch(/\d/);
      for (const source of CONFIG.bannedPatterns) {
        expect(text).not.toMatch(new RegExp(source, 'i'));
      }
      for (const character of CONFIG.bannedCharacters) {
        expect(text).not.toContain(character);
      }
      for (const term of CONFIG.bannedTerms) {
        const pattern = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        expect(text).not.toMatch(pattern);
      }
    }
  });
});
