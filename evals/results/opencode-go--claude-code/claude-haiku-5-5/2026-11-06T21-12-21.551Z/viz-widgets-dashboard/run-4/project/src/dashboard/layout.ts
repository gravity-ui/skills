// Pure grid-layout logic: no React, no DOM. Everything here works in whole cells.

export const COLS = 12;
/** Height of one grid row in px. */
export const ROW_H = 44;
/** Gap between cells in px, both horizontal and vertical. */
export const GAP = 16;

export interface LayoutItem {
  id: string;
  /** Column, 0-based. */
  x: number;
  /** Row, 0-based. */
  y: number;
  /** Width in columns. */
  w: number;
  /** Height in rows. */
  h: number;
}

export interface SizeLimits {
  minW: number;
  minH: number;
}

export type LimitsById = Record<string, SizeLimits>;

export type CellPatch = Partial<Pick<LayoutItem, 'x' | 'y' | 'w' | 'h'>>;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function overlaps(a: LayoutItem, b: LayoutItem): boolean {
  return a.id !== b.id && a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

/** Snap an item to whole cells, keep it inside the grid and at or above its minimum size. */
export function fitItem(item: LayoutItem, limits: LimitsById): LayoutItem {
  const lim = limits[item.id] ?? { minW: 1, minH: 1 };
  const w = clamp(Math.round(item.w), Math.min(lim.minW, COLS), COLS);
  const h = Math.max(lim.minH, Math.round(item.h));
  return {
    id: item.id,
    x: clamp(Math.round(item.x), 0, COLS - w),
    y: Math.max(0, Math.round(item.y)),
    w,
    h,
  };
}

/** Return `items` ordered the way `source` is ordered. */
function inOrderOf(source: LayoutItem[], items: LayoutItem[]): LayoutItem[] {
  const byId = new Map(items.map((i) => [i.id, i]));
  return source.map((s) => byId.get(s.id)!);
}

/**
 * Keep `pinnedId` where it is and push every item it overlaps down below it.
 * Other items are handled in their current top-to-bottom order, so a push can
 * cascade, but nothing is ever left overlapping.
 */
function pushDown(items: LayoutItem[], pinnedId: string): LayoutItem[] {
  const placed: LayoutItem[] = [];
  const pinned = items.find((i) => i.id === pinnedId);
  if (pinned) placed.push({ ...pinned });

  const rest = items.filter((i) => i.id !== pinnedId).sort((a, b) => a.y - b.y || a.x - b.x);
  for (const item of rest) {
    const next = { ...item };
    for (let hit = placed.find((p) => overlaps(p, next)); hit; hit = placed.find((p) => overlaps(p, next))) {
      // Strictly increases next.y, so the loop terminates.
      next.y = hit.y + hit.h;
    }
    placed.push(next);
  }
  return inOrderOf(items, placed);
}

/** Let every item rise as far as it can without overlapping, so no vertical holes remain. */
export function compact(items: LayoutItem[]): LayoutItem[] {
  const placed: LayoutItem[] = [];
  for (const item of [...items].sort((a, b) => a.y - b.y || a.x - b.x)) {
    const next = { ...item };
    while (next.y > 0 && !placed.some((p) => overlaps(p, { ...next, y: next.y - 1 }))) {
      next.y -= 1;
    }
    placed.push(next);
  }
  return inOrderOf(items, placed);
}

/**
 * Apply one user change (move or resize) to one item. The changed item keeps the
 * cells the user chose; anything it now overlaps is pushed down; the result is compacted.
 */
export function changeItem(layout: LayoutItem[], limits: LimitsById, id: string, patch: CellPatch): LayoutItem[] {
  const current = layout.find((i) => i.id === id);
  if (!current) return layout;
  const fitted = fitItem({ ...current, ...patch }, limits);
  const withChange = layout.map((i) => (i.id === id ? fitted : i));
  return compact(pushDown(withChange, id));
}

/** Fit every item, resolve overlaps (the first item wins), and compact. */
export function settle(items: LayoutItem[], limits: LimitsById): LayoutItem[] {
  if (items.length === 0) return items;
  const fitted = items.map((i) => fitItem(i, limits));
  return compact(pushDown(fitted, fitted[0].id));
}

function isItem(v: unknown): v is LayoutItem {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    (['x', 'y', 'w', 'h'] as const).every((k) => typeof o[k] === 'number' && Number.isFinite(o[k]))
  );
}

/**
 * Turn untrusted saved data into a valid layout. Widgets missing from the saved data
 * fall back to their defaults, unknown ids are dropped, and anything broken is replaced.
 */
export function parseLayout(raw: unknown, defaults: LayoutItem[], limits: LimitsById): LayoutItem[] {
  if (!Array.isArray(raw)) return settle(defaults, limits);
  const saved = new Map<string, LayoutItem>();
  for (const entry of raw) {
    if (isItem(entry) && Object.hasOwn(limits, entry.id)) saved.set(entry.id, entry);
  }
  return settle(
    defaults.map((d) => saved.get(d.id) ?? d),
    limits,
  );
}
