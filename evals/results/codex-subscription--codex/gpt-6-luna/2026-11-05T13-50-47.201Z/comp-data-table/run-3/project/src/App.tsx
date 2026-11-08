import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import './styles.css';

type Customer = {
  id: number;
  name: string;
  email: string;
  initials: string;
  color: string;
  plan: string;
  status: 'Активен' | 'На паузе' | 'Новый';
  amount: number;
  joined: string;
};

const customers: Customer[] = [
  { id: 1, name: 'Анна Смирнова', email: 'anna.smirnova@mail.ru', initials: 'АС', color: 'lilac', plan: 'Бизнес', status: 'Активен', amount: 12800, joined: '12 мая 2024' },
  { id: 2, name: 'Михаил Волков', email: 'm.volkov@inbox.ru', initials: 'МВ', color: 'mint', plan: 'Стандарт', status: 'Активен', amount: 6400, joined: '18 мая 2024' },
  { id: 3, name: 'Екатерина Орлова', email: 'katya.orlova@gmail.com', initials: 'ЕО', color: 'peach', plan: 'Бизнес', status: 'На паузе', amount: 12800, joined: '21 мая 2024' },
  { id: 4, name: 'Дмитрий Козлов', email: 'd.kozlov@ya.ru', initials: 'ДК', color: 'blue', plan: 'Старт', status: 'Активен', amount: 3200, joined: '24 мая 2024' },
  { id: 5, name: 'Мария Фёдорова', email: 'm.fedorova@mail.ru', initials: 'МФ', color: 'pink', plan: 'Стандарт', status: 'Новый', amount: 6400, joined: '28 мая 2024' },
  { id: 6, name: 'Алексей Морозов', email: 'morozov.a@inbox.ru', initials: 'АМ', color: 'yellow', plan: 'Бизнес', status: 'Активен', amount: 12800, joined: '02 июн 2024' },
  { id: 7, name: 'Ольга Новикова', email: 'o.novikova@gmail.com', initials: 'ОН', color: 'mint', plan: 'Старт', status: 'Активен', amount: 3200, joined: '05 июн 2024' },
  { id: 8, name: 'Иван Павлов', email: 'ivan.pavlov@mail.ru', initials: 'ИП', color: 'lilac', plan: 'Стандарт', status: 'На паузе', amount: 6400, joined: '08 июн 2024' },
  { id: 9, name: 'София Лебедева', email: 's.lebedeva@ya.ru', initials: 'СЛ', color: 'peach', plan: 'Бизнес', status: 'Активен', amount: 12800, joined: '11 июн 2024' },
  { id: 10, name: 'Никита Соколов', email: 'n.sokolov@inbox.ru', initials: 'НС', color: 'blue', plan: 'Старт', status: 'Новый', amount: 3200, joined: '14 июн 2024' },
  { id: 11, name: 'Виктория Белова', email: 'v.belova@mail.ru', initials: 'ВБ', color: 'pink', plan: 'Стандарт', status: 'Активен', amount: 6400, joined: '16 июн 2024' },
  { id: 12, name: 'Павел Егоров', email: 'p.egorov@gmail.com', initials: 'ПЕ', color: 'yellow', plan: 'Бизнес', status: 'Активен', amount: 12800, joined: '19 июн 2024' },
  { id: 13, name: 'Алина Васильева', email: 'alina.v@inbox.ru', initials: 'АВ', color: 'lilac', plan: 'Старт', status: 'На паузе', amount: 3200, joined: '22 июн 2024' },
  { id: 14, name: 'Сергей Никитин', email: 's.nikitin@ya.ru', initials: 'СН', color: 'mint', plan: 'Стандарт', status: 'Активен', amount: 6400, joined: '24 июн 2024' },
  { id: 15, name: 'Полина Захарова', email: 'p.zakharova@mail.ru', initials: 'ПЗ', color: 'peach', plan: 'Бизнес', status: 'Новый', amount: 12800, joined: '26 июн 2024' },
  { id: 16, name: 'Артём Борисов', email: 'art.borisov@gmail.com', initials: 'АБ', color: 'blue', plan: 'Стандарт', status: 'Активен', amount: 6400, joined: '28 июн 2024' },
  { id: 17, name: 'Дарья Громова', email: 'd.gromova@inbox.ru', initials: 'ДГ', color: 'pink', plan: 'Старт', status: 'Активен', amount: 3200, joined: '30 июн 2024' },
  { id: 18, name: 'Кирилл Захаров', email: 'k.zakharov@mail.ru', initials: 'КЗ', color: 'yellow', plan: 'Бизнес', status: 'На паузе', amount: 12800, joined: '02 июл 2024' },
  { id: 19, name: 'Елена Макарова', email: 'e.makarova@gmail.com', initials: 'ЕМ', color: 'mint', plan: 'Стандарт', status: 'Активен', amount: 6400, joined: '04 июл 2024' },
  { id: 20, name: 'Роман Андреев', email: 'r.andreev@ya.ru', initials: 'РА', color: 'lilac', plan: 'Старт', status: 'Новый', amount: 3200, joined: '06 июл 2024' },
];

