export type EmployeeStatus = 'active' | 'vacation' | 'dismissed';

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  hiredAt: string; // ISO date
  status: EmployeeStatus;
}

const PEOPLE = {
  male: {
    first: ['Иван', 'Дмитрий', 'Сергей', 'Алексей', 'Павел', 'Михаил', 'Андрей', 'Николай'],
    last: ['Петров', 'Кузнецов', 'Васильев', 'Михайлов', 'Фёдоров', 'Волков', 'Лебедев', 'Егоров'],
  },
  female: {
    first: ['Анна', 'Мария', 'Елена', 'Ольга', 'Наталья', 'Екатерина', 'Татьяна', 'Юлия'],
    last: ['Иванова', 'Смирнова', 'Попова', 'Соколова', 'Новикова', 'Морозова', 'Алексеева', 'Семёнова'],
  },
};
const DEPARTMENTS = ['Разработка', 'Дизайн', 'Маркетинг', 'Продажи', 'Поддержка', 'Финансы'];
const POSITIONS = ['Junior', 'Middle', 'Senior', 'Lead', 'Head'];
const STATUSES: EmployeeStatus[] = ['active', 'active', 'active', 'vacation', 'dismissed'];

/** Простой детерминированный генератор, чтобы данные не менялись между перезагрузками. */
function createRng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
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

export function generateEmployees(count = 57, seed = 42): Employee[] {
  const rnd = createRng(seed);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)];

  return Array.from({ length: count }, (_, i) => {
    const person = rnd() < 0.5 ? PEOPLE.male : PEOPLE.female;
    const firstName = pick(person.first);
    const lastName = pick(person.last);
    const position = pick(POSITIONS);
    const base = 60_000 + POSITIONS.indexOf(position) * 45_000;
    const year = 2015 + Math.floor(rnd() * 10);
    const month = 1 + Math.floor(rnd() * 12);
    const day = 1 + Math.floor(rnd() * 28);

    return {
      id: String(1001 + i),
      name: `${firstName} ${lastName}`,
      email: `${translit(firstName)}.${translit(lastName)}@example.com`,
      department: pick(DEPARTMENTS),
      position,
      salary: base + Math.round(rnd() * 40) * 1000,
      hiredAt: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      status: pick(STATUSES),
    };
  });
}
