/**
 * The design tokens — the *code* source AD-17 syncs against `DESIGN.md`'s YAML
 * frontmatter (the *design* source).
 *
 * This module is pure data: it imports nothing, so the shipped bundle carries
 * no parser and no runtime dependency. The sync test
 * (`./__tests__/token-sync.test.ts`) is the only reader of `DESIGN.md`, and it
 * is the only place `yaml` appears.
 *
 * Every value here was read from `DESIGN.md`, not retyped from memory. The
 * frontmatter's `px` / `ms` / `s` / `em` / `deg` spellings are normalised to
 * plain numbers (`120ms` → `120`, `5s` → `5000`, `-0.01em` → `-0.01`), and the
 * sync test normalises the design side the same way, so the two sources are
 * compared as values rather than as units.
 *
 * Key spellings are the design source's own: kebab-case keys (`'night-deep'`,
 * `'rule-soft'`, `'hold-button'`) are quoted rather than camel-cased, because
 * AD-17 asserts the two sources agree on every token *name* — a renamed key is
 * drift, not a style choice.
 */

/**
 * The palette — 14 values, exactly the frontmatter's `colors:` block.
 *
 * Four warm-blacks hold the ground (`night`, `night-deep`, `ledger`, `plate`),
 * three hairlines do the structural work (`rule`, `rule-soft`, `rule-strong`),
 * and the remaining seven are text tones and accents. The app is dark-only:
 * there is no light palette and a second one fails the sync test.
 */
export const colors = {
  night: '#060A07',
  'night-deep': '#030504',
  ledger: '#0B140E',
  plate: '#121C14',
  rule: '#1C2A1F',
  'rule-soft': '#142017',
  'rule-strong': '#2B3D2D',
  bone: '#CFDCC6',
  prose: '#AAB9A5',
  ash: '#859581',
  dim: '#5A6B58',
  safelight: '#A3FF2B',
  'safelight-soft': '#C6FF66',
  olive: '#2A4A0C',
} as const;

/**
 * The two type families, named once. `typography`'s steps reference these, so
 * adopting a different mono is a one-token change here — and the sync test then
 * enforces the new name on both sides. The load-bearing rule is semantic, not
 * stylistic: **serif (`Newsreader`) means written by a person; mono
 * (`IBM Plex Mono`) means recorded by the machine.**
 */
export const fontFamilies = {
  serif: 'Newsreader',
  mono: 'IBM Plex Mono',
} as const;

/**
 * The typographic ramp — 9 steps, exactly the frontmatter's `typography:`
 * block.
 *
 * `Newsreader` never ships above weight 500 — the sync test asserts that
 * against the live `DESIGN.md`. `letterSpacing` is normalised from `em` to a
 * plain number and is present only on the steps the design source tracks;
 * `lineHeight` is present only where the source sets it.
 */
export const typography = {
  display: {
    fontFamily: fontFamilies.serif,
    fontSize: 46,
    fontWeight: 300,
    lineHeight: 1.02,
    letterSpacing: -0.01,
  },
  title: {
    fontFamily: fontFamilies.serif,
    fontSize: 30,
    fontWeight: 300,
    lineHeight: 1.15,
  },
  heading: {
    fontFamily: fontFamilies.serif,
    fontSize: 22,
    fontWeight: 400,
    lineHeight: 1.3,
  },
  account: {
    fontFamily: fontFamilies.serif,
    fontSize: 18,
    fontWeight: 400,
    lineHeight: 1.55,
  },
  'prose-small': {
    fontFamily: fontFamilies.serif,
    fontSize: 15,
    fontWeight: 400,
    lineHeight: 1.5,
  },
  label: {
    fontFamily: fontFamilies.mono,
    fontSize: 12,
    fontWeight: 400,
    letterSpacing: 0.14,
  },
  meta: {
    fontFamily: fontFamilies.mono,
    fontSize: 10.5,
    fontWeight: 400,
    letterSpacing: 0.16,
  },
  micro: {
    fontFamily: fontFamilies.mono,
    fontSize: 9.5,
    fontWeight: 400,
    letterSpacing: 0.18,
  },
  stamp: {
    fontFamily: fontFamilies.mono,
    fontSize: 26,
    fontWeight: 600,
    letterSpacing: 0.08,
  },
} as const;

/** The spacing scale — 9 stops, exactly the frontmatter's `spacing:` block. */
export const spacing = {
  '1': 4,
  '2': 6,
  '3': 8,
  '4': 12,
  '5': 16,
  '6': 22,
  '7': 28,
  '8': 40,
  '9': 56,
} as const;

/** The radius scale — 5 stops, exactly the frontmatter's `rounded:` block. */
export const rounded = {
  DEFAULT: 2,
  sm: 3,
  md: 4,
  sheet: 14,
  full: 9999,
} as const;

/**
 * The motion set — 8 values, exactly the frontmatter's `motion:` block.
 *
 * Five durations (`quick`, `base`, `enter`, `screen`, `seal`) and three loop
 * periods (`breathe`, `dot`, `pulse`), all in milliseconds. The rate ceiling is
 * a data claim, not a comment: the loops faster than `breathe` are exactly
 * `dot` and `pulse` — the sync test enumerates that set rather than trusting
 * the prose gloss.
 */
export const motion = {
  quick: 120,
  base: 180,
  enter: 240,
  screen: 380,
  seal: 900,
  breathe: 5000,
  dot: 3000,
  pulse: 2000,
} as const;

