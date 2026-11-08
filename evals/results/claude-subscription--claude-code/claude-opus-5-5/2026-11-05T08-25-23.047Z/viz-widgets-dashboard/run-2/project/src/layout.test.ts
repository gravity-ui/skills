import { describe, expect, it } from 'vitest';

import {
  type Layout,
  collides,
  compact,
  findFreeSpot,
  growItem,
  moveItem,
  nudgeItem,
  resizeItem,
  sanitizeLayout,
  stackLayout,
} from './layout';

const COLS = 12;

const pos = (layout: Layout) =>
  Object.fromEntries(layout.map(({ id, x, y, w, h }) => [id, [x, y, w, h]]));

const noOverlaps = (layout: Layout) =>
  layout.every((a) => layout.every((b) => !collides(a, b)));

describe('compact', () => {
  it('floats items up into empty rows and keeps input order', () => {
    const layout: Layout = [
      { id: 'b', x: 0, y: 5, w: 6, h: 2 },
      { id: 'a', x: 0, y: 2, w: 6, h: 2 },
    ];
    const result = compact(layout, COLS);
    expect(result.map((i) => i.id)).toEqual(['b', 'a']);
    expect(pos(result)).toEqual({ a: [0, 0, 6, 2], b: [0, 2, 6, 2] });
  });

  it('clamps items to the grid and their minimum size', () => {
    const [item] = compact([{ id: 'a', x: 10, y: 0, w: 1, h: 1, minW: 4, minH: 3 }], COLS);
    expect([item.x, item.w, item.h]).toEqual([8, 4, 3]);
  });
});

describe('moveItem', () => {
  const stacked: Layout = [
    { id: 'a', x: 0, y: 0, w: 12, h: 3 },
    { id: 'b', x: 0, y: 3, w: 12, h: 3 },
  ];

  it('swaps with the item above when dragged onto it', () => {
    const result = moveItem(stacked, 'b', 0, 1, COLS);
    expect(pos(result)).toEqual({ a: [0, 3, 12, 3], b: [0, 0, 12, 3] });
  });

  it('pushes overlapped items down and never leaves overlaps', () => {
    const layout: Layout = [
      { id: 'a', x: 0, y: 0, w: 4, h: 2 },
      { id: 'b', x: 4, y: 0, w: 4, h: 2 },
      { id: 'c', x: 8, y: 0, w: 4, h: 2 },
      { id: 'd', x: 0, y: 2, w: 8, h: 4 },
    ];
    const result = moveItem(layout, 'c', 2, 1, COLS);
    expect(noOverlaps(result)).toBe(true);
    expect(result.find((i) => i.id === 'c')).toMatchObject({ x: 2 });
  });

  it('keeps the item inside the columns', () => {
    const result = moveItem(stacked, 'a', 20, 0, COLS);
    expect(result.find((i) => i.id === 'a')).toMatchObject({ x: 0, w: 12 });
  });

  it('places side by side when there is room', () => {
    const layout: Layout = [
      { id: 'a', x: 0, y: 0, w: 6, h: 2 },
      { id: 'b', x: 0, y: 2, w: 6, h: 2 },
    ];
    expect(pos(moveItem(layout, 'b', 6, 2, COLS))).toEqual({ a: [0, 0, 6, 2], b: [6, 0, 6, 2] });
  });
});

describe('resizeItem', () => {
  it('pushes neighbours below when growing', () => {
    const layout: Layout = [
      { id: 'a', x: 0, y: 0, w: 6, h: 2 },
      { id: 'b', x: 6, y: 0, w: 6, h: 2 },
    ];
    const result = resizeItem(layout, 'a', 8, 2, COLS);
    expect(pos(result)).toEqual({ a: [0, 0, 8, 2], b: [6, 2, 6, 2] });
  });

  it('respects minimum sizes', () => {
    const layout: Layout = [{ id: 'a', x: 0, y: 0, w: 6, h: 4, minW: 3, minH: 2 }];
    expect(pos(resizeItem(layout, 'a', 1, 1, COLS))).toEqual({ a: [0, 0, 3, 2] });
  });
});

