import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

import {
  SESSION_PHASES,
  SESSION_PHASE_VOCABULARY,
  SESSION_STATE_WORDS,
  assertNever,
  contentVersion,
  isEventCategory,
  isSessionPhase,
  isSessionStateWord,
  seedValuesFromParts,
  sessionMs,
  stateWordFor,
  unit,
  type Emission,
  type HuntId,
  type SessionPhase,
  type SessionStateWord,
} from '@/engine/models';
import { seedFromParts } from '@/engine/RandomEngine';

import { partsFixture } from '@/engine/__tests__/fixtures';

/**
 * The model conventions of AD-14, proved rather than asserted: brands are
 * nominal, `unit` clamps, absence is `null`, a model round-trips through JSON,
 * the `Emission` union's `default: never` arm is exhaustive, the two phase
 * ladders are distinct types, and — the MODEL_CONVENTIONS row — there is no `any`
 * and no `as` outside a brand factory anywhere in the engine's shipped source.
 */
describe('model conventions', () => {
  it('unit is the one clamping brand factory', () => {
    expect(unit(2)).toBe(1);
    expect(unit(1)).toBe(1);
    expect(unit(0.5)).toBe(0.5);
    expect(unit(0)).toBe(0);
    expect(unit(-1)).toBe(0);
  });

  it('contentVersion enforces the YYYY.MM.DD.N shape', () => {
    expect(contentVersion('2026.10.05.1')).toBe('2026.10.05.1');
    expect(() => contentVersion('2026-10-05')).toThrow(/YYYY\.MM\.DD\.N/);
    expect(() => contentVersion('2026.10.05')).toThrow(/YYYY\.MM\.DD\.N/);
  });

  it('makes each brand mutually unassignable at compile time', () => {
    const seed = seedFromParts(['nighttrace']);
    // @ts-expect-error — a Seed is not a HuntId; the brands are distinct.
    const notAHunt: HuntId = seed;
    // The runtime value is still an opaque string; only the type differs.
    expect(typeof notAHunt).toBe('string');
  });

  it('round-trips a seed-parts fixture through JSON unchanged', () => {
    const parts = partsFixture();
    expect(JSON.parse(JSON.stringify(parts))).toEqual(parts);
  });

  it('spells absence as null, never undefined', () => {
    const parts = partsFixture({ coords: null });
    expect(parts.coords).toBeNull();
    expect(parts.coords).not.toBeUndefined();
    expect(seedValuesFromParts(parts)).toContain('null');
  });

  it('Emission is a discriminated union tagged kind', () => {
    const emission: Emission = { kind: 'notice', notice: 'session_started' };
    expect(emission.kind).toBe('notice');
    // The completeness gate: a new Emission variant makes this `Record`
    // incomplete — a compile error — exactly as a consumer's `default` arm does.
    const handled: Readonly<Record<Emission['kind'], true>> = {
      notice: true,
      event: true,
      directive: true,
      phase: true,
    };
    expect(Object.keys(handled)).toEqual(['notice', 'event', 'directive', 'phase']);
  });

  it('makes every field readonly', () => {
    const emission: Emission = {
      kind: 'phase',
      phase: 'QUIET',
      stateWord: 'QUIET',
      atMs: sessionMs(0),
    };
    // @ts-expect-error — an emission's fields are readonly (AD-14).
    emission.atMs = sessionMs(1);
    expect(emission.kind).toBe('phase');
  });

  it('assertNever is the exhaustiveness gate a consumer switch ends with', () => {
    // A union mirroring the shape Emission grows into; the `default: never` arm
    // is what makes a new variant a compile error until it is handled.
    type Sample = Emission;
    const label = (sample: Sample): string => {
      switch (sample.kind) {
        case 'notice':
          return sample.notice;
        case 'event':
          return sample.definitionId;
        case 'directive':
          return sample.directiveId;
        case 'phase':
          return sample.stateWord;
        default:
          return assertNever(sample);
      }
    };
    expect(label({ kind: 'notice', notice: 'session_started' })).toBe(
      'session_started',
    );
    expect(label({ kind: 'phase', phase: 'QUIET', stateWord: 'QUIET', atMs: sessionMs(0) })).toBe(
      'QUIET',
    );
  });
});

