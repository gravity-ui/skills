import type {TableSortState} from '@gravity-ui/uikit';

export type Status = 'active' | 'inactive' | 'archived';
export type Client = {
  id: string;
  name: string;
  role: string;
  company: string;
  email: string;
  status: Status;
  createdAt: string;
};
export const statusLabels: Record<Status, string> = {
  active: 'Активный', inactive: 'Неактивный', archived: 'В архиве',
};

export function createClients(): Client[] {
  const featured = [
    ['Анна Смирнова', 'Директор по маркетингу', 'Яндекс', 'a.smirnova@yandex.ru', 'active'],
    ['Михаил Козлов', 'Руководитель проектов', 'Т-Банк', 'm.kozlov@tbank.ru', 'active'],
    ['Елена Волкова', 'HR-директор', 'Ozon', 'e.volkova@ozon.ru', 'active'],
    ['Дмитрий Соколов', 'Генеральный директор', 'Самокат', 'd.sokolov@samokat.ru', 'inactive'],
    ['Мария Новикова', 'Продуктовый дизайнер', 'Яндекс', 'm.novikova@yandex.ru', 'active'],
    ['Александр Попов', 'Коммерческий директор', 'VK', 'a.popov@vk.com', 'active'],
    ['Ольга Морозова', 'Менеджер по развитию', 'Сбер', 'o.morozova@sber.ru', 'inactive'],
    ['Иван Петров', 'Технический директор', 'Avito', 'i.petrov@avito.ru', 'active'],
    ['Екатерина Белова', 'Руководитель отдела продаж', 'Ozon', 'e.belova@ozon.ru', 'active'],
    ['Андрей Лебедев', 'Операционный директор', 'Т-Банк', 'a.lebedev@tbank.ru', 'active'],
    ['София Васильева', 'Менеджер проектов', 'Самокат', 's.vasilyeva@samokat.ru', 'active'],
    ['Никита Орлов', 'Бизнес-аналитик', 'Сбер', 'n.orlov@sber.ru', 'active'],
    ['Виктория Зайцева', 'Маркетолог', 'VK', 'v.zaitseva@vk.com', 'active'],
    ['Павел Фёдоров', 'Менеджер по продажам', 'Avito', 'p.fedorov@avito.ru', 'inactive'],
    ['Дарья Михайлова', 'Арт-директор', 'Яндекс', 'd.mikhailova@yandex.ru', 'inactive'],
    ['Сергей Никитин', 'Консультант', 'Ozon', 's.nikitin@ozon.ru', 'archived'],
  ];
  return Array.from({length: 128}, (_, index) => {
    const [name, role, company, email, status] = featured[index % featured.length];
    const date = new Date('2026-11-05T12:00:00.000Z');
    date.setUTCDate(date.getUTCDate() - Math.floor(index / 2));
    date.setUTCMinutes(59 - index % 2);
    const cycle = Math.floor(index / featured.length);
    return {
      id: `client-${index + 1}`, name, role, company,
      email: cycle ? email.replace('@', `.${cycle + 1}@`) : email,
      status: status as Status, createdAt: date.toISOString(),
    };
  });
}

export function filterAndSortClients(clients: Client[], filters: {
  query: string; status: string; company?: string; sortState: TableSortState;
}) {
  const terms = filters.query.trim().toLocaleLowerCase('ru').split(/\s+/).filter(Boolean);
  return clients.filter((c) => {
    const text = `${c.name} ${c.role} ${c.company} ${c.email}`.toLocaleLowerCase('ru');
    return terms.every((term) => text.includes(term)) &&
      (filters.status === 'all' || c.status === filters.status) &&
      (!filters.company || c.company === filters.company);
  }).sort((a, b) => {
    for (const sort of filters.sortState) {
      const key = sort.column as keyof Client;
      const first = key === 'status' ? statusLabels[a.status] : a[key];
      const second = key === 'status' ? statusLabels[b.status] : b[key];
      const difference = first.localeCompare(second, 'ru', {numeric: true});
      if (difference) return sort.order === 'asc' ? difference : -difference;
    }
    return 0;
  });
}
