import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { parse as parseYaml } from 'yaml';

import {
  animations,
  colors,
  components,
  filters,
  fontFamilies,
  motion,
  rounded,
  spacing,
  theme,
  tokenFamilies,
  typography,
} from '../tokens';
import * as tokenModule from '../tokens';

/**
 * The AD-17 token-sync gate.
 *
 * `DESIGN.md`'s YAML frontmatter is the *design* source; `src/ui/theme/tokens.ts`
 * is the *code* source. This test asserts the two agree on every token name and
 * value, that the token set is complete (a second palette, or a family/colour/
 * type-step/component-group added to either side alone, fails), and that the
 * non-token pins the acceptance criteria name — the hold-button fills, the grain
 * opacity, the serif weight floor, the rate ceiling and the measured contrasts —
 * are read from the live source rather than retyped beside it.
 *
 * Every loud-failure path is *driven*, not merely written: the drift assertion,
 * the frontmatter extractor, the null/scalar guard, the family guards, the
 * token-reference guard and both hold-fill prose branches each have a case with
 * an input that reaches them.
 *
 * The design side is read from disk here and nowhere else; `tokens.ts` imports
 * nothing, so the shipped bundle stays parser-free.
 */

type Mapping = Readonly<Record<string, unknown>>;

/** `DESIGN.md` lives in the planning artifacts, four levels above this file. */
const DESIGN_PATH = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  '_bmad-output',
  'planning-artifacts',
  'ux-designs',
  'ux-NightTrace-2026-10-04',
  'DESIGN.md',
);

/**
 * Failure messages name their own condition. A missing family is not "cannot
 * read the design source" and a prose-shape miss is not a parse error, so each
 * has its own text rather than reusing the parse message.
 */
const FRONTMATTER_PARSE_MESSAGE =
  'AD-17: cannot read the design source — DESIGN.md has no parseable YAML frontmatter mapping';

const MISSING_FAMILY_MESSAGE = (name: string): string =>
  `AD-17: the design source has no '${name}' family (expected a mapping of token entries)`;

const HOLD_FILL_MESSAGE = (detail: string): string =>
  "AD-17: cannot read the hold-button fill durations from DESIGN.md's Components prose " +
  `(${detail})`;

const REFERENCE_MESSAGE = (reference: string): string =>
  `AD-17: '${reference}' is not a resolvable token reference ` +
  "(expected '{family.key}' naming a family the design source carries)";

function isMapping(value: unknown): value is Mapping {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** A value rendered for a failure message, `undefined` included. */
function render(value: unknown): string {
  const json = JSON.stringify(value);
  return json === undefined ? String(value) : json;
}

/**
 * Normalise the frontmatter's `px` / `pt` / `ms` / `s` / `em` / `deg` spellings
 * to plain numbers so the two sources compare values rather than units. `s`
 * converts to milliseconds (the code side stores milliseconds). A value that is
 * neither a number nor a bare measurement passes through untouched —
 * references (`'{colors.rule}'`) and hex strings included.
 */
function toNumber(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }
  const match = /^(-?\d+(?:\.\d+)?)(px|pt|ms|s|em|deg)?$/.exec(value.trim());
  if (!match || match[1] === undefined) {
    return value;
  }
  const magnitude = Number(match[1]);
  return match[2] === 's' ? magnitude * 1000 : magnitude;
}

function mapValues(
  mapping: Mapping,
  project: (value: unknown) => unknown,
): Mapping {
  return Object.fromEntries(
    Object.entries(mapping).map(([key, value]) => [key, project(value)]),
  );
}

/**
 * Structural, order-insensitive equality: objects compare by key *set* plus
 * value, so a reordered key is not drift while an added, removed or changed key
 * is. This is the one comparator every family goes through — `components`
 * included — so a token that becomes `undefined` cannot slip past a `toEqual`.
 */
function valuesEqual(left: unknown, right: unknown): boolean {
  if (Array.isArray(left) || Array.isArray(right)) {
    return (
      Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((value, index) => valuesEqual(value, right[index]))
    );
  }
  if (isMapping(left) || isMapping(right)) {
    if (!isMapping(left) || !isMapping(right)) {
      return false;
    }
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    if (leftKeys.length !== rightKeys.length) {
      return false;
    }
    return leftKeys.every(
      (key) => key in right && valuesEqual(left[key], right[key]),
    );
  }
  return left === right;
}

/**
 * The shipped drift assertion. Its message carries all three facts AD-17 names —
 * the token path, the design value and the code value.
 */
