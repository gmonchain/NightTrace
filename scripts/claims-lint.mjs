#!/usr/bin/env node
/**
 * The claims lint — the build-failing gate over the declared string-surface set
 * (ARCHITECTURE-SPINE.md AD-16, NFR-18).
 *
 * It reads `scripts/claims/config.json` and checks the declared surfaces: every
 * string literal of each surface (a string literal, a template literal's halves,
 * or a JSX text child; the TypeScript parser skips comments) is matched against
 * the banned terms, the banned regex patterns and the banned characters, and a
 * hit fails with exit 1 printing the token, the file and the 1-based line.
 *
 * Coverage is the enumerated `surfaces` list, not a glob of the app binary: a
 * shipped string on a file that is not a declared surface is not covered
 * (AD-16). The `%` character is additionally checked over `shippedCharacterScope`,
 * the shipped source the surface set does not enumerate — a scope that
 * deliberately excludes `src/ui/theme/**`, whose only `%` is the Seal's SVG
 * filter-region value (recorded in `docs/review-items.md`).
 *
 * Exit codes: 0 clean, 1 a violation, 2 the config is missing, malformed, or
 * names a surface that is not on disk — never a silent pass.
 *
 * A test in `src/config/__tests__/claims.test.ts` asserts the set's completeness.
 * The lint parses strings and nothing else: images, mechanics, juxtaposition,
 * visual hierarchy and the sum of individually-safe sentences are out of its
 * reach and are carried as release-review items in `docs/review-items.md`.
 *
 * Usage: node scripts/claims-lint.mjs [--config <path>]
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
/** The repository root — surface paths resolve against it. */
const ROOT = path.resolve(SCRIPT_DIR, '..');
const DEFAULT_CONFIG = path.join(ROOT, 'scripts', 'claims', 'config.json');

/** Directories a scope walk never descends into. */
const SKIPPED_DIRECTORIES = new Set(['__tests__', '__boundary_fixtures__', 'node_modules']);
/** File extensions a scope walk collects. */
const SCANNED_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.json']);

function die(code, message) {
  process.stderr.write(`${message}\n`);
  process.exit(code);
}

/** Read `--config <path>` (default `scripts/claims/config.json`). */
function parseArgs(argv) {
  let configPath = DEFAULT_CONFIG;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--config') {
      const value = argv[i + 1];
      if (value === undefined) {
        die(2, 'claims: --config needs a path');
      }
      configPath = path.resolve(process.cwd(), value);
      i += 1;
    } else if (typeof arg === 'string' && arg.startsWith('--config=')) {
      configPath = path.resolve(process.cwd(), arg.slice('--config='.length));
    } else {
      die(2, `claims: unknown argument ${String(arg)}`);
    }
  }
  return { configPath };
}

/** The config, or exit 2 with a diagnostic that names it. */
function loadConfig(configPath) {
  let text;
  try {
    text = readFileSync(configPath, 'utf8');
  } catch (error) {
    die(2, `claims: cannot read config ${configPath}: ${error.message}`);
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    die(2, `claims: malformed config ${configPath}: ${error.message}`);
  }
}

/**
 * A string array whose entries are all non-empty — the shape an array used as a
 * closed list must have. An empty array is allowed (it declares "none"), but an
 * empty-string entry is not: it would match nothing and read as coverage.
 */
const isPopulatedStringArray = (value) =>
  Array.isArray(value) &&
  value.every((entry) => typeof entry === 'string' && entry.length > 0);

/**
 * A string array that must carry at least one entry and no empty-string entry.
 * A list that is the whole point of the scan (`bannedTerms`, `bannedCharacters`,
 * `bannedPatterns`, `surfaces`) is emptied into a clean pass otherwise.
 */
const isNonEmptyStringArray = (value) =>
  isPopulatedStringArray(value) && value.length > 0;

/** Validate the declared shape; a bad key exits 2 rather than thinning the scan. */
function validateConfig(config, configPath) {
  const bad = (detail) =>
    die(2, `claims: invalid config ${configPath}: ${detail}`);

  if (config === null || typeof config !== 'object' || Array.isArray(config)) {
    bad('expected a JSON object');
  }
  if (!isNonEmptyStringArray(config.bannedTerms)) {
    bad('bannedTerms must be a non-empty array of non-empty strings');
  }
  if (
    !isNonEmptyStringArray(config.bannedCharacters) ||
    !config.bannedCharacters.every((entry) => entry.length === 1)
  ) {
    bad('bannedCharacters must be a non-empty array of single-character strings');
  }
  if (!isPopulatedStringArray(config.approvedMarketTerms)) {
    bad('approvedMarketTerms must be an array of non-empty strings');
  }
  if (
    !isNonEmptyStringArray(config.bannedPatterns) ||
    !config.bannedPatterns.every((source) => compilePattern(source) !== null)
  ) {
    bad('bannedPatterns must be a non-empty array of valid regex sources');
  }
  if (
    !Array.isArray(config.allowedPhrases) ||
    !config.allowedPhrases.every(
      (entry) =>
        entry !== null &&
        typeof entry === 'object' &&
        typeof entry.phrase === 'string' &&
        typeof entry.ruling === 'string',
    )
  ) {
    bad('allowedPhrases must be an array of { phrase, ruling }');
  }
  if (
    !Array.isArray(config.surfaces) ||
    config.surfaces.length === 0 ||
    !config.surfaces.every(
      (entry) =>
        entry !== null &&
        typeof entry === 'object' &&
        typeof entry.key === 'string' &&
        typeof entry.path === 'string' &&
        typeof entry.kind === 'string',
    )
  ) {
    bad('surfaces must be a non-empty array of { key, path, kind }');
  }
  if (!isPopulatedStringArray(config.shippedCharacterScope)) {
    bad('shippedCharacterScope must be an array of non-empty strings');
  }
  return config;
}

