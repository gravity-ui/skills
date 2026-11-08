import {describe, expect, it} from 'vitest';

import type {Order} from './data';
import {generateOrders} from './data';
import {buildRows, getCheckState, moveColumn, normalizeSettings, shiftColumn, toggleMany, toggleWithRange} from './tableModel';

const order = (id: string, status: Order['status'], amount = 100): Order => ({
    id,
    number: Number(id),
    createdAt: new Date(0),
    customer: 'x',
    city: 'y',
    items: 1,
    amount,
    payment: 'card',
    status,
    manager: 'z',
});

describe('buildRows', () => {
    const orders = [order('1', 'shipped'), order('2', 'new', 50), order('3', 'shipped', 30), order('4', 'new')];

    it('без группировки возвращает заказы как есть', () => {
        expect(buildRows(orders, false, new Set()).map((r) => r.id)).toEqual(['1', '2', '3', '4']);
    });

    it('группирует в порядке статусов, сохраняя порядок внутри группы и пропуская пустые группы', () => {
        const rows = buildRows(orders, true, new Set());
        expect(rows.map((r) => r.id)).toEqual(['group:new', '2', '4', 'group:shipped', '1', '3']);
        expect(rows[0]).toMatchObject({kind: 'group', orderIds: ['2', '4'], total: 150, collapsed: false});
    });

    it('скрывает заказы свёрнутой группы, но оставляет её заголовок', () => {
        const rows = buildRows(orders, true, new Set(['new'] as const));
        expect(rows.map((r) => r.id)).toEqual(['group:new', 'group:shipped', '1', '3']);
        expect(rows[0]).toMatchObject({collapsed: true, orderIds: ['2', '4']});
    });
});

describe('selection', () => {
    const ids = ['a', 'b', 'c', 'd', 'e'];

    it('getCheckState', () => {
        expect(getCheckState(ids, new Set())).toBe('none');
        expect(getCheckState(ids, new Set(['a']))).toBe('some');
        expect(getCheckState(ids, new Set(ids))).toBe('all');
        expect(getCheckState([], new Set(['a']))).toBe('none');
    });

    it('toggleMany выделяет всё при частичном выделении и снимает при полном', () => {
        expect([...toggleMany(new Set(['a', 'x']), ['a', 'b'])].sort()).toEqual(['a', 'b', 'x']);
        expect([...toggleMany(new Set(['a', 'b', 'x']), ['a', 'b'])]).toEqual(['x']);
    });

    it('обычный клик переключает одну строку', () => {
        expect([...toggleWithRange(new Set(['a']), 'c', ids, 'a', false)].sort()).toEqual(['a', 'c']);
        expect([...toggleWithRange(new Set(['a', 'c']), 'c', ids, 'a', false)]).toEqual(['a']);
    });

    it('Shift+клик распространяет состояние якоря на диапазон в обе стороны', () => {
        expect([...toggleWithRange(new Set(['b']), 'd', ids, 'b', true)].sort()).toEqual(['b', 'c', 'd']);
        expect([...toggleWithRange(new Set(['d']), 'b', ids, 'd', true)].sort()).toEqual(['b', 'c', 'd']);
        // Якорь снят → Shift+клик снимает выделение с диапазона.
        expect([...toggleWithRange(new Set(['a', 'c', 'd', 'e']), 'e', ids, 'b', true)]).toEqual(['a']);
    });

    it('Shift+клик без видимого якоря ведёт себя как обычный клик', () => {
        expect([...toggleWithRange(new Set(), 'c', ids, 'hidden', true)]).toEqual(['c']);
        expect([...toggleWithRange(new Set(), 'c', ids, null, true)]).toEqual(['c']);
    });
});

describe('column order', () => {
    const settings = [
        {id: 'a', isSelected: true},
        {id: 'b', isSelected: true},
        {id: 'hidden', isSelected: false},
        {id: 'c', isSelected: true},
    ];
    const ids = (list: {id: string}[]) => list.map((s) => s.id);

    it('moveColumn ставит колонку до/после цели и не трогает скрытые', () => {
        expect(ids(moveColumn(settings, 'c', 'a', 'before'))).toEqual(['c', 'a', 'b', 'hidden']);
        expect(ids(moveColumn(settings, 'a', 'c', 'after'))).toEqual(['b', 'hidden', 'c', 'a']);
        expect(ids(moveColumn(settings, 'a', 'b', 'after'))).toEqual(['b', 'a', 'hidden', 'c']);
        expect(ids(moveColumn(settings, 'a', 'a', 'after'))).toEqual(ids(settings));
        expect(ids(moveColumn(settings, 'a', 'missing', 'after'))).toEqual(ids(settings));
    });

    it('shiftColumn перескакивает через скрытые колонки и упирается в края', () => {
        expect(ids(shiftColumn(settings, 'b', 1))).toEqual(['a', 'hidden', 'c', 'b']);
        expect(ids(shiftColumn(settings, 'c', -1))).toEqual(['a', 'c', 'b', 'hidden']);
        expect(ids(shiftColumn(settings, 'a', -1))).toEqual(ids(settings));
        expect(ids(shiftColumn(settings, 'c', 1))).toEqual(ids(settings));
    });

    it('normalizeSettings чинит сохранённые настройки', () => {
        expect(normalizeSettings(undefined, ['a', 'b'])).toEqual([
            {id: 'a', isSelected: true},
            {id: 'b', isSelected: true},
        ]);
        expect(
            normalizeSettings(
                [{id: 'b', isSelected: false}, {id: 'gone'}, {id: 'b'}, null, 'junk'],
                ['a', 'b', 'c'],
            ),
        ).toEqual([
            {id: 'b', isSelected: false},
            {id: 'a', isSelected: true},
            {id: 'c', isSelected: true},
        ]);
    });
});

describe('generateOrders', () => {
    it('детерминирован и выдаёт уникальные id', () => {
        const a = generateOrders(50);
        expect(generateOrders(50)).toEqual(a);
        expect(new Set(a.map((o) => o.id)).size).toBe(50);
    });
});
