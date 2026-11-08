export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: number;
  customer: string;
  city: string;
  date: string; // ISO date
  items: number;
  amount: number; // RUB
  status: OrderStatus;
}

export const STATUS_ORDER: OrderStatus[] = [
  'new',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

export const STATUS_META: Record<OrderStatus, {title: string; theme: 'info' | 'warning' | 'utility' | 'success' | 'danger'}> = {
  new: {title: 'Новый', theme: 'info'},
  processing: {title: 'В обработке', theme: 'warning'},
  shipped: {title: 'Отправлен', theme: 'utility'},
  delivered: {title: 'Доставлен', theme: 'success'},
  cancelled: {title: 'Отменён', theme: 'danger'},
};

const CUSTOMERS = [
  'Иван Петров',
  'Мария Сидорова',
  'Алексей Смирнов',
  'Елена Кузнецова',
  'Дмитрий Волков',
  'Ольга Морозова',
  'Сергей Новиков',
  'Анна Федорова',
  'Николай Егоров',
  'Татьяна Павлова',
  'Павел Соколов',
  'Наталья Орлова',
  'Андрей Захаров',
  'Светлана Белова',
  'Михаил Тарасов',
  'Юлия Комарова',
  'Владимир Баранов',
  'Ирина Киселёва',
  'Олег Макаров',
  'Галина Андреева',
];

const CITIES = [
  'Москва',
  'Санкт-Петербург',
  'Новосибирск',
  'Екатеринбург',
  'Казань',
  'Нижний Новгород',
  'Самара',
  'Ростов-на-Дону',
  'Краснодар',
  'Воронеж',
];

// Deterministic PRNG so the dataset is stable between renders/reloads.
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

function generateOrders(): Order[] {
  const rand = mulberry32(20261106);
  const orders: Order[] = [];
  const dayMs = 24 * 60 * 60 * 1000;
  const base = new Date('2026-10-01T12:00:00').getTime();

  for (let i = 0; i < 72; i += 1) {
    const status = STATUS_ORDER[Math.floor(rand() * STATUS_ORDER.length)];
    orders.push({
      id: 10240 + i,
      customer: CUSTOMERS[Math.floor(rand() * CUSTOMERS.length)],
      city: CITIES[Math.floor(rand() * CITIES.length)],
      date: new Date(base + Math.floor(rand() * 36) * dayMs).toISOString(),
      items: 1 + Math.floor(rand() * 8),
      amount: Math.round((900 + rand() * 58000) / 10) * 10,
      status,
    });
  }
  return orders;
}

export const ORDERS: Order[] = generateOrders();

const rubFmt = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

export function formatRub(value: number): string {
  return rubFmt.format(value);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