/** A declared path resolves against the repository root; absolute paths stand. */
function resolveTarget(target) {
  return path.isAbsolute(target) ? target : path.resolve(ROOT, target);
}

/** How a path is printed: repo-relative when it is inside the repo. */
function displayPath(absolutePath) {
  const relative = path.relative(ROOT, absolutePath);
  return relative.startsWith('..') || path.isAbsolute(relative)
    ? absolutePath
    : relative;
}

function readSource(absolutePath) {
  try {
    return readFileSync(absolutePath, 'utf8');
  } catch (error) {
    die(2, `claims: cannot read surface ${displayPath(absolutePath)}: ${error.message}`);
  }
}

function scriptKindFor(filePath) {
  if (filePath.endsWith('.json')) return ts.ScriptKind.JSON;
  if (filePath.endsWith('.tsx')) return ts.ScriptKind.TSX;
  if (filePath.endsWith('.jsx')) return ts.ScriptKind.JSX;
  if (filePath.endsWith('.js')) return ts.ScriptKind.JS;
  return ts.ScriptKind.TS;
}

/**
 * Every string literal in `text`, with the 1-based line it starts on. The
 * TypeScript parser skips comments; `StringLiteral`, the template-literal halves
 * and a non-blank JSX text child are the shapes the selector reads.
 */
function extractStrings(filePath, text) {
  const sourceFile = ts.createSourceFile(
    filePath,
    text,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ false,
    scriptKindFor(filePath),
  );
  const found = [];
  const lineOf = (node) =>
    sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;

  const visit = (node) => {
    let value = null;
    let line = 0;
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      value = node.text;
      line = lineOf(node);
    } else if (
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node)
    ) {
      value = node.text;
      line = lineOf(node);
    } else if (ts.isJsxText(node)) {
      // A JSX text child ships as written: `<Text>Strength 87%</Text>` is a
      // shipped string the literal-only selector would miss. Blank/whitespace
      // children are not strings; the trimmed text's own line is reported.
      const raw = node.text;
      const trimmed = raw.trim();
      if (trimmed.length > 0) {
        const leading = raw.length - raw.trimStart().length;
        const start = node.getStart(sourceFile) + leading;
        value = trimmed;
        line = sourceFile.getLineAndCharacterOfPosition(start).line + 1;
      }
    }
    if (value !== null) {
      found.push({ value, line });
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return found;
}

/** Every scannable file under the declared shipped-character scope. */
function collectScopeFiles(entries) {
  const files = [];
  const walk = (directory) => {
    for (const name of readdirSync(directory)) {
      const full = path.join(directory, name);
      const stats = statSync(full);
      if (stats.isDirectory()) {
        if (!SKIPPED_DIRECTORIES.has(name)) {
          walk(full);
        }
      } else if (SCANNED_EXTENSIONS.has(path.extname(name))) {
        files.push(full);
      }
    }
  };

  for (const entry of entries) {
    const target = resolveTarget(entry);
    if (!existsSync(target)) {
      die(2, `claims: shippedCharacterScope entry is not on disk: ${entry}`);
    }
    if (statSync(target).isDirectory()) {
      walk(target);
    } else {
      files.push(target);
    }
  }
  return files;
}

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Blank out every ratified safe form — same length, so match offsets keep
 * mapping to the original line — leaving the rest of the string to be matched.
 */
function scrubAllowedPhrases(value, allowedPhrases) {
  let scrubbed = value;
  for (const { phrase } of allowedPhrases) {
    scrubbed = scrubbed.replace(
      new RegExp(escapeRegExp(phrase), 'gi'),
      (match) => ' '.repeat(match.length),
    );
  }
  return scrubbed;
}

/** A whole-word, case-insensitive matcher for a term (multi-word = phrase). */
function termPattern(term) {
  const body = term.split(/\s+/).map(escapeRegExp).join('\\s+');
  return new RegExp(`(?<![A-Za-z0-9_])${body}(?![A-Za-z0-9_])`, 'gi');
}

/**
 * A config `bannedPatterns` source compiled to a case-insensitive global
 * matcher, or `null` when the source does not compile (the validator rejects
 * that, so a null here is a defensive no-match rather than a crash).
 */
function compilePattern(source) {
  try {
    return new RegExp(source, 'gi');
  } catch {
    return null;
  }
}

