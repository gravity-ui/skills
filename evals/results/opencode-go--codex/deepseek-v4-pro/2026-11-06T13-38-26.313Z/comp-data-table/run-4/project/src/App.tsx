import React, {useCallback, useMemo, useState} from 'react';
import {Table, Pagination, withTableSorting, withTableSelection} from '@gravity-ui/uikit';
import type {TableSortState} from '@gravity-ui/uikit';

interface DataItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

const ROLES = ['Admin', 'Editor', 'Viewer', 'Manager'];
const STATUSES = ['Active', 'Inactive', 'Pending'];

function generateData(count: number): DataItem[] {
  return Array.from({length: count}, (_, i) => ({
    id: String(i + 1),
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: ROLES[i % ROLES.length],
    status: STATUSES[i % STATUSES.length],
  }));
}

const ALL_DATA = generateData(100);

const TableWithSorting = withTableSorting(Table);
const DataTable = withTableSelection(TableWithSorting);

const COLUMNS = [
  {id: 'id', name: 'ID', width: 60},
  {id: 'name', name: 'Name'},
  {id: 'email', name: 'Email'},
  {id: 'role', name: 'Role'},
  {id: 'status', name: 'Status'},
];

function sortData(data: DataItem[], sortState: TableSortState): DataItem[] {
  if (!sortState || sortState.length === 0) return data;
  const {column, order} = sortState[0];
  return [...data].sort((a, b) => {
    const aVal = String(a[column as keyof DataItem] ?? '');
    const bVal = String(b[column as keyof DataItem] ?? '');
    const cmp = aVal.localeCompare(bVal);
    return order === 'asc' ? cmp : -cmp;
  });
}

export function App() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortState, setSortState] = useState<TableSortState>([]);

  const handleSortStateChange = useCallback((state: TableSortState) => {
    setSortState(state);
  }, []);

  const handleSelectionChange = useCallback((ids: string[]) => {
    setSelectedIds(ids);
  }, []);

  const handlePaginationUpdate = useCallback((newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  }, []);

  const sortedData = useMemo(() => sortData(ALL_DATA, sortState), [sortState]);
  const pagedData = useMemo(
    () => sortedData.slice((page - 1) * pageSize, page * pageSize),
    [sortedData, page, pageSize],
  );

  return (
    <div style={{padding: 24, maxWidth: 900, margin: '0 auto'}}>
      <h2 style={{marginBottom: 16}}>Data Table</h2>
      <div style={{marginBottom: 12, color: 'var(--g-color-text-secondary)'}}>
        Selected: {selectedIds.length > 0 ? selectedIds.join(', ') : 'none'}
      </div>
      <DataTable
        data={pagedData}
        columns={COLUMNS}
        selectedIds={selectedIds}
        onSelectionChange={handleSelectionChange}
        sortState={sortState}
        onSortStateChange={handleSortStateChange}
      />
      <div style={{marginTop: 16}}>
        <Pagination
          page={page}
          pageSize={pageSize}
          total={ALL_DATA.length}
          onUpdate={handlePaginationUpdate}
          pageSizeOptions={[5, 10, 20, 50]}
          showInput
          showPages
        />
      </div>
    </div>
  );
}
