/**
 * The accessibility contract for the document primitives (AD-28).
 *
 * The whole meaning these six primitives carry is carried by **words** — a
 * chip's label, a ledger's verdict, a seal's status, a strip's slot count — and
 * a word only the eye can read is not carried at all. AD-28 makes the
 * accessibility floor binding for `src/ui/**`, so each primitive names its word
 * to assistive technology (an `accessibilityLabel` or its visible `Text`
 * content) and the one purely decorative primitive, `Rule`, is hidden from it.
 *
 * Nothing here announces a hidden internal value: no tension, attunement,
 * rarity or seed ever reaches assistive technology (AD-26).
 */

/**
 * Applied to a purely decorative element — a hairline that separates content
 * but carries none of it. `accessibilityElementsHidden` covers iOS,
 * `importantForAccessibility` covers Android, and `accessible={false}` keeps
 * the node out of the accessibility tree on either.
 */
export const DECORATIVE = {
  accessible: false,
  accessibilityElementsHidden: true,
  importantForAccessibility: 'no-hide-descendants',
} as const;
