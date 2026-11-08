export const NAV_ITEMS = [
  { id: 'home', title: 'Главная', iconId: 'House' },
  { id: 'users', title: 'Пользователи', iconId: 'Users' },
  { id: 'orders', title: 'Заказы', iconId: 'ShoppingCart' },
  { id: 'settings', title: 'Настройки', iconId: 'Gear' },
] as const;

export interface Order {
  id: number;
  customer: string;
  email: string;
  amount: number;
  date: string;
  status: 'Новый' | 'В обработке' | 'Отправлен' | 'Доставлен' | 'Отменён';
  items: number;
}

export const ORDERS: Order[] = [
  { id: 1001, customer: 'Иван Петров', email: 'ivan@example.com', amount: 15400, date: '2026-11-05', status: 'Доставлен', items: 3 },
  { id: 1002, customer: 'Анна Сидорова', email: 'anna@example.com', amount: 8790, date: '2026-11-05', status: 'Отправлен', items: 1 },
  { id: 1003, customer: 'Сергей Волков', email: 'sergey@example.com', amount: 22050, date: '2026-11-04', status: 'Новый', items: 5 },
  { id: 1004, customer: 'Мария Кузнецова', email: 'maria@example.com', amount: 5600, date: '2026-11-04', status: 'В обработке', items: 2 },
  { id: 1005, customer: 'Дмитрий Соколов', email: 'dmitry@example.com', amount: 32000, date: '2026-11-03', status: 'Доставлен', items: 4 },
  { id: 1006, customer: 'Ольга Морозова', email: 'olga@example.com', amount: 12300, date: '2026-11-03', status: 'Отменён', items: 2 },
  { id: 1007, customer: 'Алексей Белов', email: 'alexey@example.com', amount: 9800, date: '2026-11-02', status: 'Доставлен', items: 1 },
  { id: 1008, customer: 'Елена Васильева', email: 'elena@example.com', amount: 41000, date: '2026-11-02', status: 'В обработке', items: 6 },
  { id: 1009, customer: 'Николай Фёдоров', email: 'nikolay@example.com', amount: 7650, date: '2026-11-01', status: 'Новый', items: 1 },
  { id: 1010, customer: 'Татьяна Григорьева', email: 'tatiana@example.com', amount: 18700, date: '2026-11-01', status: 'Отправлен', items: 3 },
  { id: 1011, customer: 'Павел Захаров', email: 'pavel@example.com', amount: 5300, date: '2026-11-05', status: 'Новый', items: 2 },
  { id: 1012, customer: 'Юлия Орлова', email: 'julia@example.com', amount: 29000, date: '2026-11-05', status: 'Отменён', items: 4 },
];

export const STATUS_THEME: Record<Order['status'], string> = {
  'Новый': 'info',
  'В обработке': 'warning',
  'Отправлен': 'utility',
  'Доставлен': 'success',
  'Отменён': 'danger',
};
