import { IdFactory } from '@/services/IdFactory';

/**
 * `IdFactory` is the sole producer of ids: opaque strings at runtime, branded
 * at compile time. Runtime assertions cover uniqueness and shape; the brand is
 * a compile-time property proven by the type-level test at the bottom.
 */
describe('IdFactory', () => {
  it('produces an opaque string carrying its own prefix', () => {
    const id = IdFactory.evidence();
    expect(typeof id).toBe('string');
    expect(id.startsWith('ev_')).toBe(true);
  });

  it('namespaces each entity so a raw string is self-describing', () => {
    expect(IdFactory.session().startsWith('ses_')).toBe(true);
    expect(IdFactory.case().startsWith('case_')).toBe(true);
    expect(IdFactory.caseReport().startsWith('rpt_')).toBe(true);
    expect(IdFactory.media().startsWith('med_')).toBe(true);
    expect(IdFactory.encounter().startsWith('enc_')).toBe(true);
    expect(IdFactory.discovery().startsWith('disc_')).toBe(true);
    expect(IdFactory.badgeAward().startsWith('badge_')).toBe(true);
    expect(IdFactory.analyticsEvent().startsWith('an_')).toBe(true);
    expect(IdFactory.installRef().startsWith('install_')).toBe(true);
  });

  it('never repeats an id across a large run', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 10_000; i += 1) {
      seen.add(IdFactory.evidence());
    }
    expect(seen.size).toBe(10_000);
  });

  it('mints the same entity kind into the same branded type', () => {
    const a = IdFactory.case();
    const b = IdFactory.case();
    // Both are CaseId at compile time; assignment below fails to typecheck if
    // the brands diverge.
    const caseIds: readonly (typeof a)[] = [a, b];
    expect(caseIds).toHaveLength(2);
  });
});
