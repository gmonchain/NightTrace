// Fixture (d): async persistence under the pure core. Must be rejected by
// AD-1's `no-restricted-imports`; the engine performs no I/O.
import * as SQLite from 'expo-sqlite';

export async function open() {
  return SQLite.openDatabaseAsync('nighttrace.db');
}
