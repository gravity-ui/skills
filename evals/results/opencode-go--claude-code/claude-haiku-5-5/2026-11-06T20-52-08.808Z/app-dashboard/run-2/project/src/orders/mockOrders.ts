import { ORDER_STATUSES, type Order, type OrderStatus } from './types';

const FIRST_NAMES = ['Анна', 'Максим', 'Елена', 'Дмитрий', 'Ольга', 'Иван', 'Мария', 'Сергей', 'Наталья', 'Артём'];
const LAST_NAMES = ['Волкова', 'Соколов', 'Новикова', 'Фёдоров', 'Кузнецова', 'Морозов', 'Лебедева', 'Попов'];
const CITIES = ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург', 'Самара', 'Краснодар'];
const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l',
  м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh',
  щ: 'shch', ы: 'y', э: 'e', ю: 'yu', я: 'ya', ь: '', ъ: '',
};

function toEmailPart(value: string): string {
  return value
    .toLowerCase()
    .split('')
    .map((ch) => TRANSLIT[ch] ?? ch)
    .join('');
}

/** Small deterministic PRNG (mulberry32) so the mock table is identical on every reload. */
function createRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Weighted so that most orders are delivered or in progress, and few are cancelled.
const STATUS_WEIGHTS: Array<[OrderStatus, number]> = [
  ['new', 14],
  ['processing', 18],
  ['shipped', 16],
  ['delivered', 44],
  ['cancelled', 8],
];

function pickStatus(random: () => number): OrderStatus {
  const total = STATUS_WEIGHTS.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = random() * total;
  for (const [status, weight] of STATUS_WEIGHTS) {
    roll -= weight;
    if (roll < 0) return status;
  }
  return ORDER_STATUSES[0];
}

export function generateOrders(count = 600, seed = 20261106): Order[] {
  const random = createRandom(seed);
  const pick = <T,>(items: readonly T[]): T => items[Math.floor(random() * items.length)];
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  return Array.from({ length: count }, (_, index) => {
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const itemsCount = 1 + Math.floor(random() * 6);
    const total = Math.round((itemsCount * (700 + random() * 9300)) / 10) * 10;

    return {
      id: String(100000 + count - index),
      customer: `${firstName} ${lastName}`,
      email: `${toEmailPart(firstName)}.${toEmailPart(lastName)}@example.com`,
      city: pick(CITIES),
      createdAt: new Date(now - Math.floor(random() * 60) * DAY - Math.floor(random() * DAY)),
      status: pickStatus(random),
      itemsCount,
      total,
    };
  });
}
