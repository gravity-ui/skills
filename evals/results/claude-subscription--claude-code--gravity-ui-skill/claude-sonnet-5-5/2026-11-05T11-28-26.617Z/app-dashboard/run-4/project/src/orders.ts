export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  kind: 'order';
  id: string;
  number: string;
  customer: string;
  city: string;
  status: OrderStatus;
  items: number;
  amount: number;
  createdAt: string;
}

export interface OrderGroup {
  kind: 'group';
  id: string;
  status: OrderStatus;
  rows: Order[];
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
  'Игорь Петров',
  'Мария Кузнецова',
  'Дмитрий Орлов',
  'Елена Волкова',
  'Сергей Белов',
  'Ольга Морозова',
  'Артём Новиков',
  'Наталья Фёдорова',
  'Павел Соколов',
];
const CITIES = ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург', 'Самара'];

// Детерминированный генератор, чтобы данные не менялись между перезагрузками.
function createRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

export function createOrders(count = 80): Order[] {
  const random = createRandom(42);
  const pick = <T,>(list: T[]) => list[Math.floor(random() * list.length)];

  return Array.from({length: count}, (_, index) => {
    const day = 1 + Math.floor(random() * 28);
    const month = 9 + Math.floor(random() * 2);
    return {
      kind: 'order',
      id: `order-${index + 1}`,
      number: `#${String(10000 + index + 1)}`,
      customer: pick(CUSTOMERS),
      city: pick(CITIES),
      status: pick(STATUS_ORDER),
      items: 1 + Math.floor(random() * 6),
      amount: Math.round((500 + random() * 49500) * 100) / 100,
      createdAt: `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    };
  });
}

export function groupByStatus(orders: Order[]): OrderGroup[] {
  return STATUS_ORDER.map((status) => ({
    kind: 'group' as const,
    id: `group-${status}`,
    status,
    rows: orders.filter((order) => order.status === status),
  })).filter((group) => group.rows.length > 0);
}
