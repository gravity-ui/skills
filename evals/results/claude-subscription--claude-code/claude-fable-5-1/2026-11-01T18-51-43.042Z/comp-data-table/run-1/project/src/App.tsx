import { useMemo, useState } from 'react';
import { Label, Text } from '@gravity-ui/uikit';

import { DataTable } from './DataTable';
import type { SortableColumn } from './DataTable';
import { generateUsers } from './data';
import type { UserRow, UserStatus } from './data';

const STATUS_LABEL: Record<UserStatus, { text: string; theme: 'success' | 'info' | 'danger' }> = {
  active: { text: 'Активен', theme: 'success' },
  invited: { text: 'Приглашён', theme: 'info' },
  blocked: { text: 'Заблокирован', theme: 'danger' },
};

const salaryFormat = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});
const dateFormat = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium' });

const columns: SortableColumn<UserRow>[] = [
  { id: 'id', name: 'ID', width: 60, align: 'end', meta: { sort: (a, b) => Number(a.id) - Number(b.id) } },
  { id: 'name', name: 'Сотрудник', primary: true, meta: { sort: true } },
  { id: 'email', name: 'Email', meta: { sort: true } },
  { id: 'department', name: 'Отдел', meta: { sort: true } },
  { id: 'role', name: 'Должность', meta: { sort: true } },
  {
    id: 'salary',
    name: 'Зарплата',
    align: 'end',
    template: (item) => salaryFormat.format(item.salary),
    meta: { sort: true, defaultSortOrder: 'desc' },
  },
  {
    id: 'joinedAt',
    name: 'Дата найма',
    template: (item) => dateFormat.format(new Date(item.joinedAt)),
    meta: { sort: true },
  },
  {
    id: 'status',
    name: 'Статус',
    template: (item) => {
      const { text, theme } = STATUS_LABEL[item.status];
      return <Label theme={theme} size="xs">{text}</Label>;
    },
    meta: { sort: true },
  },
];

export function App() {
  const data = useMemo(() => generateUsers(137), []);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Text variant="header-1">Сотрудники</Text>
      <DataTable
        data={data}
        columns={columns}
        getRowId={(row) => row.id}
        defaultSortState={[{ column: 'name', order: 'asc' }]}
        defaultPageSize={10}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        isRowSelectionDisabled={(row) => row.status === 'blocked'}
        emptyMessage="Сотрудники не найдены"
      />
    </div>
  );
}
