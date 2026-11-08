import { STATUS_ORDER, type Order } from './types';

const CUSTOMERS = [
  'Анна Соколова', 'Дмитрий Орлов', 'Мария Лебедева', 'Иван Кузнецов', 'Елена Волкова',
  'Сергей Новиков', 'Ольга Морозова', 'Алексей Павлов', 'Наталья Семёнова', 'Павел Егоров',
  'Татьяна Козлова', 'Андрей Степанов', 'Юлия Николаева', 'Максим Фёдоров', 'Ксения Михайлова',
  'Артём Захаров', 'Виктория Белова', 'Роман Тарасов', 'Дарья Комарова', 'Николай Киселёв',
];
const CITIES = ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург', 'Нижний Новгород', 'Самара', 'Краснодар'];
const PAYMENTS = ['Банковская карта', 'СБП', 'Наличные при получении', 'Рассрочка'];
/** Weighted status distribution: new orders are the most common. */
const STATUS_WEIGHTS = [5, 4, 3, 6, 2];

/** Small seeded PRNG (mulberry32) so the demo data is stable between reloads. */
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickWeighted<T>(items: T[], weights: number[], rnd: number): T {
  const sum = weights.reduce((a, b) => a + b, 0);
  let acc = rnd * sum;
  for (let i = 0; i < items.length; i++) {
    acc -= weights[i];
    if (acc < 0) return items[i];
  }
  return items[items.length - 1];
}

export function generateOrders(count = 48, seed = 2026): Order[] {
  const rand = mulberry32(seed);
  const base = Date.UTC(2026, 10, 5, 12); // 5 Nov 2026, fixed so dates are deterministic
  const dayMs = 24 * 60 * 60 * 1000;
  const orders: Order[] = [];
  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(rand() * 30);
    const minutes = Math.floor(rand() * 24 * 60);
    const itemsCount = 1 + Math.floor(rand() * 8);
    const avgPrice = 500 + Math.floor(rand() * 9000);
    orders.push({
      id: `ORD-${10240 + count - i}`,
      customer: CUSTOMERS[Math.floor(rand() * CUSTOMERS.length)],
      city: CITIES[Math.floor(rand() * CITIES.length)],
      createdAt: new Date(base - daysAgo * dayMs - minutes * 60 * 1000).toISOString(),
      itemsCount,
      total: Math.round((itemsCount * avgPrice) / 10) * 10,
      payment: PAYMENTS[Math.floor(rand() * PAYMENTS.length)],
      status: pickWeighted(STATUS_ORDER, STATUS_WEIGHTS, rand()),
    });
  }
  return orders.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
