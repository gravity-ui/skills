/**
 * Чистые функции раскладки по сетке: коллизии, компактирование, перемещение
 * и изменение размера. Ни одна функция не мутирует входные данные.
 */

export interface LayoutItem {
  /** id виджета */
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
  if (a.x + a.w <= b.x) return false;
  if (a.x >= b.x + b.w) return false;
  if (a.y + a.h <= b.y) return false;
  if (a.y >= b.y + b.h) return false;
  return true;
}

export function collidesAny(items: Layout, item: LayoutItem): boolean {
  return items.some((other) => collides(other, item));
}

/** Сортировка «сверху вниз, слева направо». */
export function sortLayout(layout: Layout): Layout {
  return [...layout].sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y));
}

export function clampItem(item: LayoutItem, cols: number): LayoutItem {
  const minW = Math.max(1, item.minW ?? 1);
  const minH = Math.max(1, item.minH ?? 1);
  const maxW = Math.min(cols, item.maxW ?? cols);
  const maxH = item.maxH ?? Infinity;
  const w = Math.min(maxW, Math.max(minW, Math.round(item.w)));
  const h = Math.min(maxH, Math.max(minH, Math.round(item.h)));
  const x = Math.min(cols - w, Math.max(0, Math.round(item.x)));
  const y = Math.max(0, Math.round(item.y));
  return { ...item, x, y, w, h };
}

/**
 * Поднимает каждый элемент максимально вверх, не допуская пересечений.
 * Элемент `pinnedId` фиксируется на месте; элементы, которые он перекрыл,
 * сначала пробуют занять его прежнее место (`origin`) или встать прямо над ним,
 * иначе сдвигаются вниз. Так перетаскивание даёт привычный обмен местами.
 */
export function compact(layout: Layout, cols: number, pinnedId?: string, origin?: { x: number; y: number }): Layout {
  const pinned = layout.find((item) => item.i === pinnedId);
  const placed: Layout = pinned ? [clampItem(pinned, cols)] : [];
  const rest = sortLayout(layout.filter((item) => item.i !== pinnedId));

  for (const raw of rest) {
    const item = clampItem(raw, cols);
    let x = item.x;
    let y = item.y;
    if (pinned && collides(placed[0], item)) {
      const candidates: { x: number; y: number }[] = [];
      if (origin) candidates.push(clampItem({ ...item, x: origin.x, y: origin.y }, cols));
      candidates.push({ x: item.x, y: placed[0].y - item.h });
      const free = candidates.find((c) => c.y >= 0 && !collidesAny(placed, { ...item, x: c.x, y: c.y }));
      if (free) {
        x = free.x;
        y = free.y;
      } else {
        while (collidesAny(placed, { ...item, y })) y += 1;
        placed.push({ ...item, y });
        continue;
      }
    }
    while (y > 0 && !collidesAny(placed, { ...item, x, y: y - 1 })) y -= 1;
    while (collidesAny(placed, { ...item, x, y })) y += 1;
    placed.push({ ...item, x, y });
  }

  // Возвращаем в исходном порядке, чтобы React не пересоздавал узлы.
  const byId = new Map(placed.map((item) => [item.i, item]));
  return layout.map((item) => byId.get(item.i) ?? item);
}

/** Перемещает элемент и уплотняет раскладку: сначала с закреплённым элементом, затем общее «всплытие». */
export function moveItem(layout: Layout, id: string, x: number, y: number, cols: number): Layout {
  const current = layout.find((item) => item.i === id);
  if (!current) return layout;
  const next = layout.map((item) => (item.i === id ? clampItem({ ...item, x, y }, cols) : item));
  return compact(compact(next, cols, id, { x: current.x, y: current.y }), cols);
}

export function resizeItem(layout: Layout, id: string, w: number, h: number, cols: number): Layout {
  const next = layout.map((item) => (item.i === id ? clampItem({ ...item, w, h }, cols) : item));
  return compact(compact(next, cols, id), cols);
}

/** Высота раскладки в строках. */
export function layoutHeight(layout: Layout): number {
  return layout.reduce((max, item) => Math.max(max, item.y + item.h), 0);
}

/** Первое свободное место для нового элемента заданного размера. */
export function findFreeSlot(layout: Layout, w: number, h: number, cols: number): { x: number; y: number } {
  const width = Math.min(w, cols);
  const probe: LayoutItem = { i: '__probe__', x: 0, y: 0, w: width, h };
  const limit = layoutHeight(layout) + 1;
  for (let y = 0; y <= limit; y += 1) {
    for (let x = 0; x + width <= cols; x += 1) {
      if (!collidesAny(layout, { ...probe, x, y })) return { x, y };
    }
  }
  return { x: 0, y: limit };
}

export function isSameLayout(a: Layout, b: Layout): boolean {
  if (a.length !== b.length) return false;
  const byId = new Map(b.map((item) => [item.i, item]));
  return a.every((item) => {
    const other = byId.get(item.i);
    return other !== undefined && other.x === item.x && other.y === item.y && other.w === item.w && other.h === item.h;
  });
}
