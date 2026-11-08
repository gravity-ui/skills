import { describe, expect, it } from 'vitest';
import {
  COLS,
  changeItem,
  compact,
  overlaps,
  parseLayout,
  settle,
  type LayoutItem,
  type LimitsById,
} from './layout';

const limits: LimitsById = {
  a: { minW: 2, minH: 2 },
  b: { minW: 2, minH: 2 },
  c: { minW: 2, minH: 2 },
};

const base = (): LayoutItem[] => [
  { id: 'a', x: 0, y: 0, w: 4, h: 3 },
  { id: 'b', x: 4, y: 0, w: 4, h: 3 },
  { id: 'c', x: 0, y: 3, w: 8, h: 4 },
];

const at = (layout: LayoutItem[], id: string) => layout.find((i) => i.id === id)!;

function expectValid(layout: LayoutItem[], lim: LimitsById = limits) {
  for (const item of layout) {
    expect(item.x).toBeGreaterThanOrEqual(0);
    expect(item.y).toBeGreaterThanOrEqual(0);
    expect(item.x + item.w).toBeLessThanOrEqual(COLS);
    expect(item.w).toBeGreaterThanOrEqual(lim[item.id].minW);
    expect(item.h).toBeGreaterThanOrEqual(lim[item.id].minH);
  }
  for (let i = 0; i < layout.length; i++) {
    for (let j = i + 1; j < layout.length; j++) {
      expect(overlaps(layout[i], layout[j])).toBe(false);
    }
  }
}

describe('changeItem', () => {
  it('moves an item into free space and leaves the others where they are', () => {
    const next = changeItem(base(), limits, 'b', { x: 8, y: 0 });
    expect(at(next, 'a')).toEqual({ id: 'a', x: 0, y: 0, w: 4, h: 3 });
    expect(at(next, 'b')).toEqual({ id: 'b', x: 8, y: 0, w: 4, h: 3 });
    expect(at(next, 'c')).toEqual({ id: 'c', x: 0, y: 3, w: 8, h: 4 });
    expectValid(next);
  });

  it('pushes an overlapped item down and keeps the moved item where it was dropped', () => {
    const next = changeItem(base(), limits, 'a', { x: 4, y: 0 });
    expect(at(next, 'a')).toMatchObject({ x: 4, y: 0 });
    expect(at(next, 'b').y).toBe(3);
    expect(at(next, 'c').y).toBe(6);
    expectValid(next);
  });

  it('resizes an item and resolves the overlap it creates', () => {
    const next = changeItem(base(), limits, 'a', { w: 8, h: 3 });
    expect(at(next, 'a')).toMatchObject({ x: 0, y: 0, w: 8, h: 3 });
    expect(at(next, 'b').y).toBeGreaterThanOrEqual(3);
    expectValid(next);
  });

  it('clamps sizes to the minimum, the grid width, and the grid edge', () => {
    const small = changeItem(base(), limits, 'a', { w: 1, h: 0 });
    expect(at(small, 'a')).toMatchObject({ w: 2, h: 2 });

    const wide = changeItem(base(), limits, 'a', { w: 40 });
    expect(at(wide, 'a')).toMatchObject({ x: 0, w: COLS });

    const far = changeItem(base(), limits, 'b', { x: 99 });
    expect(at(far, 'b').x + at(far, 'b').w).toBeLessThanOrEqual(COLS);
  });

  it('returns the layout unchanged for an unknown id', () => {
    expect(changeItem(base(), limits, 'nope', { x: 1 })).toEqual(base());
  });

  it('keeps the input order of items', () => {
    const next = changeItem(base(), limits, 'c', { x: 8, y: 0 });
    expect(next.map((i) => i.id)).toEqual(['a', 'b', 'c']);
  });

  it('survives a long random sequence of moves and resizes with no overlaps', () => {
    let seed = 12345;
    const rand = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    let layout = settle(base(), limits);
    for (let step = 0; step < 400; step++) {
      const item = layout[Math.floor(rand() * layout.length)];
      const patch =
        rand() < 0.5
          ? { x: Math.floor(rand() * COLS), y: Math.floor(rand() * 12) }
          : { w: Math.floor(rand() * 12), h: Math.floor(rand() * 9) };
      layout = changeItem(layout, limits, item.id, patch);
      expectValid(layout);
    }
  });
});

describe('compact', () => {
  it('closes vertical holes left behind', () => {
    const holey: LayoutItem[] = [
      { id: 'a', x: 0, y: 0, w: 12, h: 2 },
      { id: 'c', x: 0, y: 6, w: 4, h: 2 },
    ];
    const next = compact(holey);
    expect(at(next, 'c').y).toBe(2);
  });
});

describe('parseLayout', () => {
  const defaults = settle(base(), limits);

  it('returns the defaults for anything that is not an array', () => {
    expect(parseLayout(null, defaults, limits)).toEqual(defaults);
    expect(parseLayout('oops', defaults, limits)).toEqual(defaults);
  });

  it('uses saved positions, drops unknown ids, and falls back for missing ones', () => {
    const saved = [
      { id: 'b', x: 0, y: 10, w: 4, h: 3 },
      { id: 'ghost', x: 0, y: 0, w: 4, h: 3 },
    ];
    const layout = parseLayout(saved, defaults, limits);
    expect(layout.map((i) => i.id).sort()).toEqual(['a', 'b', 'c']);
    expect(at(layout, 'b').y).toBeLessThanOrEqual(10);
    expect(at(layout, 'a')).toMatchObject({ x: 0, y: 0 });
    expectValid(layout);
  });

  it('ignores entries with non-numeric or missing fields', () => {
    const saved = [{ id: 'a', x: 'left', y: 0, w: 4, h: 3 }, { id: 'b', x: 4 }];
    expect(parseLayout(saved, defaults, limits)).toEqual(defaults);
  });

  it('resolves overlapping saved positions', () => {
    const saved = [
      { id: 'a', x: 0, y: 0, w: 6, h: 3 },
      { id: 'b', x: 0, y: 0, w: 6, h: 3 },
      { id: 'c', x: 0, y: 0, w: 12, h: 4 },
    ];
    expectValid(parseLayout(saved, defaults, limits));
  });
});
