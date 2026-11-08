import {lazy, Suspense, useMemo, useState} from 'react';
import './app.css';

type Mode = 'sales' | 'monitoring';
export type Point = {time: string; value: number};
export type ChartProps = {data: Point[]; mode: Mode};

const engines = {
  sales: lazy(() => import('./charts/SalesChart')),
  monitoring: lazy(() => import('./charts/MonitoringChart')),
};

const salesData: Point[] = [
  ['1 июн', 318], ['3 июн', 352], ['5 июн', 330], ['7 июн', 390], ['9 июн', 374], ['11 июн', 425],
  ['13 июн', 398], ['15 июн', 456], ['17 июн', 440], ['19 июн', 488], ['21 июн', 462], ['23 июн', 526],
  ['25 июн', 502], ['27 июн', 570], ['29 июн', 548], ['30 июн', 612],
].map(([time, value]) => ({time: String(time), value: Number(value)}));

const monitoringData: Point[] = Array.from({length: 640}, (_, i) => {
  const baseline = 72 + Math.sin(i * 0.045) * 7 + Math.sin(i * 0.17) * 3.2;
  const noise = Math.sin(i * 1.73) * 2.5 + Math.cos(i * 2.91) * 1.7;
  const spike = i % 127 > 2 && i % 127 < 7 ? (7 - (i % 127)) * 4 : 0;
  return {time: `${String(Math.floor(i / 60)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}`, value: Math.max(48, baseline + noise + spike)};
});

function VisualizationWidget({mode, onModeChange, data}: {mode: Mode; onModeChange: (mode: Mode) => void; data: Point[]}) {
  const Engine = engines[mode];
  return <section className="chart-card">
    <div className="chart-head">
      <div>
        <div className="eyebrow">ВИЗУАЛИЗАЦИЯ</div>
        <h2>{mode === 'sales' ? 'Динамика продаж' : 'Нагрузка системы'}</h2>
        <p>{mode === 'sales' ? 'Выручка по дням · последние 30 дней' : 'Время отклика API · сегодня, поминутно'}</p>
      </div>
      <div className="mode-switch" role="tablist" aria-label="Тип визуализации">
        <button className={mode === 'sales' ? 'selected' : ''} onClick={() => onModeChange('sales')} role="tab" aria-selected={mode === 'sales'}>
          <span className="switch-icon">↗</span> Продажи
        </button>
        <button className={mode === 'monitoring' ? 'selected' : ''} onClick={() => onModeChange('monitoring')} role="tab" aria-selected={mode === 'monitoring'}>
          <span className="switch-icon pulse-icon">⌁</span> Мониторинг
        </button>
      </div>
    </div>
    <div className="chart-legend">
      <span className="legend-dot" />
      <strong>{mode === 'sales' ? 'Выручка' : 'Время отклика'}</strong>
      <span className="legend-unit">{mode === 'sales' ? 'тыс. ₽' : 'мс'}</span>
      <span className="chart-live"><i />{mode === 'sales' ? 'Данные обновлены' : 'Обновляется в реальном времени'}</span>
    </div>
    <div className="chart-area">
      <Suspense fallback={<div className="chart-loading"><span className="loader" />Загружаем график…</div>}>
        <Engine data={data} mode={mode} />
      </Suspense>
    </div>
    <div className="chart-foot"><span>{mode === 'sales' ? '1 июн' : '00:00'}</span><span>{mode === 'sales' ? '15 июн' : '08:00'}</span><span>{mode === 'sales' ? '30 июн' : '16:00'}</span><span>{mode === 'sales' ? 'Сегодня' : 'Сейчас'}</span></div>
  </section>;
}

