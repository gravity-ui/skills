export type PersonStatus = 'active' | 'vacation' | 'fired';

export type Person = {
  id: string;
  name: string;
  role: string;
  city: string;
  age: number;
  salary: number;
  status: PersonStatus;
};

export const STATUS_META: Record<PersonStatus, {title: string; theme: 'success' | 'warning' | 'danger'}> = {
  active: {title: 'Активен', theme: 'success'},
  vacation: {title: 'Отпуск', theme: 'warning'},
  fired: {title: 'Уволен', theme: 'danger'},
};

const names = [
  'Анна Иванова',
  'Дмитрий Петров',
  'Мария Сидорова',
  'Алексей Смирнов',
  'Елена Кузнецова',
  'Сергей Попов',
  'Ольга Васильева',
  'Николай Соколов',
  'Татьяна Михайлова',
  'Павел Новиков',
  'Ирина Фёдорова',
  'Андрей Морозов',
];

const roles = ['Инженер', 'Дизайнер', 'Менеджер', 'Аналитик', 'Разработчик', 'Тестировщик'];

const cities = [
  'Москва',
  'Санкт-Петербург',
  'Казань',
  'Новосибирск',
  'Екатеринбург',
  'Нижний Новгород',
];

const statuses: PersonStatus[] = [
  'active',
  'active',
  'active',
  'vacation',
  'active',
  'fired',
  'active',
  'vacation',
];

// Deterministic demo dataset (47 rows so pagination has several pages).
export const people: Person[] = Array.from({length: 47}, (_, i) => ({
  id: String(i + 1),
  name: names[(i * 5 + 3) % names.length],
  role: roles[(i * 3 + 1) % roles.length],
  city: cities[(i * 7 + 2) % cities.length],
  age: 22 + ((i * 13) % 38),
  salary: 80_000 + ((i * 37_000) % 220_000),
  status: statuses[i % statuses.length],
}));
