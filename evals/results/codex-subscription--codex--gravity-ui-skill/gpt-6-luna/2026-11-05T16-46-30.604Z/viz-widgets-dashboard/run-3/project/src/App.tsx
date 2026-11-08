import {useEffect, useState} from 'react';
import {Chart} from '@gravity-ui/charts';
import {DashKit} from '@gravity-ui/dashkit';
import type {Config, PluginWidgetProps} from '@gravity-ui/dashkit';
import {Button, Text} from '@gravity-ui/uikit';
import './App.css';

const STORAGE_KEY = 'orbit-dashboard-layout-v1';

type WidgetData = {
  kind: 'metric' | 'revenue' | 'traffic' | 'activity';
  title: string;
  value?: string;
  change?: string;
  changeLabel?: string;
};

const initialConfig: Config = {
  salt: 'orbit-dashboard',
  counter: 6,
  aliases: {},
  connections: [],
  items: [
    {id: 'revenue', type: 'orbit-widget', namespace: 'default', data: {kind: 'metric', title: 'Выручка', value: '₽ 2,84 млн', change: '+12,8%', changeLabel: 'к прошлому месяцу'}},
    {id: 'orders', type: 'orbit-widget', namespace: 'default', data: {kind: 'metric', title: 'Заказы', value: '1 284', change: '+8,2%', changeLabel: 'к прошлому месяцу'}},
    {id: 'average', type: 'orbit-widget', namespace: 'default', data: {kind: 'metric', title: 'Средний чек', value: '₽ 2 211', change: '+3,4%', changeLabel: 'к прошлому месяцу'}},
    {id: 'conversion', type: 'orbit-widget', namespace: 'default', data: {kind: 'metric', title: 'Конверсия', value: '4,82%', change: '+0,6 п.п.', changeLabel: 'к прошлому месяцу'}},
    {id: 'sales-chart', type: 'orbit-widget', namespace: 'default', data: {kind: 'revenue', title: 'Динамика продаж'}},
    {id: 'traffic', type: 'orbit-widget', namespace: 'default', data: {kind: 'traffic', title: 'Источники трафика'}},
    {id: 'activity', type: 'orbit-widget', namespace: 'default', data: {kind: 'activity', title: 'Последние события'}},
  ],
  layout: [
    {i: 'revenue', x: 0, y: 0, w: 9, h: 4},
    {i: 'orders', x: 9, y: 0, w: 9, h: 4},
    {i: 'average', x: 18, y: 0, w: 9, h: 4},
    {i: 'conversion', x: 27, y: 0, w: 9, h: 4},
    {i: 'sales-chart', x: 0, y: 4, w: 24, h: 12},
    {i: 'traffic', x: 24, y: 4, w: 12, h: 12},
    {i: 'activity', x: 0, y: 16, w: 18, h: 9},
  ],
};

DashKit.setSettings({
  gridLayout: {cols: 36, rowHeight: 22, margin: [14, 14], containerPadding: [0, 0], compactType: 'vertical'},
});

function RevenueChart() {
  return (
    <div className="chart-frame">
      <Chart
        data={{
          series: {
            data: [
              {type: 'area', name: 'Выручка', data: [
                {x: 0, y: 24}, {x: 1, y: 30}, {x: 2, y: 27}, {x: 3, y: 39},
                {x: 4, y: 34}, {x: 5, y: 48}, {x: 6, y: 42}, {x: 7, y: 54},
                {x: 8, y: 50}, {x: 9, y: 65}, {x: 10, y: 58}, {x: 11, y: 72},
              ]},
              {type: 'line', name: 'Предыдущий период', data: [
                {x: 0, y: 18}, {x: 1, y: 25}, {x: 2, y: 22}, {x: 3, y: 29},
                {x: 4, y: 27}, {x: 5, y: 34}, {x: 6, y: 31}, {x: 7, y: 39},
                {x: 8, y: 37}, {x: 9, y: 44}, {x: 10, y: 41}, {x: 11, y: 49},
              ]},
            ],
          },
          xAxis: {type: 'category', categories: ['1 окт', '3 окт', '5 окт', '7 окт', '9 окт', '11 окт', '13 окт', '15 окт', '17 окт', '19 окт', '21 окт', '23 окт']},
        }}
      />
    </div>
  );
}

function TrafficWidget() {
  const sources = [
    {name: 'Прямые заходы', share: '38%', amount: '₽ 1,08 млн', value: 38, tone: 'indigo'},
    {name: 'Поиск', share: '27%', amount: '₽ 766 тыс.', value: 27, tone: 'blue'},
    {name: 'Соцсети', share: '21%', amount: '₽ 596 тыс.', value: 21, tone: 'violet'},
    {name: 'Рефералы', share: '14%', amount: '₽ 398 тыс.', value: 14, tone: 'slate'},
  ];
  return (
    <div className="traffic-widget">
      <div className="traffic-total"><span>Всего за период</span><strong>₽ 2,84 млн</strong></div>
      <div className="traffic-track" aria-label="Распределение выручки по источникам">
        {sources.map((source) => <span key={source.name} className={`traffic-segment traffic-segment_${source.tone}`} style={{width: `${source.value}%`}} />)}
      </div>
      <div className="source-list">
        {sources.map((source) => (
          <div className="source-row" key={source.name}>
            <span className={`source-dot source-dot_${source.tone}`} />
            <span className="source-name">{source.name}</span>
            <span className="source-share">{source.share}</span>
            <strong>{source.amount}</strong>
          </div>
        ))}
      </div>
      <div className="widget-footnote">Доля от общей выручки за выбранный период</div>
    </div>
  );
}

