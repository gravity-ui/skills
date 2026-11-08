export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
    id: string;
    number: string;
    customer: string;
    city: string;
    createdAt: string;
    itemsCount: number;
    total: number;
    status: OrderStatus;
}

export interface OrderStatusGroup {
    id: string;
    status: OrderStatus;
    items: Order[];
}

export type OrderTableItem = Order | OrderStatusGroup;

export const isStatusGroup = (item: OrderTableItem): item is OrderStatusGroup =>
    'items' in item;

export const ORDER_STATUS_LIST: OrderStatus[] = [
    'new',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
];

export const ORDER_STATUS_META: Record<
    OrderStatus,
    {label: string; theme: 'info' | 'warning' | 'utility' | 'success' | 'danger'}
> = {
    new: {label: 'Новый', theme: 'info'},
    processing: {label: 'В обработке', theme: 'warning'},
    shipped: {label: 'Отправлен', theme: 'utility'},
    delivered: {label: 'Доставлен', theme: 'success'},
    cancelled: {label: 'Отменён', theme: 'danger'},
};

const FIRST_NAMES = [
    'Иван',
    'Пётр',
    'Анна',
    'Мария',
    'Сергей',
    'Ольга',
    'Дмитрий',
    'Елена',
    'Алексей',
    'Наталья',
    'Андрей',
    'Татьяна',
    'Максим',
    'Ирина',
    'Николай',
];

const LAST_NAMES = [
    'Иванов',
    'Петрова',
    'Сидоров',
    'Кузнецова',
    'Смирнов',
    'Попова',
    'Васильев',
    'Соколова',
    'Михайлов',
    'Новикова',
    'Фёдоров',
    'Морозова',
    'Волков',
    'Алексеева',
    'Лебедев',
];

const CITIES = [
    'Москва',
    'Санкт-Петербург',
    'Казань',
    'Новосибирск',
    'Екатеринбург',
    'Нижний Новгород',
    'Самара',
    'Ростов-на-Дону',
    'Воронеж',
    'Краснодар',
];

let seed = 42;
const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
};
const pick = <T>(list: T[]): T => list[Math.floor(rand() * list.length)];
const pickInt = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));

const STATUS_WEIGHTS: OrderStatus[] = [
    'new',
    'new',
    'new',
    'processing',
    'processing',
    'processing',
    'shipped',
    'shipped',
    'delivered',
    'delivered',
    'delivered',
    'delivered',
    'cancelled',
];

const DAY_MS = 24 * 60 * 60 * 1000;
const BASE_TIME = Date.UTC(2026, 10, 6, 12, 0, 0); // 2026-11-06

const generateOrders = (count: number): Order[] => {
    const orders: Order[] = [];
    for (let i = 0; i < count; i += 1) {
        const created = new Date(BASE_TIME - pickInt(0, 89) * DAY_MS - pickInt(0, 86399) * 1000);
        orders.push({
            id: `ord-${i + 1}`,
            number: String(100240 + i),
            customer: `${pick(LAST_NAMES)} ${pick(FIRST_NAMES)}`,
            city: pick(CITIES),
            createdAt: created.toISOString(),
            itemsCount: pickInt(1, 9),
            total: pickInt(10, 1200) * 100,
            status: pick(STATUS_WEIGHTS),
        });
    }
    return orders;
};

export const groupOrdersByStatus = (orders: Order[]): OrderStatusGroup[] =>
    ORDER_STATUS_LIST.map((status) => ({
        id: `group-${status}`,
        status,
        items: orders.filter((order) => order.status === status),
    })).filter((group) => group.items.length > 0);

export const ORDERS: Order[] = generateOrders(132);

export const GROUPED_ORDERS: OrderStatusGroup[] = groupOrdersByStatus(ORDERS);

const currencyFormatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
});

export const formatTotal = (value: number) => currencyFormatter.format(value);

export const formatDate = (iso: string) => dateFormatter.format(new Date(iso));
