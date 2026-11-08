import { useState } from 'react';
import './App.css';

type WidgetId = 'revenue' | 'sources' | 'orders' | 'tasks' | 'regions' | 'activity' | 'conversion' | 'customers';
type Widget = { id: WidgetId; title: string; span: number };

const initialWidgets: Widget[] = [
  { id: 'revenue', title: 'Выручка', span: 8 },
  { id: 'sources', title: 'Источники трафика', span: 4 },
  { id: 'orders', title: 'Заказы', span: 5 },
  { id: 'tasks', title: 'Задачи команды', span: 7 },
  { id: 'regions', title: 'Продажи по регионам', span: 6 },
  { id: 'activity', title: 'Последние события', span: 6 },
];

const availableWidgets: Widget[] = [
  { id: 'conversion', title: 'Конверсия', span: 4 },
  { id: 'customers', title: 'Новые клиенты', span: 4 },
];

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const paths: Record<string, React.ReactNode> = {
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></>,
    chart: <><path d="M4 19.5V5"/><path d="M4 19.5h16"/><path d="m7 15 4-4 3 2 5-6"/><path d="M16 7h3v3"/></>,
    bag: <><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></>,
    users: <><path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20"/><circle cx="10" cy="8" r="3.2"/><path d="M17 4.9a3.2 3.2 0 0 1 0 6.2M20 20v-1.5a3.5 3.5 0 0 0-2.5-3.35"/></>,
    box: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4.5 7.7 7.5 4.2 7.5-4.2M12 12v8.5"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.1 1.9-1.8 3.1-2.1-.5a7.8 7.8 0 0 1-1.8 1l-.8 2.1h-3.6l-.8-2.1a7.8 7.8 0 0 1-1.8-1l-2.1.5-1.8-3.1 1.1-1.9a7.8 7.8 0 0 1 0-2.1l-1.1-1.9 1.8-3.1 2.1.5a7.8 7.8 0 0 1 1.8-1l.8-2.1h3.6l.8 2.1a7.8 7.8 0 0 1 1.8 1l2.1-.5 1.8 3.1-1.1 1.9a7.8 7.8 0 0 1 0 2.1Z" transform="translate(-1 -2) scale(.92)"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    more: <><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></>,
    calendar: <><rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M7.5 3v4M16.5 3v4M4 9.5h16"/></>,
    grip: <><circle cx="9" cy="6" r=".8" fill="currentColor"/><circle cx="15" cy="6" r=".8" fill="currentColor"/><circle cx="9" cy="12" r=".8" fill="currentColor"/><circle cx="15" cy="12" r=".8" fill="currentColor"/><circle cx="9" cy="18" r=".8" fill="currentColor"/><circle cx="15" cy="18" r=".8" fill="currentColor"/></>,
  };
  return <svg {...common}>{paths[name] || paths.grid}</svg>;
}

function RevenueChart() {
  return <div className="revenue-chart">
    <div className="chart-y-labels"><span>₽ 600k</span><span>₽ 450k</span><span>₽ 300k</span><span>₽ 150k</span><span>₽ 0</span></div>
    <div className="chart-main">
      <div className="chart-grid"><i/><i/><i/><i/><i/></div>
      <svg className="line-chart" viewBox="0 0 720 185" preserveAspectRatio="none" aria-label="График выручки">
        <defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#7479f6" stopOpacity=".22"/><stop offset="100%" stopColor="#7479f6" stopOpacity="0"/></linearGradient></defs>
        <path d="M0 144 C24 138 28 112 55 119 S92 145 112 122 S148 105 168 111 S197 84 224 95 S259 112 280 85 S316 75 336 88 S375 65 392 73 S428 103 448 77 S485 49 504 61 S536 77 560 47 S594 60 615 41 S654 52 672 23 S702 35 720 10 L720 185 L0 185Z" fill="url(#area)"/>
        <path d="M0 144 C24 138 28 112 55 119 S92 145 112 122 S148 105 168 111 S197 84 224 95 S259 112 280 85 S316 75 336 88 S375 65 392 73 S428 103 448 77 S485 49 504 61 S536 77 560 47 S594 60 615 41 S654 52 672 23 S702 35 720 10" fill="none" stroke="#686df2" strokeWidth="3" vectorEffect="non-scaling-stroke"/>
        <circle cx="672" cy="23" r="5" fill="white" stroke="#686df2" strokeWidth="3" vectorEffect="non-scaling-stroke"/>
      </svg>
      <div className="chart-x-labels"><span>1 окт</span><span>5 окт</span><span>10 окт</span><span>15 окт</span><span>20 окт</span><span>25 окт</span><span>31 окт</span></div>
    </div>
  </div>;
}