function expectSynced(
  tokenPath: string,
  designValue: unknown,
  codeValue: unknown,
): void {
  if (!valuesEqual(designValue, codeValue)) {
    throw new Error(
      `AD-17 token drift at ${tokenPath}: ` +
        `design=${render(designValue)} code=${render(codeValue)}`,
    );
  }
}

/**
 * The design source's own families: every top-level key whose value is a
 * mapping of token entries. Derived from the source's *shape*, never from a
 * fixed list, so a sixth mapping-valued family added to `DESIGN.md` is a key
 * the completeness check catches — no allow-list excuses it, whatever its name.
 *
 * Metadata keys (`name`, `description`, `status`, `updated`) are scalars and
 * `sources` is a sequence, so none is a family.
 */
function designFamilyKeys(design: Mapping): readonly string[] {
  return Object.keys(design).filter((key) => isMapping(design[key]));
}

/**
 * The shipped completeness assertion, fed the design side's own family keys and
 * the code side's. It is a function — not an inline expression — so the passing
 * case and the second-palette/sixth-family cases all drive this one path; a
 * test-local copy would prove only itself.
 */
function assertFamiliesComplete(
  designKeys: readonly string[],
  codeKeys: readonly string[],
): void {
  const design = new Set(designKeys);
  const code = new Set(codeKeys);
  const designOnly = [...design].filter((key) => !code.has(key));
  const codeOnly = [...code].filter((key) => !design.has(key));
  if (designOnly.length > 0 || codeOnly.length > 0) {
    throw new Error(
      'AD-17 completeness: the two sources disagree on the token families — ' +
        `design-only [${designOnly.join(', ')}], code-only [${codeOnly.join(', ')}]`,
    );
  }
}

/** Fetch one family from the design side, guarding it is a mapping first. */
function designFamily(design: Mapping, name: string): Mapping {
  const family = design[name];
  if (!isMapping(family)) {
    throw new Error(MISSING_FAMILY_MESSAGE(name));
  }
  return family;
}

/**
 * Normalise a whole family for comparison. Values are the only thing normalised
 * — never *which keys exist* — so a key appended to either source stays visible
 * and fails the parity check.
 */
function normalizeFamily(name: string, family: Mapping): Mapping {
  if (name === 'colors') {
    return family;
  }
  if (name === 'typography' || name === 'components') {
    return mapValues(family, (entry) =>
      isMapping(entry) ? mapValues(entry, toNumber) : entry,
    );
  }
  return mapValues(family, toNumber);
}

/**
 * Assert one family agrees name-for-name and value-for-value, in both
 * directions, including inner-key parity: a colour, a type step or a component
 * group appended to `DESIGN.md` alone is `design-only`, and one appended to the
 * code side alone is `code-only`.
 */
function assertFamilySynced(
  familyName: string,
  designSide: Mapping,
  codeSide: Mapping,
): void {
  const designKeys = Object.keys(designSide);
  const codeKeys = Object.keys(codeSide);
  const designOnly = designKeys.filter((key) => !codeKeys.includes(key));
  const codeOnly = codeKeys.filter((key) => !designKeys.includes(key));
  if (designOnly.length > 0 || codeOnly.length > 0) {
    throw new Error(
      `AD-17 completeness in '${familyName}': ` +
        `design-only [${designOnly.join(', ')}], code-only [${codeOnly.join(', ')}]`,
    );
  }
  for (const key of designKeys) {
    expectSynced(`${familyName}.${key}`, designSide[key], codeSide[key]);
  }
}

/**
 * `components` needs one level more than the generic comparator: each group's
 * inner keys are compared in both directions. The single permitted code-only key
 * is `hold-button.fillDurations`, whose design source is the Components *prose*
 * (asserted by `readHoldFillDurations` below), not the frontmatter. Every other
 * code-side key must be mirrored in the design source, so a `holdButton.ringWidth`
 * fails here.
 */
