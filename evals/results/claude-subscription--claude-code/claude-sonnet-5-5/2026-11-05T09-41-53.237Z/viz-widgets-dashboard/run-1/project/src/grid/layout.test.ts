import { describe, expect, it } from 'vitest';
import {
  appendItem,
  collides,
  compact,
  moveItem,
  parseLayout,
  resizeItem,
  type GridItem,
  type Layout,
} from './layout';

const COLS = 12;
const item = (id: string, x: number, y: number, w: number, h: number): GridItem => ({
  id,
  x,
  y,
  w,
  h,
});

function expectNoOverlap(layout: Layout) {
  for (const a of layout) for (const b of layout) expect(collides(a, b)).toBe(false);
}
const get = (layout: Layout, id: string) => layout.find((i) => i.id === id)!;

describe('compact', () => {
  it('pulls floating items up', () => {
    const out = compact([item('a', 0, 5, 3, 2), item('b', 6, 9, 3, 2)]);
    expect(get(out, 'a').y).toBe(0);
    expect(get(out, 'b').y).toBe(0);
  });

  it('stacks items that share columns', () => {
    const out = compact([item('a', 0, 0, 4, 2), item('b', 0, 7, 4, 2)]);
    expect(get(out, 'b').y).toBe(2);
  });

  it('keeps the pinned item where it is', () => {
    const out = compact([item('a', 0, 4, 3, 2), item('b', 0, 8, 3, 2), item('c', 6, 8, 3, 2)], 'a');
    expect(get(out, 'a').y).toBe(4);
    expect(get(out, 'b').y).toBe(6); // rests on the pinned item
    expect(get(out, 'c').y).toBe(0); // free column: slides to the top
  });
});

describe('moveItem', () => {
  it('pushes overlapped items down and leaves no overlap', () => {
    const base = [item('a', 0, 0, 4, 2), item('b', 4, 0, 4, 2), item('c', 0, 2, 4, 2)];
    const out = moveItem(base, 'b', 0, 0, COLS);
    expectNoOverlap(out);
    expect(get(out, 'b')).toMatchObject({ x: 0, y: 0 });
    expect(get(out, 'a').y).toBeGreaterThanOrEqual(2);
  });

  it('cascades pushes through a column', () => {
    const base = [item('a', 0, 0, 4, 2), item('b', 0, 2, 4, 2), item('c', 6, 0, 4, 2)];
    const out = moveItem(base, 'c', 0, 0, COLS);
    expectNoOverlap(out);
    expect(get(out, 'a').y).toBe(2);
    expect(get(out, 'b').y).toBe(4);
  });

  it('clamps to the grid', () => {
    const out = moveItem([item('a', 0, 0, 4, 2)], 'a', 99, -5, COLS);
    expect(get(out, 'a')).toMatchObject({ x: COLS - 4, y: 0 });
  });

  it('does not mutate its input', () => {
    const base = [item('a', 0, 0, 4, 2), item('b', 4, 0, 4, 2)];
    const snapshot = JSON.stringify(base);
    moveItem(base, 'b', 0, 0, COLS);
    expect(JSON.stringify(base)).toBe(snapshot);
  });

  it('ignores unknown ids', () => {
    const base = [item('a', 0, 0, 4, 2)];
    expect(moveItem(base, 'zzz', 1, 1, COLS)).toBe(base);
  });
});

describe('resizeItem', () => {
  it('respects minimum size and grid edge', () => {
    const base: Layout = [{ ...item('a', 8, 0, 2, 2), minW: 2, minH: 2 }];
    const out = resizeItem(base, 'a', 1, 1, COLS);
    expect(get(out, 'a')).toMatchObject({ w: 2, h: 2 });
    const wide = resizeItem(base, 'a', 10, 2, COLS);
    expect(get(wide, 'a').w).toBe(COLS - 8);
  });

  it('pushes neighbours below when growing', () => {
    const base = [item('a', 0, 0, 4, 2), item('b', 0, 2, 4, 2)];
    const out = resizeItem(base, 'a', 4, 4, COLS);
    expectNoOverlap(out);
    expect(get(out, 'b').y).toBe(4);
  });
});

describe('appendItem', () => {
  it('goes below everything else', () => {
    const out = appendItem([item('a', 0, 0, 4, 3)], { id: 'n', w: 4, h: 2 }, COLS);
    expect(get(out, 'n')).toMatchObject({ x: 0, y: 3 });
  });
});

describe('parseLayout', () => {
  const known = new Map(['a', 'b'].map((id) => [id, { ...item(id, 0, 0, 4, 2), minW: 2 }]));

  it('rejects non-arrays and garbage', () => {
    expect(parseLayout(null, known, COLS)).toBeNull();
    expect(parseLayout([{ id: 'nope' }], known, COLS)).toBeNull();
  });

  it('accepts an empty dashboard', () => {
    expect(parseLayout([], known, COLS)).toEqual([]);
  });

  it('drops unknown/duplicate ids and de-overlaps', () => {
    const out = parseLayout(
      [
        { id: 'a', x: 0, y: 0, w: 4, h: 2 },
        { id: 'a', x: 5, y: 5, w: 1, h: 1 },
        { id: 'b', x: 0, y: 0, w: 4, h: 2 },
        { id: 'ghost', x: 0, y: 0, w: 1, h: 1 },
      ],
      known,
      COLS,
    )!;
    expect(out.map((i) => i.id).sort()).toEqual(['a', 'b']);
    expectNoOverlap(out);
  });
});
