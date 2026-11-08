import { useMemo, useState } from 'react';
import {
  Button,
  Flex,
  Pagination,
  Table,
  Text,
  withTableSelection,
  withTableSorting,
  type TableColumnConfig,
  type TableDataItem,
  type TableProps,
  type TableSortState,
  type WithTableSelectionProps,
  type WithTableSortingProps,
} from '@gravity-ui/uikit';

export type SortableColumnConfig<I> = TableColumnConfig<I> & {
  /** Функция сравнения для сортировки. Если не задана, колонка не сортируется. */
  sortFn?: (a: I, b: I) => number;
  /** Порядок первого клика по заголовку. По умолчанию `asc`. */
  defaultSortOrder?: 'asc' | 'desc';
};

export interface DataTableProps<I extends TableDataItem> {
  data: I[];
  columns: SortableColumnConfig<I>[];
  /** Уникальный идентификатор строки. Используется для выделения. */
  getRowId: (item: I) => string;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  defaultSortState?: TableSortState;
  /** Контролируемое выделение. Если не передано, компонент хранит выделение сам. */
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  isRowSelectionDisabled?: (item: I) => boolean;
  emptyMessage?: string;
  className?: string;
}

// HOC-и из Gravity UI оборачивают один раз на уровне модуля, чтобы не пересоздавать компонент на каждый рендер.
type EnhancedTableProps<I extends TableDataItem> = TableProps<I> &
  WithTableSortingProps &
  WithTableSelectionProps<I>;
const EnhancedTable = withTableSorting(withTableSelection(Table)) as unknown as <
  I extends TableDataItem,
>(
  props: EnhancedTableProps<I>,
) => JSX.Element;

function compareDefault(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), 'ru', { numeric: true, sensitivity: 'base' });
}

export function DataTable<I extends TableDataItem>({
  data,
  columns,
  getRowId,
  pageSizeOptions = [10, 20, 50],
  defaultPageSize = pageSizeOptions[0] ?? 10,
  defaultSortState = [],
  selectedIds: controlledSelectedIds,
  onSelectionChange,
  isRowSelectionDisabled,
  emptyMessage = 'Нет данных',
  className,
}: DataTableProps<I>) {
  const [sortState, setSortState] = useState<TableSortState>(defaultSortState);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [innerSelectedIds, setInnerSelectedIds] = useState<string[]>([]);

  const isControlled = controlledSelectedIds !== undefined;
  const selectedIds = isControlled ? controlledSelectedIds : innerSelectedIds;
  const handleSelectionChange = (ids: string[]) => {
    if (!isControlled) setInnerSelectedIds(ids);
    onSelectionChange?.(ids);
  };

  // Колонки для Table: `meta.sort` включает индикатор сортировки в заголовке,
  // а саму сортировку мы делаем сами (controlled sortState + disableDataSorting).
  const tableColumns = useMemo<TableColumnConfig<I>[]>(
    () =>
      columns.map(({ sortFn, defaultSortOrder, ...column }) => ({
        ...column,
        meta: {
          ...column.meta,
          sort: Boolean(sortFn),
          defaultSortOrder,
        },
      })),
    [columns],
  );

  // Сортируем ВСЕ данные, а не только текущую страницу.
  const sortedData = useMemo(() => {
    if (sortState.length === 0) return data;
    const comparators = sortState
      .map(({ column, order }) => {
        const col = columns.find((c) => c.id === column);
        if (!col?.sortFn) return null;
        const fn = col.sortFn;
        return (a: I, b: I) => (order === 'asc' ? fn(a, b) : -fn(a, b));
      })
      .filter((fn): fn is (a: I, b: I) => number => fn !== null);
    if (comparators.length === 0) return data;

    return [...data].sort((a, b) => {
      for (const cmp of comparators) {
        const result = cmp(a, b);
        if (result !== 0) return result;
      }
      return 0;
    });
  }, [data, columns, sortState]);

  const total = sortedData.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageData = useMemo(
    () => sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [sortedData, currentPage, pageSize],
  );

  const handleSortChange = (next: TableSortState) => {
    setSortState(next);
    setPage(1);
  };

  const handlePaginationUpdate = (nextPage: number, nextPageSize: number) => {
    if (nextPageSize !== pageSize) {
      setPageSize(nextPageSize);
      setPage(1);
      return;
    }
    setPage(nextPage);
  };

  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, total);

  return (
    <Flex direction="column" gap={3} className={className}>
      <Flex alignItems="center" gap={3} style={{ minHeight: 28 }}>
        <Text variant="body-1" color="secondary">
          Показано {from}–{to} из {total}
        </Text>
        {selectedIds.length > 0 && (
          <>
            <Text variant="body-1">Выбрано: {selectedIds.length}</Text>
            <Button size="s" view="flat-secondary" onClick={() => handleSelectionChange([])}>
              Снять выделение
            </Button>
          </>
        )}
      </Flex>

      <EnhancedTable
        data={pageData}
        columns={tableColumns}
        getRowDescriptor={(item: I) => ({ id: getRowId(item) })}
        sortState={sortState}
        onSortStateChange={handleSortChange}
        disableDataSorting
        selectedIds={selectedIds}
        onSelectionChange={handleSelectionChange}
        isRowSelectionDisabled={isRowSelectionDisabled}
        emptyMessage={emptyMessage}
        width="max"
      />

      <Flex justifyContent="flex-end">
        <Pagination
          page={currentPage}
          pageSize={pageSize}
          total={total}
          pageSizeOptions={pageSizeOptions}
          onUpdate={handlePaginationUpdate}
          compact={false}
          showInput
        />
      </Flex>
    </Flex>
  );
}

export { compareDefault };
