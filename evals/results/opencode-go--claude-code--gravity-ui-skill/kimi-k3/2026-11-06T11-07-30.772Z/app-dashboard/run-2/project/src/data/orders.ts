import type {LabelProps} from '@gravity-ui/uikit';

export type OrderStatus = 'new' | 'processing' | 'shipping' | 'delivered' | 'cancelled';

export interface Order {
    id: string;
    number: string;
    customer: string;
    date: string;
    positions: number;
    amount: number;
    address: string;
    status: OrderStatus;
}

export interface OrderGroup {
    id: string;
    status: OrderStatus;
    orders: Order[];
}

export type OrderTableItem = OrderGroup | Order;

export const isOrderGroup = (item: OrderTableItem): item is OrderGroup => 'orders' in item;

export const ORDER_STATUSES: OrderStatus[] = [
    'new',
    'processing',
    'shipping',
    'delivered',
    'cancelled',
];

export const ORDER_STATUS_META: Record<
    OrderStatus,
    {title: string; groupTitle: string; theme: NonNullable<LabelProps['theme']>}
> = {
    new: {title: 'Новый', groupTitle: 'Новые', theme: 'info'},
    processing: {title: 'В обработке', groupTitle: 'В обработке', theme: 'warning'},
    shipping: {title: 'Доставляется', groupTitle: 'В доставке', theme: 'utility'},
    delivered: {title: 'Доставлен', groupTitle: 'Доставленные', theme: 'success'},
    cancelled: {title: 'Отменён', groupTitle: 'Отменённые', theme: 'danger'},
};

const CUSTOMERS = [
    'Иван Петров',
    'Мария Сидорова',
    'Алексей Козлов',
    'Елена Волкова',
    'Дмитрий Соколов',
    'Анна Морозова',
    'Сергей Новиков',
    'Ольга Кузнецова',
    'Павел Лебедев',
    'Наталья Семёнова',
    'Андрей Егоров',
    'Татьяна Павлова',
];

const ADDRESSES = [
    'Москва, ул. Тверская, 12, кв. 34',
    'Санкт-Петербург, Невский пр., 78',
    'Казань, ул. Баумана, 5, офис 21',
    'Новосибирск, Красный пр., 101',
    'Екатеринбург, ул. Ленина, 44, кв. 9',
    'Нижний Новгород, ул. Покровка, 17',
    'Самара, ул. Куйбышева, 63',
    'Воронеж, пр. Революции, 29, кв. 112',
];

const DAY_MS = 24 * 60 * 60 * 1000;

export const ORDERS: Order[] = Array.from({length: 48}, (_, i) => {
    const status = ORDER_STATUSES[(i * 2 + Math.floor(i / 6)) % ORDER_STATUSES.length];
    return {
        id: `order-${i + 1}`,
        number: `ORD-${10240 + i}`,
        customer: CUSTOMERS[i % CUSTOMERS.length],
        date: new Date(Date.UTC(2026, 9, 2) + ((i * 7) % 35) * DAY_MS).toISOString(),
        positions: (i % 5) + 1,
        amount: (((i * 37) % 90) + 12) * 990,
        address: ADDRESSES[(i * 3) % ADDRESSES.length],
        status,
    };
});

export const groupOrdersByStatus = (orders: Order[]): OrderGroup[] =>
    ORDER_STATUSES.map((status) => ({
        id: `group-${status}`,
        status,
        orders: orders.filter((order) => order.status === status),
    })).filter((group) => group.orders.length > 0);
