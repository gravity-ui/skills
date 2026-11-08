import {useEffect, useState} from 'react';
import {Button, useThemeType} from '@gravity-ui/uikit';
import {CpuChart} from './CpuChart';
import {appendCpuSample, createDemoHistory, demoCpuValue, SAMPLE_INTERVAL} from './cpuData';
import './monitoring.css';

export function App({onThemeChange}: {onThemeChange?: () => void}) {
  const [data, setData] = useState(() => createDemoHistory());
  const [paused, setPaused] = useState(false);
  const theme = useThemeType();

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      const timestamp = Date.now();
      setData((previous) => appendCpuSample(previous, timestamp, demoCpuValue(timestamp)));
    }, SAMPLE_INTERVAL);
    return () => window.clearInterval(timer);
  }, [paused]);

  const latest = data.values[data.values.length - 1];
  return (
    <main className="monitoring-page">
      <header className="page-header">
        <div>
          <div className="eyebrow">МОНИТОРИНГ</div>
          <h1>Загрузка CPU</h1>
          <p className="muted">История за последние 24 часа</p>
        </div>
        {onThemeChange && <Button onClick={onThemeChange} view="outlined" aria-label="Переключить тему">{theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}</Button>}
      </header>
      <section className="cpu-panel" aria-labelledby="cpu-title">
        <div className="panel-header">
          <div>
            <h2 id="cpu-title">Использование процессора</h2>
            <p className="muted">Демонстрационные данные · шаг 2 секунды</p>
          </div>
          <div className="current-value">
            <strong>{latest?.toLocaleString('ru-RU', {maximumFractionDigits: 1}) ?? '—'}<span> %</span></strong>
            <span className="stream-status"><i className={paused ? 'status-dot paused' : 'status-dot'} />{paused ? 'Обновления приостановлены' : 'Обновляется в реальном времени'}</span>
          </div>
        </div>
        <CpuChart data={data} />
        <footer className="panel-footer">
          <span className="muted">{data.timeline.length.toLocaleString('ru-RU')} точек · {new Date(data.timeline[data.timeline.length - 1]).toLocaleString('ru-RU')}</span>
          <Button view="flat" onClick={() => setPaused((value) => !value)}>{paused ? 'Продолжить обновления' : 'Приостановить'}</Button>
        </footer>
      </section>
    </main>
  );
}
