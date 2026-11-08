import {Label, Text} from '@gravity-ui/uikit';
import {DataTable} from './DataTable';
import type {DataTableColumn} from './DataTable';

type Status = 'active' | 'pending' | 'blocked';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: Status;
  score: number;
  createdAt: string; // ISO-дата
}

const FIRST_NAMES = ['Анна', 'Борис', 'Вера', 'Глеб', 'Дарья', 'Егор', 'Жанна', 'Захар', 'Ирина', 'Кирилл'];
const LAST_NAMES = ['Иванов', 'Петров', 'Сидоров', 'Кузнецов', 'Смирнов', 'Попов', 'Лебедев', 'Козлов'];
const ROLES = ['Админ', 'Редактор', 'Аналитик', 'Гость'];
const STATUSES: Status[] = ['active', 'pending', 'blocked'];

// Детерминированные данные, чтобы таблица выглядела одинаково между перезагрузками.
const USERS: User[] = Array.from({length: 137}, (_, i) => {
  const first = FIRST_NAMES[i % FIRST_NAMES.length];
  const last = LAST_NAMES[(i * 3) % LAST_NAMES.length];
  const date = new Date(Date.UTC(2024, 0, 1 + ((i * 17) % 700)));
  return {
    id: `user-${i + 1}`,
    name: `${first} ${last}`,
    email: `user${i + 1}@example.com`,
    role: ROLES[(i * 7) % ROLES.length],
    status: STATUSES[(i * 5) % STATUSES.length],
    score: (i * 37) % 101,
    createdAt: date.toISOString().slice(0, 10),
  };
});

const STATUS_LABELS: Record<Status, {text: string; theme: 'success' | 'warning' | 'danger'}> = {
  active: {text: 'Активен', theme: 'success'},
  pending: {text: 'Ожидает', theme: 'warning'},
  blocked: {text: 'Заблокирован', theme: 'danger'},
};

const COLUMNS: DataTableColumn<User>[] = [
  {id: 'name', name: 'Имя', sortable: true, primary: true},
  {id: 'email', name: 'Email', sortable: true},
  {id: 'role', name: 'Роль', sortable: true},
  {
    id: 'status',
    name: 'Статус',
    sortable: true,
    template: ({status}) => (
      <Label theme={STATUS_LABELS[status].theme}>{STATUS_LABELS[status].text}</Label>
    ),
  },
  {id: 'score', name: 'Рейтинг', sortable: true, align: 'end'},
  {
    id: 'createdAt',
    name: 'Создан',
    sortable: true,
    template: ({createdAt}) => new Date(createdAt).toLocaleDateString('ru-RU'),
  },
];

export function App() {
  return (
    <div style={{padding: 24, maxWidth: 1100, margin: '0 auto'}}>
      <Text variant="header-1" as="h1" style={{margin: '0 0 16px'}}>
        Пользователи
      </Text>
      <DataTable
        data={USERS}
        columns={COLUMNS}
        pageSizeOptions={[10, 20, 50]}
        defaultSortState={[{column: 'name', order: 'asc'}]}
      />
    </div>
  );
}
