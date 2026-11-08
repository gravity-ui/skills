export type Status = 'new' | 'processing' | 'done' | 'cancelled';
export interface Order { id: string; name: string; email: string; date: string; time: string; amount: number; status: Status; payment: string; items: number; children?: Order[] }
export const statuses: Record<Status, {label: string; plural: string; className: string}> = {
  new: {label: 'Новый', plural: 'Новые', className: 'purple'},
  processing: {label: 'В обработке', plural: 'В обработке', className: 'orange'},
  done: {label: 'Выполнен', plural: 'Выполненные', className: 'green'},
  cancelled: {label: 'Отменён', plural: 'Отменённые', className: 'gray'},
};
const people = [
 ['Анна Смирнова','anna.smirnova@gmail.com'], ['Михаил Петров','m.petrov@mail.ru'],
 ['Екатерина Иванова','kate.ivanova@yandex.ru'], ['Дмитрий Соколов','d.sokolov@gmail.com'],
 ['Мария Кузнецова','maria.k@mail.ru'], ['Александр Волков','a.volkov@yandex.ru'],
 ['Ольга Новикова','olga.novikova@gmail.com'], ['Андрей Морозов','andrey.m@mail.ru'],
 ['Елена Попова','elena.popova@yandex.ru'], ['Иван Васильев','ivan.v@gmail.com'],
 ['Наталья Павлова','n.pavlova@mail.ru'], ['Сергей Козлов','sergey.k@yandex.ru'],
 ['Алексей Орлов','alex.orlov@gmail.com'], ['Виктория Белова','vika.b@mail.ru'],
 ['Павел Лебедев','p.lebedev@yandex.ru'], ['Алина Соколова','alina.s@gmail.com'],
];
export const initialOrders: Order[] = Array.from({length: 128}, (_, i) => ({
 id: String(1048 - i), name: people[i % people.length][0], email: people[i % people.length][1],
 date: `2026-11-${String(4 - Math.floor(i / 36)).padStart(2,'0')}`, time: `${String(14 - i % 6).padStart(2,'0')}:${String((32 + i * 7) % 60).padStart(2,'0')}`,
 amount: [12490,5890,24750,3200,8990,15600,7490,4200,18900,6750,11200,3490][i % 12],
 status: i < 5 ? 'new' : i < 9 ? 'processing' : i < 12 ? 'done' : i % 13 === 0 ? 'cancelled' : i % 4 === 0 ? 'new' : i % 3 === 0 ? 'processing' : 'done',
 payment: i < 2 || i % 9 === 0 ? 'Ожидает оплаты' : i % 13 === 0 ? 'Возврат' : 'Оплачен', items: 1 + i % 5,
}));
export const money = (amount: number) => new Intl.NumberFormat('ru-RU').format(amount) + ' ₽';
export const dateLabel = (date: string) => new Date(date + 'T12:00:00').toLocaleDateString('ru-RU', {day:'numeric',month:'short',year:'numeric'}).replace(' г.','');
export const initials = (name: string) => name.split(' ').map(n=>n[0]).slice(0,2).join('');
