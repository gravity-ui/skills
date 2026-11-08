import { useState, useMemo } from 'react';
import {
  Table,
  withTableSorting,
  withTableSelection,
  Pagination,
  Box,
  Text,
} from '@gravity-ui/uikit';
import type {
  TableColumnConfig,
} from '@gravity-ui/uikit';

interface Person {
  id: string;
  name: string;
  age: number;
  city: string;
  email: string;
}

const SAMPLE_DATA: Person[] = [
  { id: '1', name: 'Alice Johnson', age: 28, city: 'New York', email: 'alice@example.com' },
  { id: '2', name: 'Bob Smith', age: 35, city: 'London', email: 'bob@example.com' },
  { id: '3', name: 'Charlie Brown', age: 42, city: 'Paris', email: 'charlie@example.com' },
  { id: '4', name: 'Diana Prince', age: 31, city: 'Tokyo', email: 'diana@example.com' },
  { id: '5', name: 'Evan Williams', age: 24, city: 'Berlin', email: 'evan@example.com' },
  { id: '6', name: 'Fiona Green', age: 29, city: 'Sydney', email: 'fiona@example.com' },
  { id: '7', name: 'George Clark', age: 38, city: 'Toronto', email: 'george@example.com' },
  { id: '8', name: 'Hannah Lee', age: 26, city: 'Seoul', email: 'hannah@example.com' },
  { id: '9', name: 'Ivan Petrov', age: 33, city: 'Moscow', email: 'ivan@example.com' },
  { id: '10', name: 'Julia Martinez', age: 45, city: 'Madrid', email: 'julia@example.com' },
  { id: '11', name: "Kevin O'Brien", age: 27, city: 'Dublin', email: 'kevin@example.com' },
  { id: '12', name: 'Laura Chen', age: 36, city: 'Shanghai', email: 'laura@example.com' },
  { id: '13', name: 'Mike Davis', age: 22, city: 'Chicago', email: 'mike@example.com' },
  { id: '14', name: 'Nina Kowalski', age: 40, city: 'Warsaw', email: 'nina@example.com' },
  { id: '15', name: 'Oscar Nilsson', age: 30, city: 'Stockholm', email: 'oscar@example.com' },
  { id: '16', name: 'Paula Schmidt', age: 34, city: 'Zurich', email: 'paula@example.com' },
  { id: '17', name: 'Quinn Murphy', age: 25, city: 'Boston', email: 'quinn@example.com' },
  { id: '18', name: 'Rachel Kim', age: 32, city: 'San Francisco', email: 'rachel@example.com' },
  { id: '19', name: 'Sam Ortega', age: 39, city: 'Barcelona', email: 'sam@example.com' },
  { id: '20', name: 'Tina Ahmed', age: 41, city: 'Dubai', email: 'tina@example.com' },
];

const COLUMNS: TableColumnConfig<Person>[] = [
  {
    id: 'name',
    name: 'Name',
    meta: { sort: true },
  },
  {
    id: 'age',
    name: 'Age',
    meta: { sort: true },
    align: 'right',
  },
  {
    id: 'city',
    name: 'City',
    meta: { sort: true },
  },
  {
    id: 'email',
    name: 'Email',
    meta: { sort: true },
  },
];

const TableWithSorting = withTableSorting<Person>(Table);
const DataTable = withTableSelection<Person>(TableWithSorting);

const PAGE_SIZE_OPTIONS = [5, 10, 20];

export function App() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const total = SAMPLE_DATA.length;

  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return SAMPLE_DATA.slice(start, start + pageSize);
  }, [page, pageSize]);

  const handlePageUpdate = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  return (
    <Box spacing={{ p: 4 }} style={{ maxWidth: 960 }}>
      <Text variant="header-1">Data Table</Text>
      <Box spacing={{ mt: 3 }}>
        <DataTable
          data={pageData}
          columns={COLUMNS}
          getRowId="id"
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          edgePadding
        />
      </Box>
      <Box spacing={{ mt: 3 }}>
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onUpdate={handlePageUpdate}
          showInput
        />
      </Box>
      <Box spacing={{ mt: 3 }}>
        <Text variant="body-1">
          Selected: {selectedIds.length > 0 ? selectedIds.join(', ') : 'none'}
        </Text>
      </Box>
    </Box>
  );
}
