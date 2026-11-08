export type Status = 'active' | 'pending' | 'blocked';

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  status: Status;
  salary: number;
  hiredAt: string; // ISO date
}

const FIRST = ['Анна', 'Борис', 'Виктор', 'Галина', 'Дмитрий', 'Елена', 'Жанна', 'Игорь', 'Ксения', 'Леонид', 'Мария', 'Николай'];
const LAST = ['Иванов', 'Петров', 'Сидоров', 'Кузнецов', 'Смирнов', 'Попов', 'Лебедев', 'Козлов', 'Новиков', 'Морозов'];
const DEPARTMENTS = ['Разработка', 'Дизайн', 'Аналитика', 'Маркетинг', 'Поддержка'];
const STATUSES: Status[] = ['active', 'pending', 'blocked', 'active', 'active'];

// Deterministic pseudo-random generator, so the data is stable between reloads.
function createRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function generateEmployees(count: number): Employee[] {
  const rnd = createRandom(42);
  return Array.from({length: count}, (_, i) => {
    const first = FIRST[Math.floor(rnd() * FIRST.length)];
    const last = LAST[i % LAST.length];
    const date = new Date(Date.UTC(2015, 0, 1) + Math.floor(rnd() * 3650) * 86400000);
    return {
      id: String(i + 1),
      name: `${first} ${last}`,
      email: `user${i + 1}@example.com`,
      department: DEPARTMENTS[Math.floor(rnd() * DEPARTMENTS.length)],
      status: STATUSES[Math.floor(rnd() * STATUSES.length)],
      salary: 60000 + Math.floor(rnd() * 140) * 1000,
      hiredAt: date.toISOString().slice(0, 10),
    };
  });
}
