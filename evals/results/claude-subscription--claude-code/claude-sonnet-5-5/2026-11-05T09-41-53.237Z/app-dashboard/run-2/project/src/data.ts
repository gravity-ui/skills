export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customer: string;
  status: OrderStatus;
  total: number;
  createdAt: string; // ISO
  city: string;
  payment: string;
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
  'Анна Смирнова', 'Иван Петров', 'Мария Кузнецова', 'Дмитрий Попов', 'Елена Соколова',
  'Алексей Лебедев', 'Ольга Новикова', 'Сергей Морозов', 'Татьяна Волкова', 'Павел Зайцев',
  'Наталья Белова', 'Михаил Орлов', 'Юлия Макарова', 'Андрей Фёдоров', 'Екатерина Никитина',
];
const CITIES = ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург', 'Самара', 'Сочи'];
const PAYMENTS = ['Карта', 'СБП', 'Наличные', 'Рассрочка'];

// Детерминированный генератор, чтобы данные не менялись между перезагрузками.
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
  const rnd = mulberry32(42);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)];
  const base = Date.UTC(2026, 10, 4, 18, 0, 0);
  return Array.from({length: count}, (_, i) => {
    const r = rnd();
    const status: OrderStatus =
      r < 0.15 ? 'new' : r < 0.35 ? 'processing' : r < 0.55 ? 'shipped' : r < 0.9 ? 'delivered' : 'cancelled';
    return {
      id: `#${10500 - i}`,
      customer: pick(CUSTOMERS),
      status,
      total: Math.round((500 + rnd() * 49500) / 10) * 10,
      createdAt: new Date(base - i * 3.1 * 3600_000 - Math.floor(rnd() * 3600_000)).toISOString(),
      city: pick(CITIES),
      payment: pick(PAYMENTS),
    };
  });
}

export const ORDERS: Order[] = generateOrders(64);
