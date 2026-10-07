/**
 * `Seal` — the product's status impression.
 *
 * A `colors.bone` ring, rotated `components.seal.rotation` degrees so it reads
 * as applied by hand, carrying the ring text `NIGHTTRACE · FIELD` set on a
 * `TextPath` with the status word in `typography.stamp` centred inside it.
 * `UNEXPLAINED` takes the ink (`components.seal.ink`, `safelight-soft`);
 * `INCONCLUSIVE` and `EXPLAINED` both read in `colors.bone` and differ only in
 * the word — the status word is always the difference, never a colour
 * (DESIGN.md, Components; UX-DR25).
 *
 * **The ink.** The distortion is the token's own: the filter is
 * `filters[components.seal.distortion]`, declared from the token's `region` and
 * its five `steps`, so AD-17's one-definition rule holds and the later
 * `REVISED` stamp shares it. But `react-native-svg@15.15.4` implements only two
 * of the four primitives (three of the five steps render `null`) —
 * `FeColorMatrix` and `FeComposite` render, while `FeTurbulence` (twice) and
 * `FeDisplacementMap` **return `null`** — so the turbulence half of the ink is a
 * no-op on device and a `<Circle>` would read clean-edged on screen while the AC
 * says it never may. The edge is therefore delivered by the ring's **own
 * geometry**: a closed `Path` whose radius varies slightly and deterministically
 * from the ink's first turbulence step (selected by `primitive`, not by index).
 * The token's filter is still declared, so the impression sharpens with no code
 * change the day the platform gains the primitives.
 *
 * The filter and the ring path carry **per-instance** ids (`useId`), so two
 * seals in one tree never collide and each `url(#…)` / `href="#…"` binds its
 * own instance.
 */

import { Fragment, useId, type ReactElement } from 'react';
import Svg, {
  Defs,
  FeColorMatrix,
  FeComposite,
  FeDisplacementMap,
  FeTurbulence,
  Filter,
  G,
  Path,
  Text as SvgText,
  TextPath,
} from 'react-native-svg';

import { colors, components, filters, spacing, typography } from '../theme/tokens';
import { textStyle, type TextStyleResult } from '../theme/type';

/** The three statuses the seal can carry — a closed union. */
export const SEAL_STATUSES = ['UNEXPLAINED', 'INCONCLUSIVE', 'EXPLAINED'] as const;

export type SealStatus = (typeof SEAL_STATUSES)[number];

export type SealProps = {
  readonly status: SealStatus;
};

/** The ring text, verbatim from the design source. */
const RING_TEXT = 'NIGHTTRACE · FIELD';

/** How finely the ring's wobble is sampled. */
const RING_POINTS = 72;

type InkStep = (typeof filters.ntInk.steps)[number];

/** The turbulence step — the `seed` carrier the ring's wobble derives from. */
type TurbulenceStep = Extract<InkStep, { primitive: 'feTurbulence' }>;

function isTurbulence(step: InkStep): step is TurbulenceStep {
  return step.primitive === 'feTurbulence';
}

/**
 * The seed the ring's wobble derives from: the ink's first turbulence step,
 * selected by `primitive` rather than by position, so a token reorder cannot
 * silently change the wobble or leave it `undefined`.
 */
function turbulenceSeed(steps: readonly InkStep[]): number {
  const turbulence = steps.find(isTurbulence);
  return turbulence === undefined ? 0 : turbulence.seed;
}

const ringTextStyle = textStyle(typography.micro);
const stampStyle = textStyle(typography.stamp);

/**
 * The step-to-element seam: a pure mapping from one `filters.ntInk` step to the
 * `react-native-svg` element it names, carrying that step's own field values.
 * Exported so the suite can assert the mapping against the token directly —
 * three of the five elements render `null`, so they leave no host node to check
 * in the rendered tree.
 */
