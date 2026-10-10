#!/usr/bin/env node
/**
 * The CI-blocking golden-seed replay gate (AD-3).
 *
 * Story 2.2's committed fixture — a `{ seed, hunt, contentVersion, expected }`
 * record under `src/engine/__tests__/golden/` — must replay to byte-identical
 * emissions against the *shipped* content. This script is where that is checked:
 * it loads the real `src/data/content.ts` and the real `src/engine/replay.ts`
 * (through Vite's SSR loader, because the engine is TypeScript the plain Node
 * runtime cannot import) and folds a twenty-minute session, then compares the
 * emission sequence to the committed expectation.
 *
 * `npm run golden:seed` runs it and CI appends it as its own blocking step. It
 * fails (exit 1) on any divergence — a changed table weight, a changed gap
 * distribution, a changed phase schedule — which is what makes "the engine is
 * honest about determinism" enforceable rather than aspirational.
 *
 * `node scripts/golden-seed.mjs --write` regenerates the fixture after a
 * *deliberate* content change; the regenerated file is reviewed in the same pull
 * request, exactly as the content change is.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createServer } from 'vite';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURE_PATH = path.join(
  ROOT,
  'src',
  'engine',
  '__tests__',
  'golden',
  'fixture.json',
);

/** The replay identity a fresh fixture is generated against. */
const DEFAULT_IDENTITY = {
  seed: 'golden-seed-2.2',
  huntId: 'the-watcher',
  durationMs: 1_200_000,
  tickMs: 1_000,
};

/** A stable, explicit serialization of one emission (a replay comparison key). */
function serialize(emission) {
  switch (emission.kind) {
    case 'notice':
      return { kind: 'notice', notice: emission.notice };
    case 'event':
      return {
        kind: 'event',
        definitionId: emission.definitionId,
        category: emission.category,
        atMs: emission.atMs,
        strength: emission.strength,
      };
    case 'directive':
      return {
        kind: 'directive',
        directiveId: emission.directiveId,
        text: emission.text,
        atMs: emission.atMs,
      };
    case 'phase':
      return {
        kind: 'phase',
        phase: emission.phase,
        stateWord: emission.stateWord,
        atMs: emission.atMs,
      };
    default:
      throw new Error(`golden-seed: unknown emission kind ${emission.kind}`);
  }
}

async function main() {
  const write = process.argv.includes('--write');

  const server = await createServer({
    root: ROOT,
    configFile: false,
    logLevel: 'silent',
    resolve: { alias: { '@': path.join(ROOT, 'src') } },
    server: { middlewareMode: true },
    appType: 'custom',
  });

  try {
    const content = await server.ssrLoadModule('/src/data/content.ts');
    const replay = await server.ssrLoadModule('/src/engine/replay.ts');
    const { CONTENT_VERSION } = await server.ssrLoadModule('/src/data/ContentVersion.ts');

    // On `--write` the identity is fresh; otherwise it is the committed one.
    const committed = write
      ? null
      : JSON.parse(readFileSync(FIXTURE_PATH, 'utf8'));
    const identity = committed ?? {
      ...DEFAULT_IDENTITY,
      contentVersion: CONTENT_VERSION,
    };

    // The fixture's identity triple includes the content version (AD-3). A bump
    // is the one event that breaks replay parity, so a stale fixture must fail
    // loudly rather than replay green against a version the code no longer is.
    if (committed !== null && identity.contentVersion !== CONTENT_VERSION) {
      process.stderr.write(
        `golden-seed: the fixture pins content version "${identity.contentVersion}" but the shipped content version is "${CONTENT_VERSION}".\n` +
          'A content version bump is a deliberate replay break; regenerate with ' +
          '`node scripts/golden-seed.mjs --write` and review the diff.\n',
      );
      process.exit(1);
    }

    const session = replay.replaySessionSeed({
      seed: identity.seed,
      huntId: identity.huntId,
      contentVersion: identity.contentVersion ?? CONTENT_VERSION,
    });
    // Story 2.3: the engine computes its own phase ladder, so the replay takes a
    // plain window (duration + tick rate) rather than a host phase schedule.
    const options = {
      durationMs: identity.durationMs,
      tickMs: identity.tickMs ?? replay.DEFAULT_REPLAY_TICK_MS,
    };
    const emissionSequence = replay
      .replaySession(session, content.CONTENT, options)
      .map(serialize);

    const next = {
      seed: identity.seed,
      huntId: identity.huntId,
      contentVersion: identity.contentVersion ?? CONTENT_VERSION,
      tickMs: options.tickMs,
      durationMs: options.durationMs,
      expected: emissionSequence,
    };

    if (write) {
      mkdirSync(path.dirname(FIXTURE_PATH), { recursive: true });
      writeFileSync(FIXTURE_PATH, `${JSON.stringify(next, null, 2)}\n`);
      process.stdout.write(
        `golden-seed: wrote ${path.relative(ROOT, FIXTURE_PATH)} (${emissionSequence.length} emissions)\n`,
      );
      return;
    }

    const actual = JSON.stringify(emissionSequence);
    const expected = JSON.stringify(committed.expected);
    if (actual !== expected) {
      process.stderr.write(
        'golden-seed: the committed fixture diverged from the shipped content.\n' +
          `  fixture: ${path.relative(ROOT, FIXTURE_PATH)}\n` +
          `  seed: ${identity.seed} · hunt: ${identity.huntId} · content: ${identity.contentVersion}\n` +
          '  A content change that alters firing timing is a deliberate replay break; ' +
          'regenerate with `node scripts/golden-seed.mjs --write` and review the diff.\n',
      );
      process.exit(1);
    }

    process.stdout.write(
      `golden-seed: the committed fixture replays identically (${emissionSequence.length} emissions)\n`,
    );
  } finally {
    await server.close();
  }
}

await main();
