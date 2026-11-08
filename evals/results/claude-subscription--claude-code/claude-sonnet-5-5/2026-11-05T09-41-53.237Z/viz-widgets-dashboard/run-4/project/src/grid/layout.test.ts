import { describe, expect, it } from 'vitest';
import {
  COLS,
  appendItem,
  moveItem,
  overlaps,
  removeItem,
  resizeItem,
  resolve,
  sanitizeLayout,
  type GridItem,
  type LimitsMap,
} from './layout';

const item = (id: string, x: number, y: number, w: number, h: number): GridItem => ({ id, x, y, w, h });
const noOverlaps = (items: GridItem[]) =>
  items.every((a, i) => items.every((b, j) => i === j || !overlaps(a, b)));
const get = (items: GridItem[], id: string) => items.find((i) => i.id === id)!;

describe('resolve', () => {
  it('поднимает элементы вверх при уплотнении', () => {
    const out = resolve([item('a', 0, 5, 4, 2), item('b', 4, 9, 4, 2)], { compact: true });
    expect(get(out, 'a').y).toBe(0);
    expect(get(out, 'b').y).toBe(0);
  });

  it('не двигает элементы без уплотнения, если нет пересечений', () => {
    const src = [item('a', 0, 5, 4, 2)];
    expect(resolve(src, { compact: false })).toEqual(src);
  });

  it('раздвигает пересечения вниз', () => {
    const out = resolve([item('a', 0, 0, 6, 3), item('b', 3, 1, 6, 3)], { compact: false });
    expect(noOverlaps(out)).toBe(true);
    expect(get(out, 'b').y).toBe(3);
  });

  it('не останавливается на пустых местах между элементами (не «проваливается» сквозь них)', () => {
    const out = resolve([item('a', 0, 0, 12, 2), item('b', 0, 6, 12, 2)], { compact: true });
    expect(get(out, 'b').y).toBe(2);
  });
});

describe('moveItem', () => {
  const base = [item('a', 0, 0, 6, 3), item('b', 6, 0, 6, 3), item('c', 0, 3, 12, 2)];

  it('зажимает позицию в границы сетки', () => {
    const out = moveItem(base, 'a', 99, -5, false);
    expect(get(out, 'a').x).toBe(COLS - 6);
    expect(get(out, 'a').y).toBe(0);
  });

  it('вытесняет соседа, оставляя активный элемент на месте', () => {
    const out = moveItem(base, 'c', 0, 1, true);
    expect(get(out, 'c')).toMatchObject({ x: 0, y: 1 });
    expect(noOverlaps(out)).toBe(true);
  });

  it('при перетаскивании вниз меняется местами с соседом, а не возвращается назад', () => {
    const col = [item('a', 0, 0, 12, 2), item('b', 0, 2, 12, 2)];
    const preview = moveItem(col, 'a', 0, 2, true);
    const final = resolve(preview, { compact: true });
    expect(get(final, 'b').y).toBe(0);
    expect(get(final, 'a').y).toBe(2);
  });

  it('при перетаскивании вверх тоже обменивается', () => {
    const col = [item('a', 0, 0, 12, 2), item('b', 0, 2, 12, 2)];
    const final = resolve(moveItem(col, 'b', 0, 1, true), { compact: true });
    expect(get(final, 'b').y).toBe(0);
    expect(get(final, 'a').y).toBe(2);
  });

  it('без уплотнения оставляет элемент там, где его бросили', () => {
    const out = moveItem([item('a', 0, 0, 4, 2)], 'a', 5, 6, false);
    expect(resolve(out, { compact: false })[0]).toMatchObject({ x: 5, y: 6 });
  });

  it('с уплотнением бросок в пустоту поднимает элемент вверх', () => {
    const out = moveItem([item('a', 0, 0, 4, 2)], 'a', 5, 6, true);
    expect(resolve(out, { compact: true })[0]).toMatchObject({ x: 5, y: 0 });
  });

  it('никогда не создаёт пересечений', () => {
    let layout = base;
    for (let i = 0; i < 50; i++) {
      const id = ['a', 'b', 'c'][i % 3];
      layout = resolve(moveItem(layout, id, (i * 7) % 12, (i * 5) % 9, i % 2 === 0), { compact: i % 2 === 0 });
      expect(noOverlaps(layout)).toBe(true);
    }
  });
});

describe('resizeItem', () => {
  const limits: LimitsMap = { a: { minW: 3, minH: 2 }, b: { minW: 2, minH: 2 } };

  it('соблюдает минимальный размер и правую границу', () => {
    const out = resizeItem([item('a', 8, 0, 4, 3)], 'a', 1, 1, limits, true);
    expect(get(out, 'a')).toMatchObject({ w: 3, h: 2 });
    const wide = resizeItem([item('a', 8, 0, 4, 3)], 'a', 10, 3, limits, true);
    expect(get(wide, 'a').w).toBe(4);
  });

  it('сдвигает соседей вниз при росте', () => {
    const out = resizeItem([item('a', 0, 0, 4, 2), item('b', 0, 2, 4, 2)], 'a', 4, 4, limits, true);
    expect(get(out, 'b').y).toBe(4);
  });
});

describe('append / remove', () => {
  it('добавляет в самый низ', () => {
    const out = appendItem([item('a', 0, 0, 12, 3)], { id: 'n', w: 4, h: 2 }, true);
    expect(get(out, 'n')).toMatchObject({ x: 0, y: 3 });
  });

  it('при удалении подтягивает остальные', () => {
    const out = removeItem([item('a', 0, 0, 12, 3), item('b', 0, 3, 12, 3)], 'a', true);
    expect(out).toEqual([item('b', 0, 0, 12, 3)]);
  });
});

describe('sanitizeLayout', () => {
  const limits: LimitsMap = { a: { minW: 3, minH: 2 }, b: { minW: 3, minH: 2 } };

  it('отвергает не-массив и мусор', () => {
    expect(sanitizeLayout(null, limits)).toBeNull();
    expect(sanitizeLayout({}, limits)).toBeNull();
    expect(sanitizeLayout([{ id: 'a', x: 'q', y: 0, w: 4, h: 2 }], limits)).toBeNull();
  });

  it('отбрасывает неизвестные и дублирующиеся id, зажимает геометрию', () => {
    const out = sanitizeLayout(
      [
        { id: 'a', x: 50, y: -2, w: 1, h: 0 },
        { id: 'a', x: 0, y: 0, w: 4, h: 4 },
        { id: 'zzz', x: 0, y: 0, w: 4, h: 4 },
      ],
      limits,
    )!;
    expect(out).toHaveLength(1);
    expect(out[0]).toEqual({ id: 'a', x: 9, y: 0, w: 3, h: 2 });
  });

  it('разводит пересекающиеся элементы', () => {
    const out = sanitizeLayout(
      [
        { id: 'a', x: 0, y: 0, w: 6, h: 3 },
        { id: 'b', x: 0, y: 0, w: 6, h: 3 },
      ],
      limits,
    )!;
    expect(noOverlaps(out)).toBe(true);
  });
});
