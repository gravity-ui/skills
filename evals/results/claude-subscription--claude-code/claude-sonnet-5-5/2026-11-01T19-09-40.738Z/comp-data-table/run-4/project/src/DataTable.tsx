import React from 'react';
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
  TableProps,
  TableSortState,
  WithTableSelectionProps,
  WithTableSortingProps,
} from '@gravity-ui/uikit';

// HOC выводят I = TableDataItem, поэтому возвращаем дженерик-тип вручную.
const SelectableSortableTable = withTableSelection(withTableSorting(Table)) as unknown as <
  I extends TableDataItem,
>(
  props: TableProps<I> & WithTableSortingProps & WithTableSelectionProps<I>,
) => React.ReactElement;

export interface DataTableColumn<I> extends Omit<TableColumnConfig<I>, 'meta'> {
  /** Включает сортировку по колонке. По умолчанию сортируется по полю с именем `id`. */
  sortable?: boolean;
  /** Своя функция сравнения (по возрастанию). */
  compare?: (a: I, b: I) => number;
}

export interface DataTableProps<I extends TableDataItem> {
  data: I[];
  columns: DataTableColumn<I>[];
  /** Поле с уникальным идентификатором строки. */
  idField?: keyof I & string;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  defaultSortState?: TableSortState;
  /** Вызывается при изменении выбранных строк. */
  onSelectionChange?: (selectedIds: string[]) => void;
}

function defaultCompare(a: unknown, b: unknown): number {
  if (a === b) return 0;
  // Пустые значения всегда считаются «меньше».
  if (a === null || a === undefined) return -1;
  if (b === null || b === undefined) return 1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  return String(a).localeCompare(String(b), undefined, {numeric: true, sensitivity: 'base'});
}

export function DataTable<I extends TableDataItem>({
  data,
  columns,
  idField = 'id' as keyof I & string,
  pageSizeOptions = [10, 20, 50],
  defaultPageSize = pageSizeOptions[0],
  defaultSortState = [],
  onSelectionChange,
}: DataTableProps<I>) {
  const [sortState, setSortState] = React.useState<TableSortState>(defaultSortState);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(defaultPageSize);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // Колонки для Table: sortable/compare переносим в meta, которое читает withTableSorting.
  const tableColumns = React.useMemo<TableColumnConfig<I>[]>(
    () =>
      columns.map(({sortable, compare, ...column}) => ({
        ...column,
        meta: sortable || compare ? {sort: true} : undefined,
      })),
    [columns],
  );

  // Сортируем весь набор данных (а не только текущую страницу).
  const sortedData = React.useMemo(() => {
    if (sortState.length === 0) return data;
    return data.slice().sort((a, b) => {
      for (const {column, order} of sortState) {
        const def = columns.find((c) => c.id === column);
        const result = def?.compare ? def.compare(a, b) : defaultCompare(a[column], b[column]);
        if (result !== 0) return order === 'asc' ? result : -result;
      }
      return 0;
    });
  }, [data, columns, sortState]);

  // Если данные сократились, страница может выйти за границы.
  const pageCount = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const currentPage = Math.min(page, pageCount);

  const pageData = React.useMemo(
    () => sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [sortedData, currentPage, pageSize],
  );

  const handleSelectionChange = (ids: string[]) => {
    setSelectedIds(ids);
    onSelectionChange?.(ids);
  };

  const handleSortChange = (next: TableSortState) => {
    setSortState(next);
    setPage(1);
  };

  const handlePaginationUpdate = (nextPage: number, nextPageSize: number) => {
    setPage(nextPage);
    setPageSize(nextPageSize);
  };

  return (
    <Flex direction="column" gap={4}>
      <Flex alignItems="center" justifyContent="space-between" style={{minHeight: 28}}>
        <Text color="secondary">
          {selectedIds.length > 0 ? `Выбрано: ${selectedIds.length}` : 'Ничего не выбрано'}
        </Text>
        {selectedIds.length > 0 && (
          <Button view="flat" size="s" onClick={() => handleSelectionChange([])}>
            Сбросить выбор
          </Button>
        )}
      </Flex>

      <SelectableSortableTable
        data={pageData}
        columns={tableColumns}
        getRowId={idField}
        selectedIds={selectedIds}
        onSelectionChange={handleSelectionChange}
        sortState={sortState}
        onSortStateChange={handleSortChange}
        disableDataSorting
        emptyMessage="Нет данных"
      />

      <Pagination
        page={currentPage}
        pageSize={pageSize}
        total={sortedData.length}
        pageSizeOptions={pageSizeOptions}
        onUpdate={handlePaginationUpdate}
        showInput
      />
    </Flex>
  );
}
