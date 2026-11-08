import { useRef, useState } from 'react';
import './App.css';

type Widget = { id: string; x: number; y: number; w: number; h: number };

const initialWidgets: Widget[] = [
  { id: 'revenue', x: 1, y: 1, w: 7, h: 7 },
  { id: 'orders', x: 8, y: 1, w: 5, h: 4 },
  { id: 'conversion', x: 8, y: 5, w: 5, h: 3 },
  { id: 'traffic', x: 1, y: 8, w: 4, h: 5 },
  { id: 'sources', x: 5, y: 8, w: 4, h: 5 },
  { id: 'activity', x: 9, y: 8, w: 4, h: 5 },
];

const widgetNames: Record<string, string> = {
  revenue: 'Выручка', orders: 'Заказы', conversion: 'Конверсия',
  traffic: 'Посещаемость', sources: 'Источники трафика', activity: 'Последние заказы',
};

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const paths: Record<string, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    chart: <><path d="M4 19V5M4 19h17"/><path d="m7 15 4-4 3 2 6-7"/><path d="M17 6h3v3"/></>,
    box: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 8 9 5 9-5M3 8v9l9 5 9-5V8M12 13v9"/></>,
    people: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-1a6 6 0 0 1 12 0v1M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5v1"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.5.9L16 21h-3l-.3-1.9a8 8 0 0 1-1.7-.7l-1.6.8-1.7-2.2 1.3-1.3a7 7 0 0 1-.2-1.8l-1.5-1L8.5 10l1.8.3a7 7 0 0 1 1.4-1L12 7.5h3l.5 1.8a7 7 0 0 1 1.5.8l1.7-.6 1.4 2.4-1.4 1.1a7 7 0 0 1-.3 2Z"/></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4 4"/></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    dots: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
    grip: <><circle cx="8" cy="6" r="1" fill="currentColor"/><circle cx="16" cy="6" r="1" fill="currentColor"/><circle cx="8" cy="12" r="1" fill="currentColor"/><circle cx="16" cy="12" r="1" fill="currentColor"/><circle cx="8" cy="18" r="1" fill="currentColor"/><circle cx="16" cy="18" r="1" fill="currentColor"/></>,
    arrow: <><path d="m7 14 5-5 5 5"/></>,
  };
  return <svg {...common}>{paths[name] || paths.grid}</svg>;
}

function RevenueChart() {
  return <div className="chart-wrap">
    <div className="chart-y"><span>₽ 160k</span><span>₽ 120k</span><span>₽ 80k</span><span>₽ 40k</span><span>₽ 0</span></div>
    <div className="chart-main">
      <div className="chart-gridlines"><i/><i/><i/><i/><i/></div>
      <svg className="line-chart" viewBox="0 0 700 210" preserveAspectRatio="none" aria-label="График выручки">
        <defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#5965e8" stopOpacity=".2"/><stop offset="100%" stopColor="#5965e8" stopOpacity="0"/></linearGradient></defs>
        <path d="M0 170 C30 160 42 145 70 151 S110 140 140 150 S180 118 210 130 S250 145 280 110 S320 118 350 98 S390 109 420 88 S460 100 490 70 S530 88 560 62 S600 79 630 47 S670 60 700 26 V210 H0Z" fill="url(#area)"/>
        <path d="M0 170 C30 160 42 145 70 151 S110 140 140 150 S180 118 210 130 S250 145 280 110 S320 118 350 98 S390 109 420 88 S460 100 490 70 S530 88 560 62 S600 79 630 47 S670 60 700 26" fill="none" stroke="#5965e8" strokeWidth="3" vectorEffect="non-scaling-stroke"/>
        <circle cx="700" cy="26" r="5" fill="#fff" stroke="#5965e8" strokeWidth="3" vectorEffect="non-scaling-stroke"/>
      </svg>
      <div className="chart-x"><span>1 июн</span><span>5 июн</span><span>10 июн</span><span>15 июн</span><span>20 июн</span><span>25 июн</span><span>30 июн</span></div>
    </div>
  </div>;
}

