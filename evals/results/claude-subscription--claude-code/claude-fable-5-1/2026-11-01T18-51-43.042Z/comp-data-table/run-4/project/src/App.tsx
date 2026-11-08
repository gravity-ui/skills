import * as React from 'react';
import { Label, Text } from '@gravity-ui/uikit';

import { DataTable, type DataTableColumn } from './DataTable';
import { generateUsers, type User, type UserStatus } from './data';

const STATUS_LABEL: Record<UserStatus, { text: string; theme: 'success' | 'warning' | 'danger' }> = {
  active: { text: 'Активен', theme: 'success' },
  invited: { text: 'Приглашён', theme: 'warning' },
  blocked: { text: 'Заблокирован', theme: 'danger' },
};
const STATUS_ORDER: Record<UserStatus, number> = { active: 0, invited: 1, blocked: 2 };

const columns: DataTableColumn<User>[] = [
  { id: 'id', name: 'ID', width: 60, sortable: true, align: 'end' },
  { id: 'name', name: 'Имя', sortable: true, primary: true },
  { id: 'email', name: 'Email', sortable: true },
  { id: 'role', name: 'Роль', sortable: true },
  {
    id: 'status',
    name: 'Статус',
    sortable: (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status],
    template: (user) => {
      const { text, theme } = STATUS_LABEL[user.status];
      return <Label theme={theme} size="xs">{text}</Label>;
    },
  },
  { id: 'age', name: 'Возраст', sortable: true, align: 'end', width: 90 },
  {
    id: 'registeredAt',
    name: 'Дата регистрации',
    sortable: true,
    template: (user) => new Date(user.registeredAt).toLocaleDateString('ru-RU'),
  },
];

const users = generateUsers(57);

export function App() {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Text variant="header-2">Пользователи</Text>
      <DataTable
        data={users}
        columns={columns}
        defaultSortState={[{ column: 'name', order: 'asc' }]}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        isRowSelectionDisabled={(user) => user.status === 'blocked'}
      />
    </div>
  );
}
