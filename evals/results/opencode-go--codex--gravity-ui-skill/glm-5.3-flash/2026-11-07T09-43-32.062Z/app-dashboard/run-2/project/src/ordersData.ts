export type OrderStatus = 'new' | 'processing' | 'shipped' | 'completed' | 'cancelled';

export type Order = {
  id: string;
  customer: string;
  status: OrderStatus;
  amount: number;
  createdAt: string;
};

export const orderStatusLabels: Record<OrderStatus, string> = {
  new: 'Новый',
  processing: 'В работе',
  shipped: 'Отправлен',
  completed: 'Завершён',
  cancelled: 'Отменён',
};

export const orders: Order[] = [
  {id: 'ORD-1042', customer: 'Анна Соколова', status: 'new', amount: 24900, createdAt: '2026-11-05'},
  {id: 'ORD-1041', customer: 'Павел Ким', status: 'processing', amount: 82500, createdAt: '2026-11-04'},
  {id: 'ORD-1040', customer: 'Мария Орлова', status: 'shipped', amount: 11300, createdAt: '2026-11-04'},
  {id: 'ORD-1039', customer: 'Дмитрий Волков', status: 'completed', amount: 56700, createdAt: '2026-11-03'},
  {id: 'ORD-1038', customer: 'Елена Морозова', status: 'new', amount: 43900, createdAt: '2026-11-02'},
  {id: 'ORD-1037', customer: 'Сергей Белов', status: 'cancelled', amount: 19400, createdAt: '2026-11-02'},
  {id: 'ORD-1036', customer: 'Ирина Лаврова', status: 'processing', amount: 78100, createdAt: '2026-11-01'},
  {id: 'ORD-1035', customer: 'Никита Гринёв', status: 'completed', amount: 32800, createdAt: '2026-10-31'},
  {id: 'ORD-1034', customer: 'Ольга Тарасова', status: 'shipped', amount: 65000, createdAt: '2026-10-30'},
  {id: 'ORD-1033', customer: 'Артём Жуков', status: 'new', amount: 15600, createdAt: '2026-10-29'},
];
