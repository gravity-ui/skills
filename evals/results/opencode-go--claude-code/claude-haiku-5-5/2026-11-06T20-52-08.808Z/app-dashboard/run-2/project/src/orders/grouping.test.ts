import { describe, expect, it } from 'vitest';
import { groupOrdersByStatus, moveItem } from './grouping';
import type { Order, OrderStatus } from './types';

function order(id: string, status: OrderStatus): Order {
  return {
    id,
    customer: 'Test',
    email: 'test@example.com',
    city: 'Москва',
    createdAt: new Date(0),
    status,
    itemsCount: 1,
    total: 100,
  };
}

describe('groupOrdersByStatus', () => {
  it('groups in canonical status order and keeps input order inside a group', () => {
    const groups = groupOrdersByStatus([
      order('1', 'delivered'),
      order('2', 'new'),
      order('3', 'delivered'),
      order('4', 'cancelled'),
    ]);

    expect(groups.map((g) => g.status)).toEqual(['new', 'delivered', 'cancelled']);
    expect(groups[1].orders.map((o) => o.id)).toEqual(['1', '3']);
  });

  it('omits statuses without orders', () => {
    expect(groupOrdersByStatus([order('1', 'shipped')])).toEqual([
      { status: 'shipped', orders: [expect.objectContaining({ id: '1' })] },
    ]);
  });

  it('returns no groups for an empty list', () => {
    expect(groupOrdersByStatus([])).toEqual([]);
  });
});

describe('moveItem', () => {
  it('moves an item to the right, placing it at the target position', () => {
    expect(moveItem(['a', 'b', 'c'], 'a', 'c')).toEqual(['b', 'c', 'a']);
  });

  it('moves an item to the left', () => {
    expect(moveItem(['a', 'b', 'c'], 'c', 'a')).toEqual(['c', 'a', 'b']);
  });

  it('returns the same array when source and target are equal or missing', () => {
    const items = ['a', 'b'];
    expect(moveItem(items, 'a', 'a')).toBe(items);
    expect(moveItem(items, 'x', 'a')).toBe(items);
  });

  it('does not mutate the input', () => {
    const items = ['a', 'b', 'c'];
    moveItem(items, 'a', 'b');
    expect(items).toEqual(['a', 'b', 'c']);
  });
});
