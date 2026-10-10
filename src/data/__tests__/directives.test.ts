import { DIRECTIVES, EVENT_DEFINITIONS } from '@/data/content';

/**
 * DIRECTIVE_NO_OBJECT (AD-6): a directive is an *object-less verb*. It narrows
 * what can happen and never names what does — no target, no direction, no
 * thermal concept, and never an event. Content validation, not a comment.
 *
 * `violates` is the gate itself, so the bad-sample cases below fail if the gate
 * is ever weakened (the spec's probe: a `Walk north.` directive must fail it).
 */

/** Directions, targets and thermal ideas a directive must never name. */
const FORBIDDEN_TOKENS: readonly string[] = [
  // Direction / spatial
  'north', 'south', 'east', 'west', 'left', 'right', 'forward', 'forwards',
  'backward', 'backwards', 'behind', 'ahead', 'toward', 'towards', 'near',
  'nearby', 'closer', 'away', 'inside', 'outside', 'above', 'below', 'around',
  'upstairs', 'downstairs',
  // Thermal
  'thermal', 'heat', 'hot', 'cold', 'warm', 'warmth', 'temperature', 'degrees',
  'celsius', 'fahrenheit', 'humidity',
  // Targets / phenomena
  'ghost', 'spirit', 'entity', 'creature', 'cryptid', 'animal', 'figure',
  'shadow', 'knock', 'howl', 'voice',
];

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The reason a directive text violates the object-less rule, or `null`. */
function violates(text: string): string | null {
  if (text.trim() !== text) {
    return 'has surrounding whitespace';
  }
  if (text.length === 0) {
    return 'is empty';
  }
  if (!text.endsWith('.')) {
    return 'does not end with a full stop';
  }
  if (/\d/.test(text)) {
    return 'contains a digit';
  }
  const words = text.replace(/\.$/, '').split(/\s+/);
  if (words.length > 5) {
    return 'is longer than a verb and its adverbial tail';
  }
  for (const token of FORBIDDEN_TOKENS) {
    if (new RegExp(`\\b${escapeRegExp(token)}\\b`, 'i').test(text)) {
      return `names "${token}"`;
    }
  }
  for (const definition of EVENT_DEFINITIONS) {
    if (text.toLowerCase().includes(String(definition.id).toLowerCase())) {
      return `names the event "${definition.id}"`;
    }
  }
  return null;
}

describe('DIRECTIVE_NO_OBJECT: the authored directive pool', () => {
  it('is a non-empty pool', () => {
    expect(DIRECTIVES.length).toBeGreaterThan(0);
  });

  it('every directive is an object-less verb naming nothing forbidden', () => {
    const violations = DIRECTIVES.map((directive) => ({
      id: directive.id,
      text: directive.text,
      reason: violates(directive.text),
    })).filter((entry) => entry.reason !== null);
    expect(violations).toEqual([]);
  });

  it('rejects a directive that names a direction, a thermal idea or a target', () => {
    // The spec's probes — each must be caught by the same gate the pool is
    // held to, so the gate is not vacuous.
    expect(violates('Walk north.')).toMatch(/north/);
    expect(violates('Feel the thermal rise.')).toMatch(/thermal/);
    expect(violates('Follow the ghost.')).toMatch(/ghost/);
    expect(violates('Watch the shadow.')).toMatch(/shadow/);
    expect(violates('Stand still for 30 seconds.')).toMatch(/digit/);
    expect(violates('Hold still')).toMatch(/full stop/);
  });

  it('accepts the shipped form (a bare verb with an adverbial tail)', () => {
    expect(violates('Hold still.')).toBeNull();
    expect(violates('Take your time.')).toBeNull();
  });
});
