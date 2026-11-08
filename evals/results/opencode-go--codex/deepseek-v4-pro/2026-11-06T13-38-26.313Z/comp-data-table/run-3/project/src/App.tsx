import { useState, useMemo } from 'react';
import {
  Table,
  TableDataItem,
  withTableSorting,
  withTableSelection,
  Pagination,
  Text,
} from '@gravity-ui/uikit';

// ------------------------------------------------------------------
// Sample data
// ------------------------------------------------------------------
interface Row {
  id: string;
  name: string;
  age: number;
  city: string;
  email: string;
}

const DATA: Row[] = [
  { id: '1', name: 'Alice', age: 29, city: 'Moscow', email: 'alice@example.com' },
  { id: '2', name: 'Bob', age: 35, city: 'London', email: 'bob@example.com' },
  { id: '3', name: 'Charlie', age: 42, city: 'Berlin', email: 'charlie@example.com' },
  { id: '4', name: 'Diana', age: 27, city: 'Paris', email: 'diana@example.com' },
  { id: '5', name: 'Eve', age: 31, city: 'Tokyo', email: 'eve@example.com' },
  { id: '6', name: 'Frank', age: 38, city: 'New York', email: 'frank@example.com' },
  { id: '7', name: 'Grace', age: 24, city: 'Sydney', email: 'grace@example.com' },
  { id: '8', name: 'Hank', age: 45, city: 'Toronto', email: 'hank@example.com' },
  { id: '9', name: 'Ivy', age: 33, city: 'Rome', email: 'ivy@example.com' },
  { id: '10', name: 'Jack', age: 40, city: 'Madrid', email: 'jack@example.com' },
  { id: '11', name: 'Karen', age: 26, city: 'Seoul', email: 'karen@example.com' },
  { id: '12', name: 'Leo', age: 37, city: 'Dubai', email: 'leo@example.com' },
  { id: '13', name: 'Mia', age: 30, city: 'Mumbai', email: 'mia@example.com' },
  { id: '14', name: 'Nick', age: 28, city: 'Oslo', email: 'nick@example.com' },
  { id: '15', name: 'Olga', age: 44, city: 'Moscow', email: 'olga@example.com' },
];

const COLUMNS = [
  { id: 'name', name: 'Name' },
  { id: 'age', name: 'Age' },
  { id: 'city', name: 'City' },
  { id: 'email', name: 'Email' },
];

// ------------------------------------------------------------------
// Compose HOCs
// ------------------------------------------------------------------
const TableWithSelection = withTableSelection<Row>(Table);
const TableWithSortingAndSelection = withTableSorting(TableWithSelection);

// ------------------------------------------------------------------
// App
// ------------------------------------------------------------------
export function App() {
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  const total = DATA.length;
  const pageData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return DATA.slice(start, start + PAGE_SIZE);
  }, [page]);

  return (
    <div style={{ padding: 24, maxWidth: 800 }}>
      <Text variant="header-1" style={{ marginBottom: 16 }}>
        Data Table
      </Text>

      <TableWithSortingAndSelection
        data={pageData}
        columns={COLUMNS}
        selectedIds={selected}
        onSelectionChange={setSelected}
        getRowDescriptor={(item) => ({ id: item.id })}
        edgePadding
      />

      <div style={{ marginTop: 16 }}>
        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          onUpdate={(p) => setPage(p)}
          showInput
        />
      </div>

      {selected.length > 0 && (
        <Text style={{ marginTop: 12 }} color="secondary">
          Selected: {selected.join(', ')}
        </Text>
      )}
    </div>
  );
}
