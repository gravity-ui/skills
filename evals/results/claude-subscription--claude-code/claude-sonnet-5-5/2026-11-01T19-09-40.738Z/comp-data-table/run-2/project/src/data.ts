export type Status = 'active' | 'pending' | 'blocked';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: Status;
  score: number;
  createdAt: string; // ISO date
}

const FIRST = ['Анна', 'Иван', 'Мария', 'Пётр', 'Ольга', 'Дмитрий', 'Елена', 'Сергей', 'Наталья', 'Алексей'];
const LAST = ['Иванов', 'Петров', 'Сидоров', 'Кузнецов', 'Смирнов', 'Попов', 'Васильев', 'Новиков'];
const ROLES = ['Администратор', 'Редактор', 'Аналитик', 'Разработчик', 'Менеджер'];
const STATUSES: Status[] = ['active', 'pending', 'blocked'];

// Детерминированная генерация — данные одинаковы между перезагрузками.
export const USERS: User[] = Array.from({ length: 57 }, (_, i) => {
  const day = new Date(Date.UTC(2024, 0, 1) + ((i * 37) % 600) * 86_400_000);
  return {
    id: String(i + 1),
    name: `${FIRST[i % FIRST.length]} ${LAST[(i * 3) % LAST.length]}`,
    email: `user${i + 1}@example.com`,
    role: ROLES[(i * 7) % ROLES.length],
    status: STATUSES[(i * 5) % STATUSES.length],
    score: (i * 53) % 101,
    createdAt: day.toISOString().slice(0, 10),
  };
});
