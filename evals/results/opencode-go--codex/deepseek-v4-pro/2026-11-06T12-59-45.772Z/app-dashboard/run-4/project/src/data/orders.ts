export interface Order {
  id: string;
  customer: string;
  email: string;
  product: string;
  amount: number;
  date: string;
  status: 'В обработке' | 'Отправлен' | 'Доставлен' | 'Отменён';
}

export const orders: Order[] = [
  { id: 'ORD-1001', customer: 'Иван Петров', email: 'ivan@example.com', product: 'Ноутбук Pro X', amount: 129990, date: '2026-10-20', status: 'Доставлен' },
  { id: 'ORD-1002', customer: 'Анна Смирнова', email: 'anna@example.com', product: 'Монитор 27"', amount: 45990, date: '2026-10-25', status: 'Доставлен' },
  { id: 'ORD-1003', customer: 'Дмитрий Волков', email: 'dmitry@example.com', product: 'Клавиатура MX Keys', amount: 15990, date: '2026-10-31', status: 'Отправлен' },
  { id: 'ORD-1004', customer: 'Елена Козлова', email: 'elena@example.com', product: 'Мышь MX Master', amount: 10990, date: '2026-11-01', status: 'Отправлен' },
  { id: 'ORD-1005', customer: 'Сергей Морозов', email: 'sergey@example.com', product: 'SSD 2TB NVMe', amount: 18990, date: '2026-11-02', status: 'В обработке' },
  { id: 'ORD-1006', customer: 'Мария Белова', email: 'maria@example.com', product: 'Наушники ANC', amount: 24990, date: '2026-11-03', status: 'В обработке' },
  { id: 'ORD-1007', customer: 'Алексей Зайцев', email: 'alexey@example.com', product: 'Планшет Tab S10', amount: 84990, date: '2026-11-03', status: 'В обработке' },
  { id: 'ORD-1008', customer: 'Ольга Романова', email: 'olga@example.com', product: 'Фитнес-браслет', amount: 5990, date: '2026-10-18', status: 'Отменён' },
  { id: 'ORD-1009', customer: 'Павел Кузнецов', email: 'pavel@example.com', product: 'Роутер Wi-Fi 7', amount: 32990, date: '2026-10-22', status: 'Доставлен' },
  { id: 'ORD-1010', customer: 'Наталья Фёдорова', email: 'natalia@example.com', product: 'Веб-камера 4K', amount: 12990, date: '2026-10-29', status: 'Отправлен' },
  { id: 'ORD-1011', customer: 'Андрей Соколов', email: 'andrey@example.com', product: 'Внешний HDD 4TB', amount: 11990, date: '2026-11-01', status: 'Отправлен' },
  { id: 'ORD-1012', customer: 'Татьяна Громова', email: 'tatiana@example.com', product: 'Смарт-часы Ultra', amount: 59990, date: '2026-11-04', status: 'В обработке' },
  { id: 'ORD-1013', customer: 'Михаил Егоров', email: 'mikhail@example.com', product: 'Графический планшет', amount: 28990, date: '2026-11-04', status: 'В обработке' },
  { id: 'ORD-1014', customer: 'Виктория Лебедева', email: 'viktoria@example.com', product: 'USB-хаб Thunderbolt', amount: 7990, date: '2026-10-15', status: 'Отменён' },
  { id: 'ORD-1015', customer: 'Роман Тихонов', email: 'roman@example.com', product: 'Игровая консоль PS6', amount: 89990, date: '2026-10-28', status: 'Доставлен' },
  { id: 'ORD-1016', customer: 'Юлия Никитина', email: 'yulia@example.com', product: 'Кресло Ergohuman', amount: 54990, date: '2026-11-05', status: 'В обработке' },
  { id: 'ORD-1017', customer: 'Константин Баранов', email: 'konstantin@example.com', product: 'Микрофон студийный', amount: 21990, date: '2026-11-02', status: 'Отправлен' },
  { id: 'ORD-1018', customer: 'Алина Васильева', email: 'alina@example.com', product: 'Кольцевая лампа', amount: 4590, date: '2026-10-19', status: 'Доставлен' },
];

export const statusLabels: Record<Order['status'], string> = {
  'В обработке': 'В обработке',
  'Отправлен': 'Отправлен',
  'Доставлен': 'Доставлен',
  'Отменён': 'Отменён',
};

export const statusColors: Record<Order['status'], string> = {
  'В обработке': '#FFB800',
  'Отправлен': '#5282FF',
  'Доставлен': '#3BC864',
  'Отменён': '#FF5959',
};
