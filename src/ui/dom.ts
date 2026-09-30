type Child = Node | string | number | false | null | undefined;
type Attrs = Record<string, string | number | boolean | undefined>;

/**
 * Creates an element. Text children are inserted as text nodes, never parsed as
 * HTML, so data can't inject markup (no XSS from imported JSON later on).
 */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  ...children: (Child | Child[])[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) {
    if (value === undefined || value === false) continue;
    el.setAttribute(name, value === true ? '' : String(value));
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    el.append(child instanceof Node ? child : String(child));
  }
  return el;
}
