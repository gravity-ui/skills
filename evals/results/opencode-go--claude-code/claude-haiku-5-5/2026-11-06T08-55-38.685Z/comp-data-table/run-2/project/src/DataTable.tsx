import * as React from 'react';
import {
  Button,
  Pagination,
  Table,
  Text,
  withTableSelection,
  withTableSorting,
} from '@gravity-ui/uikit';
import type {
  TableColumnConfig,
  TableProps,
  TableSortState,
  WithTableSelectionProps,
  WithTableSortingProps,
} from '@gravity-ui/uikit';

export interface DataTableColumn<T> {
  /** Уникальный id колонки. По умолчанию значение ячейки берётся из поля с этим именем. */
  id: string;
  /** Заголовок колонки. */
  title: string;
  /** Содержимое ячейки. */
  render?: (row: T) => React.ReactNode;
  /** Значение для сортировки. Если не задано, колонка не сортируется. */
  sortValue?: (row: T) => string | number;
  width?: number | string;
  align?: 'start' | 'end';
}

export interface DataTableProps<T> {
  rows: T[];
  columns: DataTableColumn<T>[];
  /**
   * Стабильный уникальный id строки, по которому хранится выделение.
   * Передавайте функцию, вынесенную из рендера (или мемоизированную).
   */
  getRowId: (row: T) => string;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  /** Вызывается при каждом изменении выделенных строк. */
  onSelectionChange?: (ids: string[]) => void;
}

// Типы HOC Gravity привязаны к TableDataItem; здесь используем `any` только
// на границе с библиотекой, а публичный API компонента остаётся обобщённым по T.
type GridProps = TableProps<any> & WithTableSortingProps & WithTableSelectionProps<any>;
const Grid = withTableSelection(withTableSorting(Table)) as unknown as React.ComponentType<GridProps>;

function compareValues(a: string | number, b: string | number): number {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  return String(a).localeCompare(String(b), 'ru', { numeric: true, sensitivity: 'base' });
}

export function DataTable<T extends object>({
  rows,
  columns,
  getRowId,
  pageSizeOptions = [10, 20, 50],
  defaultPageSize = 10,
  onSelectionChange,
}: DataTableProps<T>) {
  const [sortState, setSortState] = React.useState<TableSortState>([]);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(defaultPageSize);

  // Сортировка по всему набору данных (до пагинации). Поддерживает несколько колонок:
  // приоритет у первой в sortState, остальные работают как тай-брейкеры.
  const sortedRows = React.useMemo(() => {
    const rules = sortState.flatMap(({ column, order }) => {
      const sortValue = columns.find((c) => c.id === column)?.sortValue;
      return sortValue ? [{ sortValue, direction: order === 'asc' ? 1 : -1 }] : [];
    });
    if (rules.length === 0) {
      return rows;
    }
    return [...rows].sort((a, b) => {
      for (const { sortValue, direction } of rules) {
        const diff = compareValues(sortValue(a), sortValue(b));
        if (diff !== 0) {
          return diff * direction;
        }
      }
      return 0;
    });
  }, [rows, columns, sortState]);

  const pageCount = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = sortedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const tableColumns = React.useMemo<TableColumnConfig<T>[]>(
    () =>
      columns.map((col) => ({
        id: col.id,
        name: col.title,
        template: col.render ?? ((row: T) => String((row as Record<string, unknown>)[col.id] ?? '')),
        align: col.align,
        width: col.width,
        meta: col.sortValue ? { sort: true } : undefined,
      })),
    [columns],
  );

  const getRowDescriptor = React.useCallback((row: T) => ({ id: getRowId(row) }), [getRowId]);

  const handleSelectionChange = (ids: string[]) => {
    setSelectedIds(ids);
    onSelectionChange?.(ids);
  };

  const handlePaginationUpdate = (nextPage: number, nextPageSize: number) => {
    setPage(nextPage);
    setPageSize(nextPageSize);
  };

  return (
    <div>
      <Grid
        data={pageRows}
        columns={tableColumns}
        width="max"
        emptyMessage="Нет данных"
        getRowDescriptor={getRowDescriptor}
        sortState={sortState}
        onSortStateChange={setSortState}
        selectedIds={selectedIds}
        onSelectionChange={handleSelectionChange}
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginTop: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Text variant="body-1">Выбрано строк: {selectedIds.length}</Text>
          <Button
            view="flat"
            size="s"
            disabled={selectedIds.length === 0}
            onClick={() => handleSelectionChange([])}
          >
            Сбросить выбор
          </Button>
        </div>
        <Pagination
          page={currentPage}
          pageSize={pageSize}
          total={sortedRows.length}
          pageSizeOptions={pageSizeOptions}
          onUpdate={handlePaginationUpdate}
          showInput
        />
      </div>
    </div>
  );
}
