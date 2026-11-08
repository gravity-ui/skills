import type {LabelProps} from '@gravity-ui/uikit';

export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
    id: string;
    number: string;
    customer: string;
    city: string;
    createdAt: string;
    items: number;
    total: number;
    payment: 'card' | 'cash' | 'invoice';
    status: OrderStatus;
}

export const STATUS_ORDER: OrderStatus[] = ['new', 'processing', 'shipped', 'delivered', 'cancelled'];

export const STATUS_META: Record<OrderStatus, {title: string; theme: LabelProps['theme']}> = {
    new: {title: 'Новый', theme: 'info'},
    processing: {title: 'В работе', theme: 'warning'},
    shipped: {title: 'Отправлен', theme: 'utility'},
    delivered: {title: 'Доставлен', theme: 'success'},
    cancelled: {title: 'Отменён', theme: 'danger'},
};

export const PAYMENT_TITLE: Record<Order['payment'], string> = {
    card: 'Карта',
    cash: 'Наличные',
    invoice: 'Счёт',
};

const CUSTOMERS = [
    'Анна Смирнова',
    'Иван Петров',
    'ООО «Вектор»',
    'Мария Козлова',
    'Дмитрий Орлов',
    'ИП Белов',
    'Екатерина Волкова',
    'Сергей Новиков',
    'ООО «Север-Логистик»',
    'Ольга Морозова',
    'Алексей Фёдоров',
    'Наталья Лебедева',
];

const CITIES = ['Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург', 'Новосибирск', 'Нижний Новгород'];
const PAYMENTS: Order['payment'][] = ['card', 'cash', 'invoice'];

/** Deterministic pseudo-random generator so the demo data is stable between reloads. */
function createRandom(seed: number) {
    let state = seed;
    return () => {
        state = (state * 1664525 + 1013904223) % 4294967296;
        return state / 4294967296;
    };
}

function generateOrders(count: number): Order[] {
    const random = createRandom(42);
    const pick = <T,>(list: readonly T[]) => list[Math.floor(random() * list.length)];
    const start = new Date('2026-10-01T09:00:00').getTime();

    return Array.from({length: count}, (_, index) => {
        const number = 10240 + index;
        const createdAt = new Date(start + index * 7.3 * 3600 * 1000 + random() * 3600 * 1000);
        const items = 1 + Math.floor(random() * 8);

        return {
            id: `order-${number}`,
            number: `#${number}`,
            customer: pick(CUSTOMERS),
            city: pick(CITIES),
            createdAt: createdAt.toISOString(),
            items,
            total: Math.round((items * (450 + random() * 4800)) / 10) * 10,
            payment: pick(PAYMENTS),
            status: pick(STATUS_ORDER),
        };
    });
}

export const ORDERS: Order[] = generateOrders(120);

export const formatMoney = (value: number) =>
    new Intl.NumberFormat('ru-RU', {style: 'currency', currency: 'RUB', maximumFractionDigits: 0}).format(
        value,
    );

export const formatDate = (iso: string) =>
    new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(iso));
