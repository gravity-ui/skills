import type {LabelProps} from '@gravity-ui/uikit';

export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
    id: string;
    number: string;
    customer: string;
    city: string;
    createdAt: Date;
    itemsCount: number;
    amount: number;
    payment: string;
    status: OrderStatus;
}

export interface OrderGroup {
    id: string;
    kind: 'group';
    status: OrderStatus;
    items: Order[];
}

export type OrderRow = Order | OrderGroup;

export const isOrderGroup = (item: OrderRow): item is OrderGroup =>
    'kind' in item && item.kind === 'group';

export const STATUS_META: Record<OrderStatus, {title: string; theme: LabelProps['theme']}> = {
    new: {title: 'Новый', theme: 'info'},
    processing: {title: 'В обработке', theme: 'warning'},
    shipped: {title: 'Отправлен', theme: 'utility'},
    delivered: {title: 'Доставлен', theme: 'success'},
    cancelled: {title: 'Отменён', theme: 'danger'},
};

export const STATUS_ORDER: OrderStatus[] = ['new', 'processing', 'shipped', 'delivered', 'cancelled'];

const CUSTOMERS = [
    'Анна Смирнова',
    'Иван Петров',
    'Мария Кузнецова',
    'Алексей Попов',
    'Екатерина Волкова',
    'Дмитрий Соколов',
    'Ольга Морозова',
    'Сергей Лебедев',
    'Наталья Новикова',
    'Павел Фёдоров',
    'Татьяна Егорова',
    'Николай Козлов',
];
const CITIES = ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург', 'Самара', 'Пермь'];
const PAYMENTS = ['Карта', 'СБП', 'Наличные', 'Счёт для юрлица'];
const STATUS_WEIGHTS: Array<[OrderStatus, number]> = [
    ['new', 0.15],
    ['processing', 0.2],
    ['shipped', 0.2],
    ['delivered', 0.35],
    ['cancelled', 0.1],
];

/** Детерминированный ГПСЧ (mulberry32), чтобы данные не менялись между перезагрузками. */
function createRandom(seed: number) {
    let state = seed;
    return () => {
        state = (state + 0x6d2b79f5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function pickStatus(value: number): OrderStatus {
    let acc = 0;
    for (const [status, weight] of STATUS_WEIGHTS) {
        acc += weight;
        if (value < acc) {
            return status;
        }
    }
    return 'delivered';
}

export function generateOrders(count: number): Order[] {
    const random = createRandom(42);
    const pick = <T>(list: T[]) => list[Math.floor(random() * list.length)];
    const now = new Date(2026, 10, 5).getTime();
    const day = 24 * 60 * 60 * 1000;

    return Array.from({length: count}, (_, index) => {
        const number = 100_000 + index + 1;
        return {
            id: `order-${number}`,
            number: `#${number}`,
            customer: pick(CUSTOMERS),
            city: pick(CITIES),
            createdAt: new Date(now - Math.floor(random() * 90 * day)),
            itemsCount: 1 + Math.floor(random() * 8),
            amount: Math.round(500 + random() * 60_000),
            payment: pick(PAYMENTS),
            status: pickStatus(random()),
        };
    });
}

export function groupOrdersByStatus(orders: Order[]): OrderGroup[] {
    return STATUS_ORDER.map((status) => ({
        id: `group:${status}`,
        kind: 'group' as const,
        status,
        items: orders.filter((order) => order.status === status),
    })).filter((group) => group.items.length > 0);
}

export const isGroupRowId = (id: string) => id.startsWith('group:');

const moneyFormatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
});
const dateFormatter = new Intl.DateTimeFormat('ru-RU', {day: '2-digit', month: '2-digit', year: 'numeric'});

export const formatMoney = (value: number) => moneyFormatter.format(value);
export const formatDate = (value: Date) => dateFormatter.format(value);
