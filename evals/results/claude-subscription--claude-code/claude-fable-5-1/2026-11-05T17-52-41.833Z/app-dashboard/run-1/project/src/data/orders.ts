export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customer: string;
  email: string;
  city: string;
  createdAt: string; // ISO date
  items: number;
  amount: number; // rubles
  payment: 'card' | 'cash' | 'sbp' | 'invoice';
  status: OrderStatus;
}

export const STATUS_ORDER: OrderStatus[] = ['new', 'processing', 'shipped', 'delivered', 'cancelled'];

export const STATUS_META: Record<
  OrderStatus,
  { title: string; theme: 'info' | 'warning' | 'utility' | 'success' | 'danger' }
> = {
  new: { title: 'Новый', theme: 'info' },
  processing: { title: 'В обработке', theme: 'warning' },
  shipped: { title: 'Отправлен', theme: 'utility' },
  delivered: { title: 'Доставлен', theme: 'success' },
  cancelled: { title: 'Отменён', theme: 'danger' },
};

export const PAYMENT_TITLE: Record<Order['payment'], string> = {
  card: 'Карта',
  cash: 'Наличные',
  sbp: 'СБП',
  invoice: 'Счёт',
};

const customers: Array<[string, string]> = [
  ['Анна Петрова', 'a.petrova@example.com'],
  ['Иван Смирнов', 'ivan.smirnov@example.com'],
  ['Мария Кузнецова', 'm.kuznetsova@example.com'],
  ['Дмитрий Орлов', 'd.orlov@example.com'],
  ['Елена Волкова', 'e.volkova@example.com'],
  ['Сергей Морозов', 's.morozov@example.com'],
  ['Ольга Лебедева', 'o.lebedeva@example.com'],
  ['Алексей Новиков', 'a.novikov@example.com'],
  ['Наталья Фёдорова', 'n.fedorova@example.com'],
  ['Павел Соколов', 'p.sokolov@example.com'],
  ['Юлия Егорова', 'y.egorova@example.com'],
  ['Михаил Козлов', 'm.kozlov@example.com'],
  ['Татьяна Павлова', 't.pavlova@example.com'],
  ['Андрей Семёнов', 'a.semenov@example.com'],
  ['Ксения Голубева', 'k.golubeva@example.com'],
  ['Роман Виноградов', 'r.vinogradov@example.com'],
];

const cities = [
  'Москва',
  'Санкт-Петербург',
  'Казань',
  'Новосибирск',
  'Екатеринбург',
  'Нижний Новгород',
  'Самара',
  'Краснодар',
];

const payments: Order['payment'][] = ['card', 'card', 'sbp', 'card', 'cash', 'invoice', 'sbp'];
const statuses: OrderStatus[] = [
  'new',
  'processing',
  'delivered',
  'shipped',
  'delivered',
  'new',
  'cancelled',
  'processing',
  'delivered',
  'shipped',
  'delivered',
  'new',
];

// Deterministic pseudo-random so the table looks the same on every reload.
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

export function generateOrders(count = 48): Order[] {
  const rnd = seeded(2024);
  const base = new Date('2026-11-05T09:00:00').getTime();
  return Array.from({ length: count }, (_, i) => {
    const [customer, email] = customers[Math.floor(rnd() * customers.length)];
    const items = 1 + Math.floor(rnd() * 7);
    const amount = Math.round((900 + rnd() * 24000) * items) / 1;
    const daysAgo = Math.floor(rnd() * 21);
    const createdAt = new Date(base - daysAgo * 86_400_000 - Math.floor(rnd() * 36_000_000)).toISOString();
    return {
      id: `ORD-${String(10240 + count - i).padStart(5, '0')}`,
      customer,
      email,
      city: cities[Math.floor(rnd() * cities.length)],
      createdAt,
      items,
      amount,
      payment: payments[Math.floor(rnd() * payments.length)],
      status: statuses[Math.floor(rnd() * statuses.length)],
    };
  }).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export const ORDERS: Order[] = generateOrders();
