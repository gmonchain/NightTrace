import { render } from '@testing-library/react-native';

import { colors, components, filters, spacing, typography } from '../../theme/tokens';
import { SEAL_STATUSES, Seal, type SealStatus } from '../Seal';
import type { HostElement } from './tree';
import { byType, find, flatten, svgColorPayload } from './tree';

const CENTRE = spacing['9'];
const RING_TEXT = 'NIGHTTRACE · FIELD';

/** The ARGB payload of a rendered SVG paint (`fill`/`stroke`). */
function paint(value: unknown): number | undefined {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'object' && value !== null) {
    const payload = Reflect.get(value, 'payload');
    return typeof payload === 'number' ? payload : undefined;
  }
  return undefined;
}

async function renderSeal(status: SealStatus): Promise<HostElement> {
  const { toJSON } = await render(<Seal status={status} />);
  const root = toJSON();
  expect(root).not.toBeNull();
  if (root === null) {
    throw new Error('Seal rendered nothing');
  }
  return root;
}

/** The drawn ring (the path that carries a stroke). */
function ringPath(root: HostElement): HostElement | undefined {
  return find(
    root,
    (element) => element.type === 'RNSVGPath' && element.props.stroke !== undefined,
  );
}

/** The SVG text whose TSpan renders `content`. */
function textOf(root: HostElement, content: string): HostElement | undefined {
  return find(
    root,
    (element) =>
      element.type === 'RNSVGText' &&
      flatten(element).some((child) => child.props.content === content),
  );
}

/** The radii sampled by the ring path, from its own geometry. */
function ringRadii(d: string): readonly number[] {
  const radii: number[] = [];
  const pattern = /[ML]\s+(-?[\d.]+)\s+(-?[\d.]+)/g;
  for (const match of d.matchAll(pattern)) {
    const x = Number(match[1] ?? 'NaN');
    const y = Number(match[2] ?? 'NaN');
    radii.push(Math.hypot(x - CENTRE, y - CENTRE));
  }
  return radii;
}

function fontOf(element: HostElement | undefined): {
  readonly fontSize?: unknown;
  readonly fontWeight?: unknown;
  readonly fontFamily?: unknown;
  readonly letterSpacing?: unknown;
  readonly textAnchor?: unknown;
} {
  const font: unknown = element?.props.font;
  if (typeof font !== 'object' || font === null) {
    return {};
  }
  return {
    fontSize: Reflect.get(font, 'fontSize'),
    fontWeight: Reflect.get(font, 'fontWeight'),
    fontFamily: Reflect.get(font, 'fontFamily'),
    letterSpacing: Reflect.get(font, 'letterSpacing'),
    textAnchor: Reflect.get(font, 'textAnchor'),
  };
}

