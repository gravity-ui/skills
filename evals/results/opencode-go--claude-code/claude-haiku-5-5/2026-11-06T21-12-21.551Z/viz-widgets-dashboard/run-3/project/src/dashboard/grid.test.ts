import { describe, expect, it } from 'vitest';
import { COLS, type Item, type SizeOf, compact, isValidLayout, overlaps, updateItem } from './grid';

const sizeOf: SizeOf = () => ({ minW: 2, minH: 2 });

const base: Item[] = [
  { i: 'a', x: 0, y: 0, w: 4, h: 2 },
  { i: 'b', x: 4, y: 0, w: 4, h: 2 },
  { i: 'c', x: 0, y: 2, w: 12, h: 3 },
];

function assertNoOverlaps(items: Item[]) {
  for (let a = 0; a < items.length; a++) {
    for (let b = a + 1; b < items.length; b++) {
      expect(overlaps(items[a], items[b]), `${items[a].i} vs ${items[b].i}`).toBe(false);
    }
  }
}

function assertInBounds(items: Item[]) {
  for (const it of items) {
    expect(it.x).toBeGreaterThanOrEqual(0);
    expect(it.x + it.w).toBeLessThanOrEqual(COLS);
    expect(it.y).toBeGreaterThanOrEqual(0);
  }
}

describe('updateItem', () => {
  it('moves an item onto a free cell without disturbing others', () => {
    const next = updateItem(base, 'a', { x: 8, y: 0 }, sizeOf);
    expect(next.find((it) => it.i === 'a')).toMatchObject({ x: 8, y: 0, w: 4, h: 2 });
    expect(next.find((it) => it.i === 'b')).toMatchObject({ x: 4, y: 0 });
    assertNoOverlaps(next);
  });

  it('pushes a colliding item down instead of overlapping it', () => {
    // Drop 'a' on top of 'b' (same row): 'b' must move below it.
    const next = updateItem(base, 'a', { x: 4, y: 0 }, sizeOf);
    const b = next.find((it) => it.i === 'b')!;
    expect(b.y).toBeGreaterThanOrEqual(2);
    assertNoOverlaps(next);
    assertInBounds(next);
  });

  it('compacts upward after a move frees space', () => {
    // 'c' sits under 'a'. Moving 'a' sideways frees the columns below it,
    // so 'c' should be pulled up into the hole.
    const stacked: Item[] = [
      { i: 'a', x: 0, y: 0, w: 4, h: 2 },
      { i: 'c', x: 0, y: 2, w: 4, h: 2 },
    ];
    const next = updateItem(stacked, 'a', { x: 4, y: 0 }, sizeOf);
    expect(next.find((it) => it.i === 'c')!.y).toBe(0);
    assertNoOverlaps(next);
  });

  it('clamps x so an item never leaves the grid', () => {
    const next = updateItem(base, 'a', { x: 11 }, sizeOf);
    const a = next.find((it) => it.i === 'a')!;
    expect(a.x + a.w).toBeLessThanOrEqual(COLS);
  });

  it('resizes and respects the minimum size', () => {
    const grown = updateItem(base, 'a', { w: 6, h: 3 }, sizeOf);
    expect(grown.find((it) => it.i === 'a')).toMatchObject({ w: 6, h: 3 });
    assertNoOverlaps(grown);

    const min3x2: SizeOf = () => ({ minW: 3, minH: 2 });
    const shrunk = updateItem(base, 'a', { w: 0, h: 0 }, min3x2);
    expect(shrunk.find((it) => it.i === 'a')).toMatchObject({ w: 3, h: 2 });
  });

  it('pushes items down when a resize grows into them', () => {
    const next = updateItem(base, 'a', { h: 5 }, sizeOf);
    expect(next.find((it) => it.i === 'c')!.y).toBeGreaterThanOrEqual(5);
    assertNoOverlaps(next);
  });

  it('never produces overlaps for a random sequence of edits', () => {
    let items = base;
    let seed = 7;
    const rnd = (n: number) => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed % n;
    };
    const ids = ['a', 'b', 'c'];
    for (let step = 0; step < 300; step++) {
      const id = ids[rnd(ids.length)];
      const op = rnd(2);
      items =
        op === 0
          ? updateItem(items, id, { x: rnd(COLS), y: rnd(8) }, sizeOf)
          : updateItem(items, id, { w: 1 + rnd(COLS), h: 1 + rnd(6) }, sizeOf);
      assertNoOverlaps(items);
      assertInBounds(items);
    }
  });

  it('does not mutate its input', () => {
    const snapshot = JSON.stringify(base);
    updateItem(base, 'a', { x: 6, y: 0 }, sizeOf);
    expect(JSON.stringify(base)).toBe(snapshot);
  });
});

describe('compact', () => {
  it('leaves an already compact layout unchanged', () => {
    const sorted = compact(base);
    expect(sorted.map((it) => [it.i, it.x, it.y])).toEqual(base.map((it) => [it.i, it.x, it.y]));
  });

  it('pulls a floating item up to the top', () => {
    const out = compact([{ i: 'z', x: 0, y: 7, w: 2, h: 2 }]);
    expect(out[0].y).toBe(0);
  });
});

describe('isValidLayout', () => {
  const ids = ['a', 'b', 'c'];

  it('accepts a valid layout', () => {
    expect(isValidLayout(base, ids, sizeOf)).toBe(true);
  });

  it('rejects overlapping items', () => {
    const bad = [...base, { i: 'x', x: 0, y: 0, w: 2, h: 2 }];
    expect(isValidLayout(bad, [...ids, 'x'], sizeOf)).toBe(false);
  });

  it('rejects unknown or missing ids', () => {
    expect(isValidLayout(base.slice(0, 2), ids, sizeOf)).toBe(false);
    expect(isValidLayout(base.map((it) => ({ ...it, i: 'q' })), ids, sizeOf)).toBe(false);
  });

  it('rejects out-of-bounds or fractional coordinates', () => {
    expect(isValidLayout([{ i: 'a', x: 10, y: 0, w: 4, h: 2 }, base[1], base[2]], ids, sizeOf)).toBe(false);
    expect(isValidLayout([{ ...base[0], x: 0.5 }, base[1], base[2]], ids, sizeOf)).toBe(false);
  });

  it('rejects non-arrays and junk', () => {
    expect(isValidLayout(null, ids, sizeOf)).toBe(false);
    expect(isValidLayout('layout', ids, sizeOf)).toBe(false);
    expect(isValidLayout([null, null, null], ids, sizeOf)).toBe(false);
  });
});
