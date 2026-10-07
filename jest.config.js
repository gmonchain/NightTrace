/**
 * Two Jest projects (ARCHITECTURE-SPINE.md, Testing convention).
 *
 * `engine` runs on the plain `node` preset — which is only possible because
 * AD-1 holds: the engine imports no framework, reads no clock and touches no
 * I/O. That the `node` preset works at all is itself the boundary check.
 *
 * `ui` runs on `jest-expo` (the iOS preset) with @testing-library/react-native
 * for the shell's React surfaces.
 */
module.exports = {
  projects: [
    {
      displayName: 'engine',
      preset: 'jest-expo/node',
      // `.tsx` as well as `.ts`: AD-1 permits no JSX in the engine today, but a
      // co-located `*.test.tsx` that matched neither project would be silently
      // unexecuted — the failure mode this glob closes.
      testMatch: ['<rootDir>/src/engine/**/__tests__/**/*.test.ts?(x)'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
    },
    {
      displayName: 'ui',
      preset: 'jest-expo/ios',
      testMatch: [
        '<rootDir>/src/**/__tests__/**/*.test.ts',
        '<rootDir>/src/**/__tests__/**/*.test.tsx',
      ],
      testPathIgnorePatterns: ['<rootDir>/src/engine/'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        // `yaml` publishes an ESM browser build (its `browser` field) and a CJS
        // build under `dist/`. `transformIgnorePatterns` does not cover `yaml`,
        // so a bare `import { parse } from 'yaml'` resolves to the browser
        // build and fails to parse under Jest. This mapping is test-only: the
        // app never imports `yaml` — `src/ui/theme/tokens.ts` is dependency-free
        // — so the shipped bundle stays parser-free.
        '^yaml$': '<rootDir>/node_modules/yaml/dist/index.js',
      },
    },
  ],
};
