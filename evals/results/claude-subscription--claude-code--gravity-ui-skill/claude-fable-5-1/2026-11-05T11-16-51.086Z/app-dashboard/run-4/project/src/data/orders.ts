export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  number: string;
  customer: string;
  city: string;
  status: OrderStatus;
  items: number;
  total: number;
  createdAt: string;
}

export interface OrderGroup {
  id: string;
  status: OrderStatus;
  orders: Order[];
}

export type OrdersRow = Order | OrderGroup;

export const STATUS_ORDER: OrderStatus[] = ['new', 'processing', 'shipped', 'delivered', 'cancelled'];

export const STATUS_TITLES: Record<OrderStatus, string> = {
  new: 'Новый',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

export function isOrderGroup(row: OrdersRow): row is OrderGroup {
  return 'orders' in row;
}

const CUSTOMERS = [
  'Иван Петров',
  'Мария Смирнова',
  'Алексей Козлов',
  'Елена Волкова',
  'Дмитрий Соколов',
  'Анна Морозова',
  'Сергей Новиков',
  'Ольга Фёдорова',
  'Павел Лебедев',
  'Наталья Егорова',
  'Андрей Орлов',
  'Татьяна Кузнецова',
];

const CITIES = ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург', 'Нижний Новгород'];

// Deterministic pseudo-random generator so the mock data is stable between renders and reloads.
function createRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

export function generateOrders(count = 120): Order[] {
  const random = createRandom(42);
  const start = Date.UTC(2026, 9, 1);

  return Array.from({length: count}, (_, index) => {
    const items = 1 + Math.floor(random() * 8);
    const total = Math.round((400 + random() * 24000) * items) / 100;
    const createdAt = new Date(start + Math.floor(random() * 35) * 86400000 + Math.floor(random() * 86400000));

    return {
      id: `order-${index + 1}`,
      number: `ORD-${String(10000 + index + 1)}`,
      customer: CUSTOMERS[Math.floor(random() * CUSTOMERS.length)],
      city: CITIES[Math.floor(random() * CITIES.length)],
      status: STATUS_ORDER[Math.floor(random() * STATUS_ORDER.length)],
      items,
      total,
      createdAt: createdAt.toISOString(),
    };
  });
}

export function groupOrdersByStatus(orders: Order[]): OrderGroup[] {
  return STATUS_ORDER.map((status) => ({
    id: `group-${status}`,
    status,
    orders: orders.filter((order) => order.status === status),
  })).filter((group) => group.orders.length > 0);
}
