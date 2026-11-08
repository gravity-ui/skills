export type EmployeeStatus = 'active' | 'vacation' | 'blocked';

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  status: EmployeeStatus;
  salary: number;
  hiredAt: string; // ISO date
}

const FIRST_NAMES = [
  'Анна', 'Иван', 'Мария', 'Пётр', 'Елена', 'Дмитрий', 'Ольга', 'Сергей',
  'Наталья', 'Алексей', 'Татьяна', 'Андрей', 'Юлия', 'Михаил', 'Екатерина', 'Николай',
];
const LAST_NAMES = [
  'Иванова', 'Петров', 'Смирнова', 'Кузнецов', 'Попова', 'Васильев', 'Соколова', 'Михайлов',
  'Новикова', 'Фёдоров', 'Морозова', 'Волков', 'Алексеева', 'Лебедев', 'Семёнова', 'Егоров',
];
const DEPARTMENTS = ['Разработка', 'Дизайн', 'Маркетинг', 'Продажи', 'Поддержка', 'Финансы'];
const STATUSES: EmployeeStatus[] = ['active', 'active', 'active', 'vacation', 'blocked'];

/** Deterministic pseudo-random generator so the dataset is stable between renders. */
function createRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

export function generateEmployees(count: number): Employee[] {
  const random = createRandom(42);
  const pick = <T,>(list: T[]) => list[Math.floor(random() * list.length)];

  return Array.from({ length: count }, (_, index) => {
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const hired = new Date(2015, 0, 1);
    hired.setDate(hired.getDate() + Math.floor(random() * 3600));

    return {
      id: String(index + 1),
      name: `${firstName} ${lastName}`,
      email: `user${index + 1}@example.com`,
      department: pick(DEPARTMENTS),
      status: pick(STATUSES),
      salary: 60_000 + Math.round(random() * 240) * 1000,
      hiredAt: hired.toISOString().slice(0, 10),
    };
  });
}
