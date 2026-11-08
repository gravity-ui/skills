import { describe, expect, it } from 'vitest';

import {
  type Layout,
  collides,
  compact,
  findFreeSpot,
  fixOverlaps,
  moveItem,
  nudgeItem,
  resizeItem,
} from './layout';

const pos = (layout: Layout, id: string) => {
  const it = layout.find((l) => l.i === id)!;
  return { x: it.x, y: it.y, w: it.w, h: it.h };
};

const noOverlaps = (layout: Layout) =>
  layout.every((a) => layout.every((b) => !collides(a, b)));

const FREE = { cols: 12, compact: false };
const PACKED = { cols: 12, compact: true };

describe('moveItem', () => {
  it('сдвигает вниз виджет, на который положили другой', () => {
    const layout: Layout = [
      { i: 'a', x: 0, y: 0, w: 4, h: 2 },
      { i: 'b', x: 6, y: 0, w: 4, h: 2 },
    ];
    const next = moveItem(layout, 'a', 6, 0, FREE);
    expect(pos(next, 'a')).toMatchObject({ x: 6, y: 0 });
    expect(pos(next, 'b')).toMatchObject({ x: 6, y: 2 });
    expect(noOverlaps(next)).toBe(true);
  });

  it('в свободном режиме оставляет пустоты', () => {
    const layout: Layout = [{ i: 'a', x: 0, y: 0, w: 4, h: 2 }];
    expect(pos(moveItem(layout, 'a', 3, 5, FREE), 'a')).toMatchObject({ x: 3, y: 5 });
  });

  it('в режиме упаковки поднимает виджеты вверх', () => {
    const layout: Layout = [{ i: 'a', x: 0, y: 0, w: 4, h: 2 }];
    expect(pos(moveItem(layout, 'a', 3, 5, PACKED), 'a')).toMatchObject({ x: 3, y: 0 });
  });

  it('меняет виджеты местами, когда один протащили сквозь другой', () => {
    const layout: Layout = [
      { i: 'a', x: 0, y: 0, w: 4, h: 2 },
      { i: 'b', x: 0, y: 2, w: 4, h: 2 },
    ];
    const next = moveItem(layout, 'a', 0, 3, PACKED);
    expect(pos(next, 'b').y).toBe(0);
    expect(pos(next, 'a').y).toBe(2);
  });

  it('не выпускает виджет за правый край', () => {
    const layout: Layout = [{ i: 'a', x: 0, y: 0, w: 4, h: 2 }];
    expect(pos(moveItem(layout, 'a', 11, 0, FREE), 'a').x).toBe(8);
  });

  it('каскадно раздвигает цепочку виджетов', () => {
    const layout: Layout = [
      { i: 'a', x: 0, y: 0, w: 12, h: 2 },
      { i: 'b', x: 0, y: 2, w: 6, h: 2 },
      { i: 'c', x: 0, y: 4, w: 6, h: 2 },
      { i: 'd', x: 0, y: 8, w: 12, h: 1 },
    ];
    const next = resizeItem(layout, 'a', 12, 5, FREE);
    expect(noOverlaps(next)).toBe(true);
    expect(pos(next, 'b').y).toBe(5);
    expect(pos(next, 'c').y).toBe(7);
    expect(pos(next, 'd').y).toBe(9);
  });
});

describe('resizeItem', () => {
  it('соблюдает минимальный размер', () => {
    const layout: Layout = [{ i: 'a', x: 0, y: 0, w: 4, h: 3, minW: 3, minH: 2 }];
    expect(pos(resizeItem(layout, 'a', 1, 1, FREE), 'a')).toMatchObject({ w: 3, h: 2 });
  });

  it('не растягивает шире сетки', () => {
    const layout: Layout = [{ i: 'a', x: 6, y: 0, w: 4, h: 3 }];
    const next = resizeItem(layout, 'a', 20, 3, FREE);
    expect(pos(next, 'a')).toMatchObject({ w: 12, x: 0 });
  });
});

describe('nudgeItem', () => {
  it('в режиме упаковки шаг вниз перепрыгивает соседа', () => {
    const layout: Layout = [
      { i: 'a', x: 0, y: 0, w: 4, h: 2 },
      { i: 'b', x: 0, y: 2, w: 4, h: 2 },
    ];
    const next = nudgeItem(layout, 'a', 0, 1, PACKED);
    expect(pos(next, 'b').y).toBe(0);
    expect(pos(next, 'a').y).toBe(2);
  });

  it('шаг вверх меняет местами с соседом сверху', () => {
    const layout: Layout = [
      { i: 'a', x: 0, y: 0, w: 4, h: 2 },
      { i: 'b', x: 0, y: 2, w: 4, h: 2 },
    ];
    const next = nudgeItem(layout, 'b', 0, -1, PACKED);
    expect(pos(next, 'b').y).toBe(0);
    expect(pos(next, 'a').y).toBe(2);
  });

  it('у края сетки ничего не меняет', () => {
    const layout: Layout = [{ i: 'a', x: 0, y: 0, w: 4, h: 2 }];
    expect(nudgeItem(layout, 'a', -1, 0, FREE)).toBe(layout);
  });
});

describe('вспомогательные функции', () => {
  it('compact убирает пустоты, сохраняя порядок', () => {
    const next = compact([
      { i: 'a', x: 0, y: 3, w: 4, h: 2 },
      { i: 'b', x: 0, y: 7, w: 4, h: 2 },
    ]);
    expect(pos(next, 'a').y).toBe(0);
    expect(pos(next, 'b').y).toBe(2);
  });

  it('fixOverlaps раздвигает пересечения', () => {
    const next = fixOverlaps(
      [
        { i: 'a', x: 0, y: 0, w: 6, h: 2 },
        { i: 'b', x: 2, y: 1, w: 6, h: 2 },
      ],
      12,
    );
    expect(noOverlaps(next)).toBe(true);
    expect(pos(next, 'b').y).toBe(2);
  });

  it('findFreeSpot находит первую дыру', () => {
    const layout: Layout = [
      { i: 'a', x: 0, y: 0, w: 6, h: 2 },
      { i: 'b', x: 0, y: 2, w: 12, h: 2 },
    ];
    expect(findFreeSpot(layout, 6, 2, 12)).toEqual({ x: 6, y: 0 });
    expect(findFreeSpot(layout, 8, 2, 12)).toEqual({ x: 0, y: 4 });
  });
});
