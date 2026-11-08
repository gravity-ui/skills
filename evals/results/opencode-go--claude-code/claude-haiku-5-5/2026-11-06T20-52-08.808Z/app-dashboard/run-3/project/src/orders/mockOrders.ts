import { ORDER_STATUSES, type Order, type OrderStatus } from './model';

const FIRST_NAMES = ['Анна', 'Игорь', 'Мария', 'Дмитрий', 'Елена', 'Алексей', 'Ольга', 'Сергей', 'Наталья', 'Павел', 'Ирина', 'Кирилл'];
const LAST_NAMES = ['Соколова', 'Петров', 'Кузнецова', 'Волков', 'Морозова', 'Лебедев', 'Смирнова', 'Попов', 'Новикова', 'Фомин'];
const CITIES = ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург', 'Нижний Новгород', 'Самара', 'Краснодар'];

// Доли статусов в тестовых данных; в сумме дают 1.
const STATUS_WEIGHTS: Record<OrderStatus, number> = {
  new: 0.15,
  processing: 0.25,
  shipped: 0.2,
  delivered: 0.3,
  cancelled: 0.1,
};

const DAY_MS = 24 * 60 * 60 * 1000;
const BASE_TIME = Date.UTC(2026, 10, 6);

/** Детерминированный генератор (mulberry32): одни и те же данные при каждом запуске. */
function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Тестовые заказы. В боевом приложении их заменит запрос к API. */
export function generateOrders(count: number, seed = 20261106): Order[] {
  const random = createRandom(seed);
  const pick = <T>(items: readonly T[]): T => items[Math.floor(random() * items.length)];

  const pickStatus = (): OrderStatus => {
    let roll = random();
    for (const status of ORDER_STATUSES) {
      roll -= STATUS_WEIGHTS[status];
      if (roll < 0) return status;
    }
    return ORDER_STATUSES[ORDER_STATUSES.length - 1];
  };

  const drafts = Array.from({ length: count }, () => ({
    customer: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    city: pick(CITIES),
    itemsCount: 1 + Math.floor(random() * 6),
    amount: Math.round((1500 + random() * 48000) / 10) * 10,
    createdAt: new Date(BASE_TIME - Math.floor(random() * 45) * DAY_MS),
    status: pickStatus(),
  }));

  // Сначала самые свежие; номер растёт вместе с датой.
  drafts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return drafts.map((draft, index) => ({ id: String(1000 + count - index), ...draft }));
}

export const ORDERS: Order[] = generateOrders(150);
