export type Status = 'active' | 'new' | 'inactive';
export type Customer = {id: string; name: string; email: string; company: string; status: Status; revenue: number; date: string; tone: string};
export const statuses: Record<Status, string> = {active: 'Активный', new: 'Новый', inactive: 'Неактивный'};
const people = [
 ['Анна Смирнова', 'anna.smirnova', 'Яндекс', 'active', 248500, 'utility'],
 ['Михаил Иванов', 'm.ivanov', 'Т-Банк', 'active', 186000, 'info'],
 ['Екатерина Петрова', 'e.petrova', 'Авито', 'new', 72000, 'positive'],
 ['Александр Козлов', 'a.kozlov', 'Ozon', 'active', 315800, 'warning'],
 ['Мария Соколова', 'm.sokolova', 'Сбер', 'inactive', 94500, 'danger'],
 ['Дмитрий Волков', 'd.volkov', 'VK', 'active', 164200, 'info'],
 ['Ольга Новикова', 'o.novikova', 'Альфа-Банк', 'new', 58000, 'utility'],
 ['Артём Морозов', 'a.morozov', 'Самокат', 'active', 207400, 'positive'],
 ['Софья Лебедева', 's.lebedeva', 'МТС', 'active', 132000, 'warning'],
 ['Илья Васильев', 'i.vasilev', 'Точка', 'inactive', 81500, 'info'],
 ['Полина Павлова', 'p.pavlova', 'Ламода', 'active', 229000, 'danger'],
 ['Максим Орлов', 'm.orlov', 'Додо', 'active', 179600, 'utility'],
 ['Алиса Белова', 'a.belova', 'Контур', 'new', 44500, 'positive'],
 ['Роман Фёдоров', 'r.fedorov', 'Ростелеком', 'active', 325000, 'info'],
 ['Виктория Алексеева', 'v.alekseeva', 'Магнит', 'active', 248000, 'warning'],
 ['Никита Егоров', 'n.egorov', 'Спортмастер', 'inactive', 67500, 'utility'],
] as const;
export const initialCustomers: Customer[] = Array.from({length: 48}, (_, i) => {
 const [name, email, company, status, revenue, tone] = people[i % people.length];
 const batch = Math.floor(i / people.length);
 return {id: `client-${i + 1}`, name, email: `${email}${batch ? batch + 1 : ''}@${['gmail.com', 'mail.ru', 'yandex.ru'][i % 3]}`, company, status, revenue: revenue + batch * 16700, date: `2026-${batch === 0 ? '11' : batch === 1 ? '10' : '09'}-${String(5 - i % 5).padStart(2, '0')}`, tone};
});
export type Sort = {column: string; order: 'asc' | 'desc'};
export function findCustomers(data: Customer[], query: string, status: string, company: string, sorting: Sort[]) {
 const search = query.trim().toLocaleLowerCase('ru');
 const filtered = data.filter(c => (!status || c.status === status) && (!company || c.company === company) && (!search || `${c.name} ${c.email} ${c.company}`.toLocaleLowerCase('ru').includes(search)));
 return filtered.sort((a, b) => {
  for (const sort of sorting) {
   const key = sort.column as keyof Customer;
   const av = key === 'status' ? statuses[a.status] : a[key];
   const bv = key === 'status' ? statuses[b.status] : b[key];
   const result = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv), 'ru');
   if (result) return sort.order === 'asc' ? result : -result;
  }
  return 0;
 });
}
export function toCsv(rows: Customer[]) {
 const escape = (v: string | number) => `"${String(v).replaceAll('"', '""')}"`;
 return '\uFEFF' + [['Имя', 'Email', 'Компания', 'Статус', 'Выручка, ₽', 'Дата добавления'], ...rows.map(c => [c.name, c.email, c.company, statuses[c.status], c.revenue, c.date])].map(row => row.map(escape).join(';')).join('\r\n');
}
