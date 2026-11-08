import type {LabelProps} from '@gravity-ui/uikit';

export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
    id: string;
    number: string;
    customer: string;
    email: string;
    amount: number;
    status: OrderStatus;
    createdAt: string;
    payment: string;
    city: string;
    manager: string;
}

export interface OrderGroup {
    id: string;
    status: OrderStatus;
    items: Order[];
}

export type OrderRow = Order | OrderGroup;

export const GROUP_ID_PREFIX = 'group:';

export const isOrderGroup = (item: OrderRow): item is OrderGroup => 'items' in item;

export const STATUS_ORDER: OrderStatus[] = ['new', 'processing', 'shipped', 'delivered', 'cancelled'];

export const STATUS_META: Record<OrderStatus, {title: string; theme: LabelProps['theme']}> = {
    new: {title: 'Новый', theme: 'info'},
    processing: {title: 'В обработке', theme: 'warning'},
    shipped: {title: 'Отправлен', theme: 'utility'},
    delivered: {title: 'Доставлен', theme: 'success'},
    cancelled: {title: 'Отменён', theme: 'danger'},
};

const FIRST_NAMES = ['Анна', 'Иван', 'Мария', 'Пётр', 'Елена', 'Дмитрий', 'Ольга', 'Сергей', 'Наталья', 'Алексей'];
const LAST_NAMES = ['Смирнов', 'Иванов', 'Кузнецов', 'Попов', 'Соколов', 'Лебедев', 'Козлов', 'Новиков', 'Морозов', 'Волков'];
const CITIES = ['Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург', 'Новосибирск', 'Нижний Новгород', 'Самара'];
const PAYMENTS = ['Карта онлайн', 'СБП', 'Наличные курьеру', 'Счёт для юрлица'];
const MANAGERS = ['Ковалёва Т.', 'Орлов М.', 'Фёдорова Е.', 'Белов А.'];
const TRANSLIT = ['anna', 'ivan', 'maria', 'petr', 'elena', 'dmitry', 'olga', 'sergey', 'natalia', 'alexey'];

/** Deterministic PRNG so the demo data is stable between reloads. */
function createRandom(seed: number) {
    let state = seed;
    return () => {
        state = (state * 1664525 + 1013904223) % 4294967296;
        return state / 4294967296;
    };
}

function pick<T>(random: () => number, list: T[]): T {
    return list[Math.floor(random() * list.length)];
}

function femaleSurname(lastName: string) {
    return `${lastName}а`;
}

export function generateOrders(count: number): Order[] {
    const random = createRandom(42);
    const start = new Date('2026-10-01T09:00:00').getTime();

    return Array.from({length: count}, (_, index) => {
        const nameIndex = Math.floor(random() * FIRST_NAMES.length);
        const firstName = FIRST_NAMES[nameIndex];
        const isFemale = ['Анна', 'Мария', 'Елена', 'Ольга', 'Наталья'].includes(firstName);
        const rawLastName = pick(random, LAST_NAMES);
        const lastName = isFemale ? femaleSurname(rawLastName) : rawLastName;
        const number = 10240 + index;

        return {
            id: `order-${number}`,
            number: `#${number}`,
            customer: `${firstName} ${lastName}`,
            email: `${TRANSLIT[nameIndex]}.${number}@example.com`,
            amount: Math.round((500 + random() * 49500) / 10) * 10,
            status: pick(random, STATUS_ORDER),
            createdAt: new Date(start + index * 5.3 * 60 * 60 * 1000).toISOString(),
            payment: pick(random, PAYMENTS),
            city: pick(random, CITIES),
            manager: pick(random, MANAGERS),
        };
    });
}

export function groupOrdersByStatus(orders: Order[]): OrderGroup[] {
    return STATUS_ORDER.map((status) => ({
        id: `${GROUP_ID_PREFIX}${status}`,
        status,
        items: orders.filter((order) => order.status === status),
    })).filter((group) => group.items.length > 0);
}

const currencyFormatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
});

export const formatCurrency = (value: number) => currencyFormatter.format(value);
export const formatDate = (iso: string) => dateFormatter.format(new Date(iso));

export function pluralizeOrders(count: number) {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) {
        return `${count} заказ`;
    }
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
        return `${count} заказа`;
    }
    return `${count} заказов`;
}
