import type {TableSortState} from '@gravity-ui/uikit';

export type Status = 'active' | 'trial' | 'archived';
export type Plan = 'Базовый' | 'Про' | 'Бизнес';
export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  status: Status;
  plan: Plan;
  date: string;
  revenue: number;
  color: number;
}
export const statusLabels: Record<Status, string> = {active: 'Активен', trial: 'Пробный', archived: 'В архиве'};
const people = [
  ['Анна Смирнова', 'anna.smirnova', 'Яндекс'],
  ['Михаил Иванов', 'm.ivanov', 'Точка'],
  ['Елена Козлова', 'elena.kozlova', 'Самокат'],
  ['Дмитрий Петров', 'd.petrov', 'Ozon'],
  ['Мария Соколова', 'maria.sokolova', 'Сбер'],
  ['Александр Волков', 'a.volkov', 'Авито'],
  ['Ольга Новикова', 'olga.novikova', 'Контур'],
  ['Артём Морозов', 'artem.morozov', 'Т-Банк'],
  ['София Лебедева', 'sofia.lebedeva', 'МТС'],
  ['Иван Попов', 'ivan.popov', 'VK'],
  ['Полина Васильева', 'p.vasilieva', 'Ламода'],
  ['Максим Зайцев', 'max.zaitsev', 'Додо'],
  ['Дарья Павлова', 'daria.pavlova', 'Яндекс'],
  ['Андрей Семёнов', 'a.semenov', 'Точка'],
  ['Виктория Голубева', 'v.golubeva', 'Самокат'],
  ['Никита Виноградов', 'n.vinogradov', 'Ozon'],
  ['Алиса Богданова', 'alisa.bogdanova', 'Сбер'],
  ['Сергей Воробьёв', 's.vorobiev', 'Авито'],
  ['Ксения Фёдорова', 'k.fedorova', 'Контур'],
  ['Павел Михайлов', 'p.mikhailov', 'Т-Банк'],
  ['Вероника Белова', 'v.belova', 'МТС'],
  ['Роман Тарасов', 'roman.tarasov', 'VK'],
  ['Анастасия Орлова', 'a.orlova', 'Ламода'],
  ['Денис Киселёв', 'd.kiselev', 'Додо'],
  ['Екатерина Макарова', 'e.makarova', 'Яндекс'],
  ['Тимофей Андреев', 't.andreev', 'Точка'],
  ['Юлия Николаева', 'j.nikolaeva', 'Самокат'],
  ['Владимир Фролов', 'v.frolov', 'Ozon'],
  ['Валерия Алексеева', 'v.alekseeva', 'Сбер'],
  ['Константин Дмитриев', 'k.dmitriev', 'Авито'],
  ['Наталья Захарова', 'n.zakharova', 'Контур'],
  ['Егор Соловьёв', 'e.soloviev', 'Т-Банк'],
];
export const initialClients: Client[] = people.map(([name, email, company], i) => ({
  id: String(i + 1), name, email: `${email}@${['yandex.ru', 'tochka.com', 'samokat.ru', 'ozon.ru', 'sber.ru', 'avito.ru', 'kontur.ru', 'tbank.ru', 'mts.ru', 'vk.com', 'lamoda.ru', 'dodobrands.io'][i % 12]}`,
  company, status: i % 9 === 8 ? 'archived' : i % 4 === 2 ? 'trial' : 'active',
  plan: (['Про', 'Бизнес', 'Базовый', 'Бизнес', 'Про', 'Про', 'Базовый', 'Бизнес'] as Plan[])[i % 8],
  date: new Date(Date.UTC(2026, 10, 5 - i * 2)).toISOString().slice(0, 10),
  revenue: i % 4 === 2 ? 0 : [24900, 84900, 0, 128500, 34900, 19900, 0, 64900][i % 8],
  color: i % 6,
}));
export function filterAndSort(clients: Client[], query: string, status: string, plan: string, sorting: TableSortState) {
  const search = query.trim().toLocaleLowerCase('ru');
  return clients.filter(c => (!search || `${c.name} ${c.email} ${c.company}`.toLocaleLowerCase('ru').includes(search)) && (!status || c.status === status) && (!plan || c.plan === plan))
    .sort((a, b) => {
      for (const {column, order} of sorting) {
        const left = column === 'status' ? statusLabels[a.status] : a[column as keyof Client];
        const right = column === 'status' ? statusLabels[b.status] : b[column as keyof Client];
        const comparison = typeof left === 'number' && typeof right === 'number' ? left - right : String(left).localeCompare(String(right), 'ru', {numeric: true});
        if (comparison) return order === 'asc' ? comparison : -comparison;
      }
      return 0;
    });
}
export const money = (value: number) => new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 0}).format(value) + ' ₽';
export function toCsv(clients: Client[]) {
  const escape = (value: unknown) => '"' + String(value).replace(/^[=+@\-]/, "'$&").replaceAll('"', '""') + '"';
  return '\uFEFF' + [['Имя', 'Email', 'Компания', 'Статус', 'Тариф', 'Дата регистрации', 'Выручка'], ...clients.map(c => [c.name, c.email, c.company, statusLabels[c.status], c.plan, c.date, c.revenue])].map(row => row.map(escape).join(';')).join('\r\n');
}
