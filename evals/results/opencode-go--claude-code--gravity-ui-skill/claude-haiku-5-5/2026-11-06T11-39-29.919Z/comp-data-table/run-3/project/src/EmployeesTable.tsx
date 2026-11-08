import { useMemo, useState } from 'react';
import {
  Button,
  Flex,
  Pagination,
  Table,
  Text,
  withTableSelection,
  withTableSorting,
} from '@gravity-ui/uikit';
import type { TableColumnConfig, TableSortState } from '@gravity-ui/uikit';

type Employee = {
  id: string;
  name: string;
  department: string;
  salary: number;
  hiredAt: string;
};

const PAGE_SIZE_OPTIONS = [5, 10, 20];

const FIRST_NAMES = ['Анна', 'Иван', 'Мария', 'Алексей', 'Ольга', 'Дмитрий', 'Елена'];
const LAST_NAMES = ['Смирнова', 'Петров', 'Кузнецова', 'Соколов', 'Попова'];
const DEPARTMENTS = ['Разработка', 'Дизайн', 'Маркетинг', 'Продажи', 'Аналитика'];

// Deterministic demo data (no Math.random) so the table is stable between reloads.
const EMPLOYEES: Employee[] = Array.from({ length: 28 }, (_, i) => ({
  id: String(i + 1),
  name: `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length]}`,
  department: DEPARTMENTS[(i * 3) % DEPARTMENTS.length],
  salary: 80_000 + ((i * 7919) % 90) * 1_000,
  hiredAt: `${2014 + (i % 11)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 27) + 1).padStart(2, '0')}`,
}));

const columns: TableColumnConfig<Employee>[] = [
  { id: 'name', name: 'Сотрудник', meta: { sort: true } },
  { id: 'department', name: 'Отдел', meta: { sort: true } },
  {
    id: 'salary',
    name: 'Зарплата',
    align: 'end',
    meta: { sort: true },
    template: (item) => `${new Intl.NumberFormat('ru-RU').format(item.salary)} ₽`,
  },
  {
    id: 'hiredAt',
    name: 'Дата найма',
    meta: { sort: true },
    // ISO "YYYY-MM-DD" -> "DD.MM.YYYY" without Date parsing (avoids timezone shifts).
    template: (item) => item.hiredAt.split('-').reverse().join('.'),
  },
];

// Sorting is controlled (see EmployeesTable below), so the HOC does not sort
// data itself — we sort the full dataset here and paginate afterwards.
const EnhancedTable = withTableSelection(withTableSorting<Employee>(Table));

function compareValues(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  return String(a).localeCompare(String(b), 'ru');
}

function sortRows(rows: Employee[], sortState: TableSortState): Employee[] {
  if (sortState.length === 0) {
    return rows;
  }
  return [...rows].sort((a, b) => {
    for (const { column, order } of sortState) {
      const diff = compareValues(
        (a as Record<string, unknown>)[column],
        (b as Record<string, unknown>)[column],
      );
      if (diff !== 0) {
        return order === 'asc' ? diff : -diff;
      }
    }
    return 0;
  });
}

export function EmployeesTable() {
  const [sortState, setSortState] = useState<TableSortState>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[1]);

  const sortedRows = useMemo(() => sortRows(EMPLOYEES, sortState), [sortState]);

  // Clamp in case the page becomes out of range (e.g. after a page size change).
  const pageCount = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = sortedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <Flex direction="column" gap={4}>
      <Flex alignItems="center" justifyContent="space-between" gap={2}>
        <Text variant="body-1">Выбрано строк: {selectedIds.length}</Text>
        <Button
          view="flat"
          size="m"
          disabled={selectedIds.length === 0}
          onClick={() => setSelectedIds([])}
        >
          Сбросить выбор
        </Button>
      </Flex>

      <EnhancedTable
        data={pageRows}
        columns={columns}
        getRowId={(item) => item.id}
        emptyMessage="Нет данных"
        sortState={sortState}
        onSortStateChange={setSortState}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      <Pagination
        page={currentPage}
        pageSize={pageSize}
        total={sortedRows.length}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        onUpdate={(nextPage, nextPageSize) => {
          setPage(nextPage);
          setPageSize(nextPageSize);
        }}
      />
    </Flex>
  );
}
