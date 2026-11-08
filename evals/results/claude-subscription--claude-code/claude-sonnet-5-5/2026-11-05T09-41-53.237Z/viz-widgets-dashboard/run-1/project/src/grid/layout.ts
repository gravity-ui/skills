// Pure grid-layout logic: no React, no DOM. Coordinates are in grid cells.

export interface GridItem {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export type Layout = GridItem[];

export function collides(a: GridItem, b: GridItem): boolean {
  return (
    a.id !== b.id && a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}

const byPosition = (a: GridItem, b: GridItem) => a.y - b.y || a.x - b.x;

/** Keep an item inside the grid horizontally and below the top edge. */
export function clampItem(item: GridItem, cols: number): GridItem {
  const w = Math.min(Math.max(item.w, item.minW ?? 1), cols);
  const h = Math.max(item.h, item.minH ?? 1);
  return {
    ...item,
    w,
    h,
    x: Math.min(Math.max(item.x, 0), cols - w),
    y: Math.max(item.y, 0),
  };
}

/**
 * Push everything that overlaps `mover` below it, cascading to whatever the
 * pushed items now overlap. `y` only ever grows, so this terminates.
 */
function resolveCollisions(items: GridItem[], mover: GridItem): void {
  const hits = items.filter((it) => collides(mover, it)).sort(byPosition);
  for (const hit of hits) {
    // May have been moved already by an earlier recursive push.
    if (!collides(mover, hit)) continue;
    hit.y = mover.y + mover.h;
    resolveCollisions(items, hit);
  }
}

/**
 * Gravity: slide every item up as far as it can go. `pinnedId` (the item the
 * user is holding) keeps its position and the rest compact around it.
 */
export function compact(layout: Layout, pinnedId?: string): Layout {
  const items = layout.map((it) => ({ ...it }));
  const pinned = items.find((it) => it.id === pinnedId);
  const placed: GridItem[] = pinned ? [pinned] : [];

  for (const item of items.filter((it) => it !== pinned).sort(byPosition)) {
    while (item.y > 0) {
      item.y -= 1;
      if (placed.some((p) => collides(item, p))) {
        item.y += 1;
        break;
      }
    }
    placed.push(item);
  }
  return items;
}

/** Layout after putting `id` at (x, y); neighbours make room, then compact. */
export function moveItem(layout: Layout, id: string, x: number, y: number, cols: number): Layout {
  const items = layout.map((it) => ({ ...it }));
  const mover = items.find((it) => it.id === id);
  if (!mover) return layout;
  Object.assign(mover, clampItem({ ...mover, x, y }, cols));
  resolveCollisions(items, mover);
  return compact(items, id);
}

/** Layout after resizing `id` to w × h (respecting its minimum size). */
export function resizeItem(layout: Layout, id: string, w: number, h: number, cols: number): Layout {
  const items = layout.map((it) => ({ ...it }));
  const target = items.find((it) => it.id === id);
  if (!target) return layout;
  const width = Math.min(Math.max(w, target.minW ?? 1), cols - target.x);
  Object.assign(target, { w: width, h: Math.max(h, target.minH ?? 1) });
  resolveCollisions(items, target);
  return compact(items, id);
}

/** Put a new item at the bottom of the layout. */
export function appendItem(layout: Layout, item: Omit<GridItem, 'x' | 'y'>, cols: number): Layout {
  const bottom = layout.reduce((max, it) => Math.max(max, it.y + it.h), 0);
  return [...layout, clampItem({ ...item, x: 0, y: bottom }, cols)];
}

export function layoutHeight(layout: Layout): number {
  return layout.reduce((max, it) => Math.max(max, it.y + it.h), 0);
}

/** Defensive parse of a persisted layout. Returns null if it is unusable. */
export function parseLayout(raw: unknown, known: Map<string, GridItem>, cols: number): Layout | null {
  if (!Array.isArray(raw)) return null;
  const seen = new Set<string>();
  const result: Layout = [];
  for (const entry of raw) {
    const base = known.get(entry?.id);
    if (!base || seen.has(base.id)) continue;
    const nums = [entry.x, entry.y, entry.w, entry.h];
    if (!nums.every((n) => Number.isInteger(n))) continue;
    seen.add(base.id);
    result.push(clampItem({ ...base, x: entry.x, y: entry.y, w: entry.w, h: entry.h }, cols));
  }
  // An empty dashboard is valid; a non-empty array of garbage is not.
  if (result.length === 0 && raw.length > 0) return null;
  // A stored layout may overlap (hand-edited / schema drift): re-flow it.
  return result.reduce<Layout>((acc, it) => moveItem([...acc, it], it.id, it.x, it.y, cols), []);
}
