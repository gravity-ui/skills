import { Label, Table, Text } from '@gravity-ui/uikit';
import type { TableColumnConfig } from '@gravity-ui/uikit';

import { Page } from './Page';

interface Member {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'away' | 'offline';
}

const MEMBERS: Member[] = [
  { id: '1', name: 'Анна Смирнова', role: 'Дизайнер', status: 'online' },
  { id: '2', name: 'Илья Петров', role: 'Фронтенд-разработчик', status: 'away' },
  { id: '3', name: 'Мария Кузнецова', role: 'Менеджер продукта', status: 'online' },
  { id: '4', name: 'Дмитрий Орлов', role: 'Бэкенд-разработчик', status: 'offline' },
];

const STATUS: Record<Member['status'], { text: string; theme: 'success' | 'warning' | 'unknown' }> = {
  online: { text: 'в сети', theme: 'success' },
  away: { text: 'отошёл', theme: 'warning' },
  offline: { text: 'не в сети', theme: 'unknown' },
};

const COLUMNS: TableColumnConfig<Member>[] = [
  { id: 'name', name: 'Имя', primary: true },
  { id: 'role', name: 'Роль' },
  {
    id: 'status',
    name: 'Статус',
    template: (item) => (
      <Label theme={STATUS[item.status].theme} size="xs">
        {STATUS[item.status].text}
      </Label>
    ),
  },
];

export function TeamPage() {
  return (
    <Page title="Команда" description="Список участников проекта.">
      <Table<Member>
        data={MEMBERS}
        columns={COLUMNS}
        getRowId="id"
        emptyMessage="Участников пока нет"
      />
      <Text variant="caption-2" color="hint">
        Всего участников: {MEMBERS.length}
      </Text>
    </Page>
  );
}
