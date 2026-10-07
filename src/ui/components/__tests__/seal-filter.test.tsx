import { render } from '@testing-library/react-native';
import {
  FeColorMatrix,
  FeComposite,
  FeDisplacementMap,
  FeTurbulence,
} from 'react-native-svg';

import { filters } from '../../theme/tokens';
import { Seal, inkFilterElements, stepToElement } from '../Seal';
import { find, flatten, withProperty } from './tree';

/**
 * The ink filter, asserted against the token.
 *
 * `react-native-svg@15.15.4` implements only **two of the four primitives** the
 * ink names — `FeColorMatrix` and `FeComposite` (three of the five steps render
 * `null`: `FeTurbulence` twice and `FeDisplacementMap`). Those nulled steps
 * leave no host node to check; that is exactly why the `Seal` delivers its edge
 * from the ring path's own geometry. Asserting `filters.ntInk.steps.map(…)` in
 * isolation would pass with the `Seal` deleted, so this suite drives the pure
 * `stepToElement` seam the component itself renders through, and probes it by
 * mutating the token.
 */

const steps = filters.ntInk.steps;

describe('the ink filter’s step-to-element seam', () => {
  it('maps each step to the primitive it names, carrying its own fields', () => {
    const turbulence = steps[0];
    const turbulenceElement = stepToElement(turbulence);
    expect(turbulenceElement.type).toBe(FeTurbulence);
    expect(turbulenceElement.props).toMatchObject({
      type: turbulence.type,
      baseFrequency: turbulence.baseFrequency,
      numOctaves: turbulence.numOctaves,
      seed: turbulence.seed,
      result: turbulence.result,
    });

    const displacement = steps[1];
    const displacementElement = stepToElement(displacement);
    expect(displacementElement.type).toBe(FeDisplacementMap);
    expect(displacementElement.props).toMatchObject({
      in: displacement.in,
      in2: displacement.in2,
      scale: displacement.scale,
      result: displacement.result,
    });

    const matrix = steps[3];
    const matrixElement = stepToElement(matrix);
    expect(matrixElement.type).toBe(FeColorMatrix);
    expect(matrixElement.props).toMatchObject({
      in: matrix.in,
      type: matrix.type,
      values: matrix.values,
      result: matrix.result,
    });

    const composite = steps[4];
    const compositeElement = stepToElement(composite);
    expect(compositeElement.type).toBe(FeComposite);
    expect(compositeElement.props).toMatchObject({
      in: composite.in,
      in2: composite.in2,
      operator: composite.operator,
    });
  });

  it('declares every step of the token, in the token’s order', () => {
    const elements = inkFilterElements();
    expect(elements).toHaveLength(steps.length);
    expect(elements.map((element) => element.type)).toEqual([
      FeTurbulence,
      FeDisplacementMap,
      FeTurbulence,
      FeColorMatrix,
      FeComposite,
    ]);
  });

  it('reads a step’s value rather than re-spelling it', () => {
    // Mutating the token singleton *is* how the suite proves the value is read;
    // `as const` does not freeze at runtime. Restored unconditionally.
    withProperty(steps[0], 'baseFrequency', 0.99, () => {
      expect(stepToElement(steps[0]).props.baseFrequency).toBe(0.99);
    });
    expect(stepToElement(steps[0]).props.baseFrequency).toBe(
      steps[0].baseFrequency,
    );
  });

  it('the rendered filter follows a mutated step value', async () => {
    const matrixStep = steps[3];
    const original: unknown = Reflect.get(matrixStep, 'values');
    Reflect.set(matrixStep, 'values', '0 0 0 0 1');
    try {
      const { toJSON } = await render(<Seal status="EXPLAINED" />);
      const matrix = find(toJSON(), (element) => element.type === 'RNSVGFeColorMatrix');
      expect(matrix?.props.values).toEqual([0, 0, 0, 0, 1]);
    } finally {
      Reflect.set(matrixStep, 'values', original);
    }
  });

  it('declares the token’s own filter region', async () => {
    const { toJSON } = await render(<Seal status="EXPLAINED" />);
    const filter = find(toJSON(), (element) => element.type === 'RNSVGFilter');
    expect(filter?.props).toMatchObject({
      x: filters.ntInk.region.x,
      y: filters.ntInk.region.y,
      width: filters.ntInk.region.width,
      height: filters.ntInk.region.height,
    });
  });

  it('the rendered filter follows a mutated region value', async () => {
    // `react-native-svg`'s `Filter` defaults are exactly the token's four
    // region strings, so the assertion above cannot fail if the `Seal` stopped
    // passing the region. Mutating a value with a different spelling makes the
    // rendered filter observable — a literal region would stay at the default.
    const region = filters.ntInk.region;
    const original = region.width;
    Reflect.set(region, 'width', '150%');
    try {
      const { toJSON } = await render(<Seal status="EXPLAINED" />);
      const filter = find(toJSON(), (element) => element.type === 'RNSVGFilter');
      expect(filter?.props.width).toBe('150%');
      expect(filter?.props.width).not.toBe(original);
    } finally {
      Reflect.set(region, 'width', original);
    }
  });

  it('only the two implemented primitives reach the host tree', async () => {
    const { toJSON } = await render(<Seal status="EXPLAINED" />);
    const types = flatten(toJSON()).map((element) => element.type);
    expect(types).toContain('RNSVGFeColorMatrix');
    expect(types).toContain('RNSVGFeComposite');
    // The platform returns null for these two, which is why the ring path
    // supplies the edge. If a future react-native-svg implements them, this
    // assertion is the canary that the ink now also distorts on its own.
    expect(types).not.toContain('RNSVGFeTurbulence');
    expect(types).not.toContain('RNSVGFeDisplacementMap');
  });
});
