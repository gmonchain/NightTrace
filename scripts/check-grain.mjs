#!/usr/bin/env node
/**
 * The gate on `assets/grain.png`'s byte-for-byte reproducibility.
 *
 * `scripts/generate-grain.mjs` builds the tile deterministically from a seeded
 * PRNG. This check rebuilds the tile in memory and byte-compares it to the
 * committed file, so the asset cannot silently drift from the script that
 * documents where it came from. Run with `npm run grain:check`; it runs in CI.
 */

import { readFileSync } from 'node:fs';

import { buildPng, grainTilePath } from './generate-grain.mjs';

const target = grainTilePath();
const committed = readFileSync(target);
const regenerated = buildPng();

if (!committed.equals(regenerated)) {
  process.stderr.write(
    `grain tile drift: ${target} does not match scripts/generate-grain.mjs\n`,
  );
  process.exit(1);
}

process.stdout.write(`grain tile reproducible: ${target}\n`);
