import { describe, expect, it } from 'vitest';
import { COLS, type LayoutItem, gridHeight, overlaps, placeItem, rectToPx, settle } from './layout';

const item = (id: string, x: number, y: number, w: number, h: number): LayoutItem => ({ id, x, y, w, h });

const byId = (items: LayoutItem[], id: string) => items.find((i) => i.id === id)!;

function assertNoOverlaps(items: LayoutItem[]) {
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      expect(overlaps(items[i], items[j]), `${items[i].id} overlaps ${items[j].id}`).toBe(false);
    }
  }
  for (const it of items) {
    expect(it.x).toBeGreaterThanOrEqual(0);
    expect(it.x + it.w).toBeLessThanOrEqual(COLS);
    expect(it.y).toBeGreaterThanOrEqual(0);
  }
}

describe('settle', () => {
  it('floats items up into gaps (no holes)', () => {
    const out = settle([item('a', 0, 3, 4, 2), item('b', 4, 5, 4, 2)]);
    expect(byId(out, 'a').y).toBe(0);
    expect(byId(out, 'b').y).toBe(0);
  });

  it('pushes overlapping items down and keeps the result overlap-free', () => {
    const out = settle([item('a', 0, 0, 6, 2), item('b', 0, 0, 6, 2)]);
    assertNoOverlaps(out);
    expect(byId(out, 'a').y).toBe(0);
    expect(byId(out, 'b').y).toBe(2);
  });

  it('keeps the pinned item in place and pushes the others around it', () => {
    const out = settle([item('a', 0, 0, 6, 2), item('b', 0, 0, 6, 2)], 'b');
    expect(byId(out, 'b')).toMatchObject({ x: 0, y: 0 });
    expect(byId(out, 'a').y).toBe(2);
    assertNoOverlaps(out);
  });

  it('clamps x into the grid and keeps input order', () => {
    const out = settle([item('a', 11, 0, 4, 1), item('b', 0, 0, 2, 1)]);
    expect(out.map((i) => i.id)).toEqual(['a', 'b']);
    expect(byId(out, 'a').x).toBe(COLS - 4);
    assertNoOverlaps(out);
  });
});

describe('placeItem', () => {
  it('moves an item to the target and reflows the others', () => {
    const items = [item('a', 0, 0, 6, 2), item('b', 6, 0, 6, 2), item('c', 0, 2, 12, 2)];
    const out = placeItem(items, item('a', 6, 0, 6, 2));
    expect(byId(out, 'a')).toMatchObject({ x: 6, y: 0 });
    assertNoOverlaps(out);
    // b was displaced by the swap-in and must not sit on top of a
    expect(byId(out, 'b').y).toBeGreaterThanOrEqual(2);
  });

  it('is a no-op when dropping an item where it already is', () => {
    const items = [item('a', 0, 0, 4, 2), item('b', 4, 0, 4, 2), item('c', 8, 0, 4, 2)];
    expect(placeItem(items, byId(items, 'b'))).toEqual(items);
  });
});

describe('geometry', () => {
  it('computes gridHeight from the lowest item', () => {
    expect(gridHeight([])).toBe(0);
    // one row unit is 72px, gap 16px: 2 rows = 2*72 + 16 = 160
    expect(gridHeight([item('a', 0, 0, 3, 2)])).toBe(160);
  });

  it('maps a rectangle to pixels with gaps included', () => {
    const m = { colW: 50, colStep: 66, rowStep: 88 };
    expect(rectToPx({ x: 1, y: 2, w: 2, h: 1 }, m)).toEqual({
      left: 66,
      top: 176,
      width: 50 * 2 + 16,
      height: 72,
    });
  });
});
