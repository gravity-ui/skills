export type UserStatus = 'active' | 'invited' | 'blocked';

export interface UserRow {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  salary: number;
  joinedAt: string; // ISO date
  status: UserStatus;
}

const FIRST_NAMES = [
  'Анна', 'Иван', 'Мария', 'Дмитрий', 'Елена', 'Сергей', 'Ольга', 'Алексей',
  'Наталья', 'Павел', 'Екатерина', 'Михаил', 'Татьяна', 'Андрей', 'Юлия', 'Николай',
];
const LAST_NAMES = [
  'Смирнова', 'Иванов', 'Кузнецова', 'Попов', 'Соколова', 'Лебедев', 'Козлова', 'Новиков',
  'Морозова', 'Петров', 'Волкова', 'Соловьёв', 'Васильева', 'Зайцев', 'Павлова', 'Семёнов',
];
const DEPARTMENTS = ['Разработка', 'Дизайн', 'Маркетинг', 'Продажи', 'Поддержка', 'Финансы'];
const ROLES = ['Инженер', 'Старший инженер', 'Тимлид', 'Менеджер', 'Аналитик', 'Стажёр'];
const STATUSES: UserStatus[] = ['active', 'active', 'active', 'invited', 'blocked'];

/** Детерминированный генератор, чтобы данные не менялись между перезагрузками. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateUsers(count: number, seed = 42): UserRow[] {
  const rand = mulberry32(seed);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];

  return Array.from({ length: count }, (_, i) => {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    const year = 2015 + Math.floor(rand() * 10);
    const month = 1 + Math.floor(rand() * 12);
    const day = 1 + Math.floor(rand() * 28);
    const translit = `user${i + 1}`;

    return {
      id: String(i + 1),
      name: `${first} ${last}`,
      email: `${translit}@example.com`,
      department: pick(DEPARTMENTS),
      role: pick(ROLES),
      salary: 60_000 + Math.floor(rand() * 240) * 1000,
      joinedAt: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      status: pick(STATUSES),
    };
  });
}
