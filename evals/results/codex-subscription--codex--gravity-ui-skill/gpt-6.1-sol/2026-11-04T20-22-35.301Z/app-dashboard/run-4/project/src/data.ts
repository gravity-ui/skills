export type Status = 'new' | 'processing' | 'completed' | 'cancelled';
export type Order = { id: string; customer: string; email: string; initials: string; tone: number; date: string; time: string; amount: number; status: Status; payment: 'paid' | 'pending' | 'refunded'; items: number; children?: Order[] };
export const statuses: {id: Status; label: string; plural: string}[] = [
  {id: 'new', label: 'Новый', plural: 'Новые'},
  {id: 'processing', label: 'В работе', plural: 'В работе'},
  {id: 'completed', label: 'Завершён', plural: 'Завершённые'},
  {id: 'cancelled', label: 'Отменён', plural: 'Отменённые'},
];
const people = [
  ['Анна Смирнова', 'anna.smirnova@gmail.com', 'АС'], ['Михаил Иванов', 'm.ivanov@yandex.ru', 'МИ'],
  ['Елена Козлова', 'elena.kozlova@mail.ru', 'ЕК'], ['Дмитрий Петров', 'd.petrov@gmail.com', 'ДП'],
  ['Ольга Соколова', 'olga.sokolova@yandex.ru', 'ОС'], ['Александр Волков', 'a.volkov@mail.ru', 'АВ'],
  ['Мария Новикова', 'maria.novikova@gmail.com', 'МН'], ['Иван Морозов', 'i.morozov@yandex.ru', 'ИМ'],
  ['София Лебедева', 's.lebedeva@gmail.com', 'СЛ'], ['Артём Васильев', 'artem.v@mail.ru', 'АВ'],
  ['Анастасия Павлова', 'a.pavlova@gmail.com', 'АП'], ['Максим Орлов', 'max.orlov@yandex.ru', 'МО'],
];
const firstStatuses: Status[] = ['new', 'processing', 'completed', 'new', 'processing', 'completed', 'cancelled', 'processing', 'new', 'completed'];
const remaining: Status[] = [...Array(21).fill('new'), ...Array(35).fill('processing'), ...Array(55).fill('completed'), ...Array(7).fill('cancelled')];
const allStatuses = [...firstStatuses, ...remaining];
export const initialOrders: Order[] = Array.from({length: 128}, (_, i) => {
  const p = people[i % people.length];
  const status = allStatuses[i];
  const date = new Date(Date.UTC(2026, 10, 4 - Math.floor(i / 5), 12));
  return {id: String(10428 - i), customer: p[0], email: p[1], initials: p[2], tone: i % 6,
    date: date.toISOString().slice(0, 10), time: `${String(14 - i % 7).padStart(2, '0')}:${String((32 + i * 7) % 60).padStart(2, '0')}`,
    amount: [12500, 8400, 24990, 3200, 16750, 6990, 4500, 31200, 7890, 15400][i % 10], status,
    payment: status === 'cancelled' ? 'refunded' : status === 'new' && i % 2 === 0 ? 'pending' : 'paid', items: 1 + i % 4};
});
export const money = (amount: number) => new Intl.NumberFormat('ru-RU').format(amount) + ' ₽';
export const displayDate = (date: string) => new Date(date + 'T12:00:00').toLocaleDateString('ru-RU', {day: '2-digit', month: 'short', year: 'numeric'}).replace(' г.', '').replace('.', '');
export function exportOrders(orders: Order[]) {
  const csv = '\uFEFF' + [['Заказ', 'Клиент', 'Email', 'Дата', 'Сумма', 'Статус'], ...orders.map(o => [o.id, o.customer, o.email, o.date, o.amount, statuses.find(s => s.id === o.status)?.label])].map(row => row.map(v => '"' + String(v).replaceAll('"', '""') + '"').join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], {type: 'text/csv;charset=utf-8;'}));
  const a = document.createElement('a'); a.href = url; a.download = 'orders.csv'; a.click(); URL.revokeObjectURL(url);
}
