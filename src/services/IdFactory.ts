/**
 * `IdFactory` is the sole producer of ids (AD-14, Consistency Conventions).
 *
 * Ids are opaque strings at runtime and branded types at compile time, so a
 * `CaseId` can never be passed where an `EvidenceId` is expected — the bug
 * class a content-driven system produces at scale and the one unit tests catch
 * last.
 *
 * Content ids (`HuntId`, `CreatureId`, …) are kebab-case slugs authored in
 * `src/data/**` and validated by content, so they are typed here but not minted
 * here. This module mints ids for user data only.
 */

declare const brand: unique symbol;

/** A nominal type over a runtime primitive. */
export type Brand<T, B extends string> = T & { readonly [brand]: B };

export type SessionId = Brand<string, 'SessionId'>;
export type CaseId = Brand<string, 'CaseId'>;
export type CaseReportId = Brand<string, 'CaseReportId'>;
export type EvidenceId = Brand<string, 'EvidenceId'>;
export type MediaId = Brand<string, 'MediaId'>;
export type EncounterId = Brand<string, 'EncounterId'>;
export type DiscoveryId = Brand<string, 'DiscoveryId'>;
export type BadgeAwardId = Brand<string, 'BadgeAwardId'>;
export type AnalyticsEventId = Brand<string, 'AnalyticsEventId'>;
export type InstallRef = Brand<string, 'InstallRef'>;

export type MintId = <B extends string>(prefix: string) => Brand<string, B>;

const ENTROPY_RADIX = 36;
const COUNTER_WRAP = 0x100000000;

let counter = 0;

function entropy(): string {
  const value = Math.floor(Math.random() * COUNTER_WRAP);
  return value.toString(ENTROPY_RADIX).padStart(7, '0');
}

function tick(): string {
  counter = (counter + 1) % COUNTER_WRAP;
  return counter.toString(ENTROPY_RADIX);
}

/**
 * Mint an id. Two calls in the same millisecond cannot collide: the value mixes
 * a monotonic counter with fresh entropy, and ids are only ever compared, never
 * ordered.
 */
function mint<B extends string>(prefix: string): Brand<string, B> {
  const value = `${prefix}_${entropy()}${tick()}`;
  // The single assertion in the codebase that mints a brand. Branding is a
  // compile-time claim over an opaque runtime string, so an assertion is
  // inherent to the pattern; it is confined to this one producer.
  return value as Brand<string, B>;
}

export const IdFactory = {
  session: (): SessionId => mint<'SessionId'>('ses'),
  case: (): CaseId => mint<'CaseId'>('case'),
  caseReport: (): CaseReportId => mint<'CaseReportId'>('rpt'),
  evidence: (): EvidenceId => mint<'EvidenceId'>('ev'),
  media: (): MediaId => mint<'MediaId'>('med'),
  encounter: (): EncounterId => mint<'EncounterId'>('enc'),
  discovery: (): DiscoveryId => mint<'DiscoveryId'>('disc'),
  badgeAward: (): BadgeAwardId => mint<'BadgeAwardId'>('badge'),
  analyticsEvent: (): AnalyticsEventId => mint<'AnalyticsEventId'>('an'),
  installRef: (): InstallRef => mint<'InstallRef'>('install'),
} as const;
