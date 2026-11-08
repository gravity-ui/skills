// Pure grid math for the dashboard. No React, no DOM: everything here is testable in isolation.

export const COLS = 12;
/** Height of one grid row unit, in px. */
export const ROW_HEIGHT = 72;
/** Gap between grid cells, in px (both directions). */
export const GAP = 16;

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LayoutItem extends Rect {
  id: string;
}

export interface GridMetrics {
  colW: number;
  /** Distance from the left edge of one column to the next. */
  colStep: number;
  /** Distance from the top of one row to the next. */
  rowStep: number;
}

export interface PxBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

export function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

/**
 * Settles a set of items onto the grid.
 *
 * If `pinnedId` is given, that item keeps its position and is placed first.
 * Every other item, in reading order (y, then x), is pushed down until it no
 * longer overlaps anything already placed, then floats up into any gap above it.
 * The result keeps the input order.
 */
export function settle(items: LayoutItem[], pinnedId?: string): LayoutItem[] {
  const fit = (item: LayoutItem): LayoutItem => {
    const w = clamp(item.w, 1, COLS);
    return { ...item, w, x: clamp(item.x, 0, COLS - w), y: Math.max(0, item.y) };
  };

  const placed: LayoutItem[] = [];
  const pinned = pinnedId === undefined ? undefined : items.find((i) => i.id === pinnedId);
  if (pinned) placed.push(fit(pinned));

  const rest = items
    .filter((i) => i.id !== pinnedId)
    .sort((a, b) => a.y - b.y || a.x - b.x);

  for (const item of rest) {
    let next = fit(item);
    while (placed.some((p) => overlaps(next, p))) {
      next = { ...next, y: next.y + 1 };
    }
    while (next.y > 0 && !placed.some((p) => overlaps({ ...next, y: next.y - 1 }, p))) {
      next = { ...next, y: next.y - 1 };
    }
    placed.push(next);
  }

  return items.map((i) => placed.find((p) => p.id === i.id)!);
}

/** Puts `target` at its position (its id must exist in `items`) and settles the rest around it. */
export function placeItem(items: LayoutItem[], target: LayoutItem): LayoutItem[] {
  return settle(
    items.map((i) => (i.id === target.id ? target : i)),
    target.id,
  );
}

export function gridHeight(items: LayoutItem[]): number {
  if (items.length === 0) return 0;
  const bottom = Math.max(...items.map((i) => i.y + i.h));
  return bottom * (ROW_HEIGHT + GAP) - GAP;
}

export function gridMetrics(width: number): GridMetrics {
  const colW = (width - GAP * (COLS - 1)) / COLS;
  return { colW, colStep: colW + GAP, rowStep: ROW_HEIGHT + GAP };
}

/** Converts a grid rectangle to the pixel box it occupies. */
export function rectToPx(rect: Rect, m: GridMetrics): PxBox {
  return {
    left: rect.x * m.colStep,
    top: rect.y * m.rowStep,
    width: rect.w * m.colW + (rect.w - 1) * GAP,
    height: rect.h * ROW_HEIGHT + (rect.h - 1) * GAP,
  };
}
