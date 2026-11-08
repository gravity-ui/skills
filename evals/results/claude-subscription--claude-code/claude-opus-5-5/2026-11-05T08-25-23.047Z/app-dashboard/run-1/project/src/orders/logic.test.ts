import { describe, expect, it } from 'vitest';

import { generateOrders, pluralRu, type Order } from './data';
import { buildRows, getCheckState, getRange, moveColumn, normalizeColumnOrder, shiftColumn } from './logic';

const order = (id: string, status: Order['status'], amount = 100): Order => ({
    id,
    status,
    amount,
    createdAt: '2026-01-01T00:00:00Z',
    customer: '',
    email: '',
    city: '',
    items: 1,
    payment: '',
    manager: '',
});

describe('buildRows', () => {
    const orders = [order('a', 'delivered'), order('b', 'new', 50), order('c', 'delivered', 30)];

    it('без группировки — только строки заказов в исходном порядке', () => {
        expect(buildRows(orders, false, new Set()).map((r) => r.id)).toEqual(['a', 'b', 'c']);
    });

    it('группирует по статусу в порядке STATUSES и считает сумму', () => {
        const rows = buildRows(orders, true, new Set());
        expect(rows.map((r) => r.id)).toEqual(['group:new', 'b', 'group:delivered', 'a', 'c']);
        const delivered = rows[2];
        expect(delivered.kind === 'group' && delivered.total).toBe(130);
    });

    it('свёрнутая группа оставляет только заголовок', () => {
        const rows = buildRows(orders, true, new Set(['delivered'] as const));
        expect(rows.map((r) => r.id)).toEqual(['group:new', 'b', 'group:delivered']);
    });
});

describe('selection helpers', () => {
    it('getCheckState', () => {
        expect(getCheckState(['a', 'b'], new Set(['a']))).toEqual({ checked: false, indeterminate: true });
        expect(getCheckState(['a', 'b'], new Set(['a', 'b']))).toEqual({ checked: true, indeterminate: false });
        expect(getCheckState([], new Set(['a']))).toEqual({ checked: false, indeterminate: false });
    });

    it('getRange работает в обе стороны', () => {
        const ids = ['a', 'b', 'c', 'd'];
        expect(getRange(ids, 'b', 'd')).toEqual(['b', 'c', 'd']);
        expect(getRange(ids, 'd', 'b')).toEqual(['b', 'c', 'd']);
        expect(getRange(ids, 'x', 'c')).toEqual(['c']);
    });
});

describe('column order', () => {
    const cols = ['id', 'date', 'customer', 'amount'];

    it('moveColumn before/after', () => {
        expect(moveColumn(cols, 'amount', 'date', 'before')).toEqual(['id', 'amount', 'date', 'customer']);
        expect(moveColumn(cols, 'id', 'customer', 'after')).toEqual(['date', 'customer', 'id', 'amount']);
        expect(moveColumn(cols, 'id', 'id', 'after')).toEqual(cols);
    });

    it('shiftColumn перепрыгивает скрытые колонки', () => {
        // date скрыта — сдвиг customer влево ставит его перед id
        expect(shiftColumn(cols, ['id', 'customer', 'amount'], 'customer', -1)).toEqual(['customer', 'id', 'date', 'amount']);
        expect(shiftColumn(cols, cols, 'amount', 1)).toEqual(cols);
    });

    it('normalizeColumnOrder чистит мусор и дописывает новые', () => {
        expect(normalizeColumnOrder(['amount', 'bogus', 'id', 'amount'], cols)).toEqual(['amount', 'id', 'date', 'customer']);
        expect(normalizeColumnOrder('garbage', cols)).toEqual(cols);
    });
});

describe('data', () => {
    it('генерация детерминирована и id уникальны', () => {
        const a = generateOrders(50);
        expect(generateOrders(50)).toEqual(a);
        expect(new Set(a.map((o) => o.id)).size).toBe(50);
    });

    it('pluralRu', () => {
        const forms: [string, string, string] = ['заказ', 'заказа', 'заказов'];
        expect([1, 2, 5, 11, 21, 22, 112].map((n) => pluralRu(n, forms))).toEqual([
            'заказ', 'заказа', 'заказов', 'заказов', 'заказ', 'заказа', 'заказов',
        ]);
    });
});
