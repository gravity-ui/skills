import { describe, expect, it } from 'vitest';

import type { Order } from './types';
import { groupOrdersByStatus, moveColumn, ordersToCsv, pluralize, shiftColumn } from './utils';

const order = ['a', 'b', 'c', 'd'];

describe('moveColumn', () => {
  it('moves a column before another one', () => {
    expect(moveColumn(order, 'd', 'b', 'before')).toEqual(['a', 'd', 'b', 'c']);
  });
  it('moves a column after another one', () => {
    expect(moveColumn(order, 'a', 'c', 'after')).toEqual(['b', 'c', 'a', 'd']);
  });
  it('returns the same array for no-op moves and unknown ids', () => {
    expect(moveColumn(order, 'a', 'a', 'before')).toBe(order);
    expect(moveColumn(order, 'a', 'b', 'before')).toBe(order);
    expect(moveColumn(order, 'b', 'a', 'after')).toBe(order);
    expect(moveColumn(order, 'x', 'a', 'after')).toBe(order);
  });
});

describe('shiftColumn', () => {
  it('shifts left and right', () => {
    expect(shiftColumn(order, 'c', -1)).toEqual(['a', 'c', 'b', 'd']);
    expect(shiftColumn(order, 'c', 1)).toEqual(['a', 'b', 'd', 'c']);
  });
  it('does nothing at the edges', () => {
    expect(shiftColumn(order, 'a', -1)).toBe(order);
    expect(shiftColumn(order, 'd', 1)).toBe(order);
  });
});

const mk = (id: string, status: Order['status'], total: number): Order => ({
  id,
  status,
  total,
  customer: 'Иван',
  city: 'Казань',
  createdAt: '2026-11-01T10:00:00.000Z',
  itemsCount: 1,
  payment: 'СБП',
});

describe('groupOrdersByStatus', () => {
  it('groups in canonical status order, skipping empty statuses and summing totals', () => {
    const groups = groupOrdersByStatus([
      mk('1', 'delivered', 100),
      mk('2', 'new', 50),
      mk('3', 'delivered', 25),
    ]);
    expect(groups.map((g) => g.status)).toEqual(['new', 'delivered']);
    expect(groups[1].orders.map((o) => o.id)).toEqual(['1', '3']);
    expect(groups[1].total).toBe(125);
  });
});

describe('pluralize', () => {
  it('picks russian plural forms', () => {
    const forms: [string, string, string] = ['заказ', 'заказа', 'заказов'];
    expect([1, 2, 5, 11, 21, 22, 112].map((n) => pluralize(n, forms))).toEqual([
      'заказ', 'заказа', 'заказов', 'заказов', 'заказ', 'заказа', 'заказов',
    ]);
  });
});

describe('ordersToCsv', () => {
  it('escapes cells containing separators and quotes', () => {
    const csv = ordersToCsv([{ ...mk('1', 'new', 10), customer: 'ООО "Ромашка"; Иван' }]);
    expect(csv.split('\n')[1]).toContain('"ООО ""Ромашка""; Иван"');
  });
});
