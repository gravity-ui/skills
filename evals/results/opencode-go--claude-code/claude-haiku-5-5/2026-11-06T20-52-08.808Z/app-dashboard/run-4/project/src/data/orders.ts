export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customer: string;
  city: string;
  items: number;
  /** Сумма заказа в рублях. */
  amount: number;
  status: OrderStatus;
  createdAt: Date;
}

type StatusTheme = 'info' | 'warning' | 'utility' | 'success' | 'danger';

/** Порядок групп в таблице. */
export const STATUS_ORDER: readonly OrderStatus[] = [
  'new',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

export const STATUS_META: Record<OrderStatus, { label: string; theme: StatusTheme }> = {
  new: { label: 'Новый', theme: 'info' },
  processing: { label: 'В обработке', theme: 'warning' },
  shipped: { label: 'Отправлен', theme: 'utility' },
  delivered: { label: 'Доставлен', theme: 'success' },
  cancelled: { label: 'Отменён', theme: 'danger' },
};

const CUSTOMERS = [
  'Анна Смирнова',
  'Игорь Петров',
  'Мария Кузнецова',
  'Сергей Соколов',
  'Ольга Фёдорова',
  'Дмитрий Волков',
  'Елена Морозова',
  'Андрей Зайцев',
  'Наталья Павлова',
  'Михаил Орлов',
];

const CITIES = [
  'Москва',
  'Санкт-Петербург',
  'Казань',
  'Новосибирск',
  'Екатеринбург',
  'Нижний Новгород',
];

const STATUS_WEIGHTS: Array<[OrderStatus, number]> = [
  ['new', 2],
  ['processing', 3],
  ['shipped', 2],
  ['delivered', 5],
  ['cancelled', 1],
];

const DAY_MS = 24 * 60 * 60 * 1000;

/** Детерминированный генератор псевдослучайных чисел (mulberry32), чтобы моки не менялись между перезагрузками. */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createMockOrders(count = 120, seed = 20261106): Order[] {
  const rnd = mulberry32(seed);
  const pick = <T>(list: readonly T[]): T => list[Math.floor(rnd() * list.length)];
  const totalWeight = STATUS_WEIGHTS.reduce((sum, [, weight]) => sum + weight, 0);
  const pickStatus = (): OrderStatus => {
    let roll = rnd() * totalWeight;
    for (const [status, weight] of STATUS_WEIGHTS) {
      roll -= weight;
      if (roll < 0) return status;
    }
    return 'new';
  };

  const today = Date.UTC(2026, 10, 6, 12);
  const generated = Array.from({ length: count }, () => ({
    customer: pick(CUSTOMERS),
    city: pick(CITIES),
    items: 1 + Math.floor(rnd() * 6),
    amount: Math.round((1500 + rnd() * 48000) / 10) * 10,
    status: pickStatus(),
    createdAt: new Date(today - Math.floor(rnd() * 60 * DAY_MS)),
  }));

  // Сначала сортируем по дате, и только потом нумеруем: номер растёт вместе с датой.
  generated.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return generated.map((order, index) => ({
    id: `#${1000 + count - index}`,
    ...order,
  }));
}

const rubFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});
const compactFormatter = new Intl.NumberFormat('ru-RU', {
  notation: 'compact',
  maximumFractionDigits: 1,
});
const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

export const formatRub = (value: number): string => rubFormatter.format(value);
export const formatCompact = (value: number): string => compactFormatter.format(value);
export const formatDate = (date: Date): string => dateFormatter.format(date);

/** «1 заказ», «2 заказа», «5 заказов». */
export function pluralizeOrders(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  let word = 'заказов';
  if (mod10 === 1 && mod100 !== 11) word = 'заказ';
  else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) word = 'заказа';
  return `${count} ${word}`;
}
