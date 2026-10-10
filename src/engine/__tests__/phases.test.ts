import {
  SESSION_PHASES,
  SESSION_PHASE_VOCABULARY,
  type SessionPhase,
} from '@/engine/models';
import {
  PHASE_GATES,
  PHASE_LADDER,
  advancePhase,
  gateFor,
  phaseRank,
} from '@/engine/rules/phases';

/**
 * PHASE_LADDER (AD-25, FR-35).
 *
 * The internal ladder is closed at five, advances in order, never moves
 * backwards and never skips a phase; `ENDED` is a terminal marker that is not a
 * phase and has no gate. The transition is a table, and a gate is met by elapsed
 * time **and** tension together.
 */
describe('PHASE_LADDER: the closed five, in order', () => {
  it('is exactly the closed five, in order', () => {
    expect(PHASE_LADDER).toEqual([
      'QUIET',
      'SIGNALS',
      'ACTIVITY',
      'ENCOUNTER_WINDOW',
      'RESOLUTION',
    ]);
    expect(PHASE_LADDER).toBe(SESSION_PHASES);
  });

  it('never names ENDED as a phase', () => {
    expect(PHASE_LADDER).not.toContain('ENDED');
    expect(SESSION_PHASE_VOCABULARY).toContain('ENDED');
  });

  it('gives every phase at most one outgoing gate, to the next phase in order', () => {
    for (const gate of PHASE_GATES) {
      expect(phaseRank(gate.to)).toBe(phaseRank(gate.from) + 1);
      expect(gateFor(gate.from)).toBe(gate);
    }
    // RESOLUTION is terminal: it has no outgoing gate.
    expect(gateFor('RESOLUTION')).toBeNull();
  });

  it('does not advance before the time gate, even at maximum tension', () => {
    expect(advancePhase('QUIET', { elapsedMs: 0, tension: 100 })).toBe('QUIET');
    expect(advancePhase('QUIET', { elapsedMs: 179_999, tension: 100 })).toBe('QUIET');
  });

  it('advances exactly one phase when the time gate is met', () => {
    expect(advancePhase('QUIET', { elapsedMs: 180_000, tension: 100 })).toBe('SIGNALS');
    // A skip is impossible by construction: even far past the gate, it is one step.
    expect(advancePhase('QUIET', { elapsedMs: 10_000_000, tension: 100 })).toBe('SIGNALS');
    expect(advancePhase('SIGNALS', { elapsedMs: 10_000_000, tension: 100 })).toBe('ACTIVITY');
  });

  it('never moves backwards', () => {
    // No gate's `to` is an earlier phase, so a phase can only hold or step forward.
    for (const phase of PHASE_LADDER) {
      const next = advancePhase(phase, { elapsedMs: 0, tension: 0 });
      expect(phaseRank(next)).toBeGreaterThanOrEqual(phaseRank(phase));
    }
  });

  it('leaves the terminal RESOLUTION phase unchanged', () => {
    expect(advancePhase('RESOLUTION', { elapsedMs: 10_000_000, tension: 100 })).toBe(
      'RESOLUTION',
    );
  });

  it('gates the window step on tension: the time alone is not enough', () => {
    // ACTIVITY → ENCOUNTER_WINDOW carries a tension floor.
    expect(advancePhase('ACTIVITY', { elapsedMs: 840_000, tension: 0 })).toBe('ACTIVITY');
    expect(advancePhase('ACTIVITY', { elapsedMs: 840_000, tension: 4 })).toBe('ACTIVITY');
    expect(advancePhase('ACTIVITY', { elapsedMs: 840_000, tension: 5 })).toBe(
      'ENCOUNTER_WINDOW',
    );
  });

  it('walks the whole ladder in order under sustained tension, skipping nothing', () => {
    let phase: SessionPhase = 'QUIET';
    const seen: SessionPhase[] = [phase];
    for (let elapsed = 0; elapsed <= 1_200_000; elapsed += 1_000) {
      const next = advancePhase(phase, { elapsedMs: elapsed, tension: 100 });
      if (next !== phase) {
        seen.push(next);
        phase = next;
      }
    }
    // A phase that skipped SIGNALS would leave it out here and fail.
    expect(seen).toEqual(PHASE_LADDER);
  });

  it('stalls at the tension-gated step when tension never rises', () => {
    let phase: SessionPhase = 'QUIET';
    const seen: SessionPhase[] = [phase];
    for (let elapsed = 0; elapsed <= 1_200_000; elapsed += 1_000) {
      const next = advancePhase(phase, { elapsedMs: elapsed, tension: 0 });
      if (next !== phase) {
        seen.push(next);
        phase = next;
      }
    }
    // The time gates carry it to ACTIVITY; the tension gate stops it there.
    expect(seen).toEqual(['QUIET', 'SIGNALS', 'ACTIVITY']);
  });
});
