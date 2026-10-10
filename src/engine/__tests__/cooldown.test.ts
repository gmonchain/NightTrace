import { eventDefinitionId, sessionMs, type EventDefinition } from '@/engine/models';
import {
  ENGINE_MIN_EVENT_COOLDOWN_MS,
  advanceCooldowns,
  emptyLedger,
  hasFiredOnce,
  isCoolingDown,
  isSuppressed,
  recordEmission,
} from '@/engine/rules/cooldown';

/**
 * COOLDOWN and ONCE_PER_SESSION (AD-5, FR-2): the engine holds the cooldown and
 * anti-repeat rules, and imposes a content-independent floor beneath whatever
 * content asks for. Content supplies the *numbers*; this module supplies the
 * *rule*, so a content change alone cannot make the firing pattern learnable.
 */
function definition(
  id: string,
  overrides: Partial<EventDefinition> = {},
): EventDefinition {
  return {
    id: eventDefinitionId(id),
    category: 'ambient',
    weight: 1,
    cooldownMs: 0,
    oncePerSession: false,
    extendsSilenceMs: null,
    ...overrides,
  };
}

describe('cooldown ledger', () => {
  it('starts empty', () => {
    expect(emptyLedger()).toEqual({ cooldowns: [], firedOnce: [] });
  });

  it('COOLDOWN: a recorded emission cannot be selected until it elapses', () => {
    const def = definition('howl', { cooldownMs: 480_000 });
    const ledger = recordEmission(emptyLedger(), def, sessionMs(1_000));
    expect(isCoolingDown(ledger, def.id, sessionMs(1_000))).toBe(true);
    expect(isCoolingDown(ledger, def.id, sessionMs(480_999))).toBe(true);
    // The record's `untilMs` is exclusive, so at exactly the boundary it is free.
    expect(isCoolingDown(ledger, def.id, sessionMs(481_000))).toBe(false);
    expect(isSuppressed(ledger, def, sessionMs(100_000))).toBe(true);
    expect(isSuppressed(ledger, def, sessionMs(481_000))).toBe(false);
  });

  it('never honours a content cooldown below the engine floor', () => {
    const def = definition('flicker', { cooldownMs: 0 });
    const ledger = recordEmission(emptyLedger(), def, sessionMs(0));
    const record = ledger.cooldowns[0];
    expect(record?.floorMs).toBe(ENGINE_MIN_EVENT_COOLDOWN_MS);
    // Still cooling at the floor minus one millisecond; free at the floor.
    expect(isCoolingDown(ledger, def.id, sessionMs(ENGINE_MIN_EVENT_COOLDOWN_MS - 1))).toBe(true);
    expect(isCoolingDown(ledger, def.id, sessionMs(ENGINE_MIN_EVENT_COOLDOWN_MS))).toBe(false);
  });

  it('honours a content cooldown longer than the floor', () => {
    const def = definition('howl', { cooldownMs: 480_000 });
    const ledger = recordEmission(emptyLedger(), def, sessionMs(0));
    expect(ledger.cooldowns[0]?.floorMs).toBe(480_000);
  });

  it('ONCE_PER_SESSION: an already-fired definition is suppressed forever', () => {
    const def = definition('close_pass', { oncePerSession: true, cooldownMs: 0 });
    const ledger = recordEmission(emptyLedger(), def, sessionMs(0));
    expect(hasFiredOnce(ledger, def.id)).toBe(true);
    // Past every cooldown window, the definition is still suppressed.
    expect(isSuppressed(ledger, def, sessionMs(86_400_000))).toBe(true);
  });

  it('does not mark a non-once definition as spent', () => {
    const def = definition('branch_snap', { oncePerSession: false });
    const ledger = recordEmission(emptyLedger(), def, sessionMs(0));
    expect(hasFiredOnce(ledger, def.id)).toBe(false);
  });

  it('replaces a definition record rather than duplicating it', () => {
    const def = definition('knock', { cooldownMs: 60_000 });
    const first = recordEmission(emptyLedger(), def, sessionMs(0));
    const second = recordEmission(first, def, sessionMs(200_000));
    expect(second.cooldowns).toHaveLength(1);
    expect(second.cooldowns[0]?.untilMs).toBe(260_000);
  });

  it('advanceCooldowns drops expired records and preserves order', () => {
    const a = definition('a', { cooldownMs: 10_000 });
    const b = definition('b', { cooldownMs: 100_000 });
    let ledger = emptyLedger();
    ledger = recordEmission(ledger, a, sessionMs(0));
    ledger = recordEmission(ledger, b, sessionMs(0));
    const advanced = advanceCooldowns(ledger, sessionMs(50_000));
    expect(advanced.cooldowns.map((record) => record.definitionId)).toEqual([
      eventDefinitionId('b'),
    ]);
  });

  it('advanceCooldowns returns the same ledger when nothing expires', () => {
    const def = definition('a', { cooldownMs: 100_000 });
    const ledger = recordEmission(emptyLedger(), def, sessionMs(0));
    expect(advanceCooldowns(ledger, sessionMs(10_000))).toBe(ledger);
  });

  it('a content change alone cannot make the pattern learnable', () => {
    // A content author zeroes a cooldown; the engine floor still enforces a gap.
    const weak = definition('weak', { cooldownMs: 0 });
    const ledger = recordEmission(emptyLedger(), weak, sessionMs(0));
    expect(isCoolingDown(ledger, weak.id, sessionMs(1))).toBe(true);
  });
});
