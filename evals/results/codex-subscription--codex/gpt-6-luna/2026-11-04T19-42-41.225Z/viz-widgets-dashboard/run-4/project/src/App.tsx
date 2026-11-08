import { useMemo, useRef, useState } from 'react';
import './App.css';

type Widget = { id: string; kind: string; x: number; y: number; w: number; h: number };

const initialWidgets: Widget[] = [
  { id: 'revenue', kind: 'revenue', x: 1, y: 1, w: 6, h: 4 },
  { id: 'orders', kind: 'orders', x: 7, y: 1, w: 3, h: 4 },
  { id: 'conversion', kind: 'conversion', x: 10, y: 1, w: 3, h: 4 },
  { id: 'traffic', kind: 'traffic', x: 1, y: 5, w: 4, h: 4 },
  { id: 'channels', kind: 'channels', x: 5, y: 5, w: 4, h: 4 },
  { id: 'activity', kind: 'activity', x: 9, y: 5, w: 4, h: 4 },
];

const titles: Record<string, string> = {
  revenue: 'Выручка', orders: 'Заказы', conversion: 'Конверсия',
  traffic: 'Источники трафика', channels: 'Продажи по каналам', activity: 'Последние заказы',
};

function LineChart() {
  return <div className="chart-area">
    <div className="chart-y-labels"><span>₽ 1,2 млн</span><span>₽ 900 тыс.</span><span>₽ 600 тыс.</span><span>₽ 300 тыс.</span><span>₽ 0</span></div>
    <svg className="line-chart" viewBox="0 0 620 185" preserveAspectRatio="none" aria-label="График выручки">
      <defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#7167f8" stopOpacity=".2"/><stop offset="1" stopColor="#7167f8" stopOpacity="0"/></linearGradient></defs>
      {[15, 52, 89, 126, 163].map(y => <line key={y} x1="0" x2="620" y1={y} y2={y} stroke="#edf0f5" strokeDasharray="3 5"/>)}
      <path d="M0 142 C30 133 40 117 68 124 S105 140 136 112 S177 107 205 98 S247 111 273 87 S319 74 342 93 S377 104 410 68 S452 61 477 73 S521 60 548 41 S588 51 620 20 L620 170 L0 170Z" fill="url(#fill)"/>
      <path d="M0 142 C30 133 40 117 68 124 S105 140 136 112 S177 107 205 98 S247 111 273 87 S319 74 342 93 S377 104 410 68 S452 61 477 73 S521 60 548 41 S588 51 620 20" fill="none" stroke="#7167f8" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="620" cy="20" r="5" fill="#fff" stroke="#7167f8" strokeWidth="3"/>
    </svg>
    <div className="chart-x-labels"><span>1 окт</span><span>5 окт</span><span>10 окт</span><span>15 окт</span><span>20 окт</span><span>25 окт</span><span>31 окт</span></div>
  </div>;
}

function Donut() {
  return <div className="donut-wrap"><div className="donut"><div className="donut-center"><strong>24 680</strong><span>посетителей</span></div></div><div className="legend"><div><i className="dot purple"/><span>Прямые</span><b>42%</b></div><div><i className="dot blue"/><span>Поиск</span><b>28%</b></div><div><i className="dot teal"/><span>Соцсети</span><b>18%</b></div><div><i className="dot orange"/><span>Другое</span><b>12%</b></div></div></div>;
}

function Channels() {
  const rows: [string, string, number, string][] = [['Сайт', '₽ 842 500', 84, 'purple'], ['Мобильное приложение', '₽ 524 300', 63, 'blue'], ['Маркетплейсы', '₽ 318 700', 43, 'teal'], ['Офлайн-магазины', '₽ 186 200', 28, 'orange']];
  return <div className="channels-list">{rows.map(([name, amount, pct, color]) => <div className="channel" key={name}><div className="channel-top"><span>{name}</span><strong>{amount}</strong></div><div className="bar-track"><span className={color} style={{ width: `${pct}%` }}/></div></div>)}</div>;
}

