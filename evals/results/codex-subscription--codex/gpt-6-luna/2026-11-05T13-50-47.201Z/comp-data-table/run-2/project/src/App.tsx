import { useMemo, useState } from 'react';
import './App.css';

type Customer = {
  id: number;
  name: string;
  email: string;
  company: string;
  status: 'Активен' | 'На паузе' | 'Новый';
  amount: number;
  date: string;
  initials: string;
  color: string;
};

type SortKey = 'name' | 'company' | 'status' | 'amount' | 'date';

const customers: Customer[] = [
  { id: 1, name: 'Анна Смирнова', email: 'anna.smirnova@mail.ru', company: 'Север студия', status: 'Активен', amount: 128400, date: '12 мая 2024', initials: 'АС', color: 'lilac' },
  { id: 2, name: 'Михаил Волков', email: 'm.volkov@bright.ru', company: 'Брайт Медиа', status: 'Активен', amount: 86400, date: '11 мая 2024', initials: 'МВ', color: 'peach' },
  { id: 3, name: 'Екатерина Белова', email: 'katya.belova@hey.com', company: 'Белый берег', status: 'На паузе', amount: 56200, date: '10 мая 2024', initials: 'ЕБ', color: 'mint' },
  { id: 4, name: 'Дмитрий Козлов', email: 'd.kozlov@forma.ru', company: 'Форма', status: 'Активен', amount: 214000, date: '9 мая 2024', initials: 'ДК', color: 'blue' },
  { id: 5, name: 'Ольга Новикова', email: 'olga.novikova@proton.me', company: 'Новая линия', status: 'Новый', amount: 32800, date: '8 мая 2024', initials: 'ОН', color: 'rose' },
  { id: 6, name: 'Артём Соколов', email: 'a.sokolov@list.ru', company: 'Точка роста', status: 'Активен', amount: 94700, date: '7 мая 2024', initials: 'АС', color: 'yellow' },
  { id: 7, name: 'Мария Фёдорова', email: 'm.fedorova@atlas.team', company: 'Атлас', status: 'Активен', amount: 176500, date: '6 мая 2024', initials: 'МФ', color: 'mint' },
  { id: 8, name: 'Илья Морозов', email: 'ilya.m@northstar.ru', company: 'Нордстар', status: 'На паузе', amount: 41900, date: '5 мая 2024', initials: 'ИМ', color: 'blue' },
  { id: 9, name: 'София Павлова', email: 's.pavlova@point.design', company: 'Пойнт Дизайн', status: 'Новый', amount: 72500, date: '4 мая 2024', initials: 'СП', color: 'peach' },
  { id: 10, name: 'Никита Орлов', email: 'n.orlov@levelup.ru', company: 'Левел ап', status: 'Активен', amount: 153200, date: '3 мая 2024', initials: 'НО', color: 'lilac' },
  { id: 11, name: 'Полина Васильева', email: 'polina.v@volna.co', company: 'Волна', status: 'Активен', amount: 68900, date: '2 мая 2024', initials: 'ПВ', color: 'rose' },
  { id: 12, name: 'Кирилл Егоров', email: 'k.egorov@craftwork.ru', company: 'Крафтворк', status: 'На паузе', amount: 105600, date: '1 мая 2024', initials: 'КЕ', color: 'yellow' },
];

const formatAmount = (amount: number) => new Intl.NumberFormat('ru-RU').format(amount) + ' ₽';

function SearchIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.8" cy="8.8" r="5.8" /><path d="m13.2 13.2 4 4" /></svg>;
}

function Chevron({ direction = 'down' }: { direction?: 'up' | 'down' | 'left' | 'right' }) {
  const paths = { down: 'm5 7 5 5 5-5', up: 'm5 13 5-5 5 5', left: 'm12 5-5 5 5 5', right: 'm8 5 5 5-5 5' };
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d={paths[direction]} /></svg>;
}