function WidgetContent({ id }: { id: string }) {
  if (id === 'revenue') return <>
    <div className="metric-head"><div><div className="metric-value">₽ 1 284 560</div><div className="metric-caption">Общая выручка за период</div></div><div className="metric-change"><span>↗ 12,8%</span><small>к прошлому месяцу</small></div></div>
    <RevenueChart /><div className="legend"><span><i className="legend-dot purple"/>Этот месяц</span><span><i className="legend-dot gray"/>Прошлый месяц</span></div>
  </>;
  if (id === 'orders') return <div className="orders-content"><div><div className="metric-value small">1 429</div><div className="metric-change inline">↗ 8,2% <small>за месяц</small></div></div><div className="mini-bars">{[34,48,39,65,49,59,43,73,56,67,50,82,61,74,58,92,68,78,61,88,73,96].map((v,i)=><i key={i} style={{height:`${v}%`,opacity:i>17?.96:.42}}/>)}</div><div className="axis-labels"><span>1 июн</span><span>15 июн</span><span>30 июн</span></div></div>;
  if (id === 'conversion') return <div className="conversion-content"><div><div className="metric-value small">3,82%</div><div className="metric-change inline">↗ 0,6% <small>к прошлому месяцу</small></div></div><div className="conversion-spark"><svg viewBox="0 0 300 70" preserveAspectRatio="none"><path d="M0 53 C20 50 25 35 47 40 S76 54 93 42 S114 25 134 34 S155 43 172 25 S198 38 216 22 S242 30 259 15 S283 20 300 8" fill="none" stroke="#29a789" strokeWidth="2.5"/><path d="M0 53 C20 50 25 35 47 40 S76 54 93 42 S114 25 134 34 S155 43 172 25 S198 38 216 22 S242 30 259 15 S283 20 300 8 V70 H0Z" fill="#29a789" opacity=".08"/></svg></div></div>;
  if (id === 'traffic') return <div className="traffic-content"><div className="traffic-total">24 816 <span>посетителей</span></div><div className="traffic-bars">{[42,57,47,69,51,75,59,88,68,80,64,94,73,85,67,100,77,88,71,91,74,95,80,98].map((v,i)=><i key={i} style={{height:`${v}%`}}/>)}</div><div className="axis-labels"><span>1 июн</span><span>10 июн</span><span>20 июн</span><span>30 июн</span></div><div className="traffic-footer"><span>Уникальные посетители</span><b>+14,6%</b></div></div>;
  if (id === 'sources') return <div className="sources-content"><div className="donut"><div className="donut-center"><b>24,8k</b><span>переходов</span></div></div><div className="source-list"><div><i className="source-color sc1"/><span>Прямые</span><b>42%</b></div><div><i className="source-color sc2"/><span>Поиск</span><b>28%</b></div><div><i className="source-color sc3"/><span>Соцсети</span><b>18%</b></div><div><i className="source-color sc4"/><span>Рефералы</span><b>12%</b></div></div></div>;
  return <div className="activity-list">
    <div className="activity-row"><div className="avatar av1">АМ</div><div className="activity-details"><b>Александр М.</b><span>Заказ #10482 · 12 490 ₽</span></div><small>2 мин</small></div>
    <div className="activity-row"><div className="avatar av2">ЕК</div><div className="activity-details"><b>Елена К.</b><span>Заказ #10481 · 8 200 ₽</span></div><small>18 мин</small></div>
    <div className="activity-row"><div className="avatar av3">ДВ</div><div className="activity-details"><b>Дмитрий В.</b><span>Заказ #10480 · 5 640 ₽</span></div><small>34 мин</small></div>
    <div className="activity-row"><div className="avatar av4">ОН</div><div className="activity-details"><b>Ольга Н.</b><span>Заказ #10479 · 16 900 ₽</span></div><small>1 ч</small></div>
  </div>;
}

