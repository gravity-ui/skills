import React from 'react';

import {
  Button,
  Label,
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

import type {Employee, EmployeeStatus} from './data';
import {employees} from './data';

// Сначала добавляем колонку с чекбоксами, затем — сортировку заголовков
const TableWithSelection = withTableSelection<Employee>(Table);
const DataTable = withTableSorting<Employee, WithTableSelectionProps<Employee>>(TableWithSelection);

type SortComparator = (a: Employee, b: Employee) => number;

const SORT_COMPARATORS: Record<string, SortComparator> = {
  name: (a, b) => a.name.localeCompare(b.name, 'ru'),
  email: (a, b) => a.email.localeCompare(b.email),
  department: (a, b) => a.department.localeCompare(b.department, 'ru'),
  salary: (a, b) => a.salary - b.salary,
  hiredAt: (a, b) => a.hiredAt.localeCompare(b.hiredAt),
  status: (a, b) => a.status.localeCompare(b.status),
};

const STATUS_LABEL: Record<EmployeeStatus, string> = {
  active: 'Работает',
  vacation: 'Отпуск',
  fired: 'Уволен',
};

const STATUS_THEME: Record<EmployeeStatus, 'success' | 'warning' | 'danger'> = {
  active: 'success',
  vacation: 'warning',
  fired: 'danger',
};

const columns: TableColumnConfig<Employee>[] = [
  {
    id: 'name',
    name: 'Сотрудник',
    primary: true,
    meta: {sort: SORT_COMPARATORS.name},
  },
  {
    id: 'email',
    name: 'Email',
    meta: {sort: SORT_COMPARATORS.email},
  },
  {
    id: 'department',
    name: 'Отдел',
    meta: {sort: SORT_COMPARATORS.department},
  },
  {
    id: 'position',
    name: 'Должность',
  },
  {
    id: 'salary',
    name: 'Зарплата',
    align: 'end',
    template: (item) => `${item.salary.toLocaleString('ru-RU')} ₽`,
    meta: {sort: SORT_COMPARATORS.salary},
  },
  {
    id: 'hiredAt',
    name: 'Дата найма',
    template: (item) => new Date(`${item.hiredAt}T00:00:00`).toLocaleDateString('ru-RU'),
    meta: {sort: SORT_COMPARATORS.hiredAt},
  },
  {
    id: 'status',
    name: 'Статус',
    template: (item) => (
      <Label theme={STATUS_THEME[item.status]}>{STATUS_LABEL[item.status]}</Label>
    ),
    meta: {sort: SORT_COMPARATORS.status},
  },
];

const DEFAULT_SORT_STATE: TableSortState = [{column: 'name', order: 'asc'}];
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

function sortEmployees(data: Employee[], sortState: TableSortState): Employee[] {
  if (sortState.length === 0) {
    return data;
  }
  return [...data].sort((a, b) => {
    for (const {column, order} of sortState) {
      const compare = SORT_COMPARATORS[column];
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

export function App() {
  const [sortState, setSortState] = React.useState<TableSortState>(DEFAULT_SORT_STATE);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const sortedData = React.useMemo(() => sortEmployees(employees, sortState), [sortState]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSortStateChange = (nextSortState: TableSortState) => {
    setSortState(nextSortState);
    setPage(1);
  };

  const handlePaginationUpdate = (nextPage: number, nextPageSize: number) => {
    setPage(nextPage);
    setPageSize(nextPageSize);
  };

  return (
    <div style={{maxWidth: 1100, margin: '0 auto', padding: 24}}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 16,
        }}
      >
        <Text variant="header-1">Сотрудники</Text>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <Text variant="body-1" color="secondary">
            Выбрано: {selectedIds.length}
          </Text>
          <Button
            view="outlined"
            size="m"
            disabled={selectedIds.length === 0}
            onClick={() => setSelectedIds([])}
          >
            Сбросить выбор
          </Button>
        </div>
      </div>

      <DataTable
        data={pageData}
        columns={columns}
        width="max"
        emptyMessage="Нет данных"
        sortState={sortState}
        onSortStateChange={handleSortStateChange}
        disableDataSorting
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getRowDescriptor={(item) => ({id: item.id, interactive: true})}
      />

      <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 16}}>
        <Pagination
          page={currentPage}
          pageSize={pageSize}
          total={sortedData.length}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          showInput
          onUpdate={handlePaginationUpdate}
        />
      </div>
    </div>
  );
}