export function App() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Все клиенты');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selected, setSelected] = useState<number[]>([]);

  const filtered = useMemo(() => customers.filter((customer) => {
    const matchesQuery = `${customer.name} ${customer.email} ${customer.company}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (statusFilter === 'Все клиенты' || customer.status === statusFilter);
  }), [query, statusFilter]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    let comparison = 0;
    if (sortKey === 'amount') comparison = a.amount - b.amount;
    else if (sortKey === 'date') comparison = a.id - b.id;
    else comparison = a[sortKey].localeCompare(b[sortKey], 'ru');
    return sortDirection === 'asc' ? comparison : -comparison;
  }), [filtered, sortKey, sortDirection]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const visibleSelected = visible.length > 0 && visible.every((customer) => selected.includes(customer.id));

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDirection(key === 'date' ? 'desc' : 'asc'); }
  };

  const toggleCustomer = (id: number) => setSelected((current) => current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]);
  const togglePage = () => setSelected((current) => visibleSelected ? current.filter((id) => !visible.some((customer) => customer.id === id)) : [...new Set([...current, ...visible.map((customer) => customer.id)])]);

  const selectStatus = (value: string) => { setStatusFilter(value); setPage(1); };
  const changeQuery = (value: string) => { setQuery(value); setPage(1); };
  const changePageSize = (value: number) => { setPageSize(value); setPage(1); };
  const sortButton = (label: string, key: SortKey, className = '') => (
    <button type="button" className={`sort-button ${className}`} onClick={() => toggleSort(key)} aria-label={`Сортировать по полю «${label}»`}>
      {label}<span className={`sort-mark ${sortKey === key ? 'active' : ''}`}>{sortKey === key ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}</span>
    </button>
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home" aria-label="Лист — главная"><span className="brand-icon"><span /></span><span>лист<span className="brand-dot">.</span></span></a>
        <div className="workspace-switcher"><span className="workspace-avatar">N</span><span className="workspace-copy"><strong>Норд студия</strong><small>Рабочее пространство</small></span><Chevron /></div>
        <div className="nav-label">РАБОЧЕЕ</div>
        <nav className="main-nav" aria-label="Главная навигация">
          <a href="#overview"><span className="nav-icon grid-icon">▦</span>Обзор</a>
          <a href="#tasks"><span className="nav-icon">☷</span>Задачи<span className="nav-count">8</span></a>
          <a href="#projects"><span className="nav-icon">◫</span>Проекты</a>
          <a href="#calendar"><span className="nav-icon">▦</span>Календарь</a>
          <a className="active" href="#customers"><span className="nav-icon people-icon">♧</span>Клиенты</a>
        </nav>
        <div className="nav-label teams-label">КОМАНДА <button type="button" aria-label="Добавить команду">＋</button></div>
        <nav className="main-nav"><a href="#design"><span className="team-bullet purple" />Дизайн</a><a href="#development"><span className="team-bullet orange" />Разработка</a><a href="#marketing"><span className="team-bullet green" />Маркетинг</a></nav>
        <div className="sidebar-bottom"><div className="help-card"><div className="help-spark">✳</div><strong>Нужна помощь?</strong><span>Загляните в наш центр поддержки</span><a href="#help">Открыть справку <span>↗</span></a></div><button className="profile"><span className="profile-avatar">М</span><span><strong>Мария Кузнецова</strong><small>Администратор</small></span><span className="profile-more">···</span></button></div>
      </aside>

      <main className="main-area">
        <header className="topbar"><div className="breadcrumbs"><span>Норд студия</span><Chevron direction="right" /><strong>Клиенты</strong></div><div className="top-actions"><button className="icon-button notification" aria-label="Уведомления"><span>♧</span><i /></button><span className="top-divider" /><button className="top-avatar" aria-label="Профиль Марии">М</button></div></header>
        <div className="content">
          <div className="page-heading"><div><div className="eyebrow">ВАШИ КОНТАКТЫ</div><h1>Клиенты <span className="title-count">{customers.length}</span></h1><p>Управляйте отношениями и следите за активностью клиентов.</p></div><button className="primary-button" onClick={() => alert('Форма добавления клиента скоро появится.')}><span>＋</span> Добавить клиента</button></div>
          <div className="metric-row"><div className="metric-card"><div className="metric-top"><span>Всего клиентов</span><span className="metric-icon people">♧</span></div><div className="metric-number">{customers.length}<span className="metric-change positive">↗ 12%</span></div><div className="metric-caption">по сравнению с прошлым месяцем</div></div><div className="metric-card"><div className="metric-top"><span>Активные клиенты</span><span className="metric-icon activity">↗</span></div><div className="metric-number">8<span className="metric-change positive">↗ 8%</span></div><div className="metric-caption">за последние 30 дней</div></div><div className="metric-card"><div className="metric-top"><span>Общий оборот</span><span className="metric-icon revenue">₽</span></div><div className="metric-number">1,23 млн <span className="metric-ruble">₽</span><span className="metric-change positive">↗ 18%</span></div><div className="metric-caption">за последние 30 дней</div></div></div>

          <section className="table-card" aria-label="Список клиентов">
            <div className="table-card-heading"><div><h2>Все клиенты</h2><span className="section-subtitle">Список всех ваших контактов</span></div><button className="more-button" aria-label="Дополнительные действия">···</button></div>
            <div className="toolbar"><label className="search-box"><SearchIcon /><input value={query} onChange={(event) => changeQuery(event.target.value)} placeholder="Поиск клиентов..." aria-label="Поиск клиентов" /><kbd>⌘ K</kbd></label><label className="filter-control"><span className="sr-only">Статус клиентов</span><select value={statusFilter} onChange={(event) => selectStatus(event.target.value)}><option>Все клиенты</option><option>Активен</option><option>На паузе</option><option>Новый</option></select><Chevron /></label><button className="filter-button" onClick={() => selectStatus(statusFilter === 'Все клиенты' ? 'Активен' : 'Все клиенты')}><span className="filter-sliders">☷</span> Фильтры {statusFilter !== 'Все клиенты' && <span className="filter-indicator" />}</button><button className="export-button" onClick={() => { const csv = ['Имя,Email,Компания,Статус,Оборот', ...sorted.map((c) => `${c.name},${c.email},${c.company},${c.status},${c.amount}`)].join('\n'); const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })); link.download = 'klienty.csv'; link.click(); URL.revokeObjectURL(link.href); }}><span>↓</span> Экспорт</button></div>
            {selected.length > 0 && <div className="selection-bar"><span>Выбрано: <strong>{selected.length}</strong></span><button onClick={() => setSelected([])}>Снять выделение</button><button onClick={() => alert(`Выбрано клиентов: ${selected.length}`)}>Действия <Chevron /></button></div>}
            <div className="table-scroll"><table><thead><tr><th className="check-cell"><input type="checkbox" checked={visibleSelected} ref={(element) => { if (element) element.indeterminate = visible.some((customer) => selected.includes(customer.id)) && !visibleSelected; }} onChange={togglePage} aria-label="Выбрать все строки на странице" /></th><th>{sortButton('Клиент', 'name')}</th><th>{sortButton('Компания', 'company')}</th><th>{sortButton('Статус', 'status')}</th><th>{sortButton('Оборот', 'amount', 'align-right')}</th><th>{sortButton('Последняя активность', 'date')}</th><th className="row-menu-head"></th></tr></thead><tbody>{visible.map((customer) => <tr key={customer.id} className={selected.includes(customer.id) ? 'selected-row' : ''}><td className="check-cell"><input type="checkbox" checked={selected.includes(customer.id)} onChange={() => toggleCustomer(customer.id)} aria-label={`Выбрать ${customer.name}`} /></td><td><div className="customer-cell"><span className={`customer-avatar ${customer.color}`}>{customer.initials}</span><span className="customer-copy"><strong>{customer.name}</strong><small>{customer.email}</small></span></div></td><td className="company-cell">{customer.company}</td><td><span className={`status-badge ${customer.status === 'Активен' ? 'status-active' : customer.status === 'На паузе' ? 'status-paused' : 'status-new'}`}><i />{customer.status}</span></td><td className="amount-cell">{formatAmount(customer.amount)}</td><td className="date-cell">{customer.date}</td><td><button className="row-more" aria-label={`Действия для ${customer.name}`}>···</button></td></tr>)}</tbody></table>{visible.length === 0 && <div className="empty-state"><span>⌕</span><strong>Ничего не найдено</strong><p>Попробуйте изменить запрос или фильтры.</p><button onClick={() => { changeQuery(''); selectStatus('Все клиенты'); }}>Сбросить поиск</button></div>}</div>
            <footer className="table-footer"><span className="results-count">Показано <strong>{sorted.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, sorted.length)}</strong> из <strong>{sorted.length}</strong> клиентов</span><div className="pagination"><label>Строк на странице <select value={pageSize} onChange={(event) => changePageSize(Number(event.target.value))}><option value={6}>6</option><option value={10}>10</option><option value={12}>12</option></select></label><button className="page-arrow" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)} aria-label="Предыдущая страница"><Chevron direction="left" /></button>{Array.from({ length: pageCount }, (_, i) => i + 1).map((pageNumber) => <button className={`page-number ${currentPage === pageNumber ? 'current' : ''}`} key={pageNumber} onClick={() => setPage(pageNumber)} aria-current={currentPage === pageNumber ? 'page' : undefined}>{pageNumber}</button>)}<button className="page-arrow" disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)} aria-label="Следующая страница"><Chevron direction="right" /></button></div></footer>
          </section>
          <div className="page-footnote"><span className="footnote-dot" /> Данные обновлены 2 минуты назад <span className="footnote-separator">·</span> <a href="#sync">Обновить данные ↻</a></div>
        </div>
      </main>
    </div>
  );
}
