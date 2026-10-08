import Storage from 'expo-sqlite/kv-store';

import { Logger } from '@/services/Logger';
import { err, ok, type Result } from '@/util/result';

/**
 * The typed settings wrapper (ARCHITECTURE-SPINE.md, Config convention).
 *
 * Settings live in `expo-sqlite/kv-store`, never in a table — there is no
 * settings table by design, so this is permanent, not provisional. The wrapper
 * makes a typo a compile error: `kv.get('noticeAcknowleged')` does not typecheck
 * and no string literal key reaches storage.
 *
 * Contract, per the story's I/O matrix:
 * - `get` returns `null` for a key that was never written; never `undefined`.
 * - `get` returns `null` for a stored value that does not match the key's
 *   declared type, and logs a field-free line. A parse failure is not a
 *   boundary throw.
 * - `set` reports an I/O failure as `Result`, never a throw.
 *
 * Storage is injected so the wrapper's contract is testable without a native
 * module; the module-level `kv` binds the real `expo-sqlite/kv-store` backend.
 */

/** The value kinds a settings key may declare. */
type KvKind = 'boolean' | 'number' | 'string';

/** The closed settings-key registry. Adding a setting adds an entry here. */
export const KV_SCHEMA = {
  noticeAcknowledged: 'boolean',
  // Story 1.6: the onboarding position, device-local. The number of screens the
  // user has completed (0..4); a relaunch resumes from it instead of restarting.
  onboardingStep: 'number',
} as const satisfies Record<string, KvKind>;

export type KvKey = keyof typeof KV_SCHEMA;

type KindToType<K extends KvKind> = K extends 'boolean'
  ? boolean
  : K extends 'number'
    ? number
    : string;

export type KvValue<K extends KvKey> = KindToType<(typeof KV_SCHEMA)[K]>;

/** A typed failure from the storage backend. Tagged `kind` per AD-14. */
export type KvError = { readonly kind: 'write_failed'; readonly key: KvKey };

/** The slice of `expo-sqlite/kv-store` this wrapper depends on. */
export interface KvStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export interface Kv {
  get<K extends KvKey>(key: K): Promise<KvValue<K> | null>;
  set<K extends KvKey>(key: K, value: KvValue<K>): Promise<Result<true, KvError>>;
  remove(key: KvKey): Promise<void>;
}

function isKind(kind: KvKind, value: unknown): boolean {
  switch (kind) {
    case 'boolean':
      return typeof value === 'boolean';
    case 'number':
      return typeof value === 'number' && Number.isFinite(value);
    case 'string':
      return typeof value === 'string';
  }
}

export function createKv(storage: KvStorage): Kv {
  return {
    async get<K extends KvKey>(key: K): Promise<KvValue<K> | null> {
      const kind: KvKind = KV_SCHEMA[key];

      let raw: string | null;
      try {
        raw = await storage.getItem(key);
      } catch {
        // A backend read failure is indistinguishable from absence here; the
        // caller gets `null` (an absence claim) rather than a throw.
        Logger.warn('kv.get_failed');
        return null;
      }

      if (raw === null) {
        return null;
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        // Malformed value: return null and log with no value attached, so no
        // stored content ever reaches the log sink.
        Logger.warn('kv.parse_failed');
        return null;
      }

      if (!isKind(kind, parsed)) {
        Logger.warn('kv.parse_failed');
        return null;
      }

      // `parsed` is `unknown` narrowed by a runtime check; the cast is the
      // validator's output, which AD-14 admits.
      return parsed as KvValue<K>;
    },

    async set<K extends KvKey>(
      key: K,
      value: KvValue<K>,
    ): Promise<Result<true, KvError>> {
      try {
        await storage.setItem(key, JSON.stringify(value));
        return ok(true);
      } catch {
        return err({ kind: 'write_failed', key });
      }
    },

    async remove(key: KvKey): Promise<void> {
      try {
        await storage.removeItem(key);
      } catch {
        Logger.warn('kv.remove_failed');
      }
    },
  };
}

/** The application's settings wrapper, bound to the real storage backend. */
export const kv: Kv = createKv(Storage);
