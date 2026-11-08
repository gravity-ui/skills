import { describe, expect, it } from 'vitest';

import { generateOrders, STATUS_ORDER, type Order } from './data';
import { buildRows, checkState, moveItem, rangeIds, sanitizeOrder, setMany } from './logic';

describe('moveItem', () => {
    const list = ['a', 'b', 'c', 'd'];

    it('moves forward: insert before an element to the right', () => {
        expect(moveItem(list, 0, 2)).toEqual(['b', 'a', 'c', 'd']);
        expect(moveItem(list, 0, 4)).toEqual(['b', 'c', 'd', 'a']);
    });

    it('moves backward: insert before an element to the left', () => {
        expect(moveItem(list, 3, 0)).toEqual(['d', 'a', 'b', 'c']);
        expect(moveItem(list, 2, 1)).toEqual(['a', 'c', 'b', 'd']);
    });

    it('is a no-op when dropped onto itself or right after itself', () => {
        expect(moveItem(list, 1, 1)).toEqual(list);
        expect(moveItem(list, 1, 2)).toEqual(list);
    });

    it('does not mutate the input and tolerates bad indexes', () => {
        const copy = list.slice();
        moveItem(list, 0, 3);
        expect(list).toEqual(copy);
        expect(moveItem(list, 9, 0)).toEqual(list);
        expect(moveItem(list, 0, 99)).toEqual(['b', 'c', 'd', 'a']);
    });
});

describe('sanitizeOrder', () => {
    const defaults = ['a', 'b', 'c'] as const;

    it('falls back to defaults for garbage', () => {
        expect(sanitizeOrder(null, defaults)).toEqual(['a', 'b', 'c']);
        expect(sanitizeOrder('a,b', defaults)).toEqual(['a', 'b', 'c']);
    });

    it('drops unknown/duplicate ids and appends missing ones', () => {
        expect(sanitizeOrder(['c', 'x', 'c', 'a', 1], defaults)).toEqual(['c', 'a', 'b']);
    });
});

describe('buildRows', () => {
    const orders = generateOrders(60);

    it('returns plain rows when not grouped', () => {
        const rows = buildRows(orders, false, new Set());
        expect(rows).toHaveLength(60);
        expect(rows.every((r) => r.kind === 'order')).toBe(true);
    });

    it('groups by status in lifecycle order, keeping every order once', () => {
        const rows = buildRows(orders, true, new Set());
        const groups = rows.filter((r) => r.kind === 'group');
        const statuses = groups.map((g) => (g.kind === 'group' ? g.status : null));
        expect(statuses).toEqual(STATUS_ORDER.filter((s) => statuses.includes(s)));

        const orderRows = rows.filter((r): r is { kind: 'order'; order: Order } => r.kind === 'order');
        expect(orderRows).toHaveLength(60);

        // каждая строка заказа идёт под заголовком своего статуса
        let current: string | null = null;
        for (const row of rows) {
            if (row.kind === 'group') current = row.status;
            else expect(row.order.status).toBe(current);
        }
    });

    it('computes group totals and hides orders of collapsed groups', () => {
        const status = orders[0].status;
        const rows = buildRows(orders, true, new Set([status]));
        const group = rows.find((r) => r.kind === 'group' && r.status === status);
        const expected = orders.filter((o) => o.status === status);
        expect(group).toMatchObject({ collapsed: true, orders: expected });
        expect(group?.kind === 'group' && group.total).toBe(expected.reduce((s, o) => s + o.total, 0));
        expect(rows.some((r) => r.kind === 'order' && r.order.status === status)).toBe(false);
    });

    it('omits empty groups', () => {
        const rows = buildRows(orders.filter((o) => o.status === 'new'), true, new Set());
        expect(rows.filter((r) => r.kind === 'group')).toHaveLength(1);
    });
});

describe('selection helpers', () => {
    it('checkState', () => {
        expect(checkState(['a', 'b'], new Set())).toBe('none');
        expect(checkState(['a', 'b'], new Set(['a', 'z']))).toBe('some');
        expect(checkState(['a', 'b'], new Set(['a', 'b']))).toBe('all');
    });

    it('setMany adds/removes and keeps identity when nothing changes', () => {
        const base = new Set(['a']);
        expect([...setMany(base, ['b', 'c'], true)]).toEqual(['a', 'b', 'c']);
        expect([...setMany(base, ['a'], false)]).toEqual([]);
        expect(setMany(base, ['a'], true)).toBe(base);
        expect(setMany(base, ['x'], false)).toBe(base);
    });

    it('rangeIds works in both directions and without an anchor', () => {
        const ids = ['a', 'b', 'c', 'd', 'e'];
        expect(rangeIds(ids, 'b', 'd')).toEqual(['b', 'c', 'd']);
        expect(rangeIds(ids, 'd', 'b')).toEqual(['b', 'c', 'd']);
        expect(rangeIds(ids, null, 'c')).toEqual(['c']);
        expect(rangeIds(ids, 'hidden', 'c')).toEqual(['c']);
        expect(rangeIds(ids, 'a', 'hidden')).toEqual([]);
    });
});

describe('generateOrders', () => {
    it('is deterministic and produces unique ids', () => {
        const a = generateOrders(200);
        expect(generateOrders(200)).toEqual(a);
        expect(new Set(a.map((o) => o.id)).size).toBe(200);
    });
});
