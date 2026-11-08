import {describe, expect, it} from 'vitest';

import {clampPage, compareValues, paginate, sortRows} from './sortRows';

type Row = {name: string; age: number | null};

const rows: Row[] = [
    {name: 'Борис', age: 30},
    {name: 'анна', age: 25},
    {name: 'Виктор', age: null},
    {name: 'Анна', age: 40},
];

const byField = (field: keyof Row) => (a: Row, b: Row) => compareValues(a[field], b[field]);

describe('sortRows', () => {
    it('сортирует строки с учётом локали и без учёта регистра', () => {
        const sorted = sortRows(rows, [{column: 'name', order: 'asc'}], () => byField('name'));
        expect(sorted.map((r) => r.name)).toEqual(['анна', 'Анна', 'Борис', 'Виктор']);
    });

    it('поддерживает обратный порядок', () => {
        const sorted = sortRows(rows, [{column: 'age', order: 'desc'}], () => byField('age'));
        expect(sorted.map((r) => r.age)).toEqual([null, 40, 30, 25]);
    });

    it('применяет вторичную сортировку при равенстве первичной', () => {
        const sorted = sortRows(
            rows,
            [
                {column: 'name', order: 'asc'},
                {column: 'age', order: 'desc'},
            ],
            (id) => byField(id as keyof Row),
        );
        expect(sorted.slice(0, 2)).toEqual([
            {name: 'Анна', age: 40},
            {name: 'анна', age: 25},
        ]);
    });

    it('не меняет исходный массив и игнорирует колонки без компаратора', () => {
        const copy = rows.slice();
        const sorted = sortRows(rows, [{column: 'unknown', order: 'asc'}], () => undefined);
        expect(sorted).toEqual(copy);
        expect(sorted).not.toBe(rows);
        expect(rows).toEqual(copy);
    });
});

describe('compareValues', () => {
    it('ставит пустые значения в конец при сортировке по возрастанию', () => {
        expect([3, null, 1, undefined, 2].sort(compareValues)).toEqual([1, 2, 3, null, undefined]);
    });

    it('сравнивает числа в строках как числа', () => {
        expect(compareValues('EMP-2', 'EMP-10')).toBeLessThan(0);
    });
});

describe('пагинация', () => {
    const items = Array.from({length: 23}, (_, i) => i);

    it('возвращает срез нужной страницы', () => {
        expect(paginate(items, 1, 10)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        expect(paginate(items, 3, 10)).toEqual([20, 21, 22]);
    });

    it('ограничивает номер страницы', () => {
        expect(clampPage(5, 10, 23)).toBe(3);
        expect(clampPage(0, 10, 23)).toBe(1);
        expect(clampPage(2, 10, 0)).toBe(1);
    });
});
