import path from 'node:path';
import { configDefaults, defineConfig } from 'vitest/config';
import { vitestExpo } from 'vitest-expo';

/**
 * The test runner of record.
 *
 * Two Vitest projects mirror the two the Jest config held
 * (ARCHITECTURE-SPINE.md, Testing convention):
 *
 * `engine` runs in the plain `node` environment — which is only possible because
 * AD-1 holds: the engine imports no framework, reads no clock and touches no
 * I/O. That the bare node environment works at all is itself the boundary check
 * (`purity.test.ts` asserts `globalThis.window` is absent).
 *
 * `ui` runs on vitest-expo's iOS preset (the expo-layer equivalent of
 * `jest-expo/ios`) with @testing-library/react-native for the shell's React
 * surfaces, expo-router driven through `vitest-expo/router`.
 *
 * `.mts` because an Expo app's package.json carries no `"type": "module"`, so a
 * `.ts` config would be read as CommonJS while this file uses `import`/`export`.
 */
const srcAlias = { '@': path.resolve(import.meta.dirname, 'src') };

export default defineConfig({
  test: {
    // The route-tree suites render the whole `src/app` tree (react-navigation +
    // the tabs navigator) through `renderRouter`, whose first render in a worker
    // pays the module-load cost; under parallel load that first render can exceed
    // the 5s default. Set at the root so it applies to every project, and again
    // inside each project so a single-project run inherits it too.
    testTimeout: 60000,
    projects: [
      {
        resolve: { alias: srcAlias },
        test: {
          name: 'engine',
          environment: 'node',
          globals: true,
          testTimeout: 60000,
          // `.tsx` as well as `.ts`: AD-1 permits no JSX in the engine today, but
          // a co-located `*.test.tsx` that matched neither project would be
          // silently unexecuted — the failure mode this glob closes.
          include: ['src/engine/**/__tests__/**/*.test.{ts,tsx}'],
        },
      },
      {
        // `svg: false` turns off vitest-native's hand-written react-native-svg
        // mock. That mock is a stub: it models a subset of the SVG component
        // exports and renders its own host names, while the seal suites assert
        // against real `react-native-svg` output — the `RNSVG*` host elements,
        // and the `Filter` / `FeTurbulence` / `FeDisplacementMap` / `FeComposite`
        // primitives the ink filter declares (`Seal.tsx`). Running the real
        // package keeps those assertions honest.
        plugins: [
          vitestExpo({
            jestCompat: false,
            reactNative: { presets: { svg: false } },
          }),
        ],
        resolve: { alias: srcAlias },
        test: {
          name: 'ui',
          globals: true,
          testTimeout: 60000,
          include: ['src/**/__tests__/**/*.test.{ts,tsx}'],
          exclude: [...configDefaults.exclude, 'src/engine/**'],
        },
      },
    ],
  },
});
