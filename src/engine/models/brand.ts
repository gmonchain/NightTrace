/**
 * The one and only brand declaration in the tree (AD-14, the engine contract
 * `02` §H.0).
 *
 * A brand makes an id — or a number carrying a unit of meaning — a nominal
 * type: the runtime value stays an opaque primitive, while the compile-time
 * value is unassignable to any other brand. Two declarations of `Brand` would
 * each close over their own module-private `unique symbol`, and the same tag
 * would then be mutually unassignable across them — so the brand lives here
 * once and every module imports it. `IdFactory` in particular imports it rather
 * than declaring its own.
 */

declare const brand: unique symbol;

/** A nominal type over a runtime primitive. */
export type Brand<T, B extends string> = T & { readonly [brand]: B };
