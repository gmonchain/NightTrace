import { AccessibilityInfo, Animated } from 'react-native';
import type { JsonElement, JsonNode } from 'test-renderer';
import type { MockInstance } from 'vitest';

/**
 * Host-tree helpers for the document-primitive suites.
 *
 * `@testing-library/react-native` v14 exposes no `UNSAFE_*` finders, so a suite
 * that needs to inspect colours, styles or SVG attributes traverses the host
 * tree from `toJSON()` instead. These helpers are that traversal, shared so the
 * suites assert against the same walk rather than each re-implementing one.
 *
 * They are pure and take no dependency on a rendered instance, so a suite can
 * also call them against a sub-tree.
 */

export type HostElement = JsonElement;

/**
 * The familiar host name for a rendered element, so a suite can say "the Text"
 * and "the View" rather than reaching for a per-runner identifier. `test-renderer`
 * reports the React Native host component names (`RCTText`, `RCTView`,
 * `RCTImageView`), while the suites — like React Native Testing Library's own
 * `isHostText`/`isHostImage` — are written against the friendly form. The
 * alias table spells out the pairs that are not a simple prefix strip (an image
 * is `Image`, not `ImageView`); anything else drops a leading `RCT`, and
 * non-`RCT` hosts — react-native-svg's `RNSVG*` elements, and anything else a
 * library registers — are unchanged, because those names are already public.
 */
const HOST_NAME_ALIASES: Record<string, string> = {
  RCTText: 'Text',
  RCTVirtualText: 'Text',
  RCTView: 'View',
  RCTImageView: 'Image',
};

export function hostName(type: unknown): string {
  const name = typeof type === 'string' ? type : String(type);
  return HOST_NAME_ALIASES[name] ?? (name.startsWith('RCT') ? name.slice(3) : name);
}

/** A host element is any JSON node that is not a text node. */
export function isElement(node: JsonNode): node is JsonElement {
  return typeof node !== 'string';
}

/**
 * Every host element in `node`, depth-first, the given node included — with each
 * element's `type` normalized to its familiar host name (see `hostName`) *in
 * place*, so the walked elements stay the very objects `toJSON()` produced and a
 * suite asserting child identity (`children.indexOf`) still compares correctly. A
 * predicate then says `'Text'` rather than the runner's raw identifier.
 */
export function flatten(node: JsonNode | null): readonly HostElement[] {
  const found: HostElement[] = [];
  const visit = (current: JsonNode): void => {
    if (typeof current === 'string') {
      return;
    }
    Reflect.set(current, 'type', hostName(current.type));
    found.push(current);
    for (const child of current.children) {
      visit(child);
    }
  };
  if (node !== null) {
    visit(node);
  }
  return found;
}

/** Every host element of a given `type`, depth-first. */
export function byType(
  node: JsonNode | null,
  type: string,
): readonly HostElement[] {
  return flatten(node).filter((element) => element.type === type);
}

/** The first host element matching `predicate`, or `undefined`. */
export function find(
  node: JsonNode | null,
  predicate: (element: HostElement) => boolean,
): HostElement | undefined {
  return flatten(node).find(predicate);
}

/** The concatenated text of an element's descendants. */
export function textContent(node: HostElement): string {
  return node.children
    .map((child) => (typeof child === 'string' ? child : textContent(child)))
    .join('');
}

/** Every string reachable in an element's props, including nested arrays/objects. */
export function propStrings(value: unknown): readonly string[] {
  if (typeof value === 'string') {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.flatMap((entry) => propStrings(entry));
  }
  if (typeof value === 'object' && value !== null) {
    return Object.values(value).flatMap((entry) => propStrings(entry));
  }
  return [];
}

/**
 * The style objects an element carries, flattened and with falsy slots dropped.
 *
 * React Native accepts a style as an object, or an arbitrarily nested array of
 * objects and falsy slots. The runner surfaces the array as written, so this
 * walks it recursively rather than taking only the top level — a nested
 * `[base, [override]]` would otherwise hide the override from `mergedStyle`.
 */
export function styleProps(node: HostElement): readonly Record<string, unknown>[] {
  const collect = (value: unknown): Record<string, unknown>[] => {
    if (Array.isArray(value)) {
      return value.flatMap((entry) => collect(entry));
    }
    return typeof value === 'object' && value !== null
      ? [value as Record<string, unknown>]
      : [];
  };
  return collect(node.props.style);
}

