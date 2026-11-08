import {useEffect, useMemo, useRef, useState, type ReactNode} from 'react';
import {Icon} from './components/Icon';
import {VisualizationWidget} from './components/VisualizationWidget';
import type {ChartMode, TimeRange} from './components/charts/types';
import {createData, END_DATE, transactions} from './data';
import './styles.css';

const rubles = (v: number) => `${Math.round(v).toLocaleString('ru-RU')} ₽`;
function Sparkline({variant = 0, green = false}: {variant?: number; green?: boolean}) {
  const shapes = ['0,36 7,32 14,34 21,24 28,29 35,19 42,22 49,13 56,18 63,8 70,11 77,5 84,8 92,1', '0,35 7,32 14,34 21,29 28,31 35,22 42,25 49,18 56,20 63,12 70,16 77,8 84,10 92,2', '0,27 7,29 14,19 21,24 28,21 35,24 42,14 49,18 56,12 63,15 70,6 77,10 84,4 92,7'];
  return <svg viewBox="0 0 94 42" className={`sparkline ${green ? 'green' : ''}`} aria-hidden="true"><defs><linearGradient id={`spark-${variant}-${green}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="currentColor" stopOpacity=".16"/><stop offset="1" stopColor="currentColor" stopOpacity="0"/></linearGradient></defs><polygon points={`${shapes[variant]} 92,42 0,42`} fill={`url(#spark-${variant}-${green})`}/><polyline points={shapes[variant]} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/></svg>;
}
function Modal({title, children, onClose, wide = false}: {title: string; children: ReactNode; onClose: () => void; wide?: boolean}) {
  const element = useRef<HTMLElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    element.current?.focus();
    return () => {document.body.style.overflow = oldOverflow; previous?.focus();};
  }, []);
  useEffect(() => {const onKey = (e: KeyboardEvent) => {if (e.key === 'Escape') onClose();}; document.addEventListener('keydown', onKey); return () => document.removeEventListener('keydown', onKey);}, [onClose]);
  return <div className="modal-backdrop" onClick={onClose}><section ref={element} tabIndex={-1} className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()} onKeyDown={e => {
    if (e.key !== 'Tab') return;
    const items = element.current?.querySelectorAll<HTMLElement>('button, input, select, a[href], [tabindex="0"]');
    if (!items?.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === element.current)) {e.preventDefault(); last.focus();}
    else if (!e.shiftKey && document.activeElement === last) {e.preventDefault(); first.focus();}
  }}><div className="modal-title"><h2>{title}</h2><button className="icon-button" aria-label="Закрыть" onClick={onClose}><Icon name="close"/></button></div>{children}</section></div>;
}