export function stepToElement(
  step: InkStep,
): ReactElement<Record<string, unknown>> {
  switch (step.primitive) {
    case 'feTurbulence':
      return (
        <FeTurbulence
          type={step.type}
          baseFrequency={step.baseFrequency}
          numOctaves={step.numOctaves}
          seed={step.seed}
          result={step.result}
        />
      );
    case 'feDisplacementMap':
      return (
        <FeDisplacementMap
          in={step.in}
          in2={step.in2}
          scale={step.scale}
          result={step.result}
        />
      );
    case 'feColorMatrix':
      return (
        <FeColorMatrix
          in={step.in}
          type={step.type}
          values={step.values}
          result={step.result}
        />
      );
    case 'feComposite':
      return <FeComposite in={step.in} in2={step.in2} operator={step.operator} />;
    default: {
      const exhaustive: never = step;
      return exhaustive;
    }
  }
}

/** Every element of the ink filter, in the token's own order. */
export function inkFilterElements(): readonly ReactElement<Record<string, unknown>>[] {
  return filters[components.seal.distortion].steps.map((step) => stepToElement(step));
}

/**
 * A closed ring path whose radius varies slightly and deterministically — the
 * hand-applied edge the platform's filter cannot supply. The variation is
 * derived from the ink's `seed`, so the geometry is a function of the token.
 */
export function inkRingPath(radius: number, centre: number, seed: number): string {
  const amplitude = 1 + (seed % 4) * 0.5;
  const segments: string[] = [];
  for (let i = 0; i < RING_POINTS; i += 1) {
    const angle = (i / RING_POINTS) * Math.PI * 2;
    const wobble =
      Math.sin(angle * 5 + seed) * amplitude +
      Math.sin(angle * 11 + seed * 2) * (amplitude / 2);
    const r = radius + wobble;
    const x = centre + Math.cos(angle) * r;
    const y = centre + Math.sin(angle) * r;
    segments.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return `${segments.join(' ')} Z`;
}

/** The status word's ink: only `UNEXPLAINED` takes a colour. */
function statusInk(status: SealStatus): string {
  switch (status) {
    case 'UNEXPLAINED':
      return colors['safelight-soft'];
    case 'INCONCLUSIVE':
    case 'EXPLAINED':
      return colors.bone;
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}

/** An SVG text style with only the keys the step actually carries. */
function svgTextProps(style: TextStyleResult): {
  readonly fontFamily: string;
  readonly fontSize: number;
  readonly fontWeight: TextStyleResult['fontWeight'];
  readonly letterSpacing?: number;
} {
  return {
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    ...(style.letterSpacing === undefined
      ? {}
      : { letterSpacing: style.letterSpacing }),
  };
}

export function Seal({ status }: SealProps): React.JSX.Element {
  const ink = filters[components.seal.distortion];
  const seed = turbulenceSeed(ink.steps);

  const size = spacing['9'] * 2;
  const centre = size / 2;
  const radius = centre - spacing['2'];
  const strokeWidth = spacing['1'] / 2;
  const ringColour = colors.bone;
  const ringPath = inkRingPath(radius, centre, seed);

  const uid = useId().replace(/[^A-Za-z0-9_-]/g, '');
  const filterId = `ntInk-${uid}`;
  const ringId = `seal-ring-${uid}`;

  return (
    <Svg
      width={size}
      height={size}
      accessible
      accessibilityRole="image"
      accessibilityLabel={status}
    >
      <Defs>
        <Filter
          id={filterId}
          x={ink.region.x}
          y={ink.region.y}
          width={ink.region.width}
          height={ink.region.height}
        >
          {inkFilterElements().map((element, index) => (
            <Fragment key={index}>{element}</Fragment>
          ))}
        </Filter>
        <Path id={ringId} d={ringPath} fill="none" />
      </Defs>
      <G
        transform={`rotate(${components.seal.rotation} ${centre} ${centre})`}
        filter={`url(#${filterId})`}
      >
        <Path d={ringPath} fill="none" stroke={ringColour} strokeWidth={strokeWidth} />
        <SvgText fill={ringColour} {...svgTextProps(ringTextStyle)}>
          <TextPath
            href={`#${ringId}`}
            startOffset={Math.PI * radius}
            textAnchor="middle"
          >
            {RING_TEXT}
          </TextPath>
        </SvgText>
        <SvgText
          x={centre}
          y={centre + stampStyle.fontSize / 3}
          fill={statusInk(status)}
          textAnchor="middle"
          {...svgTextProps(stampStyle)}
        >
          {status}
        </SvgText>
      </G>
    </Svg>
  );
}
