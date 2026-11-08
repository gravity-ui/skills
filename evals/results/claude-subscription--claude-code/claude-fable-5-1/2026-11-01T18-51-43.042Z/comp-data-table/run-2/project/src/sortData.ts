import type { TableColumnConfig, TableDataItem, TableSortState } from '@gravity-ui/uikit';

export type SortComparator<T> = (a: T, b: T) => number;

/**
 * Конфиг колонки. Чтобы колонка стала сортируемой, задайте `meta.sort`:
 * `true` — сравнение по значению поля с id колонки (числа, строки, даты),
 * функция — свой компаратор для возрастающего порядка.
 */
export type DataTableColumn<T extends TableDataItem> = Omit<TableColumnConfig<T>, 'meta'> & {
  meta?: TableColumnConfig<T>['meta'] & {
    sort?: boolean | SortComparator<T>;
    defaultSortOrder?: 'asc' | 'desc';
  };
};

export function compareValues(a: unknown, b: unknown): number {
  if (a === b) return 0;
  // Пустые значения всегда в конце при возрастающем порядке.
  if (a === null || a === undefined || a === '') return 1;
  if (b === null || b === undefined || b === '') return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

/** Сортирует полный набор данных по состоянию сортировки таблицы (поддерживает несколько колонок). */
export function sortData<T extends TableDataItem>(
  data: T[],
  sortState: TableSortState,
  columns: DataTableColumn<T>[],
): T[] {
  const comparators: { compare: SortComparator<T>; sign: 1 | -1 }[] = [];

  for (const { column: columnId, order } of sortState) {
    const sort = columns.find((column) => column.id === columnId)?.meta?.sort;
    if (!sort) continue;
    const compare: SortComparator<T> =
      typeof sort === 'function' ? sort : (a, b) => compareValues(a[columnId], b[columnId]);
    comparators.push({ compare, sign: order === 'asc' ? 1 : -1 });
  }

  if (comparators.length === 0) return data;

  // Array.prototype.sort стабилен, поэтому порядок равных элементов сохраняется.
  return [...data].sort((a, b) => {
    for (const { compare, sign } of comparators) {
      const result = compare(a, b);
      if (result !== 0) return result * sign;
    }
    return 0;
  });
}
