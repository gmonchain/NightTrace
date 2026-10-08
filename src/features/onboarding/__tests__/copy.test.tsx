import { readFileSync } from 'node:fs';
import path from 'node:path';

import {
  ABOUT_NOTICE_SECTIONS,
  ENTERTAINMENT_LINE,
  ONBOARDING_COPY,
  ONBOARDING_SCREENS,
  ONBOARDING_SCREEN_KEYS,
} from '@/data/strings';

/**
 * Story 1.6 — the onboarding copy: voice, order, and the safety placement.
 *
 * These are string-level assertions, so they are plain tests rather than
 * renders. The banned-term check mirrors `scripts/claims-lint.mjs` (whole-word,
 * case-insensitive, minus the ratified `allowedPhrases`) so "the claims lint
 * agrees" is asserted here as well as by `npm run claims:check`; the word count
 * is the nine-word-per-line rule; and the safety row is the placement
 * assertion — the safety content is in the About notice and not on the
 * onboarding path.
 */

const ROOT = path.resolve(__dirname, '..', '..', '..', '..');

type ClaimsConfig = {
  readonly bannedTerms: readonly string[];
  readonly allowedPhrases: readonly { readonly phrase: string; readonly ruling: string }[];
  readonly bannedCharacters: readonly string[];
  readonly bannedPatterns: readonly string[];
};

const CONFIG = JSON.parse(
  readFileSync(path.join(ROOT, 'scripts', 'claims', 'config.json'), 'utf8'),
) as ClaimsConfig;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Blank out the ratified safe forms, leaving the rest to be matched. */
function scrub(value: string): string {
  let scrubbed = value;
  for (const { phrase } of CONFIG.allowedPhrases) {
    scrubbed = scrubbed.replace(
      new RegExp(escapeRegExp(phrase), 'gi'),
      (match) => ' '.repeat(match.length),
    );
  }
  return scrubbed;
}

/** The banned terms a line carries — whole-word, case-insensitive, allowlisted. */
function bannedTermsIn(line: string): readonly string[] {
  const scrubbed = scrub(line);
  return CONFIG.bannedTerms.filter((term) => {
    const body = term.split(/\s+/).map(escapeRegExp).join('\\s+');
    return new RegExp(`(?<![A-Za-z0-9_])${body}(?![A-Za-z0-9_])`, 'i').test(scrubbed);
  });
}

/**
 * The banned regex patterns a line matches — the non-word prohibitions
 * (statistic/social-proof, fake telemetry/progress language). Mirrors the
 * claims lint's `bannedPatterns` arm, which the term-only mirror dropped.
 */
function bannedPatternsIn(line: string): readonly string[] {
  const scrubbed = scrub(line);
  return CONFIG.bannedPatterns.filter((source) =>
    new RegExp(source, 'i').test(scrubbed),
  );
}

function countWords(line: string): number {
  return line.trim().split(/\s+/).filter(Boolean).length;
}

/** Every authored line across the four screens. */
function allLines(): readonly string[] {
  return ONBOARDING_SCREENS.flatMap((screen) => [
    screen.kicker,
    screen.headline,
    ...screen.body,
    screen.actionLabel,
  ]);
}

describe('the onboarding copy obeys the voice rules', () => {
  it('is nine words or fewer on every line', () => {
    const longLines = allLines().filter((line) => countWords(line) > 9);
    expect(longLines).toEqual([]);
  });

  it('carries no banned term or banned pattern (the claims lint agrees)', () => {
    const offenders = allLines().flatMap((line) => [
      ...bannedTermsIn(line).map((term) => ({ line, token: term })),
      ...bannedPatternsIn(line).map((pattern) => ({ line, token: pattern })),
    ]);
    expect(offenders).toEqual([]);
  });

  it('carries no banned character and no hunt-name-only word', () => {
    for (const line of allLines()) {
      for (const character of CONFIG.bannedCharacters) {
        expect(line).not.toContain(character);
      }
      // `ghost` appears only ever as a Hunt name, so it appears nowhere here.
      expect(line).not.toMatch(/\bghost/i);
    }
  });

  it('imports the entertainment line rather than retyping it', () => {
    // Identity, not equality: the notice screen's body carries the constant.
    expect(ONBOARDING_COPY.notice.body).toContain(ENTERTAINMENT_LINE);
  });
});

describe('the four onboarding screens are in order', () => {
  it('lists the keys in path order', () => {
    expect(ONBOARDING_SCREEN_KEYS).toEqual([
      'notice',
      'local',
      'night',
      'permissions',
    ]);
    expect(ONBOARDING_SCREENS.map((screen) => screen.key)).toEqual([
      'notice',
      'local',
      'night',
      'permissions',
    ]);
  });

  it('teaches the epic frame sentences in order', () => {
    expect(ONBOARDING_COPY.notice.headline).toBe('Nothing here is proof.');
    expect(ONBOARDING_COPY.local.headline).toBe('Your case is local.');
    expect(ONBOARDING_COPY.night.headline).toBe('You choose your night.');
    expect(ONBOARDING_COPY.permissions.headline).toBe(
      'Permissions are asked only when needed.',
    );
  });
});

describe('the safety content stays in the About notice', () => {
  const safety = ABOUT_NOTICE_SECTIONS.find(
    (section) => section.heading === 'SAFETY',
  );
  const safetyText = safety?.paragraphs.join(' ') ?? '';

  it('lives in the About notice, whole (photosensitivity, sudden audio, startle)', () => {
    expect(safety).toBeDefined();
    expect(safetyText).toMatch(/distortions/i); // the photosensitivity fact
    expect(safetyText).toMatch(/suddenly/i); // sudden audio
    expect(safetyText).toMatch(/startle/i); // designed to startle
  });

  it('is absent from the onboarding path', () => {
    const onboardingText = allLines().join(' \n ');
    for (const keyword of [
      'photosensitiv',
      'distortion',
      'sudden',
      'startle',
      'glitch',
      'intensity',
    ]) {
      expect(onboardingText.toLowerCase()).not.toContain(keyword);
    }
  });

  it('places the entertainment line in the notice, not only onboarding', () => {
    const noticeParagraphs = ABOUT_NOTICE_SECTIONS.flatMap(
      (section) => section.paragraphs,
    );
    expect(noticeParagraphs).toContain(ENTERTAINMENT_LINE);
  });
});