export function App() {
  const [mode, setMode] = useState<ChartMode>('sales');
  const [range, setRange] = useState<TimeRange>('30d');
  const [nav, setNav] = useState('Обзор');
  const [modal, setModal] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [notifications, setNotifications] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [allOrders, setAllOrders] = useState(false);
  const [channel, setChannel] = useState('Все каналы');
  const [selectedOrder, setSelectedOrder] = useState<typeof transactions[number] | null>(null);
  const [endDate, setEndDate] = useState(END_DATE);
  const [dateInput, setDateInput] = useState('2026-10-28');
  const [live, setLive] = useState(true);
  const [tick, setTick] = useState(0);
  const [mobileNav, setMobileNav] = useState(false);
  const [projectName, setProjectName] = useState('Acme Studio');
  const [draftName, setDraftName] = useState('Acme Studio');
  const data = useMemo(() => createData(mode, range, endDate, tick), [mode, range, endDate, tick]);
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const isSales = mode === 'sales';
  const rangeDays = ({'7d': 7, '30d': 30, '90d': 90})[range];
  const orders = Math.round(1248 * rangeDays / 30);
  const visibleTransactions = transactions.filter(t => channel === 'Все каналы' || t.channel === channel).slice(0, allOrders ? 6 : 4);
  const notify = (message: string) => setToast(message);
  useEffect(() => {if (!toast) return; const timer = setTimeout(() => setToast(''), 3600); return () => clearTimeout(timer);}, [toast]);
  useEffect(() => {if (mode !== 'monitoring' || !live) return; const timer = setInterval(() => setTick(t => t + 3), 3000); return () => clearInterval(timer);}, [mode, live]);
  useEffect(() => {const onKey = (e: KeyboardEvent) => {if ((e.metaKey || e.ctrlKey) && e.key === 'k') {e.preventDefault(); setModal('search');}}; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);}, []);
  function navigate(name: string) {
    setMobileNav(false);
    if (name === 'Продажи') {setMode('sales'); setNav(name);}
    else if (name === 'Мониторинг') {setMode('monitoring'); setNav(name);}
    else if (name === 'Обзор') {setNav(name); setMode('sales');}
    else setModal(name);
  }
  function changeMode(next: ChartMode) {setMode(next); if (nav !== 'Обзор') setNav(next === 'sales' ? 'Продажи' : 'Мониторинг');}
  function exportCSV() {
    const csv = '\uFEFFДата;Текущий период;Предыдущий период\n' + data.map(d => `${new Date(d.timestamp).toISOString()};${d.value.toFixed(2)};${d.comparison.toFixed(2)}`).join('\n');
    const url = URL.createObjectURL(new Blob([csv], {type: 'text/csv;charset=utf-8;'}));
    const a = document.createElement('a'); a.href = url; a.download = `pulse-${mode}-${range}.csv`; a.click(); URL.revokeObjectURL(url); notify('Отчёт CSV скачан');
  }
  const dateOptions = {timeZone: 'Europe/Moscow', day: 'numeric', month: 'short'} as const;
  const monitoringHours = ({'7d': 1, '30d': 6, '90d': 24})[range];
  const timeOptions = {timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit'} as const;
  const dateLabel = isSales
    ? `${new Date(endDate - (rangeDays - 1) * 86400000).toLocaleDateString('ru-RU', dateOptions).replace('.', '')} — ${new Date(endDate).toLocaleDateString('ru-RU', {...dateOptions, year: 'numeric'}).replace('.', '').replace(' г.', '')}`
    : `${new Date(endDate).toLocaleDateString('ru-RU', dateOptions).replace('.', '')} · ${new Date(endDate - monitoringHours * 3600000).toLocaleTimeString('ru-RU', timeOptions)} — ${new Date(endDate).toLocaleTimeString('ru-RU', timeOptions)}`;
  const searchItems = ['Обзор', 'Продажи', 'Мониторинг', 'Источники данных', 'Команда', 'Настройки'].filter(x => x.toLowerCase().includes(search.toLowerCase()));

  return <div className="app-shell">
    {mobileNav && <div className="nav-scrim" onClick={() => setMobileNav(false)}/>}
    <aside className={`sidebar ${mobileNav ? 'is-open' : ''}`}>
      <a className="brand" href="#" onClick={e => {e.preventDefault(); navigate('Обзор');}} aria-label="Pulse — главная"><span className="brand-symbol"><svg width="27" height="27" viewBox="0 0 28 28" fill="none"><path d="M4 17 9 7l5 14L19 7l5 10" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span>pulse<span className="brand-period">.</span></a>
      <div className="workspace-wrap"><button className="workspace-selector" onClick={() => setWorkspaceOpen(!workspaceOpen)} aria-expanded={workspaceOpen}><span className="workspace-logo">a<span>✳</span></span><span className="workspace-copy"><strong>{projectName}</strong><small>Рабочее пространство</small></span><Icon name="down" size={15}/></button>{workspaceOpen && <div className="workspace-menu"><span className="menu-caption">ВАШЕ ПРОСТРАНСТВО</span><button onClick={() => setWorkspaceOpen(false)}><span className="status-dot"/>{projectName}<Icon name="check" size={15}/></button><button onClick={() => {setWorkspaceOpen(false); setModal('Настройки');}}><Icon name="settings" size={15}/>Настройки пространства</button></div>}</div>
      <span className="nav-label">АНАЛИТИКА</span>
      <nav aria-label="Основная навигация">{[['grid', 'Обзор'], ['chart', 'Продажи'], ['pulse', 'Мониторинг']].map(([icon, name]) => <button className={`nav-item ${nav === name ? 'active' : ''}`} key={name} onClick={() => navigate(name)}><Icon name={icon} size={19}/><span>{name}</span>{name === 'Мониторинг' && <span className="tiny-live"/>}</button>)}</nav>
      <span className="nav-label workspace-label">ПРОСТРАНСТВО</span>
      <nav aria-label="Рабочее пространство">{[['layers', 'Источники данных'], ['team', 'Команда'], ['settings', 'Настройки']].map(([icon, name]) => <button className="nav-item" key={name} onClick={() => navigate(name)}><Icon name={icon} size={19}/><span>{name}</span>{name === 'Источники данных' && <span className="nav-count">3</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="plan-card"><div><span className="plan-icon"><Icon name="bolt" size={17}/></span><strong>Больше возможностей</strong></div><p>Все ваши данные.<br/>Ещё больше полезных решений.</p><button onClick={() => setModal('Тариф Pro')}>Открыть Pulse Pro<Icon name="arrow" size={14}/></button></div><button className="help-button" onClick={() => setModal('Помощь и поддержка')}><Icon name="help" size={18}/>Помощь и поддержка<Icon name="arrow" size={13}/></button><button className="profile" onClick={() => setModal('Профиль')}><span className="avatar profile-avatar">АК<span/></span><span><strong>Алексей Ким</strong><small>Личный аккаунт</small></span><Icon name="more" size={19}/></button></div>
    </aside>
    <div className="main-shell"><header className="topbar"><div className="breadcrumbs"><button className="mobile-menu icon-button" aria-label="Открыть меню" onClick={() => setMobileNav(!mobileNav)}><Icon name="layers"/></button><span className="breadcrumb-home"><Icon name="grid" size={17}/></span><span className="breadcrumb-slash">/</span><span>Аналитика</span><Icon name="chevron" size={12}/><strong>{nav}</strong></div><div className="topbar-actions"><button className="search-trigger" onClick={() => setModal('search')}><Icon name="search" size={17}/><span>Быстрый поиск</span><kbd>⌘ K</kbd></button><div className="topbar-divider"/><div className="notification-wrap"><button className="icon-button notification-button" aria-label="Уведомления" aria-expanded={notifications} onClick={() => setNotifications(!notifications)}><Icon name="bell" size={20}/><i/></button>{notifications && <div className="notification-panel"><h3>Уведомления <span>2 новых</span></h3><div><span className="notification-icon"><Icon name="check" size={17}/></span><p><strong>Данные синхронизированы</strong><small>Все 3 источника обновлены · сейчас</small></p></div><div><span className="notification-icon amber"><Icon name="chart" size={17}/></span><p><strong>Продажи выросли на 12,8%</strong><small>По сравнению с прошлым периодом</small></p></div><button className="text-button" onClick={() => {setNotifications(false); notify('Все уведомления прочитаны');}}>Отметить всё прочитанным</button></div>}</div><button className="top-avatar" onClick={() => setModal('Профиль')} aria-label="Профиль Алексея Кима">АК</button></div></header>
    <main>
      <div className="page-heading"><div><div className="heading-eyebrow">ВАША КАРТИНА В ЦИФРАХ</div><h1>{nav === 'Обзор' ? 'Обзор аналитики' : nav === 'Продажи' ? 'Аналитика продаж' : 'Мониторинг системы'}<span className="heading-dot">.</span></h1><p>Следите за результатами. Замечайте главное.</p></div><div className="page-actions"><button className="button date-button" onClick={() => setModal('Выбрать период')}><Icon name="calendar" size={16}/>{dateLabel}<Icon name="down" size={14}/></button><button className="button export-button" onClick={exportCSV}><Icon name="download" size={16}/>Экспорт</button></div></div>
      <div className="overview-meta"><span><span className="status-dot"/>Все системы в норме</span><span>Обновлено только что <button className="refresh-button" aria-label="Обновить данные" onClick={() => {setTick(t => t + 1); notify('Данные обновлены');}}><Icon name="refresh" size={12}/></button></span></div>
      <div className="metrics-grid">{(isSales ? [
        {icon: 'wallet', label: 'Общая выручка', value: rubles(total), growth: '12,8%', note: 'за предыдущий период', variant: 0},
        {icon: 'bag', label: 'Количество заказов', value: orders.toLocaleString('ru-RU'), growth: '8,2%', note: 'за предыдущий период', variant: 1},
        {icon: 'cart', label: 'Средний чек', value: rubles(total / orders), growth: '4,3%', note: 'за предыдущий период', variant: 2},
      ] : [
        {icon: 'pulse', label: 'Среднее время отклика', value: `${Math.round(total / data.length)} мс`, growth: '6,4%', note: 'быстрее прошлого периода', variant: 0},
        {icon: 'globe', label: 'Доступность системы', value: '99,98%', growth: '0,02%', note: 'за предыдущий период', variant: 1},
        {icon: 'layers', label: 'Запросов в минуту', value: '12 480', growth: '8,2%', note: 'за предыдущий период', variant: 2},
      ]).map((metric, i) => <section className={`metric-card ${i === 0 ? 'metric-featured' : ''}`} key={metric.label}><div className="metric-label"><span>{metric.label}</span><span className="metric-icon"><Icon name={metric.icon} size={17}/></span></div><div className="metric-main"><strong>{metric.value}</strong><Sparkline variant={metric.variant} green={!isSales}/></div><div className="metric-bottom"><span className="metric-growth"><Icon name="arrow" size={12}/>{metric.growth}</span><span>{metric.note}</span></div></section>)}</div>
      <VisualizationWidget mode={mode} onModeChange={changeMode} range={range} onRangeChange={setRange} data={data}/>
      <div className="bottom-grid"><section className="panel orders-panel"><div className="panel-title"><div><h2>{isSales ? 'Последние заказы' : 'События системы'}<span className="count-pill">{isSales ? orders.toLocaleString('ru-RU') : '4'}</span></h2><p>{isSales ? 'Новые покупки — в одном месте' : 'Последние события ваших сервисов'}</p></div>{isSales ? <button className="text-button view-all" onClick={() => setAllOrders(!allOrders)}>{allOrders ? 'Свернуть' : 'Все заказы'}<Icon name="chevron" size={14}/></button> : <button className={`live-control ${live ? '' : 'paused'}`} onClick={() => setLive(!live)}><Icon name={live ? 'pause' : 'play'} size={13}/>{live ? 'В эфире' : 'Пауза'}</button>}</div>
      {isSales ? <div className="table-scroll"><table><thead><tr><th>Клиент</th><th>Сумма</th><th>Статус</th><th>Время</th></tr></thead><tbody>{visibleTransactions.map(t => <tr key={t.id} onClick={() => setSelectedOrder(t)} onKeyDown={e => {if (e.key === 'Enter') setSelectedOrder(t);}} tabIndex={0} aria-label={`Заказ ${t.id}, ${t.name}`}><td><div className="customer"><span className={`avatar ${t.color}`}>{t.initials}</span><span><strong>{t.name}</strong><small>#{t.id} · {t.product.split(' · ')[0]}</small></span></div></td><td className="amount">{rubles(t.amount)}</td><td><span className={`order-status ${t.status === 'Оплачен' ? '' : 'pending'}`}><i/>{t.status}</span></td><td className="order-time">{t.time}</td></tr>)}</tbody></table></div> : <div className="events-list">{[{title: 'API Gateway', detail: 'Все проверки пройдены', time: 'Сейчас', state: 'Работает'}, {title: 'База данных', detail: 'Соединение стабильно · 24 мс', time: '12:40', state: 'Работает'}, {title: 'Синхронизация данных', detail: 'Обновлено 3 источника', time: '12:38', state: 'Завершено'}, {title: 'Плановое обслуживание', detail: 'Обновление кеша выполнено', time: '12:30', state: 'Завершено'}].map(event => <div className="system-event" key={event.title}><span className="event-icon"><Icon name="check" size={16}/></span><div><strong>{event.title}</strong><small>{event.detail}</small></div><span className="order-status"><i/>{event.state}</span><time>{event.time}</time></div>)}</div>}</section>
      <section className="panel sources-panel"><div className="panel-title"><div><h2>{isSales ? 'Каналы продаж' : 'Состояние сервисов'}</h2><p>{isSales ? 'Откуда приходят ваши клиенты' : 'Доступность за выбранный период'}</p></div><button className="icon-button" aria-label={isSales ? 'Настроить каналы' : 'Настроить сервисы'} onClick={() => setModal('Источники данных')}><Icon name="more" size={18}/></button></div>{isSales ? <><div className="donut-wrap"><div className="donut"><div><span>Всего заказов</span><strong>{orders.toLocaleString('ru-RU')}</strong><small><Icon name="arrow" size={11}/>8,2%</small></div></div></div><div className="channel-list">{[{name: 'Сайт', value: 64, color: '#dfa45c'}, {name: 'Приложение', value: 24, color: '#a5b7a3'}, {name: 'Партнёры', value: 12, color: '#e9e3d7'}].map(c => <button key={c.name} className={channel === c.name ? 'channel-active' : ''} aria-pressed={channel === c.name} onClick={() => {setChannel(channel === c.name ? 'Все каналы' : c.name); setAllOrders(true);}}><i style={{background: c.color}}/><span>{c.name}</span><strong>{c.value}%</strong><small>{Math.round(orders * c.value / 100).toLocaleString('ru-RU')}</small></button>)}</div></> : <div className="service-list">{['Основной API', 'База данных', 'Хранилище'].map((name, j) => <div key={name}><div><strong>{name}</strong><span>99,{j === 0 ? '98' : '99'}%</span></div><div className="uptime-bars">{Array.from({length: 30}, (_, i) => <span key={i} className={i === 17 && j === 0 ? 'warning' : ''} title={`День ${i + 1}: ${i === 17 && j === 0 ? 'частичная деградация' : '100% доступность'}`}/>)}</div></div>)}<p className="service-footnote"><span className="status-dot"/>Все сервисы работают стабильно</p></div>}</section></div>
      <footer className="page-footer"><span><span className="mini-brand">p</span>Меньше шума. Больше ясности.</span><span>Часовой пояс: UTC+3 <i/>Демонстрационные данные</span></footer>
    </main></div>
    {toast && <div className="toast" role="status"><span><Icon name="check" size={16}/></span>{toast}<button className="icon-button" onClick={() => setToast('')} aria-label="Закрыть уведомление"><Icon name="close" size={15}/></button></div>}
    {selectedOrder && <Modal title={`Заказ #${selectedOrder.id}`} onClose={() => setSelectedOrder(null)}><div className="order-detail-person"><span className={`avatar ${selectedOrder.color}`}>{selectedOrder.initials}</span><div><strong>{selectedOrder.name}</strong><p>{selectedOrder.email}</p></div></div><dl className="detail-list"><div><dt>Продукт</dt><dd>{selectedOrder.product}</dd></div><div><dt>Сумма</dt><dd>{rubles(selectedOrder.amount)}</dd></div><div><dt>Канал</dt><dd>{selectedOrder.channel}</dd></div><div><dt>Статус</dt><dd><span className={`order-status ${selectedOrder.status === 'Оплачен' ? '' : 'pending'}`}><i/>{selectedOrder.status}</span></dd></div><div><dt>Время</dt><dd>28 октября 2026, {selectedOrder.time}</dd></div></dl><button className="button primary-button full-width" onClick={() => setSelectedOrder(null)}>Готово</button></Modal>}
    {modal && <Modal title={modal === 'search' ? 'Быстрый поиск' : modal} onClose={() => setModal(null)} wide={modal === 'Источники данных'}>
      {modal === 'search' ? <><div className="search-input"><Icon name="search" size={19}/><input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Найти страницу или раздел…"/></div><div className="search-results">{searchItems.map(item => <button key={item} onClick={() => {setModal(null); setSearch(''); navigate(item);}}><Icon name={['grid', 'chart', 'pulse', 'layers', 'team', 'settings'][['Обзор', 'Продажи', 'Мониторинг', 'Источники данных', 'Команда', 'Настройки'].indexOf(item)]} size={19}/><span>{item}</span><Icon name="chevron" size={16}/></button>)}{!searchItems.length && <p>Ничего не найдено. Попробуйте другой запрос.</p>}</div></> : null}
      {modal === 'Выбрать период' && <form onSubmit={e => {e.preventDefault(); setEndDate(new Date(`${dateInput}T12:00:00+03:00`).getTime()); setModal(null); notify('Период обновлён');}}><p className="modal-description">Выберите дату окончания и длительность отчёта.</p><label className="form-label">Дата окончания<input type="date" required value={dateInput} max="2026-10-28" onChange={e => setDateInput(e.target.value)}/></label><label className="form-label">Длительность<select value={range} onChange={e => setRange(e.target.value as TimeRange)}><option value="7d">{isSales ? '7 дней' : '1 час'}</option><option value="30d">{isSales ? '30 дней' : '6 часов'}</option><option value="90d">{isSales ? '90 дней' : '24 часа'}</option></select></label><button className="button primary-button full-width" type="submit">Применить период</button></form>}
      {modal === 'Источники данных' && <><p className="modal-description">Подключённые источники демонстрационного пространства. Данные синхронизируются автоматически.</p>{[{icon: 'globe', name: 'Интернет-магазин', detail: 'Заказы и платежи · обновлено сейчас'}, {icon: 'bag', name: 'Мобильное приложение', detail: 'Покупки в приложении · обновлено сейчас'}, {icon: 'pulse', name: 'API мониторинга', detail: 'Метрики производительности · каждые 3 секунды'}].map(s => <div className="source-row" key={s.name}><span className="source-icon"><Icon name={s.icon}/></span><div><strong>{s.name}</strong><small>{s.detail}</small></div><span className="order-status"><i/>Подключён</span></div>)}<div className="info-note"><Icon name="help" size={16}/>Это демо: все данные генерируются локально, внешние сервисы не подключены.</div></>}
      {modal === 'Команда' && <><p className="modal-description">Участники рабочего пространства {projectName}.</p>{[{name: 'Алексей Ким', initials: 'АК', role: 'Владелец', color: 'peach'}, {name: 'Мария Иванова', initials: 'МИ', role: 'Аналитик', color: 'lavender'}, {name: 'Дмитрий Соколов', initials: 'ДС', role: 'Разработчик', color: 'sage'}].map(person => <div className="source-row" key={person.name}><span className={`avatar ${person.color}`}>{person.initials}</span><strong>{person.name}</strong><span className="member-role">{person.role}</span></div>)}</>}
      {modal === 'Настройки' && <form onSubmit={e => {e.preventDefault(); setProjectName(draftName.trim() || 'Acme Studio'); setModal(null); notify('Настройки сохранены');}}><label className="form-label">Название пространства<input value={draftName} maxLength={32} required onChange={e => setDraftName(e.target.value)}/></label><label className="form-label">Валюта отчётов<select defaultValue="rub"><option value="rub">Российский рубль (₽)</option></select></label><p className="modal-description">Данные отчётов хранятся только в текущей сессии браузера.</p><button className="button primary-button full-width">Сохранить изменения</button></form>}
      {modal === 'Профиль' && <><div className="order-detail-person"><span className="avatar peach">АК</span><div><strong>Алексей Ким</strong><p>alex.kim@acme.studio</p></div></div><dl className="detail-list"><div><dt>Рабочее пространство</dt><dd>{projectName}</dd></div><div><dt>Роль</dt><dd>Владелец</dd></div><div><dt>Тариф</dt><dd>Бесплатный</dd></div></dl><button className="button full-width" onClick={() => setModal('Настройки')}>Настройки пространства</button></>}
      {modal === 'Помощь и поддержка' && <div className="help-content"><p>Pulse помогает следить за продажами и состоянием сервисов в одном виджете.</p><h3>Как работать с графиком</h3><p>Переключайте «Продажи» и «Мониторинг», выбирайте период и наводите курсор на точки для просмотра значений. Нажмите на легенду, чтобы скрыть сравнение.</p><h3>Как скачать отчёт</h3><p>Кнопка «Экспорт» сохранит все точки текущего графика в CSV. Файл можно открыть в Excel или Google Таблицах.</p><h3>Как отфильтровать заказы</h3><p>Нажмите на канал в блоке «Каналы продаж». Повторное нажатие сбросит фильтр.</p></div>}
      {modal === 'Тариф Pro' && <><div className="pro-badge"><Icon name="bolt" size={25}/></div><h3 className="pro-heading">Вся аналитика под рукой</h3><p className="modal-description">Неограниченная история, дополнительные источники данных и совместная работа команды.</p><div className="pro-features">{['Неограниченное количество виджетов', 'История данных за всё время', 'Гибкие уведомления и отчёты'].map(f => <p key={f}><Icon name="check" size={17}/>{f}</p>)}</div><div className="info-note">Вы используете демонстрационную версию Pulse. Платные тарифы здесь недоступны.</div><button className="button primary-button full-width" onClick={() => setModal(null)}>Продолжить в демо</button></>}
    </Modal>}
  </div>;
}
