/**
 * Чистая логика сетки: без React и DOM, поэтому легко тестируется.
 * Координаты — в ячейках сетки (x — колонка, y — строка).
 */
export interface Item {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Limits {
  minW: number;
  minH: number;
  maxW?: number;
  maxH?: number;
}

export const COLS = 12;

export function collides(a: Item, b: Item): boolean {
  return (
    a.id !== b.id && a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}

const byPosition = (a: Item, b: Item) => a.y - b.y || a.x - b.x;

/** Нижняя граница раскладки в строках. */
export function bottom(layout: Item[]): number {
  return layout.reduce((m, i) => Math.max(m, i.y + i.h), 0);
}

/**
 * Вертикальное «уплотнение»: каждый виджет (в порядке y, x) занимает самое верхнее
 * свободное место. Закреплённый (pinned) виджет остаётся там, где его поставили,
 * а остальные обтекают его — те, кого он задел, вытесняются вниз.
 */
export function compact(layout: Item[], pinnedId?: string): Item[] {
  const pinned = layout.find((i) => i.id === pinnedId);
  const placed: Item[] = pinned ? [{ ...pinned }] : [];
  for (const item of layout.filter((i) => i.id !== pinnedId).sort(byPosition)) {
    const next = { ...item, y: 0 };
    while (placed.some((p) => collides(next, p))) next.y += 1;
    placed.push(next);
  }
  // Порядок результата совпадает с порядком входа.
  return layout.map((i) => placed.find((p) => p.id === i.id)!);
}

/** Привести раскладку к устойчивому виду (после неё compact — идемпотентен). */
export const settle = (layout: Item[]): Item[] => compact(compact(layout));

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

/** Переместить виджет; остальные расступятся. */
export function moveItem(layout: Item[], id: string, x: number, y: number, cols = COLS): Item[] {
  const item = layout.find((i) => i.id === id);
  if (!item) return layout;
  const moved = { ...item, x: clamp(Math.round(x), 0, cols - item.w), y: Math.max(0, Math.round(y)) };
  return settle(compact(layout.map((i) => (i.id === id ? moved : i)), id));
}

/** Изменить размер виджета с учётом ограничений и ширины сетки. */
export function resizeItem(
  layout: Item[],
  id: string,
  w: number,
  h: number,
  limits: Limits,
  cols = COLS,
): Item[] {
  const item = layout.find((i) => i.id === id);
  if (!item) return layout;
  const resized = {
    ...item,
    w: clamp(Math.round(w), limits.minW, Math.min(limits.maxW ?? cols, cols - item.x)),
    h: clamp(Math.round(h), limits.minH, limits.maxH ?? Infinity),
  };
  return settle(compact(layout.map((i) => (i.id === id ? resized : i)), id));
}

/** Добавить виджет в первое свободное место. */
export function addItem(layout: Item[], item: Omit<Item, 'x' | 'y'>, cols = COLS): Item[] {
  for (let y = 0; ; y++) {
    for (let x = 0; x + item.w <= cols; x++) {
      const candidate = { ...item, x, y };
      if (!layout.some((p) => collides(candidate, p))) return settle([...layout, candidate]);
    }
  }
}

export const removeItem = (layout: Item[], id: string): Item[] =>
  settle(layout.filter((i) => i.id !== id));

/** Проверка сохранённой раскладки: только известные id, целые числа, влезает в сетку, без пересечений. */
export function isValidLayout(value: unknown, knownIds: string[], cols = COLS): value is Item[] {
  if (!Array.isArray(value)) return false;
  const seen = new Set<string>();
  for (const i of value) {
    if (!i || typeof i !== 'object') return false;
    const { id, x, y, w, h } = i as Item;
    if (!knownIds.includes(id) || seen.has(id)) return false;
    seen.add(id);
    if (![x, y, w, h].every(Number.isInteger)) return false;
    if (x < 0 || y < 0 || w < 1 || h < 1 || x + w > cols) return false;
  }
  return !value.some((a: Item) => value.some((b: Item) => collides(a, b)));
}
