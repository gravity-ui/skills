import { useMemo, useState } from 'react';
import './App.css';

type Person = {
  id: number;
  name: string;
  email: string;
  initials: string;
  color: string;
  role: string;
  team: string;
  status: 'Активен' | 'Приглашён' | 'Неактивен';
  date: string;
  timestamp: number;
};

const people: Person[] = [
  { id: 1, name: 'Анна Смирнова', email: 'anna.smirnova@company.ru', initials: 'АС', color: 'lavender', role: 'Дизайнер', team: 'Продукт', status: 'Активен', date: '24 окт. 2024', timestamp: 1729771200 },
  { id: 2, name: 'Михаил Волков', email: 'm.volkov@company.ru', initials: 'МВ', color: 'mint', role: 'Разработчик', team: 'Инженерия', status: 'Активен', date: '21 окт. 2024', timestamp: 1729512000 },
  { id: 3, name: 'Екатерина Петрова', email: 'e.petrova@company.ru', initials: 'ЕП', color: 'peach', role: 'Менеджер', team: 'Маркетинг', status: 'Приглашён', date: '18 окт. 2024', timestamp: 1729252800 },
  { id: 4, name: 'Дмитрий Козлов', email: 'd.kozlov@company.ru', initials: 'ДК', color: 'sky', role: 'Аналитик', team: 'Финансы', status: 'Активен', date: '15 окт. 2024', timestamp: 1728993600 },
  { id: 5, name: 'Ольга Новикова', email: 'o.novikova@company.ru', initials: 'ОН', color: 'rose', role: 'Дизайнер', team: 'Продукт', status: 'Неактивен', date: '12 окт. 2024', timestamp: 1728734400 },
  { id: 6, name: 'Артём Соколов', email: 'a.sokolov@company.ru', initials: 'АС', color: 'amber', role: 'Разработчик', team: 'Инженерия', status: 'Активен', date: '10 окт. 2024', timestamp: 1728561600 },
  { id: 7, name: 'Мария Фёдорова', email: 'm.fedorova@company.ru', initials: 'МФ', color: 'mint', role: 'Менеджер', team: 'Продажи', status: 'Активен', date: '08 окт. 2024', timestamp: 1728388800 },
  { id: 8, name: 'Илья Морозов', email: 'i.morozov@company.ru', initials: 'ИМ', color: 'sky', role: 'Разработчик', team: 'Инженерия', status: 'Приглашён', date: '04 окт. 2024', timestamp: 1728043200 },
  { id: 9, name: 'София Лебедева', email: 's.lebedeva@company.ru', initials: 'СЛ', color: 'lavender', role: 'Аналитик', team: 'Финансы', status: 'Активен', date: '02 окт. 2024', timestamp: 1727870400 },
  { id: 10, name: 'Кирилл Павлов', email: 'k.pavlov@company.ru', initials: 'КП', color: 'peach', role: 'Дизайнер', team: 'Продукт', status: 'Неактивен', date: '28 сент. 2024', timestamp: 1727524800 },
  { id: 11, name: 'Виктория Орлова', email: 'v.orlova@company.ru', initials: 'ВО', color: 'rose', role: 'Менеджер', team: 'Маркетинг', status: 'Активен', date: '24 сент. 2024', timestamp: 1727179200 },
  { id: 12, name: 'Павел Егоров', email: 'p.egorov@company.ru', initials: 'ПЕ', color: 'amber', role: 'Разработчик', team: 'Инженерия', status: 'Активен', date: '19 сент. 2024', timestamp: 1726747200 },
];

