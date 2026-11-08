export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
    id: string;
    number: number;
    createdAt: Date;
    customer: string;
    city: string;
    items: number;
    amount: number;
    payment: 'card' | 'cash' | 'invoice';
    status: OrderStatus;
    manager: string;
}

type LabelTheme = 'normal' | 'info' | 'danger' | 'warning' | 'success' | 'utility' | 'unknown';

/** Порядок статусов = порядок групп в таблице (по жизненному циклу заказа). */
export const STATUSES: {id: OrderStatus; title: string; theme: LabelTheme}[] = [
    {id: 'new', title: 'Новый', theme: 'info'},
    {id: 'processing', title: 'В обработке', theme: 'warning'},
    {id: 'shipped', title: 'Отправлен', theme: 'utility'},
    {id: 'delivered', title: 'Доставлен', theme: 'success'},
    {id: 'cancelled', title: 'Отменён', theme: 'danger'},
];

export const STATUS_BY_ID = Object.fromEntries(STATUSES.map((s) => [s.id, s])) as Record<
    OrderStatus,
    (typeof STATUSES)[number]
>;

export const PAYMENT_TITLES: Record<Order['payment'], string> = {
    card: 'Карта',
    cash: 'Наличные',
    invoice: 'Счёт',
};

const FIRST_NAMES = ['Анна', 'Иван', 'Мария', 'Дмитрий', 'Елена', 'Сергей', 'Ольга', 'Алексей', 'Наталья', 'Павел', 'Ксения', 'Артём'];
const LAST_NAMES = ['Иванов', 'Смирнов', 'Кузнецов', 'Попов', 'Соколов', 'Лебедев', 'Козлов', 'Новиков', 'Морозов', 'Волков', 'Фёдоров', 'Орлов'];
const CITIES = ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург', 'Нижний Новгород', 'Самара', 'Краснодар', 'Пермь', 'Воронеж'];
const MANAGERS = ['Белова Е.', 'Громов А.', 'Зайцева Т.', 'Ким Р.', 'Тихонов В.'];
const PAYMENTS: Order['payment'][] = ['card', 'card', 'card', 'cash', 'invoice'];
const STATUS_WEIGHTS: [OrderStatus, number][] = [
    ['new', 18],
    ['processing', 22],
    ['shipped', 20],
    ['delivered', 32],
    ['cancelled', 8],
];

/** Детерминированный ГПСЧ, чтобы данные не менялись между перезагрузками. */
function mulberry32(seed: number) {
    return () => {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function lastNameFor(lastName: string, female: boolean) {
    return female ? `${lastName}а` : lastName;
}

export function generateOrders(count: number, seed = 42): Order[] {
    const rnd = mulberry32(seed);
    const pick = <T,>(list: T[]) => list[Math.floor(rnd() * list.length)];
    const totalWeight = STATUS_WEIGHTS.reduce((sum, [, w]) => sum + w, 0);
    const pickStatus = () => {
        let r = rnd() * totalWeight;
        for (const [status, w] of STATUS_WEIGHTS) {
            r -= w;
            if (r < 0) return status;
        }
        return STATUS_WEIGHTS[0][0];
    };

    const now = new Date(2026, 10, 5, 18, 0).getTime();
    const orders: Order[] = [];
    for (let i = 0; i < count; i++) {
        const firstNameIndex = Math.floor(rnd() * FIRST_NAMES.length);
        const female = firstNameIndex % 2 === 0;
        const items = 1 + Math.floor(rnd() * 8);
        const number = 104_000 + count - i;
        orders.push({
            id: String(number),
            number,
            // Каждый следующий заказ — в среднем на 3 часа раньше предыдущего.
            createdAt: new Date(now - i * 3 * 3600_000 - Math.floor(rnd() * 3 * 3600_000)),
            customer: `${lastNameFor(pick(LAST_NAMES), female)} ${FIRST_NAMES[firstNameIndex]}`,
            city: pick(CITIES),
            items,
            amount: Math.round((items * (400 + rnd() * 6000)) / 10) * 10,
            payment: pick(PAYMENTS),
            status: pickStatus(),
            manager: pick(MANAGERS),
        });
    }
    return orders;
}

export const formatMoney = (value: number) =>
    new Intl.NumberFormat('ru-RU', {style: 'currency', currency: 'RUB', maximumFractionDigits: 0}).format(value);

export const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
