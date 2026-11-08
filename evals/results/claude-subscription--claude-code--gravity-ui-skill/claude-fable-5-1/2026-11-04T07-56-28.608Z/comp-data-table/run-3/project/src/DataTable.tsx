import React from 'react';
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

import type { UserRow, UserStatus } from './data';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const STATUS_META: Record<UserStatus, { text: string; theme: 'success' | 'warning' | 'danger' }> = {
  active: { text: 'Активен', theme: 'success' },
  pending: { text: 'Ожидает', theme: 'warning' },
  blocked: { text: 'Заблокирован', theme: 'danger' },
};

const numberFormat = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' });
const dateFormat = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium' });

type Comparator = (a: UserRow, b: UserRow) => number;

const byString = (key: 'name' | 'email' | 'role'): Comparator => (a, b) =>
  a[key].localeCompare(b[key], 'ru');

const comparators: Record<string, Comparator> = {
  id: (a, b) => Number(a.id) - Number(b.id),
  name: byString('name'),
  email: byString('email'),
  role: byString('role'),
  status: (a, b) => STATUS_META[a.status].text.localeCompare(STATUS_META[b.status].text, 'ru'),
  createdAt: (a, b) => a.createdAt.localeCompare(b.createdAt),
  balance: (a, b) => a.balance - b.balance,
};

const columns: TableColumnConfig<UserRow>[] = [
  { id: 'id', name: 'ID', width: 80, meta: { sort: comparators.id } },
  { id: 'name', name: 'Имя', primary: true, meta: { sort: comparators.name } },
  { id: 'email', name: 'Email', meta: { sort: comparators.email } },
  { id: 'role', name: 'Роль', meta: { sort: comparators.role } },
  {
    id: 'status',
    name: 'Статус',
    meta: { sort: comparators.status },
    template: (item) => {
      const { text, theme } = STATUS_META[item.status];
      return <Label theme={theme} size="xs">{text}</Label>;
    },
  },
  {
    id: 'createdAt',
    name: 'Создан',
    meta: { sort: comparators.createdAt, defaultSortOrder: 'desc' },
    template: (item) => dateFormat.format(new Date(item.createdAt)),
  },
  {
    id: 'balance',
    name: 'Баланс',
    align: 'end',
    meta: { sort: comparators.balance, defaultSortOrder: 'desc' },
    template: (item) => numberFormat.format(item.balance),
  },
];

// Sorting is controlled so that it applies to the whole dataset before pagination,
// not only to the rows of the current page.
const SelectableSortableTable = withTableSorting(withTableSelection<UserRow>(Table));

function sortRows(rows: UserRow[], sortState: TableSortState): UserRow[] {
  if (sortState.length === 0) return rows;
  const sorted = [...rows];
  sorted.sort((a, b) => {
    for (const { column, order } of sortState) {
      const compare = comparators[column];
      if (!compare) continue;
      const result = compare(a, b);
      if (result !== 0) return order === 'asc' ? result : -result;
    }
    return 0;
  });
  return sorted;
}

export interface DataTableProps {
  rows: UserRow[];
}

export function DataTable({ rows }: DataTableProps) {
  const [sortState, setSortState] = React.useState<TableSortState>([
    { column: 'createdAt', order: 'desc' },
  ]);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(PAGE_SIZE_OPTIONS[1]);

  const sortedRows = React.useMemo(() => sortRows(rows, sortState), [rows, sortState]);

  const pageCount = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = React.useMemo(
    () => sortedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [sortedRows, currentPage, pageSize],
  );

  const handlePaginationUpdate = (nextPage: number, nextPageSize: number) => {
    if (nextPageSize !== pageSize) {
      setPageSize(nextPageSize);
      setPage(1);
    } else {
      setPage(nextPage);
    }
  };

  const firstIndex = sortedRows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastIndex = Math.min(currentPage * pageSize, sortedRows.length);

  return (
    <Flex direction="column" gap={3}>
      <Flex alignItems="center" gap={3} wrap>
        <Text variant="body-1" color="secondary" style={{ flex: 1, minWidth: 0 }}>
          Показано {firstIndex}–{lastIndex} из {sortedRows.length}
        </Text>
        <Text variant="body-1" style={{ flexShrink: 0 }}>
          Выбрано: {selectedIds.length}
        </Text>
        <Button
          view="flat"
          size="m"
          disabled={selectedIds.length === 0}
          onClick={() => setSelectedIds([])}
          style={{ flexShrink: 0 }}
        >
          Снять выделение
        </Button>
      </Flex>

      <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
        <SelectableSortableTable
          data={pageRows}
          columns={columns}
          width="max"
          getRowDescriptor={(item) => ({ id: item.id })}
          sortState={sortState}
          onSortStateChange={setSortState}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          emptyMessage="Нет данных"
          aria-label="Пользователи"
        />
      </div>

      <Flex justifyContent="flex-end">
        <Pagination
          page={currentPage}
          pageSize={pageSize}
          total={sortedRows.length}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onUpdate={handlePaginationUpdate}
          compact={false}
        />
      </Flex>
    </Flex>
  );
}
