import type { JsonElement, JsonNode } from 'test-renderer';

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

/** A host element is any JSON node that is not a text node. */
export function isElement(node: JsonNode): node is JsonElement {
  return typeof node !== 'string';
}

/** Every host element in `node`, depth-first, the given node included. */
export function flatten(node: JsonNode | null): readonly HostElement[] {
  const found: HostElement[] = [];
  const visit = (current: JsonNode): void => {
    if (typeof current === 'string') {
      return;
    }
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

/** The style objects an element carries, flattened and with falsy slots dropped. */
export function styleProps(node: HostElement): readonly Record<string, unknown>[] {
  const style = node.props.style;
  if (style === undefined || style === null) {
    return [];
  }
  const entries = Array.isArray(style) ? style : [style];
  return entries.filter(
    (entry): entry is Record<string, unknown> =>
      typeof entry === 'object' && entry !== null,
  );
}

/** An element's style objects merged into one, so an expectation can read across them. */
export function mergedStyle(node: HostElement): Record<string, unknown> {
  return Object.assign({}, ...styleProps(node));
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
