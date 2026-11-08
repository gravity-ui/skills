import {useMemo, useState} from 'react';
import {Button, Text} from '@gravity-ui/uikit';
import ChartKit, {settings} from '@gravity-ui/chartkit';
import {GravityChartsPlugin} from '@gravity-ui/chartkit/gravity-charts';
import {YagrPlugin} from '@gravity-ui/chartkit/yagr';
import './app.css';

settings.set({plugins: [GravityChartsPlugin, YagrPlugin]});

type ViewMode = 'sales' | 'monitoring';

const salesData = {
  series: {
    data: [
      {
        type: 'line' as const,
        name: 'Продажи',
        data: [
          {x: 0, y: 42}, {x: 1, y: 48}, {x: 2, y: 45}, {x: 3, y: 58},
          {x: 4, y: 54}, {x: 5, y: 67}, {x: 6, y: 63}, {x: 7, y: 76},
          {x: 8, y: 72}, {x: 9, y: 88}, {x: 10, y: 83}, {x: 11, y: 96},
        ],
      },
    ],
  },
};

const monitoringTimeline = Array.from({length: 720}, (_, index) => 1762336800 + index * 60);
const monitoringGraphs = [
  {
    name: 'CPU',
    color: 'var(--g-color-line-brand)',
    data: monitoringTimeline.map((_, index) => 42 + Math.sin(index / 15) * 12 + Math.sin(index / 4) * 3),
  },
  {
    name: 'Память',
    color: 'var(--g-color-line-positive)',
    data: monitoringTimeline.map((_, index) => 58 + Math.cos(index / 27) * 8 + Math.sin(index / 6) * 2),
  },
  {
    name: 'Задержка',
    color: 'var(--g-color-line-warning)',
    data: monitoringTimeline.map((_, index) => 24 + Math.abs(Math.sin(index / 9)) * 18 + (index % 89 === 0 ? 32 : 0)),
  },
];

function VisualizationWidget({mode}: {mode: ViewMode}) {
  const chart = useMemo(() => mode === 'sales'
    ? {type: 'gravity-charts' as const, data: salesData}
    : {
        type: 'yagr' as const,
        data: {
          data: {timeline: monitoringTimeline, graphs: monitoringGraphs},
          libraryConfig: {
            axes: {},
          },
        },
      }, [mode]);

  return <div className="chart-frame">
    <ChartKit type={chart.type} data={chart.data} />
  </div>;
}

export function App() {
  const [mode, setMode] = useState<ViewMode>('sales');
  const isMonitoring = mode === 'monitoring';

  return <main className="page-shell">
    <header className="topbar">
      <div className="brand-mark" aria-hidden="true"><span /></div>
      <Text variant="subheader-2">Наблюдение</Text>
      <div className="topbar-spacer" />
      <span className="status-dot" />
      <Text variant="body-2" color="secondary">Все системы работают</Text>
      <div className="avatar">А</div>
    </header>

    <section className="content">
      <div className="breadcrumb">Рабочая область <span>/</span> Аналитика</div>
      <div className="page-heading">
        <div>
          <Text variant="display-2">Аналитика</Text>
          <Text className="page-description" variant="body-2" color="secondary">Продажи и состояние инфраструктуры в одном окне</Text>
        </div>
        <Button view="outlined" size="l" className="period-button">
          <span className="calendar-glyph" aria-hidden="true">▦</span> Последние 24 часа <span className="chevron">⌄</span>
        </Button>
      </div>

      <section className="widget-card" aria-label="Визуализация данных">
        <div className="widget-header">
          <div>
            <Text variant="subheader-2">{isMonitoring ? 'Мониторинг сервисов' : 'Динамика продаж'}</Text>
            <Text className="widget-subtitle" variant="body-2" color="secondary">
              {isMonitoring ? 'Показатели за последний час · обновлено только что' : 'Выручка по дням · текущий месяц'}
            </Text>
          </div>
          <div className="mode-switch" role="group" aria-label="Режим визуализации">
            <Button view={mode === 'sales' ? 'normal' : 'flat'} size="m" aria-pressed={mode === 'sales'} onClick={() => setMode('sales')}>
              <span className="mode-icon" aria-hidden="true">↗</span> Продажи
            </Button>
            <Button view={mode === 'monitoring' ? 'normal' : 'flat'} size="m" aria-pressed={mode === 'monitoring'} onClick={() => setMode('monitoring')}>
              <span className="mode-icon pulse-icon" aria-hidden="true">⌁</span> Мониторинг
            </Button>
          </div>
        </div>

        <div className="metric-row">
          {isMonitoring ? <>
            <div className="metric"><span className="metric-label">CPU</span><strong>42<span>%</span></strong><small className="metric-good">↓ 3.2%</small></div>
            <div className="metric"><span className="metric-label">Память</span><strong>58<span>%</span></strong><small>стабильно</small></div>
            <div className="metric"><span className="metric-label">Задержка</span><strong>31<span>мс</span></strong><small className="metric-good">↓ 8 мс</small></div>
          </> : <>
            <div className="metric"><span className="metric-label">Выручка</span><strong>₽ 1,42<span>млн</span></strong><small className="metric-good">↑ 12,8%</small></div>
            <div className="metric"><span className="metric-label">Заказы</span><strong>2 846</strong><small className="metric-good">↑ 6,4%</small></div>
            <div className="metric"><span className="metric-label">Средний чек</span><strong>₽ 4 980</strong><small className="metric-good">↑ 3,1%</small></div>
          </>}
          <div className="metric-note"><span className="note-icon">✦</span><span>{isMonitoring ? 'Обновление данных<br/><b>каждую минуту</b>' : 'По сравнению<br/><b>с прошлым периодом</b>'}</span></div>
        </div>

        <VisualizationWidget mode={mode} />

        <div className="widget-footer">
          <span><i className={isMonitoring ? 'legend-dot blue' : 'legend-dot violet'} />{isMonitoring ? 'Нагрузка сервисов' : 'Выручка'}</span>
          <span className="footer-hint">{isMonitoring ? '720 точек · шаг 1 мин' : '1–12 ноября 2026'}</span>
        </div>
      </section>

      <div className="bottom-note"><span className="sparkle">✳</span> Переключайте режим, чтобы исследовать бизнес-показатели или состояние системы</div>
    </section>
  </main>;
}
