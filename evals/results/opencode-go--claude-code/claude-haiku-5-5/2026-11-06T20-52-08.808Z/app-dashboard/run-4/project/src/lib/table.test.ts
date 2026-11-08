import { describe, expect, it } from 'vitest';
import type { Order, OrderStatus } from '../data/orders';
import {
  groupByStatus,
  moveItem,
  selectRange,
  selectionState,
  setIds,
  shiftItem,
} from './table';

const makeOrder = (id: string, status: OrderStatus): Order => ({
  id,
  customer: 'Test',
  city: 'Test',
  items: 1,
  amount: 100,
  status,
  createdAt: new Date(0),
});

describe('moveItem', () => {
  it('moves an item to the left of its target', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 'd', 'b')).toEqual(['a', 'd', 'b', 'c']);
  });

  it('moves an item to the right of its target', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 'a', 'c')).toEqual(['b', 'c', 'a', 'd']);
  });

  it('returns a copy when item equals target or is unknown', () => {
    const items = ['a', 'b'];
    expect(moveItem(items, 'a', 'a')).toEqual(['a', 'b']);
    expect(moveItem(items, 'x', 'a')).toEqual(['a', 'b']);
    expect(moveItem(items, 'a', 'x')).toEqual(['a', 'b']);
  });
});

describe('shiftItem', () => {
  it('swaps with the neighbour in either direction', () => {
    expect(shiftItem(['a', 'b', 'c'], 'b', 1)).toEqual(['a', 'c', 'b']);
    expect(shiftItem(['a', 'b', 'c'], 'b', -1)).toEqual(['b', 'a', 'c']);
  });

  it('does nothing at the edges', () => {
    expect(shiftItem(['a', 'b', 'c'], 'a', -1)).toEqual(['a', 'b', 'c']);
    expect(shiftItem(['a', 'b', 'c'], 'c', 1)).toEqual(['a', 'b', 'c']);
  });
});

describe('groupByStatus', () => {
  it('orders groups by the given status order and drops empty groups', () => {
    const orders = [
      makeOrder('#1', 'delivered'),
      makeOrder('#2', 'new'),
      makeOrder('#3', 'delivered'),
    ];
    const groups = groupByStatus(orders, ['new', 'processing', 'delivered']);
    expect(groups.map((g) => g.status)).toEqual(['new', 'delivered']);
    expect(groups[1].orders.map((o) => o.id)).toEqual(['#1', '#3']);
  });
});

describe('selectionState', () => {
  const ids = ['1', '2', '3'];
  it('reports none, some and all', () => {
    expect(selectionState(new Set(), ids)).toBe('none');
    expect(selectionState(new Set(['2']), ids)).toBe('some');
    expect(selectionState(new Set(ids), ids)).toBe('all');
  });

  it('reports none for an empty list', () => {
    expect(selectionState(new Set(['1']), [])).toBe('none');
  });
});

describe('setIds', () => {
  it('adds and removes ids without mutating the input', () => {
    const base = new Set(['1']);
    const added = setIds(base, ['2', '3'], true);
    expect([...added].sort()).toEqual(['1', '2', '3']);
    expect([...setIds(added, ['1'], false)].sort()).toEqual(['2', '3']);
    expect([...base]).toEqual(['1']);
  });
});

describe('selectRange', () => {
  const visible = ['a', 'b', 'c', 'd', 'e'];

  it('selects the inclusive range from anchor to target, in either direction', () => {
    expect([...selectRange(new Set(), visible, 'b', 'd', true)].sort()).toEqual(['b', 'c', 'd']);
    expect([...selectRange(new Set(), visible, 'd', 'b', true)].sort()).toEqual(['b', 'c', 'd']);
  });

  it('deselects the range when on is false', () => {
    const selected = new Set(visible);
    expect([...selectRange(selected, visible, 'a', 'c', false)].sort()).toEqual(['d', 'e']);
  });

  it('falls back to the target alone when the anchor is not visible', () => {
    expect([...selectRange(new Set(), visible, 'zzz', 'c', true)]).toEqual(['c']);
  });
});
