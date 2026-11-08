export type OrderStatus = 'new' | 'in_progress' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customer: string;
  amount: number;
  createdAt: string;
  status: OrderStatus;
}

/** Строка-группа: все заказы одного статуса. */
export interface StatusGroup {
  id: string;
  status: OrderStatus;
  items: Order[];
}

export type OrderTableRow = Order | StatusGroup;

export const STATUS_META: Record<
  OrderStatus,
  {title: string; theme: 'info' | 'warning' | 'success' | 'normal' | 'danger'}
> = {
  new: {title: 'Новый', theme: 'info'},
  in_progress: {title: 'В работе', theme: 'warning'},
  shipped: {title: 'Отправлен', theme: 'normal'},
  delivered: {title: 'Доставлен', theme: 'success'},
  cancelled: {title: 'Отменён', theme: 'danger'},
};

export const STATUS_ORDER: OrderStatus[] = [
  'new',
  'in_progress',
  'shipped',
  'delivered',
  'cancelled',
];

const CUSTOMERS = [
  'Анна Смирнова',
  'Игорь Петров',
  'Мария Козлова',
  'Дмитрий Соколов',
  'Елена Новикова',
  'Павел Морозов',
  'Ольга Волкова',
  'Сергей Лебедев',
];

// Детерминированный генератор: таблица одинаковая при каждой загрузке.
function createOrders(count: number): Order[] {
  const orders: Order[] = [];
  for (let i = 0; i < count; i++) {
    const seed = (i + 1) * 9301 + 49297;
    const day = (i * 7) % 28 + 1;
    const month = (i % 6) + 1;
    orders.push({
      id: `ORD-${1001 + i}`,
      customer: CUSTOMERS[seed % CUSTOMERS.length],
      amount: 1200 + ((seed * 37) % 98000),
      createdAt: `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      status: STATUS_ORDER[seed % STATUS_ORDER.length],
    });
  }
  return orders;
}

export const ORDERS: Order[] = createOrders(60);