function Activity() {
  const orders = [['#10482', 'Александр М.', 'Сегодня, 14:32', '₽ 12 490', 'Выполнен', 'green'], ['#10481', 'Мария К.', 'Сегодня, 14:18', '₽ 8 750', 'В обработке', 'yellow'], ['#10480', 'Иван П.', 'Сегодня, 13:56', '₽ 24 100', 'Выполнен', 'green'], ['#10479', 'Елена С.', 'Сегодня, 13:41', '₽ 3 290', 'Отправлен', 'blue']];
  return <div className="activity-list">{orders.map(([id, name, time, total, status, color]) => <div className="activity-row" key={id}><span className="order-icon">↗</span><div className="order-info"><strong>{id} <span>{name}</span></strong><small>{time}</small></div><div className="order-total"><strong>{total}</strong><small className={`status ${color}`}>{status}</small></div></div>)}</div>;
}

function WidgetBody({ kind }: { kind: string }) {
  if (kind === 'revenue') return <><div className="big-metric">₽ 2 481 320 <span className="trend">↗ 12,8%</span></div><div className="metric-caption">к предыдущему месяцу</div><LineChart /></>;
  if (kind === 'orders') return <><div className="big-metric">1 284 <span className="trend">↗ 8,2%</span></div><div className="metric-caption">за октябрь</div><div className="mini-bars">{[35, 46, 38, 57, 45, 66, 53, 74, 61, 86, 68, 100, 78, 92, 70, 82, 58, 76, 88, 67, 96, 71, 83, 100].map((h, i) => <span key={i} style={{ height: `${h}%`, opacity: .35 + h / 160 }}/>)}</div><div className="mini-labels"><span>1 окт</span><span>31 окт</span></div></>;
  if (kind === 'conversion') return <><div className="big-metric">3,64% <span className="trend">↗ 0,6%</span></div><div className="metric-caption">средняя за период</div><div className="conversion-box"><div className="conversion-head"><span>Визиты</span><b>24 680</b></div><div className="funnel-line"><span style={{ width: '100%' }}/></div><div className="conversion-head"><span>Добавили в корзину</span><b>4 218</b></div><div className="funnel-line"><span style={{ width: '67%' }}/></div><div className="conversion-head"><span>Покупки</span><b>898</b></div><div className="funnel-line"><span style={{ width: '34%' }}/></div></div></>;
  if (kind === 'traffic') return <Donut />;
  if (kind === 'channels') return <Channels />;
  if (kind === 'activity') return <Activity />;
  return <div className="empty-widget">Выберите виджет, чтобы добавить его на дашборд.</div>;
}

