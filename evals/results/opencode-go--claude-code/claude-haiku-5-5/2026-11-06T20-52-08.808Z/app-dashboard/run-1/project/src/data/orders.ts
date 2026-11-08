export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'card' | 'sbp' | 'cod' | 'invoice';

export interface Order {
  id: string;
  customer: string;
  createdAt: Date;
  status: OrderStatus;
  items: number;
  payment: PaymentMethod;
  /** Сумма заказа, ₽ */
  total: number;
}

/** Порядок статусов определяет порядок групп в таблице. */
export const ORDER_STATUSES: OrderStatus[] = ['new', 'processing', 'shipped', 'delivered', 'cancelled'];

export const STATUS_META: Record<
  OrderStatus,
  { label: string; theme: 'info' | 'warning' | 'utility' | 'success' | 'danger' }
> = {
  new: { label: 'Новый', theme: 'info' },
  processing: { label: 'В обработке', theme: 'warning' },
  shipped: { label: 'Отправлен', theme: 'utility' },
  delivered: { label: 'Доставлен', theme: 'success' },
  cancelled: { label: 'Отменён', theme: 'danger' },
};

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  card: 'Карта',
  sbp: 'СБП',
  cod: 'При получении',
  invoice: 'Счёт',
};

/** Фиксированная «текущая» дата для моков: данные детерминированы между перезагрузками. */
export const REFERENCE_NOW = new Date(2026, 10, 6, 12, 0, 0);

const DAY_MS = 24 * 60 * 60 * 1000;
const HISTORY_DAYS = 60;

const CUSTOMERS = [
  'Анна Соколова',
  'Игорь Петров',
  'Мария Волкова',
  'Дмитрий Кузнецов',
  'Елена Морозова',
  'Артём Новиков',
  'Ольга Смирнова',
  'Сергей Федоров',
  'Наталья Попова',
  'Павел Лебедев',
  'Юлия Козлова',
  'Михаил Соловьёв',
  'Екатерина Васильева',
  'Алексей Зайцев',
  'Татьяна Павлова',
  'Роман Семёнов',
  'Ирина Голубева',
  'Денис Орлов',
  'Светлана Макарова',
  'Кирилл Андреев',
  'Вероника Егорова',
  'Никита Фомин',
  'Людмила Белова',
  'Григорий Тихонов',
];

/** Детерминированный PRNG (mulberry32), чтобы моки не менялись между запусками. */
function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function weightedPick<T>(rand: () => number, entries: ReadonlyArray<readonly [T, number]>): T {
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let r = rand() * total;
  for (const [value, weight] of entries) {
    r -= weight;
    if (r < 0) return value;
  }
  return entries[entries.length - 1][0];
}

/** Свежие заказы чаще «в работе», старые — почти всегда доставлены. */
function statusForAge(ageDays: number, rand: () => number): OrderStatus {
  if (ageDays < 3) {
    return weightedPick<OrderStatus>(rand, [
      ['new', 0.4],
      ['processing', 0.3],
      ['shipped', 0.2],
      ['cancelled', 0.1],
    ]);
  }
  if (ageDays < 10) {
    return weightedPick<OrderStatus>(rand, [
      ['new', 0.05],
      ['processing', 0.1],
      ['shipped', 0.15],
      ['delivered', 0.6],
      ['cancelled', 0.1],
    ]);
  }
  return weightedPick<OrderStatus>(rand, [
    ['shipped', 0.03],
    ['delivered', 0.87],
    ['cancelled', 0.1],
  ]);
}

/** Генерирует историю заказов за последние 60 дней, отсортированных от новых к старым. */
export function generateOrders(count = 240, seed = 20261106): Order[] {
  const rand = mulberry32(seed);
  const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];

  const drafts = Array.from({ length: count }, () => {
    const ageDays = rand() * HISTORY_DAYS;
    const items = 1 + Math.floor(rand() * 5);
    const pricePerItem = 290 + rand() * 7700;
    return {
      customer: pick(CUSTOMERS),
      createdAt: new Date(REFERENCE_NOW.getTime() - ageDays * DAY_MS),
      status: statusForAge(ageDays, rand),
      items,
      payment: pick<PaymentMethod>(['card', 'sbp', 'cod', 'invoice']),
      total: Math.round((items * pricePerItem) / 10) * 10,
    };
  });

  drafts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return drafts.map((draft, index) => ({
    id: String(10000 + (count - index)),
    ...draft,
  }));
}
