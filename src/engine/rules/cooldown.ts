/**
 * The cooldown and anti-repeat rule — **engine-held**, never content (FR-2).
 *
 * Content supplies the *numbers* (`EventDefinition.cooldownMs`,
 * `oncePerSession`); this module supplies the *rule* that enforces them. That
 * separation is the point: a content author can shorten a cooldown or clear a
 * flag, but cannot make the firing pattern learnable, because the engine also
 * imposes its own floor ({@link ENGINE_MIN_EVENT_COOLDOWN_MS}) beneath whatever
 * content asks for.
 *
 * A `CooldownLedger` is plain, serializable data (arrays in a deterministic
 * order), so it survives a `TickResult` deep-equality replay comparison.
 */

import type { EventDefinitionId, SessionMs } from '../models';
import type { EventDefinition } from '../models';

/**
 * The engine's **content-independent** minimum per-event cooldown. Content may
 * ask for less; the engine never honours less than this.
 */
export const ENGINE_MIN_EVENT_COOLDOWN_MS = 30_000;

/** One cooling-down event: when it may fire again, and the floor that set it. */
export interface CooldownRecord {
  readonly definitionId: EventDefinitionId;
  readonly untilMs: SessionMs;
  /** The enforced minimum gap (the larger of content's and the engine's). */
  readonly floorMs: SessionMs;
}

/** The engine-held cooldown and anti-repeat state (the rule's whole memory). */
export interface CooldownLedger {
  readonly cooldowns: readonly CooldownRecord[];
  /** The definitions already fired this session that are `oncePerSession`. */
  readonly firedOnce: readonly EventDefinitionId[];
}

/** The empty ledger: nothing cooling, nothing spent. */
export function emptyLedger(): CooldownLedger {
  return { cooldowns: [], firedOnce: [] };
}

/** Whether `id` is still cooling down at `atMs`. */
export function isCoolingDown(
  ledger: CooldownLedger,
  id: EventDefinitionId,
  atMs: SessionMs,
): boolean {
  return ledger.cooldowns.some(
    (record) => record.definitionId === id && record.untilMs > atMs,
  );
}

/** Whether a `oncePerSession` definition has already fired this session. */
export function hasFiredOnce(
  ledger: CooldownLedger,
  id: EventDefinitionId,
): boolean {
  return ledger.firedOnce.includes(id);
}

/**
 * Whether the engine must not select this definition now: it is cooling down,
 * or it is `oncePerSession` and has already fired.
 */
export function isSuppressed(
  ledger: CooldownLedger,
  definition: EventDefinition,
  atMs: SessionMs,
): boolean {
  if (isCoolingDown(ledger, definition.id, atMs)) {
    return true;
  }
  return definition.oncePerSession && hasFiredOnce(ledger, definition.id);
}

/**
 * Drop every cooldown that has expired by `atMs`. Called before a selection so
 * the ledger cannot grow without bound across a long session. Order-preserving,
 * so the ledger stays deterministic.
 */
export function advanceCooldowns(
  ledger: CooldownLedger,
  atMs: SessionMs,
): CooldownLedger {
  const cooldowns = ledger.cooldowns.filter((record) => record.untilMs > atMs);
  if (cooldowns.length === ledger.cooldowns.length) {
    return ledger;
  }
  return { ...ledger, cooldowns };
}

/**
 * Record that `definition` fired at `atMs`: start its cooldown (the larger of
 * content's `cooldownMs` and the engine's floor) and mark it spent when it is
 * `oncePerSession`. A definition already in the ledger is replaced, never
 * duplicated.
 */
export function recordEmission(
  ledger: CooldownLedger,
  definition: EventDefinition,
  atMs: SessionMs,
): CooldownLedger {
  const floorMs = Math.max(
    ENGINE_MIN_EVENT_COOLDOWN_MS,
    Math.max(0, definition.cooldownMs),
  ) as SessionMs;
  const next: CooldownRecord = {
    definitionId: definition.id,
    untilMs: (atMs + floorMs) as SessionMs,
    floorMs,
  };
  const cooldowns = [
    ...ledger.cooldowns.filter(
      (record) => record.definitionId !== definition.id,
    ),
    next,
  ];
  const firedOnce =
    definition.oncePerSession && !ledger.firedOnce.includes(definition.id)
      ? [...ledger.firedOnce, definition.id]
      : ledger.firedOnce;
  return { cooldowns, firedOnce };
}