describe('keyboard helpers', () => {
  const stacked: Layout = [
    { id: 'a', x: 0, y: 0, w: 12, h: 3 },
    { id: 'b', x: 0, y: 3, w: 12, h: 2 },
    { id: 'c', x: 0, y: 5, w: 12, h: 2 },
  ];

  it('moves down past the next neighbour instead of floating back', () => {
    expect(pos(nudgeItem(stacked, 'a', 'down', COLS))).toEqual({
      b: [0, 0, 12, 2],
      a: [0, 2, 12, 3],
      c: [0, 5, 12, 2],
    });
  });

  it('moves up by swapping with the neighbour above', () => {
    expect(pos(nudgeItem(stacked, 'c', 'up', COLS))).toEqual({
      a: [0, 0, 12, 3],
      c: [0, 3, 12, 2],
      b: [0, 5, 12, 2],
    });
  });

  it('is a no-op at the edges', () => {
    expect(nudgeItem(stacked, 'a', 'up', COLS)).toBe(stacked);
    expect(nudgeItem(stacked, 'a', 'left', COLS)).toBe(stacked);
    expect(pos(nudgeItem(stacked, 'c', 'down', COLS))).toEqual(pos(stacked));
  });

  it('grows and shrinks by a cell', () => {
    const layout: Layout = [{ id: 'a', x: 0, y: 0, w: 4, h: 2 }];
    expect(pos(growItem(layout, 'a', 1, 1, COLS))).toEqual({ a: [0, 0, 5, 3] });
    expect(pos(growItem(layout, 'a', -1, 0, COLS))).toEqual({ a: [0, 0, 3, 2] });
  });
});

describe('findFreeSpot', () => {
  it('finds the first gap in reading order', () => {
    const layout: Layout = [
      { id: 'a', x: 0, y: 0, w: 8, h: 2 },
      { id: 'b', x: 0, y: 2, w: 12, h: 2 },
    ];
    expect(findFreeSpot(layout, 4, 2, COLS)).toEqual({ x: 8, y: 0 });
    expect(findFreeSpot(layout, 6, 2, COLS)).toEqual({ x: 0, y: 4 });
  });
});

describe('stackLayout', () => {
  it('turns the grid into a single column in reading order', () => {
    const layout: Layout = [
      { id: 'b', x: 6, y: 0, w: 6, h: 2 },
      { id: 'a', x: 0, y: 0, w: 6, h: 3 },
    ];
    expect(pos(stackLayout(layout))).toEqual({ a: [0, 0, 1, 3], b: [0, 3, 1, 2] });
  });
});

describe('sanitizeLayout', () => {
  const defaults: Layout = [
    { id: 'a', x: 0, y: 0, w: 6, h: 2, minW: 3 },
    { id: 'b', x: 6, y: 0, w: 6, h: 2 },
  ];

  it('accepts a valid saved layout and restores constraints from defaults', () => {
    const result = sanitizeLayout([{ id: 'a', x: 0, y: 4, w: 1, h: 2 }], defaults, COLS);
    expect(result).toEqual([{ id: 'a', x: 0, y: 0, w: 3, h: 2, minW: 3 }]);
  });

  it('rejects unknown ids, duplicates and garbage', () => {
    expect(sanitizeLayout('nope', defaults, COLS)).toBeNull();
    expect(sanitizeLayout([{ id: 'zzz', x: 0, y: 0, w: 1, h: 1 }], defaults, COLS)).toBeNull();
    expect(
      sanitizeLayout(
        [
          { id: 'a', x: 0, y: 0, w: 6, h: 2 },
          { id: 'a', x: 0, y: 0, w: 6, h: 2 },
        ],
        defaults,
        COLS,
      ),
    ).toBeNull();
    expect(sanitizeLayout([{ id: 'a', x: 'x', y: 0, w: 6, h: 2 }], defaults, COLS)).toBeNull();
  });
});
