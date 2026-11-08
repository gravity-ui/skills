import React, { useMemo, useState } from 'react';
import {
  Pagination,
  Table,
  withTableSelection,
  withTableSorting,
  type TableColumnConfig,
  type TableSortState,
} from '@gravity-ui/uikit';
import { employees, type Employee } from './employees';
import './EmployeeTable.css';

const SelectionTable = withTableSelection(withTableSorting(Table<Employee>));

const columns: TableColumnConfig<Employee>[] = [
  { id: 'name', name: 'Name', width: 210, meta: { defaultSortOrder: 'asc' } },
  { id: 'position', name: 'Position', width: 220, meta: { defaultSortOrder: 'asc' } },
  { id: 'department', name: 'Department', width: 160, meta: { defaultSortOrder: 'asc' } },
  { id: 'hiredAt', name: 'Hired', width: 140, meta: { defaultSortOrder: 'desc' } },
  {
    id: 'salary',
    name: 'Salary',
    align: 'end',
    width: 140,
    meta: { defaultSortOrder: 'desc' },
    template: ({ salary }) => `${salary.toLocaleString('ru-RU')} ₽`,
  },
];

const pageSizeOptions = [5, 10, 20];

export function EmployeeTable() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortState, setSortState] = useState<TableSortState>([{ column: 'name', order: 'asc' }]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const sortedEmployees = useMemo(() => {
    return [...employees].sort((left, right) => {
      for (const { column, order } of sortState) {
        const valueA = left[column as keyof Employee];
        const valueB = right[column as keyof Employee];
        const comparison = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
        if (comparison !== 0) {
          return order === 'asc' ? comparison : -comparison;
        }
      }
      return 0;
    });
  }, [sortState]);

  const startIndex = (page - 1) * pageSize;
  const pageEmployees = sortedEmployees.slice(startIndex, startIndex + pageSize);

  const handlePageUpdate = (nextPage: number, nextPageSize: number) => {
    setPage(nextPage);
    if (nextPageSize !== pageSize) {
      setPageSize(nextPageSize);
      setPage(1);
    }
  };

  return (
    <section className="employee-table">
      <div className="employee-table__header">
        <h2 className="employee-table__title">Employees</h2>
        <span className="employee-table__count">
          Selected: {selectedIds.length} / {employees.length}
        </span>
      </div>

      <SelectionTable
        data={pageEmployees}
        columns={columns}
        getRowDescriptor={({ id }) => ({ id })}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        sortState={sortState}
        onSortStateChange={(nextSortState) => {
          setSortState(nextSortState);
          setPage(1);
        }}
      />

      <div className="employee-table__pagination">
        <Pagination
          page={page}
          pageSize={pageSize}
          total={employees.length}
          pageSizeOptions={pageSizeOptions}
          onUpdate={handlePageUpdate}
        />
      </div>
    </section>
  );
}
