import * as React from 'react';
import { Flex, Pagination, Table, Text, withTableSelection, withTableSorting } from '@gravity-ui/uikit';
import type {
  TableColumnConfig,
  TableDataItem,
  TableProps,
  TableSortState,
  WithTableSelectionProps,
  WithTableSortingProps,
} from '@gravity-ui/uikit';

import { sortData } from './sortData';
import type { DataTableColumn } from './sortData';

export type { DataTableColumn, SortComparator } from './sortData';

/**
 * Table + сортировка + выделение из Gravity UI. Сортировка используется в
 * управляемом режиме: HOC только рисует индикаторы и шлёт onSortStateChange,
 * а сортируем мы сами по полному набору данных ДО нарезки на страницы.
 */
const EnhancedTable = withTableSelection(withTableSorting(Table)) as unknown as <T extends TableDataItem>(
  props: TableProps<T> & WithTableSortingProps & WithTableSelectionProps<T>,
) => React.ReactElement;

export interface DataTableProps<T extends TableDataItem> {
  data: T[];
  columns: DataTableColumn<T>[];
  /** Стабильный идентификатор строки; по нему хранится выделение. */
  getRowId: (item: T) => string;

  /** Варианты размера страницы. @default [10, 20, 50] */
  pageSizeOptions?: number[];
  /** Начальный размер страницы. @default pageSizeOptions[0] */
  initialPageSize?: number;

  /** Начальная сортировка (неуправляемый режим). */
  defaultSortState?: TableSortState;
  /** Сортировка в управляемом режиме. */
  sortState?: TableSortState;
  onSortStateChange?: (sortState: TableSortState) => void;

  /** Выделение в управляемом режиме. */
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  /** Запретить выделение отдельных строк. */
  isRowSelectionDisabled?: (item: T) => boolean;
  /** Переключать выделение кликом по строке, а не только по чекбоксу. @default true */
  selectOnRowClick?: boolean;

  emptyMessage?: string;
  className?: string;
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50];

function useControllableState<V>(
  controlled: V | undefined,
  onChange: ((value: V) => void) | undefined,
  initial: V,
): [V, (value: V) => void] {
  const [inner, setInner] = React.useState(initial);
  const isControlled = controlled !== undefined;
  const value = isControlled ? controlled : inner;
  const setValue = React.useCallback(
    (next: V) => {
      if (!isControlled) setInner(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );
  return [value, setValue];
}

const numberFormat = new Intl.NumberFormat('ru-RU');

export function DataTable<T extends TableDataItem>({
  data,
  columns,
  getRowId,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  initialPageSize = pageSizeOptions[0],
  defaultSortState,
  sortState: sortStateProp,
  onSortStateChange,
  selectedIds: selectedIdsProp,
  onSelectionChange,
  isRowSelectionDisabled,
  selectOnRowClick = true,
  emptyMessage = 'Нет данных',
  className,
}: DataTableProps<T>) {
  const [sortState, setSortState] = useControllableState<TableSortState>(
    sortStateProp,
    onSortStateChange,
    defaultSortState ?? [],
  );
  const [selectedIds, setSelectedIds] = useControllableState<string[]>(
    selectedIdsProp,
    onSelectionChange,
    [],
  );
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(initialPageSize);

  const sorted = React.useMemo(() => sortData(data, sortState, columns), [data, sortState, columns]);

  // Страница выводится из состояния, а не правится эффектом: при смене
  // размера страницы или сокращении данных не будет кадра с пустой таблицей.
  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * pageSize;
  const pageData = React.useMemo(
    () => sorted.slice(pageStart, pageStart + pageSize),
    [sorted, pageStart, pageSize],
  );

  const handleSortStateChange = React.useCallback(
    (next: TableSortState) => {
      setSortState(next);
      setPage(1);
    },
    [setSortState],
  );

  const handlePaginationUpdate = React.useCallback((nextPage: number, nextPageSize: number) => {
    if (nextPageSize !== pageSize) {
      // При смене размера остаёмся на странице, где лежит первая видимая строка.
      setPage(Math.floor(pageStart / nextPageSize) + 1);
      setPageSize(nextPageSize);
    } else {
      setPage(nextPage);
    }
  }, [pageSize, pageStart]);

  const getRowDescriptor = React.useCallback(
    (item: T) => ({
      id: getRowId(item),
      disabled: isRowSelectionDisabled?.(item) ?? false,
      interactive: selectOnRowClick,
    }),
    [getRowId, isRowSelectionDisabled, selectOnRowClick],
  );

  const handleRowClick = React.useCallback(
    (item: T) => {
      if (isRowSelectionDisabled?.(item)) return;
      const id = getRowId(item);
      setSelectedIds(
        selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id],
      );
    },
    [getRowId, isRowSelectionDisabled, selectedIds, setSelectedIds],
  );

  // Оба HOC кешируют обработку колонок по ссылке, поэтому массив должен быть стабильным.
  const tableColumns = React.useMemo(() => columns as TableColumnConfig<T>[], [columns]);

  const rangeLabel =
    total === 0
      ? '0 записей'
      : `${numberFormat.format(pageStart + 1)}–${numberFormat.format(
          Math.min(pageStart + pageSize, total),
        )} из ${numberFormat.format(total)}`;

  return (
    <div className={className}>
      <EnhancedTable<T>
        data={pageData}
        columns={tableColumns}
        getRowDescriptor={getRowDescriptor}
        sortState={sortState}
        onSortStateChange={handleSortStateChange}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowClick={selectOnRowClick ? handleRowClick : undefined}
        emptyMessage={emptyMessage}
        width="max"
        aria-rowcount={total}
      />
      <Flex justifyContent="space-between" alignItems="center" gap={4} wrap style={{ marginTop: 16 }}>
        <Text color="secondary" aria-live="polite">
          {rangeLabel}
          {selectedIds.length > 0 && ` · выбрано: ${numberFormat.format(selectedIds.length)}`}
        </Text>
        <Pagination
          page={currentPage}
          pageSize={pageSize}
          total={total}
          pageSizeOptions={pageSizeOptions}
          onUpdate={handlePaginationUpdate}
          showInput={pageCount > 7}
        />
      </Flex>
    </div>
  );
}
