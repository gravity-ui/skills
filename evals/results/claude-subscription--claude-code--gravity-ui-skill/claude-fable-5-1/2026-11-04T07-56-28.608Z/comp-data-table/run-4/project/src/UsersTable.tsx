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
  type TableColumnConfig,
  type TableSortState,
} from '@gravity-ui/uikit';

import type { User, UserStatus } from './data';

const DataTable = withTableSelection(withTableSorting(Table<User>));

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const STATUS_LABELS: Record<UserStatus, { text: string; theme: 'success' | 'warning' | 'danger' }> = {
  active: { text: 'Активен', theme: 'success' },
  pending: { text: 'Ожидает', theme: 'warning' },
  blocked: { text: 'Заблокирован', theme: 'danger' },
};

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const columns: TableColumnConfig<User>[] = [
  { id: 'id', name: 'ID', width: 64, align: 'end', meta: { sort: true } },
  { id: 'name', name: 'Имя', primary: true, meta: { sort: true } },
  { id: 'email', name: 'Email', meta: { sort: true } },
  { id: 'department', name: 'Отдел', meta: { sort: true } },
  {
    id: 'status',
    name: 'Статус',
    template: (user) => {
      const { text, theme } = STATUS_LABELS[user.status];
      return <Label theme={theme}>{text}</Label>;
    },
    meta: { sort: true },
  },
  { id: 'age', name: 'Возраст', align: 'end', width: 96, meta: { sort: true } },
  {
    id: 'createdAt',
    name: 'Создан',
    template: (user) => dateFormatter.format(new Date(user.createdAt)),
    meta: { sort: true, defaultSortOrder: 'desc' },
  },
];

function compareUsers(a: User, b: User, column: string): number {
  switch (column) {
    case 'id':
    case 'age':
      return Number(a[column]) - Number(b[column]);
    case 'createdAt':
      return a.createdAt.localeCompare(b.createdAt);
    case 'status':
      return STATUS_LABELS[a.status].text.localeCompare(STATUS_LABELS[b.status].text, 'ru');
    case 'name':
    case 'email':
    case 'department':
      return a[column].localeCompare(b[column], 'ru');
    default:
      return 0;
  }
}

function sortUsers(users: User[], sortState: TableSortState): User[] {
  if (sortState.length === 0) {
    return users;
  }
  return [...users].sort((a, b) => {
    for (const { column, order } of sortState) {
      const result = compareUsers(a, b, column);
      if (result !== 0) {
        return order === 'asc' ? result : -result;
      }
    }
    return 0;
  });
}

interface UsersTableProps {
  users: User[];
}

export function UsersTable({ users }: UsersTableProps) {
  const [sortState, setSortState] = useState<TableSortState>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Sorting is applied to the whole dataset (not just the visible page), so the
  // HOC's own per-page sorting is disabled and the state is controlled here.
  const sortedUsers = useMemo(() => sortUsers(users, sortState), [users, sortState]);

  const pageCount = Math.max(1, Math.ceil(sortedUsers.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageUsers = useMemo(
    () => sortedUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [sortedUsers, currentPage, pageSize],
  );

  const handleSortStateChange = (nextState: TableSortState) => {
    setSortState(nextState);
    setPage(1);
  };

  const handlePaginationUpdate = (nextPage: number, nextPageSize: number) => {
    setPage(nextPageSize === pageSize ? nextPage : 1);
    setPageSize(nextPageSize);
  };

  return (
    <Flex direction="column" gap={4}>
      <Flex alignItems="center" gap={3}>
        <Text variant="body-1" color="secondary" style={{ flex: 1, minWidth: 0 }}>
          Выбрано строк: {selectedIds.length} из {users.length}
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
        <DataTable
          data={pageUsers}
          columns={columns}
          getRowDescriptor={(user) => ({ id: user.id })}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          sortState={sortState}
          onSortStateChange={handleSortStateChange}
          disableDataSorting
          emptyMessage="Нет данных"
          width="max"
        />
      </div>

      <Flex justifyContent="space-between" alignItems="center" gap={3} wrap>
        <Text variant="body-1" color="secondary">
          Показано {pageUsers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–
          {(currentPage - 1) * pageSize + pageUsers.length} из {sortedUsers.length}
        </Text>
        <Pagination
          page={currentPage}
          pageSize={pageSize}
          total={sortedUsers.length}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onUpdate={handlePaginationUpdate}
          showInput
          compact
        />
      </Flex>
    </Flex>
  );
}
