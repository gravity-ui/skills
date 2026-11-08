export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'card' | 'cash' | 'invoice';

export interface Order {
  id: string;
  number: string;
  customer: string;
  email: string;
  status: OrderStatus;
  itemsCount: number;
  total: number;
  payment: PaymentMethod;
  city: string;
  createdAt: string; // ISO date
}

export interface OrderGroup {
  id: string;
  status: OrderStatus;
  items: Order[];
}

export type OrdersRow = Order | OrderGroup;

export const isOrderGroup = (row: OrdersRow): row is OrderGroup => 'items' in row;

export const STATUS_ORDER: OrderStatus[] = ['new', 'processing', 'shipped', 'delivered', 'cancelled'];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Новый',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  card: 'Карта',
  cash: 'Наличные',
  invoice: 'Счёт',
};

const FIRST_NAMES = ['Анна', 'Иван', 'Мария', 'Дмитрий', 'Елена', 'Сергей', 'Ольга', 'Алексей', 'Наталья', 'Павел'];
const LAST_NAMES = ['Иванова', 'Петров', 'Смирнова', 'Кузнецов', 'Попова', 'Соколов', 'Лебедева', 'Козлов', 'Новикова', 'Морозов'];
const CITIES = ['Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург', 'Новосибирск', 'Нижний Новгород', 'Самара', 'Краснодар'];
const PAYMENTS: PaymentMethod[] = ['card', 'card', 'card', 'cash', 'invoice'];

// Deterministic pseudo-random generator so the demo data is stable between reloads.
function createRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

export function generateOrders(count = 120): Order[] {
  const random = createRandom(42);
  const pick = <T,>(list: T[]): T => list[Math.floor(random() * list.length)];
  const start = new Date('2026-09-01T00:00:00Z').getTime();
  const span = new Date('2026-11-05T00:00:00Z').getTime() - start;

  return Array.from({ length: count }, (_, index) => {
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const itemsCount = 1 + Math.floor(random() * 7);
    const number = 10240 + index;

    return {
      id: `order-${number}`,
      number: `#${number}`,
      customer: `${firstName} ${lastName}`,
      email: `${translit(firstName)}.${translit(lastName)}@example.com`.toLowerCase(),
      status: pick(STATUS_ORDER),
      itemsCount,
      total: Math.round((itemsCount * (900 + random() * 6500)) / 10) * 10,
      payment: pick(PAYMENTS),
      city: pick(CITIES),
      createdAt: new Date(start + random() * span).toISOString(),
    };
  });
}

export function groupOrdersByStatus(orders: Order[]): OrderGroup[] {
  return STATUS_ORDER.map((status) => ({
    id: `group-${status}`,
    status,
    items: orders.filter((order) => order.status === status),
  })).filter((group) => group.items.length > 0);
}

const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l',
  м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch',
  ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

function translit(value: string): string {
  return value
    .toLowerCase()
    .split('')
    .map((char) => TRANSLIT[char] ?? char)
    .join('');
}