type SortKey = 'name' | 'role' | 'team' | 'status' | 'timestamp';

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true as const };
  if (name === 'grid') return <svg {...common}><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></svg>;
  if (name === 'users') return <svg {...common}><path d="M16 20v-1.6a3.4 3.4 0 0 0-3.4-3.4H7.4A3.4 3.4 0 0 0 4 18.4V20"/><circle cx="10" cy="7.5" r="3.5"/><path d="M20 20v-1.6a3.4 3.4 0 0 0-2.5-3.28M16 4.2a3.5 3.5 0 0 1 0 6.6"/></svg>;
  if (name === 'folder') return <svg {...common}><path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h5l2 2h8A1.5 1.5 0 0 1 21 9.5v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z"/><path d="M3.5 10h17"/></svg>;
  if (name === 'chart') return <svg {...common}><path d="M4 19V5M4 19h17"/><path d="m7 15 4-4 3 2 6-7"/><path d="M16 6h4v4"/></svg>;
  if (name === 'settings') return <svg {...common}><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1a1.7 1.7 0 0 1-2.4 2.4l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a1.7 1.7 0 0 1-3.4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a1.7 1.7 0 1 1-2.4-2.4l.1-.1a1.7 1.7 0 0 0-1.2-2.9H4a1.7 1.7 0 1 1 0-3.4h.2a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a1.7 1.7 0 1 1 2.4-2.4l.1.1a1.7 1.7 0 0 0 2.9-1.2V4a1.7 1.7 0 1 1 3.4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a1.7 1.7 0 1 1 2.4 2.4l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a1.7 1.7 0 1 1 0 3.4h-.2a1.7 1.7 0 0 0-1.2.9Z"/></svg>;
  if (name === 'search') return <svg {...common}><circle cx="10.8" cy="10.8" r="6.3"/><path d="m16 16 4 4"/></svg>;
  if (name === 'chevron') return <svg {...common}><path d="m7 10 5 5 5-5"/></svg>;
  if (name === 'left') return <svg {...common}><path d="m14.5 18-6-6 6-6"/></svg>;
  if (name === 'right') return <svg {...common}><path d="m9.5 18 6-6-6-6"/></svg>;
  if (name === 'plus') return <svg {...common}><path d="M12 5v14M5 12h14"/></svg>;
  if (name === 'download') return <svg {...common}><path d="M12 3v12m-5-5 5 5 5-5"/><path d="M5 17v3h14v-3"/></svg>;
  if (name === 'sort') return <svg {...common}><path d="M8 5v14m0 0-3-3m3 3 3-3M16 19V5m0 0-3 3m3-3 3 3"/></svg>;
  return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 8v4l2.5 1.5"/></svg>;
}

