import {
  assertNever,
  contentVersion,
  seedValuesFromParts,
  unit,
  type Emission,
  type HuntId,
} from '@/engine/models';
import { seedFromParts } from '@/engine/RandomEngine';

import { partsFixture } from '@/engine/__tests__/fixtures';

/**
 * The model conventions of AD-14, proved rather than asserted: brands are
 * nominal, `unit` clamps, absence is `null`, a model round-trips through JSON,
 * and the `Emission` union's `default: never` arm is exhaustive.
 */
describe('model conventions', () => {
  it('unit is the one clamping brand factory', () => {
    expect(unit(2)).toBe(1);
    expect(unit(1)).toBe(1);
    expect(unit(0.5)).toBe(0.5);
    expect(unit(0)).toBe(0);
    expect(unit(-1)).toBe(0);
  });

  it('contentVersion enforces the YYYY.MM.DD.N shape', () => {
    expect(contentVersion('2026.10.05.1')).toBe('2026.10.05.1');
    expect(() => contentVersion('2026-10-05')).toThrow(/YYYY\.MM\.DD\.N/);
    expect(() => contentVersion('2026.10.05')).toThrow(/YYYY\.MM\.DD\.N/);
  });

  it('makes each brand mutually unassignable at compile time', () => {
    const seed = seedFromParts(['nighttrace']);
    // @ts-expect-error — a Seed is not a HuntId; the brands are distinct.
    const notAHunt: HuntId = seed;
    // The runtime value is still an opaque string; only the type differs.
    expect(typeof notAHunt).toBe('string');
  });

  it('round-trips a seed-parts fixture through JSON unchanged', () => {
    const parts = partsFixture();
    expect(JSON.parse(JSON.stringify(parts))).toEqual(parts);
  });

  it('spells absence as null, never undefined', () => {
    const parts = partsFixture({ coords: null });
    expect(parts.coords).toBeNull();
    expect(parts.coords).not.toBeUndefined();
    expect(seedValuesFromParts(parts)).toContain('null');
  });

  it('Emission is a discriminated union tagged kind', () => {
    const emission: Emission = { kind: 'notice', notice: 'session_started' };
    expect(emission.kind).toBe('notice');
    // The completeness gate: a new Emission variant makes this `Record`
    // incomplete — a compile error — exactly as a consumer's `default` arm does.
    const handled: Readonly<Record<Emission['kind'], true>> = {
      notice: true,
      event: true,
      directive: true,
    };
    expect(Object.keys(handled)).toEqual(['notice', 'event', 'directive']);
  });

  it('assertNever is the exhaustiveness gate a consumer switch ends with', () => {
    // A two-variant union mirrors the shape Emission grows into (2.2 adds
    // `event`, 2.3 `phase`); the `default: never` arm is what makes a new
    // variant a compile error until it is handled.
    type Sample =
      | { readonly kind: 'notice'; readonly notice: string }
      | { readonly kind: 'phase'; readonly phase: string };
    const label = (sample: Sample): string => {
      switch (sample.kind) {
        case 'notice':
          return sample.notice;
        case 'phase':
          return sample.phase;
        default:
          return assertNever(sample);
      }
    };
    expect(label({ kind: 'notice', notice: 'session_started' })).toBe(
      'session_started',
    );
    expect(label({ kind: 'phase', phase: 'quiet' })).toBe('quiet');
  });
});
