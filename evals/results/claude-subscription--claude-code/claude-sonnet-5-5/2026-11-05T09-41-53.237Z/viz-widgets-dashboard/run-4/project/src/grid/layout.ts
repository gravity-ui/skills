/**
 * Чистая логика раскладки по сетке: без React и DOM, поэтому легко тестируется.
 * Координаты и размеры — в ячейках сетки.
 */
export const COLS = 12;

export interface GridItem {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SizeLimits {
  minW: number;
  minH: number;
}

export type LimitsMap = Record<string, SizeLimits>;

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi));

export const overlaps = (a: GridItem, b: GridItem) =>
  a.id !== b.id && a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

export const bottomOf = (items: GridItem[]) =>
  items.reduce((max, it) => Math.max(max, it.y + it.h), 0);

interface ResolveOptions {
  /** Элемент, который пользователь держит: его позиция неприкосновенна. */
  activeId?: string;
  /** Активный элемент сместился вниз: задетый сосед уходит наверх (обмен местами). */
  movedDown?: boolean;
  /** Вертикальное уплотнение: элементы «всплывают» вверх, пока не упрутся. */
  compact: boolean;
}

/**
 * Приводит раскладку к состоянию без пересечений.
 * Элементы обрабатываются сверху вниз, слева направо; уже размещённые — препятствия.
 */
export function resolve(items: GridItem[], { activeId, movedDown, compact }: ResolveOptions): GridItem[] {
  const placed: GridItem[] = [];
  const result = new Map<string, GridItem>();

  const active = activeId ? items.find((i) => i.id === activeId) : undefined;
  if (active) {
    placed.push(active);
    result.set(active.id, active);
  }

  const rest = items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item !== active)
    .sort((a, b) => a.item.y - b.item.y || a.item.x - b.item.x || a.index - b.index);

  for (const { item } of rest) {
    const hitAt = (y: number) => placed.some((p) => overlaps({ ...item, y }, p));
    let y = item.y;

    if (hitAt(y)) {
      // Обмен местами: активный пошёл вниз — сосед встаёт прямо над ним, если там свободно.
      const above = active ? active.y - item.h : -1;
      if (movedDown && active && overlaps(item, active) && above >= 0 && !hitAt(above)) {
        y = above;
      } else {
        while (hitAt(y)) y++;
      }
    } else if (compact) {
      while (y > 0 && !hitAt(y - 1)) y--;
    }

    const next = y === item.y ? item : { ...item, y };
    placed.push(next);
    result.set(item.id, next);
  }

  return items.map((i) => result.get(i.id)!);
}

export function moveItem(items: GridItem[], id: string, x: number, y: number, compact: boolean): GridItem[] {
  const current = items.find((i) => i.id === id);
  if (!current) return items;
  const nx = clamp(Math.round(x), 0, COLS - current.w);
  const ny = Math.max(0, Math.round(y));
  const moved = items.map((i) => (i.id === id ? { ...i, x: nx, y: ny } : i));
  return resolve(moved, { activeId: id, movedDown: ny > current.y, compact });
}

export function resizeItem(
  items: GridItem[],
  id: string,
  w: number,
  h: number,
  limits: LimitsMap,
  compact: boolean,
): GridItem[] {
  const current = items.find((i) => i.id === id);
  if (!current) return items;
  const min = limits[id] ?? { minW: 1, minH: 1 };
  const nw = clamp(Math.round(w), min.minW, COLS - current.x);
  const nh = Math.max(min.minH, Math.round(h));
  const resized = items.map((i) => (i.id === id ? { ...i, w: nw, h: nh } : i));
  return resolve(resized, { activeId: id, compact });
}

/** Новый элемент встаёт в самый низ, слева. */
export function appendItem(items: GridItem[], item: Omit<GridItem, 'x' | 'y'>, compact: boolean): GridItem[] {
  const added = { ...item, x: 0, y: bottomOf(items) };
  return resolve([...items, added], { compact });
}

export function removeItem(items: GridItem[], id: string, compact: boolean): GridItem[] {
  return resolve(
    items.filter((i) => i.id !== id),
    { compact },
  );
}

const isInt = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/**
 * Проверяет раскладку, прочитанную из localStorage: неизвестные id отбрасываются,
 * геометрия зажимается в допустимые границы. Невалидное → null.
 */
export function sanitizeLayout(raw: unknown, limits: LimitsMap): GridItem[] | null {
  if (!Array.isArray(raw)) return null;
  const seen = new Set<string>();
  const items: GridItem[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') return null;
    const { id, x, y, w, h } = entry as Record<string, unknown>;
    if (typeof id !== 'string' || !(id in limits) || seen.has(id)) continue;
    if (!isInt(x) || !isInt(y) || !isInt(w) || !isInt(h)) return null;
    const min = limits[id];
    const nw = clamp(Math.round(w), min.minW, COLS);
    items.push({
      id,
      w: nw,
      h: Math.max(min.minH, Math.round(h)),
      x: clamp(Math.round(x), 0, COLS - nw),
      y: Math.max(0, Math.round(y)),
    });
    seen.add(id);
  }
  return resolve(items, { compact: false });
}
