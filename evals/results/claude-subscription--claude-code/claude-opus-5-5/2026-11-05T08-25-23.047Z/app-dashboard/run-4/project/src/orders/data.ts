import type { LabelProps } from '@gravity-ui/uikit';

export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customer: string;
  email: string;
  createdAt: string; // ISO
  status: OrderStatus;
  items: number;
  total: number; // RUB
  payment: string;
  city: string;
}

/** Order of status groups in the table (follows the order lifecycle). */
export const STATUS_ORDER: OrderStatus[] = ['new', 'processing', 'shipped', 'delivered', 'cancelled'];

export const STATUS_META: Record<OrderStatus, { title: string; theme: LabelProps['theme'] }> = {
  new: { title: 'Новый', theme: 'info' },
  processing: { title: 'В обработке', theme: 'warning' },
  shipped: { title: 'Отправлен', theme: 'utility' },
  delivered: { title: 'Доставлен', theme: 'success' },
  cancelled: { title: 'Отменён', theme: 'danger' },
};

const FIRST_NAMES = ['Анна', 'Иван', 'Мария', 'Дмитрий', 'Елена', 'Сергей', 'Ольга', 'Алексей', 'Наталья', 'Павел', 'Ксения', 'Артём'];
const LAST_NAMES = ['Смирнов', 'Иванов', 'Кузнецов', 'Попов', 'Соколов', 'Лебедев', 'Козлов', 'Новиков', 'Морозов', 'Волков'];
const CITIES = ['Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург', 'Новосибирск', 'Нижний Новгород', 'Самара', 'Краснодар'];
const PAYMENTS = ['Карта онлайн', 'СБП', 'При получении', 'Счёт для юрлица'];
const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm',
  н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh',
  щ: 'sch', ы: 'y', ь: '', ъ: '', э: 'e', ю: 'yu', я: 'ya', ё: 'e',
};

const translit = (s: string) =>
  s
    .toLowerCase()
    .split('')
    .map((ch) => TRANSLIT[ch] ?? ch)
    .join('');

/** Small deterministic PRNG so the demo data is stable between reloads. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateOrders(count: number): Order[] {
  const rand = mulberry32(42);
  const pick = <T,>(list: T[]) => list[Math.floor(rand() * list.length)];
  const now = Date.UTC(2026, 10, 5, 12, 0);

  return Array.from({ length: count }, (_, i) => {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    // Feminine surname for female first names ending in "а"/"я".
    const surname = /[ая]$/.test(first) ? `${last}а` : last;
    const items = 1 + Math.floor(rand() * 8);
    const ageHours = i * 9 + Math.floor(rand() * 9);
    // Older orders are more likely to be finished.
    const r = rand();
    const status: OrderStatus =
      r < 0.08 ? 'cancelled'
      : ageHours < 96 ? (r < 0.6 ? 'new' : 'processing')
      : ageHours < 200 ? (r < 0.5 ? 'processing' : 'shipped')
      : r < 0.3 ? 'shipped' : 'delivered';

    return {
      id: String(10480 - i),
      customer: `${first} ${surname}`,
      email: `${translit(first)}.${translit(surname)}@example.ru`,
      createdAt: new Date(now - ageHours * 3600_000).toISOString(),
      status,
      items,
      total: Math.round((items * (500 + rand() * 6000)) / 10) * 10,
      payment: pick(PAYMENTS),
      city: pick(CITIES),
    };
  });
}

export const ORDERS: Order[] = generateOrders(96);

export const formatMoney = (value: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(value);

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export const formatDate = (iso: string) => dateFormatter.format(new Date(iso));
