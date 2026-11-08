import { useMemo, useState } from 'react';

import {
  Pagination,
  Table,
  withTableSelection,
  withTableSorting,
  type TableColumnConfig,
  type TableSortState,
} from '@gravity-ui/uikit';

type Employee = {
  id: string;
  name: string;
  role: string;
  team: string;
  startedAt: string;
  rating: number;
};

const employees: Employee[] = [
  { id: '1', name: 'Anna Volkova', role: 'Product designer', team: 'Growth', startedAt: '2022-03-14', rating: 4.6 },
  { id: '2', name: 'Dmitry Ivanov', role: 'Frontend developer', team: 'Core', startedAt: '2021-09-01', rating: 4.2 },
  { id: '3', name: 'Elena Petrova', role: 'QA engineer', team: 'Core', startedAt: '2023-01-23', rating: 4.8 },
  { id: '4', name: 'Igor Sokolov', role: 'Backend developer', team: 'Payments', startedAt: '2020-06-15', rating: 4.4 },
  { id: '5', name: 'Marina Kuznetsova', role: 'Product manager', team: 'Growth', startedAt: '2022-11-07', rating: 4.1 },
  { id: '6', name: 'Nikita Orlov', role: 'Frontend developer', team: 'Payments', startedAt: '2021-02-08', rating: 3.9 },
  { id: '7', name: 'Olga Smirnova', role: 'Data analyst', team: 'Analytics', startedAt: '2023-04-03', rating: 4.7 },
  { id: '8', name: 'Pavel Lebedev', role: 'Backend developer', team: 'Core', startedAt: '2020-10-19', rating: 4.5 },
  { id: '9', name: 'Sofia Morozova', role: 'UX researcher', team: 'Growth', startedAt: '2022-07-25', rating: 4.3 },
  { id: '10', name: 'Timur Galiev', role: 'DevOps engineer', team: 'Infrastructure', startedAt: '2021-12-13', rating: 4.0 },
  { id: '11', name: 'Yulia Chernova', role: 'Product designer', team: 'Core', startedAt: '2023-08-28', rating: 4.9 },
  { id: '12', name: 'Artem Belov', role: 'Data engineer', team: 'Analytics', startedAt: '2020-04-30', rating: 4.2 },
];

type SortableColumn<T> = TableColumnConfig<T> & {
  meta?: {
    sort?: (left: T, right: T) => number;
    defaultSortOrder?: 'asc' | 'desc';
  };
};

const SelectableSortableTable = withTableSorting(withTableSelection<Employee>(Table));

const columns: SortableColumn<Employee>[] = [
  {
    id: 'name',
    name: 'Name',
    meta: { sort: (left, right) => left.name.localeCompare(right.name) },
  },
  {
    id: 'role',
    name: 'Role',
    meta: { sort: (left, right) => left.role.localeCompare(right.role) },
  },
  {
    id: 'team',
    name: 'Team',
    meta: { sort: (left, right) => left.team.localeCompare(right.team) },
  },
  {
    id: 'startedAt',
    name: 'Start date',
    meta: { sort: (left, right) => left.startedAt.localeCompare(right.startedAt) },
  },
  {
    id: 'rating',
    name: 'Rating',
    align: 'end',
    meta: { sort: (left, right) => left.rating - right.rating },
  },
];

export function App() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [sortState, setSortState] = useState<TableSortState>([
    { column: 'name', order: 'asc' },
  ]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const sortedEmployees = useMemo(() => {
    const activeSort = sortState[0];

    if (!activeSort) {
      return employees;
    }

    const sort = columns.find(({ id }) => id === activeSort.column)?.meta?.sort;

    if (!sort) {
      return employees;
    }

    return [...employees].sort((left, right) => {
      const result = sort(left, right);
      return activeSort.order === 'desc' ? -result : result;
    });
  }, [sortState]);

  const pageEmployees = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return sortedEmployees.slice(startIndex, startIndex + pageSize);
  }, [page, pageSize, sortedEmployees]);

  const updatePage = (nextPage: number, nextPageSize: number) => {
    setPage(nextPage);
    if (nextPageSize !== pageSize) {
      setPage(1);
    }
    setPageSize(nextPageSize);
  };

  return (
    <main style={{ padding: '24px', maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 20px', fontSize: 24, fontWeight: 600 }}>Employees</h1>
      <SelectableSortableTable
        columns={columns}
        data={pageEmployees}
        getRowId={(employee) => employee.id}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        sortState={sortState}
        onSortStateChange={setSortState}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
        <Pagination
          page={page}
          pageSize={pageSize}
          pageSizeOptions={[5, 10, 20]}
          total={employees.length}
          onUpdate={updatePage}
        />
      </div>
    </main>
  );
}
