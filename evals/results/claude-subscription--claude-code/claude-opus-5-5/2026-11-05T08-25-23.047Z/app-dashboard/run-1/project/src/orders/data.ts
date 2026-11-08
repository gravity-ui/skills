import type { LabelProps } from '@gravity-ui/uikit';

export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

export interface Order {
    id: string;
    createdAt: string; // ISO
    customer: string;
    email: string;
    city: string;
    items: number;
    amount: number;
    payment: string;
    manager: string;
    status: OrderStatus;
}

/** Порядок статусов задаёт и порядок групп в таблице. */
export const STATUSES: OrderStatus[] = ['new', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];

export const STATUS_META: Record<OrderStatus, { title: string; theme: LabelProps['theme'] }> = {
    new: { title: 'Новый', theme: 'info' },
    processing: { title: 'В обработке', theme: 'warning' },
    shipped: { title: 'Отправлен', theme: 'utility' },
    delivered: { title: 'Доставлен', theme: 'success' },
    cancelled: { title: 'Отменён', theme: 'danger' },
    returned: { title: 'Возврат', theme: 'normal' },
};

const FIRST_NAMES = ['Анна', 'Иван', 'Мария', 'Алексей', 'Ольга', 'Дмитрий', 'Елена', 'Сергей', 'Наталья', 'Павел', 'Ксения', 'Артём', 'Дарья', 'Михаил', 'Юлия', 'Никита'];
const LAST_NAMES = ['Смирнов', 'Иванов', 'Кузнецов', 'Попов', 'Соколов', 'Лебедев', 'Козлов', 'Новиков', 'Морозов', 'Петров', 'Волков', 'Соловьёв', 'Васильев', 'Зайцев'];
const TRANSLIT: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ы: 'y', ь: '', ъ: '', э: 'e', ю: 'yu', я: 'ya',
};
const CITIES = ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург', 'Нижний Новгород', 'Самара', 'Краснодар', 'Воронеж', 'Пермь'];
const PAYMENTS = ['Карта', 'СБП', 'Наличные', 'Счёт для юрлиц'];
const MANAGERS = ['Г. Орлова', 'В. Тихонов', 'Е. Фролова', 'Р. Белов'];
const STATUS_WEIGHTS: [OrderStatus, number][] = [
    ['new', 14],
    ['processing', 18],
    ['shipped', 16],
    ['delivered', 40],
    ['cancelled', 7],
    ['returned', 5],
];

/** Детерминированный PRNG, чтобы данные не «прыгали» между перезагрузками. */
function mulberry32(seed: number) {
    return () => {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const translit = (s: string) =>
    s
        .toLowerCase()
        .split('')
        .map((ch) => TRANSLIT[ch] ?? ch)
        .join('');

export function generateOrders(count = 240, seed = 42): Order[] {
    const rnd = mulberry32(seed);
    const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)];
    const weightTotal = STATUS_WEIGHTS.reduce((s, [, w]) => s + w, 0);
    const pickStatus = (): OrderStatus => {
        let r = rnd() * weightTotal;
        for (const [status, w] of STATUS_WEIGHTS) {
            if ((r -= w) < 0) return status;
        }
        return 'delivered';
    };

    const now = Date.UTC(2026, 10, 5, 12, 0);
    const orders: Order[] = [];
    for (let i = 0; i < count; i++) {
        const first = pick(FIRST_NAMES);
        const isFemale = /[ая]$/.test(first);
        const lastBase = pick(LAST_NAMES);
        const last = isFemale ? `${lastBase}а` : lastBase;
        const items = 1 + Math.floor(rnd() * 6);
        orders.push({
            id: `ORD-${10240 + count - i}`,
            createdAt: new Date(now - i * 2.7 * 3600_000 - Math.floor(rnd() * 3600_000)).toISOString(),
            customer: `${first} ${last}`,
            email: `${translit(first)}.${translit(last)}@mail.example`,
            city: pick(CITIES),
            items,
            amount: Math.round((items * (800 + rnd() * 6500)) / 10) * 10,
            payment: pick(PAYMENTS),
            manager: pick(MANAGERS),
            status: pickStatus(),
        });
    }
    return orders;
}

const moneyFormat = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
const dateFormat = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const formatMoney = (v: number) => moneyFormat.format(v);
export const formatDate = (iso: string) => dateFormat.format(new Date(iso));

export function pluralRu(n: number, [one, few, many]: [string, string, string]) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
    return many;
}
