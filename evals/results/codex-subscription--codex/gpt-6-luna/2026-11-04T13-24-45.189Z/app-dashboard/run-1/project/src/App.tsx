import React, { useMemo, useState } from 'react';
import './app.css';

type OrderStatus = 'Выполнен' | 'В обработке' | 'Отменён';
type Order = { id: string; customer: string; initials: string; email: string; date: string; amount: number; status: OrderStatus; color: string; method: string };
type ColumnKey = 'order' | 'customer' | 'date' | 'amount' | 'payment' | 'status';

const orders: Order[] = [
  { id: '#ORD-7401', customer: 'Александр Иванов', initials: 'АИ', email: 'a.ivanov@gmail.com', date: 'Сегодня, 10:42', amount: 12490, status: 'Выполнен', color: 'lavender', method: 'Visa ···· 4242' },
  { id: '#ORD-7400', customer: 'Мария Смирнова', initials: 'МС', email: 'm.smirnova@mail.ru', date: 'Сегодня, 09:18', amount: 5680, status: 'Выполнен', color: 'peach', method: 'Мир ···· 8091' },
  { id: '#ORD-7399', customer: 'Дмитрий Козлов', initials: 'ДК', email: 'd.kozlov@yandex.ru', date: 'Сегодня, 08:56', amount: 21900, status: 'В обработке', color: 'mint', method: 'Visa ···· 1038' },
  { id: '#ORD-7398', customer: 'Екатерина Волкова', initials: 'ЕВ', email: 'e.volkova@gmail.com', date: 'Вчера, 21:34', amount: 3400, status: 'Выполнен', color: 'rose', method: 'СБП' },
  { id: '#ORD-7397', customer: 'Артём Морозов', initials: 'АМ', email: 'a.morozov@mail.ru', date: 'Вчера, 19:12', amount: 8750, status: 'Отменён', color: 'sky', method: 'Мир ···· 2260' },
  { id: '#ORD-7396', customer: 'Ольга Новикова', initials: 'ОН', email: 'o.novikova@yandex.ru', date: 'Вчера, 17:48', amount: 15600, status: 'В обработке', color: 'sand', method: 'Visa ···· 7194' },
  { id: '#ORD-7395', customer: 'Илья Фёдоров', initials: 'ИФ', email: 'i.fedorov@gmail.com', date: 'Вчера, 16:03', amount: 4290, status: 'Выполнен', color: 'lilac', method: 'СБП' },
  { id: '#ORD-7394', customer: 'Анна Белова', initials: 'АБ', email: 'a.belova@mail.ru', date: 'Вчера, 14:27', amount: 11300, status: 'В обработке', color: 'lemon', method: 'Мир ···· 5408' },
  { id: '#ORD-7393', customer: 'Никита Павлов', initials: 'НП', email: 'n.pavlov@yandex.ru', date: '12 мая, 12:15', amount: 7200, status: 'Отменён', color: 'mint', method: 'Visa ···· 3001' },
  { id: '#ORD-7392', customer: 'Полина Орлова', initials: 'ПО', email: 'p.orlova@gmail.com', date: '12 мая, 10:09', amount: 18900, status: 'Выполнен', color: 'rose', method: 'СБП' },
];

