export type OrderStatus = 'Новый' | 'Оплачен' | 'Отправлен' | 'Доставлен' | 'Отменен';

export type Order = {
  id: string;
  number: string;
  customer: string;
  createdAt: string;
  total: string;
  status: OrderStatus;
};

export const orders: Order[] = [
  {id: '1', number: 'ORD-10241', customer: 'Анна Ковалева', createdAt: '05.11.2026', total: '18 400 ₽', status: 'Новый'},
  {id: '2', number: 'ORD-10242', customer: 'Игорь Соколов', createdAt: '05.11.2026', total: '7 250 ₽', status: 'Новый'},
  {id: '3', number: 'ORD-10235', customer: 'Мария Лебедева', createdAt: '04.11.2026', total: '43 900 ₽', status: 'Оплачен'},
  {id: '4', number: 'ORD-10236', customer: 'Дмитрий Орлов', createdAt: '04.11.2026', total: '12 750 ₽', status: 'Оплачен'},
  {id: '5', number: 'ORD-10228', customer: 'Екатерина Гусева', createdAt: '03.11.2026', total: '24 600 ₽', status: 'Отправлен'},
  {id: '6', number: 'ORD-10221', customer: 'Павел Морозов', createdAt: '02.11.2026', total: '8 990 ₽', status: 'Отправлен'},
  {id: '7', number: 'ORD-10214', customer: 'Ольга Титова', createdAt: '01.11.2026', total: '56 300 ₽', status: 'Доставлен'},
  {id: '8', number: 'ORD-10205', customer: 'Сергей Волков', createdAt: '31.10.2026', total: '15 100 ₽', status: 'Доставлен'},
  {id: '9', number: 'ORD-10199', customer: 'Виктория Никитина', createdAt: '30.10.2026', total: '3 400 ₽', status: 'Отменен'},
  {id: '10', number: 'ORD-10194', customer: 'Артем Кузнецов', createdAt: '30.10.2026', total: '21 850 ₽', status: 'Отменен'},
];

export const statusOrder: OrderStatus[] = ['Новый', 'Оплачен', 'Отправлен', 'Доставлен', 'Отменен'];

export type OrderRow = Order | {
  id: string;
  status: OrderStatus;
  count: number;
  orders: Order[];
};

export function isOrderGroup(row: OrderRow): row is Extract<OrderRow, {orders: Order[]}> {
  return 'orders' in row;
}

export function getGroupedOrders(): OrderRow[] {
  return statusOrder.map((status) => {
    const groupOrders = orders.filter((order) => order.status === status);
    return {
      id: `status-${status}`,
      status,
      count: groupOrders.length,
      orders: groupOrders,
    };
  });
}
