import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

import { sessionMs, tickIndex, unit, type Emission } from '@/engine/models';
import { createInvestigationEngine } from '@/engine/InvestigationEngine';

import { engineContentFixture, sessionSeedFixture } from './fixtures';

/**
 * TENSION_HIDDEN (AD-26, NFR-12).
 *
 * Tension — and Attunement, rarity and Seed with it — is the engine's internal
 * state and is **never** displayed, announced or exposed to assistive
 * technology. Story 2.8 builds the presenter that renders the session; until it
 * exists, the two render surfaces this story can prove are (a) the emissions the
 * presenter will consume and (b) the shipped strings it will read. This test
 * fails if a hidden scalar is added to an emission (the spec's probe) or if a
 * hidden name reaches the shipped copy.
 *
 * It reads the shipped copy through `fs`, never an import: the engine may import
 * no `src/data/**` (AD-1).
 */

const HIDDEN_NAMES: readonly string[] = ['tension', 'attunement', 'rarity', 'seed'];

/** A whole-word, case-insensitive match for any hidden name. */
function hiddenNameIn(text: string): string | null {
  for (const name of HIDDEN_NAMES) {
    if (new RegExp(`\\b${name}\\b`, 'i').test(text)) {
      return name;
    }
  }
  return null;
}

/**
 * The exact, closed key set each emission variant is allowed to carry. A hidden
 * scalar added to any variant — `tension`, say — makes this fail, which is the
 * test the spec's probe drives.
 */
const ALLOWED_KEYS: Readonly<Record<Emission['kind'], readonly string[]>> = {
  notice: ['kind', 'notice'],
  event: ['kind', 'definitionId', 'category', 'atMs', 'strength'],
  directive: ['kind', 'directiveId', 'text', 'atMs'],
  phase: ['kind', 'phase', 'stateWord', 'atMs'],
};

/** Fold a full session and collect every emission the presenter would receive. */
function collectEmissions(): readonly Emission[] {
  const engine = createInvestigationEngine(sessionSeedFixture(), {
    content: engineContentFixture(),
  });
  const emissions: Emission[] = [];
  for (let index = 0; index <= 600; index += 1) {
    const result = engine.tick({
      tickIndex: tickIndex(index),
      elapsedMs: sessionMs(index * 1_000),
      movement: unit(index % 7 === 0 ? 1 : 0),
      sensorAnomaly: unit(index % 13 === 0 ? 0.8 : 0),
    });
    emissions.push(...result.emissions);
  }
  emissions.push(...engine.finish('user_finished').emissions);
  return emissions;
}

describe('TENSION_HIDDEN: no hidden scalar reaches an emission', () => {
  const emissions = collectEmissions();

  it('observes a non-trivial session (lifecycle, phase and event emissions)', () => {
    expect(emissions.length).toBeGreaterThan(2);
    expect(emissions.some((e) => e.kind === 'notice')).toBe(true);
    expect(emissions.some((e) => e.kind === 'phase')).toBe(true);
  });

  it('carries exactly the allowed keys on every emission — nothing more', () => {
    for (const emission of emissions) {
      expect(Object.keys(emission).sort()).toEqual(
        [...ALLOWED_KEYS[emission.kind]].sort(),
      );
    }
  });

  it('names no hidden scalar anywhere in a serialized emission', () => {
    for (const emission of emissions) {
      expect(hiddenNameIn(JSON.stringify(emission))).toBeNull();
    }
  });

  it('renders the phase emission as a state word, never the engine phase count', () => {
    for (const emission of emissions) {
      if (emission.kind === 'phase') {
        expect(['QUIET', 'LISTENING', 'ACTIVE', 'CONTACT']).toContain(
          emission.stateWord,
        );
        expect(Object.keys(emission)).not.toContain('tension');
      }
    }
  });
});

// --- the shipped string surfaces ---------------------------------------------

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..', '..', '..');
const STRINGS_DIR = path.join(REPO_ROOT, 'src', 'data', 'strings');
const DIRECTIVE_POOL = path.join(REPO_ROOT, 'src', 'data', 'directives', 'pool.json');
const EVENT_JSON_DIR = path.join(REPO_ROOT, 'src', 'data', 'events');
const STORE_LISTING = path.join(REPO_ROOT, 'assets', 'store', 'listing.json');
const NATIVE_CONFIG = path.join(REPO_ROOT, 'app.config.ts');

/** Every string literal value in a `.ts` source (comments are skipped). */
function stringLiteralsOf(file: string): readonly string[] {
  const sourceFile = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS,
  );
  const found: string[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      found.push(node.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return found;
}

/** Every *value* (never a key) in a parsed JSON document. */
function jsonStringValues(value: unknown): readonly string[] {
  if (typeof value === 'string') {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.flatMap(jsonStringValues);
  }
  if (typeof value === 'object' && value !== null) {
    return Object.values(value).flatMap(jsonStringValues);
  }
  return [];
}

describe('TENSION_HIDDEN: no shipped string carries a hidden name', () => {
  it('keeps every UI string table free of tension, Attunement, rarity and Seed', () => {
    const offenders: string[] = [];
    for (const file of readdirSync(STRINGS_DIR)) {
      if (!file.endsWith('.ts')) {
        continue;
      }
      for (const literal of stringLiteralsOf(path.join(STRINGS_DIR, file))) {
        const hit = hiddenNameIn(literal);
        if (hit !== null) {
          offenders.push(`${file}: ${literal} (${hit})`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it('keeps the directive pool copy free of them (its structural keys do not count)', () => {
    const parsed: unknown = JSON.parse(readFileSync(DIRECTIVE_POOL, 'utf8'));
    const offenders = jsonStringValues(parsed)
      .map((value) => ({ value, hit: hiddenNameIn(value) }))
      .filter((entry) => entry.hit !== null);
    expect(offenders).toEqual([]);
  });

  it('keeps the event copy and the declared native/store surfaces free of them', () => {
    // The hidden names are not `bannedTerms` in the claims config, so the claims
    // lint cannot catch them on these surfaces — this is the only gate that can.
    const offenders: string[] = [];
    const scanJson = (label: string, file: string): void => {
      const parsed: unknown = JSON.parse(readFileSync(file, 'utf8'));
      for (const value of jsonStringValues(parsed)) {
        const hit = hiddenNameIn(value);
        if (hit !== null) {
          offenders.push(`${label}: ${value} (${hit})`);
        }
      }
    };
    for (const file of readdirSync(EVENT_JSON_DIR)) {
      if (file.endsWith('.json')) {
        scanJson(file, path.join(EVENT_JSON_DIR, file));
      }
    }
    scanJson('listing.json', STORE_LISTING);
    for (const literal of stringLiteralsOf(NATIVE_CONFIG)) {
      const hit = hiddenNameIn(literal);
      if (hit !== null) {
        offenders.push(`app.config.ts: ${literal} (${hit})`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