function assertComponentsSynced(
  designComponents: Mapping,
  codeComponents: Mapping,
): void {
  const designGroups = Object.keys(designComponents);
  const codeGroups = Object.keys(codeComponents);
  const groupsDesignOnly = designGroups.filter(
    (key) => !codeGroups.includes(key),
  );
  const groupsCodeOnly = codeGroups.filter(
    (key) => !designGroups.includes(key),
  );
  if (groupsDesignOnly.length > 0 || groupsCodeOnly.length > 0) {
    throw new Error(
      "AD-17 completeness in 'components': " +
        `design-only [${groupsDesignOnly.join(', ')}], ` +
        `code-only [${groupsCodeOnly.join(', ')}]`,
    );
  }
  for (const groupName of designGroups) {
    const designGroup = designComponents[groupName];
    const codeGroup = codeComponents[groupName];
    if (!isMapping(designGroup) || !isMapping(codeGroup)) {
      expectSynced(`components.${groupName}`, designGroup, codeGroup);
      continue;
    }
    const exempt = groupName === 'hold-button' ? ['fillDurations'] : [];
    const designKeys = Object.keys(designGroup);
    const codeKeys = Object.keys(codeGroup);
    const designOnly = designKeys.filter((key) => !codeKeys.includes(key));
    const codeOnly = codeKeys.filter(
      (key) => !designKeys.includes(key) && !exempt.includes(key),
    );
    if (designOnly.length > 0 || codeOnly.length > 0) {
      throw new Error(
        `AD-17 completeness in 'components.${groupName}': ` +
          `design-only [${designOnly.join(', ')}], code-only [${codeOnly.join(', ')}]`,
      );
    }
    for (const key of designKeys) {
      expectSynced(
        `components.${groupName}.${key}`,
        designGroup[key],
        codeGroup[key],
      );
    }
  }
}

/**
 * Resolve a `'{family.key}'` reference against the design source, validating
 * the reference's *shape* first. A third segment or an unknown family raises
 * the named reference error rather than a raw `TypeError` from indexing.
 */
function resolveReference(reference: string, families: Mapping): unknown {
  const match = /^\{([^{}]+)\}$/.exec(reference);
  const parts = match?.[1]?.split('.') ?? [];
  if (parts.length !== 2) {
    throw new Error(REFERENCE_MESSAGE(reference));
  }
  const [familyKey, tokenKey] = parts;
  if (familyKey === undefined || tokenKey === undefined) {
    throw new Error(REFERENCE_MESSAGE(reference));
  }
  const target = families[familyKey];
  if (!isMapping(target) || !(tokenKey in target)) {
    throw new Error(REFERENCE_MESSAGE(reference));
  }
  return target[tokenKey];
}

/**
 * Extract the frontmatter block. Both delimiters are anchored: the opening one
 * must be the document's *first* line, so a document with no frontmatter (only
 * a later `---` rule) cannot be read as though it had one, and the closing one
 * must sit at a line start, so a mid-line `---` cannot truncate the block.
 */
function extractFrontmatter(source: string): string {
  const normalized = source.replace(/^﻿/, '');
  const firstBreak = normalized.indexOf('\n');
  const firstLine =
    firstBreak === -1 ? normalized : normalized.slice(0, firstBreak);
  if (!/^---[ \t]*\r?$/.test(firstLine)) {
    throw new Error(`${FRONTMATTER_PARSE_MESSAGE} (its first line is not '---')`);
  }
  const rest = firstBreak === -1 ? '' : normalized.slice(firstBreak + 1);
  const closing = /^---[ \t]*\r?$/m.exec(rest);
  if (closing === null) {
    throw new Error(
      `${FRONTMATTER_PARSE_MESSAGE} (the opening '---' has no closing line)`,
    );
  }
  return rest.slice(0, closing.index);
}

/**
 * Parse a source string's frontmatter into a mapping. The null/scalar guard
 * lives here, in the shipped path — a block that parses to `null` or a scalar
 * raises the named parse error rather than a bare `TypeError` at a later
 * `design.colors`.
 */
function parseDesignFrontmatter(source: string): Mapping {
  const parsed: unknown = parseYaml(extractFrontmatter(source));
  if (!isMapping(parsed)) {
    throw new Error(
      `${FRONTMATTER_PARSE_MESSAGE} (the block parsed to ${render(
        parsed,
      )}, not a mapping)`,
    );
  }
  return parsed;
}

/**
 * Read and parse `DESIGN.md`'s frontmatter. A missing file, an absent block and
 * a block that parses to `null` or a scalar all raise the named parse error.
 */
function readDesignFrontmatter(filePath: string): Mapping {
  let raw: string;
  try {
    raw = readFileSync(filePath, 'utf8');
  } catch (error) {
    throw new Error(
      `${FRONTMATTER_PARSE_MESSAGE} (reading ${filePath}: ${
        (error as Error).message
      })`,
    );
  }
  return parseDesignFrontmatter(raw);
}

/**
 * The hold-button fills live in `DESIGN.md`'s **Components prose**, not its
 * frontmatter — so the pin reads them from the live sentence, which is the
 * point: a frontmatter-only pin cannot see prose drift.
 *
 * The read is scoped to the Components section and requires exactly one sentinel
 * per gesture, so an earlier same-shaped sentence elsewhere cannot re-point the
 * gate. Both throw branches — no `## Components` section, and no HOLD/SEAL
 * sentence inside it — carry the prose message, which is not a parse error.
 */
