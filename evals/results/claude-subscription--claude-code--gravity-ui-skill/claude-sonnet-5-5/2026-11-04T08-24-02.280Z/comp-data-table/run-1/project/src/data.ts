export interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  salary: number;
  hiredAt: string;
}

const NAMES = [
  'Анна Смирнова', 'Борис Иванов', 'Виктория Кузнецова', 'Глеб Попов', 'Дарья Соколова',
  'Егор Лебедев', 'Жанна Козлова', 'Захар Новиков', 'Ирина Морозова', 'Кирилл Петров',
  'Лариса Волкова', 'Максим Соловьёв', 'Наталья Васильева', 'Олег Зайцев', 'Полина Павлова',
];
const DEPARTMENTS = ['Разработка', 'Дизайн', 'Аналитика', 'Маркетинг', 'Поддержка'];
const POSITIONS = ['Стажёр', 'Специалист', 'Старший специалист', 'Руководитель группы'];

export const EMPLOYEES: Employee[] = Array.from({length: 57}, (_, i) => {
  const month = (i * 5) % 12;
  const day = ((i * 7) % 28) + 1;
  return {
    id: String(i + 1),
    name: `${NAMES[i % NAMES.length]}`,
    department: DEPARTMENTS[(i * 3) % DEPARTMENTS.length],
    position: POSITIONS[(i * 7) % POSITIONS.length],
    salary: 60000 + ((i * 7919) % 90) * 1000,
    hiredAt: new Date(Date.UTC(2018 + (i % 7), month, day)).toISOString().slice(0, 10),
  };
});
