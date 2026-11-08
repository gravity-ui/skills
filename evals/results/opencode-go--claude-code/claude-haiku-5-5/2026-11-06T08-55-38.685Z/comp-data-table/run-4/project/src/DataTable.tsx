import * as React from 'react';
import {
  Button,
  DescriptorType,
  Pagination,
  Table,
  TableColumnConfig,
  TableDataItem,
  TableSortState,
  Text,
  withTableSelection,
  withTableSorting,
} from '@gravity-ui/uikit';

export interface DataTableColumn<T> {
  id: string;
  name: string;
  /** Значение для сортировки. Если не задано, колонка не сортируется. */
  sortValue?: (row: T) => string | number;
  /** Содержимое ячейки. По умолчанию выводится значение поля с именем `id`. */
  render?: (row: T) => React.ReactNode;
  align?: 'start' | 'end';
}

export interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: DataTableColumn<T>[];
  pageSizeOptions?: number[];
  initialPageSize?: number;
}

// Таблица с уже подключёнными чекбоксами выбора и сортировкой из uikit.
// Сортировка и выбор управляются здесь, поэтому работают по всему набору данных,
// а не только по текущей странице.
const SelectableSortableTable = withTableSelection(withTableSorting(Table)) as React.ComponentType<
  React.ComponentProps<typeof Table> & {
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
    sortState: TableSortState;
    onSortStateChange: (sortState: TableSortState) => void;
  }
>;

function compareSortValues(a: string | number, b: string | number): number {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  return String(a).localeCompare(String(b), 'ru', { numeric: true, sensitivity: 'base' });
}

const getRowDescriptor = (row: { id: string }): DescriptorType => ({ id: row.id, interactive: true });

export function DataTable<T extends { id: string }>({
  data,
  columns,
  pageSizeOptions = [5, 10, 20, 50],
  initialPageSize = 10,
}: DataTableProps<T>) {
  const [sort, setSort] = React.useState<TableSortState>([]);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(initialPageSize);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const sortedData = React.useMemo(() => {
    const rules = sort.flatMap(({ column, order }) => {
      const sortValue = columns.find((c) => c.id === column)?.sortValue;
      return sortValue ? [{ sortValue, direction: order === 'asc' ? 1 : -1 }] : [];
    });
    if (rules.length === 0) {
      return data;
    }
    return [...data].sort((a, b) => {
      for (const { sortValue, direction } of rules) {
        const result = compareSortValues(sortValue(a), sortValue(b));
        if (result !== 0) {
          return result * direction;
        }
      }
      return 0;
    });
  }, [data, columns, sort]);

  // Если размер страницы или данные изменились, номер страницы ограничивается допустимым диапазоном.
  const total = sortedData.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Выбор хранится по id, поэтому сохраняется при переходе между страницами.
  // Id, которых уже нет в данных, отбрасываются.
  const rowIds = new Set(data.map((row) => row.id));
  const selected = selectedIds.filter((id) => rowIds.has(id));

  const tableColumns = React.useMemo<TableColumnConfig<T>[]>(
    () =>
      columns.map(({ id, name, sortValue, render, align }) => ({
        id,
        name,
        align,
        template: render ? (row: T) => render(row) : undefined,
        meta: sortValue
          ? { sort: (a: T, b: T) => compareSortValues(sortValue(a), sortValue(b)) }
          : undefined,
      })),
    [columns],
  );

  const rangeStart = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, total);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        <Text variant="body-2">Выбрано: {selected.length}</Text>
        <Button
          view="flat"
          size="s"
          disabled={selected.length === 0}
          onClick={() => setSelectedIds([])}
        >
          Сбросить выбор
        </Button>
      </div>

      <SelectableSortableTable
        data={pageRows as TableDataItem[]}
        columns={tableColumns as TableColumnConfig<TableDataItem>[]}
        getRowDescriptor={getRowDescriptor as (item: TableDataItem) => DescriptorType}
        width="max"
        selectedIds={selected}
        onSelectionChange={setSelectedIds}
        sortState={sort}
        onSortStateChange={setSort}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginTop: 12,
          flexWrap: 'wrap',
        }}
      >
        <Text variant="body-1" color="secondary">
          {rangeStart}–{rangeEnd} из {total}
        </Text>
        <Pagination
          page={currentPage}
          pageSize={pageSize}
          total={total}
          pageSizeOptions={pageSizeOptions}
          showInput
          onUpdate={(nextPage, nextPageSize) => {
            setPage(nextPage);
            setPageSize(nextPageSize);
          }}
        />
      </div>
    </div>
  );
}
