export type Client = {
  id: string; name: string; email: string; company: string;
  status: 'Активен' | 'Приглашён' | 'Неактивен';
  plan: 'Базовый' | 'Про' | 'Бизнес'; date: string; revenue: number; archived: boolean;
};
const people = [
  ['Александр Петров', 'alex.petrov', 'Яндекс'], ['Мария Иванова', 'm.ivanova', 'Сбер'],
  ['Дмитрий Смирнов', 'd.smirnov', 'Т-Банк'], ['Анна Козлова', 'a.kozlova', 'Ozon'],
  ['Михаил Соколов', 'm.sokolov', 'Авито'], ['Екатерина Новикова', 'e.novikova', 'VK'],
  ['Андрей Морозов', 'a.morozov', 'Самокат'], ['Ольга Волкова', 'o.volkova', 'МТС'],
  ['Сергей Лебедев', 's.lebedev', 'Точка'], ['Наталья Попова', 'n.popova', 'Альфа-Банк'],
  ['Иван Васильев', 'i.vasiliev', 'Ламода'], ['Елена Павлова', 'e.pavlova', 'Контур'],
  ['Артём Орлов', 'a.orlov', 'Мегамаркет'], ['Дарья Семёнова', 'd.semenova', '2ГИС'],
  ['Павел Фёдоров', 'p.fedorov', 'Ростелеком'], ['Виктория Белова', 'v.belova', 'Додо Пицца'],
];
export const initialClients: Client[] = Array.from({length: 128}, (_, i) => {
  const [name, email, company] = people[i % people.length];
  const status = i % 9 === 3 ? 'Приглашён' : i % 7 === 6 ? 'Неактивен' : 'Активен';
  return {id: String(i + 1), name, email: `${email}${i >= 16 ? Math.floor(i / 16) + 1 : ''}@${['company.ru', 'mail.ru', 'work.ru'][i % 3]}`, company,
    status, plan: (['Бизнес', 'Про', 'Про', 'Базовый', 'Бизнес', 'Про', 'Базовый', 'Про', 'Бизнес', 'Базовый'] as const)[i % 10],
    date: new Date(Date.UTC(2026, 9, 24 - i % 24)).toISOString().slice(0, 10),
    revenue: status === 'Приглашён' ? 0 : [124500, 64800, 89900, 0, 156000, 42500, 12900, 56700, 98500, 24900][i % 10],
    archived: i >= 120};
});
export function prepareClients(data: Client[], query: string, status: string, plan: string, tab: string, sort: {column: string; order: 'asc' | 'desc'}[]) {
  const term = query.trim().toLocaleLowerCase('ru');
  return data.filter(c => (tab === 'archive' ? c.archived : !c.archived) && (tab !== 'active' || c.status === 'Активен') &&
    (!status || c.status === status) && (!plan || c.plan === plan) &&
    `${c.name} ${c.email} ${c.company}`.toLocaleLowerCase('ru').includes(term)).sort((a, b) => {
      for (const s of sort) {
        const x = a[s.column as keyof Client], y = b[s.column as keyof Client];
        const result = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'ru');
        if (result) return s.order === 'asc' ? result : -result;
      }
      return 0;
    });
}
export const money = (value: number) => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;
export function csvForClients(clients: Client[]) {
  const quote = (value: unknown) => `"${String(value).replace(/^[=+@\-\t\r]/, "'$&").replaceAll('"', '""')}"`;
  return '\uFEFF' + [['Имя', 'Email', 'Компания', 'Статус', 'Тариф', 'Дата добавления', 'Выручка'], ...clients.map(c => [c.name, c.email, c.company, c.status, c.plan, c.date, c.revenue])].map(row => row.map(quote).join(';')).join('\r\n');
}