function SourcesChart() {
  return <div className="sources-content"><div className="donut-wrap"><div className="donut"><div className="donut-center"><strong>8 492</strong><small>посетителя</small></div></div></div><div className="legend">
    {[['Поиск', '38%', 'purple'], ['Соцсети', '27%', 'blue'], ['Прямые', '21%', 'teal'], ['Рефералы', '14%', 'orange']].map(([label, value, color]) => <div className="legend-row" key={label}><span className={`legend-dot ${color}`} /> <span>{label}</span><b>{value}</b></div>)}
  </div></div>;
}

function OrdersChart() {
  const values = [45, 65, 52, 80, 59, 73, 92, 69, 84, 58, 75, 96, 68, 82, 60, 88, 73, 100, 78, 89, 67, 95, 76, 83];
  return <div className="orders-chart"><div className="bar-chart">{values.map((n, i) => <div key={i} className={`bar ${i === 17 ? 'highlight' : ''}`} style={{ height: `${n}%` }} />)}</div><div className="bar-labels"><span>1 окт</span><span>8 окт</span><span>15 окт</span><span>22 окт</span><span>31 окт</span></div><div className="orders-total"><span className="big-number">1 284</span><span className="muted">заказов за месяц</span><span className="tiny-change">↑ 12,8%</span></div></div>;
}

function Tasks() {
  const rows = [['Подготовить отчет за октябрь', 'Мария С.', 'Сегодня', 'in-progress'], ['Обновить карточки товаров', 'Алексей К.', 'Сегодня', 'done'], ['Согласовать медиаплан', 'Анна Р.', 'Завтра', 'review'], ['Проверить интеграцию CRM', 'Иван П.', '4 ноя', 'done']];
  return <div className="task-list">{rows.map(([task, person, date, status], i) => <div className="task-row" key={task}><span className={`task-check ${status === 'done' ? 'checked' : ''}`}>{status === 'done' ? '✓' : ''}</span><span className="task-name">{task}</span><span className="task-person"><i className={`avatar avatar-${i}`}>{person.charAt(0)}</i>{person}</span><span className="task-date">{date}</span></div>)}</div>;
}

function Regions() {
  const rows: [string, string, number, string][] = [['Москва', '₽ 842 500', 82, 'purple'], ['Санкт-Петербург', '₽ 526 300', 58, 'blue'], ['Казань', '₽ 318 200', 36, 'teal'], ['Екатеринбург', '₽ 204 800', 24, 'orange']];
  return <div className="region-list">{rows.map(([name, amount, width, color]) => <div className="region-row" key={name}><div className="region-top"><span>{name}</span><b>{amount}</b></div><div className="region-track"><i className={color} style={{ width: `${width}%` }} /></div></div>)}</div>;
}

function Activity() {
  const rows = [
    ['Ирина Волкова', 'оформила заказ', '№ 2841 · ₽ 24 900', '10:42', 'avatar-0'],
    ['Александр Петров', 'оставил отзыв', 'Наушники Air Pro', '10:18', 'avatar-1'],
    ['Мария Смирнова', 'зарегистрировалась', 'Новый клиент', '09:56', 'avatar-2'],
    ['Дмитрий Козлов', 'оплатил заказ', '№ 2838 · ₽ 8 500', '09:31', 'avatar-3'],
  ];
  return <div className="activity-list">{rows.map(([name, action, detail, time, avatar]) => <div className="activity-row" key={name}><i className={`avatar ${avatar}`}>{name.charAt(0)}</i><div className="activity-copy"><div><b>{name}</b> {action}</div><small>{detail}</small></div><time>{time}</time></div>)}</div>;
}

