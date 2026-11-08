export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
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

export const STATUS_TITLE: Record<OrderStatus, string> = {
  new: 'Новые',
  processing: 'В обработке',
  shipped: 'Отправлены',
  delivered: 'Доставлены',
  cancelled: 'Отменены',
};

export const STATUS_LABEL: Record<OrderStatus, string> = {
  new: 'Новый',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

const CUSTOMERS = [
  'Анна Смирнова',
  'Иван Петров',
  'Мария Кузнецова',
  'Дмитрий Орлов',
  'Елена Волкова',
  'Сергей Попов',
  'Ольга Лебедева',
  'Алексей Соколов',
  'Наталья Морозова',
  'Павел Новиков',
];
const CITIES = ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург', 'Самара'];

// Детерминированная генерация, чтобы данные не менялись между перезагрузками.
export const ORDERS: Order[] = Array.from({length: 60}, (_, i) => {
  const n = i + 1;
  const day = ((n * 7) % 28) + 1;
  return {
    id: `ORD-${1000 + n}`,
    customer: CUSTOMERS[(n * 3) % CUSTOMERS.length],
    city: CITIES[(n * 5) % CITIES.length],
    status: STATUS_ORDER[(n * 2 + Math.floor(n / 4)) % STATUS_ORDER.length],
    amount: 1200 + ((n * 7919) % 48000),
    createdAt: `2026-10-${String(day).padStart(2, '0')}`,
  };
});

export function groupByStatus(orders: Order[]): OrderGroup[] {
  return STATUS_ORDER.map((status) => ({
    id: `group:${status}`,
    status,
    items: orders.filter((o) => o.status === status),
  })).filter((g) => g.items.length > 0);
}

export function isGroup(row: OrderRow): row is OrderGroup {
  return 'items' in row;
}
