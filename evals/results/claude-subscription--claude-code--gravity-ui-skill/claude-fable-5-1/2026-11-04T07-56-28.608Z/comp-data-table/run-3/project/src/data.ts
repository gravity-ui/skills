export type UserStatus = 'active' | 'pending' | 'blocked';

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  status: UserStatus;
  createdAt: string; // ISO date
  balance: number;
}

const FIRST_NAMES = [
  'Анна', 'Иван', 'Мария', 'Пётр', 'Елена', 'Дмитрий', 'Ольга', 'Сергей',
  'Наталья', 'Алексей', 'Татьяна', 'Михаил', 'Екатерина', 'Андрей', 'Юлия',
];
const LAST_NAMES = [
  'Иванова', 'Петров', 'Смирнова', 'Кузнецов', 'Попова', 'Васильев', 'Соколова',
  'Михайлов', 'Новикова', 'Фёдоров', 'Морозова', 'Волков', 'Алексеева', 'Лебедев',
];
const ROLES = ['Администратор', 'Редактор', 'Аналитик', 'Разработчик', 'Менеджер', 'Наблюдатель'];
const STATUSES: UserStatus[] = ['active', 'active', 'active', 'pending', 'blocked'];

// Deterministic pseudo-random generator so the dataset is stable between renders.
function makeRng(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

export function generateUsers(count: number): UserRow[] {
  const rng = makeRng(42);
  const rows: UserRow[] = [];
  for (let i = 0; i < count; i++) {
    const first = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
    const day = new Date(2024, 0, 1).getTime() + Math.floor(rng() * 600) * 86_400_000;
    rows.push({
      id: String(1000 + i),
      name: `${first} ${last}`,
      email: `user${1000 + i}@example.com`,
      role: ROLES[Math.floor(rng() * ROLES.length)],
      status: STATUSES[Math.floor(rng() * STATUSES.length)],
      createdAt: new Date(day).toISOString().slice(0, 10),
      balance: Math.round(rng() * 250_000) / 100,
    });
  }
  return rows;
}
