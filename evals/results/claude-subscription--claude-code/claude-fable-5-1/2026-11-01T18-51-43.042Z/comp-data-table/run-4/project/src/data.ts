export type UserRole = 'Администратор' | 'Редактор' | 'Аналитик' | 'Наблюдатель';
export type UserStatus = 'active' | 'invited' | 'blocked';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  age: number;
  registeredAt: string; // ISO date
}

const FIRST_NAMES = [
  'Алексей', 'Мария', 'Иван', 'Екатерина', 'Дмитрий', 'Анна', 'Сергей', 'Ольга',
  'Павел', 'Наталья', 'Михаил', 'Елена', 'Андрей', 'Татьяна', 'Николай', 'Ирина',
];
const LAST_NAMES = [
  'Иванов', 'Петрова', 'Смирнов', 'Кузнецова', 'Попов', 'Васильева', 'Соколов',
  'Михайлова', 'Новиков', 'Фёдорова', 'Морозов', 'Волкова', 'Алексеев', 'Лебедева',
];
const ROLES: UserRole[] = ['Администратор', 'Редактор', 'Аналитик', 'Наблюдатель'];
const STATUSES: UserStatus[] = ['active', 'active', 'active', 'invited', 'blocked'];

/** Детерминированный генератор, чтобы данные не менялись между перезагрузками. */
function makeRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

export function generateUsers(count: number): User[] {
  const rand = makeRandom(42);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];

  return Array.from({ length: count }, (_, i) => {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    const day = new Date(2023, 0, 1).getTime() + Math.floor(rand() * 365 * 2) * 86_400_000;
    return {
      id: String(i + 1),
      name: `${first} ${last}`,
      email: `user${i + 1}@example.com`,
      role: pick(ROLES),
      status: pick(STATUSES),
      age: 20 + Math.floor(rand() * 40),
      registeredAt: new Date(day).toISOString().slice(0, 10),
    };
  });
}