describe('the two phase ladders are distinct types', () => {
  it('keeps the four words a different type from the five phases', () => {
    const phase: SessionPhase = 'SIGNALS';
    // @ts-expect-error — a SessionPhase is not a SessionStateWord (AD-25).
    const word: SessionStateWord = phase;
    expect(SESSION_PHASES.length).toBe(5);
    expect(SESSION_STATE_WORDS.length).toBe(4);
    // The four words are pinned in ladder order, not merely counted — the
    // hairline advances on completion, so the order is load-bearing.
    expect(SESSION_STATE_WORDS).toEqual([
      'QUIET',
      'LISTENING',
      'ACTIVE',
      'CONTACT',
    ]);
    expect(typeof word).toBe('string');
  });

  it('maps every phase to exactly one of the four words', () => {
    for (const phase of SESSION_PHASES) {
      expect(SESSION_STATE_WORDS).toContain(stateWordFor(phase));
    }
    // The mapping is not one-to-one: two phases share a word.
    const words = SESSION_PHASES.map(stateWordFor);
    expect(new Set(words).size).toBeLessThan(SESSION_PHASES.length);
  });

  it('closes the phase vocabulary at five plus the terminal ENDED, which is not a phase', () => {
    expect(SESSION_PHASE_VOCABULARY).toEqual([
      ...SESSION_PHASES,
      'ENDED',
    ]);
    expect(isSessionPhase('QUIET')).toBe(true);
    // ENDED is deliberately *not* a phase.
    expect(isSessionPhase('ENDED')).toBe(false);
    expect(isSessionStateWord('LISTENING')).toBe(true);
    expect(isSessionStateWord('SIGNALS')).toBe(false);
    expect(isEventCategory('signal')).toBe(true);
    expect(isEventCategory('paranormal')).toBe(false);
  });
});

// --- MODEL_CONVENTIONS: no `any`, no `as` outside the brand factory ----------

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENGINE_ROOT = path.resolve(HERE, '..');
const REPO_ROOT = path.resolve(HERE, '..', '..', '..');

/** Directories the sweep never descends into: tests and lint-only fixtures. */
const SKIP_DIRS = new Set(['__tests__', '__boundary_fixtures__', 'node_modules']);

/** The one file permitted an `as`: the brand factory AD-14 confines it to. */
const BRAND_FACTORY = path.join('src', 'engine', 'models', 'ids.ts');

function engineSourceFiles(): readonly string[] {
  const files: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) {
          walk(full);
        }
      } else if (entry.name.endsWith('.ts')) {
        files.push(full);
      }
    }
  };
  walk(ENGINE_ROOT);
  return files;
}

/** A cast (`x as T`) or an old angle-bracket assertion (`<T>x`), ignoring `as const`. */
function castsIn(sourceFile: ts.SourceFile): readonly string[] {
  const found: string[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isAsExpression(node) || ts.isTypeAssertionExpression(node)) {
      const typeText = node.type.getText(sourceFile).trim();
      // `as const` is a const assertion, not a type cast.
      if (typeText !== 'const') {
        found.push(node.getText(sourceFile));
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return found;
}

/** Any `any` keyword — `: any`, `<any>`, `as any`, `Array<any>`. */
function anyKeywords(sourceFile: ts.SourceFile): readonly string[] {
  const found: string[] = [];
  const visit = (node: ts.Node): void => {
    if (node.kind === ts.SyntaxKind.AnyKeyword) {
      found.push(node.getText(sourceFile));
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return found;
}

function parse(file: string): ts.SourceFile {
  return ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    /* setParentNodes */ false,
    ts.ScriptKind.TS,
  );
}

describe('MODEL_CONVENTIONS: no `any` and no `as` outside the brand factory', () => {
  const files = engineSourceFiles();

  it('sweeps the engine source tree (and finds real files)', () => {
    expect(files.length).toBeGreaterThan(5);
  });

  it('has no `any` anywhere in the engine source', () => {
    const offenders = files
      .map((file) => ({
        file: path.relative(REPO_ROOT, file),
        hits: anyKeywords(parse(file)),
      }))
      .filter((entry) => entry.hits.length > 0);
    expect(offenders).toEqual([]);
  });

  it('confines every `as` cast to the one brand factory', () => {
    const offenders = files
      .map((file) => ({
        file: path.relative(REPO_ROOT, file),
        hits: castsIn(parse(file)),
      }))
      .filter((entry) => entry.hits.length > 0)
      .filter((entry) => entry.file !== BRAND_FACTORY);
    expect(offenders).toEqual([]);
  });

  it('still has the one permitted brand factory', () => {
    const idsPath = path.join(REPO_ROOT, BRAND_FACTORY);
    expect(files).toContain(idsPath);
    expect(castsIn(parse(idsPath)).length).toBeGreaterThan(0);
  });
});
