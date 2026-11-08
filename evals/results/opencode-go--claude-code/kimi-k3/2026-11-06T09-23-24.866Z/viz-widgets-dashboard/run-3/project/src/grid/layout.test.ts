import { describe, expect, it } from 'vitest';
import { COLS, bottom, collides, findFreeSpot, moveItem, resizeItem } from './layout';
import type { Layout } from './layout';

const noOverlaps = (layout: Layout) => {
  for (const a of layout) for (const b of layout) expect(collides(a, b)).toBe(false);
};

describe('grid layout', () => {
  it('перемещает виджет в свободную клетку', () => {
    const l: Layout = [
      { id: 'a', x: 0, y: 0, w: 4, h: 2 },
      { id: 'b', x: 4, y: 0, w: 4, h: 2 },
    ];
    const next = moveItem(l, 'b', 8, 0);
    expect(next.find((i) => i.id === 'b')).toMatchObject({ x: 8, y: 0 });
    noOverlaps(next);
  });

  it('выталкивает пересекающиеся виджеты вниз', () => {
    const l: Layout = [
      { id: 'a', x: 0, y: 0, w: 4, h: 2 },
      { id: 'b', x: 4, y: 0, w: 4, h: 2 },
    ];
    const next = moveItem(l, 'b', 2, 0); // наезжает на a
    const a = next.find((i) => i.id === 'a')!;
    const b = next.find((i) => i.id === 'b')!;
    expect(b).toMatchObject({ x: 2, y: 0 });
    expect(a.y).toBeGreaterThanOrEqual(b.y + b.h - 1);
    noOverlaps(next);
  });

  it('толкает цепочку виджетов вниз', () => {
    const l: Layout = [
      { id: 'a', x: 0, y: 0, w: 4, h: 2 },
      { id: 'b', x: 0, y: 2, w: 4, h: 2 },
      { id: 'c', x: 0, y: 4, w: 4, h: 2 },
    ];
    const next = moveItem(l, 'a', 0, 1);
    noOverlaps(next);
    expect(next.find((i) => i.id === 'a')!.y).toBe(1);
  });

  it('ограничивает позицию краями сетки', () => {
    const l: Layout = [{ id: 'a', x: 0, y: 0, w: 4, h: 2 }];
    const next = moveItem(l, 'a', 99, -5);
    const a = next.find((i) => i.id === 'a')!;
    expect(a.x).toBe(COLS - a.w);
    expect(a.y).toBe(0);
  });

  it('уважает минимальный размер при resize', () => {
    const l: Layout = [{ id: 'a', x: 0, y: 0, w: 4, h: 2 }];
    const next = resizeItem(l, 'a', 1, 1, 3, 2);
    expect(next.find((i) => i.id === 'a')).toMatchObject({ w: 3, h: 2 });
  });

  it('resize выталкивает соседей вниз', () => {
    const l: Layout = [
      { id: 'a', x: 0, y: 0, w: 4, h: 2 },
      { id: 'b', x: 0, y: 2, w: 4, h: 2 },
    ];
    const next = resizeItem(l, 'a', 4, 4);
    expect(next.find((i) => i.id === 'b')!.y).toBe(4);
    noOverlaps(next);
  });

  it('findFreeSpot находит первое свободное место', () => {
    const l: Layout = [{ id: 'a', x: 0, y: 0, w: 6, h: 2 }];
    expect(findFreeSpot(l, 6, 2)).toEqual({ x: 6, y: 0 });
    expect(findFreeSpot(l, 8, 2).y).toBe(bottom(l));
  });
});
