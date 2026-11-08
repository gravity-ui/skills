import {useMemo, useState} from 'react';
import ChartKit, {settings} from '@gravity-ui/chartkit';
import {GravityChartsPlugin} from '@gravity-ui/chartkit/gravity-charts';
import {YagrPlugin} from '@gravity-ui/chartkit/yagr';
import {SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

import './App.css';

settings.set({plugins: [GravityChartsPlugin, YagrPlugin]});

type View = 'sales' | 'monitoring';

const DAY = 24 * 60 * 60 * 1000;
const today = new Date('2026-11-05T00:00:00Z').getTime();

const salesChartData = {
  series: {
    data: [
      {
        type: 'line' as const,
        name: 'Выручка',
        color: 'var(--g-color-base-brand)',
        data: [
          {x: today - DAY * 27, y: 28}, {x: today - DAY * 26, y: 32},
          {x: today - DAY * 25, y: 29}, {x: today - DAY * 24, y: 37},
          {x: today - DAY * 23, y: 35}, {x: today - DAY * 22, y: 42},
          {x: today - DAY * 21, y: 38}, {x: today - DAY * 20, y: 45},
          {x: today - DAY * 19, y: 41}, {x: today - DAY * 18, y: 48},
          {x: today - DAY * 17, y: 44}, {x: today - DAY * 16, y: 51},
          {x: today - DAY * 15, y: 49}, {x: today - DAY * 14, y: 54},
          {x: today - DAY * 13, y: 47}, {x: today - DAY * 12, y: 56},
          {x: today - DAY * 11, y: 53}, {x: today - DAY * 10, y: 62},
          {x: today - DAY * 9, y: 59}, {x: today - DAY * 8, y: 64},
          {x: today - DAY * 7, y: 58}, {x: today - DAY * 6, y: 67},
          {x: today - DAY * 5, y: 63}, {x: today - DAY * 4, y: 72},
          {x: today - DAY * 3, y: 69}, {x: today - DAY * 2, y: 78},
          {x: today - DAY, y: 74}, {x: today, y: 86},
        ],
      },
    ],
  },
  xAxis: {type: 'datetime' as const},
  yAxis: [{title: {text: 'тыс. ₽'}}],
  legend: {enabled: false},
};

function makeMonitoringData() {
  const count = 1800;
  const timeline = Array.from({length: count}, (_, index) => today - (count - index) * 10_000);
  const jitter = (index: number, offset: number) => Math.sin(index * 0.21 + offset) * 0.55 + Math.cos(index * 0.053 + offset) * 0.3;

  return {
    data: {
      timeline,
      graphs: [
        {name: 'CPU', color: 'var(--g-color-base-brand)', data: timeline.map((_, i) => 52 + jitter(i, 0) * 28 + (i % 263 > 255 ? 16 : 0))},
        {name: 'Память', color: 'var(--g-color-line-warning)', data: timeline.map((_, i) => 43 + jitter(i, 2) * 15)},
        {name: 'Задержка', color: 'var(--g-color-line-positive)', data: timeline.map((_, i) => 24 + jitter(i, 4) * 10 + (i % 401 > 395 ? 18 : 0))},
      ],
    },
    libraryConfig: {},
  };
}

export function VisualizationWidget() {
  const [view, setView] = useState<View>('sales');
  const monitoringData = useMemo(makeMonitoringData, []);

  return (
    <section className="visualization-card" aria-label="Виджет визуализации">
      <div className="widget-header">
        <div className="widget-heading">
          <Text variant="header-2" as="h1">Аналитика</Text>
          <Text variant="body-1" color="secondary">Продажи и состояние инфраструктуры</Text>
        </div>
        <SegmentedRadioGroup
          aria-label="Режим графика"
          size="m"
          value={view}
          onUpdate={(next) => setView(next as View)}
        >
          <SegmentedRadioGroup.Option value="sales" content="Продажи" />
          <SegmentedRadioGroup.Option value="monitoring" content="Мониторинг" />
        </SegmentedRadioGroup>
      </div>

      <div className="chart-title-row">
        <div>
          <Text variant="subheader-2" as="h2">{view === 'sales' ? 'Выручка' : 'Метрики системы'}</Text>
          <Text variant="caption-1" color="secondary">
            {view === 'sales' ? 'Последние 28 дней · ежедневно' : 'Последние 5 часов · шаг 10 секунд'}
          </Text>
        </div>
        <div className="chart-period">
          <span className="status-dot" />
          <Text variant="caption-1" color="secondary">{view === 'sales' ? 'Обновлено сегодня' : 'Окно мониторинга'}</Text>
        </div>
      </div>

      <div className="chart-area">
        {view === 'sales' ? (
          <ChartKit type="gravity-charts" data={salesChartData} />
        ) : (
          <ChartKit type="yagr" data={monitoringData} />
        )}
      </div>

      <div className="widget-footer">
        {view === 'sales' ? (
          <>
            <div className="footer-stat">
              <Text variant="caption-1" color="secondary">Выручка за период</Text>
              <Text variant="subheader-2">₽ 1,46 млн</Text>
            </div>
            <div className="footer-stat">
              <Text variant="caption-1" color="secondary">К прошлому периоду</Text>
              <Text variant="subheader-2" color="positive">↗ 12,8%</Text>
            </div>
            <Text className="footer-note" variant="caption-1" color="secondary">Данные синхронизированы с CRM</Text>
          </>
        ) : (
          <>
            <div className="legend-item"><span className="legend-line cpu" /> <Text variant="caption-1">CPU <b>54%</b></Text></div>
            <div className="legend-item"><span className="legend-line memory" /> <Text variant="caption-1">Память <b>43%</b></Text></div>
            <div className="legend-item"><span className="legend-line latency" /> <Text variant="caption-1">Задержка <b>24 мс</b></Text></div>
            <Text className="footer-note" variant="caption-1" color="secondary">1 800 точек · 3 ряда</Text>
          </>
        )}
      </div>
    </section>
  );
}

export function App() {
  return (
    <main className="app-shell">
      <div className="page-kicker">ПАНЕЛЬ ДАННЫХ</div>
      <VisualizationWidget />
      <div className="page-footnote">Единый виджет · Gravity UI ChartKit</div>
    </main>
  );
}