export function App() {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [ascending, setAscending] = useState(true);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [query, setQuery] = useState('');
  const pageSize = 6;

  const filtered = useMemo(() => people.filter((person) => `${person.name} ${person.email} ${person.role} ${person.team}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    const first = a[sortKey];
    const second = b[sortKey];
    const result = typeof first === 'number' && typeof second === 'number' ? first - second : String(first).localeCompare(String(second), 'ru');
    return ascending ? result : -result;
  }), [filtered, sortKey, ascending]);
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const rows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const pageSelected = rows.length > 0 && rows.every((row) => selected.includes(row.id));
  const activeCount = people.filter((person) => person.status === 'Активен').length;
  const invitedCount = people.filter((person) => person.status === 'Приглашён').length;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setAscending(!ascending);
    else { setSortKey(key); setAscending(true); }
  };
  const toggleRow = (id: number) => setSelected((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  const togglePage = () => setSelected((items) => pageSelected ? items.filter((id) => !rows.some((row) => row.id === id)) : [...new Set([...items, ...rows.map((row) => row.id)])]);
  const changeQuery = (value: string) => { setQuery(value); setPage(1); };
  const sortButton = (label: string, key: SortKey) => <button className="sort-button" onClick={() => toggleSort(key)}>{label}<span className={`sort-icon ${sortKey === key ? 'is-active' : ''}`}>{sortKey === key ? (ascending ? '↑' : '↓') : <Icon name="sort" size={14} />}</span></button>;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><span /><span /><span /><span /></div><span>orbit<span className="brand-dot">.</span></span></div>
        <div className="workspace-switch"><div className="workspace-avatar">N</div><div className="workspace-copy"><strong>Northstar Studio</strong><span>Рабочее пространство</span></div><Icon name="chevron" size={16} /></div>
        <div className="nav-label">РАБОЧЕЕ</div>
        <nav className="navigation" aria-label="Основная навигация">
          <a href="#overview"><Icon name="grid" />Обзор</a>
          <a href="#projects"><Icon name="folder" />Проекты<span className="nav-count">4</span></a>
          <a className="active" href="#team"><Icon name="users" />Команда</a>
          <a href="#reports"><Icon name="chart" />Отчёты</a>
        </nav>
        <div className="sidebar-bottom"><a href="#settings"><Icon name="settings" />Настройки</a><div className="user-card"><div className="user-avatar">ИП</div><div className="user-copy"><strong>Ирина Павлова</strong><span>Администратор</span></div><button className="more-button" aria-label="Дополнительные действия">···</button></div></div>
      </aside>

      <main className="main-area">
        <header className="topbar"><div className="breadcrumbs"><span>Рабочее пространство</span><b>/</b><strong>Команда</strong></div><div className="topbar-right"><span className="topbar-date"><Icon name="clock" size={15} />Последнее обновление 2 мин. назад</span><button className="help-button" aria-label="Справка">?</button><div className="top-avatar">ИП</div></div></header>
        <div className="page-content">
          <div className="page-heading"><div><div className="eyebrow">УПРАВЛЕНИЕ</div><h1>Команда</h1><p>Управляйте участниками и их доступом к рабочему пространству.</p></div><button className="primary-button"><Icon name="plus" size={17} />Пригласить участника</button></div>

          <section className="summary-grid" aria-label="Сводка команды">
            <div className="summary-card"><div className="summary-label">Всего участников<span className="summary-icon people-icon"><Icon name="users" size={17} /></span></div><div className="summary-value">{people.length} <span className="summary-change">участников</span></div><div className="summary-foot"><span className="mini-bar"><i style={{ height: '42%' }} /><i style={{ height: '60%' }} /><i style={{ height: '48%' }} /><i style={{ height: '76%' }} /><i style={{ height: '58%' }} /><i style={{ height: '88%' }} /><i style={{ height: '100%' }} /></span><span>Состав команды</span></div></div>
            <div className="summary-card"><div className="summary-label">Активные<span className="summary-icon active-icon"><span /></span></div><div className="summary-value">{activeCount} <span className="summary-muted">из {people.length} участников</span></div><div className="progress-track"><span style={{ width: `${Math.round((activeCount / people.length) * 100)}%` }} /></div><div className="progress-caption">{Math.round((activeCount / people.length) * 100)}% команды активно</div></div>
            <div className="summary-card"><div className="summary-label">Ожидают приглашения<span className="summary-icon invite-icon"><Icon name="clock" size={17} /></span></div><div className="summary-value">{invitedCount} <span className="summary-muted">приглашения</span></div><div className="summary-foot"><span className="summary-link">Ожидают ответа</span><span>·</span><span>можно отправить повторно</span></div></div>
          </section>

          <section className="table-card" aria-label="Список участников команды">
            <div className="table-top"><div className="table-title"><h2>Все участники</h2><span className="count-pill">{filtered.length}</span></div><div className="table-actions">{selected.length > 0 && <span className="selected-hint">Выбрано: {selected.length}</span>}<label className="search-field"><Icon name="search" size={17} /><input value={query} onChange={(event) => changeQuery(event.target.value)} placeholder="Поиск участника" aria-label="Поиск участника" />{query && <button onClick={() => changeQuery('')} aria-label="Очистить поиск">×</button>}<kbd>⌘ K</kbd></label><button className="secondary-button" onClick={() => {}}><Icon name="download" size={16} />Экспорт</button></div></div>
            <div className="table-scroll"><table><thead><tr><th className="check-col"><input className="checkbox" type="checkbox" checked={pageSelected} onChange={togglePage} aria-label="Выбрать участников на странице" /></th><th>{sortButton('Участник', 'name')}</th><th>{sortButton('Роль', 'role')}</th><th>{sortButton('Команда', 'team')}</th><th>{sortButton('Статус', 'status')}</th><th>{sortButton('Дата добавления', 'timestamp')}</th><th className="row-menu-col"></th></tr></thead>
              <tbody>{rows.map((person) => <tr key={person.id} className={selected.includes(person.id) ? 'selected-row' : ''}><td className="check-col"><input className="checkbox" type="checkbox" checked={selected.includes(person.id)} onChange={() => toggleRow(person.id)} aria-label={`Выбрать ${person.name}`} /></td><td><div className="person-cell"><div className={`person-avatar ${person.color}`}>{person.initials}</div><div className="person-info"><strong>{person.name}</strong><span>{person.email}</span></div></div></td><td className="role-cell">{person.role}</td><td><span className="team-label"><span />{person.team}</span></td><td><span className={`status-badge ${person.status === 'Активен' ? 'status-active' : person.status === 'Приглашён' ? 'status-invited' : 'status-inactive'}`}><i />{person.status}</span></td><td className="date-cell">{person.date}</td><td className="row-menu-col"><button className="more-button row-more" aria-label={`Действия для ${person.name}`}>···</button></td></tr>)}</tbody>
            </table>{rows.length === 0 && <div className="empty-state"><div className="empty-icon"><Icon name="search" size={21} /></div><strong>Ничего не найдено</strong><span>Попробуйте изменить поисковый запрос.</span></div>}</div>
            <div className="table-footer"><span className="showing">Показано <strong>{sorted.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, sorted.length)}</strong> из <strong>{sorted.length}</strong> участников</span><div className="pagination"><button className="page-arrow" onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} aria-label="Предыдущая страница"><Icon name="left" size={17} /></button>{Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => <button className={`page-number ${currentPage === number ? 'current' : ''}`} key={number} onClick={() => setPage(number)} aria-current={currentPage === number ? 'page' : undefined}>{number}</button>)}<button className="page-arrow" onClick={() => setPage(Math.min(pageCount, currentPage + 1))} disabled={currentPage === pageCount} aria-label="Следующая страница"><Icon name="right" size={17} /></button></div></div>
          </section>
          <div className="bottom-note"><span className="lock-dot">✓</span>Данные участников видны только администраторам рабочего пространства.<a href="#privacy">Подробнее</a></div>
        </div>
      </main>
    </div>
  );
}
