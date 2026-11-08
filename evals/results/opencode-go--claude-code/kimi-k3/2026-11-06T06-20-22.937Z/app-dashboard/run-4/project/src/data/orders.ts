export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customer: string;
  email: string;
  city: string;
  date: string; // ISO
  items: number;
  amount: number;
  status: OrderStatus;
}

export const ORDER_STATUSES: {
  id: OrderStatus;
  title: string;
  theme: 'info' | 'warning' | 'utility' | 'success' | 'danger';
}[] = [
  {id: 'new', title: 'Новый', theme: 'info'},
  {id: 'processing', title: 'В обработке', theme: 'warning'},
  {id: 'shipped', title: 'Отправлен', theme: 'utility'},
  {id: 'delivered', title: 'Доставлен', theme: 'success'},
  {id: 'cancelled', title: 'Отменён', theme: 'danger'},
];

export const STATUS_BY_ID = Object.fromEntries(
  ORDER_STATUSES.map((s) => [s.id, s]),
) as Record<OrderStatus, (typeof ORDER_STATUSES)[number]>;

// Deterministic pseudo-random generator so mock data is stable between reloads.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST_NAMES = [
  'Иван', 'Мария', 'Алексей', 'Ольга', 'Дмитрий', 'Екатерина', 'Сергей', 'Анна',
  'Николай', 'Елена', 'Павел', 'Наталья', 'Андрей', 'Татьяна', 'Максим', 'Ирина',
];
const LAST_NAMES = [
  'Иванов', 'Петрова', 'Сидоров', 'Кузнецова', 'Смирнов', 'Волкова', 'Морозов', 'Лебедева',
  'Козлов', 'Новикова', 'Соколов', 'Попова', 'Васильев', 'Захарова', 'Орлов', 'Беляева',
];
const CITIES = [
  'Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань',
  'Нижний Новгород', 'Самара', 'Ростов-на-Дону', 'Краснодар', 'Воронеж',
];

const rand = mulberry32(20261106);

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

export const ORDERS: Order[] = Array.from({length: 48}, (_, i) => {
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  const customer = `${first} ${last}`;
  const email = `${first}.${last}@example.ru`.toLowerCase();
  // Dates spread over the last ~60 days.
  const date = new Date(Date.UTC(2026, 9, 5) - rand() * 60 * 24 * 3600 * 1000);
  const statusWeights: OrderStatus[] = [
    'new', 'new', 'new',
    'processing', 'processing', 'processing',
    'shipped', 'shipped', 'shipped',
    'delivered', 'delivered', 'delivered', 'delivered', 'delivered',
    'cancelled', 'cancelled',
  ];
  const items = 1 + Math.floor(rand() * 8);
  return {
    id: `ORD-${24100 + i}`,
    customer,
    email,
    city: pick(CITIES),
    date: date.toISOString(),
    items,
    amount: Math.round((800 + rand() * 42000) / 10) * 10,
    status: pick(statusWeights),
  };
});

export const formatAmount = (value: number) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('ru-RU', {day: '2-digit', month: '2-digit', year: 'numeric'}).format(
    new Date(iso),
  );
