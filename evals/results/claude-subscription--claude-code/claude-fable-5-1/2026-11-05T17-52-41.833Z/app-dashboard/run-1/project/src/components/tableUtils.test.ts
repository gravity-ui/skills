import { describe, expect, it } from 'vitest';

import { generateOrders } from '../data/orders';
import { filterOrders, groupByStatus, reorderColumns } from './tableUtils';

describe('reorderColumns', () => {
  const order = ['a', 'b', 'c', 'd'];

  it('moves a column forward to the target position', () => {
    expect(reorderColumns(order, 'a', 'c')).toEqual(['b', 'c', 'a', 'd']);
  });

  it('moves a column backward to the target position', () => {
    expect(reorderColumns(order, 'd', 'b')).toEqual(['a', 'd', 'b', 'c']);
  });

  it('returns the same order for a no-op or unknown ids', () => {
    expect(reorderColumns(order, 'b', 'b')).toBe(order);
    expect(reorderColumns(order, 'x', 'b')).toBe(order);
  });
});

describe('groupByStatus', () => {
  it('groups orders in canonical status order and sums amounts', () => {
    const orders = generateOrders(40);
    const groups = groupByStatus(orders);
    const statuses = groups.map((g) => g.status);
    expect(statuses).toEqual([...statuses].sort((a, b) => ['new', 'processing', 'shipped', 'delivered', 'cancelled'].indexOf(a) - ['new', 'processing', 'shipped', 'delivered', 'cancelled'].indexOf(b)));
    expect(groups.reduce((n, g) => n + g.orders.length, 0)).toBe(orders.length);
    for (const g of groups) {
      expect(g.orders.every((o) => o.status === g.status)).toBe(true);
      expect(g.total).toBe(g.orders.reduce((s, o) => s + o.amount, 0));
    }
  });

  it('omits empty groups', () => {
    expect(groupByStatus([])).toEqual([]);
  });
});

describe('filterOrders', () => {
  it('matches id, customer, email and city case-insensitively', () => {
    const orders = generateOrders(20);
    expect(filterOrders(orders, '')).toBe(orders);
    expect(filterOrders(orders, orders[0].id.toLowerCase())).toContain(orders[0]);
    expect(filterOrders(orders, 'москва').every((o) => o.city === 'Москва')).toBe(true);
    expect(filterOrders(orders, 'нет такого')).toEqual([]);
  });
});
