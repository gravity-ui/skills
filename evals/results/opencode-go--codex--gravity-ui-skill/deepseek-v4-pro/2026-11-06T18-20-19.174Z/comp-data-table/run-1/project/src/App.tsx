import React, { useMemo, useState } from 'react';
import {
  Table,
  withTableSorting,
  withTableSelection,
  Pagination,
  Flex,
  Text,
} from '@gravity-ui/uikit';
import type { TableColumnConfig, TableSortState } from '@gravity-ui/uikit';

const DataTable = withTableSelection(withTableSorting(Table));

interface Item {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

const ALL_DATA: Item[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active' },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'Editor', status: 'Active' },
  { id: '3', name: 'Carol White', email: 'carol@example.com', role: 'Viewer', status: 'Inactive' },
  { id: '4', name: 'Dave Brown', email: 'dave@example.com', role: 'Editor', status: 'Active' },
  { id: '5', name: 'Eve Davis', email: 'eve@example.com', role: 'Admin', status: 'Inactive' },
  { id: '6', name: 'Frank Miller', email: 'frank@example.com', role: 'Viewer', status: 'Active' },
  { id: '7', name: 'Grace Wilson', email: 'grace@example.com', role: 'Editor', status: 'Inactive' },
  { id: '8', name: 'Hank Moore', email: 'hank@example.com', role: 'Viewer', status: 'Active' },
  { id: '9', name: 'Ivy Taylor', email: 'ivy@example.com', role: 'Admin', status: 'Active' },
  { id: '10', name: 'Jack Anderson', email: 'jack@example.com', role: 'Editor', status: 'Inactive' },
  { id: '11', name: 'Karen Thomas', email: 'karen@example.com', role: 'Viewer', status: 'Active' },
  { id: '12', name: 'Leo Jackson', email: 'leo@example.com', role: 'Editor', status: 'Active' },
];

const COLUMNS = [
  { id: 'name', name: 'Name', meta: { sort: true } },
  { id: 'email', name: 'Email', meta: { sort: true } },
  { id: 'role', name: 'Role', meta: { sort: true } },
  { id: 'status', name: 'Status', meta: { sort: true } },
] as TableColumnConfig<Item>[];

const PAGE_SIZE = 5;

export function App() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortState, setSortState] = useState<TableSortState>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  const sortedData = useMemo(() => {
    if (sortState.length === 0) return ALL_DATA;
    const [{ column, order }] = sortState;
    return [...ALL_DATA].sort((a, b) => {
      const aVal = a[column as keyof Item];
      const bVal = b[column as keyof Item];
      const cmp = String(aVal).localeCompare(String(bVal));
      return order === 'asc' ? cmp : -cmp;
    });
  }, [sortState]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize]);

  return (
    <Flex direction="column" gap={4} style={{ padding: 24 }}>
      <Text variant="header-1">Data Table</Text>
      <Text variant="body-1">Selected: {selectedIds.length}</Text>
      <DataTable
        data={paginatedData}
        columns={COLUMNS as TableColumnConfig<any>[]}
        getRowId="id"
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        sortState={sortState}
        onSortStateChange={setSortState}
        disableDataSorting
      />
      <Pagination
        page={page}
        pageSize={pageSize}
        total={sortedData.length}
        onUpdate={(newPage, newPageSize) => {
          setPage(newPage);
          setPageSize(newPageSize);
        }}
        pageSizeOptions={[5, 10, 20]}
        showInput
      />
    </Flex>
  );
}
