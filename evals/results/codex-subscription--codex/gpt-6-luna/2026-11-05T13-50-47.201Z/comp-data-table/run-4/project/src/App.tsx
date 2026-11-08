import { useMemo, useState } from 'react';
import './app.css';

type Employee = {
  id: number;
  name: string;
  initials: string;
  color: string;
  email: string;
  role: string;
  department: string;
  status: 'Активен' | 'В отпуске' | 'Неактивен';
  startDate: string;
  salary: number;
};

type SortKey = 'name' | 'role' | 'department' | 'status' | 'startDate' | 'salary';

const employees: Employee[] = [
  { id: 1, name: 'Александр Смирнов', initials: 'АС', color: 'lavender', email: 'a.smirnov@northstar.ru', role: 'Руководитель продукта', department: 'Продукт', status: 'Активен', startDate: '2021-03-15', salary: 245000 },
  { id: 2, name: 'Мария Кузнецова', initials: 'МК', color: 'peach', email: 'm.kuznetsova@northstar.ru', role: 'Дизайнер интерфейсов', department: 'Дизайн', status: 'Активен', startDate: '2022-06-01', salary: 185000 },
  { id: 3, name: 'Дмитрий Волков', initials: 'ДВ', color: 'mint', email: 'd.volkov@northstar.ru', role: 'Frontend-разработчик', department: 'Разработка', status: 'В отпуске', startDate: '2020-11-23', salary: 220000 },
  { id: 4, name: 'Анна Морозова', initials: 'АМ', color: 'blue', email: 'a.morozova@northstar.ru', role: 'Менеджер проектов', department: 'Операции', status: 'Активен', startDate: '2023-02-06', salary: 170000 },
  { id: 5, name: 'Илья Петров', initials: 'ИП', color: 'rose', email: 'i.petrov@northstar.ru', role: 'Backend-разработчик', department: 'Разработка', status: 'Активен', startDate: '2021-09-13', salary: 230000 },
  { id: 6, name: 'Екатерина Соколова', initials: 'ЕС', color: 'yellow', email: 'e.sokolova@northstar.ru', role: 'Специалист по маркетингу', department: 'Маркетинг', status: 'Неактивен', startDate: '2019-05-20', salary: 155000 },
  { id: 7, name: 'Никита Орлов', initials: 'НО', color: 'mint', email: 'n.orlov@northstar.ru', role: 'Аналитик данных', department: 'Аналитика', status: 'Активен', startDate: '2022-10-10', salary: 195000 },
  { id: 8, name: 'Ольга Васильева', initials: 'ОВ', color: 'peach', email: 'o.vasilyeva@northstar.ru', role: 'HR-партнёр', department: 'Люди', status: 'Активен', startDate: '2020-01-27', salary: 165000 },
  { id: 9, name: 'Сергей Фёдоров', initials: 'СФ', color: 'blue', email: 's.fedorov@northstar.ru', role: 'QA-инженер', department: 'Разработка', status: 'В отпуске', startDate: '2023-08-14', salary: 160000 },
  { id: 10, name: 'Полина Николаева', initials: 'ПН', color: 'rose', email: 'p.nikolaeva@northstar.ru', role: 'Контент-менеджер', department: 'Маркетинг', status: 'Активен', startDate: '2022-01-17', salary: 145000 },
  { id: 11, name: 'Максим Павлов', initials: 'МП', color: 'lavender', email: 'm.pavlov@northstar.ru', role: 'Системный администратор', department: 'ИТ', status: 'Активен', startDate: '2018-07-02', salary: 180000 },
  { id: 12, name: 'Виктория Белова', initials: 'ВБ', color: 'yellow', email: 'v.belova@northstar.ru', role: 'Финансовый аналитик', department: 'Финансы', status: 'Неактивен', startDate: '2021-12-06', salary: 190000 },
  { id: 13, name: 'Роман Захаров', initials: 'РЗ', color: 'peach', email: 'r.zakharov@northstar.ru', role: 'Мобильный разработчик', department: 'Разработка', status: 'Активен', startDate: '2024-01-15', salary: 215000 },
  { id: 14, name: 'София Андреева', initials: 'СА', color: 'mint', email: 's.andreeva@northstar.ru', role: 'Исследователь UX', department: 'Дизайн', status: 'Активен', startDate: '2023-04-24', salary: 175000 },
  { id: 15, name: 'Тимур Егоров', initials: 'ТЕ', color: 'blue', email: 't.egorov@northstar.ru', role: 'Технический писатель', department: 'Продукт', status: 'Активен', startDate: '2020-04-06', salary: 150000 },
  { id: 16, name: 'Дарья Михайлова', initials: 'ДМ', color: 'rose', email: 'd.mikhailova@northstar.ru', role: 'Рекрутер', department: 'Люди', status: 'В отпуске', startDate: '2022-08-29', salary: 140000 },
  { id: 17, name: 'Кирилл Семёнов', initials: 'КС', color: 'yellow', email: 'k.semenov@northstar.ru', role: 'DevOps-инженер', department: 'ИТ', status: 'Активен', startDate: '2019-11-11', salary: 225000 },
  { id: 18, name: 'Алина Григорьева', initials: 'АГ', color: 'lavender', email: 'a.grigorieva@northstar.ru', role: 'Бизнес-аналитик', department: 'Аналитика', status: 'Активен', startDate: '2024-03-04', salary: 185000 },
];

