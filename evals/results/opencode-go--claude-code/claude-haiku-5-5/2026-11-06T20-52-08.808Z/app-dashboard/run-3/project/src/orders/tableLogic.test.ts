import { describe, expect, it } from 'vitest';
import { ORDER_STATUSES } from './model';
import { generateOrders } from './mockOrders';
import { checkState, groupByStatus, moveItem, setIds, toggleId } from './tableLogic';

describe('moveItem', () => {
  it('moves an item right so it lands after the target', () => {
    expect(moveItem(['a', 'b', 'c'], 'a', 'c')).toEqual(['b', 'c', 'a']);
  });

  it('moves an item left so it lands before the target', () => {
    expect(moveItem(['a', 'b', 'c'], 'c', 'a')).toEqual(['c', 'a', 'b']);
  });

  it('swaps neighbours in both directions', () => {
    expect(moveItem(['a', 'b', 'c'], 'a', 'b')).toEqual(['b', 'a', 'c']);
    expect(moveItem(['a', 'b', 'c'], 'b', 'a')).toEqual(['b', 'a', 'c']);
  });

  it('returns an unchanged copy for the same item or unknown ids', () => {
    const items = ['a', 'b'];
    expect(moveItem(items, 'a', 'a')).toEqual(['a', 'b']);
    expect(moveItem(items, 'x', 'a')).toEqual(['a', 'b']);
    expect(moveItem(items, 'a', 'x')).toEqual(['a', 'b']);
    expect(moveItem(items, 'a', 'a')).not.toBe(items);
  });
});

describe('groupByStatus', () => {
  const orders = generateOrders(80);
  const groups = groupByStatus(orders);

  it('keeps every order exactly once', () => {
    expect(groups.reduce((sum, group) => sum + group.orders.length, 0)).toBe(orders.length);
  });

  it('puts orders into the group of their own status', () => {
    for (const group of groups) {
      for (const order of group.orders) {
        expect(order.status).toBe(group.status);
      }
    }
  });

  it('orders groups by the workflow order and skips empty ones', () => {
    const statuses = groups.map((group) => group.status);
    const expected = ORDER_STATUSES.filter((status) => statuses.includes(status));
    expect(statuses).toEqual(expected);
    expect(groups.every((group) => group.orders.length > 0)).toBe(true);
  });
});

describe('selection helpers', () => {
  it('toggleId adds and removes without mutating the input', () => {
    const selected = new Set(['1']);
    const added = toggleId(selected, '2');
    expect([...added].sort()).toEqual(['1', '2']);
    expect([...toggleId(added, '1')]).toEqual(['2']);
    expect([...selected]).toEqual(['1']);
  });

  it('setIds selects or clears a batch of ids', () => {
    const selected = setIds(new Set(['9']), ['1', '2'], true);
    expect([...selected].sort()).toEqual(['1', '2', '9']);
    expect([...setIds(selected, ['1', '2'], false)]).toEqual(['9']);
  });

  it('checkState reports none, some and all', () => {
    const ids = ['1', '2', '3'];
    expect(checkState(ids, new Set())).toBe('none');
    expect(checkState(ids, new Set(['2']))).toBe('some');
    expect(checkState(ids, new Set(ids))).toBe('all');
    expect(checkState([], new Set(['1']))).toBe('none');
  });
});

describe('generateOrders', () => {
  it('is deterministic for the same seed', () => {
    const first = generateOrders(30).map((o) => [o.id, o.amount, o.status]);
    const second = generateOrders(30).map((o) => [o.id, o.amount, o.status]);
    expect(first).toEqual(second);
  });

  it('lists the newest orders first', () => {
    const orders = generateOrders(30);
    for (let i = 1; i < orders.length; i++) {
      expect(orders[i - 1].createdAt.getTime()).toBeGreaterThanOrEqual(orders[i].createdAt.getTime());
    }
  });
});
