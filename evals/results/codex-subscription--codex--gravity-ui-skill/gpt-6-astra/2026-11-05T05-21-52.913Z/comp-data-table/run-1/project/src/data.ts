export type Status = 'active' | 'invited' | 'archived';
export interface Client { id: string; name: string; email: string; company: string; status: Status; role: string; created: string; }
export const statusLabels: Record<Status, string> = {active: 'Активен', invited: 'Приглашён', archived: 'В архиве'};
const people = [
  ['Анна Смирнова','anna.smirnova'], ['Михаил Иванов','m.ivanov'], ['Екатерина Петрова','e.petrova'],
  ['Александр Козлов','a.kozlov'], ['Мария Соколова','m.sokolova'], ['Дмитрий Волков','d.volkov'],
  ['Ольга Новикова','o.novikova'], ['Артём Морозов','a.morozov'], ['Дарья Лебедева','d.lebedeva'],
  ['Иван Кузнецов','i.kuznetsov'], ['Алина Попова','a.popova'], ['Сергей Васильев','s.vasiliev'],
  ['София Павлова','s.pavlova'], ['Никита Семёнов','n.semenov'], ['Полина Голубева','p.golubeva'],
  ['Максим Виноградов','m.vinogradov'], ['Елена Богданова','e.bogdanova'], ['Андрей Фёдоров','a.fedorov'],
  ['Виктория Михайлова','v.mikhailova'], ['Кирилл Беляев','k.belyaev'], ['Юлия Тарасова','y.tarasova'],
  ['Роман Орлов','r.orlov'], ['Валерия Киселёва','v.kiseleva'], ['Павел Макаров','p.makarov'],
  ['Анастасия Андреева','a.andreeva'], ['Егор Алексеев','e.alekseev'], ['Ксения Захарова','k.zakharova'],
  ['Владимир Зайцев','v.zaitsev'], ['Наталья Соловьёва','n.solovieva'], ['Денис Борисов','d.borisov'],
  ['Вероника Яковлева','v.yakovleva'], ['Олег Григорьев','o.grigoriev'], ['Татьяна Романова','t.romanova'],
  ['Антон Воробьёв','a.vorobiev'], ['Евгения Сергеева','e.sergeeva'], ['Вадим Крылов','v.krylov'],
  ['Александра Фролова','a.frolova'], ['Илья Гусев','i.gusev'], ['Светлана Титова','s.titova'],
  ['Глеб Куликов','g.kulikov'], ['Диана Котова','d.kotova'], ['Матвей Белов','m.belov'],
  ['Кристина Комарова','k.komarova'], ['Тимур Денисов','t.denisov'], ['Арина Жукова','a.zhukova'],
  ['Виктор Никитин','v.nikitin'], ['Ульяна Филиппова','u.filippova'], ['Лев Марков','l.markov'],
];
const companies = ['Яндекс', 'Точка', 'Авито', 'Ozon', 'Сбер', 'Т-Банк'];
const domains = ['yandex.ru', 'tochka.com', 'avito.ru', 'ozon.ru', 'sber.ru', 'tbank.ru'];
export const initialClients: Client[] = people.map(([name, email], i) => ({
  id: `client-${i + 1}`, name, email: `${email}@${domains[i % 6]}`, company: companies[i % 6],
  status: i % 12 < 9 ? 'active' : i % 12 < 11 ? 'invited' : 'archived',
  role: ['Администратор', 'Участник', 'Участник', 'Наблюдатель', 'Участник', 'Администратор'][i % 6],
  created: new Date(Date.UTC(2025, 4, 24 - Math.floor(i / 2))).toISOString(),
}));
export type Sorting = {column: string; order: 'asc' | 'desc'}[];
export function getFilteredClients(clients: Client[], query: string, status: string, company: string, sorting: Sorting) {
  const search = query.trim().toLocaleLowerCase('ru');
  const filtered = clients.filter(client => (!status || client.status === status) && (!company || client.company === company) &&
    [client.name, client.email, client.company].some(value => value.toLocaleLowerCase('ru').includes(search)));
  return filtered.sort((a, b) => {
    for (const sort of sorting) {
      const key = sort.column as keyof Client;
      const av = key === 'status' ? statusLabels[a.status] : a[key];
      const bv = key === 'status' ? statusLabels[b.status] : b[key];
      const comparison = String(av).localeCompare(String(bv), 'ru', {numeric: true});
      if (comparison) return sort.order === 'asc' ? comparison : -comparison;
    }
    return 0;
  });
}
export function toCsv(clients: Client[]) {
  const escape = (value: string) => `"${(/^[=+\-@\t\r]/.test(value) ? "'" + value : value).replaceAll('"', '""')}"`;
  return '\uFEFF' + [['Имя', 'Email', 'Компания', 'Статус', 'Роль', 'Дата добавления'], ...clients.map(c =>
    [c.name, c.email, c.company, statusLabels[c.status], c.role, c.created.slice(0, 10)])].map(row => row.map(escape).join(';')).join('\r\n');
}
