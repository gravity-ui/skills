export const COLS = 12;

export interface LayoutItem {
  id: string;
  x: number; // колонка 0..COLS-1
  y: number; // строка 0..
  w: number; // ширина в колонках
  h: number; // высота в строках
}

export type Layout = LayoutItem[];

export function collides(a: LayoutItem, b: LayoutItem): boolean {
  if (a.id === b.id) return false;
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function bottom(layout: Layout): number {
  return layout.reduce((m, i) => Math.max(m, i.y + i.h), 0);
}

function clampItem(item: LayoutItem, minW: number, minH: number): LayoutItem {
  const w = Math.max(minW, Math.min(COLS, item.w));
  const h = Math.max(minH, item.h);
  return {
    ...item,
    w,
    h,
    x: Math.max(0, Math.min(COLS - w, item.x)),
    y: Math.max(0, item.y),
  };
}

/**
 * Ставит item на место, сдвигая вниз всё, с чем он пересекается
 * (рекурсивно). Позиции не «примагничиваются» к верху — пользователь
 * располагает виджеты свободно.
 */
function place(layout: Layout, moved: LayoutItem): Layout {
  const byId = new Map(layout.map((i) => [i.id, { ...i }]));
  byId.set(moved.id, { ...moved });
  const queue: LayoutItem[] = [byId.get(moved.id)!];
  let guard = 0;
  while (queue.length && guard++ < 1000) {
    const current = queue.pop()!;
    for (const o of byId.values()) {
      if (!collides(current, o)) continue;
      // сдвигаем пересекающийся виджет ниже текущего
      o.y = current.y + current.h;
      queue.push(o);
    }
  }
  return [...byId.values()];
}

function withItem(layout: Layout, item: LayoutItem): Layout {
  const rest = layout.filter((i) => i.id !== item.id);
  return [...rest, item];
}

export function moveItem(layout: Layout, id: string, x: number, y: number): Layout {
  const item = layout.find((i) => i.id === id);
  if (!item) return layout;
  const next = clampItem({ ...item, x, y }, 1, 1);
  return place(withItem(layout, next), next);
}

export function resizeItem(
  layout: Layout,
  id: string,
  w: number,
  h: number,
  minW = 1,
  minH = 1,
): Layout {
  const item = layout.find((i) => i.id === id);
  if (!item) return layout;
  const next = clampItem({ ...item, w, h }, minW, minH);
  return place(withItem(layout, next), next);
}

/** Первая свободная позиция сверху-вниз, слева-направо (для новых виджетов). */
export function findFreeSpot(layout: Layout, w: number, h: number): { x: number; y: number } {
  const width = Math.min(w, COLS);
  for (let y = 0; ; y++) {
    for (let x = 0; x <= COLS - width; x++) {
      const candidate: LayoutItem = { id: '__probe__', x, y, w: width, h };
      if (layout.every((i) => !collides(candidate, i))) return { x, y };
    }
    if (y > 200) return { x: 0, y: bottom(layout) }; // страховка
  }
}
