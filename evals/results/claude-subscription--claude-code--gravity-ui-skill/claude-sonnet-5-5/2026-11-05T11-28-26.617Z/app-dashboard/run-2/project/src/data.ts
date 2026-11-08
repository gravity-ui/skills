export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  number: string;
  customer: string;
  status: OrderStatus;
  amount: number;
  items: number;
  createdAt: string;
}

export interface OrderGroup {
  id: string;
  status: OrderStatus;
  rows: Order[];
}

export type OrderRow = Order | OrderGroup;

export const STATUS_ORDER: OrderStatus[] = ['new', 'processing', 'shipped', 'delivered', 'cancelled'];

export const STATUS_TITLE: Record<OrderStatus, string> = {
  new: 'Новый',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

const CUSTOMERS = [
  'Анна Смирнова',
  'Игорь Петров',
  'Мария Кузнецова',
  'Дмитрий Орлов',
  'Елена Волкова',
  'Сергей Новиков',
  'Ольга Морозова',
  'Алексей Лебедев',
  'Наталья Егорова',
  'Павел Соколов',
];

// Deterministic pseudo-random so the demo data is stable between reloads.
function createRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function createOrders(count: number): Order[] {
  const random = createRandom(42);
  const base = Date.UTC(2026, 10, 1);

  return Array.from({length: count}, (_, index) => {
    const number = 10240 + index;
    return {
      id: `order-${number}`,
      number: `#${number}`,
      customer: CUSTOMERS[Math.floor(random() * CUSTOMERS.length)],
      status: STATUS_ORDER[Math.floor(random() * STATUS_ORDER.length)],
      amount: Math.round((500 + random() * 49500) * 100) / 100,
      items: 1 + Math.floor(random() * 8),
      createdAt: new Date(base - Math.floor(random() * 30 * 24 * 3600 * 1000)).toISOString(),
    };
  });
}

export const ORDERS: Order[] = createOrders(60);

export function groupByStatus(orders: Order[]): OrderGroup[] {
  return STATUS_ORDER.map((status) => ({
    id: `group:${status}`,
    status,
    rows: orders.filter((order) => order.status === status),
  })).filter((group) => group.rows.length > 0);
}

export function isGroup(row: OrderRow): row is OrderGroup {
  return 'rows' in row;
}
