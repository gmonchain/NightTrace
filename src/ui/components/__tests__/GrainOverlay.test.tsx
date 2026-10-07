import { render } from '@testing-library/react-native';
import { Animated } from 'react-native';

import { colors, components } from '../../theme/tokens';
import { GrainOverlay } from '../GrainOverlay';
import type { HostElement } from './tree';
import { find, mergedStyle } from './tree';

function rootOf(node: HostElement | null): HostElement {
  if (node === null) {
    throw new Error('GrainOverlay rendered nothing');
  }
  return node;
}

describe('GrainOverlay', () => {
  it('GRAIN_STATIC: full-screen, non-interactive, at the token opacity, and hidden from assistive technology', async () => {
    const { toJSON } = await render(<GrainOverlay />);
    const root = rootOf(toJSON());

    // Full-screen: the overlay is absolutely positioned against all four edges.
    const style = mergedStyle(root);
    expect(style.position).toBe('absolute');
    expect(style.left).toBe(0);
    expect(style.right).toBe(0);
    expect(style.top).toBe(0);
    expect(style.bottom).toBe(0);

    // Non-interactive and decorative (hidden from assistive technology).
    expect(root.props.pointerEvents).toBe('none');
    expect(root.props.accessibilityElementsHidden).toBe(true);
    expect(root.props.importantForAccessibility).toBe('no-hide-descendants');
    expect(root.props.accessible).toBe(false);
  });

  it('composites the tiled asset at components.grain.opacity', async () => {
    const { toJSON } = await render(<GrainOverlay />);
    const root = rootOf(toJSON());
    const image = find(root, (element) => element.type === 'Image');
    expect(image).toBeDefined();
    if (image === undefined) {
      throw new Error('no tile image');
    }
    expect(image.props.resizeMode).toBe('repeat');
    expect(image.props.tintColor).toBe(colors.bone);
    // The token opacity, not a literal.
    expect(mergedStyle(image).opacity).toBe(components.grain.opacity);
    // The committed tile resolves through Metro's asset pipeline.
    expect(String(JSON.stringify(image.props.source))).toContain('grain.png');
  });

  it('pins the tile to the overlay’s bounds', async () => {
    const { toJSON } = await render(<GrainOverlay />);
    const root = rootOf(toJSON());
    const image = find(root, (element) => element.type === 'Image');
    expect(image).toBeDefined();
    if (image === undefined) {
      throw new Error('no tile image');
    }
    const overlay = mergedStyle(root);
    const tile = mergedStyle(image);
    // The tile carries the overlay's own full-screen geometry, so it cannot
    // stop covering the screen without the overlay moving with it.
    expect(tile.position).toBe('absolute');
    expect(tile.left).toBe(overlay.left);
    expect(tile.right).toBe(overlay.right);
    expect(tile.top).toBe(overlay.top);
    expect(tile.bottom).toBe(overlay.bottom);
    expect(tile.left).toBe(0);
    expect(tile.right).toBe(0);
    expect(tile.top).toBe(0);
    expect(tile.bottom).toBe(0);
  });

  it('never animates', async () => {
    const timing = jest.spyOn(Animated, 'timing');
    const loop = jest.spyOn(Animated, 'loop');
    const spring = jest.spyOn(Animated, 'spring');
    try {
      await render(<GrainOverlay />);
      expect(timing).not.toHaveBeenCalled();
      expect(loop).not.toHaveBeenCalled();
      expect(spring).not.toHaveBeenCalled();
    } finally {
      spring.mockRestore();
      loop.mockRestore();
      timing.mockRestore();
    }
  });

  it('renders no shadow, glow or blur', async () => {
    const { toJSON } = await render(<GrainOverlay />);
    const root = rootOf(toJSON());
    const keys = Object.keys(mergedStyle(root));
    expect(keys).not.toContain('shadowColor');
    expect(keys).not.toContain('shadowRadius');
    expect(keys).not.toContain('elevation');
    expect(keys).not.toContain('backdropFilter');
    expect(keys).not.toContain('blurRadius');
  });
});
