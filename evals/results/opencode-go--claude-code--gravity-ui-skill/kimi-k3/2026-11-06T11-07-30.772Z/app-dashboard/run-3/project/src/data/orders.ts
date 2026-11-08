export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  number: string;
  customer: string;
  city: string;
  createdAt: string;
  amount: number;
  status: OrderStatus;
}

/** Group row: one per order status, orders live in `items` (sub-rows). */
export interface OrderGroup {
  id: string;
  status: OrderStatus;
  items: Order[];
}

export type OrderTableItem = OrderGroup | Order;

export const isOrderGroup = (item: OrderTableItem): item is OrderGroup => 'items' in item;

export const STATUS_ORDER: OrderStatus[] = ['new', 'processing', 'shipped', 'delivered', 'cancelled'];

export const STATUS_META: Record<
  OrderStatus,
  {title: string; theme: 'info' | 'warning' | 'utility' | 'success' | 'danger'}
> = {
  new: {title: 'Новый', theme: 'info'},
  processing: {title: 'В обработке', theme: 'warning'},
  shipped: {title: 'Отправлен', theme: 'utility'},
  delivered: {title: 'Доставлен', theme: 'success'},
  cancelled: {title: 'Отменён', theme: 'danger'},
};

/* ------------------------------------------------------------------ */
/* Deterministic mock data (seeded PRNG keeps renders stable)          */
/* ------------------------------------------------------------------ */

const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const FIRST_NAMES = [
  'Иван', 'Пётр', 'Анна', 'Мария', 'Сергей', 'Ольга',
  'Дмитрий', 'Елена', 'Алексей', 'Наталья', 'Михаил', 'Екатерина',
];
const LAST_NAMES = [
  'Смирнов', 'Иванова', 'Кузнецов', 'Попова', 'Соколов', 'Лебедева',
  'Новиков', 'Морозова', 'Петров', 'Волкова', 'Соловьёв', 'Васильева',
];
const CITIES = [
  'Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург',
  'Казань', 'Нижний Новгород', 'Самара', 'Ростов-на-Дону',
];

const rand = mulberry32(42);
const pick = <T>(list: T[]) => list[Math.floor(rand() * list.length)];

export const ORDERS: Order[] = Array.from({length: 56}, (_, i) => {
  const status = STATUS_ORDER[i % STATUS_ORDER.length];
  const month = rand() > 0.4 ? 10 : 11;
  const day = 1 + Math.floor(rand() * (month === 10 ? 31 : 5));
  const pad = (n: number) => String(n).padStart(2, '0');

  return {
    id: `order-${i}`,
    number: `ЗК-${10240 + i}`,
    customer: `${pick(LAST_NAMES)} ${pick(FIRST_NAMES)}`,
    city: pick(CITIES),
    createdAt: `${pad(day)}.${pad(month)}.2026`,
    amount: Math.round((1000 + rand() * 149000) / 10) * 10,
    status,
  };
});

/** Groups orders by status, preserving the workflow order of statuses. */
export const groupOrdersByStatus = (orders: Order[]): OrderTableItem[] =>
  STATUS_ORDER.map((status) => ({
    id: `group-${status}`,
    status,
    items: orders.filter((order) => order.status === status),
  })).filter((group) => group.items.length > 0);
