export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  number: string;
  customer: string;
  city: string;
  status: OrderStatus;
  amount: number;
  itemsCount: number;
  createdAt: string;
}

export interface OrderGroup {
  id: string;
  status: OrderStatus;
  items: Order[];
}

export type OrdersRow = Order | OrderGroup;

export const STATUS_ORDER: OrderStatus[] = ['new', 'processing', 'shipped', 'delivered', 'cancelled'];

export const STATUS_TITLE: Record<OrderStatus, string> = {
  new: 'Новый',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

const CUSTOMERS = [
  'Иванов Алексей', 'Петрова Мария', 'Сидоров Дмитрий', 'Кузнецова Анна', 'Смирнов Павел',
  'Волкова Ольга', 'Морозов Игорь', 'Новикова Елена', 'Фёдоров Сергей', 'Лебедева Ирина',
  'Егоров Николай', 'Козлова Светлана', 'Орлов Андрей', 'Соколова Татьяна', 'Попов Виктор',
];
const CITIES = ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург', 'Нижний Новгород'];

// Deterministic pseudo-random generator so the demo data is stable between reloads.
function createRng(seed: number) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

export function generateOrders(count = 60): Order[] {
  const rnd = createRng(42);
  const pick = <T,>(list: T[]) => list[Math.floor(rnd() * list.length)];
  const base = new Date('2026-11-05T09:00:00Z').getTime();

  return Array.from({length: count}, (_, i) => {
    const itemsCount = 1 + Math.floor(rnd() * 8);
    return {
      id: `order-${1000 + i}`,
      number: `#${1000 + i}`,
      customer: pick(CUSTOMERS),
      city: pick(CITIES),
      status: pick(STATUS_ORDER),
      amount: Math.round((500 + rnd() * 50000) * itemsCount) / 10,
      itemsCount,
      createdAt: new Date(base - Math.floor(rnd() * 30 * 24 * 60) * 60 * 1000).toISOString(),
    };
  });
}

export function groupOrdersByStatus(orders: Order[]): OrderGroup[] {
  return STATUS_ORDER.map((status) => ({
    id: `group-${status}`,
    status,
    items: orders.filter((order) => order.status === status),
  })).filter((group) => group.items.length > 0);
}

export function isOrderGroup(row: OrdersRow): row is OrderGroup {
  return 'items' in row;
}
