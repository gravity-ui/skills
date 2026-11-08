export type OrderStatus = 'Новый' | 'В обработке' | 'Отправлен' | 'Доставлен' | 'Отменён';

export interface Order {
  id: string;
  customer: string;
  product: string;
  amount: number;
  date: string;
  status: OrderStatus;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
}

export const navItems: NavItem[] = [
  { id: 'home', label: 'Главная', icon: 'House' },
  { id: 'users', label: 'Пользователи', icon: 'Person' },
  { id: 'orders', label: 'Заказы', icon: 'ShoppingCart' },
  { id: 'settings', label: 'Настройки', icon: 'Gear' },
];

export const orders: Order[] = [
  { id: '1001', customer: 'Иван Петров', product: 'Ноутбук Pro 15', amount: 89990, date: '2026-11-01', status: 'Новый' },
  { id: '1002', customer: 'Мария Соколова', product: 'Монитор 27"', amount: 34990, date: '2026-11-02', status: 'В обработке' },
  { id: '1003', customer: 'Алексей Волков', product: 'Клавиатура MX Keys', amount: 12990, date: '2026-11-02', status: 'Отправлен' },
  { id: '1004', customer: 'Елена Мороз', product: 'SSD 1TB NVMe', amount: 8990, date: '2026-11-03', status: 'Доставлен' },
  { id: '1005', customer: 'Дмитрий Козлов', product: 'Веб-камера 4K', amount: 15990, date: '2026-11-03', status: 'Новый' },
  { id: '1006', customer: 'Анна Фёдорова', product: 'Мышь MX Master 3S', amount: 11990, date: '2026-11-04', status: 'В обработке' },
  { id: '1007', customer: 'Сергей Новиков', product: 'Наушники WH-1000XM5', amount: 29990, date: '2026-11-04', status: 'Отправлен' },
  { id: '1008', customer: 'Ольга Зайцева', product: 'Док-станция USB-C', amount: 7990, date: '2026-11-05', status: 'Доставлен' },
  { id: '1009', customer: 'Павел Орлов', product: 'Планшет Tab S9', amount: 54990, date: '2026-11-05', status: 'Отменён' },
  { id: '1010', customer: 'Татьяна Смирнова', product: 'Чехол для ноутбука', amount: 2990, date: '2026-11-05', status: 'Новый' },
  { id: '1011', customer: 'Максим Егоров', product: 'Микрофон USB', amount: 8990, date: '2026-11-05', status: 'В обработке' },
  { id: '1012', customer: 'Юлия Белова', product: 'Внешний HDD 2TB', amount: 5990, date: '2026-11-06', status: 'Новый' },
  { id: '1013', customer: 'Андрей Кузнецов', product: 'Роутер Wi-Fi 6', amount: 7990, date: '2026-11-06', status: 'В обработке' },
  { id: '1014', customer: 'Наталья Попова', product: 'ИБП 1000VA', amount: 12990, date: '2026-10-30', status: 'Отправлен' },
  { id: '1015', customer: 'Виктор Семёнов', product: 'Смартфон Pro Max', amount: 109990, date: '2026-10-29', status: 'Доставлен' },
  { id: '1016', customer: 'Кристина Ларина', product: 'Принтер лазерный', amount: 19990, date: '2026-10-28', status: 'Отменён' },
  { id: '1017', customer: 'Григорий Антонов', product: 'Геймпад Wireless', amount: 6990, date: '2026-10-28', status: 'Доставлен' },
  { id: '1018', customer: 'Валерия Игнатова', product: 'Хаб USB 7-портов', amount: 3490, date: '2026-11-06', status: 'Новый' },
];

export const statusOrder: OrderStatus[] = ['Новый', 'В обработке', 'Отправлен', 'Доставлен', 'Отменён'];
