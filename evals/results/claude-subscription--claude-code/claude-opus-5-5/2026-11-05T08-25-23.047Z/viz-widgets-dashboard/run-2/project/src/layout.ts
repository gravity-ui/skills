/**
 * Pure grid-layout logic for the dashboard (no React, no DOM).
 *
 * Coordinates are in grid units: `x`/`w` are columns, `y`/`h` are rows.
 * Layouts are always kept "vertically compacted": every widget floats up as far
 * as it can, so the dashboard never has holes the user didn't ask for.
 */

export interface LayoutItem {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxH?: number;
}

export type Layout = LayoutItem[];

export function collides(a: LayoutItem, b: LayoutItem): boolean {
  return (
    a.id !== b.id && a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
  );
}

/** Keeps an item inside the grid and within its own size limits. */
export function clampItem(item: LayoutItem, cols: number): LayoutItem {
  const minW = Math.min(item.minW ?? 1, cols);
  const minH = item.minH ?? 1;
  const w = Math.max(minW, Math.min(Math.round(item.w), cols));
  const h = Math.max(minH, Math.min(Math.round(item.h), item.maxH ?? Infinity));
  const x = Math.max(0, Math.min(Math.round(item.x), cols - w));
  const y = Math.max(0, Math.round(item.y));
  return { ...item, x, y, w, h };
}

const byPosition = (a: LayoutItem, b: LayoutItem) => a.y - b.y || a.x - b.x;

/** Items in reading order: top-to-bottom, then left-to-right. */
export function sortLayout(layout: Layout): Layout {
  return [...layout].sort(byPosition);
}

/**
 * Lowest row the candidate can sit on (searching from the top) without
 * overlapping anything in `placed`, keeping its column.
 */
function settle(candidate: LayoutItem, placed: LayoutItem[]): LayoutItem {
  const item = { ...candidate, y: 0 };
  for (;;) {
    let next = item.y;
    for (const p of placed) {
      // Any row below the bottom of a colliding item still collides with it,
      // so it is safe to jump straight past the lowest collider.
      if (collides(item, p)) next = Math.max(next, p.y + p.h);
    }
    if (next === item.y) return item;
    item.y = next;
  }
}

/**
 * Vertically compacts the layout. If `pinnedId` is given, that item keeps its
 * exact position and everything else flows around it (used while dragging).
 * The returned array preserves the input order.
 */
export function compact(layout: Layout, cols: number, pinnedId?: string): Layout {
  const clamped = layout.map((item) => clampItem(item, cols));
  const pinned = pinnedId ? clamped.find((item) => item.id === pinnedId) : undefined;
  const placed: LayoutItem[] = pinned ? [pinned] : [];
  const result = new Map<string, LayoutItem>();
  if (pinned) result.set(pinned.id, pinned);

  for (const item of sortLayout(clamped)) {
    if (item === pinned) continue;
    const settled = settle(item, placed);
    placed.push(settled);
    result.set(settled.id, settled);
  }
  return clamped.map((item) => result.get(item.id)!);
}

/**
 * Pins `id` where the user put it, pushes the others out of the way, then lets
 * everything (including the moved item) float up again.
 */
function resolve(layout: Layout, cols: number, id: string): Layout {
  return compact(compact(layout, cols, id), cols);
}

export function moveItem(layout: Layout, id: string, x: number, y: number, cols: number): Layout {
  return resolve(
    layout.map((item) => (item.id === id ? { ...item, x, y } : item)),
    cols,
    id,
  );
}

export function resizeItem(layout: Layout, id: string, w: number, h: number, cols: number): Layout {
  return resolve(
    layout.map((item) => (item.id === id ? { ...item, w, h } : item)),
    cols,
    id,
  );
}

const samePlace = (a: LayoutItem | undefined, b: LayoutItem | undefined) =>
  !!a && !!b && a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;

export type Direction = 'up' | 'down' | 'left' | 'right';

/**
 * Keyboard move by one step. Because the layout is compacted, nudging an item
 * down by a single row usually just floats it back, so we keep stepping until
 * the item actually ends up somewhere new (i.e. it swaps with its neighbour).
 */
export function nudgeItem(layout: Layout, id: string, dir: Direction, cols: number): Layout {
  const item = layout.find((i) => i.id === id);
  if (!item) return layout;
  const dx = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
  const dy = dir === 'up' ? -1 : dir === 'down' ? 1 : 0;
  if (dx !== 0) {
    const x = Math.max(0, Math.min(item.x + dx, cols - item.w));
    return x === item.x ? layout : moveItem(layout, id, x, item.y, cols);
  }
  const bottom = layoutRows(layout);
  for (let step = 1; step <= bottom + 1; step++) {
    const y = item.y + dy * step;
    if (y < 0) break;
    const next = moveItem(layout, id, item.x, y, cols);
    if (!samePlace(next.find((i) => i.id === id), item)) return next;
  }
  return layout;
}

/** Keyboard resize by one cell; dw/dh are -1, 0 or 1. */
export function growItem(layout: Layout, id: string, dw: number, dh: number, cols: number): Layout {
  const item = layout.find((i) => i.id === id);
  if (!item) return layout;
  return resizeItem(layout, id, item.w + dw, item.h + dh, cols);
}

/** Total number of rows the layout occupies. */
export function layoutRows(layout: Layout): number {
  return layout.reduce((max, item) => Math.max(max, item.y + item.h), 0);
}

/**
 * First free spot (reading order) where an item of the given size fits
 * without moving anything else.
 */
export function findFreeSpot(layout: Layout, w: number, h: number, cols: number) {
  const width = Math.min(w, cols);
  const rows = layoutRows(layout);
  for (let y = 0; y <= rows; y++) {
    for (let x = 0; x + width <= cols; x++) {
      const probe = { id: '\u0000probe', x, y, w: width, h };
      if (!layout.some((item) => collides(probe, item))) return { x, y };
    }
  }
  return { x: 0, y: rows };
}

/** Single-column version of a layout (narrow screens), in reading order. */
export function stackLayout(layout: Layout): Layout {
  let y = 0;
  const positions = new Map<string, LayoutItem>();
  for (const item of sortLayout(layout)) {
    positions.set(item.id, { ...item, x: 0, w: 1, minW: 1, y });
    y += item.h;
  }
  return layout.map((item) => positions.get(item.id)!);
}

/** Validates untrusted (e.g. persisted) layout data against the known widgets. */
export function sanitizeLayout(
  raw: unknown,
  defaults: Layout,
  cols: number,
): Layout | null {
  if (!Array.isArray(raw)) return null;
  const known = new Map(defaults.map((item) => [item.id, item]));
  const seen = new Set<string>();
  const result: Layout = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') return null;
    const { id, x, y, w, h } = entry as Record<string, unknown>;
    const base = typeof id === 'string' ? known.get(id) : undefined;
    if (!base || seen.has(base.id)) return null;
    if (![x, y, w, h].every((n) => typeof n === 'number' && Number.isFinite(n))) return null;
    seen.add(base.id);
    result.push({ ...base, x: x as number, y: y as number, w: w as number, h: h as number });
  }
  return compact(result, cols);
}
