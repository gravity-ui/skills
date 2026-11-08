import type { TableSortState } from '@gravity-ui/uikit';

export type CompareFn<I> = (a: I, b: I) => number;

const collator = new Intl.Collator('ru', { numeric: true, sensitivity: 'base' });

/** Сравнение примитивов: числа, даты, строки (с учётом локали), boolean. null/undefined — всегда в конце. */
export function compareValues(a: unknown, b: unknown): number {
    const aEmpty = a === null || a === undefined || a === '';
    const bEmpty = b === null || b === undefined || b === '';
    if (aEmpty || bEmpty) {
        return Number(aEmpty) - Number(bEmpty);
    }
    if (a instanceof Date && b instanceof Date) {
        return a.getTime() - b.getTime();
    }
    if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
    }
    if (typeof a === 'boolean' && typeof b === 'boolean') {
        return Number(a) - Number(b);
    }
    return collator.compare(String(a), String(b));
}

/**
 * Многоколоночная сортировка по состоянию из withTableSorting.
 * Сортируется весь набор данных, поэтому сортировка корректна при пагинации.
 * Array.prototype.sort стабилен, так что равные строки сохраняют исходный порядок.
 */
export function sortData<I>(
    data: I[],
    sortState: TableSortState,
    comparators: Record<string, CompareFn<I> | undefined>,
): I[] {
    const active = sortState.filter((s) => comparators[s.column]);
    if (active.length === 0) {
        return data;
    }
    return data.slice().sort((a, b) => {
        for (const { column, order } of active) {
            const result = comparators[column]!(a, b);
            if (result !== 0) {
                return order === 'asc' ? result : -result;
            }
        }
        return 0;
    });
}

export function getPageCount(total: number, pageSize: number): number {
    return Math.max(1, Math.ceil(total / pageSize));
}

export function clampPage(page: number, total: number, pageSize: number): number {
    return Math.min(Math.max(1, page), getPageCount(total, pageSize));
}

export function paginate<I>(data: I[], page: number, pageSize: number): I[] {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
}
