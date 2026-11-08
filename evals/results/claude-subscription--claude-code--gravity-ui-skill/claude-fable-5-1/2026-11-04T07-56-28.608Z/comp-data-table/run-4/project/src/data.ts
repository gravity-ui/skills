export type UserStatus = 'active' | 'blocked' | 'pending';

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  status: UserStatus;
  age: number;
  createdAt: string; // ISO date
}

const FIRST_NAMES = [
  'Анна', 'Борис', 'Вера', 'Глеб', 'Дарья', 'Егор', 'Жанна', 'Захар', 'Инна', 'Кирилл',
  'Лариса', 'Максим', 'Нина', 'Олег', 'Полина', 'Роман', 'Светлана', 'Тимур', 'Ульяна', 'Фёдор',
];
const LAST_NAMES = [
  'Иванова', 'Петров', 'Сидорова', 'Кузнецов', 'Смирнова', 'Попов', 'Васильева', 'Соколов',
  'Михайлова', 'Новиков', 'Фёдорова', 'Морозов', 'Волкова', 'Алексеев', 'Лебедева', 'Семёнов',
];
const DEPARTMENTS = ['Разработка', 'Дизайн', 'Маркетинг', 'Продажи', 'Поддержка', 'Финансы'];
const STATUSES: UserStatus[] = ['active', 'active', 'active', 'pending', 'blocked'];

// Deterministic pseudo-random generator so the demo data is stable between renders.
function createRng(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

export function generateUsers(count: number): User[] {
  const rng = createRng(42);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rng() * arr.length)];

  return Array.from({ length: count }, (_, index) => {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    const createdAt = new Date(2023, 0, 1 + Math.floor(rng() * 700));
    return {
      id: String(index + 1),
      name: `${first} ${last}`,
      email: `user${index + 1}@example.com`,
      department: pick(DEPARTMENTS),
      status: pick(STATUSES),
      age: 20 + Math.floor(rng() * 40),
      createdAt: createdAt.toISOString().slice(0, 10),
    };
  });
}
