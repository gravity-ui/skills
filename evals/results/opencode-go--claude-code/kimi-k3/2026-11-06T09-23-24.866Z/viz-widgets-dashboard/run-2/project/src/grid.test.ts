import { describe, expect, it } from 'vitest';
import { collides, compact, resolveLayout, type GridItem } from './grid';

const item = (id: string, x: number, y: number, w: number, h: number): GridItem => ({ id, x, y, w, h });

function expectNoOverlaps(items: GridItem[]) {
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      expect(collides(items[i], items[j])).toBe(false);
    }
  }
}

describe('collides', () => {
  it('detects overlap and separation', () => {
    expect(collides(item('a', 0, 0, 6, 2), item('b', 3, 1, 6, 2))).toBe(true);
    expect(collides(item('a', 0, 0, 6, 2), item('b', 6, 0, 6, 2))).toBe(false);
    expect(collides(item('a', 0, 0, 6, 2), item('b', 0, 2, 6, 2))).toBe(false);
    expect(collides(item('a', 0, 0, 6, 2), item('a', 0, 0, 6, 2))).toBe(false);
  });
});

describe('compact', () => {
  it('pulls items up to the highest free slot', () => {
    const out = compact([item('a', 0, 5, 6, 2)]);
    expect(out.find((i) => i.id === 'a')?.y).toBe(0);
  });

  it('stacks items that share columns', () => {
    const out = compact([item('a', 0, 0, 6, 2), item('b', 0, 9, 6, 2), item('c', 6, 7, 6, 2)]);
    expect(out.find((i) => i.id === 'b')?.y).toBe(2);
    expect(out.find((i) => i.id === 'c')?.y).toBe(0);
    expectNoOverlaps(out);
  });

  it('never produces overlaps on a messy layout', () => {
    const out = compact([
      item('a', 0, 0, 12, 2),
      item('b', 0, 2, 6, 4),
      item('c', 6, 2, 6, 4),
      item('d', 3, 4, 6, 3),
      item('e', 0, 20, 4, 2),
    ]);
    expectNoOverlaps(out);
  });
});

describe('resolveLayout', () => {
  it('pushes a blocking item down when the dragged item is above it', () => {
    const base = [item('a', 0, 0, 6, 2), item('b', 0, 2, 6, 2)];
    const out = resolveLayout(base, item('a', 0, 2, 6, 2));
    const b = out.find((i) => i.id === 'b');
    expect(b?.y).toBe(4);
    expectNoOverlaps(out);
  });

  it('swaps when the dragged item comes from below and there is no room above', () => {
    const base = [item('a', 0, 0, 6, 2), item('b', 0, 4, 6, 2)];
    const out = resolveLayout(base, item('b', 0, 1, 6, 2));
    expect(out.find((i) => i.id === 'b')?.y).toBe(1);
    expect(out.find((i) => i.id === 'a')?.y).toBe(3);
    expectNoOverlaps(out);
  });

  it('swaps the blocking item up when the dragged item comes from above', () => {
    const base = [item('a', 0, 0, 12, 2), item('b', 0, 2, 12, 2), item('c', 0, 4, 12, 2)];
    const out = resolveLayout(base, item('a', 0, 3, 12, 2));
    expectNoOverlaps(out);
    const ys = Object.fromEntries(out.map((i) => [i.id, i.y]));
    expect(ys.a).toBe(3);
    expect(ys.b).toBe(1);
    expect(ys.c).toBe(5);
    // …and compaction on drop finishes the swap
    const packed = compact(out);
    const py = Object.fromEntries(packed.map((i) => [i.id, i.y]));
    expect(py.b).toBe(0);
    expect(py.a).toBe(2);
    expect(py.c).toBe(4);
  });

  it('keeps the dragged item at its proposed position', () => {
    const base = [item('a', 0, 0, 6, 2), item('b', 6, 0, 6, 2)];
    const out = resolveLayout(base, item('b', 0, 0, 6, 4));
    const b = out.find((i) => i.id === 'b');
    expect(b?.x).toBe(0);
    expect(b?.y).toBe(0);
    expectNoOverlaps(out);
  });
});
