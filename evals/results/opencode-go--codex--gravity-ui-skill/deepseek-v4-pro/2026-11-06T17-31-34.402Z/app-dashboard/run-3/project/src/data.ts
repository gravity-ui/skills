export interface Order {
  id: number;
  customer: string;
  date: string;
  amount: number;
  status: string;
  product: string;
  quantity: number;
}

export const orders: Order[] = [
  { id: 1001, customer: 'ООО Технопром', date: '2026-10-15', amount: 145000, status: 'Новый', product: 'Серверное оборудование', quantity: 3 },
  { id: 1002, customer: 'ИП Иванов', date: '2026-10-14', amount: 23500, status: 'В обработке', product: 'Офисная мебель', quantity: 12 },
  { id: 1003, customer: 'АО Мегасофт', date: '2026-10-13', amount: 78000, status: 'Отправлен', product: 'Лицензии ПО', quantity: 50 },
  { id: 1004, customer: 'ООО Стройград', date: '2026-10-12', amount: 320000, status: 'Новый', product: 'Строительные материалы', quantity: 200 },
  { id: 1005, customer: 'ИП Петров', date: '2026-10-11', amount: 12000, status: 'Доставлен', product: 'Канцелярия', quantity: 80 },
  { id: 1006, customer: 'ПАО Нефтегаз', date: '2026-10-10', amount: 560000, status: 'Новый', product: 'Буровое оборудование', quantity: 5 },
  { id: 1007, customer: 'ООО Логистик', date: '2026-10-09', amount: 89000, status: 'В обработке', product: 'Транспортные услуги', quantity: 1 },
  { id: 1008, customer: 'ИП Сидоров', date: '2026-10-08', amount: 4500, status: 'Отменён', product: 'Расходные материалы', quantity: 25 },
  { id: 1009, customer: 'АО Фармапром', date: '2026-10-07', amount: 215000, status: 'Отправлен', product: 'Медицинское оборудование', quantity: 8 },
  { id: 1010, customer: 'ООО Агрокомплекс', date: '2026-10-06', amount: 67000, status: 'Доставлен', product: 'Удобрения', quantity: 150 },
  { id: 1011, customer: 'ИП Кузнецов', date: '2026-10-05', amount: 34000, status: 'Новый', product: 'Инструменты', quantity: 40 },
  { id: 1012, customer: 'ООО Электроника', date: '2026-10-04', amount: 192000, status: 'В обработке', product: 'Микросхемы', quantity: 1000 },
  { id: 1013, customer: 'АО Связьинвест', date: '2026-10-03', amount: 410000, status: 'Отправлен', product: 'Телеком-оборудование', quantity: 15 },
  { id: 1014, customer: 'ИП Морозов', date: '2026-10-02', amount: 8700, status: 'Доставлен', product: 'Упаковка', quantity: 300 },
  { id: 1015, customer: 'ООО Автотрейд', date: '2026-10-01', amount: 275000, status: 'Отменён', product: 'Автозапчасти', quantity: 60 },
  { id: 1016, customer: 'ПАО Энергосбыт', date: '2026-09-30', amount: 148000, status: 'Новый', product: 'Кабельная продукция', quantity: 500 },
  { id: 1017, customer: 'ООО Металлург', date: '2026-09-29', amount: 830000, status: 'В обработке', product: 'Металлопрокат', quantity: 25 },
  { id: 1018, customer: 'ИП Григорьев', date: '2026-09-28', amount: 19500, status: 'Доставлен', product: 'Спецодежда', quantity: 45 },
  { id: 1019, customer: 'АО Химзавод', date: '2026-09-27', amount: 390000, status: 'Отправлен', product: 'Химреагенты', quantity: 120 },
  { id: 1020, customer: 'ООО Продукт', date: '2026-09-26', amount: 52000, status: 'Новый', product: 'Продукты питания', quantity: 200 },
];
