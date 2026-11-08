import {useEffect, useMemo, useRef, useState} from 'react';
import {useThemeValue} from '@gravity-ui/uikit';
import Yagr, {type YagrReactRef} from '@gravity-ui/yagr/react';

import './App.css';

const HISTORY_SECONDS = 24 * 60 * 60;
const SAMPLE_INTERVAL_SECONDS = 3;
const HISTORY_POINTS = HISTORY_SECONDS / SAMPLE_INTERVAL_SECONDS;
const UPDATE_INTERVAL_MS = SAMPLE_INTERVAL_SECONDS * 1000;

function getCpuUsage(index: number) {
  const dailyCycle = Math.sin(index / 1370) * 10;
  const shortCycle = Math.sin(index / 93) * 5;
  const workload = Math.sin(index / 19) * 2;
  const burst = Math.sin(index / 617) > 0.985 ? 18 : 0;

  return Math.max(6, Math.min(96, 38 + dailyCycle + shortCycle + workload + burst));
}

function formatClock(timestamp: number) {
  return new Intl.DateTimeFormat('ru-RU', {hour: '2-digit', minute: '2-digit'}).format(timestamp);
}

export function App() {
  const themeValue = useThemeValue();
  const chartRef = useRef<YagrReactRef>(null);
  const [latestUsage, setLatestUsage] = useState(() => getCpuUsage(Math.floor(Date.now() / UPDATE_INTERVAL_MS)));
  const [updatedAt, setUpdatedAt] = useState(() => Date.now());

  const initialData = useMemo(() => {
    const now = Date.now();
    const timeline = new Array<number>(HISTORY_POINTS);
    const values = new Array<number>(HISTORY_POINTS);
    const firstIndex = Math.floor(now / UPDATE_INTERVAL_MS) - HISTORY_POINTS + 1;

    for (let i = 0; i < HISTORY_POINTS; i += 1) {
      const pointIndex = firstIndex + i;
      timeline[i] = pointIndex * SAMPLE_INTERVAL_SECONDS;
      values[i] = getCpuUsage(pointIndex);
    }

    return {timeline, values};
  }, []);

  const chartConfig = useMemo(
    () => ({
      timeline: initialData.timeline,
      series: [
        {
          id: 'cpu',
          name: 'Загрузка CPU',
          data: initialData.values,
          type: 'area' as const,
          width: 2,
        },
      ],
      chart: {
        size: {adaptive: true, resizeDebounceMs: 80},
        appearance: {theme: 'light' as const},
        timeMultiplier: 1e-3 as const,
      },
      axes: {
        x: {side: 'bottom' as const, time: true},
        y: {
          side: 'left' as const,
          values: (_: unknown, ticks: number[]) => ticks.map((tick) => `${tick}%`),
        },
      },
      scales: {y: {min: 0, max: 100}},
      tooltip: {show: true, precision: 1},
      legend: {show: false},
    }),
    [initialData],
  );

  useEffect(() => {
    const chart = chartRef.current?.yagr();
    if (chart) {
      chart.setTheme(themeValue.startsWith('dark') ? 'dark' : 'light');
    }
  }, [themeValue]);

  useEffect(() => {
    const update = () => {
      const pointIndex = Math.floor(Date.now() / UPDATE_INTERVAL_MS);
      const timestamp = pointIndex * SAMPLE_INTERVAL_SECONDS;
      const value = getCpuUsage(pointIndex);

      chartRef.current?.yagr()?.setSeries(
        [timestamp],
        [{id: 'cpu', data: [value]}],
        {incremental: true, splice: true},
      );
      setLatestUsage(value);
      setUpdatedAt(Date.now());
    };

    const intervalId = window.setInterval(update, UPDATE_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  const status = latestUsage >= 80 ? 'warning' : 'normal';

  return (
    <main className="monitor-page">
      <div className="monitor-shell">
        <header className="monitor-header">
          <div className="monitor-brand">
            <span className="brand-mark" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span>СИСТЕМА МОНИТОРИНГА</span>
          </div>
          <div className="connection-state">
            <span className="connection-dot" />
            Поток данных активен
          </div>
        </header>

        <section className="page-heading" aria-labelledby="page-title">
          <div>
            <div className="breadcrumb">Инфраструктура <span>/</span> Серверы <span>/</span> srv-prod-01</div>
            <h1 id="page-title">Мониторинг CPU</h1>
            <p className="page-subtitle">Использование процессора · последние 24 часа</p>
          </div>
          <div className="server-chip"><span className="server-chip-dot" /> srv-prod-01</div>
        </section>

        <section className="metric-grid" aria-label="Текущие показатели CPU">
          <article className="metric-card metric-card-primary">
            <div className="metric-label">Текущая загрузка</div>
            <div className="metric-value">{latestUsage.toFixed(1)}<span>%</span></div>
            <div className={`metric-status ${status}`}>
              <span className="metric-status-dot" />
              {status === 'warning' ? 'Повышенная нагрузка' : 'В пределах нормы'}
            </div>
          </article>
          <article className="metric-card">
            <div className="metric-label">Среднее за сутки</div>
            <div className="metric-value">38.4<span>%</span></div>
            <div className="metric-note"><span className="trend-arrow">↘</span> 2.1% к прошлым суткам</div>
          </article>
          <article className="metric-card">
            <div className="metric-label">Пиковая загрузка</div>
            <div className="metric-value">76.8<span>%</span></div>
            <div className="metric-note">Сегодня, 14:32</div>
          </article>
          <article className="metric-card">
            <div className="metric-label">Ядра процессора</div>
            <div className="metric-value">16</div>
            <div className="metric-note">AMD EPYC 7B13 · 2.45 GHz</div>
          </article>
        </section>

        <section className="chart-card" aria-labelledby="chart-title">
          <div className="chart-card-header">
            <div>
              <h2 id="chart-title">Загрузка процессора</h2>
              <p>История за 24 часа с обновлением в реальном времени</p>
            </div>
            <div className="chart-tools">
              <span className="live-indicator"><span /> LIVE</span>
              <span className="chart-period">24 часа <span className="chevron">⌄</span></span>
            </div>
          </div>

          <div className="chart-legend">
            <span className="legend-swatch" />
            <span>CPU</span>
            <span className="legend-value">{latestUsage.toFixed(1)}%</span>
          </div>

          <div className="chart-viewport">
            <Yagr
              ref={chartRef}
              id="cpu-usage-chart"
              className="cpu-chart"
              config={chartConfig}
              update="dynamic"
            />
          </div>
          <div className="chart-footer">
            <span>Наведите на график, чтобы увидеть значение · Выделите область для увеличения</span>
            <span>Обновлено в {formatClock(updatedAt)}</span>
          </div>
        </section>

        <footer className="monitor-footer">
          <span>Источник данных: node-exporter</span>
          <span>Интервал сбора: 3 сек</span>
          <span>Сервер: Европа · Франкфурт</span>
        </footer>
      </div>
    </main>
  );
}
