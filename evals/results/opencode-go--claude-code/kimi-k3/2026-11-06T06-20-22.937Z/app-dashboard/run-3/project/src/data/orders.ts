export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customer: string;
  email: string;
  date: string; // ISO date
  items: number;
  amount: number; // RUB
  status: OrderStatus;
}

export const STATUS_ORDER: OrderStatus[] = [
  'new',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

export const STATUS_META: Record<
  OrderStatus,
  {label: string; theme: 'info' | 'warning' | 'normal' | 'success' | 'danger'}
> = {
  new: {label: 'Новый', theme: 'info'},
  processing: {label: 'В обработке', theme: 'warning'},
  shipped: {label: 'Отправлен', theme: 'normal'},
  delivered: {label: 'Доставлен', theme: 'success'},
  cancelled: {label: 'Отменён', theme: 'danger'},
};

const CUSTOMERS: Array<[string, string]> = [
  ['Иван Петров', 'ivan.petrov@example.com'],
  ['Мария Сидорова', 'maria.s@example.com'],
  ['Алексей Козлов', 'a.kozlov@example.com'],
  ['Елена Волкова', 'elena.volkova@example.com'],
  ['Дмитрий Орлов', 'd.orlov@example.com'],
  ['Ольга Смирнова', 'olga.smirnova@example.com'],
  ['Сергей Морозов', 's.morozov@example.com'],
  ['Анна Лебедева', 'anna.lebedeva@example.com'],
  ['Николай Соколов', 'n.sokolov@example.com'],
  ['Татьяна Попова', 't.popova@example.com'],
];

// Deterministic pseudo-random so the demo data is stable between reloads.
function seeded(index: number, salt: number) {
  const x = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export const ORDERS: Order[] = Array.from({length: 32}, (_, i) => {
  const n = i + 1;
  const [customer, email] = CUSTOMERS[i % CUSTOMERS.length];
  const day = 1 + Math.floor(seeded(i, 1) * 27);
  const month = 1 + Math.floor(seeded(i, 2) * 10);
  const status = STATUS_ORDER[Math.floor(seeded(i, 3) * STATUS_ORDER.length)];
  return {
    id: `ORD-${String(10240 + n).padStart(5, '0')}`,
    customer,
    email,
    date: `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    items: 1 + Math.floor(seeded(i, 4) * 8),
    amount: Math.round((900 + seeded(i, 5) * 48100) / 10) * 10,
    status,
  };
});

export const formatAmount = (value: number) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);

export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