const initialColumns: ColumnKey[] = ['order', 'customer', 'date', 'amount', 'payment', 'status'];
const columnLabels: Record<ColumnKey, string> = { order: 'Заказ', customer: 'Клиент', date: 'Дата', amount: 'Сумма', payment: 'Оплата', status: 'Статус' };
const navItems = [
  { label: 'Главная', icon: 'home' }, { label: 'Пользователи', icon: 'users' }, { label: 'Заказы', icon: 'bag' }, { label: 'Настройки', icon: 'settings' },
];

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true as const };
  const paths: Record<string, React.ReactNode> = {
    home: <><path d="m3.5 10 8.5-7 8.5 7"/><path d="M5.5 9v11h13V9M9.5 20v-6h5v6"/></>,
    users: <><path d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20"/><circle cx="9.5" cy="7" r="3.5"/><path d="M17 3.7a3.5 3.5 0 0 1 0 6.6M21 20v-1.5a4 4 0 0 0-3-3.87"/></>,
    bag: <><path d="M4 8h16l1 12H3L4 8Z"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1a1.8 1.8 0 1 1-2.6 2.6l-.1-.1a1.8 1.8 0 0 0-3 .9v.2a1.8 1.8 0 1 1-3.6 0v-.2a1.8 1.8 0 0 0-3-.9l-.1.1a1.8 1.8 0 1 1-2.6-2.6l.1-.1a1.8 1.8 0 0 0-.9-3h-.2a1.8 1.8 0 1 1 0-3.6h.2a1.8 1.8 0 0 0 .9-3l-.1-.1a1.8 1.8 0 1 1 2.6-2.6l.1.1a1.8 1.8 0 0 0 3-.9v-.2a1.8 1.8 0 1 1 3.6 0v.2a1.8 1.8 0 0 0 3 .9l.1-.1a1.8 1.8 0 1 1 2.6 2.6l-.1.1a1.8 1.8 0 0 0 .9 3h.2a1.8 1.8 0 1 1 0 3.6h-.2a1.8 1.8 0 0 0-.9 3Z" transform="translate(.5 .5) scale(.96)"/></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    down: <path d="m7 10 5 5 5-5"/>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    filter: <><path d="M4 6h16M7 12h10m-7 6h4"/></>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5"/><path d="M5 17v3h14v-3"/></>,
    more: <><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></>,
    grip: <><circle cx="9" cy="6" r=".8" fill="currentColor"/><circle cx="15" cy="6" r=".8" fill="currentColor"/><circle cx="9" cy="12" r=".8" fill="currentColor"/><circle cx="15" cy="12" r=".8" fill="currentColor"/><circle cx="9" cy="18" r=".8" fill="currentColor"/><circle cx="15" cy="18" r=".8" fill="currentColor"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    help: <><circle cx="12" cy="12" r="9"/><path d="M9.6 9a2.5 2.5 0 1 1 4.2 1.8c-1.1 1-1.8 1.2-1.8 2.7M12 17h.01"/></>,
  };
  return <svg {...common}>{paths[name] ?? paths.grid}</svg>;
}

function statusClass(status: OrderStatus) { return status === 'Выполнен' ? 'done' : status === 'В обработке' ? 'processing' : 'cancelled'; }

