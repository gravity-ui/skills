export type Employee = {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  /** Дата найма в формате YYYY-MM-DD */
  hiredAt: string;
  active: boolean;
};

const FIRST_NAMES = ['Алексей', 'Мария', 'Дмитрий', 'Елена', 'Иван', 'Ольга', 'Сергей', 'Анна', 'Павел', 'Наталья'];
const LAST_NAMES = ['Иванов', 'Петрова', 'Смирнов', 'Кузнецова', 'Попов', 'Соколова', 'Лебедев', 'Новикова', 'Морозов'];
const DEPARTMENTS = ['Разработка', 'Дизайн', 'Маркетинг', 'Продажи', 'HR', 'Финансы'];
const POSITIONS = ['Стажёр', 'Специалист', 'Старший специалист', 'Руководитель'];

// Детерминированный генератор, чтобы демо-данные были одинаковыми при каждой загрузке.
function createRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const random = createRandom(42);
const pick = <T>(items: T[]): T => items[Math.floor(random() * items.length)];
const pad = (value: number) => String(value).padStart(2, '0');

export const EMPLOYEES: Employee[] = Array.from({ length: 53 }, (_, index) => {
  const n = index + 1;
  const year = 2015 + Math.floor(random() * 11);
  const month = 1 + Math.floor(random() * 12);
  const day = 1 + Math.floor(random() * 28);

  return {
    id: `emp-${n}`,
    name: `${pick(LAST_NAMES)} ${pick(FIRST_NAMES)}`,
    email: `employee${n}@example.com`,
    department: pick(DEPARTMENTS),
    position: pick(POSITIONS),
    salary: 80_000 + Math.round(random() * 220) * 1000,
    hiredAt: `${year}-${pad(month)}-${pad(day)}`,
    active: random() > 0.2,
  };
});
