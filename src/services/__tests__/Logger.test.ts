import { Logger, type LogRecord } from '@/services/Logger';

/**
 * `Logger` is the only module that logs, and its records carry no free text,
 * evidence content, or coordinates. These tests read the emitted record through
 * the sink seam; the sink signature itself is the enforcement (a field value is
 * a number, boolean, or null, so a string cannot be attached).
 */
describe('Logger', () => {
  const records: LogRecord[] = [];

  beforeEach(() => {
    records.length = 0;
    Logger.__setSink((record) => records.push(record));
  });

  afterEach(() => {
    Logger.__setSink(null);
  });

  it('emits the level, the closed code, and structured scalar fields', () => {
    Logger.warn('kv.parse_failed', { key: 1, ok: false, missing: null });
    expect(records).toHaveLength(1);
    expect(records[0]).toEqual({
      level: 'warn',
      code: 'kv.parse_failed',
      fields: { key: 1, ok: false, missing: null },
    });
  });

  it('defaults the field bag so a bare call is still a complete record', () => {
    Logger.info('kv.get_failed');
    expect(records[0]).toEqual({
      level: 'info',
      code: 'kv.get_failed',
      fields: {},
    });
  });

  it('routes each level through its own call', () => {
    Logger.debug('kv.get_failed');
    Logger.info('kv.get_failed');
    Logger.warn('kv.get_failed');
    Logger.error('kv.write_failed');
    expect(records.map((r) => r.level)).toEqual([
      'debug',
      'info',
      'warn',
      'error',
    ]);
  });

  it('never accepts free text: every field value is a scalar', () => {
    Logger.error('kv.write_failed', { attempts: 3, fatal: true, cause: null });
    const fields = records[0]?.fields ?? {};
    for (const value of Object.values(fields)) {
      expect(['number', 'boolean', 'object']).toContain(typeof value);
      expect(value === null || typeof value !== 'string').toBe(true);
    }
  });
});