export function App() {
  const [mode, setMode] = useState<Mode>('sales');
  const data = useMemo(() => mode === 'sales' ? salesData : monitoringData, [mode]);
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark"><i /><i /><i /></span><span>orbit<span className="brand-light">.analytics</span></span></div>
      <div className="workspace"><div className="workspace-avatar">А</div><div><b>Атлас Студио</b><small>Рабочее пространство</small></div><span className="chevron">⌄</span></div>
      <div className="nav-label">РАБОЧЕЕ</div>
      <nav>
        <a href="#overview"><span className="nav-icon">◫</span> Обзор</a>
        <a href="#reports"><span className="nav-icon">▤</span> Отчёты</a>
        <a href="#dashboards" className="active"><span className="nav-icon">▦</span> Дашборды<span className="nav-count">3</span></a>
        <a href="#sources"><span className="nav-icon">⌘</span> Источники данных</a>
      </nav>
      <div className="nav-label second-label">ИЗБРАННОЕ</div>
      <a className="favorite" href="#sales"><span className="favorite-mark purple" />Продажи по каналам</a>
      <a className="favorite" href="#team"><span className="favorite-mark blue" />Команда поддержки</a>
      <div className="sidebar-bottom"><div className="help-card"><span className="help-bulb">✳</span><b>Нужна помощь?</b><small>Загляните в центр знаний</small><a href="#help">Открыть справку <span>↗</span></a></div><div className="profile"><div className="profile-avatar">МК</div><div><b>Мария Козлова</b><small>Администратор</small></div><span className="dots">···</span></div></div>
    </aside>
    <main className="main-content">
      <header className="topbar"><div className="breadcrumbs">Дашборды <span>/</span> <b>Обзор бизнеса</b></div><div className="top-actions"><button className="icon-button" aria-label="Поиск">⌕</button><button className="icon-button notification" aria-label="Уведомления">♧<i /></button><div className="top-avatar">МК</div></div></header>
      <div className="page-content">
        <div className="page-heading"><div><div className="title-row"><h1>Обзор бизнеса</h1><span className="status-pill"><i /> Актуально</span></div><p>Следите за ключевыми показателями вашей команды</p></div><div className="page-tools"><button className="date-button"><span>▦</span> 1 июн — 30 июн 2024 <span className="chevron">⌄</span></button><button className="share-button"><span>↥</span> Поделиться</button><button className="more-button">···</button></div></div>
        <div className="kpi-grid">
          <article className="kpi-card"><div className="kpi-top"><span>Общая выручка</span><span className="kpi-icon violet">₽</span></div><strong>4 862 940 <small>₽</small></strong><div className="kpi-bottom"><span className="trend up">↗ 12,8%</span><span>к прошлому месяцу</span><svg viewBox="0 0 78 30" className="spark"><path d="M1 25 C12 20 13 23 20 16 S31 20 39 12 S50 18 58 8 S67 12 77 3" /></svg></div></article>
          <article className="kpi-card"><div className="kpi-top"><span>Заказы</span><span className="kpi-icon blue">▣</span></div><strong>1 284</strong><div className="kpi-bottom"><span className="trend up">↗ 8,2%</span><span>к прошлому месяцу</span><svg viewBox="0 0 78 30" className="spark blue-spark"><path d="M1 23 C10 17 14 26 22 17 S33 19 40 13 S48 17 57 10 S69 12 77 4" /></svg></div></article>
          <article className="kpi-card"><div className="kpi-top"><span>Средний чек</span><span className="kpi-icon orange">◉</span></div><strong>3 786 <small>₽</small></strong><div className="kpi-bottom"><span className="trend down">↘ 2,4%</span><span>к прошлому месяцу</span><svg viewBox="0 0 78 30" className="spark orange-spark"><path d="M1 7 C10 9 12 4 20 10 S30 12 38 11 S48 20 57 15 S68 22 77 25" /></svg></div></article>
          <article className="kpi-card"><div className="kpi-top"><span>Конверсия</span><span className="kpi-icon green">⌁</span></div><strong>3,42<small>%</small></strong><div className="kpi-bottom"><span className="trend up">↗ 0,6%</span><span>к прошлому месяцу</span><svg viewBox="0 0 78 30" className="spark green-spark"><path d="M1 25 C9 22 15 15 21 19 S29 12 37 15 S47 4 56 11 S69 7 77 3" /></svg></div></article>
        </div>
        <VisualizationWidget mode={mode} onModeChange={setMode} data={data} />
        <div className="lower-grid"><section className="lower-card"><div className="lower-heading"><div><h3>Продажи по каналам</h3><p>Распределение выручки</p></div><button className="tiny-more">···</button></div><div className="channel-content"><div className="donut"><div><b>4,86</b><small>млн ₽</small></div></div><div className="channel-list"><div><i className="channel-color c1"/><span>Сайт</span><b>52%</b></div><div><i className="channel-color c2"/><span>Маркетплейсы</span><b>31%</b></div><div><i className="channel-color c3"/><span>Розница</span><b>17%</b></div></div></div></section><section className="lower-card activity-card"><div className="lower-heading"><div><h3>Последние события</h3><p>Обновления в вашем пространстве</p></div><a href="#all">Все события <span>→</span></a></div><div className="activity-row"><span className="activity-icon lavender">↗</span><div><b>Выручка выросла на 12,8%</b><small>По сравнению с прошлым месяцем</small></div><time>12 мин</time></div><div className="activity-row"><span className="activity-icon mint">✓</span><div><b>Отчёт успешно обновлён</b><small>Продажи по каналам · 09:42</small></div><time>48 мин</time></div><div className="activity-row"><span className="activity-icon peach">＋</span><div><b>Новый источник данных</b><small>Интернет-магазин подключён</small></div><time>2 ч</time></div></section></div>
        <footer>© 2024 Orbit Analytics <span>Все системы работают нормально <i /></span></footer>
      </div>
    </main>
  </div>;
}
