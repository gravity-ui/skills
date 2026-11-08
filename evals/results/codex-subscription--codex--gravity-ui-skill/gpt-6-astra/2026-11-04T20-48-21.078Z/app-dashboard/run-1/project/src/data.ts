export type Status = 'new' | 'processing' | 'completed' | 'cancelled';
export interface Order { id: string; name: string; email: string; amount: number; date: string; time: string; status: Status; paid: boolean; items: number; }
export const statusInfo: Record<Status, {label: string; short: string}> = {
  new: {label: 'Новые', short: 'Новый'}, processing: {label: 'В обработке', short: 'В обработке'},
  completed: {label: 'Выполненные', short: 'Выполнен'}, cancelled: {label: 'Отменённые', short: 'Отменён'},
};
const people = [
  ['Анна Смирнова', 'anna.smirnova@gmail.com'], ['Михаил Иванов', 'm.ivanov@yandex.ru'],
  ['Елена Козлова', 'elena.kozlova@mail.ru'], ['Дмитрий Петров', 'd.petrov@gmail.com'],
  ['Ольга Соколова', 'olga.sokolova@yandex.ru'], ['Алексей Морозов', 'alex.morozov@mail.ru'],
  ['Мария Волкова', 'm.volkova@gmail.com'], ['Иван Новиков', 'ivan.novikov@yandex.ru'],
  ['Екатерина Павлова', 'kate.pavlova@mail.ru'], ['Андрей Васильев', 'andrey.v@gmail.com'],
  ['София Лебедева', 'sofia.lebedeva@mail.ru'], ['Никита Орлов', 'nikita.orlov@yandex.ru'],
];
const amounts = [12490, 8750, 24900, 5680, 15990, 3200, 18750, 6490, 32900, 4200, 11500, 7900];
export const initialOrders: Order[] = Array.from({length: 128}, (_, i) => ({
  id: String(1048 - i), name: people[i % 12][0], email: people[i % 12][1],
  amount: amounts[i % 12], date: `2026-11-${String(4 - Math.floor(i / 36)).padStart(2, '0')}`,
  time: `${String(14 - i % 6).padStart(2, '0')}:${String(32 - i % 30).padStart(2, '0')}`,
  status: (i % 12 < 3 ? 'new' : i % 12 < 6 ? 'processing' : i % 12 < 11 ? 'completed' : 'cancelled') as Status,
  paid: i % 5 !== 1, items: 1 + i % 4,
}));
export const money = (n: number) => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
export const formatDate = (s: string) => new Date(s + 'T12:00:00').toLocaleDateString('ru-RU', {day: 'numeric', month: 'short'}).replace('.', '') + '.';
export const initials = (s: string) => s.split(' ').map(p => p[0]).slice(0, 2).join('');
