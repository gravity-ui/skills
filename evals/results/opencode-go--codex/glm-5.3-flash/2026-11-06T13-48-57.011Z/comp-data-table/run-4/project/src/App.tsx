import { useMemo, useState } from 'react';
import {
  withTableSelection,
  withTableSorting,
  Pagination,
  Table,
} from '@gravity-ui/uikit';
import type { TableSortState } from '@gravity-ui/uikit';

type Employee = {
  id: number;
  name: string;
  department: string;
  position: string;
  salary: number;
  hiredAt: string;
};

const employees: Employee[] = [
  { id: 1, name: 'Anna Petrova', department: 'Engineering', position: 'Frontend Engineer', salary: 148000, hiredAt: '2021-03-14' },
  { id: 2, name: 'Dmitry Sokolov', department: 'Engineering', position: 'Backend Engineer', salary: 162000, hiredAt: '2020-11-02' },
  { id: 3, name: 'Elena Orlova', department: 'Design', position: 'Product Designer', salary: 132000, hiredAt: '2022-06-27' },
  { id: 4, name: 'Ivan Ivanov', department: 'Sales', position: 'Account Manager', salary: 112000, hiredAt: '2019-09-18' },
  { id: 5, name: 'Olga Smirnova', department: 'Marketing', position: 'Marketing Lead', salary: 156000, hiredAt: '2023-01-09' },
  { id: 6, name: 'Pavel Ivanov', department: 'Engineering', position: 'QA Engineer', salary: 121000, hiredAt: '2021-12-05' },
  { id: 7, name: 'Sofia Volkova', department: 'HR', position: 'HR Manager', salary: 127000, hiredAt: '2020-04-22' },
  { id: 8, name: 'Maxim Fedorov', department: 'Finance', position: 'Financial Analyst', salary: 139000, hiredAt: '2022-02-01' },
  { id: 9, name: 'Ksenia Novikova', department: 'Design', position: 'UX Researcher', salary: 118000, hiredAt: '2024-07-15' },
  { id: 10, name: 'Artem Lebedev', department: 'Sales', position: 'Sales Manager', salary: 145000, hiredAt: '2018-10-30' },
  { id: 11, name: 'Vera Kuznetsova', department: 'Marketing', position: 'Content Manager', salary: 98000, hiredAt: '2023-08-21' },
  { id: 12, name: 'Nikita Morozov', department: 'Engineering', position: 'DevOps Engineer', salary: 174000, hiredAt: '2019-05-12' },
  { id: 13, name: 'Yulia Sidorova', department: 'Finance', position: 'Accountant', salary: 105000, hiredAt: '2021-07-03' },
  { id: 14, name: 'Georgy Nikolaev', department: 'Engineering', position: 'Data Scientist', salary: 168000, hiredAt: '2022-09-26' },
  { id: 15, name: 'Maria Zaytseva', department: 'HR', position: 'Recruiter', salary: 92000, hiredAt: '2024-01-16' },
];

type EmployeeColumn = {
  id: keyof Employee;
  name: string;
  meta?: { sort?: (left: Employee, right: Employee) => number };
};

const numericSort = (left: Employee, right: Employee) => left.id - right.id;

const columns: EmployeeColumn[] = [
  { id: 'id', name: 'ID', meta: { sort: numericSort } },
  { id: 'name', name: 'Name' },
  { id: 'department', name: 'Department' },
  { id: 'position', name: 'Position' },
  { id: 'salary', name: 'Salary', meta: { sort: (left, right) => left.salary - right.salary } },
  { id: 'hiredAt', name: 'Hired' },
];

const pageSize = 5;

function formatValue(value: Employee[keyof Employee]) {
  if (typeof value === 'number') {
    return value.toLocaleString('en-US');
  }
  return String(value);
}

const SelectableTable = withTableSelection(withTableSorting(Table<Employee>));

export function App() {
  const [sortState, setSortState] = useState<TableSortState>([{ column: 'id', order: 'asc' }]);
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const activeSort = sortState[0] ?? { column: 'id', order: 'asc' };

  const sortedEmployees = useMemo(() => {
    const sorted = [...employees];
    sorted.sort((left, right) => {
      const leftValue = left[activeSort.column as keyof Employee];
      const rightValue = right[activeSort.column as keyof Employee];

      if (leftValue === rightValue) {
        return left.id - right.id;
      }

      const comparison = leftValue < rightValue ? -1 : 1;
      return activeSort.order === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [activeSort.column, activeSort.order]);

  const pageEmployees = useMemo(() => {
    const start = page * pageSize;
    return sortedEmployees.slice(start, start + pageSize);
  }, [page, sortedEmployees]);

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: 24 }}>
      <h1 style={{ margin: '0 0 16px', fontSize: 28, fontWeight: 600 }}>Employee data</h1>
      <p style={{ margin: '0 0 20px', color: 'var(--g-color-text-secondary)' }}>
        Selected: {selectedIds.length} of {employees.length}
      </p>

      <div style={{ border: '1px solid var(--g-color-line-generic)', borderRadius: 8, overflow: 'hidden' }}>
        <SelectableTable
          columns={columns}
          data={pageEmployees}
          sortState={sortState}
          onSortStateChange={(nextSortState) => {
            setSortState(nextSortState);
            setPage(0);
          }}
          getRowId={(employee) => String(employee.id)}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, gap: 16, flexWrap: 'wrap' }}>
        <div>
          {page * pageSize + 1}–{Math.min((page + 1) * pageSize, employees.length)} of {employees.length}
        </div>
        <Pagination
          page={page}
          pageSize={pageSize}
          total={employees.length}
          onUpdate={setPage}
        />
      </div>
    </div>
  );
}
