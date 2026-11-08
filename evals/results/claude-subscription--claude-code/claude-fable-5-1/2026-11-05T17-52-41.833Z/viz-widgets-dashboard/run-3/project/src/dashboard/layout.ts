import type {Layout, LayoutItem} from './types';

/** Two items overlap (an item never collides with itself). */
export function collides(a: LayoutItem, b: LayoutItem): boolean {
  if (a.i === b.i) return false;
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

export function findCollision(layout: Layout, item: LayoutItem): LayoutItem | undefined {
  return layout.find((other) => collides(other, item));
}

/** Top-to-bottom, left-to-right order. */
export function sortLayout(layout: Layout): Layout {
  return [...layout].sort((a, b) => a.y - b.y || a.x - b.x);
}

/** Lowest free row below every item. */
export function bottom(layout: Layout): number {
  return layout.reduce((max, item) => Math.max(max, item.y + item.h), 0);
}

/** Keep the item inside the grid and inside its own min/max size. */
export function clampItem(item: LayoutItem, cols: number): LayoutItem {
  const minW = Math.min(item.minW ?? 1, cols);
  const minH = item.minH ?? 1;
  const w = Math.max(minW, Math.min(item.maxW ?? cols, item.w, cols));
  const h = Math.max(minH, Math.min(item.maxH ?? Number.POSITIVE_INFINITY, item.h));
  const x = Math.max(0, Math.min(item.x, cols - w));
  const y = Math.max(0, item.y);
  return {...item, x, y, w, h};
}

function restoreOrder(original: Layout, placed: Layout): Layout {
  const byId = new Map(placed.map((item) => [item.i, item]));
  return original.map((item) => byId.get(item.i) ?? item);
}

/**
 * Finds the final row for `item` given the already placed items:
 * optionally jumps above the pinned (dragged) item when colliding with it,
 * then floats up as far as free space allows, then pushes down until it fits.
 */
function settle(placed: Layout, item: LayoutItem, pinned?: LayoutItem, allowSwap = false): LayoutItem {
  let y = item.y;
  if (allowSwap && pinned && collides(pinned, {...item, y})) {
    const above = pinned.y - item.h;
    if (above >= 0 && !findCollision(placed, {...item, y: above})) y = above;
  }
  while (y > 0 && !findCollision(placed, {...item, y: y - 1})) y -= 1;
  while (findCollision(placed, {...item, y})) y += 1;
  return {...item, y};
}

/** Vertical compaction: every item floats up until it touches something. Order of the input array is preserved. */
export function compact(layout: Layout, cols: number): Layout {
  const placed: Layout = [];
  for (const item of sortLayout(layout)) {
    placed.push(settle(placed, clampItem(item, cols)));
  }
  return restoreOrder(layout, placed);
}

function resolve(layout: Layout, pinned: LayoutItem, cols: number, allowSwap: boolean): Layout {
  const others = sortLayout(layout.filter((item) => item.i !== pinned.i));
  const placed: Layout = [pinned];
  for (const item of others) {
    placed.push(settle(placed, clampItem(item, cols), pinned, allowSwap));
  }
  return compact(restoreOrder(layout, placed), cols);
}

/** Moves an item to a new cell; colliding items swap above it or are pushed down, then the grid is compacted. */
export function moveItem(layout: Layout, id: string, x: number, y: number, cols: number): Layout {
  const target = layout.find((item) => item.i === id);
  if (!target) return layout;
  const pinned = clampItem({...target, x, y}, cols);
  if (pinned.x === target.x && pinned.y === target.y) return layout;
  return resolve(layout, pinned, cols, true);
}

/** Resizes an item; items below are pushed down, then the grid is compacted. */
export function resizeItem(layout: Layout, id: string, w: number, h: number, cols: number): Layout {
  const target = layout.find((item) => item.i === id);
  if (!target) return layout;
  const pinned = clampItem({...target, w, h}, cols);
  if (pinned.w === target.w && pinned.h === target.h && pinned.x === target.x) return layout;
  return resolve(layout, pinned, cols, false);
}

/** Appends an item at the first free cell scanning rows top to bottom. */
export function addItem(layout: Layout, item: Omit<LayoutItem, 'x' | 'y'>, cols: number): Layout {
  const w = Math.min(item.w, cols);
  const limit = bottom(layout);
  for (let y = 0; y <= limit; y += 1) {
    for (let x = 0; x + w <= cols; x += 1) {
      const candidate: LayoutItem = {...item, x, y, w};
      if (!findCollision(layout, candidate)) return compact([...layout, candidate], cols);
    }
  }
  return compact([...layout, {...item, x: 0, y: limit, w}], cols);
}

export function removeItem(layout: Layout, id: string, cols: number): Layout {
  return compact(
    layout.filter((item) => item.i !== id),
    cols,
  );
}

/** Rescales a layout made for `fromCols` columns into `toCols` columns. */
export function scaleLayout(layout: Layout, fromCols: number, toCols: number): Layout {
  if (fromCols === toCols) return compact(layout, toCols);
  const ratio = toCols / fromCols;
  const scaled = sortLayout(layout).map((item) => ({
    ...item,
    x: Math.round(item.x * ratio),
    w: Math.max(item.minW ?? 1, Math.round(item.w * ratio)),
  }));
  // Re-place sequentially so rounding never leaves overlaps.
  return scaled.reduce<Layout>((acc, item) => addItemNear(acc, item, toCols), []);
}

function addItemNear(layout: Layout, item: LayoutItem, cols: number): Layout {
  const clamped = clampItem(item, cols);
  if (!findCollision(layout, clamped)) return [...layout, clamped];
  return addItem(layout, clamped, cols);
}
