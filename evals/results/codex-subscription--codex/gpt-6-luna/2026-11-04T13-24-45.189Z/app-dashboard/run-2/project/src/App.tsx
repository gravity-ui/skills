import React, { useMemo, useState } from 'react';
import './app.css';

type OrderStatus = 'В обработке' | 'Отправлен' | 'Доставлен' | 'Отменён';
type Order = { id: string; customer: string; initials: string; email: string; date: string; product: string; amount: number; status: OrderStatus; color: string; channel: string };
type Column = { key: keyof Order | 'customer'; label: string; className?: string };

const orders: Order[] = [
  { id: 'ORD-2841', customer: 'Анастасия Морозова', initials: 'АМ', email: 'a.morozova@mail.ru', date: 'Сегодня, 14:32', product: 'Кресло Runa', amount: 24_900, status: 'В обработке', color: 'lilac', channel: 'Сайт' },
  { id: 'ORD-2840', customer: 'Михаил Волков', initials: 'МВ', email: 'm.volkov@gmail.com', date: 'Сегодня, 13:18', product: 'Настольная лампа N°4', amount: 8_400, status: 'Отправлен', color: 'peach', channel: 'Сайт' },
  { id: 'ORD-2839', customer: 'Екатерина Белова', initials: 'ЕБ', email: 'kate.belova@yandex.ru', date: 'Сегодня, 12:56', product: 'Стол журнальный Line', amount: 32_000, status: 'Доставлен', color: 'mint', channel: 'Маркетплейс' },
  { id: 'ORD-2838', customer: 'Дмитрий Соколов', initials: 'ДС', email: 'dsokolov@mail.ru', date: 'Сегодня, 11:40', product: 'Ваза Forma, 2 шт.', amount: 6_200, status: 'В обработке', color: 'blue', channel: 'Сайт' },
  { id: 'ORD-2837', customer: 'Полина Кузнецова', initials: 'ПК', email: 'polina.k@inbox.ru', date: 'Сегодня, 10:22', product: 'Диван Soft, бежевый', amount: 84_500, status: 'Отправлен', color: 'rose', channel: 'Шоурум' },
  { id: 'ORD-2836', customer: 'Артём Фёдоров', initials: 'АФ', email: 'art.fedorov@gmail.com', date: 'Вчера, 18:05', product: 'Кресло Runa', amount: 24_900, status: 'Доставлен', color: 'sand', channel: 'Сайт' },
  { id: 'ORD-2835', customer: 'Валерия Смирнова', initials: 'ВС', email: 'val.smirnova@mail.ru', date: 'Вчера, 16:47', product: 'Плед Waffle, молочный', amount: 4_800, status: 'Отменён', color: 'mint', channel: 'Маркетплейс' },
  { id: 'ORD-2834', customer: 'Илья Андреев', initials: 'ИА', email: 'ilya.andreev@mail.ru', date: 'Вчера, 15:12', product: 'Стол журнальный Line', amount: 32_000, status: 'В обработке', color: 'blue', channel: 'Сайт' },
  { id: 'ORD-2833', customer: 'Мария Лебедева', initials: 'МЛ', email: 'm.lebedeva@yandex.ru', date: 'Вчера, 12:30', product: 'Настольная лампа N°4', amount: 8_400, status: 'Отправлен', color: 'lilac', channel: 'Шоурум' },
  { id: 'ORD-2832', customer: 'Никита Павлов', initials: 'НП', email: 'n.pavlov@gmail.com', date: 'Вчера, 11:06', product: 'Кресло Runa', amount: 24_900, status: 'Доставлен', color: 'peach', channel: 'Сайт' },
];
const initialColumns: Column[] = [
  { key: 'id', label: 'Заказ' }, { key: 'customer', label: 'Покупатель' }, { key: 'date', label: 'Дата' },
  { key: 'product', label: 'Товар' }, { key: 'amount', label: 'Сумма', className: 'amount-col' }, { key: 'status', label: 'Статус' }, { key: 'channel', label: 'Канал' },
];
const nav = [
  { label: 'Главная', icon: 'grid' }, { label: 'Пользователи', icon: 'users', count: '24' },
  { label: 'Заказы', icon: 'bag', count: '12' }, { label: 'Настройки', icon: 'settings' },
];

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const paths: Record<string, React.ReactNode> = {
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></>,
    users: <><path d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20"/><circle cx="9.5" cy="7.5" r="3.5"/><path d="M17 4.2a3.5 3.5 0 0 1 0 6.7M21 20v-1.5a4 4 0 0 0-3-3.87"/></>,
    bag: <><path d="M4 8h16l-1.2 12H5.2L4 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.2.9-1.2 2.1-1.5-.6a8 8 0 0 1-1.6.9l-.3 1.6h-2.4l-.3-1.6a8 8 0 0 1-1.7-.9l-1.5.6-1.2-2.1 1.3-1a7 7 0 0 1 0-1.9l-1.3-1 1.2-2.1 1.5.6a8 8 0 0 1 1.7-.9l.3-1.6h2.4l.3 1.6a8 8 0 0 1 1.6.9l1.5-.6 1.2 2.1-1.2.9a7 7 0 0 1-.1 2Z" transform="translate(-1 -1)"/></>,
    search: <><circle cx="10.8" cy="10.8" r="6.3"/><path d="m15.5 15.5 4.2 4.2"/></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    down: <path d="m7 10 5 5 5-5"/>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    sliders: <><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></>,
    more: <><circle cx="5" cy="12" r=".8" fill="currentColor"/><circle cx="12" cy="12" r=".8" fill="currentColor"/><circle cx="19" cy="12" r=".8" fill="currentColor"/></>,
    export: <><path d="M12 15V3m-4 4 4-4 4 4"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></>,
    collapse: <><path d="M4 5h16M4 12h16M4 19h16"/><path d="m10 9 3 3-3 3"/></>,
    spark: <><path d="m12 3 1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3Z"/><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"/></>,
  };
  return <svg {...common}>{paths[name] ?? paths.grid}</svg>;
}

