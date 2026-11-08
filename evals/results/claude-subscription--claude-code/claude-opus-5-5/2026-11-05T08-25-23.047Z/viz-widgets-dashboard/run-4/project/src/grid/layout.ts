/**
 * Чистые функции раскладки виджетов по сетке.
 * Координаты и размеры — в ячейках сетки (x/w — колонки, y/h — строки).
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

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

export function collides(a: LayoutItem, b: LayoutItem): boolean {
  if (a.i === b.i) return false;
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function bottom(layout: Layout): number {
  return layout.reduce((max, it) => Math.max(max, it.y + it.h), 0);
}

function sortByPosition(layout: Layout): Layout {
  return [...layout].sort((a, b) => a.y - b.y || a.x - b.x);
}

/** Приводит размеры и позицию элемента к допустимым для сетки из `cols` колонок. */
export function clampItem(item: LayoutItem, cols: number): LayoutItem {
  const minW = Math.min(item.minW ?? 1, cols);
  const maxW = Math.min(item.maxW ?? cols, cols);
  const w = clamp(Math.round(item.w), minW, maxW);
  const h = clamp(Math.round(item.h), item.minH ?? 1, item.maxH ?? Infinity);
  return {
    ...item,
    w,
    h,
    x: clamp(Math.round(item.x), 0, cols - w),
    y: Math.max(0, Math.round(item.y)),
  };
}

/**
 * Сдвигает вниз всё, что пересекается с `moved`, рекурсивно.
 * Если `allowSwapUp` и мешающий элемент стоит выше верхнего края `moved`
 * (пользователь тащит виджет вниз «сквозь» соседа), сосед пробует
 * подняться над `moved` — так виджеты можно менять местами.
 * Мутирует элементы массива `items`.
 */
function pushCollisions(items: Layout, moved: LayoutItem, allowSwapUp: boolean): void {
  const colliders = sortByPosition(items.filter((o) => collides(o, moved)));
  for (const c of colliders) {
    // Пересечение могло исчезнуть после обработки предыдущих соседей.
    if (!collides(c, moved)) continue;
    if (allowSwapUp && c.y < moved.y) {
      const upY = moved.y - c.h;
      if (upY >= 0) {
        const candidate = { ...c, y: upY };
        if (!items.some((o) => o.i !== c.i && collides(candidate, o))) {
          c.y = upY;
          continue;
        }
      }
    }
    c.y = moved.y + moved.h;
    pushCollisions(items, c, false);
  }
}

/** Поднимает каждый элемент вверх, пока не упрётся в другой («гравитация»). */
export function compact(layout: Layout): Layout {
  const placed: Layout = [];
  const byId = new Map<string, LayoutItem>();
  for (const item of sortByPosition(layout)) {
    const c = { ...item };
    while (c.y > 0 && !placed.some((p) => collides({ ...c, y: c.y - 1 }, p))) c.y--;
    while (placed.some((p) => collides(c, p))) c.y++;
    placed.push(c);
    byId.set(c.i, c);
  }
  return layout.map((it) => byId.get(it.i)!);
}

/** Раздвигает пересекающиеся элементы (например, после загрузки из хранилища). */
export function fixOverlaps(layout: Layout, cols: number): Layout {
  const placed: Layout = [];
  const byId = new Map<string, LayoutItem>();
  for (const item of sortByPosition(layout.map((it) => clampItem(it, cols)))) {
    const c = { ...item };
    while (placed.some((p) => collides(c, p))) c.y++;
    placed.push(c);
    byId.set(c.i, c);
  }
  return layout.map((it) => byId.get(it.i)!);
}

export interface PlaceOptions {
  cols: number;
  /** Поднимать виджеты вверх после каждого изменения. */
  compact: boolean;
}

export function moveItem(layout: Layout, id: string, x: number, y: number, opts: PlaceOptions): Layout {
  const items = layout.map((it) => ({ ...it }));
  const target = items.find((it) => it.i === id);
  if (!target) return layout;
  Object.assign(target, clampItem({ ...target, x, y }, opts.cols));
  pushCollisions(items, target, true);
  return opts.compact ? compact(items) : items;
}

export function resizeItem(layout: Layout, id: string, w: number, h: number, opts: PlaceOptions): Layout {
  const items = layout.map((it) => ({ ...it }));
  const target = items.find((it) => it.i === id);
  if (!target) return layout;
  Object.assign(target, clampItem({ ...target, w, h }, opts.cols));
  pushCollisions(items, target, false);
  return opts.compact ? compact(items) : items;
}

/**
 * Перемещение на одну ячейку с клавиатуры. В режиме упаковки сдвиг на одну
 * строку может «откатиться» обратно, поэтому шагаем дальше, пока позиция
 * элемента действительно не изменится.
 */
export function nudgeItem(layout: Layout, id: string, dx: number, dy: number, opts: PlaceOptions): Layout {
  const current = layout.find((it) => it.i === id);
  if (!current) return layout;
  const limit = dy === 0 ? 1 : bottom(layout) + 1;
  for (let step = 1; step <= limit; step++) {
    const next = moveItem(layout, id, current.x + dx * step, current.y + dy * step, opts);
    const moved = next.find((it) => it.i === id)!;
    if (moved.x !== current.x || moved.y !== current.y) return next;
  }
  return layout;
}

/** Первая свободная позиция (сверху вниз, слева направо) для блока w×h. */
export function findFreeSpot(layout: Layout, w: number, h: number, cols: number): { x: number; y: number } {
  const width = Math.min(w, cols);
  const maxY = bottom(layout);
  for (let y = 0; y <= maxY; y++) {
    for (let x = 0; x + width <= cols; x++) {
      const probe: LayoutItem = { i: '\u0000probe', x, y, w: width, h };
      if (!layout.some((it) => collides(probe, it))) return { x, y };
    }
  }
  return { x: 0, y: maxY };
}

export function sameLayout(a: Layout, b: Layout): boolean {
  if (a.length !== b.length) return false;
  return a.every((it, idx) => {
    const o = b[idx];
    return o.i === it.i && o.x === it.x && o.y === it.y && o.w === it.w && o.h === it.h;
  });
}