/**
 * The derived named animations. The three loops read their `motion` periods,
 * so a token edit moves the animation with it. `ntUp` and `ntFade` both read
 * `motion.enter` (240ms), per the design source's Motion section.
 *
 * `loops` marks the animations the rate ceiling governs: only the looping ones
 * can be "faster than the field breath", and `ntUp`/`ntFade` are one-shot
 * entrances.
 */
export const animations = {
  ntBreathe: { durationMs: motion.breathe, loops: true },
  ntDot: { durationMs: motion.dot, loops: true },
  ntPulse: { durationMs: motion.pulse, loops: true },
  ntUp: { durationMs: motion.enter, loops: false },
  ntFade: { durationMs: motion.enter, loops: false },
} as const;

/**
 * The component tokens — 12 groups, exactly the frontmatter's `components:`
 * block. Reference values (`'{colors.rule}'`, `'{typography.meta}'`,
 * `'{rounded.DEFAULT}'`) are carried verbatim so the sync test compares the
 * design source's own spelling.
 *
 * `hold-button.fillDurations` uses `enterMs`/`sealMs` deliberately:
 * `motion.enter` (240ms) and `motion.seal` (900ms) already own the bare names
 * `enter` and `seal`, so a key called `enter` here would read as 240ms while
 * meaning 800ms. The 800ms / 600ms fills are read from `DESIGN.md`'s
 * Components prose by the sync test.
 */
export const components = {
  rule: { color: '{colors.rule}', height: 1 },
  'rule-soft': { color: '{colors.rule-soft}', height: 1 },
  seal: {
    ring: '{colors.bone}',
    ink: '{colors.safelight-soft}',
    rotation: -4,
    distortion: 'ntInk',
  },
  'stat-cell': {
    label: '{typography.meta}',
    value: '{typography.label}',
    color: '{colors.bone}',
    labelColor: '{colors.ash}',
  },
  'signature-slot': {
    size: 30,
    lit: '{colors.safelight-soft}',
    unlit: '{colors.rule}',
    litBorder: '{colors.olive}',
  },
  'ledger-row': { glyph: '{typography.label}', divider: '{colors.rule}' },
  'evidence-card': {
    surface: '{colors.ledger}',
    border: '{colors.rule}',
    radius: '{rounded.DEFAULT}',
  },
  chip: {
    border: '{colors.rule-strong}',
    radius: '{rounded.DEFAULT}',
    label: '{typography.meta}',
    color: '{colors.ash}',
  },
  'hold-button': {
    height: 50,
    border: '{colors.bone}',
    radius: '{rounded.DEFAULT}',
    fill: '{colors.safelight}',
    label: '{typography.label}',
    fillDurations: { enterMs: 800, sealMs: 600 },
  },
  sheet: {
    surface: '{colors.ledger}',
    radius: '{rounded.sheet}',
    grabber: '{colors.rule-strong}',
  },
  'tab-bar': {
    surface: '{colors.night}',
    active: '{colors.bone}',
    idle: '{colors.ash}',
    badge: '{colors.safelight}',
  },
  grain: { opacity: 0.55 },
} as const;

/**
 * `ntInk` — the turbulence-and-displacement filter read from the reference
 * prototype's `inkDefs()`. It is a token rather than an inline effect because
 * AD-17 requires the Seal and the `REVISED` stamp to share one definition;
 * written inline twice they drift invisibly to the sync test.
 *
 * `components.seal.distortion` names the key `ntInk`, and the sync test asserts
 * that reference resolves to a real key here — so "shareable" is a checked
 * fact, not a convention.
 */
export const filters = {
  ntInk: {
    region: { x: '-10%', y: '-10%', width: '120%', height: '120%' },
    steps: [
      {
        primitive: 'feTurbulence',
        type: 'fractalNoise',
        baseFrequency: 0.04,
        numOctaves: 2,
        seed: 3,
        result: 'w',
      },
      {
        primitive: 'feDisplacementMap',
        in: 'SourceGraphic',
        in2: 'w',
        scale: 3.5,
        result: 'd',
      },
      {
        primitive: 'feTurbulence',
        type: 'fractalNoise',
        baseFrequency: 0.8,
        numOctaves: 1,
        seed: 9,
        result: 's',
      },
      {
        primitive: 'feColorMatrix',
        in: 's',
        type: 'matrix',
        values: '0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 1.75',
        result: 'm',
      },
      { primitive: 'feComposite', in: 'd', in2: 'm', operator: 'in' },
    ],
  },
} as const;

/**
 * The token families, keyed by the names the design source uses. The sync
 * test's completeness check compares these keys against `DESIGN.md`'s own
 * mapping-valued keys, so a family added to either source and not the other
 * fails.
 */
export const tokenFamilies = {
  colors,
  typography,
  spacing,
  rounded,
  motion,
  components,
} as const;

/**
 * The theme. Every mapping-valued key here must also be a key of
 * `tokenFamilies` — a second palette exported from this module but omitted
 * from `tokenFamilies` would otherwise escape the completeness check, so the
 * test derives the exported set from `theme` itself and asserts the two agree.
 */
export const theme = {
  colors,
  typography,
  spacing,
  rounded,
  motion,
  components,
} as const;

export type Colors = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type Rounded = typeof rounded;
export type Motion = typeof motion;
export type Components = typeof components;
export type Animations = typeof animations;
export type Filters = typeof filters;
export type FontFamilies = typeof fontFamilies;
export type Theme = typeof theme;
export type TokenFamilyName = keyof typeof tokenFamilies;
