import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/**
 * Story 1.8 — NO_NETWORK: no network call of any kind exists in the source.
 *
 * The app is offline end to end and runs in airplane mode (AD-21, the
 * Deployment & environments envelope). This scan walks `src/**` — the shipped
 * source — and fails on any of the network APIs a call could be built from. It
 * skips `__tests__` and `__boundary_fixtures__` (neither ships), so the scan
 * does not flag itself.
 *
 * The scanner is proved against a planted fixture before it is trusted over the
 * real tree: a rule with no *rejecting* case is one CI cannot see removed.
 */

const SRC_DIR = path.resolve(__dirname, '..', '..', '..');

/** The shapes a network call can take. A hit is a shipped call. */
const NETWORK_PATTERNS: readonly { readonly name: string; readonly pattern: RegExp }[] = [
  { name: 'fetch()', pattern: /\bfetch\s*\(/ },
  { name: 'XMLHttpRequest', pattern: /\bXMLHttpRequest\b/ },
  { name: 'WebSocket', pattern: /\bWebSocket\b/ },
  { name: 'axios', pattern: /\baxios\b/ },
  { name: 'navigator.sendBeacon', pattern: /\bsendBeacon\b/ },
  { name: 'EventSource', pattern: /\bEventSource\b/ },
  {
    name: "node http(s) module",
    pattern: /(?:from\s*|require\s*\(\s*)['"](?:node:)?https?['"]/,
  },
  {
    name: 'http client library',
    pattern:
      /(?:from\s*|require\s*\(\s*)['"](?:ky|got|undici|node-fetch|superagent|needle|request|@react-native-community\/netinfo)['"]/,
  },
  {
    name: 'node net module',
    pattern:
      /(?:from\s*|require\s*\(\s*)['"](?:node:)?(?:net|tls|dgram|http2)['"]/,
  },
];

const SKIPPED_DIRECTORIES = new Set(['__tests__', '__boundary_fixtures__', 'node_modules']);

type Offence = {
  readonly file: string;
  readonly line: number;
  readonly name: string;
  readonly text: string;
};

/** Every file under `root` a scan reads, with its path. */
function sourceFiles(root: string): readonly string[] {
  const files: string[] = [];
  const visit = (dir: string): void => {
    for (const name of readdirSync(dir)) {
      const full = path.join(dir, name);
      if (statSync(full).isDirectory()) {
        if (!SKIPPED_DIRECTORIES.has(name)) {
          visit(full);
        }
      } else if (/\.(ts|tsx|js|jsx)$/.test(name)) {
        files.push(full);
      }
    }
  };
  visit(root);
  return files;
}

/** Every network-call-shaped line under `root`, or `[]`. */
function scanForNetworkCalls(root: string): readonly Offence[] {
  const offences: Offence[] = [];
  for (const file of sourceFiles(root)) {
    const lines = readFileSync(file, 'utf8').split('\n');
    for (const [index, line] of lines.entries()) {
      for (const { name, pattern } of NETWORK_PATTERNS) {
        if (pattern.test(line)) {
          offences.push({
            file: path.relative(root, file),
            line: index + 1,
            name,
            text: line.trim(),
          });
        }
      }
    }
  }
  return offences;
}

describe('the source makes no network call', () => {
  it('scans the shipped tree without a single network API', () => {
    const offences = scanForNetworkCalls(SRC_DIR);
    expect(offences).toEqual([]);
  });

  it('actually reads the shipped source (the scan is not vacuous)', () => {
    // A walk that found nothing would make the clean result meaningless.
    expect(sourceFiles(SRC_DIR).length).toBeGreaterThan(50);
  });

  it('catches a planted call, proving the scan rejects', () => {
    const scratch = mkdtempSync(path.join(os.tmpdir(), 'nighttrace-net-'));
    try {
      mkdirSync(path.join(scratch, 'feature'));
      writeFileSync(
        path.join(scratch, 'feature', 'leak.ts'),
        "export const go = () => fetch('https://example.com');\n",
      );
      const offences = scanForNetworkCalls(scratch);
      expect(offences).toHaveLength(1);
      expect(offences[0]?.name).toBe('fetch()');
      expect(offences[0]?.line).toBe(1);
    } finally {
      rmSync(scratch, { recursive: true, force: true });
    }
  });

  it('skips test files, so the scan does not flag its own patterns', () => {
    const scratch = mkdtempSync(path.join(os.tmpdir(), 'nighttrace-net-'));
    try {
      mkdirSync(path.join(scratch, '__tests__'));
      writeFileSync(
        path.join(scratch, '__tests__', 'x.test.ts'),
        "export const go = () => fetch('https://example.com');\n",
      );
      expect(scanForNetworkCalls(scratch)).toEqual([]);
    } finally {
      rmSync(scratch, { recursive: true, force: true });
    }
  });
});
