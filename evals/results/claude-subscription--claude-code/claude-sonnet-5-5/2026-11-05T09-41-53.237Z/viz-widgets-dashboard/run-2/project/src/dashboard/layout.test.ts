import { describe, expect, it } from 'vitest';
import { addItem, collides, compact, moveItem, normalize, resizeItem, type Item, type Layout } from './layout';

const it_ = (id: string, x: number, y: number, w = 3, h = 2): Item => ({ id, x, y, w, h, minW: 2, minH: 1 });
const noOverlap = (l: Layout) => l.every((a) => l.every((b) => !collides(a, b)));
const get = (l: Layout, id: string) => l.find((i) => i.id === id)!;

describe('layout', () => {
  it('pushes overlapped items down when moving onto them', () => {
    const l = [it_('a', 0, 0), it_('b', 3, 0)];
    const next = moveItem(l, 'a', 3, 0, 12, false);
    expect(get(next, 'a')).toMatchObject({ x: 3, y: 0 });
    expect(get(next, 'b').y).toBe(2);
    expect(noOverlap(next)).toBe(true);
  });

  it('pushes whole chains', () => {
    const l = [it_('a', 0, 0), it_('b', 0, 2), it_('c', 0, 4), it_('d', 6, 0)];
    const next = moveItem(l, 'd', 0, 0, 12, false);
    expect(noOverlap(next)).toBe(true);
    expect(get(next, 'a').y).toBe(2);
    expect(get(next, 'b').y).toBe(4);
    expect(get(next, 'c').y).toBe(6);
  });

  it('clamps to the grid', () => {
    const next = moveItem([it_('a', 0, 0)], 'a', 50, -4, 12, false);
    expect(get(next, 'a')).toMatchObject({ x: 9, y: 0 });
  });

  it('leaves gaps without gravity and closes them with it', () => {
    const l = [it_('a', 0, 0), it_('b', 0, 2)];
    expect(get(moveItem(l, 'b', 0, 10, 12, false), 'b').y).toBe(10);
    expect(get(moveItem(l, 'b', 0, 10, 12, true), 'b').y).toBe(2);
  });

  it('compact lifts items into free space', () => {
    expect(get(compact([it_('a', 0, 5)]), 'a').y).toBe(0);
  });

  it('resize respects min size and the right edge, and pushes neighbours', () => {
    const l = [it_('a', 0, 0), it_('b', 0, 2)];
    const next = resizeItem(l, 'a', 99, 0, 12, false);
    expect(get(next, 'a')).toMatchObject({ w: 12, h: 1 });
    expect(resizeItem(l, 'a', 0, 4, 12, false)).toSatisfy((r: Layout) => get(r, 'a').w === 2);
    expect(get(resizeItem(l, 'a', 3, 4, 12, false), 'b').y).toBe(4);
  });

  it('addItem finds the first free spot', () => {
    const l = [it_('a', 0, 0, 12, 2)];
    expect(get(addItem(l, it_('n', 0, 0), 12), 'n')).toMatchObject({ x: 0, y: 2 });
    const l2 = [it_('a', 0, 0, 3, 2)];
    expect(get(addItem(l2, it_('n', 0, 0), 12), 'n')).toMatchObject({ x: 3, y: 0 });
  });

  it('normalize repairs out-of-bounds and overlapping saved layouts', () => {
    const fixed = normalize([it_('a', 0, 0), it_('b', 0, 0), it_('c', 40, 0)], 12);
    expect(noOverlap(fixed)).toBe(true);
    expect(fixed.every((i) => i.x >= 0 && i.x + i.w <= 12)).toBe(true);
  });
});