export function App() {
  const [widgets, setWidgets] = useState(initialWidgets);
  const [drag, setDrag] = useState<{ id: string; x: number; y: number; original: Widget } | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [notice, setNotice] = useState('');
  const boardRef = useRef<HTMLDivElement>(null);
  const spanCols = window.innerWidth < 700 ? 6 : 12;

  function positionFromPointer(clientX: number, clientY: number, widget: Widget) {
    const board = boardRef.current;
    if (!board) return { x: widget.x, y: widget.y };
    const rect = board.getBoundingClientRect();
    const styles = getComputedStyle(board);
    const gap = parseFloat(styles.columnGap) || 14;
    const rowGap = parseFloat(styles.rowGap) || 14;
    const cellWidth = (rect.width - gap * (spanCols - 1)) / spanCols;
    const stepX = cellWidth + gap;
    const stepY = 44 + rowGap;
    const x = Math.max(1, Math.min(spanCols - widget.w + 1, Math.round((clientX - rect.left - cellWidth / 2) / stepX) + 1));
    const y = Math.max(1, Math.round((clientY - rect.top - 22) / stepY) + 1);
    return { x, y };
  }

  function startDrag(event: React.PointerEvent<HTMLButtonElement>, widget: Widget) {
    if (spanCols < 12) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ id: widget.id, x: widget.x, y: widget.y, original: widget });
  }
  function moveDrag(event: React.PointerEvent<HTMLButtonElement>) {
    if (!drag) return;
    const pos = positionFromPointer(event.clientX, event.clientY, drag.original);
    setDrag({ ...drag, ...pos });
  }
  function endDrag() {
    if (!drag) return;
    setWidgets(current => {
      const moved = { ...drag.original, x: drag.x, y: drag.y };
      const hit = current.find(w => w.id !== moved.id && moved.x < w.x + w.w && moved.x + moved.w > w.x && moved.y < w.y + w.h && moved.y + moved.h > w.y);
      return current.map(w => w.id === moved.id ? moved : hit && w.id === hit.id ? { ...w, x: drag.original.x, y: drag.original.y } : w);
    });
    setDrag(null);
  }
  function addWidget(id: string) {
    const y = Math.max(...widgets.map(w => w.y + w.h), 1) + 1;
    const widget = { id, x: 1, y, w: id === 'revenue' ? 7 : id === 'orders' || id === 'conversion' ? 5 : 4, h: id === 'revenue' ? 7 : id === 'orders' ? 4 : id === 'conversion' ? 3 : 5 };
    setWidgets(current => current.some(w => w.id === id) ? current : [...current, widget]);
    setShowAdd(false);
    setNotice('Виджет добавлен на дашборд');
    window.setTimeout(() => setNotice(''), 2200);
  }
  function removeWidget(id: string) {
    setWidgets(current => current.filter(w => w.id !== id));
    setNotice('Виджет удалён');
    window.setTimeout(() => setNotice(''), 2200);
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><span/><span/><span/><span/></div><span>nord<span className="brand-light">view</span></span></div>
      <div className="workspace-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
      <button className="workspace-switch"><div className="workspace-avatar">S</div><span><b>Студия Север</b><small>Бизнес-план</small></span><span className="chevron">⌄</span></button>
      <div className="nav-section-label">АНАЛИТИКА</div>
      <nav className="nav-list">
        <button className="nav-item active"><Icon name="grid"/><span>Дашборд</span></button>
        <button className="nav-item"><Icon name="chart"/><span>Отчёты</span></button>
        <button className="nav-item"><Icon name="box"/><span>Продажи</span><span className="nav-count">4</span></button>
        <button className="nav-item"><Icon name="people"/><span>Клиенты</span></button>
      </nav>
      <div className="sidebar-bottom"><button className="nav-item"><Icon name="settings"/><span>Настройки</span></button><div className="help-card"><div className="help-icon">✳</div><b>Нужна помощь?</b><p>Загляните в наш центр поддержки</p><button>Открыть справку <span>↗</span></button></div><div className="user-profile"><div className="profile-avatar">АК</div><span><b>Анна Кузнецова</b><small>Владелец</small></span><Icon name="dots" size={20}/></div></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="breadcrumbs"><span>Студия Север</span><b>/</b><strong>Дашборд</strong></div><div className="top-actions"><button className="search-button"><Icon name="search"/><span>Поиск</span><kbd>⌘ K</kbd></button><button className="icon-button notification"><Icon name="bell"/><i/></button><div className="top-avatar">АК</div></div></header>
      <div className="page-content">
        <div className="page-heading"><div><div className="eyebrow">ОБЗОР ЗА ИЮНЬ 2024</div><h1>Доброе утро, Анна <span>✦</span></h1><p>Вот что происходит с вашим бизнесом сегодня.</p></div><div className="heading-actions"><button className="period-button"><Icon name="calendar"/><span>1 июн — 30 июн, 2024</span><span className="chevron">⌄</span></button><button className="primary-button" onClick={() => setShowAdd(!showAdd)}><Icon name="plus"/>Добавить виджет</button>{showAdd && <div className="add-menu"><b>Добавить виджет</b>{Object.keys(widgetNames).filter(id => !widgets.some(w => w.id === id)).map(id => <button key={id} onClick={() => addWidget(id)}><span className="add-menu-icon"><Icon name={id === 'revenue' || id === 'traffic' ? 'chart' : id === 'activity' ? 'box' : 'grid'} size={16}/></span>{widgetNames[id]}<Icon name="plus" size={15}/></button>)}{Object.keys(widgetNames).every(id => widgets.some(w => w.id === id)) && <p>Все доступные виджеты добавлены</p>}</div>}</div></div>
        <div className="summary-strip"><div className="summary-item"><span className="summary-icon green-bg">₽</span><div><small>ВЫРУЧКА</small><b>₽ 1 284 560</b></div><span className="summary-delta">↗ 12,8%</span></div><i className="summary-divider"/><div className="summary-item"><span className="summary-icon blue-bg">▣</span><div><small>ЗАКАЗЫ</small><b>1 429</b></div><span className="summary-delta">↗ 8,2%</span></div><i className="summary-divider"/><div className="summary-item"><span className="summary-icon orange-bg">♙</span><div><small>СРЕДНИЙ ЧЕК</small><b>₽ 899</b></div><span className="summary-delta">↗ 3,4%</span></div><i className="summary-divider"/><div className="summary-item"><span className="summary-icon pink-bg">◎</span><div><small>КОНВЕРСИЯ</small><b>3,82%</b></div><span className="summary-delta">↗ 0,6%</span></div></div>
        <div className="board-toolbar"><div><b>Обзор показателей</b><span> · </span><span>{widgets.length} виджетов</span></div><div className="board-hint"><Icon name="grip" size={15}/> Перетащите виджет, чтобы изменить порядок</div><button className="board-options"><Icon name="dots"/></button></div>
        <div className="dashboard-grid" ref={boardRef}>
          {widgets.map(widget => {
            const active = drag?.id === widget.id;
            const x = active ? drag.x : widget.x;
            const y = active ? drag.y : widget.y;
            return <section key={widget.id} className={`widget-card ${active ? 'dragging' : ''}`} style={{gridColumn:`${x} / span ${widget.w}`,gridRow:`${y} / span ${widget.h}`,zIndex:active?5:1}}>
              <div className="widget-header"><button className="drag-handle" aria-label="Перетащить виджет" onPointerDown={e => startDrag(e, widget)} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}><Icon name="grip" size={17}/></button><h2>{widgetNames[widget.id]}</h2><button className="widget-menu" aria-label="Удалить виджет" onClick={() => removeWidget(widget.id)}><Icon name="dots" size={19}/></button></div>
              <div className={`widget-body body-${widget.id}`}><WidgetContent id={widget.id}/></div>
            </section>;
          })}
        </div>
        <footer className="page-footer"><span>Данные обновлены 2 минуты назад</span><button>Обновить данные <span>↻</span></button><span className="footer-status"><i/>Все системы работают</span></footer>
      </div>
    </main>
    {notice && <div className="toast">✓ &nbsp;{notice}</div>}
  </div>;
}
