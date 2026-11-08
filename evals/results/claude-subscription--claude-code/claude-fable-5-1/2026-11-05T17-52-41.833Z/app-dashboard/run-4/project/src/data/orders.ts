export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  number: string;
  customer: string;
  email: string;
  status: OrderStatus;
  items: number;
  total: number;
  payment: 'card' | 'cash' | 'invoice';
  city: string;
  createdAt: string; // ISO
}

export const STATUS_ORDER: OrderStatus[] = ['new', 'processing', 'shipped', 'delivered', 'cancelled'];

export const STATUS_META: Record<
  OrderStatus,
  { title: string; theme: 'info' | 'warning' | 'utility' | 'success' | 'danger' }
> = {
  new: { title: 'Новый', theme: 'info' },
  processing: { title: 'В обработке', theme: 'warning' },
  shipped: { title: 'Отправлен', theme: 'utility' },
  delivered: { title: 'Доставлен', theme: 'success' },
  cancelled: { title: 'Отменён', theme: 'danger' },
};

export const PAYMENT_TITLE: Record<Order['payment'], string> = {
  card: 'Карта',
  cash: 'Наличные',
  invoice: 'Счёт',
};

const FIRST = ['Анна', 'Иван', 'Мария', 'Пётр', 'Елена', 'Дмитрий', 'Ольга', 'Сергей', 'Наталья', 'Алексей', 'Татьяна', 'Михаил'];
const LAST = ['Иванова', 'Петров', 'Смирнова', 'Кузнецов', 'Попова', 'Соколов', 'Лебедева', 'Козлов', 'Новикова', 'Морозов', 'Волкова', 'Фёдоров'];
const CITIES = ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург', 'Нижний Новгород', 'Краснодар', 'Самара'];
const PAYMENTS: Order['payment'][] = ['card', 'card', 'card', 'cash', 'invoice'];
const STATUS_WEIGHTS: OrderStatus[] = [
  'new', 'new', 'new',
  'processing', 'processing', 'processing', 'processing',
  'shipped', 'shipped', 'shipped',
  'delivered', 'delivered', 'delivered', 'delivered', 'delivered',
  'cancelled',
];

// Deterministic pseudo-random generator so the demo data is stable between reloads.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function translit(s: string) {
  const map: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l',
    м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch',
    ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  };
  return s
    .toLowerCase()
    .split('')
    .map((c) => map[c] ?? c)
    .join('');
}

export function generateOrders(count = 60, seed = 42): Order[] {
  const rnd = mulberry32(seed);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)];
  const base = new Date('2026-11-05T12:00:00Z').getTime();

  return Array.from({ length: count }, (_, i) => {
    const first = pick(FIRST);
    const last = pick(LAST);
    const items = 1 + Math.floor(rnd() * 7);
    const total = Math.round((items * (400 + rnd() * 6000)) / 10) * 10;
    const createdAt = new Date(base - Math.floor(rnd() * 30 * 24 * 3600 * 1000)).toISOString();
    const number = String(10240 + count - i);
    return {
      id: `ord-${number}`,
      number: `#${number}`,
      customer: `${first} ${last}`,
      email: `${translit(first)}.${translit(last)}@example.com`,
      status: pick(STATUS_WEIGHTS),
      items,
      total,
      payment: pick(PAYMENTS),
      city: pick(CITIES),
      createdAt,
    };
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export const formatMoney = (value: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(value);

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(
    new Date(iso),
  );
