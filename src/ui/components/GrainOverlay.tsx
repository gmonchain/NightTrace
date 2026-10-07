/**
 * `GrainOverlay` — the one global texture in the product.
 *
 * A full-screen, tiled fractal-noise image composited at
 * `components.grain.opacity` (`0.55` — a **token, not a decoration**; raising it
 * is a defect because the grain begins to compete with the type it sits over),
 * `pointerEvents="none"`, above all content, and hidden from assistive
 * technology. It never animates (DESIGN.md, Components).
 *
 * **The tile is pre-rendered, and the reason is a platform limit.** DESIGN.md
 * describes the grain as a `feTurbulence` fractal-noise tile (180×180,
 * `baseFrequency .85`, two octaves), but `react-native-svg@15.15.4` returns
 * `null` for `FeTurbulence`, so a filter-declared grain would render nothing at
 * all on device — and unlike the `Seal`, the grain has no other visible part.
 * `assets/grain.png` is the committed tile and `scripts/generate-grain.mjs` the
 * deterministic script that reproduces it byte-for-byte, so "it never animates"
 * is structural rather than a promise.
 *
 * The tile is greyscale-with-alpha, so it is tintable; the design source
 * tokenizes the grain's **opacity only** and carries no grain colour, so the
 * tint reads from the palette's warm grey (`colors.bone`) rather than
 * introducing a raw value AD-17 would reject. "Above all content" is the
 * composer's job: this component draws at whatever z-order its parent places it.
 */

import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, components } from '../theme/tokens';
import { DECORATIVE } from './a11y';

/**
 * The noise tile. `require` is Metro's asset form — it resolves and fingerprints
 * the PNG, and the `@typescript-eslint/no-require-imports` rule explicitly
 * allows asset extensions (there is no `import` for a binary).
 */
const GRAIN_TILE: number = require('../../../assets/grain.png');

export type GrainOverlayProps = {
  readonly style?: StyleProp<ViewStyle>;
};

/**
 * The overlay's bounds. Shared with the tile so the tile cannot stop covering
 * the screen without the overlay's own geometry changing with it.
 */
const OVERLAY_BOUNDS = StyleSheet.absoluteFill;

export function GrainOverlay({ style }: GrainOverlayProps): React.JSX.Element {
  return (
    <View {...DECORATIVE} pointerEvents="none" style={[OVERLAY_BOUNDS, style]}>
      <Image
        resizeMode="repeat"
        source={GRAIN_TILE}
        tintColor={colors.bone}
        style={[OVERLAY_BOUNDS, { opacity: components.grain.opacity }]}
      />
    </View>
  );
}
