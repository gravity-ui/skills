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
import type {TableColumnConfig, TableSortState} from '@gravity-ui/uikit';

import {EMPLOYEES} from './data';
import type {Employee} from './data';

const SelectableSortableTable = withTableSelection(withTableSorting(Table<Employee>));

const PAGE_SIZE_OPTIONS = [5, 10, 20];

const salaryFormatter = new Intl.NumberFormat('ru-RU');

const columns: TableColumnConfig<Employee>[] = [
  {id: 'name', name: 'Сотрудник', primary: true, meta: {sort: true}},
  {id: 'department', name: 'Отдел', meta: {sort: true}},
  {id: 'position', name: 'Должность', meta: {sort: true}},
  {
    id: 'salary',
    name: 'Зарплата, ₽',
    align: 'end',
    template: (item) => salaryFormatter.format(item.salary),
    meta: {sort: true},
  },
  {id: 'hiredAt', name: 'Дата найма', meta: {sort: true}},
];

function sortEmployees(items: Employee[], sortState: TableSortState): Employee[] {
  if (sortState.length === 0) {
    return items;
  }
  return items.slice().sort((a, b) => {
    for (const {column, order} of sortState) {
      const key = column as keyof Employee;
      const left = a[key];
      const right = b[key];
      const result =
        typeof left === 'number' && typeof right === 'number'
          ? left - right
          : String(left).localeCompare(String(right), 'ru');
      if (result !== 0) {
        return order === 'asc' ? result : -result;
      }
    }
    return 0;
  });
}

const getRowDescriptor = (item: Employee) => ({id: item.id});

export function App() {
  const [sortState, setSortState] = React.useState<TableSortState>([]);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(PAGE_SIZE_OPTIONS[1]);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // Sorting is applied to the whole dataset first, then the page is sliced out.
  const sorted = React.useMemo(() => sortEmployees(EMPLOYEES, sortState), [sortState]);
  const pageItems = React.useMemo(
    () => sorted.slice((page - 1) * pageSize, page * pageSize),
    [sorted, page, pageSize],
  );

  // The table reports the selection of the visible page only; merge it with
  // the selection made on other pages so it survives sorting and pagination.
  const handleSelectionChange = React.useCallback(
    (pageSelectedIds: string[]) => {
      const pageIds = new Set(pageItems.map((item) => item.id));
      setSelectedIds((prev) => [...prev.filter((id) => !pageIds.has(id)), ...pageSelectedIds]);
    },
    [pageItems],
  );

  const handlePaginationUpdate = React.useCallback(
    (nextPage: number, nextPageSize: number) => {
      setPage(nextPage);
      setPageSize(nextPageSize);
    },
    [],
  );

  return (
    <Flex direction="column" gap={4} style={{padding: 24, maxWidth: 1000}}>
      <Text variant="header-1">Сотрудники</Text>

      <Flex alignItems="center" gap={3} style={{minHeight: 28}}>
        <Text variant="body-2" color="secondary">
          Выбрано: {selectedIds.length} из {EMPLOYEES.length}
        </Text>
        {selectedIds.length > 0 && (
          <Button view="flat" size="s" onClick={() => setSelectedIds([])}>
            Сбросить выделение
          </Button>
        )}
      </Flex>

      <div style={{overflowX: 'auto', maxWidth: '100%'}}>
        <SelectableSortableTable
          data={pageItems}
          columns={columns}
          getRowDescriptor={getRowDescriptor}
          sortState={sortState}
          onSortStateChange={setSortState}
          selectedIds={selectedIds}
          onSelectionChange={handleSelectionChange}
          emptyMessage="Нет данных"
        />
      </div>

      <Pagination
        page={page}
        pageSize={pageSize}
        total={sorted.length}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        onUpdate={handlePaginationUpdate}
      />
    </Flex>
  );
}
