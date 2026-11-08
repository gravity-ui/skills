export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  number: string;
  customer: string;
  city: string;
  status: OrderStatus;
  amount: number;
  createdAt: string;
}

export interface OrderGroup {
  id: string;
  status: OrderStatus;
  items: Order[];
}

export type OrderRow = Order | OrderGroup;

export const STATUS_ORDER: OrderStatus[] = ['new', 'processing', 'shipped', 'delivered', 'cancelled'];

const CUSTOMERS = [
  'Анна Смирнова',
  'Иван Петров',
  'Мария Кузнецова',
  'Дмитрий Попов',
  'Елена Соколова',
  'Алексей Лебедев',
  'Ольга Новикова',
  'Сергей Морозов',
  'Наталья Волкова',
  'Павел Фёдоров',
];

const CITIES = ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург', 'Самара'];

// Детерминированная генерация, чтобы данные не менялись между перезагрузками.
export const ORDERS: Order[] = Array.from({length: 60}, (_, i) => {
  const day = 1 + ((i * 7) % 28);
  return {
    id: `order-${i + 1}`,
    number: `#${String(10240 + i)}`,
    customer: CUSTOMERS[(i * 3) % CUSTOMERS.length],
    city: CITIES[(i * 5) % CITIES.length],
    status: STATUS_ORDER[(i * 7 + (i % 3)) % STATUS_ORDER.length],
    amount: 1200 + ((i * 7919) % 48000),
    createdAt: new Date(2026, 9, day).toISOString(),
  };
});

export function groupByStatus(orders: Order[]): OrderGroup[] {
  return STATUS_ORDER.map((status) => ({
    id: `group:${status}`,
    status,
    items: orders.filter((order) => order.status === status),
  })).filter((group) => group.items.length > 0);
}

export const isGroup = (row: OrderRow): row is OrderGroup => 'items' in row;
