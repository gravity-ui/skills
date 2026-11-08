import { describe, expect, it } from 'vitest';
import { addItem, collides, compact, isValidLayout, moveItem, removeItem, resizeItem, type Item } from './layout';

const base = (): Item[] => [
  { id: 'a', x: 0, y: 0, w: 6, h: 2 },
  { id: 'b', x: 6, y: 0, w: 6, h: 2 },
  { id: 'c', x: 0, y: 2, w: 12, h: 3 },
];
const noOverlaps = (l: Item[]) => l.every((a) => l.every((b) => !collides(a, b)));
const get = (l: Item[], id: string) => l.find((i) => i.id === id)!;

describe('layout', () => {
  it('compact is idempotent on a settled layout', () => {
    expect(compact(base())).toEqual(base());
  });

  it('moving onto another widget pushes it down without overlaps', () => {
    const next = moveItem(base(), 'b', 0, 0);
    expect(noOverlaps(next)).toBe(true);
    expect(get(next, 'b')).toMatchObject({ x: 0, y: 0 });
    expect(get(next, 'a').y).toBeGreaterThanOrEqual(2);
  });

  it('clamps to grid bounds and falls up into free space', () => {
    const next = moveItem(base(), 'a', 99, 50);
    expect(get(next, 'a').x).toBe(6);
    expect(noOverlaps(next)).toBe(true);
    expect(Math.max(...next.map((i) => i.y + i.h))).toBeLessThan(12);
  });

  it('resize respects limits and grid width', () => {
    const limits = { minW: 3, minH: 2, maxW: 8 };
    expect(get(resizeItem(base(), 'b', 20, 4, limits), 'b')).toMatchObject({ w: 6, h: 4 });
    expect(get(resizeItem(base(), 'a', 1, 1, limits), 'a')).toMatchObject({ w: 3, h: 2 });
    expect(noOverlaps(resizeItem(base(), 'a', 8, 5, limits))).toBe(true);
  });

  it('add finds a free spot, remove closes the gap', () => {
    const added = addItem(base(), { id: 'd', w: 4, h: 2 });
    expect(noOverlaps(added)).toBe(true);
    expect(get(added, 'd').y).toBe(5);
    expect(get(removeItem(base(), 'a'), 'c').y).toBe(2); // b всё ещё над c
    expect(get(removeItem(removeItem(base(), 'a'), 'b'), 'c').y).toBe(0);
  });

  it('validates stored layouts', () => {
    expect(isValidLayout(base(), ['a', 'b', 'c'])).toBe(true);
    expect(isValidLayout(base(), ['a', 'b'])).toBe(false);
    expect(isValidLayout([{ id: 'a', x: 8, y: 0, w: 6, h: 2 }], ['a'])).toBe(false);
    expect(isValidLayout([...base(), { id: 'a', x: 0, y: 9, w: 1, h: 1 }], ['a', 'b', 'c'])).toBe(false);
    expect(isValidLayout('nope', ['a'])).toBe(false);
  });
});
