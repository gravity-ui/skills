import type {LabelProps} from '@gravity-ui/uikit';

export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
    kind: 'order';
    id: string;
    number: string;
    customer: string;
    city: string;
    createdAt: number;
    itemsCount: number;
    amount: number;
    payment: string;
    status: OrderStatus;
    manager: string;
}

export interface OrderGroup {
    kind: 'group';
    id: string;
    status: OrderStatus;
    items: Order[];
    total: number;
}

export type OrderRow = Order | OrderGroup;

export const STATUS_ORDER: OrderStatus[] = ['new', 'processing', 'shipped', 'delivered', 'cancelled'];

export const STATUS_META: Record<OrderStatus, {title: string; theme: LabelProps['theme']}> = {
    new: {title: 'Новый', theme: 'info'},
    processing: {title: 'В обработке', theme: 'warning'},
    shipped: {title: 'Отправлен', theme: 'utility'},
    delivered: {title: 'Доставлен', theme: 'success'},
    cancelled: {title: 'Отменён', theme: 'danger'},
};

const CUSTOMERS = [
    'Анна Смирнова',
    'Иван Петров',
    'Мария Кузнецова',
    'Алексей Попов',
    'Елена Васильева',
    'Дмитрий Соколов',
    'Ольга Михайлова',
    'Сергей Новиков',
    'Наталья Фёдорова',
    'Павел Морозов',
    'Татьяна Волкова',
    'Андрей Лебедев',
    'ООО «Вектор»',
    'ИП Григорьев',
    'ООО «Северный ветер и партнёры»',
];
const CITIES = ['Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург', 'Новосибирск', 'Нижний Новгород', 'Самара'];
const PAYMENTS = ['Карта', 'СБП', 'Наличные', 'Счёт'];
const MANAGERS = ['Кириллова А.', 'Орлов Д.', 'Белова М.', 'Тихонов С.'];

// Deterministic PRNG so the demo data is stable across reloads.
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

export function generateOrders(count: number): Order[] {
    const random = mulberry32(42);
    const pick = <T>(list: T[]) => list[Math.floor(random() * list.length)];
    const now = Date.UTC(2026, 10, 5);
    const dayMs = 24 * 60 * 60 * 1000;

    return Array.from({length: count}, (_, index) => {
        const number = String(100_000 + count - index);
        return {
            kind: 'order',
            id: `order-${number}`,
            number,
            customer: pick(CUSTOMERS),
            city: pick(CITIES),
            createdAt: now - Math.floor(random() * 90 * dayMs),
            itemsCount: 1 + Math.floor(random() * 12),
            amount: Math.round((500 + random() * 120_000) * 100) / 100,
            payment: pick(PAYMENTS),
            status: pick(STATUS_ORDER),
            manager: pick(MANAGERS),
        };
    });
}

export function groupByStatus(orders: Order[]): OrderGroup[] {
    return STATUS_ORDER.map((status) => {
        const items = orders.filter((order) => order.status === status);
        return {
            kind: 'group' as const,
            id: `group-${status}`,
            status,
            items,
            total: items.reduce((sum, order) => sum + order.amount, 0),
        };
    }).filter((group) => group.items.length > 0);
}

export const currencyFormatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
});

export const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
});
