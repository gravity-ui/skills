export type EmployeeStatus = 'active' | 'vacation' | 'fired';

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  hiredAt: string; // ISO date, YYYY-MM-DD
  status: EmployeeStatus;
}

const FIRST_NAMES: Array<[string, string]> = [
  // [русское имя, транслит для email]
  ['Иван', 'ivan'],
  ['Анна', 'anna'],
  ['Пётр', 'petr'],
  ['Мария', 'maria'],
  ['Сергей', 'sergey'],
  ['Елена', 'elena'],
  ['Дмитрий', 'dmitry'],
  ['Ольга', 'olga'],
  ['Алексей', 'alexey'],
  ['Наталья', 'natalia'],
  ['Максим', 'maxim'],
  ['Татьяна', 'tatiana'],
];

const LAST_NAMES: Array<[string, string]> = [
  ['Иванов', 'ivanov'],
  ['Петрова', 'petrova'],
  ['Сидоров', 'sidorov'],
  ['Кузнецова', 'kuznetsova'],
  ['Смирнов', 'smirnov'],
  ['Васильева', 'vasilyeva'],
  ['Попов', 'popov'],
  ['Соколова', 'sokolova'],
  ['Михайлов', 'mikhailov'],
  ['Фёдорова', 'fedorova'],
  ['Волков', 'volkov'],
  ['Морозова', 'morozova'],
];

const DEPARTMENTS = ['Разработка', 'Аналитика', 'Дизайн', 'Маркетинг', 'Продажи', 'Поддержка'];

const POSITIONS = [
  'Стажёр',
  'Специалист',
  'Ведущий специалист',
  'Руководитель группы',
  'Директор направления',
];

const STATUSES: EmployeeStatus[] = ['active', 'active', 'active', 'vacation', 'fired'];

export const employees: Employee[] = Array.from({length: 47}, (_, i) => {
  const [firstName, firstLat] = FIRST_NAMES[(i * 5 + 1) % FIRST_NAMES.length];
  const [lastName, lastLat] = LAST_NAMES[(i * 7 + 3) % LAST_NAMES.length];
  const hired = new Date(Date.UTC(2018, 0, 15));
  hired.setUTCDate(hired.getUTCDate() + ((i * 137) % 2900));

  return {
    id: `emp-${i + 1}`,
    name: `${lastName} ${firstName}`,
    email: `${firstLat}.${lastLat}${i + 1}@example.com`,
    department: DEPARTMENTS[(i * 3 + 2) % DEPARTMENTS.length],
    position: POSITIONS[(i * 2 + 1) % POSITIONS.length],
    salary: 55_000 + ((i * 17_311) % 245_000),
    hiredAt: hired.toISOString().slice(0, 10),
    status: STATUSES[i % STATUSES.length],
  };
});