type SortKey = 'name' | 'plan' | 'status' | 'amount' | 'joined';
const formatAmount = (amount: number) => `${amount.toLocaleString('ru-RU')} ₽`;

function Icon({ name, size = 18 }: { name: 'search' | 'filter' | 'download' | 'plus' | 'chevron' | 'users' | 'grid' | 'chart' | 'settings' | 'dots' | 'calendar' | 'arrow'; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true as const };
  const paths: Record<string, ReactNode> = {
    search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.2 4.2"/></>,
    filter: <><path d="M4 7h16M7 12h10m-7 5h4"/><circle cx="8" cy="7" r="1.6" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.6" fill="currentColor" stroke="none"/></>,
    download: <><path d="M12 3v12m-4-4 4 4 4-4"/><path d="M5 17v3h14v-3"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    chevron: <path d="m8 10 4 4 4-4"/>,
    users: <><path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20"/><circle cx="10" cy="8" r="3.5"/><path d="M17 4.7a3.5 3.5 0 0 1 0 6.6M20 20v-1.5a3.5 3.5 0 0 0-2.5-3.36"/></>,
    grid: <><rect x="4" y="4" width="6" height="6" rx="1.3"/><rect x="14" y="4" width="6" height="6" rx="1.3"/><rect x="4" y="14" width="6" height="6" rx="1.3"/><rect x="14" y="14" width="6" height="6" rx="1.3"/></>,
    chart: <><path d="M4 19.5h16"/><path d="M6.5 16V11m5 5V5m5 11v-7"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1a1.8 1.8 0 1 1-2.5 2.5l-.1-.1a1.8 1.8 0 0 0-3 .1v.2a1.8 1.8 0 1 1-3.6 0v-.2a1.8 1.8 0 0 0-3-.1l-.1.1a1.8 1.8 0 1 1-2.5-2.5l.1-.1a1.8 1.8 0 0 0-.1-3h-.2a1.8 1.8 0 1 1 0-3.6h.2a1.8 1.8 0 0 0 .1-3l-.1-.1a1.8 1.8 0 1 1 2.5-2.5l.1.1a1.8 1.8 0 0 0 3-.1v-.2a1.8 1.8 0 1 1 3.6 0v.2a1.8 1.8 0 0 0 3 .1l.1-.1a1.8 1.8 0 1 1 2.5 2.5l-.1.1a1.8 1.8 0 0 0 .1 3h.2a1.8 1.8 0 1 1 0 3.6h-.2a1.8 1.8 0 0 0-.1 3Z"/></>,
    dots: <><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></>,
    calendar: <><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4m8-4v4M4 10h16"/></>,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6"/></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

export function App() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Все статусы');
  const [sortKey, setSortKey] = useState<SortKey>('joined');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [selected, setSelected] = useState<number[]>([]);
  const [periodOpen, setPeriodOpen] = useState(false);
  const [period, setPeriod] = useState('Последние 30 дней');
  const [filterOpen, setFilterOpen] = useState(false);
  const [notice, setNotice] = useState('');

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('ru');
    return customers.filter((customer) => {
      const matchesQuery = !needle || `${customer.name} ${customer.email} ${customer.plan}`.toLocaleLowerCase('ru').includes(needle);
      const matchesStatus = statusFilter === 'Все статусы' || customer.status === statusFilter;
      return matchesQuery && matchesStatus;
    }).sort((a, b) => {
      const left = a[sortKey];
      const right = b[sortKey];
      const comparison = sortKey === 'joined' ? a.id - b.id : typeof left === 'number' && typeof right === 'number'
        ? left - right
        : String(left).localeCompare(String(right), 'ru');
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [query, statusFilter, sortKey, sortDirection]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const pageIds = visible.map((customer) => customer.id);
  const allVisibleSelected = pageIds.length > 0 && pageIds.every((id) => selected.includes(id));
  const activeCount = customers.filter((customer) => customer.status === 'Активен').length;

  const changeSort = (key: SortKey) => {
    if (sortKey === key) setSortDirection((direction) => direction === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDirection(key === 'joined' ? 'desc' : 'asc'); }
    setPage(1);
  };
  const toggleAll = () => setSelected((current) => allVisibleSelected
    ? current.filter((id) => !pageIds.includes(id))
    : [...new Set([...current, ...pageIds])]);
  const toggleRow = (id: number) => setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  const showNotice = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(''), 2600); };

  const sortButton = (label: string, key: SortKey) => <button className="sort-button" onClick={() => changeSort(key)}>
    {label}<span className={`sort-mark ${sortKey === key ? 'is-active' : ''}`}>{sortKey === key ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}</span>
  </button>;

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-symbol"><i/><i/><i/><i/></span><span>лист<span className="brand-dot">.</span></span></div>
      <div className="workspace-switch"><div className="workspace-avatar">А</div><div className="workspace-copy"><b>Ателье «Север»</b><span>Рабочее пространство</span></div><Icon name="chevron" size={15}/></div>
      <div className="side-label">РАБОЧЕЕ</div>
      <nav className="side-nav">
        <button><Icon name="grid"/>Обзор</button>
        <button className="selected"><Icon name="users"/>Клиенты<span className="nav-count">24</span></button>
        <button><Icon name="chart"/>Аналитика</button>
      </nav>
      <div className="side-bottom"><button><Icon name="settings"/>Настройки</button><div className="help-card"><span className="help-star">✳</span><b>Нужна помощь?</b><p>Мы рядом и готовы помочь с любым вопросом.</p><a href="#help" onClick={(event) => { event.preventDefault(); showNotice('Мы скоро свяжемся с вами'); }}>Связаться с нами <Icon name="arrow" size={14}/></a></div><div className="profile"><div className="profile-avatar">ЕК</div><div className="profile-copy"><b>Елена Крылова</b><span>Администратор</span></div><Icon name="dots"/></div></div>
    </aside>

    <main className="main-content">
      <header className="topbar"><div className="breadcrumbs">Рабочее пространство <span>/</span> <b>Клиенты</b></div><div className="topbar-right"><button className="period-button" onClick={() => setPeriodOpen(!periodOpen)}><Icon name="calendar" size={16}/>{period}<Icon name="chevron" size={14}/></button>{periodOpen && <div className="period-menu">{['Последние 7 дней', 'Последние 30 дней', 'Последние 90 дней'].map((item) => <button key={item} onClick={() => { setPeriod(item); setPeriodOpen(false); }}>{item}</button>)}</div>}<span className="top-avatar">ЕК</span></div></header>
      <div className="page-body">
        <div className="page-heading"><div><div className="eyebrow">ВАШИ ОТНОШЕНИЯ — В ПОРЯДКЕ</div><h1>Клиенты</h1><p>Управляйте клиентами и следите за важными деталями.</p></div><button className="primary-button" onClick={() => showNotice('Форма добавления клиента скоро появится')}><Icon name="plus" size={17}/>Добавить клиента</button></div>
        <section className="stats-row">
          <article className="stat-card"><div className="stat-top"><span>Всего клиентов</span><span className="stat-icon purple"><Icon name="users" size={17}/></span></div><div className="stat-value">{customers.length}<span className="stat-unit">человек</span></div><div className="stat-foot"><span className="trend">↗ 12%</span><span>по сравнению с прошлым месяцем</span></div></article>
          <article className="stat-card"><div className="stat-top"><span>Активные</span><span className="stat-icon green"><span className="tiny-dot"/></span></div><div className="stat-value">{activeCount}<span className="stat-unit">клиентов</span></div><div className="stat-foot"><span className="trend">↗ 8%</span><span>по сравнению с прошлым месяцем</span></div></article>
          <article className="stat-card"><div className="stat-top"><span>Новые за месяц</span><span className="stat-icon peach"><Icon name="arrow" size={16}/></span></div><div className="stat-value">6<span className="stat-unit">клиентов</span></div><div className="stat-foot"><span className="trend">↗ 3 новых</span><span>за последние 30 дней</span></div></article>
        </section>

        <section className="table-card">
          <div className="table-heading"><div><h2>Все клиенты <span className="total-pill">{filtered.length}</span></h2><p>Полный список клиентов вашего пространства</p></div><button className="export-button" onClick={() => showNotice('Список клиентов готов к экспорту')}><Icon name="download" size={16}/>Экспорт</button></div>
          <div className="toolbar"><div className="search-box"><Icon name="search" size={17}/><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Поиск по имени или email..." aria-label="Поиск клиентов"/>{query && <button aria-label="Очистить поиск" onClick={() => setQuery('')}>×</button>}</div><div className="toolbar-actions"><div className="filter-wrap"><button className={`filter-button ${statusFilter !== 'Все статусы' ? 'filter-active' : ''}`} onClick={() => setFilterOpen(!filterOpen)}><Icon name="filter" size={16}/>{statusFilter === 'Все статусы' ? 'Фильтры' : statusFilter}<Icon name="chevron" size={14}/></button>{filterOpen && <div className="filter-menu">{['Все статусы', 'Активен', 'На паузе', 'Новый'].map((item) => <button className={statusFilter === item ? 'chosen' : ''} key={item} onClick={() => { setStatusFilter(item); setPage(1); setFilterOpen(false); }}>{item}</button>)}</div>}</div><button className="view-button" title="Настроить вид" onClick={() => showNotice('Все столбцы уже отображаются')}><Icon name="dots" size={19}/></button></div></div>
          {selected.length > 0 && <div className="selection-bar"><span>Выбрано: <b>{selected.length}</b></span><button onClick={() => { setSelected([]); showNotice('Выделение снято'); }}>Снять выделение</button><button className="selection-action" onClick={() => showNotice(`Подготовлено к экспорту: ${selected.length}`)}><Icon name="download" size={15}/>Экспортировать</button></div>}
          <div className="table-scroll"><table><thead><tr><th className="check-col"><input type="checkbox" checked={allVisibleSelected} onChange={toggleAll} aria-label="Выбрать все строки на странице"/></th><th>{sortButton('Клиент', 'name')}</th><th>{sortButton('Тариф', 'plan')}</th><th>{sortButton('Статус', 'status')}</th><th>{sortButton('Сумма', 'amount')}</th><th>{sortButton('Дата добавления', 'joined')}</th><th className="row-menu-col"></th></tr></thead>
            <tbody>{visible.map((customer) => <tr key={customer.id} className={selected.includes(customer.id) ? 'row-selected' : ''}><td className="check-col"><input type="checkbox" checked={selected.includes(customer.id)} onChange={() => toggleRow(customer.id)} aria-label={`Выбрать ${customer.name}`}/></td><td><div className="customer-cell"><span className={`customer-avatar ${customer.color}`}>{customer.initials}</span><span className="customer-info"><b>{customer.name}</b><span>{customer.email}</span></span></div></td><td><span className="plan-label">{customer.plan}</span></td><td><span className={`status-badge ${customer.status === 'Активен' ? 'status-active' : customer.status === 'Новый' ? 'status-new' : 'status-paused'}`}><i/>{customer.status}</span></td><td className="amount-cell">{formatAmount(customer.amount)}</td><td className="date-cell">{customer.joined}</td><td className="row-menu-col"><button className="row-more" aria-label={`Действия для ${customer.name}`} onClick={() => showNotice(`Клиент: ${customer.name}`)}><Icon name="dots" size={18}/></button></td></tr>)}</tbody>
          </table>{visible.length === 0 && <div className="empty-state"><span>⌕</span><b>Ничего не найдено</b><p>Измените запрос или выберите другой фильтр.</p><button onClick={() => { setQuery(''); setStatusFilter('Все статусы'); }}>Сбросить фильтры</button></div>}</div>
          <div className="table-footer"><div className="rows-control"><span>Строк на странице</span><select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} aria-label="Количество строк на странице"><option value={5}>5</option><option value={8}>8</option><option value={10}>10</option><option value={20}>20</option></select></div><div className="pagination"><span className="page-summary">{filtered.length ? `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filtered.length)} из ${filtered.length}` : '0 из 0'}</span><button className="page-arrow" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)} aria-label="Предыдущая страница">‹</button>{Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => <button key={number} className={`page-number ${currentPage === number ? 'current' : ''}`} onClick={() => setPage(number)}>{number}</button>)}<button className="page-arrow" disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)} aria-label="Следующая страница">›</button></div></div>
        </section>
        <footer className="page-footer"><span>© 2024 Лист. Пространство для хороших дел.</span><span>Сделано с заботой <span className="heart">♥</span></span></footer>
      </div>
      {notice && <div className="toast">{notice}</div>}
    </main>
  </div>;
}
