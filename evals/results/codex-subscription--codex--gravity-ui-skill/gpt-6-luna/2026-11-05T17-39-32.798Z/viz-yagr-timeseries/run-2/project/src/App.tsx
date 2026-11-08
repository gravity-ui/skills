import {useEffect, useRef, useState} from 'react';
import Yagr from '@gravity-ui/yagr';
import {Button, Text, ThemeProvider} from '@gravity-ui/uikit';

import './App.css';

const DAY_MS = 24 * 60 * 60 * 1000;
const SAMPLE_INTERVAL = 2500;
const SAMPLE_COUNT = DAY_MS / SAMPLE_INTERVAL;

function makeCpuValue(index: number) {
  const slowWave = Math.sin(index / 1700) * 10;
  const mediumWave = Math.sin(index / 210) * 5;
  const jitter = Math.sin(index * 12.9898) * 2.5;
  const occasionalSpike = index % 3900 < 9 ? 18 - (index % 3900) * 1.5 : 0;
  return Math.max(4, Math.min(96, 36 + slowWave + mediumWave + jitter + occasionalSpike));
}

function CpuChart({theme}: {theme: 'light' | 'dark'}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Yagr | null>(null);
  const latestValueRef = useRef(0);
  const [latestValue, setLatestValue] = useState(0);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const now = Date.now();
    const firstTime = now - DAY_MS;
    const timeline = Array.from({length: SAMPLE_COUNT}, (_, index) => firstTime + index * SAMPLE_INTERVAL);
    const values = Array.from({length: SAMPLE_COUNT}, (_, index) => makeCpuValue(index));
    let sampleIndex = SAMPLE_COUNT;
    latestValueRef.current = values[values.length - 1];
    setLatestValue(latestValueRef.current);

    const chart = new Yagr(host, {
      timeline,
      series: [{
        id: 'cpu',
        name: 'Загрузка CPU',
        data: values,
        color: 'var(--g-color-line-brand)',
        type: 'line',
      }],
      chart: {
        size: {width: host.clientWidth, height: 280, adaptive: true},
        appearance: {theme},
      },
      scales: {y: {min: 0, max: 100}},
      axes: {
        x: {label: 'Время'},
        y: {label: 'Загрузка, %', splitsCount: 5},
      },
      cursor: {x: {visible: true}, y: {visible: true}},
      tooltip: {show: true},
    });
    chartRef.current = chart;

    const timer = window.setInterval(() => {
      const nextValue = makeCpuValue(sampleIndex++);
      latestValueRef.current = nextValue;
      // Yagr appends a single sample and removes the oldest point in the same update.
      chart.setSeries(
        [Date.now()],
        [{id: 'cpu', data: [nextValue]}],
        {incremental: true, splice: true},
      );
      setLatestValue(nextValue);
    }, SAMPLE_INTERVAL);

    return () => {
      window.clearInterval(timer);
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    chartRef.current?.setTheme(theme);
  }, [theme]);

  return (
    <>
      <div className="cpu-chart" ref={hostRef} role="img" aria-label="Интерактивный график загрузки CPU за последние 24 часа" />
      <div className="chart-caption">
        <Text variant="caption-1">34 560 точек · обновление каждые 2,5 секунды</Text>
        <Text variant="caption-1">Сейчас: {latestValue.toFixed(1)}%</Text>
      </div>
    </>
  );
}

function MonitoringPage({theme, onToggleTheme}: {theme: 'light' | 'dark'; onToggleTheme: () => void}) {
  return (
    <main className="monitoring-page">
      <header className="page-header">
        <div className="heading-block">
          <Text variant="caption-1" className="eyebrow">ИНФРАСТРУКТУРА / МОНИТОРИНГ</Text>
          <Text variant="header-1">Состояние системы</Text>
          <Text variant="body-2" className="page-subtitle">Ключевые метрики серверного кластера в реальном времени</Text>
        </div>
        <Button view="outlined" size="m" onClick={onToggleTheme}>
          {theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
        </Button>
      </header>

      <section className="metric-grid" aria-label="Сводные показатели">
        <article className="metric-card">
          <Text variant="caption-1" className="metric-label">СРЕДНЯЯ ЗАГРУЗКА CPU</Text>
          <div className="metric-value-row"><Text variant="header-2">42.8%</Text><span className="metric-delta positive">−3.2%</span></div>
          <Text variant="caption-1">за последние 24 часа</Text>
        </article>
        <article className="metric-card">
          <Text variant="caption-1" className="metric-label">ПАМЯТЬ</Text>
          <div className="metric-value-row"><Text variant="header-2">68.4%</Text><span className="metric-delta">стабильно</span></div>
          <Text variant="caption-1">из 256 ГБ доступно</Text>
        </article>
        <article className="metric-card">
          <Text variant="caption-1" className="metric-label">АКТИВНЫЕ УЗЛЫ</Text>
          <div className="metric-value-row"><Text variant="header-2">24 / 24</Text><span className="status-dot" /></div>
          <Text variant="caption-1">все системы работают</Text>
        </article>
      </section>

      <section className="chart-card" aria-labelledby="cpu-heading">
        <div className="chart-header">
          <div>
            <Text variant="subheader-1" id="cpu-heading">Загрузка CPU</Text>
            <Text variant="body-2" className="chart-subtitle">Использование процессора за последние 24 часа</Text>
          </div>
          <div className="range-pill"><span className="live-dot" />Последние 24 часа</div>
        </div>
        <CpuChart theme={theme} />
      </section>

      <footer className="page-footer"><span className="live-dot" />Данные обновляются в реальном времени</footer>
    </main>
  );
}

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <ThemeProvider theme={theme}>
      <MonitoringPage theme={theme} onToggleTheme={() => setTheme((current) => current === 'light' ? 'dark' : 'light')} />
    </ThemeProvider>
  );
}
