import {useMemo, useState} from 'react';
import ChartKit, {settings} from '@gravity-ui/chartkit';
import {GravityChartsPlugin} from '@gravity-ui/chartkit/gravity-charts';
import {YagrPlugin} from '@gravity-ui/chartkit/yagr';
import {Button, Text} from '@gravity-ui/uikit';

import './app.css';

settings.set({plugins: [GravityChartsPlugin, YagrPlugin]});

type VisualizationMode = 'sales' | 'monitoring';

type Point = {x: number; y: number};

type VisualizationSeries = {
  id: string;
  name: string;
  color: string;
  mode: VisualizationMode;
  points: Point[];
};

export type VisualizationData = {
  series: VisualizationSeries[];
};

type VisualizationWidgetProps = {
  title: string;
  description: string;
  data: VisualizationData;
  initialMode?: VisualizationMode;
};

function VisualizationWidget({title, description, data, initialMode = 'sales'}: VisualizationWidgetProps) {
  const [mode, setMode] = useState<VisualizationMode>(initialMode);
  const visibleSeries = useMemo(() => data.series.filter((series) => series.mode === mode), [data, mode]);
  const chartData = useMemo(() => {
    if (mode === 'sales') {
      return {
        xAxis: {type: 'datetime' as const},
        series: {
          data: visibleSeries.map((series) => ({
            type: 'line' as const,
            name: series.name,
            color: series.color,
            data: series.points.map(({x, y}) => ({x, y})),
          })),
        },
      };
    }

    const timeline = visibleSeries[0]?.points.map(({x}) => x) ?? [];
    return {
      data: {
        timeline,
        graphs: visibleSeries.map((series) => ({
          name: series.name,
          color: series.color,
          data: series.points.map(({y}) => y),
        })),
      },
      libraryConfig: {},
    };
  }, [mode, visibleSeries]);

  return (
    <section className="visualization-card" aria-label={title}>
      <div className="widget-heading">
        <div className="heading-copy">
          <Text variant="subheader-1">{title}</Text>
          <Text variant="body-2" color="secondary">{description}</Text>
        </div>
        <div className="mode-switch" role="group" aria-label="Режим визуализации">
          <Button
            size="m"
            view={mode === 'sales' ? 'normal' : 'flat'}
            selected={mode === 'sales'}
            aria-pressed={mode === 'sales'}
            onClick={() => setMode('sales')}
          >
            Продажи
          </Button>
          <Button
            size="m"
            view={mode === 'monitoring' ? 'normal' : 'flat'}
            selected={mode === 'monitoring'}
            aria-pressed={mode === 'monitoring'}
            onClick={() => setMode('monitoring')}
          >
            Мониторинг
          </Button>
        </div>
      </div>

      <div className="chart-summary">
        <div>
          <Text variant="caption-1" color="secondary">{mode === 'sales' ? 'ВЫРУЧКА ЗА НЕДЕЛЮ' : 'СИГНАЛЫ СИСТЕМЫ'}</Text>
          <div className="summary-value">
            <Text variant="header-2">{mode === 'sales' ? '₽ 8,42 млн' : '3 метрики'}</Text>
            <span className={`summary-change ${mode === 'sales' ? 'is-positive' : 'is-live'}`}>
              {mode === 'sales' ? '↗ 12,8%' : <><span className="live-dot" /> LIVE</>}
            </span>
          </div>
        </div>
        <Text variant="caption-2" color="secondary">{mode === 'sales' ? 'к предыдущей неделе' : 'интервал 1 мин · 7 часов'}</Text>
      </div>

      <div className="chart-viewport" key={mode}>
        <ChartKit
          type={mode === 'sales' ? 'gravity-charts' : 'yagr'}
          data={chartData}
          renderPluginLoader={() => <div className="chart-loader">Загрузка графика…</div>}
        />
      </div>

      <div className="chart-legend" aria-label="Показатели графика">
        {visibleSeries.map((series) => (
          <div className="legend-item" key={series.id}>
            <span className="legend-mark" style={{'--series-color': series.color} as React.CSSProperties} />
            <Text variant="caption-1" color="secondary">{series.name}</Text>
          </div>
        ))}
        <span className="chart-period">{mode === 'sales' ? 'последние 7 дней' : 'последние 7 часов'}</span>
      </div>
    </section>
  );
}

const baseTime = Date.now();

function createMonitoringPoints(offset: number, amplitude: number): Point[] {
  return Array.from({length: 420}, (_, index) => ({
    x: baseTime - (419 - index) * 60_000,
    y: Math.max(0, amplitude + Math.sin(index / 17 + offset) * amplitude * 0.12 + Math.sin(index / 4.4 + offset) * amplitude * 0.035),
  }));
}

const visualizationData: VisualizationData = {
  series: [
    {
      id: 'sales',
      name: 'Продажи',
      mode: 'sales',
      color: 'var(--g-color-text-brand)',
      points: [
        {x: baseTime - 6 * 86_400_000, y: 82}, {x: baseTime - 5 * 86_400_000, y: 96},
        {x: baseTime - 4 * 86_400_000, y: 88}, {x: baseTime - 3 * 86_400_000, y: 112},
        {x: baseTime - 2 * 86_400_000, y: 105}, {x: baseTime - 86_400_000, y: 132},
        {x: baseTime, y: 147},
      ],
    },
    {
      id: 'cpu',
      name: 'CPU',
      mode: 'monitoring',
      color: 'var(--g-color-text-brand)',
      points: createMonitoringPoints(0.4, 61),
    },
    {
      id: 'memory',
      name: 'Память',
      mode: 'monitoring',
      color: 'var(--g-color-text-warning)',
      points: createMonitoringPoints(2.2, 72),
    },
    {
      id: 'latency',
      name: 'Задержка',
      mode: 'monitoring',
      color: 'var(--g-color-text-danger)',
      points: createMonitoringPoints(4.1, 38),
    },
  ],
};

export function App() {
  return (
    <main className="page-shell">
      <div className="page-content">
        <header className="page-heading">
          <div className="eyebrow"><span className="eyebrow-mark" /> DATA STUDIO <span className="eyebrow-divider">/</span> VISUALIZATIONS</div>
          <Text variant="header-1">Обзор показателей</Text>
          <Text variant="body-2" color="secondary">Единое пространство для бизнес-метрик и состояния систем.</Text>
        </header>

        <VisualizationWidget
          title="Ключевые метрики"
          description="Сравнивайте динамику бизнеса и работу инфраструктуры в одном виджете."
          data={visualizationData}
        />
        <footer className="page-footer">
          <span className="footer-status"><span className="live-dot" /> ДАННЫЕ ОБНОВЛЕНЫ</span>
          <span>Источник: аналитическая платформа</span>
        </footer>
      </div>
    </main>
  );
}
