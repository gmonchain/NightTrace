import { typography } from '../tokens';
import { textStyle, type TypographyStepInput } from '../type';

/**
 * `textStyle` is the story's one non-obvious moving part: the tokens carry
 * `letterSpacing` in `em` and `lineHeight` as a ratio, and React Native wants
 * absolute points for both. Every component here passes a **mono** step, so the
 * ratio half is dead code until Stories 1.6/1.7 render serif copy — which is
 * exactly why it needs its own test rather than a transitive one.
 */

describe('textStyle', () => {
  it('multiplies the ratio and the em by the step’s own fontSize', () => {
    const style = textStyle(typography.display);
    expect(style.lineHeight).toBe(
      typography.display.fontSize * typography.display.lineHeight,
    );
    expect(style.letterSpacing).toBe(
      typography.display.fontSize * typography.display.letterSpacing,
    );
    // The conversion is a multiplication, not the ratio emitted as points.
    expect(style.lineHeight).not.toBe(typography.display.lineHeight);
  });

  it('leaves letterSpacing absent on a step that carries only a ratio', () => {
    const style = textStyle(typography.title);
    expect(style.lineHeight).toBe(
      typography.title.fontSize * typography.title.lineHeight,
    );
    expect('letterSpacing' in style).toBe(false);
  });

  it('leaves lineHeight absent on a step that carries only an em', () => {
    const style = textStyle(typography.label);
    expect(style.letterSpacing).toBe(
      typography.label.fontSize * typography.label.letterSpacing,
    );
    expect('lineHeight' in style).toBe(false);
  });

  it('leaves both keys absent on a step that carries neither', () => {
    const style = textStyle({
      fontFamily: typography.meta.fontFamily,
      fontSize: typography.meta.fontSize,
      fontWeight: typography.meta.fontWeight,
    });
    expect('lineHeight' in style).toBe(false);
    expect('letterSpacing' in style).toBe(false);
  });

  it('leaves a key absent when a spread delivers it as undefined', () => {
    // A spread can carry `lineHeight`/`letterSpacing` with an `undefined` value
    // even though the step's type says `number`. `'lineHeight' in step` would
    // accept it and compute `NaN`; the numeric guard leaves the key absent.
    const spread = {
      ...typography.title,
      lineHeight: undefined,
      letterSpacing: undefined,
    } as unknown as TypographyStepInput;
    const style = textStyle(spread);
    expect('lineHeight' in style).toBe(false);
    expect('letterSpacing' in style).toBe(false);
    expect(style.lineHeight).toBeUndefined();
    expect(style.letterSpacing).toBeUndefined();
  });

  it('carries the family and the weight through unchanged', () => {
    const style = textStyle(typography.stamp);
    expect(style.fontFamily).toBe(typography.stamp.fontFamily);
    expect(style.fontSize).toBe(typography.stamp.fontSize);
    expect(style.fontWeight).toBe(typography.stamp.fontWeight);
  });
});
