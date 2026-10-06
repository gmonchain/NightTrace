import { createKv, type KvStorage } from '@/db/kv';
import { Logger, type LogRecord } from '@/services/Logger';

/**
 * The `db/kv.ts` matrix rows. The malformed-value row in particular cannot be
 * covered by reading the code: it asserts that a stored value which does not
 * match the key's declared type resolves to `null` and logs a line that
 * carries no value.
 *
 * Storage is injected, so these run without a native module.
 */
function fakeStorage(seed: Readonly<Record<string, string>> = {}): KvStorage {
  const data = new Map<string, string>(Object.entries(seed));
  return {
    getItem: (key) => Promise.resolve(data.get(key) ?? null),
    setItem: (key, value) => {
      data.set(key, value);
      return Promise.resolve();
    },
    removeItem: (key) => {
      data.delete(key);
      return Promise.resolve();
    },
  };
}

describe('kv', () => {
  const records: LogRecord[] = [];

  beforeEach(() => {
    records.length = 0;
    Logger.__setSink((record) => records.push(record));
  });

  afterEach(() => {
    Logger.__setSink(null);
  });

  it('round-trips a boolean and types it at compile time', async () => {
    const kv = createKv(fakeStorage());
    const written = await kv.set('noticeAcknowledged', true);
    expect(written.ok).toBe(true);

    const value = await kv.get('noticeAcknowledged');
    // The annotation is the compile-time half of the row: a mistyped key or a
    // wrong value type fails `tsc`, not this assertion.
    const typed: boolean | null = value;
    expect(typed).toBe(true);
  });

  it('rejects a wrong-typed value at compile time', () => {
    const kv = createKv(fakeStorage());
    // @ts-expect-error — `noticeAcknowledged` is declared boolean.
    const call = () => kv.set('noticeAcknowledged', 'yes');
    expect(typeof call).toBe('function');
  });

  it('returns null — never undefined — for a key that was never written', async () => {
    const kv = createKv(fakeStorage());
    const value = await kv.get('noticeAcknowledged');
    expect(value).toBeNull();
    expect(value).not.toBeUndefined();
  });

  it('returns null and logs a value-free line for a malformed stored value', async () => {
    // Stored JSON that does not match the key's declared boolean type.
    const kv = createKv(fakeStorage({ noticeAcknowledged: '"not a boolean"' }));
    const value = await kv.get('noticeAcknowledged');

    expect(value).toBeNull();
    expect(records).toHaveLength(1);
    expect(records[0]?.code).toBe('kv.parse_failed');
    // The log line carries no value: no field from the stored content leaks in.
    expect(records[0]?.fields).toEqual({});
  });

  it('returns null for unparseable JSON without throwing', async () => {
    const kv = createKv(fakeStorage({ noticeAcknowledged: '{not json' }));
    await expect(kv.get('noticeAcknowledged')).resolves.toBeNull();
    expect(records[0]?.code).toBe('kv.parse_failed');
  });

  it('reports a write failure as a Result, never a throw', async () => {
    const failing: KvStorage = {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.reject(new Error('disk full')),
      removeItem: () => Promise.resolve(),
    };
    const kv = createKv(failing);
    const result = await kv.set('noticeAcknowledged', false);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('write_failed');
      expect(result.error.key).toBe('noticeAcknowledged');
    }
  });

  it('resolves null with a value-free line when the backend read rejects', async () => {
    const failing: KvStorage = {
      getItem: () => Promise.reject(new Error('backend unavailable')),
      setItem: () => Promise.resolve(),
      removeItem: () => Promise.resolve(),
    };
    const kv = createKv(failing);

    // A read failure is indistinguishable from absence: the caller gets `null`,
    // not a throw. Deleting the try/catch at the read path makes this fail.
    await expect(kv.get('noticeAcknowledged')).resolves.toBeNull();
    expect(records).toHaveLength(1);
    expect(records[0]?.code).toBe('kv.get_failed');
    expect(records[0]?.fields).toEqual({});
  });

  it('removes a stored key', async () => {
    const storage = fakeStorage({ noticeAcknowledged: 'true' });
    const kv = createKv(storage);
    expect(await kv.get('noticeAcknowledged')).toBe(true);

    await kv.remove('noticeAcknowledged');
    expect(await kv.get('noticeAcknowledged')).toBeNull();
    expect(records).toHaveLength(0);
  });

  it('swallows a rejecting removeItem into a value-free kv.remove_failed line', async () => {
    const failing: KvStorage = {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.resolve(),
      removeItem: () => Promise.reject(new Error('read-only')),
    };
    const kv = createKv(failing);

    await expect(kv.remove('noticeAcknowledged')).resolves.toBeUndefined();
    expect(records).toHaveLength(1);
    expect(records[0]?.code).toBe('kv.remove_failed');
    expect(records[0]?.fields).toEqual({});
  });
});
