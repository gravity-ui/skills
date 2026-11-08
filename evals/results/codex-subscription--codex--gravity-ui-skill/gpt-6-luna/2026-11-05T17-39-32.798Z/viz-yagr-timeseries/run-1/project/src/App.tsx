import {useEffect, useRef, useState} from 'react';
import Yagr from '@gravity-ui/yagr';
import type {MinimalValidConfig} from '@gravity-ui/yagr';
import {Text, useThemeType} from '@gravity-ui/uikit';

import './App.css';

const DAY_SECONDS = 24 * 60 * 60;
const INITIAL_STEP_SECONDS = 1;
const MAX_POINTS = DAY_SECONDS / INITIAL_STEP_SECONDS;
const UPDATE_INTERVAL_MS = 1_000;
const PRUNE_EVERY = 60;

function makeHistory() {
  const now = Math.floor(Date.now() / 1_000);
  const timeline: number[] = [];
  const values: number[] = [];
  const start = now - DAY_SECONDS;

  for (let i = 0; i < MAX_POINTS; i += 1) {
    const timestamp = start + i * INITIAL_STEP_SECONDS;
    const dailyCycle = Math.sin((i / MAX_POINTS) * Math.PI * 2 - 1.2) * 13;
    const shortCycle = Math.sin(i / 97) * 8 + Math.sin(i / 23) * 3;
    const noise = (Math.random() - 0.5) * 10;
    timeline.push(timestamp);
    values.push(Math.max(4, Math.min(96, 38 + dailyCycle + shortCycle + noise)));
  }

  return {timeline, values};
}

function getNextCpu(previous: number) {
  const drift = (Math.random() - 0.5) * 10;
  const load = Math.sin(Date.now() / 8_000) * 3;
  return Math.max(2, Math.min(99, previous + drift + load));
}

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat('ru-RU', {hour: '2-digit', minute: '2-digit'}).format(
    new Date(timestamp * 1_000),
  );
}

export function App() {
  const chartHostRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Yagr | null>(null);
  const historyRef = useRef<ReturnType<typeof makeHistory> | null>(null);
  if (!historyRef.current) historyRef.current = makeHistory();
  const theme = useThemeType();
  const [currentCpu, setCurrentCpu] = useState(0);
  const [maxCpu, setMaxCpu] = useState(0);

  useEffect(() => {
    const host = chartHostRef.current;
    if (!host) return;

    const {timeline, values} = historyRef.current!;
    const config: MinimalValidConfig = {
      timeline: [...timeline],
      series: [
        {id: 'cpu-load', data: [...values], type: 'line', color: 'var(--g-color-text-info)', title: 'Загрузка CPU'},
      ],
      chart: {size: {height: 320, adaptive: true}, appearance: {theme}, select: {zoom: true}},
      axes: {
        x: {label: 'Время'},
        y: {label: '%'},
      },
      scales: {y: {range: () => [0, 100]}},
      tooltip: {show: true},
    };

    const chart = new Yagr(host, config);
    chartRef.current = chart;
    let updateCount = 0;

    const updateTimer = window.setInterval(() => {
      const now = Math.floor(Date.now() / 1_000);
      const nextValue = getNextCpu(values[values.length - 1] ?? 35);
      updateCount += 1;

      // Append in O(1) and trim in small batches to keep the rolling day bounded.
      chart.setSeries(
        [now],
        [{id: 'cpu-load', data: [nextValue]}],
        {incremental: true, splice: updateCount % PRUNE_EVERY === 0},
      );
      values.push(nextValue);
      timeline.push(now);
      if (updateCount % PRUNE_EVERY === 0) {
        values.splice(0, PRUNE_EVERY);
        timeline.splice(0, PRUNE_EVERY);
      }
      setCurrentCpu(nextValue);
      setMaxCpu((current) => Math.max(current, nextValue));
    }, UPDATE_INTERVAL_MS);

    setCurrentCpu(values[values.length - 1] ?? 0);
    setMaxCpu(values.reduce((maximum, value) => Math.max(maximum, value), 0));

    return () => {
      window.clearInterval(updateTimer);
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    chartRef.current?.setTheme(theme);
  }, [theme]);

  const startTime = historyRef.current.timeline[0] ?? 0;
  const endTime = historyRef.current.timeline[historyRef.current.timeline.length - 1] ?? 0;

  return (
    <main className="monitor-page">
      <header className="page-header">
        <div className="page-heading">
          <Text variant="header-1" as="h1">Мониторинг системы</Text>
          <Text variant="body-2" color="secondary">Состояние ресурсов и производительности сервера</Text>
        </div>
        <div className="live-status"><span className="live-dot" />
          <Text variant="body-2">Данные обновляются</Text>
        </div>
      </header>

      <section className="metric-grid" aria-label="Сводка загрузки CPU">
        <article className="metric-card metric-card-active">
          <Text variant="body-2" color="secondary">Загрузка CPU</Text>
          <div className="metric-reading"><Text variant="display-4">{currentCpu.toFixed(1)}</Text><Text variant="header-2" color="secondary">%</Text></div>
          <Text variant="caption-1" color="secondary">Текущее значение</Text>
        </article>
        <article className="metric-card">
          <Text variant="body-2" color="secondary">Пик за период</Text>
          <div className="metric-reading"><Text variant="display-4">{maxCpu.toFixed(1)}</Text><Text variant="header-2" color="secondary">%</Text></div>
          <Text variant="caption-1" color="secondary">За последние 24 часа</Text>
        </article>
        <article className="metric-card">
          <Text variant="body-2" color="secondary">Интервал данных</Text>
          <div className="metric-reading"><Text variant="display-4">1</Text><Text variant="header-2" color="secondary">с</Text></div>
          <Text variant="caption-1" color="secondary">Шаг исторических данных</Text>
        </article>
      </section>

      <section className="chart-card" aria-labelledby="cpu-chart-title">
        <div className="chart-heading">
          <div>
            <Text variant="subheader-1" as="h2" id="cpu-chart-title">Загрузка процессора</Text>
            <Text variant="body-2" color="secondary">За последние 24 часа</Text>
          </div>
        </div>
        <div className="chart-legend">
          <span className="legend-line" />
          <Text variant="body-2">CPU, %</Text>
          <span className="legend-spacer" />
          <span className="legend-live-dot" />
          <Text variant="caption-1" color="secondary">LIVE</Text>
        </div>
        <div className="chart-viewport" ref={chartHostRef} aria-label="Интерактивный график загрузки CPU" />
        <div className="chart-footer">
          <Text variant="caption-1" color="secondary">{formatTime(startTime)}</Text>
          <Text variant="caption-1" color="secondary">Обновлено сейчас</Text>
          <Text variant="caption-1" color="secondary">{formatTime(endTime)}</Text>
        </div>
      </section>

      <footer className="page-footer">
        <Text variant="caption-1" color="secondary">История отображается с автоматической подстройкой по ширине контейнера.</Text>
      </footer>
    </main>
  );
}
