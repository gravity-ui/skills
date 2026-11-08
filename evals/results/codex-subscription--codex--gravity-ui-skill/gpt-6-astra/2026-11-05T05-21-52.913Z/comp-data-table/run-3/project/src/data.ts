export type Employee = {id: string; name: string; email: string; role: string; department: string; status: string; date: string; color: number};
const people = [
 ['Анна Смирнова','anna.smirnova','Product Designer','Дизайн'],
 ['Александр Петров','alex.petrov','Frontend Developer','Разработка'],
 ['Мария Иванова','maria.ivanova','Marketing Manager','Маркетинг'],
 ['Дмитрий Козлов','dmitry.kozlov','Backend Developer','Разработка'],
 ['Екатерина Новикова','kate.novikova','HR Manager','HR'],
 ['Михаил Соколов','mikhail.sokolov','Product Manager','Продукт'],
 ['Ольга Волкова','olga.volkova','UX Researcher','Дизайн'],
 ['Андрей Морозов','andrey.morozov','DevOps Engineer','Разработка'],
 ['Елена Лебедева','elena.lebedeva','Content Manager','Маркетинг'],
 ['Сергей Васильев','sergey.vasiliev','Data Analyst','Аналитика'],
 ['Анастасия Павлова','anastasia.pavlova','UI Designer','Дизайн'],
 ['Иван Семёнов','ivan.semenov','QA Engineer','Разработка'],
 ['Дарья Голубева','daria.golubeva','Brand Manager','Маркетинг'],
 ['Никита Виноградов','nikita.vinogradov','Frontend Developer','Разработка'],
 ['Полина Богданова','polina.bogdanova','HR Specialist','HR'],
 ['Артём Фёдоров','artem.fedorov','Product Manager','Продукт'],
 ['София Михайлова','sofia.mikhailova','UX Designer','Дизайн'],
 ['Максим Беляев','maxim.belyaev','Backend Developer','Разработка'],
 ['Виктория Тарасова','victoria.tarasova','SEO Specialist','Маркетинг'],
 ['Денис Комаров','denis.komarov','Data Engineer','Аналитика'],
 ['Алиса Орлова','alisa.orlova','Product Designer','Дизайн'],
 ['Павел Киселёв','pavel.kiselev','Tech Lead','Разработка'],
 ['Вероника Макарова','veronika.makarova','Copywriter','Маркетинг'],
 ['Роман Андреев','roman.andreev','QA Engineer','Разработка'],
 ['Ксения Никитина','ksenia.nikitina','Recruiter','HR'],
 ['Владимир Захаров','vladimir.zakharov','Product Owner','Продукт'],
 ['Валерия Зайцева','valeria.zaytseva','Graphic Designer','Дизайн'],
 ['Глеб Борисов','gleb.borisov','Mobile Developer','Разработка'],
 ['Юлия Яковлева','julia.yakovleva','SMM Manager','Маркетинг'],
 ['Тимур Григорьев','timur.grigoriev','Data Analyst','Аналитика'],
 ['Надежда Романова','nadezhda.romanova','UX Researcher','Дизайн'],
 ['Олег Воробьёв','oleg.vorobiev','Backend Developer','Разработка'],
 ['Арина Сергеева','arina.sergeeva','Marketing Analyst','Маркетинг'],
 ['Вадим Кузнецов','vadim.kuznetsov','Frontend Developer','Разработка'],
 ['Татьяна Фролова','tatiana.frolova','HR Partner','HR'],
 ['Егор Алексеев','egor.alekseev','Product Manager','Продукт'],
 ['Вера Дмитриева','vera.dmitrieva','UI Designer','Дизайн'],
 ['Леонид Егоров','leonid.egorov','DevOps Engineer','Разработка'],
 ['Нина Степанова','nina.stepanova','PR Manager','Маркетинг'],
 ['Георгий Белов','georgy.belov','Data Scientist','Аналитика'],
 ['Лилия Медведева','lilia.medvedeva','Product Designer','Дизайн'],
 ['Виталий Антонов','vitaly.antonov','QA Lead','Разработка'],
 ['Диана Титова','diana.titova','Content Strategist','Маркетинг'],
 ['Руслан Осипов','ruslan.osipov','Frontend Developer','Разработка'],
 ['Евгения Миронова','evgenia.mironova','Recruiter','HR'],
 ['Константин Давыдов','konstantin.davydov','Product Analyst','Продукт'],
 ['Светлана Гусева','svetlana.guseva','UX Designer','Дизайн'],
 ['Борис Филиппов','boris.filippov','Backend Developer','Разработка'],
];
export const initialEmployees: Employee[] = people.map(([name, email, role, department], i) => ({id: `emp-${i + 1}`, name, email: `${email}@acme.team`, role, department, status: [2, 8, 15, 24, 36].includes(i) ? 'В отпуске' : [6, 21, 43].includes(i) ? 'Неактивен' : 'Активен', date: `202${i % 3 + 2}-${String(i % 12 + 1).padStart(2, '0')}-${String(i % 26 + 1).padStart(2, '0')}`, color: i % 6}));
export const departments = ['Дизайн', 'Разработка', 'Маркетинг', 'HR', 'Продукт', 'Аналитика'];
export const statuses = ['Активен', 'В отпуске', 'Неактивен'];
export function filterAndSort(data: Employee[], query: string, department: string, status: string, sort: {column: string; order: 'asc' | 'desc'}[]) {
 const filtered = data.filter(e => (!department || e.department === department) && (!status || e.status === status) && `${e.name} ${e.email} ${e.role}`.toLocaleLowerCase('ru').includes(query.trim().toLocaleLowerCase('ru')));
 return filtered.sort((a,b) => {for (const {column, order} of sort) {const result = String(a[column as keyof Employee]).localeCompare(String(b[column as keyof Employee]), 'ru', {numeric: true}); if (result) return order === 'asc' ? result : -result;} return 0;});
}
export function csvContent(data: Employee[]) {
 const escape = (value: string) => `"${(/^[=+@\-\t\r]/.test(value) ? "'" : '') + value.replaceAll('"', '""')}"`;
 return '\uFEFF' + [['Имя','Email','Должность','Отдел','Статус','Дата добавления'], ...data.map(e=>[e.name,e.email,e.role,e.department,e.status,e.date])].map(row=>row.map(escape).join(';')).join('\r\n');
}