const countNewlines = (text) => {
  let total = 0;
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === '\n') total += 1;
  }
  return total;
};

/** All banned-term matches in one literal, in allowed-phrase-scrubbed text. */
function termViolationsIn(literal, config) {
  const scrubbed = scrubAllowedPhrases(literal.value, config.allowedPhrases);
  const violations = [];
  for (const term of config.bannedTerms) {
    const pattern = termPattern(term);
    let match = pattern.exec(scrubbed);
    while (match !== null) {
      violations.push({
        kind: 'term',
        token: term,
        line: literal.line + countNewlines(scrubbed.slice(0, match.index)),
      });
      if (match.index === pattern.lastIndex) {
        pattern.lastIndex += 1;
      }
      match = pattern.exec(scrubbed);
    }
  }
  return violations;
}

/** All banned-pattern matches in one literal, in allowed-phrase-scrubbed text. */
function patternViolationsIn(literal, config) {
  const scrubbed = scrubAllowedPhrases(literal.value, config.allowedPhrases);
  const violations = [];
  for (const source of config.bannedPatterns) {
    const pattern = compilePattern(source);
    if (pattern === null) continue;
    let match = pattern.exec(scrubbed);
    while (match !== null) {
      violations.push({
        kind: 'pattern',
        token: source,
        line: literal.line + countNewlines(scrubbed.slice(0, match.index)),
      });
      if (match.index === pattern.lastIndex) {
        pattern.lastIndex += 1;
      }
      match = pattern.exec(scrubbed);
    }
  }
  return violations;
}

/** All banned-character occurrences in one literal. */
function characterViolationsIn(literal, config) {
  const violations = [];
  for (const character of config.bannedCharacters) {
    let index = literal.value.indexOf(character);
    while (index !== -1) {
      violations.push({
        kind: 'character',
        token: character,
        line: literal.line + countNewlines(literal.value.slice(0, index)),
      });
      index = literal.value.indexOf(character, index + 1);
    }
  }
  return violations;
}

function dedupeViolations(violations) {
  const seen = new Set();
  return violations.filter((violation) => {
    // The file is part of the identity: the same token on the same line in two
    // different files is two violations, not one.
    const id = `${violation.file}\u0000${violation.kind}\u0000${violation.token}\u0000${violation.line}`;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function main() {
  const { configPath } = parseArgs(process.argv.slice(2));
  const config = validateConfig(loadConfig(configPath), configPath);

  // The declared surfaces: unique paths, each must exist (never a silent pass).
  const surfacePaths = [];
  for (const surface of config.surfaces) {
    const absolute = resolveTarget(surface.path);
    if (!existsSync(absolute)) {
      die(
        2,
        `claims: invalid config ${configPath}: surface "${surface.key}" is not on disk: ${surface.path}`,
      );
    }
    if (!surfacePaths.includes(absolute)) {
      surfacePaths.push(absolute);
    }
  }

  const scopePaths = collectScopeFiles(config.shippedCharacterScope).filter(
    (absolute) => !surfacePaths.includes(absolute),
  );

  const violations = [];
  let checkedLiterals = 0;

  // Term and character bans over the declared set.
  for (const absolute of surfacePaths) {
    const literals = extractStrings(absolute, readSource(absolute));
    checkedLiterals += literals.length;
    for (const literal of literals) {
      for (const violation of termViolationsIn(literal, config)) {
        violations.push({ ...violation, file: displayPath(absolute) });
      }
      for (const violation of patternViolationsIn(literal, config)) {
        violations.push({ ...violation, file: displayPath(absolute) });
      }
      for (const violation of characterViolationsIn(literal, config)) {
        violations.push({ ...violation, file: displayPath(absolute) });
      }
    }
  }

  // The character ban over the wider shipped-source scope.
  for (const absolute of scopePaths) {
    const literals = extractStrings(absolute, readSource(absolute));
    checkedLiterals += literals.length;
    for (const literal of literals) {
      for (const violation of characterViolationsIn(literal, config)) {
        violations.push({ ...violation, file: displayPath(absolute) });
      }
    }
  }

  const unique = dedupeViolations(violations).sort(
    (a, b) =>
      a.file.localeCompare(b.file) ||
      a.line - b.line ||
      a.kind.localeCompare(b.kind) ||
      a.token.localeCompare(b.token),
  );

  if (unique.length === 0) {
    process.stdout.write(
      `claims: clean — ${surfacePaths.length} surfaces, ${
        surfacePaths.length + scopePaths.length
      } files, ${checkedLiterals} strings checked\n`,
    );
    return;
  }

  for (const violation of unique) {
    const label =
      violation.kind === 'character'
        ? 'banned character'
        : violation.kind === 'pattern'
          ? 'banned pattern'
          : 'banned term';
    process.stdout.write(
      `claims: ${label} ${JSON.stringify(violation.token)} — ${violation.file}:${violation.line}\n`,
    );
  }
  process.stderr.write(
    `claims: ${unique.length} violation(s) in the declared string-surface set; failing.\n`,
  );
  process.exit(1);
}

main();