describe('Seal', () => {
  it('SEAL_UNEXPLAINED: a bone ring, the ring text, and safelight-soft ink', async () => {
    const root = await renderSeal('UNEXPLAINED');
    const ring = ringPath(root);
    expect(paint(ring?.props.stroke)).toBe(svgColorPayload(colors.bone));

    const ringText = textOf(root, RING_TEXT);
    expect(paint(ringText?.props.fill)).toBe(svgColorPayload(colors.bone));

    const word = textOf(root, 'UNEXPLAINED');
    expect(paint(word?.props.fill)).toBe(
      svgColorPayload(colors['safelight-soft']),
    );
  });

  it('SEAL_NEUTRAL: INCONCLUSIVE and EXPLAINED read in bone and differ only in the word', async () => {
    for (const status of ['INCONCLUSIVE', 'EXPLAINED'] as const) {
      const root = await renderSeal(status);
      expect(paint(textOf(root, status)?.props.fill)).toBe(
        svgColorPayload(colors.bone),
      );
      expect(paint(ringPath(root)?.props.stroke)).toBe(
        svgColorPayload(colors.bone),
      );
    }
  });

  it('the two neutral trees differ only in the status word', async () => {
    const neutral = async (status: 'INCONCLUSIVE' | 'EXPLAINED'): Promise<string> => {
      const root = await renderSeal(status);
      return JSON.stringify(root)
        .replace(/_r_\d+_/g, '<uid>')
        .split(status)
        .join('<STATUS>');
    };
    expect(await neutral('INCONCLUSIVE')).toBe(await neutral('EXPLAINED'));
  });

  it('sets the status word in typography.stamp, centred', async () => {
    const root = await renderSeal('EXPLAINED');
    const font = fontOf(textOf(root, 'EXPLAINED'));
    expect(font.fontSize).toBe(typography.stamp.fontSize);
    expect(font.fontWeight).toBe(typography.stamp.fontWeight);
    expect(font.fontFamily).toBe(typography.stamp.fontFamily);
    expect(font.letterSpacing).toBeCloseTo(
      typography.stamp.fontSize * typography.stamp.letterSpacing,
      6,
    );
    expect(font.textAnchor).toBe('middle');
  });

  it('sets the ring text in typography.micro', async () => {
    const root = await renderSeal('EXPLAINED');
    const font = fontOf(textOf(root, RING_TEXT));
    expect(font.fontSize).toBe(typography.micro.fontSize);
    expect(font.fontWeight).toBe(typography.micro.fontWeight);
    expect(font.fontFamily).toBe(typography.micro.fontFamily);
    expect(font.letterSpacing).toBeCloseTo(
      typography.micro.fontSize * typography.micro.letterSpacing,
      6,
    );
  });

  it('rotates the ring by components.seal.rotation degrees', async () => {
    const root = await renderSeal('EXPLAINED');
    const group = find(root, (element) => typeof element.props.filter === 'string');
    const rawMatrix: unknown = group?.props.matrix;
    const matrix: readonly unknown[] = Array.isArray(rawMatrix) ? rawMatrix : [];
    const a = typeof matrix[0] === 'number' ? matrix[0] : Number.NaN;
    const b = typeof matrix[1] === 'number' ? matrix[1] : Number.NaN;
    const radians = (components.seal.rotation * Math.PI) / 180;
    expect(a).toBeCloseTo(Math.cos(radians), 6);
    expect(b).toBeCloseTo(Math.sin(radians), 6);
  });

  it('the ring is not a clean circle, and the edge is the path’s own geometry', async () => {
    const root = await renderSeal('EXPLAINED');
    const ring = ringPath(root);
    // A clean circle is a `Circle`; the ring must be a path.
    expect(byType(root, 'RNSVGCircle')).toHaveLength(0);
    expect(ring?.type).toBe('RNSVGPath');
    const d = typeof ring?.props.d === 'string' ? ring.props.d : '';
    const radii = ringRadii(d);
    expect(radii.length).toBeGreaterThan(3);
    const spread = Math.max(...radii) - Math.min(...radii);
    expect(spread).toBeGreaterThan(0);
    // The platform drops the token's turbulence/displacement primitives, so no
    // host node carries them — the wobble cannot come from the filter.
    const types = flatten(root).map((element) => element.type);
    expect(types).not.toContain('RNSVGFeTurbulence');
    expect(types).not.toContain('RNSVGFeDisplacementMap');
  });

  it('derives the ring’s radius and stroke from the spacing stops', async () => {
    const ring = ringPath(await renderSeal('EXPLAINED'));
    expect(ring?.props.strokeWidth).toBe(spacing['1'] / 2);
    const d = typeof ring?.props.d === 'string' ? ring.props.d : '';
    const radii = ringRadii(d);
    // The radius is `centre − spacing['2']`, with `centre = spacing['9'] / 2`.
    const mean = radii.reduce((sum, value) => sum + value, 0) / radii.length;
    expect(mean).toBeCloseTo(spacing['9'] - spacing['2'], 0);
  });

  it('derives the ring’s wobble from the ink’s turbulence seed', async () => {
    const baseline = ringPath(await renderSeal('EXPLAINED'));
    const baselineD =
      typeof baseline?.props.d === 'string' ? baseline.props.d : '';
    const baselineRadii = ringRadii(baselineD);

    // The seed is selected from the ink (a turbulence step), so mutating it
    // must move the sampled radii — "spread > 0" alone is invariant under any
    // constant. Restored unconditionally.
    const step = filters.ntInk.steps[0];
    const original = step.seed;
    Reflect.set(step, 'seed', original + 2);
    try {
      const mutated = ringPath(await renderSeal('EXPLAINED'));
      const mutatedD =
        typeof mutated?.props.d === 'string' ? mutated.props.d : '';
      expect(ringRadii(mutatedD)).not.toEqual(baselineRadii);
    } finally {
      Reflect.set(step, 'seed', original);
    }
  });

  it('two seals in one tree carry distinct filter and ring-path ids', async () => {
    const { toJSON } = await render(
      <>
        <Seal status="EXPLAINED" />
        <Seal status="UNEXPLAINED" />
      </>,
    );
    const root = toJSON();
    const filterNames = byType(root, 'RNSVGFilter').map(
      (element) => element.props.name,
    );
    const ringNames = byType(root, 'RNSVGPath')
      .filter(
        (element) =>
          typeof element.props.name === 'string' &&
          element.props.name.startsWith('seal-ring-'),
      )
      .map((element) => element.props.name);
    const hrefs = byType(root, 'RNSVGTextPath').map(
      (element) => element.props.href,
    );
    expect(new Set(filterNames).size).toBe(2);
    expect(new Set(ringNames).size).toBe(2);
    expect(new Set(hrefs).size).toBe(2);
    // Each group binds its own instance's filter.
    const groupFilters = flatten(root)
      .filter((element) => typeof element.props.filter === 'string')
      .map((element) => element.props.filter);
    expect(new Set(groupFilters)).toEqual(new Set(filterNames));
    expect(new Set(hrefs)).toEqual(new Set(ringNames));
  });

  it('announces its status word to assistive technology', async () => {
    for (const status of SEAL_STATUSES) {
      const root = await renderSeal(status);
      expect(root.props.accessibilityLabel).toBe(status);
    }
  });
});
