export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customer: string;
  status: OrderStatus;
  date: string; // ISO
  items: number;
  total: number;
  city: string;
}

export const STATUS_ORDER: OrderStatus[] = ['new', 'processing', 'shipped', 'delivered', 'cancelled'];

export const STATUS_META: Record<OrderStatus, { title: string; theme: 'info' | 'warning' | 'utility' | 'success' | 'danger' }> = {
  new: { title: 'Новый', theme: 'info' },
  processing: { title: 'В обработке', theme: 'warning' },
  shipped: { title: 'Отправлен', theme: 'utility' },
  delivered: { title: 'Доставлен', theme: 'success' },
  cancelled: { title: 'Отменён', theme: 'danger' },
};

// Детерминированная генерация, чтобы данные не менялись между перезагрузками.
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const CUSTOMERS = [
  'Анна Смирнова', 'Иван Петров', 'Мария Кузнецова', 'Дмитрий Попов', 'Елена Соколова',
  'Алексей Лебедев', 'Ольга Новикова', 'Сергей Морозов', 'Наталья Волкова', 'Павел Зайцев',
  'Татьяна Орлова', 'Андрей Беляев', 'Юлия Фёдорова', 'Максим Ильин', 'Виктория Гусева',
];
const CITIES = ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург', 'Самара', 'Сочи'];

const next = rng(42);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(next() * arr.length)];

export const ORDERS: Order[] = Array.from({ length: 60 }, (_, i) => {
  const day = new Date(Date.UTC(2026, 10, 5) - Math.floor(next() * 45 * 24 * 3600 * 1000));
  return {
    id: String(10250 - i),
    customer: pick(CUSTOMERS),
    status: pick(STATUS_ORDER),
    date: day.toISOString(),
    items: 1 + Math.floor(next() * 8),
    total: Math.round((500 + next() * 49500) / 10) * 10,
    city: pick(CITIES),
  };
}).sort((a, b) => b.date.localeCompare(a.date));
