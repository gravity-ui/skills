// Pure grid math for the dashboard: placement, push-down collision handling,
// vertical compaction and validation of persisted layouts. No DOM, no React.

export const COLS = 12;
export const ROW_H = 80; // px per grid row
export const GAP = 16; // px between cells (both axes)

export interface Item {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface MinSize {
  minW: number;
  minH: number;
}

export type SizeOf = (id: string) => MinSize;

export function overlaps(a: Item, b: Item): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

/** Keeps an item inside the column bounds and above its minimum size. */
export function clampItem(it: Item, size: MinSize): Item {
  const w = clamp(Math.round(it.w), size.minW, COLS);
  const h = Math.max(size.minH, Math.round(it.h));
  const x = clamp(Math.round(it.x), 0, COLS - w);
  const y = Math.max(0, Math.round(it.y));
  return { i: it.i, x, y, w, h };
}

/** Pulls every item up as far as it can go without overlapping another. */
export function compact(items: Item[]): Item[] {
  const sorted = [...items].sort((a, b) => a.y - b.y || a.x - b.x);
  const placed: Item[] = [];
  for (const it of sorted) {
    const cur = { ...it };
    while (cur.y > 0 && !placed.some((p) => overlaps(p, { ...cur, y: cur.y - 1 }))) {
      cur.y -= 1;
    }
    placed.push(cur);
  }
  return placed;
}

/**
 * Moves or resizes one item and resolves the result: the edited item takes the
 * requested rectangle, colliding items are pushed down, then everything is
 * compacted upward. Returns a new array; the input is not mutated.
 */
export function updateItem(
  items: Item[],
  id: string,
  patch: Partial<Pick<Item, 'x' | 'y' | 'w' | 'h'>>,
  sizeOf: SizeOf,
): Item[] {
  const target = items.find((it) => it.i === id);
  if (!target) return items;

  const moved = clampItem({ ...target, ...patch }, sizeOf(id));
  const others = items
    .filter((it) => it.i !== id)
    .map((it) => ({ ...it }))
    .sort((a, b) => a.y - b.y || a.x - b.x);

  const placed: Item[] = [moved];
  for (const it of others) {
    let hits = placed.filter((p) => overlaps(p, it));
    while (hits.length > 0) {
      // Each pass strictly increases it.y, so this terminates.
      it.y = Math.max(...hits.map((p) => p.y + p.h));
      hits = placed.filter((p) => overlaps(p, it));
    }
    placed.push(it);
  }

  return compact(placed);
}

export function gridRows(items: Item[]): number {
  return items.reduce((max, it) => Math.max(max, it.y + it.h), 0);
}

/** Total pixel height of the grid for the given items. */
export function gridHeightPx(items: Item[]): number {
  const rows = gridRows(items);
  return rows === 0 ? 0 : rows * ROW_H + (rows - 1) * GAP;
}

/** Column width in px for a container of the given width. */
export function colWidthPx(containerWidth: number): number {
  return Math.max(0, (containerWidth - GAP * (COLS - 1)) / COLS);
}

export function itemRectPx(it: Item, colW: number) {
  return {
    left: it.x * (colW + GAP),
    top: it.y * (ROW_H + GAP),
    width: it.w * colW + (it.w - 1) * GAP,
    height: it.h * ROW_H + (it.h - 1) * GAP,
  };
}

/**
 * Checks a value read from storage: same id set as the registry, integer
 * coordinates inside bounds, no overlaps. Anything else is rejected so the
 * caller falls back to the default layout.
 */
export function isValidLayout(value: unknown, ids: string[], sizeOf: SizeOf): value is Item[] {
  if (!Array.isArray(value) || value.length !== ids.length) return false;
  const seen = new Set<string>();
  const items: Item[] = [];
  for (const raw of value) {
    if (typeof raw !== 'object' || raw === null) return false;
    const r = raw as Record<string, unknown>;
    const ok =
      typeof r.i === 'string' &&
      ids.includes(r.i) &&
      Number.isInteger(r.x) &&
      Number.isInteger(r.y) &&
      Number.isInteger(r.w) &&
      Number.isInteger(r.h);
    if (!ok || seen.has(r.i as string)) return false;
    seen.add(r.i as string);
    const it: Item = { i: r.i as string, x: r.x as number, y: r.y as number, w: r.w as number, h: r.h as number };
    const clamped = clampItem(it, sizeOf(it.i));
    if (clamped.x !== it.x || clamped.w !== it.w || clamped.h !== it.h || clamped.y !== it.y) return false;
    items.push(it);
  }
  for (let a = 0; a < items.length; a++) {
    for (let b = a + 1; b < items.length; b++) {
      if (overlaps(items[a], items[b])) return false;
    }
  }
  return true;
}
