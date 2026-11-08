import { useMemo, useState } from 'react';
import './app.css';

type IconName = 'home' | 'users' | 'box' | 'settings' | 'search' | 'bell' | 'chevron' | 'plus' | 'download' | 'filter' | 'more' | 'calendar' | 'grip' | 'check' | 'arrow' | 'menu';

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true as const };
  const paths: Record<IconName, React.ReactNode> = {
    home: <><path d="m3.5 10 8.5-7 8.5 7"/><path d="M5.5 9v11h13V9M9 20v-6h6v6"/></>,
    users: <><circle cx="9" cy="8" r="3.2"/><path d="M3 20c.2-3.5 2.2-5.5 6-5.5s5.8 2 6 5.5M16 5.2a3 3 0 0 1 0 5.8M18 14c1.9.6 2.9 2 3 4.3"/></>,
    box: <><path d="m12 3 9 4.5v9L12 21l-9-4.5v-9L12 3Z"/><path d="m3.5 7.7 8.5 4.5 8.5-4.5M12 12.2V21M7.5 5.3l9 4.7"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.1.9-1.4 2.4-1.4-.5a7.9 7.9 0 0 1-1.6.9l-.3 1.5h-2.8l-.3-1.5a7.9 7.9 0 0 1-1.6-.9l-1.4.5-1.4-2.4 1.1-.9a7 7 0 0 1 0-1.9l-1.1-.9 1.4-2.4 1.4.5a7.9 7.9 0 0 1 1.6-.9l.3-1.5h2.8l.3 1.5a7.9 7.9 0 0 1 1.6.9l1.4-.5 1.4 2.4-1.1.9a7 7 0 0 1-.1 1.8Z" transform="translate(-1 -1) scale(.95)"/></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5"/><path d="M5 17v4h14v-4"/></>,
    filter: <><path d="M4 6h16M7 12h10m-7 6h4"/><circle cx="8" cy="6" r="1.5" fill="currentColor"/><circle cx="15" cy="12" r="1.5" fill="currentColor"/></>,
    more: <><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></>,
    calendar: <><rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M7.5 3v4M16.5 3v4M3.5 10h17"/></>,
    grip: <><circle cx="8" cy="7" r=".7" fill="currentColor"/><circle cx="16" cy="7" r=".7" fill="currentColor"/><circle cx="8" cy="12" r=".7" fill="currentColor"/><circle cx="16" cy="12" r=".7" fill="currentColor"/><circle cx="8" cy="17" r=".7" fill="currentColor"/><circle cx="16" cy="17" r=".7" fill="currentColor"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

type Status = 'В обработке' | 'Доставлен' | 'В пути' | 'Отменён';
type Order = { id: string; customer: string; initials: string; color: string; email: string; date: string; amount: string; status: Status; method: string };

const orders: Order[] = [
  { id: 'ORD-2847', customer: 'Анна Смирнова', initials: 'АС', color: 'lavender', email: 'anna.smirnova@mail.ru', date: 'Сегодня, 14:32', amount: '12 490 ₽', status: 'В обработке', method: 'Курьер' },
  { id: 'ORD-2846', customer: 'Михаил Петров', initials: 'МП', color: 'peach', email: 'm.petrov@gmail.com', date: 'Сегодня, 13:08', amount: '8 250 ₽', status: 'В обработке', method: 'Самовывоз' },
  { id: 'ORD-2845', customer: 'Елена Козлова', initials: 'ЕК', color: 'mint', email: 'elena.k@ya.ru', date: 'Сегодня, 11:47', amount: '24 800 ₽', status: 'В обработке', method: 'Курьер' },
  { id: 'ORD-2844', customer: 'Дмитрий Волков', initials: 'ДВ', color: 'blue', email: 'd.volkov@mail.ru', date: 'Сегодня, 10:15', amount: '5 690 ₽', status: 'В пути', method: 'Пункт выдачи' },
  { id: 'ORD-2843', customer: 'Ольга Новикова', initials: 'ОН', color: 'pink', email: 'olga.novikova@gmail.com', date: 'Вчера, 18:26', amount: '16 300 ₽', status: 'В пути', method: 'Курьер' },
  { id: 'ORD-2842', customer: 'Александр Морозов', initials: 'АМ', color: 'yellow', email: 'a.morozov@mail.ru', date: 'Вчера, 16:52', amount: '3 450 ₽', status: 'Доставлен', method: 'Самовывоз' },
  { id: 'ORD-2841', customer: 'Мария Фёдорова', initials: 'МФ', color: 'mint', email: 'maria.fed@gmail.com', date: 'Вчера, 15:19', amount: '9 990 ₽', status: 'Доставлен', method: 'Пункт выдачи' },
  { id: 'ORD-2840', customer: 'Иван Соколов', initials: 'ИС', color: 'blue', email: 'i.sokolov@mail.ru', date: 'Вчера, 12:03', amount: '18 750 ₽', status: 'Отменён', method: 'Курьер' },
];

type Column = { key: string; title: string };
const initialColumns: Column[] = [
  { key: 'order', title: 'Заказ' }, { key: 'customer', title: 'Покупатель' }, { key: 'date', title: 'Дата' },
  { key: 'amount', title: 'Сумма' }, { key: 'status', title: 'Статус' }, { key: 'method', title: 'Доставка' },
];
const statusOrder: Status[] = ['В обработке', 'В пути', 'Доставлен', 'Отменён'];
const statusClass: Record<Status, string> = { 'В обработке': 'processing', 'В пути': 'transit', 'Доставлен': 'delivered', 'Отменён': 'cancelled' };

export function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState('Заказы');
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Все заказы');
  const [selected, setSelected] = useState<string[]>([]);
  const [columns, setColumns] = useState(initialColumns);
  const [dragged, setDragged] = useState<string | null>(null);
  const [openGroups, setOpenGroups] = useState<Status[]>(statusOrder);
  const [grouped, setGrouped] = useState(true);
  const [notice, setNotice] = useState('');

  const visibleOrders = useMemo(() => orders.filter(order => {
    const matchesQuery = `${order.id} ${order.customer} ${order.email}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = activeFilter === 'Все заказы' || (activeFilter === 'Ожидают обработки' ? order.status === 'В обработке' : order.status === 'Доставлен');
    return matchesQuery && matchesFilter;
  }), [query, activeFilter]);
  const allSelected = visibleOrders.length > 0 && visibleOrders.every(order => selected.includes(order.id));

  const toggleSelected = (id: string) => setSelected(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  const toggleAll = () => setSelected(allSelected ? selected.filter(id => !visibleOrders.some(order => order.id === id)) : [...new Set([...selected, ...visibleOrders.map(order => order.id)])]);
  const moveColumn = (targetKey: string) => {
    if (!dragged || dragged === targetKey) return;
    const from = columns.findIndex(column => column.key === dragged);
    const to = columns.findIndex(column => column.key === targetKey);
    const next = [...columns];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setColumns(next);
    setDragged(null);
  };
  const toggleGroup = (status: Status) => setOpenGroups(current => current.includes(status) ? current.filter(item => item !== status) : [...current, status]);
  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(''), 2600); };

  const renderCell = (order: Order, key: string) => {
    if (key === 'order') return <span className="order-id">{order.id}</span>;
    if (key === 'customer') return <div className="customer-cell"><span className={`avatar ${order.color}`}>{order.initials}</span><span><b>{order.customer}</b><small>{order.email}</small></span></div>;
    if (key === 'date') return <span className="date-cell">{order.date}</span>;
    if (key === 'amount') return <span className="amount-cell">{order.amount}</span>;
    if (key === 'status') return <span className={`status-pill ${statusClass[order.status]}`}><i />{order.status}</span>;
    return <span className="delivery-cell">{order.method}</span>;
  };

  return <div className="app-shell">
    <aside className={`sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="brand-row"><div className="brand-mark"><span /><span /><span /></div>{!collapsed && <span className="brand-name">nord<span>shop</span></span>}<button className="collapse-btn" aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'} onClick={() => setCollapsed(!collapsed)}><Icon name="menu" size={19} /></button></div>
      <div className="workspace-switch"><span className="workspace-avatar">N</span>{!collapsed && <><span className="workspace-name">Nord shop<small>Рабочее пространство</small></span><span className="workspace-chevrons">⌃<br/>⌄</span></>}</div>
      <div className="nav-label">{!collapsed && 'МЕНЮ'}</div>
      <nav className="side-nav">{[['Главная', 'home'], ['Пользователи', 'users'], ['Заказы', 'box'], ['Настройки', 'settings']].map(([label, icon]) => <button key={label} className={`nav-item ${activeNav === label ? 'active' : ''}`} title={collapsed ? label : undefined} onClick={() => { setActiveNav(label); if (label !== 'Заказы') notify(`Раздел «${label}» выбран`); }}><Icon name={icon as IconName} /><span>{!collapsed && label}</span>{label === 'Заказы' && !collapsed && <b className="nav-count">12</b>}</button>)}</nav>
      {!collapsed && <div className="sidebar-bottom"><div className="help-card"><div className="help-icon">✳</div><b>Нужна помощь?</b><p>Наша команда всегда на связи</p><button onClick={() => notify('Свяжитесь с нами: help@nordshop.ru')}>Центр поддержки <Icon name="arrow" size={14}/></button></div><div className="profile"><span className="profile-avatar">АК</span><span className="profile-name"><b>Алексей Ким</b><small>Администратор</small></span><button aria-label="Меню профиля"><Icon name="more" /></button></div></div>}
    </aside>

    <main className="main-area">
      <header className="topbar"><div className="breadcrumbs"><span>Магазин</span><Icon name="chevron" size={14}/><b>{activeNav}</b></div><div className="topbar-actions"><div className="system-status"><span />Все системы работают</div><button className="icon-button notification" aria-label="Уведомления" onClick={() => notify('Новых уведомлений нет')}><Icon name="bell"/><i /></button><span className="top-divider"/><button className="top-user"><span className="profile-avatar">АК</span><span><b>Алексей Ким</b><small>Администратор</small></span><Icon name="chevron" size={14}/></button></div></header>
      <div className="page-content">
        <div className="page-heading"><div><div className="eyebrow">МАГАЗИН <span>/</span> УПРАВЛЕНИЕ</div><h1>Заказы <span className="title-count">248</span></h1><p>Отслеживайте и управляйте заказами вашего магазина</p></div><div className="heading-actions"><button className="button secondary" onClick={() => notify('Отчёт по заказам подготовлен')}><Icon name="download" size={16}/>Экспорт</button><button className="button primary" onClick={() => notify('Создание нового заказа')}><Icon name="plus" size={17}/>Новый заказ</button></div></div>

        <section className="metric-grid" aria-label="Сводка по заказам">
          <Metric title="Всего заказов" value="248" delta="+12,8%" note="к прошлому месяцу" tone="violet" icon="box" spark={[22,35,27,45,38,56,44,66,51,75,61,87]} />
          <Metric title="Ожидают обработки" value="18" delta="+4" note="за последние 24 часа" tone="amber" icon="calendar" spark={[34,27,39,34,52,44,48,39,57,52,69,62]} />
          <Metric title="В пути" value="32" delta="+8,2%" note="к прошлому месяцу" tone="blue" icon="arrow" spark={[20,30,25,42,35,48,43,61,52,64,60,80]} />
          <Metric title="Доставлено" value="186" delta="+18,4%" note="к прошлому месяцу" tone="green" icon="check" spark={[18,31,25,39,35,50,46,62,57,68,65,88]} />
        </section>

        <section className="orders-panel">
          <div className="panel-header"><div><h2>Все заказы</h2><p>Управляйте заказами и отслеживайте их статус</p></div><button className="button secondary compact" onClick={() => setGrouped(!grouped)}><Icon name="grip" size={16}/>{grouped ? 'Сгруппировано по статусу' : 'Группировать по статусу'}<span className={`toggle ${grouped ? 'on' : ''}`}><i /></span></button></div>
          <div className="table-toolbar"><div className="tabs">{['Все заказы', 'Ожидают обработки', 'Доставлены'].map((tab, index) => <button key={tab} className={`tab ${activeFilter === tab ? 'selected' : ''}`} onClick={() => setActiveFilter(tab)}>{tab}<span>{[248, 18, 186][index]}</span></button>)}</div><div className="toolbar-actions"><label className="search-box"><Icon name="search" size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск заказов..."/><kbd>⌘ K</kbd></label><button className="button secondary filter-btn" onClick={() => notify('Фильтры заказов')}><Icon name="filter" size={16}/>Фильтры<span className="filter-dot"/></button><button className="square-button" aria-label="Дополнительные действия" onClick={() => notify('Дополнительные действия')}><Icon name="more"/></button></div></div>
          {selected.length > 0 && <div className="selection-bar"><span><b>{selected.length}</b> заказов выбрано</span><button onClick={() => notify('Заказы отмечены как обработанные')}>Отметить обработанными</button><button onClick={() => setSelected([])}>Снять выделение</button></div>}
          <div className="table-scroll"><table className="orders-table"><thead><tr><th className="check-col"><input type="checkbox" aria-label="Выбрать все заказы" checked={allSelected} onChange={toggleAll}/></th>{columns.map(column => <th key={column.key} draggable onDragStart={() => setDragged(column.key)} onDragOver={event => event.preventDefault()} onDrop={() => moveColumn(column.key)} onDragEnd={() => setDragged(null)} className={dragged === column.key ? 'dragging' : ''}><span className="drag-handle"><Icon name="grip" size={14}/></span>{column.title}{column.key === 'date' && <span className="sort-indicator">↓</span>}</th>)}<th className="actions-col" /></tr></thead><tbody>
            {visibleOrders.length === 0 && <tr><td colSpan={columns.length + 2} className="empty-state">Заказы не найдены. Измените запрос или фильтр.</td></tr>}
            {grouped ? statusOrder.map(status => { const rows = visibleOrders.filter(order => order.status === status); if (!rows.length) return null; const opened = openGroups.includes(status); return <Group key={status} status={status} count={rows.length} opened={opened} onToggle={() => toggleGroup(status)}>{rows.map(order => <OrderRow key={order.id} order={order} columns={columns} selected={selected.includes(order.id)} onSelect={() => toggleSelected(order.id)} renderCell={renderCell} onMore={() => notify(`Действия для ${order.id}`)}/>)}</Group>; }) : visibleOrders.map(order => <OrderRow key={order.id} order={order} columns={columns} selected={selected.includes(order.id)} onSelect={() => toggleSelected(order.id)} renderCell={renderCell} onMore={() => notify(`Действия для ${order.id}`)}/>)}
          </tbody></table></div>
          <footer className="table-footer"><span>Показано <b>{visibleOrders.length ? 1 : 0}–{visibleOrders.length}</b> из <b>{activeFilter === 'Все заказы' && !query ? 248 : visibleOrders.length}</b> заказов</span><div className="pagination"><button disabled>← Предыдущая</button><button className="page-active">1</button><button>2</button><button>3</button><span>…</span><button>25</button><button>Следующая →</button></div></footer>
        </section>
        <div className="page-foot"><span>© 2024 Nord shop</span><span>Последнее обновление: только что</span></div>
      </div>
    </main>
    {notice && <div className="toast"><span className="toast-check"><Icon name="check" size={14}/></span>{notice}</div>}
  </div>;
}

function Metric({ title, value, delta, note, tone, icon, spark }: { title: string; value: string; delta: string; note: string; tone: string; icon: IconName; spark: number[] }) {
  return <article className="metric-card"><div className="metric-top"><span>{title}</span><span className={`metric-icon ${tone}`}><Icon name={icon} size={17}/></span></div><div className="metric-bottom"><div><strong>{value}</strong><div className="metric-note"><b className={tone === 'amber' ? 'neutral-delta' : ''}>{delta}</b> {note}</div></div><div className={`sparkline ${tone}`}>{spark.map((height, index) => <i key={index} style={{ height: `${height}%` }}/>)}</div></div></article>;
}

function Group({ status, count, opened, onToggle, children }: { status: Status; count: number; opened: boolean; onToggle: () => void; children: React.ReactNode }) {
  return <><tr className="group-row"><td colSpan={8}><button className={`group-toggle ${opened ? 'opened' : ''}`} onClick={onToggle}><Icon name="chevron" size={15}/><span className={`group-dot ${statusClass[status]}`}/><b>{status}</b><span className="group-count">{count}</span></button><span className="group-line"/></td></tr>{opened && children}</>;
}

function OrderRow({ order, columns, selected, onSelect, renderCell, onMore }: { order: Order; columns: Column[]; selected: boolean; onSelect: () => void; renderCell: (order: Order, key: string) => React.ReactNode; onMore: () => void }) {
  return <tr className={`order-row ${selected ? 'row-selected' : ''}`}><td className="check-col"><input type="checkbox" aria-label={`Выбрать ${order.id}`} checked={selected} onChange={onSelect}/></td>{columns.map(column => <td key={column.key}>{renderCell(order, column.key)}</td>)}<td className="actions-col"><button className="row-more" aria-label={`Действия с заказом ${order.id}`} onClick={onMore}><Icon name="more" size={18}/></button></td></tr>;
}
