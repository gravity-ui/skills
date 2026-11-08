export type EmployeeStatus = 'active' | 'vacation' | 'fired';

export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  status: EmployeeStatus;
  /** ISO date (YYYY-MM-DD) */
  hiredAt: string;
}

const FIRST_NAMES = [
  'Алексей', 'Мария', 'Иван', 'Екатерина', 'Дмитрий', 'Анна', 'Сергей', 'Ольга',
  'Андрей', 'Наталья', 'Михаил', 'Елена', 'Павел', 'Татьяна', 'Николай', 'Юлия',
];
const LAST_NAMES = [
  'Иванов', 'Петров', 'Сидоров', 'Смирнов', 'Кузнецов', 'Попов', 'Васильев', 'Соколов',
  'Михайлов', 'Новиков', 'Фёдоров', 'Морозов', 'Волков', 'Алексеев', 'Лебедев', 'Семёнов',
];
const DEPARTMENTS = ['Разработка', 'Дизайн', 'Маркетинг', 'Продажи', 'Поддержка', 'Финансы'];
const POSITIONS: Record<string, string[]> = {
  Разработка: ['Frontend-разработчик', 'Backend-разработчик', 'QA-инженер', 'Тимлид'],
  Дизайн: ['Продуктовый дизайнер', 'UX-исследователь', 'Арт-директор'],
  Маркетинг: ['Маркетолог', 'Контент-менеджер', 'SMM-специалист'],
  Продажи: ['Менеджер по продажам', 'Аккаунт-менеджер', 'Руководитель отдела'],
  Поддержка: ['Специалист поддержки', 'Старший специалист'],
  Финансы: ['Бухгалтер', 'Финансовый аналитик'],
};
const STATUSES: EmployeeStatus[] = ['active', 'active', 'active', 'vacation', 'fired'];

/** Детерминированный генератор, чтобы данные не менялись между перезагрузками. */
function createRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function translit(value: string): string {
  const map: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y',
    к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
    х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  };
  return value
    .toLowerCase()
    .split('')
    .map((ch) => map[ch] ?? ch)
    .join('');
}

export function generateEmployees(count: number, seed = 42): Employee[] {
  const random = createRandom(seed);
  const pick = <T,>(list: T[]): T => list[Math.floor(random() * list.length)];

  return Array.from({ length: count }, (_, index) => {
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const isFemale = firstName.endsWith('а') || firstName.endsWith('я');
    const fullLastName = isFemale ? `${lastName}а` : lastName;
    const department = pick(DEPARTMENTS);
    const position = pick(POSITIONS[department]);
    const hireTime = Date.UTC(2015, 0, 1) + random() * (Date.UTC(2025, 11, 31) - Date.UTC(2015, 0, 1));

    return {
      id: index + 1,
      name: `${firstName} ${fullLastName}`,
      email: `${translit(firstName)}.${translit(lastName)}${index + 1}@example.com`,
      department,
      position,
      salary: Math.round((60 + random() * 240) / 5) * 5 * 1000,
      status: pick(STATUSES),
      hiredAt: new Date(hireTime).toISOString().slice(0, 10),
    };
  });
}