function ActivityWidget() {
  const activity = [
    {initials: 'АК', name: 'Алексей К.', action: 'оформил заказ', detail: 'Заказ № 10482 · ₽ 8 400', time: '2 мин назад', color: 'peach'},
    {initials: 'МВ', name: 'Мария В.', action: 'вернулась на сайт', detail: 'Прямой переход · Москва', time: '14 мин назад', color: 'lilac'},
    {initials: 'ИП', name: 'Иван П.', action: 'оформил заказ', detail: 'Заказ № 10481 · ₽ 3 200', time: '28 мин назад', color: 'mint'},
    {initials: 'ЕС', name: 'Екатерина С.', action: 'добавила товар в корзину', detail: 'Каталог · 3 товара', time: '41 мин назад', color: 'sky'},
  ];
  return (
    <div className="activity-list">
      {activity.map((event) => (
        <div className="activity-row" key={event.initials}>
          <span className={`avatar avatar_${event.color}`}>{event.initials}</span>
          <div className="activity-copy"><div><strong>{event.name}</strong> {event.action}</div><span>{event.detail}</span></div>
          <time>{event.time}</time>
        </div>
      ))}
    </div>
  );
}

function Widget({data}: PluginWidgetProps) {
  const widget = data as WidgetData;
  return (
    <div className={`widget-card widget-card_${widget.kind}`}>
      <div className="widget-heading">
        <Text variant="subheader-2" color="primary">{widget.title}</Text>
        {widget.kind === 'revenue' && <span className="widget-period">По дням <span aria-hidden="true">⌄</span></span>}
      </div>
      {widget.kind === 'metric' && (
        <div className="metric-content"><strong className="metric-value">{widget.value}</strong><div className="metric-change"><span>{widget.change}</span><span className="metric-change-label">{widget.changeLabel}</span></div></div>
      )}
      {widget.kind === 'revenue' && <><div className="chart-summary"><strong>₽ 2,84 млн</strong><span className="positive-chip">↗ 12,8%</span><span>к прошлому месяцу</span></div><RevenueChart /></>}
      {widget.kind === 'traffic' && <TrafficWidget />}
      {widget.kind === 'activity' && <ActivityWidget />}
    </div>
  );
}

DashKit.registerPlugins({
  type: 'orbit-widget',
  defaultLayout: {w: 12, h: 9, minW: 6, minH: 4},
  renderer: (props) => <Widget {...props} />,
});

function readInitialConfig(): Config {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as Config;
  } catch {
    // Use the example layout when storage is unavailable or invalid.
  }
  return initialConfig;
}

export function App() {
  const [config, setConfig] = useState<Config>(readInitialConfig);
  const [range, setRange] = useState('Последние 30 дней');

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(config)); } catch { /* Storage can be disabled. */ }
  }, [config]);

  const addWidget = () => {
    const id = `metric-${Date.now()}`;
    setConfig((current) => DashKit.setItem({
      config: current,
      item: {id, type: 'orbit-widget', namespace: 'default', data: {kind: 'metric', title: 'Новый показатель', value: '—', change: '0%', changeLabel: 'нет изменений'}},
    }));
  };

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <a className="brand" href="#dashboard" aria-label="Орбита — главная">
          <span className="brand-mark"><i /><i /><i /></span><span>орбита</span>
        </a>
        <nav className="main-nav" aria-label="Главная навигация"><a className="nav-link nav-link_active" href="#dashboard">Обзор</a><a className="nav-link" href="#reports">Отчёты</a><a className="nav-link" href="#customers">Клиенты</a></nav>
        <div className="topbar-right"><span className="workspace-name">Магазин «Север» <span aria-hidden="true">⌄</span></span><span className="topbar-avatar">С</span></div>
      </header>

      <section className="page-content" id="dashboard">
        <div className="page-heading-row">
          <div><div className="breadcrumb">Рабочее пространство <span>/</span> Аналитика</div><Text variant="header-1" color="primary">Обзор магазина</Text><p className="page-subtitle">Ключевые показатели и активность в одном месте</p></div>
          <Button view="normal" size="m" onClick={addWidget}><Button.Icon>＋</Button.Icon>Добавить виджет</Button>
        </div>
        <div className="toolbar"><div className="toolbar-left"><button className="range-button" onClick={() => setRange((value) => value === 'Последние 30 дней' ? 'Последние 7 дней' : 'Последние 30 дней')}><span className="calendar-glyph">▦</span>{range}<span className="chevron">⌄</span></button><span className="updated-indicator"><span />Данные обновлены минуту назад</span></div><Button view="flat" size="s" onClick={() => setConfig(initialConfig)}>Сбросить раскладку</Button></div>
        <div className="dashboard-grid">
          <DashKit config={config} editMode onChange={({config: next}) => setConfig(next)} />
        </div>
        <footer className="dashboard-footer"><span>Перетаскивайте виджеты, чтобы настроить обзор под себя</span><span className="footer-key">Изменения сохраняются автоматически</span></footer>
      </section>
    </main>
  );
}
