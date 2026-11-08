export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customer: string;
  date: string; // ISO
  items: number;
  amount: number;
  payment: 'Карта' | 'СБП' | 'Наличные' | 'Счёт';
  status: OrderStatus;
}

export const STATUS_ORDER: OrderStatus[] = ['new', 'processing', 'shipped', 'delivered', 'cancelled'];

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
  'ООО «Вектор»',
  'Мария Козлова',
  'Дмитрий Орлов',
  'ИП Захаров',
  'Елена Новикова',
  'Сергей Волков',
  'ООО «Северный путь»',
  'Ольга Морозова',
  'Артём Лебедев',
  'Наталья Егорова',
];
const PAYMENTS: Order['payment'][] = ['Карта', 'СБП', 'Наличные', 'Счёт'];

// Deterministic pseudo-random generator so the demo data is stable between reloads.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeOrders(count: number): Order[] {
  const rnd = mulberry32(42);
  const pick = <T,>(list: T[]) => list[Math.floor(rnd() * list.length)];
  const base = Date.UTC(2026, 10, 4, 12);
  return Array.from({length: count}, (_, i) => {
    const r = rnd();
    const status: OrderStatus =
      r < 0.16 ? 'new' : r < 0.36 ? 'processing' : r < 0.55 ? 'shipped' : r < 0.9 ? 'delivered' : 'cancelled';
    return {
      id: `#${10482 - i}`,
      customer: pick(CUSTOMERS),
      date: new Date(base - i * 3.1 * 3600_000 - Math.floor(rnd() * 3600_000)).toISOString(),
      items: 1 + Math.floor(rnd() * 8),
      amount: Math.round((900 + rnd() * 48000) / 10) * 10,
      payment: pick(PAYMENTS),
      status,
    };
  });
}

export const ORDERS: Order[] = makeOrders(64);
