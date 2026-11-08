import type {TableSortState} from '@gravity-ui/uikit';

export type ClientStatus = 'active' | 'new' | 'archived';
export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  status: ClientStatus;
  city: string;
  created: string;
  revenue: number;
}
export const statusLabels: Record<ClientStatus, string> = {active: 'Активный', new: 'Новый', archived: 'В архиве'};
const people = [
  ['Анна Смирнова', 'anna.smirnova', 'Яндекс', 'Москва'],
  ['Михаил Иванов', 'm.ivanov', 'Точка', 'Екатеринбург'],
  ['Екатерина Волкова', 'e.volkova', 'Самокат', 'Санкт-Петербург'],
  ['Дмитрий Козлов', 'd.kozlov', 'Авито', 'Москва'],
  ['Мария Соколова', 'm.sokolova', 'Бюро «Практика»', 'Казань'],
  ['Александр Петров', 'a.petrov', 'Т-Банк', 'Москва'],
  ['Ольга Новикова', 'o.novikova', 'Контур', 'Екатеринбург'],
  ['Артём Морозов', 'a.morozov', 'Сбер', 'Новосибирск'],
  ['Елена Кузнецова', 'e.kuznetsova', 'Ozon', 'Санкт-Петербург'],
  ['Никита Лебедев', 'n.lebedev', 'Додо Пицца', 'Москва'],
  ['Дарья Орлова', 'd.orlova', 'Ламода', 'Москва'],
  ['Иван Васильев', 'i.vasiliev', 'VK', 'Санкт-Петербург'],
  ['Анастасия Павлова', 'a.pavlova', '2ГИС', 'Новосибирск'],
  ['Сергей Михайлов', 's.mikhailov', 'МТС', 'Казань'],
  ['Виктория Фёдорова', 'v.fedorova', 'Альфа-Банк', 'Москва'],
  ['Андрей Егоров', 'a.egorov', 'Skyeng', 'Санкт-Петербург'],
  ['Полина Захарова', 'p.zakharova', 'Яндекс', 'Казань'],
  ['Павел Николаев', 'p.nikolaev', 'Точка', 'Екатеринбург'],
  ['Алина Алексеева', 'a.alekseeva', 'Самокат', 'Москва'],
  ['Максим Степанов', 'm.stepanov', 'Авито', 'Санкт-Петербург'],
  ['Юлия Крылова', 'y.krylova', 'Ozon', 'Казань'],
  ['Роман Киселёв', 'r.kiselev', 'Контур', 'Екатеринбург'],
  ['Ксения Громова', 'k.gromova', 'Бюро «Практика»', 'Москва'],
  ['Денис Соловьёв', 'd.soloviev', 'Т-Банк', 'Новосибирск'],
  ['Валерия Белова', 'v.belova', 'Сбер', 'Москва'],
  ['Кирилл Комаров', 'k.komarov', 'Ламода', 'Санкт-Петербург'],
  ['София Тихонова', 's.tikhonova', 'VK', 'Москва'],
  ['Илья Макаров', 'i.makarov', 'Додо Пицца', 'Казань'],
  ['Евгения Зайцева', 'e.zaitseva', 'Skyeng', 'Новосибирск'],
  ['Владимир Андреев', 'v.andreev', '2ГИС', 'Новосибирск'],
  ['Татьяна Миронова', 't.mironova', 'МТС', 'Москва'],
  ['Антон Романов', 'a.romanov', 'Альфа-Банк', 'Казань'],
  ['Вера Сергеева', 'v.sergeeva', 'Яндекс', 'Москва'],
  ['Егор Белов', 'e.belov', 'Контур', 'Екатеринбург'],
  ['Диана Попова', 'd.popova', 'Ozon', 'Санкт-Петербург'],
  ['Глеб Борисов', 'g.borisov', 'Точка', 'Казань'],
  ['Лидия Тарасова', 'l.tarasova', 'Авито', 'Москва'],
  ['Вадим Фомин', 'v.fomin', 'Самокат', 'Санкт-Петербург'],
  ['Наталья Жукова', 'n.zhukova', 'Т-Банк', 'Новосибирск'],
  ['Тимур Воробьёв', 't.vorobiev', 'Сбер', 'Казань'],
  ['Светлана Медведева', 's.medvedeva', 'Бюро «Практика»', 'Москва'],
  ['Даниил Ершов', 'd.ershov', 'Ламода', 'Екатеринбург'],
  ['Алёна Филатова', 'a.filatova', 'VK', 'Санкт-Петербург'],
  ['Виталий Гусев', 'v.gusev', 'Додо Пицца', 'Москва'],
  ['Ирина Сидорова', 'i.sidorova', 'Skyeng', 'Казань'],
  ['Лев Ковалёв', 'l.kovalev', '2ГИС', 'Новосибирск'],
  ['Яна Ильина', 'y.ilina', 'МТС', 'Санкт-Петербург'],
  ['Борис Куликов', 'b.kulikov', 'Альфа-Банк', 'Москва'],
];
const domains: Record<string, string> = {'Яндекс': 'yandex.ru', 'Точка': 'tochka.com', 'Самокат': 'samokat.ru', 'Авито': 'avito.ru', 'Бюро «Практика»': 'praktika.studio', 'Т-Банк': 'tbank.ru', 'Контур': 'kontur.ru', 'Сбер': 'sber.ru', 'Ozon': 'ozon.ru', 'Додо Пицца': 'dodopizza.ru', 'Ламода': 'lamoda.ru', 'VK': 'vk.ru', '2ГИС': '2gis.ru', 'МТС': 'mts.ru', 'Альфа-Банк': 'alfabank.ru', 'Skyeng': 'skyeng.ru'};
const revenues = [128500, 84300, 56000, 215000, 67500, 172800, 34900, 98000, 146200, 42000];
export const initialClients: Client[] = people.map(([name, email, company, city], i) => ({
  id: `client-${i + 1}`, name, email: `${email}@${domains[company]}`, company, city,
  status: i >= 42 ? 'archived' : i % 5 === 1 || i === 2 ? 'new' : 'active',
  created: new Date(Date.UTC(2026, 10, 4) - i * 86400000).toISOString().slice(0, 10),
  revenue: revenues[i % revenues.length] + Math.floor(i / 10) * 2500,
}));

export interface ClientFilters {query: string; status: string; city: string; month: string}
const collator = new Intl.Collator('ru', {numeric: true, sensitivity: 'base'});
export function filterAndSort(clients: Client[], filters: ClientFilters, sort: TableSortState): Client[] {
  const query = filters.query.trim().toLocaleLowerCase('ru');
  return clients.filter(client =>
    (filters.status === 'all' || client.status === filters.status) &&
    (filters.city === 'all' || client.city === filters.city) &&
    (filters.month === 'all' || client.created.startsWith(filters.month)) &&
    (!query || [client.name, client.email, client.company].some(value => value.toLocaleLowerCase('ru').includes(query)))
  ).sort((a, b) => {
    for (const {column, order} of sort) {
      if (!(column in a)) continue;
      const key = column as keyof Client;
      const left = key === 'status' ? statusLabels[a.status] : a[key];
      const right = key === 'status' ? statusLabels[b.status] : b[key];
      const result = typeof left === 'number' && typeof right === 'number' ? left - right : collator.compare(String(left), String(right));
      if (result) return order === 'asc' ? result : -result;
    }
    return 0;
  });
}
