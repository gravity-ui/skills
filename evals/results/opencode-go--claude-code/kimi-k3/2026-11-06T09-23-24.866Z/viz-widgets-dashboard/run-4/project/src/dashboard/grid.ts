import type {Rect, WidgetInstance} from './types';
import {GRID_COLS, MIN_SIZE} from './types';

export function collides(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

export function clampRect(r: Rect, min: {w: number; h: number}): Rect {
  const w = Math.min(Math.max(r.w, min.w), GRID_COLS);
  const h = Math.max(r.h, min.h);
  return {
    w,
    h,
    x: Math.min(Math.max(r.x, 0), GRID_COLS - w),
    y: Math.max(r.y, 0),
  };
}

export function minSizeOf(w: WidgetInstance): {w: number; h: number} {
  return MIN_SIZE[w.type];
}

/**
 * Resolve the layout after `movedId` is placed at `draft`:
 * the moved widget wins its spot, everyone else keeps their
 * (x, y) preference in reading order and is pushed down on collision.
 */
export function resolveLayout(
  items: WidgetInstance[],
  movedId: string,
  draft: Rect,
): Map<string, Rect> {
  const moved = items.find((i) => i.id === movedId);
  const placed = new Map<string, Rect>();

  const seq: Array<{id: string; rect: Rect; min: {w: number; h: number}}> = [];
  if (moved) {
    seq.push({id: moved.id, rect: draft, min: minSizeOf(moved)});
  }
  const others = items
    .filter((i) => i.id !== movedId)
    .sort((a, b) => a.rect.y - b.rect.y || a.rect.x - b.rect.x);
  for (const o of others) seq.push({id: o.id, rect: o.rect, min: minSizeOf(o)});

  for (const it of seq) {
    const r = clampRect({...it.rect}, it.min);
    let guard = 0;
    while (guard++ < 1000 && [...placed.values()].some((p) => collides(r, p))) {
      r.y += 1;
    }
    placed.set(it.id, r);
  }
  return placed;
}

/** Pull every widget up as far as it goes, in reading order. */
export function compactLayout(
  items: WidgetInstance[],
  rects: Map<string, Rect>,
): Map<string, Rect> {
  const order = [...items]
    .sort((a, b) => {
      const ra = rects.get(a.id) ?? a.rect;
      const rb = rects.get(b.id) ?? b.rect;
      return ra.y - rb.y || ra.x - rb.x;
    })
    .map((i) => i.id);

  const placed = new Map<string, Rect>();
  for (const id of order) {
    const r = {...(rects.get(id) as Rect)};
    while (r.y > 0) {
      const up = {...r, y: r.y - 1};
      if ([...placed.values()].some((p) => collides(up, p))) break;
      r.y -= 1;
    }
    placed.set(id, r);
  }
  return placed;
}

export function applyRects(items: WidgetInstance[], rects: Map<string, Rect>): WidgetInstance[] {
  return items.map((i) => ({...i, rect: rects.get(i.id) ?? i.rect}));
}

export function layoutHeight(items: WidgetInstance[], rects?: Map<string, Rect>): number {
  let bottom = 0;
  for (const i of items) {
    const r = rects?.get(i.id) ?? i.rect;
    bottom = Math.max(bottom, r.y + r.h);
  }
  return bottom;
}

/** First free slot (reading order scan) for a new widget of the given size. */
export function findFreeSlot(
  items: WidgetInstance[],
  size: {w: number; h: number},
): Rect {
  const rect = clampRect({x: 0, y: 0, ...size}, size);
  const existing = items.map((i) => i.rect);
  for (let y = 0; y < 200; y++) {
    for (let x = 0; x <= GRID_COLS - rect.w; x++) {
      const candidate = {...rect, x, y};
      if (!existing.some((e) => collides(candidate, e))) return candidate;
    }
  }
  return {...rect, y: layoutHeight(items)};
}
