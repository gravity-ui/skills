export type Status = 'processing' | 'shipping' | 'completed' | 'cancelled';
export interface Order {
  id: string; name: string; email: string; initials: string; tone: number;
  date: string; time: string; amount: number; items: number; status: Status;
  paid: boolean; product: string; children?: Order[];
}
export const statuses: {id: Status; label: string; icon: string}[] = [
  {id: 'processing', label: 'В обработке', icon: 'clock'},
  {id: 'shipping', label: 'В доставке', icon: 'truck'},
  {id: 'completed', label: 'Выполнен', icon: 'check'},
  {id: 'cancelled', label: 'Отменён', icon: 'x'},
];
const people = [
  ['Анна Смирнова', 'anna.smirnova@gmail.com', 'АС'],
  ['Михаил Козлов', 'm.kozlov@mail.ru', 'МК'],
  ['Екатерина Иванова', 'ekaterina.i@gmail.com', 'ЕИ'],
  ['Александр Петров', 'alex.petrov@yandex.ru', 'АП'],
  ['Мария Соколова', 'maria.sokolova@gmail.com', 'МС'],
  ['Дмитрий Волков', 'd.volkov@mail.ru', 'ДВ'],
  ['Ольга Новикова', 'olga.novikova@yandex.ru', 'ОН'],
  ['Иван Морозов', 'ivan.morozov@gmail.com', 'ИМ'],
  ['Анастасия Белова', 'a.belova@mail.ru', 'АБ'],
  ['Сергей Лебедев', 's.lebedev@gmail.com', 'СЛ'],
  ['Полина Орлова', 'polina.o@yandex.ru', 'ПО'],
  ['Артём Васильев', 'artem.v@mail.ru', 'АВ'],
];
export const initialOrders: Order[] = Array.from({length: 48}, (_, i) => {
  const p = people[i % people.length];
  return {id: String(1048 - i), name:p[0], email:p[1], initials:p[2], tone:i % 6,
    date: `${20 - Math.floor(i / 8)} мая 2025`, time: `${14 - i % 6}:${['32','18','05','48','24','10'][i % 6]}`,
    amount: [12490,8750,24990,5600,15890,3290,18450,7990,11300,4250,9200,16800][i % 12],
    items: [3,2,5,1,4,1,3,2,2,1,2,4][i % 12],
    status: (i % 12 < 3 ? 'processing' : i % 12 < 6 ? 'shipping' : i % 12 < 10 ? 'completed' : 'cancelled'),
    paid: i % 7 !== 1, product: ['Хлопковая футболка Essential','Кроссовки Urban Runner','Куртка Everyday','Рюкзак City'][i % 4],
  };
});
export const money = (n:number) => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
export const statusLabel = (s: Status) => statuses.find(x=>x.id === s)?.label || s;