function readHoldFillDurations(source: string): {
  readonly enterMs: number;
  readonly sealMs: number;
} {
  const heading = /^## Components[ \t]*\r?$/m.exec(source);
  if (heading === null) {
    throw new Error(HOLD_FILL_MESSAGE("there is no '## Components' section"));
  }
  const after = source.slice(heading.index + heading[0].length);
  const nextHeading = /^## [A-Za-z]/m.exec(after);
  const body = nextHeading === null ? after : after.slice(0, nextHeading.index);

  const collect = (pattern: RegExp): readonly number[] =>
    [...body.matchAll(pattern)].map((entry) => Number(entry[1]));

  const holds = collect(/(\d+)\s*ms\s+for\s+`HOLD TO ENTER THE FIELD`/g);
  const seals = collect(/(\d+)\s*ms\s+for\s+`SEAL & FILE`/g);
  if (holds.length !== 1 || seals.length !== 1) {
    throw new Error(
      HOLD_FILL_MESSAGE(
        `the Components section carries ${holds.length} HOLD and ${seals.length} SEAL sentence(s), expected exactly one of each`,
      ),
    );
  }
  return { enterMs: holds[0] as number, sealMs: seals[0] as number };
}

/** Relative luminance, WCAG 2.x. */
function relativeLuminance(hex: string): number {
  const value = Number.parseInt(hex.slice(1), 16);
  const channels = [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  const [red, green, blue] = channels.map((channel) => {
    const scaled = channel / 255;
    return scaled <= 0.03928
      ? scaled / 12.92
      : ((scaled + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground: string, background: string): number {
  const lighter = Math.max(
    relativeLuminance(foreground),
    relativeLuminance(background),
  );
  const darker = Math.min(
    relativeLuminance(foreground),
    relativeLuminance(background),
  );
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Write a source string to a throwaway `DESIGN.md`, run `body` against that
 * path, then clean up. Driving the shipped readers from a real file is what
 * proves the guard a *copy* would only imitate.
 */
function withTempDesign(source: string, body: (file: string) => void): void {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'nighttrace-design-'));
  const file = path.join(directory, 'DESIGN.md');
  writeFileSync(file, source, 'utf8');
  try {
    body(file);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

/** The design source, read once for the whole suite. */
const design = readDesignFrontmatter(DESIGN_PATH);
const designSource = readFileSync(DESIGN_PATH, 'utf8');

describe('the design source parses', () => {
  it('carries the expected top-level keys', () => {
    expect(Object.keys(design).sort()).toEqual(
      [
        'colors',
        'components',
        'description',
        'motion',
        'name',
        'rounded',
        'sources',
        'spacing',
        'status',
        'typography',
        'updated',
      ].sort(),
    );
  });

  it('resolves DESIGN.md from __dirname', () => {
    expect(DESIGN_PATH.endsWith('ux-NightTrace-2026-10-04/DESIGN.md')).toBe(
      true,
    );
  });

  describe('extractFrontmatter', () => {
    it('returns the block between the delimiters', () => {
      expect(extractFrontmatter('---\nkey: 1\n---\n')).toBe('key: 1\n');
    });

    it('anchors the opening delimiter to the very first line', () => {
      // No frontmatter — only a later `---` rule. Reading it as a block would
      // let a document with no frontmatter pass as though it had one.
      expect(() => extractFrontmatter('# Title\n\n---\nkey: 1\n---\n')).toThrow(
        FRONTMATTER_PARSE_MESSAGE,
      );
    });

    it('anchors the closing delimiter to a line start', () => {
      // The interior `---` is mid-line, so it is not the closing delimiter and
      // must not truncate the block.
      expect(extractFrontmatter('---\na: x --- y\nb: 2\n---\n')).toBe(
        'a: x --- y\nb: 2\n',
      );
    });

    it('fails loudly when there is no closing delimiter', () => {
      expect(() => extractFrontmatter('---\nkey: 1\n')).toThrow(
        FRONTMATTER_PARSE_MESSAGE,
      );
    });
  });

  describe('readDesignFrontmatter', () => {
    it('reads the real DESIGN.md into a mapping', () => {
      expect(isMapping(design)).toBe(true);
      expect(isMapping(design.colors)).toBe(true);
    });

    it('fails loudly when the file is missing', () => {
      expect(() =>
        readDesignFrontmatter(path.join(__dirname, 'no-such-DESIGN.md')),
      ).toThrow(FRONTMATTER_PARSE_MESSAGE);
    });

    // Driven through the shipped `readDesignFrontmatter` end to end, from a real
    // file, with a fixture that reaches the guard. `'---\n---\n'` would fail
    // inside `extractFrontmatter` first and so proves nothing about the guard; a
    // blank line inside the block parses to `null`, which arrives at
    // `readDesignFrontmatter`'s guard. Delete the guard and this case fails.
    it('raises the named parse error when the block parses to null', () => {
      expect(parseYaml(extractFrontmatter('---\n\n---\n'))).toBeNull();
      withTempDesign('---\n\n---\n', (file) => {
        expect(() => readDesignFrontmatter(file)).toThrow(
          FRONTMATTER_PARSE_MESSAGE,
        );
      });
    });

    it('raises the named parse error when the block parses to a scalar', () => {
      withTempDesign('---\njust a string\n---\n', (file) => {
        expect(() => readDesignFrontmatter(file)).toThrow(
          FRONTMATTER_PARSE_MESSAGE,
        );
      });
    });

    it('names the null/scalar guard, not a bare TypeError', () => {
      withTempDesign('---\n\n---\n', (file) => {
        expect(() => readDesignFrontmatter(file)).toThrow(/not a mapping/);
      });
    });
  });

  describe('family guards', () => {
    it('raises the named family error when a family is absent', () => {
      expect(() => designFamily({}, 'colors')).toThrow(
        MISSING_FAMILY_MESSAGE('colors'),
      );
    });

    it('raises the named family error when a family is not a mapping', () => {
      expect(() => designFamily({ colors: '#FFFFFF' }, 'colors')).toThrow(
        MISSING_FAMILY_MESSAGE('colors'),
      );
      expect(() => designFamily({ typography: [] }, 'typography')).toThrow(
        MISSING_FAMILY_MESSAGE('typography'),
      );
      expect(() => designFamily({ components: 7 }, 'components')).toThrow(
        MISSING_FAMILY_MESSAGE('components'),
      );
    });
  });
});

describe('the two sources agree on every family', () => {
  const familyCases = [
    'colors',
    'typography',
    'spacing',
    'rounded',
    'motion',
  ] as const;

  it.each(familyCases)('%s matches name-for-name and value-for-value', (name) => {
    const designSide = normalizeFamily(name, designFamily(design, name));
    const codeSide = normalizeFamily(name, tokenFamilies[name]);
    expect(() => assertFamilySynced(name, designSide, codeSide)).not.toThrow();
  });

  it('components matches, group-for-group and key-for-key', () => {
    const designSide = normalizeFamily(
      'components',
      designFamily(design, 'components'),
    );
    const codeSide = normalizeFamily('components', components);
    expect(() => assertComponentsSynced(designSide, codeSide)).not.toThrow();
  });

  it('declares the accepted counts', () => {
    expect(Object.keys(colors)).toHaveLength(14);
    expect(Object.keys(typography)).toHaveLength(9);
    expect(Object.keys(spacing)).toHaveLength(9);
    expect(Object.keys(rounded)).toHaveLength(5);
    expect(Object.keys(motion)).toHaveLength(8);
    expect(Object.keys(components)).toHaveLength(12);
    expect(Object.keys(filters.ntInk.steps)).toHaveLength(5);
    expect(components.grain.opacity).toBe(0.55);
  });

  it('pins the hold-button height and the grain opacity to the source', () => {
    const designComponents = designFamily(design, 'components');
    const designHold = designFamily(designComponents, 'hold-button');
    const designGrain = designFamily(designComponents, 'grain');
    expect(toNumber(designHold.height)).toBe(components['hold-button'].height);
    expect(designGrain.opacity).toBe(components.grain.opacity);
  });

  it('compares order-insensitively but never ignores a key', () => {
    expect(valuesEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
    expect(valuesEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(valuesEqual({ a: 1, b: undefined }, { a: 1 })).toBe(false);
  });

  it('names the two families once', () => {
    expect(fontFamilies.serif).toBe('Newsreader');
    expect(fontFamilies.mono).toBe('IBM Plex Mono');
    expect(typography.display.fontFamily).toBe(fontFamilies.serif);
    expect(typography.stamp.fontFamily).toBe(fontFamilies.mono);
  });
});

describe('the completeness check', () => {
  it('enumerates the design source’s own mapping-valued families', () => {
    expect([...designFamilyKeys(design)].sort()).toEqual([
      'colors',
      'components',
      'motion',
      'rounded',
      'spacing',
      'typography',
    ]);
  });

  it('passes when fed the design source’s own families', () => {
    expect(() =>
      assertFamiliesComplete(
        designFamilyKeys(design),
        Object.keys(tokenFamilies),
      ),
    ).not.toThrow();
  });

  it('exports no mapping-valued key beyond tokenFamilies', () => {
    const exported = Object.entries(theme)
      .filter(([, value]) => isMapping(value))
      .map(([key]) => key)
      .sort();
    expect(exported).toEqual([...Object.keys(tokenFamilies)].sort());
  });

  // `theme` is a hand-written object, so a palette *exported from the module*
  // but omitted from both `theme` and `tokenFamilies` would escape a check that
  // only enumerates `theme`. Enumerate the module's own bindings, and name the
  // exports that are deliberately not token families.
  const NON_FAMILY_EXPORTS = [
    'fontFamilies',
    'animations',
    'filters',
    'tokenFamilies',
    'theme',
  ];

  function moduleFamilies(moduleExports: Mapping): readonly string[] {
    return Object.entries(moduleExports)
      .filter(([, value]) => isMapping(value))
      .map(([key]) => key)
      .filter((key) => !NON_FAMILY_EXPORTS.includes(key))
      .sort();
  }

  it('exports no mapping-valued binding beyond tokenFamilies', () => {
    expect(moduleFamilies(tokenModule)).toEqual(
      [...Object.keys(tokenFamilies)].sort(),
    );
  });

  it('would fail a palette exported from the module but omitted from tokenFamilies', () => {
    const smuggled = moduleFamilies({
      ...tokenModule,
      badges: { rare: '#112233' },
    });
    expect(smuggled).toContain('badges');
    expect(smuggled).not.toEqual([...Object.keys(tokenFamilies)].sort());
  });

  // Both palette cases drive the *shipped* enumerator and the *shipped*
  // assertion — never a test-local re-implementation — so deleting either fails
  // the suite.
  it('fails when a second palette is added to the design source', () => {
    const extended = {
      ...design,
      badges: { rare: '#112233', common: '#445566' },
    };
    expect(() =>
      assertFamiliesComplete(
        designFamilyKeys(extended),
        Object.keys(tokenFamilies),
      ),
    ).toThrow(/badges/);
  });

  it('fails when a second palette is added to the code source', () => {
    expect(() =>
      assertFamiliesComplete(designFamilyKeys(design), [
        ...Object.keys(tokenFamilies),
        'badges',
      ]),
    ).toThrow(/badges/);
  });

  it('fails when a colour is appended to the design source alone', () => {
    const designColors = designFamily(design, 'colors');
    expect(() =>
      assertFamilySynced(
        'colors',
        { ...designColors, crimson: '#FF0000' },
        colors,
      ),
    ).toThrow(/crimson/);
  });

  it('fails when a colour is appended to the code source alone', () => {
    const designColors = designFamily(design, 'colors');
    expect(() =>
      assertFamilySynced('colors', designColors, {
        ...colors,
        crimson: '#FF0000',
      }),
    ).toThrow(/crimson/);
  });

  it('fails when a type step is appended to the design source alone', () => {
    const designTypography = designFamily(design, 'typography');
    expect(() =>
      assertFamilySynced(
        'typography',
        { ...designTypography, caption: { fontFamily: 'Newsreader' } },
        normalizeFamily('typography', typography),
      ),
    ).toThrow(/caption/);
  });

  it('fails when a type step is appended to the code source alone', () => {
    const designTypography = designFamily(design, 'typography');
    expect(() =>
      assertFamilySynced(
        'typography',
        designTypography,
        normalizeFamily('typography', {
          ...typography,
          caption: { fontFamily: 'Newsreader', fontSize: 11, fontWeight: 400 },
        }),
      ),
    ).toThrow(/caption/);
  });

  it('fails on a code-side extra field inside a type step', () => {
    const designStep = designFamily(
      designFamily(design, 'typography'),
      'display',
    );
    expect(() =>
      assertFamilySynced(
        'typography.display',
        designStep,
        mapValues({ ...designStep, fontSizeMono: 12 }, toNumber),
      ),
    ).toThrow(/fontSizeMono/);
  });

  it('fails on a design-side extra field inside a type step', () => {
    const designStep = designFamily(
      designFamily(design, 'typography'),
      'display',
    );
    const codeStep = designFamily(
      normalizeFamily('typography', typography),
      'display',
    );
    expect(() =>
      assertFamilySynced(
        'typography.display',
        mapValues({ ...designStep, fontStyle: 'italic' }, toNumber),
        codeStep,
      ),
    ).toThrow(/fontStyle/);
  });

  it('fails when a component group is appended to the design source alone', () => {
    const designComponents = normalizeFamily(
      'components',
      designFamily(design, 'components'),
    );
    expect(() =>
      assertComponentsSynced(
        { ...designComponents, toast: { surface: '{colors.ledger}' } },
        components,
      ),
    ).toThrow(/toast/);
  });

  it('fails when a component group is appended to the code source alone', () => {
    const designComponents = normalizeFamily(
      'components',
      designFamily(design, 'components'),
    );
    expect(() =>
      assertComponentsSynced(designComponents, {
        ...components,
        toast: { surface: '{colors.ledger}' },
      }),
    ).toThrow(/toast/);
  });

  it('fails on an unmirrored code-side key inside a component group', () => {
    const designComponents = normalizeFamily(
      'components',
      designFamily(design, 'components'),
    );
    expect(() =>
      assertComponentsSynced(designComponents, {
        ...components,
        'hold-button': { ...components['hold-button'], ringWidth: 2 },
      }),
    ).toThrow(/ringWidth/);
  });

  it('fails on an unmirrored design-side key inside a component group', () => {
    const designComponents = normalizeFamily(
      'components',
      designFamily(design, 'components'),
    );
    expect(() =>
      assertComponentsSynced(
        { ...designComponents, grain: { opacity: 0.55, seed: 3 } },
        components,
      ),
    ).toThrow(/seed/);
  });
});

describe('the gate fails loudly', () => {
  it('names the token path, the design value and the code value', () => {
    expect(() => expectSynced('colors.night', '#060A08', '#060A07')).toThrow(
      'AD-17 token drift at colors.night: design="#060A08" code="#060A07"',
    );
  });

  it('fires when a code-side token is undefined', () => {
    expect(() =>
      expectSynced('components.hold-button.height', 50, undefined),
    ).toThrow('components.hold-button.height');
  });

  it('fires when a family is missing from the code side', () => {
    expect(() =>
      expectSynced('colors', designFamily(design, 'colors'), undefined),
    ).toThrow(/design=\{.*\} code=undefined/);
  });
});

describe('the hold-button fill durations', () => {
  it('reads both fills from the live Components prose', () => {
    const fills = readHoldFillDurations(designSource);
    expect(fills.enterMs).toBe(components['hold-button'].fillDurations.enterMs);
    expect(fills.sealMs).toBe(components['hold-button'].fillDurations.sealMs);
  });

  it('fails loudly when the prose duration drifts', () => {
    const drifted = designSource.replace(
      /800ms for `HOLD TO ENTER THE FIELD`/,
      '900ms for `HOLD TO ENTER THE FIELD`',
    );
    expect(drifted).not.toBe(designSource);
    const fills = readHoldFillDurations(drifted);
    expect(fills.enterMs).toBe(900);
    expect(fills.enterMs).not.toBe(
      components['hold-button'].fillDurations.enterMs,
    );
  });

  it('scopes the read to the Components section', () => {
    // A same-shaped decoy sentence placed *before* the Components section must
    // not re-point the gate.
    const decoyed = designSource.replace(
      '## Brand & Style',
      '## Motion\n\nA decoy: 123ms for `HOLD TO ENTER THE FIELD`.\n\n## Brand & Style',
    );
    expect(decoyed).not.toBe(designSource);
    const fills = readHoldFillDurations(decoyed);
    expect(fills.enterMs).toBe(components['hold-button'].fillDurations.enterMs);
  });

  it('throws with its own message when there is no Components section', () => {
    expect(() => readHoldFillDurations('## Motion\n\nnothing here\n')).toThrow(
      /cannot read the hold-button fill durations/,
    );
  });

  it('throws with its own message when the prose carries no HOLD/SEAL sentence', () => {
    expect(() =>
      readHoldFillDurations('## Components\n\nNo hold sentence here.\n'),
    ).toThrow(/cannot read the hold-button fill durations/);
  });

  it('does not reuse the parse message for a prose-shape miss', () => {
    let message = '';
    try {
      readHoldFillDurations('## Components\n\nnothing\n');
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).not.toContain(FRONTMATTER_PARSE_MESSAGE);
  });
});

describe('the serif weight floor', () => {
  it('ships no Newsreader step above weight 500', () => {
    const designTypography = designFamily(design, 'typography');
    const serifSteps = Object.entries(designTypography).filter(
      ([, step]) => isMapping(step) && step.fontFamily === 'Newsreader',
    );
    expect(serifSteps.length).toBeGreaterThan(0);
    for (const [, step] of serifSteps) {
      if (!isMapping(step)) {
        continue;
      }
      expect(typeof step.fontWeight).toBe('number');
      expect(Number(step.fontWeight)).toBeLessThanOrEqual(500);
    }
  });

  it('reads the floor from the live source, not a literal', () => {
    const designTypography = designFamily(design, 'typography');
    const weights = Object.values(designTypography)
      .filter((step) => isMapping(step) && step.fontFamily === 'Newsreader')
      .map((step) =>
        isMapping(step) ? Number(step.fontWeight) : Number.NaN,
      );
    expect(Math.max(...weights)).toBeLessThanOrEqual(500);
  });
});

describe('the named animations', () => {
  it('reads the loops’ periods from motion', () => {
    expect(animations.ntBreathe.durationMs).toBe(motion.breathe);
    expect(animations.ntDot.durationMs).toBe(motion.dot);
    expect(animations.ntPulse.durationMs).toBe(motion.pulse);
    expect(animations.ntUp.durationMs).toBe(motion.enter);
    expect(animations.ntFade.durationMs).toBe(motion.enter);
  });

  it('encodes the rate ceiling as data: only ntDot and ntPulse beat ntBreathe', () => {
    const fasterLoops = Object.entries(animations)
      .filter(
        ([name, animation]) =>
          name !== 'ntBreathe' &&
          animation.loops &&
          animation.durationMs < animations.ntBreathe.durationMs,
      )
      .map(([name]) => name)
      .sort();
    expect(fasterLoops).toEqual(['ntDot', 'ntPulse']);
  });
});

describe('the ntInk filter is a shared token', () => {
  it('resolves the seal’s distortion reference to a real filter key', () => {
    expect(components.seal.distortion).toBe('ntInk');
    expect(Object.keys(filters)).toContain(components.seal.distortion);
  });

  it('carries the prototype’s turbulence/displacement parameters', () => {
    const steps = filters.ntInk.steps;
    expect(steps[0]).toMatchObject({
      primitive: 'feTurbulence',
      baseFrequency: 0.04,
      numOctaves: 2,
      seed: 3,
    });
    expect(steps[1]).toMatchObject({
      primitive: 'feDisplacementMap',
      scale: 3.5,
    });
  });

  it('resolves a well-formed reference against the design source', () => {
    const designComponents = designFamily(design, 'components');
    const designRule = designFamily(designComponents, 'rule');
    expect(resolveReference(String(designRule.color), design)).toBe(
      colors.rule,
    );
  });

  it('raises the named reference error for a third segment', () => {
    expect(() => resolveReference('{colors.rule.soft}', design)).toThrow(
      REFERENCE_MESSAGE('{colors.rule.soft}'),
    );
  });

  it('raises the named reference error for an unknown family', () => {
    expect(() => resolveReference('{nope.thing}', design)).toThrow(
      REFERENCE_MESSAGE('{nope.thing}'),
    );
  });

  it('raises the named reference error for a malformed reference', () => {
    expect(() => resolveReference('colors.rule', design)).toThrow(
      REFERENCE_MESSAGE('colors.rule'),
    );
  });
});

describe('measured contrast (AD-28)', () => {
  // The expected values are read from the design source's own tokens, not
  // literals taken on the code side alone.
  it('measures ash on night above the 4.5:1 AA body-text floor', () => {
    const designColors = designFamily(design, 'colors');
    const ratio = contrastRatio(String(designColors.ash), String(designColors.night));
    expect(ratio).toBeGreaterThanOrEqual(4.5);
    expect(Number(ratio.toFixed(2))).toBe(6.27);
    expect(ratio).toBe(contrastRatio(colors.ash, colors.night));
  });

  it('measures dim on night above the 3:1 large-text floor but below AA body', () => {
    const designColors = designFamily(design, 'colors');
    const ratio = contrastRatio(String(designColors.dim), String(designColors.night));
    expect(ratio).toBeGreaterThanOrEqual(3);
    expect(ratio).toBeLessThan(4.5);
    expect(Number(ratio.toFixed(2))).toBe(3.49);
  });
});

describe('the token module stays dependency-free', () => {
  const TOKENS_PATH = path.resolve(__dirname, '..', 'tokens.ts');

  it('imports nothing and requires nothing', () => {
    const source = readFileSync(TOKENS_PATH, 'utf8');
    // A `from 'yaml'` grep would miss `export * from 'yaml'` and a dynamic
    // `import()`; asserting the module has no import or require statement at
    // all is the honest form of "dependency-free". The bundle probe
    // (`npm run bundle`) is the byte-level evidence.
    expect(/^\s*import\b/m.test(source)).toBe(false);
    expect(/^\s*export\s+.*\bfrom\b/m.test(source)).toBe(false);
    expect(/\brequire\s*\(/.test(source)).toBe(false);
  });
});