/**
 * An element's style objects merged into one, so an expectation can read across them.
 *
 * React Native's `Text` stringifies a numeric `fontWeight` on the host — its own
 * `Text.js` coerces `400` to `'400'` before handing the style down — while the
 * design tokens spell the weight as a number. A suite asserting the token
 * (`typography.meta.fontWeight`) against the rendered text would then compare
 * `400` to `'400'`. The weight is restored to its numeric form here, so a suite
 * compares the weight the token declared rather than the wire spelling RN chose;
 * a non-numeric weight (`'normal'`, `'bold'`) is left as written.
 */
export function mergedStyle(node: HostElement): Record<string, unknown> {
  const merged = Object.assign({}, ...styleProps(node));
  const weight = merged.fontWeight;
  if (typeof weight === 'string' && weight.trim() !== '' && !Number.isNaN(Number(weight))) {
    merged.fontWeight = Number(weight);
  }
  return merged;
}

/**
 * react-native-svg renders a colour as an opaque ARGB integer carried on an
 * `{ type, payload }` paint object; this mirrors that integer so a suite can
 * compare a rendered SVG fill/stroke against a token colour without a magic
 * number.
 */
export function svgColorPayload(hex: string): number {
  return (0xff000000 | Number.parseInt(hex.slice(1), 16)) >>> 0;
}

/**
 * A named case for a table-driven suite. A helper *call* keeps the element out
 * of an array literal, where `react/jsx-key` would otherwise demand a key for
 * something that is never rendered as a sibling.
 */
export function testCase(
  name: string,
  element: React.JSX.Element,
): readonly [string, React.JSX.Element] {
  return [name, element];
}

/**
 * Set `target[key] = value`, run `body`, then restore the original — even on
 * throw. Token singletons are `as const` but not frozen at runtime, and mutating
 * one is how a suite proves a value is *read from* the token rather than
 * re-spelled beside it. `Reflect` avoids a cast to a mutable view.
 */
export function withProperty(
  target: object,
  key: string,
  value: unknown,
  body: () => void,
): void {
  const original = Reflect.get(target, key);
  Reflect.set(target, key, value);
  try {
    body();
  } finally {
    Reflect.set(target, key, original);
  }
}

/**
 * The motion seam every story-1.4 suite drives. `Animated.timing`'s config, as a
 * suite asserts it against the tokens; and the completion callback its `start`
 * receives.
 */
export type TimingConfig = Parameters<typeof Animated.timing>[1];
export type TimingStartCallback = (result: { finished: boolean }) => void;

/**
 * Replace `AccessibilityInfo.isReduceMotionEnabled` with a fixed answer, and
 * return a restore callback. Hoisted here so every suite drives the same seam
 * rather than installing its own copy.
 */
export function setReduceMotion(value: boolean): () => void {
  const original = AccessibilityInfo.isReduceMotionEnabled;
  Reflect.set(AccessibilityInfo, 'isReduceMotionEnabled', () =>
    Promise.resolve(value),
  );
  return () => {
    Reflect.set(AccessibilityInfo, 'isReduceMotionEnabled', original);
  };
}

/**
 * A no-op `Animated.timing` spy: it records every config it is handed, the last
 * `start` callback and how many times an animation was stopped. The real driver
 * is mocked out so an entrance never advances and a suite can assert the config
 * it was given.
 */
export function spyOnTiming(): {
  readonly timing: MockInstance<typeof Animated.timing>;
  readonly configs: () => readonly TimingConfig[];
  readonly lastCallback: () => TimingStartCallback | null;
  readonly stopCount: () => number;
} {
  let callback: TimingStartCallback | null = null;
  let stops = 0;
  const timing = vi.spyOn(Animated, 'timing').mockImplementation(() => ({
    start: (started?: TimingStartCallback) => {
      callback = started ?? null;
    },
    stop: () => {
      stops += 1;
    },
    reset: () => {},
  }));
  return {
    timing,
    configs: () =>
      timing.mock.calls
        .map((call) => call[1])
        .filter((config): config is TimingConfig => config !== undefined),
    lastCallback: () => callback,
    stopCount: () => stops,
  };
}
