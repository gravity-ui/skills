import { useMemo, useState } from 'react';
import './App.css';

type OrderStatus = 'Выполнен' | 'В обработке' | 'Отменён' | 'Ожидает оплаты';
type Order = { id: string; customer: string; initials: string; email: string; date: string; amount: number; status: OrderStatus; color: string; method: string };
type ColumnKey = 'order' | 'customer' | 'date' | 'amount' | 'status' | 'method';

const orders: Order[] = [
  { id: '#ORD-2048', customer: 'Анна Смирнова', initials: 'АС', email: 'anna.smirnova@gmail.com', date: 'Сегодня, 10:42', amount: 12_490, status: 'Выполнен', color: 'violet', method: 'Карта ···· 4829' },
  { id: '#ORD-2047', customer: 'Михаил Петров', initials: 'МП', email: 'm.petrov@mail.ru', date: 'Сегодня, 10:18', amount: 8_750, status: 'В обработке', color: 'blue', method: 'СБП' },
  { id: '#ORD-2046', customer: 'Екатерина Волкова', initials: 'ЕВ', email: 'katya.volkova@yandex.ru', date: 'Сегодня, 09:56', amount: 24_300, status: 'Выполнен', color: 'pink', method: 'Карта ···· 1034' },
  { id: '#ORD-2045', customer: 'Дмитрий Козлов', initials: 'ДК', email: 'd.kozlov@gmail.com', date: 'Сегодня, 09:31', amount: 5_990, status: 'Ожидает оплаты', color: 'orange', method: 'СБП' },
  { id: '#ORD-2044', customer: 'Мария Иванова', initials: 'МИ', email: 'maria.i@mail.ru', date: 'Сегодня, 09:04', amount: 16_800, status: 'В обработке', color: 'green', method: 'Карта ···· 7712' },
  { id: '#ORD-2043', customer: 'Алексей Морозов', initials: 'АМ', email: 'alex.morozov@inbox.ru', date: 'Вчера, 18:42', amount: 3_450, status: 'Отменён', color: 'cyan', method: 'Карта ···· 3186' },
  { id: '#ORD-2042', customer: 'Ольга Новикова', initials: 'ОН', email: 'olga.novikova@gmail.com', date: 'Вчера, 17:16', amount: 9_200, status: 'Выполнен', color: 'yellow', method: 'СБП' },
  { id: '#ORD-2041', customer: 'Иван Фёдоров', initials: 'ИФ', email: 'ivan.fedorov@mail.ru', date: 'Вчера, 16:28', amount: 18_600, status: 'В обработке', color: 'blue', method: 'Карта ···· 5501' },
  { id: '#ORD-2040', customer: 'Софья Белова', initials: 'СБ', email: 's.belova@yandex.ru', date: 'Вчера, 15:03', amount: 6_790, status: 'Ожидает оплаты', color: 'pink', method: 'СБП' },
  { id: '#ORD-2039', customer: 'Артём Соколов', initials: 'АС', email: 'a.sokolov@mail.ru', date: 'Вчера, 14:37', amount: 31_200, status: 'Выполнен', color: 'orange', method: 'Карта ···· 9240' },
  { id: '#ORD-2038', customer: 'Полина Орлова', initials: 'ПО', email: 'polina.orlova@gmail.com', date: 'Вчера, 13:12', amount: 4_890, status: 'Отменён', color: 'violet', method: 'Карта ···· 1198' },
  { id: '#ORD-2037', customer: 'Никита Павлов', initials: 'НП', email: 'nikita.pavlov@inbox.ru', date: 'Вчера, 11:49', amount: 14_500, status: 'В обработке', color: 'green', method: 'СБП' },
];

