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
import type {TableColumnConfig, TableProps, TableSortState} from '@gravity-ui/uikit';

import {USERS} from './data';
import type {User, UserStatus} from './data';

const SortableTable = withTableSorting<User>(
  Table as unknown as React.ComponentType<TableProps<User>>,
);
const DataTable = withTableSelection(SortableTable);

const collator = new Intl.Collator('en');

const balanceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const STATUS_LABEL_THEME: Record<UserStatus, 'success' | 'warning' | 'danger'> = {
  active: 'success',
  pending: 'warning',
  blocked: 'danger',
};

const STATUS_TEXT: Record<UserStatus, string> = {
  active: 'Active',
  pending: 'Pending',
  blocked: 'Blocked',
};

type Comparator = (a: User, b: User) => number;

const COMPARATORS: Record<string, Comparator> = {
  name: (a, b) => collator.compare(a.name, b.name),
  email: (a, b) => collator.compare(a.email, b.email),
  role: (a, b) => collator.compare(a.role, b.role),
  age: (a, b) => a.age - b.age,
  city: (a, b) => collator.compare(a.city, b.city),
  balance: (a, b) => a.balance - b.balance,
  status: (a, b) => collator.compare(a.status, b.status),
};

const columns: TableColumnConfig<User>[] = [
  {
    id: 'name',
    name: 'Name',
    primary: true,
    meta: {sort: COMPARATORS.name},
  },
  {
    id: 'email',
    name: 'Email',
    meta: {sort: COMPARATORS.email},
  },
  {
    id: 'role',
    name: 'Role',
    meta: {sort: COMPARATORS.role},
  },
  {
    id: 'age',
    name: 'Age',
    align: 'end',
    meta: {sort: COMPARATORS.age, defaultSortOrder: 'desc'},
  },
  {
    id: 'city',
    name: 'City',
    meta: {sort: COMPARATORS.city},
  },
  {
    id: 'balance',
    name: 'Balance',
    align: 'end',
    template: (item) => balanceFormatter.format(item.balance),
    meta: {sort: COMPARATORS.balance},
  },
  {
    id: 'status',
    name: 'Status',
    template: (item) => (
      <Label theme={STATUS_LABEL_THEME[item.status]}>{STATUS_TEXT[item.status]}</Label>
    ),
    meta: {sort: COMPARATORS.status},
  },
];

function sortUsers(users: User[], sortState: TableSortState): User[] {
  if (sortState.length === 0) {
    return users;
  }
  return users.slice().sort((a, b) => {
    for (const {column, order} of sortState) {
      const compare = COMPARATORS[column];
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
  const [sortState, setSortState] = React.useState<TableSortState>([
    {column: 'name', order: 'asc'},
  ]);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const sortedData = React.useMemo(() => sortUsers(USERS, sortState), [sortState]);

  const pageCount = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageData = React.useMemo(
    () => sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [sortedData, currentPage, pageSize],
  );

  const handleSortStateChange = (next: TableSortState) => {
    setSortState(next);
    setPage(1);
  };

  const handlePaginationUpdate = (nextPage: number, nextPageSize: number) => {
    setPage(nextPage);
    setPageSize(nextPageSize);
  };

  const rangeStart = sortedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, sortedData.length);

  return (
    <div style={{maxWidth: 1100, margin: '0 auto', padding: 24}}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <Text variant="header-1">Users</Text>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <Text variant="body-1" color="secondary">
            Selected: {selectedIds.length}
          </Text>
          <Button
            view="outlined"
            size="m"
            disabled={selectedIds.length === 0}
            onClick={() => setSelectedIds([])}
          >
            Clear selection
          </Button>
        </div>
      </div>

      <DataTable
        data={pageData}
        columns={columns}
        width="max"
        sortState={sortState}
        onSortStateChange={handleSortStateChange}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getRowDescriptor={(item) => ({id: item.id})}
        emptyMessage="No data"
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginTop: 16,
        }}
      >
        <Text variant="body-1" color="secondary">
          {rangeStart}–{rangeEnd} of {sortedData.length}
        </Text>
        <Pagination
          page={currentPage}
          pageSize={pageSize}
          total={sortedData.length}
          pageSizeOptions={[5, 10, 20, 50]}
          onUpdate={handlePaginationUpdate}
          showInput
          compact
        />
      </div>
    </div>
  );
}
