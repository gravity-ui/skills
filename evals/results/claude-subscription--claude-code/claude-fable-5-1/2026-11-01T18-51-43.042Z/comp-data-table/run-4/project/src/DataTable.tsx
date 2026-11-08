import * as React from 'react';
import {
  Button,
  Pagination,
  Table,
  Text,
  withTableSelection,
  withTableSorting,
  type TableColumnConfig,
  type TableDataItem,
  type TableSortState,
} from '@gravity-ui/uikit';

export interface DataTableColumn<I> extends TableColumnConfig<I> {
  /** Включает сортировку по колонке. Функция — свой компаратор. */
  sortable?: boolean | ((a: I, b: I) => number);
}

export interface DataTableProps<I extends TableDataItem> {
  data: I[];
  columns: DataTableColumn<I>[];
  /** Как получить id строки. По умолчанию — поле `id`. */
  getRowId?: (item: I) => string;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  defaultSortState?: TableSortState;
  /** Контролируемое выделение (необязательно). */
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  /** Строки, которые нельзя выделить. */
  isRowSelectionDisabled?: (item: I) => boolean;
  emptyMessage?: string;
}

function defaultCompare(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a === null || a === undefined) return -1;
  if (b === null || b === undefined) return 1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

function sortData<I extends TableDataItem>(
  data: I[],
  columns: DataTableColumn<I>[],
  sortState: TableSortState,
): I[] {
  if (sortState.length === 0) return data;

  const comparators = sortState
    .map(({ column, order }) => {
      const config = columns.find((c) => c.id === column);
      if (!config?.sortable) return null;
      const compare =
        typeof config.sortable === 'function'
          ? config.sortable
          : (a: I, b: I) => defaultCompare(a[column], b[column]);
      return { compare, sign: order === 'asc' ? 1 : -1 };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  if (comparators.length === 0) return data;

  // Индекс как последний ключ делает сортировку стабильной.
  return data
    .map((item, index) => ({ item, index }))
    .sort((x, y) => {
      for (const { compare, sign } of comparators) {
        const result = compare(x.item, y.item) * sign;
        if (result !== 0) return result;
      }
      return x.index - y.index;
    })
    .map(({ item }) => item);
}

export function DataTable<I extends TableDataItem>({
  data,
  columns,
  getRowId = (item) => String(item.id),
  pageSizeOptions = [10, 20, 50, 100],
  defaultPageSize = pageSizeOptions[0],
  defaultSortState = [],
  selectedIds: controlledSelectedIds,
  onSelectionChange,
  isRowSelectionDisabled,
  emptyMessage,
}: DataTableProps<I>) {
  // HOC создаём один раз на экземпляр, иначе Table будет перемонтироваться на каждом рендере.
  const EnhancedTable = React.useMemo(() => withTableSelection(withTableSorting(Table<I>)), []);

  const [sortState, setSortState] = React.useState<TableSortState>(defaultSortState);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(defaultPageSize);
  const [innerSelectedIds, setInnerSelectedIds] = React.useState<string[]>([]);

  const selectedIds = controlledSelectedIds ?? innerSelectedIds;
  const handleSelectionChange = (ids: string[]) => {
    if (controlledSelectedIds === undefined) setInnerSelectedIds(ids);
    onSelectionChange?.(ids);
  };

  const tableColumns = React.useMemo<TableColumnConfig<I>[]>(
    () =>
      columns.map(({ sortable, ...column }) => ({
        ...column,
        meta: { ...column.meta, sort: Boolean(sortable) },
      })),
    [columns],
  );

  const sortedData = React.useMemo(
    () => sortData(data, columns, sortState),
    [data, columns, sortState],
  );

  const total = sortedData.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  // Если данные уменьшились и текущая страница стала пустой — показываем последнюю.
  const safePage = Math.min(page, pageCount);
  const pageData = React.useMemo(
    () => sortedData.slice((safePage - 1) * pageSize, safePage * pageSize),
    [sortedData, safePage, pageSize],
  );

  const handleSortChange = (next: TableSortState) => {
    setSortState(next);
    setPage(1);
  };

  const handlePaginationUpdate = (nextPage: number, nextPageSize: number) => {
    if (nextPageSize !== pageSize) {
      // При смене размера оставляем в поле зрения ту же первую строку.
      const firstIndex = (safePage - 1) * pageSize;
      setPageSize(nextPageSize);
      setPage(Math.floor(firstIndex / nextPageSize) + 1);
    } else {
      setPage(nextPage);
    }
  };

  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, total);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 28 }}>
        <Text variant="body-1" color={selectedIds.length ? 'primary' : 'secondary'}>
          Выбрано: {selectedIds.length} из {total}
        </Text>
        {selectedIds.length > 0 && (
          <Button size="s" view="flat" onClick={() => handleSelectionChange([])}>
            Снять выделение
          </Button>
        )}
      </div>

      <EnhancedTable
        data={pageData}
        columns={tableColumns}
        getRowId={getRowId}
        sortState={sortState}
        onSortStateChange={handleSortChange}
        selectedIds={selectedIds}
        onSelectionChange={handleSelectionChange}
        isRowSelectionDisabled={isRowSelectionDisabled}
        emptyMessage={emptyMessage}
        width="max"
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <Text variant="body-1" color="secondary">
          {total === 0 ? 'Нет записей' : `Показано ${from}–${to} из ${total}`}
        </Text>
        <Pagination
          page={safePage}
          pageSize={pageSize}
          total={total}
          pageSizeOptions={pageSizeOptions}
          onUpdate={handlePaginationUpdate}
          compact
        />
      </div>
    </div>
  );
}
