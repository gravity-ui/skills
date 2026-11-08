export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customer: string;
  product: string;
  city: string;
  amount: number;
  status: OrderStatus;
  createdAt: Date;
}

/** Synthetic row that groups orders by status. Lives in the table data, never in the API. */
export interface OrderGroup {
  id: string;
  status: OrderStatus;
  title: string;
  items: Order[];
}

export type TableItem = Order | OrderGroup;

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

/** Order in which status groups appear in the table. */
export const STATUS_ORDER: OrderStatus[] = ['new', 'processing', 'shipped', 'delivered', 'cancelled'];

export function isGroup(item: TableItem): item is OrderGroup {
  return 'items' in item;
}

// Deterministic PRNG so the mock data is identical on every reload.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CUSTOMERS = [
  'Иван Петров',
  'Мария Смирнова',
  'ООО «Ромашка»',
  'Алексей Кузнецов',
  'ИП Соколова',
  'Ольга Новикова',
  'Дмитрий Волков',
  'ООО «Вектор»',
  'Елена Морозова',
  'Сергей Лебедев',
];
const PRODUCTS = [
  'Ноутбук 14"',
  'Монитор 27"',
  'Клавиатура механическая',
  'Мышь беспроводная',
  'Наушники полноразмерные',
  'Веб-камера 4K',
  'Док-станция USB-C',
  'Офисное кресло',
  'Настольная лампа',
  'SSD 1 ТБ',
];
const CITIES = ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург', 'Краснодар'];

function pickStatus(r: number): OrderStatus {
  if (r < 0.2) return 'new';
  if (r < 0.4) return 'processing';
  if (r < 0.6) return 'shipped';
  if (r < 0.9) return 'delivered';
  return 'cancelled';
}

function generateOrders(count: number): Order[] {
  const rand = mulberry32(20261106);
  const now = new Date(2026, 10, 6, 18, 0).getTime();
  const orders: Order[] = [];

  for (let i = 0; i < count; i += 1) {
    const pick = <T,>(list: T[]): T => list[Math.floor(rand() * list.length)];
    const minutesAgo = Math.floor(rand() * 30 * 24 * 60);
    orders.push({
      id: `ORD-${1000 + count - i}`,
      customer: pick(CUSTOMERS),
      product: pick(PRODUCTS),
      city: pick(CITIES),
      amount: Math.round((1500 + rand() * 150000) / 10) * 10,
      status: pickStatus(rand()),
      createdAt: new Date(now - minutesAgo * 60_000),
    });
  }

  return orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export const ORDERS: Order[] = generateOrders(160);

export function groupOrdersByStatus(orders: Order[]): OrderGroup[] {
  return STATUS_ORDER.map((status) => ({
    id: `status:${status}`,
    status,
    title: STATUS_META[status].title,
    items: orders.filter((order) => order.status === status),
  })).filter((group) => group.items.length > 0);
}
