export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customer: string;
  status: OrderStatus;
  itemsCount: number;
  total: number;
  createdAt: string; // ISO date
}

/** Строка-группа: заголовок статуса с вложенными заказами. */
export interface OrderGroup {
  id: string;
  status: OrderStatus;
  items: Order[];
}

export type OrderRow = Order | OrderGroup;

export const STATUS_ORDER: OrderStatus[] = ['new', 'processing', 'shipped', 'delivered', 'cancelled'];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  new: 'Новый',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

export const isGroup = (row: OrderRow): row is OrderGroup => 'items' in row;

export const GROUP_ID_PREFIX = 'group:';

const CUSTOMERS = [
  'Анна Смирнова',
  'Игорь Петров',
  'Мария Кузнецова',
  'Дмитрий Орлов',
  'Елена Волкова',
  'Сергей Лебедев',
  'Ольга Новикова',
  'Алексей Морозов',
  'Наталья Павлова',
  'Павел Соколов',
];

// Детерминированный генератор, чтобы данные не менялись между перезагрузками.
function createRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function createOrders(count = 120): Order[] {
  const rand = createRandom(42);
  const base = Date.UTC(2026, 10, 5);

  return Array.from({length: count}, (_, i) => {
    const status = STATUS_ORDER[Math.floor(rand() ** 1.4 * STATUS_ORDER.length)];
    return {
      id: `A-${String(10240 + i)}`,
      customer: CUSTOMERS[Math.floor(rand() * CUSTOMERS.length)],
      status,
      itemsCount: 1 + Math.floor(rand() * 8),
      total: Math.round((500 + rand() * 49500) * 100) / 100,
      createdAt: new Date(base - Math.floor(rand() * 60) * 86_400_000).toISOString(),
    };
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function groupByStatus(orders: Order[]): OrderGroup[] {
  return STATUS_ORDER.map((status) => ({
    id: `${GROUP_ID_PREFIX}${status}`,
    status,
    items: orders.filter((order) => order.status === status),
  })).filter((group) => group.items.length > 0);
}
