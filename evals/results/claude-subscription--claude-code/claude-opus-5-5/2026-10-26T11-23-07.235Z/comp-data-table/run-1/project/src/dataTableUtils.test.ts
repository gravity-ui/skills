import { describe, expect, it } from 'vitest';

import { clampPage, compareValues, getPageCount, paginate, sortData } from './dataTableUtils';

describe('compareValues', () => {
    it('compares numbers, dates and strings', () => {
        expect(compareValues(2, 10)).toBeLessThan(0);
        expect(compareValues(new Date(2020, 0, 2), new Date(2020, 0, 1))).toBeGreaterThan(0);
        expect(compareValues('ёж', 'Яблоко')).toBeLessThan(0);
        expect(compareValues('item 2', 'item 10')).toBeLessThan(0);
    });

    it('puts empty values last', () => {
        expect(compareValues(null, 1)).toBeGreaterThan(0);
        expect(compareValues('a', undefined)).toBeLessThan(0);
        expect(compareValues(null, undefined)).toBe(0);
    });
});

describe('sortData', () => {
    type Row = { id: string; group: string; value: number };
    const rows: Row[] = [
        { id: 'a', group: 'x', value: 3 },
        { id: 'b', group: 'y', value: 1 },
        { id: 'c', group: 'x', value: 1 },
        { id: 'd', group: 'y', value: 2 },
    ];
    const comparators = {
        group: (a: Row, b: Row) => compareValues(a.group, b.group),
        value: (a: Row, b: Row) => a.value - b.value,
    };

    it('returns data as is without sort state', () => {
        expect(sortData(rows, [], comparators)).toBe(rows);
    });

    it('sorts by one column in both directions', () => {
        expect(sortData(rows, [{ column: 'value', order: 'asc' }], comparators).map((r) => r.id)).toEqual(['b', 'c', 'd', 'a']);
        expect(sortData(rows, [{ column: 'value', order: 'desc' }], comparators).map((r) => r.id)).toEqual(['a', 'd', 'b', 'c']);
    });

    it('sorts by several columns', () => {
        const sorted = sortData(
            rows,
            [
                { column: 'group', order: 'asc' },
                { column: 'value', order: 'desc' },
            ],
            comparators,
        );
        expect(sorted.map((r) => r.id)).toEqual(['a', 'c', 'd', 'b']);
    });

    it('ignores columns without comparator and does not mutate input', () => {
        const copy = rows.slice();
        sortData(rows, [{ column: 'unknown', order: 'asc' }, { column: 'value', order: 'asc' }], comparators);
        expect(rows).toEqual(copy);
    });
});

describe('pagination', () => {
    const data = Array.from({ length: 25 }, (_, i) => i);

    it('slices pages', () => {
        expect(paginate(data, 1, 10)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        expect(paginate(data, 3, 10)).toEqual([20, 21, 22, 23, 24]);
    });

    it('counts and clamps pages', () => {
        expect(getPageCount(25, 10)).toBe(3);
        expect(getPageCount(0, 10)).toBe(1);
        expect(clampPage(5, 25, 10)).toBe(3);
        expect(clampPage(0, 25, 10)).toBe(1);
    });
});
