import { useMemo, useState } from 'react';
import { Label, Text, type LabelProps } from '@gravity-ui/uikit';

import { DataTable, compareDefault, type SortableColumnConfig } from './DataTable';
import { generateEmployees, type Employee, type EmployeeStatus } from './data';

const STATUS_LABEL: Record<EmployeeStatus, { text: string; theme: LabelProps['theme'] }> = {
  active: { text: 'Работает', theme: 'success' },
  vacation: { text: 'В отпуске', theme: 'info' },
  dismissed: { text: 'Уволен', theme: 'danger' },
};

const salaryFormat = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});
const dateFormat = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium' });

const columns: SortableColumnConfig<Employee>[] = [
  {
    id: 'id',
    name: 'ID',
    width: 72,
    sortFn: (a, b) => Number(a.id) - Number(b.id),
  },
  {
    id: 'name',
    name: 'Сотрудник',
    primary: true,
    sortFn: (a, b) => compareDefault(a.name, b.name),
  },
  {
    id: 'email',
    name: 'Email',
    sortFn: (a, b) => compareDefault(a.email, b.email),
  },
  {
    id: 'department',
    name: 'Отдел',
    sortFn: (a, b) => compareDefault(a.department, b.department),
  },
  {
    id: 'position',
    name: 'Должность',
    sortFn: (a, b) => compareDefault(a.position, b.position),
  },
  {
    id: 'salary',
    name: 'Зарплата',
    align: 'end',
    template: (item) => salaryFormat.format(item.salary),
    sortFn: (a, b) => a.salary - b.salary,
    defaultSortOrder: 'desc',
  },
  {
    id: 'hiredAt',
    name: 'Дата найма',
    template: (item) => dateFormat.format(new Date(item.hiredAt)),
    sortFn: (a, b) => a.hiredAt.localeCompare(b.hiredAt),
  },
  {
    id: 'status',
    name: 'Статус',
    template: (item) => {
      const { text, theme } = STATUS_LABEL[item.status];
      return <Label theme={theme}>{text}</Label>;
    },
    sortFn: (a, b) => compareDefault(a.status, b.status),
  },
];

export function App() {
  const employees = useMemo(() => generateEmployees(57), []);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Text variant="header-1">Сотрудники</Text>
      <DataTable
        data={employees}
        columns={columns}
        getRowId={(item) => item.id}
        defaultSortState={[{ column: 'name', order: 'asc' }]}
        pageSizeOptions={[10, 20, 50]}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        isRowSelectionDisabled={(item) => item.status === 'dismissed'}
      />
    </div>
  );
}
