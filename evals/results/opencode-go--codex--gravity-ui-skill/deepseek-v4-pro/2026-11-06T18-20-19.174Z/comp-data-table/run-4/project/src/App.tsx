import React, { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Pagination,
  Table,
  TableColumnConfig,
  TableDataItem,
  TableSortState,
  Text,
  withTableSelection,
  withTableSorting,
} from '@gravity-ui/uikit';

interface Item extends TableDataItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

const DATA: Item[] = Array.from({ length: 50 }, (_, i) => ({
  id: String(i + 1),
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: i % 3 === 0 ? 'Admin' : i % 3 === 1 ? 'Editor' : 'Viewer',
  status: i % 2 === 0 ? 'Active' : 'Inactive',
}));

const TableWithSorting = withTableSorting(withTableSelection<Item>(Table));

export function App() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortState, setSortState] = useState<TableSortState>([]);

  const columns: TableColumnConfig<Item>[] = useMemo(
    () => [
      { id: 'id', name: 'ID', width: 80, meta: { sort: true } },
      { id: 'name', name: 'Name', meta: { sort: true } },
      { id: 'email', name: 'Email', meta: { sort: true } },
      { id: 'role', name: 'Role', meta: { sort: true } },
      { id: 'status', name: 'Status', meta: { sort: true } },
    ],
    [],
  );

  const sortedData = useMemo(() => {
    if (sortState.length === 0) return DATA;
    const sorted = [...DATA];
    sorted.sort((a, b) => {
      for (const { column, order } of sortState) {
        const aVal = String(a[column] ?? '');
        const bVal = String(b[column] ?? '');
        const cmp = aVal.localeCompare(bVal);
        if (cmp !== 0) return order === 'asc' ? cmp : -cmp;
      }
      return 0;
    });
    return sorted;
  }, [sortState]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize]);

  const handlePaginationUpdate = useCallback(
    (newPage: number, newPageSize: number) => {
      setPage(newPage);
      setPageSize(newPageSize);
    },
    [],
  );

  return (
    <Box spacing={{ p: 4 }}>
      <Text variant="header-1">Data Table</Text>
      <TableWithSorting
        data={paginatedData}
        columns={columns}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        sortState={sortState}
        onSortStateChange={setSortState}
      />
      <Pagination
        page={page}
        pageSize={pageSize}
        total={DATA.length}
        onUpdate={handlePaginationUpdate}
        showInput
        showPages
      />
    </Box>
  );
}
