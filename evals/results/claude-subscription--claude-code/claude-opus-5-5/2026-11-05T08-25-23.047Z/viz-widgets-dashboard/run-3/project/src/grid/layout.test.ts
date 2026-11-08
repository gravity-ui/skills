import { describe, expect, it } from 'vitest';

import { type Layout, addItem, collides, compact, moveItem, resizeItem, sanitizeLayout } from './layout';

const COLS = 12;

function noOverlaps(layout: Layout) {
  for (const a of layout) for (const b of layout) expect(collides(a, b)).toBe(false);
}
const pos = (layout: Layout, id: string) => {
  const it = layout.find((l) => l.i === id)!;
  return { x: it.x, y: it.y, w: it.w, h: it.h };
};

describe('compact', () => {
  it('floats items up and resolves overlaps', () => {
    const out = compact(
      [
        { i: 'a', x: 0, y: 5, w: 4, h: 2 },
        { i: 'b', x: 0, y: 5, w: 4, h: 2 },
        { i: 'c', x: 6, y: 9, w: 2, h: 1 },
      ],
      COLS,
    );
    expect(pos(out, 'a')).toMatchObject({ x: 0, y: 0 });
    expect(pos(out, 'b')).toMatchObject({ x: 0, y: 2 });
    expect(pos(out, 'c')).toMatchObject({ x: 6, y: 0 });
    noOverlaps(out);
  });

  it('keeps items inside the grid width', () => {
    const out = compact([{ i: 'a', x: 10, y: 0, w: 6, h: 1 }], COLS);
    expect(pos(out, 'a')).toEqual({ x: 6, y: 0, w: 6, h: 1 });
  });
});

describe('moveItem', () => {
  const stack: Layout = [
    { i: 'a', x: 0, y: 0, w: 4, h: 2 },
    { i: 'b', x: 0, y: 2, w: 4, h: 2 },
    { i: 'c', x: 0, y: 4, w: 4, h: 2 },
  ];

  it('moves an item below its neighbour', () => {
    const out = moveItem(stack, 'a', 0, 2, COLS);
    expect(pos(out, 'b').y).toBe(0);
    expect(pos(out, 'a').y).toBe(2);
    expect(pos(out, 'c').y).toBe(4);
    noOverlaps(out);
  });

  it('moves an item to the top, pushing others down', () => {
    const out = moveItem(stack, 'c', 0, 0, COLS);
    expect(out.map((it) => [it.i, it.y])).toEqual([
      ['a', 2],
      ['b', 4],
      ['c', 0],
    ]);
  });

  it('moves sideways into an empty column and floats up', () => {
    const out = moveItem(stack, 'c', 6, 3, COLS);
    expect(pos(out, 'c')).toMatchObject({ x: 6, y: 0 });
    noOverlaps(out);
  });

  it('clamps out-of-range targets', () => {
    const out = moveItem(stack, 'a', 20, -3, COLS);
    expect(pos(out, 'a')).toMatchObject({ x: 8, y: 0 });
  });
});

describe('resizeItem', () => {
  it('respects min size and right edge, pushing neighbours', () => {
    const layout: Layout = [
      { i: 'a', x: 6, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
      { i: 'b', x: 6, y: 2, w: 3, h: 2 },
    ];
    const out = resizeItem(layout, 'a', 99, 1, COLS);
    expect(pos(out, 'a')).toEqual({ x: 6, y: 0, w: 6, h: 2 });
    const taller = resizeItem(layout, 'a', 3, 4, COLS);
    expect(pos(taller, 'b').y).toBe(4);
    noOverlaps(taller);
  });
});

describe('addItem', () => {
  it('uses the first free gap', () => {
    const out = addItem([{ i: 'a', x: 0, y: 0, w: 6, h: 2 }], { i: 'n', x: 0, y: 0, w: 4, h: 2 }, COLS);
    expect(pos(out, 'n')).toMatchObject({ x: 6, y: 0 });
  });
});

describe('sanitizeLayout', () => {
  const known = new Map([['a', { i: 'a', x: 0, y: 0, w: 4, h: 2, minW: 3 }]]);
  it('drops garbage, duplicates and unknown ids; restores constraints', () => {
    const out = sanitizeLayout(
      [{ i: 'a', x: 1, y: 7, w: 1, h: 2 }, { i: 'a', x: 0, y: 0, w: 4, h: 2 }, { i: 'zzz' }, null, 'x'],
      known,
      COLS,
    );
    expect(out).toEqual([{ i: 'a', x: 1, y: 0, w: 3, h: 2, minW: 3 }]);
    expect(sanitizeLayout('nope', known, COLS)).toBeNull();
  });
});
