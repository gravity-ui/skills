import { Text } from '@gravity-ui/uikit';
import { DataTable } from './DataTable';
import type { Person } from './DataTable';

const NAMES = ['Анна', 'Борис', 'Виктор', 'Галина', 'Дмитрий', 'Елена', 'Игорь', 'Мария', 'Олег', 'Софья'];
const SURNAMES = ['Иванов', 'Петров', 'Сидоров', 'Кузнецов', 'Смирнов', 'Попов', 'Волков'];
const ROLES = ['Админ', 'Редактор', 'Аналитик', 'Гость'];
const STATUSES: Person['status'][] = ['active', 'pending', 'blocked'];

// Детерминированные тестовые данные.
const DATA: Person[] = Array.from({ length: 87 }, (_, i) => {
  const day = new Date(Date.UTC(2024, 0, 1 + ((i * 17) % 600)));
  return {
    id: String(i + 1),
    name: `${NAMES[i % NAMES.length]} ${SURNAMES[(i * 3) % SURNAMES.length]}`,
    email: `user${i + 1}@example.com`,
    role: ROLES[(i * 5) % ROLES.length],
    status: STATUSES[(i * 7) % STATUSES.length],
    age: 20 + ((i * 11) % 45),
    createdAt: day.toISOString(),
  };
});

export function App() {
  return (
    <div style={{ padding: 24 }}>
      <Text variant="header-1" as="h1" style={{ marginBottom: 16 }}>
        Пользователи
      </Text>
      <DataTable data={DATA} />
    </div>
  );
}
