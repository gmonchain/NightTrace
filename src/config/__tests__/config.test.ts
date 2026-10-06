import { readFileSync } from 'node:fs';
import path from 'node:path';

import type { ConfigContext } from 'expo/config';

import resolveConfig from '../../../app.config';

/**
 * The guardrails *are* the story: the four TypeScript strictness flags are
 * CI-blocking (NFR-17) and `app.config.ts` is the only source of native config
 * truth (AD-23). A guardrail nothing asserts is a preference — dropping a
 * tsconfig flag leaves `tsc --noEmit` green, and a wrong variant resolves a
 * wrong identity — so both are asserted here against the configuration itself.
 */

const ROOT = path.resolve(__dirname, '..', '..', '..');

/** Evaluate the dynamic config the way `expo config` does: once per variant. */
function resolveFor(variant: string | undefined) {
  const previous = process.env.APP_VARIANT;
  if (variant === undefined) {
    delete process.env.APP_VARIANT;
  } else {
    process.env.APP_VARIANT = variant;
  }
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

describe('tsconfig carries the CI-blocking strictness set', () => {
  const tsconfig: unknown = JSON.parse(
    readFileSync(path.join(ROOT, 'tsconfig.json'), 'utf8'),
  );
  const compilerOptions =
    (tsconfig as { compilerOptions?: Record<string, unknown> })
      .compilerOptions ?? {};

  it.each([
    'strict',
    'noUncheckedIndexedAccess',
    'exactOptionalPropertyTypes',
    'noImplicitOverride',
  ])('enables %s', (flag) => {
    expect(compilerOptions[flag]).toBe(true);
  });

  it('maps the @/* alias Metro relies on', () => {
    expect(compilerOptions.paths).toMatchObject({ '@/*': ['./src/*'] });
  });
});

describe('app.config.ts resolves one variant into one identity', () => {
  it.each([
    ['dev', 'NightTrace Dev', 'com.nighttrace.app.dev'],
    ['preview', 'NightTrace Preview', 'com.nighttrace.app.preview'],
    ['production', 'NightTrace', 'com.nighttrace.app'],
  ] as const)(
    'resolves APP_VARIANT=%s to %s / %s',
    (variant, displayName, identifier) => {
      const config = resolveFor(variant);
      expect(config.name).toBe(displayName);
      expect(config.ios?.bundleIdentifier).toBe(identifier);
      expect(config.android?.package).toBe(identifier);
    },
  );

  it('defaults an unset APP_VARIANT to dev', () => {
    const config = resolveFor(undefined);
    expect(config.name).toBe('NightTrace Dev');
    expect(config.ios?.bundleIdentifier).toBe('com.nighttrace.app.dev');
    expect(config.android?.package).toBe('com.nighttrace.app.dev');
  });

  it('falls back to dev and warns for an unrecognised APP_VARIANT', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const config = resolveFor('prod');
      expect(config.name).toBe('NightTrace Dev');
      expect(config.ios?.bundleIdentifier).toBe('com.nighttrace.app.dev');
      expect(warn).toHaveBeenCalledTimes(1);
    } finally {
      warn.mockRestore();
    }
  });

  it('varies only the id suffix and display name across variants', () => {
    const dev = resolveFor('dev');
    const production = resolveFor('production');
    // The three fields allowed to differ: display name, iOS bundle id, Android
    // package. Everything else — orientation, scheme, style, experiment flags,
    // plugins, iOS deployment target — is identical.
    const strip = ({
      name: _name,
      ios,
      android,
      ...rest
    }: ReturnType<typeof resolveFor>) => ({
      rest,
      deploymentTarget: ios?.deploymentTarget,
      supportsTablet: ios?.supportsTablet,
    });
    expect(strip(dev)).toEqual(strip(production));
  });

  it('pins the store floors in config, not at submission time', () => {
    const config = resolveFor('production');
    // ios.deploymentTarget is a built-in key; the Android SDK floors come from
    // the expo-build-properties plugin (numbers, not strings).
    expect(config.ios?.deploymentTarget).toBe('16.4');
    const plugin = config.plugins?.find(
      (entry) => Array.isArray(entry) && entry[0] === 'expo-build-properties',
    );
    expect(plugin).toBeDefined();
    if (!Array.isArray(plugin)) {
      throw new Error('expo-build-properties plugin entry missing');
    }
    expect(plugin[1]).toMatchObject({
      android: { compileSdkVersion: 36, targetSdkVersion: 36 },
    });
  });
});
