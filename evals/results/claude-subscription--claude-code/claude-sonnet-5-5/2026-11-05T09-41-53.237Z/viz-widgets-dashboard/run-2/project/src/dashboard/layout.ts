// Pure grid-layout logic (no React): collisions, pushing, compaction, clamping.
// Coordinates are in grid cells: x/w along columns, y/h along rows.

export interface Item {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW: number;
  minH: number;
}

export type Layout = Item[];

export const collides = (a: Item, b: Item) =>
  a.id !== b.id && a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

const clone = (layout: Layout): Layout => layout.map((i) => ({ ...i }));
const byPosition = (a: Item, b: Item) => a.y - b.y || a.x - b.x;

export const bottom = (layout: Layout) => layout.reduce((m, i) => Math.max(m, i.y + i.h), 0);

/** Keep an item inside the grid and respect its minimum size. */
export function clampItem(item: Item, cols: number): Item {
  const w = Math.min(Math.max(item.w, Math.min(item.minW, cols)), cols);
  const h = Math.max(item.h, item.minH);
  const x = Math.min(Math.max(item.x, 0), cols - w);
  const y = Math.max(item.y, 0);
  return { ...item, x, y, w, h };
}

/**
 * Push everything that overlaps `fixed` below it, recursively.
 * `fixed` itself never moves. Only y grows, so this always terminates.
 */
function resolve(items: Layout, fixed: Item) {
  const push = (from: Item) => {
    for (const other of items.filter((o) => o.id !== fixed.id && collides(from, o)).sort(byPosition)) {
      if (!collides(from, other)) continue; // already moved away by a sibling push
      other.y = from.y + from.h;
      push(other);
    }
  };
  push(fixed);
}

/** Move every item up as far as it can go (vertical gravity). */
export function compact(layout: Layout): Layout {
  const placed: Layout = [];
  for (const item of clone(layout).sort(byPosition)) {
    while (item.y > 0 && !placed.some((p) => collides({ ...item, y: item.y - 1 }, p))) item.y -= 1;
    placed.push(item);
  }
  return layout.map((i) => placed.find((p) => p.id === i.id)!);
}

/** Place `id` at a new cell position; overlapped items are pushed down. */
export function moveItem(layout: Layout, id: string, x: number, y: number, cols: number, gravity: boolean): Layout {
  const items = clone(layout);
  const idx = items.findIndex((i) => i.id === id);
  items[idx] = clampItem({ ...items[idx], x, y }, cols);
  resolve(items, items[idx]);
  return gravity ? compact(items) : items;
}

/** Resize `id` to w×h cells; overlapped items are pushed down. */
export function resizeItem(layout: Layout, id: string, w: number, h: number, cols: number, gravity: boolean): Layout {
  const items = clone(layout);
  const idx = items.findIndex((i) => i.id === id);
  const it = items[idx];
  items[idx] = clampItem({ ...it, w: Math.min(w, cols - it.x), h }, cols);
  resolve(items, items[idx]);
  return gravity ? compact(items) : items;
}

/** Add a new item at the first free spot (top-to-bottom, left-to-right). */
export function addItem(layout: Layout, item: Item, cols: number): Layout {
  const candidate = clampItem({ ...item, x: 0, y: 0 }, cols);
  for (let y = 0; ; y++) {
    for (let x = 0; x <= cols - candidate.w; x++) {
      const probe = { ...candidate, x, y };
      if (!layout.some((o) => collides(probe, o))) return [...layout, probe];
    }
  }
}

/** Make a saved layout safe to render: unique ids, in bounds, no overlaps. */
export function normalize(layout: Layout, cols: number): Layout {
  const out: Layout = [];
  for (const item of [...layout].sort(byPosition)) {
    let it = clampItem(item, cols);
    while (out.some((o) => collides(it, o))) it = { ...it, y: it.y + 1 };
    out.push(it);
  }
  return layout.map((i) => out.find((o) => o.id === i.id)!);
}
