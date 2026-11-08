/**
 * Чистые функции раскладки по сетке (без React).
 * Модель та же, что у react-grid-layout: колонки фиксированы, высота в "рядах",
 * элементы не пересекаются, свободные места схлопываются вверх (vertical compact).
 */

export interface LayoutItem {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export type Layout = LayoutItem[];

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export function collides(a: LayoutItem, b: LayoutItem): boolean {
  if (a.id === b.id) return false;
  if (a.x + a.w <= b.x || b.x + b.w <= a.x) return false;
  if (a.y + a.h <= b.y || b.y + b.h <= a.y) return false;
  return true;
}

export function getFirstCollision(layout: Layout, item: LayoutItem): LayoutItem | undefined {
  return layout.find((l) => collides(l, item));
}

export function sortByRowCol(layout: Layout): Layout {
  return [...layout].sort((a, b) => a.y - b.y || a.x - b.x);
}

/** Нижняя граница раскладки в рядах. */
export function bottom(layout: Layout): number {
  return layout.reduce((max, l) => Math.max(max, l.y + l.h), 0);
}

/** Поднимает каждый элемент максимально вверх, сохраняя порядок и отсутствие пересечений. */
export function compact(layout: Layout): Layout {
  const placed: LayoutItem[] = [];
  const byId = new Map<string, LayoutItem>();

  for (const item of sortByRowCol(layout)) {
    const next: LayoutItem = { ...item, y: Math.max(0, item.y) };
    while (next.y > 0 && !getFirstCollision(placed, { ...next, y: next.y - 1 })) {
      next.y -= 1;
    }
    let hit: LayoutItem | undefined;
    while ((hit = getFirstCollision(placed, next))) {
      next.y = hit.y + hit.h;
    }
    placed.push(next);
    byId.set(next.id, next);
  }

  return layout.map((l) => byId.get(l.id)!);
}

/** Приводит элемент к границам сетки и минимальным размерам. */
export function normalizeItem(item: LayoutItem, cols: number): LayoutItem {
  const minW = Math.max(1, item.minW ?? 1);
  const minH = Math.max(1, item.minH ?? 1);
  const w = clamp(Math.round(item.w), minW, cols);
  const h = Math.max(minH, Math.round(item.h));
  const x = clamp(Math.round(item.x), 0, cols - w);
  const y = Math.max(0, Math.round(item.y));
  return { ...item, x, y, w, h };
}

export function normalizeLayout(layout: Layout, cols: number): Layout {
  return compact(layout.map((l) => normalizeItem(l, cols)));
}

/**
 * Раздвигает элементы, которые пересекаются с `moving`.
 * Если пользователь тащит элемент вниз, то соседа пробуем поднять над ним
 * (так перестановка местами ощущается естественно), иначе сдвигаем вниз.
 */
function resolveCollisions(layout: Layout, moving: LayoutItem, allowSwapUp: boolean): Layout {
  let result = layout;
  const collisions = sortByRowCol(result).filter((l) => collides(l, moving));

  for (const c of collisions) {
    const current = result.find((l) => l.id === c.id)!;
    if (!collides(current, moving)) continue;

    let next: LayoutItem | null = null;
    if (allowSwapUp) {
      const up: LayoutItem = { ...current, y: moving.y - current.h };
      const others = result.filter((l) => l.id !== current.id);
      if (up.y >= 0 && !getFirstCollision(others, up)) next = up;
    }
    if (!next) next = { ...current, y: moving.y + moving.h };

    result = result.map((l) => (l.id === next!.id ? next! : l));
    result = resolveCollisions(result, next, false);
  }

  return result;
}

/** Переместить элемент в клетку (x, y), раздвинув соседей. */
export function moveItem(layout: Layout, id: string, x: number, y: number, cols: number): Layout {
  const item = layout.find((l) => l.id === id);
  if (!item) return layout;

  const moved = normalizeItem({ ...item, x, y }, cols);
  if (moved.x === item.x && moved.y === item.y) return layout;

  const movingDown = moved.y > item.y;
  let next = layout.map((l) => (l.id === id ? moved : l));
  next = resolveCollisions(next, moved, movingDown);
  return compact(next);
}

/** Изменить размер элемента (ширина ограничена правым краем сетки). */
export function resizeItem(layout: Layout, id: string, w: number, h: number, cols: number): Layout {
  const item = layout.find((l) => l.id === id);
  if (!item) return layout;

  const minW = Math.max(1, item.minW ?? 1);
  const minH = Math.max(1, item.minH ?? 1);
  const resized: LayoutItem = {
    ...item,
    w: clamp(Math.round(w), minW, cols - item.x),
    h: Math.max(minH, Math.round(h)),
  };
  if (resized.w === item.w && resized.h === item.h) return layout;

  let next = layout.map((l) => (l.id === id ? resized : l));
  next = resolveCollisions(next, resized, false);
  return compact(next);
}

/** Первая свободная клетка под элемент размером w×h (слева направо, сверху вниз). */
export function findFreeSpot(layout: Layout, w: number, h: number, cols: number): { x: number; y: number } {
  const width = Math.min(w, cols);
  const maxY = bottom(layout);
  for (let y = 0; y <= maxY; y++) {
    for (let x = 0; x + width <= cols; x++) {
      const probe: LayoutItem = { id: '__probe__', x, y, w: width, h };
      if (!getFirstCollision(layout, probe)) return { x, y };
    }
  }
  return { x: 0, y: maxY };
}

export function addItem(layout: Layout, item: Omit<LayoutItem, 'x' | 'y'>, cols: number): Layout {
  const spot = findFreeSpot(layout, item.w, item.h, cols);
  return compact([...layout, normalizeItem({ ...item, ...spot }, cols)]);
}

export function removeItem(layout: Layout, id: string): Layout {
  return compact(layout.filter((l) => l.id !== id));
}

/** Одноколоночная раскладка для узких экранов: элементы идут друг под другом в порядке чтения. */
export function stackLayout(layout: Layout, cols: number): Layout {
  let y = 0;
  return sortByRowCol(layout).map((l) => {
    const next = { ...l, x: 0, y, w: cols };
    y += l.h;
    return next;
  });
}
