/**
 * Pure grid-layout engine: positions are in grid cells, not pixels.
 * Items fall upward ("gravity") and push each other down on collision,
 * so the layout never has overlaps or holes that can be closed.
 */

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export type Layout = LayoutItem[];

export function collides(a: LayoutItem, b: LayoutItem): boolean {
  if (a.i === b.i) return false;
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function bottom(layout: Layout): number {
  return layout.reduce((max, it) => Math.max(max, it.y + it.h), 0);
}

function sortByPosition(layout: Layout): Layout {
  return [...layout].sort((a, b) => a.y - b.y || a.x - b.x || a.i.localeCompare(b.i));
}

/** Clamp size to the item's own limits and to the grid width, then keep x inside the grid. */
export function clampItem(item: LayoutItem, cols: number): LayoutItem {
  const minW = Math.min(item.minW ?? 1, cols);
  const maxW = Math.min(item.maxW ?? cols, cols);
  const minH = item.minH ?? 1;
  const maxH = item.maxH ?? Infinity;
  const w = Math.max(minW, Math.min(maxW, Math.round(item.w)));
  const h = Math.max(minH, Math.min(maxH, Math.round(item.h)));
  const x = Math.max(0, Math.min(cols - w, Math.round(item.x)));
  const y = Math.max(0, Math.round(item.y));
  return { ...item, x, y, w, h };
}

/**
 * Resolve collisions and float everything up.
 * If `pinnedId` is given, that item keeps its exact position and the others
 * flow around it (used while the user drags / resizes it).
 */
export function compact(layout: Layout, cols: number, pinnedId?: string): Layout {
  const pinned = pinnedId ? layout.find((it) => it.i === pinnedId) : undefined;
  if (!pinned) return restoreOrder(layout, flow(layout, cols, []));

  // Close the hole the pinned item leaves first, so its target position is read
  // relative to where the other items will actually be (makes "move below" work).
  const others = flow(
    layout.filter((it) => it !== pinned),
    cols,
    [],
  );
  const withPin = flow(others, cols, [clampItem(pinned, cols)]);
  // Final pass without the pin lets the pinned item float up into free space too,
  // so the drag preview matches exactly what the drop will produce.
  return restoreOrder(layout, flow(withPin, cols, []));
}

/** Place items in reading order: push each below overlaps, then float it up. */
function flow(layout: Layout, cols: number, fixed: LayoutItem[]): Layout {
  const placed: LayoutItem[] = [...fixed];
  const fixedIds = new Set(fixed.map((f) => f.i));
  for (const raw of sortByPosition(layout)) {
    if (fixedIds.has(raw.i)) continue;
    const item = clampItem(raw, cols);
    // Push down below whatever it overlaps.
    let hit = placed.find((p) => collides(item, p));
    while (hit) {
      item.y = hit.y + hit.h;
      hit = placed.find((p) => collides(item, p));
    }
    // Float up as far as free space allows.
    while (item.y > 0 && !placed.some((p) => collides({ ...item, y: item.y - 1 }, p))) {
      item.y -= 1;
    }
    placed.push(item);
  }
  return placed;
}

function restoreOrder(original: Layout, placed: Layout): Layout {
  const byId = new Map(placed.map((it) => [it.i, it]));
  return original.map((it) => byId.get(it.i)!);
}

export function moveItem(layout: Layout, id: string, x: number, y: number, cols: number): Layout {
  const next = layout.map((it) => (it.i === id ? clampItem({ ...it, x, y }, cols) : it));
  return compact(next, cols, id);
}

export function resizeItem(layout: Layout, id: string, w: number, h: number, cols: number): Layout {
  const next = layout.map((it) => {
    if (it.i !== id) return it;
    // Resizing never moves the top-left corner; width is limited by the right edge.
    const clamped = clampItem({ ...it, w, h, maxW: Math.min(it.maxW ?? cols, cols - it.x) }, cols);
    return { ...clamped, maxW: it.maxW };
  });
  return compact(next, cols, id);
}

/** Place a new item in the first free spot (scanning rows top to bottom). */
export function addItem(layout: Layout, item: LayoutItem, cols: number): Layout {
  const candidate = clampItem(item, cols);
  const limit = bottom(layout) + 1;
  for (let y = 0; y <= limit; y++) {
    for (let x = 0; x <= cols - candidate.w; x++) {
      const probe = { ...candidate, x, y };
      if (!layout.some((p) => collides(probe, p))) return compact([...layout, probe], cols);
    }
  }
  return compact([...layout, { ...candidate, x: 0, y: limit }], cols);
}

export function removeItem(layout: Layout, id: string, cols: number): Layout {
  return compact(
    layout.filter((it) => it.i !== id),
    cols,
  );
}

/** Validate untrusted input (e.g. localStorage); drop unknown / malformed entries. */
export function sanitizeLayout(input: unknown, known: Map<string, LayoutItem>, cols: number): Layout | null {
  if (!Array.isArray(input)) return null;
  const seen = new Set<string>();
  const out: Layout = [];
  for (const raw of input) {
    if (!raw || typeof raw !== 'object') continue;
    const r = raw as Record<string, unknown>;
    const def = typeof r.i === 'string' ? known.get(r.i) : undefined;
    if (!def || seen.has(def.i)) continue;
    const nums = ['x', 'y', 'w', 'h'].map((k) => r[k]);
    if (!nums.every((n) => typeof n === 'number' && Number.isFinite(n))) continue;
    const [x, y, w, h] = nums as number[];
    seen.add(def.i);
    out.push(clampItem({ ...def, x, y, w, h }, cols));
  }
  return compact(out, cols);
}
