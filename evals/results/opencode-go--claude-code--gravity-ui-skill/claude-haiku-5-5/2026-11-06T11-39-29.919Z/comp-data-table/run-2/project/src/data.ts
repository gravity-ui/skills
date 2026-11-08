export type Employee = {
  id: string;
  name: string;
  department: string;
  /** Индекс в LEVEL_LABELS: 0 = Junior … 3 = Lead */
  level: number;
  /** Зарплата в рублях */
  salary: number;
  /** Дата найма в формате YYYY-MM-DD */
  hiredAt: string;
};

export const LEVEL_LABELS = ['Junior', 'Middle', 'Senior', 'Lead'] as const;

const FIRST_NAMES = [
  'Анна', 'Борис', 'Вера', 'Григорий', 'Дарья', 'Евгений', 'Жанна', 'Захар',
  'Ирина', 'Кирилл', 'Лидия', 'Максим', 'Нина', 'Олег', 'Полина', 'Роман',
  'Светлана', 'Тимур', 'Ульяна', 'Фёдор', 'Хана', 'Яков',
];
const LAST_NAMES = [
  'Иванов', 'Петров', 'Смирнова', 'Кузнецов', 'Соколова',
  'Попов', 'Лебедева', 'Новиков', 'Морозова', 'Волков',
];
const DEPARTMENTS = ['Разработка', 'Дизайн', 'Маркетинг', 'Продажи', 'Поддержка', 'Финансы'];

const pad = (n: number) => String(n).padStart(2, '0');

/** Детерминированные демо-данные (42 строки — несколько страниц при размере 10). */
export const EMPLOYEES: Employee[] = Array.from({ length: 42 }, (_, i) => {
  const level = i % 4;
  return {
    id: `emp-${i + 1}`,
    name: `${FIRST_NAMES[(i * 7) % FIRST_NAMES.length]} ${LAST_NAMES[(i * 3) % LAST_NAMES.length]}`,
    department: DEPARTMENTS[i % DEPARTMENTS.length],
    level,
    salary: 90_000 + level * 45_000 + ((i * 7919) % 20) * 1_000,
    hiredAt: `${2016 + ((i * 5) % 9)}-${pad(1 + ((i * 7) % 12))}-${pad(1 + ((i * 11) % 28))}`,
  };
});
