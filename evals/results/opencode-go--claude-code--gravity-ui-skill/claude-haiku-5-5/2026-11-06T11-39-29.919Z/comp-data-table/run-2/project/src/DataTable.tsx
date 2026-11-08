import * as React from 'react';
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
  TableSortState,
  WithTableSelectionProps,
} from '@gravity-ui/uikit';

import {LEVEL_LABELS} from './data';
import type {Employee} from './data';

type Comparator = (a: Employee, b: Employee) => number;

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const currencyFormat = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

/** ISO `YYYY-MM-DD` → `DD.MM.YYYY` без сдвига часового пояса. */
const formatDate = (iso: string) => iso.split('-').reverse().join('.');

/**
 * Колонки. `meta.sort` — компаратор сортировки. Сортировку выполняем сами
 * (см. sortEmployees), поэтому HOC `withTableSorting` работает в управляемом
 * режиме и только рисует заголовки с индикатором.
 */
const COLUMNS: TableColumnConfig<Employee>[] = [
  {
    id: 'name',
    name: 'Сотрудник',
    meta: {sort: (a: Employee, b: Employee) => a.name.localeCompare(b.name, 'ru')},
  },
  {
    id: 'department',
    name: 'Отдел',
    meta: {sort: (a: Employee, b: Employee) => a.department.localeCompare(b.department, 'ru')},
  },
  {
    id: 'level',
    name: 'Уровень',
    template: (item: Employee) => LEVEL_LABELS[item.level],
    meta: {sort: (a: Employee, b: Employee) => a.level - b.level},
  },
  {
    id: 'salary',
    name: 'Зарплата',
    align: 'end',
    template: (item: Employee) => currencyFormat.format(item.salary),
    meta: {sort: (a: Employee, b: Employee) => a.salary - b.salary},
  },
  {
    id: 'hiredAt',
    name: 'Дата найма',
    template: (item: Employee) => formatDate(item.hiredAt),
    meta: {sort: (a: Employee, b: Employee) => a.hiredAt.localeCompare(b.hiredAt)},
  },
];

/** Сортирует весь набор по приоритету колонок (первая в sortState — главная). */
function sortEmployees(rows: Employee[], sortState: TableSortState): Employee[] {
  if (sortState.length === 0) {
    return rows;
  }
  return rows.slice().sort((a, b) => {
    for (const {column, order} of sortState) {
      const compare = COLUMNS.find((c) => c.id === column)?.meta?.sort as Comparator | undefined;
      if (!compare) {
        continue;
      }
      const result = compare(a, b);
      if (result !== 0) {
        return order === 'asc' ? result : -result;
      }
    }
    return 0;
  });
}

// HOC создаются один раз на уровне модуля. Сортировка — внешний слой, выбор — внутренний
// (колонка чекбоксов добавляется внутри и не имеет meta.sort).
const SelectableTable = withTableSelection<Employee>(Table);
const SelectableSortableTable = withTableSorting<Employee, WithTableSelectionProps<Employee>>(
  SelectableTable,
);

/** Стабильный id строки: без него id был бы индексом на текущей странице. */
const getRowDescriptor = (row: Employee) => ({id: row.id});

export function DataTable({rows}: {rows: Employee[]}) {
  const [sortState, setSortState] = React.useState<TableSortState>([]);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(PAGE_SIZE_OPTIONS[0]);

  const sortedRows = React.useMemo(() => sortEmployees(rows, sortState), [rows, sortState]);

  const pageCount = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = React.useMemo(
    () => sortedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [sortedRows, currentPage, pageSize],
  );

  // Смена сортировки меняет состав страниц, поэтому возвращаемся на первую.
  const handleSortStateChange = (next: TableSortState) => {
    setSortState(next);
    setPage(1);
  };

  const handlePaginationUpdate = (nextPage: number, nextPageSize: number) => {
    setPage(nextPage);
    setPageSize(nextPageSize);
  };

  return (
    <Flex direction="column" gap={3}>
      <Flex alignItems="center" justifyContent="space-between" gap={3}>
        <Text variant="body-1">Выбрано строк: {selectedIds.length}</Text>
        <Button
          view="flat"
          disabled={selectedIds.length === 0}
          onClick={() => setSelectedIds([])}
        >
          Снять выделение
        </Button>
      </Flex>

      <SelectableSortableTable
        data={pageRows}
        columns={COLUMNS}
        getRowDescriptor={getRowDescriptor}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        sortState={sortState}
        onSortStateChange={handleSortStateChange}
        emptyMessage="Нет данных"
      />

      <Pagination
        page={currentPage}
        pageSize={pageSize}
        total={sortedRows.length}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        onUpdate={handlePaginationUpdate}
      />
    </Flex>
  );
}
