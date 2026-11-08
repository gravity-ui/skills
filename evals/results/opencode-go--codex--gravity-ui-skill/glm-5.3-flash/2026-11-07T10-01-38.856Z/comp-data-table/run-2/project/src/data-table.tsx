import React, {useMemo, useState} from 'react';
import {
  Button,
  Flex,
  Pagination,
  Table,
  Text,
  withTableSelection,
  withTableSorting,
  type TableSortState,
} from '@gravity-ui/uikit';

import {employees, type Employee} from './data';
import './data-table.css';

const SelectableSortableTable = withTableSelection(
  withTableSorting(Table<Employee>)
);

type SortColumn = 'name' | 'role' | 'team' | 'experience' | 'salary';
type SortOrder = 'asc' | 'desc';

type SortState = Array<{column: SortColumn; order: SortOrder}>;

function compareValues(a: Employee, b: Employee, column: SortColumn): number {
  const valueA = a[column];
  const valueB = b[column];

  if (typeof valueA === 'number' && typeof valueB === 'number') {
    return valueA - valueB;
  }

  return String(valueA).localeCompare(String(valueB));
}

function sortEmployees(data: Employee[], sortState: SortState): Employee[] {
  if (sortState.length === 0) {
    return data;
  }

  return [...data].sort((a, b) => {
    for (const {column, order} of sortState) {
      const result = compareValues(a, b, column);
      if (result !== 0) {
        return order === 'asc' ? result : -result;
      }
    }
    return 0;
  });
}

export function DataTable() {
  const [sortState, setSortState] = useState<SortState>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const sortedEmployees = useMemo(() => sortEmployees(employees, sortState), [sortState]);
  const pageCount = Math.max(1, Math.ceil(sortedEmployees.length / pageSize));

  const safePage = Math.min(page, pageCount);
  const startIndex = (safePage - 1) * pageSize;
  const pageEmployees = sortedEmployees.slice(startIndex, startIndex + pageSize);

  const handlePaginationUpdate = React.useCallback((nextPage: number, nextPageSize: number) => {
    setPage(nextPage);
    setPageSize(nextPageSize);
  }, []);

  const handleSortStateChange = React.useCallback((nextSortState: TableSortState) => {
    setSortState(
      nextSortState.map(({column, order}) => ({
        column: column as SortColumn,
        order: order as SortOrder,
      }))
    );
  }, []);

  const columns = useMemo(
    () => [
      {id: 'name', name: 'Name', meta: {sort: true}},
      {id: 'role', name: 'Role', meta: {sort: true}},
      {id: 'team', name: 'Team', meta: {sort: true}},
      {id: 'experience', name: 'Experience, years', meta: {sort: true}, align: 'right' as const},
      {id: 'salary', name: 'Salary', meta: {sort: true}, align: 'right' as const},
    ],
    []
  );

  return (
    <div className="data-table">
      <Flex className="data-table__toolbar" gap={2}>
        <Text variant="header-2">Employees</Text>
        <Button
          view="flat"
          size="s"
          disabled={selectedIds.length === 0}
          onClick={() => setSelectedIds([])}
        >
          Clear selection
        </Button>
      </Flex>
      <Text className="data-table__summary" variant="body-2">
        {selectedIds.length > 0 ? `Selected: ${selectedIds.length}` : `Total: ${employees.length}`}
      </Text>

      <SelectableSortableTable
        data={pageEmployees}
        columns={columns}
        sortState={sortState}
        onSortStateChange={handleSortStateChange}
        disableDataSorting
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getRowId={(item) => item.id}
      />

      <Pagination
        page={safePage}
        pageSize={pageSize}
        total={sortedEmployees.length}
        pageSizeOptions={[10, 20, 50]}
        onUpdate={handlePaginationUpdate}
        showInput
      />
    </div>
  );
}
