import { describe, expect, it } from 'vitest';
import { moveColumn, restoreColumnOrder } from './columnOrder';

const order = ['a', 'b', 'c', 'd'];

describe('moveColumn', () => {
  it('moves a column before another', () => {
    expect(moveColumn(order, 'd', 'b', 'before')).toEqual(['a', 'd', 'b', 'c']);
  });
  it('moves a column after another', () => {
    expect(moveColumn(order, 'a', 'c', 'after')).toEqual(['b', 'c', 'a', 'd']);
  });
  it('moves to the very end and very start', () => {
    expect(moveColumn(order, 'a', 'd', 'after')).toEqual(['b', 'c', 'd', 'a']);
    expect(moveColumn(order, 'd', 'a', 'before')).toEqual(['d', 'a', 'b', 'c']);
  });
  it('returns the same array for no-op drops', () => {
    expect(moveColumn(order, 'b', 'b', 'before')).toBe(order);
    expect(moveColumn(order, 'x', 'b', 'before')).toBe(order);
  });
});

describe('restoreColumnOrder', () => {
  it('keeps saved sequence and appends new columns', () => {
    expect(restoreColumnOrder(['c', 'a'], order)).toEqual(['c', 'a', 'b', 'd']);
  });
  it('drops unknown ids and duplicates', () => {
    expect(restoreColumnOrder(['zzz', 'b', 'b'], order)).toEqual(['b', 'a', 'c', 'd']);
  });
  it('falls back to defaults for garbage', () => {
    expect(restoreColumnOrder('nope', order)).toBe(order);
    expect(restoreColumnOrder(null, order)).toBe(order);
  });
});
