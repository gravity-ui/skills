import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Flex,
  Pagination,
  Table,
  Text,
  withTableSelection,
  withTableSorting,
} from '@gravity-ui/uikit';
import type {
  TableColumnConfig,
  TableDataItem,
  TableSortState,
  WithTableSortingProps,
} from '@gravity-ui/uikit';

export type SortableColumn<I> = TableColumnConfig<I> & {
  meta?: TableColumnConfig<I>['meta'] & {
    /** `true` — сравнение по значению поля, функция — свой компаратор (по возрастанию). */
    sort?: boolean | ((a: I, b: I) => number);
    defaultSortOrder?: 'asc' | 'desc';
  };
};

export interface DataTableProps<I extends TableDataItem> {
  data: I[];
  columns: SortableColumn<I>[];
  getRowId: (item: I) => string;
  defaultSortState?: TableSortState;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  isRowSelectionDisabled?: (item: I) => boolean;
  emptyMessage?: string;
}

// Селекция снаружи, сортировка внутри: чекбокс-колонка не участвует в сортировке.
const EnhancedTable = withTableSelection<TableDataItem, WithTableSortingProps>(
  withTableSorting<TableDataItem>(Table),
);

function compareValues(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a == null) return 1; // пустые значения всегда в конец
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), 'ru', { numeric: true, sensitivity: 'base' });
}

function sortData<I extends TableDataItem>(
  data: I[],
  columns: SortableColumn<I>[],
  sortState: TableSortState,
): I[] {
  if (sortState.length === 0) return data;

  const comparators = sortState
    .map(({ column, order }) => {
      const config = columns.find((c) => c.id === column);
      const sort = config?.meta?.sort;
      if (!sort) return null;
      const compare =
        typeof sort === 'function'
          ? sort
          : (a: I, b: I) => compareValues(a[column], b[column]);
      return order === 'asc' ? compare : (a: I, b: I) => compare(b, a);
    })
    .filter((c): c is (a: I, b: I) => number => c !== null);

  if (comparators.length === 0) return data;

  // Стабильная сортировка: при равенстве сохраняем исходный порядок.
  return data
    .map((item, index) => ({ item, index }))
    .sort((x, y) => {
      for (const compare of comparators) {
        const result = compare(x.item, y.item);
        if (result !== 0) return result;
      }
      return x.index - y.index;
    })
    .map(({ item }) => item);
}

export function DataTable<I extends TableDataItem>({
  data,
  columns,
  getRowId,
  defaultSortState = [],
  defaultPageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  selectedIds: controlledSelectedIds,
  onSelectionChange,
  isRowSelectionDisabled,
  emptyMessage,
}: DataTableProps<I>) {
  const [sortState, setSortState] = useState<TableSortState>(defaultSortState);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [innerSelectedIds, setInnerSelectedIds] = useState<string[]>([]);

  const selectedIds = controlledSelectedIds ?? innerSelectedIds;
  const updateSelection = (ids: string[]) => {
    if (controlledSelectedIds === undefined) setInnerSelectedIds(ids);
    onSelectionChange?.(ids);
  };

  const sorted = useMemo(() => sortData(data, columns, sortState), [data, columns, sortState]);

  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  // Если данных стало меньше и текущая страница исчезла — откатываемся на последнюю.
  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const pageData = useMemo(() => {
    const start = (Math.min(page, pageCount) - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageCount, pageSize]);

  const handleSortChange = (next: TableSortState) => {
    setSortState(next);
    setPage(1);
  };

  const handlePaginationUpdate = (nextPage: number, nextPageSize: number) => {
    if (nextPageSize !== pageSize) {
      // Сохраняем позицию первой строки текущей страницы при смене размера.
      const firstRowIndex = (page - 1) * pageSize;
      setPageSize(nextPageSize);
      setPage(Math.floor(firstRowIndex / nextPageSize) + 1);
    } else {
      setPage(nextPage);
    }
  };

  // Удаляем из выделения id, которых уже нет в данных.
  useEffect(() => {
    const known = new Set(data.map(getRowId));
    const alive = selectedIds.filter((id) => known.has(id));
    if (alive.length !== selectedIds.length) updateSelection(alive);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const firstVisible = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastVisible = Math.min(page * pageSize, total);

  return (
    <Flex direction="column" gap={3}>
      <Flex alignItems="center" justifyContent="space-between" gap={3} wrap>
        <Text color="secondary">
          {total === 0 ? 'Нет записей' : `Показаны ${firstVisible}–${lastVisible} из ${total}`}
        </Text>
        <Flex alignItems="center" gap={2}>
          <Text color={selectedIds.length > 0 ? 'primary' : 'secondary'}>
            {`Выбрано: ${selectedIds.length}`}
          </Text>
          {selectedIds.length > 0 && (
            <Button view="flat" size="s" onClick={() => updateSelection([])}>
              Сбросить
            </Button>
          )}
        </Flex>
      </Flex>

      <EnhancedTable
        data={pageData}
        columns={columns as TableColumnConfig<TableDataItem>[]}
        getRowDescriptor={(item) => ({
          id: getRowId(item as I),
          disabled: isRowSelectionDisabled?.(item as I),
        })}
        sortState={sortState}
        onSortStateChange={handleSortChange}
        selectedIds={selectedIds}
        onSelectionChange={updateSelection}
        emptyMessage={emptyMessage}
        width="max"
      />

      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        pageSizeOptions={pageSizeOptions}
        onUpdate={handlePaginationUpdate}
        compact={false}
        showInput={pageCount > 5}
      />
    </Flex>
  );
}