const pageSize = 7;
const formatDate = (date: string) => new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${date}T00:00:00`));
const formatSalary = (salary: number) => new Intl.NumberFormat('ru-RU').format(salary) + ' ₽';

export function App() {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);

  const sortedEmployees = useMemo(() => [...employees].sort((a, b) => {
    const first = a[sortKey];
    const second = b[sortKey];
    const result = typeof first === 'number' && typeof second === 'number'
      ? first - second
      : String(first).localeCompare(String(second), 'ru');
    return sortDirection === 'asc' ? result : -result;
  }), [sortKey, sortDirection]);

  const pageCount = Math.ceil(sortedEmployees.length / pageSize);
  const pageEmployees = sortedEmployees.slice((page - 1) * pageSize, page * pageSize);
  const allOnPageSelected = pageEmployees.every((employee) => selected.includes(employee.id));
  const firstItem = (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, employees.length);

  const changeSort = (key: SortKey) => {
    if (key === sortKey) setSortDirection((direction) => direction === 'asc' ? 'desc' : 'asc');
    else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const toggleRow = (id: number) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const togglePage = () => setSelected((current) => allOnPageSelected
    ? current.filter((id) => !pageEmployees.some((employee) => employee.id === id))
    : [...new Set([...current, ...pageEmployees.map((employee) => employee.id)])]);

  const sortButton = (key: SortKey, label: string, align?: string) => (
    <th className={align ? `align-${align}` : ''} aria-sort={sortKey === key ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button className="sort-button" onClick={() => changeSort(key)}>
        {label}<span className={`sort-indicator ${sortKey === key ? 'is-active' : ''}`}>{sortKey === key ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}</span>
      </button>
    </th>
  );

  return (
    <main className="workspace">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">n</span><span>northstar</span></div>
        <div className="workspace-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
        <nav className="nav-list" aria-label="Основная навигация">
          <a className="nav-item" href="#overview"><span className="nav-icon">◫</span>Обзор</a>
          <a className="nav-item" href="#projects"><span className="nav-icon">▦</span>Проекты</a>
          <a className="nav-item active" href="#team" aria-current="page"><span className="nav-icon">♧</span>Команда<span className="nav-chevron">⌄</span></a>
          <a className="nav-subitem selected" href="#employees">Сотрудники</a>
          <a className="nav-subitem" href="#departments">Отделы</a>
          <a className="nav-item" href="#reports"><span className="nav-icon">▤</span>Отчёты</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><span className="help-spark">✳</span><strong>Нужна помощь?</strong><span>Загляните в центр поддержки</span><a href="#help">Открыть справку <span>↗</span></a></div>
          <div className="profile"><div className="profile-avatar">ЕП</div><div className="profile-info"><strong>Елена Петрова</strong><span>Администратор</span></div><span className="profile-menu">···</span></div>
        </div>
      </aside>

      <section className="main-content">
        <header className="topbar"><div className="breadcrumbs">Команда <span>/</span> <strong>Сотрудники</strong></div><div className="topbar-actions"><button className="icon-button" aria-label="Уведомления">♧<i /></button><div className="topbar-divider" /><span className="topbar-avatar">ЕП</span></div></header>
        <div className="content-wrap">
          <div className="page-heading">
            <div><div className="eyebrow">КОМАНДА</div><h1>Сотрудники</h1><p>Управляйте сотрудниками и следите за составом команды.</p></div>
            <div className="heading-note"><span className="online-dot" />Команда растёт</div>
          </div>

          <div className="stats-row" aria-label="Сводка по сотрудникам">
            <div className="stat-card"><div className="stat-top"><span>Всего сотрудников</span><span className="stat-icon purple">♧</span></div><div className="stat-number">{employees.length}<span className="stat-unit">человек</span></div><div className="stat-foot"><span className="trend">↗ 12%</span> за последние 6 месяцев</div></div>
            <div className="stat-card"><div className="stat-top"><span>Активны сейчас</span><span className="stat-icon green">●</span></div><div className="stat-number">{employees.filter((employee) => employee.status === 'Активен').length}<span className="stat-unit">человек</span></div><div className="stat-foot"><span className="status-dot" />Все отделы работают</div></div>
            <div className="stat-card"><div className="stat-top"><span>Отделы</span><span className="stat-icon orange">▦</span></div><div className="stat-number">{new Set(employees.map((employee) => employee.department)).size}<span className="stat-unit">направлений</span></div><div className="stat-foot">Больше всего — в разработке</div></div>
          </div>

          <section className="table-card" aria-label="Список сотрудников">
            <div className="table-toolbar"><div><h2>Все сотрудники <span className="count-pill">{employees.length}</span></h2><p>Список всех участников команды</p></div><div className="toolbar-right"><span className="table-updated"><i />Данные актуальны</span></div></div>
            {selected.length > 0 && <div className="selection-bar"><span>Выбрано: <strong>{selected.length}</strong></span><button onClick={() => setSelected([])}>Снять выделение</button></div>}
            <div className="table-scroll"><table>
              <thead><tr>
                <th className="check-cell"><input type="checkbox" aria-label="Выбрать все строки на странице" checked={allOnPageSelected} onChange={togglePage} /></th>
                {sortButton('name', 'Сотрудник')}{sortButton('role', 'Должность')}{sortButton('department', 'Отдел')}{sortButton('status', 'Статус')}{sortButton('startDate', 'Дата приёма')}{sortButton('salary', 'Зарплата', 'right')}
              </tr></thead>
              <tbody>{pageEmployees.map((employee) => <tr key={employee.id} className={selected.includes(employee.id) ? 'row-selected' : ''}>
                <td className="check-cell"><input type="checkbox" aria-label={`Выбрать ${employee.name}`} checked={selected.includes(employee.id)} onChange={() => toggleRow(employee.id)} /></td>
                <td><div className="person-cell"><div className={`avatar ${employee.color}`}>{employee.initials}</div><div className="person-copy"><strong>{employee.name}</strong><span>{employee.email}</span></div></div></td>
                <td className="muted-cell">{employee.role}</td><td><span className="department-chip">{employee.department}</span></td>
                <td><span className={`status-pill ${employee.status === 'Активен' ? 'status-active' : employee.status === 'В отпуске' ? 'status-away' : 'status-inactive'}`}><i />{employee.status}</span></td>
                <td className="muted-cell date-cell">{formatDate(employee.startDate)}</td><td className="salary-cell">{formatSalary(employee.salary)}</td>
              </tr>)}</tbody>
            </table></div>
            <footer className="table-footer"><span className="range-label">Показано <strong>{firstItem}–{lastItem}</strong> из <strong>{employees.length}</strong> сотрудников</span><div className="pagination"><button className="page-arrow" aria-label="Предыдущая страница" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>‹</button>{Array.from({ length: pageCount }, (_, index) => <button key={index + 1} className={`page-number ${page === index + 1 ? 'current' : ''}`} aria-current={page === index + 1 ? 'page' : undefined} onClick={() => setPage(index + 1)}>{index + 1}</button>)}<button className="page-arrow" aria-label="Следующая страница" disabled={page === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>›</button></div></footer>
          </section>
          <div className="page-footnote"><span>✦</span>Данные обновлены сегодня в 09:41</div>
        </div>
      </section>
    </main>
  );
}
