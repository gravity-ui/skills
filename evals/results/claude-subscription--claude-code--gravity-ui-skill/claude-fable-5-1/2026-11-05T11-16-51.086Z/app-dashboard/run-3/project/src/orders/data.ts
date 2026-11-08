export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  number: string;
  customer: string;
  status: OrderStatus;
  total: number;
  itemsCount: number;
  city: string;
  createdAt: string;
}

export interface OrderGroup {
  id: string;
  status: OrderStatus;
  items: Order[];
}

export type OrderRow = Order | OrderGroup;

export const isOrderGroup = (row: OrderRow): row is OrderGroup => 'items' in row;

export const STATUS_ORDER: OrderStatus[] = ['new', 'processing', 'shipped', 'delivered', 'cancelled'];

export const STATUS_TITLES: Record<OrderStatus, string> = {
  new: 'Новый',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

const CUSTOMERS = [
  'Иванов Пётр',
  'Смирнова Анна',
  'Кузнецов Олег',
  'Попова Мария',
  'Васильев Игорь',
  'Соколова Елена',
  'Михайлов Денис',
  'Новикова Ольга',
  'Фёдоров Андрей',
  'Морозова Ксения',
  'Волков Сергей',
  'Алексеева Дарья',
];

const CITIES = ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург', 'Сочи'];

// Deterministic pseudo-random generator so the demo data is stable between renders.
function createRng(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

export function generateOrders(count: number): Order[] {
  const rng = createRng(42);
  const pick = <T,>(list: T[]) => list[Math.floor(rng() * list.length)];
  const start = new Date('2026-10-01T09:00:00Z').getTime();

  return Array.from({length: count}, (_, index) => {
    const number = 10240 + index;
    const createdAt = new Date(start + Math.floor(rng() * 35 * 24 * 60 * 60 * 1000));
    return {
      id: `order-${number}`,
      number: `#${number}`,
      customer: pick(CUSTOMERS),
      status: pick(STATUS_ORDER),
      total: Math.round((500 + rng() * 49500) / 10) * 10,
      itemsCount: 1 + Math.floor(rng() * 9),
      city: pick(CITIES),
      createdAt: createdAt.toISOString(),
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

export const currencyFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

export const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});
