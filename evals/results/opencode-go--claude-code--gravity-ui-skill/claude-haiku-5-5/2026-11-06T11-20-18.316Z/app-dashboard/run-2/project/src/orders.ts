export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  kind: 'order';
  id: string;
  customer: string;
  date: Date;
  itemsCount: number;
  /** Сумма в рублях */
  total: number;
  status: OrderStatus;
}

/** Строка-группа: все заказы одного статуса. Дочерние строки передаются через `getSubRows`. */
export interface OrderGroup {
  kind: 'group';
  id: string;
  status: OrderStatus;
  orders: Order[];
}

export type OrderRow = Order | OrderGroup;

export const ORDER_STATUSES: OrderStatus[] = ['new', 'processing', 'shipped', 'delivered', 'cancelled'];

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

const CUSTOMERS = [
  'Анна Смирнова',
  'Игорь Петров',
  'Мария Кузнецова',
  'Дмитрий Соколов',
  'Елена Попова',
  'Сергей Лебедев',
  'Ольга Новикова',
  'Павел Морозов',
];

// Детерминированные демо-данные (без Math.random), чтобы таблица выглядела одинаково при каждой загрузке.
export const ORDERS: Order[] = Array.from({length: 150}, (_, i) => {
  const n = i + 1;
  return {
    kind: 'order',
    id: `ORD-${1000 + n}`,
    customer: CUSTOMERS[(n * 5) % CUSTOMERS.length],
    date: new Date(2026, 9, 1 + ((n * 3) % 28)),
    itemsCount: 1 + (n % 4),
    total: 990 + ((n * 4789) % 120_000),
    status: ORDER_STATUSES[(n * 2) % ORDER_STATUSES.length],
  };
});

export function groupOrdersByStatus(orders: Order[]): OrderGroup[] {
  return ORDER_STATUSES.map((status): OrderGroup => ({
    kind: 'group',
    id: `group:${status}`,
    status,
    orders: orders.filter((order) => order.status === status),
  })).filter((group) => group.orders.length > 0);
}
