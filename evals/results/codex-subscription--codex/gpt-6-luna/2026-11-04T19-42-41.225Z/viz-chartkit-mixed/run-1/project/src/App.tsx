import {useState} from 'react';
import {VisualizationWidget} from './VisualizationWidget';
import './styles.css';

const sales = [
  {time: '09:00', value: 24}, {time: '10:00', value: 31}, {time: '11:00', value: 28},
  {time: '12:00', value: 40}, {time: '13:00', value: 35}, {time: '14:00', value: 47},
  {time: '15:00', value: 43}, {time: '16:00', value: 58}, {time: '17:00', value: 52},
  {time: '18:00', value: 68}, {time: '19:00', value: 62}, {time: '20:00', value: 76},
];

const monitoring = Array.from({length: 180}, (_, index) => {
  const base = 54 + Math.sin(index / 9) * 11 + Math.sin(index / 2.8) * 4;
  const spike = index > 123 && index < 129 ? 25 : 0;
  return {time: `${String(Math.floor(index / 6)).padStart(2, '0')}:${String((index % 6) * 10).padStart(2, '0')}`, value: Math.max(8, Math.min(96, base + spike))};
});

export function App() {
  const [range, setRange] = useState('Сегодня');
  return <main className="page-shell">
    <header className="topbar"><a className="brand" href="#"><span className="brand-mark">N</span> northstar<span className="brand-dash">/</span>analytics</a><div className="topbar-right"><span className="status-dot"/> Все системы работают <span className="avatar">М</span></div></header>
    <section className="page-heading"><div><div className="eyebrow">ОБЗОР ДАННЫХ <span>•</span> ПРОДУКТ</div><h1>Аналитика</h1><p>Отслеживайте динамику продаж и состояние инфраструктуры.</p></div><div className="range-control">{['Сегодня', '7 дней', '30 дней'].map((item) => <button key={item} className={range === item ? 'range-active' : ''} onClick={() => setRange(item)}>{item}</button>)}</div></section>
    <section className="metric-row">
      <article className="metric-card"><div className="metric-label">Выручка <span className="metric-icon">↗</span></div><div className="metric-value">₽ 284 650</div><div className="metric-foot"><span className="positive">↑ 12,8%</span> к прошлому периоду</div></article>
      <article className="metric-card"><div className="metric-label">Заказы <span className="metric-icon">▤</span></div><div className="metric-value">1 248</div><div className="metric-foot"><span className="positive">↑ 8,2%</span> к прошлому периоду</div></article>
      <article className="metric-card"><div className="metric-label">Средний чек <span className="metric-icon">◎</span></div><div className="metric-value">₽ 2 281</div><div className="metric-foot"><span className="negative">↓ 1,4%</span> к прошлому периоду</div></article>
      <article className="metric-card"><div className="metric-label">Конверсия <span className="metric-icon">⌁</span></div><div className="metric-value">3,64%</div><div className="metric-foot"><span className="positive">↑ 0,6%</span> к прошлому периоду</div></article>
    </section>
    <VisualizationWidget title="Динамика" subtitle="Продажи и состояние мониторинга в одном виджете" salesData={sales} monitoringData={monitoring} />
  </main>;
}
