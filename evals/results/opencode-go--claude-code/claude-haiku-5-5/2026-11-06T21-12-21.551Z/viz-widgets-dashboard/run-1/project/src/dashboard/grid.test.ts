import { describe, expect, it } from 'vitest';
import {
  COLS,
  applyChange,
  collides,
  hasOverlap,
  parseStoredLayout,
  stackLayout,
  type Layout,
} from './grid';

const base: Layout = [
  { id: 'a', x: 0, y: 0, w: 4, h: 2 },
  { id: 'b', x: 4, y: 0, w: 4, h: 2 },
  { id: 'c', x: 0, y: 2, w: 12, h: 3 },
];

const byId = (layout: Layout, id: string) => layout.find((i) => i.id === id)!;

describe('applyChange', () => {
  it('places the moved item exactly where requested', () => {
    const next = applyChange(base, 'a', { x: 8, y: 0 });
    expect(byId(next, 'a')).toMatchObject({ x: 8, y: 0, w: 4, h: 2 });
  });

  it('pushes colliding items down instead of overlapping', () => {
    // Move 'a' onto 'b': 'b' must go below the moved block.
    const next = applyChange(base, 'a', { x: 4, y: 0 });
    expect(hasOverlap(next)).toBe(false);
    expect(byId(next, 'a')).toMatchObject({ x: 4, y: 0 });
    expect(byId(next, 'b').y).toBeGreaterThanOrEqual(2);
  });

  it('floats items up into freed space', () => {
    // 'b' sits under 'a'; moving 'a' away far down should let 'b' rise to the top.
    const stacked: Layout = [
      { id: 'a', x: 0, y: 0, w: 4, h: 2 },
      { id: 'b', x: 0, y: 2, w: 4, h: 2 },
    ];
    const next = applyChange(stacked, 'a', { y: 10 });
    expect(hasOverlap(next)).toBe(false);
    expect(byId(next, 'b').y).toBe(0);
    expect(byId(next, 'a').y).toBe(10);
  });

  it('does not float a full-width item through a block that still occupies its rows', () => {
    const next = applyChange(base, 'a', { y: 10 });
    expect(hasOverlap(next)).toBe(false);
    expect(byId(next, 'c').y).toBe(2); // blocked by 'b' in rows 0-1
  });

  it('keeps the moved item inside the column bounds', () => {
    const next = applyChange(base, 'b', { x: 11, y: -3 });
    const b = byId(next, 'b');
    expect(b.x + b.w).toBeLessThanOrEqual(COLS);
    expect(b.y).toBe(0);
  });

  it('clamps a resize that would overflow the right edge', () => {
    const next = applyChange(base, 'b', { w: 20 });
    const b = byId(next, 'b');
    expect(b.w).toBe(COLS);
    expect(b.x).toBe(0);
  });

  it('never mutates the input and keeps item order', () => {
    const snapshot = JSON.stringify(base);
    const next = applyChange(base, 'c', { x: 0, y: 0, w: 6 });
    expect(JSON.stringify(base)).toBe(snapshot);
    expect(next.map((i) => i.id)).toEqual(['a', 'b', 'c']);
  });

  it('returns the same layout for an unknown id', () => {
    expect(applyChange(base, 'missing', { x: 1 })).toBe(base);
  });

  it('keeps any arrangement overlap-free across many random moves', () => {
    let seed = 42;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    let layout: Layout = base;
    for (let step = 0; step < 300; step += 1) {
      const item = layout[Math.floor(rnd() * layout.length)];
      layout = applyChange(layout, item.id, {
        x: Math.floor(rnd() * COLS),
        y: Math.floor(rnd() * 8),
        w: 1 + Math.floor(rnd() * 8),
        h: 1 + Math.floor(rnd() * 4),
      });
      expect(hasOverlap(layout)).toBe(false);
      for (const i of layout) {
        expect(i.x + i.w).toBeLessThanOrEqual(COLS);
        expect(i.y).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

describe('stackLayout', () => {
  it('stacks every widget full-width in reading order without overlap', () => {
    const stacked = stackLayout(base);
    expect(stacked.every((i) => i.x === 0 && i.w === COLS)).toBe(true);
    expect(hasOverlap(stacked)).toBe(false);
    expect(stacked.map((i) => i.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('parseStoredLayout', () => {
  it('returns defaults when nothing is stored', () => {
    expect(parseStoredLayout(null, base)).toBe(base);
  });

  it('returns defaults for broken JSON or wrong shape', () => {
    expect(parseStoredLayout('{not json', base)).toBe(base);
    expect(parseStoredLayout('{"a":1}', base)).toBe(base);
  });

  it('restores a valid saved layout', () => {
    const saved = applyChange(base, 'a', { x: 8 });
    expect(parseStoredLayout(JSON.stringify(saved), base)).toEqual(saved);
  });

  it('rejects a layout that is missing a widget', () => {
    const partial = base.filter((i) => i.id !== 'c');
    expect(parseStoredLayout(JSON.stringify(partial), base)).toBe(base);
  });

  it('rejects out-of-bounds or overlapping saved cells', () => {
    const outOfBounds = base.map((i) => (i.id === 'a' ? { ...i, x: 10 } : i));
    const overlapping = base.map((i) => (i.id === 'b' ? { ...i, x: 0, y: 0 } : i));
    expect(parseStoredLayout(JSON.stringify(outOfBounds), base)).toBe(base);
    expect(parseStoredLayout(JSON.stringify(overlapping), base)).toBe(base);
  });
});

describe('collides', () => {
  it('treats touching edges as non-overlapping', () => {
    expect(collides({ x: 0, y: 0, w: 2, h: 2 }, { x: 2, y: 0, w: 2, h: 2 })).toBe(false);
    expect(collides({ x: 0, y: 0, w: 2, h: 2 }, { x: 1, y: 1, w: 2, h: 2 })).toBe(true);
  });
});
