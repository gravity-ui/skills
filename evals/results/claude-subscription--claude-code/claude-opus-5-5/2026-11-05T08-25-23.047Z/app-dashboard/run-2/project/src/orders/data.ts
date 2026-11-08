import type { LabelProps } from '@gravity-ui/uikit';

export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

/** Порядок групп при группировке — по жизненному циклу заказа. */
export const STATUS_ORDER: readonly OrderStatus[] = [
    'new',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'returned',
];

export const STATUS_META: Record<OrderStatus, { label: string; theme: LabelProps['theme'] }> = {
    new: { label: 'Новый', theme: 'info' },
    processing: { label: 'В обработке', theme: 'warning' },
    shipped: { label: 'Отправлен', theme: 'utility' },
    delivered: { label: 'Доставлен', theme: 'success' },
    cancelled: { label: 'Отменён', theme: 'danger' },
    returned: { label: 'Возврат', theme: 'unknown' },
};

export interface Order {
    id: string;
    number: number;
    customer: string;
    email: string;
    /** ISO-строка */
    createdAt: string;
    status: OrderStatus;
    items: number;
    /** Сумма в рублях */
    total: number;
    payment: string;
    city: string;
    manager: string;
}

const FIRST_NAMES = ['Анна', 'Иван', 'Мария', 'Дмитрий', 'Елена', 'Сергей', 'Ольга', 'Алексей', 'Наталья', 'Павел', 'Татьяна', 'Михаил', 'Юлия', 'Артём', 'Ксения', 'Никита'];
const LAST_NAMES = ['Смирнов', 'Иванов', 'Кузнецов', 'Попов', 'Соколов', 'Лебедев', 'Козлов', 'Новиков', 'Морозов', 'Петров', 'Волков', 'Соловьёв', 'Васильев', 'Зайцев'];
const TRANSLIT: Record<string, string> = {
    Анна: 'anna', Иван: 'ivan', Мария: 'maria', Дмитрий: 'dmitry', Елена: 'elena', Сергей: 'sergey',
    Ольга: 'olga', Алексей: 'alexey', Наталья: 'natalia', Павел: 'pavel', Татьяна: 'tatiana',
    Михаил: 'mikhail', Юлия: 'yulia', Артём: 'artem', Ксения: 'ksenia', Никита: 'nikita',
    Смирнов: 'smirnov', Иванов: 'ivanov', Кузнецов: 'kuznetsov', Попов: 'popov', Соколов: 'sokolov',
    Лебедев: 'lebedev', Козлов: 'kozlov', Новиков: 'novikov', Морозов: 'morozov', Петров: 'petrov',
    Волков: 'volkov', Соловьёв: 'solovyov', Васильев: 'vasiliev', Зайцев: 'zaitsev',
};
const FEMALE = new Set(['Анна', 'Мария', 'Елена', 'Ольга', 'Наталья', 'Татьяна', 'Юлия', 'Ксения']);
const CITIES = ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург', 'Нижний Новгород', 'Самара', 'Краснодар', 'Пермь', 'Воронеж'];
const PAYMENTS = ['Карта онлайн', 'СБП', 'Наличные курьеру', 'Счёт для юрлица'];
const MANAGERS = ['Г. Орлова', 'В. Белов', 'Е. Фролова', 'К. Медведев', 'Л. Егорова'];
const DOMAINS = ['mail.ru', 'yandex.ru', 'gmail.com', 'company.ru'];
// Веса статусов: в реальной базе доставленных больше всего, возвратов — меньше всего.
const STATUS_WEIGHTS: [OrderStatus, number][] = [
    ['new', 14],
    ['processing', 18],
    ['shipped', 16],
    ['delivered', 38],
    ['cancelled', 9],
    ['returned', 5],
];

/** Детерминированный PRNG, чтобы данные не «прыгали» между перезагрузками. */
function mulberry32(seed: number) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function generateOrders(count: number, seed = 42, now = new Date('2026-11-05T12:00:00Z')): Order[] {
    const rnd = mulberry32(seed);
    const pick = <T,>(list: readonly T[]) => list[Math.floor(rnd() * list.length)];
    const weightTotal = STATUS_WEIGHTS.reduce((s, [, w]) => s + w, 0);
    const pickStatus = (): OrderStatus => {
        let r = rnd() * weightTotal;
        for (const [status, w] of STATUS_WEIGHTS) {
            r -= w;
            if (r < 0) return status;
        }
        return 'delivered';
    };

    const orders: Order[] = [];
    let time = now.getTime();
    for (let i = 0; i < count; i++) {
        // Заказы идут от новых к старым с интервалом от 5 минут до ~6 часов.
        time -= Math.floor(5 * 60_000 + rnd() * 6 * 3_600_000);
        const first = pick(FIRST_NAMES);
        const lastBase = pick(LAST_NAMES);
        const last = FEMALE.has(first) ? `${lastBase}а` : lastBase;
        const items = 1 + Math.floor(rnd() * rnd() * 12);
        const number = 48_000 + count - i;
        orders.push({
            id: `ord-${number}`,
            number,
            customer: `${first} ${last}`,
            email: `${TRANSLIT[first]}.${TRANSLIT[lastBase]}${Math.floor(rnd() * 90 + 10)}@${pick(DOMAINS)}`,
            createdAt: new Date(time).toISOString(),
            status: pickStatus(),
            items,
            total: Math.round((items * (400 + rnd() * 6_000)) / 10) * 10,
            payment: pick(PAYMENTS),
            city: pick(CITIES),
            manager: pick(MANAGERS),
        });
    }
    return orders;
}