const initialColumns: { key: ColumnKey; label: string }[] = [
  { key: 'order', label: 'ЗАКАЗ' }, { key: 'customer', label: 'КЛИЕНТ' }, { key: 'date', label: 'ДАТА' },
  { key: 'amount', label: 'СУММА' }, { key: 'status', label: 'СТАТУС' }, { key: 'method', label: 'ОПЛАТА' },
];

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true as const };
  const paths: Record<string, React.ReactNode> = {
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></>,
    users: <><path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20"/><circle cx="10" cy="7.5" r="3.5"/><path d="M16 4.3a3.6 3.6 0 0 1 0 6.9M20 20v-1.5a3.5 3.5 0 0 0-2.5-3.35"/></>,
    box: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4.5 7.5 7.5 4 7.5-4M12 12v9M8 5l8 4.5"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.1.9-1.5 2.6-1.4-.5a7.8 7.8 0 0 1-1.7 1l-.2 1.5h-3l-.3-1.5a7.8 7.8 0 0 1-1.7-1l-1.4.5-1.5-2.6 1.1-.9a7 7 0 0 1 0-2l-1.1-.9 1.5-2.6 1.4.5a7.8 7.8 0 0 1 1.7-1l.3-1.5h3l.2 1.5a7.8 7.8 0 0 1 1.7 1l1.4-.5 1.5 2.6-1.1.9a7 7 0 0 1 0 2Z" transform="translate(-1 -1) scale(1.08)"/></>,
    search: <><circle cx="10.8" cy="10.8" r="6.3"/><path d="m15.5 15.5 4.2 4.2"/></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    down: <path d="m7 10 5 5 5-5"/>,
    grip: <><circle cx="9" cy="6" r=".8" fill="currentColor"/><circle cx="15" cy="6" r=".8" fill="currentColor"/><circle cx="9" cy="12" r=".8" fill="currentColor"/><circle cx="15" cy="12" r=".8" fill="currentColor"/><circle cx="9" cy="18" r=".8" fill="currentColor"/><circle cx="15" cy="18" r=".8" fill="currentColor"/></>,
    filter: <><path d="M4 5h16l-6.5 7.5v5l-3 1.5v-6.5L4 5Z"/></>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5"/><path d="M5 17v3h14v-3"/></>,
    more: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/></>,
    sliders: <><path d="M4 7h9m4 0h3M4 17h3m4 0h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/></>,
  };
  return <svg {...common}>{paths[name] || paths.grid}</svg>;
}

function cellValue(order: Order, key: ColumnKey) {
  switch (key) {
    case 'order': return <span className="order-id">{order.id}</span>;
    case 'customer': return <div className="customer-cell"><span className={`avatar ${order.color}`}>{order.initials}</span><span className="customer-copy"><b>{order.customer}</b><small>{order.email}</small></span></div>;
    case 'date': return <span className="muted-cell">{order.date}</span>;
    case 'amount': return <b className="amount">₽ {order.amount.toLocaleString('ru-RU')}</b>;
    case 'status': return <span className={`status-pill ${order.status === 'Выполнен' ? 'done' : order.status === 'В обработке' ? 'processing' : order.status === 'Отменён' ? 'cancelled' : 'pending'}`}><i />{order.status}</span>;
    case 'method': return <span className="payment-cell"><span className="payment-icon">{order.method.startsWith('СБП') ? '↗' : '▰'}</span>{order.method}</span>;
  }
}

