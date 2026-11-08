export type SortOrder = 'asc' | 'desc';

export interface SortRule {
    column: string;
    order: SortOrder;
}

/** Компаратор «по возрастанию»: отрицательное — a раньше b. */
export type Comparator<T> = (a: T, b: T) => number;

const collator = new Intl.Collator('ru', {numeric: true, sensitivity: 'base'});

function isEmpty(value: unknown): boolean {
    return value === null || value === undefined || value === '';
}

/** Сравнение «сырых» значений ячеек: строки — с учётом локали, пустые значения — в конце. */
export function compareValues(a: unknown, b: unknown): number {
    if (isEmpty(a) || isEmpty(b)) {
        return Number(isEmpty(a)) - Number(isEmpty(b));
    }
    if (typeof a === 'string' && typeof b === 'string') {
        return collator.compare(a, b);
    }
    if (a instanceof Date && b instanceof Date) {
        return a.getTime() - b.getTime();
    }
    if (a === b) {
        return 0;
    }
    return (a as number) > (b as number) ? 1 : -1;
}

/**
 * Многоуровневая сортировка: правила применяются по порядку,
 * следующее учитывается только при равенстве по предыдущим.
 * Исходный массив не меняется; сортировка стабильная.
 */
export function sortRows<T>(
    rows: readonly T[],
    sortState: readonly SortRule[],
    getComparator: (columnId: string) => Comparator<T> | undefined,
): T[] {
    const rules = sortState
        .map((rule) => ({order: rule.order, compare: getComparator(rule.column)}))
        .filter((rule): rule is {order: SortOrder; compare: Comparator<T>} => Boolean(rule.compare));

    if (rules.length === 0) {
        return rows.slice();
    }

    return rows.slice().sort((a, b) => {
        for (const {order, compare} of rules) {
            const result = compare(a, b);
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

/** Приводит номер страницы (с 1) к допустимому диапазону. */
export function clampPage(page: number, pageSize: number, total: number): number {
    return Math.min(Math.max(1, page), getPageCount(total, pageSize));
}

export function paginate<T>(rows: readonly T[], page: number, pageSize: number): T[] {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
}