const formatMoney = (amount: number) => new Intl.NumberFormat('ru-RU').format(amount) + ' ₽';

export function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [columns, setColumns] = useState(initialColumns);
  const [dragged, setDragged] = useState<string | null>(null);
  const [grouped, setGrouped] = useState(true);
  const [openGroups, setOpenGroups] = useState<OrderStatus[]>(['В обработке', 'Отправлен', 'Доставлен', 'Отменён']);
  const [query, setQuery] = useState('');
  const [activeNav, setActiveNav] = useState('Заказы');
  const filtered = useMemo(() => orders.filter(o => `${o.id} ${o.customer} ${o.email} ${o.product}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const statuses: OrderStatus[] = ['В обработке', 'Отправлен', 'Доставлен', 'Отменён'];
  const allVisibleSelected = filtered.length > 0 && filtered.every(o => selected.includes(o.id));
  const toggleRow = (id: string) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const moveColumn = (target: string) => {
    if (!dragged || dragged === target) return;
    setColumns(current => { const next = [...current]; const from = next.findIndex(c => c.key === dragged); const to = next.findIndex(c => c.key === target); const [item] = next.splice(from, 1); next.splice(to, 0, item); return next; });
    setDragged(null);
  };
  const renderCell = (order: Order, column: Column) => {
    switch (column.key) {
      case 'id': return <span className="order-id">{order.id}</span>;
      case 'customer': return <div className="customer"><span className={`avatar ${order.color}`}>{order.initials}</span><span><b>{order.customer}</b><small>{order.email}</small></span></div>;
      case 'date': return <span className="date-cell">{order.date}</span>;
      case 'product': return <span className="product-cell">{order.product}</span>;
      case 'amount': return <b className="amount-cell">{formatMoney(order.amount)}</b>;
      case 'status': return <span className={`status status-${order.status === 'В обработке' ? 'pending' : order.status === 'Отправлен' ? 'sent' : order.status === 'Доставлен' ? 'done' : 'cancelled'}`}><i />{order.status}</span>;
      case 'channel': return <span className="channel-cell"><span className="channel-mark">{order.channel === 'Сайт' ? '↗' : order.channel === 'Шоурум' ? '⌂' : '◈'}</span>{order.channel}</span>;
      default: return null;
    }
  };

  return <div className="app-shell">
    <aside className={`sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="brand-row"><div className="brand-symbol"><span /></div>{!collapsed && <div className="brand-name">forma<span>.</span><small>ПАНЕЛЬ УПРАВЛЕНИЯ</small></div>}<button className="collapse-btn" onClick={() => setCollapsed(!collapsed)} title={collapsed ? 'Развернуть меню' : 'Свернуть меню'}><Icon name="collapse" size={19} /></button></div>
      {!collapsed && <div className="workspace-switch"><div className="workspace-logo">F</div><span><b>Forma studio</b><small>Интернет-магазин</small></span><Icon name="down" size={15} /></div>}
      <div className="nav-caption">{!collapsed && 'МЕНЮ'}</div>
      <nav className="side-nav">{nav.map(item => <button key={item.label} title={collapsed ? item.label : undefined} className={`nav-item ${activeNav === item.label ? 'active' : ''}`} onClick={() => setActiveNav(item.label)}><Icon name={item.icon} size={19} /><span>{!collapsed && item.label}</span>{!collapsed && item.count && <small>{item.count}</small>}</button>)}</nav>
      {!collapsed && <div className="sidebar-bottom"><div className="help-card"><div className="help-art"><span /><span /><span /></div><b>Нужна помощь?</b><p>Мы всегда на связи и готовы помочь.</p><button onClick={() => alert('Напишите нам: hello@forma.studio')}>Связаться с нами <Icon name="chevron" size={14}/></button></div><div className="profile-row"><div className="profile-avatar">ЕК</div><span><b>Елена Крылова</b><small>Администратор</small></span><Icon name="more" size={18}/></div></div>}
      {collapsed && <div className="collapsed-profile">ЕК</div>}
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="breadcrumbs"><span>Управление</span><Icon name="chevron" size={14}/><b>{activeNav}</b></div><div className="top-actions"><button className="icon-button notification" aria-label="Уведомления"><Icon name="bell" size={19}/><i /></button><div className="top-divider"/><div className="top-user"><div className="profile-avatar small">ЕК</div><span>Елена К.</span><Icon name="down" size={15}/></div></div></header>
      <div className="page-content">
        <div className="page-heading"><div><div className="eyebrow">СРЕДА, 12 ИЮНЯ 2024</div><h1>Заказы <span className="title-count">128</span></h1><p className="page-subtitle">Следите за заказами и управляйте ими в одном месте.</p></div><div className="heading-actions"><button className="button secondary"><Icon name="export" size={16}/>Экспорт</button><button className="button primary" onClick={() => alert('Форма создания заказа')}><Icon name="plus" size={17}/>Создать заказ</button></div></div>
        <section className="metrics-grid">
          <div className="metric-card"><div className="metric-top"><span>Выручка за месяц</span><span className="metric-icon green"><Icon name="spark" size={16}/></span></div><div className="metric-value">1 284 500 <small>₽</small></div><div className="metric-foot"><span className="trend up">↗ 12,8%</span><span>к прошлому месяцу</span><div className="sparkline"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></div></div>
          <div className="metric-card"><div className="metric-top"><span>Новые заказы</span><span className="metric-icon violet"><Icon name="bag" size={16}/></span></div><div className="metric-value">128</div><div className="metric-foot"><span className="trend up">↗ 8,2%</span><span>к прошлому месяцу</span><div className="sparkline purple"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></div></div>
          <div className="metric-card"><div className="metric-top"><span>Средний чек</span><span className="metric-icon amber"><span>₽</span></span></div><div className="metric-value">10 035 <small>₽</small></div><div className="metric-foot"><span className="trend down">↘ 2,4%</span><span>к прошлому месяцу</span><div className="sparkline orange"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></div></div>
          <div className="metric-card"><div className="metric-top"><span>В обработке</span><span className="metric-icon blue"><span className="processing-dot"/></span></div><div className="metric-value">12 <small className="metric-unit">заказов</small></div><div className="metric-foot"><span className="metric-note">Требуют вашего внимания</span><div className="sparkline blue-line"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></div></div>
        </section>
        <section className="orders-section">
          <div className="section-top"><div><h2>Все заказы <span>128</span></h2><p>Управляйте текущими заказами вашего магазина</p></div><button className="range-button">Последние 30 дней <Icon name="down" size={15}/></button></div>
          <div className="table-toolbar"><div className="toolbar-left"><label className="search-box"><Icon name="search" size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск заказов..."/><kbd>⌘ K</kbd></label><button className="filter-button" onClick={() => setGrouped(!grouped)}><Icon name="sliders" size={16}/>Фильтры<span className="filter-count">2</span></button><button className={`group-button ${grouped ? 'on' : ''}`} onClick={() => setGrouped(!grouped)}><span className="group-icon">≡</span>Группировать: <b>{grouped ? 'Статус' : 'Нет'}</b><Icon name="down" size={14}/></button></div><button className="icon-button table-settings" title="Настроить таблицу"><Icon name="sliders" size={17}/></button></div>
          {selected.length > 0 && <div className="selection-bar"><span>Выбрано: <b>{selected.length}</b></span><button onClick={() => setSelected([])}>Снять выделение</button><span className="selection-spacer"/><button className="selection-action">Изменить статус <Icon name="down" size={14}/></button><button className="selection-action">Экспортировать</button><button className="selection-more"><Icon name="more" size={17}/></button></div>}
          <div className="table-scroll"><table className="orders-table"><thead><tr><th className="check-column"><input type="checkbox" checked={allVisibleSelected} onChange={() => setSelected(allVisibleSelected ? selected.filter(id => !filtered.some(o => o.id === id)) : [...new Set([...selected, ...filtered.map(o => o.id)])])}/></th>{columns.map(column => <th key={column.key} className={column.className} draggable onDragStart={() => setDragged(String(column.key))} onDragOver={e => e.preventDefault()} onDrop={() => moveColumn(String(column.key))} onDragEnd={() => setDragged(null)}><span className={dragged === column.key ? 'dragging' : ''}>{column.label}<span className="drag-dots">⠿</span></span></th>)}<th className="row-actions-head"/></tr></thead><tbody>
            {grouped ? statuses.map(status => { const group = filtered.filter(o => o.status === status); if (!group.length) return null; const isOpen = openGroups.includes(status); return <React.Fragment key={status}><tr className="group-row"><td colSpan={columns.length + 2}><button onClick={() => setOpenGroups(isOpen ? openGroups.filter(s => s !== status) : [...openGroups, status])}><Icon name={isOpen ? 'down' : 'chevron'} size={15}/><span className={`group-status-dot ${status === 'В обработке' ? 'pending' : status === 'Отправлен' ? 'sent' : status === 'Доставлен' ? 'done' : 'cancelled'}`}/><b>{status}</b><small>{group.length} {group.length === 1 ? 'заказ' : group.length > 1 && group.length < 5 ? 'заказа' : 'заказов'}</small></button></td></tr>{isOpen && group.map(order => <tr key={order.id} className={selected.includes(order.id) ? 'selected-row' : ''}><td className="check-column"><input type="checkbox" checked={selected.includes(order.id)} onChange={() => toggleRow(order.id)}/></td>{columns.map(column => <td key={column.key}>{renderCell(order, column)}</td>)}<td className="row-actions"><button aria-label="Действия с заказом"><Icon name="more" size={17}/></button></td></tr>)}</React.Fragment>}) : filtered.map(order => <tr key={order.id} className={selected.includes(order.id) ? 'selected-row' : ''}><td className="check-column"><input type="checkbox" checked={selected.includes(order.id)} onChange={() => toggleRow(order.id)}/></td>{columns.map(column => <td key={column.key}>{renderCell(order, column)}</td>)}<td className="row-actions"><button aria-label="Действия с заказом"><Icon name="more" size={17}/></button></td></tr>)}
            {filtered.length === 0 && <tr><td colSpan={columns.length + 2} className="empty-state">Заказы не найдены. Попробуйте изменить запрос.</td></tr>}
          </tbody></table></div>
          <div className="table-footer"><span>Показано <b>{filtered.length ? 1 : 0}–{filtered.length}</b> из <b>128</b> заказов</span><div className="pagination"><button disabled>←</button><button className="current-page">1</button><button>2</button><button>3</button><span>…</span><button>13</button><button>→</button></div><button className="per-page">10 на странице <Icon name="down" size={14}/></button></div>
        </section>
        <footer className="page-footer"><span>© 2024 Forma Studio</span><span><a>База знаний</a><a>Поддержка</a><span className="status-online"><i/>Все системы работают</span></span></footer>
      </div>
    </main>
  </div>;
}
