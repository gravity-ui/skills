import { describe, expect, it } from 'vitest';

import { collides, compact, findFreeSlot, layoutHeight, moveItem, resizeItem, type Layout } from './layout';

const base: Layout = [
  { i: 'a', x: 0, y: 0, w: 4, h: 2 },
  { i: 'b', x: 4, y: 0, w: 4, h: 2 },
  { i: 'c', x: 0, y: 2, w: 8, h: 2 },
];

describe('collides', () => {
  it('detects overlap and ignores touching edges', () => {
    expect(collides(base[0], base[1])).toBe(false);
    expect(collides(base[0], base[2])).toBe(false);
    expect(collides(base[0], { i: 'z', x: 3, y: 1, w: 2, h: 2 })).toBe(true);
    expect(collides(base[0], base[0])).toBe(false);
  });
});

describe('compact', () => {
  it('floats items up into free space', () => {
    const result = compact([{ i: 'a', x: 0, y: 5, w: 2, h: 1 }], 12);
    expect(result[0].y).toBe(0);
  });

  it('does not move pinned item and pushes colliding items below it', () => {
    const layout: Layout = [
      { i: 'a', x: 0, y: 0, w: 4, h: 2 },
      { i: 'b', x: 0, y: 1, w: 4, h: 2 },
    ];
    const result = compact(layout, 12, 'b');
    expect(result.find((i) => i.i === 'b')).toMatchObject({ x: 0, y: 1 });
    expect(result.find((i) => i.i === 'a')).toMatchObject({ x: 0, y: 3 });
  });

  it('keeps original order of items', () => {
    const result = compact(base, 12);
    expect(result.map((i) => i.i)).toEqual(['a', 'b', 'c']);
  });
});

describe('moveItem', () => {
  it('clamps x to the grid and compacts the rest', () => {
    const result = moveItem(base, 'a', 20, 0, 12);
    const a = result.find((i) => i.i === 'a')!;
    expect(a.x).toBe(8);
    expect(a.y).toBe(0);
    expect(layoutHeight(result)).toBe(4);
  });

  it('pushes items down when dropped on top of them', () => {
    const result = moveItem(base, 'c', 0, 0, 12);
    expect(result.find((i) => i.i === 'c')).toMatchObject({ x: 0, y: 0 });
    expect(result.find((i) => i.i === 'a')!.y).toBe(2);
    expect(result.find((i) => i.i === 'b')!.y).toBe(2);
  });
});

describe('resizeItem', () => {
  it('respects min and max constraints', () => {
    const layout: Layout = [{ i: 'a', x: 0, y: 0, w: 4, h: 2, minW: 3, minH: 2, maxW: 6 }];
    expect(resizeItem(layout, 'a', 1, 1, 12)[0]).toMatchObject({ w: 3, h: 2 });
    expect(resizeItem(layout, 'a', 10, 3, 12)[0]).toMatchObject({ w: 6, h: 3 });
  });

  it('keeps the item inside the grid when it grows', () => {
    const layout: Layout = [{ i: 'a', x: 10, y: 0, w: 2, h: 2 }];
    expect(resizeItem(layout, 'a', 4, 2, 12)[0]).toMatchObject({ x: 8, w: 4 });
  });
});

describe('findFreeSlot', () => {
  it('finds the first gap', () => {
    expect(findFreeSlot(base, 4, 2, 12)).toEqual({ x: 8, y: 0 });
    expect(findFreeSlot(base, 6, 2, 12)).toEqual({ x: 0, y: 4 });
  });
});

describe('moveItem swaps', () => {
  it('swaps with the item below when dragged over it', () => {
    const layout: Layout = [
      { i: 'a', x: 0, y: 0, w: 4, h: 2 },
      { i: 'b', x: 0, y: 2, w: 4, h: 2 },
    ];
    const result = moveItem(layout, 'a', 0, 2, 12);
    expect(result.find((i) => i.i === 'a')).toMatchObject({ x: 0, y: 2 });
    expect(result.find((i) => i.i === 'b')).toMatchObject({ x: 0, y: 0 });
  });

  it('swaps with the neighbour on the same row', () => {
    const layout: Layout = [
      { i: 'a', x: 0, y: 0, w: 3, h: 2 },
      { i: 'b', x: 3, y: 0, w: 3, h: 2 },
    ];
    const result = moveItem(layout, 'a', 3, 0, 12);
    expect(result.find((i) => i.i === 'a')).toMatchObject({ x: 3, y: 0 });
    expect(result.find((i) => i.i === 'b')).toMatchObject({ x: 0, y: 0 });
  });

  it('floats a dropped item up when nothing is above it', () => {
    const layout: Layout = [{ i: 'a', x: 0, y: 0, w: 4, h: 2 }];
    expect(moveItem(layout, 'a', 6, 7, 12)[0]).toMatchObject({ x: 6, y: 0 });
  });

  it('never produces overlaps after a move', () => {
    let layout: Layout = base;
    for (const [id, x, y] of [['c', 2, 0], ['a', 0, 3], ['b', 8, 1], ['c', 0, 0]] as const) {
      layout = moveItem(layout, id, x, y, 12);
      for (const p of layout) for (const q of layout) expect(collides(p, q)).toBe(false);
    }
  });
});
