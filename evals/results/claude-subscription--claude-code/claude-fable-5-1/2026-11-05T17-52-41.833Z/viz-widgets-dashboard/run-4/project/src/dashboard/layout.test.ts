import { describe, expect, it } from 'vitest';

import {
  addItem,
  bottom,
  collides,
  compact,
  findFreeSpot,
  moveItem,
  normalizeLayout,
  removeItem,
  resizeItem,
  stackLayout,
  type Layout,
} from './layout';

const COLS = 12;

const noOverlaps = (layout: Layout) => {
  for (const a of layout) for (const b of layout) if (collides(a, b)) return false;
  return true;
};
const inBounds = (layout: Layout, cols: number) =>
  layout.every((l) => l.x >= 0 && l.y >= 0 && l.x + l.w <= cols && l.w >= 1 && l.h >= 1);
const byId = (layout: Layout, id: string) => layout.find((l) => l.id === id)!;

const base: Layout = [
  { id: 'a', x: 0, y: 0, w: 6, h: 2 },
  { id: 'b', x: 6, y: 0, w: 6, h: 2 },
  { id: 'c', x: 0, y: 2, w: 12, h: 3 },
];

describe('collides', () => {
  it('detects overlap and ignores itself', () => {
    expect(collides(base[0], base[1])).toBe(false);
    expect(collides(base[0], { ...base[0], id: 'z', x: 3 })).toBe(true);
    expect(collides(base[0], base[0])).toBe(false);
  });
});

describe('compact', () => {
  it('moves items up into free space and keeps the original order of the array', () => {
    const layout: Layout = [
      { id: 'a', x: 0, y: 5, w: 4, h: 2 },
      { id: 'b', x: 4, y: 3, w: 4, h: 2 },
    ];
    const result = compact(layout);
    expect(result.map((l) => l.id)).toEqual(['a', 'b']);
    expect(byId(result, 'a').y).toBe(0);
    expect(byId(result, 'b').y).toBe(0);
  });

  it('resolves pre-existing overlaps by pushing the later item down', () => {
    const layout: Layout = [
      { id: 'a', x: 0, y: 0, w: 6, h: 2 },
      { id: 'b', x: 2, y: 1, w: 6, h: 2 },
    ];
    const result = compact(layout);
    expect(noOverlaps(result)).toBe(true);
    expect(byId(result, 'b').y).toBe(2);
  });
});

describe('moveItem', () => {
  it('returns the same reference when nothing changes', () => {
    expect(moveItem(base, 'a', 0, 0, COLS)).toBe(base);
    expect(moveItem(base, 'missing', 3, 3, COLS)).toBe(base);
  });

  it('clamps to the grid edges', () => {
    const result = moveItem(base, 'a', 20, -4, COLS);
    expect(byId(result, 'a')).toMatchObject({ x: 6, y: 0 });
    expect(noOverlaps(result)).toBe(true);
    expect(inBounds(result, COLS)).toBe(true);
  });

  it('swaps with the neighbour when dragged over it horizontally', () => {
    const result = moveItem(base, 'a', 6, 0, COLS);
    expect(byId(result, 'a')).toMatchObject({ x: 6, y: 0 });
    expect(byId(result, 'b')).toMatchObject({ x: 6, y: 2 });
    expect(byId(result, 'c').y).toBe(4);
    expect(noOverlaps(result)).toBe(true);
  });

  it('lets the item being dragged down trade places with the one below', () => {
    const layout: Layout = [
      { id: 'a', x: 0, y: 0, w: 12, h: 2 },
      { id: 'c', x: 0, y: 2, w: 12, h: 3 },
    ];
    // Не дотащили: соседу некуда подняться, компактизация возвращает всё на место.
    const tooShort = moveItem(layout, 'a', 0, 2, COLS);
    expect(byId(tooShort, 'a').y).toBe(0);
    expect(byId(tooShort, 'c').y).toBe(2);

    // Дотащили ниже соседа: он поднимается наверх, элемент встаёт под ним.
    const result = moveItem(layout, 'a', 0, 3, COLS);
    expect(byId(result, 'c').y).toBe(0);
    expect(byId(result, 'a').y).toBe(3);
    expect(noOverlaps(result)).toBe(true);
  });

  it('never produces overlaps on random moves', () => {
    let layout: Layout = base;
    let seed = 42;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    for (let i = 0; i < 300; i++) {
      const id = ['a', 'b', 'c'][Math.floor(rnd() * 3)];
      layout = moveItem(layout, id, Math.floor(rnd() * 14) - 1, Math.floor(rnd() * 8), COLS);
      expect(noOverlaps(layout)).toBe(true);
      expect(inBounds(layout, COLS)).toBe(true);
      expect(layout).toHaveLength(3);
    }
  });
});

describe('resizeItem', () => {
  it('respects min size and the right edge', () => {
    const layout: Layout = [{ id: 'a', x: 8, y: 0, w: 2, h: 1, minW: 2, minH: 2 }];
    const result = resizeItem(layout, 'a', 10, 0, COLS);
    expect(byId(result, 'a')).toMatchObject({ w: 4, h: 2 });
  });

  it('pushes items below when growing in height', () => {
    const result = resizeItem(base, 'a', 6, 4, COLS);
    expect(byId(result, 'c').y).toBe(4);
    expect(byId(result, 'b').y).toBe(0);
    expect(noOverlaps(result)).toBe(true);
  });
});

describe('add / remove / spots', () => {
  it('finds the first free spot in reading order', () => {
    const layout: Layout = [{ id: 'a', x: 0, y: 0, w: 8, h: 2 }];
    expect(findFreeSpot(layout, 4, 1, COLS)).toEqual({ x: 8, y: 0 });
    expect(findFreeSpot(layout, 6, 1, COLS)).toEqual({ x: 0, y: 2 });
  });

  it('adds without overlap and removes with compaction', () => {
    const added = addItem(base, { id: 'd', w: 4, h: 2 }, COLS);
    expect(added).toHaveLength(4);
    expect(noOverlaps(added)).toBe(true);
    expect(byId(added, 'd').y).toBe(5);

    const removed = removeItem(added, 'c');
    expect(removed.map((l) => l.id)).toEqual(['a', 'b', 'd']);
    expect(byId(removed, 'd').y).toBe(2);
    expect(bottom(removed)).toBe(4);
  });
});

describe('normalizeLayout / stackLayout', () => {
  it('repairs a corrupted persisted layout', () => {
    const bad: Layout = [
      { id: 'a', x: -3, y: -1, w: 40, h: 0 },
      { id: 'b', x: 11, y: 0, w: 5, h: 2 },
    ];
    const result = normalizeLayout(bad, COLS);
    expect(inBounds(result, COLS)).toBe(true);
    expect(noOverlaps(result)).toBe(true);
  });

  it('stacks everything into one column in reading order', () => {
    const result = stackLayout(base, 4);
    expect(result.map((l) => l.id)).toEqual(['a', 'b', 'c']);
    expect(result.every((l) => l.x === 0 && l.w === 4)).toBe(true);
    expect(result.map((l) => l.y)).toEqual([0, 2, 4]);
  });
});