function SmallMetric({ id }: { id: WidgetId }) {
  if (id === 'conversion') return <div className="small-metric"><div className="small-metric-line"><strong>4,82%</strong><span className="up">↑ 0,6%</span></div><p>Средняя конверсия в покупку</p><div className="mini-bars">{[28, 40, 35, 55, 45, 62, 50, 72, 61, 82, 74, 92].map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}</div></div>;
  return <div className="small-metric"><div className="small-metric-line"><strong>+ 246</strong><span className="up">↑ 18,4%</span></div><p>За октябрь · всего 3 842</p><div className="customers-bubbles"><i>М</i><i>А</i><i>Е</i><i>Д</i><i>+242</i></div></div>;
}

function WidgetBody({ id }: { id: WidgetId }) {
  switch (id) {
    case 'revenue': return <><div className="revenue-summary"><div><strong>₽ 482 590</strong><span className="up">↑ 18,6%</span></div><small>за октябрь 2024</small></div><RevenueChart /></>;
    case 'sources': return <SourcesChart />;
    case 'orders': return <OrdersChart />;
    case 'tasks': return <Tasks />;
    case 'regions': return <Regions />;
    case 'activity': return <Activity />;
    default: return <SmallMetric id={id} />;
  }
}

export function App() {
  const [widgets, setWidgets] = useState(initialWidgets);
  const [dragged, setDragged] = useState<WidgetId | null>(null);
  const [over, setOver] = useState<WidgetId | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [period, setPeriod] = useState('Последние 30 дней');

  const moveWidget = (targetId: WidgetId) => {
    if (!dragged || dragged === targetId) return;
    setWidgets((current) => {
      const next = [...current];
      const from = next.findIndex((w) => w.id === dragged);
      const to = next.findIndex((w) => w.id === targetId);
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
    setDragged(null);
    setOver(null);
  };

  const addWidget = (widget: Widget) => {
    if (widgets.some((item) => item.id === widget.id)) return;
    setWidgets((current) => [...current, widget]);
    setShowAdd(false);
  };

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark"><i/><i/><i/><i/></span><span>orbita<span className="brand-dot">.</span></span></div>
      <div className="workspace-switch"><div className="workspace-logo">S</div><div><b>Студия Север</b><small>Рабочее пространство</small></div><span className="chevrons">⌃<br/>⌄</span></div>
      <div className="nav-label">РАБОЧЕЕ</div>
      <nav className="main-nav">
        <a className="nav-item active"><Icon name="grid"/><span>Дашборд</span></a>
        <a className="nav-item"><Icon name="chart"/><span>Аналитика</span></a>
        <a className="nav-item"><Icon name="bag"/><span>Заказы</span><em>12</em></a>
        <a className="nav-item"><Icon name="users"/><span>Клиенты</span></a>
        <a className="nav-item"><Icon name="box"/><span>Товары</span></a>
      </nav>
      <div className="sidebar-bottom"><a className="nav-item"><Icon name="settings"/><span>Настройки</span></a><div className="profile"><div className="profile-avatar">АК</div><div><b>Анастасия К.</b><small>Владелец</small></div><span className="profile-dots">···</span></div></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="breadcrumbs">Студия Север <span>/</span> <b>Дашборд</b></div><div className="top-actions"><button className="icon-button notification" aria-label="Уведомления"><span>♧</span><i/></button><div className="top-avatar">АК</div></div></header>
      <div className="content">
        <section className="page-heading"><div><div className="eyebrow">ПОНЕДЕЛЬНИК, 4 НОЯБРЯ 2024</div><h1>Доброе утро, Анастасия <span>✦</span></h1><p>Вот что происходит в вашем бизнесе сегодня.</p></div><div className="heading-actions"><button className="period-button"><Icon name="calendar" size={16}/>{period}<span className="down-caret">⌄</span></button><button className="share-button"><span>↗</span> Поделиться</button></div></section>
        <section className="kpi-grid">
          <div className="kpi-card"><div className="kpi-top"><span>Общая выручка</span><i className="kpi-icon purple-bg">₽</i></div><div className="kpi-value">₽ 482 590</div><div className="kpi-foot"><span className="up">↑ 18,6%</span><span>к прошлому месяцу</span><svg viewBox="0 0 90 30"><path d="M1 25 C12 24 15 14 25 19 S39 23 47 13 S59 19 66 10 S80 16 89 3"/></svg></div></div>
          <div className="kpi-card"><div className="kpi-top"><span>Заказы</span><i className="kpi-icon blue-bg"><Icon name="bag" size={16}/></i></div><div className="kpi-value">1 284</div><div className="kpi-foot"><span className="up">↑ 12,8%</span><span>к прошлому месяцу</span><svg className="blue-line" viewBox="0 0 90 30"><path d="M1 21 C12 16 17 22 25 15 S41 20 48 10 S59 16 66 8 S78 15 89 4"/></svg></div></div>
          <div className="kpi-card"><div className="kpi-top"><span>Новые клиенты</span><i className="kpi-icon teal-bg"><Icon name="users" size={16}/></i></div><div className="kpi-value">246</div><div className="kpi-foot"><span className="up">↑ 8,2%</span><span>к прошлому месяцу</span><svg className="teal-line" viewBox="0 0 90 30"><path d="M1 23 C12 14 18 24 27 19 S38 22 47 12 S57 20 66 14 S80 13 89 5"/></svg></div></div>
          <div className="kpi-card"><div className="kpi-top"><span>Средний чек</span><i className="kpi-icon orange-bg">↗</i></div><div className="kpi-value">₽ 3 842</div><div className="kpi-foot"><span className="down">↓ 2,4%</span><span>к прошлому месяцу</span><svg className="orange-line" viewBox="0 0 90 30"><path d="M1 7 C13 11 17 4 27 12 S38 9 47 17 S58 8 66 19 S78 14 89 25"/></svg></div></div>
        </section>
        <section className="widget-toolbar"><div><h2>Обзор показателей</h2><span>Перетаскивайте виджеты, чтобы настроить свой обзор</span></div><div className="toolbar-controls"><button className="customize-button" onClick={() => setShowAdd((v) => !v)}><Icon name="plus" size={17}/> Добавить виджет</button>{showAdd && <div className="add-menu">{availableWidgets.filter((w) => !widgets.some((item) => item.id === w.id)).map((widget) => <button key={widget.id} onClick={() => addWidget(widget)}><Icon name="plus" size={15}/>{widget.title}</button>)}{availableWidgets.every((w) => widgets.some((item) => item.id === w.id)) && <span>Все виджеты добавлены</span>}</div>}</div></section>
        <section className="widget-grid" aria-label="Виджеты дашборда">
          {widgets.map((widget) => <article key={widget.id} className={`widget-card span-${widget.span} ${over === widget.id ? 'drop-target' : ''}`} draggable onDragStart={(event) => { setDragged(widget.id); event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', widget.id); }} onDragEnd={() => { setDragged(null); setOver(null); }} onDragOver={(event) => { event.preventDefault(); setOver(widget.id); }} onDrop={(event) => { event.preventDefault(); moveWidget(widget.id); }}>
            <div className="widget-heading"><div className="widget-title"><span className="drag-grip"><Icon name="grip" size={15}/></span><h3>{widget.title}</h3></div><div className="widget-actions">{widget.id === 'revenue' && <select value={period} onChange={(e) => setPeriod(e.target.value)} aria-label="Период графика"><option>Последние 30 дней</option><option>Последние 7 дней</option><option>Этот год</option></select>}<button className="more-button" aria-label={`Настройки: ${widget.title}`} onClick={() => setWidgets((current) => current.filter((item) => item.id !== widget.id))}><Icon name="more" size={18}/></button></div></div>
            <div className="widget-body"><WidgetBody id={widget.id}/></div>
          </article>)}
        </section>
        <footer className="page-footer"><span>Данные обновлены 2 минуты назад</span><span className="live-dot"/> <button>Обновить</button><span className="footer-right">Нужна помощь? <a>Центр поддержки</a></span></footer>
      </div>
    </main>
  </div>;
}