export function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [activePage, setActivePage] = useState('Заказы');
  const [selected, setSelected] = useState<string[]>([]);
  const [columns, setColumns] = useState(initialColumns);
  const [dragged, setDragged] = useState<ColumnKey | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<OrderStatus[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'Все заказы' | OrderStatus>('Все заказы');
  const [notice, setNotice] = useState('');
  const filteredOrders = useMemo(() => orders.filter((order) => (filter === 'Все заказы' || order.status === filter) && `${order.id} ${order.customer} ${order.email}`.toLowerCase().includes(search.toLowerCase())), [search, filter]);
  const groups: OrderStatus[] = ['В обработке', 'Выполнен', 'Отменён'];
  const allSelected = filteredOrders.length > 0 && filteredOrders.every((order) => selected.includes(order.id));
  const toggleSelected = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const moveColumn = (target: ColumnKey) => {
    if (!dragged || dragged === target) return;
    setColumns((current) => { const next = [...current]; const from = next.indexOf(dragged); const to = next.indexOf(target); next.splice(from, 1); next.splice(to, 0, dragged); return next; });
    setDragged(null);
  };
  const cell = (order: Order, key: ColumnKey) => {
    if (key === 'order') return <span className="order-number">{order.id}</span>;
    if (key === 'customer') return <div className="customer-cell"><span className={`avatar ${order.color}`}>{order.initials}</span><span><strong>{order.customer}</strong><small>{order.email}</small></span></div>;
    if (key === 'date') return <span className="muted-cell">{order.date}</span>;
    if (key === 'amount') return <strong className="amount">{order.amount.toLocaleString('ru-RU')} ₽</strong>;
    if (key === 'payment') return <span className="payment-cell"><span className="payment-mark">{order.method.startsWith('Visa') ? 'V' : order.method === 'СБП' ? '↗' : 'м'}</span>{order.method}</span>;
    return <span className={`status-pill ${statusClass(order.status)}`}><i />{order.status}</span>;
  };

  return <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
    <aside className="sidebar">
      <div className="brand-row"><div className="brand-logo">m<span>.</span></div><span className="brand-name">mosaic</span><button className="collapse-btn" title={collapsed ? 'Развернуть меню' : 'Свернуть меню'} onClick={() => setCollapsed(!collapsed)}><Icon name="chevron" size={15} /></button></div>
      <div className="workspace"><span className="workspace-mark">M</span><span className="workspace-copy"><b>Mosaic Store</b><small>Рабочее пространство</small></span><Icon name="down" size={14} /></div>
      <div className="nav-caption">МЕНЮ</div>
      <nav className="main-nav">{navItems.map((item) => <button key={item.label} className={`nav-item ${activePage === item.label ? 'active' : ''}`} title={collapsed ? item.label : undefined} onClick={() => { setActivePage(item.label); if (item.label !== 'Заказы') setNotice(`Раздел «${item.label}»`); else setNotice(''); }}><Icon name={item.icon} /><span>{item.label}</span>{item.label === 'Заказы' && <i className="nav-count">12</i>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><Icon name="help" size={16} /></div><div className="help-copy"><b>Нужна помощь?</b><small>Мы всегда на связи</small></div><Icon name="chevron" size={14} /></div><div className="profile"><div className="profile-avatar">АК</div><div className="profile-copy"><b>Алина Крылова</b><small>Администратор</small></div><Icon name="more" size={18} /></div></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="breadcrumbs"><span>Магазин</span><Icon name="chevron" size={13} /><b>{activePage}</b></div><div className="topbar-actions"><label className="global-search"><Icon name="search" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Поиск по заказам..." /><kbd>⌘ K</kbd></label><button className="icon-btn notification-btn" aria-label="Уведомления" onClick={() => setNotice('Новых уведомлений нет')}><Icon name="bell" /><i /></button><div className="top-avatar">АК</div></div></header>
      <div className="content-area">
        {activePage === 'Заказы' ? <>
          <div className="page-heading"><div><div className="eyebrow">МАГАЗИН <span>·</span> УПРАВЛЕНИЕ</div><h1>Заказы <span className="heading-count">248</span></h1><p>Отслеживайте и управляйте заказами вашего магазина</p></div><button className="primary-btn" onClick={() => setNotice('Форма создания заказа')}><Icon name="plus" size={17} />Новый заказ</button></div>
          <section className="metrics-grid"><article className="metric-card"><div className="metric-top"><span>Всего заказов</span><span className="metric-icon violet"><Icon name="bag" size={17} /></span></div><div className="metric-value">248 <span className="trend positive">↗ 12,8%</span></div><small>по сравнению с прошлым месяцем</small><div className="sparkline spark-one"><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/></div></article><article className="metric-card"><div className="metric-top"><span>Общая выручка</span><span className="metric-icon green"><span>₽</span></span></div><div className="metric-value">₽ 1 284 300 <span className="trend positive">↗ 8,2%</span></div><small>по сравнению с прошлым месяцем</small><div className="sparkline spark-two"><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/></div></article><article className="metric-card"><div className="metric-top"><span>В обработке</span><span className="metric-icon amber"><Icon name="calendar" size={16} /></span></div><div className="metric-value">18 <span className="metric-note">заказов</span></div><small><b className="attention-dot"/>Требуют вашего внимания</small><div className="sparkline spark-three"><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/></div></article><article className="metric-card"><div className="metric-top"><span>Средний чек</span><span className="metric-icon blue"><Icon name="grid" size={16} /></span></div><div className="metric-value">₽ 5 178 <span className="trend positive">↗ 3,1%</span></div><small>по сравнению с прошлым месяцем</small><div className="sparkline spark-four"><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/></div></article></section>
          <section className="orders-panel"><div className="panel-heading"><div><h2>Все заказы</h2><p>Управляйте заказами и следите за их статусом</p></div><div className="panel-actions"><button className="secondary-btn" onClick={() => setNotice('Фильтры заказов')}><Icon name="filter" size={16} />Фильтры<span className="filter-count">2</span></button><button className="secondary-btn export-btn" onClick={() => setNotice('Экспорт заказов подготовлен')}><Icon name="download" size={16} />Экспорт</button><button className="square-btn" title="Настроить таблицу" onClick={() => setNotice('Перетащите заголовки колонок, чтобы изменить их порядок')}><Icon name="grid" size={16} /></button></div></div>
            <div className="table-toolbar"><div className="table-tabs"><button className={filter === 'Все заказы' ? 'selected' : ''} onClick={() => setFilter('Все заказы')}>Все заказы <span>248</span></button><button className={filter === 'В обработке' ? 'selected' : ''} onClick={() => setFilter('В обработке')}>В обработке <span>18</span></button><button className={filter === 'Выполнен' ? 'selected' : ''} onClick={() => setFilter('Выполнен')}>Выполнены <span>216</span></button><button className={filter === 'Отменён' ? 'selected' : ''} onClick={() => setFilter('Отменён')}>Отменены <span>14</span></button></div><div className="table-tools"><span className="group-label"><Icon name="grid" size={14} />Группировать:</span><button className="group-select" onClick={() => setNotice('Строки сгруппированы по статусу заказа')}>Статус заказа <Icon name="down" size={13} /></button></div></div>
            <div className="table-wrap"><table><thead><tr><th className="check-col"><input aria-label="Выбрать все заказы" type="checkbox" checked={allSelected} onChange={() => setSelected(allSelected ? selected.filter((id) => !filteredOrders.some((order) => order.id === id)) : [...new Set([...selected, ...filteredOrders.map((order) => order.id)])])} /></th>{columns.map((key) => <th key={key} draggable onDragStart={() => setDragged(key)} onDragOver={(event) => event.preventDefault()} onDrop={() => moveColumn(key)} onDragEnd={() => setDragged(null)} className={`${key === 'amount' ? 'align-right' : ''} ${dragged === key ? 'dragging' : ''}`}><span className="column-heading"><span className="drag-handle"><Icon name="grip" size={14} /></span>{columnLabels[key]}{key === 'date' && <span className="sort-arrow">↓</span>}</span></th>)}<th className="more-col" /></tr></thead><tbody>{groups.map((group) => { const rows = filteredOrders.filter((order) => order.status === group); if (!rows.length) return null; const isCollapsed = collapsedGroups.includes(group); return <React.Fragment key={group}><tr className="group-row"><td colSpan={columns.length + 2}><button onClick={() => setCollapsedGroups((current) => current.includes(group) ? current.filter((item) => item !== group) : [...current, group])} className="group-toggle"><Icon name={isCollapsed ? 'chevron' : 'down'} size={14} /><span className={`group-indicator ${statusClass(group)}`} />{group}<span className="group-total">{rows.length}</span></button></td></tr>{!isCollapsed && rows.map((order) => <tr key={order.id} className={selected.includes(order.id) ? 'row-selected' : ''}><td className="check-col"><input aria-label={`Выбрать ${order.id}`} type="checkbox" checked={selected.includes(order.id)} onChange={() => toggleSelected(order.id)} /></td>{columns.map((key) => <td key={key} className={key === 'amount' ? 'align-right' : ''}>{cell(order, key)}</td>)}<td className="more-col"><button className="row-more" aria-label={`Действия для ${order.id}`} onClick={() => setNotice(`Действия для заказа ${order.id}`)}><Icon name="more" size={17} /></button></td></tr>)}</React.Fragment>; })}</tbody></table>{filteredOrders.length === 0 && <div className="empty-state">Заказы не найдены. Попробуйте изменить запрос.</div>}</div>
            <div className="table-footer"><span>Показано <b>{filteredOrders.length ? 1 : 0}–{filteredOrders.length}</b> из <b>248</b> заказов</span><div className="pagination"><button disabled>Назад</button><button className="current-page">1</button><button>2</button><button>3</button><span>…</span><button>25</button><button>Вперёд <Icon name="chevron" size={13} /></button></div></div>
          </section>
        </> : <div className="placeholder-page"><div className="eyebrow">МАГАЗИН <span>·</span> УПРАВЛЕНИЕ</div><h1>{activePage}</h1><p>Раздел «{activePage}» готов к настройке.</p><button className="secondary-btn" onClick={() => setActivePage('Заказы')}><Icon name="bag" size={16} />Перейти к заказам</button></div>}
      </div>
      <footer className="page-footer"><span>© 2024 Mosaic. Все права защищены.</span><div><span>Документация</span><span>Поддержка</span><span>v2.4.0</span></div></footer>
      {notice && <div className="toast"><span className="toast-check">✓</span>{notice}<button onClick={() => setNotice('')}>×</button></div>}
      {selected.length > 0 && <div className="selection-bar"><span>Выбрано заказов: <b>{selected.length}</b></span><button onClick={() => setNotice('Статус выбранных заказов обновлён')}>Изменить статус</button><button onClick={() => setSelected([])}>Снять выделение</button></div>}
    </main>
  </div>;
}
