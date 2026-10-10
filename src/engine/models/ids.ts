/**
 * The branded id and numeric-alias set (AD-14, the engine contract `02` §H.1).
 *
 * Ids are opaque strings at runtime and mutually unassignable at compile time —
 * the bug class a content-driven system produces at scale, and the one unit
 * tests catch last. The numeric aliases brand a plain `number` so a wall-clock
 * `EpochMs` can never be passed where an elapsed `SessionMs` is expected: the
 * engine speaks only `SessionMs` and `TickIndex`, and `services/Clock` is the
 * one wall-clock reader and the one producer of `SessionMs`/`EpochMs`.
 *
 * `IdFactory` keeps the user-data id aliases it owns (they are not moved here),
 * so `SessionId` appears in both places; because both resolve to the single `Brand` from
 * `./brand`, they are the same type and a value minted by `IdFactory` is
 * accepted wherever this `SessionId` is expected.
 *
 * Every brand is produced by a factory in this module, so the one `as` a
 * compile-time brand needs is confined to `brandValue` — AD-14's "no `as`
 * outside a validator/brand factory".
 */

import { invariant } from '@/util/result';

import type { Brand } from './brand';

export type Seed = Brand<string, 'Seed'>;
/** The content version, always spelled `'YYYY.MM.DD.N'` (AD-3). */
export type ContentVersion = Brand<string, 'ContentVersion'>;
export type HuntId = Brand<string, 'HuntId'>;
export type SessionId = Brand<string, 'SessionId'>;
export type EventDefinitionId = Brand<string, 'EventDefinitionId'>;
export type EventTableId = Brand<string, 'EventTableId'>;
export type DirectiveId = Brand<string, 'DirectiveId'>;
export type EncounterDefinitionId = Brand<string, 'EncounterDefinitionId'>;

/** Milliseconds since the session start, never a wall clock. */
export type SessionMs = Brand<number, 'SessionMs'>;
/** The engine's own monotonic tick counter. */
export type TickIndex = Brand<number, 'TickIndex'>;
/** Epoch milliseconds — produced only by `services/Clock`. */
export type EpochMs = Brand<number, 'EpochMs'>;
/** A normalized `0..1` scalar, used for strengths, confidences and gains. */
export type Unit = Brand<number, 'Unit'>;

/**
 * The single assertion the tree's branding needs. Branding is a compile-time
 * claim over a runtime primitive, so an assertion is inherent to the pattern;
 * confining it here is what lets every other module build a branded value
 * without a cast of its own.
 */
function brandValue<T extends string | number, B extends string>(
  value: T,
): Brand<T, B> {
  return value as Brand<T, B>;
}

/** `unit` is the clamping brand factory: the one that constrains its input. */
export function unit(n: number): Unit {
  return brandValue<number, 'Unit'>(Math.min(1, Math.max(0, n)));
}

/** The identity factory for an elapsed-time value; the clamp lives in `Clock`. */
export function sessionMs(n: number): SessionMs {
  return brandValue<number, 'SessionMs'>(n);
}

/** The identity factory for the engine's tick counter. */
export function tickIndex(n: number): TickIndex {
  return brandValue<number, 'TickIndex'>(n);
}

/** The identity factory for an epoch-millisecond timestamp. */
export function epochMs(n: number): EpochMs {
  return brandValue<number, 'EpochMs'>(n);
}

/** The `Seed` brand factory — the one that keeps the brand assertion in this module. */
export function seedId(value: string): Seed {
  return brandValue<string, 'Seed'>(value);
}

/** The identity factory for a content id slug (`HuntId`, `EventDefinitionId`). */
export function huntId(value: string): HuntId {
  return brandValue<string, 'HuntId'>(value);
}

export function eventDefinitionId(value: string): EventDefinitionId {
  return brandValue<string, 'EventDefinitionId'>(value);
}

/** The identity factory for an event-table id slug. */
export function eventTableId(value: string): EventTableId {
  return brandValue<string, 'EventTableId'>(value);
}

/** The identity factory for a session-directive id slug. */
export function directiveId(value: string): DirectiveId {
  return brandValue<string, 'DirectiveId'>(value);
}

/** The identity factory for an encounter-definition id slug. */
export function encounterDefinitionId(value: string): EncounterDefinitionId {
  return brandValue<string, 'EncounterDefinitionId'>(value);
}

/** The `'YYYY.MM.DD.N'` shape a content version must carry. */
const CONTENT_VERSION_PATTERN = /^\d{4}\.\d{2}\.\d{2}\.\d+$/;

/**
 * The content-version brand factory. It validates the documented
 * `'YYYY.MM.DD.N'` shape before branding, so a malformed version fails at the
 * boundary rather than silently salting a seed with a typo.
 */
export function contentVersion(value: string): ContentVersion {
  invariant(
    CONTENT_VERSION_PATTERN.test(value),
    `contentVersion: "${value}" is not 'YYYY.MM.DD.N'`,
  );
  return brandValue<string, 'ContentVersion'>(value);
}
