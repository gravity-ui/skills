// Pure layout logic for the draggable dashboard grid. No React, no DOM:
// everything here is unit-tested in grid.test.ts.

export const COLS = 12;
export const ROW_HEIGHT = 72; // px, one grid row
export const GAP = 16; // px, between cells
export const MAX_ROWS = 12;

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LayoutItem extends Rect {
  id: string;
}

export type Layout = LayoutItem[];

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function collides(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

/**
 * Applies a position/size change to one item and re-flows the rest:
 *  1. the moved item keeps exactly the cell the user chose;
 *  2. every other item that now overlaps is pushed down (top-to-bottom);
 *  3. remaining items float up into any free space above them (gravity),
 *     so the grid never keeps holes that nothing can fill.
 * Returns a new layout; the input is never mutated.
 */
export function applyChange(layout: Layout, id: string, patch: Partial<Rect>): Layout {
  const current = layout.find((item) => item.id === id);
  if (!current) return layout;

  const w = clamp(Math.round(patch.w ?? current.w), 1, COLS);
  const h = clamp(Math.round(patch.h ?? current.h), 1, MAX_ROWS);
  const x = clamp(Math.round(patch.x ?? current.x), 0, COLS - w);
  const y = Math.max(0, Math.round(patch.y ?? current.y));
  const moved: LayoutItem = { id, x, y, w, h };

  // 1 + 2: push down whatever collides, processing others in reading order.
  const others = layout
    .filter((item) => item.id !== id)
    .sort((a, b) => a.y - b.y || a.x - b.x);
  const placed: LayoutItem[] = [moved];
  for (const item of others) {
    let nextY = item.y;
    while (placed.some((p) => collides({ ...item, y: nextY }, p))) nextY += 1;
    placed.push({ ...item, y: nextY });
  }

  // 3: float up. The moved item is pinned; everything else rises while free.
  const floating = placed.slice(1).sort((a, b) => a.y - b.y || a.x - b.x);
  const all = [moved, ...floating];
  for (const item of floating) {
    while (
      item.y > 0 &&
      !all.some((o) => o.id !== item.id && collides({ ...item, y: item.y - 1 }, o))
    ) {
      item.y -= 1;
    }
  }

  const byId = new Map(all.map((item) => [item.id, item]));
  return layout.map((item) => byId.get(item.id) ?? item);
}

/** Single-column arrangement for narrow viewports: same reading order, full width. */
export function stackLayout(layout: Layout): Layout {
  let y = 0;
  return [...layout]
    .sort((a, b) => a.y - b.y || a.x - b.x)
    .map((item) => {
      const stacked = { id: item.id, x: 0, y, w: COLS, h: item.h };
      y += item.h;
      return stacked;
    });
}

export function hasOverlap(layout: Layout): boolean {
  return layout.some((a, i) => layout.slice(i + 1).some((b) => collides(a, b)));
}

function isInBounds(item: Rect): boolean {
  return item.x >= 0 && item.y >= 0 && item.w >= 1 && item.h >= 1 && item.x + item.w <= COLS;
}

function isRect(value: unknown): value is Rect & { id: string } {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    Number.isInteger(v.x) &&
    Number.isInteger(v.y) &&
    Number.isInteger(v.w) &&
    Number.isInteger(v.h)
  );
}

/**
 * Restores a saved layout. Anything unexpected (bad JSON, missing widget,
 * out-of-bounds or overlapping cells) falls back to the defaults, so a stale
 * or hand-edited value can never break the page.
 */
export function parseStoredLayout(raw: string | null, defaults: Layout): Layout {
  if (raw === null) return defaults;

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return defaults;
  }
  if (!Array.isArray(data)) return defaults;

  const saved = new Map<string, Rect>();
  for (const item of data) {
    if (isRect(item)) saved.set(item.id, item);
  }

  const restored: Layout = [];
  for (const def of defaults) {
    const item = saved.get(def.id);
    if (!item) return defaults;
    restored.push({ id: def.id, x: item.x, y: item.y, w: item.w, h: item.h });
  }

  if (!restored.every(isInBounds) || hasOverlap(restored)) return defaults;
  return restored;
}

export function loadLayout(storageKey: string, defaults: Layout): Layout {
  try {
    return parseStoredLayout(window.localStorage.getItem(storageKey), defaults);
  } catch {
    return defaults; // storage disabled or unavailable
  }
}

export function saveLayout(storageKey: string, layout: Layout): void {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(layout));
  } catch {
    // Persisting the layout is best-effort; the in-memory layout still works.
  }
}
