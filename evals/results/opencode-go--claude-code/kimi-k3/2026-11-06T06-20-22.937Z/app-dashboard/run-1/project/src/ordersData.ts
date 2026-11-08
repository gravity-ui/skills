export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
    id: string;
    number: string;
    client: string;
    email: string;
    city: string;
    date: string;
    items: number;
    amount: number;
    payment: string;
    status: OrderStatus;
}

export const STATUS_CONFIG: Record<
    OrderStatus,
    {title: string; theme: 'info' | 'warning' | 'utility' | 'success' | 'danger'}
> = {
    new: {title: 'Новый', theme: 'info'},
    processing: {title: 'В обработке', theme: 'warning'},
    shipped: {title: 'Отправлен', theme: 'utility'},
    delivered: {title: 'Доставлен', theme: 'success'},
    cancelled: {title: 'Отменён', theme: 'danger'},
};

export const STATUS_ORDER: OrderStatus[] = [
    'new',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
];

export const ORDERS: Order[] = [
    {id: 'o-1042', number: 'ЗК-1042', client: 'Анна Соколова', email: 'a.sokolova@mail.ru', city: 'Москва', date: '2026-11-05', items: 3, amount: 12490, payment: 'Карта', status: 'new'},
    {id: 'o-1041', number: 'ЗК-1041', client: 'Игорь Лебедев', email: 'lebedev.i@gmail.com', city: 'Санкт-Петербург', date: '2026-11-05', items: 1, amount: 3200, payment: 'СБП', status: 'new'},
    {id: 'o-1040', number: 'ЗК-1040', client: 'Мария Ким', email: 'maria.kim@yandex.ru', city: 'Казань', date: '2026-11-04', items: 5, amount: 27800, payment: 'Карта', status: 'processing'},
    {id: 'o-1039', number: 'ЗК-1039', client: 'Пётр Васильев', email: 'p.vasiliev@bk.ru', city: 'Новосибирск', date: '2026-11-04', items: 2, amount: 8450, payment: 'При получении', status: 'new'},
    {id: 'o-1038', number: 'ЗК-1038', client: 'Ольга Романова', email: 'olga.r@outlook.com', city: 'Екатеринбург', date: '2026-11-04', items: 4, amount: 19300, payment: 'Карта', status: 'processing'},
    {id: 'o-1037', number: 'ЗК-1037', client: 'Дмитрий Орлов', email: 'd.orlov@mail.ru', city: 'Москва', date: '2026-11-03', items: 1, amount: 1590, payment: 'СБП', status: 'shipped'},
    {id: 'o-1036', number: 'ЗК-1036', client: 'Елена Морозова', email: 'e.morozova@gmail.com', city: 'Воронеж', date: '2026-11-03', items: 6, amount: 41200, payment: 'Карта', status: 'processing'},
    {id: 'o-1035', number: 'ЗК-1035', client: 'Сергей Громов', email: 's.gromov@yandex.ru', city: 'Самара', date: '2026-11-03', items: 2, amount: 6700, payment: 'При получении', status: 'shipped'},
    {id: 'o-1034', number: 'ЗК-1034', client: 'Татьяна Белова', email: 't.belova@mail.ru', city: 'Москва', date: '2026-11-02', items: 3, amount: 11800, payment: 'Карта', status: 'delivered'},
    {id: 'o-1033', number: 'ЗК-1033', client: 'Артём Захаров', email: 'a.zakharov@gmail.com', city: 'Краснодар', date: '2026-11-02', items: 1, amount: 4300, payment: 'СБП', status: 'shipped'},
    {id: 'o-1032', number: 'ЗК-1032', client: 'Наталья Фролова', email: 'n.frolova@bk.ru', city: 'Пермь', date: '2026-11-02', items: 4, amount: 22600, payment: 'Карта', status: 'delivered'},
    {id: 'o-1031', number: 'ЗК-1031', client: 'Владимир Титов', email: 'v.titov@mail.ru', city: 'Уфа', date: '2026-11-01', items: 2, amount: 9900, payment: 'При получении', status: 'cancelled'},
    {id: 'o-1030', number: 'ЗК-1030', client: 'Светлана Ершова', email: 's.ershova@gmail.com', city: 'Москва', date: '2026-11-01', items: 7, amount: 53400, payment: 'Карта', status: 'delivered'},
    {id: 'o-1029', number: 'ЗК-1029', client: 'Константин Панов', email: 'k.panov@yandex.ru', city: 'Тюмень', date: '2026-11-01', items: 1, amount: 2100, payment: 'СБП', status: 'delivered'},
    {id: 'o-1028', number: 'ЗК-1028', client: 'Юлия Семёнова', email: 'y.semenova@mail.ru', city: 'Сочи', date: '2026-10-31', items: 3, amount: 14750, payment: 'Карта', status: 'cancelled'},
    {id: 'o-1027', number: 'ЗК-1027', client: 'Александр Ковалёв', email: 'a.kovalev@gmail.com', city: 'Санкт-Петербург', date: '2026-10-31', items: 2, amount: 7800, payment: 'При получении', status: 'delivered'},
    {id: 'o-1026', number: 'ЗК-1026', client: 'Ирина Гусева', email: 'i.guseva@bk.ru', city: 'Ростов-на-Дону', date: '2026-10-31', items: 5, amount: 30900, payment: 'Карта', status: 'shipped'},
    {id: 'o-1025', number: 'ЗК-1025', client: 'Михаил Сафонов', email: 'm.safonov@mail.ru', city: 'Волгоград', date: '2026-10-30', items: 1, amount: 5600, payment: 'СБП', status: 'delivered'},
    {id: 'o-1024', number: 'ЗК-1024', client: 'Оксана Ларина', email: 'o.larina@gmail.com', city: 'Москва', date: '2026-10-30', items: 4, amount: 18200, payment: 'Карта', status: 'new'},
    {id: 'o-1023', number: 'ЗК-1023', client: 'Роман Щербаков', email: 'r.sherbakov@yandex.ru', city: 'Омск', date: '2026-10-29', items: 2, amount: 9100, payment: 'При получении', status: 'processing'},
    {id: 'o-1022', number: 'ЗК-1022', client: 'Вера Николаева', email: 'v.nikolaeva@mail.ru', city: 'Калининград', date: '2026-10-29', items: 3, amount: 13600, payment: 'Карта', status: 'delivered'},
    {id: 'o-1021', number: 'ЗК-1021', client: 'Григорий Мельников', email: 'g.melnikov@gmail.com', city: 'Тула', date: '2026-10-28', items: 1, amount: 2750, payment: 'СБП', status: 'cancelled'},
    {id: 'o-1020', number: 'ЗК-1020', client: 'Людмила Крылова', email: 'l.krylova@bk.ru', city: 'Ярославль', date: '2026-10-28', items: 6, amount: 38500, payment: 'Карта', status: 'delivered'},
    {id: 'o-1019', number: 'ЗК-1019', client: 'Евгений Соболев', email: 'e.sobolev@mail.ru', city: 'Барнаул', date: '2026-10-27', items: 2, amount: 7300, payment: 'При получении', status: 'shipped'},
    {id: 'o-1018', number: 'ЗК-1018', client: 'Полина Виноградова', email: 'p.vinogradova@gmail.com', city: 'Иркутск', date: '2026-10-27', items: 4, amount: 21900, payment: 'Карта', status: 'delivered'},
    {id: 'o-1017', number: 'ЗК-1017', client: 'Николай Федотов', email: 'n.fedotov@yandex.ru', city: 'Хабаровск', date: '2026-10-26', items: 1, amount: 4900, payment: 'СБП', status: 'processing'},
    {id: 'o-1016', number: 'ЗК-1016', client: 'Алина Зайцева', email: 'a.zaitseva@mail.ru', city: 'Владивосток', date: '2026-10-26', items: 3, amount: 16400, payment: 'Карта', status: 'delivered'},
    {id: 'o-1015', number: 'ЗК-1015', client: 'Степан Богданов', email: 's.bogdanov@gmail.com', city: 'Томск', date: '2026-10-25', items: 2, amount: 10200, payment: 'При получении', status: 'cancelled'},
];

export function formatAmount(value: number): string {
    return `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;
}

export function formatDate(iso: string): string {
    const [year, month, day] = iso.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}