export function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState('Заказы');
  const [selected, setSelected] = useState<string[]>([]);
  const [columns, setColumns] = useState(initialColumns);
  const [dragged, setDragged] = useState<ColumnKey | null>(null);
  const [grouped, setGrouped] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Все заказы');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => orders.filter((order) => {
    const matchesQuery = `${order.id} ${order.customer} ${order.email}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === 'Все заказы' || order.status === filter;
    return matchesQuery && matchesFilter;
  }), [query, filter]);
  const groupedRows = useMemo(() => {
    if (!grouped) return [{ status: '', rows: filtered }];
    const rank: OrderStatus[] = ['Выполнен', 'В обработке', 'Ожидает оплаты', 'Отменён'];
    return rank.map((status) => ({ status, rows: filtered.filter((order) => order.status === status) })).filter((group) => group.rows.length);
  }, [filtered, grouped]);
  const allSelected = filtered.length > 0 && filtered.every((order) => selected.includes(order.id));
  const toggleAll = () => setSelected(allSelected ? selected.filter((id) => !filtered.some((order) => order.id === id)) : [...new Set([...selected, ...filtered.map((order) => order.id)])]);
  const toggleRow = (id: string) => setSelected(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);
  const moveColumn = (target: ColumnKey) => {
    if (!dragged || dragged === target) return;
    const next = [...columns];
    const from = next.findIndex((column) => column.key === dragged);
    const to = next.findIndex((column) => column.key === target);
    next.splice(to, 0, next.splice(from, 1)[0]);
    setColumns(next);
    setDragged(null);
  };

  const navItems = [{ label: 'Главная', icon: 'grid' }, { label: 'Пользователи', icon: 'users' }, { label: 'Заказы', icon: 'box', badge: '12' }, { label: 'Настройки', icon: 'settings' }];

  return <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
    <aside className="sidebar">
      <div className="brand-row"><div className="brand-mark"><span /></div>{!collapsed && <span className="brand-name">nord<span>line</span></span>}<button className="collapse-btn" onClick={() => setCollapsed(!collapsed)} title={collapsed ? 'Развернуть меню' : 'Свернуть меню'}><Icon name="chevron" size={16} /></button></div>
      <div className="workspace-switch"><span className="workspace-avatar">N</span>{!collapsed && <><span className="workspace-copy"><b>Nordline Store</b><small>Рабочее пространство</small></span><Icon name="down" size={14} /></>}</div>
      <div className="nav-label">{!collapsed && 'МЕНЮ'}</div>
      <nav className="main-nav" aria-label="Основная навигация">{navItems.map((item) => <button key={item.label} className={`nav-item ${activeNav === item.label ? 'active' : ''}`} onClick={() => setActiveNav(item.label)} title={collapsed ? item.label : undefined}><Icon name={item.icon} /><span>{!collapsed && item.label}</span>{!collapsed && item.badge && <em>{item.badge}</em>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-glyph">✳</div>{!collapsed && <div><b>Нужна помощь?</b><small>Мы всегда на связи</small><button onClick={() => alert('Напишите нам: support@nordline.ru')}>Связаться с нами <Icon name="chevron" size={12} /></button></div>}</div><div className="profile-row"><span className="profile-avatar">ИК</span>{!collapsed && <><span className="profile-copy"><b>Ирина Кузнецова</b><small>Администратор</small></span><button className="profile-more" title="Выйти"><Icon name="logout" size={16} /></button></>}</div></div>
    </aside>

    <main className="main-area">
      <header className="topbar"><div className="breadcrumbs"><span>Магазин</span><Icon name="chevron" size={13} /><b>{activeNav}</b></div><div className="top-actions"><span className="online-dot" /><span className="store-status">Магазин активен</span><button className="icon-button notification" aria-label="Уведомления"><Icon name="bell" size={18} /><i /></button><span className="top-divider" /><span className="top-profile">ИК</span></div></header>

      <div className="page-content"><section className="page-heading"><div><div className="eyebrow">УПРАВЛЕНИЕ МАГАЗИНОМ <span>·</span> 04 НОЯБРЯ 2026</div><h1>Заказы</h1><p>Следите за заказами и управляйте покупками в одном месте.</p></div><button className="primary-button" onClick={() => alert('Форма создания нового заказа')}><Icon name="plus" size={17} /> Создать заказ</button></section>

      <section className="metrics-grid" aria-label="Сводка по заказам"><article className="metric-card"><div className="metric-top"><span>Всего заказов</span><span className="metric-icon purple"><Icon name="box" size={17} /></span></div><div className="metric-value">1 284</div><div className="metric-foot"><span className="trend up">↗ 12,8%</span><span>к прошлому месяцу</span></div><div className="sparkline purple-line"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></article><article className="metric-card"><div className="metric-top"><span>Выручка</span><span className="metric-icon green"><b>₽</b></span></div><div className="metric-value">₽ 2,4 млн</div><div className="metric-foot"><span className="trend up">↗ 8,2%</span><span>к прошлому месяцу</span></div><div className="sparkline green-line"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></article><article className="metric-card"><div className="metric-top"><span>В обработке</span><span className="metric-icon orange"><span className="processing-ring" /></span></div><div className="metric-value">38</div><div className="metric-foot"><span className="metric-note">Требуют внимания</span><span>· сегодня</span></div><div className="sparkline orange-line"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></article><article className="metric-card"><div className="metric-top"><span>Средний чек</span><span className="metric-icon blue"><span className="ruble">₽</span></span></div><div className="metric-value">₽ 1 869</div><div className="metric-foot"><span className="trend down">↘ 2,4%</span><span>к прошлому месяцу</span></div><div className="sparkline blue-line"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></article></section>

      <section className="orders-panel"><div className="panel-heading"><div><h2>Все заказы <span className="count-chip">1 284</span></h2><p>Просматривайте, сортируйте и управляйте заказами.</p></div><button className="outline-button" onClick={() => alert('Отчёт по заказам подготовлен')}><Icon name="download" size={16} /> Экспорт</button></div>
        <div className="toolbar"><label className="search-box"><Icon name="search" size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Поиск по заказам..." /><kbd>⌘ K</kbd></label><div className="toolbar-right"><label className="filter-select"><Icon name="filter" size={16} /><select value={filter} onChange={(e) => setFilter(e.target.value)}><option>Все заказы</option><option>Выполнен</option><option>В обработке</option><option>Ожидает оплаты</option><option>Отменён</option></select><Icon name="down" size={14} /></label><button className={`group-toggle ${grouped ? 'selected' : ''}`} onClick={() => setGrouped(!grouped)} title="Группировать по статусу"><Icon name="sliders" size={16} /><span>Группировка</span><i /></button><button className="icon-button view-more" aria-label="Дополнительные действия"><Icon name="more" /></button></div></div>
        {selected.length > 0 && <div className="selection-bar"><b>Выбрано: {selected.length}</b><span>заказа</span><button onClick={() => setSelected([])}>Снять выделение</button><button className="bulk-action" onClick={() => setFilter('В обработке')}>Изменить статус <Icon name="down" size={13} /></button></div>}
        <div className="table-scroll"><table className="orders-table"><thead><tr><th className="check-col"><input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Выбрать все заказы" /></th>{columns.map((column) => <th key={column.key} draggable onDragStart={() => setDragged(column.key)} onDragOver={(event) => event.preventDefault()} onDrop={() => moveColumn(column.key)} onDragEnd={() => setDragged(null)} className={dragged === column.key ? 'dragging' : ''}><span className="drag-handle"><Icon name="grip" size={13} /></span>{column.label}{column.key === 'date' && <Icon name="down" size={12} />}</th>)}<th className="more-col"><button aria-label="Настроить таблицу"><Icon name="more" size={17} /></button></th></tr></thead><tbody>{groupedRows.map((group) => <>{group.status && <tr className="group-row" key={`group-${group.status}`}><td colSpan={columns.length + 2}><span className={`group-dot ${group.status === 'Выполнен' ? 'done' : group.status === 'В обработке' ? 'processing' : group.status === 'Отменён' ? 'cancelled' : 'pending'}`} /><b>{group.status}</b><span className="group-count">{group.rows.length}</span><Icon name="down" size={14} /></td></tr>}{group.rows.map((order) => <tr key={order.id} className={selected.includes(order.id) ? 'row-selected' : ''}><td className="check-col"><input type="checkbox" checked={selected.includes(order.id)} onChange={() => toggleRow(order.id)} aria-label={`Выбрать ${order.id}`} /></td>{columns.map((column) => <td key={column.key}>{cellValue(order, column.key)}</td>)}<td className="more-col"><button aria-label={`Действия ${order.id}`}><Icon name="more" size={17} /></button></td></tr>)}</>)}</tbody></table>{filtered.length === 0 && <div className="empty-state"><span className="empty-icon"><Icon name="search" size={22} /></span><b>Заказы не найдены</b><span>Попробуйте изменить запрос или фильтр.</span></div>}</div>
        <footer className="table-footer"><span>Показано <b>{filtered.length ? (page - 1) * 10 + 1 : 0}–{Math.min(page * 10, filtered.length)}</b> из <b>{filtered.length}</b> заказов</span><div className="pagination"><button disabled={page === 1} onClick={() => setPage(Math.max(1, page - 1))}>← <span>Назад</span></button><button className="page-number active-page" onClick={() => setPage(1)}>1</button><button className="page-number" onClick={() => setPage(2)}>2</button><button className="page-number" onClick={() => setPage(3)}>3</button><span className="ellipsis">…</span><button className="page-number" onClick={() => setPage(12)}>12</button><button disabled={page >= 12} onClick={() => setPage(Math.min(12, page + 1))}><span>Далее</span> →</button></div></footer>
      </section><div className="page-footnote"><span>Последнее обновление: только что</span><button onClick={() => window.location.reload()}>Обновить данные ↻</button></div></div>
    </main>
  </div>;
}
