import React, { useMemo, useState } from 'react';
import { Pagination, Table, withTableSelection, withTableSorting } from '@gravity-ui/uikit';
import type { TableColumnConfig } from '@gravity-ui/uikit';

interface Employee {
  id: string;
  name: string;
  role: string;
  city: string;
  experience: number;
  salary: number;
}

const employees: Employee[] = [
  { id: '1', name: 'Anna Kovaleva', role: 'Frontend Developer', city: 'Prague', experience: 4, salary: 78000 },
  { id: '2', name: 'Ivan Petrov', role: 'Backend Developer', city: 'Warsaw', experience: 7, salary: 94000 },
  { id: '3', name: 'Maria Sokolova', role: 'Designer', city: 'Berlin', experience: 5, salary: 72000 },
  { id: '4', name: 'Artem Volkov', role: 'QA Engineer', city: 'Prague', experience: 2, salary: 56000 },
  { id: '5', name: 'Olga Novak', role: 'Product Manager', city: 'Amsterdam', experience: 8, salary: 105000 },
  { id: '6', name: 'Denis Ivanov', role: 'DevOps Engineer', city: 'Tallinn', experience: 6, salary: 88000 },
  { id: '7', name: 'Ksenia Romanova', role: 'Analyst', city: 'Berlin', experience: 3, salary: 64000 },
  { id: '8', name: 'Pavel Morozov', role: 'Frontend Developer', city: 'Warsaw', experience: 5, salary: 81000 },
  { id: '9', name: 'Elena Orlova', role: 'Team Lead', city: 'Amsterdam', experience: 11, salary: 122000 },
  { id: '10', name: 'Sergey Kuznetsov', role: 'Backend Developer', city: 'Tallinn', experience: 9, salary: 101000 },
  { id: '11', name: 'Nina Belova', role: 'Designer', city: 'Prague', experience: 6, salary: 75000 },
  { id: '12', name: 'Roman Grishin', role: 'Mobile Developer', city: 'Warsaw', experience: 4, salary: 79000 },
  { id: '13', name: 'Yulia Sidorova', role: 'QA Engineer', city: 'Berlin', experience: 3, salary: 59000 },
  { id: '14', name: 'Maxim Zaytsev', role: 'Product Manager', city: 'Tallinn', experience: 7, salary: 98000 },
  { id: '15', name: 'Daria Egorova', role: 'Analyst', city: 'Amsterdam', experience: 2, salary: 54000 },
  { id: '16', name: 'Alexey Smirnov', role: 'Mobile Developer', city: 'Prague', experience: 8, salary: 96000 },
];

const columns: TableColumnConfig<Employee>[] = [
  { id: 'name', name: 'Name', meta: { sort: true }, primary: true },
  { id: 'role', name: 'Role', meta: { sort: true } },
  { id: 'city', name: 'City', meta: { sort: true } },
  { id: 'experience', name: 'Experience', align: 'end', meta: { sort: true } },
  { id: 'salary', name: 'Salary', align: 'end', meta: { sort: true } },
];

const SelectableSortableTable = withTableSelection(withTableSorting(Table<Employee>));

export function App() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return employees.slice(start, start + pageSize);
  }, [page, pageSize]);

  const handleSelectionChange = (ids: string[]) => {
    setSelectedIds(ids);
  };

  const handlePaginationUpdate = (nextPage: number, nextPageSize: number) => {
    setPage(nextPage);
    setPageSize(nextPageSize);
  };

  return (
    <div className="data-table-page">
      <div className="data-table-card">
        <div className="data-table-header">
          <div>
            <h1 className="data-table-title">Employees</h1>
            <p className="data-table-subtitle">
              Click a column header to sort. Checkbox columns remain selected across pages.
            </p>
          </div>
          <div className="data-table-summary">
            {selectedIds.length > 0 ? `${selectedIds.length} selected` : 'No rows selected'}
          </div>
        </div>

        <SelectableSortableTable
          data={pageData}
          columns={columns}
          selectedIds={selectedIds}
          onSelectionChange={handleSelectionChange}
        />

        <Pagination
          page={page}
          pageSize={pageSize}
          total={employees.length}
          onUpdate={handlePaginationUpdate}
          pageSizeOptions={[5, 10, 20]}
          showInput
          className="data-table-pagination"
        />
      </div>
    </div>
  );
}
