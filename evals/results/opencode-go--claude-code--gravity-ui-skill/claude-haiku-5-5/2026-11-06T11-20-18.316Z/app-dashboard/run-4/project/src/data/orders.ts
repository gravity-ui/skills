export type OrderStatus = 'new' | 'processing' | 'shipping' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customer: string;
  amount: number;
  status: OrderStatus;
  /** ISO date (UTC midnight) */
  createdAt: string;
}

export const ORDER_STATUS_META: Record<
  OrderStatus,
  { title: string; theme: 'info' | 'warning' | 'utility' | 'success' | 'danger' }
> = {
  new: { title: 'Новый', theme: 'info' },
  processing: { title: 'В работе', theme: 'warning' },
  shipping: { title: 'Доставляется', theme: 'utility' },
  delivered: { title: 'Выполнен', theme: 'success' },
  cancelled: { title: 'Отменён', theme: 'danger' },
};

/** Order in which status groups are shown. */
export const ORDER_STATUSES = Object.keys(ORDER_STATUS_META) as OrderStatus[];

const CUSTOMERS = [
  'Анна Смирнова',
  'Игорь Петров',
  'Мария Волкова',
  'Дмитрий Орлов',
  'Елена Соколова',
  'Сергей Новиков',
  'Ольга Морозова',
  'Алексей Федоров',
];

/** Deterministic mock data, so the table looks the same on every reload. */
export const ORDERS: Order[] = Array.from({ length: 60 }, (_, i) => ({
  id: `ORD-${1040 + i}`,
  customer: CUSTOMERS[(i * 7) % CUSTOMERS.length],
  amount: 1500 + ((i * 2749) % 90) * 350,
  status: ORDER_STATUSES[(i * 3) % ORDER_STATUSES.length],
  createdAt: new Date(Date.UTC(2026, 9, 10 + (i % 27))).toISOString(),
}));

const rubles = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

const dateFormat = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

export const formatAmount = (amount: number) => rubles.format(amount);

export const formatDate = (isoDate: string) => dateFormat.format(new Date(isoDate));
