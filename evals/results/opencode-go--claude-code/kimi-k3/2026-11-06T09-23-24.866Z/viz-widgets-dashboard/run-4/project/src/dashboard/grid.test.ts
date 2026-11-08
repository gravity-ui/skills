import {describe, expect, it} from 'vitest';
import {
  clampRect,
  collides,
  compactLayout,
  findFreeSlot,
  resolveLayout,
} from './grid';
import type {WidgetInstance} from './types';
import {GRID_COLS} from './types';

const w = (id: string, x: number, y: number, ww = 3, hh = 2): WidgetInstance => ({
  id,
  type: 'kpi',
  rect: {x, y, w: ww, h: hh},
});

describe('collides', () => {
  it('detects overlap and separation', () => {
    expect(collides({x: 0, y: 0, w: 2, h: 2}, {x: 1, y: 1, w: 2, h: 2})).toBe(true);
    expect(collides({x: 0, y: 0, w: 2, h: 2}, {x: 2, y: 0, w: 2, h: 2})).toBe(false);
    expect(collides({x: 0, y: 0, w: 2, h: 2}, {x: 0, y: 2, w: 2, h: 2})).toBe(false);
  });
});

describe('clampRect', () => {
  it('keeps rects inside the grid and above min size', () => {
    expect(clampRect({x: -2, y: -1, w: 1, h: 1}, {w: 3, h: 2})).toEqual({
      x: 0,
      y: 0,
      w: 3,
      h: 2,
    });
    expect(clampRect({x: 11, y: 5, w: 4, h: 2}, {w: 3, h: 2})).toEqual({
      x: GRID_COLS - 4,
      y: 5,
      w: 4,
      h: 2,
    });
  });
});

describe('resolveLayout', () => {
  it('lets the moved widget win and pushes others down', () => {
    const items = [w('a', 0, 0), w('b', 0, 2), w('c', 6, 0)];
    // move b onto a
    const res = resolveLayout(items, 'b', {x: 0, y: 0, w: 3, h: 2});
    expect(res.get('b')).toEqual({x: 0, y: 0, w: 3, h: 2});
    expect(res.get('a')).toEqual({x: 0, y: 2, w: 3, h: 2});
    expect(res.get('c')).toEqual({x: 6, y: 0, w: 3, h: 2});
  });

  it('never produces overlaps for a chain of pushes', () => {
    const items = [w('a', 0, 0), w('b', 0, 2), w('c', 0, 4), w('d', 0, 6)];
    const res = resolveLayout(items, 'a', {x: 0, y: 2, w: 3, h: 2});
    const rects = [...res.values()];
    for (let i = 0; i < rects.length; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        expect(collides(rects[i], rects[j])).toBe(false);
      }
    }
  });
});

describe('compactLayout', () => {
  it('pulls widgets up without creating overlaps', () => {
    const items = [w('a', 0, 0), w('b', 3, 5)];
    const res = compactLayout(items, resolveLayout(items, 'b', {x: 3, y: 5, w: 3, h: 2}));
    // b sits beside a horizontally, so it compacts all the way up
    expect(res.get('b')).toEqual({x: 3, y: 0, w: 3, h: 2});
  });

  it('stops at the widget above when columns overlap', () => {
    const items = [w('a', 0, 0), w('b', 0, 5)];
    const res = compactLayout(items, resolveLayout(items, 'b', {x: 0, y: 5, w: 3, h: 2}));
    expect(res.get('b')).toEqual({x: 0, y: 2, w: 3, h: 2});
  });
});

describe('findFreeSlot', () => {
  it('finds the first free slot in reading order', () => {
    const items = [w('a', 0, 0, 6, 2)];
    expect(findFreeSlot(items, {w: 3, h: 2})).toEqual({x: 6, y: 0, w: 3, h: 2});
    expect(findFreeSlot(items, {w: 7, h: 2})).toEqual({x: 0, y: 2, w: 7, h: 2});
  });
});
