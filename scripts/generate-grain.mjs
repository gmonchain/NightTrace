#!/usr/bin/env node
/**
 * Deterministic authoring script for `assets/grain.png`.
 *
 * `DESIGN.md` describes the grain as a `feTurbulence` fractal-noise tile
 * (180×180, `baseFrequency .85`, two octaves). `react-native-svg@15.15.4`
 * returns `null` for `FeTurbulence`, so a filter-declared grain would render
 * nothing at all on device — and unlike the `Seal`, the grain has no other
 * visible part. This script produces the native equivalent: a pre-rendered,
 * byte-identical-on-every-run tile that is a structural answer to "it never
 * animates".
 *
 * **What the tile reproduces.** The reference prototype's grain is the same
 * two-octave fractal noise pushed through an `feColorMatrix` that sets a
 * constant colour and scales the alpha (`0 0 0 .05 0`). The tile keeps that
 * structure but moves the constant colour to the render layer's `tintColor`, so
 * the committed image is **greyscale-with-alpha** (PNG colour type 4): the grey
 * channel is a flat mask and the alpha channel is the fractal noise scaled by
 * the prototype's own `0.05` coefficient. The mask is tinted warm at render and
 * composited at `components.grain.opacity`.
 *
 * **Reproducibility.** The noise is drawn from a seeded integer hash (no
 * `Math.random`) and the PNG is built by hand, so regenerating the tile produces
 * the same bytes. `npm run grain:check` regenerates the tile and byte-compares
 * it to the committed `assets/grain.png`; it runs in CI, so the committed tile
 * cannot silently drift from this script.
 */

import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const TILE = 180;
/** Cycles per pixel, from the design source's `feTurbulence baseFrequency`. */
const BASE_FREQUENCY = 0.85;
const OCTAVES = 2;
/** The PRNG seed — a constant so the tile is a pure function of this script. */
const SEED = 0x9e37;
/** The mask's grey level; the warm tint is applied at render. */
const GREY = 0xff;
/** The prototype's `feColorMatrix` alpha coefficient. */
const ALPHA_SCALE = 0.05;

/** A deterministic 32-bit integer hash in `[0, 1)`. */
function hash(x, y, octave) {
  let h =
    Math.imul(x | 0, 374761393) +
    Math.imul(y | 0, 668265263) +
    Math.imul(octave + 1, 2246822519) +
    Math.imul(SEED, 3266489917);
  h = (h ^ (h >>> 13)) >>> 0;
  h = Math.imul(h, 1274126177) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return h / 4294967296;
}

/** Smoothstep, so the lattice interpolation has no visible grid seams. */
function smooth(t) {
  return t * t * (3 - 2 * t);
}

/** One octave of value noise at `frequency` cycles per pixel. */
function octaveAt(x, y, frequency, octave) {
  const gx = x * frequency;
  const gy = y * frequency;
  const x0 = Math.floor(gx);
  const y0 = Math.floor(gy);
  const fx = smooth(gx - x0);
  const fy = smooth(gy - y0);
  const v00 = hash(x0, y0, octave);
  const v10 = hash(x0 + 1, y0, octave);
  const v01 = hash(x0, y0 + 1, octave);
  const v11 = hash(x0 + 1, y0 + 1, octave);
  const top = v00 + (v10 - v00) * fx;
  const bottom = v01 + (v11 - v01) * fx;
  return top + (bottom - top) * fy;
}

/** Two-octave fractal noise, normalised to `[0, 1]`. */
function fractalNoise(x, y) {
  let sum = 0;
  let amplitude = 1;
  let total = 0;
  for (let octave = 0; octave < OCTAVES; octave += 1) {
    const frequency = BASE_FREQUENCY * 2 ** octave;
    sum += octaveAt(x, y, frequency, octave) * amplitude;
    total += amplitude;
    amplitude /= 2;
  }
  return sum / total;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/** A big-endian 32-bit unsigned value, as four bytes. */
function u32(value) {
  return new Uint8Array([
    (value >>> 24) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff,
  ]);
}

/** ASCII bytes — used for chunk type names, which are always four Latin-1 chars. */
function ascii(text) {
  const out = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i += 1) {
    out[i] = text.charCodeAt(i);
  }
  return out;
}

function concatBytes(parts) {
  let total = 0;
  for (const part of parts) {
    total += part.length;
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function chunk(type, data) {
  const typeBytes = ascii(type);
  return concatBytes([
    u32(data.length),
    typeBytes,
    data,
    u32(crc32(concatBytes([typeBytes, data]))),
  ]);
}

export function buildPng() {
  const ihdr = new Uint8Array(13);
  ihdr.set(u32(TILE), 0);
  ihdr.set(u32(TILE), 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 4; // colour type 4 — grayscale + alpha
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const stride = TILE * 2 + 1;
  const raw = new Uint8Array(stride * TILE);
  for (let y = 0; y < TILE; y += 1) {
    const row = y * stride;
    raw[row] = 0; // per-scanline filter: none
    for (let x = 0; x < TILE; x += 1) {
      raw[row + 1 + x * 2] = GREY;
      raw[row + 2 + x * 2] = Math.round(ALPHA_SCALE * fractalNoise(x, y) * 255);
    }
  }

  return concatBytes([
    new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', new Uint8Array(0)),
  ]);
}

/**
 * The committed path, resolved from this script's own location.
 */
export function grainTilePath() {
  return join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'grain.png');
}

// Write the tile only when this module is the entry point, so `check-grain.mjs`
// can import `buildPng` and compare without a side effect.
if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const target = grainTilePath();
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, buildPng());
  process.stdout.write(`wrote ${target}\n`);
}
