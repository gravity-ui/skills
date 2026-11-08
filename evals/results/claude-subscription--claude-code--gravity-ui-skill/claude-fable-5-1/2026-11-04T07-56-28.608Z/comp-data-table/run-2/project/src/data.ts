export type EmployeeStatus = 'active' | 'vacation' | 'probation' | 'fired';

export interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  status: EmployeeStatus;
  salary: number;
  hiredAt: string; // ISO date
}

export const STATUS_LABELS: Record<EmployeeStatus, string> = {
  active: 'Работает',
  vacation: 'В отпуске',
  probation: 'Испытательный срок',
  fired: 'Уволен',
};

const FIRST_NAMES = [
  'Анна', 'Иван', 'Мария', 'Дмитрий', 'Елена', 'Сергей', 'Ольга', 'Алексей',
  'Наталья', 'Павел', 'Екатерина', 'Михаил', 'Татьяна', 'Андрей', 'Юлия', 'Николай',
];
const LAST_NAMES = [
  'Иванова', 'Петров', 'Смирнова', 'Кузнецов', 'Попова', 'Соколов', 'Лебедева',
  'Козлов', 'Новикова', 'Морозов', 'Волкова', 'Фёдоров', 'Орлова', 'Захаров',
];
const DEPARTMENTS = ['Разработка', 'Дизайн', 'Маркетинг', 'Продажи', 'Поддержка', 'Финансы'];
const POSITIONS = ['Junior', 'Middle', 'Senior', 'Lead', 'Head'];
const STATUSES: EmployeeStatus[] = ['active', 'active', 'active', 'vacation', 'probation', 'fired'];

// Deterministic pseudo-random so the demo renders the same rows on every reload.
function makeRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function generateEmployees(count: number): Employee[] {
  const rnd = makeRng(42);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)];

  return Array.from({ length: count }, (_, i) => {
    const year = 2015 + Math.floor(rnd() * 10);
    const month = 1 + Math.floor(rnd() * 12);
    const day = 1 + Math.floor(rnd() * 28);
    return {
      id: String(i + 1),
      name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
      department: pick(DEPARTMENTS),
      position: pick(POSITIONS),
      status: pick(STATUSES),
      salary: 80_000 + Math.round(rnd() * 32) * 10_000,
      hiredAt: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    };
  });
}