function Icon({ name }: { name: string }) {
  const paths: Record<string, string> = { grid: 'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z', chart: 'M3 3v18h18 M7 14l4-4 4 3 6-7', bag: 'M5 8h14l-1 13H6L5 8z M9 8a3 3 0 0 1 6 0', users: 'M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2 M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M20 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75', settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06-1.7 2.94-.08-.02a1.7 1.7 0 0 0-1.72.5l-.06.06h-3.4l-.02-.08a1.7 1.7 0 0 0-1.18-1.24l-.08-.02-1.7-2.94.06-.06a1.7 1.7 0 0 0 .34-1.87l-.04-.08v-3.4l.08-.02a1.7 1.7 0 0 0 1.24-1.18l.02-.08 2.94-1.7.06.06a1.7 1.7 0 0 0 1.87.34l.08-.04h3.4l.02.08a1.7 1.7 0 0 0 1.18 1.24l.08.02 1.7 2.94-.06.06a1.7 1.7 0 0 0-.34 1.87z' };
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={paths[name] || paths.grid}/></svg>;
}

export function App() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [widgets, setWidgets] = useState(initialWidgets);
  const [dragging, setDragging] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [period, setPeriod] = useState('Этот месяц');
  const widgetOptions = useMemo(() => ['revenue', 'orders', 'conversion', 'traffic', 'channels', 'activity'].filter(k => !widgets.some(w => w.kind === k)), [widgets]);

  const placeWidget = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const id = event.dataTransfer.getData('text/plain') || dragging;
    if (!id || !gridRef.current) return;
    const widget = widgets.find(w => w.id === id);
    if (!widget) return;
    const rect = gridRef.current.getBoundingClientRect();
    const colWidth = rect.width / 12;
    const rowHeight = 72;
    const x = Math.max(1, Math.min(13 - widget.w, Math.floor((event.clientX - rect.left) / colWidth - widget.w / 2) + 1));
    const y = Math.max(1, Math.floor((event.clientY - rect.top) / rowHeight - widget.h / 2) + 1);
    setWidgets(current => {
      const moved = current.map(w => w.id === id ? { ...w, x, y } : w);
      const occupied = (a: Widget, b: Widget) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
      const placed: Widget[] = [];
      for (const item of [...moved].sort((a, b) => (a.id === id ? -1 : b.id === id ? 1 : a.y - b.y))) {
        let candidate = { ...item };
        while (placed.some(other => occupied(candidate, other))) candidate.y += 1;
        placed.push(candidate);
      }
      return placed;
    });
    setDragging(null);
  };

  const addWidget = (kind: string) => {
    const w = kind === 'revenue' ? 6 : 4;
    setWidgets(current => [...current, { id: `${kind}-${Date.now()}`, kind, x: 1, y: Math.max(1, ...current.map(v => v.y + v.h)), w, h: kind === 'revenue' ? 4 : 4 }]);
    setAddOpen(false);
  };

  return <div className="app-shell">
    <aside className="sidebar"><div className="brand"><div className="brand-mark">n</div><span>northstar</span></div><div className="workspace-switch"><div className="workspace-avatar">N</div><div><strong>Northstar Store</strong><small>Рабочее пространство</small></div><span className="chevron">⌄</span></div><div className="nav-label">МЕНЮ</div><nav><a className="active"><Icon name="grid"/>Обзор</a><a><Icon name="chart"/>Аналитика</a><a><Icon name="bag"/>Заказы<span className="nav-count">12</span></a><a><Icon name="users"/>Клиенты</a></nav><div className="sidebar-bottom"><div className="help-card"><div className="help-icon">✳</div><strong>Нужна помощь?</strong><span>Загляните в центр поддержки</span><button>Открыть центр <span>↗</span></button></div><a className="settings-link"><Icon name="settings"/>Настройки</a><div className="profile"><div className="profile-avatar">АК</div><div><strong>Анна Козлова</strong><small>Администратор</small></div><span className="more">•••</span></div></div></aside>
    <main className="main"><header className="topbar"><div className="breadcrumbs">Рабочее пространство <span>/</span> <strong>Обзор</strong></div><div className="top-actions"><button className="icon-button" aria-label="Поиск">⌕</button><button className="icon-button notification" aria-label="Уведомления">♧<i/></button><div className="top-avatar">АК</div></div></header><section className="content"><div className="page-heading"><div><div className="eyebrow"><span className="live-dot"/> ВАШ БИЗНЕС СЕГОДНЯ</div><h1>Доброе утро, Анна <span>✳</span></h1><p>Вот что происходит с вашим магазином.</p></div><div className="heading-actions"><button className="period-button" onClick={() => setPeriod(period === 'Этот месяц' ? 'Последние 7 дней' : 'Этот месяц')}>▦ <span>{period}</span>⌄</button><button className="primary-button" onClick={() => setAddOpen(v => !v)}>＋ Добавить виджет</button>{addOpen && <div className="add-menu">{widgetOptions.length ? widgetOptions.map(k => <button key={k} onClick={() => addWidget(k)}>＋ <span>{titles[k]}</span></button>) : <div>Все виджеты уже добавлены</div>}</div>}</div></div>
      <div className="dashboard-meta"><span>ОСНОВНЫЕ ПОКАЗАТЕЛИ</span><span><i className="drag-hint">⠿</i> Перетащите виджеты, чтобы изменить порядок</span></div>
      <div className="dashboard-grid" ref={gridRef} onDragOver={e => e.preventDefault()} onDrop={placeWidget}>{widgets.map(widget => <article key={widget.id} className={`widget ${dragging === widget.id ? 'is-dragging' : ''}`} style={{ gridColumn: `${widget.x} / span ${widget.w}`, gridRow: `${widget.y} / span ${widget.h}` }}><div className="widget-header"><div className="widget-title"><span className="drag-grip" draggable onDragStart={e => { e.dataTransfer.setData('text/plain', widget.id); setDragging(widget.id); }} onDragEnd={() => setDragging(null)} title="Перетащите виджет">⠿</span><h2>{titles[widget.kind]}</h2></div><button className="widget-menu" aria-label="Меню виджета">•••</button></div><div className="widget-body"><WidgetBody kind={widget.kind}/></div></article>)}</div>
      <footer className="page-footer"><span>Данные обновлены только что</span><span><i/> Все системы работают</span></footer>
    </section></main>
  </div>;
}
