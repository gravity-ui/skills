import { useMemo, useState } from 'react';
import {
  Button,
  Flex,
  Label,
  Pagination,
  Table,
  Text,
  withTableSelection,
  withTableSorting,
} from '@gravity-ui/uikit';
import type { TableColumnConfig, TableSortState } from '@gravity-ui/uikit';

import { generateEmployees } from './data';
import type { Employee, EmployeeStatus } from './data';

const EmployeesTable = withTableSelection(withTableSorting<Employee>(Table));

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const STATUS_LABELS: Record<EmployeeStatus, { text: string; theme: 'success' | 'warning' | 'danger' }> = {
  active: { text: 'Работает', theme: 'success' },
  vacation: { text: 'В отпуске', theme: 'warning' },
  blocked: { text: 'Заблокирован', theme: 'danger' },
};

const currencyFormat = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});
const dateFormat = new Intl.DateTimeFormat('ru-RU');

const compareStrings = (a: string, b: string) => a.localeCompare(b, 'ru');

/** Comparators for every sortable column; each one sorts in ascending order. */
const COMPARATORS: Partial<Record<keyof Employee, (a: Employee, b: Employee) => number>> = {
  name: (a, b) => compareStrings(a.name, b.name),
  email: (a, b) => compareStrings(a.email, b.email),
  department: (a, b) => compareStrings(a.department, b.department),
  status: (a, b) => compareStrings(STATUS_LABELS[a.status].text, STATUS_LABELS[b.status].text),
  salary: (a, b) => a.salary - b.salary,
  hiredAt: (a, b) => a.hiredAt.localeCompare(b.hiredAt),
};

const columns: TableColumnConfig<Employee>[] = [
  { id: 'name', name: 'Сотрудник', primary: true, meta: { sort: true } },
  { id: 'email', name: 'Email', meta: { sort: true } },
  { id: 'department', name: 'Отдел', meta: { sort: true } },
  {
    id: 'status',
    name: 'Статус',
    meta: { sort: true },
    template: (item) => {
      const { text, theme } = STATUS_LABELS[item.status];
      return <Label theme={theme} size="xs">{text}</Label>;
    },
  },
  {
    id: 'salary',
    name: 'Оклад',
    align: 'end',
    meta: { sort: true, defaultSortOrder: 'desc' },
    template: (item) => currencyFormat.format(item.salary),
  },
  {
    id: 'hiredAt',
    name: 'Дата найма',
    align: 'end',
    meta: { sort: true },
    template: (item) => dateFormat.format(new Date(item.hiredAt)),
  },
];

const employees = generateEmployees(57);

function sortEmployees(data: Employee[], sortState: TableSortState): Employee[] {
  if (sortState.length === 0) {
    return data;
  }
  return data.slice().sort((a, b) => {
    for (const { column, order } of sortState) {
      const compare = COMPARATORS[column as keyof Employee];
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
  const [sortState, setSortState] = useState<TableSortState>([{ column: 'name', order: 'asc' }]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const sortedEmployees = useMemo(() => sortEmployees(employees, sortState), [sortState]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedEmployees.slice(start, start + pageSize);
  }, [sortedEmployees, page, pageSize]);

  const handlePaginationUpdate = (nextPage: number, nextPageSize: number) => {
    const lastPage = Math.max(1, Math.ceil(employees.length / nextPageSize));
    setPageSize(nextPageSize);
    setPage(Math.min(Math.max(1, nextPage), lastPage));
  };

  return (
    <Flex direction="column" gap={4} style={{ padding: 'var(--g-spacing-6)' }}>
      <Flex alignItems="center" justifyContent="space-between" gap={4}>
        <Text variant="header-1">Сотрудники</Text>
        <Flex alignItems="center" gap={3} style={{ flexShrink: 0 }}>
          <Text color="secondary">
            Выбрано: {selectedIds.length} из {employees.length}
          </Text>
          <Button view="outlined" disabled={selectedIds.length === 0} onClick={() => setSelectedIds([])}>
            Снять выделение
          </Button>
        </Flex>
      </Flex>

      <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
        <EmployeesTable
          data={pageItems}
          columns={columns}
          width="max"
          getRowDescriptor={(item) => ({ id: item.id })}
          sortState={sortState}
          onSortStateChange={setSortState}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          isRowSelectionDisabled={(item) => item.status === 'blocked'}
          emptyMessage="Нет данных"
        />
      </div>

      <Flex alignItems="center" justifyContent="space-between" gap={4} wrap>
        <Text color="secondary">
          Показано {pageItems.length === 0 ? 0 : (page - 1) * pageSize + 1}–
          {(page - 1) * pageSize + pageItems.length} из {employees.length}
        </Text>
        <Pagination
          page={page}
          pageSize={pageSize}
          total={employees.length}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onUpdate={handlePaginationUpdate}
          compact={false}
        />
      </Flex>
    </Flex>
  );
}
