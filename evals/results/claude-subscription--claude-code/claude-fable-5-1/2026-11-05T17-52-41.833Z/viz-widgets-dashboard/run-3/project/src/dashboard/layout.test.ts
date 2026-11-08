import {describe, expect, it} from 'vitest';

import {addItem, bottom, collides, compact, moveItem, removeItem, resizeItem, scaleLayout} from './layout';
import type {Layout} from './types';

const COLS = 12;

function overlaps(layout: Layout): boolean {
  return layout.some((a) => layout.some((b) => collides(a, b)));
}

function byId(layout: Layout, id: string) {
  const item = layout.find((l) => l.i === id);
  if (!item) throw new Error(`missing ${id}`);
  return item;
}

const base: Layout = [
  {i: 'a', x: 0, y: 0, w: 6, h: 2},
  {i: 'b', x: 6, y: 0, w: 6, h: 2},
  {i: 'c', x: 0, y: 2, w: 12, h: 3},
];

describe('collides', () => {
  it('detects overlap and ignores self', () => {
    expect(collides(base[0], base[1])).toBe(false);
    expect(collides(base[0], {...base[0], i: 'z', x: 3})).toBe(true);
    expect(collides(base[0], base[0])).toBe(false);
  });
});

describe('compact', () => {
  it('floats items up into free space', () => {
    const out = compact([{i: 'a', x: 0, y: 5, w: 4, h: 1}], COLS);
    expect(byId(out, 'a').y).toBe(0);
  });

  it('does not let items cross each other', () => {
    const out = compact(
      [
        {i: 'a', x: 0, y: 0, w: 4, h: 2},
        {i: 'b', x: 0, y: 7, w: 4, h: 1},
      ],
      COLS,
    );
    expect(byId(out, 'b').y).toBe(2);
    expect(overlaps(out)).toBe(false);
  });

  it('clamps items wider than the grid', () => {
    const out = compact([{i: 'a', x: 10, y: 0, w: 20, h: 1}], 6);
    expect(byId(out, 'a')).toMatchObject({x: 0, w: 6});
  });
});

describe('moveItem', () => {
  it('pushes the occupant down when moved on top of it', () => {
    const out = moveItem(base, 'c', 0, 0, COLS);
    expect(byId(out, 'c').y).toBe(0);
    expect(byId(out, 'a').y).toBe(3);
    expect(byId(out, 'b').y).toBe(3);
    expect(overlaps(out)).toBe(false);
  });

  it('swaps with the item below when dragged past it', () => {
    const stack: Layout = [
      {i: 'a', x: 0, y: 0, w: 12, h: 2},
      {i: 'c', x: 0, y: 2, w: 12, h: 3},
    ];
    const out = moveItem(stack, 'a', 0, 3, COLS);
    // "c" jumps above "a"; "a" ends up right under it.
    expect(byId(out, 'c').y).toBe(0);
    expect(byId(out, 'a').y).toBe(3);
    expect(overlaps(out)).toBe(false);
  });

  it('does not swap when a neighbour blocks the jump', () => {
    const out = moveItem(base, 'a', 0, 3, COLS);
    expect(out.map((l) => [l.i, l.y])).toEqual([
      ['a', 0],
      ['b', 0],
      ['c', 2],
    ]);
  });

  it('keeps the item inside the grid', () => {
    const out = moveItem(base, 'a', 10, -4, COLS);
    expect(byId(out, 'a')).toMatchObject({x: 6, y: 0});
    expect(overlaps(out)).toBe(false);
  });

  it('returns the same array when nothing changes', () => {
    expect(moveItem(base, 'a', 0, 0, COLS)).toBe(base);
    expect(moveItem(base, 'nope', 1, 1, COLS)).toBe(base);
  });
});

describe('resizeItem', () => {
  it('pushes neighbours down when growing', () => {
    const out = resizeItem(base, 'a', 12, 2, COLS);
    expect(byId(out, 'a')).toMatchObject({x: 0, w: 12});
    expect(byId(out, 'b').y).toBe(2);
    expect(byId(out, 'c').y).toBe(4);
    expect(overlaps(out)).toBe(false);
  });

  it('respects min size', () => {
    const out = resizeItem([{i: 'a', x: 0, y: 0, w: 6, h: 4, minW: 3, minH: 2}], 'a', 1, 1, COLS);
    expect(byId(out, 'a')).toMatchObject({w: 3, h: 2});
  });
});

describe('addItem / removeItem', () => {
  it('places a new item in the first free cell', () => {
    const out = addItem(
      [
        {i: 'a', x: 0, y: 0, w: 6, h: 2},
        {i: 'b', x: 0, y: 2, w: 12, h: 1},
      ],
      {i: 'n', w: 6, h: 2},
      COLS,
    );
    expect(byId(out, 'n')).toMatchObject({x: 6, y: 0});
    expect(overlaps(out)).toBe(false);
  });

  it('appends at the bottom when no gap fits', () => {
    const out = addItem(base, {i: 'n', w: 12, h: 1}, COLS);
    expect(byId(out, 'n').y).toBe(5);
  });

  it('closes the gap after removal', () => {
    const out = removeItem(base, 'a', COLS);
    expect(out.map((l) => l.i)).toEqual(['b', 'c']);
    expect(byId(out, 'c').y).toBe(2);
    expect(bottom(out)).toBe(5);
  });
});

describe('scaleLayout', () => {
  it('rescales to fewer columns without overlaps', () => {
    const out = scaleLayout(base, 12, 6);
    expect(byId(out, 'a')).toMatchObject({x: 0, w: 3});
    expect(byId(out, 'b')).toMatchObject({x: 3, w: 3});
    expect(byId(out, 'c')).toMatchObject({x: 0, w: 6});
    expect(overlaps(out)).toBe(false);
  });
});
