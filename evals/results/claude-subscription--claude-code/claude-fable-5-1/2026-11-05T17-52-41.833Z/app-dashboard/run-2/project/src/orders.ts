export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customer: string;
  email: string;
  city: string;
  createdAt: string; // ISO date
  status: OrderStatus;
  items: number;
  total: number; // RUB
  payment: 'card' | 'sbp' | 'cash' | 'invoice';
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
  sbp: 'СБП',
  cash: 'Наличные',
  invoice: 'Счёт',
};

const FIRST_NAMES = [
  'Анна', 'Иван', 'Мария', 'Дмитрий', 'Елена', 'Сергей', 'Ольга', 'Алексей',
  'Наталья', 'Павел', 'Ксения', 'Михаил', 'Татьяна', 'Андрей', 'Юлия', 'Никита',
];
const LAST_NAMES = [
  'Иванова', 'Петров', 'Смирнова', 'Кузнецов', 'Попова', 'Волков', 'Соколова', 'Лебедев',
  'Козлова', 'Новиков', 'Морозова', 'Фёдоров', 'Орлова', 'Макаров', 'Зайцева', 'Егоров',
];
const CITIES = [
  'Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург', 'Новосибирск',
  'Нижний Новгород', 'Краснодар', 'Самара', 'Пермь', 'Воронеж',
];
const PAYMENTS: Order['payment'][] = ['card', 'card', 'sbp', 'sbp', 'cash', 'invoice'];
const STATUS_WEIGHTS: OrderStatus[] = [
  'new', 'new', 'new', 'processing', 'processing', 'processing', 'processing',
  'shipped', 'shipped', 'shipped', 'delivered', 'delivered', 'delivered', 'delivered',
  'delivered', 'cancelled', 'cancelled',
];

/** Deterministic PRNG so the demo data is stable between reloads. */
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
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y',
    к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
    х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  };
  return s
    .toLowerCase()
    .split('')
    .map((ch) => map[ch] ?? ch)
    .join('');
}

export function generateOrders(count = 72, seed = 42): Order[] {
  const rnd = mulberry32(seed);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)];
  const base = new Date('2026-11-05T12:00:00Z').getTime();
  const orders: Order[] = [];
  for (let i = 0; i < count; i++) {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    const items = 1 + Math.floor(rnd() * 7);
    const total = Math.round((items * (900 + rnd() * 9000)) / 10) * 10;
    const daysAgo = Math.floor(rnd() * 30);
    const createdAt = new Date(base - daysAgo * 86_400_000 - Math.floor(rnd() * 86_400_000));
    orders.push({
      id: `ORD-${String(10240 + i).padStart(5, '0')}`,
      customer: `${first} ${last}`,
      email: `${translit(first)}.${translit(last)}@example.com`,
      city: pick(CITIES),
      createdAt: createdAt.toISOString(),
      status: pick(STATUS_WEIGHTS),
      items,
      total,
      payment: pick(PAYMENTS),
    });
  }
  return orders.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export const formatMoney = (value: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(value);

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(
    new Date(iso),
  );

export function pluralize(n: number, forms: [string, string, string]) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}
