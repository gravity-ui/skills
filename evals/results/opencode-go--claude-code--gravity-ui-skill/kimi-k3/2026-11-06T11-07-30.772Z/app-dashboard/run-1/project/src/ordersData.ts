import type {LabelProps} from '@gravity-ui/uikit';

export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
    id: string;
    number: string;
    customer: string;
    created: string; // ISO date
    itemsCount: number;
    total: number;
    status: OrderStatus;
}

export interface OrderGroup {
    id: string;
    status: OrderStatus;
    orders: Order[];
}

export type OrderRowData = Order | OrderGroup;

export const isOrderGroup = (item: OrderRowData): item is OrderGroup => 'orders' in item;

export const isOrder = (item: OrderRowData): item is Order => !isOrderGroup(item);

export const STATUS_ORDER: OrderStatus[] = [
    'new',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
];

export const STATUS_META: Record<OrderStatus, {title: string; theme: LabelProps['theme']}> = {
    new: {title: 'Новый', theme: 'info'},
    processing: {title: 'В обработке', theme: 'warning'},
    shipped: {title: 'Отправлен', theme: 'utility'},
    delivered: {title: 'Доставлен', theme: 'success'},
    cancelled: {title: 'Отменён', theme: 'danger'},
};

export const ORDERS: Order[] = [
    {id: 'o-1041', number: '1041', customer: 'Иван Петров', created: '2026-11-05', itemsCount: 3, total: 12490, status: 'new'},
    {id: 'o-1042', number: '1042', customer: 'Мария Сидорова', created: '2026-11-05', itemsCount: 1, total: 2190, status: 'new'},
    {id: 'o-1043', number: '1043', customer: 'ООО «Вектор»', created: '2026-11-04', itemsCount: 12, total: 187300, status: 'new'},
    {id: 'o-1044', number: '1044', customer: 'Анна Кузнецова', created: '2026-11-04', itemsCount: 2, total: 8450, status: 'new'},
    {id: 'o-1045', number: '1045', customer: 'Дмитрий Волков', created: '2026-11-03', itemsCount: 5, total: 33980, status: 'new'},
    {id: 'o-1036', number: '1036', customer: 'Елена Смирнова', created: '2026-11-02', itemsCount: 4, total: 15720, status: 'processing'},
    {id: 'o-1037', number: '1037', customer: 'ИП Ковалёв А.В.', created: '2026-11-02', itemsCount: 8, total: 96400, status: 'processing'},
    {id: 'o-1038', number: '1038', customer: 'Сергей Морозов', created: '2026-11-01', itemsCount: 2, total: 5890, status: 'processing'},
    {id: 'o-1039', number: '1039', customer: 'Ольга Новикова', created: '2026-11-01', itemsCount: 6, total: 41260, status: 'processing'},
    {id: 'o-1040', number: '1040', customer: 'Павел Егоров', created: '2026-10-31', itemsCount: 1, total: 3490, status: 'processing'},
    {id: 'o-1028', number: '1028', customer: 'Татьяна Белова', created: '2026-10-30', itemsCount: 3, total: 19870, status: 'shipped'},
    {id: 'o-1029', number: '1029', customer: 'ООО «Северная звезда»', created: '2026-10-30', itemsCount: 21, total: 342500, status: 'shipped'},
    {id: 'o-1030', number: '1030', customer: 'Николай Федоров', created: '2026-10-29', itemsCount: 2, total: 7640, status: 'shipped'},
    {id: 'o-1031', number: '1031', customer: 'Виктория Лебедева', created: '2026-10-29', itemsCount: 4, total: 22110, status: 'shipped'},
    {id: 'o-1032', number: '1032', customer: 'Артём Соколов', created: '2026-10-28', itemsCount: 1, total: 4290, status: 'shipped'},
    {id: 'o-1019', number: '1019', customer: 'Юлия Медведева', created: '2026-10-25', itemsCount: 5, total: 27630, status: 'delivered'},
    {id: 'o-1020', number: '1020', customer: 'ИП Захарова Н.П.', created: '2026-10-24', itemsCount: 9, total: 118950, status: 'delivered'},
    {id: 'o-1021', number: '1021', customer: 'Константин Орлов', created: '2026-10-23', itemsCount: 2, total: 9980, status: 'delivered'},
    {id: 'o-1022', number: '1022', customer: 'Светлана Романова', created: '2026-10-22', itemsCount: 3, total: 14520, status: 'delivered'},
    {id: 'o-1023', number: '1023', customer: 'Александр Гусев', created: '2026-10-21', itemsCount: 7, total: 58740, status: 'delivered'},
    {id: 'o-1024', number: '1024', customer: 'Марина Тихонова', created: '2026-10-20', itemsCount: 1, total: 2790, status: 'delivered'},
    {id: 'o-1011', number: '1011', customer: 'Григорий Антонов', created: '2026-10-18', itemsCount: 2, total: 6840, status: 'cancelled'},
    {id: 'o-1012', number: '1012', customer: 'ООО «Лагуна»', created: '2026-10-17', itemsCount: 15, total: 204800, status: 'cancelled'},
    {id: 'o-1013', number: '1013', customer: 'Вероника Крылова', created: '2026-10-16', itemsCount: 1, total: 1890, status: 'cancelled'},
];

export const GROUPED_ORDERS: OrderRowData[] = STATUS_ORDER.map((status) => ({
    id: `group-${status}`,
    status,
    orders: ORDERS.filter((order) => order.status === status),
})).filter((group) => group.orders.length > 0);
