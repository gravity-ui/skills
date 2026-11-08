export type Status = 'new' | 'processing' | 'completed' | 'cancelled';
export interface Order {
  id: string;
  customer: string;
  email: string;
  amount: number;
  date: string;
  time: string;
  status: Status;
  payment: 'paid' | 'waiting' | 'refund';
  items: number;
  children?: Order[];
}
export const statuses: {id: Status; title: string; plural: string}[] = [
  {id: 'new', title: 'Новый', plural: 'Новые'},
  {id: 'processing', title: 'В обработке', plural: 'В обработке'},
  {id: 'completed', title: 'Выполнен', plural: 'Выполненные'},
  {id: 'cancelled', title: 'Отменён', plural: 'Отменённые'},
];
const customers = [
  ['Анна Смирнова', 'anna.smirnova@mail.ru'],
  ['Михаил Иванов', 'm.ivanov@gmail.com'],
  ['Елена Козлова', 'elena.kozlova@yandex.ru'],
  ['Дмитрий Петров', 'd.petrov@mail.ru'],
  ['Ольга Соколова', 'olga.sokolova@gmail.com'],
  ['Александр Волков', 'a.volkov@yandex.ru'],
  ['Мария Новикова', 'maria.novikova@mail.ru'],
  ['Иван Морозов', 'i.morozov@gmail.com'],
  ['Екатерина Лебедева', 'kate.lebedeva@yandex.ru'],
  ['Артём Попов', 'artem.popov@mail.ru'],
];
export const initialOrders: Order[] = Array.from({length: 248}, (_, i) => {
  const status: Status = i < 3 ? 'new' : i < 6 ? 'processing' : i < 9 ? 'completed' : i === 9 ? 'cancelled' : i < 39 ? 'new' : i < 84 ? 'processing' : i < 237 ? 'completed' : 'cancelled';
  return {
    id: `ORD-${String(248 - i).padStart(4, '0')}`,
    customer: customers[i % customers.length][0],
    email: customers[i % customers.length][1],
    amount: [12490, 5800, 24900, 8350, 15700, 3200, 18990, 6490, 11250, 4800][i % 10],
    date: `2026-11-${String(4 - Math.floor(i / 70)).padStart(2, '0')}`,
    time: `${String(14 - Math.floor((i % 70) / 10)).padStart(2, '0')}:${String((32 + i * 7) % 60).padStart(2, '0')}`,
    status,
    payment: status === 'cancelled' ? 'refund' : status === 'new' && i % 3 === 1 ? 'waiting' : 'paid',
    items: 1 + i % 5,
  };
});
export const money = (value: number) => new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
export const formatDate = (date: string) => new Date(date + 'T12:00:00').toLocaleDateString('ru-RU', {day: '2-digit', month: 'short', year: 'numeric'}).replace(' г.', '').replace('.', '');
export const initials = (name: string) => name.split(' ').slice(0, 2).map(word => word[0]).join('');
export function readStorage<T>(key: string, fallback: T): T {
  try { const data = localStorage.getItem(key); return data ? JSON.parse(data) : fallback; } catch { return fallback; }
}
export function saveStorage(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Private browsing may disable storage. */ }
}
export function exportOrders(orders: Order[]) {
  const fields = [['Номер', 'Клиент', 'Email', 'Дата', 'Сумма', 'Статус', 'Оплата'], ...orders.map(o => [o.id, o.customer, o.email, o.date, String(o.amount), statuses.find(s => s.id === o.status)!.title, o.payment === 'paid' ? 'Оплачен' : o.payment === 'waiting' ? 'Ожидает оплаты' : 'Возврат'])];
  const csv = '\uFEFF' + fields.map(row => row.map(v => '"' + (/^[=+\-@\t\r]/.test(v) ? "'" : '') + v.replaceAll('"', '""') + '"').join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], {type: 'text/csv;charset=utf-8;'}));
  const link = document.createElement('a'); link.href = url; link.download = 'potok-orders.csv'; link.click(); URL.revokeObjectURL(url);
}
