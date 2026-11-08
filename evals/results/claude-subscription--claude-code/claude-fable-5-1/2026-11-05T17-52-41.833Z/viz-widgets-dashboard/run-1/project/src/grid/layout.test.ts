import { describe, expect, it } from 'vitest';

import {
  addItem,
  collides,
  compact,
  findFreeSpot,
  fitToCols,
  layoutHeight,
  moveItem,
  removeItem,
  resizeItem,
  type Layout,
} from './layout';

const COLS = 12;
const base: Layout = [
  { id: 'a', x: 0, y: 0, w: 4, h: 2 },
  { id: 'b', x: 4, y: 0, w: 4, h: 2 },
  { id: 'c', x: 0, y: 2, w: 8, h: 3 },
];

const byId = (layout: Layout, id: string) => layout.find((i) => i.id === id)!;
const noOverlaps = (layout: Layout) =>
  layout.every((a) => layout.every((b) => a === b || !collides(a, b)));

describe('collides', () => {
  it('detects overlap and ignores self', () => {
    expect(collides(base[0], base[1])).toBe(false);
    expect(collides(base[0], { id: 'x', x: 3, y: 1, w: 2, h: 2 })).toBe(true);
    expect(collides(base[0], base[0])).toBe(false);
  });
});

describe('compact', () => {
  it('pulls items up into free space', () => {
    const out = compact([{ id: 'a', x: 0, y: 5, w: 2, h: 1 }], COLS);
    expect(byId(out, 'a').y).toBe(0);
  });

  it('keeps items that are blocked from above in place', () => {
    const out = compact(
      [
        { id: 'a', x: 0, y: 0, w: 2, h: 2 },
        { id: 'b', x: 0, y: 6, w: 2, h: 1 },
      ],
      COLS,
    );
    expect(byId(out, 'b').y).toBe(2);
  });

  it('clamps items that stick out of the grid', () => {
    const out = compact([{ id: 'a', x: 10, y: 0, w: 4, h: 1 }], COLS);
    expect(byId(out, 'a')).toMatchObject({ x: 8, w: 4 });
  });
});

describe('moveItem', () => {
  it('pushes the occupant below the moved item', () => {
    const out = moveItem(base, 'c', 0, 0, COLS);
    expect(byId(out, 'c')).toMatchObject({ x: 0, y: 0 });
    expect(byId(out, 'a').y).toBe(3);
    expect(byId(out, 'b').y).toBe(3);
    expect(noOverlaps(out)).toBe(true);
  });

  it('leaves the rest alone when moving into empty space', () => {
    const out = moveItem(base, 'a', 8, 0, COLS);
    expect(byId(out, 'a')).toMatchObject({ x: 8, y: 0 });
    expect(byId(out, 'b')).toMatchObject({ x: 4, y: 0 });
    expect(byId(out, 'c')).toMatchObject({ x: 0, y: 2 });
  });

  it('is a no-op for an unknown id', () => {
    expect(moveItem(base, 'zzz', 1, 1, COLS)).toBe(base);
  });
});

describe('resizeItem', () => {
  it('grows an item and pushes neighbours down', () => {
    const out = resizeItem(base, 'a', 4, 4, COLS);
    expect(byId(out, 'a').h).toBe(4);
    expect(byId(out, 'c').y).toBe(4);
    expect(noOverlaps(out)).toBe(true);
  });

  it('respects min and max sizes', () => {
    const layout: Layout = [{ id: 'a', x: 0, y: 0, w: 4, h: 2, minW: 2, minH: 2, maxW: 6 }];
    expect(byId(resizeItem(layout, 'a', 1, 1, COLS), 'a')).toMatchObject({ w: 2, h: 2 });
    expect(byId(resizeItem(layout, 'a', 20, 2, COLS), 'a')).toMatchObject({ w: 6 });
  });
});

describe('add / remove', () => {
  it('finds the first free spot', () => {
    expect(findFreeSpot(base, 4, 2, COLS)).toEqual({ x: 8, y: 0 });
    expect(findFreeSpot(base, 12, 1, COLS)).toEqual({ x: 0, y: 5 });
  });

  it('adds and removes without overlaps', () => {
    const added = addItem(base, { id: 'd', w: 4, h: 2 }, COLS);
    expect(byId(added, 'd')).toMatchObject({ x: 8, y: 0 });
    expect(noOverlaps(added)).toBe(true);
    const removed = removeItem(added, 'a', COLS);
    expect(removed.some((i) => i.id === 'a')).toBe(false);
    expect(byId(removed, 'c').y).toBe(2);
  });
});

describe('fitToCols', () => {
  it('scales widths to a narrower grid and keeps no overlaps', () => {
    const out = fitToCols(base, 12, 4);
    expect(out.every((i) => i.x + i.w <= 4)).toBe(true);
    expect(noOverlaps(out)).toBe(true);
    expect(layoutHeight(out)).toBeGreaterThanOrEqual(layoutHeight(base));
  });
});

describe('fitToCols (flow)', () => {
  it('lays items out in reading order without staggering', () => {
    const tiles: Layout = [0, 3, 6, 9].map((x, i) => ({ id: `t${i}`, x, y: 0, w: 3, h: 2, minW: 2 }));
    const out = fitToCols(tiles, 12, 4);
    expect(out.map((i) => [i.x, i.y, i.w])).toEqual([
      [0, 0, 2],
      [2, 0, 2],
      [0, 2, 2],
      [2, 2, 2],
    ]);
  });

  it('stretches wide items to full width on a 4-column grid', () => {
    const out = fitToCols([{ id: 'chart', x: 0, y: 0, w: 8, h: 4, minW: 4 }], 12, 4);
    expect(byId(out, 'chart')).toMatchObject({ x: 0, w: 4 });
  });
});
