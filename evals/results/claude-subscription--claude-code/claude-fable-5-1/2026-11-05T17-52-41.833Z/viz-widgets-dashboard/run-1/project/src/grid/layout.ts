/**
 * Чистый движок раскладки по сетке: без DOM, без React.
 * Единицы — ячейки сетки. Колонок `cols`, строк — сколько потребуется.
 */

export interface LayoutItem {
  id: string;
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

const clampNum = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

/** Пересекаются ли два элемента (сам с собой — никогда). */
export function collides(a: LayoutItem, b: LayoutItem): boolean {
  if (a.id === b.id) return false;
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

const collidesAny = (items: Layout, item: LayoutItem) => items.some((o) => collides(o, item));

/** Порядок обхода: сверху вниз, слева направо. */
export function sortByPosition(layout: Layout): Layout {
  return [...layout].sort((a, b) => a.y - b.y || a.x - b.x);
}

/** Вписать элемент в границы сетки с учётом min/max размеров. */
export function clampItem(item: LayoutItem, cols: number): LayoutItem {
  const minW = Math.max(1, item.minW ?? 1);
  const minH = Math.max(1, item.minH ?? 1);
  const maxW = Math.min(item.maxW ?? cols, cols);
  const maxH = item.maxH ?? Number.POSITIVE_INFINITY;
  const w = clampNum(Math.round(item.w), Math.min(minW, cols), Math.max(maxW, 1));
  const h = clampNum(Math.round(item.h), minH, Math.max(maxH, minH));
  const x = clampNum(Math.round(item.x), 0, Math.max(0, cols - w));
  const y = Math.max(0, Math.round(item.y));
  return { ...item, x, y, w, h };
}

/**
 * Разрешить пересечения и уплотнить раскладку вверх («гравитация»).
 * `fixedId` — элемент, который нельзя двигать (тот, что сейчас тащит пользователь):
 * остальные обтекают его, уезжая вниз.
 */
export function resolve(layout: Layout, cols: number, fixedId?: string): Layout {
  const placed: LayoutItem[] = [];
  const fixed = fixedId ? layout.find((i) => i.id === fixedId) : undefined;
  if (fixed) placed.push(clampItem(fixed, cols));

  for (const raw of sortByPosition(layout)) {
    if (raw.id === fixedId) continue;
    const item = clampItem(raw, cols);
    let y = item.y;
    // Сначала поднимаем, пока над элементом свободно…
    while (y > 0 && !collidesAny(placed, { ...item, y: y - 1 })) y -= 1;
    // …затем опускаем, если текущее место занято (например, перетаскиваемым элементом).
    while (collidesAny(placed, { ...item, y })) y += 1;
    placed.push({ ...item, y });
  }

  const byId = new Map(placed.map((i) => [i.id, i]));
  return layout.map((i) => byId.get(i.id) as LayoutItem);
}

export const compact = (layout: Layout, cols: number): Layout => resolve(layout, cols);

export function moveItem(layout: Layout, id: string, x: number, y: number, cols: number): Layout {
  if (!layout.some((i) => i.id === id)) return layout;
  return resolve(
    layout.map((i) => (i.id === id ? { ...i, x, y } : i)),
    cols,
    id,
  );
}

export function resizeItem(layout: Layout, id: string, w: number, h: number, cols: number): Layout {
  const target = layout.find((i) => i.id === id);
  if (!target) return layout;
  // Ширина ограничена правым краем сетки: элемент при ресайзе не «уезжает» влево.
  const maxW = Math.max(1, cols - target.x);
  return resolve(
    layout.map((i) => (i.id === id ? { ...i, w: Math.min(w, maxW), h } : i)),
    cols,
    id,
  );
}

/** Первое свободное место для блока w×h (сканируем сверху вниз, слева направо). */
export function findFreeSpot(layout: Layout, w: number, h: number, cols: number): { x: number; y: number } {
  const width = Math.min(w, cols);
  const limit = layoutHeight(layout) + h;
  for (let y = 0; y <= limit; y += 1) {
    for (let x = 0; x <= cols - width; x += 1) {
      if (!collidesAny(layout, { id: '__probe__', x, y, w: width, h })) return { x, y };
    }
  }
  return { x: 0, y: limit };
}

export function addItem(layout: Layout, item: Omit<LayoutItem, 'x' | 'y'>, cols: number): Layout {
  const spot = findFreeSpot(layout, item.w, item.h, cols);
  return compact([...layout, { ...item, ...spot }], cols);
}

export function removeItem(layout: Layout, id: string, cols: number): Layout {
  return compact(
    layout.filter((i) => i.id !== id),
    cols,
  );
}

/** Высота раскладки в строках. */
export function layoutHeight(layout: Layout): number {
  return layout.reduce((max, i) => Math.max(max, i.y + i.h), 0);
}

/**
 * Пересчитать раскладку под другое число колонок (смена брейкпоинта):
 * ширины и позиции масштабируем пропорционально, затем убираем пересечения.
 */
export function fitToCols(layout: Layout, fromCols: number, toCols: number): Layout {
  if (fromCols === toCols) return compact(layout, toCols);
  const k = toCols / fromCols;
  let result: Layout = [];
  // Поточное размещение в порядке чтения: ширины масштабируем, позицию ищем заново.
  for (const item of sortByPosition(layout)) {
    let w = Math.max(item.minW ?? 1, Math.round(item.w * k));
    // На узкой сетке высокие виджеты и всё, что шире половины, растягиваем на всю ширину.
    if (toCols <= 4 && (w > toCols / 2 || item.h >= 3)) w = toCols;
    w = Math.min(w, toCols);
    const spot = findFreeSpot(result, w, item.h, toCols);
    result = [...result, { ...item, w, ...spot }];
  }
  const byId = new Map(result.map((i) => [i.id, i]));
  return compact(
    layout.map((i) => byId.get(i.id) as LayoutItem),
    toCols,
  );
}
