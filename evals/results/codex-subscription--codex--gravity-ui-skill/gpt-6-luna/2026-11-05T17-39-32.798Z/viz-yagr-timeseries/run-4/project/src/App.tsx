import {useEffect, useRef} from 'react';
import {useThemeType} from '@gravity-ui/uikit';
import Yagr from '@gravity-ui/yagr';
import './app.css';

const DAY_IN_SECONDS = 24 * 60 * 60;
const SAMPLE_COUNT = DAY_IN_SECONDS;
const SERIES_ID = 'cpu-usage';

function getCpuValue(timestamp: number) {
  const seconds = timestamp / 1000;
  const wave = Math.sin(seconds / 7200) * 13 + Math.sin(seconds / 1300) * 7;
  const burst = Math.sin(seconds / 97) * 4;
  return Math.round(Math.max(4, Math.min(96, 46 + wave + burst + Math.random() * 7)) * 10) / 10;
}

function createInitialData(now: number) {
  const timeline = new Array<number>(SAMPLE_COUNT);
  const values = new Array<number>(SAMPLE_COUNT);
  const start = now - (SAMPLE_COUNT - 1) * 1000;

  for (let index = 0; index < SAMPLE_COUNT; index += 1) {
    const timestamp = start + index * 1000;
    timeline[index] = timestamp;
    values[index] = getCpuValue(timestamp);
  }

  return {timeline, values};
}

export function App() {
  const hostRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<InstanceType<typeof Yagr>>();
  const theme = useThemeType();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const now = Date.now();
    const {timeline, values} = createInitialData(now);
    const chart = new Yagr(host, {
      timeline,
      series: [{id: SERIES_ID, name: 'Загрузка CPU', type: 'area', data: values}],
      chart: {
        size: {adaptive: true, resizeDebounceMs: 50},
        select: {zoom: true},
      },
      cursor: {x: {visible: true}, y: {visible: true}},
      tooltip: {show: true, tracking: 'sticky'},
      scales: {y: {range: () => [0, 100]}},
      appearance: {theme},
    });
    chartRef.current = chart;

    // Append one sample each second and trim the same number from the start.
    // Yagr's incremental splice path keeps the rolling 24-hour window without
    // rebuilding the full 86,400-point series on every update.
    const timer = window.setInterval(() => {
      const timestamp = Date.now();
      chart.setSeries(
        [timestamp],
        [{id: SERIES_ID, data: [getCpuValue(timestamp)]}],
        {incremental: true, splice: true},
      );
    }, 1000);

    return () => {
      window.clearInterval(timer);
      chart.dispose();
      chartRef.current = undefined;
    };
  }, []);

  useEffect(() => {
    chartRef.current?.setTheme(theme);
  }, [theme]);

  return (
    <main className="monitor-page">
      <header className="monitor-header">
        <div>
          <p className="monitor-eyebrow">МОНИТОРИНГ СИСТЕМЫ</p>
          <h1>Загрузка CPU</h1>
          <p className="monitor-subtitle">Использование процессора за последние 24 часа</p>
        </div>
        <div className="live-indicator" aria-label="Данные обновляются в реальном времени">
          <span className="live-dot" />
          <span>В реальном времени</span>
        </div>
      </header>

      <section className="chart-card" aria-label="Интерактивный график загрузки CPU">
        <div className="chart-meta">
          <div>
            <span className="chart-label">CPU</span>
            <span className="chart-unit">% использования</span>
          </div>
          <span className="chart-hint">Наведите для деталей · выделите область, чтобы приблизить</span>
        </div>
        <div className="chart-host" ref={hostRef} />
        <div className="time-range" aria-hidden="true">
          <span>24 часа назад</span>
          <span>Сейчас</span>
        </div>
      </section>
    </main>
  );
}
