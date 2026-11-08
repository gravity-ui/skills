import React, { useCallback, useState, useMemo } from 'react';
import { Table as BaseTable, Pagination, withTableSorting, withTableSelection, Flex, Text } from '@gravity-ui/uikit';
import type { TableColumnConfig, TableSortState, WithTableSelectionProps } from '@gravity-ui/uikit';

interface Person {
  id: string;
  name: string;
  age: number;
  city: string;
  email: string;
}

const TableWithSelection = withTableSelection<Person>(BaseTable);
const DataTable = withTableSorting<Person, WithTableSelectionProps<Person>>(TableWithSelection);

const MOCK_DATA: Person[] = Array.from({ length: 100 }, (_, i) => ({
  id: String(i + 1),
  name: `User ${i + 1}`,
  age: 20 + (i % 50),
  city: ['Moscow', 'London', 'New York', 'Tokyo', 'Berlin'][i % 5],
  email: `user${i + 1}@example.com`,
}));

const columns: TableColumnConfig<Person>[] = [
  { id: 'name', name: 'Name', meta: { sort: true } },
  { id: 'age', name: 'Age', width: 80, meta: { sort: true } },
  { id: 'city', name: 'City', meta: { sort: true } },
  { id: 'email', name: 'Email', meta: { sort: true } },
];

export function App() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortState, setSortState] = useState<TableSortState>([]);

  const sortedData = useMemo(() => {
    if (sortState.length === 0) return MOCK_DATA;
    return [...MOCK_DATA].sort((a, b) => {
      for (const { column, order } of sortState) {
        const aVal = a[column as keyof Person];
        const bVal = b[column as keyof Person];
        if (aVal < bVal) return order === 'asc' ? -1 : 1;
        if (aVal > bVal) return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [sortState]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize]);

  const handlePaginationUpdate = useCallback(
    (newPage: number, newPageSize: number) => {
      if (newPageSize !== pageSize) {
        setPageSize(newPageSize);
        setPage(1);
      } else {
        setPage(newPage);
      }
    },
    [pageSize],
  );

  const handleSelectionChange = useCallback((ids: string[]) => {
    setSelectedIds(ids);
  }, []);

  const handleSortStateChange = useCallback((newSortState: TableSortState) => {
    setSortState(newSortState);
    setPage(1);
  }, []);

  return (
    <Flex direction="column" gap={4} style={{ padding: 24 }}>
      <Text variant="header-1">Data Table</Text>
      <DataTable
        data={paginatedData}
        columns={columns}
        selectedIds={selectedIds}
        onSelectionChange={handleSelectionChange}
        sortState={sortState}
        onSortStateChange={handleSortStateChange}
        disableDataSorting
        getRowDescriptor={(item) => ({ id: item.id })}
        edgePadding
      />
      <Pagination
        page={page}
        pageSize={pageSize}
        total={sortedData.length}
        onUpdate={handlePaginationUpdate}
        pageSizeOptions={[10, 20, 50]}
        showInput
      />
    </Flex>
  );
}
